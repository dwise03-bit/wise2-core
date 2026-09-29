# WISE² Enterprise — Design System Master

**Version**: 2.0  
**Codename**: Organized Chaos Command Center  
**Type**: Enterprise Operating System  
**Primary Stack**: Next.js + React + TailwindCSS + shadcn/ui + Framer Motion  
**Last Updated**: 2026-07-28

---

## Executive Summary

WISE² is **NOT** a website, dashboard, or CRM. It is an **Enterprise Operating System** that powers complete business operations through unified workspaces, AI-driven automation, and real-time mission control.

The design system reflects this mission through:
- **Mission Control aesthetic** (Tesla Plaid dashboard inspiration)
- **Zero visual clutter** — only essential information visible
- **Electric operational readiness** — every status, every action, visible at a glance
- **AI as team** — visible workforce management with real-time indicators
- **Workflow-first** — every business process follows an observable 10-step workflow

---

## CORE COLOR PALETTE

### Dark Enterprise Foundation

| Token | Hex | Usage | CSS Variable |
|-------|-----|-------|--------------|
| **Background** | `#050505` | Page background, canvas | `--wise-bg-darkest` |
| **Surface-1** | `#1a1a1a` | Card surfaces, panels | `--wise-surface-1` |
| **Surface-2** | `#2d2d2d` | Hover states, depth | `--wise-surface-2` |
| **Border** | `#3d3d3d` | Dividers, outlines | `--wise-border` |
| **Text-Primary** | `#e8e8e8` | Headlines, key content | `--wise-text-primary` |
| **Text-Secondary** | `#999999` | Supporting text, hints | `--wise-text-secondary` |

### Action & Status Colors

| Token | Hex | Usage | Purpose |
|-------|-----|-------|---------|
| **Electric Blue** | `#00d4ff` | CTAs, interactive, AI agents | Primary action, highlights |
| **Neon Green** | `#39ff14` | Success, online, active | Positive confirmation, ready state |
| **Purple AI** | `#9d4edd` | AI decisions, recommendations | Machine intelligence indicator |
| **Accent Red** | `#ff006e` | Alerts, critical issues | Urgent action required |
| **Accent Orange** | `#ffa500` | Warnings, needs review | Caution, pending approval |

### Tailwind Integration

```tailwind
/* tailwind.config.ts */
theme: {
  colors: {
    wise: {
      'bg-darkest': '#050505',
      'surface-1': '#1a1a1a',
      'surface-2': '#2d2d2d',
      border: '#3d3d3d',
      'text-primary': '#e8e8e8',
      'text-secondary': '#999999',
      'blue-electric': '#00d4ff',
      'green-neon': '#39ff14',
      'purple-ai': '#9d4edd',
      'red-alert': '#ff006e',
      'orange-warning': '#ffa500',
    }
  }
}
```

---

## TYPOGRAPHY SYSTEM

### Font Stack

| Tier | Family | Usage | Weight | Size |
|------|--------|-------|--------|------|
| **Display** | System Font (Chrome/Helvetica) | Headlines, page titles | 700 | 32px–48px |
| **Body** | System Font | Copy, descriptions | 400–500 | 14px–16px |
| **Monospace** | JetBrains Mono | Code, metrics, precise data | 400–500 | 12px–14px |

### Typography Scale

```css
/* Headlines */
--type-h1: 2.5rem (40px) / 500 weight / Chrome font / line-height 1.2
--type-h2: 2rem (32px) / 600 weight / Chrome font / line-height 1.3
--type-h3: 1.5rem (24px) / 600 weight / Chrome font / line-height 1.4

/* Body */
--type-body-lg: 1rem (16px) / 400 weight / system / line-height 1.5
--type-body: 0.875rem (14px) / 400 weight / system / line-height 1.5
--type-label: 0.75rem (12px) / 500 weight / monospace / line-height 1.4 / uppercase letter-spacing 0.5px

/* Callouts */
--type-metric: 1.25rem (20px) / 700 weight / monospace / line-height 1.2
--type-status: 0.75rem (12px) / 600 weight / system / uppercase letter-spacing 1px
```

### Rules

