import { defaultConfig } from './config.ts';
import { generateSetups } from './strategy.ts';
import type { BacktestResult, Candle, ExecutedTrade, StrategyConfig, TradeSetup } from './types.ts';

function summarizeTrades(trades: ExecutedTrade[]): BacktestResult {
  const wins = trades.filter((trade) => trade.outcome === 'win');
  const losses = trades.filter((trade) => trade.outcome === 'loss');
  const netProfit = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const grossProfit = wins.reduce((sum, trade) => sum + trade.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((sum, trade) => sum + trade.pnl, 0));
  const rValues = trades.map((trade) => trade.rMultiple);

  let equity = 0;
  let peak = 0;
  let maxDrawdown = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;
  let largestWinningStreak = 0;
  let largestLosingStreak = 0;

  for (const trade of trades) {
    equity += trade.pnl;
    peak = Math.max(peak, equity);
    maxDrawdown = Math.max(maxDrawdown, peak - equity);
    if (trade.outcome === 'win') {
      currentWinStreak += 1;
      currentLossStreak = 0;
    } else {
      currentLossStreak += 1;
      currentWinStreak = 0;
    }
    largestWinningStreak = Math.max(largestWinningStreak, currentWinStreak);
    largestLosingStreak = Math.max(largestLosingStreak, currentLossStreak);
  }

  const totalTrades = trades.length;
  const winRate = totalTrades === 0 ? 0 : wins.length / totalTrades;
  const lossRate = totalTrades === 0 ? 0 : losses.length / totalTrades;
  const averageWin = wins.length === 0 ? 0 : grossProfit / wins.length;
  const averageLoss = losses.length === 0 ? 0 : -grossLoss / losses.length;
  const expectancy = winRate * averageWin + lossRate * averageLoss;
  const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? Number.POSITIVE_INFINITY : 0) : grossProfit / grossLoss;
  const averageR = rValues.length === 0 ? 0 : rValues.reduce((sum, value) => sum + value, 0) / rValues.length;
  const passedPerformanceGate = winRate >= 0.65 && expectancy > 0 && profitFactor >= 1.5;

  return {
    trades,
    totalTrades,
    winRate,
    lossRate,
    expectancy,
    profitFactor,
    netProfit,
    averageWin,
    averageLoss,
    maxDrawdown,
    averageR,
    largestWinningStreak,
    largestLosingStreak,
    passedPerformanceGate
  };
}

function executeTrade(setup: TradeSetup, candles: Candle[], config: StrategyConfig): ExecutedTrade {
  const risk = Math.abs(setup.entry - setup.stop);
  let mfe = 0;
  let mae = 0;
  let exit = setup.entry;
  let outcome: 'win' | 'loss' = 'loss';
  let resolved = false;

  for (let i = setup.index + 1; i < Math.min(candles.length, setup.index + 13); i += 1) {
    const candle = candles[i];
    const favorable = setup.direction === 'long' ? candle.high - setup.entry : setup.entry - candle.low;
    const adverse = setup.direction === 'long' ? setup.entry - candle.low : candle.high - setup.entry;
    mfe = Math.max(mfe, favorable);
    mae = Math.max(mae, adverse);

    const hitTarget = setup.direction === 'long' ? candle.high >= setup.target : candle.low <= setup.target;
    const hitStop = setup.direction === 'long' ? candle.low <= setup.stop : candle.high >= setup.stop;

    if (hitStop) {
      exit = setup.stop;
      outcome = 'loss';
      resolved = true;
      break;
    }
    if (hitTarget) {
      exit = setup.target;
      outcome = 'win';
      resolved = true;
      break;
    }
    exit = candle.close;
  }

  const slippage = config.slippageTicks * config.tickSize;
  const adjustedExit = setup.direction === 'long' ? exit - slippage : exit + slippage;
  const move = setup.direction === 'long' ? adjustedExit - setup.entry : setup.entry - adjustedExit;
  if (!resolved) {
    outcome = move >= 0 ? 'win' : 'loss';
  }
  const positionSize = (config.initialEquity * config.riskPerTrade) / Math.max(risk * config.tickValue / config.tickSize, 1);
  const grossPnl = move * positionSize * config.tickValue / config.tickSize;
  const costs = config.commissionPerTrade + slippage * positionSize * config.tickValue / config.tickSize;
  const pnl = grossPnl - costs;
  const rMultiple = risk === 0 ? 0 : move / risk;

  return {
    ...setup,
    exit: adjustedExit,
    outcome,
    pnl,
    rMultiple,
    mfe,
    mae,
    costs
  };
}

export function runBacktest(candles: Candle[], config: StrategyConfig = defaultConfig): BacktestResult {
  const setups = generateSetups(candles, config);
  const trades: ExecutedTrade[] = [];
  let consecutiveLosses = 0;

  for (const setup of setups) {
    if (consecutiveLosses >= config.maxConsecutiveLosses) {
      break;
    }
    const trade = executeTrade(setup, candles, config);
    trades.push(trade);
    consecutiveLosses = trade.outcome === 'loss' ? consecutiveLosses + 1 : 0;
  }

  return summarizeTrades(trades);
}
