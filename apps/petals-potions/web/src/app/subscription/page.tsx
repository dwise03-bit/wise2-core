'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'

const plans = [
  {
    id: 'plan_2blends',
    name: '2 Blends',
    price: '$65',
    blends: '2 Custom Tea Blends',
    description: 'Perfect for starting your ritual practice',
    features: [
      'Monthly curation based on your preferences',
      'Ritual access & community',
      'Exclusive recipes & wellness guides',
      'Flexible customization',
      'Free shipping included',
    ],
  },
  {
    id: 'plan_3blends',
    name: '3 Blends',
    price: '$80',
    blends: '3 Custom Tea Blends',
    description: 'Our most popular choice',
    features: [
      'Monthly curation based on your preferences',
      'Ritual access & community',
      'Priority customer support',
      'Exclusive recipes & wellness guides',
      'Flexible customization',
      'Free shipping included',
    ],
    featured: true,
  },
  {
    id: 'plan_4blends',
    name: '4 Blends',
    price: '$98',
    blends: '4 Custom Tea Blends',
    description: 'The ultimate ritual experience',
    features: [
      'Monthly curation based on your preferences',
      'Ritual access & community',
      'Priority customer support',
      'Early access to new blends',
      'Exclusive recipes & wellness guides',
      'Flexible customization',
      'Free shipping included',
    ],
  },
]

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState('plan_3blends')

  return (
    <div className="section-container">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl md:text-6xl font-serif-header font-bold text-pp-cream mb-4">
          <span className="text-pp-gold">Monthly Ritual Box</span>
        </h1>
        <p className="text-pp-cream/70 font-serif-display max-w-2xl mx-auto text-lg">
          Receive personalized tea blends each month. Cancel anytime. No commitment needed.
        </p>
      </motion.div>

      {/* Benefits */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16"
      >
        {[
          { icon: '🌿', title: 'Plant Powered', desc: '100% organic ingredients' },
          { icon: '🎁', title: 'Personalized', desc: 'Curated just for you' },
          { icon: '📦', title: 'Delivered', desc: 'Free shipping every month' },
          { icon: '🔄', title: 'Flexible', desc: 'Pause or cancel anytime' },
        ].map((benefit) => (
          <div key={benefit.title} className="text-center">
            <div className="text-4xl mb-3">{benefit.icon}</div>
            <p className="text-pp-cream font-serif-header font-bold mb-1">{benefit.title}</p>
            <p className="text-pp-cream/60 font-serif-display text-sm">{benefit.desc}</p>
          </div>
        ))}
      </motion.div>

      {/* Pricing Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12"
      >
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ scale: 1.02 }}
            className={`card-luxury relative cursor-pointer transition-all duration-300 ${
              selectedPlan === plan.id ? 'border-pp-gold/80' : ''
            } ${plan.featured ? 'md:scale-105' : ''}`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.featured && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-pp-gold text-pp-purple px-4 py-1 rounded-full text-xs font-bold z-10">
                Most Popular
              </div>
            )}

            <h3 className="text-2xl font-serif-header font-bold text-pp-cream mb-2">
              {plan.name}
            </h3>
            <p className="text-pp-gold font-serif-header font-bold text-3xl mb-1">
              {plan.price}
            </p>
            <p className="text-pp-cream/70 font-serif-display text-sm mb-4">per month</p>

            <div className="bg-pp-purple/20 border border-pp-gold/30 rounded-lg p-3 mb-6">
              <p className="text-pp-cream font-serif-display text-sm">{plan.blends}</p>
              <p className="text-pp-cream/60 font-serif-display text-xs">
                {plan.description}
              </p>
            </div>

            <ul className="space-y-2 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span className="text-pp-gold flex-shrink-0 mt-1">✓</span>
                  <span className="text-pp-cream/80 font-serif-display text-sm">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href={`/checkout?plan=${plan.id}`}
              className={selectedPlan === plan.id ? 'btn-primary block text-center' : 'btn-secondary block text-center'}
            >
              Select Plan
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-2xl mx-auto"
      >
        <h2 className="text-3xl font-serif-header font-bold text-pp-cream text-center mb-8">
          Common Questions
        </h2>

        <div className="space-y-4">
          {[
            {
              q: 'Can I customize my blends?',
              a: 'Absolutely. Your ritual quiz guides our curation, and you can request specific adjustments each month.',
            },
            {
              q: 'What if I need to pause?',
              a: 'You can pause your subscription anytime in your account. Restart whenever you\'re ready.',
            },
            {
              q: 'How does the monthly delivery work?',
              a: 'Your box ships on your chosen date each month with carefully selected blends, recipes, and wellness guidance.',
            },
            {
              q: 'Is there a commitment?',
              a: 'No. Cancel anytime with no penalties. Your wellness journey is always on your terms.',
            },
          ].map((item, idx) => (
            <div key={idx} className="card-luxury p-6">
              <h3 className="font-serif-header font-bold text-pp-cream mb-3">
                {item.q}
              </h3>
              <p className="text-pp-cream/70 font-serif-display text-sm">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Final CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-16"
      >
        <p className="text-pp-cream/60 font-serif-display text-sm mb-6">
          Not sure which plan is right for you?
        </p>
        <Link href="/ritual-quiz" className="btn-secondary">
          Take the Ritual Quiz First
        </Link>
      </motion.div>
    </div>
  )
}
