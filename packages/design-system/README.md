# WISE² Design System

The unified, enterprise-grade design system for the WISE² platform.

## Vision

Every page, component, and interaction on WISE² should immediately feel like it belongs to the same premium product family. This design system ensures visual and functional consistency across the entire platform.

## Core Principles

1. **Organized Chaos** - Complex information presented with clarity and precision
2. **Enterprise Quality** - Premium, professional, trustworthy
3. **Industrial Aesthetic** - Steel, chrome, precision engineering
4. **Electric Energy** - Blue primary, subtle red accents
5. **Glass Morphism** - Translucent layers, depth, premium feel
6. **Accessibility First** - WCAG AA compliance, always
7. **Motion & Polish** - Smooth, purposeful animations
8. **Dark Mode Only** - The WISE² visual identity is dark-first

## Files

- `tokens.ts` - TypeScript design tokens (source of truth)
- `design-tokens.css` - CSS custom properties (for CSS/styles)
- `tailwind.config.ts` - Shared Tailwind configuration
- `README.md` - This file

## Usage

### For TypeScript/React

```typescript
import tokens from '@wise2/design-system/tokens'

const color = tokens.colors.primary // #0094FF
const spacing = tokens.spacing[4] // 16px
const radius = tokens.borderRadius.md // 16px
```

### For CSS/Tailwind

Import the CSS custom properties in your root stylesheet:

```css
@import '@wise2/design-system/design-tokens.css';
```

Then use in CSS:

```css
.button {
  background-color: var(--wise-primary);
  padding: var(--wise-space-4);
  border-radius: var(--wise-radius-base);
  transition: all var(--wise-duration-base) var(--wise-easing-out);
}

.button:hover {
  background-color: var(--wise-primary-hover);
}
```

### For Tailwind CSS

All apps should use the shared Tailwind configuration:

```typescript
// tailwind.config.ts
import sharedConfig from '@wise2/design-system/tailwind.config'
export default sharedConfig
```

Then use Tailwind utilities:

```tsx
<button className="bg-wise-primary hover:bg-wise-primary-hover text-black px-4 py-2 rounded-md transition-colors">
  Click me
</button>
```

## Color System

### Brand Colors

```
Primary:     #0094FF (Electric Blue)
Primary Hover: #32A8FF
Primary Active: #0075CC
Primary Light: #1AA8FF
```

### Backgrounds & Surfaces

```
Background: #050505 (Pure Black)
Surface:    #0D1117 (Dark Slate)
Surface 2:  #131922 (Darker Slate)
Card:       #10151D (Card Surface)
```

### Text

```
Primary:    #FFFFFF (White)
Secondary:  #C9CED6 (Chrome Gray)
Muted:      #8D98A5 (Muted Gray)
```

### Semantic

```
Success:    #22C55E (Green)
Warning:    #F59E0B (Amber)
Danger:     #E53935 (Red)
Info:       #0094FF (Blue)
```

### Borders

```
Subtle:     rgba(255, 255, 255, 0.08)
Medium:     rgba(255, 255, 255, 0.12)
Strong:     rgba(255, 255, 255, 0.20)
```

## Typography

### Font Families

- **Display:** Inter (for headings, hero text)
- **Sans:** Inter (for body, UI)
- **Mono:** Fira Code (for code, technical content)

### Type Scale (1.25x modular scale)

```
xs:   10px  - Labels, captions
sm:   13px  - Small text
base: 16px  - Body text (default)
lg:   20px  - Large text
xl:   25px  - XL text
2xl:  31px  - Headline
3xl:  39px  - Heading
4xl:  49px  - Large heading
5xl:  61px  - Hero text
6xl:  76px  - Massive text
7xl:  95px  - Display (ORGANIZED CHAOS)
```

### Font Weights

- **100:** Thin (not recommended)
- **300:** Light
- **400:** Normal (body)
- **500:** Medium (UI elements)
- **600:** Semibold (headings)
- **700:** Bold (emphasis)
- **800:** Extra Bold

### Line Heights

- **Tight (1.25):** Headings
- **Snug (1.375):** Subheadings
- **Normal (1.5):** Body text
- **Relaxed (1.625):** Large text
- **Loose (2):** Captions

## Spacing System

Based on 8px base unit:

```
0px, 4px, 8px, 12px, 16px, 20px, 24px, 28px, 32px,
36px, 40px, 48px, 56px, 64px, 80px, 96px, 112px, 128px,
144px, 160px, 176px, 192px, 208px, 224px, 240px, 256px
```

Use `space-4` for 16px, `space-8` for 32px, etc.

## Border Radius

```
none: 0px      - No radius (edges)
xs:   4px      - Very subtle
sm:   8px      - Buttons, small components
base: 12px     - Cards, default
md:   16px     - Larger cards
lg:   24px     - Large components
xl:   32px     - Extra large
full: 9999px   - Pill shapes
```

