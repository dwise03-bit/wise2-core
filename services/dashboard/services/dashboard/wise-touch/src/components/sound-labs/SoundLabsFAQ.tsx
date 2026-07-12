'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { soundLabsFAQ } from '@/lib/sound-labs-data'

export function SoundLabsFAQ() {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  return (
    <section className="py-20 md:py-32 px-6 md:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-chrome-light">
            Questions Answered
          </h2>
          <p className="text-chrome-dark text-lg">
            Everything you need to know about working with WISE² Sound Labs.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {soundLabsFAQ.map((item, index) => (
            <motion.div
              key={index}
              className="hud-panel-glass rounded-lg overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <button
                onClick={() => setExpandedId(expandedId === index ? null : index)}
                className="w-full px-6 py-5 flex items-start justify-between gap-4 hover:bg-blue-electric/5 transition-colors text-left"
              >
                <span className="text-lg font-bold text-chrome-light flex-1">
                  {item.question}
                </span>
                <motion.div
                  animate={{ rotate: expandedId === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown size={20} className="text-blue-electric" />
                </motion.div>
              </button>

              <AnimatePresence>
                {expandedId === index && (
                  <motion.div
                    className="px-6 pb-6 border-t border-blue-electric/20"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-chrome-dark leading-relaxed">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Additional Help */}
        <motion.div
          className="mt-16 p-8 hud-panel-accent rounded-lg text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-xl font-bold text-chrome-light mb-3">Still have questions?</h3>
          <p className="text-chrome-dark mb-6">
            Our team is ready to discuss your specific project, budget, and timeline.
            There are no silly questions—let's talk.
          </p>
          <button
            className="px-6 py-3 rounded border-2 border-blue-electric bg-blue-electric text-bg-primary font-bold hover:bg-blue-electric-light transition-all"
            onClick={() => {
              const element = document.getElementById('contact')
              element?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Book Your Discovery Call
          </button>
        </motion.div>
      </div>
    </section>
  )
}
