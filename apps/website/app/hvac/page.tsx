import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Gauge, Zap, CheckCircle2, BarChart3, Users } from 'lucide-react';

export const metadata = {
  title: 'WISE² HVAC Solutions — Field Diagnostics & Service Tools',
  description: 'Professional HVAC field diagnostics, AI analysis, and service workflows. Smart tools, real data, better results.',
};

export default function HvacPage() {
  return (
    <main className="min-h-screen bg-[#050607] text-white">
      {/* Hero */}
      <section className="relative border-b border-white/10 bg-[#050607]">
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(142,219,255,0.14),rgba(242,182,50,0.07)_34%,rgba(5,6,7,0)_66%)]" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(220,231,239,0.65)_1px,transparent_1px),linear-gradient(90deg,rgba(220,231,239,0.65)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#8EDBFF]">
              WISE² HVAC Solutions
            </p>
            <h1 className="text-5xl font-black leading-[0.93] text-white sm:text-6xl lg:text-7xl">
              Smart tools. Better results.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#D4DAE2] sm:text-lg">
              Professional HVAC technicians use WISE² to capture real equipment data, run AI diagnostics, and turn field readings into recommended actions. Faster diagnostics. Higher accuracy. More customer trust.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/case-studies/hvac"
                className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#DCE7EF] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#050607] transition duration-200 hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#8EDBFF] focus:ring-offset-2 focus:ring-offset-[#050607]"
              >
                See Case Study
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                href="/platform"
                className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/20 bg-white/5 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition duration-200 hover:-translate-y-0.5 hover:border-[#8EDBFF]/70 hover:bg-[#8EDBFF]/10 focus:outline-none focus:ring-2 focus:ring-[#8EDBFF] focus:ring-offset-2 focus:ring-offset-[#050607]"
              >
                Explore Platform
              </Link>
            </div>
          </div>

          <div className="border border-white/12 bg-[#080B0E]/92 p-5 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 text-[11px] uppercase tracking-[0.18em] text-[#8FA0AE]">
              <span>WISE² HVAC Solutions</span>
              <span className="text-[#8EDBFF]">Real field data</span>
            </div>
            <div className="mt-5 space-y-4">
              {[
                { label: 'Smart Diagnostics', value: '82% confidence' },
                { label: 'Active Tools', value: '7+ connected' },
                { label: 'Diagnostic Workflow', value: '6-step process' },
                { label: 'AI Analysis', value: 'Real-time' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 border-l border-[#8EDBFF]/30 pl-4 py-2">
                  <Gauge className="mt-0.5 h-5 w-5 flex-none text-[#8EDBFF]" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">{item.label}</p>
                    <p className="text-[11px] text-[#8FA0AE]">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="border-b border-white/10 bg-[#0A0E12] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8EDBFF]">
              What Technicians Get
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
              Professional diagnostics, translated into software.
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2">
            {[
              {
                title: 'Smart Tool Connectivity',
                description: 'Connect digital manifolds, multimeters, vacuum gauges, and wireless probes. Data flows directly into the app. One source of truth.',
                icon: Zap,
              },
              {
                title: 'AI HVAC Analysis',
                description: 'Real-time analysis compares readings against system nameplate. Calculates superheat/subcooling. Identifies probable causes in seconds.',
                icon: Gauge,
              },
              {
                title: 'Recommended Actions',
                description: 'Based on diagnosis, WISE² suggests next steps: "Check airflow, inspect filter, verify charge." Technician knows exactly what to do.',
                icon: CheckCircle2,
              },
              {
                title: 'Documented Evidence',
                description: 'Photos, readings, diagnosis, and recommendations saved to job record. Customer sees the data. Trust increases.',
                icon: BarChart3,
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="min-h-64 bg-[#090C10] p-6">
                  <Icon className="h-6 w-6 text-[#8EDBFF]" aria-hidden="true" />
                  <h3 className="mt-8 text-2xl font-black text-white">{feature.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[#B7C0CB]">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* The Diagnostic Workflow */}
      <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black sm:text-4xl mb-8">The Workflow</h2>
          <div className="space-y-3 md:columns-2 md:gap-4 lg:columns-3">
            {[
              { num: '1', title: 'Connect Tools', desc: 'Bluetooth connects digital manifold, multimeter, gauges to phone.' },
              { num: '2', title: 'Capture Readings', desc: 'Technician selects equipment. WISE² guides measurement sequence.' },
              { num: '3', title: 'Real-Time Analysis', desc: 'AI compares readings against nameplate, calculates key metrics.' },
              { num: '4', title: 'Diagnosis', desc: 'Probable cause identified: "High superheat = starved evaporator"' },
              { num: '5', title: 'Recommendations', desc: 'WISE² lists next steps: check filter, inspect coil, verify charge.' },
              { num: '6', title: 'Document & Share', desc: 'Save photos, readings, diagnosis to customer record.' },
            ].map((item) => (
              <div key={item.num} className="mb-3 break-inside-avoid border border-white/10 bg-[#090C10] p-4 md:mb-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#8EDBFF] text-xs font-black text-[#050607]">
                    {item.num}
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm">{item.title}</h3>
                    <p className="mt-1 text-xs text-[#B7C0CB]">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="border-b border-white/10 bg-[#0A0E12] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Diagnostic Accuracy', value: '82%', icon: Gauge },
              { label: 'Smart Tools Supported', value: '7+', icon: Zap },
              { label: 'Systems Analyzed', value: '187+', icon: CheckCircle2 },
              { label: 'Active Technicians', value: '32+', icon: Users },
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

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 border border-white/10 bg-[#DCE7EF] p-6 text-[#050607] sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
          <div>
            <h2 className="text-3xl font-black leading-tight">Ready to transform your HVAC operation?</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#26313A]">
              See how WISE² Field Tech powers faster diagnostics, higher accuracy, and more customer trust.
            </p>
          </div>
          <Link href="/case-studies/hvac" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#050607] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#111A22] focus:outline-none focus:ring-2 focus:ring-[#050607] focus:ring-offset-2 focus:ring-offset-[#DCE7EF]">
            See Case Study
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
