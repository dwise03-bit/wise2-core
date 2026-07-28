'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
}

export default function BillingPage() {
  const currentPlan = 'Pro';
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 99,
      description: 'Perfect for solo operators',
      features: [
        '1 user',
        'Up to 50 leads',
        'Basic CRM',
        'Email support',
      ],
      cta: (currentPlan as string) === 'Starter' ? 'Current Plan' : 'Upgrade Now',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 299,
      description: 'For growing businesses',
      features: [
        '3 users',
        'Unlimited leads',
        'Advanced CRM',
        'Automations',
        'AI Assistant',
        'Priority support',
      ],
      cta: (currentPlan as string) === 'Pro' ? 'Current Plan' : 'Upgrade Now',
      popular: (currentPlan as string) === 'Pro',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 999,
      description: 'For scaling operations',
      features: [
        'Unlimited users',
        'Unlimited everything',
        'Custom integrations',
        'Advanced automation',
        'Dedicated support',
        'SLA guarantee',
      ],
      cta: (currentPlan as string) === 'Enterprise' ? 'Current Plan' : 'Contact Sales',
    },
  ];

  const invoices: Invoice[] = [
    {
      id: 'inv-2024-07',
      date: 'Jul 28, 2024',
      amount: 299,
      status: 'paid',
    },
    {
      id: 'inv-2024-06',
      date: 'Jun 28, 2024',
      amount: 299,
      status: 'paid',
    },
    {
      id: 'inv-2024-05',
      date: 'May 28, 2024',
      amount: 299,
      status: 'paid',
    },
  ];

  const statusColor = {
    paid: 'text-[var(--organized-chaos-green)]',
    pending: 'text-[var(--warning)]',
    overdue: 'text-[var(--danger)]',
  };

  return (
    <div className="min-h-screen bg-[var(--wise-black)] text-[var(--text-primary)]">
      <nav className="border-b border-[var(--border-medium)] bg-[var(--wise-black)]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-[var(--organized-chaos-green)] font-bold">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold mt-2">💳 Billing & Plans</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Current Plan */}
        <section className="bg-gradient-to-br from-[var(--wise-steel)] to-[var(--wise-black)] border border-[var(--organized-chaos-green)] rounded-lg p-6">
          <h2 className="text-lg font-bold text-[var(--organized-chaos-green)] mb-4">Current Plan</h2>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-3xl font-bold">{currentPlan}</div>
              <div className="text-[var(--text-secondary)] mt-2">$299/month</div>
              <div className="text-sm text-[var(--text-muted)] mt-1">
                Billing cycle: Monthly • Next billing date: Aug 28, 2024
              </div>
            </div>
            <button className="px-6 py-3 bg-[var(--organized-chaos-green)] text-[var(--wise-black)] rounded-lg font-semibold hover:shadow-lg transition-all">
              Manage Subscription
            </button>
          </div>
        </section>

        {/* Pricing Plans */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold">Upgrade Your Plan</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-[var(--organized-chaos-green)] text-[var(--wise-black)]'
                    : 'bg-[var(--wise-steel)] text-[var(--text-secondary)]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  billingCycle === 'annual'
                    ? 'bg-[var(--organized-chaos-green)] text-[var(--wise-black)]'
                    : 'bg-[var(--wise-steel)] text-[var(--text-secondary)]'
                }`}
              >
                Annual (Save 20%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`flex flex-col p-6 rounded-lg border transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-br from-[var(--wise-steel)] to-[var(--wise-black)] border-[var(--organized-chaos-green)]'
                    : 'bg-[var(--wise-steel)] border-[var(--border-medium)] hover:border-[var(--organized-chaos-green)]'
                }`}
              >
                {plan.popular && (
                  <div className="text-xs font-semibold text-[var(--organized-chaos-green)] uppercase tracking-wider mb-4">
                    ⭐ Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-sm text-[var(--text-secondary)] mb-4">{plan.description}</div>
                <div className="text-3xl font-bold text-[var(--organized-chaos-green)] mb-2">
                  ${plan.price}
                </div>
                <div className="text-xs text-[var(--text-muted)] mb-6">/month (billed {billingCycle})</div>
                <button
                  className={`w-full py-2 rounded-lg font-semibold mb-6 transition-all ${
                    (plan.cta as string).includes('Current')
                      ? 'bg-[var(--border-medium)] text-[var(--text-secondary)] cursor-default'
                      : 'bg-[var(--organized-chaos-green)] text-[var(--wise-black)] hover:shadow-lg'
                  }`}
                  disabled={(plan.cta as string).includes('Current')}
                >
                  {plan.cta}
                </button>
                <div className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-[var(--organized-chaos-green)] mt-0.5">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Invoices */}
        <section>
          <h2 className="text-lg font-bold mb-6">Billing History</h2>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-[var(--wise-steel)] border border-[var(--border-medium)] rounded-lg hover:border-[var(--organized-chaos-green)] transition-all"
              >
                <div>
                  <div className="font-semibold">{invoice.id}</div>
                  <div className="text-sm text-[var(--text-secondary)]">{invoice.date}</div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-lg font-bold">${invoice.amount}</div>
                  <div className={`text-sm font-semibold ${statusColor[invoice.status]}`}>
                    {invoice.status.toUpperCase()}
                  </div>
                  <button className="px-3 py-1 text-sm border border-[var(--border-medium)] rounded hover:border-[var(--organized-chaos-green)] transition-all">
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Payment Method */}
        <section className="bg-[var(--wise-steel)] border border-[var(--border-medium)] rounded-lg p-6">
          <h2 className="text-lg font-bold mb-6">Payment Method</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Visa ending in 4242</div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">Expires 12/2026</div>
            </div>
            <button className="px-4 py-2 bg-[var(--organized-chaos-green)] bg-opacity-20 text-[var(--organized-chaos-green)] rounded-lg font-semibold hover:bg-opacity-30 transition-all">
              Update Payment Method
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
