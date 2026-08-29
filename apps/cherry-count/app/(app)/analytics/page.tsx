'use client';

import { GlassCard, SectionHeader } from '@/components/ui';
import { CHERRY_LAYOUT } from '@/lib/brand-tokens';
import { DEMO_SALES_TREND } from '@/lib/demo-data';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function AnalyticsPage() {
  return (
    <div className={`${CHERRY_LAYOUT.container} py-6`}>
      <header className="mb-6">
        <h1 className="font-serif text-2xl font-bold uppercase">Analytics</h1>
        <p className="text-sm text-white/50">Growth insights at a glance</p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <GlassCard>
          <p className="text-xs text-white/50">30-Day Revenue</p>
          <p className="text-2xl font-bold text-cherry-hot">$12,840</p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs text-white/50">Avg Sale</p>
          <p className="text-2xl font-bold">$54</p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs text-white/50">Inventory Value</p>
          <p className="text-2xl font-bold">$8,420</p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs text-white/50">Event Performance</p>
          <p className="text-2xl font-bold text-cherry-lavender">+18%</p>
        </GlassCard>
      </div>

      <SectionHeader title="Weekly Sales" />
      <GlassCard className="mb-6 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DEMO_SALES_TREND}>
            <XAxis dataKey="day" tick={{ fill: '#ffffff60', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: '#111', border: '1px solid #FF5FA230', borderRadius: 12, fontSize: 12 }}
            />
            <Bar dataKey="sales" fill="#FF2E88" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      <SectionHeader title="Top Categories" />
      <div className="space-y-2">
        {[
          { name: 'Hoodies', pct: 34 },
          { name: 'Tops', pct: 28 },
          { name: 'Accessories', pct: 22 },
          { name: 'Bottoms', pct: 16 },
        ].map((cat) => (
          <GlassCard key={cat.name} className="py-3">
            <div className="mb-1 flex justify-between text-sm">
              <span>{cat.name}</span>
              <span className="text-cherry-hot">{cat.pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cherry-hot to-cherry-royal"
                style={{ width: `${cat.pct}%` }}
              />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
