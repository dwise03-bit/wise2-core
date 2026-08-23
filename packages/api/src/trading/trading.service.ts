import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import AETHERTrader, { OHLCV } from '../../../../../../packages/trading-engine/src/aether-trader';

/**
 * WISE² Trading Service
 * Implements business logic for the trading platform
 * Wraps the ÆTHER-TRADER core engine with database persistence
 */
@Injectable()
export class TradingService {
  private readonly logger = new Logger('TradingService');
  private traders = new Map<string, AETHERTrader>();

  constructor(private prisma: PrismaService) {}

  /**
   * Get user's trading account
   */
  async getAccount(userId: string) {
    const account = await this.prisma.tradingAccount.findUnique({
      where: { userId },
      include: {
        positions: { where: { status: 'OPEN' } },
        trades: { orderBy: { exitTime: 'desc' }, take: 10 },
        watchlists: { take: 10 },
        strategies: { where: { isActive: true } },
      },
    });

    if (!account) {
      // Auto-create account if doesn't exist
      return this.prisma.tradingAccount.create({
        data: {
          userId,
          accountName: 'Primary Trading Account',
          accountType: 'PAPER',
          paperEquity: 10000.0,
        },
      });
    }

    return account;
  }

  /**
   * Get market data and detected setups for a symbol
   */
  async getMarketData(symbol: string) {
    // Get or create trader
    if (!this.traders.has(symbol)) {
      this.traders.set(symbol, new AETHERTrader(symbol));
    }

    const trader = this.traders.get(symbol)!;
    const marketState = trader.getMarketState();
    const setups = trader.scan();

    // Get latest regime from database
    const regime = await this.prisma.marketRegime.findFirst({
      where: { symbol },
      orderBy: { updatedAt: 'desc' },
    });

    return {
      symbol,
      marketState,
      regime,
      setups: setups.slice(0, 5),
      timestamp: new Date(),
    };
  }

  /**
   * Ingest OHLCV candle and detect setups
   */
  async ingestCandle(
    symbol: string,
    data: { time: string; open: number; high: number; low: number; close: number; volume?: number }
  ) {
    // Get or create trader
    if (!this.traders.has(symbol)) {
      this.traders.set(symbol, new AETHERTrader(symbol));
    }

    const trader = this.traders.get(symbol)!;
    const candle: OHLCV = {
      time: new Date(data.time),
      open: data.open,
      high: data.high,
      low: data.low,
      close: data.close,
      volume: data.volume,
    };

    trader.addCandle(candle);
    const setups = trader.scan();

    // Save price snapshot
    try {
      await this.prisma.priceSnapshot.create({
        data: {
          symbol,
          timeframe: '1H',
          openTime: new Date(data.time),
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
          volume: data.volume || 0,
        },
      });
    } catch {
      // Ignore duplicate key errors
    }

    return {
      success: true,
      setupsDetected: setups.length,
      topSetups: setups.slice(0, 3),
    };
  }

  /**
   * Get active setups for a symbol
   */
  async getSetups(symbol: string, minConfidence: number = 0.65) {
    const trader = this.traders.get(symbol);
    if (!trader) {
      return { setups: [], message: 'No data yet' };
    }

    const setups = trader.scan();
    const filtered = setups.filter(s => s.confidence >= minConfidence);

    return {
      symbol,
      setupsFound: filtered.length,
      setups: filtered.sort((a, b) => b.confidence - a.confidence),
    };
  }

