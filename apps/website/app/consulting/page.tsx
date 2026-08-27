'use client';

import Link from 'next/link';
import { Footer } from '@/components/wise';
import { ArrowRight, Camera, MapPin, TrendingUp, Users, ClipboardList, BarChart3, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CJaysAutoReconPage() {
  return (
    <>
      <main className="min-h-screen bg-[#050607] text-white">
        {/* HERO */}
        <section className="relative border-b border-white/10 bg-[#050607]">
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(57,255,20,0.14),rgba(242,182,50,0.07)_34%,rgba(5,6,7,0)_66%)]" />
          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="max-w-3xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#39FF14]">Professional Auto Detailing</p>
              <h1 className="text-5xl font-black leading-[0.93] text-white sm:text-6xl lg:text-7xl">From Single Owner to $18.6K Revenue</h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#D4DAE2] sm:text-lg">
                CJAYS Auto Recon scaled their professional detailing business using WISE² job management, photo capture, analytics, and customer follow-up. Real service business. Real revenue.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#39FF14] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#050607] transition duration-200 hover:-translate-y-0.5 hover:bg-[#39FF14]/90">
                  Explore WISE²
                  <ArrowRight size={16} />
                </Link>
                <Link href="/" className="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-[#39FF14] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#39FF14] transition duration-200 hover:bg-[#39FF14]/10">
                  See Growth Strategy
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
                <p className="text-4xl font-black text-[#39FF14] sm:text-5xl">$18.6K</p>
                <p className="mt-2 text-sm text-gray-400">Monthly Revenue</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center">
                <p className="text-4xl font-black text-[#39FF14] sm:text-5xl">47</p>
                <p className="mt-2 text-sm text-gray-400">Jobs Per Month</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
                <p className="text-4xl font-black text-[#39FF14] sm:text-5xl">92%</p>
                <p className="mt-2 text-sm text-gray-400">Customer Satisfaction</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* THE CHALLENGE */}
        <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-black leading-tight sm:text-5xl">The Detailing Grind</h2>
            <p className="mt-6 max-w-2xl text-gray-400">
              Professional auto detailers face a critical gap between craft and business:
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {[
                'No systematic job tracking — Schedules are text messages, calls, and WhatsApp. Jobs get lost or double-booked.',
                'No before/after proof — You do excellent work but customers don\'t see the full transformation. No photos = no upsells.',
                'Lost repeat business — Customers forget you existed. No follow-up means no repeat service orders.',
                'No analytics — You don\'t know which services are most profitable or which customers are your best repeat clients.',
                'Manual invoicing — Every job requires a separate invoice process. Hours wasted on admin instead of detailing.',
                'Revenue ceiling — Without systems, you can\'t scale beyond what you can personally service.'
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
            <h2 className="text-3xl font-black leading-tight sm:text-5xl">WISE² Transforms Detailing</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {[
                { icon: '📱', title: 'Mobile Job Management', desc: 'Schedule jobs, get directions, access customer notes — all on your phone at the job site.' },
                { icon: '📸', title: 'Photo Documentation', desc: 'Capture before/after photos automatically tagged to each job. Prove your work to every customer.' },
                { icon: '🔄', title: 'Follow-Up Automation', desc: 'WISE² sends thank you messages, satisfaction surveys, and re-booking reminders automatically.' },
                { icon: '📊', title: 'Real Analytics', desc: 'Track revenue by service type, customer lifetime value, most profitable jobs, repeat rates.' }
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

        {/* HOW IT WORKS */}
        <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-black leading-tight sm:text-5xl">The Workflow</h2>
            <div className="mt-12 space-y-8">
              {[
                { n: '1', title: 'Customer Books Job', desc: 'WISE² scheduling sends automatic confirmation. Customer knows exactly when you\'ll arrive. No double bookings.' },
                { n: '2', title: 'You Work. You Capture.', desc: 'While you detail, take before/after photos. WISE² tags them automatically to the job.' },
                { n: '3', title: 'Invoice & Collect', desc: 'WISE² generates invoice on the spot. Customer pays on your phone. Done.' },
                { n: '4', title: 'Follow-Up Happens', desc: 'WISE² sends satisfaction survey, thank you, and booking reminder. Customer books next appointment automatically.' }
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

        {/* FEATURES */}
        <section className="border-b border-white/10 bg-[#0A0E12] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-black leading-tight sm:text-5xl">Built for Detailing Pros</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Camera, title: 'Photo Management', description: 'Before/after galleries for every job. AI auto-tags and organizes. Customer sees transformation.' },
                { icon: ClipboardList, title: 'Service Menu', description: 'Build your menu once. Offer packages: exterior wash, wax, interior detail, ceramic coat, etc.' },
                { icon: MapPin, title: 'GPS Routing', description: 'Optimize routes between jobs. Save time. Squeeze in more appointments per day.' },
                { icon: Users, title: 'Customer Profiles', description: 'Notes, service history, preferences, repeat schedules. Personalize every interaction.' },
                { icon: TrendingUp, title: 'Revenue Analytics', description: 'Which service packages generate most revenue? Which customers are most profitable?' },
                { icon: Clock, title: 'Time Tracking', description: 'Track how long each job takes. Identify efficiency gains. Invoice accurately by labor time.' }
              ].map((Feature, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="rounded-xl border border-white/10 bg-[#090C10] p-6">
                  <Feature.icon className="h-6 w-6 text-[#39FF14]" />
                  <h3 className="mt-4 text-lg font-bold text-white">{Feature.title}</h3>
                  <p className="mt-2 text-sm text-[#B7C0CB]">{Feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* RESULTS */}
        <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-black leading-tight sm:text-5xl">CJAYS Results</h2>
            <div className="mt-12 space-y-8">
              {[
                { n: '1', title: '$18.6K Monthly Revenue', desc: 'Scaled from single owner to consistent monthly bookings across multiple service types.' },
                { n: '2', title: '47 Jobs Per Month', desc: 'Optimized scheduling and routing means more jobs per day. Better utilization of time.' },
                { n: '3', title: '92% Repeat Rate', desc: 'Follow-up automation keeps customers coming back. Repeat business is the foundation of growth.' },
                { n: '4', title: 'Zero Admin Overhead', desc: 'WISE² handles scheduling, invoicing, and follow-ups. You focus on the craft—detailing.' }
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

        {/* FAQ */}
        <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-black leading-tight sm:text-5xl">Questions</h2>
            <div className="mt-12 space-y-6">
              {[
                {
                  q: 'Will this work for a solo detailer?',
                  a: 'Yes. WISE² works best for solo operators scaling to 30-50 jobs per month. It keeps admin overhead zero while you focus on your craft.',
                },
                {
                  q: 'Can I use it with my existing customers?',
                  a: 'Absolutely. Import your customer list. Send them an invite to book through WISE². They\'ll love the convenience.',
                },
                {
                  q: 'How do I take good before/after photos?',
                  a: 'WISE² has built-in photo guides for each service type. Consistent lighting + positioning = professional-looking galleries every time.',
                },
                {
                  q: 'What if I miss a booking?',
                  a: 'WISE² sends customer reminders 24 hours before appointment. Most no-shows disappear. You can reschedule with one click.',
                },
                {
                  q: 'Can I track income and expenses?',
                  a: 'Yes. WISE² tracks all revenue by service type and customer. You can also integrate with accounting software for tax reporting.',
                },
                {
                  q: 'Will this help me hire a team eventually?',
                  a: 'Yes. WISE² scales with you. Add team members, assign jobs, track individual performance. Growth without chaos.',
                },
              ].map(({ q, a }, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} className="rounded-xl border border-white/10 bg-[#0A0E12] p-6">
                  <h3 className="text-lg font-bold text-white">{q}</h3>
                  <p className="mt-2 text-sm text-[#B7C0CB]">{a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#39FF14]/15 to-[#39FF14]/5 p-8 text-center sm:p-12">
              <h2 className="text-3xl font-black text-white">Ready to Scale Your Detail Business?</h2>
              <p className="mt-3 text-base leading-7 text-gray-300">WISE² gives you the tools to grow like CJAYS did. Schedule smarter. Document better. Repeat more often.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Link href="/" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#39FF14] px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#050607] transition hover:bg-[#39FF14]/90">
                  Start With WISE²
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
