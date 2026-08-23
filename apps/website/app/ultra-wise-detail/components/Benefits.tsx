'use client';

import { motion } from 'framer-motion';
import {
  Sparkles,
  Zap,
  Clock,
  Shield,
  User,
  Diamond,
} from 'lucide-react';

const benefits = [
  {
    id: 1,
    icon: Diamond,
    title: 'PREMIUM PRODUCTS',
    description: 'We use industry-leading products for superior results.',
  },
  {
    id: 2,
    icon: Zap,
    title: 'EXPERT TECHNIQUES',
    description: 'Skilled, trained, and passionate about perfection.',
  },
  {
    id: 3,
    icon: Clock,
    title: 'CONVENIENT SERVICE',
    description: 'Mobile & at-location service that fits your schedule.',
  },
  {
    id: 4,
    icon: Shield,
    title: 'SATISFACTION GUARANTEED',
    description: 'We stand behind every detail we deliver.',
  },
  {
    id: 5,
    icon: User,
    title: 'CUSTOMER-FIRST FOCUS',
    description: 'Your vehicle. Your satisfaction. Our priority.',
  },
];

export function Benefits() {
  return (
    <section className="relative py-20 md:py-32 bg-black overflow-hidden">
      {/* Basketball accent */}
      <div className="absolute -top-20 -left-20 w-96 h-96 opacity-5 pointer-events-none">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-orange-500"
          fill="currentColor"
        >
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" fill="none" />
          <circle cx="50" cy="50" r="2" />
          <path d="M 50 8 Q 50 50, 50 92" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M 20 50 Q 50 50, 80 50" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black font-bebas mb-4">
            <span className="text-white">WHY CHOOSE</span>
            <br />
            <span className="text-blue-500">ULTRA WISE DETAIL?</span>
          </h2>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/50 to-blue-500/50 rounded opacity-0 group-hover:opacity-100 blur transition duration-300" />
                <div className="relative bg-black p-8 rounded">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500/20 to-blue-500/20 border border-orange-500/50">
                        <Icon className="h-6 w-6 text-orange-500" />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            );
          })}

          {/* Feature Flag - Add extra visual benefit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/50 to-orange-500/50 rounded opacity-0 group-hover:opacity-100 blur transition duration-300" />
            <div className="relative bg-black p-8 rounded">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-orange-500/20 border border-blue-500/50">
                    <Sparkles className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-3">
                TRUSTED EXPERTISE
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Years of automotive knowledge and award-winning customer service.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="inline-block">
            <div className="mb-4 text-5xl">⭐⭐⭐⭐⭐</div>
            <h3 className="text-2xl font-black text-white mb-2">
              TRUSTED BY CAR OWNERS
            </h3>
            <p className="text-gray-400 mb-4">Across South Florida</p>
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-500">Quality</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-500">Integrity</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">Results</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
