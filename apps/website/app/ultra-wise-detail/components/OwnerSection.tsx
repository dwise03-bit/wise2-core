'use client';

import { useState, useEffect } from 'react';

export function OwnerSection() {
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
        background: 'linear-gradient(to bottom, #030507, #0b0e12)',
        padding: isMobile ? '40px 20px' : '56px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '10%',
          right: -100,
          width: 320,
          height: 320,
          background: 'radial-gradient(circle, rgba(245,132,38,0.10), transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(220px,300px) minmax(280px,1fr) minmax(180px,240px)',
          gap: isMobile ? 28 : 36,
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              top: -10,
              left: 4,
              zIndex: 2,
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
              fontSize: 13,
              color: '#F58426',
              lineHeight: 1.3,
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            }}
          >
            Once a Knick,
            <br />
            Always a Knick
          </div>
          <div
            style={{
              width: '100%',
              aspectRatio: '1/1',
              border: '1px solid rgba(245,132,38,0.5)',
              overflow: 'hidden',
              borderRadius: 4,
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            }}
          >
            <img
              src="/images/ultra-wise-detail/ronald-wise.jpg"
              alt="Ronald Wise, owner"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 32%' }}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: -10,
              left: -10,
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#F58426',
              opacity: 0.9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(245,132,38,0.4)',
            }}
          >
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#030507' }} />
          </div>
        </div>

        <div>
          <p style={{ fontSize: 11, color: '#6b7280', letterSpacing: '0.12em', margin: '0 0 4px', fontWeight: 700 }}>
            OWNER
          </p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? 34 : 'clamp(34px, 4vw, 48px)', color: '#F58426', margin: '0 0 2px', letterSpacing: '0.01em' }}>
            RONALD WISE
          </h2>
          <p style={{ fontSize: 15, color: '#006BB6', fontWeight: 800, margin: '0 0 16px' }}>
            ULTRA WISE DETAIL
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ fontSize: 40, color: 'rgba(245,132,38,0.35)', fontWeight: 900, lineHeight: 1, fontFamily: 'Georgia, serif' }}>
              &ldquo;
            </div>
            <div>
              <p style={{ fontSize: 15, color: '#F8F9FB', margin: '0 0 14px', lineHeight: 1.5 }}>
                We don&apos;t just wash cars&mdash;we treat them like investments.
              </p>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#F58426', margin: '0 0 2px' }}>
                Precision. Protection. Pride.
              </p>
              <p style={{ fontSize: 13, color: '#8b909a', margin: 0, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
                That&apos;s the Ultra Wise way &mdash; Ronald Wise
              </p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: '#006BB6', letterSpacing: '0.02em', margin: 0 }}>
            NEW YORK
          </p>
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: '#F58426', letterSpacing: '0.02em', margin: '0 0 10px' }}>
            FOREVER
          </p>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '2px solid #006BB6',
              margin: isMobile ? 0 : '0 0 0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#006BB6' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
