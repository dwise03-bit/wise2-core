'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';

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
      const token = getToken();

      try {
        const res = await fetch('/api/v1/analytics/overview', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const d = await res.json();
          setData(d);
          setApiAvailable(true);
          if (d.overview && d.overview.totalVisitors > 0) {
            setPosthogConfigured(true);
          }
        }
      } catch { /* analytics API may not be available */ }

      setLoading(false);
    };

    load();
  }, [user?.id]);

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-wise-surface rounded w-32 mb-4" />
          <div className="h-4 bg-wise-surface rounded w-64 mb-8" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-wise-surface rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  const overview = data?.overview;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Analytics</h1>
        <p className="text-text-secondary">Business metrics, traffic, and performance insights</p>
      </div>

      {!apiAvailable && (
        <div className="bg-wise-surface border border-amber-500/30 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Analytics API Not Connected</h3>
              <p className="text-text-muted text-sm">
                The analytics service did not respond. Configure PostHog or the analytics endpoint to see real data.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Visitors', value: overview?.totalVisitors ?? '—', icon: '👥' },
          { label: 'Page Views', value: overview?.totalPageViews ?? '—', icon: '📄' },
          { label: 'Avg. Session', value: overview?.avgSessionDuration ? `${Math.round(overview.avgSessionDuration)}s` : '—', icon: '⏱' },
          { label: 'Bounce Rate', value: overview?.bounceRate ? `${overview.bounceRate.toFixed(1)}%` : '—', icon: '↩️' },
        ].map(s => (
          <div key={s.label} className="bg-wise-surface border border-wise-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span>{s.icon}</span>
              <p className="text-xs text-text-muted">{s.label}</p>
            </div>
            <p className="text-2xl font-bold text-wise-electric">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-wise-surface border border-wise-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Top Pages</h3>
          {data?.topPages && data.topPages.length > 0 ? (
            <div className="space-y-3">
              {data.topPages.map((page, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-text-primary truncate flex-1 mr-4">{page.path}</span>
                  <span className="text-sm font-medium text-wise-electric">{page.views}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm">No page data available. {!posthogConfigured && 'Configure PostHog to track page views.'}</p>
          )}
        </div>

        <div className="bg-wise-surface border border-wise-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Traffic Sources</h3>
          {data?.sources && data.sources.length > 0 ? (
            <div className="space-y-3">
              {data.sources.map((source, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-text-primary">{source.source}</span>
                  <span className="text-sm font-medium text-wise-electric">{source.visits}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm">No source data available.</p>
          )}
        </div>
      </div>

      <div className="bg-wise-surface border border-wise-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-2">Integration Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {[
            { name: 'PostHog', status: posthogConfigured ? 'Connected' : 'Not Configured', ok: posthogConfigured },
            { name: 'Analytics API', status: apiAvailable ? 'Online' : 'Offline', ok: apiAvailable },
            { name: 'Google Analytics', status: 'Not Configured', ok: false },
          ].map(svc => (
            <div key={svc.name} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${svc.ok ? 'bg-green-400' : 'bg-gray-500'}`} />
              <div>
                <p className="text-sm font-medium text-text-primary">{svc.name}</p>
                <p className={`text-xs ${svc.ok ? 'text-green-400' : 'text-text-muted'}`}>{svc.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
