import type { StrategyConfig } from './types.ts';

export const defaultConfig: StrategyConfig = {
  initialEquity: 100000,
  riskPerTrade: 0.005,
  commissionPerTrade: 4.5,
  slippageTicks: 2,
  tickSize: 0.25,
  tickValue: 5,
  rsiPeriod: 14,
  atrPeriod: 14,
  swingLookback: 20,
  sweepAtrThreshold: 0.35,
  displacementAtrThreshold: 0.75,
  scoreThreshold: 5,
  probabilityThreshold: 0.58,
  minRiskReward: 1.25,
  maxDailyLossR: 3,
  maxConsecutiveLosses: 4,
  maxOpenPositions: 1,
  trainingSplit: 0.6,
  validationSplit: 0.2,
  walkForwardWindow: 120,
  monteCarloIterations: 250
};
