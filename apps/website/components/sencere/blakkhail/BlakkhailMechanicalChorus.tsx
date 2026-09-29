'use client';

import { useEffect, useState } from 'react';
import { CINEMATIC_TIMING, MECHANICAL_CHORUS_STEPS } from './blakkhail-experience';
import { BLAKKHAIL } from './brand-tokens';
import styles from './blakkhail-cinematic.module.css';

interface BlakkhailMechanicalChorusProps {
  onComplete?: () => void;
}

export function BlakkhailMechanicalChorus({ onComplete }: BlakkhailMechanicalChorusProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (activeIndex >= MECHANICAL_CHORUS_STEPS.length) {
      const silenceTimer = window.setTimeout(() => {
        setFinished(true);
        onComplete?.();
      }, CINEMATIC_TIMING.chorusSilenceMs);
      return () => window.clearTimeout(silenceTimer);
    }

    const timer = window.setTimeout(() => {
      setActiveIndex((i) => i + 1);
    }, CINEMATIC_TIMING.chorusStepMs);

    return () => window.clearTimeout(timer);
  }, [activeIndex, onComplete]);

  if (finished) return null;

  const current = MECHANICAL_CHORUS_STEPS[Math.min(activeIndex, MECHANICAL_CHORUS_STEPS.length - 1)];

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(3, 3, 3, 0.98)' }}
      role="status"
      aria-live="polite"
      aria-label="Manufacturing in progress"
    >
      <p
        className="mb-2 text-[10px] font-bold uppercase tracking-[0.5em]"
        style={{ color: BLAKKHAIL.steel }}
      >
        Silence
      </p>
      <p
        className="mb-8 text-xs font-bold uppercase tracking-[0.4em]"
        style={{ color: BLAKKHAIL.gold }}
      >
        The Mechanical Chorus
      </p>

      {/* Active step — large */}
      <div
        key={activeIndex}
        className="mb-8 rounded-sm border px-8 py-6 text-center"
        style={{
          borderColor: BLAKKHAIL.gold,
          backgroundColor: BLAKKHAIL.gunmetal,
          boxShadow: '0 0 40px rgba(214, 163, 49, 0.25)',
          animation: 'bhChorusFlash 0.38s ease-out',
        }}
      >
        <p className="text-3xl sm:text-4xl" aria-hidden>
          {current.icon}
        </p>
        <p
          className="mt-2 text-lg font-black uppercase tracking-[0.14em] sm:text-2xl"
          style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}
        >
          {current.label}
        </p>
      </div>

      {/* Progress grid */}
      <div className="grid max-w-2xl grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
        {MECHANICAL_CHORUS_STEPS.map((step, index) => {
          const isPast = index < activeIndex;
          const isCurrent = index === activeIndex;
          return (
            <div
              key={step.label}
              className="rounded-sm border px-2 py-2 text-center text-[9px] font-bold uppercase tracking-wider sm:text-[10px]"
              style={{
                borderColor: isCurrent ? BLAKKHAIL.gold : isPast ? BLAKKHAIL.darkGold : BLAKKHAIL.gunmetal,
                color: isCurrent ? BLAKKHAIL.gold : isPast ? BLAKKHAIL.steel : '#555',
                backgroundColor: isCurrent ? BLAKKHAIL.gunmetal : BLAKKHAIL.jetBlack,
                opacity: isPast ? 0.5 : 1,
              }}
            >
              {step.label}
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-sm uppercase tracking-[0.25em]" style={{ color: BLAKKHAIL.steel }}>
        {activeIndex < MECHANICAL_CHORUS_STEPS.length ? 'Building…' : 'Lock releasing…'}
      </p>

      <style jsx global>{`
        @keyframes bhChorusFlash {
          0% { opacity: 0; transform: scale(0.92); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
