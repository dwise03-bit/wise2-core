'use client';

import { useEffect, useRef, useState } from 'react';
import { Cpu, Mic, Drum, SlidersHorizontal, Disc3, Play, ArrowRight } from 'lucide-react';
import { useSoundLabModals } from '../SoundLabModals';

const CHIPS = [
  { label: 'AI PRODUCTION', icon: Cpu },
  { label: 'VOCALS', icon: Mic },
  { label: 'BEATS', icon: Drum },
  { label: 'MIXING', icon: SlidersHorizontal },
  { label: 'MASTERING', icon: Disc3 },
];

// Identity-locked founder portraits. Drop approved blue studio shots at the
// `/soundlab/*` paths to override; until then we blue-grade the existing photos.
const FOUNDERS = [
  { name: 'Daniel', role: 'FOUNDER', src: '/uploads/daniel.png', side: 'left' as const },
  { name: 'Darrin', role: 'CO-FOUNDER', src: '/uploads/darrin.png', side: 'right' as const },
];

function Spectrum() {
  const [bars, setBars] = useState<number[]>(() =>
    Array.from({ length: 56 }, (_, i) => 20 + Math.round(40 * Math.abs(Math.sin(i * 0.6))))
  );
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let last = 0;
    const tick = (t: number) => {
      if (t - last > 90) {
        last = t;
        setBars((prev) =>
          prev.map((v, i) => {
            const target = 12 + 78 * Math.abs(Math.sin(t / 650 + i * 0.4));
            return Math.round(v + (target - v) * 0.35);
          })
        );
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);
  return (
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center gap-[3px] h-56 opacity-30 pointer-events-none" aria-hidden="true">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-[4px] rounded-full bg-gradient-to-t from-[#008CFF]/0 via-[#008CFF] to-[#24C8FF]"
          style={{ height: `${h}%`, transition: 'height 90ms linear' }}
        />
      ))}
    </div>
  );
}

function FounderFrame({ name, role, src, side }: (typeof FOUNDERS)[number]) {
  return (
    <div className="relative hidden lg:block w-[22%] self-end">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-[#24C8FF]/15 bg-[#071321]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`${name}, ${role} of WISE² Sound Lab`}
          className="absolute inset-0 w-full h-full object-cover object-top grayscale contrast-110 brightness-110"
        />
        {/* blue duotone tint — keeps identity, matches the studio direction */}
        <div className="absolute inset-0 bg-[#0a66c2] mix-blend-color opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#008CFF]/15 to-transparent mix-blend-screen opacity-50" />
        {/* depth + edge fades for cohesion */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#02050A] via-[#02050A]/15 to-transparent" />
        <div
          className={`absolute inset-0 ${
            side === 'left'
              ? 'bg-gradient-to-r from-transparent to-[#02050A]/75'
              : 'bg-gradient-to-l from-transparent to-[#02050A]/75'
          }`}
        />
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#24C8FF]/25 shadow-[0_0_44px_rgba(0,140,255,0.3)]" />
      </div>
      <div className={`mt-3 ${side === 'left' ? 'text-left' : 'text-right'}`}>
        <p className="text-lg font-semibold text-[#8BE8FF]" style={{ fontFamily: 'cursive' }}>
          {name}
        </p>
        <p className="text-[10px] font-bold tracking-[0.3em] text-[#8D9BAC]">{role}</p>
      </div>
    </div>
  );
}

export function StudioHero() {
  const { openIntake } = useSoundLabModals();

  return (
    <section
      id="home"
      className="relative pt-16 overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #041326 0%, #02050A 60%)' }}
    >
      {/* grid texture */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(36,200,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(36,200,255,0.04)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <Spectrum />

      {/* side script (desktop) */}
      <p
        className="hidden 2xl:block absolute right-6 top-1/2 -translate-y-1/2 text-[#8BE8FF]/70 text-2xl leading-tight text-right rotate-0"
        style={{ fontFamily: 'cursive' }}
      >
        Make<br />Create<br />Record<br />Mix<br />Release<br />Without<br />Limits.
      </p>

      <div className="relative max-w-[1600px] mx-auto px-4 md:px-6 pt-10 pb-12">
        <div className="flex items-stretch justify-center gap-6">
          <FounderFrame {...FOUNDERS[0]} />

          {/* Center stage */}
          <div className="flex-1 max-w-3xl text-center pt-6 pb-4">
            <h1 className="relative">
              <span
                className="block text-6xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[0.9]"
                style={{
                  backgroundImage: 'linear-gradient(180deg,#F7FBFF 0%,#9fb2c6 42%,#5a6b7e 55%,#e8eef5 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  filter: 'drop-shadow(0 2px 10px rgba(0,140,255,0.25))',
                }}
              >
                WISE<sup className="text-[0.45em] align-super">2</sup>
              </span>
              <span className="block mt-1 text-3xl sm:text-4xl md:text-5xl font-black tracking-[0.18em] text-[#24C8FF] drop-shadow-[0_0_24px_rgba(36,200,255,0.5)]">
                SOUND LAB
              </span>
            </h1>

            <p className="mt-4 text-[11px] sm:text-xs font-bold tracking-[0.35em] text-[#8D9BAC]">
              IDEAS <span className="text-[#24C8FF]">✕</span> MUSIC{' '}
              <span className="text-[#24C8FF]">✕</span> REALITY
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {CHIPS.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#071321]/70 border border-[#24C8FF]/15 text-[10px] font-bold tracking-wide text-[#8BE8FF]"
                >
                  <Icon size={12} className="text-[#24C8FF]" />
                  {label}
                </span>
              ))}
            </div>

            <p className="mt-5 text-[11px] font-semibold tracking-[0.15em] text-[#8D9BAC]">
              REAL MUSIC. POWERED BY AI. BUILT FOR CREATORS. OWNED BY WISE².
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => openIntake()}
                className="flex items-center gap-2 h-12 pl-6 pr-5 rounded-xl bg-gradient-to-r from-[#008CFF] to-[#24C8FF] text-[#02050A] text-sm font-black tracking-wide hover:shadow-[0_0_34px_rgba(36,200,255,0.5)] transition-shadow cursor-pointer"
              >
                CREATE WITH WISE²
                <ArrowRight size={17} />
              </button>
              <button
                onClick={() => document.querySelector('#samples')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 h-12 px-6 rounded-xl bg-[#071321]/70 border border-[#24C8FF]/25 text-[#F7FBFF] text-sm font-black tracking-wide hover:border-[#24C8FF]/60 transition-colors cursor-pointer"
              >
                <Play size={15} fill="currentColor" strokeWidth={0} />
                WATCH DEMO
              </button>
            </div>
          </div>

          <FounderFrame {...FOUNDERS[1]} />
        </div>
      </div>
    </section>
  );
}
