import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin, TrendingUp, Users, Zap } from 'lucide-react';

export const metadata = {
  title: 'GET DOWN × WISE² — Pressure Washing Growth Case Study',
  description: 'How GET DOWN scaled from single location to 3-city operation using WISE² dispatch, CRM, and automation.',
};

export default function GetDownCaseStudy() {
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
            Case Study / Pressure Washing
          </p>
          <h1 className="mt-5 max-w-3xl text-5xl font-black leading-tight sm:text-6xl">
            GET DOWN × WISE²
          </h1>
          <p className="mt-4 text-xl font-bold text-[#F2B632]">
            Local brand to multi-city growth
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#D4DAE2]">
            How a residential and commercial pressure washing company scaled from one location to three cities in the Carolinas using WISE² dispatch, CRM, and automation systems.
          </p>
        </div>
      </section>

      {/* Metrics */}
      <section className="border-b border-white/10 bg-[#0A0E12] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { label: 'Service Locations', value: '3 Cities', icon: MapPin },
              { label: 'Active Jobs', value: '187+', icon: TrendingUp },
              { label: 'Team Members', value: '32', icon: Users },
            ].map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="border border-white/10 bg-[#090C10] p-6">
                  <Icon className="h-6 w-6 text-[#8EDBFF]" aria-hidden="true" />
                  <p className="mt-4 text-sm uppercase tracking-[0.18em] text-[#8FA0AE]">{metric.label}</p>
                  <p className="mt-2 text-3xl font-black text-[#F2B632]">{metric.value}</p>
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
              <h3 className="font-black text-white">Scattered Operations</h3>
              <p className="mt-2 text-[#B7C0CB]">
                Jobs tracked in multiple spreadsheets. Customer data fragmented across email and notebooks. No visibility into technician locations or job progress.
              </p>
            </div>
            <div className="border-l border-[#8EDBFF]/50 pl-6">
              <h3 className="font-black text-white">Manual Everything</h3>
              <p className="mt-2 text-[#B7C0CB]">
                Dispatch done by phone calls. Estimates created in Word. Follow-ups forgotten. No way to track recurring service opportunities.
              </p>
            </div>
            <div className="border-l border-[#8EDBFF]/50 pl-6">
              <h3 className="font-black text-white">Growth Ceiling</h3>
              <p className="mt-2 text-[#B7C0CB]">
                Adding staff meant adding complexity. Couldn't scale beyond what one owner-operator could manage manually.
              </p>
            </div>
            <div className="border-l border-[#8EDBFF]/50 pl-6">
              <h3 className="font-black text-white">Revenue Loss</h3>
              <p className="mt-2 text-[#B7C0CB]">
                Missed follow-ups meant lost recurring contracts. No data on which services or crews were most profitable.
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
            GET DOWN deployed WISE² across four core areas:
          </p>
          <div className="mt-8 space-y-6">
            {[
              {
                title: 'Real-Time Dispatch',
                description: 'Technicians get jobs in the field. Live map shows locations. Manager sees progress in real-time. No more phone tag.',
              },
              {
                title: 'Customer Intelligence',
                description: 'Every customer in one system. Job history, preferences, contract terms, photo records. Technicians see notes before arriving.',
              },
              {
                title: 'Automated Follow-Up',
                description: 'WISE² generates estimates automatically. Follow-up reminders keep recurring contracts from slipping. Proposals take minutes, not hours.',
              },
              {
                title: 'Route Optimization',
                description: 'Jobs clustered by location. Technicians work efficiently. Less drive time, more billable hours. Fuel costs drop.',
              },
            ].map((item, index) => (
              <div key={index} className="border border-white/10 bg-[#090C10] p-6">
                <div className="flex items-start gap-4">
                  <Zap className="mt-1 h-5 w-5 flex-none text-[#8EDBFF]" aria-hidden="true" />
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

      {/* The Results */}
      <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-black sm:text-4xl">The Results</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {[
              { metric: '3x', label: 'Service Coverage', color: '#8EDBFF' },
              { metric: '45%', label: 'Faster Dispatch', color: '#F2B632' },
              { metric: '32', label: 'Active Technicians', color: '#22C55E' },
              { metric: '187+', label: 'Active Jobs Monthly', color: '#8EDBFF' },
            ].map((result) => (
              <div key={result.label} className="border border-white/10 bg-[#090C10] p-8">
                <p className="text-5xl font-black" style={{ color: result.color }}>
                  {result.metric}
                </p>
                <p className="mt-3 text-sm uppercase tracking-[0.18em] text-[#8FA0AE]">{result.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 border-l-4 border-[#F2B632] bg-[#151006] p-6">
            <p className="text-lg text-white">
              "WISE² gave us the systems to scale. What used to take owner-operator time—dispatch, follow-up, routing—now happens automatically. We went from one location to three cities."
            </p>
            <p className="mt-3 font-bold text-[#F2B632]">— Rob & Kaytlie Panzica, GET DOWN Pressure Washing</p>
          </div>
        </div>
      </section>

      {/* The Workflow */}
      <section className="border-b border-white/10 bg-[#0A0E12] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-black sm:text-4xl mb-8">How It Works Daily</h2>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Customer Calls or Books Online', desc: 'Job enters WISE² immediately.' },
              { step: '2', title: 'WISE² Generates Estimate', desc: 'Based on service type, location, and crew availability.' },
              { step: '3', title: 'Technician Accepts & Routes', desc: 'Job appears on phone with customer details, photos, notes.' },
              { step: '4', title: 'Service Completed & Documented', desc: 'Photos, notes, and invoice captured in app.' },
              { step: '5', title: 'Follow-Up Automated', desc: 'WISE² schedules next maintenance visit or seasonal service.' },
              { step: '6', title: 'Analytics Show What Works', desc: 'Manager sees revenue by crew, service type, and location.' },
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

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 border border-white/10 bg-[#DCE7EF] p-6 text-[#050607] sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
          <div>
            <h2 className="text-3xl font-black leading-tight">Ready to scale your service business?</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#26313A]">
              GET DOWN went from one city to three. See how WISE² can power your growth.
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
