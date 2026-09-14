# WISE² AR/VR Dashboard — Design System Master

**Project**: WISE² AR/VR Ecosystem Monitoring  
**Stack**: Next.js 14 + Tailwind CSS  
**Generated**: September 13, 2026  
**Status**: Production Ready

---

## Visual Identity

### Color Palette (Dark Mode)
```
Primary:       #D97706 (Amber-600)  — Call-to-action, alerts, primary states
Secondary:     #F59E0B (Amber-400)  — Hover states, secondary elements
Accent:        #6366F1 (Indigo-500) — Data visualization, accents
Background:    #0F172A (Slate-950) — Main background
Muted:         #1F1E27 (Slate-900) — Secondary background
Border:        rgba(255,255,255,0.08) — Subtle borders
Text Primary:  #FFFFFF — Main text
Text Muted:    #94A3B8 (Slate-400) — Secondary text
Destructive:   #DC2626 (Red-600) — Errors, critical alerts
Success:       #10B981 (Emerald-500) — Healthy status
Warning:       #F59E0B (Amber-500) — Warning status
```

### Typography System
```
Font Family (Headings):  Fira Code (monospace)
Font Family (Body):      Fira Sans (sans-serif)

Base Size: 16px

Scale:
  h1: 2.25rem (36px) - 400 bold
  h2: 1.875rem (30px) - 600 bold
  h3: 1.5rem (24px) - 600 bold
  body: 1rem (16px) - 400 regular
  small: 0.875rem (14px) - 400 regular
  xs: 0.75rem (12px) - 400 regular
  code: 0.875rem - Fira Code monospace

Line Height:
  headings: 1.2
  body: 1.5
  code: 1.4
```

### Spacing Scale (8px base)
```
--space-1: 0.5rem (8px)
--space-2: 1rem (16px)
--space-3: 1.5rem (24px)
--space-4: 2rem (32px)
--space-6: 3rem (48px)
--space-8: 4rem (64px)

Used for: padding, margins, gaps, radii
```

### Breakpoints
```
sm: 640px   (tablets)
md: 768px   (small desktops)
lg: 1024px  (desktops)
xl: 1280px  (wide desktops)
2xl: 1536px (extra wide)

Mobile-first: design for mobile, enhance at breakpoints
```

### Corners & Shadows
```
Border Radius:
  sm: 4px
  md: 8px
  lg: 12px
  full: 50%

Shadow:
  sm: 0 1px 2px rgba(0,0,0,0.05)
  md: 0 4px 6px rgba(0,0,0,0.1)
  lg: 0 10px 15px rgba(0,0,0,0.1)
  backdrop-blur: blur(8px)
```

---

## Component Patterns

### Metric Cards
- **Purpose**: Display real-time KPIs (latency, budget, error rate, device count)
- **Size**: Responsive grid (1 col mobile, 2 col tablet, 5 col desktop)
- **Status Indicators**:
  - Healthy (green): 100% bar, emerald text
  - Warning (amber): 66% bar, amber text
  - Critical (red): 33% bar, red text
- **Content**: Title, value, unit, icon, optional trend
- **Interaction**: Hover to brighten border
- **Animation**: Stagger fade-in on load (0.4s, 0.06s each)

### Status Badges
- **Purpose**: Show service/device status
- **States**: Online (green pulse), Offline (gray), Degraded (amber)
- **Size**: 2px dot + label
- **Animation**: Pulse on healthy, static on warning/critical

### Section Cards
- **Purpose**: Group related information (infrastructure, devices, links)
- **Layout**: Rounded border, semi-transparent background, backdrop blur
- **Border**: 1px rgba(255,255,255,0.08)
- **Padding**: 2rem (32px)
- **Gap**: 1rem (16px) between items

### Device Item
- **Layout**: Horizontal flex with icon on left, data on right
- **Data**: Name, port/battery, latency/FPS
- **Background**: Slate-800/40
- **Border**: 1px slate-700/50
- **Padding**: 1rem (16px)
- **Typography**: Body label + xs details

### Link Cards
- **Purpose**: Navigation to docs and external services
- **Layout**: 3 columns on desktop, 1 on mobile
- **Content**: Label + emoji icon
- **Hover**: Border brightens to indigo
- **Interaction**: Full card is clickable

---

## Motion & Animation

### Entrance Animation
```
Type: Stagger grid
Trigger: Page load
Items: Metric cards
Duration: 400ms per item
Easing: ease-out (back.out(1.4) with GSAP)
Stagger: 0.06s between items

CSS Keyframe:
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(16px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

### Real-Time Updates
```
Metric value change: Transition 500ms (smooth number update)
Status indicator: Instant color change (150ms transition)
Progress bar: Smooth fill (300-500ms)
Pulse animation: emerald pulse on healthy status
```

### Transitions
```
Hover states: 150-300ms ease-out
Border changes: 300ms ease
Color changes: 150-200ms ease
Opacity: 150-300ms ease-out
```

### Reduced Motion
```
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Accessibility

