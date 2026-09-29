'use client';

/**
 * useLoadingAnimation Hook
 * Loading states: skeleton loaders, pulse, shimmer, progress indicators
 */

import { useState, useEffect, useRef } from 'react';

export interface LoadingAnimationOptions {
  // Whether loading is active
  isLoading?: boolean;
  // Duration of one animation cycle (ms)
  duration?: number;
  // Delay before animation starts (ms)
  delay?: number;
}

// ============================================================================
// SKELETON LOADER
// ============================================================================

export interface SkeletonOptions {
  // Background color
  baseColor?: string;
  // Highlight color (shimmer)
  highlightColor?: string;
  // Animation speed (ms)
  speed?: number;
  // Border radius
  borderRadius?: string;
}

/**
 * Hook: Skeleton loader animation
 * Returns Framer Motion props for a shimmering skeleton element
 */
export const useSkeletonLoader = (options: SkeletonOptions = {}) => {
  const {
    baseColor = '#e5e7eb',
    highlightColor = '#f3f4f6',
    speed = 1500,
    borderRadius = '8px',
  } = options;

  return {
    style: {
      background: `linear-gradient(
        90deg,
        ${baseColor} 0%,
        ${highlightColor} 50%,
        ${baseColor} 100%
      )`,
      backgroundSize: '200% 100%',
      borderRadius,
    },
    animate: {
      backgroundPosition: ['200% 0%', '-200% 0%'],
    },
    transition: {
      duration: speed / 1000,
      repeat: Infinity,
      ease: 'linear',
    },
  };
};

/**
 * Hook: Skeleton text lines
 * Generate multiple skeleton lines with varying widths
 */
export const useSkeletonText = (lines: number = 3, options: SkeletonOptions = {}) => {
  const skeletonProps = useSkeletonLoader(options);

  const lineWidths = Array.from({ length: lines }, (_, i) => {
    if (i === lines - 1) return '60%'; // Last line shorter
    return '100%';
  });

  return {
    lines: lineWidths.map((width) => ({
      ...skeletonProps,
      style: { ...skeletonProps.style, width, height: '16px' },
    })),
  };
};

// ============================================================================
// PULSE ANIMATION
// ============================================================================

/**
 * Hook: Pulse animation for loading states
 * Simple opacity pulse
 */
export const usePulseAnimation = (options: LoadingAnimationOptions = {}) => {
  const { duration = 1500 } = options;

  return {
    animate: {
      opacity: [0.4, 1, 0.4],
    },
    transition: {
      duration: duration / 1000,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };
};

/**
 * Hook: Scale pulse (breathing effect)
 * For icons, avatars, loading indicators
 */
export const useScalePulse = (
  minScale: number = 0.95,
  maxScale: number = 1.05,
  duration: number = 1500
) => {
  return {
    animate: {
      scale: [minScale, maxScale, minScale],
    },
    transition: {
      duration: duration / 1000,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };
};

// ============================================================================
// SHIMMER EFFECT
// ============================================================================

/**
 * Hook: Shimmer sweep effect
 * Light sweeps across element (used on cards, images while loading)
 */
export const useShimmerSweep = (options: SkeletonOptions = {}) => {
  const { speed = 2000 } = options;

  return {
    overlayStyle: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background:
        'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
      backgroundSize: '200% 100%',
    },
    animate: {
      backgroundPosition: ['-200% 0%', '200% 0%'],
    },
    transition: {
      duration: speed / 1000,
      repeat: Infinity,
      ease: 'linear',
    },
  };
};

// ============================================================================
// SPINNER
// ============================================================================

/**
 * Hook: Rotating spinner
 * Smooth infinite rotation
 */
export const useSpinner = (duration: number = 1000) => {
  return {
    animate: { rotate: 360 },
    transition: {
      duration: duration / 1000,
      repeat: Infinity,
      ease: 'linear',
    },
  };
};

/**
 * Hook: Dots loading animation
 * Three dots with staggered pulse (like iMessage typing indicator)
 */
export const useDotsLoader = (dotCount: number = 3, staggerDelay: number = 0.15) => {
  const dots = Array.from({ length: dotCount }, (_, i) => ({
    animate: {
      y: [0, -8, 0],
    },
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: i * staggerDelay,
    },
  }));

  return { dots };
};

// ============================================================================
// PROGRESS INDICATORS
// ============================================================================

export interface ProgressOptions {
  // Current progress (0-100)
  value: number;
  // Animation duration for progress changes
  duration?: number;
  // Whether to show indeterminate loading (unknown progress)
  indeterminate?: boolean;
}

/**
 * Hook: Progress bar animation
 * Smooth width transition based on progress value
 */
export const useProgressBar = (options: ProgressOptions) => {
  const { value, duration = 0.3, indeterminate = false } = options;

  if (indeterminate) {
    return {
      animate: {
        x: ['-100%', '100%'],
      },
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
      style: { width: '40%' },
    };
  }

  return {
    animate: { width: `${Math.min(100, Math.max(0, value))}%` },
    transition: { duration, ease: [0, 0, 0.2, 1] },
  };
};

