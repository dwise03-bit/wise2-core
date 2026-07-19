'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Navigation, Footer } from '@/components/wise';

const PLAN_DETAILS = {
  STARTER: {
    name: 'Starter',
    price: 29,
    description: 'Perfect for trying out WISE²',
  },
  PRO: {
    name: 'Professional',
    price: 99,
    description: 'For growing businesses',
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
  },
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get('plan') || 'PRO';
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');

  const plan = PLAN_DETAILS[planId as keyof typeof PLAN_DETAILS] || PLAN_DETAILS.PRO;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!email || !fullName) {
        throw new Error('Please fill in all fields');
      }

      // Call your backend to create a Stripe checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          email,
          fullName,
          successUrl: `${window.location.origin}/checkout/success`,
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
      <Navigation />
      <main className="bg-wise-bg-primary min-h-screen pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Form Section */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Complete Your Purchase</h1>
              <p className="text-wise-text-secondary mb-8">Enter your details to proceed</p>

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
                    className="w-full px-4 py-3 bg-wise-bg-secondary border-2 border-wise-accent-green/30 rounded-lg text-white placeholder-wise-text-muted focus:outline-none focus:border-wise-accent-green"
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
                    className="w-full px-4 py-3 bg-wise-bg-secondary border-2 border-wise-accent-green/30 rounded-lg text-white placeholder-wise-text-muted focus:outline-none focus:border-wise-accent-green"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-white font-semibold">
                    By proceeding, you agree to our Terms of Service
                  </label>
                  <p className="text-sm text-wise-text-secondary">
                    You'll be taken to our secure payment processor to complete your purchase.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-wise-accent-green text-wise-bg-primary rounded-lg font-bold text-lg hover:brightness-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Continue to Payment'}
                </button>

                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full py-3 bg-wise-bg-secondary border-2 border-wise-accent-green/30 text-wise-accent-green rounded-lg font-semibold hover:border-wise-accent-green/60 transition-all"
                  disabled={loading}
                >
                  Back to Pricing
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div>
              <div className="sticky top-32 bg-wise-bg-secondary border-2 border-wise-accent-green/30 rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-white mb-8">Order Summary</h2>

                <div className="border-b border-wise-accent-green/20 pb-8 mb-8">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name} Plan</h3>
                  <p className="text-wise-text-secondary text-sm mb-4">{plan.description}</p>

                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-wise-text-secondary">Plan Price:</span>
                    {typeof plan.price === 'number' ? (
                      <span className="text-2xl font-bold text-wise-accent-green">
                        ${plan.price}
                        <span className="text-lg text-wise-text-secondary">/mo</span>
                      </span>
                    ) : (
                      <span className="text-2xl font-bold text-wise-accent-green">Custom</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex justify-between">
                    <span className="text-wise-text-secondary">Billing Cycle:</span>
                    <span className="text-white font-semibold">Monthly</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-wise-text-secondary">First Charge:</span>
                    <span className="text-white font-semibold">
                      {typeof plan.price === 'number' ? `$${plan.price}` : 'Contact us'}
                    </span>
                  </div>
                </div>

                <div className="bg-wise-accent-green/10 border border-wise-accent-green/30 rounded-lg p-4 text-sm text-wise-text-secondary">
                  ✓ 14-day free trial included
                  <br />✓ Cancel anytime
                  <br />✓ No hidden fees
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
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
