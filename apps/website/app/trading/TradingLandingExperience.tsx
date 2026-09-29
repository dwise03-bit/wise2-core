'use client';

import Link from 'next/link';

const pulse = [
  ['S&P 500', '5,732', '+1.24%', 'text-emerald-400'],
  ['NASDAQ', '18,402', '+1.68%', 'text-emerald-400'],
  ['BTC', '84,302', '-2.29%', 'text-rose-400'],
];

const movers = [
  ['NVDA', '$876.32', '+4.21%'],
  ['TSLA', '$245.18', '+3.76%'],
  ['AMD', '$162.14', '+2.98%'],
];

const nav = ['Home', 'Markets', 'Chart', 'AI Coach', 'Portfolio'];

export function TradingLandingExperience() {
  return (
    <main className="min-h-screen bg-[#020711] pb-28 text-white">
      <section className="relative overflow-hidden border-b border-[#128cff]/20 bg-[radial-gradient(circle_at_70%_0%,rgba(0,132,255,.25),transparent_38%),linear-gradient(180deg,#061426_0%,#020711_100%)]">
        <div className="mx-auto max-w-7xl px-5 pb-10 pt-8 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[.34em] text-[#27d7ff]">SJS Trading · by WISE²</p>
              <h1 className="mt-2 text-4xl font-black italic tracking-tight sm:text-6xl">SJS <span className="text-[#169cff]">TRADING</span></h1>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[.24em] text-slate-300">Your AI trading assistant</p>
            </div>
            <div className="rounded-2xl border border-[#ff9b3d]/60 bg-[#1b1f26]/95 px-5 py-3 text-right shadow-2xl">
              <p className="font-black uppercase tracking-[.12em]">Pre-market · opens soon</p>
              <p className="mt-1 text-sm font-black uppercase tracking-[.18em] text-[#27d7ff]">Paper only</p>
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-5">
            {['Real-time charts','AI assistant guidance','Learn to trade','Smart alerts','Watchlists & scans'].map(x => (
              <div key={x} className="rounded-2xl border border-[#168fff]/25 bg-[#07111f]/80 p-4 text-sm font-bold">{x}</div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-7 px-5 py-7 sm:px-8">
        <section>
          <p className="mb-3 text-sm font-black uppercase tracking-[.28em] text-slate-400">Market Pulse</p>
          <div className="grid grid-cols-3 gap-3">
            {pulse.map(([name,value,move,color]) => (
              <article key={name} className="rounded-3xl border border-white/5 bg-[#050b18] p-5">
                <p className="font-bold text-slate-400">{name}</p><p className="mt-2 text-2xl font-black">{value}</p>
                <p className={"mt-1 text-lg font-black "+color}>{move}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
          <article className="rounded-3xl border border-[#118cff]/30 bg-[#050b18] p-6">
            <div className="flex items-center justify-between"><div><p className="text-2xl font-black text-[#27d7ff]">✦ PLOT AI</p><p className="mt-1 text-sm text-slate-400">Trading coach · setup explainer · risk guide</p></div><span className="font-black text-emerald-400">READY</span></div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-[#091426] p-5 text-slate-200">Ask about a chart, a setup, candlesticks, risk, or what a market move means. PLOT explains the reasoning instead of telling you what to buy.</div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {['Explain chart','Good entry?','What is this pattern?','Build watchlist'].map(x=><button key={x} className="rounded-xl border border-[#168fff]/40 bg-[#07111f] px-3 py-3 text-xs font-bold">{x}</button>)}
            </div>
          </article>
          <article className="rounded-3xl border border-white/10 bg-[#050b18] p-6">
            <p className="text-sm font-black uppercase tracking-[.22em] text-slate-400">Top Movers</p>
            <div className="mt-4 space-y-4">{movers.map(([s,p,m])=><div key={s} className="flex items-center justify-between border-b border-white/5 pb-3"><b>{s}</b><span className="text-slate-300">{p}</span><b className="text-emerald-400">{m}</b></div>)}</div>
          </article>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Charts','Simple candles, timeframe controls, indicators and AI explanations.'],
            ['Learn','Beginner-first lessons for candlesticks, indicators, risk and options.'],
            ['Watchlists','Track symbols, scan movers and create custom alerts.'],
            ['Portfolio','Paper positions, performance, risk and trade journal.'],
          ].map(([t,d])=><article key={t} className="rounded-3xl border border-white/10 bg-[#050b18] p-5"><p className="text-lg font-black text-[#27d7ff]">{t}</p><p className="mt-2 text-sm leading-6 text-slate-400">{d}</p></article>)}
        </section>

        <section className="rounded-3xl border border-[#168fff]/25 bg-[#050b18] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xl font-black">Trade / Order Ticket</p><p className="mt-1 text-sm text-slate-400">Paper execution with take-profit and stop-loss planning.</p></div><span className="rounded-full border border-[#27d7ff]/30 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-[#27d7ff]">Simulation only</span></div>
        </section>
      </div>

      <nav className="fixed bottom-5 left-1/2 z-50 w-[min(94vw,720px)] -translate-x-1/2 rounded-[2rem] border border-slate-500/50 bg-[#111827]/95 p-2 shadow-2xl backdrop-blur-xl">
        <div className="grid grid-cols-5 gap-1">{nav.map((x,i)=><Link key={x} href={i===0?'/trading':'#'} className={"rounded-2xl px-2 py-3 text-center text-xs font-black sm:text-sm "+(i===0?'bg-[#263244] text-[#27d7ff]':'text-slate-100')}>{x}</Link>)}</div>
      </nav>
    </main>
  );
}
