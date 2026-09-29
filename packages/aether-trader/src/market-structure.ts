import type { Candle, FibLevels } from './types.ts';

export interface SwingRange {
  high: number;
  low: number;
  direction: 'up' | 'down';
}

export function detectSwingRange(candles: Candle[], index: number, lookback: number): SwingRange | null {
  if (index < lookback) {
    return null;
  }
  const window = candles.slice(index - lookback, index + 1);
  const high = Math.max(...window.map((candle) => candle.high));
  const low = Math.min(...window.map((candle) => candle.low));
  const direction = window[window.length - 1].close >= window[0].close ? 'up' : 'down';
  return { high, low, direction };
}

export function buildFibLevels(range: SwingRange): FibLevels {
  const move = range.high - range.low;
  if (range.direction === 'up') {
    return {
      zero: range.low,
      twoThreeSix: range.high - move * 0.236,
      threeEightTwo: range.high - move * 0.382,
      fifty: range.high - move * 0.5,
      sixOneEight: range.high - move * 0.618,
      one: range.high,
      oneSixOneEight: range.high + move * 0.618
    };
  }
  return {
    zero: range.high,
    twoThreeSix: range.low + move * 0.236,
    threeEightTwo: range.low + move * 0.382,
    fifty: range.low + move * 0.5,
    sixOneEight: range.low + move * 0.618,
    one: range.low,
    oneSixOneEight: range.low - move * 0.618
  };
}
