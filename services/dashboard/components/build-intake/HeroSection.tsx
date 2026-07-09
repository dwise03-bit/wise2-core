'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function HeroSection() {
  const titleVariants = {
    initial: { opacity: 0, y: -20 },
    animate: {
      opacity: 1,
      y: 0,
      textShadow: [
        '0 0 10px rgba(0, 217, 255, 0)',
        '0 0 20px rgba(0, 217, 255, 0.5)',
        '0 0 40px rgba(0, 217, 255, 0.3)',
        '0 0 20px rgba(0, 217, 255, 0.5)',
        '0 0 10px rgba(0, 217, 255, 0)',
      ]
    },
    transition: { duration: 1.2, delay: 0.3 }
  };

  const subtitleVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.8, delay: 0.8 }
  };

  const taglineVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 1.1 }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="relative text-center mb-12"
    >
      {/* Main Headline - Distressed Style */}
      <motion.h1
        variants={titleVariants}
        className="text-7xl md:text-8xl font-black text-white mb-2"
        style={{
          textShadow: '0 0 20px rgba(0, 217, 255, 0.3)',
          letterSpacing: '-0.02em',
          fontFamily: '"Arial Black", sans-serif',
        }}
      >
        WISE²
      </motion.h1>

      {/* Tagline: Building Brands */}
      <motion.p
        variants={subtitleVariants}
        className="text-lg md:text-xl font-bold text-white mb-8"
      >
        <span>BUILDING BRANDS.</span>
        <span className="ml-2">
          <span className="text-[#00D9FF]">AUTOMATING SUCCESS.</span>
        </span>
      </motion.p>

      {/* Form Title */}
      <motion.div
        variants={taglineVariants}
        className="space-y-2 mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-black text-white">
          CLIENT INFORMATION FORM
        </h2>
        <p className="text-sm uppercase tracking-widest text-gray-400">
          Tell us about your business so we can bring your vision to life.
        </p>
      </motion.div>

      {/* Hero Content Section with Characters */}
      <div className="relative mt-16 mb-12 min-h-[500px] flex items-center justify-center">
        {/* Background circuit pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 1000 600"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern id="circuitPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 0 50 L 100 50" stroke="url(#neonGradient)" strokeWidth="1" fill="none" />
                <path d="M 50 0 L 50 100" stroke="url(#neonGradient)" strokeWidth="1" fill="none" />
                <circle cx="0" cy="50" r="3" fill="url(#neonGradient)" />
                <circle cx="100" cy="50" r="3" fill="url(#neonGradient)" />
                <circle cx="50" cy="0" r="3" fill="url(#neonGradient)" />
                <circle cx="50" cy="100" r="3" fill="url(#neonGradient)" />
              </pattern>
              <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00D9FF" />
                <stop offset="100%" stopColor="#FF4D4D" />
              </linearGradient>
            </defs>
            <rect width="1000" height="600" fill="url(#circuitPattern)" />
          </svg>
        </div>

        {/* Left Character Placeholder - Darrin */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="absolute left-0 z-10"
        >
          <div className="w-64 h-96 bg-gradient-to-br from-[#00D9FF]/20 to-[#FF4D4D]/20 rounded-lg border-2 border-[#00D9FF]/50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🤖</div>
              <p className="text-xs uppercase font-bold text-[#00D9FF]">Darrin Wise</p>
              <p className="text-xs text-gray-400">The Idea Hunter</p>
            </div>
          </div>
        </motion.div>

        {/* Center WISE IMP Mascot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="absolute z-20"
        >
          <motion.div
            animate={{
              y: [0, -15, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            {/* WISE IMP Glow */}
            <div className="absolute inset-0 blur-3xl bg-[#00D9FF]/20 rounded-full w-40 h-40"></div>

            {/* WISE IMP Character */}
            <div className="w-32 h-32 bg-gradient-to-br from-[#00D9FF] to-[#FF4D4D] rounded-full flex items-center justify-center relative z-10 border-2 border-[#00D9FF]">
              <span className="text-6xl">✨</span>
            </div>

            {/* W² Logo inside */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-black text-white">W²</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Character Placeholder - Daniel */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="absolute right-0 z-10"
        >
          <div className="w-64 h-96 bg-gradient-to-br from-[#FF4D4D]/20 to-[#00D9FF]/20 rounded-lg border-2 border-[#FF4D4D]/50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">⚙️</div>
              <p className="text-xs uppercase font-bold text-[#FF4D4D]">Daniel Wise</p>
              <p className="text-xs text-gray-400">The System Builder</p>
            </div>
          </div>
        </motion.div>

        {/* Center Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="absolute bottom-0 text-center z-20"
        >
          <h3 className="text-2xl md:text-3xl font-black text-white mb-3">
            WE BUILD MORE<br />THAN WEBSITES.
          </h3>
          <p className="text-base leading-relaxed">
            <span className="text-white font-bold block">WE BUILD BRANDS.</span>
            <span className="text-white font-bold block">WE BUILD SYSTEMS.</span>
            <span className="text-[#00D9FF] font-bold block">WE BUILD LEGACIES.</span>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
