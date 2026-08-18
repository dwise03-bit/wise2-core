'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../src/contexts/AuthContext';
import {
  ExecutiveKpiStrip,
  PipelineSummary,
  TodaysDispatchBoard,
  AlertsPanel,
  QuickActionsPanel,
} from '../../src/components/hvac';
import { Card } from '../../src/components/ui';

export default function HvacCommandCenterPage() {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const response = await fetch('/api/v1/workspaces/current');
        if (response.ok) {
          const data = await response.json();
          setTenant(data);
        }
      } catch (err) {
        console.error('Failed to fetch tenant:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-wise-black flex items-center justify-center">
        <div className="text-wise-electric">Loading HVAC Command Center...</div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-wise-black text-text-primary p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-wise-danger">Unable to load tenant context</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wise-black text-text-primary">
      {/* Header */}
      <div className="sticky top-[var(--topbar-height)] z-20 border-b border-border-subtle bg-wise-black/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 lg:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-wise-neon">WISE HVAC COMMAND CENTER</h1>
              <p className="text-xs text-text-muted mt-1">Heating. Cooling. Done WISE.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-lg border border-border-medium hover:border-wise-electric hover:bg-wise-electric/5 transition-all"
                title="Notifications"
              >
                🔔
              </button>
              <Link
                href="/dashboard/settings"
                className="p-2 rounded-lg border border-border-medium hover:border-wise-electric hover:bg-wise-electric/5 transition-all"
                title="Settings"
              >
                ⚙️
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 lg:px-6 space-y-8">
        {/* Executive KPI Strip */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-text-primary">Executive Overview</h2>
            <p className="text-sm text-text-muted mt-1">Key performance indicators at a glance</p>
          </div>
          <ExecutiveKpiStrip tenantId={tenant.id} />
        </section>

        {/* Pipeline & Dispatch Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PipelineSummary tenantId={tenant.id} />
          </div>
          <div>
            <AlertsPanel tenantId={tenant.id} />
          </div>
        </div>

        {/* Today's Dispatch */}
        <section>
          <TodaysDispatchBoard tenantId={tenant.id} />
        </section>

        {/* Quick Actions */}
        <section>
          <QuickActionsPanel />
        </section>

        {/* Navigation Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/hvac/leads">
            <Card className="p-6 border border-wise-blue/30 hover:border-wise-blue/60 transition-colors cursor-pointer">
              <p className="text-2xl mb-2">🔥</p>
              <p className="font-semibold text-text-primary">Leads</p>
              <p className="text-xs text-text-secondary mt-1">Manage sales pipeline</p>
            </Card>
          </Link>

          <Link href="/hvac/estimates">
            <Card className="p-6 border border-wise-purple/30 hover:border-wise-purple/60 transition-colors cursor-pointer">
              <p className="text-2xl mb-2">📄</p>
              <p className="font-semibold text-text-primary">Estimates</p>
              <p className="text-xs text-text-secondary mt-1">Track quote pipeline</p>
            </Card>
          </Link>

          <Link href="/hvac/jobs">
            <Card className="p-6 border border-wise-orange/30 hover:border-wise-orange/60 transition-colors cursor-pointer">
              <p className="text-2xl mb-2">📅</p>
              <p className="font-semibold text-text-primary">Jobs</p>
              <p className="text-xs text-text-secondary mt-1">Schedule & dispatch</p>
            </Card>
          </Link>

          <Link href="/hvac/customers">
            <Card className="p-6 border border-wise-neon/30 hover:border-wise-neon/60 transition-colors cursor-pointer">
              <p className="text-2xl mb-2">👥</p>
              <p className="font-semibold text-text-primary">Customers</p>
              <p className="text-xs text-text-secondary mt-1">Customer 360 view</p>
            </Card>
          </Link>

          <Link href="/hvac/follow-ups">
            <Card className="p-6 border border-wise-success/30 hover:border-wise-success/60 transition-colors cursor-pointer">
              <p className="text-2xl mb-2">📞</p>
              <p className="font-semibold text-text-primary">Follow-Ups</p>
              <p className="text-xs text-text-secondary mt-1">Track action items</p>
            </Card>
          </Link>

          <Link href="/hvac/dispatch">
            <Card className="p-6 border border-wise-electric/30 hover:border-wise-electric/60 transition-colors cursor-pointer">
              <p className="text-2xl mb-2">🚗</p>
              <p className="font-semibold text-text-primary">Dispatch</p>
              <p className="text-xs text-text-secondary mt-1">Real-time technician tracking</p>
            </Card>
          </Link>
        </section>

        {/* Footer */}
        <footer className="border-t border-border-subtle pt-8 mt-12">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <div>WISE HVAC Solutions • Heating. Cooling. Done WISE.</div>
            <Link href="/dashboard/settings" className="hover:text-wise-electric transition-colors">
              Settings
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
