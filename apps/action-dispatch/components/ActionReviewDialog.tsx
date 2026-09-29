'use client';

import { useEffect, useRef } from 'react';
import { Button } from './ui';
import { useDesk } from './DispatchProvider';

export function ActionReviewDialog() {
  const { state, confirm, cancel } = useDesk();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!state.review) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') cancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.review, cancel]);

  if (!state.review) return null;

  const review = state.review;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-title"
        className="glass w-full max-w-lg rounded-3xl p-5"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber">Simulation review</p>
        <h2 id="review-title" className="mt-2 font-display text-2xl font-semibold">
          Confirm {review.proposedAction}
        </h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-chrome">Customer</dt>
            <dd>{review.customerName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-chrome">Destination</dt>
            <dd className="text-right">{review.destination}</dd>
          </div>
          <div>
            <dt className="text-chrome">Proposed action</dt>
            <dd className="mt-1">{review.details}</dd>
          </div>
        </dl>
        <p className="mt-4 rounded-2xl border border-amber/30 bg-amber/10 p-3 text-sm text-amber">{review.simulationNotice}</p>
        {state.error ? <p className="mt-3 text-sm text-critical">{state.error}</p> : null}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={cancel}>
            Cancel
          </Button>
          <Button variant="ice" onClick={() => void confirm()} autoFocus>
            Confirm simulated action
          </Button>
        </div>
        <button ref={closeRef} className="sr-only" type="button">
          Review opened
        </button>
      </div>
    </div>
  );
}
