'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const agents = [
  { id: 'owl-eye', name: 'OWL EYE', role: 'Research & Verify', color: '#A78BFA' },
  { id: 'sales', name: 'SALES', role: 'Find Leads & Outreach', color: '#FCD34D' },
  { id: 'creative', name: 'CREATIVE', role: 'Design & Content', color: '#EC4899' },
  { id: 'web', name: 'WEB', role: 'Build & Optimize', color: '#0EA5E9' },
  { id: 'ops', name: 'OPS', role: 'Automate & Execute', color: '#10B981' },
  { id: 'finance', name: 'FINANCE', role: 'Analyze & Track', color: '#8B5CF6' },
];

const flowSteps = [
  { num: 1, title: 'YOU GIVE A REQUEST', desc: 'Natural language. No tech knowledge needed.' },
  { num: 2, title: 'WISE COMMAND', desc: 'Understands intent and routes the task.' },
  { num: 3, title: 'SPECIALIZED AGENTS', desc: 'Research, create, operate, and prepare the work.' },
  { num: 4, title: 'APPROVAL CHECKPOINT', desc: 'You review and approve before action.' },
  { num: 5, title: 'EXECUTION', desc: 'Agents take action using APIs, apps, and computer control when needed.' },
  { num: 6, title: 'RESULTS + STORAGE', desc: 'Delivered and saved to your SAUCE VAULT for future use.' },
];

const advantages = [
  'Conversation is the interface',
  'Research + verify before action (OWL EYE)',
  'Approval checkpoints (you stay in control)',
  'Persistent workspace (SAUCE VAULT)',
  'API first, computer control as fallback',
  'Built for real business outcomes (not just demos)',
  'Full ecosystem: research, build, market, operate, grow',
  'Multiplex across apps (not one-size-fits-all)',
];

