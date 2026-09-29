# WISE² Creative Studio — UI/UX Cleanup & SEO Optimization

**Status**: Design System Generated | Next.js Stack  
**Design Level**: Variance 7 (Modern), Motion 6 (Standard), Density 8 (Dashboard)  
**Last Updated**: 2026-07-24

---

## 🎨 Design System (Generated)

### Pattern: Real-Time Operations Landing
- **Conversion Focus**: Demo/sandbox link, trust signals
- **CTA Placement**: Primary in nav + after metrics
- **Color Strategy**: Dark (status colors: green/amber/red, data-dense but scannable)
- **Structure**: Hero → Metrics → How it works → CTA

### Style: Modern Dark (Cinema Mobile)
- **Mode**: Dark mode primary, light as exception
- **Keywords**: Dark mode, cinematic, glassmorphism, deep black, glow, layered, premium
- **Best For**: Dev tools, pro productivity apps, fintech dashboards, media/streaming, AI tools
- **Performance**: ⚠️ Good (blur effects need native driver)
- **Accessibility**: ⚠️ WCAG AA (needs careful accent contrast)

### Color Palette (CSS Variables)

```css
:root {
  --color-primary: #0F172A;        /* Deep blue-black */
  --color-on-primary: #FFFFFF;      /* White text on primary */
  --color-secondary: #1E293B;       /* Slightly lighter blue-black */
  --color-accent: #22C55E;          /* Green (CTA + positive status) */
  --color-background: #020617;      /* Almost pure black */
  --color-foreground: #F8FAFC;      /* Almost white */
  --color-muted: #1A1E2F;           /* Muted interactive elements */
  --color-border: #334155;          /* Border/divider */
  --color-destructive: #EF4444;     /* Red (errors/warnings) */
  --color-ring: #0F172A;            /* Focus ring */
}

/* Dark mode overrides (if supporting light mode) */
@media (prefers-color-scheme: light) {
  :root {
    --color-primary: #F8FAFC;
    --color-on-primary: #0F172A;
    --color-background: #FFFFFF;
    --color-foreground: #0F172A;
    /* etc... */
  }
}
```

### Typography

- **Font**: Plus Jakarta Sans
- **Weights**: 300, 400, 500, 600, 700
- **Mood**: Friendly, modern, SaaS, clean, approachable, professional
- **Google Fonts Import**:
  ```html
  <link rel="preload" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" as="style">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  ```

### Motion & Effects

**Stagger List (Standard)**
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

**Key Effects**:
- Expo.out Bezier(0.16,1,0.3,1) easing for smooth transitions
- Spring modals (damping:20, stiffness:90)
- Haptic-linked press (Impact Light/Medium)
- Animated ambient light blobs (slow oscillation)
- BlurView glassmorphism (intensity 20)
- Scale press 0.97 → 1.0 on interaction
- ⚠️ Avoid pure #000000 (OLED smear)

---

## 🧹 Cleanup Checklist

### Visual & Component Cleanup
- [ ] **Remove emojis as icons** — Use SVG icons (Heroicons/Lucide) instead
- [ ] **Consistent spacing** — Use CSS grid/flex with design tokens
- [ ] **Review all buttons** — Ensure hover states, focus states, active states
- [ ] **Consolidate duplicate components** — Remove legacy/old versions
- [ ] **Check color contrast** — Minimum 4.5:1 for text on background
- [ ] **Typography hierarchy** — h1-h6 properly ordered, no skipped levels
- [ ] **Responsive breakpoints** — Test at 375px, 768px, 1024px, 1440px

### Code Organization
- [ ] **Remove dead code** — Delete unused pages/components
- [ ] **Consolidate styling** — CSS variables, Tailwind config, theme file
- [ ] **Clean imports** — Remove unused imports, organize by type
- [ ] **Fix file structure** — Align with documented page hierarchy
- [ ] **Update component exports** — Ensure Shared/index.ts exports all used components

### Interaction & Accessibility
- [ ] **Cursor states** — `cursor-pointer` on all clickable elements
- [ ] **Hover states** — Smooth 150-300ms transitions on interactive elements
- [ ] **Focus indicators** — Visible outline for keyboard navigation
- [ ] **Form labels** — All inputs have associated labels
- [ ] **ARIA labels** — Button purposes clear via aria-label or text
- [ ] **Skip links** — Main content skip link present
- [ ] **Reduced motion** — Respect `prefers-reduced-motion`

---

## 📱 SEO Optimization

### Meta Tags (Update `layout.tsx`)

```typescript
export const metadata = {
  title: 'WISE² Creative Studio | Professional AI-Native Production Suite',
  description: 'All-in-one creative studio: Sound Lab (audio), Live Studio (streaming), Voice Lab (synthesis), Content Factory (generation), Jingle Lab, Command Center, Client Showcase.',
  keywords: 'creative studio, audio production, live streaming, AI voice, content generation, SoundLabs',
  authors: [{ name: 'WISE²' }],
  robots: 'index, follow',
  openGraph: {
    title: 'WISE² Creative Studio',
    description: 'Professional AI-native creative suite with 7 integrated modules',
    url: 'https://wise2.net/studio',
    siteName: 'WISE²',
    images: [
      {
        url: 'https://wise2.net/og-creative-studio.png',
        width: 1200,
        height: 630,
        alt: 'WISE² Creative Studio',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WISE² Creative Studio',
    description: 'All-in-one creative production suite',
    images: ['https://wise2.net/og-creative-studio.png'],
  },
};
```

### Heading Hierarchy (Correct Structure)

