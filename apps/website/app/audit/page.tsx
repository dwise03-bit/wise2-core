'use client';

import Link from 'next/link';
import { Footer } from '@/components/wise';
import { ArrowRight, MapPin, TrendingUp, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GetDownPage() {
  return (
    <>
      <main className="min-h-screen bg-[#050607] text-white">
        {/* HERO */}
        <section className="relative border-b border-white/10 bg-[#050607]">
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(57,255,20,0.14),rgba(242,182,50,0.07)_34%,rgba(5,6,7,0)_66%)]" />
          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="max-w-3xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#39FF14]">Pressure Washing at Scale</p>
              <h1 className="text-5xl font-black leading-[0.93] text-white sm:text-6xl lg:text-7xl">From Single Location to 3-City Growth</h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#D4DAE2] sm:text-lg">
                GET DOWN Pressure Washing scaled across North Carolina using WISE² CRM, route management, and automation. Real business. Real growth.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#39FF14] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#050607] transition duration-200 hover:-translate-y-0.5 hover:bg-[#39FF14]/90">
                  Explore WISE²
                  <ArrowRight size={16} />
                </Link>
                <Link href="/" className="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-[#39FF14] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#39FF14] transition duration-200 hover:bg-[#39FF14]/10">
                  See Built Work
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* METRICS */}
        <section className="border-b border-white/10 bg-[#0A0E12] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 md:grid-cols-3">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center">
                <p className="text-4xl font-black text-[#39FF14] sm:text-5xl">3</p>
                <p className="mt-2 text-sm text-gray-400">Cities Across NC</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center">
                <p className="text-4xl font-black text-[#39FF14] sm:text-5xl">187+</p>
                <p className="mt-2 text-sm text-gray-400">Jobs Completed</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
                <p className="text-4xl font-black text-[#39FF14] sm:text-5xl">32</p>
                <p className="mt-2 text-sm text-gray-400">Technicians Managed</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* THE CHALLENGE */}
        <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-black leading-tight sm:text-5xl">Local to Multi-City: The Challenge</h2>
            <p className="mt-6 max-w-2xl text-gray-400">
              GET DOWN started as a single-location pressure washing company. Growing to multiple cities meant managing:
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {[
                'Technicians scattered across three locations with no centralized dispatch',
                'Customer records spread across spreadsheets and notebooks',
                'No visibility into job completion, revenue by location, or technician performance',
                'Manual scheduling and route planning wasting time and fuel'
              ].map((challenge, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-[#0A0E12] p-6">
                  <p className="text-sm text-[#D4DAE2]">{challenge}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* THE SOLUTION */}
        <section className="border-b border-white/10 bg-[#0A0E12] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-black leading-tight sm:text-5xl">WISE² Powers Growth</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {[
                { icon: '📱', title: 'Mobile Dispatch', desc: 'Real-time job assignment and route optimization across all 3 locations' },
                { icon: '📊', title: 'Customer CRM', desc: 'Centralized customer database with job history, notes, and service records' },
                { icon: '⚙️', title: 'Automation', desc: 'Automated follow-up, invoice generation, and payment reminders' },
                { icon: '📈', title: 'Real Analytics', desc: 'Revenue tracking by location, technician performance, and job metrics' }
              ].map((feature, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="rounded-xl border border-white/10 bg-[#090C10] p-6">
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#B7C0CB]">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* RESULTS */}
        <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-black leading-tight sm:text-5xl">The Results</h2>
            <div className="mt-12 space-y-8">
              {[
                { n: '1', title: 'Scaled to 3 Cities', desc: 'Went from managing 1 location to running operations across Raleigh, Durham, and Chapel Hill' },
                { n: '2', title: '2x Job Capacity', desc: 'Technicians spend less time on admin, more time on customer work with optimized routes' },
                { n: '3', title: 'Real-Time Visibility', desc: 'Owner can see live job status, revenue by location, and technician performance from any device' },
                { n: '4', title: 'Automated Growth', desc: 'Follow-up sequences and customer retention automations keep repeat business flowing' }
              ].map(({ n, title, desc }, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex gap-6 md:gap-12">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(57,255,20,0.2), rgba(57,255,20,0.1))' }}>
                    <span className="text-2xl font-black text-[#39FF14]">{n}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <p className="mt-2 text-base text-[#B7C0CB]">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#39FF14]/15 to-[#39FF14]/5 p-8 text-center sm:p-12">
              <h2 className="text-3xl font-black text-white">Ready to Scale Your Service Business?</h2>
              <p className="mt-3 text-base leading-7 text-gray-300">WISE² gives you the tools to grow like GET DOWN did. Field management, customer intelligence, and real analytics—all in one system.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Link href="/" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#39FF14] px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#050607] transition hover:bg-[#39FF14]/90">
                  Build With WISE²
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
