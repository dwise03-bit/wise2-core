'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { soundLabsProductionSteps } from '@/lib/sound-labs-data'

export function ProductionJourney() {
  return (
    <section className="py-20 md:py-32 px-6 md:px-8 bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="mb-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-chrome-light">
            Our Production Journey
          </h2>
          <p className="text-chrome-dark text-lg max-w-2xl mx-auto">
            Five clear steps from your vision to launch-ready content.
            <br />
            <strong>AI + Human Creativity</strong> at every stage.
          </p>
        </motion.div>

        {/* Steps Timeline */}
        <div className="relative">
          {/* Vertical line connecting steps */}
          <motion.div
            className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-electric/30 via-blue-electric/60 to-blue-electric/30"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            style={{ originY: 0 }}
          />

          {/* Steps */}
          <div className="space-y-12">
            {soundLabsProductionSteps.map((step, index) => (
              <motion.div
                key={step.number}
                className={`grid md:grid-cols-2 gap-8 items-center ${
                  index % 2 === 1 ? 'md:grid-cols-2 md:[direction:rtl]' : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Content */}
                <div className={index % 2 === 1 ? 'md:[direction:ltr]' : ''}>
                  <motion.div
                    className="hud-panel-glass p-8 rounded-lg"
                    whileHover={{ y: -4 }}
                  >
                    <h3 className="text-2xl font-black text-chrome-light mb-3">
                      {step.title}
                    </h3>
                    <p className="text-chrome-dark leading-relaxed">
                      {step.description}
                    </p>

                    {/* Step-specific notes */}
                    {step.number === 1 && (
                      <p className="text-xs text-chrome-dark mt-4 italic">
                        We'll ask: What's the story? Who's your audience? What feeling should it create?
                      </p>
                    )}
                    {step.number === 3 && (
                      <p className="text-xs text-chrome-dark mt-4 italic">
                        AI explores ideas, human artists refine and polish. You review and direct.
                      </p>
                    )}
                    {step.number === 5 && (
                      <p className="text-xs text-chrome-dark mt-4 italic">
                        Final approval, file delivery, optional streaming distribution setup.
                      </p>
                    )}
                  </motion.div>
                </div>

                {/* Step Number Circle */}
                <div className="flex justify-center md:justify-center">
                  <motion.div
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-electric/30 to-blue-electric/10 border-2 border-blue-electric/50 flex items-center justify-center flex-shrink-0"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-4xl font-black text-blue-electric-light">
                      {step.number}
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Process Summary */}
        <motion.div
          className="mt-20 p-8 hud-panel-accent rounded-lg text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="text-xl font-bold text-chrome-light mb-3">Why This Process Works</h3>
          <p className="text-chrome-dark leading-relaxed">
            Each step has clear goals and checkpoints. You're not just sending files into a black box—
            you're collaborating with creators who understand your vision, use modern tools (AI included),
            and deliver professional results. This is how professional music and branding works.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
