'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../src/contexts/AuthContext';
import { Card, KPICard, Badge, Button } from '../../src/components/ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api';

interface DashboardMetrics {
  revenue: { total: number; change: number };
  leads: { total: number; hot: number };
  customers: { total: number; new: number };
  conversion: { rate: number; change: number };
  opportunities: { open: number; value: number };
  invoices: { outstanding: number; overdue: number };
}

interface MoneyNowItem {
  id: string;
  type: 'lead' | 'invoice' | 'follow_up' | 'upsell' | 'booking' | 'onboarding';
  title: string;
  value?: string;
  daysOld?: number;
  cta: string;
  href: string;
  priority: 'critical' | 'high' | 'normal';
}

function MoneyNowCard({ item }: { item: MoneyNowItem }) {
  const typeLabels: Record<string, { label: string; badge: 'danger' | 'warning' | 'success' }> = {
    lead: { label: '🔥 Hot Lead', badge: 'danger' },
    invoice: { label: '💰 Unpaid Invoice', badge: 'danger' },
    follow_up: { label: '📞 Follow Up Due', badge: 'warning' },
    upsell: { label: '📈 Upsell Opportunity', badge: 'warning' },
    booking: { label: '📅 Booking Needed', badge: 'success' },
    onboarding: { label: '🚀 Incomplete Onboarding', badge: 'success' },
  };

  const { label, badge } = typeLabels[item.type];
  const priorityBorder =
    item.priority === 'critical'
      ? 'border-l-4 border-l-danger'
      : item.priority === 'high'
        ? 'border-l-4 border-l-warning'
        : 'border-l-4 border-l-success';

  return (
    <Link href={item.href}>
      <Card interactive className={`${priorityBorder} p-4 flex items-start justify-between gap-3`}>
        <div className="flex-1 min-w-0 space-y-2">
          <p className="text-xs font-semibold text-wise-neon uppercase tracking-wider">{label}</p>
          <p className="text-sm font-medium text-text-primary truncate">{item.title}</p>
          {item.value && <p className="text-xs text-text-secondary">{item.value}</p>}
          {item.daysOld && <p className="text-xs text-text-muted">{item.daysOld} days old</p>}
        </div>
        <div className="shrink-0 text-right">
          <Badge variant={badge}>{item.cta}</Badge>
        </div>
      </Card>
    </Link>
  );
}

