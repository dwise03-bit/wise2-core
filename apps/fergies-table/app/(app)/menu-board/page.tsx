'use client';

import { MENU_ITEMS } from '@/lib/demo-data';
import { GlassCard, PageHeader, StatusPill } from '@/components/ui';
import { FERGIE_LAYOUT } from '@/lib/brand-tokens';
import { useOrders } from '@/contexts/OrderContext';

export default function MenuBoardPage() {
  const { soldOut, toggleSoldOut } = useOrders();

  return (
    <div className={`${FERGIE_LAYOUT.container} py-6`}>
      <PageHeader title="Menu board" subtitle="What is firing" />
      <p className="mb-4 text-sm text-white/55">Tap a plate to mark it sold out for tonight. Guests will still see it, but cannot add it.</p>
      <div className="space-y-2">
        {MENU_ITEMS.map((item) => {
          const out = soldOut.includes(item.id);
          return (
            <button key={item.id} type="button" onClick={() => toggleSoldOut(item.id)} className="w-full text-left">
              <GlassCard className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-white/45">
                    {item.category} · ${item.price}
                  </p>
                </div>
                <StatusPill label={out ? 'Sold out' : 'Live'} tone={out ? 'muted' : 'gold'} />
              </GlassCard>
            </button>
          );
        })}
      </div>
    </div>
  );
}
