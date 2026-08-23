'use client';

import { motion } from 'framer-motion';

export function OwnerSection() {
  return (
    <section className="relative py-20 md:py-32 bg-gradient-to-b from-black to-slate-900 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Owner Photo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative w-full aspect-square rounded border border-orange-500/50 overflow-hidden">
              {/* Ronald Wise owner photo */}
              <img
                src="/images/ultra-wise-detail/ronald-wise.jpg"
                alt="Ronald Wise, owner of Ultra Wise Detail"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Knicks Basketball accent */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 opacity-20 pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor">
                <circle cx="50" cy="50" r="45" className="text-orange-500" />
                <text x="50" y="60" textAnchor="middle" className="text-2xl font-bold fill-blue-500">
                  🏀
                </text>
              </svg>
            </div>
          </motion.div>

          {/* Owner Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {/* Owner Name */}
            <div className="mb-8">
              <p className="text-sm text-gray-500 mb-2 tracking-widest">OWNER</p>
              <h2 className="text-5xl md:text-6xl font-black text-orange-500 mb-2 font-bebas">
                RONALD WISE
              </h2>
              <p className="text-xl md:text-2xl text-blue-500 font-bold">
                ULTRA WISE DETAIL
              </p>
            </div>

            {/* Signature */}
            <div className="mb-8 pb-8 border-b border-gray-800">
              <p className="text-2xl italic text-gray-400 font-script">Ronald Wise</p>
            </div>

            {/* Quote */}
            <div className="mb-8">
              <div className="flex items-start gap-4">
                <div className="text-6xl text-orange-500/30 font-bold leading-none">"</div>
                <div>
                  <p className="text-lg md:text-xl text-white mb-4 leading-relaxed">
                    We don't just wash cars—
                    <br />
                    we treat them like investments.
                  </p>
                  <p className="text-lg font-bold text-orange-500">
                    Precision. Protection. Pride.
                  </p>
                  <p className="text-base text-gray-400">
                    That's the Ultra Wise way.
                  </p>
                </div>
              </div>
            </div>

            {/* Lifestyle text */}
            <div className="pt-8 border-t border-gray-800">
              <p className="text-sm text-gray-500 italic mb-2">Lifestyle</p>
              <p className="text-3xl font-black text-blue-500 mb-4">
                ONCE A KNICK,
                <br />
                ALWAYS A KNICK
              </p>
              <p className="text-xl font-black text-orange-500">
                NEW YORK FOREVER
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
