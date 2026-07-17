'use client';

/**
 * useHoverAnimation Hook
 * Interactive hover effects with elevation, glow, and color transitions
 */

import { useRef, useState } from 'react';
import { useMotionTemplate, useMotionValue, useTransform } from 'framer-motion';

export interface HoverAnimationOptions {
  // Scale on hover (1.02 = 2% larger)
  scale?: number;
  // Y offset on hover (negative = lift up)
  yOffset?: number;
  // Shadow elevation increase
  shadowElevation?: number;
  // Glow color (hex or rgba)
  glowColor?: string;
  // Glow blur radius
  glowRadius?: number;
  // Whether to animate on mobile touch
  enableTouchAnimation?: boolean;
}

/**
 * Hook: Scale + Shadow elevation on hover
 * Apple-style card elevation
 */
export const useHoverLift = (options: HoverAnimationOptions = {}) => {
  const {
    scale = 1.02,
    yOffset = -6,
    shadowElevation = 12,
    enableTouchAnimation = false,
  } = options;

  const [isHovered, setIsHovered] = useState(false);

  return {
    whileHover: enableTouchAnimation || true ? { scale, y: yOffset } : {},
    whileTap: { scale: 0.98, y: 0 },
    animate: isHovered
      ? {
          boxShadow: `0 ${shadowElevation}px ${shadowElevation * 2}px rgba(0, 0, 0, 0.15)`,
        }
      : {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 100,
      mass: 1,
    },
    onHoverStart: () => setIsHovered(true),
    onHoverEnd: () => setIsHovered(false),
  };
};

/**
 * Hook: Glow effect on hover
 * Electric blue glow for interactive elements
 */
export const useHoverGlow = (options: HoverAnimationOptions = {}) => {
  const {
    glowColor = 'rgba(0, 148, 255, 0.5)',
    glowRadius = 20,
    enableTouchAnimation = false,
  } = options;

  const [isHovered, setIsHovered] = useState(false);

  return {
    animate: {
      boxShadow: isHovered
        ? `0 0 ${glowRadius}px ${glowColor}, 0 0 ${glowRadius * 0.6}px ${glowColor}`
        : '0 0 0px rgba(0, 148, 255, 0)',
    },
    transition: { duration: 0.15, type: 'tween' },
    onHoverStart: () => {
      if (enableTouchAnimation) setIsHovered(true);
    },
    onHoverEnd: () => {
      if (enableTouchAnimation) setIsHovered(false);
    },
  };
};

/**
 * Hook: Color transition on hover
 * Smooth color change (useful for text, icons, borders)
 */
export const useHoverColor = (
  initialColor: string = '#1F2937',
  hoverColor: string = '#0094FF'
) => {
  const [isHovered, setIsHovered] = useState(false);

  return {
    animate: {
      color: isHovered ? hoverColor : initialColor,
    },
    transition: { duration: 0.2 },
    onHoverStart: () => setIsHovered(true),
    onHoverEnd: () => setIsHovered(false),
  };
};

/**
 * Hook: Glow + Color + Shadow all together
 * Premium interactive element effect
 */
export const useHoverPremium = (options: HoverAnimationOptions = {}) => {
  const {
    scale = 1.02,
    yOffset = -8,
    glowColor = 'rgba(0, 148, 255, 0.5)',
    glowRadius = 20,
    enableTouchAnimation = false,
  } = options;

  const [isHovered, setIsHovered] = useState(false);

  return {
    whileHover: enableTouchAnimation || true ? { scale, y: yOffset } : {},
    whileTap: { scale: 0.98, y: 0 },
    animate: {
      boxShadow: isHovered
        ? `0 ${yOffset * -1}px 24px rgba(0, 0, 0, 0.16), 0 0 ${glowRadius}px ${glowColor}`
        : '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 100,
    },
    onHoverStart: () => setIsHovered(true),
    onHoverEnd: () => setIsHovered(false),
  };
};

/**
 * Hook: Mouse-position-aware gradient glow
 * High-end UI effect: glow follows cursor
 */
export const useMouseGradient = (glowColor: string = 'rgba(0, 148, 255, 0.3)') => {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseX.set(x);
    mouseY.set(y);
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const background = useMotionTemplate`radial-gradient(
    600px at ${mouseX}px ${mouseY}px,
    ${glowColor},
    transparent 80%
  )`;

  return {
    ref,
    style: isHovered ? { background } : { background: 'transparent' },
    onMouseMove: handleMouseMove,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  };
};

/**
 * Hook: Border glow animation
 * Animated border color on hover
 */
export const useHoverBorderGlow = (
  initialBorder: string = '1px solid #e5e7eb',
  hoverBorder: string = '1px solid #0094FF'
) => {
  const [isHovered, setIsHovered] = useState(false);

  return {
    animate: {
      borderColor: isHovered ? '#0094FF' : '#e5e7eb',
      boxShadow: isHovered
        ? '0 0 0 3px rgba(0, 148, 255, 0.1), inset 0 0 8px rgba(0, 148, 255, 0.05)'
        : 'none',
    },
    transition: { duration: 0.2 },
    onHoverStart: () => setIsHovered(true),
    onHoverEnd: () => setIsHovered(false),
  };
};

