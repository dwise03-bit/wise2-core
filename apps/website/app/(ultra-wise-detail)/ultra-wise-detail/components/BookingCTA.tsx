'use client';

import { useState, useEffect } from 'react';

export function BookingCTA() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 980);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <section
      style={{
        background: 'linear-gradient(100deg, #006BB6 0%, #0057a0 55%, #F58426 100%)',
        padding: isMobile ? '28px 20px' : '28px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(115deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 26px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          position: 'relative',
        }}
      >
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? 22 : 'clamp(22px, 2.6vw, 30px)', color: '#F8F9FB', margin: '0 0 4px', letterSpacing: '0.01em' }}>
            READY TO RESTORE. PROTECT. ELEVATE?
          </h2>
          <p style={{ fontSize: 13, fontWeight: 800, color: '#F8F9FB', margin: 0 }}>BOOK YOUR DETAIL TODAY!</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <button
            style={{
              background: '#F58426',
              color: '#030507',
              fontWeight: 900,
              fontSize: 13,
              border: 'none',
              padding: '14px 26px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            BOOK MY DETAIL
          </button>
          <a href="tel:+19177498960" style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#F8F9FB', textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #F8F9FB' }} />
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontWeight: 900, fontSize: 15 }}>(917) 749-8960</div>
              <div style={{ fontSize: 10, opacity: 0.85 }}>Proudly Serving South Florida</div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
