'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bot, ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react';
import { CHERRY_TOUR_STEPS } from '@/lib/tour-steps';
import { useCherryTour } from '@/contexts/TourContext';

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function CherryTourOverlay() {
  const { active, step, index, next, prev, stop } = useCherryTour();
  const pathname = usePathname();
  const [rect, setRect] = useState<SpotlightRect | null>(null);

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

  if (!active || !step) return null;

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
              '0 0 0 2px rgba(255, 46, 136, 0.85), 0 0 0 9999px rgba(5, 5, 5, 0.78), 0 0 32px rgba(255, 46, 136, 0.35)',
          }}
        />
      ) : (
        <div className="pointer-events-none fixed inset-0 z-[60] bg-cherry-black/70" />
      )}

      <div className="fixed bottom-[max(7rem,env(safe-area-inset-bottom))] left-1/2 z-[70] w-[min(420px,calc(100vw-1.5rem))] -translate-x-1/2">
        <div className="glass-panel border-cherry-hot/30 p-4 shadow-glow-sm">
          <div className="mb-3 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cherry-hot/30 to-cherry-royal/30">
              <Bot className="h-5 w-5 text-cherry-hot" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-cherry-hot">
                Cherry AI Guide · Step {index + 1}
              </p>
              <h3 className="font-serif text-lg font-bold">{step.title}</h3>
            </div>
            <button
              type="button"
              onClick={stop}
              className="rounded-full border border-white/10 p-1.5 text-white/50 hover:text-white"
              aria-label="Exit tour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-sm leading-relaxed text-white/85">{step.body}</p>
          <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-cherry-lavender">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cherry-hot" />
            {step.tip}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {CHERRY_TOUR_STEPS.map((s, i) => (
                <div
                  key={s.id}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    i < index ? 'bg-cherry-hot/50' : i === index ? 'bg-cherry-hot' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
            <span className="shrink-0 text-[10px] text-white/40">
              {index + 1}/{CHERRY_TOUR_STEPS.length}
            </span>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={stop}
              className="rounded-xl px-3 py-2.5 text-xs text-white/40 hover:text-white/70"
            >
              Skip tour
            </button>
            <button
              type="button"
              onClick={prev}
              disabled={index === 0}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="button"
              onClick={next}
              className="flex flex-[2] items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-cherry-hot to-cherry-red py-2.5 text-sm font-semibold text-white"
            >
              {index === CHERRY_TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
