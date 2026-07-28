'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../src/contexts/AuthContext';
import { Card, Badge } from '../../../src/components/ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api';

interface AnalyticsData {
  overview?: {
    totalVisitors?: number;
    totalPageViews?: number;
    avgSessionDuration?: number;
    bounceRate?: number;
  };
  topPages?: Array<{ path: string; views: number }>;
  sources?: Array<{ source: string; visits: number }>;
}

export default function AnalyticsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [posthogConfigured, setPosthogConfigured] = useState(false);

  const getToken = () => localStorage.getItem('auth_token') || localStorage.getItem('authToken') || '';

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/v1/analytics/overview`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) {
          const d = await res.json();
          setData(d);
          setApiAvailable(true);
          if (d.overview && d.overview.totalVisitors > 0) setPosthogConfigured(true);
        }
      } catch { /* silent */ }
      setLoading(false);
    };

    load();
  }, [user?.id]);

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 animate-pulse bg-border-medium rounded" />
        <div className="h-3 w-56 animate-pulse bg-border-medium rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 animate-pulse bg-border-medium rounded-lg" />)}
        </div>
      </div>
    );
  }

  const overview = data?.overview;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-1 text-xs text-text-muted mb-2">
          <Link href="/dashboard/business-os" className="hover:text-wise-electric">Business</Link>
          <span className="opacity-30">/</span>
          <span>Analytics</span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary">📊 Analytics</h1>
        <p className="text-sm text-text-muted mt-1">Business metrics, traffic, and performance insights</p>
      </div>

      {!apiAvailable && (
        <Card className="p-4 border-warning/20 space-y-2">
          <div className="flex items-start gap-3">
            <Badge variant="warning">Not Connected</Badge>
            <div>
              <p className="text-sm font-medium text-text-primary">Analytics API Not Connected</p>
              <p className="text-xs text-text-muted mt-0.5">Configure PostHog or the analytics endpoint to see real data.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Metrics Strip */}
      <Card className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Visitors', value: overview?.totalVisitors ?? '--' },
            { label: 'Page Views', value: overview?.totalPageViews ?? '--' },
            { label: 'Avg. Session', value: overview?.avgSessionDuration ? `${Math.round(overview.avgSessionDuration)}s` : '--' },
            { label: 'Bounce Rate', value: overview?.bounceRate ? `${overview.bounceRate.toFixed(1)}%` : '--' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">{s.label}</p>
              <p className="text-3xl font-bold text-text-primary mt-2 tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Data Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">Top Pages</h2>
          {data?.topPages && data.topPages.length > 0 ? (
            <div className="space-y-3">
              {data.topPages.map((page, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                  <span className="text-sm text-text-secondary truncate flex-1 mr-4 font-mono">{page.path}</span>
                  <span className="text-sm font-medium text-wise-electric tabular-nums shrink-0">{page.views}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">{!posthogConfigured ? 'Configure PostHog to track page views.' : 'No page data available.'}</p>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">Traffic Sources</h2>
          {data?.sources && data.sources.length > 0 ? (
            <div className="space-y-3">
              {data.sources.map((source, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                  <span className="text-sm text-text-secondary">{source.source}</span>
                  <span className="text-sm font-medium text-wise-electric tabular-nums">{source.visits}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">No source data available.</p>
          )}
        </Card>
      </div>

      {/* Integration Status */}
      <Card className="p-6 space-y-4">
        <h2 className="text-sm font-semibold text-text-primary">Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { name: 'PostHog', status: posthogConfigured ? 'Connected' : 'Not Configured', ok: posthogConfigured },
            { name: 'Analytics API', status: apiAvailable ? 'Online' : 'Offline', ok: apiAvailable },
            { name: 'Google Analytics', status: 'Not Configured', ok: false },
          ].map(svc => (
            <div key={svc.name} className="flex items-center gap-3 p-3 rounded-lg bg-wise-black/30 border border-border-subtle">
              <span className={`w-2 h-2 rounded-full shrink-0 ${svc.ok ? 'bg-success' : 'bg-text-muted'}`} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-secondary">{svc.name}</p>
                <p className={`text-xs ${svc.ok ? 'text-success' : 'text-text-muted'}`}>{svc.status}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
