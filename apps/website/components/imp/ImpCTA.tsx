'use client';

import Link from 'next/link';

export function ImpCTA() {
  return (
    <section className="relative bg-gradient-to-r from-[#00D9FF] via-[#00FF7F] to-[#00D9FF] py-20 overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl sm:text-5xl font-black text-[#050607] leading-tight">
                Ready to meet your IMP?
              </h2>
              <p className="text-base text-[#050607]/80 mt-4 leading-relaxed">
                The live companion is running now. Zero setup. No account. Just launch and start working.
              </p>
            </div>

            {/* Quick start cards */}
            <div className="space-y-3">
              <div className="flex gap-4 p-4 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition cursor-pointer">
                <span className="text-2xl">🌐</span>
                <div>
                  <p className="font-bold text-[#050607]">Try Live Browser</p>
                  <p className="text-sm text-[#050607]/70">No download, instant launch</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition cursor-pointer">
                <span className="text-2xl">💾</span>
                <div>
                  <p className="font-bold text-[#050607]">Get Windows App</p>
                  <p className="text-sm text-[#050607]/70">Always-on-top desktop companion</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition cursor-pointer">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="font-bold text-[#050607]">Explore K10 Hardware</p>
                  <p className="text-sm text-[#050607]/70">Portable AI companion device</p>
                </div>
              </div>
            </div>

            {/* Main CTA */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <a
                href="/imp"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#050607] hover:bg-[#111A22] text-white font-bold text-sm rounded-lg transition transform hover:scale-105"
              >
                LAUNCH LIVE IMP →
              </a>
              <a
                href="/imp/downloads"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#050607]/30 hover:border-[#050607]/50 bg-white/10 hover:bg-white/20 text-[#050607] font-bold text-sm rounded-lg transition backdrop-blur-sm"
              >
                DOWNLOAD WINDOWS
              </a>
            </div>
          </div>

          {/* Right Content - Stats/Social Proof */}
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-white/20 backdrop-blur-sm rounded-lg">
                <p className="text-3xl sm:text-4xl font-black text-[#050607]">100%</p>
                <p className="text-sm text-[#050607]/70 mt-2">Local Storage</p>
                <p className="text-xs text-[#050607]/60 mt-1">Your data, your control</p>
              </div>
              <div className="p-6 bg-white/20 backdrop-blur-sm rounded-lg">
                <p className="text-3xl sm:text-4xl font-black text-[#050607]">Zero</p>
                <p className="text-sm text-[#050607]/70 mt-2">Setup Time</p>
                <p className="text-xs text-[#050607]/60 mt-1">Instant launch, no config</p>
              </div>
              <div className="p-6 bg-white/20 backdrop-blur-sm rounded-lg">
                <p className="text-3xl sm:text-4xl font-black text-[#050607]">3 Ways</p>
                <p className="text-sm text-[#050607]/70 mt-2">To Companion</p>
                <p className="text-xs text-[#050607]/60 mt-1">Web, desktop, hardware</p>
              </div>
              <div className="p-6 bg-white/20 backdrop-blur-sm rounded-lg">
                <p className="text-3xl sm:text-4xl font-black text-[#050607]">Live</p>
                <p className="text-sm text-[#050607]/70 mt-2">Right Now</p>
                <p className="text-xs text-[#050607]/60 mt-1">No waiting, production ready</p>
              </div>
            </div>

            {/* Additional info */}
            <div className="p-6 bg-white/20 backdrop-blur-sm rounded-lg space-y-3">
              <p className="font-bold text-[#050607] text-lg">The IMP Ecosystem</p>
              <p className="text-sm text-[#050607]/80 leading-relaxed">
                Choose your form. One identity. Same companion. Whether you want a browser app, a Windows desktop overlay, or a physical K10 device—your IMP adapts.
              </p>
              <div className="flex gap-2 pt-3">
                <Link href="/products/imps" className="text-sm font-bold text-[#050607] hover:underline">
                  ▶ Explore K10 Hardware →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
