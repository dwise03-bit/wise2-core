'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../../src/contexts/AuthContext';

export default function SettingsPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-wise-surface rounded w-32 mb-4" />
          <div className="h-4 bg-wise-surface rounded w-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Settings</h1>
        <p className="text-text-secondary">System configuration and account preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/account" className="bg-wise-surface border border-wise-border rounded-lg p-6 hover:border-wise-electric/50 transition-all block">
          <div className="flex items-start gap-4">
            <span className="text-2xl">👤</span>
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Profile & Account</h3>
              <p className="text-text-muted text-sm">Manage your profile, email, and account details.</p>
              {user && <p className="text-xs text-wise-electric mt-2">{user.email}</p>}
            </div>
          </div>
        </Link>

        <Link href="/dashboard/billing" className="bg-wise-surface border border-wise-border rounded-lg p-6 hover:border-wise-electric/50 transition-all block">
          <div className="flex items-start gap-4">
            <span className="text-2xl">💳</span>
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Billing & Subscription</h3>
              <p className="text-text-muted text-sm">Manage your plan, payment methods, and invoices.</p>
            </div>
          </div>
        </Link>

        <div className="bg-wise-surface border border-wise-border rounded-lg p-6">
          <div className="flex items-start gap-4">
            <span className="text-2xl">🔔</span>
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Notifications</h3>
              <p className="text-text-muted text-sm">Configure email and push notification preferences.</p>
              <span className="text-xs text-amber-400 mt-2 inline-block">Setup Required</span>
            </div>
          </div>
        </div>

        <div className="bg-wise-surface border border-wise-border rounded-lg p-6">
          <div className="flex items-start gap-4">
            <span className="text-2xl">🔗</span>
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Integrations</h3>
              <p className="text-text-muted text-sm">Connect external services: Stripe, Discord, PostHog, Google.</p>
              <span className="text-xs text-amber-400 mt-2 inline-block">Setup Required</span>
            </div>
          </div>
        </div>

        <div className="bg-wise-surface border border-wise-border rounded-lg p-6">
          <div className="flex items-start gap-4">
            <span className="text-2xl">🔒</span>
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Security</h3>
              <p className="text-text-muted text-sm">Password, two-factor authentication, and session management.</p>
              <span className="text-xs text-amber-400 mt-2 inline-block">Setup Required</span>
            </div>
          </div>
        </div>

        <div className="bg-wise-surface border border-wise-border rounded-lg p-6">
          <div className="flex items-start gap-4">
            <span className="text-2xl">🌐</span>
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">API Keys</h3>
              <p className="text-text-muted text-sm">Manage API access tokens for external integrations.</p>
              <span className="text-xs text-amber-400 mt-2 inline-block">Setup Required</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-wise-surface border border-wise-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-2">System Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {[
            { label: 'Platform', value: 'WISE² v2.0' },
            { label: 'Environment', value: process.env.NODE_ENV || 'development' },
            { label: 'API Endpoint', value: 'localhost:3010' },
            { label: 'Build', value: 'Command Center' },
          ].map(info => (
            <div key={info.label}>
              <p className="text-xs text-text-muted">{info.label}</p>
              <p className="text-sm font-medium text-text-primary">{info.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
