'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { useSubscription } from '@/lib/podcast/hooks';
import { PodcastLayout } from '../components/PodcastLayout';

export default function PodcastCheckoutPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { plans, currentPlan, isLoading, createCheckout } = useSubscription();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/podcast/auth/login');
    }
  }, [user, authLoading, router]);

  const handleSelectPlan = async (planId: string) => {
    try {
      const checkoutUrl = await createCheckout(planId);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  if (authLoading || isLoading) {
    return (
      <PodcastLayout currentTab="billing">
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
          />
        </div>
      </PodcastLayout>
    );
  }

  return (
    <PodcastLayout currentTab="billing">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Choose the perfect plan for your podcast. Upgrade or downgrade anytime.
        </p>
      </motion.div>

      {/* Current Plan Badge */}
      {currentPlan && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-8 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 inline-block w-full"
        >
          <p className="text-sm font-medium">
            Current Plan: <span className="font-bold">{plans.find((p) => p.id === currentPlan.planId)?.name || currentPlan.planId}</span>
            {' '}(expires {new Date(currentPlan.expiresAt).toLocaleDateString()})
          </p>
        </motion.div>
      )}

      {/* Pricing Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
      >
        {plans.map((plan, index) => {
          const isCurrentPlan = currentPlan?.planId === plan.id;
          const isPopular = index === 1;

          return (
            <motion.div
              key={plan.id}
              whileHover={{ scale: 1.05 }}
              className={`relative rounded-2xl p-8 transition-all ${
                isPopular
                  ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-400 shadow-2xl shadow-purple-500/50'
                  : 'bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 hover:border-purple-500/60'
              }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white text-xs font-bold shadow-lg">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-400">/month</span>
                </div>
              </div>

              {/* Generations */}
              <div className="mb-6 pb-6 border-b border-purple-500/20">
                <p className="text-2xl font-bold text-purple-300 mb-1">
                  {plan.generationsPerMonth}
                </p>
                <p className="text-sm text-gray-400">generations per month</p>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-green-400 text-lg mt-0.5">✓</span>
                    <p className="text-sm text-gray-300">{feature}</p>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <motion.button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={isCurrentPlan}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 font-bold rounded-lg transition-all ${
                  isCurrentPlan
                    ? 'bg-gray-500/30 text-gray-300 cursor-default'
                    : isPopular
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg shadow-purple-500/50'
                      : 'border-2 border-purple-500/30 hover:border-purple-500/60 text-purple-300 hover:text-purple-200'
                }`}
              >
                {isCurrentPlan ? '✓ Current Plan' : 'Select Plan'}
              </motion.button>
            </motion.div>
          );
        })}
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-3xl mx-auto"
      >
        <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>

        <div className="space-y-4">
          {[
            {
              q: 'Can I change my plan anytime?',
              a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.',
            },
            {
              q: 'What happens to unused generations?',
              a: 'Unused generations do not roll over to the next month. However, you can purchase additional generations anytime.',
            },
            {
              q: 'Do you offer discounts for annual billing?',
              a: 'Yes! Annual subscriptions include a 20% discount compared to monthly billing.',
            },
            {
              q: 'Is there a free trial?',
              a: 'All new users get 5 free generations to try out the platform. No credit card required.',
            },
            {
              q: 'What payment methods do you accept?',
              a: 'We accept all major credit cards, PayPal, and bank transfers for enterprise plans.',
            },
            {
              q: 'Can I get a refund?',
              a: 'We offer 7-day money-back guarantees on annual subscriptions. Monthly subscriptions are non-refundable.',
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="p-6 rounded-xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/20 hover:border-purple-500/40 transition-all group"
            >
              <h3 className="font-bold text-lg mb-2 group-hover:text-purple-300 transition-colors">
                {item.q}
              </h3>
              <p className="text-gray-400 text-sm">{item.a}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-16 p-12 rounded-3xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-2 border-purple-500/30 text-center"
      >
        <h2 className="text-3xl font-bold mb-4">Questions about pricing?</h2>
        <p className="text-gray-400 mb-8">
          Our support team is happy to help. Contact us anytime for personalized assistance.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:support@podcast-music.local"
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-lg transition-all shadow-lg"
          >
            Contact Support
          </a>
          <a
            href="/podcast/dashboard"
            className="px-8 py-3 border-2 border-purple-500/30 hover:border-purple-500/60 text-purple-300 font-bold rounded-lg transition-all"
          >
            Back to Dashboard
          </a>
        </div>
      </motion.div>
    </PodcastLayout>
  );
}
