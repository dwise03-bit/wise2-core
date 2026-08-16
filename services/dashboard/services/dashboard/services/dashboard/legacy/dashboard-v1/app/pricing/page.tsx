'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, ChevronRight, ArrowRight } from 'lucide-react';

export default function PricingPage() {
  const router = useRouter();

  const handleSelectTier = (tier: string) => {
    router.push(`/auth/signup?tier=${tier}`);
  };

  const tiers = [
    {
      id: 'starter',
      name: 'Starter',
      price: 99,
      description: 'For beginners building fundamentals',
      features: [
        'Up to 2 sessions per month',
        'Access to video library',
        'Community forum access',
        'Basic progress tracking',
        'Email support',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 199,
      description: 'For serious learners advancing their skills',
      featured: true,
      features: [
        'Up to 4 sessions per month',
        '1-on-1 coaching sessions',
        'Complete video library',
        'Community forum access',
        'Personalized drills',
        'Priority email support',
        'Progress analytics',
      ],
    },
    {
      id: 'vip',
      name: 'VIP',
      price: 499,
      description: 'For competitive shooters and serious athletes',
      features: [
        'Unlimited monthly sessions',
        'Unlimited 1-on-1 coaching',
        'Complete video library',
        'Exclusive VIP community',
        'Custom training plans',
        '24/7 priority support',
        'Advanced analytics',
        'Competition prep',
      ],
    },
  ];

  const faqs = [
    {
      q: 'Can I change my plan?',
      a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.',
    },
    {
      q: 'Is there a refund policy?',
      a: 'We offer a 7-day money-back guarantee if you\'re not satisfied with your first month.',
    },
    {
      q: 'Do you offer group rates?',
      a: 'Yes, we offer discounts for organizations and groups. Contact us for more information.',
    },
  ];

  return (
    <main className="bg-black min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-900">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
            Wise Defense
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
              Home
            </Link>
            <Link href="/shop" className="text-gray-400 hover:text-white text-sm transition-colors">
              Shop
            </Link>
            <Link href="/auth/login" className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all text-sm font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 px-6 border-b border-gray-900">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl font-bold text-white">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-400">
            Choose the plan that fits your training goals. All plans include access to our community and resources.
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`rounded-2xl transition-all border p-8 ${
                  tier.featured
                    ? 'bg-gradient-to-br from-red-600/20 to-red-950/20 border-red-600/50 ring-2 ring-red-600/30 scale-105'
                    : 'bg-gray-900/30 border-gray-800 hover:border-red-600/30'
                }`}
              >
                {tier.featured && (
                  <div className="mb-4 inline-block px-3 py-1 bg-red-950 text-red-400 text-xs font-semibold rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-semibold text-white mb-2">{tier.name}</h3>
                <p className="text-gray-400 text-sm mb-6">{tier.description}</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">${tier.price}</span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
                <button
                  onClick={() => handleSelectTier(tier.id)}
                  className={`w-full py-3 rounded-full font-semibold transition-all mb-8 ${
                    tier.featured
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  Get Started
                </button>
                <div className="space-y-4">
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* FAQs */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Questions?</h2>
            <div className="space-y-6">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-red-600/30 transition-colors">
                  <h4 className="font-semibold text-white mb-2">{faq.q}</h4>
                  <p className="text-gray-400">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-gray-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Start Your Training Today</h2>
          <p className="text-xl text-gray-400 mb-12">
            Join hundreds of students achieving their training goals with Wise Defense.
          </p>
          <Link href="/auth/signup">
            <button className="px-10 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:shadow-lg hover:shadow-red-600/50 transition-all font-semibold text-lg inline-flex items-center gap-2">
              Begin Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <p>&copy; 2026 Wise Defense LLC. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
