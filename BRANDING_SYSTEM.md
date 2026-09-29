# WISE² BRANDING SYSTEM
## Complete Visual Identity & Design Guidelines

**Version**: 1.0  
**Last Updated**: July 21, 2026  
**Status**: 🟡 SPECIFICATION

---

## BRAND PHILOSOPHY

**WISE² = Organized Chaos**

A premium, enterprise-grade platform that combines:
- **Military-grade precision** (reliability, security, performance)
- **Creative brilliance** (design, innovation, expression)
- **Cyberpunk aesthetic** (edge, tech, future-forward)
- **Professional polish** (enterprise-ready, accessible)

**Visual Personality**: Dark, bold, neon-accented, high-contrast, cyberpunk-inspired creative command center.

---

## COLOR PALETTE

### Primary Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Neon Lime** | `#39FF14` | rgb(57, 255, 20) | Primary accent, CTAs, highlights |
| **Neon Cyan** | `#00D9FF` | rgb(0, 217, 255) | Secondary accent, info, data |
| **Black** | `#000000` | rgb(0, 0, 0) | Pure black for deep background |
| **Dark Steel** | `#0a0a0a` | rgb(10, 10, 10) | Primary background |
| **Steel Gray** | `#1a1a1a` | rgb(26, 26, 26) | Secondary background |
| **Chrome** | `#e0e0e0` | rgb(224, 224, 224) | Text, borders |

### Secondary Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Discord Blue** | `#5865F2` | Discord integrations |
| **Success Green** | `#00cc00` | Success states, confirmations |
| **Warning Yellow** | `#ffcc00` | Warnings, caution |
| **Error Red** | `#ff3333` | Errors, critical alerts |
| **Info Purple** | `#a78bfa` | Information, details |

### Gradients

```css
/* Primary Gradient */
linear-gradient(135deg, #39FF14 0%, #00D9FF 100%)

/* Dark Gradient */
linear-gradient(180deg, #0a0a0a 0%, #000000 100%)

/* Neon Glow Gradient */
radial-gradient(circle, #39FF14 0%, transparent 70%)

/* Cyberpunk Gradient */
linear-gradient(45deg, #000000, #1a1a1a, #39FF14)
```

---

## TYPOGRAPHY

### Font Stack

```css
/* Headlines */
font-family: 'Chrome', 'Orbitron', 'Space Mono', monospace;

/* Body Text */
font-family: 'Rajdhani', 'Inter', sans-serif;

/* Code/Monospace */
font-family: 'Space Mono', 'Courier New', monospace;
```

### Font Sizes & Weights

| Size | Weight | Usage | Example |
|------|--------|-------|---------|
| **H1** | 3.5rem | 900 | Page titles, hero |
| **H2** | 2.5rem | 700 | Section headers |
| **H3** | 1.75rem | 700 | Subsections |
| **H4** | 1.25rem | 600 | Component titles |
| **Body** | 1rem | 400 | Normal text |
| **Small** | 0.875rem | 400 | Captions, metadata |
| **Tiny** | 0.75rem | 500 | Labels, badges |

### Line Heights

```css
/* Headlines */
line-height: 1.2;

/* Body */
line-height: 1.6;

/* Compact */
line-height: 1.4;
```

---

## SPACING SYSTEM

### Spacing Scale

```
0px
4px    (xs)
8px    (sm)
12px   (md)
16px   (lg)
24px   (xl)
32px   (2xl)
48px   (3xl)
64px   (4xl)
96px   (6xl)
128px  (8xl)
```

### Usage

- **xs (4px)**: Icon spacing, badge padding
- **sm (8px)**: Input padding, small gaps
- **md (12px)**: Button padding, section gaps
- **lg (16px)**: Card padding, container gaps
- **xl (24px)**: Section spacing
- **2xl+ (32px+)**: Major sections

---

## COMPONENT SPECIFICATIONS

### Buttons

```css
/* Primary Button */
background: #39FF14;
color: #000000;
padding: 12px 24px;
border-radius: 8px;
font-weight: 700;
font-size: 14px;
box-shadow: 0 0 20px rgba(57, 255, 20, 0.3);

/* Hover */
filter: brightness(1.15);
box-shadow: 0 0 30px rgba(57, 255, 20, 0.6);

/* Active */
transform: scale(0.98);

/* Secondary Button */
background: transparent;
border: 2px solid #39FF14;
color: #39FF14;

/* Disabled */
opacity: 0.5;
cursor: not-allowed;
```

### Cards

