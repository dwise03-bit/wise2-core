'use client';

import Link from 'next/link';
import { Footer } from '@/components/wise';
import { ArrowRight, Zap, Thermometer, TrendingUp, AlertCircle, CheckCircle2, Smartphone, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HVACSolutionsPage() {
  return (
    <>
      <main className="min-h-screen bg-[#050607] text-white">
        {/* HERO */}
        <section className="relative border-b border-white/10 bg-[#050607]">
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(57,255,20,0.14),rgba(242,182,50,0.07)_34%,rgba(5,6,7,0)_66%)]" />
          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="max-w-3xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#39FF14]">Field Diagnostics On The Jobsite</p>
              <h1 className="text-5xl font-black leading-[0.93] text-white sm:text-6xl lg:text-7xl">HVAC Diagnostics. In Real Time.</h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#D4DAE2] sm:text-lg">
                WISE² HVAC Solutions gives technicians real-time diagnostics, AI analysis, and customer intelligence on every jobsite. Diagnose faster. Build trust. Close more jobs.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#39FF14] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#050607] transition duration-200 hover:-translate-y-0.5 hover:bg-[#39FF14]/90">
                  See WISE²
                  <ArrowRight size={16} />
                </Link>
                <Link href="/" className="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-[#39FF14] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#39FF14] transition duration-200 hover:bg-[#39FF14]/10">
                  Watch Demo
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
                <p className="text-4xl font-black text-[#39FF14] sm:text-5xl">82%</p>
                <p className="mt-2 text-sm text-gray-400">Confidence on Diagnosis</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center">
                <p className="text-4xl font-black text-[#39FF14] sm:text-5xl">40%</p>
                <p className="mt-2 text-sm text-gray-400">Faster Diagnostics</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
                <p className="text-4xl font-black text-[#39FF14] sm:text-5xl">3x</p>
                <p className="mt-2 text-sm text-gray-400">Higher Close Rate</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* THE CHALLENGE */}
        <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-black leading-tight sm:text-5xl">The Jobsite Reality</h2>
            <p className="mt-6 max-w-2xl text-gray-400">
              HVAC technicians face a disconnect between fieldwork and diagnosis:
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {[
                'Limited tools — only a thermometer and gauges. No real-time data or diagnostics.',
                'Guesswork diagnosis — Is it the compressor? The refrigerant? The thermostat? Customers ask and you\'re unsure.',
                'Low customer confidence — Customers don\'t see the problem. They question your diagnosis and your price.',
                'Missed upsells — Preventive maintenance opportunities go unnoticed and unsold.',
                'Callback hell — Customers call back within days because the wrong component was addressed.',
                'Lost revenue — Jobs take longer. Close rates drop. Repeat visits kill profitability.'
              ].map((challenge, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-[#0A0E12] p-6">
                  <div className="flex gap-3">
                    <AlertCircle size={20} className="text-[#39FF14] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[#D4DAE2]">{challenge}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* THE SOLUTION */}
        <section className="border-b border-white/10 bg-[#0A0E12] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-black leading-tight sm:text-5xl">WISE² Powers Real Diagnostics</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {[
                { icon: '🔍', title: 'Real-Time AI Diagnostics', desc: 'Connected sensors feed data to WISE². AI analyzes patterns. You get instant diagnosis with 82% confidence.' },
                { icon: '📱', title: 'Field App on Your Phone', desc: 'Access diagnostics, schematics, troubleshooting, and customer history right on your phone at the jobsite.' },
                { icon: '📊', title: 'Show Customers the Problem', desc: 'Visual reports prove what\'s wrong. Customers see the issue. They trust the fix. They approve the work.' },
                { icon: '💰', title: 'Sell Upsells with Proof', desc: 'Preventive maintenance recommendations backed by real data. Close more upgrades, not just emergency repairs.' }
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
            <h2 className="text-3xl font-black leading-tight sm:text-5xl">Jobsite Workflow</h2>
            <div className="mt-12 space-y-8">
              {[
                { n: '1', title: 'Arrive at Jobsite', desc: 'Connect wireless sensors to the HVAC system. They feed real-time temperature, pressure, and performance data to WISE².' },
                { n: '2', title: 'AI Analyzes', desc: 'WISE² analyzes the data in seconds. AI compares patterns to thousands of past cases. Diagnosis appears on your phone.' },
                { n: '3', title: 'Show the Customer', desc: 'Open the visual report. Point to the problem. Show graphs, trends, and recommendations. Customer sees exactly what\'s wrong.' },
                { n: '4', title: 'Sell & Schedule', desc: 'Customer approves the fix. WISE² generates invoice and schedules follow-up. You move to the next job.' }
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
            <h2 className="text-3xl font-black leading-tight sm:text-5xl">Powerful Field Tools</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Thermometer, title: 'Live Sensor Data', description: 'Real-time temperature, pressure, humidity, and airflow readings.' },
                { icon: Smartphone, title: 'Mobile App', description: 'Full-featured app with offline mode. Works where connectivity is unreliable.' },
                { icon: BarChart3, title: 'Performance Reports', description: 'Generate PDF reports showing system health, issues, and recommendations.' },
                { icon: CheckCircle2, title: 'Job Tracking', description: 'Punch in/out, track time on each job, flag issues for follow-up.' },
                { icon: TrendingUp, title: 'Customer History', description: 'Access past service calls, parts replaced, and previous diagnoses.' },
                { icon: Zap, title: 'Preventive Alerts', description: 'AI flags potential failures before they become emergency calls.' }
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
            <h2 className="text-3xl font-black leading-tight sm:text-5xl">Real Results</h2>
            <div className="mt-12 space-y-8">
              {[
                { n: '1', title: 'Faster Diagnosis — 40% Quicker', desc: 'No more guessing. AI analysis gives you diagnosis in minutes instead of hours.' },
                { n: '2', title: '82% Diagnostic Confidence', desc: 'Backed by real data, not intuition. You know exactly what\'s wrong and customers believe it.' },
                { n: '3', title: '3x Higher Close Rate', desc: 'When customers see the problem visually, they approve repairs. Upsells follow naturally.' },
                { n: '4', title: 'Fewer Callbacks', desc: 'Right diagnosis means right fix. Customers don\'t call back. Fewer repeats = more profit.' }
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
                  q: 'What equipment do I need?',
                  a: 'Your phone and our wireless sensors. We provide Bluetooth sensors that connect to any HVAC system. No hardwiring needed.',
                },
                {
                  q: 'Does it work with all HVAC systems?',
                  a: 'Yes. WISE² works with standard residential and commercial units. We support all major brands: Carrier, Trane, Lennox, York, and more.',
                },
                {
                  q: 'What if I lose cell signal?',
                  a: 'The app works offline. Sensors cache data locally. When you regain signal, WISE² syncs everything automatically.',
                },
                {
                  q: 'How accurate is the AI diagnosis?',
                  a: '82% confidence on average. The AI gets better the more you use it. Your feedback helps train it for your specific customer base.',
                },
                {
                  q: 'Can I use this for service calls only?',
                  a: 'Yes. WISE² works for service, maintenance, and emergency calls. Use as much or as little as you need.',
                },
                {
                  q: 'What about customer privacy?',
                  a: 'We encrypt all data. Customers own their data. You can delete customer records anytime. GDPR and HIPAA compliant.',
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
              <h2 className="text-3xl font-black text-white">Ready to Diagnose Better?</h2>
              <p className="mt-3 text-base leading-7 text-gray-300">WISE² HVAC Solutions gives you the tools to build trust with customers and close more jobs.</p>
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
