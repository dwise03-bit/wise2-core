'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../src/contexts/AuthContext';

export default function AccountPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    fetchSubscription();
  }, [user?.id]);

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch('/api/v1/billing/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setSubscription(await res.json());
      }
    } catch {
      // API not available
    } finally {
      setLoading(false);
    }
  };

  const settings = [
    { icon: '👤', title: 'Profile', description: 'Update your personal information' },
    { icon: '💳', title: 'Billing', description: 'Manage payment methods and invoices' },
    { icon: '🔔', title: 'Notifications', description: 'Customize notification preferences' },
    { icon: '🔒', title: 'Security', description: 'Manage passwords and two-factor auth' },
    { icon: '🔌', title: 'Integrations', description: 'Connect external services and tools' },
    { icon: '⚙️', title: 'Preferences', description: 'Customize your workspace' },
  ];

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-wise-surface rounded w-32 mb-4"></div>
          <div className="h-4 bg-wise-surface rounded w-64"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Account Settings</h1>
        <p className="text-text-secondary">
          Manage your profile, subscriptions, and preferences
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settings.map((setting) => (
          <div
            key={setting.title}
            className="bg-wise-surface border border-wise-border rounded-lg p-6 hover:border-wise-electric/50 transition-all cursor-pointer group"
          >
            <span className="text-3xl block mb-4">{setting.icon}</span>
            <h3 className="text-lg font-bold text-text-primary mb-1 group-hover:text-wise-electric transition-colors">
              {setting.title}
            </h3>
            <p className="text-sm text-text-muted">{setting.description}</p>
          </div>
        ))}
      </div>

      {/* Workspace Info */}
      <div className="bg-wise-surface border border-wise-border rounded-lg p-8">
        <h2 className="text-2xl font-bold text-text-primary mb-6">Workspace</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-wise-black/30 rounded-lg">
            <div>
              <p className="font-semibold text-text-primary">Active Plan</p>
              <p className="text-sm text-text-muted">
                {subscription?.plan || 'Not configured'}
              </p>
            </div>
            <span className={`px-3 py-1 text-xs font-semibold rounded ${
              subscription?.status === 'active' ? 'bg-green-500/10 text-green-400'
                : subscription?.plan ? 'bg-amber-500/10 text-amber-400'
                  : 'bg-gray-500/10 text-gray-400'
            }`}>
              {subscription?.status === 'active' ? 'ACTIVE' : subscription?.plan ? subscription.status?.toUpperCase() || 'INACTIVE' : 'NOT CONFIGURED'}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-wise-black/30 rounded-lg">
            <div>
              <p className="font-semibold text-text-primary">Renewal Date</p>
              <p className="text-sm text-text-muted">
                {subscription?.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                  : 'Not configured'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-wise-black/30 rounded-lg">
            <div>
              <p className="font-semibold text-text-primary">Usage This Month</p>
              <p className="text-sm text-text-muted">
                {subscription?.usage
                  ? `${Math.round((subscription.usage.current / Math.max(subscription.usage.limit, 1)) * 100)}% of allocation used`
                  : 'No usage data available'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-wise-electric hover:bg-wise-electric_hover text-wise-black font-semibold rounded-lg transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
