'use client';

import React, { useState, useEffect } from 'react';
import { Navigation, Footer } from '@/components/wise';

interface Subscription {
  id: string;
  plan: 'STARTER' | 'PRO' | 'ENTERPRISE';
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  priceMonthly: number;
}

interface Invoice {
  id: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  date: string;
  pdfUrl: string;
}

const PLAN_FEATURES = {
  STARTER: { name: 'Starter', price: 26, workspaces: 1, users: 5 },
  PRO: { name: 'Professional', price: 87, workspaces: 5, users: 'Unlimited' },
  ENTERPRISE: { name: 'Enterprise', price: 'Custom', workspaces: 'Unlimited', users: 'Unlimited' },
};

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    // Fetch subscription data
    const mockSubscription: Subscription = {
      id: 'sub_12345',
      plan: 'PRO',
      status: 'active',
      currentPeriodStart: '2024-06-22',
      currentPeriodEnd: '2024-07-22',
      cancelAtPeriodEnd: false,
      priceMonthly: 87,
    };

    const mockInvoices: Invoice[] = [
      {
        id: 'inv_1',
        amount: 87,
        status: 'paid',
        date: '2024-06-22',
        pdfUrl: '#',
      },
      {
        id: 'inv_2',
        amount: 87,
        status: 'paid',
        date: '2024-05-22',
        pdfUrl: '#',
      },
    ];

    setSubscription(mockSubscription);
    setInvoices(mockInvoices);
    setLoading(false);
  }, []);

  const handleUpgrade = (newPlan: string) => {
    console.log('Upgrading to:', newPlan);
    setShowUpgradeModal(false);
  };

  const handleCancel = () => {
    console.log('Canceling subscription');
    setShowCancelModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <Navigation />
        <div className="pt-32 pb-20 px-6 flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <Navigation />
        <div className="pt-32 pb-20 px-6 flex items-center justify-center">
          <div className="text-gray-400">No subscription found</div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentPlanInfo = PLAN_FEATURES[subscription.plan];
  const daysRemaining = Math.ceil(
    (new Date(subscription.currentPeriodEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navigation />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-12">Subscription & Billing</h1>

          {/* Current Plan */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Plan Card */}
            <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">Current Plan</h2>

              <div className="mb-8">
                <div className="text-3xl font-bold text-emerald-400 mb-2">
                  {currentPlanInfo.name}
                </div>
                <div className="text-gray-400 mb-4">
                  ${subscription.priceMonthly}/month
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <span className="text-sm capitalize">
                    {subscription.status === 'trialing' ? 'Free Trial' : subscription.status === 'active' ? 'Active' : subscription.status}
                  </span>
                </div>

                <div className="space-y-3 text-sm text-gray-400 mb-8">
                  <div className="flex justify-between">
                    <span>Workspaces:</span>
                    <span className="text-white">{currentPlanInfo.workspaces}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Users:</span>
                    <span className="text-white">{currentPlanInfo.users}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Renewal Date:</span>
                    <span className="text-white">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Days Remaining:</span>
                    <span className="text-white">{daysRemaining} days</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="w-full px-4 py-3 bg-emerald-500 rounded-lg font-semibold hover:bg-emerald-600 transition"
                  >
                    Upgrade Plan
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full px-4 py-3 bg-[#161616] rounded-lg font-semibold hover:bg-[#1a1a1a] transition text-red-400"
                  >
                    Cancel Subscription
                  </button>
                </div>
              </div>
            </div>

            {/* Billing Info */}
            <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">Billing Information</h2>

              <div className="space-y-6">
                <div>
                  <label className="text-sm text-gray-400">Payment Method</label>
                  <div className="text-white font-semibold">Visa ending in 4242</div>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Billing Email</label>
                  <div className="text-white font-semibold">billing@example.com</div>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Billing Address</label>
                  <div className="text-white font-semibold">123 Main St, New York, NY 10001</div>
                </div>

                <button className="w-full px-4 py-3 bg-[#161616] rounded-lg font-semibold hover:bg-[#1a1a1a] transition">
                  Update Billing Info
                </button>
              </div>
            </div>
          </div>

          {/* Invoices */}
          <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Billing History</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    <th className="text-left py-4 px-4 font-semibold text-gray-400">Date</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-400">Amount</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-400">Status</th>
                    <th className="text-right py-4 px-4 font-semibold text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-[#0f0f0f] hover:bg-[#0a0a0a]">
                      <td className="py-4 px-4">{new Date(invoice.date).toLocaleDateString()}</td>
                      <td className="py-4 px-4">${invoice.amount.toFixed(2)}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          invoice.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold">
                          Download PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Upgrade Your Plan</h3>

            <div className="space-y-4 mb-8">
              {['STARTER', 'PRO', 'ENTERPRISE'].map((plan) => (
                plan !== subscription.plan && (
                  <button
                    key={plan}
                    onClick={() => handleUpgrade(plan)}
                    className="w-full p-4 bg-[#050505] hover:bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-left transition"
                  >
                    <div className="font-semibold">
                      {PLAN_FEATURES[plan as keyof typeof PLAN_FEATURES].name}
                    </div>
                    <div className="text-sm text-gray-400">
                      ${PLAN_FEATURES[plan as keyof typeof PLAN_FEATURES].price}/month
                    </div>
                  </button>
                )
              ))}
            </div>

            <button
              onClick={() => setShowUpgradeModal(false)}
              className="w-full px-4 py-3 bg-[#161616] rounded-lg font-semibold hover:bg-[#1a1a1a] transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-2 text-red-400">Cancel Subscription?</h3>
            <p className="text-gray-400 mb-8">
              You'll lose access to all features at the end of your billing period.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleCancel}
                className="w-full px-4 py-3 bg-red-500 rounded-lg font-semibold hover:bg-red-600 transition"
              >
                Cancel Subscription
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-full px-4 py-3 bg-[#161616] rounded-lg font-semibold hover:bg-[#1a1a1a] transition"
              >
                Keep Subscription
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
