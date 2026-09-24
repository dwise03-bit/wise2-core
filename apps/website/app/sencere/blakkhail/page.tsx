'use client';

import { useEffect } from 'react';
import { BlakkhailHeader } from '@/components/sencere/blakkhail/BlakkhailHeader';
import { BlakkhailHero } from '@/components/sencere/blakkhail/BlakkhailHero';
import { BlakkhailFeaturedVideo } from '@/components/sencere/blakkhail/BlakkhailFeaturedVideo';
import { BlakkhailStory } from '@/components/sencere/blakkhail/BlakkhailStory';
import { BlakkhailLookBook } from '@/components/sencere/blakkhail/BlakkhailMedia';
import { BlakkhailStorefront } from '@/components/sencere/blakkhail/BlakkhailStorefront';
import { BlakkhailFooter } from '@/components/sencere/blakkhail/BlakkhailFooter';
import { BlakkhailMobileShopBar } from '@/components/sencere/blakkhail/BlakkhailMobileShopBar';
import { BlakkhailTrust } from '@/components/sencere/blakkhail/BlakkhailTrust';
import { BLAKKHAIL_LAYOUT } from '@/components/sencere/blakkhail/brand-tokens';
import { BlakkhailHeritage } from '@/components/sencere/blakkhail/BlakkhailHeritage';
import { BlakkhailDropTimeline } from '@/components/sencere/blakkhail/BlakkhailDropTimeline';
import { BlakkhailTestimonials } from '@/components/sencere/blakkhail/BlakkhailTestimonials';
import { BlakkhailPhilosophy } from '@/components/sencere/blakkhail/BlakkhailPhilosophy';

