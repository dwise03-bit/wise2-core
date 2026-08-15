# WISE² Design System
## Enterprise Command Center Aesthetic

**Version**: 1.0  
**Last Updated**: 2026-07-19  
**Status**: ✅ Production Ready

---

## 🎨 Brand Identity

### Color Palette

#### Core Colors
| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Pure Black** | #050505 | rgb(5, 5, 5) | Primary background, command center aesthetic |
| **Neon Green** | #39FF14 | rgb(57, 255, 20) | Primary accent, buttons, CTAs, glow effects |
| **Chrome** | #BFC4C9 | rgb(191, 196, 201) | Secondary accent, details, borders |
| **Dark Surface** | #0D1117 | rgb(13, 17, 23) | Card backgrounds, elevated surfaces |
| **Dark Surface 2** | #131922 | rgb(19, 25, 34) | Alternative surface color |

#### Text Colors
| Level | Hex | Usage |
|-------|-----|-------|
| **Primary** | #FFFFFF | Main text, headings |
| **Secondary** | #C9CED6 | Supporting text, descriptions |
| **Muted** | #8D98A5 | Disabled text, hints, metadata |

#### Status Colors
| Status | Hex | Usage |
|--------|-----|-------|
| **Success** | #22C55E | Positive feedback, available, active |
| **Warning** | #F59E0B | Attention needed, caution |
| **Danger** | #E53935 | Errors, destructive actions |
| **Info** | #0094FF | Informational messages |

---

## 📐 Typography

### Font Families

```css
/* Display Headings - Enterprise Authority */
--wise-font-display: 'Beyond The Mountains', sans-serif;

/* Body Text - Readable, Professional */
--wise-font-sans: 'Rajdhani', 'Inter', sans-serif;

/* Code & Monospace */
--wise-font-mono: 'Fira Code', monospace;
```

### Type Scale

| Size | CSS Variable | Pixels | Usage |
|------|--------------|--------|-------|
| **7XL** | `--wise-text-7xl` | 95px | Hero headlines |
| **6XL** | `--wise-text-6xl` | 76px | Main page titles |
| **5XL** | `--wise-text-5xl` | 61px | Section headers |
| **4XL** | `--wise-text-4xl` | 49px | Subsection headers |
| **3XL** | `--wise-text-3xl` | 39px | Large headers |
| **2XL** | `--wise-text-2xl` | 31px | Medium headers |
| **XL** | `--wise-text-xl` | 25px | Small headers |
| **LG** | `--wise-text-lg` | 20px | Lead text |
| **Base** | `--wise-text-base` | 16px | Body text (default) |
| **SM** | `--wise-text-sm` | 13px | Supporting text |
| **XS** | `--wise-text-xs` | 10px | Labels, metadata |

### Line Heights

```css
--wise-leading-none: 1;
--wise-leading-tight: 1.2;
--wise-leading-base: 1.5;
--wise-leading-relaxed: 1.75;
--wise-leading-loose: 2;
```

---

## 🎯 Components

### Buttons

#### Primary Button (Neon Green Accent)
```css
background: var(--wise-primary); /* #39FF14 */
color: #050505;
padding: var(--wise-space-3) var(--wise-space-6);
border-radius: var(--wise-radius-sm);
box-shadow: 0 0 20px rgba(57, 255, 20, 0.4);
transition: all var(--wise-duration-base) var(--wise-easing-out);

&:hover {
  background: var(--wise-primary-hover);
  box-shadow: 0 0 30px rgba(57, 255, 20, 0.6);
}
```

#### Secondary Button (Chrome Accent)
```css
background: transparent;
color: #BFC4C9;
border: 1px solid #BFC4C9;
padding: var(--wise-space-3) var(--wise-space-6);
border-radius: var(--wise-radius-sm);
transition: all var(--wise-duration-base) var(--wise-easing-out);

&:hover {
  background: rgba(191, 196, 201, 0.1);
  border-color: #FFFFFF;
  color: #FFFFFF;
}
```

