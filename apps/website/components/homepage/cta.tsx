'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function CTASection() {
  return (
    <section className="py-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 via-black to-cyan-950/40 opacity-50" />

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl font-black leading-tight mb-6">
            <span className="text-white">BUILD.</span>
            <br />
            <span className="text-red-600">AUTOMATE.</span>
            <br />
            <span className="text-red-600">DOMINATE.</span>
          </h1>
          <p className="text-lg text-gray-300 mb-8">WISE² is more than software. It's your unfair advantage.</p>
          <button className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded transition transform hover:scale-105">
            START FREE TODAY
          </button>
          <p className="text-sm text-gray-500 mt-4">No credit card required</p>
        </motion.div>

        <motion.div
          className="flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-center">
            <div className="text-6xl font-black text-white mb-4">W2</div>
            <p className="text-2xl font-black uppercase tracking-widest text-white">ORGANIZED CHAOS</p>
            <p className="text-gray-400 text-sm mt-4">COMMAND CENTER</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
