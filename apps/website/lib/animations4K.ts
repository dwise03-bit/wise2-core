/**
 * 4K Maximum Impact Animation Utilities
 *
 * Provides spring physics, parallax, and staggered animations
 * for the 4K visual design system.
 */

/**
 * Spring Physics Easing Function
 * Creates smooth, bouncy animations at 4K resolution
 *
 * @param stiffness - Spring stiffness (0.1 - 1.0)
 * @param damping - Spring damping (0.1 - 1.0)
 * @returns Cubic bezier string for CSS animations
 */
export const springEasing = (stiffness = 1.5, damping = 0.8) => {
  // Approximate spring physics with cubic-bezier
  return `cubic-bezier(0.34, ${stiffness}, 0.64, ${damping})`;
};

/**
 * Staggered Animation Configuration
 * Perfect for grid layouts and feature cards
 */
export const staggerConfig = {
  container: {
    staggerChildren: 0.1,
    delayChildren: 0.2,
  },
  item: {
    duration: 0.6,
    ease: springEasing(1.56, 0.64),
  },
};

/**
 * Parallax Scroll Multipliers
 * Use with data-parallax attributes
 */
export const parallaxSpeeds = {
  slow: 0.3,
  medium: 0.5,
  fast: 0.8,
};

/**
 * Neon Glow Effect Generator
 * Creates CSS text-shadow for 4K neon effects
 *
 * @param color - Hex color code (e.g., '#00D9FF')
 * @param intensity - Glow intensity (0-1)
 * @returns CSS text-shadow string
 */
export const createNeonGlow = (color: string, intensity = 0.6) => {
  const alpha = Math.round(intensity * 100);
  return `
    0 0 10px ${color},
    0 0 20px ${color}${Math.round(alpha * 0.6).toString(16).padStart(2, '0')},
    0 0 30px ${color}${Math.round(alpha * 0.3).toString(16).padStart(2, '0')},
    0 0 40px ${color}${Math.round(alpha * 0.15).toString(16).padStart(2, '0')}
  `;
};

/**
 * Glassmorphism Style Object Generator
 * Creates consistent glassmorphic effects
 *
 * @param opacity - Background opacity (0-1)
 * @param blur - Backdrop blur amount (px)
 * @param borderColor - Border color with alpha
 * @returns CSS style object
 */
export const createGlassmorphism = (
  opacity = 0.45,
  blur = 20,
  borderColor = "rgba(0, 217, 255, 0.15)"
) => {
  return {
    background: `rgba(5, 6, 7, ${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    border: `1px solid ${borderColor}`,
  };
};

/**
 * Ripple Effect Animation
 * Creates a ripple effect from click point
 *
 * @param event - Mouse event
 * @param element - Target element
 */
export const createRippleEffect = (
  event: React.MouseEvent<HTMLElement>,
  element: HTMLElement
) => {
  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const ripple = document.createElement("span");
  ripple.style.position = "absolute";
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.width = "20px";
  ripple.style.height = "20px";
  ripple.style.background = "rgba(0, 217, 255, 0.5)";
  ripple.style.borderRadius = "50%";
  ripple.style.transform = "translate(-50%, -50%)";
  ripple.style.pointerEvents = "none";
  ripple.style.animation = "ripple-burst 0.6s ease-out forwards";

  element.appendChild(ripple);

  setTimeout(() => ripple.remove(), 600);
};

/**
 * 4K Responsive Font Scale
 * Scales typography for 4K displays while maintaining mobile support
 */
export const responsiveFontScale = {
  display4K: "clamp(2rem, 8vw, 5rem)",
  heading4K: "clamp(1.5rem, 5vw, 3rem)",
  subheading4K: "clamp(1rem, 3vw, 1.75rem)",
  body: "clamp(0.875rem, 1vw, 1.125rem)",
};

/**
 * Color Palette for 4K Design
 * WISE² brand colors optimized for neon glow effects
 */
export const neonColors = {
  cyan: "#00D9FF",
  green: "#00FF7F",
  gold: "#C4A369",
  primary: "#050607",
  secondary: "#1a2534",
  text: "#F7F7F4",
  muted: "#8D98A5",
};

/**
 * Gradient Definitions for 4K
 * Pre-defined gradients for backgrounds and text
 */
export const gradients4K = {
  heroMesh: `linear-gradient(135deg,
    #050607 0%,
    rgba(0, 217, 255, 0.08) 40%,
    rgba(0, 255, 127, 0.05) 70%,
    #050607 100%)`,

  neonGradient: `linear-gradient(90deg,
    #00D9FF 0%,
    #00FF7F 50%,
    #C4A369 100%)`,

  ctaHover: `linear-gradient(90deg,
    rgba(0, 217, 255, 0.2) 0%,
    rgba(0, 255, 127, 0.15) 50%,
    rgba(196, 163, 105, 0.1) 100%)`,
};

/**
 * Animation Timing Constants
 * Standardized timing for consistent feel across components
 */
export const timings = {
  fast: 0.2,
  normal: 0.3,
  spring: 0.35,
  slow: 0.5,
};

/**
 * Create Hover Glow Animation
 * Enhances an element with hover-based glow effect
 *
 * @param element - Target HTML element
 * @param color - Neon color (cyan/green/gold)
 */
export const addHoverGlow = (
  element: HTMLElement,
  color: "cyan" | "green" | "gold" = "cyan"
) => {
  const colorMap = {
    cyan: { color: "#00D9FF", shadow: "rgba(0, 217, 255, 0.4)" },
    green: { color: "#00FF7F", shadow: "rgba(0, 255, 127, 0.4)" },
    gold: { color: "#C4A369", shadow: "rgba(196, 163, 105, 0.4)" },
  };

  const palette = colorMap[color];

  element.addEventListener("mouseenter", () => {
    element.style.boxShadow = `
      0 0 20px ${palette.shadow},
      0 0 40px ${palette.shadow}
    `;
  });

  element.addEventListener("mouseleave", () => {
    element.style.boxShadow = "none";
  });
};

/**
 * Setup Parallax Scrolling
 * Applies parallax effect to elements with data-parallax attribute
 */
export const setupParallax = () => {
  const handleScroll = () => {
    const scrollY = window.scrollY;
    const elements = document.querySelectorAll("[data-parallax]");

    elements.forEach((el) => {
      const speed = parseFloat((el as HTMLElement).dataset.parallax || "0.5");
      (el as HTMLElement).style.transform = `translateY(${scrollY * speed}px)`;
    });
  };

  window.addEventListener("scroll", handleScroll, { passive: true });

  return () => window.removeEventListener("scroll", handleScroll);
};

/**
 * Intersection Observer for Scroll Animations
 * Triggers animations when elements enter viewport
 */
export const observeElements = (selector: string, options = {}) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        (entry.target as HTMLElement).classList.add("animate-in");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    ...options,
  });

  document.querySelectorAll(selector).forEach((el) => {
    observer.observe(el);
  });

  return observer;
};
