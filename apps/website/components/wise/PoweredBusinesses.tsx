'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import styles from './PoweredBusinesses.module.css';

gsap.registerPlugin(ScrollTrigger);

export const PoweredBusinesses: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // Card reveal animations
      const cards = cardsRef.current?.querySelectorAll(`.${styles.businessCard}`);
      if (cards) {
        gsap.from(cards, {
          opacity: 0,
          y: 40,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      // Center infinity symbol pulse
      const infinitySymbol = containerRef.current?.querySelector(`.${styles.infinitySymbol}`);
      if (infinitySymbol) {
        gsap.fromTo(
          infinitySymbol,
          { textShadow: '0 0 20px rgba(0, 102, 255, 0.4), 0 0 40px rgba(0, 102, 255, 0.2)' },
          { textShadow: '0 0 50px rgba(0, 102, 255, 0.7), 0 0 80px rgba(0, 102, 255, 0.4)', duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut' }
        );
      }

      // Hover effects for cards
      const businessCards = containerRef.current?.querySelectorAll(`.${styles.businessCard}`);
      if (businessCards) {
        businessCards.forEach((card) => {
          card.addEventListener('mouseenter', () => {
            gsap.to(card, {
              y: -8,
              duration: 0.3,
              ease: 'power2.out',
            });
          });

          card.addEventListener('mouseleave', () => {
            gsap.to(card, {
              y: 0,
              duration: 0.3,
              ease: 'power2.out',
            });
          });
        });
      }
    },
    { scope: containerRef }
  );

  return (
    <section className={styles.container} ref={containerRef}>
      <div className={styles.background} />

      <div className={styles.header}>
        <h2 className={styles.title}>POWERED BUSINESSES</h2>
        <p className={styles.subtitle}>EQUAL. POWERED. UNSTOPPABLE.</p>
      </div>

      <div className={styles.content}>
        {/* PIFF CITY Card */}
        <div className={`${styles.businessCard} ${styles.piffCity}`} ref={cardsRef}>
          <div className={styles.cardContent}>
            <h3 className={styles.businessName}>PIFF CITY</h3>
            <p className={styles.tagline}>CULTURE. CREATIVITY. COMMUNITY.</p>
            <p className={styles.description}>
              Building culture brands and digital experiences that capture hearts and minds.
            </p>
            <div className={styles.badges}>
              <span className={styles.badge}>👕 APPAREL</span>
              <span className={styles.badge}>📸 MEDIA</span>
              <span className={styles.badge}>🎭 EVENTS</span>
              <span className={styles.badge}>🎵 MUSIC</span>
              <span className={styles.badge}>🏷️ BRAND</span>
            </div>
            <Link href="/piff-city" className={`${styles.button} ${styles.purpleButton}`}>
              EXPLORE PIFF CITY &gt;
            </Link>
          </div>
        </div>

        {/* Center Element */}
        <div className={styles.center}>
          <div className={styles.infinitySymbol}>∞</div>
          <p className={styles.centerLabel}>EQUAL POWERED BUSINESSES</p>
          <div className={styles.arrows}>
            <span className={styles.arrowLeft}>←</span>
            <span className={styles.arrowRight}>→</span>
          </div>
        </div>

        {/* WISE SHINE Card */}
        <div className={`${styles.businessCard} ${styles.wiseShine}`} ref={cardsRef}>
          <div className={styles.cardContent}>
            <h3 className={styles.businessName}>WISE SHINE</h3>
            <p className={styles.tagline}>ATLANTA DETAILING</p>
            <p className={styles.description}>
              Premium mobile detailing brand delivering luxury shine and protection.
            </p>
            <div className={styles.badges}>
              <span className={styles.badge}>🚗 EXTERIOR</span>
              <span className={styles.badge}>🏠 INTERIOR</span>
              <span className={styles.badge}>🎨 CERAMIC</span>
              <span className={styles.badge}>🖌️ PAINT</span>
              <span className={styles.badge}>🔧 MAINTENANCE</span>
              <span className={styles.badge}>📋 PLANS</span>
            </div>
            <Link href="/wise-shine" className={`${styles.button} ${styles.goldButton}`}>
              EXPLORE WISE SHINE &gt;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
