export type Direction = 'long' | 'short';
export type Bias = 'bullish' | 'bearish' | 'neutral';
export type Session = 'asia' | 'london' | 'new-york' | 'overlap' | 'off-hours';
export type Regime = 'trending' | 'ranging' | 'high-volatility' | 'low-volatility' | 'expansion' | 'compression' | 'reversal';
export type EntryModel = 'confirmation' | 'anticipation';

export interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  spread?: number;
}

export interface StrategyConfig {
  initialEquity: number;
  riskPerTrade: number;
  commissionPerTrade: number;
  slippageTicks: number;
  tickSize: number;
  tickValue: number;
  rsiPeriod: number;
  atrPeriod: number;
  swingLookback: number;
  sweepAtrThreshold: number;
  displacementAtrThreshold: number;
  scoreThreshold: number;
  probabilityThreshold: number;
  minRiskReward: number;
  maxDailyLossR: number;
  maxConsecutiveLosses: number;
  maxOpenPositions: number;
  trainingSplit: number;
  validationSplit: number;
  walkForwardWindow: number;
  monteCarloIterations: number;
}

export interface IndicatorState {
  rsi: number | null;
  atr: number | null;
  bias: Bias;
  session: Session;
  regime: Regime;
}

export interface FibLevels {
  zero: number;
  twoThreeSix: number;
  threeEightTwo: number;
  fifty: number;
  sixOneEight: number;
  one: number;
  oneSixOneEight: number;
}

export interface TradeSetup {
  index: number;
  timestamp: string;
  direction: Direction;
  entryModel: EntryModel;
  bias: Bias;
  session: Session;
  regime: Regime;
  score: number;
  probability: number;
  entry: number;
  stop: number;
  target: number;
  riskReward: number;
  notes: string[];
}

export interface ExecutedTrade extends TradeSetup {
  exit: number;
  outcome: 'win' | 'loss';
  pnl: number;
  rMultiple: number;
  mfe: number;
  mae: number;
  costs: number;
}

export interface BacktestResult {
  trades: ExecutedTrade[];
  totalTrades: number;
  winRate: number;
  lossRate: number;
  expectancy: number;
  profitFactor: number;
  netProfit: number;
  averageWin: number;
  averageLoss: number;
  maxDrawdown: number;
  averageR: number;
  largestWinningStreak: number;
  largestLosingStreak: number;
  passedPerformanceGate: boolean;
}

export interface WalkForwardSlice {
  train: Candle[];
  validate: Candle[];
  test: Candle[];
}

export interface WalkForwardResult {
  slices: Array<{
    slice: number;
    result: BacktestResult;
  }>;
  aggregate: BacktestResult;
}

export interface MonteCarloSummary {
  iterations: number;
  medianNetProfit: number;
  medianMaxDrawdown: number;
  worstDrawdown: number;
  bestNetProfit: number;
  riskOfRuin: number;
}

export interface ValidationReport {
  training: BacktestResult;
  validation: BacktestResult;
  outOfSample: BacktestResult;
  walkForward: WalkForwardResult;
  monteCarlo: MonteCarloSummary;
  finalAssessment: 'pass' | 'fail';
  bottlenecks: string[];
}
