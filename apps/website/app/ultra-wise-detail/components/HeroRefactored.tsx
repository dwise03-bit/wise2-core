'use client';

import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative w-full bg-black overflow-hidden min-h-screen flex items-center">
      {/* NYC Skyline - subtle background */}
      <div className="absolute top-0 right-0 w-full h-1/3 opacity-10 pointer-events-none">
        <svg viewBox="0 0 1200 400" className="w-full h-full" preserveAspectRatio="xMaxYMin slice">
          <path
            fill="currentColor"
            className="text-orange-500"
            d="M0 200 L50 100 L100 120 L120 80 L150 90 L170 40 L200 50 L220 60 L250 30 L300 35 L350 50 L380 20 L400 25 L430 45 L470 30 L500 60 L550 40 L600 70 L650 45 L700 55 L750 25 L800 35 L850 50 L900 30 L950 40 L1000 20 L1050 50 L1100 35 L1150 60 L1200 40 L1200 400 L0 400 Z"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-center min-h-screen">
          {/* LEFT: Copy (45%) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 z-20 px-4 sm:px-6 lg:px-8 py-20 lg:py-0"
          >
            {/* Subheading */}
            <p className="text-sm font-bold tracking-wide mb-6 leading-tight">
              <span className="text-white">NEW YORK TOUGH.</span>{' '}
              <span className="text-orange-500">ULTRA WISE FINISH.</span>
            </p>

            {/* MASSIVE Headline */}
            <h1 className="font-black text-7xl sm:text-8xl leading-none mb-8 font-bebas tracking-tighter">
              <div className="text-white">RESTORE.</div>
              <div className="text-blue-500">PROTECT.</div>
              <div className="text-orange-500">ELEVATE.</div>
            </h1>

            {/* Body Copy */}
            <p className="text-base text-gray-300 mb-10 max-w-md leading-relaxed font-medium">
              Premium detailing & auto recon services that bring your vehicle back to life.
            </p>

            {/* CTAs - Stacked on mobile, side-by-side on desktop */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-black font-black text-base transition transform hover:scale-105 active:scale-95">
                BOOK MY DETAIL
              </button>
              <button className="px-8 py-3 border-2 border-blue-500 text-blue-500 font-black text-base hover:bg-blue-500/10 transition">
                GET AN INSTANT QUOTE
              </button>
            </div>
          </motion.div>

          {/* RIGHT: Knicks Logo + Vehicle (55%) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-7 relative h-screen lg:h-auto flex items-center justify-center px-4 sm:px-6 lg:px-0"
          >
            {/* KNICKS LOGO - PRIMARY HERO ELEMENT */}
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <motion.svg
                viewBox="0 0 300 300"
                className="w-72 h-72 lg:w-96 lg:h-96"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {/* Outer circle */}
                <circle cx="150" cy="150" r="140" className="text-orange-500" opacity="0.8" />

                {/* Inner circle */}
                <circle cx="150" cy="150" r="110" className="text-blue-500" opacity="0.6" />

                {/* Cross lines */}
                <line x1="150" y1="10" x2="150" y2="290" className="text-orange-500" opacity="0.4" />
                <line x1="10" y1="150" x2="290" y2="150" className="text-blue-500" opacity="0.4" />
              </motion.svg>

              {/* Basketball emoji inside logo */}
              <div className="absolute text-8xl z-30 animate-bounce">🏀</div>
            </div>

            {/* VEHICLE IMAGE - Behind/Beside Logo */}
            <div className="absolute inset-0 z-10">
              <img
                src="/images/ultra-wise-detail/genesis-exterior.jpg"
                alt="Genesis luxury SUV"
                className="w-full h-full object-cover opacity-90"
              />
              {/* Blue/Orange lighting overlay */}
              <div className="absolute inset-0 bg-gradient-to-l from-blue-600/20 via-transparent to-orange-600/10" />
            </div>

            {/* Glow effects */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-orange-500/20 blur-3xl z-0" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
