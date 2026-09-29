'use client';

import Link from 'next/link';
import { GlassCard, PageHeader, StatusPill } from '@/components/ui';
import { FERGIE_LAYOUT } from '@/lib/brand-tokens';
import { useOrders } from '@/contexts/OrderContext';
import type { OrderStatus } from '@/lib/demo-data';

const toneFor = (status: OrderStatus) => {
  if (status === 'Completed') return 'muted' as const;
  if (status === 'Confirmed' || status === 'Preparing') return 'gold' as const;
  if (status === 'Cancelled') return 'rose' as const;
  return 'purple' as const;
};

export default function OrdersPage() {
  const { orders, bookings, cartCount } = useOrders();
  const upcoming = orders.filter((order) => order.status !== 'Completed' && order.status !== 'Cancelled');
  const past = orders.filter((order) => order.status === 'Completed' || order.status === 'Cancelled');

  return (
    <div className={`${FERGIE_LAYOUT.container} py-6`}>
      <PageHeader
        title="My Orders"
        subtitle="Your table history"
        action={
          cartCount > 0 ? (
            <Link href="/cart" className="text-xs text-fergie-gold">
              Open cart
            </Link>
          ) : null
        }
      />

      {bookings.filter((b) => b.date).length > 0 && (
        <>
          <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-fergie-rose/70">Table holds</p>
          <div className="mb-6 space-y-2">
            {bookings
              .filter((b) => b.date)
              .map((booking) => (
                <GlassCard key={booking.id} className="py-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{booking.eventType}</p>
                      <p className="text-xs text-white/50">
                        {booking.date} · {booking.time} · {booking.guests} guests
                      </p>
                    </div>
                    <StatusPill label="Hold" tone="purple" />
                  </div>
                </GlassCard>
              ))}
          </div>
        </>
      )}

      <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-fergie-rose/70">Upcoming</p>
      <div className="mb-6 space-y-2">
        {upcoming.length === 0 && (
          <GlassCard>
            <p className="text-sm text-white/50">No upcoming orders. Start from the menu.</p>
          </GlassCard>
        )}
        {upcoming.map((order) => (
          <GlassCard key={order.id} glow>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-fergie-gold">{order.id}</p>
                <p className="font-medium">{order.title}</p>
                <p className="text-xs text-white/50">{order.date}</p>
              </div>
              <StatusPill label={order.status} tone={toneFor(order.status)} />
            </div>
            <p className="mt-2 text-xs text-white/55">{order.items.join(' · ')}</p>
            <p className="mt-2 text-sm font-semibold text-fergie-gold">${order.total}</p>
          </GlassCard>
        ))}
      </div>

      <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-fergie-rose/70">Past</p>
      <div className="space-y-2">
        {past.map((order) => (
          <GlassCard key={order.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{order.title}</p>
                <p className="text-xs text-white/50">
                  {order.id} · {order.date}
                </p>
              </div>
              <StatusPill label={order.status} tone={toneFor(order.status)} />
            </div>
            <p className="mt-2 text-sm text-fergie-gold">${order.total}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
