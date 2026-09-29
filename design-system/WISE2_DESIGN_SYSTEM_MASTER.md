# WISE² Design System — MASTER

**Version:** 1.0  
**Last Updated:** 2026-07-24  
**Brand:** WISE² AI Consulting OS  
**Tagline:** CONSULT • AUTOMATE • SCALE  
**Philosophy:** ORGANIZED CHAOS  

---

## COLOR SYSTEM

### Core Palette

| Role | Color | Hex | CSS Variable | Usage |
|------|-------|-----|--------------|-------|
| **Background (Primary)** | Deep Black | `#050505` | `--wise-black` | Page backgrounds, dominant surface |
| **Surface Secondary** | Near Black | `#0A0A0A` | `--wise-surface-0` | Subtle elevation |
| **Surface Tertiary** | Dark Gray 1 | `#101114` | `--wise-surface-1` | Cards, panels |
| **Surface Raised** | Dark Gray 2 | `#151619` | `--wise-surface-2` | Hover states, active surfaces |
| **Border / Divider** | Charcoal | `#1A1A1A` | `--wise-border` | Outlines, separators |
| **Chrome / Premium** | Silver | `#9CA3AF` | `--wise-chrome` | Metallic accents, module headings |
| **Text Primary** | Off-White | `#F5F5F5` | `--wise-text` | Headlines, body text |
| **Text Secondary** | Muted Gray | `#A0A0A0` | `--wise-text-muted` | Captions, metadata |
| **Text Tertiary** | Dim Gray | `#727272` | `--wise-text-dim` | Disabled state |
| **WISE² Accent** | Acid Green | `#2CD588` | `--wise-green` | CTAs, active states, data highlights |
| **Green (Soft)** | Soft Green | `#1A4D3A` | `--wise-green-soft` | Backgrounds, subtle accents (USE SPARINGLY) |
| **Status: Success** | Bright Green | `#10B981` | `--wise-success` | Success badges, approved |
| **Status: Warning** | Amber | `#F59E0B` | `--wise-warning` | Warnings, attention |
| **Status: Danger** | Red | `#EF4444` | `--wise-danger` | Errors, destructive actions |
| **Status: Info** | Blue | `#3B82F6` | `--wise-info` | Info messages, loading |

### Contrast & Accessibility

