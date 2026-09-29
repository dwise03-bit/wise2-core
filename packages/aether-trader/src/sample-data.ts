import type { Candle } from './types.ts';

export function generateDemoCandles(length = 480): Candle[] {
  const candles: Candle[] = [];
  let price = 19000;

  for (let i = 0; i < length; i += 1) {
    const timestamp = new Date(Date.UTC(2026, 0, 1, i, 0, 0)).toISOString();
    const hour = i % 24;
    const day = Math.floor(i / 24);
    const baseTrend = day % 2 === 0 ? 14 : -14;
    const drift = Math.sin(i / 10) * 10 + baseTrend;
    const noise = ((i * 17) % 9) - 4;
    const open = price;
    let close = Math.max(100, price + drift + noise);
    let high = Math.max(open, close) + 6 + (i % 4);
    let low = Math.min(open, close) - 6 - (i % 3);

    if (hour >= 0 && hour < 7) {
      close = open + Math.sin(i) * 3;
      high = Math.max(open, close) + 4;
      low = Math.min(open, close) - 4;
    }

    if (hour === 8 || hour === 9) {
      high += 20;
      close = open - 8;
      low = Math.min(low, close - 6);
    }

    if (hour === 13 || hour === 14) {
      low -= 20;
      close = open + 8;
      high = Math.max(high, close + 6);
    }

    candles.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume: 1000 + i * 2,
      spread: 0.5
    });
    price = close;
  }

  return candles;
}
