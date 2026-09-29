'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { soundLabsAudiences } from '@/lib/sound-labs-data'

export function AudienceGrid() {
  return (
    <section className="py-20 md:py-32 px-6 md:px-8 bg-bg-secondary">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-chrome-light">
            Who We Serve
          </h2>
          <p className="text-chrome-dark text-lg max-w-2xl mx-auto">
            Whether you're a solo creator or a full-scale enterprise, WISE² Sound Labs creates music
            that works for your industry and your audience.
          </p>
        </motion.div>

        {/* Audience Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {soundLabsAudiences.map((audience, index) => (
            <motion.div
              key={audience.label}
              className="hud-panel-glass p-6 rounded-lg group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              whileHover={{ y: -4, borderColor: 'rgba(0, 148, 255, 0.6)' }}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0 group-hover:scale-125 transition-transform">
                  {audience.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-chrome-light text-lg mb-1">
                    {audience.label}
                  </h3>
                  <p className="text-sm text-chrome-dark">
                    {audience.description}
                  </p>
                </div>
              </div>

              {/* Hover Accent */}
              <motion.div
                className="mt-4 h-0.5 bg-blue-electric rounded opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </motion.div>
          ))}
        </div>

        {/* Call Out */}
        <motion.div
          className="mt-16 p-8 hud-panel-accent rounded-lg text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-chrome-light text-lg">
            <strong>Don't see your industry here?</strong> We work with anyone who needs professional
            music and audio content. Start your discovery call—we'll show you how custom audio can move your business forward.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
