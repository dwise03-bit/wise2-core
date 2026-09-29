'use client';

import Image from 'next/image';
import { BLAKKHAIL_LEGACY } from '@/lib/sencere/blakkhail-legacy';

export function BlakkhailHero() {
  return (
    <section className="relative w-full overflow-hidden bg-black">
      {/* SenCere Creative Composite Hero */}
      <div className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Full hero composite background */}
        <Image
          src="/sencere-assets/blakkhail/sencere-hero-composite.webp"
          alt="SenCere Creative 2026 - Take Control No Apologies"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center animate-[fadeIn_1.2s_ease-out]"
          quality={100}
        />

        {/* Overlay gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

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
                  backgroundColor: '#C4A369',
                  color: '#050607',
                  boxShadow: '0 0 40px rgba(196, 163, 105, 0.5), 0 20px 50px rgba(0, 0, 0, 0.6)',
                  border: '2px solid #C4A369'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 80px rgba(196, 163, 105, 0.8), 0 30px 70px rgba(0, 0, 0, 0.7), inset 0 0 20px rgba(196, 163, 105, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 40px rgba(196, 163, 105, 0.5), 0 20px 50px rgba(0, 0, 0, 0.6)';
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
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
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