- **Minimum body text**: 14px (never below)
- **Line height**: 1.5 for body, 1.2–1.4 for headlines
- **Letter spacing**: Normal body, +0.5px for labels, +1px for status indicators
- **Emphasis**: Use weight (600+) and Electric Blue, not italics
- **No decorative text**: Everything must be readable

---

## SPACING & LAYOUT SYSTEM

### Density Grid (9/10 - Dense Dashboard)

```css
--space-xs: 4px    /* Micro spacing: icon padding, tight groups */
--space-sm: 8px    /* Small: component padding, tight sections */
--space-md: 16px   /* Base: component internal, card gaps */
--space-lg: 24px   /* Large: section gaps, vertical rhythm */
--space-xl: 32px   /* XL: major sections, whitespace */
--space-2xl: 48px  /* XXL: page padding, hero sections */

/* Border radius */
--radius-sm: 4px   /* Tight: buttons, badges */
--radius-md: 8px   /* Standard: cards, panels */
--radius-lg: 12px  /* Generous: modals, featured cards */

/* Shadows (glassmorphism) */
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.24)
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.32)
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.40)
```

### Rules

- **All spacing in multiples of 4px**: Enforced visual consistency
- **Never add arbitrary spacing**: Always use CSS variables
- **Whitespace = breathing room**: Dense ≠ cramped; 16px minimum between major sections
- **Touch targets**: 44px × 44px minimum (mobile-friendly even on desktop)

---

## COMPONENT ARCHITECTURE

### Card Surfaces (Glass Panels)

```tsx
// WiseCard - Every surface that holds content
<div className="rounded-lg bg-wise-surface-1 border border-wise-border p-4 shadow-md hover:shadow-lg transition-shadow">
  {children}
</div>

// Properties:
// - Background: wise-surface-1 (#1a1a1a)
// - Border: 1px wise-border (#3d3d3d)
// - Padding: 16px
// - Border radius: 8px
// - Shadow: soft drop shadow
// - Hover: deeper shadow (depth feedback)
```

### Status Indicators

```tsx
// Ready — Neon Green
<span className="w-2 h-2 bg-wise-green-neon rounded-full animate-pulse" />

// Working — Electric Blue
<span className="w-2 h-2 bg-wise-blue-electric rounded-full animate-pulse" />

// Alert — Red
<span className="w-2 h-2 bg-wise-red-alert rounded-full animate-pulse" />

// Offline — Gray
<span className="w-2 h-2 bg-wise-text-secondary rounded-full" />
```

### Status Chips (Small Badges)

```tsx
// Usage: "Generating", "Publishing", "Complete", "Error"
<span className="px-2 py-1 bg-wise-surface-2 border border-wise-border text-xs font-medium text-wise-text-primary rounded-md">
  {status}
</span>
```

### Action Button (Electric Blue)

```tsx
<button className="px-4 py-2 bg-wise-blue-electric text-black font-semibold rounded-md hover:opacity-90 active:scale-95 transition-all">
  Take Action
</button>

// Rules:
// - Electric Blue background
// - Black text (high contrast)
// - Pill-shaped (8px radius)
// - Full-width on mobile, fixed on desktop
// - Hover: opacity-90
// - Active: scale-95 (haptic feedback visual)
// - Never disabled looking — either enabled or hidden
```

### Input Fields

```tsx
<input
  type="text"
  className="w-full px-3 py-2 bg-wise-surface-2 border border-wise-border rounded-md text-wise-text-primary focus:border-wise-blue-electric focus:ring-1 focus:ring-wise-blue-electric outline-none transition-colors"
  placeholder="Your placeholder text"
/>

// Rules:
// - Dark background (surface-2)
// - Subtle border (wise-border)
// - Electric blue on focus
// - No outline (we use ring)
// - Placeholder text: text-secondary (dim)
```

---

## LAYOUT PATTERNS

