'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, ArrowUpRight, Bot, BriefcaseBusiness, Clapperboard, Cpu, Gamepad2, Globe2, RadioTower, Shield, TrendingUp, Wrench } from 'lucide-react';
import { getBrowserAuthToken } from '@/lib/auth-session';

const modules = [
  { name: 'WISE² Connect', group: 'Business OS', desc: 'Team conversations, capture, audits and collaboration', icon: RadioTower, accent: 'emerald', href: '/dashboard/operations' },
  { name: 'HVAC World + IMP', group: 'Field Intelligence', desc: 'Equipment diagnostics, digital twins and technician workflows', icon: Wrench, accent: 'cyan', href: '/dashboard/operations' },
  { name: 'Atlanta Command', group: 'Expansion', desc: 'Megan, Mathis Electric and the Atlanta partner pipeline', icon: BriefcaseBusiness, accent: 'amber', href: '/dashboard/operations' },
  { name: 'WISE² Defense / Nightwing', group: 'Security', desc: 'Offline-first edge intelligence and training concepts', icon: Shield, accent: 'rose', href: '/dashboard/operations' },
  { name: 'Codex Flex Live', group: 'Media & Sound', desc: 'Production, artists, live shows and sound lab', icon: Clapperboard, accent: 'violet', href: '/dashboard/operations' },
  { name: 'WISE² CarTools', group: 'Games', desc: 'Original game universe and Android / iPad builds', icon: Gamepad2, accent: 'fuchsia', href: '/dashboard/operations' },
  { name: 'WISE² IMPS', group: 'Devices & Bots', desc: 'Pocket Node, ESP32 and connected assistant characters', icon: Cpu, accent: 'blue', href: '/dashboard/operations' },
  { name: 'Hermes + Ollama', group: 'AI Orchestration', desc: 'Local-first assistants and workflow coordination', icon: Bot, accent: 'cyan', href: '/dashboard/operations' },
  { name: 'WISE² Trading', group: 'Trading', desc: 'Unified futures research and evaluation workspace', icon: TrendingUp, accent: 'amber', href: '/dashboard/operations' },
  { name: 'Client Sites', group: 'Delivery', desc: 'Landing pages, onboarding, CRM and service operations', icon: Globe2, accent: 'emerald', href: 'https://github.com/dwise03-bit/wise2-core/issues/224' },
];
const accent: Record<string,string> = {
  emerald: 'border-emerald-500/30 text-emerald-300', cyan: 'border-cyan-500/30 text-cyan-300',
  amber: 'border-amber-500/30 text-amber-300', rose: 'border-rose-500/30 text-rose-300',
  violet: 'border-violet-500/30 text-violet-300', fuchsia: 'border-fuchsia-500/30 text-fuchsia-300',
  blue: 'border-blue-500/30 text-blue-300',
};
const priorities = [
  { title: 'Single-server infrastructure audit', issue: '#224', href: 'https://github.com/dwise03-bit/wise2-core/issues/224' },
  { title: 'Harden deployment and credential defaults', issue: '#225', href: 'https://github.com/dwise03-bit/wise2-core/issues/225' },
  { title: 'Verify calling, email and owner alerts', issue: 'Pending', href: '/dashboard/operations' },
  { title: 'Reconcile client pages and investor demo', issue: 'Pending', href: '/dashboard/operations' },
];

