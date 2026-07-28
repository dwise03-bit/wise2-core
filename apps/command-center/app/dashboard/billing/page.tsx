'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../src/contexts/AuthContext';
import { Card, Badge, Button } from '../../../src/components/ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api';

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
  stripeCustomerId?: string;
}

export default function BillingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceAvailable, setServiceAvailable] = useState(false);

  const getToken = () => localStorage.getItem('auth_token') || localStorage.getItem('authToken') || '';

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }

    const load = async () => {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) { setLoading(false); return; }

      const subRes = await fetch(`${API_URL}/v1/billing/subscription`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => null);

      if (subRes?.ok) {
        setSubscription(await subRes.json());
        setServiceAvailable(true);
      }

      setLoading(false);
    };

    load();
  }, [user?.id]);

  const handleCheckout = async (priceId: string) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/v1/billing/checkout`, {
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

  const fmtCents = (v: number, currency = 'usd') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(v / 100);

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 animate-pulse bg-border-medium rounded" />
        <div className="h-3 w-56 animate-pulse bg-border-medium rounded" />
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse bg-border-medium rounded-lg" />)}
        </div>
      </div>
    );
  }

  const planName = subscription?.plan || 'Free';
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const hasStripe = !!subscription?.stripeCustomerId;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-1 text-xs text-text-muted mb-2">
          <Link href="/dashboard/business-os" className="hover:text-wise-electric">Business</Link>
          <span className="opacity-30">/</span>
          <span>Billing</span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary">💳 Billing</h1>
        <p className="text-sm text-text-muted mt-1">Subscription, plan details, and payment management</p>
      </div>

      {error && (
        <Card className="p-4 border-danger/20 bg-danger/5">
          <p className="text-sm text-danger">{error}</p>
        </Card>
      )}

      {/* Current Subscription */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x md:divide-border-subtle">
          <div className="pt-6 md:pt-0 md:pr-6 md:pl-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Current Plan</p>
            <p className="text-3xl font-bold text-wise-electric mt-2">{planName}</p>
            <Badge variant={isActive ? 'success' : 'warning'} className="mt-3">
              {isActive ? 'ACTIVE' : subscription?.status?.toUpperCase() || 'NOT CONFIGURED'}
            </Badge>
          </div>
          <div className="pt-6 md:pt-0 md:px-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Period Ends</p>
            {subscription?.currentPeriodEnd ? (
              <>
                <p className="text-lg font-semibold text-text-primary mt-2">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </p>
                <p className="text-xs text-text-muted mt-1">{subscription.cancelAtPeriodEnd ? 'Cancels at end' : 'Auto-renews'}</p>
              </>
            ) : (
              <p className="text-text-muted mt-2">No active period</p>
            )}
          </div>
          <div className="pt-6 md:pt-0 md:pl-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Amount</p>
            {subscription?.amount ? (
              <>
                <p className="text-3xl font-bold text-wise-electric mt-2 tabular-nums">{fmtCents(subscription.amount, subscription.currency || 'usd')}</p>
                <p className="text-xs text-text-muted mt-1">per {subscription.interval || 'month'}</p>
              </>
            ) : (
              <p className="text-text-muted mt-2">$0 / month</p>
            )}
          </div>
        </div>
      </Card>

      {!hasStripe && (
        <Card className="p-4 border-warning/20 space-y-2">
          <div className="flex items-start gap-3">
            <Badge variant="warning">Setup Required</Badge>
            <div>
              <p className="text-sm font-medium text-text-primary">Stripe Not Connected</p>
              <p className="text-xs text-text-muted mt-0.5">
                No Stripe customer ID found. Payment processing requires Stripe server configuration.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Plans */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-text-primary">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Starter', price: '$29/mo', features: ['5 projects', 'Basic analytics', 'Email support'], priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID },
            { name: 'Professional', price: '$79/mo', features: ['Unlimited projects', 'Advanced analytics', 'Priority support', 'API access'], priceId: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID },
            { name: 'Enterprise', price: 'Custom', features: ['Everything in Pro', 'Dedicated support', 'Custom integrations', 'SLA guarantee'], priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID },
          ].map(plan => (
            <Card key={plan.name} className={`p-6 space-y-4 flex flex-col ${planName === plan.name ? 'border-wise-electric/50 bg-wise-electric/5' : ''}`}>
              <div>
                <h3 className="text-base font-semibold text-text-primary">{plan.name}</h3>
                <p className="text-2xl font-bold text-wise-electric mt-2">{plan.price}</p>
              </div>
              <ul className="space-y-2 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="text-sm text-text-muted flex items-center gap-2">
                    <span className="text-wise-electric text-xs">✓</span> {f}
                  </li>
                ))}
              </ul>
              {planName === plan.name ? (
                <p className="text-center text-xs text-text-muted py-2">Current Plan</p>
              ) : plan.priceId ? (
                <Button variant="primary" onClick={() => handleCheckout(plan.priceId!)} size="md">Upgrade</Button>
              ) : (
                <Button variant="secondary" size="md">Contact Sales</Button>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Invoices */}
      <Card className="p-6 space-y-2">
        <h2 className="text-sm font-semibold text-text-primary">Invoices</h2>
        <p className="text-sm text-text-muted">
          {hasStripe ? 'Invoice history is managed through Stripe. Access your invoices through the customer portal.' : 'Connect Stripe to view invoice history.'}
        </p>
      </Card>

      {!serviceAvailable && (
        <Card className="p-16 text-center space-y-3">
          <div className="text-4xl opacity-20">💰</div>
          <h3 className="text-base font-semibold text-text-secondary">Billing Service Unavailable</h3>
          <p className="text-sm text-text-muted max-w-sm mx-auto">Could not connect to the billing API. The service may need to be configured.</p>
        </Card>
      )}
    </div>
  );
}
