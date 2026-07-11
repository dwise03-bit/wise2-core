'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Headphones, ChevronDown } from 'lucide-react'

export function SoundLabsHero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const waveformVariants = {
    animate: {
      d: ['M0,50 Q25,30 50,50 T100,50', 'M0,50 Q25,45 50,50 T100,50', 'M0,50 Q25,30 50,50 T100,50'],
    },
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#0094FF" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        {/* Glow orbs */}
        <motion.div
          className="absolute w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0, 148, 255, 0.2), transparent)',
            top: '-10%',
            right: '10%',
          }}
          animate={{
            x: [0, 30, -30, 0],
            y: [0, -40, 40, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0, 174, 239, 0.15), transparent)',
            bottom: '-10%',
            left: '5%',
          }}
          animate={{
            x: [0, -40, 40, 0],
            y: [0, 30, -30, 0],
          }}
          transition={{ duration: 24, repeat: Infinity }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-6 md:px-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Logo/Badge */}
        <motion.div
          className="inline-block mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="px-4 py-2 rounded border border-blue-electric/50 text-blue-electric-light text-sm font-mono">
            🎵 WISE² Sound Labs
          </div>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          className="text-5xl md:text-7xl font-black mb-6 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{
            background: 'linear-gradient(135deg, #D1D5DB 0%, #9CA3AF 50%, #0094FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Your Brand.
          <br />
          Your Sound.
          <br />
          Your Legacy.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="text-xl md:text-2xl text-chrome-light mb-8 font-light tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          We don't just make songs. We build anthems.
        </motion.p>

        {/* Trust line */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-12 text-sm text-chrome-dark"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-blue-electric"></span>
            Custom Music
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-blue-electric"></span>
            Commercial Licensing
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-blue-electric"></span>
            Visual Content
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-blue-electric"></span>
            AI + Human Creativity
          </span>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <button
            className="group px-8 py-4 rounded border-2 border-blue-electric bg-blue-electric text-bg-primary font-bold hover:bg-blue-electric-light transition-all duration-300 flex items-center justify-center gap-2"
            onClick={() => {
              const element = document.getElementById('packages')
              element?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <span>Build My Anthem</span>
          </button>
          <button
            className="group px-8 py-4 rounded border-2 border-blue-electric/50 text-blue-electric-light hover:bg-blue-electric/10 transition-all duration-300 flex items-center justify-center gap-2"
            onClick={() => {
              const element = document.getElementById('showcase')
              element?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <Play size={18} className="group-hover:translate-x-1 transition-transform" />
            <span>Hear the Difference</span>
          </button>
        </motion.div>

        {/* Animated Waveform */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <svg viewBox="0 0 100 100" className="w-full max-w-md mx-auto h-20 opacity-60">
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0094FF" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#00AEEF" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#4FC3FF" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <motion.path
              d="M0,50 Q10,20 20,50 T40,50 T60,50 T80,50 T100,50"
              stroke="url(#waveGradient)"
              strokeWidth="2"
              fill="none"
              variants={waveformVariants}
              animate="animate"
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.path
              d="M0,50 Q10,35 20,50 T40,50 T60,50 T80,50 T100,50"
              stroke="url(#waveGradient)"
              strokeWidth="1"
              fill="none"
              opacity="0.5"
              variants={waveformVariants}
              animate="animate"
              transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
            />
          </svg>
        </motion.div>

        {/* Scroll Cue */}
        <motion.div
          className="flex flex-col items-center gap-2 text-chrome-dark text-sm"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span>Scroll to explore</span>
          <ChevronDown size={20} />
        </motion.div>
      </motion.div>
    </section>
  )
}
