import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Free, keyless source (Yahoo Finance chart endpoint). CME futures are ~10 min delayed;
// US ETFs and crypto are near real time.
const SYMBOLS = ['NQ=F', 'MNQ=F', 'ES=F', 'QQQ', 'SPY', 'BTC-USD', 'ETH-USD'] as const;
const RANGES: Record<string, string> = { '1m': '1d', '5m': '5d', '15m': '5d', '1h': '1mo', '1d': '1y' };

export async function GET(req: Request) {
  const url = new URL(req.url);
  const symbol = url.searchParams.get('symbol') || 'NQ=F';
  const interval = url.searchParams.get('interval') || '5m';
  if (!(SYMBOLS as readonly string[]).includes(symbol) || !RANGES[interval]) {
    return NextResponse.json({ ok: false, error: 'unsupported symbol or interval' }, { status: 400 });
  }
  const src = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${RANGES[interval]}`;
  try {
    const res = await fetch(src, { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const r = (await res.json()).chart.result[0];
    const q = r.indicators.quote[0];
    const candles = (r.timestamp as number[])
      .map((time, i) => ({ time, open: q.open[i], high: q.high[i], low: q.low[i], close: q.close[i], volume: q.volume[i] ?? 0 }))
      .filter((c) => c.open != null && c.high != null && c.low != null && c.close != null);
    const last = candles.at(-1)?.time ?? 0;
    return NextResponse.json({
      ok: true,
      symbol,
      interval,
      source: 'yahoo-finance (free)',
      delayMinutes: Math.max(0, Math.round((Date.now() / 1000 - last) / 60)),
      candles,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 502 });
  }
}
