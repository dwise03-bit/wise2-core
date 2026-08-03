'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { PiffCityRabbit } from './PiffCityRabbit';
import styles from './Hero.module.css';

gsap.registerPlugin(ScrollTrigger);

export const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const centerLogoRef = useRef<HTMLDivElement>(null);
  const leadersGridRef = useRef<HTMLDivElement>(null);
  const messagingRef = useRef<HTMLDivElement>(null);
  const poweredRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  // Ensure all elements are visible by default
  if (typeof window !== 'undefined') {
    if (centerLogoRef.current?.querySelector('.logo-text')) {
      (centerLogoRef.current.querySelector('.logo-text') as HTMLElement).style.opacity = '1';
    }
    if (leadersGridRef.current) {
      (leadersGridRef.current as HTMLElement).style.opacity = '1';
      leadersGridRef.current.querySelectorAll('.leader-portrait').forEach((el) => {
        (el as HTMLElement).style.opacity = '1';
      });
    }
    if (messagingRef.current) {
      messagingRef.current.querySelectorAll('.messaging-item').forEach((el) => {
        (el as HTMLElement).style.opacity = '1';
      });
    }
  }

  useGSAP(
    () => {
      if (!containerRef.current) return;
      if (prefersReducedMotion()) return;

      try {
        // Parallax background effect
        if (bgLayerRef.current) {
          gsap.to(bgLayerRef.current, {
            yPercent: 20,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              scrub: 0.5,
              start: 'top top',
              end: 'bottom top',
            },
          });
        }

        // Center logo text - scale up and glow with intense neon
        const logoText = centerLogoRef.current?.querySelector('.logo-text');
        if (logoText) {
          gsap.from(logoText, {
            scale: 0.5,
            opacity: 0,
            duration: 1.2,
            ease: 'back.out(1.2)',
            delay: 0.2,
          });

          // Intense neon yellow/purple glow pulse
          gsap.fromTo(
            logoText,
            { textShadow: '0 0 40px rgba(57, 255, 20, 0.6), 0 0 80px rgba(200, 0, 150, 0.4)' },
            { textShadow: '0 0 80px rgba(57, 255, 20, 0.9), 0 0 150px rgba(200, 0, 150, 0.7)', duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut' }
          );
        }

        // Leaders grid - fade in and scale
        if (leadersGridRef.current) {
          gsap.from(leadersGridRef.current, {
            opacity: 0,
            scale: 0.9,
            duration: 0.8,
            ease: 'power2.out',
            delay: 0.4,
          });

          // Individual leader portraits fade in with stagger
          const portraits = leadersGridRef.current.querySelectorAll('.leader-portrait');
          gsap.from(portraits, {
            opacity: 0,
            y: 30,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            delay: 0.6,
          });
        }

        // Messaging elements stagger animation
        const messagingElements = messagingRef.current?.querySelectorAll('.messaging-item');
        if (messagingElements) {
          gsap.from(messagingElements, {
            opacity: 0,
            y: 15,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
            delay: 0.8,
          });
        }

        // Scroll-triggered reveal for Powered Businesses section
        const businessCards = poweredRef.current?.querySelectorAll('.business-card');
        if (businessCards) {
          gsap.from(businessCards, {
            opacity: 0,
            y: 24,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: poweredRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          });
        }
      } catch (e) {
        console.warn('GSAP animations failed gracefully:', e);
        // Elements remain visible - animations are just not applied
      }
    },
    { scope: containerRef }
  );

  const buildNumber = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '120vh',
        background: '#000000',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Build Number Badge */}
      <div style={{
        position: 'fixed',
        top: '12px',
        left: '12px',
        fontSize: '10px',
        fontFamily: 'monospace',
        color: '#39FF14',
        backgroundColor: 'rgba(57, 255, 20, 0.1)',
        border: '1px solid rgba(57, 255, 20, 0.3)',
        padding: '4px 8px',
        borderRadius: '4px',
        zIndex: 1000,
      }}>
        {buildNumber}
      </div>

      {/* Parallax Background Layer */}
      <div
        ref={bgLayerRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          opacity: 0.6,
          willChange: 'transform',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(200, 0, 150, 0.5) 0%, rgba(57, 255, 20, 0.2) 50%, transparent 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at center, rgba(200, 0, 150, 0.4) 0%, rgba(57, 255, 20, 0.15) 50%, transparent 80%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("https://d8j0ntlcm91z4.cloudfront.net/user_3G8Nn9NFwKLGqBbTrrVrvDTpJm0/hf_20260725_154235_77db1f2d-9a7c-480c-8bae-37c48614647a.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.45,
            filter: 'brightness(0.8) contrast(1.2) saturate(1.1)',
          }}
        />
      </div>

      {/* REDESIGNED: Central Hero Section with 4 Leaders */}
      <div
        ref={heroSectionRef}
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '120vh',
          padding: '60px 24px',
          gap: '32px',
          willChange: 'opacity',
        }}
      >
        {/* Top Messaging */}
        <div
          ref={messagingRef}
          style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100%',
            marginBottom: '20px',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.6rem)',
              fontWeight: 900,
              color: '#39FF14',
              margin: 0,
              letterSpacing: '4px',
              textTransform: 'uppercase',
              fontFamily: "'Orbitron', monospace",
              textShadow: '0 0 40px rgba(57, 255, 20, 0.8), 0 0 80px rgba(57, 255, 20, 0.5), 0 0 120px rgba(200, 0, 150, 0.3)',
            }}
          >
            FOUR LEADERS. ONE EMPIRE.
          </h2>
        </div>

        {/* Central WISE² Logo - Massive Focal Point */}
        <div className={styles.logoOverlay} ref={centerLogoRef}>
          <h1 className={`${styles.logo} logo-text`}>WISE²</h1>
          <p className={styles.logoSubLabel}>BUSINESS OS</p>
        </div>

        {/* Central Leaders Grid - 4 Portraits in Center */}
        <div className={styles.leadersGrid} ref={leadersGridRef}>
          {/* Leader 1 - Daniel */}
          <div className={styles.leaderPortrait + ' leader-portrait'} data-leader="daniel">
            <div className={styles.leaderFrame}>
              <div className={styles.leaderGloss} />
              <Image
                src="/uploads/daniel.png"
                alt="Daniel WISE"
                fill
                sizes="(max-width: 768px) 80px, (max-width: 1024px) 120px, 180px"
                className={styles.leaderImage}
                priority
              />
            </div>
            <div className={styles.leaderLabel}>
              <p className={styles.leaderName}>DANIEL</p>
              <p className={styles.leaderRole}>FOUNDER & ARCHITECT</p>
            </div>
          </div>

          {/* Leader 2 - Darrin */}
          <div className={styles.leaderPortrait + ' leader-portrait'} data-leader="darrin">
            <div className={styles.leaderFrame}>
              <div className={styles.leaderGloss} />
              <Image
                src="/uploads/darrin.png"
                alt="Darrin WISE"
                fill
                sizes="(max-width: 768px) 80px, (max-width: 1024px) 120px, 180px"
                className={styles.leaderImage}
                priority
              />
            </div>
            <div className={styles.leaderLabel}>
              <p className={styles.leaderName}>DARRIN</p>
              <p className={styles.leaderRole}>OPERATIONS LEADER</p>
            </div>
          </div>

          {/* Leader 3 - Placeholder (ready for 3rd founder) */}
          <div className={styles.leaderPortrait + ' leader-portrait'} data-leader="leader3">
            <div className={styles.leaderFrame + ' ' + styles.placeholderFrame}>
              <div className={styles.leaderGloss} />
              <div className={styles.leaderPlaceholder}>3</div>
            </div>
            <div className={styles.leaderLabel}>
              <p className={styles.leaderName}>LEADER</p>
              <p className={styles.leaderRole}>STRATEGIC ROLE</p>
            </div>
          </div>

          {/* Leader 4 - Placeholder (ready for 4th founder) */}
          <div className={styles.leaderPortrait + ' leader-portrait'} data-leader="leader4">
            <div className={styles.leaderFrame + ' ' + styles.placeholderFrame}>
              <div className={styles.leaderGloss} />
              <div className={styles.leaderPlaceholder}>4</div>
            </div>
            <div className={styles.leaderLabel}>
              <p className={styles.leaderName}>LEADER</p>
              <p className={styles.leaderRole}>STRATEGIC ROLE</p>
            </div>
          </div>
        </div>

        {/* Bottom Messaging & CTA */}
        <div className={styles.bottomMessaging} ref={messagingRef}>
          <div className={`${styles.messagingItem} ${styles.buildingEmpires}`}>
            <p className={styles.buildingEmpiresText}>BUILDING EMPIRES. CHANGING CULTURE.</p>
          </div>

          <div className={`${styles.messagingItem} ${styles.description}`}>
            <p className={styles.descriptionText}>ONE SYSTEM. THREE POWERED BUSINESSES. FOUR LEADERS.</p>
          </div>

          <div className={`${styles.messagingItem} ${styles.subtitle}`}>
            <p className={styles.subtitleText}>ORGANIZED CHAOS COMMAND CENTER</p>
          </div>

          {/* CTA Buttons */}
          <div className={styles.ctaGroup}>
            <Link href="/audit" className={styles.ctaButton}>
              GET YOUR BUSINESS AI AUDIT
            </Link>
            <Link href="/platform" className={styles.ctaSecondary}>
              SEE WISE² IN ACTION →
            </Link>
          </div>
        </div>
      </div>

      {/* Legacy Footer */}
      <div className={styles.legacyFooter}>
        <p className={styles.legacyText}>TOGETHER WE BUILD LEGACY.</p>
      </div>

      {/* Powered Businesses Section */}
      <div className={styles.poweredSection} ref={poweredRef}>
        <div className={styles.poweredHeader}>
          <h2 className={styles.poweredTitle}>POWERED BUSINESSES</h2>
          <p className={styles.poweredSubtitle}>EQUAL. POWERED. UNSTOPPABLE.</p>
        </div>

        <div className={styles.poweredGrid}>
          {/* PIFF CITY - Purple */}
          <div className="business-card" style={{ borderColor: 'rgba(57, 255, 20, 0.4)', backgroundImage: 'linear-gradient(to bottom right, rgba(57, 255, 20, 0.1), transparent)' }}>
            <div className={styles.piffCityCard}>
              <div className={styles.piffCityRabbitContainer}>
                <PiffCityRabbit />
              </div>
              <div className={styles.businessCardContent}>
                <p className={styles.businessName} style={{ color: '#39FF14' }}>PIFF CITY</p>
                <p className={styles.businessTagline}>CULTURE. CREATIVITY. COMMUNITY.</p>
                <p className={styles.businessDescription}>WE SET TRENDS.</p>
                <div className={styles.businessItems}>
                  <div>👕 APPAREL • 📸 MEDIA • 🎭 EVENTS</div>
                  <div>🎵 MUSIC • 🏷️ BRAND</div>
                </div>
              </div>
            </div>
          </div>

          {/* WISE² CENTER */}
          <div className="business-card" style={{ borderColor: 'rgba(57, 255, 20, 0.5)', backgroundImage: 'linear-gradient(to bottom right, rgba(57, 255, 20, 0.15), transparent)' }}>
            <div className={styles.businessCardContent}>
              <p className={styles.businessName} style={{ color: '#39FF14', fontSize: '1.5rem' }}>WISE²</p>
              <p className={styles.businessTagline}>THE PARENT PLATFORM</p>
              <p className={styles.businessDescription}>COMMAND CENTER FOR EVERYTHING</p>
              <div className={styles.businessItems}>
                <div>🧠 AI AUTOMATION</div>
                <div>📊 BUSINESS INTELLIGENCE</div>
                <div>⚙️ SYSTEMS & WORKFLOWS</div>
                <div>🎨 BRAND & MARKETING</div>
              </div>
            </div>
          </div>

          {/* WISE SHINE - Neon Green */}
          <div className="business-card" style={{ borderColor: 'rgba(57, 255, 20, 0.35)', backgroundImage: 'linear-gradient(to bottom right, rgba(57, 255, 20, 0.08), transparent)' }}>
            <div className={styles.businessCardContent}>
              <p className={styles.businessName} style={{ color: '#39FF14' }}>WISE SHINE</p>
              <p className={styles.businessTagline}>ATLANTA DETAILING</p>
              <p className={styles.businessDescription}>PREMIUM RESULTS.</p>
              <div className={styles.businessItems}>
                <div>🚗 EXTERIOR • 🏠 INTERIOR • 🎨 CERAMIC</div>
                <div>🖌️ PAINT • 🔧 MAINTENANCE • 📋 PLANS</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
