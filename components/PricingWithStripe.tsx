'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import StripeCheckoutButton from './StripeCheckoutButton';
import { getAllPricingPlans } from '@/lib/stripe';

/**
 * Pricing Section with Stripe Integration
 * Display pricing plans and handle checkout
 */
export function PricingWithStripe() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const plans = getAllPricingPlans();

  return (
    <section id="pricing" className="relative py-24 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-[#C5C5C5] max-w-2xl mx-auto">
            Choose the perfect plan for your needs. Scale as you grow.
          </p>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              className={`relative rounded-xl border transition-all duration-300 overflow-hidden ${
                plan.popular
                  ? 'border-[#0055FF] bg-gradient-to-br from-[#0055FF]/10 to-[#0055FF]/5 md:scale-105'
                  : 'border-[#0055FF]/20 bg-[#0055FF]/5 hover:border-[#0055FF]/50'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              onMouseEnter={() => setSelectedPlan(plan.id)}
              onMouseLeave={() => setSelectedPlan(null)}
            >
              <div className="p-8">
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="inline-block px-3 py-1 bg-[#0055FF] text-white text-xs font-bold rounded-full mb-4">
                    RECOMMENDED
                  </div>
                )}

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mb-6">
                  {plan.price ? (
                    <>
                      <div className="text-4xl font-black text-white mb-2">
                        ${plan.price}
                      </div>
                      <p className="text-[#C5C5C5]">
                        per month, billed monthly
                      </p>
                    </>
                  ) : (
                    <div className="text-3xl font-bold text-white mb-2">
                      Custom Pricing
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-[#C5C5C5] mb-8">
                  {plan.description}
                </p>

                {/* Checkout Button */}
                <div className="mb-8">
                  {plan.priceId ? (
                    <StripeCheckoutButton
                      priceId={plan.priceId}
                      planName={plan.name}
                      buttonText={
                        plan.price ? 'Subscribe Now' : 'Contact Sales'
                      }
                      className={`w-full py-3 rounded-lg font-bold transition-all duration-300 ${
                        plan.popular
                          ? 'bg-[#0055FF] hover:bg-[#2A7AFF] text-white'
                          : 'border border-[#0055FF]/30 text-white hover:border-[#0055FF]/60'
                      }`}
                      onError={(error) => {
                        console.error(`Checkout error for ${plan.name}:`, error);
                        alert(
                          `Checkout failed: ${error}. Please try again.`
                        );
                      }}
                    />
                  ) : (
                    <a
                      href="mailto:sales@wise2.net"
                      className={`block w-full py-3 rounded-lg font-bold text-center transition-all duration-300 ${
                        plan.popular
                          ? 'bg-[#0055FF] hover:bg-[#2A7AFF] text-white'
                          : 'border border-[#0055FF]/30 text-white hover:border-[#0055FF]/60'
                      }`}
                    >
                      Contact Sales
                    </a>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-white uppercase tracking-wider">
                    What's included
                  </p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{
                          opacity: 1,
                          x: selectedPlan === plan.id ? 5 : 0,
                        }}
                        transition={{ delay: featureIndex * 0.05 }}
                        viewport={{ once: true }}
                      >
                        <CheckCircle2 className="w-5 h-5 text-[#0055FF] flex-shrink-0 mt-0.5" />
                        <span className="text-[#C5C5C5] text-sm">
                          {feature}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p className="text-[#C5C5C5] mb-4">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <p className="text-sm text-[#C5C5C5]">
            Have questions?{' '}
            <a
              href="mailto:support@wise2.net"
              className="text-[#0055FF] hover:text-[#2A7AFF] font-semibold"
            >
              Contact our sales team
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default PricingWithStripe;
