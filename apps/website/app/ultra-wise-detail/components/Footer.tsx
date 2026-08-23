'use client';

import { useState, useEffect } from 'react';

const footerLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Packages', href: '#packages' },
  { label: 'Contact', href: '#contact' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Book My Detail', href: '#book' },
];

const socials = ['FB', 'IG', 'TT', 'YT'];

export function Footer() {
  const [isMobile, setIsMobile] = useState(false);
  const [year, setYear] = useState(2026);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 980);
    onResize();
    window.addEventListener('resize', onResize);
    setYear(new Date().getFullYear());
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <footer style={{ background: '#030507', padding: isMobile ? '36px 20px 24px' : '48px 32px 28px', position: 'relative' }}>
      <div style={{ height: 2, background: 'linear-gradient(90deg, #F58426, #006BB6)', position: 'absolute', top: 0, left: 0, right: 0 }} />
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr 1fr 1fr',
          gap: isMobile ? 28 : 32,
          marginBottom: 28,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div
              style={{
                position: 'relative',
                width: 36,
                height: 40,
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
                  width: 31,
                  height: 35,
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  background: '#030507',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, color: '#F8F9FB' }}>UW</span>
              </div>
            </div>
            <div style={{ lineHeight: 1.05 }}>
              <div style={{ fontWeight: 900, fontSize: 13, color: '#F8F9FB' }}>ULTRA WISE</div>
              <div style={{ fontWeight: 900, fontSize: 13, color: '#006BB6' }}>DETAIL</div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: '#8b909a', lineHeight: 1.5, margin: '0 0 12px', maxWidth: 260 }}>
            Premium detailing and auto recon services that bring your vehicle back to life.
          </p>
          <p style={{ fontSize: 10, fontWeight: 900, color: '#F58426', margin: 0 }}>NEW YORK MENTALITY.</p>
          <p style={{ fontSize: 10, fontWeight: 900, color: '#F8F9FB', margin: 0 }}>ULTRA WISE RESULTS.</p>
        </div>

        <div>
          <h3 style={{ fontSize: 12, fontWeight: 900, color: '#F8F9FB', margin: '0 0 12px', letterSpacing: '0.05em' }}>QUICK LINKS</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
            {footerLinks.map((l) => (
              <a key={l.label} href={l.href} style={{ fontSize: 12, color: '#8b909a', textDecoration: 'none' }}>
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: 12, fontWeight: 900, color: '#F8F9FB', margin: '0 0 12px', letterSpacing: '0.05em' }}>SERVICE AREA</h3>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#F8F9FB', margin: '0 0 8px' }}>Proudly serving South Florida</p>
          <p style={{ fontSize: 11, color: '#8b909a', margin: 0, lineHeight: 1.7 }}>
            Broward County &middot; Miami-Dade County
            <br />
            Palm Beach County &amp; surrounding areas
          </p>
        </div>

        <div>
          <h3 style={{ fontSize: 12, fontWeight: 900, color: '#F8F9FB', margin: '0 0 12px', letterSpacing: '0.05em' }}>FOLLOW US</h3>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            {socials.map((soc) => (
              <a
                key={soc}
                href="#"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#17191c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 9,
                  fontWeight: 800,
                  color: '#F8F9FB',
                  textDecoration: 'none',
                }}
              >
                {soc}
              </a>
            ))}
          </div>
          <p style={{ fontSize: 9, color: '#5b606a', margin: '0 0 4px', letterSpacing: '0.05em' }}>POWERED BY</p>
          <p style={{ fontSize: 12, fontWeight: 900, color: '#F8F9FB', margin: 0 }}>
            WISE&sup2; <span style={{ color: '#F58426' }}>AUTOMATION</span>
          </p>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #17191c', paddingTop: 18, textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: '#5b606a', margin: 0 }}>&copy; {year} Ultra Wise Detail. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
