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
    <div className={`${BLAKKHAIL_LAYOUT.page} scroll-smooth pb-20 md:pb-0`} style={{ backgroundColor: '#0A0A0A', color: '#A8A8A8' }}>
      <BlakkhailHeader />
      <main>
        <section id="home">
          <BlakkhailHero />
        </section>
        <section id="video" className="w-full bg-black py-0" style={{ backgroundColor: '#000000' }}>
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
        <BlakkhailStory />
        <BlakkhailLookBook />
        <section id="shop">
          <BlakkhailStorefront />
        </section>
      </main>
      <BlakkhailFooter />
      <BlakkhailMobileShopBar />
    </div>
  );
}
