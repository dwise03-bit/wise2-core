import { NextRequest, NextResponse } from 'next/server';
import { writeNqLive } from '../../../lib/nq-live';
import { coachNote, evaluateRisk, stackedEmaBias, type Bias, type Signal } from '../../../lib/trading';

export const runtime = 'nodejs';

function bad(message: string, status = 400) { return NextResponse.json({ ok: false, message }, { status }); }
function num(value: unknown) { const n = Number(value); return Number.isFinite(n) ? n : undefined; }

export async function POST(request: NextRequest) {
  const expected = process.env.TRADINGVIEW_WEBHOOK_SECRET;
  if (!expected) return bad('Webhook is not configured.', 503);
  let body: (Partial<Signal> & { secret?: string });
  try { body = await request.json(); } catch { return bad('Webhook body must be JSON.'); }
  if (body.secret !== expected) return bad('Unauthorized.', 401);
  const ema13 = num(body.ema13);
  const ema48 = num(body.ema48);
  const ema60 = num(body.ema60);
  const price = Number(body.price);
  let side = String(body.side || '').toUpperCase() as Bias | string;
  if (side !== 'LONG' && side !== 'SHORT' && side !== 'WAIT') {
    side = stackedEmaBias(price, ema13, ema48, ema60);
  }
  const signal: Signal = {
    symbol: String(body.symbol || '').trim().toUpperCase(),
    side: side as Bias,
    price,
    stopLoss: num(body.stopLoss),
    takeProfit: num(body.takeProfit),
    strategy: body.strategy ? String(body.strategy) : 'EMA_13_48_60',
    timeframe: body.timeframe ? String(body.timeframe) : undefined,
    ema13,
    ema48,
    ema60,
  };
  if (!signal.symbol) return bad('symbol is required.');
  const risk = evaluateRisk(signal);
  const note = coachNote(signal, risk);
  const snapshot = await writeNqLive(signal);
  const discordUrl = process.env.DISCORD_WEBHOOK_URL;
  if (discordUrl) {
    const content = `**WISE² LIVE CME / TradingView — ${risk.status}**\n${signal.side} ${signal.symbol} @ ${signal.price}\n${note}`;
    const delivered = await fetch(discordUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ content, allowed_mentions: { parse: [] } }) });
    if (!delivered.ok) console.error('Discord delivery failed:', delivered.status);
  }
  return NextResponse.json({
    ok: true,
    mode: 'LIVE',
    source: 'tradingview-cme',
    snapshot,
    signal,
    risk,
    coach: note,
    execution: { enabled: false, message: 'Live CME alerts only. No order was placed.' },
  });
}
