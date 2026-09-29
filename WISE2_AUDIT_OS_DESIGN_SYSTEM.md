# WISE² AI Consultant Audit OS — Enterprise Design System v1.0

**Version:** 1.0  
**Status:** Master Design Foundation  
**Updated:** 2026-07-28  
**Audience:** Product team, engineers, designers

---

## Executive Summary

WISE² Audit OS is a **production-grade enterprise SaaS platform** for AI-assisted business consulting. This design system establishes the visual, interaction, and UX standards that define WISE² as a premium, professional tool competing with Salesforce, HubSpot, Linear, and Notion.

### Design Objectives

✅ **Professional** — Enterprise-grade, polished, client-ready  
✅ **Intelligent** — AI assistance without overwhelm  
✅ **Minimal** — Reduce clutter, maximize functionality  
✅ **Evidence-Based** — Every recommendation supported by data  
✅ **Accessible** — WCAG 2.2 AA compliance across all interfaces  
✅ **Performant** — <2s initial load, <150ms interactions  

---

## Brand Identity

### Color Palette

#### Primary Colors (Neutral Foundation)
```css
--wise-black: #050505;         /* Pure Black - Page backgrounds */
--wise-dark-steel: #0B0B0B;    /* Dark Steel - Card backgrounds */
--wise-steel-panel: #1A1A1A;   /* Steel Panel - Nested panels */
--wise-graphite: #2D2D2D;      /* Graphite - Secondary backgrounds */
--wise-chrome: #BFC4C9;        /* Chrome - Premium accents */
--wise-white: #FFFFFF;         /* White - Primary text */
```

#### Accent Colors (Action & Status)
```css
--wise-neon-green: #39FF14;    /* Neon Green - Primary actions, highlights */
--wise-electric-blue: #0094FF; /* Electric Blue - Secondary actions, links */
--wise-success: #22C55E;       /* Success Green - Positive status */
--wise-warning: #F2B632;       /* Amber - Caution/attention needed */
--wise-error: #E53935;         /* Red - Errors, critical issues */
--wise-info: #0094FF;          /* Blue - Informational messages */
```

#### Semantic Text Hierarchy
```css
--text-primary: #FFFFFF;       /* Main headings, primary content */
--text-secondary: #BFC4C9;     /* Chrome - accents, emphasis */
--text-muted: #8D98A5;         /* Muted Gray - secondary info, labels */
--text-disabled: #4A4A4A;      /* Disabled, low-emphasis text */
```

### Typography System

#### Font Stack (Enterprise Professional)
```css
--font-headers: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'IBM Plex Mono', 'Courier New', monospace; /* Data, code, technical */
```

#### Type Scale (16px base)
```css
--text-h1: 3.5rem;    /* 56px - Page titles, hero headings */
--text-h2: 2.5rem;    /* 40px - Section headings */
--text-h3: 1.75rem;   /* 28px - Subsection headings */
--text-h4: 1.375rem;  /* 22px - Card titles, emphasis */
--text-body-lg: 1.125rem; /* 18px - Large body text */
--text-body: 1rem;    /* 16px - Standard body text */
--text-body-sm: 0.875rem; /* 14px - Secondary text, meta */
--text-caption: 0.75rem; /* 12px - Labels, captions only */
```

#### Font Weights
```css
--weight-thin: 300;
--weight-normal: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
--weight-black: 900;
```

### Spacing System (8px base unit)

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### Effects & Interactions

#### Shadows (Depth Hierarchy)
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.15);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
--shadow-glow-neon: 0 0 20px rgba(57, 255, 20, 0.3);    /* Neon Green glow */
--shadow-glow-blue: 0 0 20px rgba(0, 148, 255, 0.3);   /* Electric Blue glow */
```

#### Transitions
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

#### Borders & Radii
```css
--radius-sm: 0.375rem;    /* 6px */
--radius-md: 0.5rem;      /* 8px */
--radius-lg: 0.75rem;     /* 12px */
--radius-xl: 1rem;        /* 16px */
```

---

## UI Component Patterns

### Buttons

#### Primary Button (Neon Green - Primary Actions)
```css
background-color: #39FF14;
color: #050505;
border: 2px solid #39FF14;
border-radius: 8px;
padding: 12px 32px;
font-weight: 600;
box-shadow: 0 0 20px rgba(57, 255, 20, 0.2);
transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);

