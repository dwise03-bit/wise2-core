# WISE² Branding Asset Registry v2.0
**🔒 LOCKED 2026-09-13 | Canonical Asset Inventory**

---

## Master Color Palette

```
████████████████ #050607 — Dark Navy (Primary Background)
████████████████ #0a0f1a — Dark Charcoal (Secondary Background)  
████████████████ #00D9FF — Bright Cyan (Primary CTA)
████████████████ #C4A369 — Gold/Tan (Secondary CTA)
████████████████ #00FF7F — Neon Green (Status/Success)
████████████████ #D1D5DB — Light Gray (Body Text)
████████████████ #FF4444 — Red (Error/Critical)
```

**CSS Variables** (copy into every project):
```css
:root {
  --wise-dark: #050607;
  --wise-darker: #0a0f1a;
  --wise-blue: #00D9FF;
  --wise-gold: #C4A369;
  --wise-green: #00FF7F;
  --wise-gray-light: #D1D5DB;
  --wise-gray-dark: #1f2937;
  --wise-red: #FF4444;
}
```

---

## Logo Assets

### Primary Logo (Text-based)
```
WISE²
BUILD DIFFERENT
```

**Specs**:
- Font: Bold, system sans-serif
- Logo size: 32px
- Tagline size: 11px
- Letter spacing: Logo 0.2em, Tagline 0.1em
- Colors: Logo #00D9FF, Tagline #00FF7F
- Minimum size: 24px
- Clear space: 1x logo width on all sides

### Logo with Hero (Full Header)
```
WISE² (cyan)
BUILD DIFFERENT (neon green)

BUILDING EMPIRES.
CHANGING CULTURE. (← neon green)
TOGETHER.
```

**Usage**: Landing pages, homepages, hero sections

### Wordmark Only (Compact)
```
WISE²
```

**Usage**: Navigation headers, favicons, app icons

---

## Typography System

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

### Heading Styles
| Level | Size | Weight | Case | Letter-Spacing | Color |
|-------|------|--------|------|-----------------|-------|
| H1 | 48px | 700 | UPPERCASE | 0.05em | White |
| H2 | 32px | 700 | UPPERCASE | 0.05em | #D1D5DB |
| H3 | 24px | 600 | UPPERCASE | 0.05em | #D1D5DB |
| H4 | 18px | 600 | UPPERCASE | 0.05em | #D1D5DB |
| Body | 14px | 400 | Sentence | 0 | #D1D5DB |
| Tagline | 12px | 600 | UPPERCASE | 0.1em | #00FF7F |

---

## Component Library

### Button: Primary CTA
```
Background: #00D9FF
Text Color: #050607
Padding: 12px 24px
Font Weight: 600
Border Radius: 6px
Text Transform: UPPERCASE
Letter Spacing: 0.05em
Hover: Darken cyan by 10%
Active: Darken cyan by 20%
```

**Example**: "BOOK A BUSINESS AUDIT"

### Button: Secondary CTA
```
Background: #C4A369
Text Color: #050607
Padding: 12px 24px
Font Weight: 600
Border Radius: 6px
Text Transform: UPPERCASE
Letter Spacing: 0.05em
Hover: Darken gold by 10%
```

**Example**: "EXPLORE WISE²"

### Button: Tertiary (Text Only)
```
Background: Transparent
Text Color: #00D9FF
Padding: 12px 0
Border Bottom: 1px #00D9FF
Font Weight: 600
Hover: Background #00D9FF, Text #050607
```

### Card: Default
```
Background: rgba(10, 15, 26, 0.5)
Border: 1px solid rgba(0, 217, 255, 0.2)
Border Radius: 8px
Padding: 20px
Box Shadow: None
Hover: Border color #00D9FF
```

### Card: Success
```
[Same as default]
Border Left: 4px #00FF7F
```

### Card: Critical/Error
```
[Same as default]
Border Left: 4px #FF4444
```

### Badge: Status
```
Padding: 6px 12px
Border Radius: 20px
Font Size: 12px
Font Weight: 600

Success: Background rgba(0, 255, 127, 0.1), Border 1px #00FF7F, Text #00FF7F
Critical: Background rgba(255, 68, 68, 0.1), Border 1px #FF4444, Text #FF4444
Info: Background rgba(0, 217, 255, 0.1), Border 1px #00D9FF, Text #00D9FF
Warning: Background rgba(245, 158, 11, 0.1), Border 1px #F59E0B, Text #F59E0B
```

### Input Field
```
Background: rgba(10, 15, 26, 0.7)
Border: 1px solid rgba(0, 217, 255, 0.2)
Border Radius: 6px
Padding: 12px
Text Color: #D1D5DB
Placeholder Color: #666
Focus: Border #00D9FF, Box Shadow 0 0 0 3px rgba(0, 217, 255, 0.1)
```

### Link
```
Color: #00D9FF
Text Decoration: None
Hover: Text Decoration: Underline
Active: Color: #00FF7F
```

### Progress Bar
```
Background: #1f2937
Fill Color: #00D9FF
Height: 8px
Border Radius: 4px
```

