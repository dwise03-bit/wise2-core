'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Sparkles, Volume2, VolumeX, X } from 'lucide-react';
import { ClocheMark } from '@/components/ui';
import { useFergieTour } from '@/contexts/TourContext';
import { useSavoreSpeech } from '@/lib/speech';

type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export function FergieTourOverlay() {
  const { active, step, index, steps, next, prev, stop } = useFergieTour();
  const pathname = usePathname();
  const [rect, setRect] = useState<SpotlightRect | null>(null);
  const { supported, speaking, enabled, speak, cancel, toggle } = useSavoreSpeech();
  const indexRef = useRef(index);
  indexRef.current = index;

  useEffect(() => {
    if (!active || !step?.anchor) {
      setRect(null);
      return;
    }

    const measure = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.anchor}"]`);
      if (!el) {
        setRect(null);
        return;
      }
      const bounds = el.getBoundingClientRect();
      setRect({
        top: bounds.top - 8,
        left: bounds.left - 8,
        width: bounds.width + 16,
        height: bounds.height + 16,
      });
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const timer = setTimeout(measure, 280);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [active, step, pathname]);

  useEffect(() => {
    if (!active || !step) {
      cancel();
      return;
    }
    const stepIndex = index;
    const last = index >= steps.length - 1;
    const t = window.setTimeout(() => {
      const startedAt = Date.now();
      speak(step.voice, () => {
        if (last) return;
        if (Date.now() - startedAt < 1200) return;
        window.setTimeout(() => {
          if (indexRef.current === stepIndex) next();
        }, 450);
      });
    }, 220);
    return () => {
      window.clearTimeout(t);
      cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, step?.id, index]);

  if (!active || !step) return null;

  const goNext = () => {
    cancel();
    next();
  };
  const goPrev = () => {
    cancel();
    prev();
  };
  const goStop = () => {
    cancel();
    stop();
  };

  return (
    <>
      {rect ? (
        <div
          className="pointer-events-none fixed z-[60] rounded-2xl transition-all duration-500"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            boxShadow:
              '0 0 0 2px rgba(255, 215, 0, 0.85), 0 0 0 9999px rgba(10, 10, 10, 0.78), 0 0 32px rgba(106, 34, 226, 0.4)',
          }}
        />
      ) : (
        <div className="pointer-events-none fixed inset-0 z-[60] bg-fergie-black/70" />
      )}

      <div className="fixed bottom-[max(7rem,env(safe-area-inset-bottom))] left-1/2 z-[70] w-[min(420px,calc(100vw-1.5rem))] -translate-x-1/2">
        <div className="glass-panel border-fergie-gold/30 p-4 shadow-glow-gold">
          <div className="mb-3 flex items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-fergie-royal/30 ${
                speaking ? 'voice-pulse' : ''
              }`}
            >
              <ClocheMark className="h-6 w-6" spinning={speaking} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-fergie-gold">
                Savôré · Step {index + 1}
              </p>
              <h3 className="font-serif text-lg font-bold">{step.title}</h3>
              {speaking && (
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-fergie-rose">Savôré is speaking</p>
              )}
            </div>
            {supported && (
              <button
                type="button"
                onClick={toggle}
                className="rounded-full border border-white/10 p-1.5 text-fergie-gold hover:bg-fergie-gold/10"
                aria-label={enabled ? 'Mute voice' : 'Unmute voice'}
              >
                {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
            )}
            <button
              type="button"
              onClick={goStop}
              className="rounded-full border border-white/10 p-1.5 text-white/50 hover:text-white"
              aria-label="Exit tour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-sm leading-relaxed text-white/90">{step.voice}</p>
          <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-fergie-rose">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fergie-gold" />
            {step.tip}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {steps.map((s, i) => (
                <div
                  key={s.id}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    i < index ? 'bg-fergie-gold/50' : i === index ? 'bg-fergie-gold' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
            <span className="shrink-0 text-[10px] text-white/40">
              {index + 1}/{steps.length}
            </span>
          </div>

          <div className="mt-3 flex gap-2">
            <button type="button" onClick={goStop} className="rounded-xl px-3 py-2.5 text-xs text-white/40 hover:text-white/70">
              Skip
            </button>
            <button
              type="button"
              onClick={goPrev}
              disabled={index === 0}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="button"
              onClick={goNext}
              className="flex flex-[2] items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-fergie-royal to-fergie-gold py-2.5 text-sm font-semibold text-white"
            >
              {index === steps.length - 1 ? "I'm ready" : 'Next'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
