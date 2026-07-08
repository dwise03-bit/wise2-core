# WISE² Core Brand Kit
## Creator Operating System

**Version:** 1.0  
**Last Updated:** 2026-07-08  
**Status:** Live on wise2.net

---

## Brand Overview

**WISE² Core** is a creator operating system built on a dual-founder narrative:
- **Darrin Wise** (The Idea Hunter) — Visionary, Strategy, Innovation
- **Danny Wise** (The System Builder) — Execution, Infrastructure, Reality

**Brand Tagline:** "One Idea. Unlimited Creation."  
**Mission:** Infrastructure that scales with your ambition, not your budget.

---

## Visual Identity

### Color Palette

#### Primary Colors
| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Neon Blue** (Darrin) | #00D9FF | rgb(0, 217, 255) | Vision, ideas, possibility |
| **Neon Red** (Danny) | #FF4D4D | rgb(255, 77, 77) | Action, building, execution |

#### Extended Color Scale

**Blue Scale (Idea Hunter):**
- 50: #E0F7FF
- 100: #B3EBFF
- 200: #80DDFF
- 300: #4DCFFF
- 400: #1AC2FF
- **500: #00D9FF** (Primary)
- 600: #00A8CC
- 700: #007799
- 800: #004D66
- 900: #002433

**Red Scale (System Builder):**
- 50: #FFE8E8
- 100: #FFCCCC
- 200: #FF9999
- 300: #FF6666
- **400: #FF4D4D** (Primary)
- 500: #FF3333
- 600: #CC2929
- 700: #991F1F
- 800: #661414
- 900: #330A0A

**Neutral (Cyberpunk Dark):**
- 50: #F5F5F5
- 100: #E5E5E5
- 200: #D0D0D0
- 300: #A8A8A8
- 400: #808080
- 500: #5A5A5A
- 600: #3D3D3D
- 700: #2A2A2A
- 800: #1A1A1A
- **900: #000000** (Primary background)

#### Semantic Colors
- **Success:** #00FF00 (Neon green)
- **Warning:** #FFAA00 (Neon orange)
- **Error:** #FF0040 (Hot pink)
- **Info:** #00D9FF (Neon blue)

---

## Typography

### Font Families

**Headings:** 'Bebas Neue', serif
- Bold, aggressive, comic-book style
- Used for: H1, H2, H3, H4, hero titles
- Example: "ONE SEES THE POSSIBILITIES"

**Body Text:** 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- Clean, readable, modern
- Used for: Paragraphs, descriptions, UI text
- Example: "Infrastructure that scales with your ambition, not your budget."

**Monospace:** 'Courier New', monospace
- Used for: Code, system status, technical text
- Example: `#00D9FF`

### Font Scale (1.25x Ratio)

| Size | Value | Use Case |
|------|-------|----------|
| xs | 12px | Small labels, captions |
| sm | 14px | Secondary text |
| base | 16px | Body text (default) |
| lg | 20px | Large body, small headings |
| xl | 25px | Subheadings |
| 2xl | 31px | Headings |
| 3xl | 39px | Large headings |
| 4xl | 49px | Hero headings |
| 5xl | 61px | Massive headings |

### Font Weights

- **Light (300):** Subtle, secondary text
- **Normal (400):** Body text, standard UI
- **Semibold (600):** Emphasis, button text
- **Bold (700):** Headings, strong emphasis
- **Black (900):** Hero titles, dramatic effect

### Line Heights

- **Tight (1.1):** Headings, dramatic effect
- **Normal (1.5):** Body text (standard)
- **Relaxed (1.75):** Long-form content
- **Loose (2):** Very open spacing

---

## Spacing System

**8pt Grid (Consistent spacing throughout)**

| Token | Value | Usage |
|-------|-------|-------|
| space-1 | 4px | Tiny spacing |
| space-2 | 8px | Small spacing |
| space-3 | 12px | Compact |
| space-4 | 16px | Standard |
| space-6 | 24px | Comfortable |
| space-8 | 32px | Generous |
| space-12 | 48px | Large sections |
| space-16 | 64px | Major sections |
| space-20 | 80px | Page sections |
| space-24 | 96px | Full sections |
| space-32 | 128px | Massive gaps |

