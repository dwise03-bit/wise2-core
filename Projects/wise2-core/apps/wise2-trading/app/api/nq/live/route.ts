import { NextResponse } from 'next/server';
import { readNqLive } from '../../../../lib/nq-live';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const snapshot = await readNqLive();
  if (!snapshot) {
    return NextResponse.json({
      ok: true,
      mode: 'LIVE',
      source: 'tradingview-cme',
      waiting: true,
      message: 'Waiting for the first live TradingView CME NQ/MNQ webhook.',
    });
  }
  return NextResponse.json({ ok: true, ...snapshot });
}
