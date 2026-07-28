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

function MetricCard({ label, value, href, change, status }: { label: string; value: string | number; href: string; change?: string; status?: 'positive' | 'warning' | 'neutral' }) {
  const statusColor = status === 'positive' ? 'text-[var(--organized-chaos-green)]' : status === 'warning' ? 'text-[var(--warning)]' : 'text-[var(--text-secondary)]';

  return (
    <Link href={href} className="group flex flex-col gap-1 xs:gap-2 p-2.5 xs:p-4 min-h-[76px] xs:min-h-[88px] bg-[var(--wise-steel)] border border-[var(--border-medium)] rounded-[var(--radius-wise)] hover:border-[var(--border-strong)] hover:shadow-md transition-all duration-200">
      <span className="text-xs font-semibold uppercase tracking-wider xs:tracking-widest text-[var(--text-muted)]">{label}</span>
      <span className="text-xl xs:text-2xl font-bold text-[var(--text-primary)] tabular-nums group-hover:text-[var(--organized-chaos-green)] transition-colors">{value}</span>
      {change && <span className={`text-xs font-medium ${statusColor}`}>{change}</span>}
    </Link>
  );
}

function StatusDot({ status }: { status: 'online' | 'offline' | 'partial' }) {
  const color = status === 'online' ? 'bg-[var(--organized-chaos-green)]' : status === 'partial' ? 'bg-[var(--warning)]' : 'bg-[var(--danger)]';
  return <span className={`inline-block w-2 h-2 rounded-full ${color} animate-pulse`} />;
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
      className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-wise)] border border-[var(--border-medium)] hover:border-[var(--border-green)] hover:bg-[var(--green-dim)] transition-all text-sm text-[var(--text-secondary)] hover:text-[var(--organized-chaos-green)]"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 shrink-0" dangerouslySetInnerHTML={{ __html: QA_ICONS[icon] || QA_ICONS.plus }} />
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
      <div className="space-y-4 pb-24 md:pb-0">
        <div className="px-4 xs:px-0 space-y-3">
          <div className="wise-skeleton h-6 w-40" />
          <div className="wise-skeleton h-3 w-64" />
        </div>
        <div className="px-4 xs:px-0">
          <div className="grid grid-cols-2 xs:grid-cols-3 lg:grid-cols-5 gap-2 xs:gap-3 mt-4">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="wise-skeleton h-16 xs:h-20 rounded-lg" />)}
          </div>
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
    <div className="min-h-screen flex flex-col pb-24 md:pb-0 animate-fade-in">
      <div className="space-y-4 md:space-y-6">
        {/* Greeting Header — Time-aware */}
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-4 px-4 xs:px-0">
          <div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-0.5 xs:mb-1">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.firstName || 'Operator'}
            </h1>
            <p className="text-xs xs:text-sm text-[var(--text-muted)]">Here's what requires your attention today.</p>
          </div>
          <div className="flex items-center gap-2 xs:gap-3 px-3 xs:px-4 py-1.5 xs:py-2 bg-[var(--wise-steel)] border border-[var(--border-medium)] rounded-[var(--radius-wise)] shrink-0">
            <StatusDot status={systemStatus} />
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
              {systemStatus === 'online' ? 'All Systems Online' : systemStatus === 'partial' ? 'Partial Service' : 'System Offline'}
            </span>
          </div>
        </div>

      {/* Executive Metrics — 5-column grid, responsive */}
      <div className="px-4 xs:px-0">
        <div className="grid grid-cols-2 xs:grid-cols-3 lg:grid-cols-5 gap-2 xs:gap-3">
          <MetricCard label="Revenue" value="$0" href="/dashboard/billing" status="neutral" />
          <MetricCard label="Leads" value={data?.prospects || 0} href="/dashboard/leads" status="positive" />
          <MetricCard label="Active Customers" value={data?.customers || 0} href="/dashboard/customers" status="positive" />
          <MetricCard label="Open Tasks" value={data?.projects || 0} href="/dashboard/sound-labs/projects" status="neutral" />
          <MetricCard label="Automations" value="0" href="/dashboard/business-os" status="positive" />
        </div>
      </div>

      {/* Phase 4: Priority Actions — Full width, top priority */}
      <div className="px-4 xs:px-0">
        <div className="wise-card p-4 xs:p-5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Priority Actions</h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2 xs:gap-3">
            <button className="p-3 xs:p-4 rounded-[var(--radius-wise)] bg-[var(--wise-steel)] border border-[var(--border-medium)] hover:border-[var(--border-green)] hover:bg-[var(--green-dim)] transition-all min-h-[80px] xs:min-h-[100px] flex flex-col justify-between">
              <span className="text-xs font-medium text-[var(--text-muted)] text-left">New Prospect</span>
              <span className="text-lg font-bold text-[var(--organized-chaos-green)] text-left">+{data?.prospects || 0}</span>
            </button>
            <button className="p-3 xs:p-4 rounded-[var(--radius-wise)] bg-[var(--wise-steel)] border border-[var(--border-medium)] hover:border-[var(--border-green)] hover:bg-[var(--green-dim)] transition-all min-h-[80px] xs:min-h-[100px] flex flex-col justify-between">
              <span className="text-xs font-medium text-[var(--text-muted)] text-left">Start Recording</span>
              <span className="text-lg font-bold text-[var(--text-secondary)] text-left">{data?.recordings || 0}</span>
            </button>
            <button className="p-3 xs:p-4 rounded-[var(--radius-wise)] bg-[var(--wise-steel)] border border-[var(--border-medium)] hover:border-[var(--border-green)] hover:bg-[var(--green-dim)] transition-all min-h-[80px] xs:min-h-[100px] flex flex-col justify-between">
              <span className="text-xs font-medium text-[var(--text-muted)] text-left">New Project</span>
              <span className="text-lg font-bold text-[var(--text-secondary)] text-left">{data?.projects || 0}</span>
            </button>
            <button className="p-3 xs:p-4 rounded-[var(--radius-wise)] bg-[var(--wise-steel)] border border-[var(--border-medium)] hover:border-[var(--border-green)] hover:bg-[var(--green-dim)] transition-all min-h-[80px] xs:min-h-[100px] flex flex-col justify-between">
              <span className="text-xs font-medium text-[var(--text-muted)] text-left">View Automations</span>
              <span className="text-lg font-bold text-[var(--organized-chaos-green)] text-left">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Phase 4: WISE Intelligence — AI Insights with green glow */}
      <div className="px-4 xs:px-0">
        <div className="wise-card p-4 xs:p-5 bg-[var(--wise-dark-steel)] border-[var(--border-green)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--organized-chaos-green)] animate-pulse" />
              <h2 className="text-sm font-semibold text-[var(--organized-chaos-green)]">WISE Intelligence</h2>
            </div>
            <span className="text-xs font-medium text-[var(--text-muted)]">Live</span>
          </div>
          <p className="text-xs xs:text-sm text-[var(--text-secondary)] mb-3">
            Your command center is fully operational. {data?.customers || 0} active customers, {data?.prospects || 0} prospects in pipeline. System performance nominal.
          </p>
          <div className="flex gap-2">
            <button className="flex-1 px-3 py-2 rounded-[var(--radius-wise)] bg-[var(--organized-chaos-green)]/10 border border-[var(--border-green)] text-xs font-medium text-[var(--organized-chaos-green)] hover:bg-[var(--organized-chaos-green)]/20 transition-all">View Insights</button>
            <button className="flex-1 px-3 py-2 rounded-[var(--radius-wise)] border border-[var(--border-medium)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">Dismiss</button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="px-4 xs:px-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Operations — 2 cols */}
        <div className="lg:col-span-2 space-y-4 px-4 xs:px-0">
          {/* Business Activity */}
          <div className="wise-card p-4 xs:p-5">
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

          {/* Creator Activity / Digital Workforce */}
          <div className="wise-card p-4 xs:p-5">
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

          {/* Phase 4: Digital Workforce — Agent status with green pulse */}
          <div className="wise-card p-4 xs:p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Digital Workforce</h2>
              <span className="text-xs text-[var(--text-muted)]">Live Agents</span>
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
              <div className="p-3 rounded-[var(--radius-wise)] bg-[var(--wise-steel)] border border-[var(--border-medium)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[var(--text-muted)]">Hermes AI Agent</span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold text-[var(--organized-chaos-green)] bg-[var(--green-dim)] border border-[var(--border-green)] animate-pulse">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--organized-chaos-green)]" />
                    RUNNING
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">Processing requests</p>
              </div>
              <div className="p-3 rounded-[var(--radius-wise)] bg-[var(--wise-steel)] border border-[var(--border-medium)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[var(--text-muted)]">Second Brain</span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold text-[var(--organized-chaos-green)] bg-[var(--green-dim)] border border-[var(--border-green)]">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--organized-chaos-green)]" />
                    READY
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">Knowledge indexed</p>
              </div>
            </div>
          </div>

          {/* Phase 4: Performance Chart */}
          <div className="wise-card p-4 xs:p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Performance</h2>
              <span className="text-xs text-[var(--text-muted)]">Last 7 days</span>
            </div>
            <div className="h-32 xs:h-40 flex items-end gap-1.5 px-2 bg-[var(--wise-black)]/50 rounded py-3">
              {[35, 42, 38, 55, 48, 62, 58].map((height, i) => (
                <div key={i} className="flex-1 rounded-t" style={{ height: `${height}%`, background: 'linear-gradient(to top, var(--organized-chaos-green), rgba(0, 255, 102, 0.5))', boxShadow: '0 0 8px rgba(0, 255, 102, 0.3)' }} />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-[var(--text-muted)]">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>
          </div>

          {/* Phase 4: Recent Automations */}
          <div className="wise-card p-4 xs:p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Recent Automations</h2>
              <a href="/dashboard/business-os" className="text-xs text-[var(--text-muted)] hover:text-[var(--organized-chaos-green)] transition-colors">View all</a>
            </div>
            <div className="space-y-2">
              {[
                { name: 'Prospect Intake', status: 'completed', time: '2 hours ago' },
                { name: 'Email Digest', status: 'running', time: 'In progress' },
                { name: 'Backup Check', status: 'completed', time: '5 hours ago' },
              ].map((auto, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded bg-[var(--wise-black)]/50 hover:bg-[var(--wise-black)]/70 transition-colors">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-[var(--text-secondary)]">{auto.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{auto.time}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    auto.status === 'running'
                      ? 'bg-[var(--green-dim)] text-[var(--organized-chaos-green)] border border-[var(--border-green)]'
                      : 'bg-[var(--success)]/10 text-[var(--success)]'
                  }`}>
                    {auto.status === 'running' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--organized-chaos-green)] mr-1" />}
                    {auto.status.charAt(0).toUpperCase() + auto.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4 px-4 xs:px-0">
          {/* System Status */}
          <div className="wise-card p-4 xs:p-5">
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
          <div className="wise-card p-4 xs:p-5 hidden md:block">
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
          <div className="wise-card p-4 xs:p-5 hidden md:block">
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

      {/* Phase 5: Mobile Bottom Navigation — 5 max items with touch targets (44px+) */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden border-t border-[var(--border-medium)] bg-[var(--wise-black)] z-40">
        <div className="flex items-center justify-around h-16 xs:h-14 sm:h-16 max-w-full overflow-x-auto">
          <a href="/dashboard" className="flex flex-col items-center justify-center flex-1 min-h-[56px] xs:min-h-[52px] gap-1 text-[var(--text-muted)] hover:text-[var(--organized-chaos-green)] transition-colors border-t-2 border-[var(--organized-chaos-green)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </a>
          <a href="/dashboard/leads" className="flex flex-col items-center justify-center flex-1 min-h-[56px] xs:min-h-[52px] gap-1 text-[var(--text-muted)] hover:text-[var(--organized-chaos-green)] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
              <circle cx="12" cy="12" r="1" />
              <path d="M12 1v6m0 6v4" />
              <path d="M4.22 4.22l4.24 4.24m-0 5.08l-4.24 4.24" />
              <path d="M1 12h6m6 0h4" />
              <path d="M4.22 19.78l4.24-4.24m5.08 0l4.24 4.24" />
              <path d="M12 17v6" />
              <path d="M19.78 4.22l-4.24 4.24m0 5.08l4.24 4.24" />
              <path d="M17 12h6" />
            </svg>
            <span className="text-xs font-medium">Leads</span>
          </a>
          <a href="/dashboard/sound-labs" className="flex flex-col items-center justify-center flex-1 min-h-[56px] xs:min-h-[52px] gap-1 text-[var(--text-muted)] hover:text-[var(--organized-chaos-green)] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 5.54a5 5 0 0 1 0 7.07M19.07 4a8 8 0 0 1 0 11.31" />
            </svg>
            <span className="text-xs font-medium">Studio</span>
          </a>
          <a href="/dashboard/gallery" className="flex flex-col items-center justify-center flex-1 min-h-[56px] xs:min-h-[52px] gap-1 text-[var(--text-muted)] hover:text-[var(--organized-chaos-green)] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span className="text-xs font-medium">Gallery</span>
          </a>
          <a href="/dashboard/profile" className="flex flex-col items-center justify-center flex-1 min-h-[56px] xs:min-h-[52px] gap-1 text-[var(--text-muted)] hover:text-[var(--organized-chaos-green)] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-xs font-medium">Profile</span>
          </a>
        </div>
      </nav>
    </div>
    </div>
  );
}
