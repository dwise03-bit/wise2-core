'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { PublicFooter } from '@/components/navigation';
import { getDigitalTwinPackage } from '@/lib/digital-twin';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const product = searchParams.get('product') || 'platform';
  const planId = searchParams.get('plan') || (product === 'digital-twin' ? 'GROWTH' : 'PRO');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const isDigitalTwin = product === 'digital-twin';
  const twinPlan = getDigitalTwinPackage(planId);
  const plan = isDigitalTwin
    ? {
        name: twinPlan.name,
        price: twinPlan.price ?? 'Custom',
        description: twinPlan.description,
      }
    : {
        name: 'Professional',
        price: 99,
        description: 'For growing businesses',
      };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!email || !fullName) {
        throw new Error('Please fill in all fields');
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          product,
          email,
          fullName,
          successUrl: `${window.location.origin}/checkout/success?product=${product}&plan=${planId}`,
          cancelUrl: `${window.location.origin}/checkout/cancel`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div>
      <main className="bg-[#050505] min-h-screen pb-20 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Form Section */}
            <div>
              <h1 className="text-4xl font-black uppercase tracking-[0.08em] text-white mb-2">
                {isDigitalTwin ? 'Build Your Digital Twin' : 'Complete Your Build'}
              </h1>
              <p className="text-[#B7BDC8] mb-8">
                {isDigitalTwin
                  ? 'Enter your details to launch tenant setup, onboarding, and the approval-controlled Digital Twin workflow.'
                  : 'Enter your details to continue into the WISE² system.'}
              </p>

              <form onSubmit={handleCheckout} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg">
                    <p className="text-red-300">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-white font-semibold mb-2">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-white/[0.04] border-2 border-[#C7FF2E]/30 rounded-lg text-white placeholder-wise-text-muted focus:outline-none focus:border-[#C7FF2E]"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-white/[0.04] border-2 border-[#C7FF2E]/30 rounded-lg text-white placeholder-wise-text-muted focus:outline-none focus:border-[#C7FF2E]"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-white font-semibold">
                    By proceeding, you agree to our terms
                  </label>
                  <p className="text-sm text-gray-300">
                    {isDigitalTwin
                      ? 'You’ll be taken to our secure payment processor. After payment, your Digital Twin onboarding and tenant-linked build flow begin.'
                      : 'You&apos;ll be taken to our secure payment processor to complete your build.'}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#C7FF2E] text-black rounded-lg font-bold text-lg hover:brightness-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Continue to Payment'}
                </button>

                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full py-3 bg-white/[0.04] border-2 border-[#C7FF2E]/30 text-[#C7FF2E] rounded-lg font-semibold hover:border-[#C7FF2E]/60 transition-all"
                  disabled={loading}
                >
                  Back to Pricing
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div>
              <div className="sticky top-32 bg-white/[0.04] border-2 border-[#C7FF2E]/30 rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-white mb-8">Order Summary</h2>

                <div className="border-b border-[#C7FF2E]/20 pb-8 mb-8">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-[#B7BDC8] text-sm mb-4">{plan.description}</p>

                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-gray-300">Plan Price:</span>
                    {typeof plan.price === 'number' ? (
                      <span className="text-2xl font-bold text-[#C7FF2E]">
                        ${plan.price}
                        <span className="text-lg text-gray-300">/mo</span>
                      </span>
                    ) : (
                      <span className="text-2xl font-bold text-[#C7FF2E]">Custom</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Billing Cycle:</span>
                    <span className="text-white font-semibold">Monthly</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">First Charge:</span>
                    <span className="text-white font-semibold">
                      {typeof plan.price === 'number' ? `$${plan.price}` : 'Contact us'}
                    </span>
                  </div>
                </div>

                <div className="bg-[#C7FF2E]/10 border border-[#C7FF2E]/30 rounded-lg p-4 text-sm text-gray-300">
                  {isDigitalTwin ? (
                    <>
                      ✓ Tenant-linked onboarding
                      <br />✓ Approval-aware activation path
                      <br />✓ Revenue OS integration readiness
                    </>
                  ) : (
                    <>
                      ✓ 14-day free trial included
                      <br />✓ Cancel anytime
                      <br />✓ No hidden fees
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-wise-bg-primary" />}>
      <CheckoutContent />
    </Suspense>
  );
}
