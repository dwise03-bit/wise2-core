export type IntervalId = '1m' | '5m' | '15m' | '1H' | '4H' | 'D';
export type SessionName = 'asia' | 'london' | 'ny';
export type Side = 'buy' | 'sell';
export type SymbolId = 'MNQ' | 'NQ' | 'MES' | 'ES';

export interface Instrument {
  symbol: SymbolId;
  code: string;
  name: string;
  exchange: string;
  pointValue: number;
  /** Illustrative desk margin for the paper book. Not an exchange requirement. */
  margin: number;
  start: number;
  tick: number;
}

export interface Candle {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  session: SessionName;
}

export interface TapeRead {
  bias: 'long' | 'short' | 'flat';
  regime: 'SELL_IMPULSE' | 'RECLAIM' | 'BELOW_VWAP' | 'BALANCE';
  confidence: number;
  headline: string;
  detail: string;
  vwap: number;
  liquidity: number;
  reclaim: number;
  stop: number;
  target: number;
  riskPoints: number;
  session: SessionName;
  change: number;
  changePercent: number;
}

export interface Plan {
  action: 'stand_aside' | 'short' | 'long';
  qty: number;
  riskPerContract: number;
  budget: number;
  headline: string;
  detail: string;
}

export interface PaperPosition {
  side: Side;
  qty: number;
  avg: number;
}

export interface PaperBook {
  cash: number;
  realized: number;
  position: PaperPosition | null;
}

export interface AccountMetrics {
  unrealized: number;
  realized: number;
  equity: number;
  margin: number;
  available: number;
  cushion: number;
  buffer: number;
}

export const DESK_RISK_BUDGET = 200;
export const STARTING_CASH = 100_000;

export const INSTRUMENTS: Record<SymbolId, Instrument> = {
  MNQ: {
    symbol: 'MNQ',
    code: 'MNQ1!',
    name: 'Micro E-mini Nasdaq-100',
    exchange: 'CME',
    pointValue: 2,
    margin: 1_500,
    start: 27_980,
    tick: 0.25,
  },
  NQ: {
    symbol: 'NQ',
    code: 'NQ1!',
    name: 'E-mini Nasdaq-100',
    exchange: 'CME',
    pointValue: 20,
    margin: 15_000,
    start: 27_980,
    tick: 0.25,
  },
  MES: {
    symbol: 'MES',
    code: 'MES1!',
    name: 'Micro E-mini S&P 500',
    exchange: 'CME',
    pointValue: 5,
    margin: 1_500,
    start: 6_784,
    tick: 0.25,
  },
  ES: {
    symbol: 'ES',
    code: 'ES1!',
    name: 'E-mini S&P 500',
    exchange: 'CME',
    pointValue: 50,
    margin: 15_000,
    start: 6_784,
    tick: 0.25,
  },
};

const INTERVAL_COUNT: Record<IntervalId, number> = {
  '1m': 140,
  '5m': 110,
  '15m': 84,
  '1H': 72,
  '4H': 60,
  D: 48,
};

export function roundTick(price: number, tick: number): number {
  const digits = tick < 1 ? 2 : 0;
  return Number((Math.round(price / tick) * tick).toFixed(digits));
}

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sessionFor(index: number, total: number): SessionName {
  const t = index / Math.max(total, 1);
  if (t < 0.34) return 'asia';
  if (t < 0.67) return 'london';
  return 'ny';
}

