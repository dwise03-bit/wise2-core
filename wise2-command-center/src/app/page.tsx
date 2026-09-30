'use client';

import Link from 'next/link';
import { useState } from 'react';

const capabilities = [
  ['01', 'Brand systems', 'Keep every surface unmistakably yours.', 'cyan'],
  ['02', 'Customer intelligence', 'Turn signals into the next best move.', 'green'],
  ['03', 'Agent workflows', 'Move from intent to execution with control.', 'cyan'],
  ['04', 'GPU infrastructure', 'Know what is running, where, and why.', 'green'],
] as const;

const actions = [
  { label: 'Build', detail: 'Open a new workstream', icon: '＋', tone: 'cyan' },
  { label: 'Automate', detail: 'Create an operating loop', icon: '↗', tone: 'green' },
  { label: 'Scale', detail: 'Review system capacity', icon: '⌁', tone: 'cyan' },
] as const;

export default function Home() {
  const [activeAction, setActiveAction] = useState('');

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050607] px-4 py-5 text-[#d1d5db] sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-30 [background-image:linear-gradient(rgba(0,217,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,217,255,.08)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />
      <div className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[34rem] w-[34rem] rounded-full bg-[#00d9ff]/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 -z-10 h-80 w-80 rounded-full bg-[#00ff7f]/5 blur-[110px]" />
      <div className="mx-auto max-w-[1420px]">
        <header className="flex items-center justify-between border-b border-white/10 py-5">
          <Link href="/" className="group flex items-center gap-3" aria-label="WISE² home"><span className="grid h-11 w-11 place-items-center rounded-2xl border border-[#00d9ff]/40 bg-[#00d9ff]/10 text-lg font-bold text-[#00d9ff] shadow-[0_0_30px_rgba(0,217,255,.12)] transition group-hover:border-[#00ff7f]/60">W²</span><span><strong className="block text-sm tracking-[.24em] text-white">WISE²</strong><small className="block text-[10px] uppercase tracking-[.3em] text-[#00d9ff]">Command Center</small></span></Link>
          <nav className="hidden items-center gap-7 text-[11px] uppercase tracking-[.18em] text-[#86939d] md:flex"><Link className="transition hover:text-white" href="/dashboard">Overview</Link><Link className="transition hover:text-white" href="/woji">WOJI</Link><Link className="transition hover:text-white" href="/demo">Demo</Link></nav>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[.18em] text-[#8ee7bb]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#00ff7f] shadow-[0_0_12px_#00ff7f]" /> All systems online</div>
        </header>

        <section className="grid min-h-[650px] items-center gap-14 py-16 lg:grid-cols-[1.2fr_.8fr] lg:py-24">
          <div><div className="mb-7 flex items-center gap-3 text-[10px] uppercase tracking-[.3em] text-[#00d9ff]"><span className="h-px w-10 bg-[#00d9ff]" /> Business operating system / 01</div><h1 className="max-w-4xl text-6xl font-semibold leading-[.93] tracking-[-.07em] text-[#eef2f4] sm:text-7xl lg:text-[clamp(5rem,9vw,9.2rem)]">Move the whole <span className="block text-[#00ff7f]">business as one.</span></h1><p className="mt-8 max-w-xl text-base leading-8 text-[#8b969e] sm:text-lg">One synchronized command surface for brand, customers, automation, content, and intelligence. See the signal. Make the call. Keep moving.</p><div className="mt-10 flex flex-col gap-3 sm:flex-row"><Link href="/woji" className="group inline-flex items-center justify-center gap-4 rounded-full bg-[#00d9ff] px-7 py-4 text-sm font-bold text-[#031014] shadow-[0_0_35px_rgba(0,217,255,.2)] transition hover:-translate-y-1 hover:bg-[#55e8ff]">Enter WOJI control <span className="transition group-hover:translate-x-1">→</span></Link><Link href="/dashboard" className="inline-flex items-center justify-center gap-3 rounded-full border border-white/15 bg-white/[.03] px-7 py-4 text-sm font-semibold text-white transition hover:border-[#00ff7f]/50 hover:bg-[#00ff7f]/10">Open live overview <span className="text-[#00ff7f]">↗</span></Link></div><div className="mt-12 grid max-w-xl grid-cols-3 border-y border-white/10 py-5">{[['04', 'systems'], ['24/7', 'visibility'], ['01', 'source of truth']].map(([value, label]) => <div key={label} className="border-r border-white/10 pl-0 last:border-0 last:pl-4 first:pl-0 sm:pl-5"><strong className="block text-xl text-white">{value}</strong><span className="mt-1 block text-[9px] uppercase tracking-[.2em] text-[#6e7b84]">{label}</span></div>)}</div></div>

          <aside className="relative mx-auto w-full max-w-[460px] lg:mt-12"><div className="absolute -inset-5 rounded-[2rem] border border-[#00d9ff]/10 bg-[#00d9ff]/[.03]" /><div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#0a1015]/90 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl"><div className="flex items-center justify-between border-b border-white/10 pb-5"><div><p className="text-[10px] uppercase tracking-[.24em] text-[#00d9ff]">Live network</p><p className="mt-1 text-sm text-white">WISE² / core mesh</p></div><span className="rounded-full border border-[#00ff7f]/30 bg-[#00ff7f]/10 px-3 py-1 text-[9px] font-bold tracking-[.18em] text-[#7dffb8]">ONLINE</span></div><div className="relative my-8 grid place-items-center"><div className="absolute h-48 w-48 animate-pulse rounded-full border border-[#00d9ff]/20 shadow-[0_0_70px_rgba(0,217,255,.12)]" /><div className="absolute h-32 w-32 rounded-full border border-[#00ff7f]/25" /><div className="grid h-24 w-24 place-items-center rounded-full border border-[#00d9ff]/50 bg-[#00d9ff]/10 text-3xl font-semibold text-white shadow-[0_0_35px_rgba(0,217,255,.28)]">W²</div></div><div className="grid grid-cols-2 gap-2">{[['MAC NODE', 'READY', 'cyan'], ['VPS', 'HEALTHY', 'green'], ['AI MESH', 'READY', 'cyan'], ['AUTOMATION', '3 ACTIVE', 'green']].map(([label, value, tone]) => <div key={label} className="rounded-xl border border-white/10 bg-white/[.035] p-3"><span className="block text-[9px] tracking-[.16em] text-[#687680]">{label}</span><strong className={`mt-2 block text-xs ${tone === 'green' ? 'text-[#7dffb8]' : 'text-[#72e8ff]'}`}>{value}</strong></div>)}</div><div className="mt-4 flex items-center justify-between rounded-xl border border-[#00d9ff]/15 bg-[#00d9ff]/[.05] px-3 py-3 text-[10px] text-[#8e9ca4]"><span>Last sync</span><span className="font-mono text-[#d1d5db]">just now · 99.98%</span></div></div></aside>
        </section>

        <section className="border-t border-white/10 py-12"><div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-[10px] uppercase tracking-[.3em] text-[#00d9ff]">Start anywhere</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.03em] text-white">Turn intent into motion.</h2></div><p className="max-w-sm text-xs leading-5 text-[#77848c]">Every entry point is connected to the same operating picture.</p></div><div className="grid gap-3 md:grid-cols-3">{actions.map((action) => <button key={action.label} type="button" onClick={() => setActiveAction(action.label)} className={`group flex items-center justify-between rounded-2xl border p-5 text-left transition hover:-translate-y-1 ${action.tone === 'green' ? 'border-[#00ff7f]/20 bg-[#00ff7f]/[.04] hover:border-[#00ff7f]/60' : 'border-[#00d9ff]/20 bg-[#00d9ff]/[.04] hover:border-[#00d9ff]/60'}`}><span><strong className="block text-lg text-white">{action.label}</strong><span className="mt-1 block text-xs text-[#7d8991]">{activeAction === action.label ? 'Workspace queued — choose a destination' : action.detail}</span></span><span className={`grid h-11 w-11 place-items-center rounded-xl border text-xl transition group-hover:rotate-12 ${action.tone === 'green' ? 'border-[#00ff7f]/30 text-[#7dffb8]' : 'border-[#00d9ff]/30 text-[#72e8ff]'}`}>{action.icon}</span></button>)}</div></section>

        <section className="border-t border-white/10 py-12"><div className="mb-6 flex items-end justify-between"><div><p className="text-[10px] uppercase tracking-[.3em] text-[#00d9ff]">Integrated capabilities</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.03em] text-white">One system. Many levers.</h2></div><span className="hidden text-[10px] uppercase tracking-[.2em] text-[#55636c] sm:block">WISE² / 2026</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{capabilities.map(([number, title, detail, tone]) => <div key={title} className="group rounded-2xl border border-white/10 bg-white/[.025] p-5 transition hover:border-white/25 hover:bg-white/[.05]"><div className="flex items-start justify-between"><span className={`text-xs ${tone === 'green' ? 'text-[#7dffb8]' : 'text-[#72e8ff]'}`}>{number}</span><span className="text-white/30 transition group-hover:text-white">↗</span></div><h3 className="mt-9 text-sm font-semibold text-white">{title}</h3><p className="mt-2 text-xs leading-5 text-[#77848c]">{detail}</p></div>)}</div></section>
        <footer className="flex flex-col gap-4 border-t border-white/10 py-7 text-[10px] uppercase tracking-[.18em] text-[#58656d] sm:flex-row sm:items-center sm:justify-between"><span>WISE² command center / systems online</span><span>Built to move at the speed of intent.</span></footer>
      </div>
    </main>
  );
}