export default function BlakkhailPage() {
  useEffect(() => {
    // Aggressively hide trading dashboard elements
    const hideTrading = () => {
      // Remove all elements with trading-related classes
      document.querySelectorAll(`
        [class*="trading"],
        [class*="dashboard"],
        [class*="chart"],
        [class*="wise"],
        [class*="market"],
        [id*="trading"],
        [id*="dashboard"],
        [id*="wise"],
        aside,
        nav[role="navigation"]
      `).forEach(el => {
        if (el && el.parentNode) {
          // Check if it's not part of BLAKKHAIL structure
          if (!el.closest('.bh-')) {
            el.style.display = 'none';
            el.remove();
          }
        }
      });
    };

    // Run immediately and watch for new additions
    hideTrading();
    const observer = new MutationObserver(hideTrading);
    observer.observe(document.body, { childList: true, subtree: true });

    // Scroll animations for elements
    const scrollObserverOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in', 'fade-in', 'duration-700');
          scrollObserver.unobserve(entry.target);
        }
      });
    }, scrollObserverOptions);

    document.querySelectorAll('[data-scroll]').forEach(el => {
      scrollObserver.observe(el);
    });

    let frame = 0;
    const updateScrollDepth = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        document.documentElement.style.setProperty('--bh-scroll-progress', max > 0 ? `${window.scrollY / max}` : '0');
      });
    };
    updateScrollDepth();
    window.addEventListener('scroll', updateScrollDepth, { passive: true });

    return () => {
      observer.disconnect();
      scrollObserver.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateScrollDepth);
    };
  }, []);

  return (
    <>
      <style>{`
        /* NUCLEAR: Hide everything except BLAKKHAIL */
        body { background: #0A0A0A !important; }
        body > div:not(.bh-page) { display: none !important; }
        body > main:not(.bh-page) { display: none !important; }
        body > section:not(.bh-page) { display: none !important; }
        body > * { display: none !important; visibility: hidden !important; }
        .bh-page { display: block !important; visibility: visible !important; }

        /* Hide by name pattern */
        [class*="trading"], [class*="dashboard"], [class*="chart"],
        [class*="wise2"], [class*="wise-"], aside, nav { display: none !important; }
      `}</style>
      <div className={`${BLAKKHAIL_LAYOUT.page} bh-page scroll-smooth pb-20 md:pb-0`} style={{ backgroundColor: '#0A0A0A', color: '#A8A8A8' }}>
      <div className="bh-page-grid" aria-hidden="true" />
      <div className="bh-global-particles" aria-hidden="true">
        {Array.from({ length: 42 }, (_, index) => (
          <i key={index} style={{ '--i': index } as React.CSSProperties} />
        ))}
      </div>
      <div className="bh-hailfall" aria-hidden="true">
        {Array.from({ length: 32 }, (_, index) => <i key={index} style={{ '--i': index } as React.CSSProperties} />)}
      </div>
      <div className="bh-storm-overlay" aria-hidden="true"><span className="bh-global-bolt" /></div>
      <div className="bh-scroll-rail" aria-hidden="true"><span /></div>
      <BlakkhailHeader />
      <main>
        <section id="home" className="bh-section bh-section-hero">
          <BlakkhailHero />
        </section>

        <section id="philosophy" className="bh-section">
          <BlakkhailPhilosophy />
        </section>

        <section id="video" className="bh-section w-full bg-black py-0" style={{ backgroundColor: '#000000' }}>
          <div className="bh-split-stage mx-auto grid max-w-[1400px] items-stretch gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[1.3fr_.7fr] lg:gap-12 lg:px-12 lg:py-28">
            <div className="bh-video-panel relative overflow-hidden border border-[#8C6518]/70 bg-[#090909] p-2 sm:p-3">
              <div className="aspect-video overflow-hidden bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/dDsoB8msubk?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1"
                  title="Blakk Hail & UF Commercial"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              </div>
              <span className="bh-panel-index">01 / FILM</span>
            </div>
            <article className="bh-drop-panel relative flex min-h-[360px] flex-col justify-between overflow-hidden border border-[#8C6518]/70 bg-[#15120c] p-7 sm:p-10">
              <div className="absolute -right-12 -top-10 h-48 w-48 rounded-full bg-[#D4AF37]/10 blur-3xl" aria-hidden="true" />
              <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#D4AF37]">02 / THE DROP</p>
                <h2 className="mt-6 max-w-sm text-3xl font-black uppercase leading-[.95] tracking-[.06em] text-white sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
                  Take control.<br />No apologies.
                </h2>
                <p className="mt-6 max-w-sm text-sm leading-7 text-[#A8A8A8]">
                  The latest Blakk Hail pieces are built from hand-distressed graphics, utility layers, and Atlanta energy.
                </p>
              </div>
              <div className="relative z-10 mt-10 flex items-end justify-between gap-4">
                <a href="#collection" className="border border-[#D4AF37] px-4 py-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#D4AF37] transition-colors hover:bg-[#D4AF37] hover:text-black">Enter the drop ↗</a>
                <span className="text-right text-[10px] uppercase tracking-[.2em] text-[#777]">BLAKK<br />HAIL / 2026</span>
              </div>
            </article>
          </div>
        </section>

        <section id="heritage" className="bh-section">
          <BlakkhailHeritage />
        </section>

        <div className="bh-section"><BlakkhailStory /></div>

        <section id="drops" className="bh-section">
          <BlakkhailDropTimeline />
        </section>

        <div className="bh-section"><BlakkhailLookBook /></div>

        <section id="testimonials" className="bh-section">
          <BlakkhailTestimonials />
        </section>

        <div className="bh-section"><BlakkhailTrust /></div>

        <section id="shop" className="bh-section">
          <BlakkhailStorefront />
        </section>
      </main>
      <BlakkhailFooter />
      <BlakkhailMobileShopBar />
      <style jsx>{`
        /* 4K HYPER-REALISTIC RENDERING */
        * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }

        .bh-page {
          position: relative;
          isolation: isolate;
          perspective: 1400px;
          width: 100%;
          max-width: 100vw;
          min-width: 0;
          overflow-x: clip;
          background: linear-gradient(135deg, #0A0A0A 0%, #0F0F0F 50%, #0A0A0A 100%);
          filter: contrast(1.05) brightness(1.02);
        }
        .bh-page main, .bh-page header, .bh-page footer { width: 100%; max-width: 100vw; min-width: 0; }
        .bh-page-grid { pointer-events: none; position: fixed; inset: 0; z-index: -1; opacity: .12; background-image: linear-gradient(rgba(212,175,55,.22) 0.5px, transparent 0.5px), linear-gradient(90deg, rgba(212,175,55,.22) 0.5px, transparent 0.5px); background-size: 80px 80px; mask-image: linear-gradient(to bottom, transparent, black 12%, black 88%, transparent); transform: perspective(1200px) rotateX(65deg) translateY(15%); transform-origin: center bottom; filter: drop-shadow(0 0 30px rgba(212,175,55,0.3)); }
        .bh-global-particles { pointer-events: none; position: fixed; inset: 0; z-index: 5; overflow: hidden; filter: blur(0.3px); }
        .bh-global-particles i { position: absolute; left: calc((var(--i) * 2.37%) + 1%); top: calc((var(--i) * 7.4%) - 6%); width: 3px; height: 3px; border-radius: 50%; background: radial-gradient(circle, #fffbe6 0%, #f6d77b 70%); box-shadow: 0 0 15px 3px rgba(212,175,55,.8), 0 0 40px 8px rgba(212,175,55,.4); opacity: 0; animation: bhPageParticle calc(13s + (var(--i) * .21s)) ease-in-out infinite; animation-delay: calc(var(--i) * -.58s); }
        .bh-hailfall { pointer-events: none; position: fixed; inset: 0; z-index: 6; overflow: hidden; perspective: 1200px; filter: brightness(1.1) drop-shadow(0 0 20px rgba(212,175,55,0.2)); }
        .bh-hailfall i { position: absolute; left: calc((var(--i) * 3.11%) - 2%); top: -8vh; width: 8px; height: 19px; border-radius: 45% 55% 60% 40%; background: linear-gradient(160deg, #fffbe6 0 15%, #f6d77b 32%, #d4af37 55%, #4a3c1f 85%, #29200d 100%); box-shadow: 0 0 8px 2px rgba(255,246,190,1), 0 0 20px 5px rgba(212,175,55,.75), 2px 6px 16px rgba(0,0,0,.98), inset -1px -1px 3px rgba(255,255,255,.3); opacity: .92; transform: rotate(calc((var(--i) * 19deg) - 20deg)); animation: bhHail calc(7s + (var(--i) * .19s)) linear infinite; animation-delay: calc(var(--i) * -.57s); }
        .bh-hailfall i::after { content: ''; position: absolute; top: 11px; left: 2px; width: 2px; height: 26px; background: linear-gradient(#fffbe6, rgba(212,175,55,.8), rgba(212,175,55,.3), transparent); filter: blur(.3px); opacity: .95; transform: rotate(18deg); box-shadow: 0 0 4px rgba(255,246,190,.8); }
        .bh-storm-overlay { pointer-events: none; position: fixed; inset: 0; z-index: 7; opacity: 0; background: linear-gradient(135deg, rgba(241,217,153,.18), rgba(212,175,55,.12), rgba(241,217,153,.15)); mix-blend-mode: screen; animation: bhGlobalFlash 7s linear infinite, bhStormWind 4s ease-in-out infinite; filter: drop-shadow(0 0 40px rgba(212,175,55,0.15)); }
        .bh-global-bolt { position: absolute; top: -5%; right: 24%; width: 4px; height: 57vh; background: linear-gradient(to bottom, #fffbe6, #f6d77b, #d4af37); clip-path: polygon(55% 0, 100% 0, 60% 29%, 83% 29%, 21% 67%, 40% 67%, 0 100%, 19% 62%, 2% 62%, 42% 25%, 24% 25%); filter: drop-shadow(0 0 12px #fffbe6) drop-shadow(0 0 30px #f6d77b) drop-shadow(0 0 50px #d4af37) brightness(1.3); transform: rotate(-7deg); animation: bhLightning 8s ease-in-out infinite; }
        .bh-scroll-rail { pointer-events: none; position: fixed; right: 18px; top: 22vh; z-index: 9; width: 3px; height: 56vh; background: rgba(212,175,55,.25); border-radius: 2px; box-shadow: inset 0 0 8px rgba(212,175,55,.3), 0 0 15px rgba(212,175,55,.15); }
        .bh-scroll-rail span { display: block; width: 100%; height: calc(var(--bh-scroll-progress, 0) * 100%); background: linear-gradient(180deg, #f6d77b 0%, #d4af37 50%, #8b7420 100%); box-shadow: 0 0 16px #d4af37, 0 0 32px rgba(212,175,55,.6), inset 0 0 4px rgba(255,255,255,.3); transform-origin: top; border-radius: 2px; filter: brightness(1.2); }
        .bh-section { position: relative; width: 100%; min-width: 0; transform-style: preserve-3d; }
        .bh-split-stage { perspective: 1400px; }
        .bh-video-panel, .bh-drop-panel { transform: translateZ(0) rotateX(0) rotateY(0); transform-style: preserve-3d; box-shadow: 0 40px 100px rgba(0,0,0,.65), 0 0 60px rgba(212,175,55,.15), inset 0 0 0 1px rgba(255,220,125,.12); transition: transform 700ms cubic-bezier(.22,1,.36,1), box-shadow 700ms ease; }
        .bh-video-panel::before, .bh-drop-panel::before { content: ''; pointer-events: none; position: absolute; inset: 0; z-index: 2; background: linear-gradient(135deg, rgba(255,240,180,.16), transparent 22%, transparent 75%, rgba(0,0,0,.4)); opacity: .65; }
        .bh-video-panel:hover { transform: translateZ(32px) rotateY(-1.5deg) rotateX(.5deg); box-shadow: 0 50px 120px rgba(0,0,0,.8), 0 0 60px rgba(212,175,55,.2), inset 0 0 30px rgba(212,175,55,.08); }
        .bh-drop-panel:hover { transform: translateZ(40px) rotateY(1.8deg) rotateX(-.7deg); box-shadow: 0 50px 120px rgba(0,0,0,.8), 0 0 70px rgba(212,175,55,.25), inset 0 0 30px rgba(212,175,55,.1); }
        .bh-panel-index { position: absolute; bottom: 14px; left: 18px; z-index: 3; color: rgba(255,255,255,.55); font-size: 9px; font-weight: 700; letter-spacing: .22em; }
        .bh-section::after { content: ''; pointer-events: none; position: absolute; inset: 0; z-index: 20; opacity: .12; background: linear-gradient(105deg, transparent 18%, rgba(255,220,125,.12) 45%, transparent 58%); mix-blend-mode: overlay; }
        .bh-page #collection .group { transform: translateZ(0); transform-style: preserve-3d; transition: transform 500ms cubic-bezier(.22,1,.36,1), filter 500ms ease; }
        .bh-page #collection .group:hover { transform: translateY(-12px) rotateY(-2.2deg) rotateX(1.2deg); filter: drop-shadow(0 24px 32px rgba(0,0,0,.5)) brightness(1.05); }
        .bh-page #collection .group > a > div:first-child { transform: translateZ(0); transition: transform 500ms cubic-bezier(.22,1,.36,1), box-shadow 500ms ease; }
        .bh-page #collection .group:hover > a > div:first-child { transform: translateZ(24px); box-shadow: 0 28px 48px rgba(212,175,55,.18), 0 0 40px rgba(212,175,55,.1); }
        .bh-section-hero { transform: translateZ(0); }
        @media (min-width: 768px) { .bh-section:hover { filter: brightness(1.02); } }
        @keyframes bhPageParticle { 0%, 100% { opacity: 0; transform: translate3d(0, 12vh, 0) scale(.6); } 18% { opacity: .55; } 50% { opacity: .2; transform: translate3d(18px, -8vh, 0) scale(1); } 82% { opacity: .5; } }
        @keyframes bhHail { 0% { opacity: 0; transform: translate3d(0, -12vh, -80px) rotate(0deg); } 10% { opacity: .8; } 88% { opacity: .72; } 100% { opacity: 0; transform: translate3d(calc((var(--i) * 7px) - 80px), 118vh, 140px) rotate(520deg); } }
        @keyframes bhGlobalFlash { 0%, 31%, 34%, 63%, 66%, 100% { opacity: 0; } 32%, 33%, 64%, 65% { opacity: 1; } }
        @keyframes bhStormWind { 0%, 100% { backdrop-filter: blur(0px); } 50% { backdrop-filter: blur(2px); } }
        @keyframes bhLightning { 0%, 100% { opacity: 0; transform: rotate(-7deg) scaleY(0.95); } 15% { opacity: 0.8; transform: rotate(-7deg) scaleY(1); } 16% { opacity: 0; } 50% { opacity: 0; } 65% { opacity: 0.9; transform: rotate(-7deg) scaleY(1.02); } 66% { opacity: 0; transform: rotate(-7deg) scaleY(0.95); } }
        @media (max-width: 767px) { .bh-hailfall i { opacity: .52; } .bh-scroll-rail { right: 8px; } .bh-page { perspective: none; } .bh-split-stage { perspective: none; } .bh-video-panel:hover, .bh-drop-panel:hover { transform: none; } }
        @media (prefers-reduced-motion: reduce) { .bh-page-grid, .bh-global-particles, .bh-hailfall, .bh-storm-overlay, .bh-scroll-rail, .bh-section, .bh-section::after, .bh-page #collection .group, .bh-page #collection .group > a > div:first-child { transform: none; transition: none; animation: none; } .bh-hailfall, .bh-storm-overlay { display: none; } }
      `}</style>
    </div>
    </>
  );
}
