'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { GlassCard, PageHeader, StatusPill } from '@/components/ui';
import { FERGIE_LAYOUT } from '@/lib/brand-tokens';
import { EVENT_TYPES, SERVICE_TYPES } from '@/lib/demo-data';
import { useOrders } from '@/contexts/OrderContext';

function BookForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { addBooking } = useOrders();
  const presetType = params.get('type') || 'Intimate Dinner';
  const presetGuests = Number(params.get('guests') || 8);

  const [date, setDate] = useState('2026-09-19');
  const [time, setTime] = useState('18:30');
  const [service, setService] = useState<(typeof SERVICE_TYPES)[number]>('On-site service');
  const [guests, setGuests] = useState(presetGuests);
  const [eventType, setEventType] = useState(presetType);
  const [confirmed, setConfirmed] = useState(false);

  const eventMatch = useMemo(
    () => EVENT_TYPES.find((type) => type === eventType) ?? eventType,
    [eventType],
  );

  const submit = () => {
    addBooking({
      eventType: eventMatch,
      guests,
      date,
      time,
      service,
      notes: '',
    });
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <GlassCard glow gold className="text-center">
        <p className="font-script text-3xl text-fergie-rose">Held.</p>
        <p className="mt-2 font-serif text-2xl">Your table is requested</p>
        <p className="mt-3 text-sm text-white/60">
          {eventMatch} for {guests} · {date} at {time}
        </p>
        <StatusPill label={service} />
        <p className="mt-4 text-sm text-white/50">
          Chef Fergie will confirm by phone. This hold also appears in your orders.
        </p>
        <button type="button" onClick={() => router.push('/orders')} className={`mt-6 w-full ${FERGIE_LAYOUT.btnPrimary}`}>
          View orders
        </button>
      </GlassCard>
    );
  }

  return (
    <GlassCard glow>
      <label className="block text-xs uppercase tracking-wider text-fergie-rose/70">Occasion</label>
      <select
        value={eventType}
        onChange={(e) => setEventType(e.target.value)}
        className="mt-1 mb-4 w-full rounded-fergie border border-fergie-gold/20 bg-black/40 p-3 text-sm"
      >
        {[...EVENT_TYPES, presetType].filter((v, i, arr) => arr.indexOf(v) === i).map((type) => (
          <option key={type}>{type}</option>
        ))}
      </select>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs uppercase tracking-wider text-fergie-rose/70">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-fergie border border-fergie-gold/20 bg-black/40 p-3 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-fergie-rose/70">Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 w-full rounded-fergie border border-fergie-gold/20 bg-black/40 p-3 text-sm"
          />
        </div>
      </div>

      <label className="block text-xs uppercase tracking-wider text-fergie-rose/70">Guests</label>
      <input
        type="number"
        min={2}
        max={80}
        value={guests}
        onChange={(e) => setGuests(Number(e.target.value))}
        className="mt-1 mb-4 w-full rounded-fergie border border-fergie-gold/20 bg-black/40 p-3 text-sm"
      />

      <label className="block text-xs uppercase tracking-wider text-fergie-rose/70">Service</label>
      <div className="mt-2 space-y-2">
        {SERVICE_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setService(type)}
            className={`w-full rounded-fergie border px-4 py-3 text-left text-sm ${
              service === type
                ? 'border-fergie-gold bg-fergie-gold/10 text-fergie-gold'
                : 'border-white/10 text-white/70'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <button type="button" onClick={submit} className={`mt-6 w-full ${FERGIE_LAYOUT.btnPrimary}`}>
        Request this table
      </button>
    </GlassCard>
  );
}

export default function BookPage() {
  return (
    <div className={`${FERGIE_LAYOUT.container} py-6`} data-tour="book-form">
      <PageHeader title="Book Your Table" subtitle="Choose the moment" />
      <Suspense fallback={<GlassCard>Loading booking…</GlassCard>}>
        <BookForm />
      </Suspense>
    </div>
  );
}
