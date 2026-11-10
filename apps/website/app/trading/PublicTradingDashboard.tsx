'use client';

import { useMemo, useState } from 'react';

type Study = 'ema13' | 'ema48' | 'ema200' | 'vwap' | 'swings' | 'rsi';
const names: Record<Study, string> = { ema13: 'EMA 13', ema48: 'EMA 48', ema200: 'EMA 200', vwap: 'Session VWAP', swings: 'Swing zones', rsi: 'RSI 14' };
const colors: Record<Study, string> = { ema13: '#45bdf0', ema48: '#e9ac50', ema200: '#a697e9', vwap: '#e6dc9d', swings: '#50bd99', rsi: '#b5a6fa' };
const bars = Array.from({ length: 96 }, (_, i) => {
  const base = 27800 + i * 1.9 + Math.sin(i / 6) * 34 + Math.cos(i / 13) * 26;
  const open = base + Math.sin(i * 2.1) * 7;
  const close = base + Math.cos(i * 1.8) * 9;
  return { open, close, high: Math.max(open, close) + 5 + (i % 4), low: Math.min(open, close) - 5 - (i % 3), volume: 700 + (i * 47) % 900 };
});
function ema(values: number[], period: number) {
  const weight = 2 / (period + 1);
  let current = values[0];
  return values.map(value => current = current * (1 - weight) + value * weight);
}

export default function PublicTradingDashboard() {
  const [enabled, setEnabled] = useState<Study[]>(['ema13', 'ema48', 'vwap', 'swings']);
  const chart = useMemo(() => {
    const closes = bars.map(bar => bar.close);
    const min = Math.min(...bars.map(bar => bar.low)) - 15;
    const max = Math.max(...bars.map(bar => bar.high)) + 15;
    let totalPV = 0, totalVolume = 0;
    const vwap = bars.map(bar => { totalPV += ((bar.high + bar.low + bar.close) / 3) * bar.volume; totalVolume += bar.volume; return totalPV / totalVolume; });
    const gain = ema(closes.map((value, i) => i ? Math.max(0, value - closes[i - 1]) : 0), 14);
    const loss = ema(closes.map((value, i) => i ? Math.max(0, closes[i - 1] - value) : 0), 14);
    const rsi = gain.map((value, i) => loss[i] ? 100 - 100 / (1 + value / loss[i]) : 50);
    return { min, max, range: max - min, ema13: ema(closes, 13), ema48: ema(closes, 48), ema200: ema(closes, 200), vwap, rsi };
  }, []);
  const y = (price: number) => 366 - (price - chart.min) / chart.range * 270;
  const path = (values: number[]) => values.map((value, i) => `${i ? 'L' : 'M'}${42 + i * 8.1},${y(value)}`).join(' ');
  const toggle = (study: Study) => setEnabled(current => current.includes(study) ? current.filter(item => item !== study) : [...current, study]);

  return <main className="min-h-screen bg-[#080e19] px-4 py-8 text-slate-100 sm:px-8"><div className="mx-auto max-w-7xl">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 pb-5"><div><p className="text-xs font-bold uppercase tracking-[.25em] text-amber-400">WISE² / Supertrader</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Trading command center</h1></div><a href="/trading/desk" className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold hover:border-cyan-400">Private desk →</a></div>
    <div role="status" className="mb-5 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-100">Demonstration chart · Sample data · No live market feed or trading controls on this public page.</div>
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_270px]"><div className="overflow-hidden rounded-xl border border-slate-700 bg-[#0d1728] shadow-2xl"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 px-5 py-4"><div><h2 className="font-bold">NQ chart study lab</h2><p className="text-xs text-slate-400">Illustrative candles · EMA pullback and swing zones</p></div><span className="rounded border border-cyan-500/40 px-2 py-1 text-xs text-cyan-300">READ ONLY</span></div>
      <svg className="h-auto w-full" viewBox="0 0 850 490" role="img" aria-label="Illustrative NQ candlestick chart with selected indicators"><rect width="850" height="490" fill="#0d1728" />
        {[0, 1, 2, 3, 4].map(i => <g key={i}><line x1="35" x2="825" y1={95 + i * 68} y2={95 + i * 68} stroke="#27364c" /><text x="817" y={89 + i * 68} fill="#8798ae" textAnchor="end" fontSize="10">{(chart.max - i * chart.range / 4).toFixed(0)}</text></g>)}
        {enabled.includes('swings') && <g><rect x="390" y={y(Math.max(...bars.slice(43, 56).map(bar => bar.high)))} width="400" height="10" fill="#e37578" opacity=".19" /><rect x="480" y={y(Math.min(...bars.slice(58, 75).map(bar => bar.low)))} width="310" height="12" fill="#50bd99" opacity=".24" /></g>}
        {bars.map((bar, i) => { const x = 42 + i * 8.1, color = bar.close >= bar.open ? '#52c5ae' : '#e37578'; return <g key={i}><line x1={x} x2={x} y1={y(bar.high)} y2={y(bar.low)} stroke={color} /><rect x={x - 2.4} y={Math.min(y(bar.open), y(bar.close))} width="4.8" height={Math.max(1.5, Math.abs(y(bar.open) - y(bar.close)))} fill={color} /></g>; })}
        {(['ema13', 'ema48', 'ema200', 'vwap'] as const).filter(study => enabled.includes(study)).map(study => <path key={study} d={path(chart[study])} fill="none" stroke={colors[study]} strokeWidth={study === 'ema13' ? 2.4 : 1.8} />)}
        <line x1="35" x2="825" y1="395" y2="395" stroke="#35465d" />{bars.map((bar, i) => <rect key={i} x={40 + i * 8.1} y={447 - bar.volume / 45} width="4" height={bar.volume / 45} fill={bar.close >= bar.open ? '#52c5ae' : '#e37578'} opacity=".55" />)}
        {enabled.includes('rsi') && <g><rect x="36" y="455" width="785" height="30" fill="#172139" /><path d={chart.rsi.map((value, i) => `${i ? 'L' : 'M'}${42 + i * 8.1},${480 - value * .22}`).join(' ')} fill="none" stroke={colors.rsi} strokeWidth="1.5" /><text x="44" y="467" fill={colors.rsi} fontSize="9">RSI 14</text></g>}
      </svg></div>
      <div className="rounded-xl border border-slate-700 bg-[#101b2d] p-5"><h2 className="font-bold">Indicators</h2><p className="mb-5 mt-1 text-xs text-slate-400">Choose what to display. All calculations use sample data.</p><div className="space-y-2">{(Object.keys(names) as Study[]).map(study => <label key={study} className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-700 px-3 py-2 text-sm hover:border-slate-500"><span style={{ color: colors[study] }}>{names[study]}</span><input type="checkbox" checked={enabled.includes(study)} onChange={() => toggle(study)} aria-label={names[study]} /></label>)}</div><p className="mt-5 text-xs leading-relaxed text-slate-400">The linked TradingView script has protected source. These are independent EMA, VWAP and RSI calculations. Swing zones mark price pivots, not actual order-book liquidity.</p></div>
    </section></div></main>;
}
