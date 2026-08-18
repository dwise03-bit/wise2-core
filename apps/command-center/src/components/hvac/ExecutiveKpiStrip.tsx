'use client';

import React, { useEffect, useState } from 'react';
import { Card, Badge } from '../ui';

interface KpiData {
  newLeads: { count: number; change: number };
  soldThisWeek: { amount: number; change: number };
  jobsCompleted: { count: number; change: number };
  todaysAppointments: { count: number };
}

export function ExecutiveKpiStrip({ tenantId }: { tenantId: string }) {
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const response = await fetch(`/api/v1/revenue-os/dashboard/kpis`, {
          headers: {
            'X-Tenant-ID': tenantId,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch KPIs');
        const data = await response.json();
        setKpis(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchKpis();
    const interval = setInterval(fetchKpis, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [tenantId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-24 bg-wise-black/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !kpis) {
    return (
      <div className="text-red-500 text-sm p-4">
        Error loading KPIs: {error}
      </div>
    );
  }

  const TrendBadge = ({ value }: { value: number }) => {
    const isPositive = value >= 0;
    return (
      <span className={isPositive ? 'text-wise-success' : 'text-wise-danger'}>
        {isPositive ? '↑' : '↓'} {Math.abs(value)}%
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-6 border border-wise-blue/30 bg-wise-blue/5">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">NEW LEADS</p>
        <p className="text-3xl font-bold text-wise-electric mt-2">{kpis.newLeads.count}</p>
        <p className="text-xs text-wise-success mt-1">
          <TrendBadge value={kpis.newLeads.change} /> vs last week
        </p>
      </Card>

      <Card className="p-6 border border-wise-success/30 bg-wise-success/5">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">SOLD THIS WEEK</p>
        <p className="text-3xl font-bold text-wise-success mt-2">
          ${(kpis.soldThisWeek.amount / 1000).toFixed(1)}k
        </p>
        <p className="text-xs text-wise-success mt-1">
          <TrendBadge value={kpis.soldThisWeek.change} /> vs last week
        </p>
      </Card>

      <Card className="p-6 border border-wise-neon/30 bg-wise-neon/5">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">JOBS COMPLETED</p>
        <p className="text-3xl font-bold text-wise-neon mt-2">{kpis.jobsCompleted.count}</p>
        <p className="text-xs text-wise-success mt-1">
          <TrendBadge value={kpis.jobsCompleted.change} /> vs last week
        </p>
      </Card>

      <Card className="p-6 border border-wise-orange/30 bg-wise-orange/5">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">TODAY'S APPOINTMENTS</p>
        <p className="text-3xl font-bold text-wise-orange mt-2">{kpis.todaysAppointments.count}</p>
        <p className="text-xs text-text-secondary mt-1">Active jobs</p>
      </Card>
    </div>
  );
}
