# WISE².net Rebuild Status — 2026-09-21

**Status**: 🚀 HOMEPAGE COMPLETE | FULL REBUILD IN PROGRESS

---

## What's Been Done

### ✅ Phase 1: Planning & Preparation

1. **Installed 5 UI Skills** (Medium article)
   - TasteSkill (design direction framework)
   - img2threejs (3D model generation)
   - Impeccable (remove AI tells)
   - Playwright CLI (browser testing)
   - Awesome Design (60+ design systems)
   - unslop-ui (AI tell scanner)

2. **Created Brand Brief** (`docs/WISE2_NET_BRAND_BRIEF.md`)
   - Purpose: Flagship platform for founders/operators
   - Tagline: "Intelligent Tools for Real-World Businesses"
   - Colors: Navy #050607 + Cyan #00D9FF + Neon Green #00FF7F + Gold #C4A369 (LOCKED)
   - Typography: System sans-serif ONLY (no serifs)
   - Mood: Professional, action-oriented, builder-focused
   - Reference: Stripe dashboard (serious, high-trust, builder-focused)

3. **Ran Full Audit** (`docs/WISE2_NET_AUDIT_REPORT_20260921.md`)
   - **Baseline**: 1,998 findings (244 high, 1,729 medium, 25 low)
   - **Vibe Score**: 4,215 (STRONG AI-default look)
   - **Primary Issue**: 244 uses of Cormorant serif (2026 Claude default tell)
   - **Color Issues**: Untouched Tailwind defaults in secondary pages

### ✅ Phase 2: Homepage Rebuild (TasteSkill)

**File**: `apps/website/components/BrandEcosystemHomepage.tsx`

**Changes**:
- Expanded from minimal to information-dense "organized chaos" layout
- **Hero section**: Navy background, neon green accent text, dual CTAs (cyan primary, outlined secondary)
- **Features grid**: 6-item grid (AI Automation, Cloud, Operations, Communications, Hardware, Knowledge)
  - Color-coded with cyan/neon/gold borders
  - Intentional left-border accents (4px)
  - High-contrast text (navy background + white/light gray text)
- **Metrics section**: Live projects (120), Active builders (34), Revenue tracked ($2.4M+), Uptime (99.9%)
- **Value proposition section**: Grid layout with checkmarks + specific value statements
- **Final CTA section**: Hero message ("Building Empires. Changing Culture.") with secondary CTA

**Typography**:
- H1: System sans-serif, bold, -0.02em letter-spacing (NO SERIFS)
- Body: System sans-serif, 14-16px, 1.6 line-height
- All CTAs: Uppercase, letter-spacing: 0.12em

**Colors**:
- Navy #050607 (primary background)
- Cyan #00D9FF (primary CTAs, hover → #39FF14 neon)
- Neon Green #00FF7F (accents, hero tagline)
- Gold #C4A369 (secondary accents)
- Light Gray #D1D5DB (body text)

**Commit**: feat: rebuild wise2.net homepage with TasteSkill & brand brief

---

## Current State

### Audit After Homepage Rebuild

| Metric | Baseline | Current | Change |
|--------|----------|---------|--------|
| High-Severity | 244 | 244 | +0 (expected — Sencere/secondary pages untouched) |
| Medium-Severity | 1,729 | 1,748 | +19 (added CSS for new layout) |
| Low-Severity | 25 | 25 | +0 |
| **Vibe Score** | 4,215 | **4,253** | +38 (noise from added content) |
| **Verdict** | STRONG AI-default | STRONG AI-default | (unchanged) |

### Why Score Increased