```css
/* Standard Card */
background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
border: 1px solid rgba(57, 255, 20, 0.2);
border-radius: 12px;
padding: 24px;
backdrop-filter: blur(10px);

/* Hover */
border-color: rgba(57, 255, 20, 0.4);
box-shadow: 0 8px 32px rgba(57, 255, 20, 0.15);
```

### Input Fields

```css
/* Text Input */
background: #0a0a0a;
border: 1px solid #333333;
border-radius: 8px;
padding: 12px 16px;
color: #e0e0e0;
font-size: 14px;

/* Focus */
border-color: #39FF14;
box-shadow: 0 0 0 3px rgba(57, 255, 20, 0.1);

/* Error */
border-color: #ff3333;
box-shadow: 0 0 0 3px rgba(255, 51, 51, 0.1);
```

### Badges

```css
/* Default Badge */
background: rgba(57, 255, 20, 0.2);
color: #39FF14;
border: 1px solid rgba(57, 255, 20, 0.4);
padding: 4px 8px;
border-radius: 12px;
font-size: 12px;
font-weight: 600;

/* Success */
background: rgba(0, 204, 0, 0.2);
color: #00cc00;
border-color: rgba(0, 204, 0, 0.4);

/* Error */
background: rgba(255, 51, 51, 0.2);
color: #ff3333;
border-color: rgba(255, 51, 51, 0.4);
```

### Modals

```css
/* Modal Overlay */
background: rgba(0, 0, 0, 0.8);
backdrop-filter: blur(8px);

/* Modal Content */
background: #0a0a0a;
border: 1px solid #39FF14;
border-radius: 16px;
box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5),
            0 0 100px rgba(57, 255, 20, 0.1);
```

---

## ANIMATIONS & MOTION

### Transition Speeds

| Name | Duration | Usage |
|------|----------|-------|
| **Quick** | 100ms | Micro-interactions |
| **Smooth** | 300ms | Hover, focus states |
| **Moderate** | 500ms | Modal openings |
| **Slow** | 800ms | Page transitions |

### Animation Presets

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Pulse (Neon Glow) */
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 6px rgba(57, 255, 20, 0.35); }
  50% { box-shadow: 0 0 20px rgba(57, 255, 20, 0.7); }
}

/* Glow Flicker */
@keyframes glowFlicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
    text-shadow: 0 0 10px rgba(57, 255, 20, 0.5);
  }
  20%, 24%, 55% {
    text-shadow: 0 0 20px rgba(57, 255, 20, 0.9);
  }
}

