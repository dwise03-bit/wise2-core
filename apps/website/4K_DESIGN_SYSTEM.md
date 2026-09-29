# WISE² 4K Maximum Impact Visual Design System

## Overview

A comprehensive 4K-optimized design system for WISE² website featuring:
- **Animated Gradient Mesh** backgrounds with flow animations
- **Neon Glow Effects** for cyan, green, and gold text (4K HDR)
- **Glassmorphic Design** patterns with 20px backdrop blur
- **Spring Physics Animations** for smooth, bouncy interactions
- **Ripple Effects** on click for tactile feedback
- **Parallax Scrolling** with configurable speed multipliers
- **Responsive 4K Layout** scaling from mobile to 3840x2160

---

## Color Palette

### Neon Colors (4K Optimized)

```
Cyan:   #00D9FF (with glow and shadow effects)
Green:  #00FF7F (with glow and shadow effects)
Gold:   #C4A369 (with glow and shadow effects)
```

### Base Colors

```
Primary Background: #050607 (deep navy/black)
Secondary: #1a2534
Text Primary: #F7F7F4 (off-white)
Text Muted: #8D98A5 (gray)
```

---

## Component Library

### 1. Hero4K
Main hero section with animated gradient mesh and neon text.

**Features:**
- Animated background gradient mesh (15s loop)
- Spring physics title animation
- Parallax floating elements
- Metrics cards with glassmorphism
- CTA buttons with ripple effects

**Usage:**
```tsx
import { Hero4K } from "@/components/Hero4K";

export default function Page() {
  return <Hero4K />;
}
```

### 2. Navigation4K
Sticky glassmorphic navigation with logo glow.

**Features:**
- Sticky positioning with glass effect
- Logo with cyan glow on hover
- Responsive mobile menu
- Smooth hover animations on links
- CTA buttons with neon styling

**Usage:**
```tsx
import { Navigation4K } from "@/components/Navigation4K";

export default function Page() {
  return <Navigation4K />;
}
```

### 3. FeatureCards4K
3-column grid of glassmorphic feature cards.

**Features:**
- Auto-responsive grid (1 col mobile, 3 col desktop)
- Color-coded cards (cyan, green, gold)
- Hover glow intensification
- Shine effect overlay
- Icon and number badges

**Usage:**
```tsx
import { FeatureCards4K } from "@/components/FeatureCards4K";

export default function Page() {
  return <FeatureCards4K />;
}
```

### 4. CTA4K
Call-to-action section with neon gradient buttons.

**Features:**
- Animated floating background elements
- Neon gradient buttons with shimmer
- Metrics display
- Trust indicators
- Glass card container

**Usage:**
```tsx
import { CTA4K } from "@/components/CTA4K";

export default function Page() {
  return <CTA4K />;
}
```

### 5. Footer4K
Dark gradient footer with neon link underlines.

**Features:**
- Dark gradient background
- Multiple footer sections
- Social media links with hover effects
- Footer link underline animation
- Status badge with pulse animation

**Usage:**
```tsx
import { Footer4K } from "@/components/Footer4K";

export default function Page() {
  return <Footer4K />;
}
```

### 6. Page4K
Master page component integrating all 4K components.

**Usage:**
```tsx
import { Page4K } from "@/components/Page4K";

export default function HomePage() {
  return <Page4K />;
}
```

---

## CSS Classes & Utilities

### Text Effects

```css
/* Neon Glow Text */
.text-neon-cyan-4k      /* Cyan glow text */
.text-neon-green-4k     /* Green glow text */
.text-neon-gold-4k      /* Gold glow text */

/* Responsive Typography */
.text-display-4k        /* Main headings (clamp 2-5rem) */
.text-heading-4k        /* Section headings (clamp 1.5-3rem) */
.text-subheading-4k     /* Subheadings (clamp 1-1.75rem) */
```

### Glassmorphism

```css
.glass-4k               /* Base glassmorphic container */
.glass-4k-dark          /* Darker glass variant */
.glass-4k-light         /* Lighter glass variant */
.glass-card-4k          /* Full featured glass card with hover */
```

### Buttons

```css
.btn-glass-neon-4k      /* Glassmorphic button with neon border */
.btn-neon-gradient-4k   /* Neon gradient button with shimmer */
```

### Effects

```css
.filter-glow-cyan       /* Drop shadow glow (cyan) */
.filter-glow-green      /* Drop shadow glow (green) */
.ripple-effect          /* Ripple effect on click */
.parallax-slow          /* Parallax scroll at 0.3x speed */
```

### Animations

```css
.spring-in              /* Spring entrance animation */
.spring-up              /* Spring up entrance */
.stagger-item           /* Staggered fade-in-up */
```

### Navigation

```css
.nav-sticky-glass       /* Sticky nav with glassmorphism */
.logo-glow              /* Logo with cyan text glow */
```

### Footer

```css
.footer-dark-gradient   /* Dark gradient footer background */
.footer-link-neon       /* Footer link with neon underline */
.underline-neon         /* Neon underline animation on hover */
```

---

## Animation Library

### Framer Motion Variants

All components use spring physics easing: `cubic-bezier(0.34, 1.56, 0.64, 1)`

```tsx
// Staggered container animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Item animations
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.34, 1.56, 0.64, 1], // Spring easing
    },
  },
};
```

### CSS Keyframe Animations

- `mesh-flow` - Animated gradient mesh (15s loop)
- `spring-in` - Spring entrance with scale
- `spring-up` - Spring entrance with vertical movement
- `fade-in-up` - Simple fade with vertical movement
- `ripple-burst` - Ripple effect propagation

