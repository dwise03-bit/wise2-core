# Cherry Count™ — Design System

Visual source of truth: approved Cherry Count marketing visuals (Aug 2026).

---

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `jet-black` | `#050505` | Page background |
| `soft-black` | `#111111` | Card backgrounds |
| `dark-plum` | `#17081B` | Deep accent panels |
| `bubblegum-pink` | `#FF5FA2` | Secondary accent, glows |
| `hot-pink` | `#FF2E88` | Primary CTA, highlights |
| `cherry-red` | `#C91C4A` | Icons, badges |
| `royal-plum` | `#7A2EFF` | Gradient accent |
| `lavender` | `#C98BFF` | Soft highlights |
| `white` | `#FFFFFF` | Primary text |
| `chrome` | `#C0C0C0` | Metallic details |

---

## Typography

| Role | Font | Usage |
|------|------|-------|
| Editorial headlines | Playfair Display (serif) | Marketing, slide titles |
| UI / body | DM Sans (sans-serif) | Interface, body text |
| Accent script | Great Vibes (script) | Sparingly — taglines, accents only |

**Rules:**
- Never sacrifice readability for style
- All-caps for major marketing headlines
- Sentence case for UI labels

---

## Visual Language

- **Dark glass panels** — `backdrop-blur` + semi-transparent black + thin pink border
- **Hot-pink glow** — `box-shadow: 0 0 40px rgba(255, 46, 136, 0.25)`
- **Rounded cards** — `border-radius: 16px` (mobile), `20px` (desktop)
- **Cherry motifs** — 🍒 emoji sparingly; cherry icon in logo
- **Chrome/silver** — borders, dividers, metallic accents
- **Editorial photography** — fashion/streetwear energy in marketing
- **Touch targets** — minimum 44px

---

## Component Patterns

### Glass Card
```css
background: rgba(17, 17, 17, 0.72);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 95, 162, 0.18);
border-radius: 16px;
```

### Primary Button
```css
background: linear-gradient(135deg, #FF2E88, #C91C4A);
color: #FFFFFF;
border-radius: 9999px;
padding: 12px 24px;
font-weight: 600;
box-shadow: 0 0 24px rgba(255, 46, 136, 0.35);
```

### Stat Card
Large number in hot-pink, label in muted white/60, subtle glow behind.

### Mobile Bottom Nav
Fixed bottom, glass background, center FAB (+) elevated with hot-pink gradient.

---

## Anti-Patterns (Do NOT)

- Generic Tailwind gray dashboard
- Bootstrap-style tables
- Microsoft/corporate blue
- Pink spreadsheet aesthetic
- Shopify admin clone
- Plain white backgrounds in app UI

---

## WISE² Branding Placement

WISE² appears only in:
- Footer: "Powered by WISE² Business Operating System"
- Slide 13 (technology overview)
- AI subheading: "Powered by WISE² Intelligence"
- Settings > About

WISE² uses subdued chrome/silver — never competes with Cherry Count pink.

---

## Responsive Priority

1. iPhone (375–430px)
2. Large iPhone (430px+)
3. iPad
4. Laptop
5. Desktop

Safe area insets respected on mobile. No horizontal overflow.
