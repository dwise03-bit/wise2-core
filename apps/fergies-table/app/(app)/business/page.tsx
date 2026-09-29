'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { GlassCard, PageHeader, SectionHeader, StatCard, StatusPill } from '@/components/ui';
import { FERGIE_LAYOUT } from '@/lib/brand-tokens';
import { BUSINESS_STATS, REVENUE_TREND } from '@/lib/demo-data';
import { useOrders } from '@/contexts/OrderContext';

export default function BusinessPage() {
  const { leads, kitchenQueue } = useOrders();
  const openLeads = leads.filter((lead) => lead.status === 'New' || lead.status === 'Quoted');
  const newLeads = leads.filter((lead) => lead.status === 'New').length;

  return (
    <div className={`${FERGIE_LAYOUT.container} py-6`}>
      <div data-tour="command-header">
        <PageHeader title="Business OS" subtitle="Chef's command" />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3" data-tour="command-stats">
        <StatCard label="August revenue" value={`$${BUSINESS_STATS.monthlyRevenue.toLocaleString()}`} />
        <StatCard label="New leads" value={newLeads} />
        <StatCard label="Kitchen tickets" value={kitchenQueue.length} />
        <StatCard label="Outstanding" value={`$${BUSINESS_STATS.outstanding.toLocaleString()}`} />
      </div>

      <SectionHeader title="Revenue" />
      <GlassCard className="mb-6 h-44" glow>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={REVENUE_TREND}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFD700" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#6A22E2" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fill: '#EEC1C6', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#121212', border: '1px solid #FFD70040', borderRadius: 12, fontSize: 12 }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#FFD700" fill="url(#revGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>

      <SectionHeader
        title="Open leads"
        action={
          <Link href="/leads" className="text-xs text-fergie-gold">
            All leads
          </Link>
        }
      />
      <div className="mb-6 space-y-2" data-tour="command-leads">
        {openLeads.map((lead) => (
          <GlassCard key={lead.id} className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">{lead.name}</p>
              <p className="text-xs text-white/50">
                {lead.event} · {lead.guests} guests
              </p>
            </div>
            <div className="text-right">
              <StatusPill label={lead.status} tone={lead.status === 'New' ? 'gold' : 'purple'} />
              <p className="mt-1 text-xs text-fergie-gold">${lead.value}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3" data-tour="command-shortcuts">
        <Link href="/kitchen" className="glass-panel flex items-center justify-between p-4 text-sm">
          Kitchen <ChevronRight className="h-4 w-4 text-fergie-gold" />
        </Link>
        <Link href="/calendar" className="glass-panel flex items-center justify-between p-4 text-sm">
          Calendar <ChevronRight className="h-4 w-4 text-fergie-gold" />
        </Link>
        <Link href="/quotes" className="glass-panel flex items-center justify-between p-4 text-sm">
          Quotes <ChevronRight className="h-4 w-4 text-fergie-gold" />
        </Link>
        <Link href="/payments" className="glass-panel flex items-center justify-between p-4 text-sm">
          Payments <ChevronRight className="h-4 w-4 text-fergie-gold" />
        </Link>
      </div>
    </div>
  );
}
