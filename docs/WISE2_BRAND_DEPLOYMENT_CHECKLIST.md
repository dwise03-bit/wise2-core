# WISE² Brand v2.0 Deployment Checklist
**🔒 LOCKED 2026-09-13 | Global Brand Rollout**

---

## Project Overview

**Goal**: Update all WISE² properties with canonical brand identity  
**Status**: 🚀 Ready to Deploy  
**Timeline**: Phase 1 This Week, Phases 2-3 Next 2 Weeks  
**Owner**: dwise03@gmail.com

---

## Phase 1: Critical Pages (This Week)

### ✅ Already Complete
- [x] Brand guidelines created (`docs/brand-guidelines.md`)
- [x] Color palette locked (#050607, #00D9FF, #00FF7F, #C4A369)
- [x] Logo specification created
- [x] Hero message locked ("Building Empires. Changing Culture. Together.")
- [x] blakkhail launch audit updated with dark theme + WISE² colors
- [x] Brand lock memorized (for future reference)

### 🔄 In Progress This Week

#### Homepage (Priority 1)
- [ ] Update header with WISE² logo + "BUILD DIFFERENT"
- [ ] Apply dark navy background (#050607)
- [ ] Update hero message with neon green accent
- [ ] Replace all CTA buttons with cyan (#00D9FF)
- [ ] Update secondary buttons with gold (#C4A369)
- [ ] Apply status bar with neon green indicators
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Deploy to staging
- [ ] QA sign-off
- [ ] Deploy to production

**File**: `apps/website/src/pages/index.tsx`  
**Estimate**: 2-3 hours

#### Dashboard (Priority 2)
- [ ] Replace light background with dark navy (#050607)
- [ ] Update all text colors to light gray (#D1D5DB)
- [ ] Change primary button color to cyan (#00D9FF)
- [ ] Update success indicators to neon green (#00FF7F)
- [ ] Add WISE² logo to header
- [ ] Update navigation styling
- [ ] Test all interactive elements
- [ ] Deploy to staging
- [ ] Test with real data
- [ ] Deploy to production

**File**: `apps/dashboard/src/`  
**Estimate**: 3-4 hours

#### Admin UI (Priority 3)
- [ ] Update header background and logo
- [ ] Apply dark theme to all pages
- [ ] Update form styling (inputs, buttons, labels)
- [ ] Apply status badges with correct colors
- [ ] Test all admin functions
- [ ] Deploy to staging
- [ ] Deploy to production

**File**: `apps/admin/src/`  
**Estimate**: 2-3 hours

---

## Phase 2: Supporting Pages (Next Week)

### Pages to Update
- [ ] Pricing page (`/pricing`)
- [ ] Services page (`/services`)
- [ ] Contact page (`/contact`)
- [ ] About page (`/about`)
- [ ] Blog landing page
- [ ] Search results page
- [ ] 404 error page
- [ ] Loading page

**Estimate**: 1 hour per page × 8 pages = 8 hours

---

## Phase 3: Communication & Email (Weeks 2-3)

### Email Templates
- [ ] Newsletter template
- [ ] Welcome email
- [ ] Promotional email
- [ ] Transactional emails (order, account, etc.)
- [ ] Alert/notification emails

**Template files**: `templates/email/`  
**Estimate**: 4-5 hours

### Social Media Assets
- [ ] LinkedIn header
- [ ] Twitter/X header
- [ ] Instagram profile image
- [ ] Facebook cover photo
- [ ] Email signature template
- [ ] Slack workspace branding
- [ ] Discord server banner

**Estimate**: 2-3 hours

---

## Deployment Instructions

### Step 1: Copy Brand Tokens
Add to every project's CSS:

```css
:root {
  --wise-dark: #050607;
  --wise-darker: #0a0f1a;
  --wise-blue: #00D9FF;
  --wise-gold: #C4A369;
  --wise-green: #00FF7F;
  --wise-gray-light: #D1D5DB;
}

body {
  background: var(--wise-dark);
  color: var(--wise-gray-light);
}
```

### Step 2: Update Components

Replace old colors:
```css
/* Old → New */
body { background: white; } → background: var(--wise-dark);
a { color: blue; } → color: var(--wise-blue);
button { background: green; } → background: var(--wise-green);
h1 { color: black; } → color: white;
```

### Step 3: Add Logo
Header template:
```tsx
<header style={{ background: '#050607', borderBottom: '3px solid #00D9FF' }}>
  <div style={{ color: '#00D9FF', fontSize: '32px', fontWeight: 900 }}>WISE²</div>
  <div style={{ color: '#00FF7F', fontSize: '11px', textTransform: 'uppercase' }}>BUILD DIFFERENT</div>
</header>
```

### Step 4: Test Responsive Design
- [ ] Mobile 375px width
- [ ] Tablet 768px width
- [ ] Desktop 1024px+ width
- [ ] Dark mode (if applicable)
- [ ] All browsers (Chrome, Safari, Firefox, Edge)

### Step 5: Verify Accessibility
- [ ] WCAG AA color contrast (4.5:1 minimum)
- [ ] Text sizes readable on mobile
- [ ] All buttons/links keyboard accessible
- [ ] Screen reader compatible

### Step 6: Deploy
```bash
git add docs/ apps/
git commit -m "feat: Apply WISE² brand v2.0 to all pages

- Dark navy (#050607) backgrounds
- Cyan (#00D9FF) primary CTAs
- Neon green (#00FF7F) status indicators
- Gold (#C4A369) secondary CTAs
- Hero message with neon accent
- Logo + 'BUILD DIFFERENT' tagline
- WCAG AA compliant contrast
"
git push origin main
```

---

## Quality Assurance Checklist

For each page, verify:

### Visual
- [ ] Colors match hex values exactly
- [ ] Logo is visible and centered
- [ ] Hero message is prominent (if applicable)
- [ ] Buttons have proper hover/active states
- [ ] Text is readable with good contrast
- [ ] Spacing is consistent with 20px/40px/60px grid
- [ ] No broken images or missing assets

### Functionality
- [ ] All buttons are clickable
- [ ] Links navigate correctly
- [ ] Forms submit properly
- [ ] No console errors
- [ ] No network errors
- [ ] Performance is acceptable (< 3s load)

### Responsive
- [ ] Mobile layout is correct (375px)
- [ ] Tablet layout is correct (768px)
- [ ] Desktop layout is correct (1024px+)
- [ ] No horizontal scrolling on mobile
- [ ] Touch targets are large enough (48px minimum)

### Accessibility
- [ ] Color contrast passes WCAG AA (4.5:1)
- [ ] All text is readable
- [ ] All buttons have accessible labels
- [ ] Keyboard navigation works
- [ ] Screen reader announces content correctly

---

## Reference Documents

| Document | Location | Purpose |
|----------|----------|---------|
| Brand Guidelines | `docs/brand-guidelines.md` | Master spec for colors, typography, messaging |
| Implementation Guide | `docs/BRANDING_IMPLEMENTATION_GUIDE.md` | How-to guide for applying branding |
| Logo Assets | `docs/WISE2_LOGO_SVG.md` | Logo specifications and SVG code |
| Asset Registry | `docs/WISE2_BRANDING_ASSET_REGISTRY.md` | Complete component library + templates |
| Brand Lock Memory | Memory: `brand_lock_wise2_v2.md` | Locked brand identity (for AI reference) |

---

## Critical Contacts

- **Brand Owner**: dwise03@gmail.com
- **Designer**: (To be assigned)
- **QA Lead**: (To be assigned)
- **Deployment**: dwise03@gmail.com

---

## Rollback Plan

If anything breaks during deployment:

1. Revert last commit: `git revert HEAD`
2. Deploy previous version: `git push origin main`
3. File incident report
4. Schedule fix
5. Redeploy once fixed

---

## Success Criteria

✅ All Phase 1 pages deployed with WISE² branding  
✅ All colors match hex values exactly  
✅ Logo appears on all pages  
✅ WCAG AA compliance verified  
✅ Mobile responsive tested  
✅ No console errors  
✅ QA sign-off obtained  

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Brand Owner | dwise | 2026-09-13 | 🔒 LOCKED |
| QA Lead | — | — | Pending |
| Deployment | dwise | — | Pending |

---

## Timeline Summary

| Phase | Duration | Start | End | Status |
|-------|----------|-------|-----|--------|
| Phase 1: Critical Pages | 1 week | 2026-09-13 | 2026-09-20 | 🚀 Ready |
| Phase 2: Supporting Pages | 1 week | 2026-09-20 | 2026-09-27 | 📋 Planned |
| Phase 3: Email + Social | 1 week | 2026-09-27 | 2026-10-04 | 📋 Planned |

---

## Notes

- All documents are locked as of 2026-09-13
- No deviations from color palette without written approval
- All deployments require QA verification
- Rollback plan ready for any issues

---

**Document Owner**: dwise03@gmail.com  
**Last Updated**: 2026-09-13  
**Status**: 🔒 LOCKED FOR PRODUCTION DEPLOYMENT
