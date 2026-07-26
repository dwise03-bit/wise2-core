'use client';

import { useRef, useEffect } from 'react';
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
  const leftPortraitRef = useRef<HTMLDivElement>(null);
  const centerLogoRef = useRef<HTMLDivElement>(null);
  const rightPortraitRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const poweredRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // Parallax background effect
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

      // Left portrait - fade in and slide from left
      gsap.from(leftPortraitRef.current, {
        opacity: 0,
        x: -80,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.2,
      });

      // Right portrait - fade in and slide from right
      gsap.from(rightPortraitRef.current, {
        opacity: 0,
        x: 80,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.2,
      });

      // Center logo text - scale up and glow
      const logoText = centerLogoRef.current?.querySelector('.logo-text');
      if (logoText) {
        gsap.from(logoText, {
          scale: 0.6,
          opacity: 0,
          duration: 1,
          ease: 'back.out(1.2)',
          delay: 0.3,
        });

        // Continuous metallic glow pulse
        gsap.fromTo(
          logoText,
          { textShadow: '0 0 30px rgba(200, 200, 200, 0.5), 0 0 60px rgba(0, 148, 255, 0.4)' },
          { textShadow: '0 0 60px rgba(200, 200, 200, 0.7), 0 0 100px rgba(166, 60, 255, 0.3)', duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut' }
        );
      }

      // Tagline stagger animation
      const taglineElements = taglineRef.current?.querySelectorAll('h2, h3, p, .tagline-item');
      if (taglineElements) {
        gsap.from(taglineElements, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          stagger: 0.12,
          ease: 'power2.out',
          delay: 0.5,
        });
      }

      // Hover tilt effects for portraits
      const portraits = [leftPortraitRef.current, rightPortraitRef.current];
      portraits.forEach((portrait) => {
        if (!portrait) return;

        portrait.addEventListener('mouseenter', () => {
          gsap.to(portrait, {
            rotateY: portrait === leftPortraitRef.current ? 10 : -10,
            duration: 0.3,
            ease: 'power2.out',
          });
        });

        portrait.addEventListener('mouseleave', () => {
          gsap.to(portrait, {
            rotateY: 0,
            duration: 0.3,
            ease: 'power2.out',
          });
        });
      });

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
    },
    { scope: containerRef }
  );

  return (
    <div className={`${styles.heroContainer}`} ref={containerRef}>
      {/* Parallax Background Layer */}
      <div className={styles.bgLayer} ref={bgLayerRef}>
        <div className={styles.bgGradient1} />
        <div className={styles.bgGradient2} />
        <div className={styles.bgSkyline} />
      </div>

      {/* Full-Screen Hero Content */}
      <div className={styles.heroContent}>
        {/* Left Portrait - Daniel */}
        <div className={styles.portraitContainer} data-position="left" ref={leftPortraitRef}>
          <div className={styles.portraitFrame}>
            <div className={styles.portraitGloss} />
            <Image
              src="/uploads/daniel-wise-source.png"
              alt="Daniel WISE - Founder & System Architect"
              fill
              sizes="(max-width: 768px) 100px, (max-width: 1024px) 150px, 25vw"
              className={styles.portraitImage}
              priority
            />
          </div>
          <div className={styles.portraitInfo}>
            <h3 className={styles.portraitName}>DANIEL</h3>
            <p className={styles.portraitTitle}>WISE</p>
            <p className={styles.portraitRole}>FOUNDER & SYSTEM ARCHITECT</p>
            <div className={styles.portraitBadges}>
              <span>👁️ VISIONARY LEADER</span>
              <span>💼 BUSINESS STRATEGIST</span>
              <span>🤖 AI AUTOMATION EXPERT</span>
              <span>🏗️ SYSTEMS ARCHITECT</span>
              <span>🎨 WISE² CREATOR</span>
            </div>
          </div>
        </div>

        {/* Center Logo & Tagline */}
        <div className={styles.centerContent}>
          {/* Tagline Above Logo */}
          <div className={styles.taglineContainer} ref={taglineRef}>
            <h2 className={styles.taglineSmall}>
              TWO LEADERS. ONE VISION.
            </h2>
          </div>

          {/* WISE² Metallic Logo */}
          <div className={styles.logoContainer} ref={centerLogoRef}>
            <h1 className={`${styles.logo} logo-text`}>WISE²</h1>
            <p className={styles.logoSubLabel}>BUSINESS OS</p>
          </div>

          {/* Subtitle */}
          <div className={styles.subtitleContainer}>
            <p className={styles.subtitle}>
              ORGANIZED CHAOS COMMAND CENTER
            </p>
          </div>

          {/* Tagline Below Logo */}
          <div className={styles.taglineBottomContainer}>
            <p className={styles.taglineSubtitle}>
              BUILDING EMPIRES. CHANGING CULTURE.
            </p>
          </div>

          {/* Description */}
          <p className={styles.brandDescription}>
            The all-in-one business operating system<br />
            to automate, innovate & dominate.
          </p>

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

        {/* Right Portrait - Darrin */}
        <div className={styles.portraitContainer} data-position="right" ref={rightPortraitRef}>
          <div className={styles.portraitFrame}>
            <div className={styles.portraitGloss} />
            <Image
              src="/uploads/darrin-wise-source.png"
              alt="Darrin WISE - Operations & Growth Leader"
              fill
              sizes="(max-width: 768px) 100px, (max-width: 1024px) 150px, 25vw"
              className={styles.portraitImage}
              priority
            />
          </div>
          <div className={styles.portraitInfo}>
            <h3 className={styles.portraitName}>DARRIN</h3>
            <p className={styles.portraitTitle}>WISE</p>
            <p className={styles.portraitRole}>OPERATIONS & GROWTH LEADER</p>
            <div className={styles.portraitBadges}>
              <span>⚙️ OPERATIONS MASTER</span>
              <span>📈 GROWTH STRATEGIST</span>
              <span>🏗️ BRAND BUILDER</span>
              <span>🤝 COMMUNITY CONNECTOR</span>
              <span>🎯 EXECUTION LEADER</span>
            </div>
          </div>
        </div>
      </div>

      {/* Powered Businesses Section */}
      <div className={styles.poweredSection} ref={poweredRef}>
        <div className={styles.poweredHeader}>
          <h2 className={styles.poweredTitle}>POWERED BUSINESSES</h2>
          <p className={styles.poweredSubtitle}>EQUAL. POWERED. UNSTOPPABLE.</p>
        </div>

        <div className={styles.poweredGrid}>
          {/* PIFF CITY - Purple */}
          <div className="business-card" style={{ borderColor: 'rgba(166, 60, 255, 0.3)', backgroundImage: 'linear-gradient(to bottom right, rgba(166, 60, 255, 0.1), transparent)' }}>
            <div className={styles.piffCityCard}>
              <div className={styles.piffCityRabbitContainer}>
                <PiffCityRabbit />
              </div>
              <div className={styles.businessCardContent}>
                <p className={styles.businessName} style={{ color: '#A63CFF' }}>PIFF CITY</p>
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
          <div className="business-card" style={{ borderColor: 'rgba(0, 148, 255, 0.5)', backgroundImage: 'linear-gradient(to bottom right, rgba(0, 148, 255, 0.15), transparent)' }}>
            <div className={styles.businessCardContent}>
              <p className={styles.businessName} style={{ color: '#0094FF', fontSize: '1.5rem' }}>WISE²</p>
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

          {/* WISE SHINE - Gold */}
          <div className="business-card" style={{ borderColor: 'rgba(242, 182, 50, 0.3)', backgroundImage: 'linear-gradient(to bottom right, rgba(242, 182, 50, 0.1), transparent)' }}>
            <div className={styles.businessCardContent}>
              <p className={styles.businessName} style={{ color: '#F2B632' }}>WISE SHINE</p>
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
