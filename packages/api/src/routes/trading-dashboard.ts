import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Middleware to get user ID from JWT or request
const getUserId = (req: Request): string => {
  return (req as any).user?.id || (req as any).userId || 'demo-user';
};

/**
 * GET /api/trading/portfolio - Full portfolio summary
 */
router.get('/portfolio', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    const account = await prisma.tradingAccount.findFirst({
      where: { user: { id: userId } },
      include: {
        positions: { where: { status: 'OPEN' } },
        trades: { where: { status: 'CLOSED' }, orderBy: { exitTime: 'desc' }, take: 100 },
        alerts: { where: { status: 'ACTIVE' } },
        watchlists: { take: 20 },
      },
    });

    if (!account) {
      return res.status(404).json({ error: 'Trading account not found' });
    }

    // Calculate metrics
    const positions = account.positions || [];
    const trades = account.trades || [];

    let unrealizedPL = 0;
    positions.forEach((p: any) => {
      unrealizedPL += p.profitLoss || 0;
    });

    const realizedPL = trades.reduce((sum: number, t: any) => sum + (t.profitLoss || 0), 0);
    const closedCount = trades.length;
    const winCount = trades.filter((t: any) => (t.profitLoss || 0) > 0).length;

    res.json({
      account: {
        id: account.id,
        name: account.accountName,
        type: account.accountType,
        equity: account.paperEquity || 0,
      },
      metrics: {
        totalEquity: (account.paperEquity || 0) + unrealizedPL + realizedPL,
        unrealizedPL,
        realizedPL,
        totalPL: unrealizedPL + realizedPL,
        openPositions: positions.length,
        closedTrades: closedCount,
        winRate: closedCount > 0 ? (winCount / closedCount) * 100 : 0,
      },
      positions: positions.map((p: any) => ({
        id: p.id,
        symbol: p.symbol,
        direction: p.direction,
        quantity: p.quantity,
        entryPrice: p.entryPrice,
        currentPrice: p.currentPrice || p.entryPrice,
        profitLoss: p.profitLoss || 0,
        profitLossPercent: p.profitLoss ? (p.profitLoss / (p.entryPrice * p.quantity)) * 100 : 0,
        riskReward: p.riskRewardRatio || 0,
        entryTime: p.entryTime,
      })),
      recentTrades: trades.slice(0, 10).map((t: any) => ({
        id: t.id,
        symbol: t.symbol,
        direction: t.direction,
        quantity: t.quantity,
        entryPrice: t.entryPrice,
        exitPrice: t.exitPrice,
        profitLoss: t.profitLoss || 0,
        profitLossPercent: t.profitLoss ? (t.profitLoss / (t.entryPrice * t.quantity)) * 100 : 0,
        entryTime: t.entryTime,
        exitTime: t.exitTime,
        duration: t.exitTime ? Math.floor((new Date(t.exitTime).getTime() - new Date(t.entryTime).getTime()) / 1000 / 60) : 0,
      })),
      alerts: {
        active: account.alerts.length,
      },
      watchlist: account.watchlists.map((w: any) => ({
        symbol: w.symbol,
        price: w.price || 0,
      })),
    });
  } catch (error) {
    console.error('Portfolio error:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

/**
 * GET /api/trading/positions - Open positions only
 */
router.get('/positions', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    const account = await prisma.tradingAccount.findFirst({
      where: { user: { id: userId } },
      include: { positions: { where: { status: 'OPEN' } } },
    });

    const positions = (account?.positions || []).map((p: any) => ({
      id: p.id,
      symbol: p.symbol,
      direction: p.direction,
      quantity: p.quantity,
      entryPrice: p.entryPrice,
      currentPrice: p.currentPrice || p.entryPrice,
      stopLoss: p.stopPrice,
      target: p.targetPrice,
      profitLoss: p.profitLoss || 0,
      profitLossPercent: p.profitLoss ? (p.profitLoss / (p.entryPrice * p.quantity)) * 100 : 0,
      riskReward: p.riskRewardRatio || 0,
      entryTime: p.entryTime,
      status: p.status,
    }));

    res.json({ positions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch positions' });
  }
});

/**
 * GET /api/trading/trades - Trade history
 */
router.get('/trades', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const limit = parseInt((req.query.limit as string) || '50');

    const account = await prisma.tradingAccount.findFirst({
      where: { user: { id: userId } },
      include: { trades: { where: { status: 'CLOSED' }, orderBy: { exitTime: 'desc' }, take: limit } },
    });

    const trades = (account?.trades || []).map((t: any) => ({
      id: t.id,
      symbol: t.symbol,
      direction: t.direction,
      quantity: t.quantity,
      entryPrice: t.entryPrice,
      exitPrice: t.exitPrice,
      stopLoss: t.stopPrice,
      target: t.targetPrice,
      profitLoss: t.profitLoss || 0,
      profitLossPercent: t.profitLoss ? (t.profitLoss / (t.entryPrice * t.quantity)) * 100 : 0,
      riskReward: t.riskRewardRatio || 0,
      entryTime: t.entryTime,
      exitTime: t.exitTime,
      duration: t.exitTime ? Math.floor((new Date(t.exitTime).getTime() - new Date(t.entryTime).getTime()) / 1000 / 60) : 0,
      status: t.status,
    }));

    // Calculate stats
    const closedTrades = trades.length;
    const winTrades = trades.filter((t: any) => t.profitLoss > 0);
    const lossTrades = trades.filter((t: any) => t.profitLoss < 0);

    const totalPL = trades.reduce((sum: number, t: any) => sum + t.profitLoss, 0);
    const avgWin = winTrades.length > 0 ? winTrades.reduce((sum: number, t: any) => sum + t.profitLoss, 0) / winTrades.length : 0;
    const avgLoss = lossTrades.length > 0 ? Math.abs(lossTrades.reduce((sum: number, t: any) => sum + t.profitLoss, 0) / lossTrades.length) : 0;

    res.json({
      trades,
      stats: {
        totalTrades: closedTrades,
        winRate: closedTrades > 0 ? (winTrades.length / closedTrades) * 100 : 0,
        totalPL,
        avgWin,
        avgLoss,
        profitFactor: avgLoss > 0 ? (avgWin * winTrades.length) / (avgLoss * lossTrades.length) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

/**
 * POST /api/trading/position/close - Close a position
 */
router.post('/position/close', async (req: Request, res: Response) => {
  try {
    const { positionId, exitPrice } = req.body;

    if (!positionId || !exitPrice) {
      return res.status(400).json({ error: 'Missing positionId or exitPrice' });
    }

    const position = await prisma.position.findUnique({
      where: { id: positionId },
    });

    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }

    const profitLoss = position.direction === 'LONG'
      ? (exitPrice - position.entryPrice) * position.quantity
      : (position.entryPrice - exitPrice) * position.quantity;

    const updated = await prisma.position.update({
      where: { id: positionId },
      data: {
        status: 'CLOSED',
        exitPrice,
        exitTime: new Date(),
        profitLoss,
      },
    });

    res.json({ success: true, position: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to close position' });
  }
});

/**
 * GET /api/trading/stats - Account statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    const account = await prisma.tradingAccount.findFirst({
      where: { user: { id: userId } },
      include: {
        positions: { where: { status: 'OPEN' } },
        trades: { where: { status: 'CLOSED' } },
      },
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const trades = account.trades || [];
    const winTrades = trades.filter((t: any) => (t.profitLoss || 0) > 0);
    const lossTrades = trades.filter((t: any) => (t.profitLoss || 0) < 0);

    const totalPL = trades.reduce((sum: number, t: any) => sum + (t.profitLoss || 0), 0);
    const avgWin = winTrades.length > 0 ? winTrades.reduce((sum: number, t: any) => sum + (t.profitLoss || 0), 0) / winTrades.length : 0;
    const avgLoss = lossTrades.length > 0 ? Math.abs(lossTrades.reduce((sum: number, t: any) => sum + (t.profitLoss || 0), 0) / lossTrades.length) : 0;

    res.json({
      accountType: account.accountType,
      equity: account.paperEquity || 0,
      totalTrades: trades.length,
      winRate: trades.length > 0 ? (winTrades.length / trades.length) * 100 : 0,
      totalPL,
      avgWin,
      avgLoss,
      profitFactor: avgLoss > 0 ? (avgWin * winTrades.length) / (avgLoss * lossTrades.length) : 0,
      bestTrade: trades.length > 0 ? Math.max(...trades.map((t: any) => t.profitLoss || 0)) : 0,
      worstTrade: trades.length > 0 ? Math.min(...trades.map((t: any) => t.profitLoss || 0)) : 0,
      openPositions: account.positions.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
