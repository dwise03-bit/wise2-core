'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

export default function SubscriptionCTA() {
  const [email, setEmail] = useState('')

  return (
    <section className="py-20 bg-gradient-to-r from-purple to-purple/90 text-white px-4">
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-serif mb-4"
        >
          Join Our Wellness Circle
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl mb-8 opacity-90"
        >
          Get exclusive blends, rituals, and wellness tips delivered to your inbox.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto"
        >
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-6 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <button className="bg-gold text-purple font-semibold px-8 py-3 rounded-lg hover:bg-gold/90 transition whitespace-nowrap">
            Subscribe
          </button>
        </motion.div>

        <p className="text-sm mt-4 opacity-75">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  )
}