/* Hover */
box-shadow: 0 0 30px rgba(57, 255, 20, 0.4);
transform: translateY(-2px);

/* Disabled */
opacity: 0.5;
cursor: not-allowed;
```

#### Secondary Button (Electric Blue - Navigation & Links)
```css
background-color: transparent;
color: #0094FF;
border: 1px solid rgba(0, 148, 255, 0.4);
border-radius: 8px;
padding: 12px 24px;
font-weight: 500;
transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);

/* Hover */
background-color: rgba(0, 148, 255, 0.1);
border-color: rgba(0, 148, 255, 0.6);
```

### Cards & Panels

#### Enterprise Card (Base)
```css
background: linear-gradient(135deg, #0B0B0B, #1A1A1A);
border: 1px solid rgba(57, 255, 20, 0.2);
border-radius: 12px;
padding: 24px;
box-shadow: var(--shadow-md);
transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);

/* Hover */
border-color: rgba(57, 255, 20, 0.4);
box-shadow: 0 0 20px rgba(57, 255, 20, 0.1);
```

### Badges & Status Indicators

#### Status Badge (Active)
```css
background-color: rgba(34, 197, 94, 0.15);
border: 1px solid rgba(34, 197, 94, 0.3);
color: #22C55E;
border-radius: 6px;
padding: 4px 12px;
font-size: 12px;
font-weight: 600;
```

#### Warning Badge
```css
background-color: rgba(242, 182, 50, 0.15);
border: 1px solid rgba(242, 182, 50, 0.3);
color: #F2B632;
```

#### Error Badge
```css
background-color: rgba(229, 57, 53, 0.15);
border: 1px solid rgba(229, 57, 53, 0.3);
color: #E53935;
```

### Input Fields

#### Text Input (Standard)
```css
background: rgba(26, 26, 26, 0.5);
border: 1px solid rgba(189, 196, 201, 0.2);
border-radius: 8px;
padding: 12px 16px;
color: #FFFFFF;
font-size: 16px;
transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);

