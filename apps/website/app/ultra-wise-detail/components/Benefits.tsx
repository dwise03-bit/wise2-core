'use client';

import { useState, useEffect } from 'react';

const benefits = [
  { title: 'PREMIUM PRODUCTS', desc: 'We use industry-leading products for superior results.', shape: 'diamond' },
  { title: 'EXPERT TECHNIQUES', desc: 'Skilled, trained, and passionate about perfection.', shape: 'square' },
  { title: 'CONVENIENT SERVICE', desc: 'Mobile & at-location service that fits your schedule.', shape: 'circle' },
  { title: 'SATISFACTION GUARANTEED', desc: 'We stand behind every detail we deliver.', shape: 'diamond' },
  { title: 'CUSTOMER-FIRST FOCUS', desc: 'Your vehicle. Your satisfaction. Our priority.', shape: 'circle' },
];

function ShapeIcon({ shape }: { shape: string }) {
  const base = { width: 16, height: 16, background: '#F58426' as const };
  if (shape === 'circle') return <div style={{ ...base, borderRadius: '50%' }} />;
  if (shape === 'diamond') return <div style={{ ...base, transform: 'rotate(45deg)' }} />;
  return <div style={{ ...base, width: 14, height: 14 }} />;
}

export function Benefits() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 980);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <section style={{ background: '#030507', padding: isMobile ? '44px 20px' : '60px 32px' }}>
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr auto',
          gap: isMobile ? 24 : 32,
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', border: '6px solid #F58426', opacity: 0.5, flexShrink: 0 }} />
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? 26 : 'clamp(26px, 3.2vw, 36px)', lineHeight: 1.05, margin: 0 }}>
            <span style={{ color: '#F8F9FB' }}>WHY CHOOSE</span>
            <br />
            <span style={{ color: '#006BB6' }}>ULTRA WISE DETAIL?</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${isMobile ? 1 : 2}, 1fr)`, gap: 18 }}>
          {benefits.map((b) => (
            <div key={b.title} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: 'rgba(245,132,38,0.1)',
                  border: '1px solid rgba(245,132,38,0.4)',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShapeIcon shape={b.shape} />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 900, color: '#F8F9FB', margin: '0 0 4px', letterSpacing: '0.02em' }}>{b.title}</p>
                <p style={{ fontSize: 11, color: '#8b909a', margin: 0, lineHeight: 1.4 }}>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            border: '1px solid #F58426',
            padding: '16px 20px',
            textAlign: 'center',
            justifySelf: isMobile ? 'start' : 'end',
            boxShadow: '0 0 30px rgba(245,132,38,0.08)',
          }}
        >
          <div style={{ color: '#F58426', fontSize: 16, letterSpacing: 2, marginBottom: 6 }}>&#9733;&#9733;&#9733;&#9733;&#9733;</div>
          <p style={{ fontSize: 12, fontWeight: 900, color: '#F8F9FB', margin: '0 0 12px', lineHeight: 1.5 }}>TRUSTED BY CAR OWNERS</p>
          <p style={{ fontSize: 12, fontWeight: 900, color: '#F8F9FB', margin: '0 0 12px', lineHeight: 1.5 }}>ACROSS SOUTH FLORIDA.</p>
          <p style={{ fontSize: 11, color: '#F58426', fontWeight: 700, margin: 0 }}>Quality. Integrity. Results.</p>
        </div>
      </div>
    </section>
  );
}