/** Deterministic simulated session. The New York third is a sell impulse. */
export function buildCandles(instrument: Instrument, interval: IntervalId): Candle[] {
  const count = INTERVAL_COUNT[interval];
  const rand = mulberry32(hashSeed(`${instrument.symbol}:${interval}`));
  const drop = instrument.start * 0.016;
  const impulseAt = Math.floor(count * 0.78);
  let price = instrument.start;
  const candles: Candle[] = [];

  for (let i = 0; i < count; i += 1) {
    const inImpulse = i >= impulseAt;
    const noiseScale = instrument.start * 0.00115 * (inImpulse ? 0.32 : 1);
    const noise = (rand() - 0.5) * noiseScale;
    const drift = inImpulse
      ? -drop / (count - impulseAt)
      : Math.sin(i / 6.5) * instrument.start * 0.00018;
    const open = roundTick(price, instrument.tick);
    const close = roundTick(open + drift + noise, instrument.tick);
    const upper = rand() * instrument.start * (inImpulse ? 0.00022 : 0.00055);
    const lower = rand() * instrument.start * (inImpulse ? 0.00045 : 0.0005);
    const high = roundTick(Math.max(open, close) + upper, instrument.tick);
    const low = roundTick(Math.min(open, close) - lower, instrument.tick);
    const volumeBoost = inImpulse ? 2800 * ((i - impulseAt) / (count - impulseAt)) : 0;
    candles.push({
      o: open,
      h: high,
      l: low,
      c: close,
      v: Math.round(900 + rand() * 2400 + volumeBoost),
      session: sessionFor(i, count),
    });
    price = close;
  }

  return candles;
}

export function vwapOf(candles: Candle[]): number {
  let weighted = 0;
  let volume = 0;
  for (const candle of candles) {
    const typical = (candle.h + candle.l + candle.c) / 3;
    weighted += typical * candle.v;
    volume += candle.v;
  }
  if (volume === 0) return candles[candles.length - 1]?.c ?? 0;
  return weighted / volume;
}

export function readTape(candles: Candle[], tick: number): TapeRead {
  const last = candles[candles.length - 1];
  const first = candles[0];
  const impulseAt = Math.floor(candles.length * 0.78);
  const pre = candles.slice(0, Math.max(impulseAt, 1));
  const impulse = candles.slice(impulseAt);
  const preLow = Math.min(...pre.map((candle) => candle.l));
  const preHigh = Math.max(...pre.map((candle) => candle.h));
  const vwap = roundTick(vwapOf(candles), tick);
  const liquidity = roundTick(preLow, tick);
  const reclaim = roundTick(pre[pre.length - 1].c, tick);
  const redShare = impulse.filter((candle) => candle.c < candle.o).length / Math.max(impulse.length, 1);
  const brokeShelf = last.c < liquidity;
  const impulseDown = redShare > 0.6 && last.c < reclaim && brokeShelf;
  const change = last.c - first.o;
  const changePercent = (change / first.o) * 100;

  let bias: TapeRead['bias'] = 'flat';
  let regime: TapeRead['regime'] = 'BALANCE';
  let headline = 'Balance around VWAP. Wait for the shelf to break or hold.';
  let stop = last.c >= vwap ? preLow : preHigh;
  let target = last.c;

  if (impulseDown) {
    regime = 'SELL_IMPULSE';
    bias = 'flat';
    headline = 'Sell impulse already tagged the shelf. Do not chase it.';
    stop = reclaim;
    target = roundTick(last.c - Math.abs(reclaim - last.c), tick);
  } else if (last.c > vwap && last.c >= reclaim) {
    regime = 'RECLAIM';
    bias = 'long';
    headline = 'Price reclaimed VWAP. A long needs a hold, not a guess.';
    stop = roundTick(Math.min(vwap, preLow), tick);
    target = roundTick(last.c + Math.abs(last.c - stop), tick);
  } else if (last.c < vwap) {
    regime = 'BELOW_VWAP';
    bias = 'short';
    headline = 'Below VWAP. A short needs a nearby stop, not the hole.';
    stop = roundTick(Math.max(vwap, preHigh), tick);
    target = roundTick(last.c - Math.abs(stop - last.c), tick);
  } else {
    stop = preLow;
    target = preHigh;
  }

  stop = roundTick(stop, tick);
  const riskPoints = Math.abs(stop - last.c);
  const confidence = Math.round(Math.min(94, 46 + redShare * 48 + (brokeShelf ? 8 : 0)));

  return {
    bias,
    regime,
    confidence,
    headline,
    detail: `${last.session === 'ny' ? 'New York' : last.session === 'london' ? 'London' : 'Asia'} is leading this bar.`,
    vwap,
    liquidity,
    reclaim,
    stop,
    target,
    riskPoints,
    session: last.session,
    change,
    changePercent,
  };
}

