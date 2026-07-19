'use client';

/**
 * PricingPage Component
 * Full pricing page with all tiers and features
 */

import { useState } from 'react';
import { PRICING_TIERS, getTierColor, formatPrice } from '../../lib/subscription-config';
import { useAuthContext } from '../../context/AuthContext';
import { UpgradeModal } from './UpgradeModal';
import { SubscriptionTier } from '../../types/subscription';

export function PricingPage() {
  const { tier, isAuthenticated } = useAuthContext();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [highlightTier, setHighlightTier] = useState<SubscriptionTier>('pro');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleUpgradeClick = (selectedTier: SubscriptionTier) => {
    setHighlightTier(selectedTier);
    setIsUpgradeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-400 mb-8">
            Choose the perfect plan for your audio production needs
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-6 mb-4">
            <span className={billingPeriod === 'monthly' ? 'text-white font-semibold' : 'text-gray-400'}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-800"
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-blue-400 transition-transform ${
                  billingPeriod === 'yearly' ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={billingPeriod === 'yearly' ? 'text-white font-semibold' : 'text-gray-400'}>
              Yearly <span className="text-green-400 text-sm ml-1">(Save 20%)</span>
            </span>
          </div>

          <div className="h-0.5 w-24 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mx-auto"></div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {PRICING_TIERS.map((pricing) => {
            const color = getTierColor(pricing.name as SubscriptionTier);
            const isCurrentTier = pricing.name === tier;
            const price =
              billingPeriod === 'yearly' ? pricing.yearlyPrice : pricing.monthlyPrice;

            return (
              <div
                key={pricing.name}
                className={`
                  rounded-xl border transition-all relative overflow-hidden group
                  ${
                    isCurrentTier
                      ? 'border-blue-400 bg-blue-400/5 ring-2 ring-blue-400/30 shadow-xl'
                      : pricing.isPopular
                      ? 'border-amber-400 bg-gradient-to-b from-gray-900 to-gray-950 ring-1 ring-amber-400/30 shadow-lg'
                      : 'border-gray-700 hover:border-gray-600 bg-gray-900/50'
                  }
                `}
              >
                {/* Popular Badge */}
                {pricing.isPopular && !isCurrentTier && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-orange-400 text-black px-4 py-1 text-xs font-bold rounded-bl-lg">
                    MOST POPULAR
                  </div>
                )}

                {/* Current Badge */}
                {isCurrentTier && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-400 to-cyan-400 text-black px-4 py-1 text-xs font-bold rounded-bl-lg">
                    CURRENT PLAN
                  </div>
                )}

                <div className="p-8">
                  {/* Tier Info */}
                  <h3 className="text-2xl font-bold mb-2">{pricing.displayName}</h3>
                  <p className="text-gray-400 text-sm mb-6 h-10">{pricing.description}</p>

                  {/* Price */}
                  <div className="mb-8">
                    {pricing.monthlyPrice === 0 ? (
                      <div className="text-4xl font-bold">Free Forever</div>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-bold">{formatPrice(price)}</span>
                          <span className="text-gray-400">/ {billingPeriod === 'yearly' ? 'year' : 'month'}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* CTA Button */}
                  {isCurrentTier ? (
                    <button
                      disabled
                      className="w-full py-3 bg-gray-800 text-gray-400 rounded-lg font-semibold mb-8 cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgradeClick(pricing.name as SubscriptionTier)}
                      style={{
                        backgroundColor: pricing.name === 'free' ? '#888888' : color,
                      }}
                      className={`
                        w-full py-3 rounded-lg font-semibold mb-8 transition-all
                        hover:shadow-lg hover:scale-105 active:scale-95
                        ${pricing.name === 'free' ? 'text-white' : 'text-black'}
                      `}
                    >
                      {pricing.name === 'free' ? 'Get Started' : 'Upgrade Now'}
                    </button>
                  )}

                  {/* Features */}
                  <div className="space-y-4 border-t border-gray-800 pt-8">
                    {pricing.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <span
                          className={`flex-shrink-0 text-lg mt-0.5 ${
                            feature.included ? 'text-green-400' : 'text-gray-600'
                          }`}
                        >
                          {feature.included ? '✓' : '✗'}
                        </span>
                        <div>
                          <span
                            className={`text-sm block ${
                              feature.included ? 'text-gray-300' : 'text-gray-600'
                            }`}
                          >
                            {feature.name}
                          </span>
                          {feature.tooltip && (
                            <span className="text-xs text-gray-500 block mt-1">
                              {feature.tooltip}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-2xl mx-auto mt-24">
          <h2 className="text-3xl font-bold mb-12 text-center">Common Questions</h2>

          <div className="space-y-6">
            <details className="group bg-gray-900 rounded-lg border border-gray-800 p-6 cursor-pointer">
              <summary className="flex items-center justify-between font-semibold text-lg hover:text-blue-400 transition-colors">
                Can I cancel anytime?
                <span className="transition-transform group-open:rotate-180">➤</span>
              </summary>
              <p className="text-gray-400 mt-4">
                Yes! You can cancel your subscription at any time. Your access continues until the end of your billing period.
              </p>
            </details>

            <details className="group bg-gray-900 rounded-lg border border-gray-800 p-6 cursor-pointer">
              <summary className="flex items-center justify-between font-semibold text-lg hover:text-blue-400 transition-colors">
                Do you offer discounts for annual billing?
                <span className="transition-transform group-open:rotate-180">➤</span>
              </summary>
              <p className="text-gray-400 mt-4">
                Yes! Annual plans save you 20% compared to monthly billing.
              </p>
            </details>

            <details className="group bg-gray-900 rounded-lg border border-gray-800 p-6 cursor-pointer">
              <summary className="flex items-center justify-between font-semibold text-lg hover:text-blue-400 transition-colors">
                What&apos;s included in the free plan?
                <span className="transition-transform group-open:rotate-180">➤</span>
              </summary>
              <p className="text-gray-400 mt-4">
                The free plan includes basic recording, up to 2 tracks per project, 1GB storage, and 5 projects. Perfect for getting started!
              </p>
            </details>

            <details className="group bg-gray-900 rounded-lg border border-gray-800 p-6 cursor-pointer">
              <summary className="flex items-center justify-between font-semibold text-lg hover:text-blue-400 transition-colors">
                Do I need to provide credit card info for free tier?
                <span className="transition-transform group-open:rotate-180">➤</span>
              </summary>
              <p className="text-gray-400 mt-4">
                No credit card required for the free plan. Start immediately with full access to core features.
              </p>
            </details>
          </div>
        </div>

        {/* Bottom CTA */}
        {!isAuthenticated && (
          <div className="text-center mt-24">
            <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
            <p className="text-gray-400 mb-8">Join thousands of creators using WISE² Studio</p>
            <button
              onClick={() => {
                // Navigate to sign-in page or open auth modal
                window.location.href = '/auth';
              }}
              className="px-8 py-4 bg-gradient-to-r from-blue-400 to-cyan-400 text-black rounded-lg font-bold text-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Start Free Today
            </button>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        highlightTier={highlightTier}
      />
    </div>
  );
}

export default PricingPage;
