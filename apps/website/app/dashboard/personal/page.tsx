'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBrowserAuthToken } from '@/lib/auth-session';

const sections = [
  { title: 'Production server', detail: 'wise2 · Ubuntu · only authorized production host', status: 'Live health unverified', href: '/dashboard/operations' },
  { title: 'Hermes + Local AI', detail: 'Ollama first; Claude, Grok and Cursor on demand', status: 'Connections unverified', href: '/dashboard/operations' },
  { title: 'Calls + Messages', detail: 'Telnyx, WISE² email, Discord, owner SMS', status: 'Delivery tests pending', href: '/dashboard/operations' },
  { title: 'Client websites', detail: 'Landing page inventory, onboarding and repairs', status: 'Inventory in progress', href: 'https://github.com/dwise03-bit/wise2-core/issues/224' },
  { title: 'Deployment safety', detail: 'Build gates, secrets review and rollback', status: 'Repairs pending', href: 'https://github.com/dwise03-bit/wise2-core/issues/225' },
  { title: 'GTA VI Clipper', detail: 'Server-first media clipping workflow', status: 'Server deployment unverified', href: '/dashboard/operations' },
];
const agenda = [
  'Verify server, websites and communications',
  'Repair Telnyx calling and business email',
  'Connect Discord alerts and owner notifications',
  'Review GitHub project board and client onboarding',
  'Rehearse verified investor demos for Sunday, Nov 22',
];

export default function PersonalDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!getBrowserAuthToken()) router.replace('/login');
    else setReady(true);
  }, [router]);
  if (!ready) return <main className="min-h-screen bg-[#05080f] p-8 text-white">Checking session…</main>;
  return <main className="min-h-screen bg-[#05080f] px-5 py-8 text-white md:px-10">
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[.3em] text-cyan-400">WISE² / Personal Command</p>
          <h1 className="mt-2 text-4xl font-bold">Owner Dashboard</h1>
          <p className="mt-2 text-slate-400">Daniel + Darrin · One production server · Local AI first</p></div>
        <Link href="/dashboard/operations" className="rounded-xl border border-cyan-500/50 px-4 py-3 text-cyan-200">Operations center →</Link>
      </header>
      <section className="mb-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5"><p className="text-sm text-slate-400">Production hosts in scope</p><p className="mt-2 text-3xl font-bold">1</p><p className="text-xs text-slate-400">wise2 · health not yet verified</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5"><p className="text-sm text-slate-400">Investor deadline</p><p className="mt-2 text-3xl font-bold">Nov 22</p><p className="text-xs text-slate-400">Sunday · 2026</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5"><p className="text-sm text-slate-400">Verified service uptime</p><p className="mt-2 text-3xl font-bold">—</p><p className="text-xs text-amber-300">Awaiting server telemetry</p></div>
      </section>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section><h2 className="mb-4 text-xl font-semibold">Your systems</h2><div className="grid gap-3 sm:grid-cols-2">
          {sections.map(s => <Link key={s.title} href={s.href} className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-cyan-500/50">
            <h3 className="font-semibold text-white">{s.title}</h3><p className="mt-2 text-sm text-slate-400">{s.detail}</p><p className="mt-4 text-xs text-amber-300">{s.status}</p>
          </Link>)}
        </div></section>
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5"><h2 className="text-xl font-semibold">Morning execution brief</h2>
          <p className="mt-2 text-sm text-slate-400">Priority queue · Friday, Nov 20</p>
          <ol className="mt-5 space-y-4">{agenda.map((item,i)=><li key={item} className="flex gap-3 text-sm"><span className="font-bold text-cyan-300">{String(i+1).padStart(2,'0')}</span><span>{item}</span></li>)}</ol>
          <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
            <a href="https://github.com/dwise03-bit/wise2-core/issues/224" className="block text-sm text-cyan-300 underline">Site inventory and audit tracker</a>
            <a href="https://github.com/dwise03-bit/wise2-core/issues/225" className="block text-sm text-cyan-300 underline">Deployment security tracker</a>
          </div>
          <p className="mt-5 text-xs text-slate-400">SMS, Discord, live GitHub Projects sync and repair actions are not yet connected. No fake uptime or revenue data is displayed.</p>
        </section>
      </div>
    </div>
  </main>;
}
