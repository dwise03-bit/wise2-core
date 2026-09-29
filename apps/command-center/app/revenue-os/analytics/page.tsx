'use client';

import React from 'react';
import {
  ActivityFeed,
  KpiGrid,
  MarketingRoiPanel,
  normalizeAttribution,
  useRevenueData,
} from '../../../src/components/revenue-os';

export default function RevenueAnalyticsPage() {
  const attribution = useRevenueData('/attribution', normalizeAttribution);

  return (
    <div className="space-y-5">
      <KpiGrid kpis={attribution.data?.kpis ?? null} state={attribution.state} />

      <MarketingRoiPanel
        channels={attribution.data?.channels ?? null}
        state={attribution.state}
        onRetry={attribution.refetch}
      />

      <ActivityFeed
        items={attribution.data?.activity ?? null}
        state={attribution.state}
        onRetry={attribution.refetch}
        limit={50}
      />
    </div>
  );
}
