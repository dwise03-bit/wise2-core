'use client';

import Link from 'next/link';
import { Calendar, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GlassCard, SectionHeader, StatCard } from '@/components/ui';
import { DemoModeBanner } from '@/components/DemoModeBanner';
import { CHERRY_LAYOUT } from '@/lib/brand-tokens';
import { cherryAiInsight, cherryBootstrap } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  DEMO_AI_INSIGHT,
  DEMO_BEST_SELLERS,
  DEMO_NEXT_EVENT,
  DEMO_PACKING,
  DEMO_SALES_TREND,
  DEMO_STATS,
} from '@/lib/demo-data';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState(DEMO_STATS);
  const [nextEvent, setNextEvent] = useState(DEMO_NEXT_EVENT);
  const [aiTip, setAiTip] = useState(DEMO_AI_INSIGHT.tip);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    Promise.all([
      cherryBootstrap().catch(() => null),
      cherryAiInsight('daily').catch(() => null),
    ])
      .then(([bootstrap, ai]) => {
        if (bootstrap) {
          setStats({
            todaySales: Number(bootstrap.stats.todaySales) || 0,
            inventoryItems: bootstrap.stats.inventoryItems || 0,
            productCount: bootstrap.stats.productCount || 0,
            lowStock: bootstrap.stats.lowStock || 0,
            bestSellerCount: bootstrap.stats.bestSellerCount || 0,
          });
          if (bootstrap.nextEvent) {
            setNextEvent({
              id: bootstrap.nextEvent.id,
              name: bootstrap.nextEvent.name,
              date: bootstrap.nextEvent.date,
              venue: bootstrap.nextEvent.venue,
              address: '',
              status: bootstrap.nextEvent.status,
            });
          }
        }
        if (ai && typeof ai === 'object' && 'tips' in ai && Array.isArray((ai as { tips: string[] }).tips)) {
          setAiTip((ai as { tips: string[] }).tips[0] || DEMO_AI_INSIGHT.tip);
        }
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const eventDate = new Date(nextEvent.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const packedCount = DEMO_PACKING.filter((p) => p.status === 'PACKED').length;
  const packingPct = Math.round((packedCount / DEMO_PACKING.length) * 100);

  return (
    <div className={`${CHERRY_LAYOUT.container} py-6`}>
      <DemoModeBanner />

      <header className="mb-6" data-tour="dashboard-header">
        <p className="text-sm text-white/50">Hey Boss 💋</p>
        <h1 className="font-serif text-2xl font-bold">
          {loading ? 'Loading...' : "Let's run this pop up."}
        </h1>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3" data-tour="dashboard-stats">
        <StatCard label="Today's Sales" value={stats.todaySales} accent />
        <StatCard label="Inventory" value={`${stats.inventoryItems} items`} />
        <StatCard label="Best Sellers" value={stats.bestSellerCount} />
        <StatCard label="Low Stock" value={stats.lowStock} />
      </div>

      <GlassCard className="mb-6" glow data-tour="dashboard-next-event">
        <div className="flex items-start gap-3">
          <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-cherry-hot" />
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-white/50">Next Pop-Up</p>
            <p className="font-semibold">{nextEvent.name}</p>
            <p className="text-sm text-white/60">
              {eventDate} · {nextEvent.venue}
            </p>
          </div>
          <Link href="/pop-ups" className="text-cherry-hot">
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </GlassCard>

      <SectionHeader title="Top Selling Items" action={<Link href="/analytics" className="text-xs text-cherry-hot">View all</Link>} />
      <div className="mb-6 space-y-2">
        {DEMO_BEST_SELLERS.slice(0, 3).map((item, i) => (
          <GlassCard key={item.name} className="flex items-center gap-3 py-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cherry-hot/20 text-sm font-bold text-cherry-hot">
              {i + 1}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-white/50">
                Size {item.size} · {item.sold} sold
              </p>
            </div>
            <span className="text-sm font-semibold text-cherry-bubblegum">${item.revenue}</span>
          </GlassCard>
        ))}
      </div>

      <SectionHeader title="Packing Progress" />
      <GlassCard className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-white/60">{nextEvent.name}</span>
          <span className="font-semibold text-cherry-hot">{packingPct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cherry-hot to-cherry-red transition-all"
            style={{ width: `${packingPct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-white/40">
          {packedCount} of {DEMO_PACKING.length} items packed
        </p>
      </GlassCard>

      <SectionHeader title="Sales Trend" action={<TrendingUp className="h-4 w-4 text-cherry-hot" />} />
      <GlassCard className="mb-6 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={DEMO_SALES_TREND}>
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF2E88" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#FF2E88" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fill: '#ffffff60', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: '#111',
                border: '1px solid #FF5FA230',
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Area type="monotone" dataKey="sales" stroke="#FF2E88" fill="url(#salesGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>

      <SectionHeader title="Smart Insight" action={<Sparkles className="h-4 w-4 text-cherry-lavender" />} />
      <GlassCard glow data-tour="dashboard-insight">
        <p className="text-sm leading-relaxed text-white/80">{aiTip}</p>
        <p className="mt-2 text-[10px] uppercase tracking-wider text-cherry-chrome/50">
          Powered by WISE² Intelligence
        </p>
      </GlassCard>
    </div>
  );
}
