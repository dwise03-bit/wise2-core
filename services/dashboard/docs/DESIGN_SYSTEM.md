# DESIGN SYSTEM

**WISE² Enterprise**  
**Version**: 10.0  
**Date**: 2026-07-11

---

## DESIGN LANGUAGE: "ORGANIZED CHAOS"

**Aesthetic**: Industrial + Cyberpunk + Premium Enterprise  
**Approach**: Motion-first design with sophisticated depth  
**Philosophy**: Professional tools that are beautiful to use  

---

## COLOR SYSTEM

### Primary Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| Black | #000000 | 0, 0, 0 | Backgrounds, text, authority |
| Chrome | #E8E8E8 | 232, 232, 232 | Borders, highlights, sophistication |

### Secondary Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| Electric Blue | #00D9FF | 0, 217, 255 | Primary actions, links, focus states |
| Purple | #B300FF | 179, 0, 255 | Secondary actions, emphasis, premium |
| Red | #FF0040 | 255, 0, 64 | Errors, warnings, critical alerts |

### Extended Palette (Semantic)

| Intent | Light | Dark | Usage |
|--------|-------|------|-------|
| Success | #00D966 | #00A349 | Confirmations, positive actions |
| Warning | #FFB800 | #CC9200 | Cautions, pending actions |
| Info | #0099FF | #0066CC | Informational messages |
| Disabled | #606060 | #303030 | Disabled states |

### Color Combinations

