# WISE² Design System Unification Plan
## Complete Implementation Strategy for All Pages

**Status**: Planning Phase (No Implementation)  
**Scope**: All 5 WISE² Apps (website, dashboard, admin, podcast-music, studio)  
**Design Reference**: Studio (https://studio.wise2.net) - correct WISE² identity  
**Target**: Pixel-perfect consistency across all pages

---

## EXECUTIVE SUMMARY

Current state: 5 apps with partial/inconsistent design system usage
- Website: ~40% consistent (custom wise-* classes with gaps)
- Dashboard: ~30% consistent (generic Tailwind, missing unified tokens)
- Admin: ~20% consistent (minimal styling)
- Podcast-music: ~20% consistent (minimal styling)
- Studio: Reference (baseline correct)

Total work: 8 sections × 5 apps = 40 targeted updates
Estimated complexity: Medium (high variance in current state)

---

## SECTION 1: COLOR PALETTE & TOKENS
### Status: NEEDS ALIGNMENT

#### Current Discrepancy
- **Design System Doc** (#DESIGN_SYSTEM.md): #0094FF primary blue
- **Tailwind Config** (design-system/tailwind.config.ts): #0055FF primary, #00D9FF electric
- **Studio Reference**: #0094FF accents per user brief

#### Issue
Tailwind config does not match documented design system. Must audit Studio before implementation to confirm correct palette.

### What Needs Updating

#### 1.1 Core Color Tokens
**Location**: `/packages/design-system/tailwind.config.ts` (MASTER)
**Files Affected**: All 5 apps inherit this config

| Component | Current | Target | Priority | Effort |
|-----------|---------|--------|----------|--------|
| Background (Primary) | #050505 ✓ | #050505 | 1 | 1 |
| Surface (Secondary) | #0D1117 | → #101010 (Studio spec) | 1 | 1 |
| Surface-2 | #131922 | → #181818 (Studio spec) | 1 | 1 |
| Surface-3 | #1A2332 | Review/adjust | 2 | 1 |
| Text Primary | #FFFFFF ✓ | #FFFFFF | 1 | 1 |
| **Primary Blue** | #0055FF | **→ #0094FF** (Studio spec) | 1 | 2 |
| Electric Cyan | #00D9FF | Verify (may keep) | 2 | 1 |
| Purple Accent | #B300FF ✓ | #B300FF | 2 | 1 |
| Red (Danger) | #FF0040 ✓ | #FF0040 | 1 | 1 |

**Action Items**:
1. [ ] Confirm Studio palette by visiting https://studio.wise2.net (inspect colors)
2. [ ] Update tailwind.config.ts `wise.primary` from #0055FF → #0094FF
3. [ ] Update all primary-hover, primary-active color references
4. [ ] Update surface colors to match Studio (#101010, #181818)
5. [ ] Regenerate color vars in all apps

---

## IMPLEMENTATION PHASES

### **PHASE 1: Foundation (4 hours)** ← START HERE
- Update Tailwind config (#0055FF → #0094FF)
- Create unified Header component
- Update Button/Card components
- **Test coverage**: 70%

### **PHASE 2: Website App (16 hours)**
- Home page, feature pages, auth pages
- Spacing standardization
- **Test coverage**: 80%

### **PHASE 3: Dashboard App (14 hours)**
- Layout + sidebar
- Metrics components
- All dashboard pages
- **Test coverage**: 75%

### **PHASE 4: Remaining Apps (8 hours)**
- Admin, Podcast-music, Studio
- Consistency verification
- **Test coverage**: 60%

### **PHASE 5: Testing & QA (10 hours)**
- Visual regression testing
- Accessibility audit
- Performance validation
- **Test coverage**: 95%

**Total Effort**: ~52 hours (~2 weeks, 1 dev)

---

## PRIORITY MATRIX

### TIER 1: MUST DO (70% value)
1. Tailwind config color updates
2. Unified Header component
3. Button/Card component updates
4. Website home page
5. Dashboard layout + pages
6. Auth pages (all apps)

### TIER 2: SHOULD DO (20% value)
1. Sidebar component
2. Feature pages
3. Metrics components
4. Empty/error states
5. Mobile navigation

### TIER 3: NICE TO HAVE (10% value)
1. Animation refinements
2. Loading skeletons
3. Advanced chart styling
4. A11y polish
5. Performance optimization

---

## VALIDATION GATES

✓ All primary blue references changed  
✓ All glow shadows updated  
✓ Focus rings consistent  
✓ Typography locked  
✓ Spacing standardized  
✓ Mobile layouts tested (320px, 768px, 1024px, 1440px+)  
✓ Accessibility WCAG 2.1 AA  
✓ Lighthouse ≥80  
✓ <5% visual regression  

---

## NEXT ACTIONS

1. **Confirm color palette** (#0094FF vs #0055FF) by inspecting studio.wise2.net when available
2. **Get approval** on phased approach & timeline
3. **Start Phase 1** (4-hour foundation work)
4. **Track progress** using the validation checklist

---

**Status**: PLANNING COMPLETE (NO IMPLEMENTATION)  
Full detailed specs available in separate document.