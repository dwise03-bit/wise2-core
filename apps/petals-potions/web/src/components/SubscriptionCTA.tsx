'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const plans = [
  {
    name: '2 Blends',
    price: '$65',
    blends: '2 Custom Tea Blends',
    features: ['Monthly curation', 'Ritual access', 'Exclusive recipes'],
  },
  {
    name: '3 Blends',
    price: '$80',
    blends: '3 Custom Tea Blends',
    features: ['Monthly curation', 'Ritual access', 'Priority support', 'Exclusive recipes'],
    featured: true,
  },
  {
    name: '4 Blends',
    price: '$98',
    blends: '4 Custom Tea Blends',
    features: ['Monthly curation', 'Ritual access', 'Priority support', 'Early access to new blends'],
  },
]

export default function SubscriptionCTA() {
  return (
    <section className="section-container bg-pp-midnight">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-serif-header font-bold text-pp-cream mb-4">
          <span className="text-pp-gold">Monthly Ritual Box</span>
        </h2>
        <p className="text-pp-cream/70 font-serif-display max-w-2xl mx-auto">
          Receive curated blends monthly. Customize your ritual. Support your wellness journey.
        </p>
      </motion.div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`card-luxury relative ${plan.featured ? 'md:scale-105 border-pp-gold/60' : ''}`}
          >
            {plan.featured && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-pp-gold text-pp-purple px-4 py-1 rounded-full text-xs font-bold">
                Most Popular
              </div>
            )}

            <h3 className="text-2xl font-serif-header font-bold text-pp-cream mb-2">{plan.name}</h3>
            <p className="text-pp-gold font-serif-header font-bold text-3xl mb-2">{plan.price}</p>
            <p className="text-pp-cream/70 font-serif-display text-sm mb-6">{plan.blends}</p>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <span className="text-pp-gold">✓</span>
                  <span className="text-pp-cream/80 font-serif-display text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/subscription"
              className={plan.featured ? 'btn-primary block text-center' : 'btn-secondary block text-center'}
            >
              Choose Plan
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mt-12"
      >
        <p className="text-pp-cream/60 font-serif-display text-sm mb-4">
          + Tax & Shipping • Cancel anytime
        </p>
      </motion.div>
    </section>
  )
}
