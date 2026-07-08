# WISE² Design System
## Creator Operating System — Comic Book Aesthetic

**Brand Foundation**: Dual-founder narrative with cyberpunk/neon aesthetic
- **Darrin Wise** (The Idea Hunter) → Neon Blue (#00D9FF) — Vision, Strategy, Innovation
- **Danny Wise** (The System Builder) → Red/Orange (#FF4D4D) — Execution, Infrastructure, Reality

---

## Design Tokens

### Color Palette

#### Primary Blue (Darrin / Idea Hunter)
```css
--color-blue-50: #E0F7FF
--color-blue-100: #B3EBFF
--color-blue-200: #80DDFF
--color-blue-300: #4DCFFF
--color-blue-400: #1AC2FF
--color-blue-500: #00D9FF (Primary)
--color-blue-600: #00A8CC
--color-blue-700: #007799
--color-blue-800: #004D66
--color-blue-900: #002433
```

#### Primary Red (Danny / System Builder)
```css
--color-red-50: #FFE8E8
--color-red-100: #FFCCCC
--color-red-200: #FF9999
--color-red-300: #FF6666
--color-red-400: #FF4D4D (Primary)
--color-red-500: #FF3333
--color-red-600: #CC2929
--color-red-700: #991F1F
--color-red-800: #661414
--color-red-900: #330A0A
```

#### Neutral (Cyberpunk Dark)
```css
--color-neutral-50: #F5F5F5
--color-neutral-100: #E5E5E5
--color-neutral-200: #D0D0D0
--color-neutral-300: #A8A8A8
--color-neutral-400: #808080
--color-neutral-500: #5A5A5A
--color-neutral-600: #3D3D3D
--color-neutral-700: #2A2A2A
--color-neutral-800: #1A1A1A
--color-neutral-900: #000000
```

#### Semantic Colors
```css
--color-success: #00FF00 (Neon green)
--color-warning: #FFAA00 (Neon orange)
--color-error: #FF0040 (Hot pink)
--color-info: #00D9FF (Neon blue)
```

### Typography

#### Font Families
```css
--font-heading: 'Bebas Neue', 'Baskerville', serif; /* Bold, aggressive, comic-style */
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'Courier New', monospace; /* System/code aesthetic */
```

#### Font Sizes (1.25x Scale)
```css
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 20px;
--text-xl: 25px;
--text-2xl: 31px;
--text-3xl: 39px;
--text-4xl: 49px;
--text-5xl: 61px;
```

#### Font Weights
```css
--font-light: 300;
--font-normal: 400;
--font-semibold: 600;
--font-bold: 700;
--font-black: 900; /* For dramatic headings */
```

#### Line Heights
```css
--line-tight: 1.1;
--line-normal: 1.5;
--line-relaxed: 1.75;
--line-loose: 2;
```

### Spacing (8pt Grid)

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
--space-32: 128px;
```

### Border Radius

```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 24px;
--radius-full: 9999px;
```

### Shadows (Neon Glow)

```css
--shadow-sm: 0 2px 4px rgba(0, 217, 255, 0.1);
--shadow-md: 0 4px 8px rgba(0, 217, 255, 0.15);
--shadow-lg: 0 8px 16px rgba(0, 217, 255, 0.2);
--shadow-xl: 0 0 40px rgba(0, 217, 255, 0.25);
--shadow-2xl: 0 0 60px rgba(0, 217, 255, 0.35);

/* Red glow variant */
--shadow-red-lg: 0 8px 16px rgba(255, 77, 77, 0.2);
--shadow-red-xl: 0 0 40px rgba(255, 77, 77, 0.25);

/* Inner glow for panels */
--shadow-inner: inset 0 0 40px rgba(0, 217, 255, 0.12);
```

### Animation

```css
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;

--easing-ease-in: cubic-bezier(0.4, 0, 1, 1);
--easing-ease-out: cubic-bezier(0, 0, 0.2, 1);
--easing-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--easing-comic: cubic-bezier(0.16, 1, 0.3, 1); /* Playful bounce */
```

### Z-Index Scale

```css
--z-base: 0;
--z-dropdown: 100;
--z-sticky: 200;
--z-fixed: 300;
--z-modal-backdrop: 400;
--z-modal: 500;
--z-notification: 600;
```

### Breakpoints

```css
--breakpoint-xs: 320px;
--breakpoint-sm: 480px;
--breakpoint-md: 640px;
--breakpoint-lg: 768px;
--breakpoint-xl: 1024px;
--breakpoint-2xl: 1280px;
```

---

## Component Architecture

### Atomic Design Hierarchy

#### Atoms (Basic Building Blocks)
- `Badge` — Status labels
- `Button` — Call-to-action
- `Icon` — Neon-styled SVG
- `Label` — Form labels
- `Input` — Text fields with neon border
- `Text` — Typography primitives

#### Molecules (Simple Combinations)
- `FormField` — Label + Input + Error
- `HeroTitle` — Large heading with glow
- `NeonBorder` — Decorative neon line
- `FeatureBox` — Card with neon border and glow
- `CTASection` — Hero section builder

#### Organisms (Complex Sections)
- `Header` — Navigation + Logo
- `HeroSection` — Full-screen hero with image
- `FeatureGrid` — Grid of feature boxes
- `EmailCaptureForm` — Email signup form
- `Footer` — Bottom section with branding

#### Templates
- `LandingPageLayout` — Full landing page structure
- `AuthLayout` — Authentication pages

---

## Component Specifications

### Button

**Variants:**
- `primary` — Blue neon background with glow
- `secondary` — Red neon background with glow
- `ghost` — Transparent with neon border
- `outline` — Border only with hover glow

**Sizes:**
- `sm` — 32px height, 12px padding
- `md` — 40px height, 16px padding (default)
- `lg` — 48px height, 20px padding

**States:**
- Default — Full glow
- Hover — Enhanced glow, scale 1.02
- Active — Darker shade
- Focus — 2px outline, 2px offset
- Disabled — 60% opacity, no hover effects

**Spec:**
```tsx
<Button 
  variant="primary" 
  size="md"
  disabled={false}
  aria-busy={loading}
>
  Get Access
</Button>
```

---

### HeroTitle

**Purpose:** Large dramatic heading with neon glow effect

**Variants:**
- `darrin` — Blue neon glow (Idea Hunter aesthetic)
- `danny` — Red neon glow (System Builder aesthetic)
- `dual` — Both glows alternating

**Size Preset:** 
- Mobile: 32px
- Tablet: 48px
- Desktop: 64px (fluid)

**Spec:**
```tsx
<HeroTitle variant="dual" className="neon-glow">
  ONE SEES <br/> THE POSSIBILITIES.<br/>
  ONE BUILDS <br/> THE REALITY.
</HeroTitle>
```

---

### FeatureBox

**Purpose:** Content card with neon border and inner glow

**Layout:**
- Icon/Image (top)
- Headline (bold)
- Description (normal weight)
- Optional CTA button

**Hover State:** 
- Scale 1.02
- Enhanced glow
- Shadow intensifies

**Spec:**
```tsx
<FeatureBox 
  icon={<Icon name="idea" />}
  title="Discover Possibilities"
  description="Find opportunities..."
  variant="blue" /* or "red" */
>
  Optional CTA
</FeatureBox>
```

---

### EmailCaptureForm

**Fields:**
- Email input (with validation)
- Submit button
- Status message (loading/success/error)

**States:**
- Idle → Ready for input
- Loading → Button shows "Adding..."
- Success → Button shows "✓ Added"
- Error → Red border + error message

**Spec:**
```tsx
<EmailCaptureForm
  onSuccess={() => {}}
  onError={(msg) => {}}
  placeholder="your@email.com"
/>
```

---

### HeroSection

**Purpose:** Full-screen hero with background image and overlay content

**Layers (bottom to top):**
1. Background image (full bleed)
2. Gradient overlay (black to transparent)
3. Content (text, form, etc.)

**Responsive:**
- Mobile: 100vh min height
- Desktop: 100vh fixed height (md and up)

**Spec:**
```tsx
<HeroSection
  backgroundImage="/old-graphics/FLAGSHIP_HERO.png"
  alt="Hero description"
>
  {/* Content here */}
</HeroSection>
```

---

## Styling Patterns

### Neon Glow Text
```css
.neon-glow {
  animation: glow 3s ease-in-out infinite;
  text-shadow: 0 0 10px #00D9FF, 0 0 20px #00D9FF;
}

@keyframes glow {
  0%, 100% { text-shadow: 0 0 10px #00D9FF, 0 0 20px #00D9FF; }
  50% { text-shadow: 0 0 20px #00D9FF, 0 0 30px #00D9FF; }
}
```

### Float Animation
```css
.float-panel {
  animation: float 4s ease-in-out infinite;
  backdrop-filter: blur(20px);
  background: linear-gradient(135deg, rgba(0, 217, 255, 0.12) 0%, rgba(0, 217, 255, 0.06) 100%);
  border: 1px solid rgba(0, 217, 255, 0.4);
  box-shadow: 0 0 40px rgba(0, 217, 255, 0.25);
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}
```

### Reduced Motion Support
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

## Accessibility Standards

- **Color Contrast:** All text meets WCAG AA (4.5:1 for normal, 3:1 for large)
- **Focus Indicators:** 2px outline, 2px offset, neon blue
- **Touch Targets:** All interactive elements ≥ 44×44px
- **Semantic HTML:** Proper heading hierarchy, ARIA labels
- **Motion:** Respects prefers-reduced-motion

---

## Responsive Behavior

### Mobile (< 640px)
- Single column layout
- Fluid typography (clamp-based)
- Touch-friendly button sizes (48px minimum)
- Reduced spacing for screen real estate

### Tablet (640px - 1024px)
- 2-column grids where appropriate
- Medium spacing
- Optimized for landscape and portrait

### Desktop (> 1024px)
- Multi-column layouts
- Generous spacing
- Full imagery display
- Desktop-optimized interactions

---

## Implementation Path

1. **Export CSS Variables** → `design-tokens.css`
2. **Create Component Library** → React components using tokens
3. **Integrate into Landing Page** → Replace hardcoded styles
4. **Test Responsiveness** → All breakpoints
5. **Validate Accessibility** → WCAG AA compliance
6. **Deploy to Production** → Update wise2.net

---

## Developer Handoff Checklist

- [ ] Design tokens CSS file created
- [ ] Component library built with React
- [ ] All tokens used (no hardcoded values)
- [ ] Responsive design tested
- [ ] Accessibility validated
- [ ] Animations checked against reduced-motion
- [ ] Dark/light theme support (if needed)
- [ ] Documentation complete
- [ ] Ready for QA review

---

**Status:** Design System Created  
**Last Updated:** 2026-07-07  
**Next Step:** Implement components in React landing page
