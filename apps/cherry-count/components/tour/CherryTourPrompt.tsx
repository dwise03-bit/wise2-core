'use client';

import { Bot, Sparkles, X } from 'lucide-react';
import { useCherryTour } from '@/contexts/TourContext';

export function CherryTourPrompt() {
  const { showPrompt, start, dismissPrompt, active } = useCherryTour();

  if (!showPrompt || active) return null;

  return (
    <div className="fixed bottom-28 left-1/2 z-50 w-[min(400px,calc(100vw-1.5rem))] -translate-x-1/2">
      <div className="glass-panel border-cherry-hot/40 p-4 shadow-glow-sm">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cherry-hot/20">
              <Bot className="h-4 w-4 text-cherry-hot" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-cherry-hot">Cherry AI</p>
              <p className="font-serif text-sm font-semibold">Take the guided tour?</p>
            </div>
          </div>
          <button
            type="button"
            onClick={dismissPrompt}
            className="text-white/40 hover:text-white"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-3 text-xs leading-relaxed text-white/60">
          I&apos;ll walk you through dashboard, inventory, pop-ups, customers, and AI in about 3
          minutes.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={dismissPrompt}
            className="flex-1 rounded-xl border border-white/10 py-2 text-xs font-medium text-white/60"
          >
            Maybe later
          </button>
          <button
            type="button"
            onClick={start}
            className="flex flex-[2] items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cherry-hot to-cherry-red py-2 text-xs font-semibold"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Start AI Tour
          </button>
        </div>
      </div>
    </div>
  );
}