- **Minimum WCAG AA:** All text uses 4.5:1 contrast ratio minimum
- **Dark Mode Primary:** Black backgrounds (#050505) with Off-White text (#F5F5F5) = 20:1 contrast ✓
- **Chrome on Black:** Metallic silver (#9CA3AF) on black = 9:1 contrast ✓
- **Green on Black:** Acid green (#2CD588) on black = 10:1 contrast ✓
- **Note:** Do NOT use pure #000000 (OLED smear); #050505 is the darkest acceptable

### Color Distribution Target

- **70-80%**: Black/dark surfaces (#050505, #0A0A0A, #101114)
- **10-20%**: Neutral chrome/text (#9CA3AF, #F5F5F5, #A0A0A0)
- **5-10%**: Accent green (#2CD588) + status colors

---

## TYPOGRAPHY

### Font Stack

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --font-display: 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
}
```

### Scale & Roles

| Role | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| **Display XL** | 48px / 3rem | 700 | 1.2 | -0.02em | WISE² branding, hero |
| **Display L** | 36px / 2.25rem | 700 | 1.3 | -0.01em | Module headings, major sections |
| **H1** | 32px / 2rem | 600 | 1.4 | 0 | Page titles, audit headings |
| **H2** | 24px / 1.5rem | 600 | 1.4 | 0 | Section headings, dashboard cards |
| **H3** | 20px / 1.25rem | 600 | 1.5 | 0 | Subsection headings |
| **H4** | 16px / 1rem | 600 | 1.5 | 0 | Card titles, labels |
| **Body** | 16px / 1rem | 400 | 1.6 | 0 | Long-form text, descriptions |
| **Body Small** | 14px / 0.875rem | 400 | 1.6 | 0 | Metadata, secondary info |
| **Label** | 12px / 0.75rem | 500 | 1.5 | 0.05em | Form labels, badges |
| **Caption** | 12px / 0.75rem | 400 | 1.5 | 0.02em | Timestamps, footnotes |
| **Metric** | 24px / 1.5rem | 700 | 1 | 0 | Dashboard numbers, KPIs |

**Prevent overflow:** Use `overflow-wrap: break-word` + appropriate `max-width` per container.

---

## SPACING SYSTEM

### Scale (CSS Variables)

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
}
```

### Application Rules

- **Mobile content breathing:** 16–24px horizontal padding
- **Cards:** 16px–24px internal padding
- **Form fields:** 8px spacing between elements
- **Lists:** 8px–12px vertical spacing
- **Sections:** 24px–48px vertical spacing
- **Module gaps:** 32px–64px between major sections

---

## COMPONENT SYSTEM

### Cards

**SurfaceCard** (standard container)
```
Padding: 16px / 24px
Background: #0A0A0A or #101114
Border: 1px #1A1A1A
Radius: 8px
Shadow: subtle (0 1px 3px rgba(0,0,0,0.3))
```

**MetricCard** (KPI display)
```
Metric: 24px / 700 / Chrome (#9CA3AF)
Label: 12px / 400 / Text Muted (#A0A0A0)
Background: #050505 or #0A0A0A
Radius: 8px
Padding: 16px
Border: 1px #1A1A1A (optional highlight border in green)
```

**ActionCard** (interactive)
```
Background: #0A0A0A
Border: 1px #1A1A1A
Radius: 8px
Hover: #101114 + 1px #2CD588 border
Transition: 150ms ease-out
```

**StatusCard** (project/client display)
```
Title: 16px / 600
Metadata: 12px / 400 / Text Muted
Background: #050505
Border: 1px #1A1A1A
Status Badge: Top-right, color-coded (green/amber/red)
```

### Buttons

**Primary** (main action)
```
Background: #2CD588 (Acid Green)
Text: #050505 (Black)
Padding: 12px 24px (minimum 44px touch height)
Radius: 6px
Hover: brighten to #40E599
Active: #1FA070
Transition: 150ms ease-out
```

**Secondary** (alternate action)
```
Background: #101114
Text: #F5F5F5
Border: 1px #1A1A1A
Padding: 12px 24px
Radius: 6px
Hover: #151619 + 1px #9CA3AF
Transition: 150ms ease-out
```

**Danger** (destructive)
```
Background: #EF4444
Text: #FFFFFF
Padding: 12px 24px
Radius: 6px
Hover: #DC2626
Active: #991B1B
Transition: 150ms ease-out
```

**Ghost** (subtle)
```
Background: transparent
Text: #F5F5F5
Border: 1px transparent
Padding: 8px 16px
Radius: 6px
Hover: #101114
Transition: 150ms ease-out
```

**Loading State** (all buttons)
```
Opacity: 0.7
Cursor: not-allowed
Disabled: true
Spinner: green accent color, 12px size
```

### Forms

**Input Field**
```
Background: #101114
Text: #F5F5F5
Placeholder: #727272
Border: 1px #1A1A1A
Radius: 6px
Padding: 12px 16px
Focus: 1px #2CD588 border + ring (4px, color: green, offset: 2px)
Transition: 150ms ease-out
Min Height: 44px (touch target)
```

**Label**
```
Font: 12px / 500 / #F5F5F5
Margin Bottom: 8px
Required Indicator: *#EF4444
```

**Error Message**
```
Color: #EF4444
Font: 12px / 400
Margin Top: 4px
Position: Inline, near field (NOT just at form top)
```

---

## BREAKPOINT STRATEGY

```css
:root {
  --bp-xs: 320px;   /* Small phone */
  --bp-sm: 375px;   /* iPhone standard */
  --bp-md: 768px;   /* Tablet */
  --bp-lg: 1024px;  /* Large tablet / small desktop */
  --bp-xl: 1280px;  /* Desktop */
  --bp-2xl: 1440px; /* Large desktop */
}
```

### Responsive Patterns

| Viewport | Layout | Navigation | Cards |
|----------|--------|-----------|-------|
| **320–374px** | Single column, 16px padding | Bottom nav (compact) | Full width, stacked |
| **375–767px** | Single column, 20px padding | Bottom nav (5 items) | Full width, single column |
| **768–1023px** | Two column (70/30 or 60/40), collapsible nav | Collapsible sidebar | 2-column grid |
| **1024–1439px** | Three column, persistent nav | Persistent sidebar | 2–3 column grid |
| **1440px+** | Three column, persistent nav | Persistent sidebar | 3–4 column grid |

### No Horizontal Scroll

**Rule:** `document.documentElement.scrollWidth` ≤ `document.documentElement.clientWidth`

---

## ICON SYSTEM

**Source:** Heroicons or Lucide (SVG, 24px default)  
**NO emoji as icons** (emoji acceptable in marketing only, never in UI controls)  
**Color:** Inherit text color or explicit `--wise-green` for actions  
**Stroke:** 1.5–2px for outlined style  

---

## ANIMATION & MOTION

### Timing

| Use Case | Duration | Easing |
|----------|----------|--------|
| **Micro (button, hover)** | 150ms | `ease-out` |
| **Standard (modal, fade)** | 200–250ms | `cubic-bezier(0.16,1,0.3,1)` |
| **Stagger (grid load)** | 300–450ms per item | `back.out(1.4)` (via GSAP) |
| **Complex (scroll reveal)** | 400–600ms | Spring physics (damping: 20, stiffness: 90) |

### Principles

- ✅ Motion conveys meaning (scale = importance, translate = relationship)
- ✅ Exit animations faster than enter (150ms vs 250ms)
- ✅ Haptic feedback on iOS (Impact Light for taps)
- ✅ Respect `prefers-reduced-motion` (reduce to 0ms or remove)
- ❌ Decorative-only animation (pure eye candy without purpose)
- ❌ Animating width/height (use scale or clip-path instead)
- ❌ Continuous flickering or flashing

### GSAP Preset: Stagger Grid Load (Standard)

```javascript
gsap.from('.grid-item', {
  opacity: 0,
  scale: 0.92,
  y: 16,
  duration: 0.4,
  stagger: { each: 0.06, from: 'start', grid: 'auto' },
  ease: 'back.out(1.4)'
});
```

---

## INFORMATION ARCHITECTURE

### Top-Level Navigation

**Desktop:** Persistent sidebar or top nav  
**Tablet:** Collapsible sidebar + top breadcrumb  
**Mobile:** Bottom tab nav (≤5 items) + drawer for secondary

### Major Domains

1. **COMMAND** — Business overview, KPIs, alerts
2. **CONSULTING** — Leads, audits, opportunities, proposals, clients, projects
3. **AUTOMATE** — Workflows, agents, integrations, jobs
4. **STUDIO** — Creative modules (Sound Lab, Voice Lab, Jingle Lab, Live Studio, Content Factory, Client Showcase)
5. **INTELLIGENCE** — AI analysis, knowledge, insights, reports
6. **APPS** — Integrations, API management
7. **BUSINESS** — Services, webstore, billing, analytics
8. **SYSTEM** — Infrastructure, health, logs, settings

---

## ACCESSIBILITY

### WCAG AA Checklist

- [ ] Color contrast 4.5:1 minimum (text on background)
- [ ] All images have alt text or `aria-hidden` if decorative
- [ ] Form labels explicitly associated (`<label for>` or `aria-label`)
- [ ] Focus indicators visible (never `outline: none` without alternative)
- [ ] Keyboard navigation works (Tab, Enter, Esc, Arrow keys as appropriate)
- [ ] ARIA landmarks used (`<nav>`, `<main>`, `<form>`, `role="region"`)
- [ ] Loading states announced (`aria-live="polite"`)
- [ ] Modal traps focus (tab loop within modal)
- [ ] Video has captions if speech is important

### Dark Mode Note

- Background #050505 + Text #F5F5F5 = **20:1 ratio** ✓
- Green #2CD588 + Black #050505 = **10:1 ratio** ✓
- Chrome #9CA3AF + Black #050505 = **9:1 ratio** ✓
- Muted text #A0A0A0 + Black #050505 = **6:1 ratio** ✓ (WCAG AA for larger text)

---

## PERFORMANCE

- **Images:** WebP/AVIF primary, JPG fallback; lazy load off-screen
- **Fonts:** Variable font (Inter supports wght 300–700); limit to 2–3 weights
- **Animation:** GPU-accelerated (transform, opacity); avoid layout thrashing
- **Code Splitting:** Route-based splitting; preload critical routes
- **CLS (Cumulative Layout Shift):** Reserve space for lazy images + async content
- **Main Thread Budget:** Keep frames at 60fps (16.67ms per frame)

---

## ANTI-PATTERNS (Never Do This)

- ❌ Mixing multiple design styles (flat + skeuomorphic + brutalism)
- ❌ Using emoji as primary UI icons
- ❌ Text smaller than 12px for body content
- ❌ Gray-on-gray text (poor contrast)
- ❌ Raw hex colors in components (use tokens)
- ❌ Fixed px widths on mobile layouts
- ❌ Disabling pinch-zoom (`user-scalable=no`)
- ❌ Horizontal page scroll
- ❌ Removing focus indicators
- ❌ Icon-only buttons without labels or aria-labels
- ❌ Fake data in production (show empty states instead)
- ❌ Animations that ignore `prefers-reduced-motion`

---

## PRE-DELIVERY CHECKLIST

### Visual QA

- [ ] Responsive at 375px, 768px, 1024px, 1440px
- [ ] No horizontal overflow
- [ ] No text clipping or overlap
- [ ] Cards breathe appropriately (16–24px padding)
- [ ] Buttons minimum 44px height
- [ ] Focus rings visible on all interactive elements
- [ ] Hover states smooth (150–300ms transition)
- [ ] Empty states are useful (not just blank)
- [ ] Loading states clear and not jarring

### Accessibility

- [ ] Color contrast 4.5:1 minimum
- [ ] All images have alt text
- [ ] Forms have labels
- [ ] Keyboard navigation works (Tab through all controls)
- [ ] Focus order is logical
- [ ] ARIA labels used where needed
- [ ] `prefers-reduced-motion` respected

### Functionality

- [ ] Auth state persists on reload
- [ ] Forms submit without error
- [ ] Data loads and displays correctly
- [ ] No console errors
- [ ] No broken links
- [ ] Mobile nav opens/closes
- [ ] Chat widget doesn't block content

### Performance

- [ ] Lighthouse score >85 (Performance)
- [ ] First Contentful Paint <2s
- [ ] Largest Contentful Paint <3s
- [ ] Cumulative Layout Shift <0.1

---

## VERSION HISTORY

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-07-24 | Initial WISE² brand-aligned design system |

