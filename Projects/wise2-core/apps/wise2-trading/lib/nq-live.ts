import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import type { Bias, Signal } from './trading';

export type NqLiveSnapshot = {
  source: 'tradingview-cme';
  mode: 'LIVE';
  execution: 'manual';
  symbol: string;
  side: Bias;
  price: number;
  ema13?: number;
  ema48?: number;
  ema60?: number;
  timeframe?: string;
  strategy?: string;
  receivedAt: string;
};

const FILE = process.env.NQ_LIVE_PATH || path.join(process.cwd(), 'data', 'nq-live.json');

export async function readNqLive(): Promise<NqLiveSnapshot | null> {
  try {
    return JSON.parse(await readFile(FILE, 'utf8')) as NqLiveSnapshot;
  } catch {
    return null;
  }
}

export async function writeNqLive(signal: Signal): Promise<NqLiveSnapshot> {
  const snapshot: NqLiveSnapshot = {
    source: 'tradingview-cme',
    mode: 'LIVE',
    execution: 'manual',
    symbol: signal.symbol,
    side: signal.side,
    price: signal.price,
    ema13: signal.ema13,
    ema48: signal.ema48,
    ema60: signal.ema60,
    timeframe: signal.timeframe,
    strategy: signal.strategy,
    receivedAt: new Date().toISOString(),
  };
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(snapshot));
  return snapshot;
}
