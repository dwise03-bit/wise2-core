'use client';

/**
 * UpgradeModal Component
 * Modal for upgrading subscription tier with Stripe checkout
 */

import { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { PRICING_TIERS, getTierColor, formatPrice } from '../../lib/subscription-config';
import { createCheckoutSession } from '../../lib/stripe-service';
import { SubscriptionTier } from '../../types/subscription';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  highlightTier?: SubscriptionTier;
}

export function UpgradeModal({ isOpen, onClose, highlightTier = 'pro' }: UpgradeModalProps) {
  const { tier, upgradeToPro, upgradeToEnterprise } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  if (!isOpen) return null;

  const handleUpgrade = async (targetTier: SubscriptionTier) => {
    if (targetTier === tier) {
      onClose();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // For MVP, just update locally
      // In production, this would create a Stripe checkout session
      if (targetTier === 'pro') {
        await upgradeToPro();
      } else if (targetTier === 'enterprise') {
        await upgradeToEnterprise();
      }

      // Success toast would appear here
      setTimeout(() => {
        onClose();
        setIsLoading(false);
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upgrade failed';
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-950 border border-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-950 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Upgrade Your Plan</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-300 text-2xl font-light disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Billing Period Toggle */}
        <div className="px-6 py-4 flex items-center justify-center gap-4">
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

        {/* Pricing Tiers */}
        <div className="px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING_TIERS.map((pricing) => {
            const color = getTierColor(pricing.name as SubscriptionTier);
            const isCurrentTier = pricing.name === tier;
            const price =
              billingPeriod === 'yearly' ? pricing.yearlyPrice : pricing.monthlyPrice;

            return (
              <div
                key={pricing.name}
                className={`
                  border rounded-lg p-6 transition-all relative
                  ${
                    isCurrentTier
                      ? 'border-blue-400 bg-blue-400/5 ring-2 ring-blue-400/30'
                      : pricing.isPopular
                      ? 'border-gray-700 bg-gradient-to-b from-gray-900 to-gray-950 ring-1 ring-amber-400/20'
                      : 'border-gray-700 hover:border-gray-600'
                  }
                `}
              >
                {/* Popular Badge */}
                {pricing.isPopular && !isCurrentTier && (
                  <div className="absolute -top-3 left-4 bg-amber-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                    POPULAR
                  </div>
                )}

                {/* Current Badge */}
                {isCurrentTier && (
                  <div className="absolute -top-3 left-4 bg-blue-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                    CURRENT
                  </div>
                )}

                {/* Tier Name */}
                <h3 className="text-xl font-bold text-white mb-2">{pricing.displayName}</h3>
                <p className="text-gray-400 text-sm mb-4">{pricing.description}</p>

                {/* Price */}
                <div className="mb-6">
                  {pricing.monthlyPrice === 0 ? (
                    <div className="text-3xl font-bold text-white">Free</div>
                  ) : (
                    <>
                      <div className="text-4xl font-bold text-white">
                        {formatPrice(price)}
                      </div>
                      <div className="text-gray-400 text-sm">
                        per {billingPeriod === 'yearly' ? 'year' : 'month'}
                      </div>
                    </>
                  )}
                </div>

                {/* CTA Button */}
                {isCurrentTier ? (
                  <button
                    disabled
                    className="w-full py-3 bg-gray-800 text-gray-400 rounded font-semibold mb-6 cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(pricing.name as SubscriptionTier)}
                    disabled={isLoading}
                    style={{
                      backgroundColor: color,
                      color: pricing.name === 'free' ? 'white' : 'black',
                    }}
                    className="w-full py-3 rounded font-semibold mb-6 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? 'Upgrading...' : pricing.name === 'free' ? 'Downgrade' : 'Upgrade'}
                  </button>
                )}

                {/* Features */}
                <div className="space-y-3 border-t border-gray-800 pt-6">
                  {pricing.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span
                        className={`flex-shrink-0 text-lg mt-0.5 ${
                          feature.included ? 'text-green-400' : 'text-gray-600'
                        }`}
                      >
                        {feature.included ? '✓' : '✗'}
                      </span>
                      <span
                        className={`text-sm ${
                          feature.included ? 'text-gray-300' : 'text-gray-600'
                        }`}
                        title={feature.tooltip}
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800 px-6 py-4 bg-gray-900/50 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            All plans include core features. Cancel anytime.
          </p>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpgradeModal;
