'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

const PLANS = [
  { id: 'starter', name: 'Starter', price: 29, features: ['Up to 5 projects', 'Basic support', 'Community access'] },
  { id: 'pro', name: 'Pro', price: 99, features: ['Unlimited projects', 'Priority support', 'Advanced analytics', 'API access'] },
  { id: 'enterprise', name: 'Enterprise', price: 299, features: ['Everything in Pro', 'Dedicated support', 'Custom integrations', 'SLA guarantee'] },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [loading, setLoading] = useState(false);

  const plan = PLANS.find(p => p.id === selectedPlan)!;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/v1/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ planId: selectedPlan }),
      });

      const data = await res.json();
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        alert('Payment processing...');
        router.push('/dashboard');
      }
    } catch (err) {
      alert('Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/dashboard" className="text-cyan-500 hover:text-cyan-400 text-sm mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-black">Choose Your Plan</h1>
          <p className="text-gray-400 mt-2">Start free, upgrade anytime</p>
        </div>
      </div>

      {/* Pricing */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-3 gap-6">
          {PLANS.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPlan(p.id)}
              className={`p-6 rounded-lg border-2 cursor-pointer transition ${
                selectedPlan === p.id
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-600'
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">{p.name}</h3>
              <div className="text-4xl font-black mb-4">
                ${p.price}
                <span className="text-sm text-gray-400">/month</span>
              </div>
              <ul className="space-y-2 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="text-sm text-gray-300 flex items-center">
                    <span className="text-cyan-500 mr-2">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-2 rounded font-semibold transition ${
                  selectedPlan === p.id
                    ? 'bg-cyan-500 text-black hover:bg-cyan-400'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                {selectedPlan === p.id ? 'Selected' : 'Select'}
              </button>
            </div>
          ))}
        </div>

        {/* Checkout */}
        <div className="mt-12 max-w-md mx-auto p-6 bg-gray-900 border border-gray-700 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Order Summary</h3>
          <div className="space-y-2 mb-6 pb-6 border-b border-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-400">{plan.name} Plan</span>
              <span className="font-semibold">${plan.price}/mo</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Billing: Monthly</span>
              <span>Auto-renews</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Pay $${plan.price}/month`}
          </button>

          <p className="text-xs text-gray-500 mt-4 text-center">
            No credit card required for 14-day trial. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