function NavigationSection({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string; icon: string }[];
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button variant="secondary" size="sm">
              <span>{item.icon}</span>
              {item.label}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    revenue: { total: 128450, change: 12 },
    leads: { total: 342, hot: 12 },
    customers: { total: 1204, new: 18 },
    conversion: { rate: 3.5, change: 0.8 },
    opportunities: { open: 27, value: 250000 },
    invoices: { outstanding: 18, overdue: 3 },
  });

  const [moneyNow] = useState<MoneyNowItem[]>([
    {
      id: '1',
      type: 'lead',
      title: 'Acme Corp Inquiry - Ready to Close',
      value: 'Est. $15,000 deal',
      daysOld: 2,
      cta: 'CONTACT',
      href: '/dashboard/leads',
      priority: 'critical',
    },
    {
      id: '2',
      type: 'invoice',
      title: 'Invoice #2024-1847 - Client ABC',
      value: '$3,250.00',
      daysOld: 30,
      cta: 'SEND',
      href: '/dashboard/billing',
      priority: 'critical',
    },
    {
      id: '3',
      type: 'follow_up',
      title: 'TechStartup Demo Follow-up',
      daysOld: 7,
      cta: 'FOLLOW UP',
      href: '/dashboard/leads',
      priority: 'high',
    },
    {
      id: '4',
      type: 'upsell',
      title: 'Current Client: Add Premium Services',
      value: 'Potential +$2,000/month',
      cta: 'OFFER',
      href: '/dashboard/customers',
      priority: 'high',
    },
    {
      id: '5',
      type: 'booking',
      title: 'Client Meeting - Awaiting Confirmation',
      cta: 'BOOK',
      href: '/dashboard/customers',
      priority: 'normal',
    },
    {
      id: '6',
      type: 'onboarding',
      title: 'New Client Onboarding - 40% Complete',
      cta: 'CONTINUE',
      href: '/dashboard',
      priority: 'normal',
    },
  ]);

  return (
    <div className="min-h-screen bg-wise-black text-text-primary">
      {/* Header */}
      <div className="sticky top-[var(--topbar-height)] z-20 border-b border-border-subtle bg-wise-black/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 lg:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-wise-neon">WISE² COMMAND CENTER</h1>
              <p className="text-xs text-text-muted mt-1">{user?.email} • ADMIN</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg border border-border-medium hover:border-wise-electric hover:bg-wise-electric/5 transition-all" title="Notifications">
                🔔
              </button>
              <Link href="/dashboard/settings" className="p-2 rounded-lg border border-border-medium hover:border-wise-electric hover:bg-wise-electric/5 transition-all" title="Settings">
                ⚙️
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 lg:px-6 space-y-8">
        {/* Business Health KPIs */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Business Health</h2>
            <p className="text-sm text-text-muted mt-1">Real-time overview of key business metrics</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              label="Monthly Revenue"
              value={`$${(metrics.revenue.total / 1000).toFixed(1)}k`}
              change={metrics.revenue.change}
              trend="up"
            />
            <KPICard
              label="Active Leads"
              value={metrics.leads.total}
              change={-5}
              trend="down"
            />
            <KPICard
              label="Total Customers"
              value={metrics.customers.total}
              change={8}
              trend="up"
            />
            <KPICard
              label="Conversion Rate"
              value={`${metrics.conversion.rate}%`}
              change={0.8}
              trend="up"
            />
          </div>
        </section>

        {/* Revenue Opportunities */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-wise-neon">💰 MONEY NOW</h2>
            <p className="text-sm text-text-secondary mt-1">Actionable opportunities to grow revenue today</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {moneyNow.map((item) => (
              <MoneyNowCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* Supporting Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Open Opportunities</p>
            <p className="text-3xl font-bold text-wise-neon">{metrics.opportunities.open}</p>
            <p className="text-sm text-text-secondary">${(metrics.opportunities.value / 1000).toFixed(0)}k pipeline value</p>
          </Card>
          <Card className="p-6 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Outstanding Invoices</p>
            <p className="text-3xl font-bold text-warning">{metrics.invoices.outstanding}</p>
            <p className="text-sm text-text-secondary">{metrics.invoices.overdue} overdue</p>
          </Card>
          <Card className="p-6 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">New Customers</p>
            <p className="text-3xl font-bold text-wise-neon">{metrics.customers.new}</p>
            <p className="text-sm text-text-secondary">This month</p>
          </Card>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary">Sound Lab</h2>
            <Link href="/sound-lab" className="text-xs text-wise-electric hover:underline">Open studio →</Link>
          </div>
          <Card className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/sound-lab/projects" className="text-sm">Active productions</Link>
            <Link href="/sound-lab/releases" className="text-sm">Client approvals / releases</Link>
            <Link href="/dashboard/live-studio" className="text-sm">Live Studio recordings</Link>
            <Link href="/sound-lab/plugins" className="text-sm">AI jobs / processors</Link>
          </Card>
        </section>

        {/* Navigation Sections */}
        <section className="space-y-6 pt-4">
          <NavigationSection
            title="Sales"
            items={[
              { label: 'Leads', href: '/dashboard/leads', icon: '🔥' },
              { label: 'Customers', href: '/dashboard/customers', icon: '👥' },
              { label: 'Billing', href: '/dashboard/billing', icon: '💳' },
              { label: 'Analytics', href: '/dashboard/analytics', icon: '📊' },
            ]}
          />
          <NavigationSection
            title="Creative"
            items={[
              { label: 'Sound Lab', href: '/sound-lab', icon: '🎵' },
              { label: 'Gallery', href: '/dashboard/gallery', icon: '🖼️' },
              { label: 'Live Studio', href: '/dashboard/live-studio', icon: '📹' },
              { label: 'Print Studio', href: '/dashboard/print-on-demand', icon: '🖨️' },
            ]}
          />
          <NavigationSection
            title="Intelligence"
            items={[
              { label: 'Hermes AI', href: '/dashboard/ai', icon: '🤖' },
              { label: 'Second Brain', href: '/dashboard/second-brain', icon: '🧠' },
              { label: 'Automations', href: '/dashboard/business-os', icon: '⚡' },
            ]}
          />
        </section>

        {/* Footer */}
        <footer className="border-t border-border-subtle pt-8 mt-12">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <div>WISE² Business OS • Powered by Organized Chaos</div>
            <Link href="/dashboard/settings" className="hover:text-wise-electric transition-colors">
              System Settings
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
