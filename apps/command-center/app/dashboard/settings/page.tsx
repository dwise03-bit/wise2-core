'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../../src/contexts/AuthContext';
import { Card, Badge, Button, Input } from '../../../src/components/ui';

export default function SettingsPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 animate-pulse bg-border-medium rounded" />
        <div className="h-3 w-56 animate-pulse bg-border-medium rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="wise-page-title">Settings</h1>
        <p className="wise-page-subtitle">System configuration and account preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Link href="/dashboard/account">
          <Card interactive className="p-5 group">
            <h3 className="text-sm font-semibold text-text-primary group-hover:text-wise-electric transition-colors mb-0.5">Profile & Account</h3>
            <p className="text-xs text-text-muted">Manage your profile, email, and account details.</p>
            {user && <p className="text-xs text-wise-electric mt-2">{user.email}</p>}
          </Card>
        </Link>

        <Link href="/dashboard/billing">
          <Card interactive className="p-5 group">
            <h3 className="text-sm font-semibold text-text-primary group-hover:text-wise-electric transition-colors mb-0.5">Billing & Subscription</h3>
            <p className="text-xs text-text-muted">Manage your plan, payment methods, and invoices.</p>
          </Card>
        </Link>

        {[
          { title: 'Notifications', desc: 'Configure email and push notification preferences.' },
          { title: 'Integrations', desc: 'Connect external services: Stripe, Discord, PostHog, Google.' },
          { title: 'Security', desc: 'Password, two-factor authentication, and session management.' },
          { title: 'API Keys', desc: 'Manage API access tokens for external integrations.' },
        ].map(item => (
          <Card key={item.title} className="p-5">
            <div className="flex items-start justify-between mb-0.5">
              <h3 className="text-sm font-semibold text-text-primary">{item.title}</h3>
              <Badge variant="warning">Setup Required</Badge>
            </div>
            <p className="text-xs text-text-muted">{item.desc}</p>
          </Card>
        ))}
      </div>

      {/* System Info */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-3">System Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Platform', value: 'WISE² v2.0' },
            { label: 'Environment', value: process.env.NODE_ENV || 'development' },
            { label: 'API Endpoint', value: process.env.NEXT_PUBLIC_API_URL?.replace('http://', '').replace('/api', '') || 'localhost:3011' },
            { label: 'Build', value: 'Command Center' },
          ].map(info => (
            <div key={info.label}>
              <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">{info.label}</p>
              <p className="text-xs font-medium text-text-secondary mt-0.5">{info.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
