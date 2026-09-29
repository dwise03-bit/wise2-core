'use client';

import React, { useMemo } from 'react';
import {
  HotLeadsTable,
  Panel,
  Skeleton,
  formatCurrency,
  normalizeAttribution,
  normalizeLeads,
  useRevenueData,
  NO_VALUE,
} from '../../../src/components/revenue-os';

/**
 * Estimates has no dedicated endpoint in the current contract, so it is derived
 * entirely from real data: leads sitting in the ESTIMATE stage, plus the
 * open-estimate value the attribution endpoint already reports.
 */
export default function RevenueEstimatesPage() {
  const leads = useRevenueData('/leads', normalizeLeads);
  const attribution = useRevenueData('/attribution', normalizeAttribution);

  const estimateLeads = useMemo(() => {
    if (!leads.data) return null;
    return leads.data
      .filter((l) => l.stage === 'ESTIMATE')
      .sort((a, b) => (b.opportunityValue ?? -1) - (a.opportunityValue ?? -1));
  }, [leads.data]);

  return (
    <div className="space-y-5">
      <Panel title="Open Estimates" subtitle="Outstanding estimate value awaiting a decision">
        <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
          <div className="rounded-lg border border-border-subtle bg-white/[0.02] p-4">
            <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Open Estimate Value
            </p>
            {attribution.state === 'loading' ? (
              <Skeleton className="mt-2 h-7 w-2/3" />
            ) : (
              <p className="mt-2 text-2xl font-bold tabular-nums text-wise-neon">
                {attribution.state === 'error'
                  ? NO_VALUE
                  : formatCurrency(attribution.data?.kpis.openEstimateValue ?? null)}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-border-subtle bg-white/[0.02] p-4">
            <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Leads in Estimate Stage
            </p>
            {leads.state === 'loading' ? (
              <Skeleton className="mt-2 h-7 w-1/3" />
            ) : (
              <p className="mt-2 text-2xl font-bold tabular-nums text-text-primary">
                {leads.state === 'error' ? NO_VALUE : (estimateLeads?.length ?? 0)}
              </p>
            )}
          </div>
        </div>
      </Panel>

      <HotLeadsTable
        leads={estimateLeads}
        state={leads.state}
        onRetry={leads.refetch}
        title="Estimates Out"
        subtitle="Leads currently sitting at the ESTIMATE stage"
      />
    </div>
  );
}
