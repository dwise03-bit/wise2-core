'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export function ImpHero() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-[#050607] via-[#0A0E14] to-[#050607] pt-20 pb-16 overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-[500px] h-[500px] bg-[#00D9FF]/15 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-[#00FF7F]/10 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00D9FF]/20 border border-[#00D9FF]/50 rounded-full w-fit">
              <span className="w-2 h-2 bg-[#00D9FF] rounded-full animate-pulse" />
              <span className="text-xs font-bold tracking-widest text-[#00D9FF]">LIVE NOW — DESKTOP COMPANION</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-none text-white">
                WISE²
                <br />
                <span className="bg-gradient-to-r from-[#00D9FF] to-[#00FF7F] bg-clip-text text-transparent">IMP</span>
              </h1>
              <h2 className="text-lg sm:text-xl font-bold tracking-widest text-gray-400">
                COMPANION. ASSISTANT. ALWAYS THERE.
              </h2>
            </div>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-lg">
              The WISE² IMP is your intelligent desktop sidekick. Live in your browser, installed on your machine, or on the K10 hardware—always watching, always ready. Built for creators, builders, and operators.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-[#00D9FF]/20">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-[#00D9FF]/20 rounded-lg flex items-center justify-center border border-[#00D9FF]/50">
                  <span className="text-[#00D9FF] text-sm font-bold">🎯</span>
                </div>
                <p className="text-xs font-bold tracking-wide text-[#00D9FF]">LIVE BROWSER</p>
                <p className="text-xs text-gray-500">INSTANT LAUNCH</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-[#00D9FF]/20 rounded-lg flex items-center justify-center border border-[#00D9FF]/50">
                  <span className="text-[#00D9FF] text-sm font-bold">💾</span>
                </div>
                <p className="text-xs font-bold tracking-wide text-[#00D9FF]">WINDOWS INSTALL</p>
                <p className="text-xs text-gray-500">ALWAYS ON TOP</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-[#00D9FF]/20 rounded-lg flex items-center justify-center border border-[#00D9FF]/50">
                  <span className="text-[#00D9FF] text-sm font-bold">📱</span>
                </div>
                <p className="text-xs font-bold tracking-wide text-[#00D9FF]">K10 HARDWARE</p>
                <p className="text-xs text-gray-500">PORTABLE EDITION</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-[#00D9FF]/20 rounded-lg flex items-center justify-center border border-[#00D9FF]/50">
                  <span className="text-[#00D9FF] text-sm font-bold">⚙️</span>
                </div>
                <p className="text-xs font-bold tracking-wide text-[#00D9FF]">LOCAL SETTINGS</p>
                <p className="text-xs text-gray-500">NO ACCOUNT</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button className="relative px-8 py-4 bg-gradient-to-r from-[#00D9FF] to-[#00FF7F] hover:from-[#00E6FF] hover:to-[#00FF8F] text-[#050607] font-bold text-sm rounded-lg transition transform hover:scale-105 shadow-lg shadow-[#00D9FF]/50 hover:shadow-[#00D9FF]/70 overflow-hidden group">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition duration-300" />
                <span className="relative">LAUNCH IMP LIVE →</span>
              </button>
              <button className="px-8 py-4 border-2 border-[#00D9FF]/50 hover:border-[#00D9FF]/100 text-gray-300 hover:text-[#00D9FF] font-bold text-sm rounded-lg transition duration-300 bg-[#00D9FF]/5 hover:bg-[#00D9FF]/10 backdrop-blur-sm">
                ▶ GET WINDOWS BUILD
              </button>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2 text-sm text-gray-400 pt-4">
              <span className="text-green-500">●</span>
              <span className="font-medium">PRODUCTION LIVE — ZERO SETUP</span>
            </div>
          </div>

          {/* Right Column — Character Render */}
          <div className="relative h-96 sm:h-[750px] flex items-center justify-center lg:pl-8">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Premium Glow Background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-[#00D9FF]/40 via-[#00FF7F]/20 to-transparent rounded-full blur-3xl opacity-50 -top-20" />
                <div className="absolute w-96 h-96 bg-[#00D9FF]/30 rounded-full blur-3xl opacity-60" />
                <div className="absolute w-80 h-80 bg-[#00D9FF]/20 rounded-full blur-2xl opacity-50" />
              </div>

              {/* Character Frame */}
              <div className="relative z-10 flex items-center justify-center">
                <div className="relative w-72 h-96 rounded-2xl overflow-hidden">
                  {/* Border & Shadow Layers */}
                  <div className="absolute -inset-1 bg-gradient-to-b from-[#00D9FF]/60 via-[#00FF7F]/30 to-[#00D9FF]/20 rounded-2xl blur-xl opacity-75 -z-10" />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#00D9FF]/40 via-transparent to-[#00D9FF]/20 rounded-2xl border border-[#00D9FF]/80 shadow-2xl shadow-[#00D9FF]/60" />

                  {/* Image */}
                  <Image
                    src="/products/wise-imp.png"
                    alt="WISE² IMP - glossy black companion with cyan eyes and W² chest mark"
                    width={288}
                    height={384}
                    priority
                    className="w-full h-full object-contain relative z-10"
                  />

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#00D9FF]/15 via-transparent via-60% to-[#00D9FF]/30 pointer-events-none rounded-2xl" />

                  {/* Top edge highlight */}
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00D9FF]/60 to-transparent" />
                </div>
              </div>

              {/* Ambient pulse */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="absolute w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-2xl opacity-40 animate-pulse" />
              </div>

              {/* Background text */}
              <div className="absolute -right-40 sm:-right-20 top-1/3 text-5xl sm:text-6xl font-black text-[#00D9FF]/8 tracking-tighter whitespace-nowrap pointer-events-none">
                ALWAYS<br />
                WATCHING<br />
                YOUR DESK
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
