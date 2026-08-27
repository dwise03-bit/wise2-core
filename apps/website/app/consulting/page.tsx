'use client';

import Link from 'next/link';
import { Footer } from '@/components/wise';
import { ArrowRight, CheckCircle2, Zap, Users, FileText, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

// ─── Service Card ────────────────────────────────────────────────────────────

function ServiceCard({ icon, title, price, duration, description, deliverables, highlighted }: { icon: any; title: string; price: string; duration: string; description: string; deliverables: string[]; highlighted?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-8 transition-all ${highlighted ? 'border-2 border-[#39FF14] bg-[#0d1218] ring-2 ring-[#39FF14]/20 md:scale-105' : 'border border-white/10 bg-[#090C10]'}`}
    >
      {highlighted && (
        <div className="inline-block bg-[#39FF14]/20 text-[#39FF14] text-xs font-bold px-3 py-1 rounded-full mb-4">
          MOST POPULAR
        </div>
      )}
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-2xl font-black text-white">{title}</h3>
      <p className="mt-2 text-sm text-gray-400">{duration}</p>
      <p className="mt-4 text-3xl font-black text-[#39FF14]">{price}</p>
      <p className="mt-4 text-base text-[#B7C0CB]">{description}</p>
      <div className="mt-6 pt-6 border-t border-white/10">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Deliverables</p>
        <ul className="space-y-2">
          {deliverables.map((d, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <CheckCircle2 size={16} className="text-[#39FF14] flex-shrink-0 mt-0.5" />
              {d}
            </li>
          ))}
        </ul>
      </div>
      <button className={`mt-8 w-full py-3 rounded-lg font-bold transition-all ${highlighted ? 'bg-[#39FF14] text-white hover:bg-[#39FF14]' : 'bg-[#111] text-gray-300 hover:bg-[#1a1a1a]'}`}>
        Book Now
      </button>
    </motion.div>
  );
}

// ─── Benefit Card ────────────────────────────────────────────────────────────

function BenefitCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="rounded-xl border border-white/10 bg-[#090C10] p-6">
      <Icon className="h-6 w-6 text-[#39FF14]" />
      <h3 className="mt-4 text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm text-[#B7C0CB]">{description}</p>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ConsultingPage() {
  return (
    <>
      <main className="min-h-screen bg-[#050607] text-white">
        {/* HERO */}
        <section className="relative border-b border-white/10 bg-[#050607]">
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(142,219,255,0.14),rgba(242,182,50,0.07)_34%,rgba(5,6,7,0)_66%)]" />
          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="max-w-3xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#39FF14]">Hands-On Implementation</p>
              <h1 className="text-5xl font-black leading-[0.93] text-white sm:text-6xl lg:text-7xl">Don't Learn AI. Build With It. Live.</h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#D4DAE2] sm:text-lg">
                Stop planning and start building. WISE² Consulting brings hands-on implementation to your business. We audit, we build, and we optimize—together.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/audit" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#39FF14] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#050607] transition duration-200 hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#39FF14] focus:ring-offset-2 focus:ring-offset-[#050607]">
                  Start With Audit
                  <ArrowRight size={16} />
                </Link>
                <Link href="#services" className="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-[#39FF14] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#39FF14] transition duration-200 hover:bg-[#39FF14]/10 focus:outline-none focus:ring-2 focus:ring-[#39FF14] focus:ring-offset-2 focus:ring-offset-[#050607]">
                  See Services
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="border-b border-white/10 bg-[#0A0E12] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-black leading-tight sm:text-5xl">Choose Your Consulting Path</h2>
            <p className="mt-4 max-w-2xl text-gray-400">Four packages designed for different scope and scale. All hands-on. All results-driven.</p>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <ServiceCard
                icon="🎯"
                title="AI Business Audit"
                price="$149"
                duration="60 minutes"
                description="Complete analysis of your workflows and AI opportunities."
                deliverables={['AI Readiness Score (0-100)', 'Opportunity Report', 'Quick-Win Recommendations', 'Priority 90-Day Plan']}
              />
              <ServiceCard
                icon="⚡"
                title="Live Build Session"
                price="$497"
                duration="60 minutes"
                description="Build something REAL together. You choose the project, we implement it live."
                deliverables={['Working Implementation', 'Configured Systems', 'Integration Setup', 'Next-Steps Roadmap']}
                highlighted
              />
              <ServiceCard
                icon="🚀"
                title="Implementation Day"
                price="$997"
                duration="Up to 6 hours"
                description="Comprehensive multi-system implementation for larger scope projects."
                deliverables={['Multiple Automations', 'AI Assistants', 'Custom Integrations', 'Training & Documentation']}
              />
              <ServiceCard
                icon="📊"
                title="Management Plan"
                price="$297/mo"
                duration="Ongoing"
                description="Recurring optimization, monitoring, and support for sustained results."
                deliverables={['Monthly Strategy Call', 'System Optimization', 'AI Monitoring', 'Priority Support']}
              />
            </div>
          </div>
        </section>

        {/* VALUE PROPOSITIONS */}
        <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-black leading-tight sm:text-5xl">Why Choose WISE² Consulting</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <BenefitCard icon={CheckCircle2} title="Real Solutions" description="Not theory. We build working implementations during every session." />
              <BenefitCard icon={Zap} title="Zero Setup Time" description="Walk in with a problem, walk out with working systems. No months of preparation." />
              <BenefitCard icon={Users} title="Expert Partnership" description="AI specialists and business strategists working alongside you." />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="border-b border-white/10 bg-[#0A0E12] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-black leading-tight sm:text-5xl">The Process</h2>
            <div className="mt-12 space-y-8">
              {[
                { n: '1', title: 'Choose Your Path', desc: 'Select Audit, Live Build, Implementation Day, or Management based on your scope.' },
                { n: '2', title: 'Share Your Needs', desc: 'Complete a brief intake form describing your business, workflows, and goals.' },
                { n: '3', title: 'Qualification', desc: 'We review your situation and recommend the best service option for you.' },
                { n: '4', title: 'Book & Prepare', desc: 'Schedule your session. We send prep materials and any pre-work we need.' },
                { n: '5', title: 'Build Together', desc: 'During the session, we implement real solutions in real-time with you.' },
                { n: '6', title: 'Leave With Results', desc: 'Walk away with working systems, documentation, and a clear roadmap forward.' },
              ].map(({ n, title, desc }, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex gap-6 md:gap-12">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(0,102,255,0.2), rgba(0,148,255,0.1))' }}>
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
                  q: 'Do I need technical experience?',
                  a: 'Not at all. We handle the technical implementation. You just need to know your business and be ready to make decisions.',
                },
                {
                  q: 'What if my project takes longer than the session?',
                  a: 'We scope carefully to fit the time available. If a project is too large, we recommend Implementation Day or our Management plan for ongoing work.',
                },
                {
                  q: 'Can you work with my existing tools?',
                  a: 'Yes. We integrate with 500+ platforms. If it has an API or Zapier connector, we can almost certainly connect it.',
                },
                {
                  q: 'What do I get after the session?',
                  a: 'You get working systems, detailed documentation, training on how to use them, and a roadmap for next steps.',
                },
                {
                  q: 'Is the session recorded?',
                  a: 'Yes. We record every session for your reference and to support any follow-up work or questions.',
                },
                {
                  q: 'Can you help after the session ends?',
                  a: 'Yes! Our Management plan ($297/month) provides ongoing optimization, monitoring, and support for sustained results.',
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
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#39FF14]/15 to-[#00AAFF]/5 p-8 text-center sm:p-12">
              <h2 className="text-3xl font-black text-white">Ready to Build?</h2>
              <p className="mt-3 text-base leading-7 text-gray-300">Choose your consulting path and let's start building your AI-powered future.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Link href="/audit" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#39FF14] px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#39FF14] focus:outline-none focus:ring-2 focus:ring-[#39FF14] focus:ring-offset-2 focus:ring-offset-[#050607]">
                  Start Audit
                  <ArrowRight size={16} />
                </Link>
                <Link href="/pricing" className="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-[#39FF14] px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#39FF14] transition hover:bg-[#39FF14]/10 focus:outline-none focus:ring-2 focus:ring-[#39FF14] focus:ring-offset-2 focus:ring-offset-[#050607]">
                  View All Services
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
