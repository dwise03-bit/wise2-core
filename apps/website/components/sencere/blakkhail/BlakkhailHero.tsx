'use client';

import Image from 'next/image';
import { BLAKKHAIL_LEGACY } from '@/lib/sencere/blakkhail-legacy';

export function BlakkhailHero() {
  const heroImage = BLAKKHAIL_LEGACY.assets.dropAd || '/sencere-assets/blakkhail/hero-4k.jpg';

  return (
    <section className="relative w-full overflow-hidden bg-black">
      {/* 4K Hero Image - Full Immersion */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* Main Image Layer */}
        <Image
          src={heroImage}
          alt="Blakk Hail Heritage - Original Fashion Since 1994"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-100 transition-transform duration-700 ease-out hover:scale-105"
          quality={100}
        />

        {/* Cinematic Depth Layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/20 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
        <div className="absolute inset-0 bg-radial-gradient-to-edge opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(196, 163, 105, 0.1) 0%, transparent 70%)'
        }} />

        {/* Premium Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          {/* Animated Entrance - Single, Orchestrated Moment */}
          <div className="space-y-8 animate-[fadeInUp_1.2s_ease-out]">
            {/* Tagline - Premium Typography */}
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-gray-300 opacity-80">
              Heritage Fashion • Est. 1994
            </p>

            {/* Main Headline - Ultra Bold, Brand-Locked Gold */}
            <div className="max-w-5xl">
              <h1
                className="text-6xl sm:text-7xl lg:text-8xl font-black uppercase leading-none tracking-tighter drop-shadow-2xl"
                style={{
                  color: '#C4A369',
                  textShadow: `
                    0 4px 20px rgba(0, 0, 0, 0.8),
                    0 0 40px rgba(196, 163, 105, 0.2),
                    2px 2px 4px rgba(0, 0, 0, 0.6)
                  `,
                  letterSpacing: '-0.02em'
                }}
              >
                Take Control
              </h1>
            </div>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed text-gray-200 font-light">
              Original streetwear culture built on legacy, authenticity, and no apologies.
              <span className="block text-sm mt-3 text-gray-400">Since 1994 • For the culture</span>
            </p>

            {/* Premium CTA - Neon Green, Minimal Design */}
            <div className="pt-8">
              <a
                href="#collection"
                className="inline-block px-8 py-4 text-sm font-bold uppercase tracking-wider transition-all duration-300 relative group"
                style={{
                  backgroundColor: '#00FF7F',
                  color: '#050607',
                  boxShadow: '0 0 30px rgba(0, 255, 127, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 60px rgba(0, 255, 127, 0.6), 0 10px 30px rgba(0, 0, 0, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 255, 127, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Shop Collection
                <span className="ml-2">→</span>
              </a>
            </div>
          </div>
        </div>

        {/* Scroll Indicator - Subtle */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .animate-fadeInUp {
          animation: fadeInUp 1.2s ease-out;
        }

        .animate-bounce {
          animation: bounce 2s infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fadeInUp,
          .animate-bounce {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