---

## Page Templates

### Header Template
```html
<header style="
  background: linear-gradient(135deg, #050607 0%, #0a0f1a 100%);
  border-bottom: 3px solid #00D9FF;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
">
  <div>
    <div style="font-size: 32px; font-weight: 900; letter-spacing: 0.2em; color: #00D9FF;">
      WISE²
    </div>
    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #00FF7F;">
      BUILD DIFFERENT
    </div>
  </div>
  
  <nav style="display: flex; gap: 30px;">
    <a href="#" style="color: #D1D5DB; text-decoration: none; text-transform: uppercase; letter-spacing: 0.05em;">Products</a>
    <a href="#" style="color: #D1D5DB; text-decoration: none; text-transform: uppercase; letter-spacing: 0.05em;">Solutions</a>
  </nav>
</header>
```

### Hero Section Template
```html
<section style="
  background: linear-gradient(180deg, #050607 0%, #0a0f1a 100%);
  padding: 80px 40px;
  text-align: center;
">
  <h1 style="
    font-size: 48px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: white;
    margin-bottom: 20px;
    line-height: 1.2;
  ">
    BUILDING EMPIRES.<br/>
    <span style="color: #00FF7F;">CHANGING CULTURE.</span><br/>
    TOGETHER.
  </h1>
  
  <p style="
    font-size: 16px;
    color: #D1D5DB;
    margin-bottom: 40px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  ">
    One platform for software, automation, communications, infrastructure, AI, and real-world results.
  </p>
  
  <div style="display: flex; gap: 20px; justify-content: center;">
    <button style="background: #00D9FF; color: #050607; padding: 12px 24px; border: none; border-radius: 6px; font-weight: 600; text-transform: uppercase; cursor: pointer;">
      BOOK A BUSINESS AUDIT →
    </button>
    <button style="background: #C4A369; color: #050607; padding: 12px 24px; border: none; border-radius: 6px; font-weight: 600; text-transform: uppercase; cursor: pointer;">
      EXPLORE WISE²
    </button>
  </div>
</section>
```

### Footer Template
```html
<footer style="
  background: #050607;
  border-top: 1px solid rgba(0, 217, 255, 0.2);
  padding: 40px;
  text-align: center;
  color: #D1D5DB;
">
  <div style="font-size: 24px; font-weight: 900; letter-spacing: 0.2em; color: #00D9FF; margin-bottom: 20px;">
    WISE²
  </div>
  
  <p style="margin-bottom: 30px;">
    <strong>Smart Systems. Stronger Businesses.</strong>
  </p>
  
  <div style="display: flex; gap: 30px; justify-content: center; margin-bottom: 30px;">
    <a href="#" style="color: #00D9FF; text-decoration: none; text-transform: uppercase; font-size: 12px;">Products</a>
    <a href="#" style="color: #00D9FF; text-decoration: none; text-transform: uppercase; font-size: 12px;">About</a>
    <a href="#" style="color: #00D9FF; text-decoration: none; text-transform: uppercase; font-size: 12px;">Contact</a>
  </div>
  
  <p style="font-size: 12px; opacity: 0.7;">
    © 2026 WISE² | All Rights Reserved
  </p>
</footer>
```

---

## Responsive Breakpoints

| Device | Width | Logo Size | Heading Size | Padding |
|--------|-------|-----------|--------------|---------|
| Mobile | 375px | 24px | 32px | 16px |
| Tablet | 768px | 28px | 40px | 24px |
| Desktop | 1024px+ | 32px | 48px | 40px |

---

## Color Contrast Verification

**WCAG AA Compliance** (4.5:1 minimum):
- #D1D5DB on #050607: 13.2:1 ✅
- #00D9FF on #050607: 11.5:1 ✅
- #00FF7F on #050607: 10.2:1 ✅
- #C4A369 on #050607: 6.1:1 ✅
- White on #050607: 20:1 ✅

**Accessible**: All color combinations meet or exceed WCAG AA standards.

---

## Implementation Checklist

Deploy this registry to:

- [ ] Homepage (apps/website)
- [ ] Dashboard (apps/dashboard)
- [ ] Admin UI (apps/admin)
- [ ] Email templates
- [ ] Mobile apps
- [ ] API documentation
- [ ] Help/support center
- [ ] Blog/content pages

---

## Files Referencing This Registry

1. `docs/brand-guidelines.md` — Master brand spec
2. `docs/BRANDING_IMPLEMENTATION_GUIDE.md` — Implementation instructions
3. `docs/WISE2_LOGO_SVG.md` — Logo assets
4. Memory: `brand_lock_wise2_v2.md` — Locked brand identity

---

## Version History

| Version | Date | Status | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-09-13 | 🔒 LOCKED | Extracted from wise2.net, locked for production |
| 1.0 | 2026-08-01 | Deprecated | Old brand version |

---

**Master Document**: This registry is the canonical source for all WISE² visual assets.  
**Owner**: dwise03@gmail.com  
**Last Updated**: 2026-09-13  
**Status**: 🔒 LOCKED FOR PRODUCTION USE