### Mission Control Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│ TOP ROW (Metrics & Alerts)                                      │
├─ Revenue    ├─ Workflow Queue  ├─ AI Activity  ├─ Health       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────┐  ┌────────────────────────┐
│ CENTER (Operational)                 │  │ RIGHT PANEL (Command)  │
│                                      │  │                        │
│ • Workflow Timeline                  │  │ Hermes Floating Panel  │
│ • Production Status                  │  │ • Ready                │
│ • AI Decisions (live)                │  │ • Suggesting...        │
│ • Business Metrics                   │  │ • Approving...         │
│ • Automation Queue                   │  │ • Running commands     │
│                                      │  │                        │
│ [Each card: wise-surface-1 + border] │  │ [Glass panel effect]   │
└──────────────────────────────────────┘  └────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ BOTTOM ROW (Infrastructure Health)                              │
├─ Redis OK ├─ Docker OK ├─ PostgreSQL OK ├─ Workers: 5 Ready   │
└─────────────────────────────────────────────────────────────────┘
```

### Workflow Ribbon (Always Visible)

```
INPUT → UNDERSTAND → ANALYSIS → DECISION → AUTOMATION → APPROVAL → EXECUTION → VERIFY → ANALYTICS → LEARNING

[Each step is clickable, shows status, icon + label]
[Current step: Electric Blue, highlight]
[Completed steps: Neon Green checkmark]
[Pending steps: Gray]
```

---

## ANIMATION & MOTION

### Motion Principles

| Trigger | Duration | Easing | Purpose |
|---------|----------|--------|---------|
| Load | 300-400ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Stagger grid items in |
| Hover | 150-200ms | `ease-in-out` | Feedback on interactive |
| State change | 200-300ms | `ease-out` | Status update |
| Workflow step | 500ms | `spring(damping: 20, stiffness: 90)` | Smooth progression |
| Alert/Error | Instant | — | Immediate attention |

### GSAP Snippets (Framer Motion alternatives)

```js
// Stagger grid load
gsap.from('.grid-item', {
  opacity: 0,
  scale: 0.92,
  y: 16,
  duration: 0.4,
  stagger: { each: 0.06, from: 'start', grid: 'auto' },
  ease: 'back.out(1.4)'
});

// Workflow step pulse
gsap.to('.workflow-step.active', {
  boxShadow: '0 0 16px rgba(0, 212, 255, 0.5)',
  duration: 1.5,
  repeat: -1,
  yoyo: true,
  ease: 'sine.inOut'
});

// Alert entrance
gsap.from('.alert', {
  opacity: 0,
  y: -20,
  duration: 0.3,
  ease: 'back.out(2)'
});
```

### Framer Motion Variants (Alternative)

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4 } },
};
```

### Rules

- **All animations must serve a purpose** (feedback, navigation, status)
- **No decorative motion** (every pixel movement = information)
- **Respect `prefers-reduced-motion`** (always detect via CSS media query)
- **Duration 150–500ms** (never slower, never instant)
- **Exit faster than enter** (200ms out vs 300ms in)

---

## ACCESSIBILITY (WCAG 2.1 AA Minimum)

### Color Contrast

| Context | Minimum Ratio | WISE² Usage |
|---------|---------------|------------|
| Text on background | 4.5:1 | All body text vs. surface |
| Large text (18px+) | 3:1 | Headings, metrics |
| Graphical elements | 3:1 | Icons, borders |
| Focus indicators | 3:1 | Keyboard focus ring |

