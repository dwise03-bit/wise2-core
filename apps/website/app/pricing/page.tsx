'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PublicFooter } from '@/components/navigation';
import { MasterNav } from '@/components/MasterNav';

const PRICING_TIERS = [
  {
    id: 'STARTER',
    name: 'Starter',
    price: 29,
    description: 'Perfect for solopreneurs & small teams',
    features: ['1 workspace', 'Up to 5 users', 'Core dashboard', 'Basic analytics', 'Email support', 'Monthly backups', 'Basic API access', '2 integrations'],
    cta: 'Start Free Trial',
    highlight: false,
    color: 'blue',
  },
  {
    id: 'PRO',
    name: 'Growth',
    price: 99,
    description: 'For scaling businesses - Most Popular',
    features: ['5 workspaces', 'Unlimited users', 'Advanced analytics', 'Full API access', 'Priority 24h support', 'Daily backups', 'Unlimited integrations', 'RBAC', 'Ad network integration', 'Revenue tracking'],
    cta: 'Start 14-Day Free Trial',
    highlight: true,
    color: 'green',
  },
  {
    id: 'ENTERPRISE',
    name: 'Scale',
    price: 299,
    description: 'For large teams & complex operations',
    features: ['Unlimited workspaces', 'Unlimited users', 'Enterprise analytics', 'Dedicated API', '24/7 premium support', 'Real-time backups', 'Unlimited everything', 'SSO & compliance', 'Dedicated account manager', 'Custom SLA'],
    cta: 'Schedule Enterprise Demo',
    highlight: false,
    color: 'purple',
  },
  {
    id: 'AGENCY',
    name: 'Agency',
    price: 499,
    description: 'For agencies & resellers',
    features: ['Unlimited everything for clients', 'White-label options', 'Reseller program', '40% revenue share', 'Dedicated partner manager', 'Co-marketing support', 'Custom branding', 'Priority deployment'],
    cta: 'Become a Partner',
    highlight: false,
    color: 'gold',
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
      <MasterNav />
      <main className="bg-[#050607] min-h-screen text-white">
        {/* Hero */}
        <section className="pt-20 pb-16 px-5 sm:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#00FF7F] mb-6">
              Transparent Pricing — No Guesswork
            </p>
            <h1 className="text-5xl sm:text-6xl font-black uppercase tracking-tight mb-6">
              Simple, Honest <span className="text-[#00D9FF]">Pricing</span>
            </h1>
            <p className="text-lg text-[#D1D5DB] mb-12 max-w-3xl mx-auto">
              Choose the WISE² system that fits your operation. All plans include enterprise security, dedicated support, and unlimited everything.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-16">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-8 py-3 font-bold uppercase tracking-[0.1em] text-sm transition ${
                  billingCycle === 'monthly'
                    ? 'bg-[#00D9FF] text-[#050607]'
                    : 'border border-[#D1D5DB]/30 text-[#D1D5DB] hover:border-[#00D9FF] hover:text-[#00D9FF]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-8 py-3 font-bold uppercase tracking-[0.1em] text-sm transition ${
                  billingCycle === 'annual'
                    ? 'bg-[#00D9FF] text-[#050607]'
                    : 'border border-[#D1D5DB]/30 text-[#D1D5DB] hover:border-[#00D9FF] hover:text-[#00D9FF]'
                }`}
              >
                Annual
                <span className="ml-2 text-xs text-[#00FF7F]">(Save 20%)</span>
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="px-5 pb-24 sm:px-8">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`border p-8 transition ${
                  tier.highlight
                    ? 'border-[#00D9FF] bg-[#0a0f1a]/80'
                    : 'border-[#00D9FF]/30 bg-[#0a0f1a]/50 hover:border-[#00D9FF]'
                }`}
              >
                {tier.highlight && (
                  <p className="text-xs font-bold uppercase tracking-[0.1em] mb-4 text-[#00FF7F]">
                    Most Popular
                  </p>
                )}
                <h3 className="text-2xl font-black uppercase tracking-tight mb-2 text-white">
                  {tier.name}
                </h3>
                <p className="text-sm text-[#D1D5DB] mb-6">
                  {tier.description}
                </p>

                <div className="mb-8 border-t border-[#00D9FF]/20 pt-6">
                  {tier.price === null ? (
                    <div className="text-4xl font-black text-[#00D9FF]">Custom</div>
                  ) : (
                    <>
                      <div className="text-5xl font-black text-[#00D9FF]">
                        ${getPrice(tier.price)}
                      </div>
                      <div className="text-xs text-[#B7C0CB] mt-2 uppercase tracking-[0.1em]">
                        per {billingCycle === 'annual' ? 'year' : 'month'}
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handleSelectTier(tier.id)}
                  className={`w-full py-3 font-bold uppercase tracking-[0.12em] text-sm transition mb-8 ${
                    tier.highlight
                      ? 'bg-[#00D9FF] text-[#050607] hover:bg-[#39FF14]'
                      : 'border border-[#00D9FF] text-[#00D9FF] hover:bg-[#00D9FF]/10'
                  }`}
                >
                  {tier.cta}
                </button>

                <div className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-[#00FF7F] font-bold text-sm flex-shrink-0 mt-0.5">✓</span>
                      <span className="text-xs text-[#D1D5DB]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 py-24 sm:px-8 bg-[#0a0f1a] border-t border-[#00D9FF]/30">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mb-6">
              Ready to Build?
            </h2>
            <p className="text-lg text-[#D1D5DB] mb-12">
              Join 120+ founders running their business OS on WISE².
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => router.push('/start-your-build')}
                className="px-8 py-4 bg-[#00D9FF] text-[#050607] font-bold uppercase tracking-[0.1em] text-sm hover:bg-[#39FF14] transition"
              >
                Start Your Build
              </button>
              <button
                onClick={() => handleSelectTier('PRO')}
                className="px-8 py-4 border border-[#00D9FF] text-[#00D9FF] font-bold uppercase tracking-[0.1em] text-sm hover:bg-[#00D9FF]/10 transition"
              >
                See Pricing
              </button>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
