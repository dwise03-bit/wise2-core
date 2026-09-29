'use client';

import { useState, useEffect } from 'react';

const navItems = [
  { label: 'HOME', href: '#home', active: true },
  { label: 'SERVICES', href: '#services', active: false },
  { label: 'PACKAGES', href: '#packages', active: false },
  { label: 'GALLERY', href: '#gallery', active: false },
  { label: 'REVIEWS', href: '#reviews', active: false },
  { label: 'ABOUT', href: '#about', active: false },
  { label: 'CONTACT', href: '#contact', active: false },
];

export function Header() {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 980);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(3,5,7,0.97)',
        backdropFilter: 'blur(6px)',
        boxShadow: '0 1px 0 0 #17191c, 0 2px 20px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ height: 2, background: 'linear-gradient(90deg, #F58426, #006BB6)' }} />
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 72,
          padding: '0 24px',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div
            style={{
              position: 'relative',
              width: 46,
              height: 52,
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              background: 'linear-gradient(160deg, #F58426, #006BB6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 40,
                height: 46,
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                background: '#030507',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 18,
                  letterSpacing: '0.02em',
                  background: 'linear-gradient(160deg, #F8F9FB, #c7c9cc)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                UW
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
            <span style={{ fontWeight: 900, fontSize: 15, color: '#F8F9FB', letterSpacing: '0.01em' }}>
              ULTRA WISE
            </span>
            <span style={{ fontWeight: 900, fontSize: 15, color: '#006BB6', letterSpacing: '0.01em' }}>
              DETAIL
            </span>
            <span style={{ fontSize: 9, color: '#6b7280', letterSpacing: '0.06em', marginTop: 2 }}>
              PREMIUM DETAILING &amp; AUTO RECON
            </span>
          </div>
        </div>

        {isMobile ? (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'none', border: 'none', color: '#F58426', fontSize: 22, cursor: 'pointer', padding: 8 }}
          >
            &#9776;
          </button>
        ) : (
          <>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: item.active ? '#F8F9FB' : '#c7c9cc',
                    borderBottom: `2px solid ${item.active ? '#F58426' : 'transparent'}`,
                    paddingBottom: 4,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <button
              style={{
                background: '#F58426',
                color: '#030507',
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: '0.03em',
                border: 'none',
                padding: '12px 22px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              BOOK MY DETAIL
            </button>
          </>
        )}
      </div>

      {isMobile && mobileMenuOpen && (
        <nav style={{ display: 'flex', flexDirection: 'column', padding: '8px 24px 20px', borderTop: '1px solid #17191c', gap: 4 }}>
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: 13, fontWeight: 700, color: '#c7c9cc', padding: '10px 0' }}
            >
              {item.label}
            </a>
          ))}
          <button
            style={{
              marginTop: 8,
              background: '#F58426',
              color: '#030507',
              fontWeight: 800,
              fontSize: 13,
              border: 'none',
              padding: 12,
              cursor: 'pointer',
            }}
          >
            BOOK MY DETAIL
          </button>
        </nav>
      )}
    </header>
  );
}
