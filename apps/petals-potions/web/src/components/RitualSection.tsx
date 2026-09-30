'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function RitualSection() {
  return (
    <section className="section-container bg-gradient-to-b from-pp-dark to-pp-navy">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left - Ritual Quiz CTA */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div>
            <span className="text-pp-gold font-serif-header font-bold text-sm">THE RITUAL</span>
            <h2 className="text-4xl md:text-5xl font-serif-header font-bold text-pp-cream mt-2">
              Discover Your <span className="text-pp-gold">Perfect Blend</span>
            </h2>
          </div>

          <p className="text-pp-cream/70 font-serif-display text-lg leading-relaxed">
            Our ritual quiz uses your preferences, wellness goals, and energy to recommend the perfect custom tea blend designed uniquely for you.
          </p>

          <ul className="space-y-3">
            {[
              'Personalized wellness profile',
              'Custom blend recommendations',
              'Monthly ritual guidance',
              'Community access',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-pp-gold mt-1">✓</span>
                <span className="text-pp-cream/80 font-serif-display">{item}</span>
              </li>
            ))}
          </ul>

          <Link href="/ritual-quiz" className="btn-primary inline-block">
            Start the Ritual Quiz
          </Link>
        </motion.div>

        {/* Right - Visual */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="hidden lg:block relative h-96"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pp-purple/20 to-pp-green/20 rounded-2xl border border-pp-gold/30 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🌸</div>
              <p className="text-pp-gold font-serif-header font-bold mb-2">RITUAL QUIZ</p>
              <p className="text-pp-cream/60 font-serif-display text-sm">
                5 minutes to your <br /> perfect blend
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
