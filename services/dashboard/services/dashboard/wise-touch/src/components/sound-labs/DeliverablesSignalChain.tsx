'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { soundLabsDeliverables } from '@/lib/sound-labs-data'

export function DeliverablesSignalChain() {
  return (
    <section className="py-20 md:py-32 px-6 md:px-8">
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
            What You Receive
          </h2>
          <p className="text-chrome-dark text-lg max-w-2xl mx-auto">
            Beyond the song—we deliver a complete content toolkit ready to launch your campaign.
          </p>
        </motion.div>

        {/* Deliverables Signal Chain */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {soundLabsDeliverables.map((item, index) => (
              <motion.div
                key={item.title}
                className="hud-panel-glass p-6 rounded-lg text-center group"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                whileHover={{ y: -4 }}
              >
                <p className="text-4xl mb-3 group-hover:scale-125 transition-transform">
                  {item.icon}
                </p>
                <h3 className="font-bold text-chrome-light text-sm mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-chrome-dark">
                  {item.description}
                </p>

                {/* Connection Line */}
                {index < soundLabsDeliverables.length - 1 && (
                  <svg
                    className="absolute -right-2 top-1/2 w-4 h-0.5 hidden md:block transform -translate-y-1/2"
                    viewBox="0 0 20 2"
                    preserveAspectRatio="none"
                  >
                    <motion.line
                      x1="0"
                      y1="1"
                      x2="20"
                      y2="1"
                      stroke="#0094FF"
                      strokeWidth="1"
                      opacity="0.3"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    />
                  </svg>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Scope Clarity */}
        <motion.div
          className="p-8 hud-panel-accent rounded-lg space-y-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-2xl font-bold text-chrome-light">
            What's Included vs. Customizable
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-bold text-green-400 mb-3 uppercase tracking-wider">
                ✓ Always Included
              </p>
              <ul className="space-y-2 text-sm text-chrome-light">
                <li>✓ Original composition (no pre-made templates)</li>
                <li>✓ Professional mixing and mastering</li>
                <li>✓ Commercial-use license</li>
                <li>✓ Multiple delivery formats (MP3, WAV, stems)</li>
                <li>✓ One round of concept feedback</li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-bold text-blue-electric mb-3 uppercase tracking-wider">
                ⚙ Scope Per Package
              </p>
              <ul className="space-y-2 text-sm text-chrome-dark">
                <li>→ Song length (Starter: 30–60s, Business: 2–3m, Premium: custom)</li>
                <li>→ Video content (video creation is Premium+)</li>
                <li>→ Revision rounds (2–3 standard, unlimited for Premium)</li>
                <li>→ Turnaround time (5–21 days depending on package)</li>
                <li>→ Exclusive licensing (available as add-on or in Premium)</li>
              </ul>
            </div>
          </div>

          {/* Legal Clarity */}
          <div className="p-4 bg-bg-tertiary rounded border border-chrome-dark/20 text-xs text-chrome-dark">
            <p>
              <strong>About your order:</strong> Every order includes a detailed scope document and licensing agreement.
              Specifics about revision limits, delivery timeline, file formats, and usage rights are confirmed before production begins.
              No surprises—we're explicit about what's included.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
