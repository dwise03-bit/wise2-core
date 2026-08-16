# WISE² Master Design System - Implementation Roadmap

**Version**: 1.0  
**Status**: Foundation Complete, Phased Rollout In Progress  
**Updated**: 2026-07-28

---

## ✅ COMPLETED COMPONENTS

### Phase 1: Foundation
- [x] Global CSS variables (`apps/website/app/styles/globals.css`)
  - Master color palette (Neon Green, Electric Blue, Black, Steel, Chrome)
  - Typography system (Orbitron, Raleway)
  - Utility classes (.btn-glow-neon, .btn-glow-blue, .border-glow-neon, etc.)
  - Animation system (glows, transitions, micro-interactions)

- [x] PublicNav component (`apps/website/components/navigation/PublicNav.tsx`)
  - Neon Green logo gradient
  - Dark-steel background with Neon Green borders
  - Electric Blue "Get Free AI Audit" secondary button
  - Neon Green "Login/Command Center" primary button
  - Chrome/gray nav links with Neon Green hover

- [x] Design System Showcase (`apps/website/app/design-system/page.tsx`)
  - Color palette reference (8 primary colors)
  - Typography examples
  - Component library preview
  - Implementation guide with CSS variables
  - Key principles documentation

- [x] Audit OS Dashboard
  - Hub page (/audits) — client grid with Neon Green accents
  - Detail page (/audits/[clientId]) — 5-tab interface with color-coded metrics

---

## 🔄 IN PROGRESS / PLANNED

### Phase 2: High-Impact Pages (Next Priority)

#### 1. **Homepage** (`apps/website/app/page.tsx`) — **PRIORITY 1**
**Impact**: Highest visibility, first impression

