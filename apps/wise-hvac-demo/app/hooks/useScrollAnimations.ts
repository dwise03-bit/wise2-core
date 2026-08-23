'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollAnimations() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Stagger animation for cards
      gsap.utils.toArray<HTMLElement>('[data-animate="card"]').forEach((card, index) => {
        gsap.from(card, {
          opacity: 0,
          y: 24,
          duration: 0.8,
          delay: index * 0.1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        });
      });

      // Fade-in sections
      gsap.utils.toArray<HTMLElement>('[data-animate="section"]').forEach((section) => {
        gsap.from(section, {
          opacity: 0,
          y: 40,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        });
      });

      // Floating elements
      gsap.utils.toArray<HTMLElement>('[data-animate="float"]').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 0 },
          {
            y: -8,
            duration: 3,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          }
        );
      });

      // Parallax on hero
      gsap.utils.toArray<HTMLElement>('[data-animate="parallax"]').forEach((el) => {
        gsap.to(el, {
          y: (i: number) => i * 50,
          ease: 'none',
          scrollTrigger: {
            trigger: el.parentElement,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
            markers: false,
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return containerRef;
}

export function usePageTransition() {
  useEffect(() => {
    // Disable animations for users who prefer reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Page entry animation
    const timeline = gsap.timeline();
    timeline.from('main', {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.inOut',
    });
  }, []);
}
