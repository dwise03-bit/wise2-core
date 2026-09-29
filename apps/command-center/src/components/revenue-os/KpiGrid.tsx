'use client';

import React from 'react';
import { Card } from '../ui';
import { Skeleton } from './States';
import { formatCount, formatCurrency, formatPercent, formatRoas, NO_VALUE } from './format';
import { Kpis } from './types';

interface KpiSpec {
  key: keyof Kpis;
  label: string;
  render: (k: Kpis) => string;
  accent?: boolean;
}

const KPI_SPECS: KpiSpec[] = [
  { key: 'revenueToday', label: 'Revenue Today', render: (k) => formatCurrency(k.revenueToday), accent: true },
  { key: 'newLeads', label: 'New Leads', render: (k) => formatCount(k.newLeads) },
  { key: 'booked', label: 'Booked', render: (k) => formatCount(k.booked) },
  { key: 'openEstimateValue', label: 'Open Estimate Value', render: (k) => formatCurrency(k.openEstimateValue) },
  { key: 'closeRate', label: 'Close Rate', render: (k) => formatPercent(k.closeRate) },
  { key: 'roas', label: 'ROAS', render: (k) => formatRoas(k.roas), accent: true },
];

interface KpiGridProps {
  kpis: Kpis | null;
  state: 'loading' | 'ready' | 'error';
}

/**
 * Six headline metrics. When the attribution endpoint is unreachable every tile
 * renders a dash plus an explicit "not loaded" note — deliberately not zeros,
 * which would read as a real business result.
 */
export const KpiGrid: React.FC<KpiGridProps> = ({ kpis, state }) => (
  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
    {KPI_SPECS.map((spec) => (
      <Card key={spec.key} className="p-4">
        <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-text-muted">
          {spec.label}
        </p>

        {state === 'loading' ? (
          <Skeleton className="mt-2 h-7 w-3/4" />
        ) : (
          <p
            className={`mt-2 text-xl font-bold tabular-nums md:text-2xl ${
              state === 'error'
                ? 'text-text-muted'
                : spec.accent
                  ? 'text-wise-neon'
                  : 'text-text-primary'
            }`}
          >
            {state === 'error' || !kpis ? NO_VALUE : spec.render(kpis)}
          </p>
        )}

        {state === 'error' && (
          <p className="mt-1 text-2xs text-text-muted">Not loaded</p>
        )}
      </Card>
    ))}
  </div>
);
