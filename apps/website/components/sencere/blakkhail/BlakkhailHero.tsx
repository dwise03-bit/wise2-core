'use client';

import Image from 'next/image';
import { BLAKKHAIL_LEGACY } from '@/lib/sencere/blakkhail-legacy';

export function BlakkhailHero() {
  return (
    <section className="relative w-full overflow-hidden bg-black">
      {/* SenCere Creative Apparel Hero */}
      <div className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Background dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black/95" />

        {/* Left model - beige hoodie */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/3 h-full opacity-95 animate-[fadeInUp_1.2s_ease-out]">
          <Image
            src="/sencere-assets/blakkhail/model-left.webp"
            alt="SenCere Creative Apparel"
            fill
            priority
            className="object-cover object-center"
            quality={100}
          />
        </div>

        {/* Center badge - SenCere Creative Red Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 animate-[fadeInDown_1.2s_ease-out]">
          <div className="w-64 h-64 flex items-center justify-center">
            <Image
              src="/sencere-assets/blakkhail/sencere-badge-2026.webp"
              alt="SenCere Creative 2026"
              width={280}
              height={280}
              priority
              className="object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Right model - dreadlocks */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-full opacity-95 animate-[fadeInUp_1.2s_ease-out_0.1s_forwards]" style={{ animation: 'fadeInUp 1.2s ease-out 0.1s forwards' }}>
          <Image
            src="/sencere-assets/blakkhail/model-right.webp"
            alt="SenCere Creative Apparel"
            fill
            priority
            className="object-cover object-center"
            quality={100}
          />
        </div>

        {/* Gold glow from badge */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 blur-3xl pointer-events-none" />

        {/* Text Overlay - Below models */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-center z-20 animate-[fadeInUp_1.4s_ease-out_0.2s_forwards]" style={{ animation: 'fadeInUp 1.4s ease-out 0.2s forwards' }}>
          <div className="space-y-6 max-w-2xl">
            {/* Tagline */}
            <div className="space-y-3">
              <p className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-red-500/90">
                SenCere Creative
              </p>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase leading-tight tracking-tighter" style={{ color: '#C4A369' }}>
                Take Control
              </h2>
              <p className="text-sm sm:text-base font-black uppercase tracking-widest" style={{ color: '#00D9FF' }}>
                No Apologies
              </p>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto font-light">
              Legacy apparel. Original designs. Built for the culture.
            </p>

            {/* CTA Button */}
            <div className="pt-4">
              <a
                href="#collection"
                className="inline-block px-10 py-4 text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-400"
                style={{
                  backgroundColor: '#00FF7F',
                  color: '#050607',
                  boxShadow: '0 0 40px rgba(0, 255, 127, 0.5), 0 20px 50px rgba(0, 0, 0, 0.6)',
                  border: '2px solid #00FF7F'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 80px rgba(0, 255, 127, 0.8), 0 30px 70px rgba(0, 0, 0, 0.7), inset 0 0 20px rgba(0, 255, 127, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 255, 127, 0.5), 0 20px 50px rgba(0, 0, 0, 0.6)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Shop Collection →
              </a>
            </div>
          </div>
        </div>

        {/* Premium scroll indicator with pulse */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20">
          <div className="animate-[bounce_3s_ease-in-out_infinite] text-center">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Scroll</p>
            <svg
              className="w-6 h-6 mx-auto text-gray-400"
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
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(60px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
