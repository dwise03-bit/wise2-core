'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import { soundLabsPackages } from '@/lib/sound-labs-data'

export function PackageSelector() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <section id="packages" className="py-20 md:py-32 px-6 md:px-8 bg-bg-secondary">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-chrome-light">
            Choose Your Path
          </h2>
          <p className="text-chrome-dark text-lg max-w-2xl mx-auto">
            Every package includes professional quality, commercial licensing, and human-guided production.
            Prices shown are starting estimates—final scope confirmed in your order agreement.
          </p>
        </motion.div>

        {/* Packages Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {soundLabsPackages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              className={`rounded-lg overflow-hidden transition-all duration-300 cursor-pointer ${
                pkg.highlighted
                  ? 'hud-panel-accent ring-2 ring-blue-electric lg:scale-105'
                  : 'hud-panel-glass hover:hud-panel-accent'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              onClick={() => setExpandedId(expandedId === pkg.id ? null : pkg.id)}
            >
              <div className="p-6 flex flex-col h-full">
                {/* Header */}
                <div className="mb-6">
                  <p className="text-4xl mb-2">{pkg.icon}</p>
                  <h3 className="text-xl font-bold text-chrome-light mb-1">{pkg.name}</h3>
                  <p className="text-sm text-chrome-dark mb-3">{pkg.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <p className="text-3xl font-black text-blue-electric-light">{pkg.priceRange}</p>
                  <p className="text-xs text-chrome-dark mt-1">Starting estimate</p>
                </div>

                {/* Benefits List */}
                <div className="mb-6 flex-1">
                  <p className="text-xs font-bold text-chrome-light mb-3 uppercase tracking-wider">
                    Includes
                  </p>
                  <ul className="space-y-2">
                    {pkg.benefits.slice(0, 3).map((benefit, i) => (
                      <li key={i} className="flex gap-2 text-xs text-chrome-dark">
                        <Check size={14} className="flex-shrink-0 text-green-500 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  {pkg.benefits.length > 3 && (
                    <p className="text-xs text-chrome-dark mt-2 font-mono">
                      +{pkg.benefits.length - 3} more
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  className={`w-full py-3 rounded font-bold transition-all duration-300 ${
                    pkg.highlighted
                      ? 'bg-blue-electric text-bg-primary hover:bg-blue-electric-light'
                      : 'bg-transparent border border-blue-electric/50 text-blue-electric-light hover:bg-blue-electric/10'
                  }`}
                >
                  {pkg.cta}
                </button>
              </div>

              {/* Expanded Details */}
              {expandedId === pkg.id && (
                <motion.div
                  className="border-t border-blue-electric/20 p-6 bg-bg-tertiary"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-xs font-bold text-chrome-light mb-3 uppercase tracking-wider">
                    Full Details
                  </p>
                  <ul className="space-y-2">
                    {pkg.details.map((detail, i) => (
                      <li key={i} className="flex gap-2 text-xs text-chrome-dark">
                        <span className="text-blue-electric mt-1">→</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Comparison Note */}
        <motion.div
          className="p-6 hud-panel-glass rounded-lg text-center text-sm text-chrome-dark"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p>
            <strong>Questions about which package fits your needs?</strong> All pricing is flexible.
            We'll customize scope and budget during your discovery call.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
