'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../src/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api';

interface SystemService {
  name: string;
  status: 'online' | 'offline' | 'partial';
  label: string;
}

interface DashboardData {
  prospects: number;
  customers: number;
  projects: number;
  assets: number;
  recordings: number;
  services: SystemService[];
}

function StatCell({ label, value, href }: { label: string; value: string | number; href: string }) {
  return (
    <Link href={href} className="group flex flex-col gap-1 px-4 py-3 rounded-lg hover:bg-white/[0.03] transition-colors">
      <span className="text-2xl font-bold text-text-primary tabular-nums group-hover:text-wise-electric transition-colors">{value}</span>
      <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">{label}</span>
    </Link>
  );
}

function StatusDot({ status }: { status: 'online' | 'offline' | 'partial' }) {
  const color = status === 'online' ? 'bg-green-400' : status === 'partial' ? 'bg-amber-400' : 'bg-red-400';
  return <span className={`wise-status-dot ${color}`} />;
}

const QA_ICONS: Record<string, string> = {
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  record: '<circle cx="12" cy="12" r="6"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
};

function QuickAction({ label, href, icon }: { label: string; href: string; icon: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border-subtle hover:border-wise-electric/30 hover:bg-wise-electric/[0.04] transition-all text-sm text-text-secondary hover:text-text-primary"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 shrink-0" dangerouslySetInnerHTML={{ __html: QA_ICONS[icon] || QA_ICONS.plus }} />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token || !user?.id) {
      setData({ prospects: 0, customers: 0, projects: 0, assets: 0, recordings: 0, services: [] });
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    const services: SystemService[] = [];

    let prospects = 0, customers = 0, projects = 0, assets = 0, recordings = 0;

    try {
      const res = await fetch(`${API_URL}/v1/prospects`, { headers });
      if (res.ok) {
        const d = await res.json();
        prospects = Array.isArray(d) ? d.length : d.prospects?.length || 0;
        services.push({ name: 'prospects', status: 'online', label: 'Prospects API' });
      } else {
        services.push({ name: 'prospects', status: 'offline', label: 'Prospects API' });
      }
    } catch {
      services.push({ name: 'prospects', status: 'offline', label: 'Prospects API' });
    }

    try {
      const res = await fetch(`${API_URL}/v1/customers`, { headers });
      if (res.ok) {
        const d = await res.json();
        customers = Array.isArray(d) ? d.length : d.customers?.length || d.total || 0;
        services.push({ name: 'customers', status: 'online', label: 'CRM' });
      } else {
        services.push({ name: 'customers', status: 'offline', label: 'CRM' });
      }
    } catch {
      services.push({ name: 'customers', status: 'offline', label: 'CRM' });
    }

    try {
      const res = await fetch(`${API_URL}/v1/gallery?userId=${user.id}&limit=1`, { headers });
      if (res.ok) {
        const d = await res.json();
        assets = d.total || d.assets?.length || 0;
        services.push({ name: 'gallery', status: 'online', label: 'Gallery' });
      } else {
        services.push({ name: 'gallery', status: 'offline', label: 'Gallery' });
      }
    } catch {
      services.push({ name: 'gallery', status: 'offline', label: 'Gallery' });
    }

    try {
      const res = await fetch(`${API_URL}/v1/gallery?sourceModule=live-studio&userId=${user.id}&limit=1`, { headers });
      if (res.ok) {
        const d = await res.json();
        recordings = d.total || d.assets?.length || 0;
      }
    } catch { /* silent */ }

    setData({ prospects, customers, projects, assets, recordings, services });
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    fetchData();
  }, [user?.id, fetchData]);

  if (isLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="wise-skeleton h-6 w-40" />
        <div className="wise-skeleton h-3 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="wise-skeleton h-20 rounded-lg" />)}
        </div>
      </div>
    );
  }

  const allServices = data?.services || [];
  const onlineCount = allServices.filter(s => s.status === 'online').length;
  const systemStatus = allServices.length === 0 ? 'offline'
    : onlineCount === allServices.length ? 'online'
    : onlineCount > 0 ? 'partial' : 'offline';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="wise-page-title">Command Center</h1>
          <p className="wise-page-subtitle">Platform overview and operations</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-subtle">
          <StatusDot status={systemStatus} />
          <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
            {systemStatus === 'online' ? 'All Systems' : systemStatus === 'partial' ? 'Partial' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Command Strip */}
      <div className="wise-card p-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <StatCell label="Prospects" value={data?.prospects || 0} href="/dashboard/leads" />
          <StatCell label="Customers" value={data?.customers || 0} href="/dashboard/customers" />
          <StatCell label="Projects" value={data?.projects || 0} href="/dashboard/sound-labs/projects" />
          <StatCell label="Assets" value={data?.assets || 0} href="/dashboard/gallery" />
          <StatCell label="Recordings" value={data?.recordings || 0} href="/dashboard/live-studio/recordings" />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Operations — 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          {/* Business Activity */}
          <div className="wise-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text-primary">Business</h2>
              <Link href="/dashboard/business-os" className="text-xs text-text-muted hover:text-wise-electric transition-colors">View all</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link href="/dashboard/leads" className="group p-3 rounded-lg bg-wise-black/40 hover:bg-wise-electric/[0.04] border border-transparent hover:border-wise-electric/20 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-text-muted">Pipeline</span>
                  <span className="wise-badge-info">Active</span>
                </div>
                <div className="text-lg font-bold text-text-primary">{data?.prospects || 0} Prospects</div>
                <div className="text-xs text-text-muted mt-1">{data?.customers || 0} customers converted</div>
              </Link>
              <Link href="/dashboard/billing" className="group p-3 rounded-lg bg-wise-black/40 hover:bg-wise-electric/[0.04] border border-transparent hover:border-wise-electric/20 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-text-muted">Revenue</span>
                  <span className="wise-badge-success">Tracking</span>
                </div>
                <div className="text-lg font-bold text-text-primary">Billing</div>
                <div className="text-xs text-text-muted mt-1">Subscription management</div>
              </Link>
              <Link href="/dashboard/analytics" className="group p-3 rounded-lg bg-wise-black/40 hover:bg-wise-electric/[0.04] border border-transparent hover:border-wise-electric/20 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-text-muted">Analytics</span>
                  <span className="wise-badge-neutral">Available</span>
                </div>
                <div className="text-lg font-bold text-text-primary">Reports</div>
                <div className="text-xs text-text-muted mt-1">Business intelligence</div>
              </Link>
            </div>
          </div>

          {/* Creator Activity */}
          <div className="wise-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text-primary">Creator</h2>
              <Link href="/dashboard/sound-labs" className="text-xs text-text-muted hover:text-wise-electric transition-colors">Sound Labs</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link href="/dashboard/sound-labs" className="group p-3 rounded-lg bg-wise-black/40 hover:bg-wise-electric/[0.04] border border-transparent hover:border-wise-electric/20 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-text-muted">Sound Labs</span>
                  <span className="wise-badge-success">Ready</span>
                </div>
                <div className="text-lg font-bold text-text-primary">{data?.projects || 0} Projects</div>
                <div className="text-xs text-text-muted mt-1">Audio production workspace</div>
              </Link>
              <Link href="/dashboard/live-studio" className="group p-3 rounded-lg bg-wise-black/40 hover:bg-wise-electric/[0.04] border border-transparent hover:border-wise-electric/20 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-text-muted">Live Studio</span>
                  <span className="wise-badge-success">Ready</span>
                </div>
                <div className="text-lg font-bold text-text-primary">{data?.recordings || 0} Recordings</div>
                <div className="text-xs text-text-muted mt-1">Camera + screen capture</div>
              </Link>
              <Link href="/dashboard/gallery" className="group p-3 rounded-lg bg-wise-black/40 hover:bg-wise-electric/[0.04] border border-transparent hover:border-wise-electric/20 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-text-muted">Gallery</span>
                  <span className="wise-badge-info">Hub</span>
                </div>
                <div className="text-lg font-bold text-text-primary">{data?.assets || 0} Assets</div>
                <div className="text-xs text-text-muted mt-1">Shared asset backbone</div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* System Status */}
          <div className="wise-card p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-3">System Status</h2>
            <div className="space-y-2.5">
              {allServices.map((svc) => (
                <div key={svc.name} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{svc.label}</span>
                  <div className="flex items-center gap-2">
                    <StatusDot status={svc.status} />
                    <span className="text-xs text-text-muted uppercase">{svc.status}</span>
                  </div>
                </div>
              ))}
              {[
                { label: 'Sound Labs', status: 'online' as const },
                { label: 'Live Studio', status: 'online' as const },
                { label: 'Authentication', status: user ? 'online' as const : 'offline' as const },
              ].map((svc) => (
                <div key={svc.label} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{svc.label}</span>
                  <div className="flex items-center gap-2">
                    <StatusDot status={svc.status} />
                    <span className="text-xs text-text-muted uppercase">{svc.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="wise-card p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-3">Quick Actions</h2>
            <div className="space-y-1.5">
              <QuickAction label="New Prospect" href="/dashboard/leads" icon="plus" />
              <QuickAction label="Start Recording" href="/dashboard/live-studio" icon="record" />
              <QuickAction label="Open Gallery" href="/dashboard/gallery" icon="grid" />
              <QuickAction label="Create Jingle" href="/dashboard/sound-labs/jingle-lab" icon="music" />
              <QuickAction label="New Project" href="/dashboard/sound-labs/projects" icon="plus" />
            </div>
          </div>

          {/* Workspace */}
          <div className="wise-card p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-3">Workspace</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">User</span>
                <span className="text-text-secondary font-medium">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Role</span>
                <span className="wise-badge-info">{user?.role || 'USER'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Branch</span>
                <span className="text-text-secondary font-mono text-xs">ui/unified-command-center</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
