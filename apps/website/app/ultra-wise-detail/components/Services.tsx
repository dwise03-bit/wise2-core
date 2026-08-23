'use client';

import { useState, useEffect } from 'react';
import { Wind, Sparkles, Zap, Shield, Droplets, Plus } from 'lucide-react';

const services = [
  {
    title: 'EXPRESS REFRESH',
    desc: 'Quick exterior clean to keep your car looking its best.',
    img: '/images/ultra-wise-detail/uwd-svc-express-refresh.png',
  },
  {
    title: 'INTERIOR RESET',
    desc: 'Refresh & sanitize your interior for a clean, comfortable ride.',
    img: '/images/ultra-wise-detail/uwd-svc-interior-reset.png',
  },
  {
    title: 'FULL DETAIL',
    desc: 'Interior & exterior detailing for a showroom finish.',
    img: '/images/ultra-wise-detail/uwd-svc-full-detail.png',
  },
  {
    title: 'PAINT ENHANCEMENT',
    desc: 'Remove swirl marks & bring back depth, gloss & clarity.',
    icon: Zap,
  },
  {
    title: 'CERAMIC PROTECTION',
    desc: 'Long-lasting protection with hydrophobic ceramic coatings.',
    icon: Shield,
  },
  {
    title: 'DEEP INTERIOR RECOVERY',
    desc: 'Deep clean, stain removal & odor elimination.',
    icon: Droplets,
  },
  {
    title: 'ADD-ONS',
    desc: 'Headlight restoration, engine bay cleaning, pet hair removal & more.',
    icon: Plus,
  },
];

export function Services() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 980);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <section style={{ background: '#030507', padding: isMobile ? '44px 20px' : '60px 32px', position: 'relative' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', color: '#F58426' }}>
            <span style={{ width: 16, height: 2, background: '#F58426', display: 'inline-block' }} />
            WHAT WE OFFER
            <span style={{ width: 16, height: 2, background: '#F58426', display: 'inline-block' }} />
          </span>
        </div>
        <h2 style={{ textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? 32 : 'clamp(32px, 4vw, 44px)', margin: '0 0 32px' }}>
          <span style={{ color: '#F8F9FB' }}>OUR </span>
          <span style={{ color: '#006BB6' }}>SERVICES</span>
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${isMobile ? 2 : 4}, 1fr)`,
            gap: 16,
          }}
        >
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                style={{
                  background: 'linear-gradient(to bottom right, #101215, #030507)',
                  border: '1.5px solid #1c1f24',
                  borderTop: '2px solid #F58426',
                  padding: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {s.img ? (
                  <div style={{ position: 'relative', width: 'calc(100% + 36px)', height: 78, borderRadius: 3, overflow: 'hidden', margin: '-18px -18px 14px' }}>
                    <img src={s.img} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.95) brightness(1.05) contrast(1.05)' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 55%, rgba(16,18,21,0.55) 85%, #101215 100%)' }} />
                  </div>
                ) : (
                  <div style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'rgba(0,107,182,0.12)',
                        border: '1px solid rgba(0,107,182,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {Icon && <Icon size={22} color="#006BB6" />}
                    </div>
                  </div>
                )}
                <h3 style={{ fontSize: 13, fontWeight: 900, color: '#F8F9FB', margin: '0 0 8px', letterSpacing: '0.01em' }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: 12, color: '#8b909a', margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
