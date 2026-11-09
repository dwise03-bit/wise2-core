export type Bias = 'LONG' | 'SHORT' | 'WAIT';

export type Signal = {
  symbol: string;
  side: Bias;
  price: number;
  stopLoss?: number;
  takeProfit?: number;
  strategy?: string;
  timeframe?: string;
  ema13?: number;
  ema48?: number;
  ema60?: number;
};

export type RiskDecision = {
  status: 'APPROVED' | 'REVIEW' | 'REJECTED';
  riskPercent?: number;
  message: string;
};

export function stackedEmaBias(close: number, ema13?: number, ema48?: number, ema60?: number): Bias {
  if (![close, ema13, ema48, ema60].every(n => typeof n === 'number' && Number.isFinite(n))) return 'WAIT';
  if (close > ema13! && ema13! > ema48! && ema48! > ema60!) return 'LONG';
  if (close < ema13! && ema13! < ema48! && ema48! < ema60!) return 'SHORT';
  return 'WAIT';
}

export function evaluateRisk(signal: Signal): RiskDecision {
  if (!Number.isFinite(signal.price) || signal.price <= 0) return { status: 'REJECTED', message: 'A positive last price is required.' };
  if (signal.side === 'WAIT') return { status: 'REVIEW', message: 'EMA stack is mixed. Stay flat until 13/48/60 align with price.' };
  if (!signal.stopLoss || !Number.isFinite(signal.stopLoss)) return { status: 'REVIEW', message: 'Live alert received. Confirm invalidation before any order.' };
  const distance = Math.abs(signal.price - signal.stopLoss) / signal.price * 100;
  if (distance > 3) return { status: 'REJECTED', riskPercent: distance, message: `Stop is ${distance.toFixed(2)}% away; exceeds the 3% risk gate.` };
  return { status: 'APPROVED', riskPercent: distance, message: `Live CME alert eligible for manual confirmation. Stop distance: ${distance.toFixed(2)}%.` };
}

export function coachNote(signal: Signal, risk: RiskDecision) {
  const emas = [signal.ema13, signal.ema48, signal.ema60].every(n => Number.isFinite(n))
    ? ` EMA 13/48/60: ${signal.ema13} / ${signal.ema48} / ${signal.ema60}.`
    : '';
  const plan = signal.takeProfit ? ` Target: ${signal.takeProfit}.` : ' Confirm target before entry.';
  return `${risk.message}${emas}${plan} Live market data via TradingView CME. No automated order.`;
}
