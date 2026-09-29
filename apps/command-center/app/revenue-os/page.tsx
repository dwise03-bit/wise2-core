'use client';

import React from 'react';
import {
  ActivityFeed,
  HotLeadsTable,
  KpiGrid,
  MarketingRoiPanel,
  PipelineBoard,
  WorkforcePanel,
  normalizeAgents,
  normalizeAttribution,
  normalizeLeads,
  normalizePipeline,
  useRevenueData,
} from '../../src/components/revenue-os';

/**
 * Revenue OS overview.
 *
 * Every figure on this page comes from the API. There is no seed data, no
 * fallback constant, and no "example" row: while a request is in flight the
 * panel shows a skeleton, on failure it shows an error state naming the
 * endpoint, and on an empty tenant it shows an empty state.
 */
export default function RevenueOverviewPage() {
  const attribution = useRevenueData('/attribution', normalizeAttribution);
  const pipeline = useRevenueData('/leads/pipeline', normalizePipeline);
  const leads = useRevenueData('/leads', normalizeLeads);
  const agents = useRevenueData('/agents', normalizeAgents);

  // Highest-value leads first; leads with no stated value sort last rather than
  // being treated as zero.
  const hotLeads = leads.data
    ? [...leads.data].sort((a, b) => (b.opportunityValue ?? -1) - (a.opportunityValue ?? -1))
    : null;

  return (
    <div className="space-y-5">
      <KpiGrid kpis={attribution.data?.kpis ?? null} state={attribution.state} />

      <PipelineBoard
        columns={pipeline.data}
        state={pipeline.state}
        onRetry={pipeline.refetch}
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <HotLeadsTable
            leads={hotLeads}
            state={leads.state}
            onRetry={leads.refetch}
            limit={6}
          />
          <WorkforcePanel agents={agents.data} state={agents.state} onRetry={agents.refetch} />
          <MarketingRoiPanel
            channels={attribution.data?.channels ?? null}
            state={attribution.state}
            onRetry={attribution.refetch}
          />
        </div>

        <div className="xl:col-span-1">
          <ActivityFeed
            items={attribution.data?.activity ?? null}
            state={attribution.state}
            onRetry={attribution.refetch}
          />
        </div>
      </div>
    </div>
  );
}
