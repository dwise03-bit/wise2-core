'use client';

import { useState, useEffect } from 'react';

const transformations = [
  { title: 'WHITE SEDAN DETAIL', img: '/images/ultra-wise-detail/uwd-white-sedan.png' },
  { title: 'BLUE SPORTS CAR DETAIL', img: '/images/ultra-wise-detail/uwd-blue-sports.png' },
  { title: 'HEADLIGHT RESTORATION', img: '/images/ultra-wise-detail/uwd-headlight-v2.png' },
  { title: 'PAINT CORRECTION', img: '/images/ultra-wise-detail/uwd-paint-correction-v3.png' },
];

export function Transformations() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 980);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <section style={{ background: 'linear-gradient(to bottom, #030507, #0b0e12)', padding: isMobile ? '44px 20px' : '60px 32px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', color: '#006BB6' }}>
            <span style={{ width: 16, height: 2, background: '#006BB6', display: 'inline-block' }} />
            PROVEN RESULTS
            <span style={{ width: 16, height: 2, background: '#006BB6', display: 'inline-block' }} />
          </span>
        </div>
        <h2 style={{ textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? 32 : 'clamp(32px, 4vw, 44px)', color: '#F8F9FB', margin: '0 0 32px' }}>
          TRANSFORMATIONS
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${isMobile ? 2 : 4}, 1fr)`, gap: 16 }}>
          {transformations.map((t) => (
            <div key={t.title} style={{ background: '#030507', border: '1.5px solid #1c1f24' }}>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '245/106', overflow: 'hidden' }}>
                <img src={t.img} alt={`${t.title} before and after`} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.9) brightness(0.95)' }} />
                <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 30px 6px rgba(0,0,0,0.55)' }} />
              </div>
              <div style={{ padding: '12px 14px', borderTop: '1px solid #1c1f24' }}>
                <p style={{ fontSize: 12, fontWeight: 900, color: '#006BB6', margin: 0 }}>{t.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