/**
 * Hook: Rotate animation on hover
 * Subtle rotation for interactive elements
 */
export const useHoverRotate = (
  rotationDegrees: number = 2,
  enableTouchAnimation: boolean = false
) => {
  return {
    whileHover: enableTouchAnimation || true ? { rotate: rotationDegrees, scale: 1.02 } : {},
    whileTap: { rotate: 0, scale: 0.98 },
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 100,
    },
  };
};

/**
 * Hook: Underline animation on hover
 * Growing underline effect for links
 */
export const useHoverUnderline = (underlineColor: string = '#0094FF') => {
  const [isHovered, setIsHovered] = useState(false);

  return {
    animate: {
      backgroundImage: isHovered
        ? `linear-gradient(to right, ${underlineColor} 0%, ${underlineColor} 100%)`
        : `linear-gradient(to right, ${underlineColor} 0%, ${underlineColor} 0%)`,
      backgroundPosition: '0 100%',
      backgroundSize: '100% 2px',
      backgroundRepeat: 'no-repeat',
      transition: {
        backgroundSize: { duration: 0.3 },
      },
    },
    onHoverStart: () => setIsHovered(true),
    onHoverEnd: () => setIsHovered(false),
  };
};

/**
 * Hook: Button press effect
 * Scale down + y offset on tap/click
 */
export const useButtonPress = () => {
  return {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98, y: 2 },
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 100,
    },
  };
};

/**
 * Hook: Icon hover animation
 * Combines scale, rotate, and color for icons
 */
export const useHoverIcon = (
  scale: number = 1.15,
  rotate: number = 5,
  color: string = '#0094FF'
) => {
  return {
    whileHover: {
      scale,
      rotate,
      color,
    },
    whileTap: { scale: 0.95 },
    transition: {
      type: 'spring',
      damping: 18,
      stiffness: 120,
    },
  };
};

/**
 * Hook: Bounce effect on hover
 * Subtle up-and-down animation
 */
export const useHoverBounce = () => {
  const [isHovered, setIsHovered] = useState(false);

  return {
    animate: isHovered
      ? {
          y: [0, -8, 0],
        }
      : { y: 0 },
    transition: {
      duration: 0.6,
      repeat: isHovered ? Infinity : 0,
      ease: 'easeInOut',
    },
    onHoverStart: () => setIsHovered(true),
    onHoverEnd: () => setIsHovered(false),
  };
};

/**
 * Hook: Pulse effect on hover
 * Gradual opacity pulse for attention-grabbing
 */
export const useHoverPulse = () => {
  const [isHovered, setIsHovered] = useState(false);

  return {
    animate: isHovered
      ? {
          opacity: [1, 0.8, 1],
        }
      : { opacity: 1 },
    transition: {
      duration: 1,
      repeat: isHovered ? Infinity : 0,
      ease: 'easeInOut',
    },
    onHoverStart: () => setIsHovered(true),
    onHoverEnd: () => setIsHovered(false),
  };
};

/**
 * Hook: Text glow effect
 * For headings, product names, important text
 */
export const useTextGlow = (glowColor: string = 'rgba(0, 148, 255, 0.5)') => {
  const [isHovered, setIsHovered] = useState(false);

  return {
    animate: {
      textShadow: isHovered ? `0 0 20px ${glowColor}` : '0 0 0px transparent',
    },
    transition: { duration: 0.2 },
    onHoverStart: () => setIsHovered(true),
    onHoverEnd: () => setIsHovered(false),
  };
};

/**
 * Hook: Blur + Scale effect
 * Zoom in with content below becoming blurred
 */
export const useHoverBlurZoom = (scale: number = 1.05) => {
  return {
    whileHover: { scale },
    whileTap: { scale: 0.98 },
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 100,
    },
  };
};

/**
 * Hook: Shadow morphing
 * Changes shadow shape on hover (e.g., box to perspective)
 */
export const useHoverShadowMorph = () => {
  const [isHovered, setIsHovered] = useState(false);

  return {
    animate: {
      boxShadow: isHovered
        ? '0 20px 40px -15px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 148, 255, 0.2)'
        : '0 4px 12px rgba(0, 0, 0, 0.08)',
    },
    transition: { duration: 0.3 },
    onHoverStart: () => setIsHovered(true),
    onHoverEnd: () => setIsHovered(false),
  };
};

/**
 * Hook: Gradient shift on hover
 * Animated gradient background
 */
export const useHoverGradientShift = (
  initialGradient: string = 'linear-gradient(to right, #f3f4f6, #ffffff)',
  hoverGradient: string = 'linear-gradient(to right, #e0f2fe, #f0f9ff)'
) => {
  const [isHovered, setIsHovered] = useState(false);

  return {
    animate: {
      backgroundImage: isHovered ? hoverGradient : initialGradient,
    },
    transition: { duration: 0.3 },
    onHoverStart: () => setIsHovered(true),
    onHoverEnd: () => setIsHovered(false),
  };
};
