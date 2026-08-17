'use client';

import React from 'react';
import Link from 'next/link';
import { Settings, User, Bell, Lock, CreditCard, Zap } from 'lucide-react';

export default function AccountSettings() {
  return (
    <div className="min-h-screen bg-wise-bg-primary text-wise-text-primary">
      <div className="border-b border-wise-primary-border bg-wise-bg-secondary/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-wise-primary mb-2">Account Settings</h1>
          <p className="text-wise-text-secondary">Manage your profile, subscriptions, and preferences</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: User, title: 'Profile', description: 'Update your personal information' },
            { icon: CreditCard, title: 'Billing', description: 'Manage payment methods and invoices' },
            { icon: Bell, title: 'Notifications', description: 'Customize notification preferences' },
            { icon: Lock, title: 'Security', description: 'Manage passwords and two-factor auth' },
            { icon: Zap, title: 'Integrations', description: 'Connect external services and tools' },
            { icon: Settings, title: 'Preferences', description: 'Customize your workspace' },
          ].map((setting) => {
            const Icon = setting.icon;
            return (
              <div
                key={setting.title}
                className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-6 hover:border-wise-primary-hover/50 transition-all cursor-pointer group"
              >
                <Icon className="w-10 h-10 text-wise-primary mb-4 group-hover:text-wise-primary-light transition-colors" />
                <h3 className="text-lg font-bold text-wise-text-primary mb-1 group-hover:text-wise-primary-light transition-colors">
                  {setting.title}
                </h3>
                <p className="text-sm text-wise-text-muted">{setting.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-wise-bg-card border border-wise-primary-border rounded-lg p-8">
          <h2 className="text-2xl font-bold text-wise-text-primary mb-6">Workspace</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-wise-bg-secondary/50 rounded-lg">
              <div>
                <p className="font-semibold text-wise-text-primary">Active Plan</p>
                <p className="text-sm text-wise-text-muted">Professional</p>
              </div>
              <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-semibold rounded">
                ACTIVE
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-wise-bg-secondary/50 rounded-lg">
              <div>
                <p className="font-semibold text-wise-text-primary">Renewal Date</p>
                <p className="text-sm text-wise-text-muted">August 15, 2026</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-wise-bg-secondary/50 rounded-lg">
              <div>
                <p className="font-semibold text-wise-text-primary">Usage This Month</p>
                <p className="text-sm text-wise-text-muted">45% of allocation used</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-wise-primary hover:bg-wise-primary-hover text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
