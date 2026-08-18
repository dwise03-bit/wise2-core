import type { Candle } from './types.ts';

export interface LiquidityContext {
  asiaHigh: number;
  asiaLow: number;
  previousDayHigh: number;
  previousDayLow: number;
  sweepDirection: 'up' | 'down' | 'none';
  sweepMagnitude: number;
}

export function getLiquidityContext(candles: Candle[], index: number): LiquidityContext | null {
  if (index < 24) {
    return null;
  }
  const session = candles.slice(index - 24, index);
  const asia = session.filter((candle) => {
    const hour = new Date(candle.timestamp).getUTCHours();
    return hour >= 0 && hour < 7;
  });
  if (asia.length === 0) {
    return null;
  }

  const asiaHigh = Math.max(...asia.map((candle) => candle.high));
  const asiaLow = Math.min(...asia.map((candle) => candle.low));
  const previousDay = candles.slice(Math.max(0, index - 24), index);
  const previousDayHigh = Math.max(...previousDay.map((candle) => candle.high));
  const previousDayLow = Math.min(...previousDay.map((candle) => candle.low));
  const current = candles[index];

  if (current.high > asiaHigh && current.close < asiaHigh) {
    return {
      asiaHigh,
      asiaLow,
      previousDayHigh,
      previousDayLow,
      sweepDirection: 'up',
      sweepMagnitude: current.high - asiaHigh
    };
  }
  if (current.low < asiaLow && current.close > asiaLow) {
    return {
      asiaHigh,
      asiaLow,
      previousDayHigh,
      previousDayLow,
      sweepDirection: 'down',
      sweepMagnitude: asiaLow - current.low
    };
  }

  return {
    asiaHigh,
    asiaLow,
    previousDayHigh,
    previousDayLow,
    sweepDirection: 'none',
    sweepMagnitude: 0
  };
}
