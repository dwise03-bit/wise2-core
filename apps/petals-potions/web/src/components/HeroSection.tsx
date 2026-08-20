'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  }

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-pp-midnight via-pp-dark to-pp-navy overflow-hidden pt-20">
      {/* Decorative botanical elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pp-purple rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pp-indigo rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pp-gold rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col justify-center space-y-8"
          >
            {/* Brand Mark */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-3 w-fit"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pp-gold to-pp-green flex items-center justify-center text-pp-dark text-2xl">
                ✿
              </div>
              <div className="space-y-1">
                <p className="text-pp-gold font-serif-header font-bold">PETALS</p>
                <p className="text-pp-cream font-serif-header text-xs -mt-1">& POTIONS</p>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif-header font-bold leading-tight">
                <span className="text-gradient-gold">Your Ritual.</span>
                <br />
                <span className="text-pp-cream">Your Blend.</span>
                <br />
                <span className="text-pp-gold">Your Healing.</span>
              </h1>
            </motion.div>

            {/* Tagline */}
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-pp-cream/80 font-serif-display max-w-md leading-relaxed"
            >
              Healing is personal. Wellness is a ritual. Nature is our medicine.
            </motion.p>

            {/* Founder Quote */}
            <motion.div
              variants={itemVariants}
              className="bg-pp-purple/30 border border-pp-gold/30 rounded-2xl p-6 backdrop-blur"
            >
              <p className="text-pp-cream italic font-serif-display mb-3">
                "Blending nature & knowledge to create rituals that transform."
              </p>
              <p className="text-pp-gold font-serif-header font-bold">— Paige</p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/ritual-quiz" className="btn-primary text-center">
                Start Your Ritual
              </Link>
              <Link href="/products" className="btn-secondary text-center">
                Explore Products
              </Link>
            </motion.div>

            {/* Trust Signals */}
            <motion.div variants={itemVariants} className="flex gap-8 pt-8 border-t border-pp-gold/20">
              <div>
                <p className="text-2xl font-bold text-pp-gold">100%</p>
                <p className="text-sm text-pp-cream/60">Plant Powered</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-pp-gold">Organic</p>
                <p className="text-sm text-pp-cream/60">Ethically Sourced</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-pp-gold">Custom</p>
                <p className="text-sm text-pp-cream/60">Made for You</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="hidden lg:flex items-center justify-center relative h-full"
          >
            {/* Potion Bottle Illustration Container */}
            <div className="relative w-full h-96">
              {/* Decorative circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 rounded-full border border-pp-gold/30 flex items-center justify-center">
                  {/* Inner circle with gradient */}
                  <div className="w-72 h-72 rounded-full bg-gradient-to-br from-pp-gold/10 to-pp-green/10 border border-pp-gold/20 flex items-center justify-center">
                    {/* Potion Bottle SVG Icon */}
                    <svg className="w-48 h-48 text-pp-gold opacity-80" viewBox="0 0 100 140" fill="none">
                      <path
                        d="M40 20h20v10H40z"
                        fill="currentColor"
                        opacity="0.6"
                      />
                      <path
                        d="M35 30h30v80c0 10-6 18-15 18s-15-8-15-18V30z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      {/* Decorative flowers inside bottle */}
                      <circle cx="50" cy="60" r="3" fill="currentColor" opacity="0.7" />
                      <circle cx="45" cy="75" r="2.5" fill="currentColor" opacity="0.6" />
                      <circle cx="55" cy="75" r="2.5" fill="currentColor" opacity="0.6" />
                      <circle cx="50" cy="95" r="2" fill="currentColor" opacity="0.5" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Floating herbs */}
              <div className="absolute top-20 right-0 animate-pulse">
                <span className="text-4xl opacity-60">🌿</span>
              </div>
              <div className="absolute bottom-20 left-0 animate-pulse" style={{ animationDelay: '1s' }}>
                <span className="text-4xl opacity-60">✿</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
      >
        <svg className="w-6 h-6 text-pp-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </section>
  )
}