#### Ghost Button (Minimal)
```css
background: transparent;
color: #C9CED6;
border: none;
padding: var(--wise-space-2) var(--wise-space-4);
border-radius: var(--wise-radius-xs);
transition: all var(--wise-duration-base) var(--wise-easing-out);

&:hover {
  background: rgba(57, 255, 20, 0.1);
  color: var(--wise-primary);
}
```

### Cards & Surfaces

```css
background: var(--wise-surface);
border: 1px solid var(--wise-border-medium);
border-radius: var(--wise-radius-base);
padding: var(--wise-space-6);
box-shadow: var(--wise-shadow-small);
backdrop-filter: var(--wise-backdrop-blur-md);
transition: all var(--wise-duration-base) var(--wise-easing-out);

&:hover {
  border-color: var(--wise-border-strong);
  box-shadow: var(--wise-shadow-medium);
}
```

### Inputs & Forms

```css
background: var(--wise-surface);
border: 1px solid var(--wise-border-medium);
color: var(--wise-text-primary);
padding: var(--wise-space-3) var(--wise-space-4);
border-radius: var(--wise-radius-sm);
font-family: var(--wise-font-sans);
font-size: var(--wise-text-base);
transition: all var(--wise-duration-base) var(--wise-easing-out);

&:focus {
  outline: none;
  border-color: var(--wise-primary);
  box-shadow: 0 0 0 3px rgba(57, 255, 20, 0.1);
}

&:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Navigation

```css
background: rgba(5, 5, 5, 0.95);
border-bottom: 1px solid rgba(57, 255, 20, 0.3);
backdrop-filter: blur(10px);
padding: var(--wise-space-4);

a {
  color: #C9CED6;
  transition: all var(--wise-duration-base) var(--wise-easing-out);
  
  &:hover {
    color: var(--wise-primary);
    text-shadow: 0 0 10px rgba(57, 255, 20, 0.5);
  }
}
```

---

## 🎬 Animations & Interactions

### Animation Durations

```css
--wise-duration-fast: 150ms;      /* Micro interactions */
--wise-duration-base: 200ms;      /* Standard transitions */
--wise-duration-slow: 300ms;      /* Deliberate transitions */
--wise-duration-slower: 500ms;    /* Prominent animations */
--wise-duration-slowest: 1000ms;  /* Page transitions */
```

### Easing Functions

```css
--wise-easing-in: cubic-bezier(0.4, 0, 1, 1);         /* Ease in */
--wise-easing-out: cubic-bezier(0, 0, 0.2, 1);       /* Ease out */
--wise-easing-in-out: cubic-bezier(0.4, 0, 0.2, 1);  /* Smooth */
--wise-easing-sharp: cubic-bezier(0.4, 0, 0.6, 1);   /* Quick, responsive */
```

### Common Transitions

```css
/* Button hover */
transition: all 200ms cubic-bezier(0, 0, 0.2, 1);

/* Glow effect */
box-shadow: 0 0 20px rgba(57, 255, 20, 0.4);
transition: box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1);

/* Fade in */
opacity: 0;
animation: fadeIn 300ms ease-out forwards;
```

---

## 📏 Spacing

### Base Unit: 4px

All spacing derived from 4px increment for perfect alignment.

```css
--wise-space-0: 0px;
--wise-space-1: 4px;
--wise-space-2: 8px;
--wise-space-3: 12px;
--wise-space-4: 16px;
--wise-space-5: 20px;
--wise-space-6: 24px;
--wise-space-8: 32px;
--wise-space-12: 48px;
--wise-space-16: 64px;
--wise-space-24: 96px;
```

### Spacing Guidelines

| Element | Padding | Margin | Usage |
|---------|---------|--------|-------|
| **Button** | 12px 24px | 0 | Primary CTAs |
| **Card** | 24px | 16px | Content containers |
| **Input** | 12px 16px | 0 | Form fields |
| **Section** | 48px | 0 | Major sections |
| **Heading** | 0 | 0 24px | Section titles |

---

## 🌗 Dark Mode

WISE² is **dark-first design**. All colors optimized for dark backgrounds.

### Contrast Ratios

- **Text on Background**: 7:1+ (WCAG AAA)
- **Accent on Background**: 5:1+ (WCAG AA)
- **Borders**: 3:1+ (visible but subtle)

### Light Mode Support (Future)

If light mode is needed:
1. Invert background colors (black → white)
2. Swap text colors (white → black)
3. Reduce accent opacity
4. Increase border contrast

---

## 🎓 Usage Guide

### CSS Variables Pattern

**Always use CSS variables, never hardcode colors:**

```css
/* ✅ CORRECT */
background: var(--wise-primary);
color: var(--wise-text-primary);
box-shadow: var(--wise-shadow-medium);

