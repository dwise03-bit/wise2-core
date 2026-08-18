import Link from 'next/link';
import { digitalTwinAutonomyLevels, digitalTwinCommandCenterTabs, digitalTwinOnboardingSteps } from '@/lib/digital-twin';

export default function DigitalTwinHowItWorksPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-6 pb-20 pt-28 text-[#F4EBDD]">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-[#39FF14]">How It Works</p>
            <h1 className="mt-4 text-5xl font-black uppercase leading-none md:text-7xl">
              From payment to activation.
            </h1>
            <p className="mt-6 text-lg leading-8 text-[#d6ccbc]">
              The Digital Twin lifecycle stays attached to the tenant that purchased it: payment, onboarding, consent, knowledge ingestion, testing, approval, activation, Revenue OS handoff, and reporting.
            </p>
          </div>

          <section className="mt-16 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-[#39FF14]/18 bg-white/[0.03] p-8">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-[#39FF14]">Lifecycle</p>
              <ol className="mt-8 space-y-5">
                {digitalTwinOnboardingSteps.map((step, index) => (
                  <li key={step.id} className="flex gap-5 rounded-2xl border border-[#F4EBDD]/10 bg-black/20 p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#39FF14]/14 text-sm font-black text-[#39FF14]">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <p className="text-xl font-black uppercase text-[#F4EBDD]">{step.label}</p>
                      <p className="mt-2 text-sm leading-7 text-[#c9bfaf]">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="space-y-8">
              <div className="rounded-[2rem] border border-[#F4EBDD]/10 bg-white/[0.03] p-8">
                <p className="text-sm font-black uppercase tracking-[0.24em] text-[#39FF14]">Command Center</p>
                <h2 className="mt-3 text-3xl font-black uppercase">Operational tabs</h2>
                <div className="mt-6 flex flex-wrap gap-3">
                  {digitalTwinCommandCenterTabs.map((tab) => (
                    <span key={tab} className="rounded-full border border-[#F4EBDD]/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#ddd3c2]">
                      {tab}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-[#F4EBDD]/10 bg-white/[0.03] p-8">
                <p className="text-sm font-black uppercase tracking-[0.24em] text-[#39FF14]">Operating Modes</p>
                <div className="mt-6 space-y-4">
                  {digitalTwinAutonomyLevels.map((level) => (
                    <div key={level.id} className="rounded-2xl border border-[#F4EBDD]/10 bg-black/20 p-5">
                      <p className="font-black uppercase text-[#F4EBDD]">{level.label}</p>
                      <p className="mt-2 text-sm leading-7 text-[#c9bfaf]">{level.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-16 rounded-[2rem] border border-[#39FF14]/16 bg-[linear-gradient(135deg,rgba(57,255,20,0.12),rgba(0,148,255,0.08))] p-8 md:p-10">
            <h2 className="text-3xl font-black uppercase text-[#F4EBDD]">Activation only happens when the twin is safe.</h2>
            <p className="mt-4 max-w-4xl text-lg leading-8 text-[#e5dacb]">
              Consent must be complete, required profiles approved, safety rules configured, escalation contacts ready, and public-facing actions limited to approved autonomy levels. No cross-tenant access. No unrestricted autonomy.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/services/digital-twin/start" className="inline-flex items-center justify-center rounded-2xl bg-[#39FF14] px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-[#050505]">
                Start Onboarding
              </Link>
              <Link href="/services/digital-twin/pricing" className="inline-flex items-center justify-center rounded-2xl border border-[#F4EBDD]/20 px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-[#F4EBDD]">
                View Packages
              </Link>
            </div>
          </section>
        </div>
    </main>
  );
}