### Contrast Ratios
- Text on background: 4.5:1 minimum (WCAG AA)
- Status colors: All pass on dark background
- Links: Underlined or high contrast (indigo on dark)

### Keyboard Navigation
- All interactive elements are focusable
- Focus state: Outline ring with --color-ring (#D97706)
- Tab order: Logical flow (left-to-right, top-to-bottom)

### Screen Readers
- Semantic HTML: `<main>`, `<nav>`, `<footer>`, `<section>`
- Icon descriptions: Via adjacent text or aria-label
- Data tables: Use proper `<table>` structure
- Links: Descriptive text (not "click here")

### Color Independence
- Status not conveyed by color alone
- Icons paired with text
- Numeric values alongside visual indicators

---

## Implementation Checklist

### Before Deploy
- [ ] No emojis as icons (use Lucide/Heroicons SVG)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states visible and smooth (150-300ms)
- [ ] Focus states visible for keyboard nav
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive at: 375px, 768px, 1024px, 1440px
- [ ] Light mode text contrast 4.5:1 (if applicable)
- [ ] Dark mode text contrast passes
- [ ] Links underlined or high-contrast
- [ ] Form labels persistent (not placeholder-only)
- [ ] Error messages clear and actionable
- [ ] Alt text for images
- [ ] Page title descriptive

### Performance
- [ ] Lazy load external images
- [ ] WebP/AVIF with fallbacks
- [ ] SVG icons (not PNG/JPG)
- [ ] Fonts loaded with `display=swap`
- [ ] No Cumulative Layout Shift (CLS < 0.1)
- [ ] Metrics API calls optimized (5-10s intervals)
- [ ] No excessive re-renders (React.memo on metric cards)

### Testing
- [ ] Tested on mobile (375px), tablet (768px), desktop (1440px)
- [ ] Tested with keyboard navigation only
- [ ] Tested with screen reader (macOS VoiceOver / Windows NVDA)
- [ ] Tested with prefers-reduced-motion enabled
- [ ] Tested with dark mode toggle
- [ ] Tested with real metrics from Router API
- [ ] Tested with devices offline/degraded

---

## Component Locations

```
apps/dashboard/
├── app/
│   ├── arvr/
│   │   └── page.tsx              ← Main dashboard page
│   └── layout-arvr.tsx           ← Dashboard layout
├── components/
│   └── ARVRDashboard/
│       ├── MetricCard.tsx        ← Reusable metric card
│       ├── StatusBadge.tsx       ← Status indicator
│       ├── ServiceStatus.tsx     ← Infrastructure section
│       └── DeviceList.tsx        ← Connected devices
└── design-system/
    └── arvr-dashboard.md         ← This file
```

---

## Integration with WISE²

### Navigation
- Add `/arvr` route to main WISE² navigation
- Link from dashboard home
- Add to admin sidebar

### Data Sources
- Router API: `http://localhost:3100/metrics`
- Prometheus: `http://localhost:9090/api/v1/query`
- Grafana: `http://localhost:3000`

### Authentication
- Dashboard inherits WISE² auth
- No additional auth required for router/metrics APIs (internal)

---

## Design Decisions

### Why Fira Code + Fira Sans?
- **Fira Code**: Monospace for precise data (latency, budget, metrics)
- **Fira Sans**: Humanist sans-serif for readability
- **Combination**: Technical but accessible

### Why Dense Layout (8/10)?
- Operational dashboard requires lots of data visible
- Users scan for critical metrics quickly
- Density supports multiple KPIs per screen

### Why Amber + Indigo?
- **Amber (#D97706)**: Energy, alertness, time (real-time)
- **Indigo (#6366F1)**: Calm, technical, VR/AR tech aesthetic
- **Green/Red**: Status indicators (healthy/critical)
- **Contrast**: Both work on dark backgrounds

### Why Dark Mode Only?
- Operations dashboards typically used in 24/7 environments
- Dark mode reduces eye strain during long monitoring sessions
- Aligns with typical DevOps/monitoring aesthetic (Grafana, Prometheus)

---

## Version History

| Date | Change |
|------|--------|
| 2026-09-13 | Initial design system created |
| — | — |

---

## Related Files

- `PRODUCTION_INTEGRATION_GUIDE.md` — Full AR/VR ecosystem deployment
- `monitoring/SETUP.md` — Monitoring stack configuration
- `monitoring/RUNBOOK.md` — Emergency procedures
- `/apps/dashboard/app/arvr/page.tsx` — Implementation
