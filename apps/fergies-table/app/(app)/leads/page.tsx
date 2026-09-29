'use client';

import { useState } from 'react';
import { GlassCard, PageHeader, StatusPill } from '@/components/ui';
import { FERGIE_LAYOUT } from '@/lib/brand-tokens';
import { LEAD_STATUS_FLOW, type LeadStatus } from '@/lib/demo-data';
import { useOrders } from '@/contexts/OrderContext';

const FILTERS: Array<LeadStatus | 'All'> = ['All', 'New', 'Quoted', 'Booked', 'Closed'];

function nextLead(status: LeadStatus): LeadStatus | null {
  const i = LEAD_STATUS_FLOW.indexOf(status);
  if (i < 0 || i >= LEAD_STATUS_FLOW.length - 1) return null;
  return LEAD_STATUS_FLOW[i + 1];
}

export default function LeadsPage() {
  const { leads, setLeadStatus } = useOrders();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const visible = filter === 'All' ? leads : leads.filter((lead) => lead.status === filter);

  return (
    <div className={`${FERGIE_LAYOUT.container} py-6`}>
      <PageHeader title="Leads" subtitle="Who is booking" />
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs uppercase tracking-wider ${
              filter === f ? 'border-fergie-gold bg-fergie-gold text-fergie-black' : 'border-white/15 text-white/60'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="space-y-2" data-tour="leads-list">
        {visible.map((lead) => {
          const next = nextLead(lead.status);
          return (
            <GlassCard key={lead.id} glow={lead.status === 'New'}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-fergie-gold">{lead.id}</p>
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-xs text-white/50">
                    {lead.event} · {lead.date} · {lead.guests} guests
                  </p>
                </div>
                <div className="text-right">
                  <StatusPill
                    label={lead.status}
                    tone={lead.status === 'New' ? 'gold' : lead.status === 'Booked' ? 'purple' : 'muted'}
                  />
                  <p className="mt-2 font-semibold text-fergie-gold">${lead.value}</p>
                </div>
              </div>
              {next && (
                <button
                  type="button"
                  onClick={() => setLeadStatus(lead.id, next)}
                  className="mt-3 w-full rounded-full border border-fergie-gold/30 py-2 text-xs font-semibold text-fergie-gold"
                >
                  Move to {next}
                </button>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
