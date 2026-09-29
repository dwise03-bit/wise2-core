'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail } from 'lucide-react'

export function SoundLabsFinalCTA() {
  return (
    <section className="py-20 md:py-32 px-6 md:px-8 bg-gradient-to-b from-bg-primary via-blue-electric/10 to-bg-primary relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-blue-electric to-transparent blur-3xl"
          animate={{ x: [0, 30, -30, 0], y: [0, -30, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Main CTA */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl md:text-6xl font-black mb-6 text-chrome-light leading-tight">
            Ready to Build
            <br />
            Your Anthem?
          </h2>
          <p className="text-xl text-chrome-dark mb-8 max-w-2xl mx-auto leading-relaxed">
            Let's create something that can't be ignored.
            Your brand deserves a sound that's unforgettable.
          </p>
        </motion.div>

        {/* Dual CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <button
            className="group px-8 py-4 rounded font-bold bg-blue-electric text-bg-primary hover:bg-blue-electric-light transition-all duration-300 flex items-center justify-center gap-2 text-lg"
            onClick={() => {
              const element = document.getElementById('contact')
              element?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <span>Start My Project</span>
          </button>
          <button
            className="group px-8 py-4 rounded font-bold border-2 border-blue-electric/50 text-blue-electric-light hover:bg-blue-electric/10 transition-all duration-300 flex items-center justify-center gap-2 text-lg"
            onClick={() => {
              // TODO: Connect to calendar scheduling system
              window.open('https://calendly.com', '_blank')
            }}
          >
            <Phone size={20} />
            <span>Book Discovery Call</span>
          </button>
        </motion.div>

        {/* Quick Contact */}
        <motion.div
          className="p-8 hud-panel-glass rounded-lg text-center mb-12"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="font-bold text-chrome-light mb-4">Prefer to talk first?</h3>
          <div className="flex flex-col sm:flex-row gap-6 justify-center text-sm">
            <a href="mailto:sound-labs@wise2.net" className="flex items-center gap-2 text-blue-electric-light hover:text-blue-electric transition-colors">
              <Mail size={18} />
              <span>sound-labs@wise2.net</span>
            </a>
            <span className="text-chrome-dark">Response within 24 hours guaranteed</span>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          className="grid md:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {[
            { label: 'All-Inclusive Pricing', desc: 'No hidden fees or surprise costs' },
            { label: 'Flexible Scope', desc: 'Customize exactly what you need' },
            { label: 'Satisfaction Guarantee', desc: 'Your project, your approval' },
          ].map((item) => (
            <div key={item.label} className="p-6 hud-panel-glass rounded-lg text-center">
              <p className="font-bold text-chrome-light mb-2">{item.label}</p>
              <p className="text-sm text-chrome-dark">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Legal/Policy Links */}
      <motion.div
        className="mt-16 pt-8 border-t border-steel/30 text-center text-xs text-chrome-dark space-y-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <p>
          <a href="/privacy" className="text-blue-electric/60 hover:text-blue-electric transition-colors">
            Privacy Policy
          </a>
          {' '} • {' '}
          <a href="/terms" className="text-blue-electric/60 hover:text-blue-electric transition-colors">
            Terms of Service
          </a>
          {' '} • {' '}
          <a href="/sound-labs/refund-policy" className="text-blue-electric/60 hover:text-blue-electric transition-colors">
            Refund Policy
          </a>
        </p>
        <p>© 2026 WISE Defense LLC. All rights reserved.</p>
      </motion.div>
    </section>
  )
}
