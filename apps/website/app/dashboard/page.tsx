'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { clearBrowserAuthSession, getBrowserAuthToken, getBrowserAuthUser } from '@/lib/auth-session';

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
    neutral: 'text-wise-text-secondary border-wise-primary-border',
  };

  return (
    <div
      className={`
        bg-wise-bg-card border rounded-lg p-6
        ${statusColors[status || 'neutral']}
        hover:border-wise-primary-hover/50 transition-all
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        <div className="text-right">
          <div className="text-3xl font-bold text-wise-text-primary">{value}</div>
          {unit && <div className="text-xs text-wise-text-muted mt-1">{unit}</div>}
        </div>
      </div>
      <div className="text-sm text-wise-text-muted">{label}</div>
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; userId?: string } | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const refresh = params.get('refresh');

    if (token) {
      localStorage.setItem('auth_token', token);
      if (refresh) {
        localStorage.setItem('refresh_token', refresh);
      }
      window.history.replaceState({}, '', '/dashboard');
    }

    const sessionToken = getBrowserAuthToken();
    const sessionUser = getBrowserAuthUser();

    if (!sessionToken) {
      router.push('/login');
      return;
    }

    setUser(
      sessionUser
        ? {
            email: String(sessionUser.email ?? ''),
            userId: String(sessionUser.userId ?? sessionUser.id ?? ''),
          }
        : null
    );
    fetchMetrics(token);
  }, [router]);

  const fetchMetrics = async (token: string) => {
    try {
      setLoading(true);
      setError(null);

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

  const handleLogout = () => {
    clearBrowserAuthSession();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-wise-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-wise-primary mb-4">⚡</div>
          <p className="text-wise-text-secondary">Loading executive dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wise-bg-primary text-wise-text-primary">
      {/* Header */}
      <div className="border-b border-wise-primary-border bg-wise-bg-secondary/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-wise-primary mb-2">Executive Dashboard</h1>
              <p className="text-wise-text-secondary">Welcome back, {user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-wise-danger hover:bg-red-600 rounded-lg transition-colors text-white text-sm font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Usage */}
          <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-wise-text-primary">Usage This Month</h3>
              <span className="text-2xl">⚡</span>
            </div>
            <div className="mb-4">
              <div className="w-full bg-wise-surface rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-wise-primary to-wise-primary-light h-2 rounded-full"
                  style={{
                    width: `${metrics?.usage ? (metrics.usage.current / metrics.usage.limit) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex justify-between text-sm text-wise-text-secondary">
              <span>{metrics?.usage?.current || 0} used</span>
              <span>/ {metrics?.usage?.limit || 0} available</span>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-wise-text-primary mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-wise-text-secondary">API Status</span>
                <span className={`inline-block w-2 h-2 rounded-full ${
                  metrics?.health?.api === 'online' ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <span className="text-xs text-wise-text-muted capitalize">
                  {metrics?.health?.api || 'OFFLINE'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-wise-text-secondary">Database Status</span>
                <span className={`inline-block w-2 h-2 rounded-full ${
                  metrics?.health?.database === 'online' ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <span className="text-xs text-wise-text-muted capitalize">
                  {metrics?.health?.database || 'OFFLINE'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-wise-text-primary mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/sound-labs"
                className="block px-4 py-2 bg-wise-primary/10 hover:bg-wise-primary/20 border border-wise-primary-border rounded-lg text-wise-primary text-sm font-semibold transition-colors text-center"
              >
                Sound Labs
              </Link>
              <Link
                href="/live-studio"
                className="block px-4 py-2 bg-wise-primary/10 hover:bg-wise-primary/20 border border-wise-primary-border rounded-lg text-wise-primary text-sm font-semibold transition-colors text-center"
              >
                Live Studio
              </Link>
              <Link
                href="/dashboard/spectrum"
                className="block px-4 py-2 bg-green-600/10 hover:bg-green-600/20 border border-green-500/30 rounded-lg text-green-400 text-sm font-semibold transition-colors text-center"
              >
                📡 Spectrum Monitor
              </Link>
              <Link
                href="/gallery"
                className="block px-4 py-2 bg-wise-primary/10 hover:bg-wise-primary/20 border border-wise-primary-border rounded-lg text-wise-primary text-sm font-semibold transition-colors text-center"
              >
                Gallery
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="border-t border-wise-primary-border pt-8 mt-12">
          <div className="flex flex-wrap gap-6 text-sm">
            <Link href="/" className="text-wise-primary hover:text-wise-primary-light transition-colors">
              ← Back Home
            </Link>
            <Link href="/sound-labs" className="text-wise-primary hover:text-wise-primary-light transition-colors">
              Sound Labs →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
