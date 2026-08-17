/**
 * Enterprise Animation Suite for WISE² Studio
 * Framer Motion variants with Apple-quality polish
 * Includes accessibility (reduced motion) support
 */

import { Variants } from 'framer-motion';

// ============================================================================
// TIMING & EASING CONSTANTS (Apple-quality spring physics)
// ============================================================================

export const TIMING = {
  // Fast interactions
  FAST: 0.15,
  // Standard transitions
  STANDARD: 0.2,
  // Measured animations
  MEASURED: 0.3,
  // Slow reveals
  SLOW: 0.6,
} as const;

export const SPRING = {
  // Smooth, snappy (buttons, hovers)
  SNAPPY: { type: 'spring' as const, damping: 20, stiffness: 100, mass: 1 },
  // Bouncy but restrained (cards, lists)
  BOUNCY: { type: 'spring' as const, damping: 15, stiffness: 80, mass: 1.2 },
  // Smooth, slow (modals, overlays)
  SMOOTH: { type: 'spring' as const, damping: 25, stiffness: 50, mass: 1 },
  // Gentle wave (parallax, scroll)
  GENTLE: { type: 'spring' as const, damping: 30, stiffness: 30, mass: 1.5 },
} as const;

export const EASING = {
  ease_in_out: [0.4, 0, 0.2, 1],
  ease_out: [0, 0, 0.2, 1],
  ease_in: [0.4, 0, 1, 1],
} as const;

// ============================================================================
// FADE ANIMATIONS (opacity transitions)
// ============================================================================

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: TIMING.STANDARD },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: TIMING.MEASURED, ease: EASING.ease_out },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: TIMING.MEASURED, ease: EASING.ease_out },
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
  transition: { duration: TIMING.MEASURED, ease: EASING.ease_out },
};

export const fadeInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 },
  transition: { duration: TIMING.MEASURED, ease: EASING.ease_out },
};

// ============================================================================
// SLIDE ANIMATIONS (position-based movement)
// ============================================================================

export const slideInLeft = {
  initial: { x: -40, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -40, opacity: 0 },
  transition: SPRING.SNAPPY,
};

export const slideInRight = {
  initial: { x: 40, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 40, opacity: 0 },
  transition: SPRING.SNAPPY,
};

export const slideInTop = {
  initial: { y: -40, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -40, opacity: 0 },
  transition: SPRING.SNAPPY,
};

export const slideInBottom = {
  initial: { y: 40, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 40, opacity: 0 },
  transition: SPRING.SNAPPY,
};

// ============================================================================
// SCALE ANIMATIONS (size-based transitions)
// ============================================================================

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: SPRING.SNAPPY,
};

export const scaleInCenter = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.85 },
  transition: { ...SPRING.SMOOTH, delay: 0.05 },
};

export const scaleUp = {
  initial: { scale: 1 },
  animate: { scale: 1.02 },
  exit: { scale: 1 },
  transition: { duration: TIMING.FAST },
};

// ============================================================================
// BLUR ANIMATIONS (backdrop & focus)
// ============================================================================

export const blurIn = {
  initial: { opacity: 0, filter: 'blur(10px)' },
  animate: { opacity: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, filter: 'blur(10px)' },
  transition: { duration: TIMING.MEASURED },
};

export const blurOut = {
  initial: { opacity: 1, filter: 'blur(0px)' },
  animate: { opacity: 0.5, filter: 'blur(5px)' },
  exit: { opacity: 1, filter: 'blur(0px)' },
  transition: { duration: TIMING.MEASURED },
};

// ============================================================================
// GLOW ANIMATIONS (pulse & shimmer effects)
// ============================================================================

export const glowPulse = {
  initial: { boxShadow: '0 0 0px rgba(0, 148, 255, 0)' },
  animate: {
    boxShadow: [
      '0 0 0px rgba(0, 148, 255, 0)',
      '0 0 20px rgba(0, 148, 255, 0.5)',
      '0 0 0px rgba(0, 148, 255, 0)',
    ],
  },
  transition: { duration: 2, repeat: Infinity, ease: EASING.ease_in_out },
};

