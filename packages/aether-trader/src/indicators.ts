import type { Bias, Candle, IndicatorState, Regime, Session } from './types.ts';

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function calculateRsi(candles: Candle[], period: number): Array<number | null> {
  const result: Array<number | null> = Array(candles.length).fill(null);
  if (candles.length <= period) {
    return result;
  }

  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i += 1) {
    const change = candles[i].close - candles[i - 1].close;
    gains += Math.max(change, 0);
    losses += Math.max(-change, 0);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  result[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < candles.length; i += 1) {
    const change = candles[i].close - candles[i - 1].close;
    avgGain = (avgGain * (period - 1) + Math.max(change, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-change, 0)) / period;
    result[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }

  return result;
}

export function calculateAtr(candles: Candle[], period: number): Array<number | null> {
  const trueRanges = candles.map((candle, index) => {
    if (index === 0) {
      return candle.high - candle.low;
    }
    const previousClose = candles[index - 1].close;
    return Math.max(
      candle.high - candle.low,
      Math.abs(candle.high - previousClose),
      Math.abs(candle.low - previousClose)
    );
  });

  const result: Array<number | null> = Array(candles.length).fill(null);
  for (let i = period - 1; i < candles.length; i += 1) {
    const window = trueRanges.slice(i - period + 1, i + 1);
    result[i] = average(window);
  }
  return result;
}

export function classifySession(timestamp: string): Session {
  const hour = new Date(timestamp).getUTCHours();
  if (hour >= 0 && hour < 7) {
    return 'asia';
  }
  if (hour >= 7 && hour < 12) {
    return 'london';
  }
  if (hour >= 12 && hour < 16) {
    return 'overlap';
  }
  if (hour >= 16 && hour < 21) {
    return 'new-york';
  }
  return 'off-hours';
}

export function classifyBias(candles: Candle[], index: number, atr: Array<number | null>): Bias {
  if (index < 16 || atr[index] === null) {
    return 'neutral';
  }
  const closes = candles.slice(index - 16, index + 1).map((candle) => candle.close);
  const highs = candles.slice(index - 16, index + 1).map((candle) => candle.high);
  const lows = candles.slice(index - 16, index + 1).map((candle) => candle.low);
  const displacement = Math.abs(closes[closes.length - 1] - closes[0]);
  const rising = closes[closes.length - 1] > closes[0] && highs[highs.length - 1] >= Math.max(...highs.slice(0, -1));
  const falling = closes[closes.length - 1] < closes[0] && lows[lows.length - 1] <= Math.min(...lows.slice(0, -1));
  if (rising && displacement > (atr[index] ?? 0) * 1.5) {
    return 'bullish';
  }
  if (falling && displacement > (atr[index] ?? 0) * 1.5) {
    return 'bearish';
  }
  return 'neutral';
}

export function classifyRegime(candles: Candle[], index: number, atr: Array<number | null>, rsi: Array<number | null>): Regime {
  if (index < 20 || atr[index] === null) {
    return 'compression';
  }
  const closes = candles.slice(index - 20, index + 1).map((candle) => candle.close);
  const range = Math.max(...closes) - Math.min(...closes);
  const currentAtr = atr[index] ?? 0;
  const currentRsi = rsi[index] ?? 50;

  if (currentAtr > average((atr.slice(Math.max(0, index - 20), index + 1).filter((value): value is number => value !== null)))! * 1.25) {
    return 'high-volatility';
  }
  if (currentAtr < average((atr.slice(Math.max(0, index - 20), index + 1).filter((value): value is number => value !== null)))! * 0.75) {
    return 'low-volatility';
  }
  if (range > currentAtr * 6 && (currentRsi > 58 || currentRsi < 42)) {
    return 'trending';
  }
  if (range < currentAtr * 3) {
    return 'ranging';
  }
  if (currentRsi > 65 || currentRsi < 35) {
    return 'expansion';
  }
  return 'reversal';
}

export function buildIndicatorState(candles: Candle[], rsiPeriod: number, atrPeriod: number): IndicatorState[] {
  const rsi = calculateRsi(candles, rsiPeriod);
  const atr = calculateAtr(candles, atrPeriod);
  return candles.map((candle, index) => ({
    rsi: rsi[index],
    atr: atr[index],
    bias: classifyBias(candles, index, atr),
    session: classifySession(candle.timestamp),
    regime: classifyRegime(candles, index, atr, rsi)
  }));
}
