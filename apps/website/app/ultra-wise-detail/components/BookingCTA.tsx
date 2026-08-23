'use client';

import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';

export function BookingCTA() {
  const handlePhoneClick = () => {
    window.location.href = 'tel:+19177498960';
  };

  return (
    <section className="relative py-20 md:py-32 bg-gradient-to-r from-blue-600 via-blue-700 to-orange-600 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Headline */}
          <h2 className="text-4xl md:text-6xl font-black text-white mb-4 font-bebas">
            READY TO RESTORE.{' '}
            <span className="text-black">PROTECT. ELEVATE?</span>
          </h2>

          {/* Subheading */}
          <p className="text-xl md:text-2xl font-bold text-white/90 mb-12">
            BOOK YOUR DETAIL TODAY!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-black font-black text-lg transition transform"
            >
              BOOK MY DETAIL
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePhoneClick}
              className="px-8 py-4 bg-black/80 hover:bg-black text-white font-black text-lg border-2 border-white transition transform flex items-center justify-center gap-3"
            >
              <Phone className="w-5 h-5" />
              CALL NOW
            </motion.button>
          </div>

          {/* Phone Number Display */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <div className="flex items-center gap-2">
              <Phone className="w-6 h-6 text-black" />
              <a
                href="tel:+19177498960"
                className="text-2xl md:text-3xl font-black text-black hover:text-white transition"
              >
                (917) 749-8960
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Mobile Floating Action Bar */}
      <motion.div
        initial={{ y: 100 }}
        whileInView={{ y: 0 }}
        viewport={{ once: true }}
        className="fixed bottom-0 left-0 right-0 lg:hidden bg-black/95 backdrop-blur-sm border-t border-orange-500 p-3 gap-3 flex z-40"
      >
        <button className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-black font-bold transition">
          BOOK
        </button>
        <button
          onClick={handlePhoneClick}
          className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center justify-center gap-2"
        >
          <Phone className="w-5 h-5" />
          CALL
        </button>
      </motion.div>
    </section>
  );
}
