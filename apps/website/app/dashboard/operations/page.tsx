'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBrowserAuthToken } from '@/lib/auth-session';

const workstreams = [
  { name: 'Single Ubuntu production server', state: 'Audit pending', detail: 'Only wise2 is in production scope. Historic VPS hosts excluded.', url: 'https://github.com/dwise03-bit/wise2-core/issues/224' },
  { name: 'Deployment safety and secret defaults', state: 'Repair pending', detail: 'Legacy workflow bypasses test failures; credentials and routing need review.', url: 'https://github.com/dwise03-bit/wise2-core/issues/225' },
  { name: 'Landing pages and client onboarding', state: 'Inventory pending', detail: 'Reconcile live URLs, repositories, client owners and existing Projects board.', url: 'https://github.com/dwise03-bit/wise2-core/issues/224' },
  { name: 'Telnyx, business email and Discord', state: 'Verification pending', detail: 'Do not claim SMS, calling or mail delivery is live without end-to-end tests.', url: 'https://github.com/dwise03-bit/wise2-core/issues/224' },
  { name: 'Hermes and local Ollama', state: 'Verification pending', detail: 'Local AI on wise2 preferred; confirm service health and model availability.', url: 'https://github.com/dwise03-bit/wise2-core/issues/224' },
  { name: 'Sunday investor demonstration', state: 'Preparation', detail: 'Demonstrate verified features only; document blockers and fallbacks.', url: 'https://github.com/dwise03-bit/wise2-core/issues/224' },
];

export default function OperationsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  useEffect(() => {
    if (!getBrowserAuthToken()) router.replace('/login');
    else setAuthorized(true);
  }, [router]);
  if (!authorized) return <main className="min-h-screen bg-[#050607] p-8 text-white">Checking session…</main>;
  return (
    <main className="min-h-screen bg-[#050607] px-5 py-10 text-white md:px-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/dashboard" className="text-sm text-cyan-300 hover:underline">← Dashboard</Link>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[.3em] text-cyan-400">WISE² / Owner Operations</p>
        <h1 className="mt-3 text-3xl font-bold md:text-5xl">Single-Server Command Center</h1>
        <p className="mt-4 max-w-3xl text-slate-300">Investor readiness, client onboarding and repair tracking. This view is sourced from recorded GitHub audit work, not live server telemetry.</p>
        <div className="mt-7 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
          LIVE HEALTH NOT VERIFIED · The wise2 server audit has not run. Status labels below are workflow states, not uptime claims.
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ['Production servers', '1', 'Ubuntu wise2 only'],
            ['Confirmed GitHub audit issues', '2', '#224 inventory · #225 deployment safety'],
            ['Investor deadline', 'Sun Nov 22', 'Verification required before demo'],
          ].map(([label,value,note]) => <div key={label} className="rounded-xl border border-cyan-900 bg-slate-950 p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-3xl font-bold text-cyan-300">{value}</p><p className="mt-2 text-xs text-slate-400">{note}</p></div>)}
        </div>
        <h2 className="mt-10 text-xl font-semibold">Execution board</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {workstreams.map(item => <a key={item.name} href={item.url} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-slate-700 bg-slate-900/60 p-5 transition hover:border-cyan-500">
            <div className="flex items-start justify-between gap-3"><h3 className="font-semibold">{item.name}</h3><span className="shrink-0 rounded-full border border-amber-700 px-2 py-1 text-xs text-amber-300">{item.state}</span></div>
            <p className="mt-3 text-sm text-slate-300">{item.detail}</p>
            <p className="mt-4 text-xs text-cyan-300">Open GitHub tracker ↗</p>
          </a>)}
        </div>
        <p className="mt-8 text-xs text-slate-500">This is a tracking view, not a GitHub Projects synchronization or repair executor. No automatic restarts, credentials, or external alerts are triggered here.</p>
      </div>
    </main>
  );
}
