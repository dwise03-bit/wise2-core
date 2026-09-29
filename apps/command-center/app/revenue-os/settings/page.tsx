'use client';

import React from 'react';
import {
  Panel,
  REVENUE_API_BASE,
  SectionScaffold,
} from '../../../src/components/revenue-os';

export default function RevenueSettingsPage() {
  return (
    <div className="space-y-5">
      <Panel title="Connection" subtitle="Where this console reads Revenue OS data from">
        <div className="p-4">
          <div className="rounded-lg border border-border-subtle bg-white/[0.02] p-4">
            <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              API base URL
            </p>
            <p className="mt-1 font-mono text-sm text-text-primary">{REVENUE_API_BASE}</p>
            <p className="mt-2 text-xs text-text-muted">
              Override with the NEXT_PUBLIC_REVENUE_API_URL environment variable.
            </p>
          </div>
        </div>
      </Panel>

      <SectionScaffold
        title="Revenue OS Settings"
        description="Business profile, channels, pricing, and agent configuration"
        plannedEndpoint="GET /api/revenue-os/settings — not in the current contract"
        links={[
          {
            label: 'Command Center Settings',
            href: '/dashboard/settings',
            description: 'Account-level settings available today',
          },
          {
            label: 'Billing',
            href: '/dashboard/billing',
            description: 'Subscription and payment configuration',
          },
        ]}
      />
    </div>
  );
}
