'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import styles from './Stats.module.css';

gsap.registerPlugin(ScrollTrigger);

interface Stat {
  value: string;
  label: string;
  description: string;
  colorHex: string;
}

const stats: Stat[] = [
  {
    value: '100%',
    label: 'ALL-IN-ONE PLATFORM',
    description: 'Everything you need integrated into one unified system',
    colorHex: '#0066FF',
  },
  {
    value: '24/7',
    label: 'AUTOMATION & MONITORING',
    description: 'Never stop. Your business runs around the clock',
    colorHex: '#00CCFF',
  },
  {
    value: '∞',
    label: 'GROWTH POTENTIAL',
    description: 'Scale infinitely with intelligent automation',
    colorHex: '#B020FF',
  },
  {
    value: '1',
    label: 'SYSTEM TO RUN YOUR EMPIRE',
    description: 'Eliminate complexity with unified operations',
    colorHex: '#FFB800',
  },
];

export const Stats: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      // Stat cards fade in and scale
      const statCards = statsRef.current?.querySelectorAll(`.${styles.statCard}`);
      if (statCards) {
        gsap.from(statCards, {
          opacity: 0,
          scale: 0.85,
          y: 40,
          duration: 0.7,
          stagger: 0.12,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      // Animate stat values
      const statValues = statsRef.current?.querySelectorAll(`.${styles.statValue}`);
      if (statValues) {
        statValues.forEach((element, index) => {
          const originalText = element.textContent || '';

          if (originalText === '100%') {
            gsap.to(
              { val: 0 },
              {
                val: 100,
                duration: 2,
                ease: 'power2.out',
                onUpdate: function () {
                  element.textContent = Math.round(this.targets()[0].val) + '%';
                },
                scrollTrigger: {
                  trigger: statsRef.current,
                  start: 'top 80%',
                  toggleActions: 'play none none reverse',
                },
              }
            );
          } else if (originalText === '1') {
            gsap.to(
              { val: 0 },
              {
                val: 1,
                duration: 1.5,
                ease: 'power2.out',
                onUpdate: function () {
                  element.textContent = Math.round(this.targets()[0].val).toString();
                },
                scrollTrigger: {
                  trigger: statsRef.current,
                  start: 'top 80%',
                  toggleActions: 'play none none reverse',
                },
              }
            );
          } else {
            // For special values like 24/7 and ∞, just animate opacity/scale
            gsap.from(element, {
              opacity: 0,
              scale: 0.5,
              duration: 0.8,
              ease: 'back.out(1.5)',
              scrollTrigger: {
                trigger: statsRef.current,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
              },
            });
          }
        });
      }
    },
    { scope: containerRef }
  );

  return (
    <section className={styles.statsSection} ref={containerRef}>
      <div className={styles.statsContainer}>
        <div className={styles.statsHeader}>
          <h2 className={styles.statsTitle}>BUILT FOR LEADERS. DESIGNED TO WIN.</h2>
          <p className={styles.statsSubtitle}>The metrics that matter in your WISE² command center</p>
        </div>

        <div className={styles.statsGrid} ref={statsRef}>
          {stats.map((stat, index) => (
            <div
              key={index}
              className={styles.statCard}
              style={{
                '--accent-color': stat.colorHex,
                '--accent-rgb': hexToRgb(stat.colorHex),
              } as React.CSSProperties & { '--accent-color': string; '--accent-rgb': string }}
            >
              <div className={styles.statValue}>{stat.value}</div>
              <h3 className={styles.statLabel}>{stat.label}</h3>
              <p className={styles.statDescription}>{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 102, 255';
}
