'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './mathis.module.css';
import { VoltDeck } from './VoltDeck';

const VIDEO = '/mathis/entrance.mp4';
// Set NEXT_PUBLIC_MATHIS_GLOBE_URL only after the independently hosted globe is verified.
const GLOBE = process.env.NEXT_PUBLIC_MATHIS_GLOBE_URL || '';

export function MathisEntrance() {
  const [entered, setEntered] = useState(false);
  const [muted, setMuted] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);
  const [globeFailed, setGlobeFailed] = useState(false);
  const [globeReady, setGlobeReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setEntered(true);
    }
  }, []);

  function enter() {
    videoRef.current?.pause();
    setEntered(true);
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <a href="/mathis-electric" className={styles.brand} aria-label="Mathis Electric LLC home"><img src="/mathis/logo.png" alt="Mathis Electric LLC" /></a>
        <nav className={styles.navigation} aria-label="Primary navigation"><a href="#services">Services</a><a href="#about">About</a><a href="#contact">Contact</a><a href="#volt-deck">VOLT DECK</a></nav>
        <button type="button" className={styles.menuToggle} onClick={() => setMenuOpen(v => !v)} aria-expanded={menuOpen} aria-controls="mathis-mobile-nav">Menu</button>
        <a href="#contact" className={styles.headerLink}>Request an estimate</a>
      </header>

      {menuOpen && <nav id="mathis-mobile-nav" className={styles.mobileNav} aria-label="Mobile navigation"><a onClick={() => setMenuOpen(false)} href="#services">Services</a><a onClick={() => setMenuOpen(false)} href="#about">About</a><a onClick={() => setMenuOpen(false)} href="#contact">Contact</a><a onClick={() => setMenuOpen(false)} href="#volt-deck">VOLT DECK</a></nav>}
      {!entered ? (
        <section className={styles.entrance} aria-label="Mathis Electric cinematic entrance">
          <video
            ref={videoRef}
            className={styles.video}
            src={VIDEO}
            autoPlay
            muted={muted}
            playsInline
            preload="metadata"
            onEnded={enter}
            onError={() => setVideoFailed(true)}
            aria-label="Mathis Electric entrance film"
          />
          <div className={styles.shade} />
          <div className={styles.introText}>
            <p>BUILT ON SERVICE. POWERED BY PURPOSE.</p>
            <h1>WELCOME TO THE WORLD OF MATHIS ELECTRIC</h1>
          </div>
          <div className={styles.controls}>
            <button onClick={() => setMuted(v => !v)} aria-label={muted ? 'Unmute video' : 'Mute video'}>
              {muted ? 'Enable sound' : 'Mute'}
            </button>
            <button onClick={enter}>Skip intro <span aria-hidden="true">→</span></button>
          </div>
          {videoFailed && <div className={styles.notice}>Video unavailable. <button onClick={enter}>Enter website</button></div>}
        </section>
      ) : (
        <section className={styles.grid} aria-label="Living Grid experience">
          <div className={styles.gridHeading}>
            <p>THE LIVING GRID</p>
            <h1>POWERING WHAT'S NEXT.</h1>
            <p>Explore the world of Mathis Electric.</p>
          </div>
          {GLOBE && !globeFailed && (
            <iframe
              title="Interactive Living Grid globe"
              src={GLOBE}
              className={styles.globe}
              loading="lazy"
              onLoad={() => setGlobeReady(true)}
            />
          )}
          {GLOBE && !globeReady && !globeFailed && <p className={styles.loading}>Loading the Living Grid…</p>}
          {!GLOBE && <p className={styles.notice}>Interactive globe integration is being prepared. Explore our services below.</p>}
          <div className={styles.gridActions}>
            {GLOBE && <a href={GLOBE} target="_blank" rel="noopener noreferrer">Open full-screen globe</a>}
            <button onClick={() => { setEntered(false); setGlobeReady(false); requestAnimationFrame(() => { if (videoRef.current) { videoRef.current.currentTime = 0; void videoRef.current.play().catch(() => setVideoFailed(true)); } }); }}>Replay entrance</button>
            <button onClick={() => setGlobeFailed(true)}>Use standard website</button>
          </div>
          {GLOBE && globeFailed && <p className={styles.notice}>The interactive globe is not enabled yet. You can still explore our services below.</p>}
        </section>
      )}

      <section className={styles.services} id="services">
        <p>WHAT WE DO</p>
        <h2>Electrical solutions built around service.</h2>
        <div className={styles.cards}>
          <article><h3>Electrical Services</h3><p>Discuss your electrical project with the Mathis Electric team.</p></article>
          <article><h3>Project Consultation</h3><p>Plan requirements, scope, and next steps for your project.</p></article>
          <article><h3>Our Work</h3><p>Project gallery and verified case studies coming soon.</p></article>
        </div>
      </section>
      <section className={styles.about} id="about"><p>OUR COMMITMENT</p><h2>Built on Service. Powered by Purpose.</h2><p>Mathis Electric LLC brings a service-first approach to electrical projects. Get in touch to discuss the scope, requirements, and next steps for your project.</p></section>
      <VoltDeck />
      <section className={styles.contact} id="contact">
        <p>LET'S CONNECT</p>
        <h2>Build with purpose.</h2>
        <p>For an estimate, contact Mathis Electric through its verified business channels. Online submission will be enabled after the secure destination and business details are confirmed.</p>
      </section>
    </main>
  );
}
