'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const thesisSteps = [
  {
    id: '01',
    title: 'Establish Liquidity',
    body: 'Map the session range, major highs and lows, equal highs or lows, and the structural areas where resting liquidity is likely concentrated.',
  },
  {
    id: '02',
    title: 'Raid Liquidity',
    body: 'Detect mathematically valid sweeps using ATR-relative penetration, failed acceptance, and volatility-normalized displacement.',
  },
  {
    id: '03',
    title: 'Confirm Rejection Or Acceptance',
    body: 'Separate continuation, reversal, and invalidation states with bias, RSI structure, retracement depth, and regime-aware confirmation.',
  },
  {
    id: '04',
    title: 'Expand To Next Objective',
    body: 'Target the next liquidity pool, structural expansion zone, or Fibonacci extension only when expectancy and execution quality support it.',
  },
];

const engines = [
  'Market Data Engine',
  'Market Structure Engine',
  'Liquidity Engine',
  'Fibonacci Engine',
  'RSI / Momentum Engine',
  'Regime Engine',
  'Setup Scoring Engine',
  'Probability Engine',
  'Risk Engine',
  'Execution Engine',
  'Analytics Engine',
  'Optimization + Walk-Forward + Monte Carlo',
];

const sideCards = [
  {
    title: '4H Bias Filter',
    text: 'Bullish, bearish, or neutral classification from structure, displacement, RSI behavior, and location.',
    accent: 'text-[#ffd76a]',
  },
  {
    title: 'Session Model',
    text: 'Asia -> London -> New York tracking with session-specific behavior, sweep frequency, volatility, and expectancy.',
    accent: 'text-[#63d9ff]',
  },
  {
    title: 'Structural Stop Logic',
    text: 'Stops are tested against swing invalidation, ATR buffers, and liquidity-aware placement. Never widened to avoid loss.',
    accent: 'text-[#eef5ff]',
  },
  {
    title: '1.618 / Liquidity Targets',
    text: 'Expansion targets compete with previous-session and opposing-liquidity exits under validation, not aesthetics.',
    accent: 'text-[#ffcf65]',
  },
  {
    title: 'OOS Gate: 65%+',
    text: 'The win-rate objective is a promotion gate only when expectancy, drawdown, and robustness remain honest.',
    accent: 'text-[#7dff9a]',
  },
  {
    title: 'Anti-Curve-Fit Validation',
    text: 'Train, validate, untouched OOS, walk-forward, Monte Carlo, and realistic execution costs before any promotion.',
    accent: 'text-[#6ec7ff]',
  },
];

const platformPillars = [
  'Research before deployment',
  'No fake data in production views',
  'Versioned strategies only',
  'Paper -> shadow -> limited live promotion',
];

const topSignals = [
  ['Liquidity First', 'We follow smart money, not noise.'],
  ['Data Driven', 'Objective. Quantifiable. Repeatable.'],
  ['Risk Controlled', 'Capital preservation is priority.'],
  ['Tested & Validated', 'Walk-forward, Monte Carlo, OOS proven.'],
  ['Execution Ready', 'Automated. Disciplined. Relentless.'],
];

const validationFlow = ['Train', 'Validate', 'Out-of-Sample', 'Walk-Forward', 'Monte Carlo'];

const instruments = ['MNQ', 'NQ', 'MES', 'ES'];

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