**Updates Needed**:
- Hero section:
  - Primary CTA ("Get Your Free Business AI Audit") → Neon Green (#39FF14) button
  - Secondary CTA → Electric Blue (#0094FF)
  - Heading colors → White (#FFFFFF)
  - Subheading → Muted Gray (#8D98A5)
  - Background gradient → Dark-steel gradient

- Problem section:
  - "Running on Chaos" text → Keep existing red, add Neon Green accents
  - Problem cards → Steel Panel backgrounds with Neon Green borders
  - CTA button → Neon Green

- How It Works section:
  - Section heading → Orbitron, white
  - Step numbers → Color-coded (Electric Blue, Neon Green, Chrome)
  - Boxes → Gradient backgrounds, subtle green borders
  - Links → Electric Blue

- Stats section:
  - Labels → Muted Gray
  - Numbers → Neon Green for primary, Electric Blue for secondary
  - Background → Enterprise gradient

- Footer:
  - Background → Pure Black or Dark Steel
  - Links → Muted Gray with Neon Green hover
  - Accent line → Neon Green border

**Estimated Effort**: 2-3 hours

---

#### 2. **Consulting Page** (`apps/website/app/consulting/page.tsx`) — **PRIORITY 2**
**Impact**: Key service page, conversion funnel

**Updates Needed**:
- Header → Orbitron title, Muted Gray description
- Service cards → Steel Panel backgrounds, Neon Green borders
- Booking button → Neon Green primary action
- Process steps → Color-coded with icons
- CTA section → Neon Green background or button

**Estimated Effort**: 1-2 hours

---

#### 3. **Pricing Page** (`apps/website/app/pricing/page.tsx`) — **PRIORITY 3**
**Impact**: Conversion funnel, high stakes

**Updates Needed**:
- Pricing cards:
  - Border → Neon Green or Electric Blue
  - Highlight tier → Neon Green border with glow
  - Button → Neon Green for primary, Electric Blue for secondary
- Price text → Neon Green for primary, Electric Blue for secondary
- Feature lists → Checkmarks in Neon Green
- CTA → Neon Green button with glow

**Estimated Effort**: 1-2 hours

---

#### 4. **Component Library** — **PRIORITY 4**
**Files to Update**:
- `components/wise/Hero.tsx` — Hero component used across pages
- `components/wise/Features.tsx` — Feature cards
- `components/wise/Stats.tsx` — Statistics display
- `components/wise/About.tsx` — About section
- Navigation icons — Possibly add Neon Green theme variants

**Updates Needed**:
- Replace all blue (#0094FF, #0055FF) with Neon Green or Electric Blue
- Replace gray text with Muted Gray (#8D98A5)
- Add gradient backgrounds to cards
- Update button colors throughout

**Estimated Effort**: 3-4 hours

---

#### 5. **Footer** (`components/navigation/PublicFooter.tsx`) — **PRIORITY 5**
**Impact**: Every page

**Updates Needed**:
- Background → Pure Black
- Text → Chrome/Muted Gray
- Links → Electric Blue with Neon Green hover
- Accent line/border → Neon Green
- Logo → Neon Green gradient

**Estimated Effort**: 1 hour

---

### Phase 3: Additional Pages

#### All Other Pages
- `/audit` — Free audit page
- `/platform` — Platform overview
- `/sound-labs` — Sound Labs promo
- `/powered-businesses` — Case studies
- `/about` — About page
- `/contact` — Contact form
- `/status-report` — Status report
- Landing pages and marketing pages

**Strategy**: Apply consistent pattern:
1. Primary CTA → Neon Green with glow
2. Secondary CTA/Links → Electric Blue
3. Backgrounds → Dark-steel gradient
4. Text → White/Chrome/Muted Gray hierarchy
5. Borders → Neon Green with transparency
6. Cards → Gradient backgrounds, soft shadows

**Estimated Effort**: 8-12 hours total

---

## 📋 IMPLEMENTATION CHECKLIST

### Colors to Replace
```
SEARCH & REPLACE GUIDE:

- Blue (#0094FF, #0055FF, #003399) → Use Electric Blue (#0094FF) for links/secondary, Neon Green (#39FF14) for primary actions
- Red danger states → Keep #E53935
- Green success states → #22C55E
- Gray text → #8D98A5 (Muted Gray) for secondary, #FFFFFF for primary
- Dark backgrounds → #050505 (Black), #0B0B0B (Dark Steel), #1A1A1A (Steel Panel)
- Borders → rgba(57, 255, 20, 0.2) to rgba(57, 255, 20, 0.5) (Neon Green with opacity)
```

### Button Pattern
```tsx
// Primary (Neon Green)
className="btn-glow-neon"
style={{
  background: '#39FF14',
  color: '#050505',
  boxShadow: '0 0 20px rgba(57, 255, 20, 0.2)',
}}

// Secondary (Electric Blue)
className="btn-glow-blue"
style={{
  background: '#0094FF',
  color: '#FFFFFF',
  boxShadow: '0 0 20px rgba(0, 148, 255, 0.2)',
}}
```

### Link Pattern
```tsx
// Links
style={{
  color: '#0094FF', // Electric Blue
}}
onMouseEnter={(e) => {
  e.currentTarget.style.color = '#39FF14'; // Neon Green hover
  e.currentTarget.style.textShadow = '0 0 10px rgba(57, 255, 20, 0.5)';
}}
```

### Card Pattern
```tsx
// Enterprise Cards
style={{
  backgroundColor: 'rgba(26, 26, 26, 0.5)', // Steel Panel with transparency
  border: '1px solid rgba(57, 255, 20, 0.2)', // Neon Green border
  background: 'linear-gradient(135deg, #0B0B0B, #1A1A1A)', // Steel gradient
}}
onMouseEnter={(e) => {
  e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.5)';
  e.currentTarget.style.boxShadow = '0 0 20px rgba(57, 255, 20, 0.1)';
}}
```

---

## 🎯 KEY PRINCIPLES TO MAINTAIN

1. **Neon Green (#39FF14) = Action**
   - Primary CTA buttons
   - Key highlights
   - Hover states on important elements
   - Focus rings

2. **Electric Blue (#0094FF) = Navigation**
   - Links
   - Secondary actions
   - Accent elements
   - Alternative CTAs

3. **Black & Steel = Foundation**
   - #050505 (Pure Black) — page backgrounds
   - #0B0B0B (Dark Steel) — card backgrounds
   - #1A1A1A (Steel Panel) — nested cards/panels
   - Gradients between them for depth

4. **Chrome & Gray = Text**
   - #FFFFFF (White) — primary text/headings
   - #BFC4C9 (Chrome) — premium accents
   - #8D98A5 (Muted Gray) — secondary text/labels
   - Hierarchy through color, not just size

5. **Soft Glows = Premium Feel**
   - Box shadows (not harsh drop shadows)
   - Color-matched glows (Neon Green or Blue)
   - Smooth transitions (200-300ms)
   - Micro-interactions on hover

---

## 📊 PROGRESS TRACKING

**Total Pages/Components to Update**: ~30+

| Phase | Category | Completed | Total | % |
|-------|----------|-----------|-------|---|
| 1 | Foundation | 4/4 | 4 | 100% |
| 2 | High-Impact | 0/5 | 5 | 0% |
| 3 | Additional | 0/20+ | 20+ | 0% |
| **TOTAL** | | 4/29+ | 29+ | 14% |

---

## 🚀 DEPLOYMENT STRATEGY

### Immediate (This Sprint)
1. ✅ Global design system foundation
2. ✅ Navigation component
3. ✅ Audit OS dashboard
4. 🔄 Homepage redesign (IN PROGRESS)

### Next Sprint
1. Consulting page
2. Pricing page
3. Component library (Hero, Features, Stats, About)
4. Footer

### Future Sprints
1. All service pages
2. Marketing pages
3. Utility pages
4. Email templates (if applicable)
5. Admin/dashboard refinements

---

## 📝 NOTES

- **Backwards Compatibility**: All changes are additive; existing pages work fine with old colors until explicitly updated
- **No Breaking Changes**: The design system uses CSS variables and utility classes alongside existing styles
- **Phased Approach**: Pages can be updated independently without blocking others
- **Brand Consistency**: By centralizing colors in globals.css, all pages automatically inherit from the source of truth

---

**Next Priority**: Homepage redesign (Phase 2, Step 1)  
**Estimated Total Effort**: 15-20 hours for full rollout  
**Quality Gate**: All pages reviewed for contrast (WCAG AA+), interaction responsiveness, and mobile responsive layout