/* Matrix Rain */
@keyframes matrixRain {
  0% { transform: translateY(-100%); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(100%); opacity: 0; }
}
```

---

## ICON SYSTEM

### Icon Library: Lucide Icons

- **Set**: Lucide React icons
- **Sizes**: 16px, 24px, 32px, 48px
- **Stroke Width**: 2px (standard), 1.5px (small)
- **Color**: Inherit from parent (use `currentColor`)

### Icon Usage

```jsx
<Icon name="heart" size={24} className="text-accent-lime" />
```

### Custom SVG Icons

Location: `/design/icons/svg/`

**Requirements**:
- Viewbox: `0 0 24 24`
- Stroke width: 2
- No fill (use stroke only)
- Rounded corners

---

## LOGO SPECIFICATIONS

### Primary Logo

- **Format**: SVG, PNG (all sizes)
- **Sizes**: 16x16, 32x32, 64x64, 128x128, 256x256, 512x512
- **Color**: Lime (#39FF14) on dark background
- **Usage**: Primary branding, headers, nav

### Secondary Logo

- **Format**: Icon mark only
- **Sizes**: 16x16, 32x32, 64x64, 128x128
- **Usage**: Favicons, app icons, social

### Wordmark

- **Font**: Chrome, Orbitron
- **Style**: Bold, uppercase
- **Format**: SVG
- **Usage**: Alternative to full logo

---

## WALLPAPERS & BACKGROUNDS

### Desktop Wallpapers

**Specifications**:
- Ultra HD: 3840×2160 (4K)
- 1440p: 2560×1440
- 1080p: 1920×1080
- Aspect ratios: 16:9, 16:10, 21:9

**Themes**:
- Matrix Rain (cyberpunk)
- Neon Grid (tech)
- Abstract Waves (modern)
- Code Forest (developer)
- Minimalist Gradient (clean)

### Mobile Wallpapers

**Specifications**:
- iPhone: 1125×2436 (6.1"), 1284×2778 (6.7")
- Android: 1440×3120 (various)

### Dashboard Backgrounds

- Command center aesthetic
- Subtle grid pattern
- Neon accent glows
- Animated elements (optional)

---

## SOCIAL GRAPHICS

### Twitter/X

**Profile Picture**: 400×400px
**Header**: 1500×500px
**Tweet Image**: 1024×512px

### LinkedIn

**Profile Picture**: 400×400px
**Banner**: 1200×627px
**Post Image**: 1200×627px

### GitHub

**Social Preview**: 1280×640px
**Profile README**: Markdown card

### Discord

**Server Icon**: 512×512px
**Server Banner**: 960×540px or 1920×1080px

---

## DISCORD ASSETS

### Server Branding

- **Icon**: 512×512px, square
- **Banner**: 960×540px or 1920×1080px
- **Splash**: 1920×1080px (for boost)

### Channel Icons

- **Size**: 512×512px
- **Format**: PNG with transparency
- **Style**: Lucide-based custom SVGs

### Role Icons

- **Size**: 256×256px
- **Format**: PNG with transparency
- **Colors**: Role-specific or neon lime

### Emoji Pack

- **Standard**: 128×128px
- **Animated**: 128×128px GIF
- **Theme**: Cyberpunk, technical, gaming

### Sticker Pack

- **Size**: 320×320px
- **Format**: PNG with transparency
- **Set**: 20-30 stickers
- **Theme**: Mascots, reactions, expressions

---

## ACCESSIBILITY

### Color Contrast

**WCAG AA Compliant**:
- Text on backgrounds: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum

### Text Sizes

**Minimum**: 12px (captions)
**Body**: 14-16px
**Mobile**: 16px minimum for clickable elements

### Dark Mode Support

- ✅ All interfaces support dark mode
- ✅ No forced light mode
- ✅ Respects prefers-color-scheme

### Keyboard Navigation

- ✅ All interactive elements reachable via Tab
- ✅ Focus indicators visible
- ✅ Skip to main content link

---

## ASSET LOCATIONS

### Repository Structure

```
design/
├── logos/
│   ├── wise2-primary.svg
│   ├── wise2-secondary.svg
│   ├── wise2-icon.svg
│   └── [all sizes in PNG]
├── icons/
│   ├── svg/
│   └── png/
├── graphics/
│   ├── wallpapers/
│   ├── backgrounds/
│   ├── illustrations/
│   └── animations/
├── social/
│   ├── twitter/
│   ├── linkedin/
│   ├── github/
│   └── discord/
├── discord/
│   ├── server-icon.png
│   ├── server-banner.png
│   ├── channel-icons/
│   ├── role-icons/
│   ├── emojis/
│   └── stickers/
├── templates/
│   ├── email/
│   ├── pdf/
│   └── documents/
└── brand-guidelines.md
```

---

## IMPLEMENTATION CHECKLIST

### Design Systems
- [ ] Color tokens (CSS variables)
- [ ] Typography scale
- [ ] Spacing scale
- [ ] Shadow/elevation system
- [ ] Animation library
- [ ] Component library

### Assets
- [ ] Logos (all formats/sizes)
- [ ] Icons (SVG & PNG)
- [ ] Wallpapers (desktop & mobile)
- [ ] Social graphics
- [ ] Discord assets
- [ ] Email templates

### Code
- [ ] Tailwind config
- [ ] CSS variables file
- [ ] Component library
- [ ] Animation presets
- [ ] Responsive breakpoints

### Documentation
- [ ] Brand guidelines (PDF)
- [ ] Design system docs
- [ ] Component examples
- [ ] Usage guidelines
- [ ] Asset download links

---

## SUCCESS METRICS

✅ **Brand Consistency**
- 100% of interfaces use brand colors
- All typography follows scale
- All animations use standard timing

✅ **Accessibility**
- 100% WCAG AA compliance
- All text readable
- All interactive elements accessible

✅ **Quality**
- All assets high-resolution
- Consistent across platforms
- Professional presentation

✅ **User Experience**
- Delightful animations
- Clear visual hierarchy
- Intuitive interactions

---

## CONCLUSION

WISE² Branding System provides:
- **Consistent Identity**: Unified look across all products
- **Professional Quality**: Enterprise-grade assets
- **Developer-Friendly**: Easy-to-use design tokens
- **Accessible**: WCAG AA compliant
- **Scalable**: Supports all platforms & devices
- **Cyberpunk Edge**: Memorable, distinctive brand

This system is the foundation for all WISE² visual experiences.