```typescript
// DO: Sequential heading levels
<h1>WISE² Creative Studio</h1>
<h2>Command Center</h2>
<h3>Key Metrics</h3>

// DON'T: Skip levels
<h1>WISE² Creative Studio</h1>
<h4>Command Center</h4>  // ❌ Wrong: skips h2-h3
```

### Page Metadata per Route

Create `metadata.ts` in each major section:

```typescript
// /studio/metadata.ts
export const metadata = {
  title: 'Creative Studio | WISE²',
  description: '7-module creative suite for audio, video, voice, content generation',
  openGraph: {
    url: 'https://wise2.net/studio',
    title: 'Creative Studio',
  },
};

// /soundlab/metadata.ts
export const metadata = {
  title: 'Sound Lab | WISE² | Professional Audio Production',
  description: 'Phase 2 audio production: clip editing, multi-track mixing, professional meters',
  openGraph: {
    url: 'https://wise2.net/soundlab',
    title: 'Sound Lab',
  },
};
```

### Structured Data (Schema.org)

Add to root layout:

```typescript
const schemaData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'WISE² Creative Studio',
  description: 'AI-native creative production suite',
  url: 'https://wise2.net/studio',
  applicationCategory: 'ProductionApplication',
  offers: {
    '@type': 'Offer',
    url: 'https://wise2.net/studio',
  },
  featureList: [
    'Audio Production (Sound Lab)',
    'Live Streaming (Live Studio)',
    'Voice Synthesis (Voice Lab)',
    'Content Generation (Content Factory)',
    'Analytics Dashboard (Command Center)',
    'Portfolio (Client Showcase)',
  ],
};

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
/>
```

### Breadcrumbs (for navigation)

```typescript
// /sitemap shows hierarchy, add breadcrumbs to pages with 3+ levels
<nav aria-label="Breadcrumb">
  <ol>
    <li><Link href="/">Home</Link></li>
    <li><Link href="/studio">Studio</Link></li>
    <li aria-current="page">Sound Lab</li>
  </ol>
</nav>
```

### Image Optimization

- [ ] Use WebP/AVIF with fallbacks: `<picture><source srcset="...webp"><img src="...jpg"></picture>`
- [ ] Add `alt` text to all images (descriptive, not "image")
- [ ] Set `width` / `height` to prevent layout shift
- [ ] Use Next.js `Image` component with `priority` for hero images
- [ ] Compress: ImageOptim, TinyPNG, Squoosh
- [ ] Lazy load non-critical images: `loading="lazy"`

### Performance Signals

- [ ] **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] **Bundle size**: Tree-shake unused code, code-split routes
- [ ] **Caching**: Immutable assets, SWR headers, Service Worker
- [ ] **Minification**: CSS, JS, HTML minified in production
- [ ] **Critical CSS**: Inline above-the-fold styles

---

## 🎯 Implementation Priority

### Phase 1: Foundation (Week 1)
1. ✅ Create design tokens (CSS variables)
2. ✅ Update typography (Plus Jakarta Sans)
3. ✅ Apply color palette to key components
4. ✅ Fix heading hierarchy across all pages
5. ✅ Add meta tags to key pages

### Phase 2: Accessibility & Motion (Week 2)
1. ✅ Add focus indicators to all interactive elements
2. ✅ Implement cursor-pointer on clickable elements
3. ✅ Add hover/active states (150-300ms transitions)
4. ✅ Implement GSAP stagger motion for lists
5. ✅ Respect prefers-reduced-motion

### Phase 3: Polish & Performance (Week 3)
1. ✅ Image optimization (WebP, alt text, lazy load)
2. ✅ Consolidate duplicate components
3. ✅ Remove emojis, use SVG icons
4. ✅ Add breadcrumbs to deep pages
5. ✅ Core Web Vitals optimization

### Phase 4: SEO & Analytics (Week 4)
1. ✅ Structured data (Schema.org)
2. ✅ Sitemap XML
3. ✅ Robots.txt
4. ✅ Analytics tracking
5. ✅ Social sharing images (og:image)

---

## 📋 Pre-Delivery QA Checklist

- [ ] No emojis as icons (use SVG: Heroicons, Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Text contrast ≥ 4.5:1 (both light & dark mode)
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] h1-h6 heading hierarchy correct
- [ ] Meta tags on all major pages
- [ ] Images have alt text
- [ ] Links have descriptive text (not "click here")
- [ ] Form labels properly associated
- [ ] No console errors
- [ ] Lighthouse score ≥ 85

---

## 🚀 Deployment

After implementing:

```bash
# Test locally
npm run build
npm run start

# Check Lighthouse
lighthouse http://localhost:3005/studio

# Check Core Web Vitals
# Use PageSpeed Insights, GTmetrix, WebPageTest

# Submit sitemap
# Add to search console
```

---

## 📚 Resources

- **Design System**: This document (WISE2_STUDIO_UI_CLEANUP_SEO.md)
- **Page Organization**: PAGES_ORGANIZATION.md
- **Component Library**: Component Library Catalog (in memory)
- **Accessibility**: WCAG 2.1 AA, MDN Web Docs
- **Next.js SEO**: Next.js docs, vercel.com/docs

---

## Summary

✅ **Design System**: Modern Dark, Plus Jakarta Sans, green accents, glassmorphism  
✅ **Cleanup**: Remove duplicates, consolidate styles, fix hierarchy  
✅ **SEO**: Meta tags, schema, breadcrumbs, structured data  
✅ **A11y**: Focus states, contrast, ARIA labels, reduced motion  
✅ **Performance**: Image optimization, bundle size, Core Web Vitals  

**Next Step**: Implement Phase 1 (design tokens, typography, color palette) this week.
