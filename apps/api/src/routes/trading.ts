/**
 * WISE² Trading API
 * REST endpoints for trading platform
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import AETHERTrader, { OHLCV, TradeSetup } from '../../../packages/trading-engine/src/aether-trader';

const router = Router();
const prisma = new PrismaClient();

// In-memory trader instances per symbol (for demo)
const traders = new Map<string, AETHERTrader>();

/**
 * GET /api/trading/account
 * Get user's trading account details
 */
router.get('/account', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const account = await prisma.tradingAccount.findUnique({
      where: { userId },
      include: {
        positions: { where: { status: 'OPEN' } },
        trades: { orderBy: { exitTime: 'desc' }, take: 10 },
        watchlists: { take: 10 },
        strategies: { where: { isActive: true } },
      },
    });

    if (!account) {
      return res.status(404).json({ error: 'Trading account not found' });
    }

    res.json(account);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch account' });
  }
});

/**
 * GET /api/trading/market-data/:symbol
 * Get current market regime and detected setups
 */
router.get('/market-data/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;

    // Get or create trader
    if (!traders.has(symbol)) {
      traders.set(symbol, new AETHERTrader(symbol));
    }

    const trader = traders.get(symbol)!;
    const marketState = trader.getMarketState();
    const setups = trader.scan();

    // Get latest regime from database
    const regime = await prisma.marketRegime.findFirst({
      where: { symbol },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      symbol,
      marketState,
      regime,
      setups: setups.slice(0, 5), // Top 5 setups
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

/**
 * POST /api/trading/ingest-candle/:symbol
 * Ingest new OHLCV candle
 */
router.post('/ingest-candle/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { time, open, high, low, close, volume } = req.body;

    // Get or create trader
    if (!traders.has(symbol)) {
      traders.set(symbol, new AETHERTrader(symbol));
    }

    const trader = traders.get(symbol)!;
    const candle: OHLCV = {
      time: new Date(time),
      open,
      high,
      low,
      close,
      volume,
    };

    trader.addCandle(candle);

    // Scan for setups
    const setups = trader.scan();

    // Save price snapshot
    await prisma.priceSnapshot.create({
      data: {
        symbol,
        timeframe: '1H',
        openTime: new Date(time),
        open,
        high,
        low,
        close,
        volume: volume || 0,
      },
    }).catch(() => null); // Ignore duplicate errors

    res.json({
      success: true,
      setupsDetected: setups.length,
      topSetups: setups.slice(0, 3),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to ingest candle' });
  }
});

/**
 * GET /api/trading/setups/:symbol
 * Get active trade setups for a symbol
 */
router.get('/setups/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;

    const trader = traders.get(symbol);
    if (!trader) {
      return res.json({ setups: [], message: 'No data yet' });
    }

    const setups = trader.scan();

    // Filter by minimum confidence
    const minConfidence = parseFloat(req.query.minConfidence as string) || 0.65;
    const filtered = setups.filter(s => s.confidence >= minConfidence);

    res.json({
      symbol,
      setupsFound: filtered.length,
      setups: filtered.sort((a, b) => b.confidence - a.confidence),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch setups' });
  }
});

/**
 * POST /api/trading/paper-order
 * Create a paper trading order
 */
router.post('/paper-order', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { symbol, direction, quantity, entryPrice, stopPrice, target1, target2 } = req.body;

    const account = await prisma.tradingAccount.findUnique({
      where: { userId },
    });

    if (!account) {
      return res.status(404).json({ error: 'Trading account not found' });
    }

    // Calculate risk
    const riskAmount = Math.abs(entryPrice - stopPrice) * quantity;
    const riskPercent = (riskAmount / account.paperEquity) * 100;

    // Check risk limits
    if (riskPercent > account.riskPerTrade) {
      return res.status(400).json({
        error: 'Risk exceeds account limit',
        riskPercent,
        maxRisk: account.riskPerTrade,
      });
    }

    // Create position
    const position = await prisma.position.create({
      data: {
        accountId: account.id,
        symbol,
        direction,
        entryPrice,
        quantity,
        stopPrice,
        target1,
        target2,
        initialRisk: riskAmount,
        riskPercentage: riskPercent,
        currentPrice: entryPrice,
        currentPnL: 0,
        currentPnLPercent: 0,
        status: 'OPEN',
      },
    });

    res.status(201).json({
      success: true,
      position,
      message: `${direction} position opened: ${quantity} ${symbol} @ ${entryPrice}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

/**
 * GET /api/trading/positions
 * Get user's open positions
 */
router.get('/positions', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const account = await prisma.tradingAccount.findUnique({
      where: { userId },
    });

    if (!account) {
      return res.status(404).json({ error: 'Trading account not found' });
    }

    const positions = await prisma.position.findMany({
      where: {
        accountId: account.id,
        status: 'OPEN',
      },
      orderBy: { entryTime: 'desc' },
    });

    // Calculate P&L for each position (demo: using last price from traders)
    const positionsWithPnL = positions.map(p => {
      const trader = traders.get(p.symbol);
      const state = trader?.getMarketState();
      const lastPrice = state?.lastPrice || p.currentPrice || p.entryPrice;

      const pnl = (lastPrice - p.entryPrice) * p.quantity * (p.direction === 'SHORT' ? -1 : 1);
      const pnlPercent = ((lastPrice - p.entryPrice) / p.entryPrice) * 100;

      return {
        ...p,
        currentPrice: lastPrice,
        currentPnL: pnl,
        currentPnLPercent: pnlPercent,
      };
    });

    res.json({
      accountId: account.id,
      openPositions: positionsWithPnL.length,
      positions: positionsWithPnL,
      totalOpenPnL: positionsWithPnL.reduce((sum, p) => sum + (p.currentPnL || 0), 0),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch positions' });
  }
});

/**
 * POST /api/trading/close-position/:positionId
 * Close an open position
 */
router.post('/close-position/:positionId', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { positionId } = req.params;
    const { exitPrice } = req.body;

    const position = await prisma.position.findUnique({
      where: { id: positionId },
    });

    if (!position || position.status !== 'OPEN') {
      return res.status(404).json({ error: 'Position not found or already closed' });
    }

    // Calculate realized P&L
    const realizedPnL = (exitPrice - position.entryPrice) * position.quantity * (position.direction === 'SHORT' ? -1 : 1);
    const realizedR = realizedPnL / position.initialRisk;

    // Update position
    const closed = await prisma.position.update({
      where: { id: positionId },
      data: {
        status: 'CLOSED',
        exitPrice,
        exitTime: new Date(),
        realizedPnL,
        realizedR,
      },
    });

    // Log trade
    await prisma.trade.create({
      data: {
        accountId: position.accountId,
        symbol: position.symbol,
        direction: position.direction,
        entryPrice: position.entryPrice,
        exitPrice,
        quantity: position.quantity,
        entryTime: position.entryTime,
        exitTime: new Date(),
        duration: Math.floor((new Date().getTime() - position.entryTime.getTime()) / 60000),
        pnl: realizedPnL,
        pnlPercent: (realizedPnL / (position.entryPrice * position.quantity)) * 100,
        rMultiple: realizedR,
      },
    });

    res.json({
      success: true,
      position: closed,
      realizedPnL,
      realizedR,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to close position' });
  }
});

/**
 * GET /api/trading/trades
 * Get user's trade history
 */
router.get('/trades', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const account = await prisma.tradingAccount.findUnique({
      where: { userId },
    });

    if (!account) {
      return res.status(404).json({ error: 'Trading account not found' });
    }

    const trades = await prisma.trade.findMany({
      where: { accountId: account.id },
      orderBy: { exitTime: 'desc' },
      take: 100,
    });

    // Calculate statistics
    const wins = trades.filter(t => t.pnl > 0).length;
    const losses = trades.filter(t => t.pnl < 0).length;
    const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
    const avgWin = wins > 0 ? trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / wins : 0;
    const avgLoss = losses > 0 ? trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0) / losses : 0;

    res.json({
      accountId: account.id,
      totalTrades: trades.length,
      winRate: (wins / (wins + losses)) * 100,
      wins,
      losses,
      totalPnL,
      avgWin,
      avgLoss,
      profitFactor: avgWin > 0 ? avgWin / Math.abs(avgLoss) : 0,
      trades,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

/**
 * POST /api/trading/journal-entry
 * Log a trade in the journal
 */
router.post('/journal-entry', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { symbol, tradeDate, result, pnl, whatWentWell, whatWentWrong, lessonsLearned } = req.body;

    const account = await prisma.tradingAccount.findUnique({
      where: { userId },
    });

    if (!account) {
      return res.status(404).json({ error: 'Trading account not found' });
    }

    const entry = await prisma.journalEntry.create({
      data: {
        accountId: account.id,
        symbol,
        tradeDate: new Date(tradeDate),
        result,
        pnl,
        whatWentWell,
        whatWentWrong,
        lessonsLearned,
      },
    });

    res.status(201).json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

/**
 * GET /api/trading/journal
 * Get user's trading journal
 */
router.get('/journal', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const account = await prisma.tradingAccount.findUnique({
      where: { userId },
    });

    if (!account) {
      return res.status(404).json({ error: 'Trading account not found' });
    }

    const entries = await prisma.journalEntry.findMany({
      where: { accountId: account.id },
      orderBy: { tradeDate: 'desc' },
      take: 50,
    });

    res.json({
      accountId: account.id,
      entries,
      totalEntries: entries.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch journal' });
  }
});

/**
 * GET /api/trading/signals
 * Get active trading signals
 */
router.get('/signals', async (req: Request, res: Response) => {
  try {
    const signals = await prisma.signal.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { confidence: 'desc' },
      take: 20,
    });

    res.json({
      activeSignals: signals.length,
      signals,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch signals' });
  }
});

/**
 * POST /api/trading/risk-event
 * Log a risk management event
 */
router.post('/risk-event', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { eventType, message, blockedTrade } = req.body;

    const account = await prisma.tradingAccount.findUnique({
      where: { userId },
    });

    if (!account) {
      return res.status(404).json({ error: 'Trading account not found' });
    }

    const event = await prisma.riskEvent.create({
      data: {
        accountId: account.id,
        eventType,
        message,
        blockedTrade: blockedTrade || false,
      },
    });

    res.status(201).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log risk event' });
  }
});

export default router;
