'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard, PageHeader } from '@/components/ui';
import { FERGIE_LAYOUT } from '@/lib/brand-tokens';
import { EVENT_TYPES, GUEST_COUNTS } from '@/lib/demo-data';

export default function BuildTablePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [guests, setGuests] = useState(8);
  const [eventType, setEventType] = useState<(typeof EVENT_TYPES)[number]>('Intimate Dinner');
  const [notes, setNotes] = useState('');

  const continueToBook = () => {
    const params = new URLSearchParams({
      guests: String(guests),
      type: eventType,
      notes,
    });
    router.push(`/book?${params.toString()}`);
  };

  return (
    <div className={`${FERGIE_LAYOUT.container} py-6`}>
      <PageHeader title="Build Your Table" subtitle="Step by step" />

      <div className="mb-5 flex gap-2">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`h-1.5 flex-1 rounded-full ${n <= step ? 'bg-fergie-gold' : 'bg-white/10'}`}
          />
        ))}
      </div>

      {step === 1 && (
        <GlassCard glow>
          <p className={FERGIE_LAYOUT.statLabel}>Guest count</p>
          <p className="mt-2 font-serif text-4xl text-fergie-gold">{guests}</p>
          <p className="mt-1 text-sm text-white/50">How many seats at the table?</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {GUEST_COUNTS.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setGuests(count)}
                className={`rounded-full px-4 py-2 text-sm ${
                  guests === count ? 'bg-fergie-gold text-fergie-black' : 'border border-white/15 text-white/70'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setStep(2)} className={`mt-6 w-full ${FERGIE_LAYOUT.btnPrimary}`}>
            Next
          </button>
        </GlassCard>
      )}

      {step === 2 && (
        <GlassCard glow>
          <p className={FERGIE_LAYOUT.statLabel}>Event type</p>
          <p className="mt-2 font-serif text-2xl">What are we celebrating?</p>
          <div className="mt-4 space-y-2">
            {EVENT_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setEventType(type)}
                className={`w-full rounded-fergie border px-4 py-3 text-left text-sm ${
                  eventType === type
                    ? 'border-fergie-gold bg-fergie-gold/10 text-fergie-gold'
                    : 'border-white/10 text-white/70'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={() => setStep(1)} className={`flex-1 ${FERGIE_LAYOUT.btnGhost}`}>
              Back
            </button>
            <button type="button" onClick={() => setStep(3)} className={`flex-1 ${FERGIE_LAYOUT.btnPrimary}`}>
              Next
            </button>
          </div>
        </GlassCard>
      )}

      {step === 3 && (
        <GlassCard glow>
          <p className={FERGIE_LAYOUT.statLabel}>Notes for Chef Fergie</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Allergies, favorite dishes, vibe..."
            className="mt-3 min-h-28 w-full rounded-fergie border border-fergie-gold/20 bg-black/40 p-3 text-sm outline-none focus:border-fergie-gold"
          />
          <p className="mt-4 text-sm text-white/60">
            {guests} guests · {eventType}
          </p>
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={() => setStep(2)} className={`flex-1 ${FERGIE_LAYOUT.btnGhost}`}>
              Back
            </button>
            <button type="button" onClick={continueToBook} className={`flex-1 ${FERGIE_LAYOUT.btnPrimary}`}>
              Choose a date
            </button>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
