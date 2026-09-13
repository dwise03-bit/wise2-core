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
import { BLAKKHAIL_LAYOUT } from '@/components/sencere/blakkhail/brand-tokens';

export default function BlakkhailPage() {
  useEffect(() => {
    // Scroll animations for elements
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in', 'fade-in', 'duration-700');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('[data-scroll]').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className={`${BLAKKHAIL_LAYOUT.page} bh-page scroll-smooth pb-20 md:pb-0`} style={{ backgroundColor: '#0A0A0A', color: '#A8A8A8' }}>
      <div className="bh-page-grid" aria-hidden="true" />
      <div className="bh-global-particles" aria-hidden="true">
        {Array.from({ length: 42 }, (_, index) => (
          <i key={index} style={{ '--i': index } as React.CSSProperties} />
        ))}
      </div>
      <BlakkhailHeader />
      <main>
        <section id="home" className="bh-section bh-section-hero">
          <BlakkhailHero />
        </section>
        <section id="video" className="bh-section w-full bg-black py-0" style={{ backgroundColor: '#000000' }}>
          <div className="w-full aspect-video">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/dDsoB8msubk?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1"
              title="Blakk Hail & UF Commercial"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
          <div className="w-full px-6 py-12 md:py-16" style={{ backgroundColor: '#000000' }}>
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 tracking-tight" style={{ color: '#D4AF37' }}>
                Blakk Hail & UF Commercial
              </h2>
              <p className="text-sm md:text-base leading-relaxed max-w-3xl" style={{ color: '#A8A8A8' }}>
                Experience the creative vision of Blakk Hail. Original fashion, designed for the culture.
              </p>
            </div>
          </div>
        </section>
        <div className="bh-section"><BlakkhailStory /></div>
        <div className="bh-section"><BlakkhailLookBook /></div>
        <section id="shop" className="bh-section">
          <BlakkhailStorefront />
        </section>
      </main>
      <BlakkhailFooter />
      <BlakkhailMobileShopBar />
      <style jsx>{`
        .bh-page { position: relative; isolation: isolate; perspective: 1400px; overflow: hidden; }
        .bh-page-grid { pointer-events: none; position: fixed; inset: 0; z-index: -1; opacity: .16; background-image: linear-gradient(rgba(212,175,55,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,.16) 1px, transparent 1px); background-size: 72px 72px; mask-image: linear-gradient(to bottom, transparent, black 15%, black 80%, transparent); transform: perspective(700px) rotateX(58deg) translateY(18%); transform-origin: center bottom; }
        .bh-global-particles { pointer-events: none; position: fixed; inset: 0; z-index: 5; overflow: hidden; }
        .bh-global-particles i { position: absolute; left: calc((var(--i) * 2.37%) + 1%); top: calc((var(--i) * 7.4%) - 6%); width: 2px; height: 2px; border-radius: 50%; background: #f6d77b; box-shadow: 0 0 9px 2px rgba(212,175,55,.65); opacity: 0; animation: bhPageParticle calc(9s + (var(--i) * .17s)) ease-in-out infinite; animation-delay: calc(var(--i) * -.42s); }
        .bh-section { position: relative; transform-style: preserve-3d; transition: transform 700ms cubic-bezier(.22,1,.36,1), filter 700ms ease; }
        .bh-section::after { content: ''; pointer-events: none; position: absolute; inset: 0; z-index: 20; opacity: .22; background: linear-gradient(105deg, transparent 20%, rgba(255,220,125,.08) 48%, transparent 56%); transform: translateX(-120%); transition: transform 1100ms cubic-bezier(.22,1,.36,1); }
        .bh-section:hover::after { transform: translateX(120%); }
        .bh-page #collection .group { transform: translateZ(0); transform-style: preserve-3d; transition: transform 500ms cubic-bezier(.22,1,.36,1), filter 500ms ease; }
        .bh-page #collection .group:hover { transform: translateY(-10px) rotateY(-2deg) rotateX(1deg); filter: drop-shadow(0 18px 24px rgba(0,0,0,.45)); }
        .bh-page #collection .group > a > div:first-child { transform: translateZ(0); transition: transform 500ms cubic-bezier(.22,1,.36,1), box-shadow 500ms ease; }
        .bh-page #collection .group:hover > a > div:first-child { transform: translateZ(18px); box-shadow: 0 20px 35px rgba(212,175,55,.12); }
        .bh-section-hero { transform: translateZ(0); }
        @media (min-width: 768px) { .bh-section:hover { transform: translateZ(8px) rotateX(.35deg); } }
        @keyframes bhPageParticle { 0%, 100% { opacity: 0; transform: translate3d(0, 12vh, 0) scale(.6); } 18% { opacity: .55; } 50% { opacity: .2; transform: translate3d(18px, -8vh, 0) scale(1); } 82% { opacity: .5; } }
        @media (prefers-reduced-motion: reduce) { .bh-page-grid, .bh-global-particles, .bh-section, .bh-section::after, .bh-page #collection .group, .bh-page #collection .group > a > div:first-child { transform: none; transition: none; animation: none; } }
      `}</style>
    </div>
  );
}
