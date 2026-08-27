import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BarChart3, Camera, Clock, DollarSign } from 'lucide-react';

export const metadata = {
  title: 'CJAYS Auto Recon × WISE² — Professional Detailing Case Study',
  description: 'Professional auto detailing app built on WISE² for job tracking, photo management, and analytics.',
};

export default function CjaysCaseStudy() {
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
            Case Study / Auto Detailing
          </p>
          <h1 className="mt-5 max-w-3xl text-5xl font-black leading-tight sm:text-6xl">
            CJAYS Auto Recon
          </h1>
          <p className="mt-4 text-xl font-bold text-[#F2B632]">
            Professional detailing at scale
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#D4DAE2]">
            How CJAYS built a professional auto detailing business with WISE²—combining field job tracking, photo management, and analytics to grow revenue and reputation.
          </p>
        </div>
      </section>

      {/* Metrics */}
      <section className="border-b border-white/10 bg-[#0A0E12] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { label: 'Monthly Revenue', value: '$18.6K', icon: DollarSign },
              { label: 'Active Jobs', value: '128+', icon: BarChart3 },
              { label: 'Customers', value: '86', icon: Camera },
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
              <h3 className="font-black text-white">Photo Chaos</h3>
              <p className="mt-2 text-[#B7C0CB]">
                Before/after photos scattered across phone, cloud, external drives. Hard to access during jobs. Difficult to build portfolio or prove quality.
              </p>
            </div>
            <div className="border-l border-[#8EDBFF]/50 pl-6">
              <h3 className="font-black text-white">Job Tracking Nightmare</h3>
              <p className="mt-2 text-[#B7C0CB]">
                Jobs tracked in notes app. No visibility into which services were scheduled, in progress, or completed. Customer follow-up forgotten.
              </p>
            </div>
            <div className="border-l border-[#8EDBFF]/50 pl-6">
              <h3 className="font-black text-white">Revenue Blindness</h3>
              <p className="mt-2 text-[#B7C0CB]">
                No insight into which services were most profitable, which customers most valuable, or how to grow strategically.
              </p>
            </div>
            <div className="border-l border-[#8EDBFF]/50 pl-6">
              <h3 className="font-black text-white">Data Loss Risk</h3>
              <p className="mt-2 text-[#B7C0CB]">
                Business critical information (photos, customer details, pricing) backed up inconsistently. One lost phone = lost business.
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
            CJAYS deployed WISE² with four core capabilities:
          </p>
          <div className="mt-8 space-y-6">
            {[
              {
                title: 'Integrated Photo Capture',
                description: 'Before/after photos captured directly in the app. Organized by job. Auto-synced to cloud. Portfolio builds automatically as they work.',
              },
              {
                title: 'Job Lifecycle Management',
                description: 'Jobs created → assigned → in progress → complete → invoiced. Every stage tracked. Customer sees status in real-time.',
              },
              {
                title: 'Customer Database',
                description: 'One customer record stores contact info, job history, preferences, pricing, and communication notes. Available offline, synced always.',
              },
              {
                title: 'Revenue Analytics',
                description: 'Dashboard shows revenue by service type, monthly trends, customer lifetime value, and which upsells drive growth.',
              },
            ].map((item, index) => (
              <div key={index} className="border border-white/10 bg-[#090C10] p-6">
                <div className="flex items-start gap-4">
                  <Camera className="mt-1 h-5 w-5 flex-none text-[#8EDBFF]" aria-hidden="true" />
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
              { metric: '128+', label: 'Active Jobs Monthly', color: '#8EDBFF' },
              { metric: '$18.6K', label: 'Monthly Revenue', color: '#F2B632' },
              { metric: '86', label: 'Active Customers', color: '#22C55E' },
              { metric: '100%', label: 'Photo Archive', color: '#8EDBFF' },
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
              "WISE² transformed how we run CJAYS. Photos organized, jobs tracked, customers remembered. We went from chaos to a professional operation. Revenue speaks for itself."
            </p>
            <p className="mt-3 font-bold text-[#F2B632]">— CJAYS Team</p>
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="border-b border-white/10 bg-[#0A0E12] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-black sm:text-4xl mb-8">What Powers CJAYS</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              'VIN & Barcode Scanning',
              'Job Tracking & Status',
              'Photo & File Management',
              'Customer Database',
              'Payment Tracking',
              'Inventory Management',
              'Notes & Checklists',
              'Reports & Analytics',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 border border-white/10 bg-[#090C10] p-4">
                <div className="h-2 w-2 rounded-full bg-[#8EDBFF]" aria-hidden="true" />
                <p className="text-sm font-semibold text-white">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 border border-white/10 bg-[#DCE7EF] p-6 text-[#050607] sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
          <div>
            <h2 className="text-3xl font-black leading-tight">Build a professional service business with WISE²</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#26313A]">
              See how WISE² powers field operations, customer management, and growth analytics.
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
