'use client';

import Image from 'next/image';
import { BLAKKHAIL_LEGACY } from '@/lib/sencere/blakkhail-legacy';

export function BlakkhailHero() {
  const heroImage = BLAKKHAIL_LEGACY.assets.dropAd || '/sencere-assets/blakkhail/hero-4k.jpg';

  return (
    <section className="relative w-full overflow-hidden bg-black">
      {/* Full-screen 4K image with premium depth */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* Main Image - crisp and dramatic */}
        <Image
          src={heroImage}
          alt="Blakk Hail Heritage - Original Fashion Since 1994"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-100 transition-transform duration-1000 ease-out hover:scale-110"
          quality={100}
        />

        {/* Premium Cinematic Layering - Multiple depth stages */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/30 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
        
        {/* Luxury vignette effect */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.5) 100%)'
        }} />

        {/* Gold glow emanation from center */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(196, 163, 105, 0.15) 0%, transparent 70%)'
        }} />

        {/* Cyan accent glow (top right) */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-3xl opacity-40" />

        {/* Premium Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center z-10">
          <div className="space-y-10 max-w-5xl animate-[fadeInUp_1.4s_ease-out]">
            {/* Premium Eyebrow - Ultra refined */}
            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-black uppercase tracking-[0.35em] text-gray-300 opacity-90">
                Heritage Fashion
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-yellow-600/50" />
                <p className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: '#C4A369' }}>
                  Est. 1994
                </p>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-yellow-600/50" />
              </div>
            </div>

            {/* Ultra-Bold Main Headline - Maximalist */}
            <div className="space-y-4">
              <h1
                className="text-7xl sm:text-8xl lg:text-9xl font-black uppercase leading-none tracking-tighter drop-shadow-2xl"
                style={{
                  color: '#C4A369',
                  textShadow: `
                    0 4px 30px rgba(0, 0, 0, 0.9),
                    0 0 60px rgba(196, 163, 105, 0.4),
                    0 0 100px rgba(196, 163, 105, 0.15),
                    3px 3px 8px rgba(0, 0, 0, 0.8)
                  `,
                  letterSpacing: '-0.03em'
                }}
              >
                Take Control
              </h1>
              
              {/* Premium divider */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <div className="h-0.5 w-12 bg-gradient-to-r from-transparent to-cyan-400/60" />
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#00D9FF' }} />
                <div className="h-0.5 w-12 bg-gradient-to-l from-transparent to-cyan-400/60" />
              </div>
            </div>

            {/* Premium Subheading - Rich typography */}
            <p className="text-xl sm:text-2xl max-w-3xl mx-auto leading-relaxed text-gray-200 font-light tracking-wide">
              Original streetwear culture built on legacy, authenticity, and no apologies.
              <span className="block text-sm mt-4 text-gray-400 font-light tracking-wider">Since 1994 • For the culture • No compromises</span>
            </p>

            {/* Premium CTA - Maximalist button */}
            <div className="pt-8">
              <a
                href="#collection"
                className="inline-block px-12 py-6 text-sm font-black uppercase tracking-widest transition-all duration-400 relative group"
                style={{
                  backgroundColor: '#00FF7F',
                  color: '#050607',
                  boxShadow: '0 0 40px rgba(0, 255, 127, 0.5), 0 20px 50px rgba(0, 0, 0, 0.6)',
                  border: '2px solid #00FF7F'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 80px rgba(0, 255, 127, 0.8), 0 30px 70px rgba(0, 0, 0, 0.7), inset 0 0 20px rgba(0, 255, 127, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 255, 127, 0.5), 0 20px 50px rgba(0, 0, 0, 0.6)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  Shop Collection
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
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
