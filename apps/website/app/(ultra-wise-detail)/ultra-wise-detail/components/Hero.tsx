'use client';

import { useState, useEffect } from 'react';

export function Hero() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 980);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <section
      className="uwd-grain"
      style={{ position: 'relative', background: '#030507', overflow: 'hidden' }}
    >
      <div
        style={{
          position: 'absolute',
          top: -120,
          left: -120,
          width: 460,
          height: 460,
          background: 'radial-gradient(circle, rgba(0,107,182,0.22), transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -140,
          left: '10%',
          width: 380,
          height: 380,
          background: 'radial-gradient(circle, rgba(245,132,38,0.12), transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'stretch',
          minHeight: isMobile ? 'auto' : 600,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: 3,
            background: 'linear-gradient(180deg, #F58426, #006BB6)',
            zIndex: 3,
          }}
        />

        <div
          style={{
            flex: isMobile ? '1 1 100%' : '0 0 44%',
            maxWidth: isMobile ? '100%' : '44%',
            padding: isMobile ? '40px 24px 32px' : '48px 20px 48px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 22, height: 2, background: '#F58426', display: 'inline-block' }} />
            <span style={{ color: '#F8F9FB' }}>NEW YORK TOUGH.</span>{' '}
            <span style={{ color: '#F58426' }}>ULTRA WISE FINISH.</span>
          </p>
          <h1
            style={{
              fontFamily: "'Bebas Neue', 'Inter', sans-serif",
              fontSize: isMobile ? 52 : 'clamp(52px, 7.4vw, 96px)',
              lineHeight: 0.9,
              letterSpacing: '0.01em',
              margin: '0 0 24px',
            }}
          >
            <div style={{ color: '#F8F9FB', textShadow: '0 2px 0 rgba(0,0,0,0.5), 0 8px 30px rgba(0,0,0,0.5)' }}>
              RESTORE.
            </div>
            <div style={{ color: '#006BB6', textShadow: '0 2px 0 rgba(0,0,0,0.4), 0 8px 30px rgba(0,107,182,0.35)' }}>
              PROTECT.
            </div>
            <div style={{ color: '#F58426', textShadow: '0 2px 0 rgba(0,0,0,0.4), 0 8px 30px rgba(245,132,38,0.35)' }}>
              ELEVATE.
            </div>
          </h1>
          <p style={{ fontSize: 15, color: '#a8adb3', maxWidth: 380, lineHeight: 1.55, margin: '0 0 28px', fontWeight: 500 }}>
            Premium detailing &amp; auto recon services that bring your vehicle back to life.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            <button
              style={{
                background: '#F58426',
                color: '#030507',
                fontWeight: 900,
                fontSize: 14,
                border: 'none',
                padding: '15px 28px',
                cursor: 'pointer',
              }}
            >
              BOOK MY DETAIL
            </button>
            <button
              style={{
                background: 'transparent',
                color: '#006BB6',
                border: '2px solid #006BB6',
                fontWeight: 900,
                fontSize: 14,
                padding: '13px 26px',
                cursor: 'pointer',
              }}
            >
              GET AN INSTANT QUOTE
            </button>
          </div>
        </div>

        <div
          style={{
            flex: isMobile ? '1 1 100%' : '0 0 56%',
            maxWidth: isMobile ? '100%' : '56%',
            position: 'relative',
            minHeight: isMobile ? 320 : 'auto',
          }}
        >
          <img
            src="/images/ultra-wise-detail/genesis-exterior.jpg"
            alt="Genesis luxury SUV"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 65%',
              filter: 'brightness(0.75) contrast(1.1) saturate(0.85)',
            }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(3,5,7,0.9) 0%, rgba(3,5,7,0.25) 40%, transparent 65%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(3,5,7,0.7), transparent 40%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(3,5,7,0.75), transparent 35%)' }} />
          <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 90px 30px rgba(3,5,7,0.8)' }} />
          <div
            style={{
              position: 'absolute',
              bottom: -40,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60%',
              height: 120,
              background: 'radial-gradient(ellipse, rgba(245,132,38,0.28), transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: 18,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 3,
            }}
          >
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                border: '3px solid #F58426',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(3,5,7,0.55)',
                boxShadow: '0 0 30px rgba(245,132,38,0.25)',
              }}
            >
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F58426', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: '#030507' }} />
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: '#030507' }} />
              </div>
            </div>
            <div style={{ marginTop: 8, fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: '0.06em', color: '#F8F9FB', textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
              NEW YORK
            </div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, letterSpacing: '0.12em', color: '#006BB6', textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
              BASKETBALL
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
