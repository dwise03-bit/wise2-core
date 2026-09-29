# wise2.net Comprehensive Skill Audit Report

**Date**: 2026-09-21  
**Target**: `apps/website/` (wise2.net production codebase)  
**Skills Run**: unslop-ui, Impeccable (ready), Playwright CLI (ready), TasteSkill (ready), Awesome Design (ready)

---

## Executive Summary

**Verdict**: 🚨 **STRONG AI-default look** with heavy 2026-tell contamination

| Metric | Result |
|--------|--------|
| **Vibe Score** | 4,215 (critical — any >500 is noticeable) |
| **High-Severity Findings** | 244 |
| **Medium-Severity Findings** | 1,729 |
| **Low-Severity Findings** | 25 |
| **Total Issues** | **1,998** |
| **Files Scanned** | 1,461 |

**Root Cause**: Widespread use of "tasteful default" (Cormorant serif + cream backgrounds), untouched Tailwind defaults, and Inter font.

---

## Finding Breakdown

### 🔴 HIGH-SEVERITY Issues (244 total)

**Primary Tell: "Cream + Serif" 2026 Default**
- The current Anthropic/Claude house style (warm cream backgrounds + serif display fonts)
- Found in 80+ headings across the site (Cormorant font)
- **This is not the fix — this IS the slop.**
- Files affected:
  - `app/sencere/products/page.tsx` (multiple)
  - `app/sencere/products/[slug]/page.tsx`
  - `app/sencere/signup/page.tsx`
  - `app/sencere/checkout/page.tsx`
  - `app/sencere/order-confirmation/page.tsx`
  - `app/sencere/account/page.tsx`
  - `app/blakkhail/` routes

**Fix Approach**:
```
This is not a styling problem — it's a specification problem.
Instead of swapping one default for another, establish:
1. A real brand reference (one site/screenshot/product to anchor to)
2. A deliberate color choice (not cream, and not just replacing it with another default)
3. A specific typeface pairing chosen for this project (not Cormorant or Inter)
4. A layout intention (what should users do first, not hero + three cards)
```

### 🟡 MEDIUM-SEVERITY Issues (1,729 total)

**Top Issues by Category**:
1. **Rounded Everything** — Large radius/pill buttons everywhere
   - `border-radius: 9999px` on status cards
   - Pill buttons as default style
   - Fix: Use intentional radius scale (xs/sm/md for specific roles, not 9999px everywhere)

2. **Generic Fonts**
   - Inter font (line 11 in `app/sencere/layout.tsx`)
   - Inter in `app/sencere/blakkhail/layout.tsx`
   - Fix: Choose a typeface with actual character; pair a display + body face intentionally

3. **Other Tailwind Defaults**
   - Untouched shadcn components
   - Default spacing scales
   - Stock color combinations

---

## Skill-by-Skill Analysis

### 1. ✅ unslop-ui (Complete Audit)

**Status**: Full scan complete (exit code 244 = high-severity count)

**Key Findings**:
- Database match: 244 high-severity tells detected
- Vibe score indicates website reads as fully AI-generated
- Scanner correctly identified the "cream + serif" 2026 tell (good signal)

**Next Action**: Use audit mode + references to fix:
```bash
# Run in CI to gate builds on high-severity tells
python3 clients/vibecoded-design-tells/skill/scripts/devibe_scan.py apps/website --json
```

**Usage in Claude Code**:
When rebuilding these pages, load the skill and use:
- `references/tells.md` — detailed tell catalog
- `references/choosing-a-look.md` — decision process (not prescription)

---

### 2. ✅ Impeccable (Ready to Use)

**Status**: Ready; 23 commands available

**Commands to Run**:
```bash
# 1. Scan existing tokens & write product brief
/impeccable init

# 2. Score current build
/impeccable critique

# 3. Add brand-aware color to grays
/impeccable colorize

# 4. Adjust design intensity
/impeccable bolder    # if reads "too safe"
/impeccable quieter   # if reads "too loud"

# 5. Open live mode for click-to-adjust
# (opens page in browser, click components to refine)
```

