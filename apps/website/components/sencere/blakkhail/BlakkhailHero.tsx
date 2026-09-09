'use client';

import Image from 'next/image';
import { BLAKKHAIL_LEGACY } from '@/lib/sencere/blakkhail-legacy';
import { BLAKKHAIL } from './brand-tokens';

export function BlakkhailHero() {
  const heroImage = BLAKKHAIL_LEGACY.assets.shopPhotos?.[0] || '/sencere-assets/blakkhail/default-hero.jpg';

  return (
    <section className="relative w-full min-h-[500px] sm:min-h-[600px] lg:min-h-[800px] overflow-hidden group">
      {/* Background with zoom effect on hover */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={heroImage}
          alt="Blakk Hail Heritage - Original Fashion Since 1994"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-110 group-hover:scale-100 transition-transform duration-[2000ms] ease-out"
        />
        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70" />
        <div className="absolute inset-0" style={{ backgroundColor: `${BLAKKHAIL.jetBlack}33` }} />
      </div>

      {/* Light glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-500/10 blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-1000" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        {/* Tagline */}
        <p
          className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] mb-8 opacity-0 animate-[fadeIn_0.8s_ease-out_0.2s_forwards]"
          style={{ color: BLAKKHAIL.gold }}
        >
          ORIGINAL FASHION • SINCE 1994
        </p>

        {/* Main Headline */}
        <div className="mb-12 overflow-hidden">
          <h1
            className="text-[64px] sm:text-[80px] lg:text-[120px] font-black uppercase tracking-tighter leading-none opacity-0 animate-[slideUp_0.9s_cubic-bezier(0.34,1.56,0.64,1)_0.3s_forwards]"
            style={{
              color: BLAKKHAIL.gold,
              fontFamily: 'var(--font-headers)',
              textShadow: `0 20px 40px rgba(0,0,0,0.8), 0 0 60px ${BLAKKHAIL.gold}22`
            }}
          >
            Blakk<span className="block -mt-4">Hail</span>
          </h1>
        </div>

        {/* Subheading */}
        <p
          className="text-[13px] sm:text-[15px] max-w-[650px] leading-relaxed font-light opacity-0 animate-[fadeIn_0.8s_ease-out_0.5s_forwards]"
          style={{ color: BLAKKHAIL.steel }}
        >
          Heritage streetwear & original fashion.<br />
          <span style={{ color: BLAKKHAIL.gold }}>Designed for the culture.</span> Built to last.
        </p>

        {/* CTA Button */}
        <div className="mt-16 flex gap-4 opacity-0 animate-[scaleIn_0.6s_cubic-bezier(0.34,1.56,0.64,1)_0.7s_forwards]">
          <a
            href="#collection"
            className="px-10 py-4 font-bold uppercase tracking-widest text-[11px] transition-all duration-300 hover:scale-110 hover:shadow-2xl relative group/btn overflow-hidden"
            style={{
              backgroundColor: BLAKKHAIL.gold,
              color: BLAKKHAIL.jetBlack,
              boxShadow: `0 10px 40px ${BLAKKHAIL.gold}44`
            }}
          >
            <span className="relative z-10">Shop Collection</span>
            <div className="absolute inset-0 bg-white/30 scale-x-0 group-hover/btn:scale-x-100 origin-left transition-transform duration-500" />
          </a>
        </div>
      </div>

      {/* Animated scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <svg
          className="w-6 h-6 animate-[bounce_2.5s_cubic-bezier(0.68,-0.55,0.265,1.55)_infinite] opacity-70 hover:opacity-100 transition-opacity"
          style={{ color: BLAKKHAIL.gold }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(60px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.85);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </section>
  );
}
