'use client'

import { motion } from 'framer-motion'

export default function BrandStory() {
  return (
    <section className="section-container bg-pp-dark border-y border-pp-gold/20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="hidden lg:block relative h-80"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pp-purple/30 to-pp-gold/20 rounded-2xl border border-pp-gold/30 flex items-center justify-center">
            <div className="text-center">
              <div className="text-7xl mb-4">🌿</div>
              <p className="text-pp-gold font-serif-header font-bold">Founded with Love</p>
            </div>
          </div>
        </motion.div>

        {/* Story */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div>
            <span className="text-pp-gold font-serif-header font-bold text-sm">OUR STORY</span>
            <h2 className="text-4xl md:text-5xl font-serif-header font-bold text-pp-cream mt-2">
              <span className="text-pp-gold">Founder, Herbalist, Dreamer, Healer</span>
            </h2>
          </div>

          <p className="text-pp-cream/80 font-serif-display leading-relaxed">
            Paige founded Petals & Potions with a simple mission: to help you remember that healing is personal, wellness is a ritual, and nature is our medicine.
          </p>

          <p className="text-pp-cream/80 font-serif-display leading-relaxed">
            Every blend is blended with intention. Every tea is crafted with care. Every ritual is an opportunity to come home to yourself.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <span className="text-2xl text-pp-gold">❤️</span>
              <div>
                <p className="font-serif-header font-bold text-pp-cream">Heart</p>
                <p className="text-pp-cream/60 font-serif-display text-sm">Love & Passion</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-2xl text-pp-gold">🧠</span>
              <div>
                <p className="font-serif-header font-bold text-pp-cream">Mind</p>
                <p className="text-pp-cream/60 font-serif-display text-sm">Clarity & Peace</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-2xl text-pp-gold">💪</span>
              <div>
                <p className="font-serif-header font-bold text-pp-cream">Body</p>
                <p className="text-pp-cream/60 font-serif-display text-sm">Nourish & Heal</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-2xl text-pp-gold">✨</span>
              <div>
                <p className="font-serif-header font-bold text-pp-cream">Soul</p>
                <p className="text-pp-cream/60 font-serif-display text-sm">Connect & Elevate</p>
              </div>
            </div>
          </div>

          <div className="bg-pp-purple/30 border border-pp-gold/30 rounded-xl p-4">
            <p className="text-pp-cream italic font-serif-display text-sm">
              "More than a brand. It's a movement back to self."
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
