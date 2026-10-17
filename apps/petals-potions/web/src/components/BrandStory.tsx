'use client'

import { motion } from 'framer-motion'

export default function BrandStory() {
  return (
    <section id="about" className="py-20 bg-white px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-6xl mb-8 text-center">🌿</div>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Petals & Potions began with a simple belief: wellness rituals deserve luxury and intention.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Each blend is carefully crafted from the finest organic botanicals, sourced ethically and processed with care. We believe in the transformative power of nature, and we're committed to bringing that power into your daily life.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 gap-6"
          >
            {[
              { number: '100%', label: 'Organic' },
              { number: '50+', label: 'Blends' },
              { number: '10K+', label: 'Happy Customers' },
              { number: '5', label: 'Star Rating' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-gradient-to-br from-purple/10 to-gold/10 p-8 rounded-lg text-center">
                <div className="text-3xl font-serif text-purple mb-2">{stat.number}</div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
