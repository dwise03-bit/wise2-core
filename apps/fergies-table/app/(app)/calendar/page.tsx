'use client';

import { useMemo, useState } from 'react';
import { GlassCard, PageHeader, StatusPill } from '@/components/ui';
import { FERGIE_LAYOUT } from '@/lib/brand-tokens';
import { DEMO_EVENTS } from '@/lib/demo-data';
import { useOrders } from '@/contexts/OrderContext';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const start = first.getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: Array<number | null> = [...Array(start).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function CalendarPage() {
  const [cursor] = useState(() => new Date(2026, 8, 1));
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = useMemo(() => monthGrid(year, month), [year, month]);
  const { bookings } = useOrders();

  const eventsByDay = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const event of DEMO_EVENTS) {
      const day = event.date.slice(8, 10);
      map.set(day, [...(map.get(day) ?? []), event.title]);
    }
    for (const booking of bookings) {
      if (!booking.date) continue;
      const day = booking.date.slice(8, 10);
      map.set(day, [...(map.get(day) ?? []), booking.eventType]);
    }
    return map;
  }, [bookings]);

  const [selected, setSelected] = useState('07');
  const selectedEvents = [
    ...DEMO_EVENTS.filter((event) => event.date.slice(8, 10) === selected),
    ...bookings
      .filter((b) => b.date?.slice(8, 10) === selected)
      .map((b) => ({
        id: b.id,
        title: b.eventType,
        date: b.date,
        time: b.time,
        guests: b.guests,
        type: 'Private Table' as const,
      })),
  ];

  return (
    <div className={`${FERGIE_LAYOUT.container} py-6`}>
      <div data-tour="calendar-book">
      <PageHeader title="Calendar" subtitle="September 2026" />
      <GlassCard className="mb-5">
        <div className="mb-2 grid grid-cols-7 text-center text-[10px] uppercase tracking-wider text-fergie-rose/60">
          {WEEKDAYS.map((d, i) => (
            <span key={`${d}-${i}`}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <span key={`e-${i}`} />;
            const key = String(day).padStart(2, '0');
            const has = eventsByDay.has(key);
            const active = selected === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(key)}
                className={`flex h-10 flex-col items-center justify-center rounded-xl text-sm ${
                  active ? 'bg-fergie-gold text-fergie-black' : has ? 'bg-fergie-royal/30 text-fergie-gold' : 'text-white/70'
                }`}
              >
                {day}
                {has && !active && <span className="mt-0.5 h-1 w-1 rounded-full bg-fergie-gold" />}
              </button>
            );
          })}
        </div>
      </GlassCard>

      <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-fergie-rose/70">
        {selectedEvents.length ? `Sep ${Number(selected)}` : 'No events'}
      </p>
      <div className="space-y-2">
        {selectedEvents.length === 0 && (
          <GlassCard>
            <p className="text-sm text-white/50">Open day. Ready for a tasting or private table.</p>
          </GlassCard>
        )}
        {selectedEvents.map((event) => (
          <GlassCard key={event.id} glow>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{event.title}</p>
                <p className="text-xs text-white/50">
                  {event.time} · {event.guests} guests
                </p>
              </div>
              <StatusPill label={event.type} tone="purple" />
            </div>
          </GlassCard>
        ))}
      </div>
      </div>
    </div>
  );
}
