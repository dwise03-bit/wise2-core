'use client';

import Image from 'next/image';
import { BLAKKHAIL_LEGACY } from '@/lib/sencere/blakkhail-legacy';
import { BLAKKHAIL } from './brand-tokens';

export function BlakkhailHero() {
  const heroImage = BLAKKHAIL_LEGACY.assets.shopPhotos?.[0] || '/sencere-assets/blakkhail/default-hero.jpg';

  return (
    <section className="relative isolate flex min-h-[min(760px,calc(100svh-112px))] w-full overflow-hidden bg-black group sm:min-h-[600px] lg:min-h-[800px]">
      {/* Background with zoom effect on hover */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={heroImage}
          alt="Blakk Hail Heritage - Original Fashion Since 1994"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-[1.04] transition-transform duration-[1800ms] ease-out group-hover:scale-100"
        />
        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70" />
        <div className="absolute inset-0" style={{ backgroundColor: `${BLAKKHAIL.jetBlack}33` }} />
      </div>

      {/* Light glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-500/10 blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-1000" />

      {/* Always-on atmospheric particles and brief lightning flashes. The effect is
          intentionally CSS-only so it still works when canvas/WebGL is unavailable. */}
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden="true">
        <div className="bh-lightning bh-lightning-one" />
        <div className="bh-lightning bh-lightning-two" />
        <div className="bh-storm-flash" />
        <div className="bh-particles">
          {Array.from({ length: 18 }, (_, index) => (
            <i key={index} style={{ '--i': index } as React.CSSProperties} />
          ))}
        </div>
      </div>

      {/* Featured artwork for the current New Drop. */}
      <div className="pointer-events-none absolute bottom-10 right-[5%] z-[2] hidden w-[clamp(150px,18vw,260px)] rotate-[2deg] overflow-hidden border border-[#D4AF37]/70 shadow-[0_20px_70px_rgba(0,0,0,.7)] md:block">
        <Image
          src="/sencere-assets/blakkhail/blakkhail-new-drop-poster.png"
          alt="Blakk Hail The New Drop — Take Control, No Apologies"
          width={1003}
          height={1568}
          sizes="(min-width: 1280px) 260px, 18vw"
          className="h-auto w-full"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-[inherit] flex-col items-center justify-center px-6 py-24 text-center sm:py-28">
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
            className="w-[min(78vw,620px)] opacity-0 animate-[slideUp_0.9s_ease-out_0.3s_forwards]"
            style={{
              color: BLAKKHAIL.gold,
              fontFamily: 'var(--font-headers)',
              textShadow: `0 20px 40px rgba(0,0,0,0.8), 0 0 60px ${BLAKKHAIL.gold}22`
            }}
          >
            <Image src="/sencere-assets/blakkhail/blakkhail-wordmark-gold.jpg" alt="Blakk Hail" width={1024} height={1024} className="h-auto w-full mix-blend-screen" priority />
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
        <div className="mt-16 flex gap-4 opacity-0 animate-[scaleIn_0.6s_ease-out_0.7s_forwards]">
          <a
            href="#collection"
            className="relative overflow-hidden px-10 py-4 font-bold uppercase tracking-widest text-[11px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl group/btn"
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
          className="h-6 w-6 animate-[bounce_2.5s_ease-in-out_infinite] opacity-70 transition-opacity hover:opacity-100 motion-reduce:animate-none"
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

        .bh-lightning {
          position: absolute;
          top: -4%;
          width: 2px;
          height: 62%;
          opacity: 0;
          filter: drop-shadow(0 0 5px #ffe9a3) drop-shadow(0 0 16px #d4af37);
          background: #fff7d6;
          clip-path: polygon(48% 0, 62% 0, 45% 28%, 72% 28%, 26% 64%, 42% 64%, 0 100%, 18% 60%, 4% 60%, 38% 25%, 27% 25%);
          animation: bhLightning 7s linear infinite;
        }
        .bh-lightning-one { left: 22%; transform: rotate(8deg); }
        .bh-lightning-two { right: 18%; height: 48%; animation-delay: 3.7s; transform: rotate(-10deg) scaleX(.8); }
        .bh-storm-flash { position: absolute; inset: 0; background: rgba(255, 239, 183, .13); opacity: 0; animation: bhFlash 7s linear infinite; }
        .bh-particles { position: absolute; inset: 0; }
        .bh-particles i { position: absolute; left: calc((var(--i) * 5.7%) + 2%); bottom: -4%; width: 2px; height: 2px; border-radius: 50%; background: #f6d77b; box-shadow: 0 0 8px 2px rgba(212,175,55,.8); animation: bhFloat calc(5s + (var(--i) * .35s)) linear infinite; animation-delay: calc(var(--i) * -.6s); }
        @keyframes bhLightning { 0%, 39%, 43%, 100% { opacity: 0; } 40%, 41.5% { opacity: .95; } 42% { opacity: .15; } }
        @keyframes bhFlash { 0%, 39%, 43%, 100% { opacity: 0; } 40%, 41% { opacity: 1; } }
        @keyframes bhFloat { from { transform: translate3d(0, 0, 0) scale(.6); opacity: 0; } 15% { opacity: .7; } to { transform: translate3d(18px, -110vh, 0) scale(1.2); opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .bh-lightning, .bh-storm-flash, .bh-particles i { animation: none; opacity: 0; } }
      `}</style>
    </section>
  );
}
