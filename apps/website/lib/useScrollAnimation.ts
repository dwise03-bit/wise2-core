'use client';

/**
 * useScrollAnimation Hook
 * Scroll-triggered animations with proper viewport detection
 * Includes parallax, fade-on-scroll, stagger lists
 */

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export interface ScrollAnimationOptions {
  // Trigger point: vertical offset from bottom of viewport
  margin?: string;
  // Only trigger once
  once?: boolean;
  // Custom animation duration
  duration?: number;
  // Delay before animation starts
  delay?: number;
  // Animation offset (how far to move)
  offset?: number;
  // Callback when element enters viewport
  onInView?: () => void;
  // Callback when element leaves viewport (if once=false)
  onOutOfView?: () => void;
}

/**
 * Hook: Fade in element on scroll
 */
export const useScrollFadeIn = (options: ScrollAnimationOptions = {}) => {
  const {
    margin = '-80px',
    once = true,
    duration = 0.6,
    delay = 0,
    onInView,
    onOutOfView,
  } = options;

  return {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration, delay },
    viewport: { once, margin },
    onViewportEnter: onInView,
    onViewportLeave: onOutOfView,
  };
};

/**
 * Hook: Slide up on scroll
 */
export const useScrollSlideUp = (options: ScrollAnimationOptions = {}) => {
  const {
    margin = '-80px',
    once = true,
    duration = 0.6,
    delay = 0,
    offset = 40,
    onInView,
    onOutOfView,
  } = options;

  return {
    initial: { opacity: 0, y: offset },
    whileInView: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: offset },
    transition: { duration, delay, ease: [0, 0, 0.2, 1] },
    viewport: { once, margin },
    onViewportEnter: onInView,
    onViewportLeave: onOutOfView,
  };
};

/**
 * Hook: Slide left on scroll
 */
export const useScrollSlideLeft = (options: ScrollAnimationOptions = {}) => {
  const {
    margin = '-80px',
    once = true,
    duration = 0.6,
    delay = 0,
    offset = 40,
    onInView,
    onOutOfView,
  } = options;

  return {
    initial: { opacity: 0, x: -offset },
    whileInView: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -offset },
    transition: { duration, delay },
    viewport: { once, margin },
    onViewportEnter: onInView,
    onViewportLeave: onOutOfView,
  };
};

/**
 * Hook: Slide right on scroll
 */
export const useScrollSlideRight = (options: ScrollAnimationOptions = {}) => {
  const {
    margin = '-80px',
    once = true,
    duration = 0.6,
    delay = 0,
    offset = 40,
    onInView,
    onOutOfView,
  } = options;

  return {
    initial: { opacity: 0, x: offset },
    whileInView: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: offset },
    transition: { duration, delay },
    viewport: { once, margin },
    onViewportEnter: onInView,
    onViewportLeave: onOutOfView,
  };
};

/**
 * Hook: Scale up on scroll
 */
export const useScrollScale = (options: ScrollAnimationOptions = {}) => {
  const {
    margin = '-80px',
    once = true,
    duration = 0.6,
    delay = 0,
    onInView,
    onOutOfView,
  } = options;

  return {
    initial: { opacity: 0, scale: 0.9 },
    whileInView: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: {
      duration,
      delay,
      type: 'spring',
      damping: 20,
      stiffness: 100,
    },
    viewport: { once, margin },
    onViewportEnter: onInView,
    onViewportLeave: onOutOfView,
  };
};

/**
 * Hook: Stagger list items on scroll
 * Apply to container, individual items will stagger in
 */
export const useScrollStaggerList = (
  itemCount: number,
  options: Omit<ScrollAnimationOptions, 'offset'> = {}
) => {
  const {
    margin = '-80px',
    once = true,
    duration = 0.6,
    delay = 0,
    onInView,
    onOutOfView,
  } = options;

  const containerVariants = {
    initial: 'initial',
    whileInView: 'animate',
    exit: 'exit',
    variants: {
      initial: { opacity: 1 },
      animate: {
        transition: {
          staggerChildren: 0.08,
          delayChildren: delay,
        },
      },
      exit: {
        transition: {
          staggerChildren: 0.05,
          staggerDirection: -1,
        },
      },
    },
    viewport: { once, margin },
    onViewportEnter: onInView,
    onViewportLeave: onOutOfView,
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration },
  };

  return { container: containerVariants, item: itemVariants };
};

/**
 * Hook: Parallax effect based on scroll position
 * Returns a component wrapper that handles parallax internally
 */
export const useParallax = (speed: number = 0.5) => {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const elementTop = rect.top;
        const windowHeight = window.innerHeight;

        // Only calculate parallax if element is in view
        if (elementTop < windowHeight && elementTop + rect.height > 0) {
          const progress = (windowHeight - elementTop) / (windowHeight + rect.height);
          setOffset(progress * speed * 100);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return {
    ref,
    style: { transform: `translateY(${offset}px)` },
  };
};

/**
 * Hook: Count up animation on scroll
 * Animates a number from 0 to target value when scrolled into view
 */
export interface CountUpOptions extends ScrollAnimationOptions {
  // Target number to count to
  target: number;
  // Number of decimal places
  decimals?: number;
  // Prefix (e.g., "$", "+")
  prefix?: string;
  // Suffix (e.g., "%", "ms")
  suffix?: string;
}

export const useCountUpOnScroll = (options: CountUpOptions) => {
  const {
    target,
    decimals = 0,
    prefix = '',
    suffix = '',
    margin = '-80px',
    once = true,
    duration = 2,
    onInView,
  } = options;

  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const increment = target / (duration * 60); // 60fps
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current * Math.pow(10, decimals)) / Math.pow(10, decimals));
            }
          }, 1000 / 60);

          onInView?.();

          if (once) {
            return () => clearInterval(timer);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: margin,
    });

    return () => observer.disconnect();
  }, [target, decimals, duration, once, hasAnimated, onInView]);

  return {
    display: `${prefix}${count.toFixed(decimals)}${suffix}`,
    count,
  };
};

/**
 * Hook: Scroll-linked animation
 * Bind element position to scroll progress (e.g., progress bar)
 */
export const useScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / scrollHeight) * 100;
      setProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { progress };
};

/**
 * Hook: Detect if element is in viewport
 * Useful for conditional rendering or triggering side effects
 */
export const useInViewport = (options: Omit<ScrollAnimationOptions, 'offset'> = {}) => {
  const { margin = '-80px', once = true, onInView, onOutOfView } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          onInView?.();
          if (once) {
            observer.unobserve(entry.target);
          }
        } else {
          if (!once) {
            setIsInView(false);
            onOutOfView?.();
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: margin,
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [once, margin, onInView, onOutOfView]);

  return { ref, isInView };
};

/**
 * Hook: Lazy load image with fade-in on scroll
 */
export const useLazyLoadImage = () => {
  const ref = useRef<HTMLImageElement>(null);
  const [src, setSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && ref.current?.dataset.src) {
          setSrc(ref.current.dataset.src);
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: '50px',
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoadingComplete = () => {
    setIsLoaded(true);
  };

  return {
    ref,
    src,
    isLoaded,
    onLoadingComplete: handleLoadingComplete,
    opacity: isLoaded ? 1 : 0,
    transition: { duration: 0.3 },
  };
};