export const glowHover = {
  whileHover: { boxShadow: '0 0 20px rgba(0, 148, 255, 0.5)' },
  transition: { duration: TIMING.FAST },
};

// ============================================================================
// ROTATE ANIMATIONS (spin & tumble)
// ============================================================================

export const rotateSpin = {
  animate: { rotate: 360 },
  transition: { duration: 1, repeat: Infinity, ease: 'linear' },
};

export const rotatePulse = {
  animate: {
    rotate: [0, 5, -5, 0],
  },
  transition: { duration: 0.5, repeat: Infinity, ease: EASING.ease_in_out },
};

// ============================================================================
// STAGGER ANIMATIONS (container + children)
// ============================================================================

export const staggerContainer = {
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
  variants: {
    initial: { opacity: 1 },
    animate: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0,
      },
    },
    exit: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  },
};

export const staggerContainerSlow = {
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
  variants: {
    initial: { opacity: 1 },
    animate: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05,
      },
    },
    exit: {
      transition: {
        staggerChildren: 0.08,
        staggerDirection: -1,
      },
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: TIMING.STANDARD },
};

export const staggerItemScale = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: SPRING.SNAPPY,
};

// ============================================================================
// HOVER ANIMATIONS (interactive feedback)
// ============================================================================

export const hoverScale = {
  initial: { scale: 1 },
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: SPRING.SNAPPY,
};

export const hoverLift = {
  initial: { y: 0, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' },
  whileHover: {
    y: -6,
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
  },
  whileTap: { y: 0, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' },
  transition: { duration: TIMING.FAST },
};

export const hoverGlow = {
  initial: { boxShadow: '0 0 0px rgba(0, 148, 255, 0)' },
  whileHover: { boxShadow: '0 0 20px rgba(0, 148, 255, 0.5)' },
  transition: { duration: TIMING.FAST },
};

export const hoverColor = {
  initial: { color: '#1F2937' },
  whileHover: { color: '#0094FF' },
  transition: { duration: TIMING.STANDARD },
};

// ============================================================================
// BUTTON ANIMATIONS (press feedback)
// ============================================================================

export const buttonPress = {
  initial: { scale: 1, y: 0 },
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98, y: 2 },
  transition: SPRING.SNAPPY,
};

export const buttonElevated = {
  initial: {
    scale: 1,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
  },
  whileHover: {
    scale: 1.02,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.16)',
  },
  whileTap: {
    scale: 0.98,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  transition: { duration: TIMING.FAST },
};

// ============================================================================
// SCROLL ANIMATIONS (viewport-triggered)
// ============================================================================

export const scrollReveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 40 },
  transition: { duration: TIMING.MEASURED, ease: EASING.ease_out },
  viewport: { once: true, margin: '-80px' },
};

export const scrollRevealLeft = {
  initial: { opacity: 0, x: -40 },
  whileInView: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: TIMING.MEASURED },
  viewport: { once: true, margin: '-80px' },
};

export const scrollRevealRight = {
  initial: { opacity: 0, x: 40 },
  whileInView: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 40 },
  transition: { duration: TIMING.MEASURED },
  viewport: { once: true, margin: '-80px' },
};

export const scrollScale = {
  initial: { opacity: 0, scale: 0.9 },
  whileInView: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: SPRING.BOUNCY,
  viewport: { once: true, margin: '-80px' },
};

// ============================================================================
// PARALLAX ANIMATIONS (scroll-based position)
// ============================================================================

export const parallaxUp = (offset = -30) => ({
  initial: { y: 0 },
  whileInView: { y: offset },
  transition: { duration: 0, once: true },
  viewport: { once: false, margin: '0px' },
});

export const parallaxDown = (offset = 30) => ({
  initial: { y: 0 },
  whileInView: { y: offset },
  transition: { duration: 0, once: true },
  viewport: { once: false, margin: '0px' },
});

// ============================================================================
// STATE ANIMATIONS (feedback: success, error, loading)
// ============================================================================