---

## Visual Effects

### Shadows (Neon Glow)

| Level | Effect | Usage |
|-------|--------|-------|
| sm | 0 2px 4px rgba(0, 217, 255, 0.1) | Subtle hover |
| md | 0 4px 8px rgba(0, 217, 255, 0.15) | Card shadows |
| lg | 0 8px 16px rgba(0, 217, 255, 0.2) | Elevated elements |
| xl | 0 0 40px rgba(0, 217, 255, 0.25) | Strong glow |
| 2xl | 0 0 60px rgba(0, 217, 255, 0.35) | Intense glow |

**Variant:** Red shadows available for red-branded elements

### Border Radius

| Size | Value | Usage |
|------|-------|-------|
| sm | 4px | Small corners |
| md | 8px | Standard cards |
| lg | 12px | Larger elements |
| xl | 16px | Prominent boxes |
| 2xl | 24px | Feature boxes |
| full | 9999px | Circles, pills |

### Animations

| Animation | Duration | Usage |
|-----------|----------|-------|
| Glow | 3s infinite | Text emphasis |
| Float | 4s infinite | Floating panels |
| Fade-in | 0.8s | Page entry |
| Pulse | 2s infinite | Active elements |
| Flicker | Variable | Holographic effect |

---

## Component Library

### Buttons

**Variants:**
- `primary` — Blue neon background with glow
- `secondary` — Red neon background with glow
- `ghost` — Transparent with neon border
- `outline` — Border only with hover glow

**Sizes:**
- `sm` — 32px height (small actions)
- `md` — 40px height (standard)
- `lg` — 48px height (primary CTAs)

**States:**
- Default → Full glow
- Hover → Enhanced glow, scale 1.02
- Active → Darker shade
- Focus → 2px outline, 2px offset
- Disabled → 60% opacity

### Hero Section

**Structure:**
1. Background image (full bleed)
2. Gradient overlay (black to transparent)
3. Content overlay (text, form, etc.)

**Responsive:**
- Mobile: 100vh minimum height
- Desktop: 100vh fixed height

### Feature Box

**Layout:**
- Icon/Image (top, 2xl size)
- Headline (bold, larger text)
- Description (normal weight, gray text)
- Optional CTA button

**Hover State:**
- Scale 1.02
- Enhanced glow
- Shadow intensifies

### Email Capture Form

**Structure:**
- Email input (neon border, validation)
- Submit button (primary variant)
- Status message (loading/success/error)

**States:**
- Idle → Ready for input
- Loading → Button shows "Adding..."
- Success → Button shows "✓ Added", then resets
- Error → Red border + error message

---

## Asset Library

### Logo Assets

**Primary Logo:** `logo-w2.png`
- Full wordmark "WISE² CORE"
- Use for: Headers, main branding
- Min width: 120px
- Color: Black text

**Mark Only:** `logo-w2-mark.png`
- Square W² symbol
- Use for: Favicon, small spaces
- Min size: 32×32px
- Color: Neon blue

### Hero Images

**FLAGSHIP_HERO.png** (3.7MB)
- Both founders in cyberpunk aesthetic
- Surrounded by ecosystem products
- Tagline: "One Idea. Unlimited Creation"
- Use for: Main landing page hero
- Resolution: High-res, optimized

**ECOSYSTEM.png** (3.7MB)
- Ecosystem overview
- All six core products displayed
- Founders front and center
- Use for: Product showcase section
- Resolution: High-res, optimized

### Feature Graphics

- `LEARN_GRID.png` — Learning/knowledge visualization
- `PROMPT_TO_RESULT.png` — Process flow visualization
- `WHY_WISE2.png` — Value proposition graphic

---

## Brand Guidelines

### Do's ✅

