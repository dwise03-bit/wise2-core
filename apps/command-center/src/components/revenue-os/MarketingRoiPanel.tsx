'use client';

import React from 'react';
import { EmptyState, ErrorState, Panel, Skeleton } from './States';
import { formatCount, formatCurrency, formatRoas } from './format';
import { MarketingRoiRow } from './types';

interface MarketingRoiPanelProps {
  channels: MarketingRoiRow[] | null;
  state: 'loading' | 'ready' | 'error';
  onRetry?: () => void;
}

/** Spend → leads → booked → sold → ROAS, per acquisition channel. */
export const MarketingRoiPanel: React.FC<MarketingRoiPanelProps> = ({
  channels,
  state,
  onRetry,
}) => (
  <Panel title="Marketing ROI" subtitle="Attribution from ad spend through sold revenue">
    {state === 'loading' && (
      <div className="space-y-3 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="ml-auto h-3 w-1/2" />
          </div>
        ))}
      </div>
    )}

    {state === 'error' && (
      <ErrorState
        message="Attribution could not be loaded, so no spend or return figures are shown."
        hint="GET /api/revenue-os/attribution"
        onRetry={onRetry}
      />
    )}

    {state === 'ready' && (!channels || channels.length === 0) && (
      <EmptyState
        title="No attribution data"
        message="Connect an ad account to see spend, leads, and return by channel."
      />
    )}

    {state === 'ready' && channels && channels.length > 0 && (
      <div className="overflow-x-auto">
        <table className="wise-table">
          <thead>
            <tr>
              <th>Channel</th>
              <th className="text-right">Spend</th>
              <th className="text-right">Leads</th>
              <th className="text-right">Booked Rev</th>
              <th className="text-right">Sold Rev</th>
              <th className="text-right">ROAS</th>
            </tr>
          </thead>
          <tbody>
            {channels.map((row) => (
              <tr key={row.channel}>
                <td className="font-medium text-text-primary">{row.channel}</td>
                <td className="text-right tabular-nums text-text-secondary">
                  {formatCurrency(row.spend)}
                </td>
                <td className="text-right tabular-nums text-text-secondary">
                  {formatCount(row.leads)}
                </td>
                <td className="text-right tabular-nums text-text-secondary">
                  {formatCurrency(row.bookedRevenue)}
                </td>
                <td className="text-right tabular-nums text-text-primary">
                  {formatCurrency(row.soldRevenue)}
                </td>
                <td className="text-right font-semibold tabular-nums text-wise-neon">
                  {formatRoas(row.roas)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </Panel>
);