export function buildPlan(read: TapeRead, pointValue: number, budget = DESK_RISK_BUDGET): Plan {
  const riskPerContract = read.riskPoints * pointValue;
  const affordable = riskPerContract > 0 ? Math.floor(budget / riskPerContract) : 0;
  const tooWide = affordable < 1;
  const standAside = read.regime === 'SELL_IMPULSE' || tooWide || read.bias === 'flat';

  if (standAside) {
    return {
      action: 'stand_aside',
      qty: 0,
      riskPerContract,
      budget,
      headline: read.headline,
      detail: tooWide
        ? `One contract risks $${riskPerContract.toFixed(0)} to the stop. That is outside the $${budget} paper budget.`
        : `The impulse already ran. PLOT stands aside until price reclaims ${read.reclaim.toFixed(2)}.`,
    };
  }

  return {
    action: read.bias === 'long' ? 'long' : 'short',
    qty: affordable,
    riskPerContract,
    budget,
    headline: read.headline,
    detail: `${affordable} contract${affordable === 1 ? '' : 's'} keep the stop inside the $${budget} paper budget.`,
  };
}

export function emptyBook(cash = STARTING_CASH): PaperBook {
  return { cash, realized: 0, position: null };
}

export function applyFill(book: PaperBook, side: Side, qty: number, price: number, pointValue: number): PaperBook {
  if (qty <= 0 || !Number.isFinite(price) || pointValue <= 0) return book;

  const current = book.position ? (book.position.side === 'buy' ? book.position.qty : -book.position.qty) : 0;
  const delta = side === 'buy' ? qty : -qty;
  const next = current + delta;
  const closing = current === 0 || Math.sign(current) === Math.sign(delta)
    ? 0
    : Math.min(Math.abs(current), Math.abs(delta));

  let realized = book.realized;
  if (closing > 0 && book.position) {
    const direction = book.position.side === 'buy' ? 1 : -1;
    realized += (price - book.position.avg) * direction * closing * pointValue;
  }

  let position: PaperPosition | null = null;
  if (next !== 0) {
    const adding = current !== 0 && Math.sign(next) === Math.sign(current) && Math.abs(next) > Math.abs(current);
    if (adding && book.position) {
      const added = Math.abs(delta);
      position = {
        side: next > 0 ? 'buy' : 'sell',
        qty: Math.abs(next),
        avg: (book.position.avg * book.position.qty + price * added) / (book.position.qty + added),
      };
    } else if (book.position && Math.sign(next) === Math.sign(current)) {
      position = { side: book.position.side, qty: Math.abs(next), avg: book.position.avg };
    } else {
      position = { side: next > 0 ? 'buy' : 'sell', qty: Math.abs(next), avg: price };
    }
  }

  return { cash: STARTING_CASH + realized, realized, position };
}

export function unrealized(book: PaperBook, last: number, pointValue: number): number {
  if (!book.position) return 0;
  const direction = book.position.side === 'buy' ? 1 : -1;
  return (last - book.position.avg) * direction * book.position.qty * pointValue;
}

export function accountMetrics(book: PaperBook, last: number, instrument: Instrument): AccountMetrics {
  const open = unrealized(book, last, instrument.pointValue);
  const equity = book.cash + open;
  const margin = (book.position?.qty ?? 0) * instrument.margin;
  const available = equity - margin;
  const cushion = equity === 0 ? 0 : available / equity;
  const buffer = book.position ? available - equity * 0.1 : available;
  return {
    unrealized: open,
    realized: book.realized,
    equity,
    margin,
    available,
    cushion,
    buffer,
  };
}

export function nudgeLast(candles: Candle[], step: number, tick: number): Candle[] {
  if (candles.length === 0 || step === 0) return candles;
  const next = candles.slice();
  const last = { ...next[next.length - 1] };
  const wobble = Math.sin(step / 2) * tick * 2;
  last.c = roundTick(last.c + wobble, tick);
  last.h = Math.max(last.h, last.c);
  last.l = Math.min(last.l, last.c);
  next[next.length - 1] = last;
  return next;
}
