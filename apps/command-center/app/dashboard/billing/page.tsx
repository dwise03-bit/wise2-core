'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../src/contexts/AuthContext';

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
        <div className="wise-skeleton h-6 w-32" />
        <div className="wise-skeleton h-3 w-56" />
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[1, 2, 3].map(i => <div key={i} className="wise-skeleton h-24 rounded-lg" />)}
        </div>
      </div>
    );
  }

  const planName = subscription?.plan || 'Free';
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const hasStripe = !!subscription?.stripeCustomerId;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <div className="wise-breadcrumb mb-2">
          <Link href="/dashboard/business-os">Business</Link>
          <span className="opacity-30">/</span>
          <span className="text-text-secondary">Billing</span>
        </div>
        <h1 className="wise-page-title">Billing</h1>
        <p className="wise-page-subtitle">Subscription, plan details, and payment management</p>
      </div>

      {error && (
        <div className="p-3 bg-danger-muted border border-danger/20 rounded-lg text-danger text-sm">{error}</div>
      )}

      {/* Current Subscription */}
      <div className="wise-card p-1">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="px-5 py-4">
            <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1">Current Plan</div>
            <div className="text-2xl font-bold text-wise-electric">{planName}</div>
            <span className={`mt-1.5 inline-block ${isActive ? 'wise-badge-success' : 'wise-badge-warning'}`}>
              {isActive ? 'ACTIVE' : subscription?.status?.toUpperCase() || 'NOT CONFIGURED'}
            </span>
          </div>
          <div className="px-5 py-4 border-t md:border-t-0 md:border-l border-border-subtle">
            <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1">Period</div>
            {subscription?.currentPeriodEnd ? (
              <>
                <div className="text-lg font-semibold text-text-primary">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="text-xs text-text-muted mt-1">{subscription.cancelAtPeriodEnd ? 'Cancels at period end' : 'Auto-renews'}</div>
              </>
            ) : (
              <div className="text-text-muted">No active period</div>
            )}
          </div>
          <div className="px-5 py-4 border-t md:border-t-0 md:border-l border-border-subtle">
            <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1">Amount</div>
            {subscription?.amount ? (
              <>
                <div className="text-2xl font-bold text-wise-electric tabular-nums">{fmtCents(subscription.amount, subscription.currency || 'usd')}</div>
                <div className="text-xs text-text-muted mt-1">per {subscription.interval || 'month'}</div>
              </>
            ) : (
              <div className="text-text-muted">$0 / month</div>
            )}
          </div>
        </div>
      </div>

      {!hasStripe && (
        <div className="wise-card p-4 border-warning/20">
          <div className="flex items-start gap-3">
            <span className="wise-badge-warning">Setup Required</span>
            <div>
              <p className="text-sm font-medium text-text-primary">Stripe Not Connected</p>
              <p className="text-xs text-text-muted mt-0.5">
                No Stripe customer ID found. Payment processing requires Stripe server configuration.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Plans */}
      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-3">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { name: 'Starter', price: '$29/mo', features: ['5 projects', 'Basic analytics', 'Email support'], priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID },
            { name: 'Professional', price: '$79/mo', features: ['Unlimited projects', 'Advanced analytics', 'Priority support', 'API access'], priceId: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID },
            { name: 'Enterprise', price: 'Custom', features: ['Everything in Pro', 'Dedicated support', 'Custom integrations', 'SLA guarantee'], priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID },
          ].map(plan => (
            <div key={plan.name} className={`wise-card p-5 ${planName === plan.name ? '!border-wise-electric/40' : ''}`}>
              <h3 className="text-base font-semibold text-text-primary mb-0.5">{plan.name}</h3>
              <p className="text-xl font-bold text-wise-electric mb-4">{plan.price}</p>
              <ul className="space-y-1.5 mb-5">
                {plan.features.map(f => (
                  <li key={f} className="text-sm text-text-muted flex items-center gap-2">
                    <span className="text-wise-electric text-xs">&#10003;</span> {f}
                  </li>
                ))}
              </ul>
              {planName === plan.name ? (
                <span className="block text-center text-xs text-text-muted py-2">Current Plan</span>
              ) : plan.priceId ? (
                <button onClick={() => handleCheckout(plan.priceId!)} className="wise-btn-primary w-full">Upgrade</button>
              ) : (
                <button className="wise-btn-secondary w-full">Contact Sales</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Invoices */}
      <div className="wise-card p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-2">Invoices</h2>
        <p className="text-sm text-text-muted">
          {hasStripe ? 'Invoice history is managed through Stripe. Access your invoices through the customer portal.' : 'Connect Stripe to view invoice history.'}
        </p>
      </div>

      {!serviceAvailable && (
        <div className="wise-card p-5 text-center">
          <div className="wise-empty-icon">&#128179;</div>
          <h3 className="wise-empty-title">Billing Service Unavailable</h3>
          <p className="wise-empty-desc">Could not connect to the billing API. The service may need to be configured.</p>
        </div>
      )}
    </div>
  );
}
