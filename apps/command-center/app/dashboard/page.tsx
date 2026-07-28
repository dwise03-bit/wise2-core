'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../src/contexts/AuthContext';

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

function MetricCard({
  label,
  value,
  change,
  suffix = '',
  priority = 'normal',
}: {
  label: string;
  value: string | number;
  change?: number;
  suffix?: string;
  priority?: 'critical' | 'high' | 'normal';
}) {
  const changeColor =
    change === undefined
      ? ''
      : change > 0
        ? 'text-[var(--organized-chaos-green)]'
        : 'text-[var(--warning)]';

  return (
    <div
      className={`flex flex-col gap-2 p-4 rounded-lg border transition-all ${
        priority === 'critical'
          ? 'bg-gradient-to-br from-[var(--wise-black)] to-[var(--wise-steel)] border-[var(--organized-chaos-green)]'
          : 'bg-[var(--wise-steel)] border-[var(--border-medium)]'
      } hover:border-[var(--organized-chaos-green)]`}
    >
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl xs:text-3xl font-bold text-[var(--text-primary)]">
          {value}
          {suffix && <span className="text-lg text-[var(--text-muted)]">{suffix}</span>}
        </span>
        {change !== undefined && (
          <span className={`text-xs font-semibold ${changeColor}`}>
            {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );
}

function MoneyNowCard({
  item,
}: {
  item: MoneyNowItem;
}) {
  const priorityColor =
    item.priority === 'critical'
      ? 'border-l-4 border-l-[var(--danger)]'
      : item.priority === 'high'
        ? 'border-l-4 border-l-[var(--warning)]'
        : 'border-l-4 border-l-[var(--organized-chaos-green)]';

  const typeLabel: Record<string, string> = {
    lead: '🔥 Hot Lead',
    invoice: '💰 Unpaid Invoice',
    follow_up: '📞 Follow Up Due',
    upsell: '📈 Upsell Opportunity',
    booking: '📅 Booking Needed',
    onboarding: '🚀 Incomplete Onboarding',
  };

  return (
    <Link
      href={item.href}
      className={`flex items-start justify-between gap-3 p-3 rounded-lg bg-[var(--wise-steel)] border border-[var(--border-medium)] hover:border-[var(--organized-chaos-green)] hover:shadow-md transition-all ${priorityColor}`}
    >
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-[var(--organized-chaos-green)] uppercase tracking-wider">
          {typeLabel[item.type]}
        </div>
        <div className="text-sm font-medium text-[var(--text-primary)] truncate">
          {item.title}
        </div>
        {item.value && (
          <div className="text-xs text-[var(--text-secondary)] mt-1">{item.value}</div>
        )}
        {item.daysOld && (
          <div className="text-xs text-[var(--text-muted)] mt-1">
            {item.daysOld} days old
          </div>
        )}
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <div className="px-2.5 py-1 rounded text-xs font-semibold bg-[var(--organized-chaos-green)] bg-opacity-20 text-[var(--organized-chaos-green)] whitespace-nowrap">
          {item.cta}
        </div>
      </div>
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
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-[var(--wise-steel)] border border-[var(--border-medium)] text-[var(--text-secondary)] hover:text-[var(--organized-chaos-green)] hover:border-[var(--organized-chaos-green)] transition-all"
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    revenue: { total: 0, change: 0 },
    leads: { total: 0, hot: 0 },
    customers: { total: 0, new: 0 },
    conversion: { rate: 0, change: 0 },
    opportunities: { open: 0, value: 0 },
    invoices: { outstanding: 0, overdue: 0 },
  });

  const [moneyNow, setMoneyNow] = useState<MoneyNowItem[]>([
    {
      id: '1',
      type: 'lead',
      title: 'Acme Corp Inquiry - Ready to Close',
      value: 'Est. $15,000 deal',
      daysOld: 2,
      cta: 'CONTACT LEAD',
      href: '/leads/1',
      priority: 'critical',
    },
    {
      id: '2',
      type: 'invoice',
      title: 'Invoice #2024-1847 - Client ABC',
      value: '$3,250.00',
      daysOld: 30,
      cta: 'SEND INVOICE',
      href: '/invoices/1847',
      priority: 'critical',
    },
    {
      id: '3',
      type: 'follow_up',
      title: 'TechStartup Demo Follow-up',
      daysOld: 7,
      cta: 'FOLLOW UP',
      href: '/leads/2',
      priority: 'high',
    },
    {
      id: '4',
      type: 'upsell',
      title: 'Current Client: Add Premium Services',
      value: 'Potential +$2,000/month',
      cta: 'CREATE OFFER',
      href: '/customers/1/upsell',
      priority: 'high',
    },
    {
      id: '5',
      type: 'booking',
      title: 'Client Meeting - Awaiting Confirmation',
      cta: 'BOOK CUSTOMER',
      href: '/bookings/1',
      priority: 'normal',
    },
    {
      id: '6',
      type: 'onboarding',
      title: 'New Client Onboarding - 40% Complete',
      cta: 'CONTINUE',
      href: '/onboarding',
      priority: 'normal',
    },
  ]);

  useEffect(() => {
    if (!user) return;

    // Fetch real metrics when API is ready
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        // Placeholder: In production, fetch from /v1/dashboard or similar
        // For now, use demo data to show the layout
        setMetrics({
          revenue: { total: 128450, change: 12 },
          leads: { total: 342, hot: 12 },
          customers: { total: 1204, new: 18 },
          conversion: { rate: 3.5, change: 0.8 },
          opportunities: { open: 27, value: 250000 },
          invoices: { outstanding: 18, overdue: 3 },
        });
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();
  }, [user]);

  return (
    <div className="min-h-screen bg-[var(--wise-black)] text-[var(--text-primary)]">
      <nav className="sticky top-0 z-40 border-b border-[var(--border-medium)] bg-[var(--wise-black)] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[var(--organized-chaos-green)]">
                WISE² COMMAND CENTER
              </h1>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {user?.email} • ADMIN
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg border border-[var(--border-medium)] hover:border-[var(--organized-chaos-green)] transition-all">
                🔔
              </button>
              <Link
                href="/settings"
                className="p-2 rounded-lg border border-[var(--border-medium)] hover:border-[var(--organized-chaos-green)] transition-all"
              >
                ⚙️
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Business Health at a Glance */}
        <section>
          <h2 className="text-lg font-bold mb-4 text-[var(--text-primary)]">
            Business Health
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Monthly Revenue"
              value={`$${(metrics.revenue.total / 1000).toFixed(1)}`}
              suffix="k"
              change={metrics.revenue.change}
              priority="critical"
            />
            <MetricCard
              label="Active Leads"
              value={metrics.leads.total}
              change={-5}
              priority="high"
            />
            <MetricCard
              label="Total Customers"
              value={metrics.customers.total}
              change={8}
            />
            <MetricCard
              label="Conversion Rate"
              value={`${metrics.conversion.rate}%`}
              change={0.8}
            />
          </div>
        </section>

        {/* Money Now - Revenue Driver */}
        <section className="bg-gradient-to-br from-[var(--wise-steel)] to-[var(--wise-black)] border border-[var(--organized-chaos-green)] border-opacity-30 rounded-xl p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[var(--organized-chaos-green)] mb-1">
              💰 MONEY NOW
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Actionable opportunities to grow revenue today
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {moneyNow.map((item) => (
              <MoneyNowCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* Additional Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[var(--wise-steel)] border border-[var(--border-medium)] rounded-lg">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              Open Opportunities
            </div>
            <div className="text-2xl font-bold text-[var(--organized-chaos-green)]">
              {metrics.opportunities.open}
            </div>
            <div className="text-sm text-[var(--text-secondary)] mt-1">
              ${(metrics.opportunities.value / 1000).toFixed(0)}k pipeline
            </div>
          </div>
          <div className="p-4 bg-[var(--wise-steel)] border border-[var(--border-medium)] rounded-lg">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              Outstanding Invoices
            </div>
            <div className="text-2xl font-bold text-[var(--warning)]">
              {metrics.invoices.outstanding}
            </div>
            <div className="text-sm text-[var(--text-secondary)] mt-1">
              {metrics.invoices.overdue} overdue
            </div>
          </div>
          <div className="p-4 bg-[var(--wise-steel)] border border-[var(--border-medium)] rounded-lg">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              New Customers
            </div>
            <div className="text-2xl font-bold text-[var(--organized-chaos-green)]">
              {metrics.customers.new}
            </div>
            <div className="text-sm text-[var(--text-secondary)] mt-1">
              This month
            </div>
          </div>
        </section>

        {/* Navigation by Business Function */}
        <section className="space-y-4">
          <NavigationSection
            title="Sales"
            items={[
              { label: 'Leads', href: '/leads', icon: '🔥' },
              { label: 'Customers', href: '/customers', icon: '👥' },
              { label: 'Pipeline', href: '/pipeline', icon: '📈' },
              { label: 'Bookings', href: '/bookings', icon: '📅' },
            ]}
          />
          <NavigationSection
            title="Business"
            items={[
              { label: 'Services', href: '/services', icon: '🎯' },
              { label: 'Projects', href: '/projects', icon: '📋' },
              { label: 'Gallery', href: '/gallery', icon: '🖼️' },
              { label: 'Documents', href: '/documents', icon: '📄' },
            ]}
          />
          <NavigationSection
            title="Finance"
            items={[
              { label: 'Revenue', href: '/revenue', icon: '💵' },
              { label: 'Invoices', href: '/invoices', icon: '🧾' },
              { label: 'Subscriptions', href: '/subscriptions', icon: '🔄' },
              { label: 'Usage', href: '/usage', icon: '📊' },
            ]}
          />
          <NavigationSection
            title="AI & Automation"
            items={[
              { label: 'WISE AI', href: '/ai', icon: '🤖' },
              { label: 'Second Brain', href: '/brain', icon: '🧠' },
              { label: 'Automations', href: '/automations', icon: '⚡' },
            ]}
          />
        </section>

        {/* Footer */}
        <footer className="border-t border-[var(--border-medium)] pt-6 mt-12">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <div>WISE² Business OS • Powered by Organized Chaos</div>
            <Link href="/settings" className="hover:text-[var(--organized-chaos-green)]">
              System Settings
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