**Primary Interactive** (Electric Blue on Black):
- Button background: Electric Blue (#00D9FF)
- Button text: Black (#000000)
- Hover: Darken Electric Blue by 20%
- Active: Darken by 40%

**Secondary Interactive** (Purple on Black):
- Similar hierarchy to primary
- Used for secondary actions
- De-emphasizes when paired with primary

### Dark Mode (Primary)

- Background: Pure Black (#000000)
- Surface: Dark Gray (#0F0F0F)
- Border: Chrome (#E8E8E8) with 20% opacity
- Text: Chrome (#E8E8E8)

### Light Mode (Secondary)

- Background: Off-white (#F5F5F5)
- Surface: White (#FFFFFF)
- Border: Dark Gray (#303030) with 20% opacity
- Text: Dark Gray (#1A1A1A)

---

## TYPOGRAPHY

### Font Stack

**Headings**:
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
font-weight: 700;
letter-spacing: -0.02em;
```

**Body**:
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
font-weight: 400;
letter-spacing: 0em;
```

**Code/Monospace**:
```css
font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Courier New, monospace;
font-weight: 400;
letter-spacing: 0.01em;
```

### Type Scale

| Usage | Size | Line Height | Weight | Letter Spacing |
|-------|------|-------------|--------|-----------------|
| H1 (Hero) | 48px | 1.2 | 700 | -0.02em |
| H2 (Section) | 36px | 1.25 | 700 | -0.02em |
| H3 (Subsection) | 28px | 1.3 | 700 | -0.01em |
| H4 (Component) | 20px | 1.4 | 700 | 0em |
| H5 (Label) | 14px | 1.5 | 600 | 0em |
| Body L | 18px | 1.6 | 400 | 0em |
| Body M | 16px | 1.6 | 400 | 0em |
| Body S | 14px | 1.5 | 400 | 0em |
| Caption | 12px | 1.4 | 400 | 0.01em |

### Font Weights

- **Thin**: 100 (rarely used)
- **Regular**: 400 (body text)
- **Medium**: 500 (emphasis)
- **Semibold**: 600 (labels, navigation)
- **Bold**: 700 (headings)
- **Black**: 900 (rarely used)

---

## SPACING & GRID

### Base Unit: 4px

All spacing is calculated in multiples of 4px for consistency and alignment.

### Spacing Scale

| Name | Value | Usage |
|------|-------|-------|
| xs | 4px | Minimal spacing (icon padding) |
| sm | 8px | Compact spacing (input, badges) |
| md | 16px | Default spacing (sections) |
| lg | 24px | Generous spacing (sections) |
| xl | 32px | Large spacing (containers) |
| 2xl | 48px | Very large spacing (major sections) |
| 3xl | 64px | Massive spacing (page sections) |

### Grid System

- **Desktop**: 12-column grid
- **Tablet**: 6-column grid
- **Mobile**: 4-column grid
- **Gutter**: 16px (8px on each side)
- **Max-width**: 1440px (content area)

---

## BORDER & CORNER RADIUS

### Border Radius

| Name | Value | Usage |
|------|-------|-------|
| none | 0px | Sharp edges |
| sm | 4px | Subtle rounding (inputs) |
| md | 8px | Standard rounding (cards) |
| lg | 12px | Generous rounding (modals) |
| xl | 16px | Large rounding (major containers) |
| full | 9999px | Pills, circles |

### Border Width

| Name | Value | Usage |
|------|-------|-------|
| thin | 1px | Default borders |
| medium | 2px | Emphasis |
| thick | 3px | Focus states |

### Border Color

- **Light**: Chrome #E8E8E8 (20% opacity)
- **Medium**: Chrome #E8E8E8 (40% opacity)
- **Dark**: Chrome #E8E8E8 (80% opacity)

---

## SHADOWS

### Elevation Scale

| Level | Shadow | Usage |
|-------|--------|-------|
| 1 | 0 2px 4px rgba(0,0,0,0.2) | Subtle elevation |
| 2 | 0 4px 8px rgba(0,0,0,0.25) | Component elevation |
| 3 | 0 8px 16px rgba(0,0,0,0.3) | Modal elevation |
| 4 | 0 16px 32px rgba(0,0,0,0.35) | Floating panels |
| 5 | 0 32px 64px rgba(0,0,0,0.4) | Maximum elevation |

### Focus Shadows

```css
box-shadow: 0 0 0 3px #000000, 0 0 0 5px #00D9FF;
```

---

## MOTION & ANIMATION

### Animation Principles

1. **Purpose** — Every animation communicates or clarifies
2. **Subtlety** — Smooth, not jarring
3. **Consistency** — Same type of motion feels related
4. **Performance** — 60fps minimum, no jank

### Duration

| Type | Duration | Usage |
|------|----------|-------|
| Instant | 0ms | Unavoidable |
| Micro | 100ms | Hover states, small elements |
| Short | 200ms | Modals, dropdowns |
| Medium | 300ms | Page transitions |
| Long | 500ms+ | Lazy-loaded content, large changes |

### Easing Functions

```css
/* Standard ease-in-out */
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

/* Ease-out (snappy) */
transition-timing-function: cubic-bezier(0, 0, 0.2, 1);

/* Ease-in (entering) */
transition-timing-function: cubic-bezier(0.4, 0, 1, 1);

/* Spring-like (Framer Motion) */
transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Common Animations

**Hover States**:
- Scale: 1.02x
- Opacity: 90%
- Duration: 200ms
- Easing: ease-out

**Focus States**:
- Ring: 3px Electric Blue
- Scale: 1.01x
- Duration: 150ms

**Transitions**:
- Fade: opacity 300ms
- Slide: transform 300ms
- Expand: scale/height 300ms

---

## COMPONENTS

### Button Component

**Variants**:
- Primary (Electric Blue background)
- Secondary (Purple background)
- Tertiary (Ghost - border only)
- Danger (Red background)

**States**:
- Default
- Hover (scale 1.02)
- Active (scale 0.98)
- Disabled (opacity 50%)
- Loading (spinner)

**Sizes**:
- Small (12px, 32px height)
- Medium (14px, 40px height) ← Default
- Large (16px, 48px height)

### Input Component

**Variants**:
- Text input
- Textarea
- Select dropdown
- Checkbox
- Radio button
- Toggle switch

**States**:
- Default
- Focused (Electric Blue border)
- Error (Red border + message)
- Disabled (gray background)
- Success (Green border)
- Loading (spinner indicator)

### Card Component

**Structure**:
- Padding: 16px (md)
- Border radius: 8px (md)
- Background: Slightly lighter than page
- Shadow: Level 1-2

**Variants**:
- Default card
- Elevated card (shadow level 3)
- Interactive card (hover effect)

### Modal Component

**Structure**:
- Overlay: 50% opacity black
- Panel: Centered, max-width 600px
- Padding: 24px (lg)
- Border radius: 12px (lg)
- Shadow: Level 4
- Close button: Top-right

**Animation**:
- Fade in overlay
- Scale up panel
- Duration: 300ms

### Navigation Component

**Header**:
- Height: 64px
- Sticky to top
- Logo + nav items + user menu

**Sidebar** (where applicable):
- Width: 280px
- Collapsible (width: 80px)
- Smooth transition
- Keyboard accessible

### Waveform Visualization

**Style**:
- Color: Electric Blue (#00D9FF)
- Background: Transparent
- Line width: 2px
- Responsive height

---

## LAYOUT PATTERNS

### Hero Section
- Full width background
- Centered content (max-width 1200px)
- Large heading + subheading
- CTA buttons
- Background: Gradient or image + overlay

### Feature Section
- 3-column grid (desktop)
- Icon + heading + description
- Cards with hover effects
- Section padding: 3xl (64px)

### Stats Section
- 4-column grid (desktop)
- Large number + label
- Background: Contrasting
- Animated counter on scroll

### Testimonial Section
- Carousel or grid (3 visible)
- Quote + author + company
- Star rating
- Shadow and spacing

---

## ACCESSIBILITY STANDARDS

### Color Contrast

- Text on background: 4.5:1 minimum (AA)
- Large text: 3:1 minimum (AA)
- Focus indicators: Always visible

### Keyboard Navigation

- Tab order logical
- Focus visible on all interactive elements
- Escape closes modals/dropdowns
- Enter/Space activates buttons

### Screen Readers

- Semantic HTML (button, link, form, etc.)
- ARIA labels where needed
- Alt text on images
- Form labels associated with inputs

### Motion

- Respect `prefers-reduced-motion` (no auto-play animations)
- No flashing content (> 3 Hz)
- Pause animations on user preference

---

## RESPONSIVE DESIGN

### Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| Mobile | 320px - 639px | Phones |
| Tablet | 640px - 1023px | Tablets |
| Desktop | 1024px - 1439px | Laptops |
| Wide | 1440px+ | Large screens |

### Responsive Patterns

- **Mobile-first** approach
- Stack content vertically on mobile
- 2-column on tablet
- 3-4 column on desktop
- Full width max-width containers

---

## DARK MODE IMPLEMENTATION

### Strategy

1. Dark mode is primary
2. Light mode is secondary option
3. Use CSS variables for color swapping
4. Respect system preference
5. Allow manual toggle

### CSS Variables

```css
:root[data-theme="dark"] {
  --bg-primary: #000000;
  --bg-secondary: #0F0F0F;
  --text-primary: #E8E8E8;
  --text-secondary: #B0B0B0;
  --border-color: rgba(232, 232, 232, 0.2);
  --color-primary: #00D9FF;
}

:root[data-theme="light"] {
  --bg-primary: #F5F5F5;
  --bg-secondary: #FFFFFF;
  --text-primary: #1A1A1A;
  --text-secondary: #505050;
  --border-color: rgba(48, 48, 48, 0.2);
  --color-primary: #0099FF;
}
```

---

## DESIGN TOKENS (Tailwind Config)

All design tokens are implemented in `tailwind.config.ts`:

```javascript
module.exports = {
  theme: {
    colors: {
      black: '#000000',
      chrome: '#E8E8E8',
      blue: '#00D9FF',
      purple: '#B300FF',
      red: '#FF0040',
      // ... more colors
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      '2xl': '48px',
      '3xl': '64px',
    },
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
    },
    // ... more tokens
  }
};
```

---

## COMPONENT LIBRARY

See `packages/ui-components/` for implementation of all components.

### Component Categories

- **Atoms**: Button, Input, Badge, Icon
- **Molecules**: FormField, InputGroup, ButtonGroup
- **Organisms**: Header, Sidebar, Modal, Card
- **Layouts**: Hero, Section, Grid, Container

---

## DESIGN CHECKLIST

Before shipping any UI:

- [ ] Uses design system colors
- [ ] Typography from type scale
- [ ] Spacing in 4px multiples
- [ ] Border radius consistent
- [ ] Shadows from elevation scale
- [ ] Motion subtle and purposeful
- [ ] Dark mode works correctly
- [ ] Responsive at all breakpoints
- [ ] Keyboard navigation works
- [ ] Color contrast 4.5:1+
- [ ] Focus states visible
- [ ] Animated on scroll (lazy)
- [ ] No flashing content

---

## EVOLUTION

### Current (2026)
- Locked design system
- Production components
- Dark mode primary

### Future Enhancements
- Animation library (Framer Motion presets)
- Icon system (Lucide React)
- Component patterns guide
- Design-to-code automation

---

**Owner**: Wise Defense LLC (PROJECT GENESIS)  
**Maintained By**: Design + Development Team  
**Last Updated**: 2026-07-11  
**Implementation**: packages/ui-components/