  /**
   * Create a paper trading order
   */
  async createPaperOrder(
    userId: string,
    data: {
      symbol: string;
      direction: 'LONG' | 'SHORT';
      quantity: number;
      entryPrice: number;
      stopPrice: number;
      target1: number;
      target2?: number;
    }
  ) {
    const account = await this.getAccount(userId);

    const riskAmount = Math.abs(data.entryPrice - data.stopPrice) * data.quantity;
    const riskPercent = (riskAmount / account.paperEquity) * 100;

    if (riskPercent > account.riskPerTrade) {
      return {
        error: 'Risk exceeds account limit',
        riskPercent,
        maxRisk: account.riskPerTrade,
      };
    }

    const position = await this.prisma.position.create({
      data: {
        accountId: account.id,
        symbol: data.symbol,
        direction: data.direction,
        entryPrice: data.entryPrice,
        quantity: data.quantity,
        stopPrice: data.stopPrice,
        target1: data.target1,
        target2: data.target2,
        initialRisk: riskAmount,
        riskPercentage: riskPercent,
        currentPrice: data.entryPrice,
        currentPnL: 0,
        currentPnLPercent: 0,
        status: 'OPEN',
      },
    });

    return {
      success: true,
      position,
      message: `${data.direction} position opened: ${data.quantity} ${data.symbol} @ ${data.entryPrice}`,
    };
  }

  /**
   * Get user's open positions
   */
  async getPositions(userId: string) {
    const account = await this.getAccount(userId);

    const positions = await this.prisma.position.findMany({
      where: {
        accountId: account.id,
        status: 'OPEN',
      },
      orderBy: { entryTime: 'desc' },
    });

    // Calculate P&L for each position
    const positionsWithPnL = positions.map(p => {
      const trader = this.traders.get(p.symbol);
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

    return {
      accountId: account.id,
      openPositions: positionsWithPnL.length,
      positions: positionsWithPnL,
      totalOpenPnL: positionsWithPnL.reduce((sum, p) => sum + (p.currentPnL || 0), 0),
    };
  }

  /**
   * Close a position
   */
  async closePosition(userId: string, positionId: string, exitPrice: number) {
    const position = await this.prisma.position.findUnique({
      where: { id: positionId },
    });

    if (!position || position.status !== 'OPEN') {
      return { error: 'Position not found or already closed' };
    }

    const realizedPnL = (exitPrice - position.entryPrice) * position.quantity * (position.direction === 'SHORT' ? -1 : 1);
    const realizedR = realizedPnL / position.initialRisk;

    const closed = await this.prisma.position.update({
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
    await this.prisma.trade.create({
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

    return {
      success: true,
      position: closed,
      realizedPnL,
      realizedR,
    };
  }

  /**
   * Get user's trade history
   */
  async getTrades(userId: string) {
    const account = await this.getAccount(userId);

    const trades = await this.prisma.trade.findMany({
      where: { accountId: account.id },
      orderBy: { exitTime: 'desc' },
      take: 100,
    });

    const wins = trades.filter(t => t.pnl > 0).length;
    const losses = trades.filter(t => t.pnl < 0).length;
    const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
    const avgWin = wins > 0 ? trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / wins : 0;
    const avgLoss = losses > 0 ? trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0) / losses : 0;

    return {
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
    };
  }

  /**
   * Create journal entry
   */
  async createJournalEntry(userId: string, data: any) {
    const account = await this.getAccount(userId);

    return this.prisma.journalEntry.create({
      data: {
        accountId: account.id,
        symbol: data.symbol,
        tradeDate: new Date(data.tradeDate),
        result: data.result,
        pnl: data.pnl,
        whatWentWell: data.whatWentWell,
        whatWentWrong: data.whatWentWrong,
        lessonsLearned: data.lessonsLearned,
      },
    });
  }

  /**
   * Get user's journal entries
   */
  async getJournal(userId: string) {
    const account = await this.getAccount(userId);

    const entries = await this.prisma.journalEntry.findMany({
      where: { accountId: account.id },
      orderBy: { tradeDate: 'desc' },
      take: 50,
    });

    return {
      accountId: account.id,
      entries,
      totalEntries: entries.length,
    };
  }

  /**
   * Get active signals
   */
  async getSignals() {
    return this.prisma.signal.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { confidence: 'desc' },
      take: 20,
    });
  }

  /**
   * Log risk event
   */
  async logRiskEvent(userId: string, data: any) {
    const account = await this.getAccount(userId);

    return this.prisma.riskEvent.create({
      data: {
        accountId: account.id,
        eventType: data.eventType,
        message: data.message,
        blockedTrade: data.blockedTrade || false,
      },
    });
  }
}
