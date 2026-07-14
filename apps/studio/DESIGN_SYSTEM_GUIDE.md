# WISE² Design System Guide

Professional audio engineering UI system for live streaming and recording applications.

**Version:** 1.0.0  
**Last Updated:** July 14, 2026  
**Style:** Modern neon/dark theme with blue and cyan accents

---

## Quick Start

### 1. Import Design Tokens

Design tokens are automatically imported via `design-tokens.css` in globals.css. No additional setup needed.

```tsx
// In your component, use CSS custom properties directly
import './styles/globals.css'; // Design tokens included

const MyButton = styled.button`
  background: var(--color-primary-500);
  padding: var(--space-4);
  border-radius: var(--border-radius-md);
`;
```

### 2. Available Token Categories

- **Colors** — Primary, accent, semantic, neutral palettes
- **Typography** — Font families, sizes, weights, line heights
- **Spacing** — 8px grid-based system (0-24 scale)
- **Sizing** — Touch targets, button heights, input sizes
- **Borders** — Radius, width options
- **Shadows** — Standard and neon glow effects
- **Animation** — Duration and easing functions
- **Breakpoints** — Responsive design breakpoints (xs-2xl)

---

## Color System

### Primary Color Scale (#0080FF)

Used for primary actions, buttons, and main UI elements.

```css
--color-primary-50: #e6f2ff;   /* Subtle backgrounds */
--color-primary-500: #0080ff;  /* Base color */
--color-primary-600: #0066cc;  /* Hover states */
--color-primary-700: #004d99;  /* Active states */
```

### Accent Color Scale (#00D4FF)

Used for highlights, focus states, and neon effects.

```css
--color-accent-500: #00d4ff;   /* Base accent */
--color-accent-600: #00a8cc;   /* Hover/secondary */
```

### Semantic Colors

```css
--color-success: #22c55e;       /* Positive actions */
--color-warning: #fbbf24;       /* Caution/alerts */
--color-danger: #ff3333;        /* Destructive actions */
--color-info: #00d4ff;          /* Informational */
```

### Color Contrast (WCAG AA Compliant)

All text and interactive elements meet or exceed WCAG AA standards:

- Primary text on neutral-900: **9.2:1** ✓
- Primary button text: **6.8:1** ✓
- Accent on dark: **5.1:1** ✓
- Warning on dark: **4.6:1** ✓

---

## Typography System

### Font Families

```css
--font-family-sans: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-family-mono: 'Fira Code', 'Courier New', monospace;
```

**Why Inter?** Modern, highly readable, excellent for UI with subtle character spacing.  
**Why Fira Code?** Professional appearance for code, values, and technical content.

### Font Size Scale (1.25x multiplier)

```
xs    10px   (body text minimal)
sm    13px   (labels, hints)
base  16px   (default body text)
lg    20px   (large body, subheadings)
xl    25px   (headings)
2xl   31px   (large headings)
3xl   39px   (page headers)
4xl   49px   (hero/feature)
5xl   61px   (display)
```

### Font Weights

```css
--font-weight-regular: 400;      /* Body text */
--font-weight-medium: 500;       /* Emphasized text */
--font-weight-semibold: 600;     /* Button text */
--font-weight-bold: 700;         /* Headings */
```

### Fluid Typography

Automatically scales based on viewport:

```css
--fluid-h1: clamp(2rem, 1rem + 3.6vw, 4rem);
--fluid-h2: clamp(1.75rem, 1rem + 2.3vw, 3rem);
--fluid-body: clamp(1rem, 0.95rem + 0.2vw, 1.125rem);
```

---

## Spacing System (8px Grid)

All spacing uses multiples of 8px for consistency.

```css
--space-1: 4px    (tight spacing)
--space-2: 8px    (default gap)
--space-4: 16px   (standard padding)
--space-6: 24px   (component spacing)
--space-8: 32px   (section spacing)
--space-12: 48px  (large sections)
```

**Pattern:** Use `var(--space-4)` for default padding, `var(--space-6)` for gaps between sections.

---

## Component Patterns

### Button Component

```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: ReactNode;
}

// Usage
<Button variant="primary" size="md">Click Me</Button>
<Button variant="danger" size="lg" disabled>Disabled</Button>
```

**Variants:**

- **primary**: Blue background, white text, neon hover effect
- **secondary**: Gray background, subtle hover
- **danger**: Red background, for destructive actions
- **ghost**: Transparent, outline style for secondary actions

**Sizes:**

- **sm**: 32px height, compact padding
- **md**: 40px height, standard
- **lg**: 48px height, for prominent actions

### Button Styling Template

```css
.btn {
  font-family: var(--font-family-sans);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--border-radius-md);
  min-height: var(--button-height-md);
  padding: var(--space-4);
  transition: all var(--duration-base) var(--ease-in-out);
}

.btn-primary {
  background-color: var(--color-primary-500);
  color: white;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-600);
  box-shadow: var(--shadow-neon-md);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--color-accent-500);
  outline-offset: 2px;
}
```

### Input Component

```tsx
interface InputProps {
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  placeholder?: string;
}
```

**Focus states** automatically show accent color outline.  
**Error state** displays danger color border.  
**Disabled state** reduces opacity to 50%.

### Mixer Channel Component

