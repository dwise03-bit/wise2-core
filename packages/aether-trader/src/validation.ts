import { defaultConfig } from './config.ts';
import { runBacktest } from './backtest.ts';
import type {
  BacktestResult,
  Candle,
  MonteCarloSummary,
  StrategyConfig,
  ValidationReport,
  WalkForwardResult,
  WalkForwardSlice
} from './types.ts';

function splitDataset(candles: Candle[], config: StrategyConfig): WalkForwardSlice {
  const trainingEnd = Math.floor(candles.length * config.trainingSplit);
  const validationEnd = trainingEnd + Math.floor(candles.length * config.validationSplit);
  return {
    train: candles.slice(0, trainingEnd),
    validate: candles.slice(trainingEnd, validationEnd),
    test: candles.slice(validationEnd)
  };
}

function aggregateResults(results: BacktestResult[]): BacktestResult {
  const allTrades = results.flatMap((result) => result.trades);
  return runBacktest(
    allTrades.map((trade) => ({
      timestamp: trade.timestamp,
      open: trade.entry,
      high: Math.max(trade.entry, trade.exit),
      low: Math.min(trade.entry, trade.exit),
      close: trade.exit,
      volume: 0,
      spread: 0
    })),
    defaultConfig
  );
}

export function runWalkForward(candles: Candle[], config: StrategyConfig = defaultConfig): WalkForwardResult {
  const results: WalkForwardResult['slices'] = [];
  let slice = 0;

  for (let start = 0; start + config.walkForwardWindow * 3 <= candles.length; start += config.walkForwardWindow) {
    const train = candles.slice(start, start + config.walkForwardWindow);
    const validate = candles.slice(start + config.walkForwardWindow, start + config.walkForwardWindow * 2);
    const test = candles.slice(start + config.walkForwardWindow * 2, start + config.walkForwardWindow * 3);
    const result = runBacktest(test, config);
    results.push({ slice, result });
    void train;
    void validate;
    slice += 1;
  }

  return {
    slices: results,
    aggregate: aggregateResults(results.map((entry) => entry.result))
  };
}

function shuffle<T>(values: T[], seed: number): T[] {
  const result = [...values];
  let state = seed;
  for (let i = result.length - 1; i > 0; i -= 1) {
    state = (state * 1664525 + 1013904223) % 4294967296;
    const j = state % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function runMonteCarlo(base: BacktestResult, iterations: number): MonteCarloSummary {
  const profits: number[] = [];
  const drawdowns: number[] = [];
  let ruined = 0;

  for (let i = 0; i < iterations; i += 1) {
    const shuffled = shuffle(base.trades, i + 1);
    let equity = 0;
    let peak = 0;
    let maxDrawdown = 0;
    for (const trade of shuffled) {
      equity += trade.pnl;
      peak = Math.max(peak, equity);
      maxDrawdown = Math.max(maxDrawdown, peak - equity);
    }
    profits.push(equity);
    drawdowns.push(maxDrawdown);
    if (equity < 0) {
      ruined += 1;
    }
  }

  profits.sort((a, b) => a - b);
  drawdowns.sort((a, b) => a - b);
  const middle = Math.floor(iterations / 2);

  return {
    iterations,
    medianNetProfit: profits[middle] ?? 0,
    medianMaxDrawdown: drawdowns[middle] ?? 0,
    worstDrawdown: drawdowns[drawdowns.length - 1] ?? 0,
    bestNetProfit: profits[profits.length - 1] ?? 0,
    riskOfRuin: iterations === 0 ? 0 : ruined / iterations
  };
}

export function validateStrategy(candles: Candle[], config: StrategyConfig = defaultConfig): ValidationReport {
  const split = splitDataset(candles, config);
  const training = runBacktest(split.train, config);
  const validation = runBacktest(split.validate, config);
  const outOfSample = runBacktest(split.test, config);
  const walkForward = runWalkForward(candles, config);
  const monteCarlo = runMonteCarlo(outOfSample, config.monteCarloIterations);

  const bottlenecks: string[] = [];
  if (outOfSample.winRate < 0.65) {
    bottlenecks.push('Out-of-sample win rate below 65%');
  }
  if (outOfSample.expectancy <= 0) {
    bottlenecks.push('Out-of-sample expectancy is not positive');
  }
  if (outOfSample.profitFactor < 1.5) {
    bottlenecks.push('Profit factor below preferred 1.5 threshold');
  }
  if (monteCarlo.riskOfRuin > 0.2) {
    bottlenecks.push('Monte Carlo risk of ruin exceeds 20%');
  }
  if (walkForward.slices.some((slice) => !slice.result.passedPerformanceGate)) {
    bottlenecks.push('Walk-forward slices are unstable');
  }

  return {
    training,
    validation,
    outOfSample,
    walkForward,
    monteCarlo,
    finalAssessment: bottlenecks.length === 0 ? 'pass' : 'fail',
    bottlenecks
  };
}
