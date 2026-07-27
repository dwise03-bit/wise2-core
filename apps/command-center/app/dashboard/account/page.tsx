'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../src/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api';

export default function AccountPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    fetchSubscription();
  }, [user?.id]);

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken');
      if (!token) { setLoading(false); return; }
      const res = await fetch(`${API_URL}/v1/billing/subscription`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setSubscription(await res.json());
    } catch { /* API not available */ }
    finally { setLoading(false); }
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="wise-skeleton h-6 w-36" />
        <div className="wise-skeleton h-3 w-56" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="wise-page-title">Account</h1>
        <p className="wise-page-subtitle">Manage your profile, subscriptions, and preferences</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { title: 'Profile', desc: 'Update your personal information', href: null },
          { title: 'Billing', desc: 'Manage payment methods and invoices', href: '/dashboard/billing' },
          { title: 'Notifications', desc: 'Customize notification preferences', href: null, status: 'Setup Required' },
          { title: 'Security', desc: 'Manage passwords and two-factor auth', href: null, status: 'Setup Required' },
          { title: 'Integrations', desc: 'Connect external services and tools', href: null, status: 'Setup Required' },
          { title: 'Preferences', desc: 'Customize your workspace', href: null, status: 'Setup Required' },
        ].map(item => {
          const inner = (
            <>
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-sm font-semibold text-text-primary group-hover:text-wise-electric transition-colors">{item.title}</h3>
                {item.status && <span className="wise-badge-warning">{item.status}</span>}
              </div>
              <p className="text-xs text-text-muted">{item.desc}</p>
            </>
          );
          return item.href ? (
            <Link key={item.title} href={item.href} className="wise-card-interactive p-5 group">{inner}</Link>
          ) : (
            <div key={item.title} className="wise-card p-5 group">{inner}</div>
          );
        })}
      </div>

      {/* Workspace */}
      <div className="wise-card p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-3">Workspace</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-lg bg-wise-black/30">
            <div>
              <p className="text-xs font-medium text-text-secondary">Active Plan</p>
              <p className="text-xs text-text-muted">{subscription?.plan || 'Not configured'}</p>
            </div>
            <span className={subscription?.status === 'active' ? 'wise-badge-success' : subscription?.plan ? 'wise-badge-warning' : 'wise-badge-neutral'}>
              {subscription?.status === 'active' ? 'Active' : subscription?.plan ? (subscription.status?.toUpperCase() || 'Inactive') : 'Not Configured'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-wise-black/30">
            <div>
              <p className="text-xs font-medium text-text-secondary">Renewal Date</p>
              <p className="text-xs text-text-muted">
                {subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'Not configured'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-wise-black/30">
            <div>
              <p className="text-xs font-medium text-text-secondary">Usage This Month</p>
              <p className="text-xs text-text-muted">
                {subscription?.usage
                  ? `${Math.round((subscription.usage.current / Math.max(subscription.usage.limit, 1)) * 100)}% of allocation used`
                  : 'No usage data available'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Link href="/dashboard" className="wise-btn-secondary">Back to Dashboard</Link>
      </div>
    </div>
  );
}
