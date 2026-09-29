import { PrismaClient } from '@prisma/client';
import { OHLCV } from '../types/trading-engine';

export interface PortfolioStats {
  totalEquity: number;
  cashBalance: number;
  unrealizedPL: number;
  realizedPL: number;
  totalPL: number;
  plPercent: number;
  openPositions: number;
  closedTrades: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  bestTrade: number;
  worstTrade: number;
}

export interface PositionSnapshot {
  symbol: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  direction: 'LONG' | 'SHORT';
  riskReward: number;
  entryTime: Date;
}

/**
 * PortfolioService: Calculate P&L, track positions, and generate portfolio statistics
 * Integrates with Prisma database for persistent state
 */
export class PortfolioService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get portfolio statistics for a trading account
   */
  async getPortfolioStats(accountId: string): Promise<PortfolioStats> {
    const account = await this.prisma.tradingAccount.findUnique({
      where: { id: accountId },
      include: {
        positions: { where: { status: 'OPEN' } },
        trades: { where: { status: 'CLOSED' } },
      },
    });

    if (!account) {
      throw new Error(`Account not found: ${accountId}`);
    }

    const openPositions = account.positions;
    const closedTrades = account.trades;

    // Calculate unrealized P&L from open positions
    let unrealizedPL = 0;
    for (const position of openPositions) {
      const pnl = this.calculatePositionPL(position.entryPrice, position.currentPrice, position.quantity, position.direction);
      unrealizedPL += pnl;
    }

    // Calculate realized P&L from closed trades
    const realizedPL = closedTrades.reduce((sum: number, trade: any) => sum + (trade.profitLoss || 0), 0);

    const totalPL = unrealizedPL + realizedPL;
    const totalEquity = (account.paperEquity || 0) + totalPL;
    const plPercent = account.paperEquity ? (totalPL / account.paperEquity) * 100 : 0;

    // Calculate win rate
    const winningTrades = closedTrades.filter((t: any) => (t.profitLoss || 0) > 0);
    const losingTrades = closedTrades.filter((t: any) => (t.profitLoss || 0) < 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;

    // Calculate average win/loss
    const totalWins = winningTrades.reduce((sum: number, t: any) => sum + (t.profitLoss || 0), 0);
    const totalLosses = losingTrades.reduce((sum: number, t: any) => sum + Math.abs(t.profitLoss || 0), 0);
    const averageWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
    const averageLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;

    // Profit factor
    const profitFactor = averageLoss !== 0 ? (averageWin * winningTrades.length) / (averageLoss * losingTrades.length) : 0;

    // Best and worst trades
    const bestTrade = closedTrades.length > 0 ? Math.max(...closedTrades.map((t: any) => t.profitLoss || 0)) : 0;
    const worstTrade = closedTrades.length > 0 ? Math.min(...closedTrades.map((t: any) => t.profitLoss || 0)) : 0;

    // Simplified Sharpe ratio (daily returns)
    const sharpeRatio = this.calculateSharpeRatio(closedTrades);

    // Max drawdown
    const maxDrawdown = this.calculateMaxDrawdown(closedTrades, account.paperEquity || 10000);

    return {
      totalEquity,
      cashBalance: account.paperEquity || 0,
      unrealizedPL,
      realizedPL,
      totalPL,
      plPercent,
      openPositions: openPositions.length,
      closedTrades: closedTrades.length,
      winRate,
      averageWin,
      averageLoss,
      profitFactor,
      sharpeRatio,
      maxDrawdown,
      bestTrade,
      worstTrade,
    };
  }

  /**
   * Get active positions with current prices
   */
  async getPositions(accountId: string, currentPrices: Map<string, number>): Promise<PositionSnapshot[]> {
    const positions = await this.prisma.position.findMany({
      where: {
        accountId,
        status: 'OPEN',
      },
    });

    return positions.map((position: any) => {
      const currentPrice = currentPrices.get(position.symbol) || position.currentPrice || position.entryPrice;
      const pnl = this.calculatePositionPL(
        position.entryPrice,
        currentPrice,
        position.quantity,
        position.direction as 'LONG' | 'SHORT'
      );
      const plPercent = (pnl / (position.entryPrice * position.quantity)) * 100;

      return {
        symbol: position.symbol,
        quantity: position.quantity,
        entryPrice: position.entryPrice,
        currentPrice,
        unrealizedPL: pnl,
        unrealizedPLPercent: plPercent,
        direction: position.direction as 'LONG' | 'SHORT',
        riskReward: position.riskRewardRatio || 0,
        entryTime: position.entryTime || new Date(),
      };
    });
  }

  /**
   * Record a new trade
   */
  async recordTrade(
    accountId: string,
    symbol: string,
    direction: 'LONG' | 'SHORT',
    quantity: number,
    entryPrice: number,
    targetPrice: number,
    stopPrice: number
  ) {
    const riskReward = this.calculateRiskReward(entryPrice, targetPrice, stopPrice, direction);

    return this.prisma.trade.create({
      data: {
        accountId,
        symbol,
        direction,
        quantity,
        entryPrice,
        targetPrice,
        stopPrice,
        riskRewardRatio: riskReward,
        entryTime: new Date(),
        status: 'OPEN',
      },
    });
  }

  /**
   * Close a position
   */
  async closePosition(positionId: string, exitPrice: number, exitTime: Date = new Date()) {
    const position = await this.prisma.position.findUnique({
      where: { id: positionId },
    });

    if (!position) {
      throw new Error(`Position not found: ${positionId}`);
    }

    const profitLoss = this.calculatePositionPL(
      position.entryPrice,
      exitPrice,
      position.quantity,
      position.direction as 'LONG' | 'SHORT'
    );

    return this.prisma.position.update({
      where: { id: positionId },
      data: {
        status: 'CLOSED',
        exitPrice,
        exitTime,
        profitLoss,
      },
    });
  }

  /**
   * Calculate P&L for a position
   */
  private calculatePositionPL(
    entryPrice: number,
    currentPrice: number,
    quantity: number,
    direction: 'LONG' | 'SHORT'
  ): number {
    const priceDiff = currentPrice - entryPrice;
    if (direction === 'SHORT') {
      return -priceDiff * quantity;
    }
    return priceDiff * quantity;
  }

  /**
   * Calculate risk/reward ratio
   */
  private calculateRiskReward(
    entryPrice: number,
    targetPrice: number,
    stopPrice: number,
    direction: 'LONG' | 'SHORT'
  ): number {
    if (direction === 'LONG') {
      const risk = entryPrice - stopPrice;
      const reward = targetPrice - entryPrice;
      return risk !== 0 ? reward / risk : 0;
    } else {
      const risk = stopPrice - entryPrice;
      const reward = entryPrice - targetPrice;
      return risk !== 0 ? reward / risk : 0;
    }
  }

  /**
   * Calculate Sharpe ratio (simplified: daily returns)
   */
  private calculateSharpeRatio(trades: any[]): number {
    if (trades.length < 2) return 0;

    const returns = trades
      .filter((t) => t.profitLoss !== null)
      .map((t) => (t.profitLoss || 0) / (t.riskValue || 1));

    if (returns.length < 2) return 0;

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    return stdDev !== 0 ? mean / stdDev : 0;
  }

  /**
   * Calculate maximum drawdown
   */
  private calculateMaxDrawdown(trades: any[], initialEquity: number): number {
    if (trades.length === 0) return 0;

    let peak = initialEquity;
    let maxDD = 0;
    let runningEquity = initialEquity;

    for (const trade of trades) {
      runningEquity += trade.profitLoss || 0;
      if (runningEquity > peak) {
        peak = runningEquity;
      }
      const dd = ((peak - runningEquity) / peak) * 100;
      if (dd > maxDD) {
        maxDD = dd;
      }
    }

    return maxDD;
  }
}