export default function HermesPage() {
  const [mounted, setMounted] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* HERO SECTION WITH LIVING HIVE VIDEO */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            muted
            loop
            playsInline
            onCanPlay={() => setVideoLoaded(true)}
            className="w-full h-full object-cover"
            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect fill='%23000' width='1920' height='1080'/%3E%3C/svg%3E"
          >
            <source src="https://cdn.wise2.net/assets/hero_depth_master_8177.mp4" type="video/mp4" />
          </video>

          {/* Dark Gradient Overlay for Text Legibility */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/40" />
        </div>

        {/* Content Overlay */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={videoLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-5xl mx-auto px-6 text-center"
        >
          {/* Logo + Tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={videoLoaded ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mb-8"
          >
            <div className="text-6xl font-black tracking-tight mb-2">WISE²</div>
            <div className="text-amber-400/90 text-sm font-light tracking-widest uppercase">
              THE AI BUSINESS OPERATING SYSTEM
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={videoLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-6xl md:text-7xl font-black mb-8 leading-tight tracking-tight"
          >
            Tell Us What Needs to Happen.
          </motion.h1>

          {/* Supporting Copy */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={videoLoaded ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            WISE² turns your request into researched, verified, approved and executed work—then compounds the result into reusable intelligence.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={videoLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button className="px-10 py-4 bg-amber-400 text-black font-bold text-lg rounded-lg hover:bg-amber-300 transition-all hover:shadow-2xl hover:shadow-amber-400/30">
              PUT WISE² TO WORK →
            </button>
            <button className="px-10 py-4 border-2 border-amber-400/50 text-white font-bold text-lg rounded-lg hover:border-amber-400 hover:bg-amber-400/5 transition-all">
              See the Hive at Work
            </button>
          </motion.div>

          {/* Support Line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={videoLoaded ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-12 text-sm text-white/50 tracking-widest uppercase"
          >
            Research + verify • Approval before action • Results reported back
          </motion.p>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div className="text-white/40 text-xs uppercase tracking-widest mb-2">Scroll to explore</div>
          <svg className="w-5 h-5 mx-auto text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* THE CONCEPT & ADVANTAGE */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-black border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* Concept */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="text-amber-400 text-sm font-bold uppercase tracking-widest mb-4">1. THE CONCEPT</div>
              <h2 className="text-4xl font-black mb-8">What We're Taking From This</h2>
              <ul className="space-y-3">
                {[
                  'Conversation is the interface',
                  'AI operates the computer/apps',
                  'Shows what it's doing',
                  'Completes real tasks',
                  'Reports back with results',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-amber-400 font-bold mt-1">✓</span>
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Advantage */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="text-purple-400 text-sm font-bold uppercase tracking-widest mb-4">2. WHERE WE GO FURTHER</div>
              <h2 className="text-4xl font-black mb-8">WISE² Advantage</h2>
              <ul className="space-y-3">
                {advantages.slice(0, 5).map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-green-400 font-bold mt-1">✓</span>
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Additional Advantages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            viewport={{ once: true }}
            className="mt-16 grid md:grid-cols-3 gap-6"
          >
            {advantages.slice(5).map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-lg border border-white/10 hover:border-white/20 transition">
                <span className="text-green-400 font-bold shrink-0">✓</span>
                <span className="text-white/70 text-sm">{item}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS - THE WISE² FLOW */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-gradient-to-b from-black via-black to-black border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="text-amber-400 text-sm font-bold uppercase tracking-widest mb-4">3. HOW IT WORKS</div>
            <h2 className="text-5xl font-black">The WISE² Flow</h2>
            <p className="text-white/60 text-lg mt-4">From your request to real results.</p>
          </motion.div>

          {/* Flow Steps Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {flowSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="group p-8 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl hover:border-amber-400/50 hover:bg-amber-400/5 transition-all"
              >
                <div className="text-4xl font-black text-amber-400/30 group-hover:text-amber-400/50 transition mb-4">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold mb-3 group-hover:text-amber-400 transition">{step.title}</h3>
                <p className="text-white/60 text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Flow Diagram Info */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center text-white/50 text-sm italic"
          >
            Your request flows through WISE Command → specialized agents (OWL EYE, SALES, CREATIVE, WEB, OPS, FINANCE) → approval checkpoint → execution → results stored in SAUCE VAULT
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SPECIALIZED AGENTS */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-black border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="text-purple-400 text-sm font-bold uppercase tracking-widest mb-4">5. SPECIALIZED AGENTS</div>
            <h2 className="text-5xl font-black">Different Agents. Different Skills. One Brain.</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {agents.map((agent, i) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="group"
              >
                <div
                  className="mb-6 p-8 rounded-xl border-2 transition-all flex items-center justify-center h-32 text-center hover:scale-105 cursor-pointer"
                  style={{
                    borderColor: agent.color + '40',
                    backgroundColor: agent.color + '08',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = agent.color + 'cc';
                    e.currentTarget.style.backgroundColor = agent.color + '15';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = agent.color + '40';
                    e.currentTarget.style.backgroundColor = agent.color + '08';
                  }}
                >
                  <div>
                    <div className="font-black text-2xl mb-2" style={{ color: agent.color }}>
                      {agent.id === 'owl-eye' ? '🦉' : agent.id === 'sales' ? '🎯' : agent.id === 'creative' ? '🎨' : agent.id === 'web' ? '🌐' : agent.id === 'ops' ? '⚙️' : '💰'}
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-1" style={{ color: agent.color }}>
                  {agent.name}
                </h3>
                <p className="text-white/60 text-sm">{agent.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* EVERY PART HAS A PURPOSE */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-gradient-to-b from-black to-black/95 border-t border-white/10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-5xl font-black mb-8"
          >
            Every Part Has a Purpose
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
            className="text-2xl text-white/60 leading-relaxed"
          >
            The hive is the metaphor: <span className="text-amber-400">many specialized workers, one coordinated intelligence, every part serving the whole.</span>
          </motion.p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SAUCE VAULT - PERSISTENT WORKSPACE */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-black border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-purple-900/20 to-black/40 border border-purple-500/30 rounded-2xl p-12 text-center"
          >
            <h2 className="text-4xl font-black mb-4">SAUCE VAULT</h2>
            <p className="text-purple-300 text-lg mb-6">Your Persistent Workspace</p>
            <p className="text-white/70 leading-relaxed">
              Every result, artifact, and decision is saved to your SAUCE VAULT. Search anytime. Reuse and build on it. The system learns from what you've done and makes you smarter.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* FINAL CTA */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 bg-gradient-to-b from-black via-black to-amber-950/10 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-5xl font-black mb-6"
          >
            Put WISE² To Work
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
            className="text-2xl text-white/70 mb-12"
          >
            What do you need done?
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button className="px-8 py-3 bg-amber-400 text-black font-bold rounded-lg hover:bg-amber-300 transition-all">
              Find me customers
            </button>
            <button className="px-8 py-3 bg-amber-400 text-black font-bold rounded-lg hover:bg-amber-300 transition-all">
              Build my website
            </button>
            <button className="px-8 py-3 border-2 border-amber-400/50 text-amber-400 font-bold rounded-lg hover:border-amber-400 hover:bg-amber-400/10 transition-all">
              Something else →
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            viewport={{ once: true }}
            className="mt-12 text-white/40 text-sm tracking-widest uppercase"
          >
            Research · Build · Market · Operate · Grow
          </motion.p>
        </div>
      </section>
    </div>
  );
}
