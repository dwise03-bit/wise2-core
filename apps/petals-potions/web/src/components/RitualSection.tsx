'use client'

import { motion } from 'framer-motion'

export default function RitualSection() {
  return (
    <section id="rituals" className="py-20 bg-gradient-to-br from-purple/5 to-gold/5 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-5xl font-serif text-purple mb-4">
            Find Your Ritual
          </h2>
          <div className="divider-gold" />
          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            Every blend is designed to support your unique wellness journey. Take our personalized ritual quiz to discover which blend is perfect for you.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary text-lg px-8 py-4"
          >
            Start Your Ritual Quiz
          </motion.button>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {[
            { icon: '🌅', title: 'Morning', desc: 'Energize your day' },
            { icon: '☀️', title: 'Afternoon', desc: 'Sustain your focus' },
            { icon: '🌙', title: 'Evening', desc: 'Unwind and relax' },
          ].map((ritual, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="text-center p-8 bg-white rounded-lg"
            >
              <div className="text-5xl mb-4">{ritual.icon}</div>
              <h3 className="text-2xl font-serif text-purple mb-2">{ritual.title}</h3>
              <p className="text-gray-600">{ritual.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
