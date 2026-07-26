'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/wise';

const PRICING_TIERS = [
  {
    id: 'STARTER',
    name: 'Starter',
    price: 29,
    description: 'Perfect for trying out WISE²',
    features: ['1 workspace', 'Up to 5 users', 'Core dashboard', 'Basic analytics', 'Email support', 'Monthly data backups'],
    cta: 'Start Free Trial',
    highlight: false,
  },
  {
    id: 'PRO',
    name: 'Professional',
    price: 99,
    description: 'For growing businesses',
    features: ['5 workspaces', 'Unlimited users', 'Advanced analytics', 'API access', 'Priority support', 'Daily backups', 'Custom integrations', 'RBAC'],
    cta: 'Start 14-Day Trial',
    highlight: true,
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: null,
    description: 'For large organizations',
    features: ['Unlimited workspaces', 'Unlimited users', 'Enterprise analytics', 'Dedicated API', '24/7 support', 'Real-time backups', 'Custom integrations', 'SSO & compliance'],
    cta: 'Schedule Demo',
    highlight: false,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const getPrice = (price: number | null) => {
    if (price === null) return 'Custom';
    return billingCycle === 'annual' ? Math.floor(price * 12 * 0.8) : price;
  };

  const handleSelectTier = (tierId: string) => {
    if (tierId === 'ENTERPRISE') {
      router.push('/contact');
    } else {
      router.push(`/checkout?plan=${tierId}`);
    }
  };

  return (
    <>
      <main className="bg-[#050505] min-h-screen text-white">
        {/* Hero */}
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest mb-6"
              style={{ background: 'rgba(0,148,255,0.1)', border: '1px solid rgba(0,148,255,0.3)', color: '#0094FF' }}>
              14-DAY FREE TRIAL — NO CREDIT CARD REQUIRED
            </div>
            <h1 className="text-5xl font-bold mb-6">
              Simple, Transparent <span style={{ color: '#0094FF' }}>Pricing</span>
            </h1>
            <p className="text-xl text-gray-400 mb-4">
              Not sure which plan is right for you?
            </p>
            <a
              href="/audit"
              className="inline-block mb-12 px-6 py-3 rounded-lg font-bold text-sm transition"
              style={{ background: 'rgba(0,148,255,0.15)', border: '1px solid rgba(0,148,255,0.4)', color: '#0094FF' }}
            >
              Get your FREE Business AI Audit first →
            </a>

            <div className="flex items-center justify-center gap-6 mb-8">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-lg font-semibold transition ${billingCycle === 'monthly' ? 'text-white' : 'bg-[#161616] text-gray-400'}`}
                style={billingCycle === 'monthly' ? { background: '#0094FF' } : {}}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-3 rounded-lg font-semibold transition ${billingCycle === 'annual' ? 'text-white' : 'bg-[#161616] text-gray-400'}`}
                style={billingCycle === 'annual' ? { background: '#0094FF' } : {}}
              >
                Annual <span className="ml-2 text-xs px-2 py-1 rounded" style={{ background: 'rgba(0,148,255,0.3)' }}>Save 20%</span>
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="px-6 pb-20">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`rounded-2xl p-8 transition transform hover:scale-105 ${
                  tier.highlight
                    ? 'border-2'
                    : 'bg-[#101010] border border-[#1a1a1a]'
                }`}
                style={tier.highlight ? {
                  background: 'linear-gradient(to bottom, rgba(0,148,255,0.12), rgba(0,148,255,0.04))',
                  borderColor: '#0094FF',
                } : {}}
              >
                {tier.highlight && (
                  <div className="mb-4 inline-block px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: '#0094FF' }}>
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-gray-400 text-sm mb-6">{tier.description}</p>

                <div className="mb-8">
                  {tier.price === null ? (
                    <div className="text-3xl font-bold">Custom</div>
                  ) : (
                    <>
                      <div className="text-5xl font-bold" style={{ color: '#0094FF' }}>${getPrice(tier.price)}</div>
                      <div className="text-gray-400 text-sm mt-2">per {billingCycle === 'annual' ? 'year' : 'month'}</div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handleSelectTier(tier.id)}
                  className="w-full py-3 rounded-lg font-bold mb-8 transition"
                  style={tier.highlight
                    ? { background: '#0094FF', color: '#050505', boxShadow: '0 0 16px rgba(0,148,255,0.4)' }
                    : { background: '#161616', color: '#fff', border: '1px solid #1a1a1a' }}
                >
                  {tier.cta}
                </button>

                <div className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#0094FF' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20" style={{ background: 'linear-gradient(135deg, rgba(0,102,255,0.1) 0%, rgba(0,148,255,0.04) 100%)' }}>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Don&apos;t know where to start?</h2>
            <p className="text-xl text-gray-400 mb-8">
              Get your free Business AI Audit — we&apos;ll tell you exactly which plan fits your operation.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => router.push('/audit')}
                className="px-8 py-4 rounded-lg font-bold transition"
                style={{ background: '#0094FF', color: '#050505', boxShadow: '0 0 20px rgba(0,148,255,0.4)' }}
              >
                FREE Business AI Audit
              </button>
              <button
                onClick={() => handleSelectTier('PRO')}
                className="px-8 py-4 bg-[#161616] rounded-lg font-bold hover:bg-[#1a1a1a] transition"
                style={{ border: '1px solid rgba(0,148,255,0.3)', color: '#0094FF' }}
              >
                Start 14-Day Trial
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
