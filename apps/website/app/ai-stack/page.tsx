import type { Metadata } from 'next';
import { architectureLayers, monthlyCostTiers, quickWins, retireTools, stackCategories } from './stack-data';

export const metadata: Metadata = {
  title: '2026 AI Tool Stack | WISE²',
  description: 'WISE² local-first AI, automation, infrastructure, observability, and business integration command map.',
};

const accent = ['cyan', 'blue', 'violet', 'green', 'amber', 'cyan', 'blue', 'cyan', 'violet'];

export default function AiStackPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#02070b] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(0,210,255,.12),transparent_34%),radial-gradient(circle_at_20%_70%,rgba(55,255,90,.08),transparent_28%)]" />
      <section className="relative mx-auto max-w-[1800px] px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-7 border-b border-cyan-400/30 pb-6 text-center">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[.38em] text-emerald-400">People × AI × Automation × Real World Results</div>
          <h1 className="bg-gradient-to-b from-white via-slate-100 to-slate-500 bg-clip-text text-4xl font-black uppercase tracking-tight text-transparent sm:text-6xl lg:text-7xl">WISE² <span className="text-cyan-300">2026 AI Tool Stack</span></h1>
          <p className="mt-3 text-sm font-bold uppercase tracking-[.3em] text-slate-300">Deployed. Verified. Optimized. Scaling.</p>
          <p className="mt-2 text-xs uppercase tracking-[.25em] text-emerald-400">One ecosystem. Every device. Real world impact.</p>
        </header>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-9">
          {stackCategories.map((category, index) => (
            <article key={category.title} className={`group rounded-xl border border-${accent[index]}-400/40 bg-slate-950/75 p-4 shadow-[0_0_24px_rgba(0,200,255,.08)] backdrop-blur transition hover:-translate-y-1 hover:border-cyan-300/80`}>
              <h2 className="text-sm font-black uppercase tracking-wide text-emerald-300">{category.title}</h2>
              <p className="mt-1 min-h-8 text-[10px] text-slate-400">{category.subtitle}</p>
              <ul className="mt-3 space-y-2 text-xs text-slate-200">
                {category.items.map((item) => <li key={item} className="border-b border-white/5 pb-1.5">{item}</li>)}
              </ul>
              <div className="mt-4 rounded-md border border-emerald-400/30 bg-emerald-400/5 px-2 py-2 text-[10px] font-bold uppercase text-emerald-300">✓ {category.status}</div>
            </article>
          ))}
        </div>

        <section className="mt-5 grid gap-4 xl:grid-cols-[1fr_2.1fr_1fr]">
          <div className="space-y-4">
            <Panel title="Quick Wins — This Week">
              <ol className="space-y-2 text-xs text-slate-200">{quickWins.map((item, index) => <li key={item} className="flex gap-2"><b className="text-emerald-400">{index + 1}</b><span>{item}</span></li>)}</ol>
            </Panel>
            <Panel title="Monthly Incremental Cost">
              <div className="grid grid-cols-3 gap-2">{monthlyCostTiers.map((tier) => <div key={tier.name} className="rounded-lg border border-cyan-400/20 bg-black/30 p-2"><div className="text-[10px] font-bold uppercase text-emerald-300">{tier.name}</div><div className="my-1 text-lg font-black text-cyan-300">{tier.range}</div><p className="text-[9px] leading-4 text-slate-400">{tier.detail}</p></div>)}</div>
            </Panel>
          </div>

          <Panel title="WISE² System Architecture — Local + Cloud Hybrid">
            <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-xl border border-cyan-400/20 bg-[radial-gradient(circle_at_center,rgba(0,220,255,.18),rgba(2,7,11,.35)_42%,rgba(2,7,11,.95)_72%)] p-5">
              <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(0,220,255,.2)_1px,transparent_1px),linear-gradient(90deg,rgba(0,220,255,.2)_1px,transparent_1px)] [background-size:36px_36px]" />
              <div className="relative z-10 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {architectureLayers.map(([name, detail]) => <div key={name} className="rounded-xl border border-cyan-300/50 bg-[#03131d]/90 p-5 text-center shadow-[0_0_30px_rgba(0,190,255,.12)]"><div className="font-black uppercase text-cyan-200">{name}</div><div className="mt-2 text-xs text-slate-400">{detail}</div></div>)}
                <div className="sm:col-span-2 lg:col-span-3 mx-auto rounded-full border-2 border-emerald-400/60 bg-black/80 px-10 py-5 text-center shadow-[0_0_45px_rgba(55,255,90,.18)]"><div className="text-2xl font-black">WISE² CORE</div><div className="text-[10px] uppercase tracking-[.25em] text-emerald-400">Context · Automate · Integrate · Scale</div></div>
              </div>
            </div>
          </Panel>

          <div className="space-y-4">
            <Panel title="Tools to Retire / Avoid" danger><ul className="space-y-2 text-xs text-slate-200">{retireTools.map((item) => <li key={item} className="flex gap-2"><span className="font-black text-red-400">×</span>{item}</li>)}</ul></Panel>
            <Panel title="Live Environment Status"><div className="grid grid-cols-2 gap-2 text-xs">{['VPS','API / Web','Database','Workers','Redis','Discord Bot','MCP Servers','CRM / Phone'].map((item) => <div key={item} className="flex items-center gap-2 rounded bg-white/[.03] p-2"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_currentColor]"/><span>{item}</span></div>)}</div><p className="mt-3 text-[10px] text-amber-300">Runtime indicators are presentation placeholders until wired to authenticated health endpoints.</p></Panel>
          </div>
        </section>

        <footer className="mt-5 flex flex-col justify-between gap-2 border-t border-cyan-400/20 pt-5 text-xs uppercase tracking-[.25em] text-slate-500 sm:flex-row"><span>WISE² United · Work Smarter. Go Further.</span><span className="text-cyan-300">wise2.net</span></footer>
      </section>
    </main>
  );
}

function Panel({ title, children, danger = false }: { title: string; children: React.ReactNode; danger?: boolean }) {
  return <section className={`rounded-xl border ${danger ? 'border-red-500/40' : 'border-emerald-400/35'} bg-slate-950/80 p-4 shadow-[0_0_24px_rgba(0,200,255,.06)]`}><h2 className={`mb-4 text-sm font-black uppercase tracking-wide ${danger ? 'text-red-400' : 'text-emerald-300'}`}>{title}</h2>{children}</section>;
}