**What Impeccable Will Catch**:
- The 5 default tells (Inter, purple gradients, card stacks, gray-on-color, rounded tiles)
- Missing brand vocabulary
- Weak color choices

**What Impeccable Won't Catch**:
- Layout coherence or spacing consistency (needs manual eye check)
- Whether the brief was actually specified first
- Typography hierarchy decisions

---

### 3. ✅ Playwright CLI (Ready to Use)

**Status**: Installed globally; ready for browser testing

**How to Use**:
```bash
# Open the live site in a headed browser
playwright-cli open https://wise2.net --headed

# Test signup flow
playwright-cli type "test@example.com"
playwright-cli press Enter
playwright-cli screenshot   # capture each step

# Open live dashboard to see all browser sessions
playwright-cli show
```

**What to Test**:
- [ ] Home page loads without visual glitches
- [ ] Forms work end-to-end (no hidden validation errors)
- [ ] Colors render correctly on dark/light backgrounds
- [ ] Responsive layout at mobile breakpoints (375px, 768px)
- [ ] All interactive elements respond to clicks

**Why This Matters**:
- You can verify fixes work before shipping
- Claude can watch the page load, catch broken buttons, then fix + re-check
- Beats "assume it works"

---

### 4. 🎯 TasteSkill (Next Step)

**Status**: Ready; 13 variants available

**Variants to Consider**:
- `taste-skill` (default) — infers design direction from brief
- `minimalist-ui` — Notion/Linear-inspired (clean, dense)
- `brutalist-ui` — Swiss typography, raw structure
- `redesign-skill` — audit + upgrade existing site
- `soft-skill` — calm UIs, softer contrast

**Before Using**:
Establish a brief:
1. **Reference**: One real site to anchor to (e.g., "like Linear's dashboard" or "like Stripe's homepage")
2. **Audience**: Who's using this? (founders, designers, operators, consumers)
3. **Mood**: One or two words (ambitious, calm, technical, warm, luxe)

**Example Brief for wise2.net**:
```
Reference: Stripe's dashboard (serious, functional, minimal color)
Audience: Operators & founders building their business OS
Mood: Professional, data-forward, intentional

Colors: Navy + accent (your brand color, not cream)
Type: Display = X, Body = Y (specific choices, not serif defaults)
Layout: Dashboard-grid for dense info, not hero + cards
```

**TasteSkill will then**:
- Pick layout direction (grid vs. flow, density, motion)
- Suggest component patterns
- Generate code aligned to the brief (not defaults)

---

### 5. 🎨 Awesome Design (Style Reference)

**Status**: Ready; 60+ design systems available

**Recommend for wise2.net**:
- `enterprise` or `dashboard` — clean, dense product UI
- `brutalism` — if you want Swiss precision
- `minimalist-ui` — if you want restraint (already similar)

**How to Use**:
1. Pick the style: `np skills add awesome-design --skill "enterprise"`
2. Load when building: Claude reads the type scale, color palette, spacing rules
3. Build within constraints instead of defaulting to median

---

## Actionable Remediation Plan

### Phase 1: Audit Complete ✅
- [x] Run unslop-ui scanner → 1,998 findings
- [x] Identify tell types → Cream+serif (244 high), rounded buttons, Inter font
- [x] Document root cause → Specification problem, not styling
- [x] Ready Impeccable, Playwright, TasteSkill, Awesome Design

### Phase 2: De-slop (2–3 hours)

**Step 1: Establish a Brand Brief** (30 min)
```markdown
# wise2.net Brand Brief

Reference: [Specific site/screenshot to anchor to]
Audience: [Who's using this]
Mood: [1–2 words]
Color: [Real hex or RGB; not cream]
Type: Display=[font name], Body=[font name]
Layout: [Grid/flow/density intent]
```

**Step 2: Pick a TasteSkill Variant** (5 min)
- Choose `taste-skill`, `minimalist-ui`, `brutalist-ui`, or `redesign-skill`

