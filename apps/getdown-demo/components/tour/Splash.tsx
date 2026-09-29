'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { GetDownMark, PoweredByWise, WaterEdge } from '../shell/Brand';
import { useTour } from './TourProvider';

/** DEMO OPENING — the screen the owner sees first. */
export function Splash() {
  const [dismissed, setDismissed] = useState(false);
  const { start } = useTour();
  if (dismissed) return null;

  return (
    <div className="gd-canvas fixed inset-0 z-[100] flex items-center justify-center overflow-hidden px-6">
      <WaterEdge />
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-40 top-1/4 h-[520px] w-[520px] rounded-full bg-gd-electric/10 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-[420px] w-[420px] rounded-full bg-gd-neon/[0.07] blur-[120px]" />
      </div>

      <div className="relative w-full max-w-3xl animate-riseIn text-center">
        <div className="mb-10 flex items-center justify-center gap-6">
          <GetDownMark size="lg" />
          <span className="font-display text-3xl font-black text-gd-steel">×</span>
          <div className="text-left leading-none">
            <div className="chrome-text font-display text-5xl font-black uppercase italic">
              WISE<sup className="text-lg text-gd-neon">2</sup>
            </div>
            <div className="mt-1 font-display text-xs font-bold uppercase tracking-[0.5em] text-gd-neon">
              Revenue Engine
            </div>
          </div>
        </div>

        <h1 className="font-display text-4xl font-black uppercase tracking-tight text-white md:text-5xl">
          Your Business. <span className="text-gd-neon">Connected.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gd-chrome md:text-lg">
          One command center for leads, properties, crews, revenue, follow-up, documents,
          marketing, and growth.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={() => setDismissed(true)}
            className="group inline-flex items-center gap-2 rounded-xl border border-gd-electric/50 bg-gd-electric/15 px-7 py-3.5 font-display text-sm font-extrabold uppercase tracking-[0.16em] text-gd-electric transition-all hover:bg-gd-electric/25 hover:shadow-glow-electric"
          >
            Enter Command Center
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => {
              setDismissed(true);
              start();
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-gd-neon/45 bg-gd-neon/12 px-7 py-3.5 font-display text-sm font-extrabold uppercase tracking-[0.16em] text-gd-neon transition-all hover:bg-gd-neon/22 hover:shadow-glow-neon"
          >
            <Play className="h-4 w-4 fill-current" />
            Start Voice-Guided Tour
          </button>
        </div>
        <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-gd-steel/70">
          The guide narrates each screen aloud · turn your volume up
        </p>

        <p className="mt-8 font-display text-xs font-bold uppercase tracking-[0.4em] text-gd-steel">
          Power. Precision. Clean.
        </p>
        <div className="mt-4 flex items-center justify-center">
          <PoweredByWise />
        </div>
        <p className="mx-auto mt-6 max-w-lg text-[11px] leading-relaxed text-gd-steel/70">
          Owner demonstration environment. All customers, properties, and financial figures shown
          are simulated demo data and do not represent actual Get Down Pressure Washing results.
        </p>
      </div>
    </div>
  );
}

/** DEMO CLOSING — shown when the guided tour completes. */
const CLOSING_NARRATION =
  'Get Down is already the business. WISE squared just builds the system around it. More leads captured. More estimates followed up. More recurring revenue protected. Less administrative work. Better visibility. And growth you control, instead of growth that happens to you.';

export function Closing() {
  const { finished, dismissFinish, start, voice } = useTour();
  const { speakTrack } = voice;

  useEffect(() => {
    if (finished) {
      const t = setTimeout(() => speakTrack('closing', CLOSING_NARRATION), 500);
      return () => clearTimeout(t);
    }
  }, [finished, speakTrack]);

  if (!finished) return null;

  const outcomes = [
    'More leads captured.',
    'More estimates followed up.',
    'More recurring revenue protected.',
    'Less administrative work.',
    'Better visibility.',
    'Controlled growth.',
  ];

  return (
    <div className="gd-canvas fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto px-6 py-12">
      <WaterEdge />
      <div className="relative w-full max-w-3xl animate-riseIn text-center">
        <h1 className="font-display text-3xl font-black uppercase leading-tight tracking-tight text-white md:text-4xl">
          Get Down is already the business.
        </h1>
        <p className="mt-3 font-display text-3xl font-black uppercase leading-tight tracking-tight text-gd-neon md:text-4xl">
          WISE<sup className="text-base">2</sup> builds the system around it.
        </p>

        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-2.5 sm:grid-cols-2">
          {outcomes.map((o) => (
            <div
              key={o}
              className="gd-panel flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-white"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gd-neon shadow-glow-neon" />
              {o}
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={dismissFinish}
            className="group inline-flex items-center gap-2 rounded-xl border border-gd-neon/50 bg-gd-neon/18 px-8 py-4 font-display text-base font-black uppercase tracking-[0.16em] text-gd-neon transition-all hover:bg-gd-neon/28 hover:shadow-glow-neon"
          >
            Let&apos;s Build Get Down OS
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={start}
            className="rounded-xl border border-white/12 px-6 py-4 font-display text-xs font-bold uppercase tracking-[0.16em] text-gd-steel transition-colors hover:bg-white/5 hover:text-white"
          >
            Replay Tour
          </button>
        </div>

        <div className="mt-10 flex items-center justify-center gap-5 opacity-70">
          <GetDownMark size="sm" />
          <span className="text-gd-steel">×</span>
          <PoweredByWise />
        </div>
      </div>
    </div>
  );
}
