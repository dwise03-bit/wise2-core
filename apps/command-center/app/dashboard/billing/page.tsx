'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';

interface BillingProfile {
  id: string;
  email: string;
  stripeCustomerId?: string;
  plan: string;
  status: string;
}

interface Subscription {
  id: string;
  status: string;
  plan: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  amount?: number;
  currency?: string;
  interval?: string;
}

export default function BillingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<BillingProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState(false);
  const [subError, setSubError] = useState(false);

  const getToken = () => localStorage.getItem('auth_token') || localStorage.getItem('authToken') || '';

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }

    const load = async () => {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) { setLoading(false); return; }

      const [profileRes, subRes] = await Promise.allSettled([
        fetch('/api/v1/billing/me', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/v1/billing/subscription', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
        setProfile(await profileRes.value.json());
      } else {
        setProfileError(true);
      }

      if (subRes.status === 'fulfilled' && subRes.value.ok) {
        setSubscription(await subRes.value.json());
      } else {
        setSubError(true);
      }

      setLoading(false);
    };

    load();
  }, [user?.id]);

  const handleCheckout = async (priceId: string) => {
    try {
      const token = getToken();
      const res = await fetch('/api/v1/billing/checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, successUrl: window.location.href, cancelUrl: window.location.href }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      } else {
        setError('Checkout session creation failed. Stripe may not be configured.');
      }
    } catch {
      setError('Unable to connect to billing service.');
    }
  };

  const fmt = (v: number, currency = 'usd') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(v / 100);

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-wise-surface rounded w-32 mb-4" />
          <div className="h-4 bg-wise-surface rounded w-64 mb-8" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-40 bg-wise-surface rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  const planName = subscription?.plan || profile?.plan || 'Free';
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const hasStripe = !!profile?.stripeCustomerId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Billing</h1>
        <p className="text-text-secondary">Subscription, plan details, and payment management</p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          <span className="font-semibold">Error: </span>{error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-wise-surface border border-wise-border rounded-lg p-6">
          <p className="text-xs text-text-muted mb-1 uppercase tracking-wider">Current Plan</p>
          <p className="text-2xl font-bold text-wise-electric mb-2">{planName}</p>
          <span className={`text-xs font-medium px-2 py-1 rounded ${
            isActive ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
          }`}>
            {isActive ? 'ACTIVE' : subscription?.status?.toUpperCase() || 'NOT CONFIGURED'}
          </span>
        </div>

        <div className="bg-wise-surface border border-wise-border rounded-lg p-6">
          <p className="text-xs text-text-muted mb-1 uppercase tracking-wider">Billing Period</p>
          {subscription?.currentPeriodEnd ? (
            <>
              <p className="text-lg font-semibold text-text-primary">
                {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-sm text-text-muted mt-1">
                {subscription.cancelAtPeriodEnd ? 'Cancels at period end' : 'Auto-renews'}
              </p>
            </>
          ) : (
            <p className="text-lg text-text-muted">No active period</p>
          )}
        </div>

        <div className="bg-wise-surface border border-wise-border rounded-lg p-6">
          <p className="text-xs text-text-muted mb-1 uppercase tracking-wider">Amount</p>
          {subscription?.amount ? (
            <>
              <p className="text-2xl font-bold text-wise-electric">
                {fmt(subscription.amount, subscription.currency || 'usd')}
              </p>
              <p className="text-sm text-text-muted">per {subscription.interval || 'month'}</p>
            </>
          ) : (
            <p className="text-lg text-text-muted">$0 / month</p>
          )}
        </div>
      </div>

      {!hasStripe && (
        <div className="bg-wise-surface border border-amber-500/30 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Stripe Not Connected</h3>
              <p className="text-text-muted text-sm mb-4">
                No Stripe customer ID found for your account. Payment processing requires Stripe configuration on the server.
              </p>
              <p className="text-xs text-text-muted">Contact your administrator to connect Stripe billing.</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-text-primary mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Starter', price: '$29/mo', features: ['5 projects', 'Basic analytics', 'Email support'], priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID },
            { name: 'Professional', price: '$79/mo', features: ['Unlimited projects', 'Advanced analytics', 'Priority support', 'API access'], priceId: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID },
            { name: 'Enterprise', price: 'Custom', features: ['Everything in Pro', 'Dedicated support', 'Custom integrations', 'SLA guarantee'], priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID },
          ].map(plan => (
            <div key={plan.name} className={`bg-wise-surface border rounded-lg p-6 ${
              planName === plan.name ? 'border-wise-electric' : 'border-wise-border'
            }`}>
              <h3 className="text-lg font-semibold text-text-primary mb-1">{plan.name}</h3>
              <p className="text-2xl font-bold text-wise-electric mb-4">{plan.price}</p>
              <ul className="space-y-2 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="text-sm text-text-muted flex items-center gap-2">
                    <span className="text-wise-electric">✓</span> {f}
                  </li>
                ))}
              </ul>
              {planName === plan.name ? (
                <span className="block text-center text-sm text-text-muted py-2">Current Plan</span>
              ) : plan.priceId ? (
                <button onClick={() => handleCheckout(plan.priceId!)}
                  className="w-full px-4 py-2 bg-wise-electric hover:bg-wise-electric_hover text-wise-black font-semibold rounded-lg transition-colors">
                  Upgrade
                </button>
              ) : (
                <button className="w-full px-4 py-2 border border-wise-border text-text-secondary rounded-lg hover:text-text-primary transition-colors">
                  Contact Sales
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-wise-surface border border-wise-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-2">Invoices</h3>
        <p className="text-text-muted text-sm">
          Invoice history is managed through Stripe. {hasStripe
            ? 'Access your invoices through the Stripe customer portal.'
            : 'Connect Stripe to view invoice history.'}
        </p>
      </div>

      {profileError && subError && (
        <div className="bg-wise-surface border border-wise-border rounded-lg p-6 text-center">
          <span className="text-4xl block mb-3 opacity-30">💳</span>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Billing Service Unavailable</h3>
          <p className="text-text-muted text-sm">Could not connect to the billing API. The service may need to be configured or restarted.</p>
        </div>
      )}
    </div>
  );
}