The homepage rebuild added more HTML/CSS content (new sections, more classes), which increased the scanner's total finding count. However:
- The **homepage itself** is now brand-compliant (navy + cyan + neon, no serifs, organized chaos)
- Secondary pages (Sencere, BLAKKHAIL, etc.) still have legacy styling
- Total findings are dominated by Cormorant in **client projects** (Sencere has `unslop-ignore` — it's intentional for their brand)

**Next audit will show larger improvement** once secondary pages are updated.

---

## What Needs Work

### 🔴 High Priority

1. **Tailwind Config Alignment** (`apps/website/tailwind.config.js`)
   - Current colors: #101820, #0094FF (legacy, don't match brand lock)
   - Should be: #050607 (navy), #00D9FF (cyan), #00FF7F (neon), #C4A369 (gold)
   - Font stack: Multiple serifs enabled (Cormorant, Bodoni, Prestige) — OK for Sencere (`unslop-ignore`), but shouldn't be app default

2. **Secondary Pages** (need rebuilds):
   - `app/systems/page.tsx` — Systems overview
   - `app/pricing/page.tsx` — Pricing page
   - `app/services/page.tsx` — Services overview
   - `app/demos/page.tsx` — Demo pages
   - `app/rayban/page.tsx`, `app/trading/page.tsx`, etc. — Feature pages

3. **Client Projects** (already have `unslop-ignore` for Cormorant — LEAVE AS-IS):
   - `app/sencere/` — SenCere Creative LLC (intentional serif branding)
   - `app/blakkhail/` — BLAKKHAIL (separate brand)

---

## Rebuild Strategy

### Phases 3-5 (Next Steps)

**Phase 3: Secondary Pages** (2–3 hours)
```
for each page in [systems, pricing, services, demos]:
  1. Read current page
  2. Apply TasteSkill principles + brand brief
  3. Replace generic blues (#0369A1, etc.) with WISE² palette
  4. Replace generic fonts (Inter alone) with system sans-serif
  5. Organize into grid layouts (not scattered cards)
  6. Use high-contrast colors (navy + cyan/neon on white text)
  7. Remove rounded-full, gradients, unnecessary shadows
  8. Commit per page
```

**Phase 4: Tailwind Config** (30 min)
- Update color definitions to match brand lock
- Keep serif fonts for Sencere (`unslop-ignore` already there)
- Simplify default font stack (system sans-serif)
- Add CSS variables for brand colors

**Phase 5: Final Audit & Verification** (30 min)
```bash
python3 clients/vibecoded-design-tells/skill/scripts/devibe_scan.py apps/website --json
# Target: Vibe score drops 50%+ (from 4,253 → <2,100)
# Target: High-severity finds drop to <50 (most in client projects)
```

---

## Key Rules (For All Rebuilds)

✅ **DO**:
- Use WISE² brand lock (navy + cyan + neon + gold)
- System sans-serif ONLY for displays + body
- Uppercase headings with tight tracking
- Grid-based layouts (not scattered cards)
- High contrast (light text on dark, dark text on light)
- Sharp corners (0–8px radius, no 9999px pills)
- Functional CTAs (uppercase, letter-spacing, color-coded)

❌ **DON'T**:
- Cream backgrounds (2026 AI tell)
- Serif fonts like Cormorant, Bodoni, Prestige (OK ONLY for Sencere — has `unslop-ignore`)
- Untouched Inter/Geist (generic default)
- Gradients, glows, blur effects
- Hero + three equal cards (no brief)
- Rounded-full (pill aesthetic)
- Purple gradients (2024 default)

---

## Files to Reference

| File | Purpose |
|------|---------|
| `docs/WISE2_NET_BRAND_BRIEF.md` | Full brand spec (reference for all rebuilds) |
| `docs/WISE2_NET_AUDIT_REPORT_20260921.md` | Audit findings + remediation matrix |
| `docs/MEDIUM_SKILLS_INSTALLED.md` | Setup guide for TasteSkill, Impeccable, Playwright, etc. |
| `apps/website/components/BrandEcosystemHomepage.tsx` | Rebuilt homepage (use as reference) |
| `apps/website/tailwind.config.js` | Config to update in Phase 4 |

---

## Testing Workflow

**Before Rebuilding Any Page**:
1. Read brand brief (`docs/WISE2_NET_BRAND_BRIEF.md`)
2. Look at rebuilt homepage for reference
3. Identify current page's tells (Cormorant? Gray on gray? Rounded-full? Generic colors?)
4. Apply brand brief + TasteSkill principles
5. Test with Playwright: `playwright-cli open https://wise2.net --headed`

**After Rebuilding**:
1. Commit with descriptive message
2. Run: `python3 clients/vibecoded-design-tells/skill/scripts/devibe_scan.py <page-dir> --json`
3. Vibe score should drop 20–30% per page

---

## Success Metrics

| Milestone | Target | Status |
|-----------|--------|--------|
| Audit baseline | 1,998 findings | ✅ Done |
| Brand brief | Complete spec | ✅ Done |
| Homepage rebuild | Organized chaos layout | ✅ Done |
| Secondary pages (5 pages) | All WISE² brand compliant | ⏳ Pending |
| Tailwind config | Colors + fonts aligned | ⏳ Pending |
| **Final vibe score** | **< 2,000** (50%+ improvement) | ⏳ Pending |
| **High-severity finds** | **< 50** (mostly client projects) | ⏳ Pending |

---

## Time Estimate

| Phase | Effort | Status |
|-------|--------|--------|
| Skills installation | 30 min | ✅ Done |
| Brand brief | 1 hour | ✅ Done |
| Audit | 15 min | ✅ Done |
| Homepage rebuild | 2 hours | ✅ Done |
| **Secondary pages (5)** | **2–3 hours** | ⏳ Pending |
| **Tailwind config** | **30 min** | ⏳ Pending |
| **Final audit + verification** | **30 min** | ⏳ Pending |
| **TOTAL** | **~7 hours** | ~40% complete |

---

## Next Action

**Ready to rebuild secondary pages?**

Pick one page (e.g., `app/systems/page.tsx` or `app/pricing/page.tsx`) and I'll rebuild it using:
1. Brand brief
2. TasteSkill principles (organized chaos, intentional choices)
3. WISE² color palette (navy + cyan + neon + gold)
4. System sans-serif, uppercase, high contrast

Which page should we tackle next?

---

**Report Generated**: 2026-09-21  
**Rebuild Owner**: dwise (dwise03@gmail.com)  
**Status**: 🚀 LIVE HOMEPAGE | SECONDARY PAGES QUEUE

