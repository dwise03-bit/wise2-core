# WISE² UI/UX AUDIT

**Date:** 2026-07-24  
**Scope:** Website app (30+ pages) + Studio modules + Dashboard  
**Baseline:** Screenshot evidence from user-provided designs  
**Status:** P0/P1 responsive issues identified across multiple pages

---

## CRITICAL FINDINGS (P0)

### 1. Accessibility Violation: userScalable = false
**File:** `/apps/website/app/layout.tsx:11`
**Issue:** Viewport meta tag disables pinch-zoom
```tsx
userScalable: false,  // VIOLATION: WCAG 2.1 Level AAA requires zoom
```
**Impact:** Users cannot zoom on mobile; violates accessibility standards
**Fix:** Change to `userScalable: true`
**Severity:** P0 — Accessibility blocker

---

### 2. Navigation Link Targets Localhost Ports
**File:** `/apps/website/components/wise/Navigation.tsx:13-14`
**Issue:** Links to Studio and Dashboard use hardcoded localhost ports
```tsx
{ href: 'http://localhost:3005', label: 'Studio', external: true },
{ href: 'http://localhost:3002', label: 'Dashboard', external: true },
```
**Impact:** Production website cannot navigate to Studio/Dashboard
**Fix:** Use environment-based URLs (e.g., `process.env.NEXT_PUBLIC_STUDIO_URL`)
**Severity:** P0 — Functionality broken in production

---

## HIGH-PRIORITY ISSUES (P1)

### 3. Mobile Navigation Doesn't Use Bottom Tab Bar
**File:** `/apps/website/components/wise/Navigation.tsx:80-100`
**Issue:** Mobile menu is a drawer/hamburger, not bottom navigation
**Current:** Hamburger menu covering ~40% of mobile viewport
**Best Practice:** Bottom nav with ≤5 items for easy thumb access
**Impact:** Poor UX on mobile; primary navigation hard to access
**Fix:** Implement bottom tab navigation for mobile
**Severity:** P1 — Mobile UX significantly degraded

---

### 4. Fixed Navigation Height Not Accounted For
**File:** `/apps/website/app/layout.tsx:62-66`
**Issue:** Navigation is `fixed w-full top-0` but pages don't have padding-top
```tsx
<div className="min-h-screen flex flex-col">
  <main className="flex-1">
    {children}
  </main>
</div>
```
**Impact:** Page content starts under navigation; first content is hidden
**Fix:** Add `pt-20` or `pt-[80px]` to main element
**Severity:** P1 — Content obscured on every page

---

### 5. Chat Widget Collision Detection Missing
**File:** `/apps/website/app/layout.tsx:69`
**Issue:** ChatWidgetWrapper placed inside flex container but no safe-area-aware positioning
**Current:** Widget sits at bottom-right but may overlap:
  - Mobile bottom nav (when implemented)
  - Form submit buttons
  - Content near bottom edge
**Impact:** Chat widget blocks interactive elements
**Fix:** Implement safe-area insets, push above bottom nav on mobile
**Severity:** P1 — Blocks user interaction

---

### 6. Max-Width Container Inconsistent Across Pages
**File:** Multiple pages use different max-width patterns
**Issue:** Some pages use `max-w-7xl` (80rem), others `max-w-6xl`, some full-width
**Current Pattern:** `<div className="max-w-7xl mx-auto px-4">` (line 29)
**Impact:** Inconsistent visual rhythm across site
**Fix:** Standardize to `max-w-7xl` with `mx-auto` everywhere
**Severity:** P1 — Consistency/polish issue

---

## RESPONSIVE ARCHITECTURE ISSUES (P1)

### 7. Tailwind Breakpoint Strategy Not Defined
**File:** `/apps/website/tailwind.config.js`
**Issue:** Config doesn't override breakpoints; uses Tailwind defaults
**Default Breakpoints:** sm:640px, md:768px, lg:1024px, xl:1280px, 2xl:1536px
**WISE² Standard:** Should use 320px, 375px, 768px, 1024px, 1280px, 1440px
**Impact:** Breakpoints may not align with device-specific testing
**Fix:** Add custom breakpoints to tailwind.config.js
**Severity:** P1 — Foundational issue affecting all responsive pages

---

### 8. No CSS Variables for Spacing/Colors
**File:** `globals.css` (no token system)
**Issue:** Colors scattered across components (hardcoded hex, Tailwind config)
**Examples:**
  - `border-lime-400/30` (Tailwind arbitrary)
  - `rgba(0, 85, 255, 0.2)` (inline)
  - `#22C55E` (Tailwind alias for wrong green)
