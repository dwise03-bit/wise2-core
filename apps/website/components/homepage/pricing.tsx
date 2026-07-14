'use client';

import React from 'react';
import { AnimatedCard } from './animated-card';
import { AnimatedSection } from './animated-section';

export function PricingSection() {
  const plans = [
    {
      name: 'STARTER',
      price: '$29',
      popular: false,
      features: ['AI Assistant', 'Basic Automations', 'Dashboard Access', 'Community Support'],
    },
    {
      name: 'PROFESSIONAL',
      price: '$99',
      popular: true,
      tag: 'MOST POPULAR',
      features: ['Everything in Starter', 'SoundLab Access', 'Live Studio Suite', 'Advanced AI Models', 'Priority Support'],
    },
    {
      name: 'ENTERPRISE',
      price: 'Custom',
      popular: false,
      features: ['Everything in Professional', 'Unlimited AI & Automations', 'White Label Options', 'API Access', 'Dedicated Support'],
    },
  ];

  return (
    <section id="pricing" className="py-20 px-6 bg-gradient-to-b from-black via-blue-950/20 to-black">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-black text-center mb-4 text-white">SIMPLE PRICING, POWERFUL OPTIONS.</h2>
        <p className="text-center text-gray-400 mb-12">Choose the plan that's right for you</p>

        <AnimatedSection className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto" staggerChildren={false}>
          {plans.map((plan, i) => (
            <AnimatedCard key={i} delay={i * 0.2}>
              <div className={`relative ${plan.popular ? 'lg:scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                    {plan.tag}
                  </div>
                )}
                <div
                  className={`h-full bg-gradient-to-br border rounded-lg p-8 backdrop-blur transition ${
                    plan.popular
                      ? 'from-blue-600 to-cyan-600 border-cyan-400 shadow-2xl'
                      : 'from-blue-950/40 to-cyan-950/40 border-cyan-500/20 hover:border-cyan-500/50'
                  }`}
                >
                  <h3 className="text-xl font-bold mb-2 text-white">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    {plan.price !== 'Custom' && <span className="text-gray-400 ml-2">/month</span>}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="text-cyan-400">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full py-3 font-bold rounded transition ${
                      plan.popular
                        ? 'bg-black hover:bg-gray-900 text-white'
                        : 'border border-cyan-500/50 hover:bg-cyan-500/10 text-white'
                    }`}
                  >
                    {plan.price === 'Custom' ? 'CONTACT SALES' : 'START FREE'}
                  </button>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </AnimatedSection>
      </div>
    </section>
  );
}
