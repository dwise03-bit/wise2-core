'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import type { LucideIcon } from 'lucide-react';
// Imported via stable subpaths rather than the `lucide-react` barrel: Next.js's
// built-in optimizePackageImports transform rewrites barrel imports from this
// package, and for this icon set that rewrite resolves inconsistently between
// the server and client bundle, causing a hydration mismatch (missing <path>
// inside <svg>). Deep-importing sidesteps the transform entirely.
import Zap from 'lucide-react/dist/esm/icons/zap';
import Users2 from 'lucide-react/dist/esm/icons/users-2';
import CreditCard from 'lucide-react/dist/esm/icons/credit-card';
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3';
import Rocket from 'lucide-react/dist/esm/icons/rocket';
import Monitor from 'lucide-react/dist/esm/icons/monitor';
import styles from './Features.module.css';

gsap.registerPlugin(ScrollTrigger);

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Zap,
    title: 'AI AUTOMATION',
    description: 'Work smarter. Not harder.',
  },
  {
    icon: Users2,
    title: 'CRM & PIPELINES',
    description: 'Manage leads. Close more.',
  },
  {
    icon: CreditCard,
    title: 'PAYMENTS',
    description: 'Secure. Fast. Fully integrated.',
  },
  {
    icon: BarChart3,
    title: 'ANALYTICS',
    description: 'Real-time data. Smarter decisions.',
  },
  {
    icon: Rocket,
    title: 'DEPLOYMENT',
    description: 'Launch. Scale. Dominate.',
  },
  {
    icon: Monitor,
    title: 'MONITORING',
    description: 'Uptime. Security. Peace of mind.',
  },
];

export const Features: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const cards = gridRef.current?.querySelectorAll(`.${styles.featureCard}`);
      if (cards) {
        gsap.from(cards, {
          opacity: 0,
          y: 24,
          duration: 0.5,
          stagger: 0.07,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        });
      }
    },
    { scope: containerRef }
  );

  return (
    <section className={styles.featuresSection} ref={containerRef}>
      <div className={styles.featuresContainer}>
        <div className={styles.featuresHeader}>
          <h2 className={styles.featuresTitle}>THE WISE² BUSINESS OS ADVANTAGE</h2>
        </div>

        <div className={styles.featuresGrid} ref={gridRef}>
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <IconComponent size={36} color="#0094FF" />
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
