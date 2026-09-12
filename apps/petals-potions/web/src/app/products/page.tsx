'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const allProducts = [
  {
    id: 1,
    name: 'Calm & Restore',
    pillar: 'BODY',
    price: '$24',
    description: 'Relax • Unwind • Renew',
    ingredients: 5,
  },
  {
    id: 2,
    name: 'Focus & Clarity',
    pillar: 'MIND',
    price: '$24',
    description: 'Think • Prepare • Succeed',
    ingredients: 5,
  },
  {
    id: 3,
    name: 'Love & Heart',
    pillar: 'HEART',
    price: '$24',
    description: 'Feel • Connect • Heal',
    ingredients: 5,
  },
  {
    id: 4,
    name: 'Soul Connect',
    pillar: 'SOUL',
    price: '$24',
    description: 'Elevate • Align • Transcend',
    ingredients: 5,
  },
  {
    id: 5,
    name: 'Energy & Focus',
    pillar: 'MIND',
    price: '$26',
    description: 'Activate • Energize • Perform',
    ingredients: 6,
  },
  {
    id: 6,
    name: 'Deep Sleep',
    pillar: 'BODY',
    price: '$24',
    description: 'Drift • Restore • Renew',
    ingredients: 5,
  },
]

export default function ProductsPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    <div className="section-container">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl md:text-6xl font-serif-header font-bold text-pp-cream mb-4">
          <span className="text-pp-gold">Our Collection</span>
        </h1>
        <p className="text-pp-cream/70 font-serif-display max-w-2xl mx-auto">
          Carefully crafted blends for every pillar of your wellness journey.
        </p>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center gap-4 mb-12 flex-wrap"
      >
        {['All', 'Heart', 'Mind', 'Body', 'Soul'].map((filter) => (
          <button
            key={filter}
            className="px-6 py-2 rounded-full border border-pp-gold/30 text-pp-cream hover:bg-pp-gold/10 hover:border-pp-gold/60 transition-all duration-300 font-serif-display text-sm"
          >
            {filter}
          </button>
        ))}
      </motion.div>

      {/* Products Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {allProducts.map((product) => (
          <motion.div
            key={product.id}
            variants={itemVariants}
            className="card-luxury group"
          >
            {/* Product Badge */}
            <div className="mb-4">
              <span className="text-xs font-bold text-pp-gold font-serif-header tracking-widest">
                {product.pillar}
              </span>
            </div>

            {/* Product Image Placeholder */}
            <div className="w-full h-64 bg-gradient-to-br from-pp-purple/30 to-pp-gold/10 rounded-xl mb-6 flex items-center justify-center border border-pp-gold/20">
              <svg className="w-20 h-20 text-pp-gold/40" fill="currentColor" viewBox="0 0 100 140">
                <path d="M40 20h20v10H40z" opacity="0.6" />
                <path d="M35 30h30v80c0 10-6 18-15 18s-15-8-15-18V30z" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Product Details */}
            <h3 className="text-xl font-serif-header font-bold text-pp-cream mb-2 group-hover:text-pp-gold transition-colors">
              {product.name}
            </h3>

            <p className="text-pp-gold font-serif-display text-sm italic mb-3">
              {product.description}
            </p>

            {/* Price */}
            <p className="text-2xl font-serif-header font-bold text-pp-cream mb-4">
              {product.price}
            </p>

            {/* Ingredients Count */}
            <p className="text-xs text-pp-cream/60 mb-6">
              {product.ingredients} Carefully Selected Ingredients
            </p>

            {/* CTA */}
            <Link
              href={`/products/${product.id}`}
              className="inline-block text-pp-gold hover:text-pp-cream font-serif-display font-bold transition-colors"
            >
              Learn More →
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-16 text-center"
      >
        <p className="text-pp-cream/70 font-serif-display mb-6">
          Can't decide? Let our ritual quiz guide you.
        </p>
        <Link href="/ritual-quiz" className="btn-primary">
          Start Ritual Quiz
        </Link>
      </motion.div>
    </div>
  )
}