/* Focus */
border-color: rgba(57, 255, 20, 0.4);
box-shadow: 0 0 15px rgba(57, 255, 20, 0.1);
```

---

## Dashboard Layouts

### Executive Dashboard Grid
- **12-column responsive grid**
- **Breakpoints:** 375px (mobile), 768px (tablet), 1024px (desktop), 1440px (widescreen)
- **Gap:** 24px (desktop), 16px (tablet), 12px (mobile)
- **Card ratios:** 1/4 width (KPI), 1/3 width (chart), 1/2 width (table), full width (timeline)

### Key Widgets

#### KPI Card (Revenue, Clients, etc.)
- Large number (28px, bold)
- Label (14px, muted gray)
- Sparkline or trend indicator
- Comparison (±% change, color-coded)

#### Chart Widget
- Title (18px bold)
- Legend (12px, right-aligned or below)
- Tooltip on hover (50ms delay)
- Gradient background container

#### Data Table
- Header row: Muted Gray background, 14px text, sortable icons
- Rows: Standard padding (16px vertical, 12px horizontal)
- Row hover: Subtle background highlight (rgba(57, 255, 20, 0.05))
- Striped rows: rgba(255, 255, 255, 0.02) alternating

---

## Animation System

### Motion Principles
- **Duration:** 150–300ms for standard interactions
- **Easing:** cubic-bezier(0.4, 0, 0.2, 1) for most UI
- **Spring:** For delightful reveals only (charts, modals)
- **Micro-interactions:** Feedback without distraction

### GSAP Presets

#### Stagger List (Dashboard Cards)
```javascript
gsap.from('.card', {
  opacity: 0,
  scale: 0.95,
  y: 12,
  duration: 0.4,
  stagger: { each: 0.05, from: 'start' },
  ease: 'back.out(1.4)',
});
```

#### Fade In (Content Reveal)
```javascript
gsap.from('.content', {
  opacity: 0,
  y: 8,
  duration: 0.3,
  ease: 'power2.out',
});
```

#### Scale Button (CTA)
```javascript
gsap.to('.btn:hover', {
  scale: 1.02,
  duration: 0.15,
  ease: 'power2.out',
});
```

---

## Accessibility Standards

### WCAG 2.2 AA Compliance

✅ **Color Contrast**
- Text on background: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

✅ **Keyboard Navigation**
- Tab order logical and visible
- Focus indicators: 2px Neon Green outline with 2px offset
- All interactive elements keyboard accessible

✅ **Screen Reader Support**
- Semantic HTML (nav, main, section, article)
- ARIA labels on custom components
- Form inputs with proper labels
- Alt text on all meaningful images

✅ **Motion & Animation**
- Respect prefers-reduced-motion: reduce
- No autoplaying animations/videos
- Focus movement follows logical flow

### Dark Mode (Default)
- Text contrast on dark backgrounds optimized
- No pure white on pure black (use gray hierarchy)
- Card backgrounds use subtle gradients for depth

---

## Performance Targets

### Load Performance
- Initial page load: <2 seconds
- Dashboard interaction: <150ms
- Chart re-render: <300ms
- Animation frame rate: 60fps (60fps animations only on modern devices)

### Optimization Strategies
- Lazy load below-fold content
- Image format: WebP primary, JPEG fallback
- SVG icons (12–48px: inline, >48px: native SVG)
- CSS variables for runtime theming
- Virtualization for long lists (1000+ rows)

---

## Anti-Patterns (Never Do This)

❌ **Visual Clutter**
- Oversaturated colors or excessive gradients
- Icon + text label required on every button
- Multiple competing CTAs per section
- Justify text alignment (reduce readability)

❌ **Interaction Issues**
- Hover-only information (mobile-unfriendly)
- Instant state changes without transition feedback
- Auto-playing video or animations
- No visible focus indicator

❌ **Accessibility Failures**
- Gray text on gray backgrounds
- Icon-only buttons without labels
- Form fields without labels
- Images without alt text

❌ **Performance Problems**
- Unoptimized large images (>500KB)
- Blocking render on third-party scripts
- Unbounded scrolling lists
- Uneventful animations eating CPU

---

## Implementation Checklist

### Before Launch

- [ ] Dark mode renders correctly (high contrast)
- [ ] All interactive elements have hover states (150–300ms transition)
- [ ] Focus indicators visible on keyboard nav
- [ ] Color contrast passes axe/WAVE audit (4.5:1 minimum)
- [ ] No emojis used as functional icons (SVG only)
- [ ] Responsive tested at 375px, 768px, 1024px, 1440px
- [ ] prefers-reduced-motion respected on all animations
- [ ] Page load <2 seconds (Chrome DevTools Lighthouse)
- [ ] Dashboard interactions <150ms (React DevTools Profiler)
- [ ] Lighthouse accessibility score ≥95
- [ ] All images use next/image with proper sizes attribute
- [ ] SVG icons are optimized (<2KB after gzip)
- [ ] Cypress E2E tests pass (critical paths)
- [ ] Mobile form inputs use proper input types (email, tel, number, etc.)
- [ ] All buttons have visible text labels or aria-labels

---

## Design System File Structure

```
design-system/
├── MASTER.md (this file)
├── colors.css
├── typography.css
├── spacing.css
├── components/
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── badge.tsx
│   └── ... (more components)
├── layouts/
│   ├── dashboard.tsx
│   ├── sidebar.tsx
│   └── modal.tsx
├── utilities/
│   ├── animations.ts (GSAP presets)
│   ├── accessibility.ts
│   └── responsive.css
└── docs/
    ├── color-palette.md
    ├── typography-guidelines.md
    ├── accessibility-checklist.md
    └── component-library.md
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-07-28 | Master Design System established for WISE² Audit OS |

---

**This design system is the source of truth for all WISE² Audit OS interfaces. All new features, pages, and components must align with these standards.**

*For questions or updates, contact the Design Systems team.*
