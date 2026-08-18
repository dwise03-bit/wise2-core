import { defaultConfig } from './config.ts';
import { buildIndicatorState } from './indicators.ts';
import { getLiquidityContext } from './liquidity.ts';
import { detectSwingRange } from './market-structure.ts';
import type { Candle, Direction, StrategyConfig, TradeSetup } from './types.ts';

function clampProbability(score: number): number {
  return Math.max(0.05, Math.min(0.95, 0.35 + score * 0.06));
}

function pushIf(condition: boolean, bucket: string[], note: string): number {
  if (condition) {
    bucket.push(note);
    return 1;
  }
  return 0;
}

export function generateSetups(candles: Candle[], config: StrategyConfig = defaultConfig): TradeSetup[] {
  const indicators = buildIndicatorState(candles, config.rsiPeriod, config.atrPeriod);
  const setups: TradeSetup[] = [];

  for (let index = config.swingLookback; index < candles.length - 1; index += 1) {
    const indicator = indicators[index];
    if (indicator.atr === null || indicator.rsi === null) {
      continue;
    }
    if (indicator.bias === 'neutral') {
      continue;
    }

    const range = detectSwingRange(candles, index, config.swingLookback);
    const liquidity = getLiquidityContext(candles, index);
    if (!range || !liquidity) {
      continue;
    }

    const current = candles[index];
    const notes: string[] = [];
    const direction: Direction = indicator.bias === 'bullish' ? 'long' : 'short';
    const entryModel = liquidity.sweepDirection === 'none' ? 'confirmation' : 'anticipation';
    let score = 0;
    const impulse = range.high - range.low;
    const fibFifty = direction === 'long'
      ? range.high - impulse * 0.5
      : range.low + impulse * 0.5;
    const structuralBoundary = direction === 'long' ? range.low : range.high;
    const extensionTarget = direction === 'long'
      ? range.high + impulse * 0.618
      : range.low - impulse * 0.618;

    score += pushIf(indicator.session === 'london' || indicator.session === 'overlap', notes, 'favorable session');
    score += pushIf(indicator.regime === 'trending' || indicator.regime === 'reversal', notes, 'valid regime');
    score += pushIf(
      (direction === 'long' && liquidity.sweepDirection === 'down') ||
      (direction === 'short' && liquidity.sweepDirection === 'up'),
      notes,
      'liquidity raid aligned'
    ) * 2;
    score += pushIf(
      (direction === 'long' && current.close <= fibFifty) ||
      (direction === 'short' && current.close >= fibFifty),
      notes,
      'premium-discount alignment'
    );
    score += pushIf(
      (direction === 'long' && indicator.rsi > 45 && indicator.rsi < 62) ||
      (direction === 'short' && indicator.rsi < 55 && indicator.rsi > 38),
      notes,
      'rsi supports retracement'
    );

    const stop = direction === 'long'
      ? Math.min(current.low, structuralBoundary) - indicator.atr * 0.25
      : Math.max(current.high, structuralBoundary) + indicator.atr * 0.25;
    const target = extensionTarget;
    const entry = current.close;
    const risk = Math.abs(entry - stop);
    const reward = Math.abs(target - entry);
    const riskReward = risk === 0 ? 0 : reward / risk;
    score += pushIf(riskReward >= config.minRiskReward, notes, 'acceptable risk reward');

    const probability = clampProbability(score);
    if (score < config.scoreThreshold || probability < config.probabilityThreshold) {
      continue;
    }

    setups.push({
      index,
      timestamp: current.timestamp,
      direction,
      entryModel,
      bias: indicator.bias,
      session: indicator.session,
      regime: indicator.regime,
      score,
      probability,
      entry,
      stop,
      target,
      riskReward,
      notes
    });
  }

  return setups;
}