**Impact:** 
  - Can't globally swap colors (WISE² brand green is #2CD588, not #22C55E)
  - Spacing has no unified scale
  - Maintenance nightmare
**Fix:** Create CSS variables for all tokens (see design-system master)
**Severity:** P1 — Prevents design system adoption

---

### 9. Hero/Landing Pages Use Full-Width Colored Blocks
**From Screenshots:** Large solid-color backgrounds (neon green, blue)
**Issue:** These are fine for marketing but WISE² standard is:
  - Black dominant (70-80%)
  - Green purposeful (5-10%, only for actions/highlights)
  - Chrome premium (10-20% accents)
**Current:** Over-saturation with accent colors
**Fix:** Reduce accent color surface area; use strategic highlighting instead
**Severity:** P1 — Brand identity misalignment

---

## MEDIUM-PRIORITY ISSUES (P2)

### 10. Navigation Brand Font Not Web-Safe
**File:** `/apps/website/components/wise/Navigation.tsx:32`
**Issue:** Logo uses `fontFamily: 'Beyond The Mountains'`
**Problem:** Font not defined in globals; assumes it's installed locally
**Fix:** Either import from Google Fonts or define fallback stack
**Severity:** P2 — Logo may render incorrectly on different environments

---

### 11. Glow Effects Not Optimized for Mobile
**File:** `globals.css` - multiple box-shadow glow effects
**Issue:** Glow effects use expensive `box-shadow` animations
**Examples:**
  - `.glow-blue-lg: '0 0 44px rgba(0, 85, 255, 0.38)'`
  - Animation: `'pulse-glow': 'pulseGlow 2s ease-in-out infinite'`
**Mobile Impact:** Drains battery on lower-end devices
**Fix:** Disable glow animations on `prefers-reduced-motion`; reduce shadow blur on mobile
**Severity:** P2 — Performance/accessibility issue

---