export default function PersonalDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  useEffect(() => {
    if (getBrowserAuthToken()) setAuthorized(true);
    else router.replace('/login');
  }, [router]);
  if (!authorized) return <main className="min-h-screen bg-[#030711] p-8 text-white">Checking session…</main>;
  return <main className="min-h-screen bg-[#030711] text-slate-100">
    <div className="pointer-events-none fixed inset-0 opacity-50" style={{ background: 'radial-gradient(ellipse at 75% 0%,rgba(0,148,255,.16),transparent 55%),radial-gradient(ellipse at 15% 70%,rgba(0,255,163,.08),transparent 45%)' }} />
    <div className="relative mx-auto max-w-7xl px-4 py-7 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-5 border-b border-cyan-500/20 pb-6">
        <div><p className="text-xs font-semibold tracking-[.32em] text-cyan-400">WISE² / EAZY PERSONAL COMMAND</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl"><span className="bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">WISE²</span> <span className="text-emerald-300">UNITED</span></h1>
          <p className="mt-2 text-sm text-slate-400">Owner cockpit · Eazy + Darrin · People × Ideas × Action × Results</p></div>
        <Link href="/dashboard/operations" className="rounded-xl border border-cyan-400/50 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/20">Operations Center ↗</Link>
      </header>
      <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-200">Operational status is not live telemetry. Service uptime, project deployments, and integrations remain unverified until audited.</div>
      <section aria-label="Executive snapshot" className="mt-6 grid gap-3 sm:grid-cols-3">
        {[['01','Production server','wise2 · Ubuntu only'],['NOV 22','Investor readiness','Sunday presentation'],['—','Verified uptime','Awaiting live audit']].map(([value,title,subtitle])=>
          <div key={title} className="rounded-2xl border border-cyan-500/25 bg-[#0b1728]/90 p-5 shadow-[inset_0_1px_0_rgba(125,211,252,.12)]">
            <div className="text-3xl font-black text-cyan-300">{value}</div><h2 className="mt-2 font-semibold">{title}</h2><p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          </div>)}
      </section>
      <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">The WISE² ecosystem</h2><span className="text-xs text-slate-400">10 interconnected workspaces</span></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {modules.map(({name,group,desc,icon:Icon,accent:color,href})=>
              <Link key={name} href={href} className={'group rounded-2xl border bg-[#0a1424]/90 p-5 transition hover:bg-[#10243a] '+accent[color]}>
                <div className="flex items-center justify-between"><Icon size={27} aria-hidden="true"/><ArrowUpRight size={17} className="opacity-60 transition group-hover:opacity-100"/></div>
                <p className="mt-5 text-[10px] font-semibold uppercase tracking-[.2em] opacity-75">{group}</p><h3 className="mt-1 text-lg font-bold text-white">{name}</h3><p className="mt-2 text-sm leading-relaxed text-slate-400">{desc}</p>
              </Link>)}
          </div>
        </section>
        <aside className="space-y-5">
          <section className="rounded-2xl border border-emerald-500/30 bg-[#0a1721] p-5">
            <div className="flex items-center gap-2 text-emerald-300"><Activity size={19}/><h2 className="font-bold">Network command</h2></div>
            <p className="mt-3 text-sm text-slate-300">One production server. Edge devices and developer machines remain separate from hosting.</p>
            <p className="mt-4 text-xs text-amber-300">Health: audit pending</p>
            <Link href="/dashboard/operations" className="mt-4 inline-block text-sm text-cyan-300 underline">View audit workstream</Link>
          </section>
          <section className="rounded-2xl border border-amber-500/25 bg-[#111723] p-5">
            <h2 className="font-bold">Executive priorities</h2><div className="mt-4 space-y-4">
              {priorities.map((item,i)=><a key={item.title} href={item.href} className="flex items-start gap-3 text-sm hover:text-cyan-300">
                <span className="font-mono text-amber-300">{String(i+1).padStart(2,'0')}</span>
                <span className="flex-1">{item.title}<span className="mt-1 block text-xs text-slate-500">{item.issue}</span></span><ArrowUpRight size={15}/>
              </a>)}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-700 bg-[#0c1420] p-5"><h2 className="font-bold">Command rules</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">Local AI first. One production host. Audit → fix → test → independently verify. Never mistake a visual mockup for a deployed system.</p>
          </section>
        </aside>
      </div>
      <footer className="mt-9 border-t border-cyan-500/20 py-5 text-xs text-slate-500">WISE² Business OS · Eazy Personal Command · Repository-backed module inventory · Live integrations pending</footer>
    </div>
  </main>;
}