**Step 3: Rebuild Pages** (1–2 hours)
1. Run `/impeccable init` to scan tokens
2. Use TasteSkill to regenerate key pages (home, products, signup, checkout)
3. Run `/impeccable critique` after each rebuild
4. Use `/impeccable colorize`, `/bolder`, or `/quieter` to refine

**Step 4: Verify with Playwright** (30 min)
1. `playwright-cli open https://wise2.net --headed`
2. Test signup, checkout, navigation flows
3. Screenshot before/after responsive breakpoints
4. Catch any broken functionality

**Step 5: Audit Again** (5 min)
```bash
python3 clients/vibecoded-design-tells/skill/scripts/devibe_scan.py apps/website --json
```
Vibe score should drop significantly (target: < 500 = no longer "AI-generated looking").

### Phase 3: CI/CD Integration (optional, 30 min)
Add to your deployment pipeline:
```bash
# Before shipping, fail if high-severity tells detected
python3 clients/vibecoded-design-tells/skill/scripts/devibe_scan.py apps/website --json \
  --severity high \
  && echo "✅ Design audit passed" \
  || (echo "❌ High-severity design tells detected" && exit 1)
```

---

## Files Requiring Immediate Attention

**Highest-Impact Changes** (top 3):
1. **`apps/website/tailwind.config.js`** (line 80)
   - Remove/replace serif font defaults; choose intentional typefaces
   - Restructure radius scale (not everything 9999px)

2. **`apps/website/app/layout.tsx`** (line 111)
   - Remove `border-radius: 9999px` from card styles
   - Use purposeful radius by role

3. **`apps/website/app/sencere/*`** (all files with Cormorant)
   - Replace serif headings with chosen display font
   - Add `unslop-ignore` comments if serif/cream is a real decision, OR
   - Replace with brand-aligned alternatives

**Medium Impact**:
- Remove Inter from all layout files (use chosen body font)
- Audit color scale (grays on colored backgrounds)
- Check spacing/density consistency by hand

---

## Summary by Skill

| Skill | Status | Top Finding | Recommendation |
|-------|--------|-------------|-----------------|
| **unslop-ui** | ✅ Complete | 244 high-tells (cream+serif) | Rebuild pages with TasteSkill; re-scan to verify score drops |
| **Impeccable** | ✅ Ready | Not yet run (will catch defaults) | Run `/impeccable init` before rebuilding |
| **Playwright** | ✅ Ready | Not yet run (will verify UX works) | Use to test flows end-to-end after rebuild |
| **TasteSkill** | ✅ Ready | Not yet run (will provide direction) | Use as primary rebuild tool; establishes brief first |
| **Awesome Design** | ✅ Ready | Not yet run (will provide reference) | Pick "enterprise" or "dashboard" style for wise2.net |

---

## Critical Success Factors

1. **Specify Before Generating** — Don't use Claude to fill a blank prompt. Establish color, type, layout intent first.
2. **One Reference** — One real website to anchor to beats ten style words.
3. **Mark Intentional Choices** — Add `unslop-ignore` comments where cream/serif/Inter IS your real decision.
4. **Verify Live** — Use Playwright to watch the site work, not just "no build errors."
5. **Re-audit** — Run unslop-ui scanner after each phase. Vibe score should drop 50%+ after rebuilds.

---

## Next Steps

**Immediate** (today):
1. Read this report
2. Establish brand brief (color, type, layout intent)
3. Pick one TasteSkill variant
4. Choose one page to rebuild as a test

**This Week**:
1. Rebuild priority pages using TasteSkill + Impeccable
2. Run Playwright tests on live site
3. Re-scan with unslop-ui; target vibe score < 500

**Ongoing**:
1. Add design audit to CI/CD
2. Use these skills on every new feature
3. Audit quarterly for new defaults

---

**Report Generated**: 2026-09-21  
**Auditor**: unslop-ui scanner + Claude  
**Next Audit**: After TasteSkill rebuild (target: vibe score improvement ≥50%)
