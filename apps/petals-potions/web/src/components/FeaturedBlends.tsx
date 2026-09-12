'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const blends = [
  {
    id: 1,
    name: 'Calm & Restore',
    tagline: 'Relax • Unwind • Renew',
    description: 'A soothing blend to help you let go, relax, and rest deeply.',
    pillar: 'BODY',
    color: 'from-pp-purple to-pp-indigo',
    ingredients: ['Chamomile', 'Lavender', 'Passionflower', 'Lemon Balm', 'Rose Petals'],
  },
  {
    id: 2,
    name: 'Focus & Clarity',
    tagline: 'Think • Prepare • Succeed',
    description: 'Sharpen your mind and elevate your mental energy for the day ahead.',
    pillar: 'MIND',
    color: 'from-pp-green to-pp-gold',
    ingredients: ['Ginkgo Biloba', 'Gotu Kola', 'Peppermint', 'Rosemary', 'Ginger'],
  },
  {
    id: 3,
    name: 'Love & Heart',
    tagline: 'Feel • Connect • Heal',
    description: 'Open your heart and nurture deep emotional wellness and connection.',
    pillar: 'HEART',
    color: 'from-pp-gold to-pp-cream',
    ingredients: ['Rose Petals', 'Hibiscus', 'Hawthorn Berry', 'Damiana', 'Jasmine'],
  },
  {
    id: 4,
    name: 'Soul Connect',
    tagline: 'Elevate • Align • Transcend',
    description: 'A spiritual blend to connect you with your inner wisdom and purpose.',
    pillar: 'SOUL',
    color: 'from-pp-midnight to-pp-purple',
    ingredients: ['Mugwort', 'Chamomile', 'Lavender', 'Holy Basil', 'Calendula'],
  },
]

export default function FeaturedBlends() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  }

  return (
    <section className="section-container bg-pp-navy/30 border-y border-pp-gold/20">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <div className="inline-block mb-4">
          <span className="text-pp-gold font-serif-header font-bold">OUR BLENDS</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-serif-header font-bold text-pp-cream mb-4">
          <span className="text-pp-gold">Signature Collections</span>
        </h2>
        <p className="text-pp-cream/70 font-serif-display max-w-2xl mx-auto">
          Carefully crafted to support your Heart, Mind, Body & Soul journey.
        </p>
      </motion.div>

      {/* Four Pillars Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {blends.map((blend) => (
          <motion.div
            key={blend.id}
            variants={itemVariants}
            className="card-luxury group cursor-pointer"
          >
            {/* Pillar Badge */}
            <div className="inline-block mb-3">
              <span className="text-xs font-bold text-pp-gold font-serif-header tracking-widest">
                {blend.pillar}
              </span>
            </div>

            {/* Blend Name */}
            <h3 className="text-2xl font-serif-header font-bold text-pp-cream mb-2 group-hover:text-pp-gold transition-colors">
              {blend.name}
            </h3>

            {/* Tagline */}
            <p className="text-pp-gold font-serif-display text-sm mb-3 italic opacity-80">
              {blend.tagline}
            </p>

            {/* Description */}
            <p className="text-pp-cream/70 font-serif-display text-sm leading-relaxed mb-4">
              {blend.description}
            </p>

            {/* Ingredients */}
            <div className="mb-6">
              <p className="text-xs font-bold text-pp-gold/60 mb-2">INGREDIENTS</p>
              <div className="flex flex-wrap gap-2">
                {blend.ingredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className="text-xs bg-pp-purple/30 text-pp-cream/70 px-3 py-1 rounded-full border border-pp-gold/10"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Link
              href={`/products/${blend.id}`}
              className="inline-block text-pp-gold hover:text-pp-cream font-serif-display text-sm font-bold transition-colors"
            >
              Explore →
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* View All CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mt-12"
      >
        <Link href="/products" className="btn-secondary">
          View Full Collection
        </Link>
      </motion.div>
    </section>
  )
}