/* ❌ WRONG */
background: #39FF14;
color: #FFFFFF;
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
```

### Component Structure

```tsx
/* Component with design tokens */
export function Button({ children, variant = 'primary' }) {
  return (
    <button className={`btn btn-${variant}`}>
      {children}
    </button>
  );
}
```

```css
/* Styles using tokens */
.btn {
  padding: var(--wise-space-3) var(--wise-space-6);
  font-family: var(--wise-font-sans);
  border-radius: var(--wise-radius-sm);
  transition: all var(--wise-duration-base) var(--wise-easing-out);
}

.btn-primary {
  background: var(--wise-primary);
  color: #050505;
  box-shadow: 0 0 20px rgba(57, 255, 20, 0.4);
}

.btn-primary:hover {
  background: var(--wise-primary-hover);
  box-shadow: 0 0 30px rgba(57, 255, 20, 0.6);
}
```

---

## 🚀 Implementation Checklist

### Before Launch

- [ ] All colors use CSS variables (no hardcoded hex)
- [ ] All spacing uses `--wise-space-*` scale
- [ ] All animations use `--wise-duration-*` + `--wise-easing-*`
- [ ] All shadows use `--wise-shadow-*` presets
- [ ] All border-radius uses `--wise-radius-*` scale
- [ ] All typography uses defined scales
- [ ] Buttons have proper focus states
- [ ] Forms have error states with proper colors
- [ ] Transitions are smooth (200-300ms)
- [ ] Glow effects use primary brand color
- [ ] Mobile responsive (tested on 320px, 768px, 1280px)
- [ ] Contrast ratios WCAG AA minimum

---

## 📦 Files

| File | Purpose |
|------|---------|
| `packages/design-system/design-tokens.css` | Source of truth for all design tokens |
| `apps/website/app/styles/globals.css` | Neon green glow effects & polish |
| `apps/studio/styles/design-tokens.css` | Studio-specific token overrides |
| `.claude/skills/design-system/` | Design system skill (token architecture) |

---

## 🔄 Updating Design Tokens

To update design tokens:

1. Edit `packages/design-system/design-tokens.css`
2. Update both apps to import the latest tokens
3. Test on all breakpoints (mobile, tablet, desktop)
4. Verify contrast ratios (WebAIM tool)
5. Update this documentation

---

## ✨ Best Practices

### DO ✅
- Use semantic token names (`--wise-primary` not `--green-1`)
- Define tokens at `:root` level
- Document token purposes in comments
- Test color contrast with WCAG checker
- Use glassmorphism sparingly (performance impact)
- Keep animations under 300ms (feels responsive)

### DON'T ❌
- Hardcode colors in components
- Create new colors without updating design system
- Use arbitrary shadow values
- Create animations longer than 500ms
- Ignore contrast ratio requirements
- Mix different spacing units
- Use more than 3 different fonts per page

---

## 📞 Support

For design system questions or updates:
1. Check this documentation first
2. Reference `packages/design-system/design-tokens.css`
3. Review `.claude/skills/design-system/references/`
4. Contact design team for new token requests

---

**WISE² Design System v1.0 - Enterprise Grade, Production Ready** 🚀
