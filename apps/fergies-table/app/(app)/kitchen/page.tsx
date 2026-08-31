'use client';

import Link from 'next/link';
import { GlassCard, PageHeader, StatusPill } from '@/components/ui';
import { FERGIE_LAYOUT } from '@/lib/brand-tokens';
import { ORDER_STATUS_FLOW, type OrderStatus } from '@/lib/demo-data';
import { useOrders } from '@/contexts/OrderContext';

function nextStatus(status: OrderStatus): OrderStatus | null {
  const i = ORDER_STATUS_FLOW.indexOf(status);
  if (i < 0 || i >= ORDER_STATUS_FLOW.length - 1) return null;
  return ORDER_STATUS_FLOW[i + 1];
}

export default function KitchenPage() {
  const { kitchenQueue, orders, setOrderStatus } = useOrders();
  const done = orders.filter((order) => order.status === 'Completed').slice(0, 3);

  return (
    <div className={`${FERGIE_LAYOUT.container} py-6`}>
      <PageHeader
        title="Kitchen"
        subtitle="Tickets in motion"
        action={<span className="text-xs text-fergie-gold">{kitchenQueue.length} live</span>}
      />

      <div data-tour="kitchen-tickets">
      {kitchenQueue.length === 0 ? (
        <GlassCard>
          <p className="text-sm text-white/55">All tickets are clear. New guest orders land here.</p>
          <Link href="/calendar" className={`mt-4 ${FERGIE_LAYOUT.btnGhost}`}>
            See the book
          </Link>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {kitchenQueue.map((order) => {
            const next = nextStatus(order.status);
            return (
              <GlassCard key={order.id} glow>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-fergie-gold">{order.id}</p>
                    <p className="font-serif text-lg">{order.title}</p>
                    <p className="text-xs text-white/50">{order.date}</p>
                  </div>
                  <StatusPill label={order.status} />
                </div>
                <p className="mt-2 text-sm text-white/70">{order.items.join(' · ')}</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="font-semibold text-fergie-gold">${order.total}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderStatus(order.id, 'Cancelled')}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/50"
                    >
                      Cancel
                    </button>
                    {next && (
                      <button
                        type="button"
                        onClick={() => setOrderStatus(order.id, next)}
                        className="rounded-full bg-gradient-to-r from-fergie-royal to-fergie-gold px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Mark {next}
                      </button>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
      </div>

      {done.length > 0 && (
        <>
          <p className="mb-2 mt-6 text-[10px] uppercase tracking-[0.18em] text-fergie-rose/70">Recently plated</p>
          <div className="space-y-2">
            {done.map((order) => (
              <GlassCard key={order.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{order.title}</p>
                  <p className="text-xs text-white/45">{order.id}</p>
                </div>
                <StatusPill label="Completed" tone="muted" />
              </GlassCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
