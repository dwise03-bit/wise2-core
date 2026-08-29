'use client';

import { GlassCard, SectionHeader, StatCard } from '@/components/ui';
import { CHERRY_LAYOUT } from '@/lib/brand-tokens';
import { DEMO_BEST_SELLERS, DEMO_STATS } from '@/lib/demo-data';

const PAYMENT_METHODS = ['Cash', 'Card', 'Cash App', 'Venmo', 'Square', 'Other'];

export default function SalesPage() {
  return (
    <div className={`${CHERRY_LAYOUT.container} py-6`}>
      <header className="mb-6">
        <h1 className="font-serif text-2xl font-bold uppercase">Sales</h1>
        <p className="text-sm text-white/50">Know what&apos;s making you money</p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <StatCard label="Today's Sales" value={DEMO_STATS.todaySales} accent />
        <StatCard label="Gross Revenue" value="$4,280" />
        <StatCard label="Est. Profit" value="$2,140" />
        <StatCard label="Units Sold" value="47" />
      </div>

      <SectionHeader title="Record Sale" />
      <GlassCard className="mb-6 space-y-4">
        <div>
          <label className="text-xs text-white/50">Payment Method</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m}
                className="rounded-full border border-cherry-bubblegum/20 px-3 py-1.5 text-xs transition hover:border-cherry-hot hover:text-cherry-hot"
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <button className={`w-full ${CHERRY_LAYOUT.btnPrimary}`}>Record Sale</button>
        <p className="text-center text-[10px] text-white/30">
          Square & Shopify integrations — COMING NEXT
        </p>
      </GlassCard>

      <SectionHeader title="Best Sellers" />
      <div className="space-y-2">
        {DEMO_BEST_SELLERS.map((item) => (
          <GlassCard key={item.name} className="flex justify-between py-3">
            <div>
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-white/50">{item.sold} units sold</p>
            </div>
            <span className="font-semibold text-cherry-hot">${item.revenue}</span>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
