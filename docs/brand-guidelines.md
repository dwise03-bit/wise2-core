# WISE² Brand Guidelines v2.0
**STATUS: 🔒 LOCKED 2026-09-13**

## Brand Identity

**Mission**: "Building Empires. Changing Culture. Together."  
**Tagline**: "WISE² UNITED / ONE PLATFORM. REAL BUSINESSES."  
**Tone**: Professional, commanding, forward-thinking, inclusive  

---

## Visual Identity

### Color Palette (LOCKED)

| Color | Hex | Usage | Purpose |
|-------|-----|-------|---------|
| **Dark Navy/Black** | `#050607` | Primary background | Enterprise-grade foundation |
| **Darker Charcoal** | `#0a0f1a` | Secondary background | Depth layers |
| **Bright Cyan** | `#00D9FF` | Primary CTA buttons | Action-forward energy |
| **Gold/Tan** | `#C4A369` | Secondary CTA, accents | Premium elegance |
| **Neon Green** | `#00FF7F` | Status indicators, highlights | Success/active state |
| **Light Gray** | `#D1D5DB` | Body text | High contrast readability |

### CSS Variables (for global sync)

```css
:root {
  --wise-dark: #050607;
  --wise-darker: #0a0f1a;
  --wise-blue: #00D9FF;
  --wise-gold: #C4A369;
  --wise-green: #00FF7F;
  --wise-gray-light: #D1D5DB;
  --wise-gray-dark: #1f2937;
  --wise-bg-light: #f9fafb;
}
```

### Typography

- **Font Family**: System fonts (Segoe UI, -apple-system, BlinkMacSystemFont, sans-serif)
- **Headings**: Uppercase, bold, 0.15em letter-spacing
- **Body**: Clean sans-serif, 14px base, 1.6 line-height
- **Tagline**: Small caps, uppercase, 0.1em letter-spacing

---

## Logo & Wordmark

```
WISE²
BUILD DIFFERENT
```

**Usage Rules**:
- Always pair with "BUILD DIFFERENT" tagline
- Minimum size: 24px
- Color: Use `#00D9FF` for primary, white on dark backgrounds
- Clear space: 1x logo width on all sides

---

## Hero Message (Locked)

```
BUILDING EMPIRES.
CHANGING CULTURE.    [← neon green #00FF7F]
TOGETHER.
```

**Subtext**:
> One platform for software, automation, communications, infrastructure, AI, and real-world results.

---

## Component Styling

### Buttons

| Type | Background | Text Color | Border |
|------|-----------|-----------|--------|
| Primary CTA | `#00D9FF` | `#050607` (dark text) | None |
| Secondary CTA | `#C4A369` | `#050607` | None |
| Status Indicator | rgba(0,255,127,0.1) | `#00FF7F` | 1px `#00FF7F` |

### Cards & Backgrounds

- **Default Card**: `rgba(10, 15, 26, 0.5)` with 1px `rgba(0, 217, 255, 0.2)` border
- **Success Card**: Border-left 4px `#00FF7F`
- **Critical Card**: Border-left 4px `#FF4444`

### Status Bar (Live System Readout)

```
LIVE SYSTEM READOUT
├─ LIVE (neon green)
├─ OPERATING LAYER: ONLINE (neon green)
├─ AUTOMATION LOAD: 72% (neon green metric)
└─ FIELD SIGNAL: STRONG (neon green)
```

---

## Messaging Framework

### Primary Message
"Building Empires. Changing Culture. Together."

### Brand Pillars
1. **Organized Chaos** — Command amid complexity
2. **Real Business Results** — Proof over promises
3. **Connected Systems** — One platform, every part of business
4. **Momentum Never Stops** — 24/7 operations

### Tone Attributes
- ✅ Commanding yet accessible
- ✅ Serious but not corporate
- ✅ Forward-thinking without hype
- ✅ Inclusive (we, together, united)

---

## Applications

### All Digital Experiences
- Homepage headers
- Dashboard backgrounds
- Email templates
- Landing pages
- Admin interfaces

### Brand Assets
- Social media graphics (headers, posts, stories)
- Email marketing templates
- Presentation decks
- Print materials (if applicable)
- Product UI/UX

---

## Implementation Checklist

Every new page/component must:

- [ ] Use dark navy `#050607` as background
- [ ] Use neon green `#00FF7F` for active/success states
- [ ] Use cyan `#00D9FF` for primary CTAs
- [ ] Apply uppercase headers with 0.15em letter-spacing
- [ ] Include "BUILD DIFFERENT" with logo
- [ ] Follow button styling (dark text on cyan/gold CTAs)
- [ ] Test contrast ratios (WCAG AA minimum)
- [ ] Test on light/dark color scheme modes

---

## Design System Sync

**Source of Truth**: This file (`docs/brand-guidelines.md`)  
**Synced To**:
- `assets/design-tokens.json` (JSON token definitions)
- `assets/design-tokens.css` (CSS variables)
- All React/Vue components (via CSS variable inheritance)

**Sync Command**:
```bash
node .claude/skills/brand/scripts/sync-brand-to-tokens.cjs
```

---

## History

| Date | Change | Status |
|------|--------|--------|
| 2026-09-13 | Extracted from wise2.net; locked WISE² v2.0 branding | 🔒 LOCKED |
| 2026-09-13 | Applied to blakkhail launch audit (dark theme) | ✅ Live |

---

**Last Updated**: 2026-09-13  
**Owner**: dwise03@gmail.com  
**Approval**: LOCKED FOR PRODUCTION USE
