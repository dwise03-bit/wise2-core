'use client';

import Link from 'next/link';
import { GlassCard, PageHeader, StatusPill } from '@/components/ui';
import { FERGIE_LAYOUT } from '@/lib/brand-tokens';
import { REWARDS } from '@/lib/demo-data';
import { useOrders } from '@/contexts/OrderContext';

const TIERS = [
  { name: 'Guest', at: 0 },
  { name: 'Savôré', at: 1000 },
  { name: 'Inner Circle', at: 3500 },
  { name: 'Royal Table', at: 7000 },
];

export default function RewardsPage() {
  const { orders } = useOrders();
  const bonus = orders.filter((o) => o.title === 'Menu order').length * 40;
  const points = REWARDS.points + bonus;
  const progress = Math.min(100, Math.round((points / REWARDS.nextAt) * 100));

  return (
    <div className={`${FERGIE_LAYOUT.container} py-6`}>
      <PageHeader title="Rewards" subtitle="Stay at the table" />

      <GlassCard glow gold className="mb-6 text-center">
        <p className={FERGIE_LAYOUT.statLabel}>Points</p>
        <p className="mt-1 font-serif text-6xl text-fergie-gold">{points.toLocaleString()}</p>
        <div className="mt-2">
          <StatusPill label={REWARDS.tier} />
        </div>
        <p className="mt-4 text-sm text-white/55">
          {REWARDS.nextAt - points} points to {REWARDS.nextTier}
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-fergie-royal to-fergie-gold"
            style={{ width: `${progress}%` }}
          />
        </div>
      </GlassCard>

      <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-fergie-rose/70">Tiers</p>
      <div className="mb-6 space-y-2">
        {TIERS.map((tier) => (
          <GlassCard key={tier.name} className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">{tier.name}</p>
              <p className="text-xs text-white/45">{tier.at.toLocaleString()} pts</p>
            </div>
            {tier.name === REWARDS.tier ? <StatusPill label="Current" /> : <StatusPill label="Locked" tone="muted" />}
          </GlassCard>
        ))}
      </div>

      <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-fergie-rose/70">Your perks</p>
      <GlassCard>
        <ul className="space-y-2 text-sm text-white/75">
          {REWARDS.perks.map((perk) => (
            <li key={perk}>· {perk}</li>
          ))}
        </ul>
      </GlassCard>

      <Link href="/menu" className={`mt-5 w-full ${FERGIE_LAYOUT.btnPrimary}`}>
        Earn with an order
      </Link>
    </div>
  );
}
