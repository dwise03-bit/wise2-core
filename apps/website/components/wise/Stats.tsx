'use client';

import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import styles from './Stats.module.css';

gsap.registerPlugin(ScrollTrigger);

interface Stat {
  value: string;
  label: string;
  description: string;
}

const stats: Stat[] = [
  {
    value: '100%',
    label: 'ALL-IN-ONE PLATFORM',
    description: 'Everything you need integrated into one unified system',
  },
  {
    value: '24/7',
    label: 'AUTOMATION & MONITORING',
    description: 'Never stop. Your business runs around the clock',
  },
  {
    value: '∞',
    label: 'GROWTH POTENTIAL',
    description: 'Scale infinitely with intelligent automation',
  },
  {
    value: '1',
    label: 'SYSTEM TO RUN YOUR EMPIRE',
    description: 'Eliminate complexity with unified operations',
  },
];

export const Stats: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // Stat cards fade in and scale
      const statCards = statsRef.current?.querySelectorAll('.stat-card');
      if (statCards) {
        gsap.from(statCards, {
          opacity: 0,
          scale: 0.8,
          y: 40,
          duration: 0.7,
          stagger: 0.15,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      // Stat values count up
      const statValues = statsRef.current?.querySelectorAll('.stat-value');
      if (statValues) {
        statValues.forEach((element) => {
          const finalValue = element.textContent?.replace(/[^0-9]/g, '') || '0';
          const startValue = 0;

          gsap.to(
            { value: startValue },
            {
              value: parseInt(finalValue),
              duration: 2,
              ease: 'power2.out',
              onUpdate: function () {
                if (element.textContent?.includes('%')) {
                  element.textContent = Math.round(this.targets()[0].value) + '%';
                } else if (element.textContent?.includes('24')) {
                  element.textContent = '24/7';
                }
              },
              scrollTrigger: {
                trigger: statsRef.current,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
              },
            }
          );
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
            <div key={index} className="stat-card" style={getCardStyle(index)}>
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

// Helper function to apply alternating accent colors
function getCardStyle(index: number) {
  const colors = ['#0094FF', '#A63CFF', '#00D96C', '#F2B632'];
  const color = colors[index % colors.length];
  const rgba = `rgba(${hexToRgb(color)}, 0.15)`;

  return {
    borderColor: `rgba(${hexToRgb(color)}, 0.3)`,
    backgroundImage: `linear-gradient(to bottom right, ${rgba}, transparent)`,
  };
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 148, 255';
}
