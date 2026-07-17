'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import IntakeForm from '@/components/IntakeForm';
import { ArrowRight, Sparkles, Radio, MessageCircle, PlayCircle, CheckCircle2 } from 'lucide-react';

const stats = [
  { label: 'Live viewers', value: '358' },
  { label: 'Projects live', value: '4' },
  { label: 'Community online', value: '1,247' },
];

const pillars = [
  {
    icon: Radio,
    title: 'Live Production',
    copy: 'A real-time command surface for launches, streams, and creative sessions.',
  },
  {
    icon: MessageCircle,
    title: 'Live Chat',
    copy: 'Keep the conversation moving with a support path that is always one click away.',
  },
  {
    icon: Sparkles,
    title: 'Glass Workflow',
    copy: 'Every panel, button, and CTA is built to feel like the cockpit in your reference.',
  },
];

const featuredSteps = [
  'Open the studio workspace',
  'Start a live session or record a new take',
  'Use chat and intake when you need support',
  'Move into the studio without friction',
];

export default function LiveStudioLandingPage() {
  const [intakeOpen, setIntakeOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#03060d] text-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,120,255,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(140,40,255,0.18),transparent_24%),linear-gradient(180deg,#03060d_0%,#050b17_45%,#02050a_100%)]" />
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      <main className="relative z-10">
        <section className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-20">
          <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200 backdrop-blur-xl">
                <CheckCircle2 className="h-4 w-4" />
                Live studio online
              </div>

              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">WISE² SOUND LABS</p>
                <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
                  A glass command center for live creation.
                </h1>
                <p className="max-w-2xl text-lg text-slate-300 md:text-xl">
                  This is the landing page for the live studio experience. From here, creators can enter the workspace, start a session, or open support without losing momentum.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/studio"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#00d9ff,#005eff)] px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(0,153,255,0.25)] transition hover:brightness-110"
                >
                  Enter Studio
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/soundlab"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/10"
                >
                  Explore SoundLab
                  <PlayCircle className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setIntakeOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-6 py-4 text-sm font-semibold text-slate-200 backdrop-blur-xl transition hover:bg-white/5"
                >
                  Request Access
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[24px] border border-cyan-400/15 bg-white/5 p-4 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,153,255,0.08)]"
                  >
                    <div className="text-xs uppercase tracking-[0.35em] text-slate-500">{item.label}</div>
                    <div className="mt-2 text-2xl font-bold text-white">{item.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-4"
            >
              <div className="rounded-[32px] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(8,15,28,0.92),rgba(3,7,16,0.98))] p-4 shadow-[0_0_60px_rgba(0,153,255,0.12)] backdrop-blur-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.35em] text-slate-400">Live studio preview</div>
                    <div className="text-xl font-semibold text-white">Real-time. No filters.</div>
                  </div>
                  <span className="rounded-full border border-red-400/40 bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-300">
                    LIVE
                  </span>
                </div>
                <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_center,_rgba(0,153,255,0.28),transparent_26%),linear-gradient(180deg,#0b1424_0%,#020611_100%)]">
                  <div className="aspect-[16/10]" />
                  <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-black/55 p-4 backdrop-blur">
                    <div className="text-[10px] uppercase tracking-[0.4em] text-slate-400">Now building</div>
                    <div className="text-lg font-semibold text-white">Urban Grind Brand Anthem</div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-300">
                      <span>00:42:17 elapsed</span>
                      <span>358 viewers</span>
                      <span>Chat active</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {pillars.map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <div
                      key={pillar.title}
                      className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-2xl"
                    >
                      <div className="mb-3 inline-flex rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3 text-cyan-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-sm font-semibold text-white">{pillar.title}</div>
                      <p className="mt-2 text-sm text-slate-400">{pillar.copy}</p>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-[28px] border border-fuchsia-500/20 bg-white/5 p-5 backdrop-blur-2xl shadow-[0_0_50px_rgba(163,70,255,0.08)]">
                <div className="mb-3 text-sm font-semibold text-white">How it works</div>
                <ol className="space-y-3 text-sm text-slate-300">
                  {featuredSteps.map((step, index) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-500/10 text-xs font-bold text-cyan-200">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div
                id="support"
                className="rounded-[28px] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(8,15,28,0.92),rgba(3,7,16,0.98))] p-5 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,153,255,0.08)]"
              >
                <div className="text-sm font-semibold text-white">Need help live?</div>
                <p className="mt-2 text-sm text-slate-400">
                  Use the floating chat bubble anytime to jump back here and request access, support, or a live walkthrough.
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setIntakeOpen(true)}
                    className="rounded-2xl bg-[linear-gradient(135deg,#00d9ff,#005eff)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                  >
                    Open Intake
                  </button>
                  <Link
                    href="/"
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <IntakeForm isOpen={intakeOpen} onClose={() => setIntakeOpen(false)} />
    </div>
  );
}
