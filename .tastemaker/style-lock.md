# WISE² Research Dashboard - Style Lock

## Project
WISE² Video Clipper - Research Dashboard UI  
**Status**: Active  
**Updated**: 2026-09-29  

## Color Contract

### Brand Palette (WISE² Locked)
- **Primary**: Cyan #00D9FF
- **Accent**: Neon Green #00FF7F
- **Secondary**: Gold #C4A369
- **Base**: Navy #050607
- **Neutral**: White #FFFFFF

### Legal Pairings (Verified)
- **Text Safe (≥4.5:1)**:
  - Cyan text on Navy background ✓
  - Gold text on Navy background ✓
  - Neon text on Navy background ✓
  - White text on Navy background ✓

- **UI Safe (≥3.0:1)**:
  - Cyan accent buttons on Navy ✓
  - Gold badges on Navy ✓
  - Neon status indicators ✓

## Visual System

### Density & Spacing
- **Card Padding**: 24px (6 * 4px)
- **Section Padding**: 32px (vertical), 24px (horizontal)
- **Gap Between Cards**: 16px
- **Element Gap**: 8-12px
- **Corner Radius**: 12px (cards), 8px (inputs), 20px (large sections)

### Typography
- **Hero/Headers**: 28-32px, weight 700 (bold)
- **Section Heads**: 20-24px, weight 600 (semibold)
- **Body**: 14-16px, weight 400 (regular)
- **Labels**: 12-13px, weight 500 (medium)
- **Font**: System sans-serif (no serifs)

### Motion & Animation
- **Transition Speed**: 200-300ms (standard), 400-500ms (hero)
- **Easing**: cubic-bezier(0.25, 0.46, 0.45, 0.94) for smooth
- **Stagger**: 50-80ms per item
- **Hover Effects**: scale(1.02) + shadow increase
- **Loading States**: Gradient shimmer pulse
- **Default Engine**: GSAP + ScrollTrigger for animations

### Depth & Elevation
- **Shadow Subtle**: 0 2px 8px rgba(0,217,255,0.1)
- **Shadow Medium**: 0 8px 24px rgba(0,217,255,0.15)
- **Shadow Interactive**: 0 12px 32px rgba(0,217,255,0.2)
- **Glassmorphism**: backdrop-blur-md + bg-opacity-10

## Component Patterns

### Metric Cards
- Animated counter on mount
- Hover: scale(1.02) + enhanced shadow
- Value highlighted in brand color
- Progress bar with gradient fill

### Status Badges
- Animated pulse on state change
- Color-coded per status (cyan/neon/gold/green)
- Icon + label with smooth transitions

### Buttons
- Hover: scale(1.05) + glow effect
- Active: scale(0.98)
- Loading: spinner animation
- Focus: outline ring in brand color

### Progress Bars
- Gradient fill: Cyan → Neon
- Smooth width animation (300ms)
- Animated shimmer on loading

### Tabs
- Active indicator with smooth slide
- Hover: color brightening
- Content fade-in on switch

## Dark Mode
**Not applicable**: WISE² Dashboard locked to dark mode only.

## Assets
- **Icons**: Lucide icons with smooth transitions
- **Colors**: WISE² brand fixed, no customization
- **No Photos/Illustrations**: Dashboard focused on data visualization

## Interactions

### Hover States
- Cards: Border brightening + shadow increase
- Buttons: Scale + glow
- Metrics: Slight lift animation

### Loading States
- Skeleton cards with shimmer pulse
- Spinner with rotation animation
- Gradual opacity fade-in

### State Changes
- Status badges: Pulse animation
- Data updates: Staggered fade-in
- Clip counts: Counter animation

## Quality Gates
✓ Show-don't-tell: Visualizations + metrics > text  
✓ Visual hierarchy: Clear weight/color differentiation  
✓ Restraint: No excessive motion, all purposeful  
✓ Color contrast: All pairings verified  
✓ Variety: Multiple interaction patterns  
✓ Motion purpose: All animations serve clarity/trust  

---
**Mood**: Technical + Premium  
**Audience**: Video creators, data analysts  
**Tone**: Professional, fast, trustworthy  
