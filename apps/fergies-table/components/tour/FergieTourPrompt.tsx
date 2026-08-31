'use client';

import { Sparkles, X } from 'lucide-react';
import { ClocheMark } from '@/components/ui';
import { useOwner } from '@/contexts/OwnerContext';
import { useFergieTour } from '@/contexts/TourContext';

export function FergieTourPrompt() {
  const { showPrompt, start, dismissPrompt, active } = useFergieTour();
  const { isOwner } = useOwner();

  if (!showPrompt || active) return null;

  return (
    <div className="fixed bottom-28 left-1/2 z-50 w-[min(400px,calc(100vw-1.5rem))] -translate-x-1/2">
      <div className="glass-panel border-fergie-gold/40 p-4 shadow-glow-gold">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-fergie-royal/25">
              <ClocheMark className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-fergie-gold">Savôré</p>
              <p className="font-serif text-sm font-semibold">Walk the house with Savôré?</p>
            </div>
          </div>
          <button type="button" onClick={dismissPrompt} className="text-white/40 hover:text-white" aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-3 text-xs leading-relaxed text-white/60">
          {isOwner
            ? 'Savôré will brief Command, the pass, the book, and your leads. Unhurried. Like service.'
            : 'Savôré will walk the menu, catering, and booking the way Fergie would, in the room.'}
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
            className="flex flex-[2] items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-fergie-royal to-fergie-gold py-2 text-xs font-semibold"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Start voice tour
          </button>
        </div>
      </div>
    </div>
  );
}
