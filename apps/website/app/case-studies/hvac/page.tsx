import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Gauge, Zap, CheckCircle2, TrendingUp } from 'lucide-react';

export const metadata = {
  title: 'WISE² HVAC Solutions — Field Diagnostics Case Study',
  description: 'Professional HVAC field diagnostics powered by WISE² AI analysis and smart tool connectivity.',
};

export default function HvacCaseStudy() {
  return (
    <main className="min-h-screen bg-[#050607] text-white">
      {/* Hero */}
      <section className="border-b border-white/10 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#8EDBFF] hover:text-white mb-6">
              ← Back to home
            </Link>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8EDBFF]">
            Case Study / HVAC Service
          </p>
          <h1 className="mt-5 max-w-3xl text-5xl font-black leading-tight sm:text-6xl">
            WISE² HVAC Solutions
          </h1>
          <p className="mt-4 text-xl font-bold text-[#F2B632]">
            Professional diagnostics on the jobsite
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#D4DAE2]">
            How HVAC technicians use WISE² Field Tech to capture real equipment data, run AI diagnostics, and turn field readings into recommended actions—all before leaving the job.
          </p>
        </div>
      </section>

      {/* Metrics */}
      <section className="border-b border-white/10 bg-[#0A0E12] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { label: 'Diagnostic Accuracy', value: '82%', icon: Gauge },
              { label: 'Active Tools', value: '7+', icon: Zap },
              { label: 'Systems Analyzed', value: '187+', icon: TrendingUp },
            ].map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="border border-white/10 bg-[#090C10] p-6">
                  <Icon className="h-6 w-6 text-[#8EDBFF]" aria-hidden="true" />
                  <p className="mt-4 text-sm uppercase tracking-[0.18em] text-[#8FA0AE]">{metric.label}</p>
                  <p className="mt-2 text-3xl font-black text-[#8EDBFF]">{metric.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* The Challenge */}
      <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-black sm:text-4xl">The Challenge</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="border-l border-[#8EDBFF]/50 pl-6">
              <h3 className="font-black text-white">Scattered Data</h3>
              <p className="mt-2 text-[#B7C0CB]">
                Readings taken with multiple meters. Data written on paper or in notes. Hard to compare against nameplate or service history.
              </p>
            </div>
            <div className="border-l border-[#8EDBFF]/50 pl-6">
              <h3 className="font-black text-white">Guesswork Diagnostics</h3>
              <p className="mt-2 text-[#B7C0CB]">
                Diagnosing HVAC problems requires experience. Junior technicians add refrigerant based on one pressure reading. Wrong approach = wasted time and money.
              </p>
            </div>
            <div className="border-l border-[#8EDBFF]/50 pl-6">
              <h3 className="font-black text-white">Missed Upsells</h3>
              <p className="mt-2 text-[#B7C0CB]">
                Technician spots maintenance needed but no systematic way to log it. Follow-up depends on memory. Recurring service opportunities lost.
              </p>
            </div>
            <div className="border-l border-[#8EDBFF]/50 pl-6">
              <h3 className="font-black text-white">No Evidence</h3>
              <p className="mt-2 text-[#B7C0CB]">
                Customer skeptical about why the system needs work? No diagnostic data to show. Confidence in recommendations is low.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="border-b border-white/10 bg-[#0A0E12] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-black sm:text-4xl">The WISE² Solution</h2>
          <p className="mt-4 text-lg text-[#B7C0CB]">
            WISE² Field Tech connects smart tools, real-time data capture, and AI analysis:
          </p>
          <div className="mt-8 space-y-6">
            {[
              {
                title: 'Smart Tool Connectivity',
                description: 'Connect digital manifolds, multimeters, vacuum gauges, and wireless probes. Data flows directly into the app. One source of truth.',
              },
              {
                title: 'AI HVAC Diagnostics',
                description: 'Real-time analysis compares readings against system nameplate, calculates superheat/subcooling, and identifies probable causes. Technician sees the diagnosis in seconds.',
              },
              {
                title: 'Recommended Actions',
                description: 'Based on the diagnosis, WISE² suggests next steps: "Check airflow, inspect filter, verify charge." Technician knows exactly what to do.',
              },
              {
                title: 'Documented Evidence',
                description: 'Photos, readings, diagnosis, and recommendations saved to job. Customer sees the data. Trust increases. Upsells become obvious.',
              },
            ].map((item, index) => (
              <div key={index} className="border border-white/10 bg-[#090C10] p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-[#8EDBFF]" aria-hidden="true" />
                  <div>
                    <h3 className="font-black text-white">{item.title}</h3>
                    <p className="mt-2 text-[#B7C0CB]">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Diagnostic Workflow */}
      <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-black sm:text-4xl mb-8">The Diagnostic Workflow</h2>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Connect Smart Tools', desc: 'Bluetooth connects digital multimeter, manifold, gauges to phone.' },
              { step: '2', title: 'Capture Readings', desc: 'Technician selects equipment type. WISE² guides measurement sequence.' },
              { step: '3', title: 'Real-Time Analysis', desc: 'AI compares readings against system nameplate, calculates superheat/subcooling.' },
              { step: '4', title: 'Diagnosis Generated', desc: 'Probable cause identified: "High superheat = starved evaporator" or "Low airflow"' },
              { step: '5', title: 'Recommended Checks', desc: 'WISE² lists next steps: inspect filter, check TXV, verify charge.' },
              { step: '6', title: 'Job Documented', desc: 'Photos, readings, diagnosis, and actions saved to customer record.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 border border-white/10 bg-[#090C10] p-6">
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[#8EDBFF] text-sm font-black text-[#050607]">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-white">{item.title}</h3>
                  <p className="mt-1 text-[#B7C0CB]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Results */}
      <section className="border-b border-white/10 bg-[#0A0E12] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-black sm:text-4xl">The Impact</h2>
          <div className="mt-8 space-y-6">
            <div className="border border-white/10 bg-[#090C10] p-6">
              <h3 className="font-black text-white">Faster Diagnostics</h3>
              <p className="mt-2 text-[#B7C0CB]">
                What took 45 minutes now takes 15. Technician saves 30 minutes per job. That's 4 extra jobs per week.
              </p>
            </div>
            <div className="border border-white/10 bg-[#090C10] p-6">
              <h3 className="font-black text-white">Higher Accuracy</h3>
              <p className="mt-2 text-[#B7C0CB]">
                AI catches mistakes human technicians might miss. No more "adding refrigerant" when the real issue is airflow. Fewer callbacks.
              </p>
            </div>
            <div className="border border-white/10 bg-[#090C10] p-6">
              <h3 className="font-black text-white">Customer Confidence</h3>
              <p className="mt-2 text-[#B7C0CB]">
                Customer sees the readings, the analysis, the recommended actions. Trust increases. Upsells ("Replace air filter," "Check TXV") become no-brainers.
              </p>
            </div>
            <div className="border border-[#F2B632]/35 bg-[#151006] p-6">
              <p className="text-lg text-white">
                "WISE² HVAC Diagnostics turned our technicians from guessers into diagnosticians. Faster jobs, higher confidence, more recurring service. It's changed how we operate."
              </p>
              <p className="mt-3 font-bold text-[#F2B632]">— WISE² HVAC Solutions Partner</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 border border-white/10 bg-[#DCE7EF] p-6 text-[#050607] sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
          <div>
            <h2 className="text-3xl font-black leading-tight">Transform your HVAC operation</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#26313A]">
              See how WISE² Field Tech powers faster diagnostics, higher accuracy, and more customer trust.
            </p>
          </div>
          <Link href="/platform" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#050607] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#111A22] focus:outline-none focus:ring-2 focus:ring-[#050607] focus:ring-offset-2 focus:ring-offset-[#DCE7EF]">
            Build with WISE²
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