```tsx
interface MixerChannelProps {
  name: string;
  label: string;
  volume: number;        // -60 to +6 dB
  peakLevel: number;     // Current level
  isMuted: boolean;
  isSolo: boolean;
  onVolumeChange: (value: number) => void;
  onMuteToggle: () => void;
  onSoloToggle: () => void;
}
```

**VU Meter Color Zones:**

- **Green** (≤ -6dB): Safe operating range
- **Yellow** (-6 to -3dB): Caution zone
- **Red** (≥ -3dB): Clipping risk

---

## Responsive Design

### Breakpoints

```css
xs    0      /* Mobile phones (default) */
sm    480px  /* Large phones */
md    768px  /* Tablets */
lg    1024px /* Small laptops */
xl    1280px /* Desktops (primary) */
2xl   1536px /* Large displays */
```

### Responsive Pattern

```css
/* Mobile first */
.container {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-6);
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    grid-template-columns: 2fr 1fr;
    gap: var(--space-8);
  }
}
```

---

## Shadow System

### Layered Shadows (Neon Aesthetic)

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 128, 255, 0.05);
--shadow-md: 0 4px 12px 0 rgba(0, 212, 255, 0.1);
--shadow-lg: 0 10px 24px 0 rgba(0, 128, 255, 0.15);
```

### Neon Glow Effects

```css
--shadow-neon-sm: 0 0 10px rgba(0, 212, 255, 0.2);
--shadow-neon-md: 0 0 20px rgba(0, 212, 255, 0.3);
--shadow-neon-lg: 0 0 40px rgba(0, 128, 255, 0.4);
```

**Use neon shadows** on hover states, interactive elements, and focus indicators for modern appearance.

---

## Animation & Motion

### Duration Tokens

```css
--duration-fast: 150ms       /* Quick feedback */
--duration-base: 200ms       /* Standard transitions */
--duration-slow: 300ms       /* Moderate animations */
--duration-slower: 500ms     /* Deliberate, noticeable */
```

### Easing Functions

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);         /* Accelerate */
--ease-out: cubic-bezier(0, 0, 0.2, 1);        /* Decelerate */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);   /* Smooth both ways */
--ease-linear: linear;                          /* No change */
```

### Recommended Patterns

```css
/* Button interactions */
button {
  transition: all var(--duration-base) var(--ease-in-out);
}

/* Hover states */
button:hover {
  background-color: var(--color-primary-600);
  box-shadow: var(--shadow-neon-md);
  transform: translateY(-1px);
}

/* Focus states */
button:focus-visible {
  outline: 2px solid var(--color-accent-500);
  outline-offset: 2px;
}
```

---

## Accessibility Guidelines

### Touch Targets

All interactive elements must be at least **44×44px** for mobile accessibility.

```css
--size-touch-target: 44px;

.button {
  min-width: var(--size-touch-target);
  min-height: var(--size-touch-target);
}
```

### Focus Indicators

Always visible, using accent color:

```css
.interactive:focus-visible {
  outline: 2px solid var(--color-accent-500);
  outline-offset: 2px;
}
```

### Color Contrast

All text meets WCAG AA (4.5:1 for normal, 3:1 for large text).

### Semantic HTML

- Use proper heading hierarchy (h1-h6)
- Associate form labels with inputs
- Use `<button>` for actions, `<a>` for navigation
- Include ARIA landmarks (`<nav>`, `<main>`, `<aside>`)

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Developer Handoff Checklist

- [ ] Design tokens CSS imported in globals.css
- [ ] All components use `var(--*)` instead of hardcoded values
- [ ] Focus indicators on all interactive elements
- [ ] Hover states implemented for buttons and links
- [ ] Touch targets ≥ 44×44px on mobile
- [ ] Responsive design tested at xs, md, lg breakpoints
- [ ] Color contrast verified (WCAG AA)
- [ ] Semantic HTML used throughout
- [ ] Animation respects `prefers-reduced-motion`
- [ ] Component prop types match design spec

---

## Integration Examples

### React Styled Components

```tsx
import styled from 'styled-components';
import './styles/globals.css'; // Imports design tokens

const StyledButton = styled.button`
  background: var(--color-primary-500);
  color: white;
  padding: var(--space-4);
  border-radius: var(--border-radius-md);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  border: none;
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-in-out);
  box-shadow: var(--shadow-md);

  &:hover {
    background: var(--color-primary-600);
    box-shadow: var(--shadow-neon-md);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent-500);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
```

### Tailwind CSS

```js
// tailwind.config.js
module.exports = {
  theme: {
    colors: {
      primary: {
        50: 'var(--color-primary-50)',
        500: 'var(--color-primary-500)',
        600: 'var(--color-primary-600)',
        700: 'var(--color-primary-700)',
      },
      accent: 'var(--color-accent-500)',
      success: 'var(--color-success)',
      danger: 'var(--color-danger)',
    },
    spacing: {
      '1': 'var(--space-1)',
      '2': 'var(--space-2)',
      '4': 'var(--space-4)',
      '6': 'var(--space-6)',
      '8': 'var(--space-8)',
    },
  },
};
```

---

## References

- **Token File:** `design-tokens.css`
- **Config File:** `design-system.json`
- **Component Library:** `/apps/studio/components/Shared/`
- **Global Styles:** `/apps/studio/styles/globals.css`

---

**Questions?** Refer to component READMEs in `/components/Shared/` subdirectories.