**Verify**: Use contrast checker on Electric Blue (#00d4ff) and Neon Green (#39ff14) over dark backgrounds.

### Keyboard Navigation

- **Tab order**: Natural reading order (left-to-right, top-to-bottom)
- **Focus visible**: Always show 2px Electric Blue ring
- **Skip to content**: Add skip link before main nav
- **No keyboard traps**: Every focused element escapable via Tab/Shift+Tab
- **Form labels**: Always associated via `<label htmlFor>` or `aria-label`

### Screen Readers

- **ARIA labels**: Describe icon-only buttons
- **Semantic HTML**: Use `<button>`, `<nav>`, `<main>`, `<header>`, `<footer>`
- **Live regions**: Use `aria-live="polite"` for status updates
- **Landmarks**: Every page has `<main>` and appropriate `<nav>`

### Motion & Seizure

- **Respect `prefers-reduced-motion`**: Disable animations when detected
- **No flashing**: Avoid anything faster than 3 Hz (3 flashes/sec)
- **Pulses okay**: Status indicators pulse at 0.5–1 Hz (safe)

---

## RESPONSIVE DESIGN

### Breakpoints

```css
--bp-xs: 320px   /* Mobile default */
--bp-sm: 375px   /* Modern mobile */
--bp-md: 768px   /* Tablet */
--bp-lg: 1024px  /* Desktop */
--bp-xl: 1440px  /* Wide desktop */
--bp-2xl: 1920px /* Ultra-wide */
```

### Mobile-First Strategy

1. **Design for 375px first** (modern phone)
2. **Add breakpoints for tablet/desktop** (`@media (min-width: 768px)`)
3. **Test on real devices** (not just DevTools)
4. **Touch targets**: 44×44px minimum
5. **Safe areas**: Account for notches, home bar on iOS

### Viewport Meta Tag

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
```

---

## ANTI-PATTERNS (Never Do This)

❌ **Playful or whimsical design** — WISE² is enterprise, serious, powerful

❌ **Hidden controls** — Everything actionable must be visible

❌ **Gray-on-gray text** — Always use Electric Blue or Neon Green for emphasis

❌ **Emoji as icons** — Use SVG icons only (Heroicons, Lucide)

❌ **Disabled-looking buttons** — If it's not enabled, hide it

❌ **Animations that distract** — Motion must communicate, not decorate

❌ **Fixed pixel widths** — Use relative units (%, em, rem, vw)

❌ **Horizontal scrolling** — Ever

❌ **AI decisions hidden** — Every AI action must be visible with status + reasoning

❌ **Mixing light & dark** — WISE² is dark-mode-only as primary

---

## DESIGN TOKENS (CSS Variables)

```css
:root {
  /* Colors */
  --color-bg-darkest: #050505;
  --color-surface-1: #1a1a1a;
  --color-surface-2: #2d2d2d;
  --color-border: #3d3d3d;
  --color-text-primary: #e8e8e8;
  --color-text-secondary: #999999;
  --color-blue-electric: #00d4ff;
  --color-green-neon: #39ff14;
  --color-purple-ai: #9d4edd;
  --color-red-alert: #ff006e;
  --color-orange-warning: #ffa500;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.24);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.32);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.40);

  /* Typography */
  --type-h1: 2.5rem;
  --type-h2: 2rem;
  --type-h3: 1.5rem;
  --type-body-lg: 1rem;
  --type-body: 0.875rem;
  --type-label: 0.75rem;

  /* Motion */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 200ms ease-out;
  --transition-slow: 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## IMPLEMENTATION CHECKLIST

Before shipping any UI feature:

- [ ] **Colors**: Only using WISE² palette (no random hex)
- [ ] **Typography**: Base text 14px+, Headlines use Chrome font
- [ ] **Spacing**: All spacing is multiple of 4px
- [ ] **Contrast**: All text 4.5:1 minimum (check with tool)
- [ ] **Motion**: All animations have purpose, respect `prefers-reduced-motion`
- [ ] **Icons**: SVG only, no emoji
- [ ] **Touch**: All targets 44×44px minimum
- [ ] **Responsive**: Tested on 375px, 768px, 1440px
- [ ] **Keyboard**: Tab order is logical, focus rings visible (Electric Blue)
- [ ] **Accessibility**: Aria-labels on icon buttons, semantic HTML used
- [ ] **Dark mode**: No light backgrounds (ever)
- [ ] **Loading states**: All async actions show feedback
- [ ] **Error states**: Errors display near the field with Electric Blue/Red
- [ ] **Workflow visibility**: Current workflow step always visible
- [ ] **AI transparency**: Every AI action shows agent + status + confidence

---

## NEXT STEPS

1. **Phase 4A**: Implement workspace routing and context system (database-backed)
2. **Phase 4B**: Build design system components (Cards, Buttons, Panels, Metrics)
3. **Phase 4C**: Create Command Center dashboard as Mission Control
4. **Phase 4D**: Implement Digital Workforce panel with real-time AI status
5. **Phase 4E**: Build Master Troubleshooter with auto-fix capability

---

**This design system is the source of truth for all WISE² visual work.**  
**When in doubt, reference this document and CLAUDE.md — they are binding.**