## Shadows & Glows

### Box Shadows

```
small:  0 2px 8px rgba(0, 0, 0, 0.3)
medium: 0 4px 16px rgba(0, 0, 0, 0.4)
large:  0 8px 32px rgba(0, 0, 0, 0.5)
xlarge: 0 16px 64px rgba(0, 0, 0, 0.6)
```

### Glow Effects (Blue)

```
glow-blue-sm:  0 0 8px rgba(0, 148, 255, 0.3)
glow-blue-md:  0 0 16px rgba(0, 148, 255, 0.5)
glow-blue-lg:  0 0 32px rgba(0, 148, 255, 0.7)
glow-blue-xl:  0 0 64px rgba(0, 148, 255, 0.8)
```

## Animations

### Duration

```
fast:    150ms  - Quick interactions
base:    200ms  - Default
slow:    300ms  - Deliberate
slower:  500ms  - Extended
slowest: 1000ms - Very slow
```

### Easing

```
in:     cubic-bezier(0.4, 0, 1, 1)     - Starts slow
out:    cubic-bezier(0, 0, 0.2, 1)     - Ends smooth
inOut:  cubic-bezier(0.4, 0, 0.2, 1)   - Smooth both ways
sharp:  cubic-bezier(0.4, 0, 0.6, 1)   - Snappy
```

### Common Animations

```
fade-in:  Opacity 0 → 1 (300ms)
fade-out: Opacity 1 → 0 (300ms)
slide-in: Y -10px → 0 (300ms)
scale-in: Scale 0.95 → 1 (200ms)
```

## Breakpoints

```
xs:  320px  - Small phone
sm:  480px  - Large phone
md:  768px  - Tablet
lg:  1024px - Laptop
xl:  1280px - Desktop
2xl: 1600px - Wide desktop
3xl: 1920px - Ultra-wide
```

## Z-Index Scale

```
-1:    hide
0:     base
1000:  dropdown
1020:  sticky
1030:  fixed
1040:  modal-backdrop
1050:  modal
1060:  popover
1070:  tooltip
1080:  notification
```

## Component Patterns

### Button Primary

```tsx
<button className="bg-wise-primary hover:bg-wise-primary-hover text-black px-4 py-2 rounded-md font-bold transition-colors">
  Start Free Today
</button>
```

### Card

```tsx
<div className="bg-wise-card border border-wise-border-subtle rounded-base shadow-small">
  {children}
</div>
```

### Glass Morphism

```tsx
<div className="bg-wise-surface/80 backdrop-blur-lg border border-wise-border-subtle rounded-base">
  {children}
</div>
```

### Input Field

```tsx
<input
  className="bg-wise-surface border border-wise-border-medium focus:border-wise-primary rounded-sm px-4 py-2 text-wise-text-primary placeholder-wise-text-muted transition-colors"
  placeholder="Type here..."
/>
```

### Text Utilities

```tsx
<h1 className="text-7xl font-bold text-wise-text-primary">Hero Text</h1>
<p className="text-base text-wise-text-secondary">Body text</p>
<span className="text-xs text-wise-text-muted">Caption</span>
```

## Best Practices

✅ **DO:**

- Use design tokens instead of hardcoded values
- Prefer CSS custom properties for styling
- Use Tailwind utilities over custom CSS
- Reference this design system for all design decisions
- Keep animations purposeful and smooth
- Test on all breakpoints
- Ensure WCAG AA compliance
- Use semantic HTML

❌ **DON'T:**

- Hardcode colors (use `--wise-*` or Tailwind)
- Create custom spacing values (use the scale)
- Add animations without considering reduced motion
- Use inconsistent border radius values
- Mix different typography scales
- Ignore accessibility requirements
- Create new components that duplicate existing ones

## Migration Guide

### From Hardcoded Colors

**Before:**
```tsx
<button className="bg-blue-500 hover:bg-blue-600">Click</button>
```

**After:**
```tsx
<button className="bg-wise-primary hover:bg-wise-primary-hover">Click</button>
```

### From Inconsistent Spacing

**Before:**
```tsx
<div className="p-6 m-4">Content</div>
```

**After:**
```tsx
<div className="p-6 m-4">Content</div> {/* Already aligned! */}
```

### From Custom Shadows

**Before:**
```tsx
<div style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>Card</div>
```

**After:**
```tsx
<div className="shadow-medium">Card</div>
```

## References

- Reference Design: See `/WISE2_REFERENCE_VISUAL.png`
- Color Palette: See color system section above
- Component Examples: See component library (coming soon)
- Animation Guide: See motion tokens section above

## Support

Questions about the design system? Check:
1. This README
2. `tokens.ts` for complete token definitions
3. `design-tokens.css` for CSS variable usage
4. Component library examples

## Version

WISE² Design System v1.0 - Organized Chaos

Last Updated: 2026-07-14
