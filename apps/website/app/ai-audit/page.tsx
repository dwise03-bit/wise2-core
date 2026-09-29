import Link from 'next/link';
import { ArrowRight, BarChart3, CheckCircle2, Workflow } from 'lucide-react';

export const metadata = {
  title: 'Free AI Business Audit Snapshot | WISE²',
  description: 'Find the highest-leverage AI and workflow opportunities in your business in minutes.',
};

export default function AiAuditPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050607] text-white">
      <section className="relative border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(0,148,255,0.22),transparent_32%),linear-gradient(120deg,rgba(57,255,20,0.13),transparent_46%)]" />
        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="max-w-4xl">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-[#39FF14]">WISE² Business Diagnostics</p>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.96] sm:text-7xl">Find the work your business should stop doing manually.</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#C7D0DB] sm:text-xl">
              Get a free AI opportunity snapshot built around your workflows, tools, and growth bottlenecks. No software pitch before you see the findings.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/ai-audit/start" className="inline-flex min-h-13 items-center gap-3 bg-[#39FF14] px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#050607] transition hover:-translate-y-0.5 hover:bg-[#C7FF2E]">
                Get my free snapshot <ArrowRight size={17} />
              </Link>
              <span className="text-sm text-[#8D98A5]">Takes about 3 minutes</span>
            </div>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            {[
              { icon: BarChart3, title: 'Score the gaps', text: 'See where follow-up, operations, service, and reporting are leaking capacity.' },
              { icon: Workflow, title: 'Name the moves', text: 'Get practical opportunities mapped to capabilities WISE² can actually build.' },
              { icon: CheckCircle2, title: 'Choose your next step', text: 'Leave with a focused direction, not a 40-page generic AI report.' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="border border-white/10 bg-[#0A0E12]/85 p-6">
                <Icon className="h-6 w-6 text-[#39FF14]" />
                <h2 className="mt-5 text-lg font-bold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#AAB5C2]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#0094FF]">What happens next</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-black sm:text-5xl">A useful snapshot first. A paid deep-dive only when it makes sense.</h2>
          </div>
          <ol className="space-y-5 border-l border-[#39FF14]/40 pl-6 text-sm text-[#C7D0DB]">
            <li><strong className="text-white">01. You answer a few focused questions.</strong><br />We look at how work actually moves through your business.</li>
            <li><strong className="text-white">02. You get your opportunity snapshot.</strong><br />Findings are estimates, not promises, and the scoring works without cloud AI.</li>
            <li><strong className="text-white">03. You choose the right depth.</strong><br />Upgrade to the $149 live audit for a full report and 90-day roadmap, or start with the recommended next move.</li>
          </ol>
        </div>
      </section>
    </main>
  );
}