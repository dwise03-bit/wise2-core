'use client';

import { motion } from 'framer-motion';

export function Reviews() {
  return (
    <section className="relative py-20 md:py-32 bg-gradient-to-b from-black to-slate-900 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Reviews Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Star Rating */}
          <div className="mb-8">
            <div className="text-6xl mb-4">⭐⭐⭐⭐⭐</div>
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-orange-500/20 to-blue-500/20 border border-orange-500/50 rounded-full mb-6">
              <p className="text-sm font-bold text-orange-500">
                Highest Rated Detailing Service
              </p>
            </div>
          </div>

          {/* Main Review Text */}
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 max-w-3xl mx-auto">
            Trusted by car owners across{' '}
            <span className="text-blue-500">South Florida</span>
          </h2>

          {/* Trust Statement */}
          <div className="flex flex-col sm:flex-row justify-center gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center"
            >
              <p className="text-3xl font-black text-orange-500 mb-2">Quality</p>
              <p className="text-gray-500 text-sm">Industry-leading standards</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <p className="text-3xl font-black text-blue-500 mb-2">Integrity</p>
              <p className="text-gray-500 text-sm">Transparent & honest</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center"
            >
              <p className="text-3xl font-black text-white mb-2">Results</p>
              <p className="text-gray-500 text-sm">Guaranteed satisfaction</p>
            </motion.div>
          </div>

          {/* Service Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-8 py-6 bg-black border-2 border-gray-800 rounded"
          >
            <p className="text-sm text-gray-500 mb-3">SERVING</p>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
              South Florida Area
            </h3>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-xs text-gray-500">Broward County</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Miami-Dade County</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Palm Beach County</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-4">
              + surrounding areas within service radius
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
