import { INSTRUMENTS, accountMetrics, applyFill, buildCandles, buildPlan, emptyBook, readTape } from '../chart-desk-model';

describe('chart desk model', () => {
  const mnq = INSTRUMENTS.MNQ;

  it('builds a New York sell impulse on the 15 minute MNQ tape', () => {
    const candles = buildCandles(mnq, '15m');
    const tape = readTape(candles, mnq.tick);
    const plan = buildPlan(tape, mnq.pointValue);

    expect(candles).toHaveLength(84);
    expect(candles.every((candle) => candle.h >= Math.max(candle.o, candle.c) && candle.l <= Math.min(candle.o, candle.c))).toBe(true);
    expect(new Set(candles.map((candle) => candle.session))).toEqual(new Set(['asia', 'london', 'ny']));
    expect(candles[candles.length - 1].c).toBeLessThan(candles[0].o - mnq.start * 0.01);
    expect(tape.regime).toBe('SELL_IMPULSE');
    expect(tape.session).toBe('ny');
    expect(plan.action).toBe('stand_aside');
    expect(plan.qty).toBe(0);
    expect(plan.riskPerContract).toBeGreaterThan(plan.budget);
  });

  it('keeps index contracts on their own price scale', () => {
    const mes = buildCandles(INSTRUMENTS.MES, '15m');
    expect(mes[0].o).toBeGreaterThan(6000);
    expect(mes[0].o).toBeLessThan(8000);
    expect(buildCandles(INSTRUMENTS.NQ, '1H')).toHaveLength(72);
  });

  it('realizes a round trip and averages adds', () => {
    let book = emptyBook();
    book = applyFill(book, 'buy', 1, 100, 2);
    book = applyFill(book, 'buy', 1, 110, 2);
    expect(book.position).toMatchObject({ side: 'buy', qty: 2, avg: 105 });

    book = applyFill(book, 'sell', 1, 115, 2);
    expect(book.position).toMatchObject({ side: 'buy', qty: 1, avg: 105 });
    expect(book.realized).toBeCloseTo(20);

    book = applyFill(book, 'sell', 2, 100, 2);
    expect(book.position).toMatchObject({ side: 'sell', qty: 1, avg: 100 });
    expect(book.realized).toBeCloseTo(10);

    const flat = accountMetrics(emptyBook(), 27_500, mnq);
    expect(flat.equity).toBe(100_000);
    expect(flat.unrealized).toBe(0);
    expect(flat.available).toBe(100_000);
    expect(flat.margin).toBe(0);
  });
});
