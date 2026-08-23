'use client';

import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { OwnerSection } from './components/OwnerSection';
import { Services } from './components/Services';
import { Transformations } from './components/Transformations';
import { Benefits } from './components/Benefits';
import { BookingCTA } from './components/BookingCTA';
import { Footer } from './components/Footer';

function MobileStickyBar() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 980);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!isMobile) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        gap: 10,
        background: 'rgba(3,5,7,0.97)',
        borderTop: '1px solid #F58426',
        padding: 10,
        zIndex: 40,
      }}
    >
      <button style={{ flex: 1, background: '#F58426', color: '#030507', fontWeight: 900, fontSize: 13, border: 'none', padding: 12, cursor: 'pointer' }}>
        BOOK
      </button>
      <a
        href="tel:+19177498960"
        style={{ flex: 1, background: '#006BB6', color: '#F8F9FB', fontWeight: 900, fontSize: 13, border: 'none', padding: 12, textAlign: 'center', display: 'block', textDecoration: 'none' }}
      >
        CALL
      </a>
    </div>
  );
}

export default function UltraWiseDetail() {
  return (
    <div style={{ fontFamily: "'Inter', Arial, sans-serif", background: '#030507', color: '#F8F9FB', overflowX: 'hidden' }}>
      <style jsx global>{`
        * { box-sizing: border-box; }
        a { color: #F58426; text-decoration: none; transition: color 0.2s ease; }
        a:hover { color: #ff9c4d; }
        ::selection { background: #F58426; color: #030507; }
        .uwd-grain { background-image: radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px); background-size: 3px 3px; }
      `}</style>
      <Header />
      <main>
        <Hero />
        <OwnerSection />
        <Services />
        <Transformations />
        <Benefits />
        <BookingCTA />
      </main>
      <Footer />
      <MobileStickyBar />
    </div>
  );
}