/**
 * Hook: Circular progress indicator
 * Returns stroke-dashoffset calculations for SVG circle
 */
export const useCircularProgress = (options: ProgressOptions & { radius?: number }) => {
  const { value, radius = 40, duration = 0.3, indeterminate = false } = options;

  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  if (indeterminate) {
    return {
      circumference,
      strokeDashoffset: circumference * 0.25,
      animate: { rotate: 360 },
      transition: { duration: 1, repeat: Infinity, ease: 'linear' },
    };
  }

  return {
    circumference,
    strokeDashoffset: offset,
    animate: { strokeDashoffset: offset },
    transition: { duration, ease: [0, 0, 0.2, 1] },
  };
};

/**
 * Hook: Step progress indicator
 * For multi-step forms / wizards
 */
export const useStepProgress = (currentStep: number, totalSteps: number) => {
  const progress = (currentStep / totalSteps) * 100;

  const steps = Array.from({ length: totalSteps }, (_, i) => {
    const stepNumber = i + 1;
    const isComplete = stepNumber < currentStep;
    const isActive = stepNumber === currentStep;

    return {
      isComplete,
      isActive,
      animate: {
        scale: isActive ? 1.1 : 1,
        backgroundColor: isComplete || isActive ? '#0094FF' : '#e5e7eb',
      },
      transition: { duration: 0.3, type: 'spring', damping: 20, stiffness: 100 },
    };
  });

  return {
    progress,
    steps,
    barAnimate: { width: `${progress}%` },
    barTransition: { duration: 0.4, ease: [0, 0, 0.2, 1] },
  };
};

// ============================================================================
// STATE TRANSITIONS (loading -> success/error)
// ============================================================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Hook: Manages loading state transitions with animation variants
 * Returns the current variant based on state
 */
export const useLoadingStateAnimation = (state: LoadingState) => {
  const variants = {
    idle: {
      scale: 1,
      opacity: 1,
      backgroundColor: 'transparent',
    },
    loading: {
      scale: 1,
      opacity: 0.7,
      backgroundColor: 'rgba(0, 148, 255, 0.05)',
    },
    success: {
      scale: [1, 1.05, 1],
      opacity: 1,
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
    },
    error: {
      x: [-4, 4, -4, 4, 0],
      opacity: 1,
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
  };

  const transitions = {
    idle: { duration: 0.2 },
    loading: { duration: 0.2 },
    success: { duration: 0.6, ease: 'easeInOut' },
    error: { duration: 0.4, ease: 'easeInOut' },
  };

  return {
    animate: variants[state],
    transition: transitions[state],
  };
};

/**
 * Hook: Success checkmark animation
 * Draws an SVG checkmark path on success
 */
export const useSuccessCheckmark = (isVisible: boolean) => {
  return {
    initial: { pathLength: 0, opacity: 0 },
    animate: isVisible
      ? { pathLength: 1, opacity: 1 }
      : { pathLength: 0, opacity: 0 },
    transition: {
      pathLength: { duration: 0.4, ease: 'easeInOut' },
      opacity: { duration: 0.1 },
    },
  };
};

/**
 * Hook: Error state icon (X mark) animation
 */
export const useErrorIcon = (isVisible: boolean) => {
  return {
    initial: { scale: 0, rotate: -180, opacity: 0 },
    animate: isVisible
      ? { scale: 1, rotate: 0, opacity: 1 }
      : { scale: 0, rotate: -180, opacity: 0 },
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 200,
    },
  };
};

// ============================================================================
// LOADING TIMEOUT MANAGEMENT
// ============================================================================

/**
 * Hook: Manages minimum loading duration to prevent flash-of-loading
 * Ensures loading state shows for at least `minDuration` ms even if data loads faster
 */
export const useMinimumLoadingTime = (isLoading: boolean, minDuration: number = 400) => {
  const [showLoading, setShowLoading] = useState(isLoading);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      startTimeRef.current = Date.now();
      setShowLoading(true);
    } else if (startTimeRef.current) {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, minDuration - elapsed);

      const timer = setTimeout(() => {
        setShowLoading(false);
        startTimeRef.current = null;
      }, remaining);

      return () => clearTimeout(timer);
    }
  }, [isLoading, minDuration]);

  return showLoading;
};

/**
 * Hook: Debounced loading state
 * Only shows loading indicator if operation takes longer than threshold
 * Prevents flash-of-loading for fast operations
 */
export const useDebouncedLoading = (isLoading: boolean, threshold: number = 200) => {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isLoading) {
      timer = setTimeout(() => setShowLoading(true), threshold);
    } else {
      setShowLoading(false);
    }

    return () => clearTimeout(timer);
  }, [isLoading, threshold]);

  return showLoading;
};
