'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../src/contexts/AuthContext';
import { Card, Badge } from '../../../src/components/ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api';

interface BusinessData {
  prospects: number;
  customers: number;
  pipelineValue: number;
  conversionRate: number;
  apiStatus: { prospects: boolean; customers: boolean; billing: boolean };
}

export default function BusinessOSPage() {
  const { user, isLoading } = useAuth();
  const [data, setData] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token || !user?.id) { setLoading(false); return; }
    const headers = { Authorization: `Bearer ${token}` };
    const d: BusinessData = { prospects: 0, customers: 0, pipelineValue: 0, conversionRate: 0, apiStatus: { prospects: false, customers: false, billing: false } };

    try {
      const res = await fetch(`${API_URL}/v1/prospects/stats/pipeline`, { headers });
      if (res.ok) {
        const s = await res.json();
        d.prospects = s.totalProspects || 0;
        d.pipelineValue = s.totalOpportunity || 0;
        d.conversionRate = s.conversionRate || 0;
        d.apiStatus.prospects = true;
      }
    } catch { /* silent */ }

    try {
      const res = await fetch(`${API_URL}/v1/customers?limit=1`, { headers });
      if (res.ok) {
        const c = await res.json();
        d.customers = c.total || c.customers?.length || 0;
        d.apiStatus.customers = true;
      }
    } catch { /* silent */ }

    try {
      const res = await fetch(`${API_URL}/v1/billing/subscription`, { headers });
      if (res.ok) d.apiStatus.billing = true;
    } catch { /* silent */ }

    setData(d);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    fetchData();
  }, [user?.id, fetchData]);

  const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);

  if (isLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-36 animate-pulse bg-border-medium rounded" />
        <div className="h-3 w-56 animate-pulse bg-border-medium rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 animate-pulse bg-border-medium rounded-lg" />)}
        </div>
      </div>
    );
  }

  const modules = [
    { title: 'Prospects', desc: 'Sales pipeline and lead management', href: '/dashboard/leads', badge: data?.apiStatus.prospects ? 'ACTIVE' : 'OFFLINE', badgeVariant: data?.apiStatus.prospects ? 'success' : 'danger', stat: `${data?.prospects || 0} leads` },
    { title: 'CRM / Customers', desc: 'Customer relationships and accounts', href: '/dashboard/customers', badge: data?.apiStatus.customers ? 'ACTIVE' : 'AWAITING DEPLOY', badgeVariant: data?.apiStatus.customers ? 'success' : 'warning' },
    { title: 'Billing', desc: 'Subscriptions, plans, and invoices', href: '/dashboard/billing', badge: data?.apiStatus.billing ? 'CONNECTED' : 'SETUP REQUIRED', badgeVariant: data?.apiStatus.billing ? 'success' : 'warning' },
    { title: 'Analytics', desc: 'Business metrics and performance', href: '/dashboard/analytics', badge: 'AVAILABLE', badgeVariant: 'info' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">📊 Business</h1>
        <p className="text-sm text-text-muted mt-1">CRM, billing, and business operations</p>
      </div>

      {/* Pipeline Summary */}
      <Card className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Prospects</p>
            <p className="text-3xl font-bold text-text-primary mt-2 tabular-nums">{data?.prospects || 0}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Customers</p>
            <p className="text-3xl font-bold text-text-primary mt-2 tabular-nums">{data?.customers || 0}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Pipeline Value</p>
            <p className="text-3xl font-bold text-text-primary mt-2 tabular-nums">{fmt(data?.pipelineValue || 0)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Conversion</p>
            <p className="text-3xl font-bold text-wise-neon mt-2 tabular-nums">{(data?.conversionRate || 0).toFixed(1)}%</p>
          </div>
        </div>
      </Card>

      {/* Workflow Visual */}
      <Card className="p-6 space-y-4">
        <h2 className="text-sm font-semibold text-text-primary">Business Workflow</h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['Prospect', 'Qualified', 'Proposal', 'Customer', 'Billing'].map((step, i) => (
            <React.Fragment key={step}>
              <div className="flex-shrink-0 px-4 py-2.5 rounded-lg bg-wise-black/40 border border-border-subtle text-sm font-medium text-text-secondary">
                {step}
              </div>
              {i < 4 && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-text-muted opacity-40">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              )}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((mod) => (
          <Link key={mod.title} href={mod.href}>
            <Card interactive className="p-6 h-full group space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="text-base font-semibold text-text-primary group-hover:text-wise-electric transition-colors">{mod.title}</h3>
                <Badge variant={mod.badgeVariant as any}>{mod.badge}</Badge>
              </div>
              <p className="text-sm text-text-muted">{mod.desc}</p>
              {mod.stat && <p className="text-xs text-text-secondary font-medium">{mod.stat}</p>}
            </Card>
          </Link>
        ))}
      </div>

      {/* Future Capabilities */}
      <Card className="p-6 space-y-4">
        <h2 className="text-sm font-semibold text-text-primary">Planned Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: 'Automation', desc: 'Workflow automation engine' },
            { label: 'Consulting', desc: 'Engagement management' },
            { label: 'Audits', desc: 'Security & compliance reviews' },
          ].map((cap) => (
            <div key={cap.label} className="flex items-center gap-3 p-4 rounded-lg bg-wise-black/30 border border-border-subtle">
              <Badge variant="neutral">Coming Soon</Badge>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-secondary">{cap.label}</p>
                <p className="text-xs text-text-muted">{cap.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
