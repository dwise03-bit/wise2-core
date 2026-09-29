import Link from 'next/link';
import { ArrowRight, Circle, TrendingUp } from 'lucide-react';

const signals = [
  ['PIPELINE', '$184K', 'active opportunity'],
  ['PROJECTED', '$62K', 'next 30 days'],
  ['CONVERSION', '28%', 'qualified to close'],
  ['MOMENTUM', '+14%', 'vs. prior period'],
];

export default function RevenueDashboardPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-[#f5f7f2] lg:px-10">
      <div className="mx-auto max-w-[1320px]">
        <header className="flex flex-wrap items-center justify-between gap-5 border-b border-white/10 pb-8">
          <Link href="/" className="text-xl font-black tracking-[-.08em]">WISE<sup className="text-[#b9ff00]">²</sup></Link>
          <div className="flex items-center gap-3 text-[10px] font-bold tracking-[.18em] text-white/50"><Circle size={8} fill="#b9ff00" className="text-[#b9ff00]" /> REVENUE COMMAND / LIVE</div>
          <Link href="/audit" className="inline-flex min-h-11 items-center gap-2 bg-[#b9ff00] px-4 py-3 text-[10px] font-black tracking-[.14em] text-black">BUILD WITH WISE² <ArrowRight size={14} /></Link>
        </header>
        <section className="py-20">
          <p className="text-[10px] font-bold tracking-[.22em] text-[#b9ff00]">WISE² UNITED / COMMERCIAL INTELLIGENCE</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black uppercase leading-[.92] tracking-[-.07em] md:text-8xl">See the work.<br /><span className="text-white/35">Move the revenue.</span></h1>
          <p className="mt-8 max-w-xl text-base leading-7 text-white/60">A clear operating view for opportunities, delivery, and the next decision. Connect the signal to the action.</p>
        </section>
        <section className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {signals.map(([label, value, detail]) => <div key={label} className="bg-[#0e1015] p-7"><p className="text-[10px] font-bold tracking-[.18em] text-white/40">{label}</p><p className="mt-8 text-4xl font-black tracking-[-.06em] text-[#b9ff00]">{value}</p><p className="mt-2 text-sm text-white/45">{detail}</p></div>)}
        </section>
        <section className="mt-16 grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
          <div className="border border-white/10 bg-[#0e1015] p-8 lg:p-10"><div className="flex items-center justify-between"><h2 className="text-sm font-black tracking-[.16em]">MOMENTUM SIGNAL</h2><TrendingUp className="text-[#b9ff00]" size={20} /></div><div className="mt-12 flex h-48 items-end gap-3 border-b border-white/10">{[34,48,42,67,60,76,72,94].map((height, index) => <div key={index} className="flex-1 bg-[#b9ff00] opacity-80" style={{ height: `${height}%` }} />)}</div><p className="mt-5 text-xs text-white/45">Qualified opportunities are moving through one visible system.</p></div>
          <div className="border border-white/10 bg-[#b9ff00] p-8 text-black lg:p-10"><p className="text-[10px] font-black tracking-[.18em]">NEXT DECISION</p><h2 className="mt-8 text-3xl font-black uppercase leading-none tracking-[-.05em]">Turn your scattered signals into a system.</h2><Link href="/audit" className="mt-10 inline-flex min-h-11 items-center gap-2 border border-black/30 px-4 py-3 text-[10px] font-black tracking-[.14em]">START A BUSINESS AUDIT <ArrowRight size={14} /></Link></div>
        </section>
      </div>
    </main>
  );
}