- ✅ Use neon blue (#00D9FF) for Darrin/ideas/vision
- ✅ Use neon red (#FF4D4D) for Danny/execution/building
- ✅ Use generous whitespace (Apple-like minimalism)
- ✅ Combine tech aesthetic with clean design
- ✅ Use brand fonts (Bebas Neue for headings, Inter for body)
- ✅ Apply glow effects to emphasize importance
- ✅ Maintain 8pt grid alignment
- ✅ Test all copy on brand fonts

### Don'ts ❌

- ❌ Don't use flat colors without glow effects (feels generic)
- ❌ Don't overcrowd designs (maintain Apple's minimalism)
- ❌ Don't mix Darrin blue with Danny red equally (use one primary)
- ❌ Don't use other neon colors (stick to blue/red palette)
- ❌ Don't drop shadows; use glowing shadows instead
- ❌ Don't use serif fonts for body text
- ❌ Don't ignore the 8pt grid
- ❌ Don't animate everything (be purposeful)

---

## Accessibility Standards

### Color Contrast

- **WCAG AA:** All text meets 4.5:1 (normal) / 3:1 (large)
- **WCAG AAA:** Aim for 7:1 where possible
- **Test:** Use WCAG contrast checker before deployment

### Motion

- **Prefers-reduced-motion:** Respect user preferences
- **Duration:** Keep animations under 500ms
- **Flashing:** Avoid more than 3 flashes per second

### Typography

- **Minimum size:** 14px for body text
- **Line height:** 1.5 minimum for readability
- **Contrast:** Ensure sufficient contrast with background

### Interactive Elements

- **Touch targets:** Minimum 44×44px
- **Focus indicators:** Always visible and high contrast
- **Keyboard navigation:** All interactive elements accessible via keyboard

---

## Usage Examples

### Hero Section

```html
<section class="hero">
  <img src="FLAGSHIP_HERO.png" alt="..." />
  <h1 class="hero-title">ONE SEES THE POSSIBILITIES.<br/>ONE BUILDS THE REALITY.</h1>
  <button class="btn-primary">Get Access</button>
</section>
```

### Feature Box

```html
<div class="feature-box blue">
  <div class="icon">💡</div>
  <h3>Discover Possibilities</h3>
  <p>Find opportunities hidden in data...</p>
</div>
```

### Button

```html
<button class="btn btn-primary btn-md">Get Access</button>
<button class="btn btn-secondary btn-lg">Start Building</button>
<button class="btn btn-ghost">Learn More</button>
```

---

## Implementation Checklist

- [ ] Fonts loaded (Bebas Neue, Inter)
- [ ] Colors match hex values exactly
- [ ] Spacing follows 8pt grid
- [ ] Shadows use glow effects (not flat)
- [ ] Animations respect prefers-reduced-motion
- [ ] All text meets WCAG AA contrast
- [ ] Buttons are 44×44px minimum
- [ ] Responsive design tested (mobile/tablet/desktop)
- [ ] Logo usage follows guidelines
- [ ] Component library integrated
- [ ] Brand audit passed

---

## Files & Resources

**Located in:** `/public/old-graphics/`

### Available Assets
- `FLAGSHIP_HERO.png` — Main hero image
- `ECOSYSTEM.png` — Product showcase
- `logo-w2.png` — Full wordmark
- `logo-w2-mark.png` — Mark only
- Feature graphics (5 additional PNG files)

**Design System:**
- `design-system.md` — Complete tokens reference
- `components/design-system-components.tsx` — React library
- `components/hud-elements.tsx` — Tech UI animations

---

## Brand Updates

### Version 1.0 (2026-07-08)
- Initial brand kit created
- Color palette finalized
- Typography standardized
- Component library established
- Live on wise2.net

---

## Questions & Support

For brand-related questions:
1. Check `BRAND_KIT.md` (this file)
2. Review `design-system.md` for detailed tokens
3. Check component examples in React library
4. Test on multiple devices for accuracy

---

**WISE² Core — Infrastructure for builders who won't compromise.**

*Idea > System > Brand > Freedom*
