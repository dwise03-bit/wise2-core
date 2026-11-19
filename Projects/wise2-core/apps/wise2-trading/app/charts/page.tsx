'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { createChart, ColorType, type IChartApi, type ISeriesApi, type UTCTimestamp } from 'lightweight-charts';

type Candle = { time: number; open: number; high: number; low: number; close: number; volume: number };
const SYMBOLS = ['NQ=F', 'MNQ=F', 'ES=F', 'QQQ', 'SPY', 'BTC-USD', 'ETH-USD'];
const INTERVALS = ['1m', '5m', '15m', '1h', '1d'];
const EMAS = [
  { period: 13, color: '#00D9FF' },
  { period: 48, color: '#C4A369' },
  { period: 60, color: '#b789ff' },
];

function ema(c: Candle[], period: number) {
  const k = 2 / (period + 1);
  let v = c[0]?.close ?? 0;
  return c.map((x, i) => ({ time: x.time as UTCTimestamp, value: (v = i === 0 ? x.close : v + (x.close - v) * k) }));
}

export default function Charts() {
  const box = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const candleS = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const emaS = useRef<ISeriesApi<'Line'>[]>([]);
  const [symbol, setSymbol] = useState('NQ=F');
  const [interval, setIntervalV] = useState('5m');
  const [info, setInfo] = useState('Loading…');

  useEffect(() => {
    if (!box.current) return;
    const c = createChart(box.current, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: '#050607' }, textColor: '#c8d6e5' },
      grid: { vertLines: { color: '#11202e' }, horzLines: { color: '#11202e' } },
      timeScale: { timeVisible: true, secondsVisible: false },
    });
    candleS.current = c.addCandlestickSeries({
      upColor: '#00FF7F', downColor: '#ff5470', borderVisible: false, wickUpColor: '#00FF7F', wickDownColor: '#ff5470',
    });
    emaS.current = EMAS.map((e) => c.addLineSeries({ color: e.color, lineWidth: 2, priceLineVisible: false, lastValueVisible: false }));
    chart.current = c;
    return () => c.remove();
  }, []);

  useEffect(() => {
    let alive = true;
    let first = true;
    async function load() {
      try {
        const r = await fetch(`/trading/api/candles?symbol=${encodeURIComponent(symbol)}&interval=${interval}`).then((x) => x.json());
        if (!alive) return;
        if (!r.ok) return setInfo(`Data error: ${r.error}`);
        const cs: Candle[] = r.candles;
        candleS.current?.setData(cs.map((x) => ({ ...x, time: x.time as UTCTimestamp })));
        EMAS.forEach((e, i) => emaS.current[i]?.setData(ema(cs, e.period)));
        if (first) chart.current?.timeScale().fitContent();
        first = false;
        const last = cs.at(-1);
        setInfo(`${symbol} ${last?.close.toFixed(2)} · ${r.delayMinutes <= 1 ? 'LIVE' : `${r.delayMinutes} min behind`} · ${r.source}`);
      } catch (e) {
        if (alive) setInfo(`Data error: ${(e as Error).message}`);
      }
    }
    load();
    const t = setInterval(load, 15000);
    return () => { alive = false; clearInterval(t); };
  }, [symbol, interval]);

  const btn = (on: boolean) => ({
    background: on ? '#00D9FF' : '#0d1620', color: on ? '#050607' : '#e5f4ff', border: '1px solid #1e3446',
    padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 600,
  });

  return (
    <main style={{ background: '#050607', color: '#e5f4ff', minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <header style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <Link href="/" style={{ color: '#00D9FF' }}>← WISE²</Link>
        <h1 style={{ fontSize: 20, margin: 0 }}>WISE² CHARTS</h1>
        <span style={{ color: '#8daac2', fontSize: 13 }}>{info}</span>
      </header>
      <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {SYMBOLS.map((s) => <button key={s} style={btn(s === symbol)} onClick={() => setSymbol(s)}>{s}</button>)}
        <span style={{ width: 12 }} />
        {INTERVALS.map((i) => <button key={i} style={btn(i === interval)} onClick={() => setIntervalV(i)}>{i}</button>)}
      </nav>
      <div style={{ fontSize: 12, color: '#8daac2' }}>
        EMA <span style={{ color: '#00D9FF' }}>13</span> / <span style={{ color: '#C4A369' }}>48</span> / <span style={{ color: '#b789ff' }}>60</span> · refreshes every 15s · charts by open-source Lightweight Charts
      </div>
      <div ref={box} style={{ flex: 1, minHeight: 480, border: '1px solid #1e3446', borderRadius: 8 }} />
    </main>
  );
}
