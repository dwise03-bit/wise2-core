'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Shield, Zap, Rocket } from 'lucide-react'

const outcomes = [
  {
    icon: Heart,
    title: 'Be Remembered',
    description: 'Music that sticks in minds and creates emotional connection with your audience',
    color: 'from-red-500/20 to-transparent',
    accent: '#EF4444',
  },
  {
    icon: Shield,
    title: 'Sound Professional',
    description: 'High-quality production that elevates your brand above the competition',
    color: 'from-blue-500/20 to-transparent',
    accent: '#0094FF',
  },
  {
    icon: Zap,
    title: 'Own Your Campaign',
    description: 'Licensed music that\'s uniquely yours—no generic royalty-free tracks',
    color: 'from-yellow-500/20 to-transparent',
    accent: '#FBBF24',
  },
  {
    icon: Rocket,
    title: 'Launch Everywhere',
    description: 'Audio and video content ready for social media, ads, streaming, and broadcast',
    color: 'from-green-500/20 to-transparent',
    accent: '#10B981',
  },
]

export function OutcomeGrid() {
  return (
    <section className="py-20 md:py-32 px-6 md:px-8 bg-gradient-to-b from-transparent via-blue-electric/5 to-transparent">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-chrome-light">
            What WISE² Sound Labs Delivers
          </h2>
          <p className="text-lg text-chrome-dark max-w-3xl mx-auto leading-relaxed">
            Custom music and visual content that turns your story into something your audience can't forget.
            We take the complexity out of audio production—you focus on your business, we handle the sound.
          </p>
        </motion.div>

        {/* Outcome Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {outcomes.map((outcome, index) => {
            const IconComponent = outcome.icon
            return (
              <motion.div
                key={outcome.title}
                className="hud-panel-glass p-8 rounded-lg group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -8, borderColor: 'rgba(0, 148, 255, 0.6)' }}
              >
                <div className="flex gap-6">
                  <motion.div
                    className="flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center border border-blue-electric/30"
                    style={{
                      background: `linear-gradient(135deg, ${outcome.color})`,
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <IconComponent size={28} style={{ color: outcome.accent }} />
                  </motion.div>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-chrome-light mb-2">
                      {outcome.title}
                    </h3>
                    <p className="text-chrome-dark leading-relaxed">
                      {outcome.description}
                    </p>
                  </div>
                </div>

                {/* Accent Line */}
                <motion.div
                  className="mt-6 h-1 rounded"
                  style={{ background: outcome.accent, opacity: 0.4 }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                />
              </motion.div>
            )
          })}
        </div>

        {/* Promise Statement */}
        <motion.div
          className="mt-16 p-8 rounded border-2 border-blue-electric/30 bg-blue-electric/5 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-chrome-light font-light text-lg leading-relaxed max-w-2xl mx-auto">
            We don't just produce music. We craft <strong>audio experiences</strong> that serve your specific goals—
            whether that's selling a product, building a community, or establishing authority in your field.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
