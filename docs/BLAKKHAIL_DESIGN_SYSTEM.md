# BLAKKHAIL Design System v2.0

**Project:** BLAKKHAIL (SenCere Creative - Legacy Streetwear Brand)  
**Brand:** Blakk Hail | Est. 1994 | "Take Control • No Apologies"  
**Design Aesthetic:** Premium 4K Hyper-Realistic Cinematic  
**Redesign Date:** 2026-09-15

---

## Brand Identity (Locked)

### Philosophy
BLAKKHAIL is a heritage streetwear brand with 30+ years of authenticity. The new design reflects:
- **Premium quality** over generic templates
- **Cinematic depth** over flat UI
- **Authentic narrative** over tech marketing
- **Cultural respect** over commercial hype

### Color Palette (DO NOT CHANGE)

```
Navy Black:     #050607  (Primary backgrounds, text shadows)
Cyan/Blue:      #00D9FF  (Accent highlights, interactive states)
Neon Green:     #00FF7F  (CTAs, calls-to-action, hover effects)
Gold/Brown:     #C4A369  (Headlines, luxury accents, premium elements)
```

**Usage:**
- Navy: Dark backgrounds, depth shadows, structural elements
- Cyan: Links, hover states, subtle accents
- Neon Green: Primary CTAs ("Shop Collection", "View Cart"), interactive feedback
- Gold: Main headlines, premium value statements, brand emphasis

---

## Visual Language

### Depth & Layering
- **Multiple gradient layers** create cinematic depth (no single flat background)
- **Box shadows** use real opacity (rgba) for premium feel:
  ```css
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 217, 255, 0.2)
  ```
- **Hover transforms** use subtle Y-axis movement (`translateY(-8px)`)
- **Glows** add luxury without overuse (gold/cyan only on premium elements)

### Typography
- **Headline:** Ultra-bold, uppercase, tracked-out (letter-spacing: -0.02em)
- **Body:** Light weight, generous line-height (1.6+), conversational
- **Labels:** Small caps, tracked-wide, gold color
- **Single font family** per section (no mixed serif/sans unless deliberate)

### Micro-Interactions
- **Page load:** Single orchestrated animation (fadeInUp sequence, not scattered tweens)
- **Hover:** Depth lift + glow enhancement (no over-animated bouncing)
- **Scroll:** Reveal on scroll (intersection observer), not auto-playing
- **State change:** Clear visual feedback (color shift, border change, background fill)

---

## Component Architecture

### BlakkhailHero
- **Purpose:** Emotional entry point, brand statement
- **Content:** 4K hero image + centered headline overlay
- **Motion:** Single fadeInUp animation on load (0.8s-1.2s)
- **CTA:** Neon green "Shop Collection" button with glow
- **Mobile:** Full-height on desktop, responsive height on mobile

### BlakkhailProducts
- **Purpose:** Showcase authentic pieces, drive sales
- **Layout:** Responsive grid (1 col mobile, 2 cols tablet, 3-4 cols desktop)
- **Cards:** Image + info, hover lift + glow effect
- **Hover:** Image zoom (scale 1.1), background glow, neon border
- **CTA:** Green button "View", gold price text
- **Vault Logic:** Category-based filtering (tees/hoodies/hats) preserved

### BlakkhailStory
- **Purpose:** Immersive brand narrative
- **Layout:** Split (image left, content right on desktop; stacked on mobile)
- **Image:** 4K photography with subtle gradient overlay
- **Content:** Heritage headline + narrative + 3-value cards
- **Values:** Left-border gold accent, hover indent effect
- **CTA:** Cyan underline link to collection

### BlakkhailHeader
- **Purpose:** Persistent navigation, brand presence
- **Style:** Sticky glass-morphism (black/95 + backdrop blur)
- **Logo:** Small "BH" in gold with subtle glow
- **Nav:** Collection, Story, Culture (social link)
- **CTA:** "Shop" button (neon green on hover)
- **Mobile:** Hamburger menu with dropdown

### BlakkhailFooter
- **Purpose:** Information architecture, social integration
- **Layout:** 4-column grid on desktop (Brand, Shop, Support, Connect)
- **Content:** Links + social, premium footer badge
- **Bottom:** Copyright + legal links
- **Links:** Gray text → cyan on hover

---

## Color Usage Guide

### Do ✅
- Gold headings (premium, authoritative)
- Neon green CTAs (action, urgency)
- Cyan accents (highlights, interactive)
- Navy backgrounds (professional, stable)
- Multiple shadows for depth

### Don't ❌
- Mix WISE² colors (navy different hex, not navy lock)
- Use generic gray buttons (everything has brand color)
- Over-animate (single moments, not constant motion)
- Flatten depth (every section should layer visually)
- Ignore accessibility (sufficient contrast, focus states)

---

## Imagery Requirements (4K)

For best results, provide 4K images at these sizes:

| Section | Recommended Size | Format | Examples |
|---------|------------------|--------|----------|
| Hero | 1920×1080+ | JPG/WebP | Cinematic streetwear shot |
| Products | 800×1000+ | JPG | Clothing on models/flats |
| Story | 1600×900+ | JPG | Heritage/archival aesthetic |
| Cards | 600×600+ | JPG | Product close-ups |

**Asset Path:** `/sencere-assets/blakkhail/` (referenced in components)

---

## Implementation Notes

### Tailwind CSS
- Use custom color values: `style={{ color: '#C4A369' }}` for brand colors
- Responsive classes: `sm:`, `md:`, `lg:` prefixes
- Animation: `animate-[name_duration_easing]` for custom keyframes

### Hover Effects
- Use inline `onMouseEnter`/`onMouseLeave` for dynamic glow/shadow
- Avoid `:hover` in CSS (React state is cleaner)
- Duration: 300ms standard for transitions

### Accessibility
- Alt text on all images (describe content, not "image")
- Keyboard focus visible on links/buttons
- Color not only indicator (add underlines, borders)
- Motion: Respect `prefers-reduced-motion`

---

## Handoff Checklist

- [ ] Read this guide completely
- [ ] Understand brand colors (memorize hex values)
- [ ] Review each component (Hero, Products, Story, Footer)
- [ ] Deploy to staging and verify rendering
- [ ] Test mobile responsiveness
- [ ] Test hover interactions
- [ ] Check image assets exist at `/sencere-assets/blakkhail/`
- [ ] Set up monitoring/alerts on blakkhail.com
- [ ] Document any custom modifications in git commits

---

## Questions?

Refer to:
1. **Code comments** in each component file
2. **BLAKKHAIL_ONBOARDING.md** for deployment/dev setup
3. **Git history** for design decisions (`git log --oneline`)

**Contact:** dwise03@gmail.com (Architecture decisions)  
**Admin:** sencere@wise2.net (Brand strategy)

---

**This design system is locked. Future updates should maintain brand consistency and cinematic aesthetic.**
