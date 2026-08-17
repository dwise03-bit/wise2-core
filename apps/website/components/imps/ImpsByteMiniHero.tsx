'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

export function ImpsByteMiniHero() {
  const [animationFrame, setAnimationFrame] = useState('idle-blue');
  return (
    <section id="home" className="relative min-h-screen bg-gradient-to-br from-black via-blue-950/10 to-black pt-20 pb-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-32 left-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl opacity-10" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-400/50 rounded-full w-fit">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-xs font-bold tracking-widest text-blue-400">NEW — MEET YOUR DIGITAL SIDEKICK</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-none text-white">
                WISE²
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">IMPS</span>
              </h1>
              <h2 className="text-lg sm:text-xl font-bold tracking-widest text-gray-300">
                INTELLIGENT. MOBILE. PERSONAL. SECURE.
              </h2>
            </div>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-lg">
              The WISE² IMP is your always-ready AI companion, built for creators, builders, entrepreneurs, students and innovators. Powered by the ESP32-C5 with a 4" touchscreen face and endless possibilities.
            </p>

            {/* Hardware Features Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-blue-500/20">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-400/50">
                  <span className="text-blue-400 text-sm font-bold">⚡</span>
                </div>
                <p className="text-xs font-bold tracking-wide text-blue-400">ESP32-C5</p>
                <p className="text-xs text-gray-500">POWERED</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-400/50">
                  <span className="text-blue-400 text-sm font-bold">📱</span>
                </div>
                <p className="text-xs font-bold tracking-wide text-blue-400">4" TOUCH</p>
                <p className="text-xs text-gray-500">DISPLAY</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-400/50">
                  <span className="text-blue-400 text-sm font-bold">🎤</span>
                </div>
                <p className="text-xs font-bold tracking-wide text-blue-400">VOICE AI</p>
                <p className="text-xs text-gray-500">ASSISTANT</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-400/50">
                  <span className="text-blue-400 text-sm font-bold">🔒</span>
                </div>
                <p className="text-xs font-bold tracking-wide text-blue-400">SECURE &</p>
                <p className="text-xs text-gray-500">PRIVATE</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-black font-bold text-sm rounded-lg transition transform hover:scale-105">
                PRE-ORDER NOW →
              </button>
              <button className="px-8 py-4 border border-gray-600 hover:border-blue-400 text-gray-300 hover:text-blue-400 font-bold text-sm rounded-lg transition">
                ▶ WATCH DEMO
              </button>
            </div>

            {/* Limited Edition Badge */}
            <div className="flex items-center gap-2 text-sm text-gray-400 pt-4">
              <span className="text-red-500">🚀</span>
              <span className="font-medium">LIMITED LAUNCH EDITION — SHIPS SUMMER 2025</span>
            </div>
          </div>

          {/* Right Column — Character Render */}
          <div className="relative h-96 sm:h-[600px] flex items-center justify-center">
            {/* Character Container */}
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Glow Background */}
              <div className="absolute inset-0 bg-gradient-radial from-blue-500/30 to-transparent rounded-full blur-3xl opacity-50" />

              {/* Character Image */}
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <div className="relative w-64 h-80 rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/20">
                  <Image
                    src="/wise-imp/idle-blue.webp"
                    alt="WISE² IMPS BYTE MINI 4.0 - AI Companion Robot"
                    fill
                    priority
                    sizes="(max-width: 640px) 256px, 320px"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Cyberpunk Text Background */}
              <div className="absolute -right-32 top-1/3 text-6xl font-black text-blue-500/10 tracking-tighter whitespace-nowrap pointer-events-none">
                IMPS DON'T<br />
                JUST FOLLOW.<br />
                THEY BUILD.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
