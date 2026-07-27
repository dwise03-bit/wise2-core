'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../src/contexts/AuthContext';

interface DashboardMetrics {
  revenue: number;
  subscriptions: number;
  prospects: number;
  projects: number;
  usage: {
    current: number;
    limit: number;
  };
  health: {
    api: 'online' | 'offline' | 'loading';
    database: 'online' | 'offline' | 'loading';
  };
}

const MetricCard = ({
  label,
  value,
  unit,
  icon,
  status,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
  status?: 'success' | 'warning' | 'error' | 'neutral';
}) => {
  const statusColors = {
    success: 'text-green-400 border-green-500/30',
    warning: 'text-yellow-400 border-yellow-500/30',
    error: 'text-red-400 border-red-500/30',
    neutral: 'text-text-secondary border-wise-border',
  };

  return (
    <div
      className={`
        bg-wise-surface border rounded-lg p-6
        ${statusColors[status || 'neutral']}
        hover:border-wise-electric/50 transition-all
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        <div className="text-right">
          <div className="text-3xl font-bold text-text-primary">{value}</div>
          {unit && <div className="text-xs text-text-muted mt-1">{unit}</div>}
        </div>
      </div>
      <div className="text-sm text-text-muted">{label}</div>
    </div>
  );
};

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    fetchMetrics();
  }, [user?.id]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setMetrics({
          revenue: 0,
          subscriptions: 0,
          prospects: 0,
          projects: 0,
          usage: { current: 0, limit: 0 },
          health: { api: 'offline', database: 'offline' },
        });
        setLoading(false);
        return;
      }

      // Fetch subscription data
      const subscriptionRes = await fetch('/api/v1/billing/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const subscription = subscriptionRes.ok ? await subscriptionRes.json() : null;

      // Fetch prospects data
      const prospectsRes = await fetch('/api/v1/prospects', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const prospects = prospectsRes.ok ? await prospectsRes.json() : null;

      // Set metrics with actual data or fallback states
      setMetrics({
        revenue: subscription?.totalRevenue || 0,
        subscriptions: subscription?.activeSubscriptions || 0,
        prospects: Array.isArray(prospects) ? prospects.length : 0,
        projects: 0,
        usage: {
          current: subscription?.usage?.current || 0,
          limit: subscription?.usage?.limit || 0,
        },
        health: {
          api: subscriptionRes.ok ? 'online' : 'offline',
          database: prospectsRes.ok ? 'online' : 'offline',
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load metrics';
      setError(message);
      setMetrics({
        revenue: 0,
        subscriptions: 0,
        prospects: 0,
        projects: 0,
        usage: { current: 0, limit: 0 },
        health: { api: 'offline', database: 'offline' },
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-wise-surface rounded w-32 mb-4"></div>
          <div className="h-4 bg-wise-surface rounded w-64"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Dashboard</h1>
        <p className="text-text-secondary">
          Monitor, control, and automate your business operations.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Monthly Revenue"
          value={`$${metrics?.revenue.toLocaleString() || 0}`}
          icon="💰"
          status={metrics?.revenue ? 'success' : 'neutral'}
        />
        <MetricCard
          label="Active Subscriptions"
          value={metrics?.subscriptions || 'SETUP REQUIRED'}
          unit="subscribers"
          icon="👥"
          status={metrics?.subscriptions ? 'success' : 'warning'}
        />
        <MetricCard
          label="Prospects"
          value={metrics?.prospects || 'NOT CONNECTED'}
          unit="leads"
          icon="🎯"
          status={metrics?.prospects ? 'success' : 'warning'}
        />
        <MetricCard
          label="Projects"
          value={metrics?.projects || 'EMPTY'}
          unit="active"
          icon="📁"
          status={metrics?.projects ? 'success' : 'neutral'}
        />
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage */}
        <div className="bg-wise-surface border border-wise-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Usage This Month</h3>
            <span className="text-2xl">⚡</span>
          </div>
          <div className="mb-4">
            <div className="w-full bg-wise-black rounded-full h-2">
              <div
                className="bg-gradient-to-r from-wise-electric to-wise-electric_hover h-2 rounded-full"
                style={{
                  width: `${metrics?.usage ? (metrics.usage.current / Math.max(metrics.usage.limit, 1)) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
          <div className="flex justify-between text-sm text-text-secondary">
            <span>{metrics?.usage?.current || 0} used</span>
            <span>/ {metrics?.usage?.limit || 0} available</span>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-wise-surface border border-wise-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">System Health</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">API Status</span>
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  metrics?.health?.api === 'online' ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
              <span className="text-xs text-text-muted capitalize">
                {metrics?.health?.api || 'OFFLINE'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Database Status</span>
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  metrics?.health?.database === 'online' ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
              <span className="text-xs text-text-muted capitalize">
                {metrics?.health?.database || 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-wise-surface border border-wise-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Access</h3>
          <div className="space-y-2">
            <Link
              href="/dashboard/sound-labs"
              className="block px-4 py-2 bg-wise-electric/10 hover:bg-wise-electric/20 border border-wise-border rounded-lg text-wise-electric text-sm font-semibold transition-colors text-center"
            >
              Sound Labs
            </Link>
            <Link
              href="/dashboard/workflows"
              className="block px-4 py-2 bg-wise-electric/10 hover:bg-wise-electric/20 border border-wise-border rounded-lg text-wise-electric text-sm font-semibold transition-colors text-center"
            >
              Workflows
            </Link>
            <Link
              href="/dashboard/analytics"
              className="block px-4 py-2 bg-wise-electric/10 hover:bg-wise-electric/20 border border-wise-border rounded-lg text-wise-electric text-sm font-semibold transition-colors text-center"
            >
              Analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
