'use client';

import Image from 'next/image';
import { BLAKKHAIL_LEGACY } from '@/lib/sencere/blakkhail-legacy';
import { BLAKKHAIL } from './brand-tokens';

export function BlakkhailHero() {
  // Get the first lookbook/editorial image from legacy assets
  const heroImage = BLAKKHAIL_LEGACY.assets.shopPhotos?.[0] || '/sencere-assets/blakkhail/default-hero.jpg';

  return (
    <section className="relative w-full min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] overflow-hidden">
      {/* Hero Background Image */}
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt="Blakk Hail Heritage - Original Fashion Since 1994"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Dark overlay for text readability */}
        <div
          className="absolute inset-0 opacity-40"
          style={{ backgroundColor: BLAKKHAIL.jetBlack }}
        />
      </div>

      {/* Hero Content - Centered */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        {/* Branded tagline */}
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-6"
          style={{ color: BLAKKHAIL.gold }}
        >
          Original Fashion · Since 1994
        </p>

        {/* Main branding display */}
        <div className="mb-12">
          <h1
            className="text-[56px] sm:text-[72px] lg:text-[96px] font-black uppercase tracking-wider leading-none"
            style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-headers)' }}
          >
            Blakk<br />Hail
          </h1>
        </div>

        {/* Descriptive tagline */}
        <p
          className="text-[14px] sm:text-[16px] max-w-[600px] leading-relaxed"
          style={{ color: BLAKKHAIL.steel }}
        >
          Heritage streetwear & original fashion. Designed for the culture. Built to last.
        </p>

        {/* CTA Button */}
        <div className="mt-12 flex gap-4">
          <a
            href="#collection"
            className="px-8 py-3 font-bold uppercase tracking-wider text-[12px] transition-all hover:opacity-80"
            style={{
              backgroundColor: BLAKKHAIL.gold,
              color: BLAKKHAIL.jetBlack
            }}
          >
            Shop Collection
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <svg
          className="w-6 h-6"
          style={{ color: BLAKKHAIL.gold }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