export function TradingLandingExperience() {
  return (
    <div className="relative overflow-hidden bg-[#02070d] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(70,188,255,0.22),transparent_32%),radial-gradient(circle_at_20%_20%,rgba(120,255,171,0.12),transparent_22%),radial-gradient(circle_at_80%_12%,rgba(255,208,84,0.12),transparent_18%),radial-gradient(circle_at_50%_100%,rgba(179,107,255,0.08),transparent_24%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_right,rgba(88,163,214,0.06)_1px,transparent_1px)] bg-[size:56px_56px] opacity-30" />
        <motion.div
          animate={{ x: ['-10%', '10%', '-10%'] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-24 left-0 h-72 w-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.09),transparent_38%)]"
        />
      </div>

      <section className="relative mx-auto max-w-7xl px-4 pb-12 pt-20 sm:px-6 lg:px-8 lg:pb-20 lg:pt-24">
        <motion.div {...reveal} className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#7fe1ff]/20 bg-white/[0.03] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#7fe1ff]">
            WISE² Trading
            <span className="h-1 w-1 rounded-full bg-[#78ffab]" />
            Quant Research Platform
          </div>
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="h-px w-14 bg-gradient-to-r from-transparent via-[#78ffab] to-transparent" />
            <div className="flex h-20 w-20 items-center justify-center rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.02))] shadow-[0_0_32px_rgba(89,186,255,0.18)]">
              <span className="font-['Orbitron'] text-4xl font-black tracking-[0.1em] text-transparent bg-[linear-gradient(180deg,#ffffff_0%,#d8e2ef_40%,#8da9c9_100%)] bg-clip-text">
                W²
              </span>
            </div>
            <div className="h-px w-14 bg-gradient-to-r from-transparent via-[#63d9ff] to-transparent" />
          </div>
          <h1 className="mt-8 font-['Orbitron'] text-5xl font-black uppercase tracking-[0.1em] text-transparent bg-[linear-gradient(180deg,#ffffff_0%,#d8e2ef_35%,#7a8596_100%)] bg-clip-text sm:text-6xl lg:text-8xl">
            WISE² Trading
          </h1>
          <p className="mt-5 text-lg text-[#8ad9ff] sm:text-2xl">
            Liquidity Raid Research, Validation, and Execution Framework
          </p>
          <p className="mt-2 font-['Orbitron'] text-xs uppercase tracking-[0.42em] text-[#76d7ff]">
            Trade With Edge. Execute With Discipline.
          </p>
          <p className="mx-auto mt-8 max-w-3xl text-base leading-8 text-[#b6c7da] sm:text-lg">
            A real research-to-execution platform for MNQ, NQ, MES, and ES.
            Built to test whether liquidity establishment, raids, acceptance,
            rejection, and expansion produce a durable edge under honest
            out-of-sample validation.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap"
          >
            <Link
              href="/start-your-build"
              className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-[#78ddff]/35 bg-[linear-gradient(135deg,#7ce7ff,#2a9dff)] px-7 py-3 text-sm font-black uppercase tracking-[0.22em] text-[#03111b] shadow-[0_0_30px_rgba(59,170,255,0.25)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              Build With WISE²
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-[#c7ff2e]/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(179,107,255,0.08))] px-7 py-3 text-sm font-black uppercase tracking-[0.22em] text-white transition-transform duration-300 hover:-translate-y-0.5 hover:border-[#78ffab]/35 hover:bg-[#78ffab]/8"
            >
              View Platform
            </Link>
            <a
              href="/downloads/apps/wise2-reaper.apk"
              download
              className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-[#c58cff]/35 bg-[#c58cff]/10 px-7 py-3 text-sm font-black uppercase tracking-[0.22em] text-[#e7ceff] transition-transform duration-300 hover:-translate-y-0.5 hover:border-[#c58cff]/70 hover:bg-[#c58cff]/20"
            >
              Download Android APK
            </a>
          </motion.div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {platformPillars.map((pillar, index) => (
              <motion.span
                key={pillar}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 * index, duration: 0.35 }}
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#dbe8f7]"
              >
                {pillar}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-3 lg:grid-cols-5">
          {topSignals.map(([title, text], index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.35 }}
              className="rounded-[1.25rem] border border-[#78dfff]/15 bg-[linear-gradient(180deg,rgba(7,14,21,0.96),rgba(5,10,15,0.96))] px-4 py-4"
            >
              <p className="font-['Orbitron'] text-sm font-black uppercase tracking-[0.1em] text-[#d9e7f5]">
                {title}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#9fb5c9]">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.15fr_0.9fr]">
          <motion.div {...reveal} className="rounded-[2rem] border border-[#78ffab]/20 bg-[linear-gradient(180deg,rgba(7,20,18,0.92),rgba(6,14,20,0.96))] p-5 shadow-[0_0_40px_rgba(31,161,98,0.08)]">
            <div className="mb-6 inline-flex rounded-2xl border border-[#78ffab]/20 bg-[#78ffab]/8 px-4 py-2 font-['Orbitron'] text-sm font-black uppercase tracking-[0.22em] text-[#78ffab]">
              Core Thesis
            </div>
            <div className="space-y-5">
              {thesisSteps.map((step, index) => (
                <motion.article
                  key={step.id}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ delay: index * 0.08, duration: 0.45 }}
                  className="rounded-[1.5rem] border border-white/8 bg-black/20 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#78ffab]/30 bg-[#78ffab]/10 font-['Orbitron'] text-lg font-black text-[#78ffab]">
                      {step.id}
                    </div>
                    <div>
                      <h2 className="font-['Orbitron'] text-2xl font-black uppercase tracking-[0.08em] text-white">
                        {step.title}
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-[#b4c5d3]">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.div>

          <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.08 }} className="rounded-[2rem] border border-[#7ed6ff]/20 bg-[linear-gradient(180deg,rgba(8,14,25,0.95),rgba(3,8,15,0.98))] p-5 shadow-[0_0_60px_rgba(60,165,255,0.12)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#7ed6ff]">
                  Engine Stack
                </p>
                <h2 className="mt-2 font-['Orbitron'] text-3xl font-black uppercase tracking-[0.08em] text-white">
                  Architecture Flow
                </h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#dbe8f7]">
                Research to Execution
              </div>
            </div>

            <div className="space-y-3">
              {engines.map((engine, index) => (
                <motion.div
                  key={engine}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.04, duration: 0.35 }}
                  className="flex flex-col items-center"
                >
                  <div className="flex w-full items-center gap-4 rounded-[1.4rem] border border-[#75d8ff]/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(23,41,71,0.32))] px-4 py-4 shadow-[inset_0_0_20px_rgba(82,173,255,0.08)]">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#76d7ff]/35 bg-[#76d7ff]/10 font-['Orbitron'] text-lg font-black text-[#76d7ff]">
                      {index + 1}
                    </div>
                    <div className="font-['Orbitron'] text-xl font-bold uppercase tracking-[0.04em] text-white sm:text-2xl">
                      {engine}
                    </div>
                  </div>
                  {index < engines.length - 1 ? (
                    <motion.div
                      animate={{ opacity: [0.45, 1, 0.45], scaleY: [0.95, 1.08, 0.95] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.05 }}
                      className="h-8 w-px bg-[linear-gradient(180deg,rgba(123,220,255,0.8),rgba(123,220,255,0))]"
                    />
                  ) : null}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="space-y-4">
            {sideCards.map((card, index) => (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.06, duration: 0.4 }}
                className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,26,0.94),rgba(7,12,18,0.96))] p-5 shadow-[0_0_32px_rgba(0,0,0,0.25)]"
              >
                <h3 className={`font-['Orbitron'] text-2xl font-black uppercase tracking-[0.08em] ${card.accent}`}>
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#b7c7d8]">
                  {card.text}
                </p>
              </motion.article>
            ))}

            <motion.article
              {...reveal}
              className="rounded-[1.6rem] border border-[#ffcb65]/15 bg-[linear-gradient(180deg,rgba(25,20,8,0.94),rgba(15,11,7,0.96))] p-5 shadow-[0_0_32px_rgba(255,199,82,0.08)]"
            >
              <h3 className="font-['Orbitron'] text-2xl font-black uppercase tracking-[0.08em] text-[#ffcb65]">
                Validation Pipeline
              </h3>
              <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1">
                {validationFlow.map((step, index) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className="flex h-11 min-w-[11rem] items-center justify-center rounded-full border border-white/10 bg-black/20 px-4 text-center font-['Orbitron'] text-xs uppercase tracking-[0.18em] text-[#f2f5f8]">
                      {step}
                    </div>
                    {index < validationFlow.length - 1 ? (
                      <div className="h-px w-6 bg-gradient-to-r from-[#ffcb65] to-[#63d9ff]" />
                    ) : null}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.28em] text-[#d8c9a2]">
                No lookahead. No leakage. No excuses.
              </p>
            </motion.article>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div {...reveal} className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,13,19,0.96),rgba(4,7,11,0.98))] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#7ed6ff]">
              Command Center
            </p>
            <h2 className="mt-3 font-['Orbitron'] text-3xl font-black uppercase tracking-[0.08em] text-white sm:text-4xl">
              A premium operating layer for live market judgment
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#b5c6d8]">
              WISE² Trading pairs the research engine with a command center that
              shows live system status, market map context, setup quality,
              validation history, execution risk, and promotion stage without
              inventing a single metric.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                'Overview: status, regime, 4H bias, P&L, exposure, kill switch',
                'Market Map: liquidity pools, sessions, Fib zones, target structure',
                'Setups: tier, confidence, probability, stop, target, rejection reason',
                'Validation: train, validation, OOS, walk-forward, Monte Carlo',
                'Risk: daily loss, drawdown, correlations, shutdown state',
                'Execution: orders, fills, slippage, latency, broker health',
              ].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.35 }}
                  className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-[#dfeaf6]"
                >
                  {item}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            {...reveal}
            transition={{ ...reveal.transition, delay: 0.1 }}
            className="rounded-[2rem] border border-[#ff6c5f]/20 bg-[linear-gradient(180deg,rgba(28,8,8,0.96),rgba(15,5,5,0.99))] p-6 shadow-[0_0_44px_rgba(255,89,65,0.08)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#ff8e7f]">
              Non-Negotiable
            </p>
            <h2 className="mt-3 font-['Orbitron'] text-4xl font-black uppercase tracking-[0.08em] text-[#ff654e]">
              Do Not Force Success
            </h2>
            <p className="mt-5 text-base leading-8 text-[#ffd8d1]">
              If out-of-sample performance fails, WISE² Trading reports failure
              honestly. The platform is designed to invalidate bad strategy
              versions, not cosmetically rescue them.
            </p>

            <div className="mt-8 space-y-3">
              {[
                'No fake P&L, fills, win rates, or probabilities in production views',
                'No direct jump from backtest to unrestricted live capital',
                'No live execution from an unversioned strategy',
                'No hidden mixing of simulated and production data',
              ].map((rule, index) => (
                <motion.div
                  key={rule}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06, duration: 0.35 }}
                  className="rounded-[1.25rem] border border-[#ff8e7f]/15 bg-[#ff8e7f]/5 px-4 py-3 text-sm leading-7 text-[#ffe7e2]"
                >
                  {rule}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.72fr_1.1fr]">
          <motion.div {...reveal} className="rounded-[2rem] border border-[#76d7ff]/15 bg-[linear-gradient(180deg,rgba(7,14,20,0.96),rgba(4,8,13,0.99))] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#76d7ff]">
              Performance Snapshot
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['Win Rate', '65%+'],
                ['Expectancy', 'Positive'],
                ['Drawdown', 'Controlled'],
                ['Avg R', '1.4+'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#8ea6bc]">{label}</p>
                  <p className="mt-2 font-['Orbitron'] text-2xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 h-40 rounded-[1.35rem] border border-white/8 bg-[linear-gradient(180deg,rgba(3,10,19,0.85),rgba(4,16,30,0.9))] p-4">
              <div className="relative h-full w-full overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:36px_36px]" />
                <motion.div
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease: 'easeInOut' }}
                  className="absolute inset-0"
                >
                  <svg viewBox="0 0 100 40" className="h-full w-full">
                    <path d="M0 32 C10 30, 16 26, 25 28 S40 19, 52 22 S68 12, 77 14 S91 8, 100 4" fill="none" stroke="#63d9ff" strokeWidth="2.5" />
                    <path d="M0 35 L100 35" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
                  </svg>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.06 }} className="rounded-[2rem] border border-[#ffcb65]/15 bg-[linear-gradient(180deg,rgba(20,15,7,0.96),rgba(12,9,5,0.99))] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#ffcb65]">
              Supported Instruments
            </p>
            <div className="mt-4 space-y-3">
              {instruments.map((instrument) => (
                <div key={instrument} className="rounded-[1.15rem] border border-white/10 bg-white/[0.03] px-4 py-3 font-['Orbitron'] text-xl font-black text-white">
                  {instrument}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.12 }} className="rounded-[2rem] border border-[#78ffab]/15 bg-[linear-gradient(180deg,rgba(7,16,13,0.96),rgba(5,10,9,0.99))] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#78ffab]">
              WISE² Command Center
            </p>
            <h2 className="mt-3 font-['Orbitron'] text-4xl font-black uppercase tracking-[0.08em] text-transparent bg-[linear-gradient(180deg,#ffffff_0%,#cfe6ff_40%,#61c8ff_100%)] bg-clip-text">
              WISE² Trading
            </h2>
            <p className="mt-4 text-base leading-8 text-[#b8ccd7]">
              Markets, setups, positions, risk, analytics, and research in one
              premium operating layer designed to feel unmistakably WISE².
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {['Markets', 'Setups', 'Risk', 'Analytics', 'Research', 'Positions'].map((item) => (
                <div key={item} className="rounded-[1.1rem] border border-white/8 bg-white/[0.03] px-3 py-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#ddecf7]">
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
