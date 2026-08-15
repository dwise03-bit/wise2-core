'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Homepage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a0a] to-[#030303] text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(57,255,20,0.1) 0%, transparent 70%)',
            top: '-100px',
            right: '200px',
            filter: 'blur(60px)',
          }}
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <div className="flex items-center justify-between p-6 border-b border-[#333]">
          <div className="flex items-baseline gap-1">
            <span className="font-orbitron font-black text-2xl bg-gradient-to-b from-white to-[#777] bg-clip-text text-transparent">
              WISE
            </span>
            <span className="font-orbitron font-black text-sm text-[#39FF14]" style={{ textShadow: '0 0 8px rgba(57,255,20,.6)' }}>
              2
            </span>
          </div>
          <Link href="/auth/login" className="px-4 py-2 bg-[#39FF14] text-[#050505] font-bold rounded hover:shadow-lg hover:shadow-[#39FF14]/50 transition">
            Sign In
          </Link>
        </div>

        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-[#39FF14] to-[#00D9FF] bg-clip-text text-transparent">
              Create with Purpose
            </h1>
            <p className="text-2xl text-[#ccc] mb-8 max-w-2xl mx-auto">
              AI-powered creative tools guided by industry experts
            </p>
            <Link
              href="/auth/signup"
              className="inline-block px-8 py-4 bg-gradient-to-r from-[#39FF14] to-[#00D9FF] text-black font-bold text-lg rounded-lg hover:shadow-lg hover:shadow-[#39FF14]/50 transition"
            >
              Get Started Free
            </Link>
          </motion.div>

          {/* Featured Creators */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <p className="text-[#39FF14] uppercase tracking-widest text-sm mb-2">Guided by Experts</p>
              <h2 className="text-4xl font-bold mb-6">Meet Your Creative Guides</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Daniel */}
              <motion.div
                whileHover={{ y: -10 }}
                className="bg-gradient-to-br from-[#39FF14]/15 to-transparent border border-[#39FF14]/40 rounded-2xl p-12 text-center"
              >
                <div className="text-8xl mb-6 inline-block">🎧</div>
                <h3 className="text-3xl font-bold mb-3">Daniel</h3>
                <p className="text-[#39FF14] font-semibold text-lg mb-4">Audio Architect</p>
                <p className="text-[#ccc] mb-6 leading-relaxed text-lg">
                  Master of sonic branding and production. Daniel guides you through creating audio signatures that define your brand identity. Expert in sound design, mixing, and mastering.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <span className="px-4 py-2 bg-[#39FF14]/20 text-[#39FF14] rounded-full text-sm font-semibold">Sound Design</span>
                  <span className="px-4 py-2 bg-[#39FF14]/20 text-[#39FF14] rounded-full text-sm font-semibold">Mixing</span>
                  <span className="px-4 py-2 bg-[#39FF14]/20 text-[#39FF14] rounded-full text-sm font-semibold">Mastering</span>
                </div>
              </motion.div>

              {/* Darren */}
              <motion.div
                whileHover={{ y: -10 }}
                className="bg-gradient-to-br from-[#00D9FF]/15 to-transparent border border-[#00D9FF]/40 rounded-2xl p-12 text-center"
              >
                <div className="text-8xl mb-6 inline-block">🎬</div>
                <h3 className="text-3xl font-bold mb-3">Darren</h3>
                <p className="text-[#00D9FF] font-semibold text-lg mb-4">Creative Director</p>
                <p className="text-[#ccc] mb-6 leading-relaxed text-lg">
                  Storyteller and visionary. Darren leads you through crafting compelling narratives and lyrics that resonate with audiences. Expert in narrative structure, lyricism, and creative direction.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <span className="px-4 py-2 bg-[#00D9FF]/20 text-[#00D9FF] rounded-full text-sm font-semibold">Lyrics</span>
                  <span className="px-4 py-2 bg-[#00D9FF]/20 text-[#00D9FF] rounded-full text-sm font-semibold">Narrative</span>
                  <span className="px-4 py-2 bg-[#00D9FF]/20 text-[#00D9FF] rounded-full text-sm font-semibold">Direction</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Their Journey */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gradient-to-r from-[#39FF14]/10 to-[#00D9FF]/10 border border-[#39FF14]/30 rounded-2xl p-12 text-center"
          >
            <p className="text-xl text-[#ccc] mb-4">
              Together, they created a 5-step journey to transform you from beginner to creative visionary
            </p>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-8 text-sm">
              <div>
                <div className="text-2xl mb-2">1️⃣</div>
                <p className="text-[#39FF14] font-bold">The Beginning</p>
              </div>
              <div>
                <div className="text-2xl mb-2">2️⃣</div>
                <p className="text-[#39FF14] font-bold">First Composition</p>
              </div>
              <div>
                <div className="text-2xl mb-2">3️⃣</div>
                <p className="text-[#39FF14] font-bold">Sonic Identity</p>
              </div>
              <div>
                <div className="text-2xl mb-2">4️⃣</div>
                <p className="text-[#39FF14] font-bold">Production Mastery</p>
              </div>
              <div>
                <div className="text-2xl mb-2">5️⃣</div>
                <p className="text-[#39FF14] font-bold">Creative Visionary</p>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mt-20"
          >
            <p className="text-xl text-[#ccc] mb-8">
              Ready to start your creative journey with Daniel and Darren?
            </p>
            <Link
              href="/auth/signup"
              className="inline-block px-8 py-4 bg-gradient-to-r from-[#39FF14] to-[#00D9FF] text-black font-bold text-lg rounded-lg hover:shadow-lg hover:shadow-[#39FF14]/50 transition"
            >
              Join the Studio Now
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