export const successPulse = {
  animate: {
    scale: [1, 1.1, 1],
    backgroundColor: ['rgba(34, 197, 94, 0.1)', 'rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.1)'],
  },
  transition: { duration: 0.6, ease: EASING.ease_in_out },
};

export const errorShake = {
  animate: {
    x: [-4, 4, -4, 4, 0],
  },
  transition: { duration: 0.4, ease: EASING.ease_in_out },
};

export const warningPulse = {
  animate: {
    backgroundColor: [
      'rgba(251, 146, 60, 0)',
      'rgba(251, 146, 60, 0.2)',
      'rgba(251, 146, 60, 0)',
    ],
  },
  transition: { duration: 2, repeat: Infinity, ease: EASING.ease_in_out },
};

// ============================================================================
// LOADING ANIMATIONS (spinners & skeletons)
// ============================================================================

export const spinnerRotate = {
  animate: { rotate: 360 },
  transition: { duration: 1, repeat: Infinity, ease: 'linear' },
};

export const skeletonShimmer = {
  animate: {
    backgroundPosition: ['200% 0%', '-200% 0%'],
  },
  transition: { duration: 1.5, repeat: Infinity, ease: 'linear' },
};

export const pulseGlow = {
  animate: {
    opacity: [0.6, 1, 0.6],
  },
  transition: { duration: 1.5, repeat: Infinity, ease: EASING.ease_in_out },
};

// ============================================================================
// MODAL & OVERLAY ANIMATIONS
// ============================================================================

export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: TIMING.STANDARD },
};

export const modalContent = {
  initial: { opacity: 0, scale: 0.85, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.85, y: 20 },
  transition: SPRING.SMOOTH,
};

export const modalSlideUp = {
  initial: { opacity: 0, y: 100 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 100 },
  transition: SPRING.SNAPPY,
};

// ============================================================================
// DROPDOWN & MENU ANIMATIONS
// ============================================================================

export const dropdownOpen = {
  initial: { opacity: 0, y: -8, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.95 },
  transition: SPRING.SNAPPY,
};

export const menuOpen = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: TIMING.FAST },
};

// ============================================================================
// TAB & NAVIGATION ANIMATIONS
// ============================================================================

export const tabSwitch = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: TIMING.FAST },
};

export const tabIndicator = {
  initial: { width: 0, opacity: 0 },
  animate: { width: 'auto', opacity: 1 },
  exit: { width: 0, opacity: 0 },
  transition: SPRING.SNAPPY,
};

// ============================================================================
// SHARED UTILITY VARIANTS
// ============================================================================

export const containerVariants = {
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
};

export const itemVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// ============================================================================
// ACCESSIBILITY HELPER: Reduced Motion Support
// ============================================================================

/**
 * Helper to create animation-safe variants that respect prefers-reduced-motion
 * Usage: const safeVariants = createReducedMotionVariants(slideInUp, 'instant');
 */
export const createReducedMotionVariants = (
  variants: Variants,
  fallback: 'instant' | 'fade' = 'instant'
) => {
  if (typeof window === 'undefined') return variants;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    return variants;
  }

  if (fallback === 'instant') {
    return {
      initial: { ...variants.initial, opacity: 0 },
      animate: { ...variants.animate, opacity: 1 },
      exit: { ...variants.exit, opacity: 0 },
      transition: { duration: 0 },
    };
  }

  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: TIMING.FAST },
  };
};

// ============================================================================
// EXPORT PRESET COMBINATIONS FOR COMMON PATTERNS
// ============================================================================

export const PRESETS = {
  // Page transitions
  pageEnter: fadeIn,
  pageExit: fadeIn,

  // Card interactions
  card: {
    container: staggerContainer,
    item: staggerItem,
    hover: hoverLift,
  },

  // List rendering
  list: {
    container: staggerContainer,
    item: staggerItem,
  },

  // Modal dialogs
  modal: {
    backdrop: modalBackdrop,
    content: modalContent,
  },

  // Form feedback
  form: {
    success: successPulse,
    error: errorShake,
    loading: pulseGlow,
  },
} as const;