---

## JavaScript Utilities

Import from `@/lib/animations4K.ts`:

```tsx
import {
  springEasing,
  createNeonGlow,
  createGlassmorphism,
  createRippleEffect,
  neonColors,
  gradients4K,
  setupParallax,
  observeElements,
} from "@/lib/animations4K";

// Create neon glow text shadow
const glow = createNeonGlow("#00D9FF", 0.8);

// Create glassmorphic styles
const glass = createGlassmorphism(0.45, 20, "rgba(0, 217, 255, 0.15)");

// Setup parallax scrolling
useEffect(() => {
  return setupParallax();
}, []);
```

---

## 4K Responsive Design

### Breakpoints
- Mobile: 320px - 374px
- Small: 375px - 639px
- Tablet: 640px - 767px
- Desktop: 768px - 1023px
- Large: 1024px - 1439px
- 2K: 1440px - 3839px
- 4K: 3840px+

### Responsive Font Scaling

```css
.text-display-4k {
  font-size: clamp(2rem, 8vw, 5rem);
  line-height: 1.1;
}

.text-heading-4k {
  font-size: clamp(1.5rem, 5vw, 3rem);
  line-height: 1.2;
}

.text-subheading-4k {
  font-size: clamp(1rem, 3vw, 1.75rem);
  line-height: 1.3;
}
```

### 4K Display Optimization (3840x2160)

Special scaling applies at `min-width: 3840px`:

```css
@media (min-width: 3840px) {
  :root {
    --text-scale-4k: 1.3;
  }
  
  .text-display-4k {
    font-size: calc(5rem * var(--text-scale-4k));
  }
}
```

---

## Implementation Checklist

- [x] Tailwind config extended with 4K utilities
- [x] Global CSS with animation definitions
- [x] Hero4K component with animated mesh
- [x] Navigation4K with sticky glassmorphism
- [x] FeatureCards4K with 3-column grid
- [x] CTA4K with neon buttons and ripple
- [x] Footer4K with dark gradient
- [x] Page4K master component
- [x] animations4K utility library
- [ ] Browser testing at multiple resolutions
- [ ] Performance optimization (lazy loading)
- [ ] Accessibility audit

---

## Browser Testing Checklist

Test at these resolutions:

### Mobile
- [ ] iPhone SE (375x667)
- [ ] iPhone 14 Pro (393x852)
- [ ] Galaxy S20 (360x800)

### Tablet
- [ ] iPad Mini (768x1024)
- [ ] iPad Pro (1024x1366)

### Desktop
- [ ] MacBook 13" (1440x900)
- [ ] 1080p (1920x1080)
- [ ] 2K (2560x1440)
- [ ] 4K (3840x2160)

### Test Coverage
- [ ] Navigation sticky behavior
- [ ] Animations on scroll entry
- [ ] Button hover effects
- [ ] Ripple click effects
- [ ] Parallax scroll
- [ ] Mobile menu toggle
- [ ] Text glow rendering
- [ ] Glass effect blur quality
- [ ] Neon color contrast (WCAG AA)

---

## Performance Notes

### Optimization Tips
1. Use `will-change` sparingly on animated elements
2. Disable animations on `prefers-reduced-motion`
3. Lazy load background images
4. Compress hero mesh gradient (complex gradients are CPU intensive)
5. Use `contain: layout` for fixed containers
6. Throttle parallax scroll events

### Bundle Size
- Framer Motion: ~40KB gzipped (already in dependencies)
- Animation utilities: ~3KB
- New CSS: ~25KB (before compression)
- Components: ~15KB total

---

## Accessibility

### Color Contrast
- Cyan text (#00D9FF) on dark bg: WCAG AAA compliant
- Green text (#00FF7F) on dark bg: WCAG AAA compliant
- Gold text (#C4A369) on dark bg: WCAG AA compliant

### Motion
- Respects `prefers-reduced-motion` media query
- Animations disabled when `@media (prefers-reduced-motion: reduce)`
- Fallback to static states for all interactive elements

### Keyboard Navigation
- All buttons and links are keyboard accessible
- Focus rings styled with neon green (#39ff14)
- Tab order follows visual hierarchy

---

## Customization Guide

### Changing Neon Colors

Edit `lib/animations4K.ts`:

```ts
export const neonColors = {
  cyan: "#00D9FF",      // Change to your color
  green: "#00FF7F",
  gold: "#C4A369",
  // ...
};
```

### Custom Glassmorphism

Use the utility function:

```tsx
import { createGlassmorphism } from "@/lib/animations4K";

const customGlass = createGlassmorphism(
  0.5,     // opacity
  24,      // blur amount
  "rgba(0, 217, 255, 0.2)" // border color
);
```

### Adjusting Animation Timing

Edit component variant definitions:

```tsx
const itemVariants = {
  visible: {
    transition: {
      duration: 1,        // Increase for slower animations
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
};
```

---

## Version History

- **v1.0.0** (2026-09-15) - Initial 4K design system release
  - Animated gradient mesh hero
  - Glassmorphic components
  - Neon glow effects
  - Spring physics animations
  - Full responsive design
  - Accessibility features

---

## Support

For questions or issues with the 4K design system:
1. Check this documentation first
2. Review component examples
3. Test at target resolution
4. Run accessibility audit
5. Profile performance metrics

---

## License

Part of WISE² Genesis - Enterprise AI Operating System
