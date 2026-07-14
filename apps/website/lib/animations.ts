/**
 * Animation variants for Framer Motion
 * Reusable animation patterns across the site
 */

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.6 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.6 },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6 },
};

export const slideInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6 },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

export const containerVariants = {
  initial: "initial",
  animate: "animate",
};

// Hover animations
export const hoverScale = {
  whileHover: { scale: 1.05 },
  transition: { type: "spring", stiffness: 300, damping: 10 },
};

export const hoverGlow = {
  whileHover: { boxShadow: "0 0 20px rgba(0, 148, 255, 0.5)" },
  transition: { duration: 0.3 },
};

// Scroll animations
export const scrollReveal = {
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
  viewport: { once: true, margin: "-100px" },
};

export const cardHover = {
  initial: { y: 0 },
  whileHover: { y: -8 },
  transition: { duration: 0.3, type: "spring" },
};
