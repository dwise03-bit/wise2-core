'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../src/contexts/AuthContext';

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
        <div className="wise-skeleton h-6 w-32" />
        <div className="wise-skeleton h-3 w-56" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="wise-skeleton h-20 rounded-lg" />)}
        </div>
      </div>
    );
  }

  const overview = data?.overview;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <div className="wise-breadcrumb mb-2">
          <Link href="/dashboard/business-os">Business</Link>
          <span className="opacity-30">/</span>
          <span className="text-text-secondary">Analytics</span>
        </div>
        <h1 className="wise-page-title">Analytics</h1>
        <p className="wise-page-subtitle">Business metrics, traffic, and performance insights</p>
      </div>

      {!apiAvailable && (
        <div className="wise-card p-4 border-warning/20">
          <div className="flex items-start gap-3">
            <span className="wise-badge-warning">Not Connected</span>
            <div>
              <p className="text-sm font-medium text-text-primary">Analytics API Not Connected</p>
              <p className="text-xs text-text-muted mt-0.5">Configure PostHog or the analytics endpoint to see real data.</p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Strip */}
      <div className="wise-card p-1">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {[
            { label: 'Visitors', value: overview?.totalVisitors ?? '--' },
            { label: 'Page Views', value: overview?.totalPageViews ?? '--' },
            { label: 'Avg. Session', value: overview?.avgSessionDuration ? `${Math.round(overview.avgSessionDuration)}s` : '--' },
            { label: 'Bounce Rate', value: overview?.bounceRate ? `${overview.bounceRate.toFixed(1)}%` : '--' },
          ].map(s => (
            <div key={s.label} className="px-4 py-3">
              <div className="text-2xl font-bold text-text-primary tabular-nums">{s.value}</div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="wise-card p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Top Pages</h2>
          {data?.topPages && data.topPages.length > 0 ? (
            <div className="space-y-2">
              {data.topPages.map((page, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-text-secondary truncate flex-1 mr-4 font-mono">{page.path}</span>
                  <span className="text-sm font-medium text-wise-electric tabular-nums">{page.views}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">No page data available.{!posthogConfigured && ' Configure PostHog to track page views.'}</p>
          )}
        </div>

        <div className="wise-card p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Traffic Sources</h2>
          {data?.sources && data.sources.length > 0 ? (
            <div className="space-y-2">
              {data.sources.map((source, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-text-secondary">{source.source}</span>
                  <span className="text-sm font-medium text-wise-electric tabular-nums">{source.visits}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">No source data available.</p>
          )}
        </div>
      </div>

      {/* Integration Status */}
      <div className="wise-card p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-3">Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { name: 'PostHog', status: posthogConfigured ? 'Connected' : 'Not Configured', ok: posthogConfigured },
            { name: 'Analytics API', status: apiAvailable ? 'Online' : 'Offline', ok: apiAvailable },
            { name: 'Google Analytics', status: 'Not Configured', ok: false },
          ].map(svc => (
            <div key={svc.name} className="flex items-center gap-3 p-3 rounded-lg bg-wise-black/30">
              <span className={`wise-status-dot ${svc.ok ? 'bg-green-400' : 'bg-text-muted'}`} />
              <div>
                <p className="text-sm font-medium text-text-secondary">{svc.name}</p>
                <p className={`text-xs ${svc.ok ? 'text-green-400' : 'text-text-muted'}`}>{svc.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
