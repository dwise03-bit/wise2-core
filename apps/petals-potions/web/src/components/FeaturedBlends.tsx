'use client'

import { motion } from 'framer-motion'

const blends = [
  {
    id: 1,
    name: 'Sleep Serum',
    description: 'Lavender, chamomile, and passionflower blend for restful nights.',
    price: '$48',
    image: '🌙',
  },
  {
    id: 2,
    name: 'Focus Flow',
    description: 'Ginkgo, brahmi, and peppermint for mental clarity and concentration.',
    price: '$52',
    image: '🧠',
  },
  {
    id: 3,
    name: 'Calm Mind',
    description: 'Ashwagandha, rhodiola, and lemon balm for inner peace.',
    price: '$55',
    image: '☮️',
  },
]

export default function FeaturedBlends() {
  return (
    <section id="products" className="py-20 bg-white px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-serif text-center text-purple mb-4"
        >
          Featured Blends
        </motion.h2>

        <div className="divider-gold" />

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {blends.map((blend, idx) => (
            <motion.div
              key={blend.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="card-luxury text-center hover:shadow-2xl"
            >
              <div className="text-6xl mb-4">{blend.image}</div>
              <h3 className="text-2xl font-serif text-purple mb-2">{blend.name}</h3>
              <p className="text-gray-600 mb-4 h-12 flex items-center justify-center">
                {blend.description}
              </p>
              <div className="text-3xl font-serif text-gold mb-6">{blend.price}</div>
              <button className="btn-primary w-full">Add to Cart</button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <button className="btn-secondary text-lg px-8 py-4">
            View All Products
          </button>
        </motion.div>
      </div>
    </section>
  )
}
