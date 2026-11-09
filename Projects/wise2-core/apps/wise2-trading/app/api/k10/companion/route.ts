import { NextResponse } from 'next/server';
import { readNqLive } from '../../../../lib/nq-live';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const snapshot = await readNqLive();
  if (!snapshot) {
    return NextResponse.json({
      device: 'k10-trading-companion',
      mode: 'LIVE',
      source: 'tradingview-cme',
      side: 'WAIT',
      symbol: 'NQ1!',
      price: null,
      ema13: null,
      ema48: null,
      ema60: null,
      audio: 'wait',
      waiting: true,
    });
  }
  return NextResponse.json({
    device: 'k10-trading-companion',
    mode: snapshot.mode,
    source: snapshot.source,
    side: snapshot.side,
    symbol: snapshot.symbol,
    price: snapshot.price,
    ema13: snapshot.ema13 ?? null,
    ema48: snapshot.ema48 ?? null,
    ema60: snapshot.ema60 ?? null,
    timeframe: snapshot.timeframe ?? null,
    receivedAt: snapshot.receivedAt,
    audio: snapshot.side.toLowerCase(),
    waiting: false,
  });
}