### 12. Tailwind Color Schema Mismatch
**File:** `/apps/website/tailwind.config.js:30`
**Issue:** Green is `#22C55E` (Tailwind's green) but WISE² green is `#2CD588`
**Current Usage:** `text-lime-400` (Tailwind's lime) used throughout
**Fix:** Update tailwind.config to use correct WISE² green (#2CD588)
**Severity:** P2 — Brand color incorrect

---

### 13. No Dark Mode Contrast Validation
**File:** None - no automated contrast checking
**Issue:** Dark text on dark backgrounds, grays on blacks may not meet 4.5:1 ratio
**Example:** `text-gray-300` (#D1D5DB) on `bg-[#050505]` = ~8:1 ✓ but inconsistent
**Fix:** Validate all color pairs against WCAG AA (4.5:1 minimum)
**Severity:** P2 — Accessibility concern

---

### 14. Floating Elements Ignore Safe-Area Insets
**File:** Navigation and chat widget
**Issue:** No `safe-area-inset-*` consideration for iPhone notch/Dynamic Island
**Current:** Fixed positioning doesn't account for safe areas
**Fix:** Use `top-[env(safe-area-inset-top)]` and similar
**Severity:** P2 — iPhone UX degraded (notch overlap)

---

## LOWER-PRIORITY ISSUES (P3)

### 15. Animation Easing Inconsistent
**File:** Multiple components
**Issue:** Different easing functions across site:
  - Some use `ease-out`, some `ease-in-out`, some hardcoded cubic-bezier
**Standard:** Should be `ease-out` for micro (150ms), cubic-bezier for longer
**Fix:** Standardize easing functions per design system
**Severity:** P3 — Polish issue

---

### 16. Button Styling Not Unified
**Issue:** Some buttons use `hover:scale-105`, others `hover:-translate-y-2`, others no hover
**Current:** No button component library
**Fix:** Create reusable Button component with variants (primary, secondary, outline, ghost)
**Severity:** P3 — Consistency/maintainability

---

### 17. Form Validation Styles Not Defined
**File:** Multiple form pages (/contact, /intake, etc.)
**Issue:** No standardized error, success, or loading states on forms
**Fix:** Define form component variants with error/success/loading feedback
**Severity:** P3 — UX polish

---

## PAGES WITH RESPONSIVE ISSUES

Based on screenshot evidence and current code:

| Page | Issue | Severity |
|------|-------|----------|
| Studio modules | Content overflow, overlapping cards, mobile unusable | P0 |
| Live Studio | Status/controls not centered, mobile layout broken | P1 |
| Jingle Lab | Grid templates squeeze on mobile, unreadable | P1 |
| Voice Lab | Voice cards overlap text on small screens | P1 |
| Content Factory | Channel buttons overflow horizontally | P1 |
| Client Showcase | Project cards clip on mobile | P1 |
| Dashboard | Sidebar consumes 50%+ of mobile viewport | P1 |
| Webstore/Shop | Product cards not responsive, overflow | P1 |

---

## ROOT CAUSES

### Architectural
1. **No mobile-first strategy** — Desktop-first layouts adapted with media queries
2. **No design tokens system** — Colors/spacing scattered across files
3. **No responsive breakpoint strategy** — Tailwind defaults used inconsistently
4. **No component library** — Each page reinvents buttons, cards, forms

### Technical
1. **Fixed widths on flexible content** — `max-w-7xl` without fallback; `px-4` insufficient on mobile
2. **Flex without constraints** — Flex children without `min-width: 0` or `flex-wrap`
3. **No viewport safety** — Safe-area insets ignored; notch overlap
4. **Animations not optimized** — No `prefers-reduced-motion`; expensive shadows on mobile

### Process
1. **No QA at breakpoints** — Not tested at 375px, 768px, 1440px systematically
2. **No accessibility validation** — No contrast checking, no keyboard testing
3. **No design system adoption** — Components built ad-hoc, not from tokens

---

## REPAIR PRIORITY

### Phase 1: Critical (This Week)
1. ✅ Fix `userScalable` accessibility violation
2. ✅ Update navigation links to use env-based URLs
3. ✅ Add page content padding for fixed nav
4. ✅ Implement chat widget safe-area detection
5. ✅ Create custom Tailwind breakpoints
6. ✅ Define CSS variable system

### Phase 2: High (Next Week)
1. Implement bottom navigation for mobile
2. Standardize max-width containers
3. Fix color schema (#2CD588 green)
4. Reduce hero/landing accent color saturation
5. Add responsive glow effect handling
6. Validate contrast ratios (WCAG AA)

### Phase 3: Medium (Week 3)
1. Create component library (Button, Card, Form)
2. Add safe-area inset handling
3. Standardize animation easing
4. Add form validation styles
5. Test at all breakpoints (375, 768, 1024, 1440px)

### Phase 4: Polish (Week 4)
1. Web font fallbacks
2. Focus states and keyboard nav
3. Loading/error/success states
4. Accessibility audit (full WCAG AA)
5. Performance optimization

---

## VERIFICATION CHECKLIST

### Responsive Health
- [ ] No horizontal page scroll at 375px
- [ ] No horizontal page scroll at 768px
- [ ] No horizontal page scroll at 1440px
- [ ] All text readable (no clipping)
- [ ] All buttons minimum 44px height (touch target)
- [ ] Cards don't overlap
- [ ] Navigation accessible on mobile
- [ ] Chat widget doesn't block buttons

### Design System
- [ ] All colors from CSS variables (no raw hex)
- [ ] All spacing from 4-96px scale
- [ ] All typography from defined scale
- [ ] All animations honor prefers-reduced-motion
- [ ] All components use reusable library

### Accessibility
- [ ] Color contrast 4.5:1 minimum
- [ ] All form labels present
- [ ] Focus indicators visible
- [ ] Keyboard navigation works
- [ ] Safe-area insets respected
- [ ] userScalable = true (zoom enabled)

### Performance
- [ ] Lighthouse > 85 (Performance)
- [ ] First Contentful Paint < 2s
- [ ] Cumulative Layout Shift < 0.1
- [ ] No layout thrashing
- [ ] Animations at 60fps

---

## ESTIMATED EFFORT

| Phase | Task Count | Estimated Time | Status |
|-------|-----------|-----------------|--------|
| 1 (Critical) | 6 | 2-3 days | Starting |
| 2 (High) | 6 | 3-5 days | Planned |
| 3 (Medium) | 5 | 3-5 days | Planned |
| 4 (Polish) | 5 | 2-3 days | Planned |
| **Total** | **22** | **2-3 weeks** | **On track** |

---

## NEXT ACTIONS (TODAY)

1. **Fix Accessibility** (30 min)
   - [ ] Change `userScalable: false` → `true`
   - [ ] Update nav links to env-based URLs

2. **Add Layout Padding** (30 min)
   - [ ] Add `pt-20` to `main` element in layout.tsx
   - [ ] Test navigation doesn't overlap content

3. **Create Tailwind Overrides** (1 hour)
   - [ ] Add custom breakpoints to tailwind.config.js
   - [ ] Update color tokens to use #2CD588 green

4. **Implement CSS Variables** (2 hours)
   - [ ] Create `:root` variable system in globals.css
   - [ ] Convert hardcoded colors to variables
   - [ ] Add spacing scale

5. **Update Chat Widget** (1 hour)
   - [ ] Add safe-area-inset handling
   - [ ] Push above bottom nav on mobile

**Total Phase 1:** ~5 hours

