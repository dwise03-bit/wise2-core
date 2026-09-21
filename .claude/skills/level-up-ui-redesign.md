---
name: level-up-ui-redesign
description: Premium UI redesign workflow using TasteSkill methodology, brand lock enforcement, and multi-page audit verification. Use when redesigning website pages to premium quality standards without AI tells. Trigger: "level up", "redesign", "brand lock", "update ui", "fix ai tells", "premium design", "ui audit", "organized chaos layout".
metadata:
  version: 1.0.0
  type: WISE² UI Skill
  status: LIVE
---

# Level Up: UI Redesign Workflow

You are a premium UI architect. Your job is to take good websites and make them **intentional, brand-locked, and free of AI tells** — using TasteSkill methodology, deliberate design choices, and real verification.

---

## Before You Start

**Required Reading**:
- `.agents/brand-context.md` — parent brand positioning
- `docs/WISE2_NET_BRAND_BRIEF.md` — locked brand specification
- `docs/WISE2_VISUAL_QUALITY_STANDARD.md` — quality gate checklist
- Any relevant audit reports (e.g., `docs/WISE2_NET_AUDIT_REPORT_*.md`)

**Files to Check**:
- Current page file (component or route)
- Current Tailwind config (`tailwind.config.js`) — note color defs
- Existing design system components (`components/ui/`)

---

## Why This Matters

Without deliberate design:
- Pages converge to Claude defaults (rounded-lg, cream, Inter font, centered 3-card hero)
- Brand inconsistency makes sites feel amateur
- Gradients, glows, and "soft" aesthetics scream AI-generated
- Readers don't trust the content

A good redesign answers: *"Every design choice here was intentional, locked to brand, and proves quality."*

---

## Phase 1: Establish the Brief (20 min)

### 1.1 — Read & Document Brand Intent

**From brand-context.md:**
- Purpose (what WISE² does)
- Audience (who is reading this)
- Positioning (premium, builder-focused, enterprise, etc.)
- Mood (organized chaos? minimalist? cyberpunk? enterprise?)

**From brand-brief:**
- Locked colors (e.g., Navy #050607, Cyan #00D9FF, Neon #00FF7F, Gold #C4A369)
- Locked typography (system sans-serif, no serifs)
- Forbidden patterns (no cream, no gradients, no rounded-full, no Inter alone)
- Layout intent (grid-based? information-dense? high-contrast?)

### 1.2 — Set TasteSkill Dials

Establish three design decisions **before writing code**:

| Dial | Scale | Our Choice |
|------|-------|-----------|
| **Design Variance** | 1–10 (samey ↔ experimental) | [e.g., 7 = organized chaos, intentional] |
| **Motion Intensity** | 1–5 (static ↔ kinetic) | [e.g., 4 = GSAP scroll triggers, high-energy] |
| **Visual Density** | 1–10 (sparse ↔ packed) | [e.g., 6 = grid-based, information-dense] |

**Example for WISE².net redesign:**
- Variance: 7 (grid layout, but with feature categories, metrics, value prop — not generic cards)
- Motion: 4 (hover states, border transitions, scroll-trigger reveals)
- Density: 6 (metrics row, feature grid, value section — all organized, no whitespace waste)

### 1.3 — Identify Page Purpose

What decision does this page drive?
- Hero page → brand introduction + CTA
- Systems page → portfolio display + status badges
- Pricing → tier comparison + billing toggle
- Services → feature showcase + call to action

**Defines:** Layout structure, CTA placement, information hierarchy

---

## Phase 2: Audit Baseline (10 min)

Run unslop scanner on current code:

```bash
npm run audit:unslop -- apps/website/app/page.tsx
# or via Medium skills: /impeccable or /unslop-ui
```

**Document baseline**:
- Vibe score (4000+ = strong AI defaults)
- High-severity tells (Cormorant serif, centered 3-card, cream, gradients)
- Medium-severity tells (generic borders, Inter-only, soft shadows)
- What's compliant already

**Example baseline:**
```
Vibe Score: 4,215
High-severity: 244 (mostly serifs in Sencere, gradients in pricing)
Medium-severity: 1,729
→ Action: Remove gradients, replace serifs, enforce navy + cyan borders
```

---

## Phase 3: Rebuild (60–90 min)

### 3.1 — Lock Brand Colors

Replace all dynamic colors with locked palette:

```tsx
// BEFORE (generic)
className="text-blue-500 hover:bg-blue-100"

// AFTER (brand-locked)
className="text-[#00D9FF] hover:bg-[#00D9FF]/10"
```

**Color mapping**:
| Role | Locked Color | Usage |
|------|--------------|-------|
| **Background** | #050607 (navy) | Page, sections, deep contrast |
| **Secondary BG** | #0a0f1a (charcoal) | Alternating sections |
| **Primary CTA** | #00D9FF (cyan) | Buttons, links, focus states |
| **Success/Active** | #00FF7F (neon) | Status badges, checkmarks |
| **Accent** | #C4A369 (gold) | Secondary CTAs, premium tier |
| **Body Text** | #D1D5DB (light gray) | Primary text |
| **Muted Text** | #B7C0CB (medium gray) | Secondary, descriptions |

### 3.2 — Lock Typography

System sans-serif only. No serifs except client projects (marked `unslop-ignore`).

```tsx
// BEFORE
className="font-serif font-bold" // ❌ Serif default

// AFTER
className="font-sans font-bold uppercase tracking-tight" // ✅ System + uppercase
```

**Rules:**
- Headings: uppercase, bold, -0.02em letter-spacing
- CTAs: uppercase, bold, letter-spacing 0.12em
- Body: system font, regular weight, 0.5em+ line-height
- No Inter alone (requires Tailwind config update)

### 3.3 — Enforce Layout Intent

Grid-based, organized chaos. No scattered cards.

```tsx
// BEFORE (semantic but scattered)
<div className="flex flex-col gap-4">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>

// AFTER (grid, intentional)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <div key={item.id} className="border border-[#00D9FF]/30 bg-[#0a0f1a] p-6...">
      {/* Organized chaos: intentional layout, high contrast */}
    </div>
  ))}
</div>
```

### 3.4 — Remove AI Tells

**Forbidden patterns:**
- ❌ Cream backgrounds (#f5f1f0, #fffcf9)
- ❌ Gradients (linear-gradient, from-X-500/20)
- ❌ Rounded-full (rounded-9999px, rounded-full on buttons)
- ❌ Heavy blurs or glows (blur-2xl, drop-shadow-2xl)
- ❌ Serif fonts (Cormorant, Bodoni, Instrument Serif) — except marked client projects
- ❌ Generic hero + 3-card layouts (without a clear brief)
- ❌ Inter font alone
- ❌ Over-spaced whitespace (too many py-24 sections in a row)

**Replace with:**
- ✅ Navy + cyan + neon brand colors
- ✅ Sharp corners (0–4px radius, no rounded-full)
- ✅ System sans-serif (uppercase for emphasis, not styles)
- ✅ Intentional borders (1px cyan/gold, hover brightens)
- ✅ High contrast (light text on dark, or dark on light)
- ✅ Grid-based structure

---

## Phase 4: Multi-Page Workflow (If Rebuilding > 1 Page)

### 4.1 — Prioritize Pages

**Tier 1 — Primary Brand Pages** (rebuild first):
- Homepage
- Systems/Products
- Pricing
- Services
- About

**Tier 2 — Secondary Pages** (rebuild if time):
- Community
- Docs/API
- Demos
- Case studies

**Tier 3 — Client Projects** (preserve, mark `unslop-ignore`):
- Sencere Creative (separate brand, serif branding intentional)
- BLAKKHAIL (partner brand)
- Any third-party site under WISE² infra

### 4.2 — Batch Commits

Group related pages into semantic commits:

```bash
# Commit 1: Homepage
git commit -m "feat: rebuild wise2.net homepage with TasteSkill & brand lock
- Hero section: expanded with organized chaos layout
- Features grid: 6-item grid with color-coded categories
- Metrics section: live projects, builders, revenue, uptime
- Value proposition: grid with brand-locked colors"

# Commit 2: Secondary Pages
git commit -m "feat: rebuild secondary pages with TasteSkill & WISE² brand lock
- Systems page: 8-system grid with status badges
- Pricing page: 4-tier cards with billing toggle
- Services page: Service offerings with features
- All pages: high-contrast, intentional layouts, no serifs"
```

---

## Phase 5: Audit & Verify (15 min)

### 5.1 — Run Post-Rebuild Audit

```bash
npm run audit:unslop -- apps/website/app
```

**Expected results:**
- Vibe score may increase slightly (new content = new findings, expected noise)
- High-severity tells should stay ~same (client projects are separate)
- Main brand pages should show compliance (navy + cyan, no serifs, no gradients)

### 5.2 — Visual QA Checklist

**For every page, verify in browser:**

- [ ] Navy background (#050607) used as primary
- [ ] Cyan (#00D9FF) used for primary CTAs
- [ ] Neon green (#00FF7F) used for status badges/success states
- [ ] Gold (#C4A369) used for secondary accents
- [ ] All text is system sans-serif (no serifs)
- [ ] Headings are uppercase and bold
- [ ] No cream backgrounds
- [ ] No gradients or heavy blurs
- [ ] No rounded-full buttons/pills
- [ ] Borders are sharp (0–4px) and cyan/gold
- [ ] Hover states brighten or shift color (not fade out)
- [ ] Grid layout is intentional (not scattered cards)
- [ ] Information density matches dial target (not too sparse or cramped)
- [ ] All CTAs are uppercase, bold, letter-spaced

**Desktop + Mobile + Dark Mode:**
- [ ] Layout responsive at 375px (mobile)
- [ ] Layout responsive at 1024px (desktop)
- [ ] Colors consistent in dark mode
- [ ] Text readable at all sizes

### 5.3 — Content Check

- [ ] Hero message is clear (1–2 sentences max)
- [ ] CTAs are specific ("Start Free Trial", not "Sign Up")
- [ ] Feature descriptions are concise (one line max)
- [ ] No placeholder text, emoji only where intentional
- [ ] Pricing is transparent (no hidden fees, clear billing cycle)

---

## Phase 6: Document & Close (10 min)

### 6.1 — Create Rebuild Summary

File: `docs/WISE2_<SECTION>_REBUILD_FINAL_<DATE>.md`

**Contents:**
- What got rebuilt (pages, components)
- Brand lock applied (colors, typography, layout)
- Audit results (before/after vibe score)
- Pages NOT rebuilt (client projects, secondary pages)
- Next steps (config alignment, optional phases)
- Key files & commits

### 6.2 — Update Memory

Save project state to `/Users/danielwise/.claude/projects/-Users-danielwise-Projects-wise2-core/memory/`:

- `wise2_net_rebuild_complete.md` — status, audit results, next steps
- Update `MEMORY.md` index

### 6.3 — Update CLAUDE.md

```markdown
## WISE².net Redesign Complete (2026-09-21)

✅ **wise2.net main pages rebuilt** with TasteSkill + brand lock:
- Homepage: Organized chaos layout (features grid + metrics + value prop)
- Systems page: 8-system grid with status badges
- Pricing page: 4-tier cards with billing toggle
- Services page: Service offerings with features

**Brand Lock Applied**:
- Navy #050607, Cyan #00D9FF, Neon Green #00FF7F, Gold #C4A369
- System sans-serif (no serifs)
- Grid layouts, high-contrast, professional

**Commits**: [commit hashes]
**Docs**: `docs/WISE2_NET_REBUILD_FINAL_*.md`
**Next**: Tailwind config alignment (~30 min)
```

---

## Anti-Patterns (Never Do This)

- ❌ Rebuilding before reading the brand brief
- ❌ Mixing serif and sans-serif on the same page
- ❌ Using more than 1–2 font sizes (h1, body, caption)
- ❌ Updating Tailwind config colors mid-rebuild (do it after, in separate commit)
- ❌ Force-fitting client projects into main brand lock
- ❌ Claiming redesign is done without visual QA in browser
- ❌ Leaving Tailwind legacy colors (e.g., #0369A1, #0094FF)
- ❌ Centering everything (asymmetric layouts feel more intentional)
- ❌ One giant hero with centered text (add sections below)
- ❌ Abandoning the audit (vibe score tells you if you actually fixed the tells)

---

## Related Skills

- **taste-skill** — design direction framework (sets the dials)
- **impeccable** — remove default AI design aesthetics
- **unslop-ui** — audit for AI tells (scanner + reporter)
- **redesign-skill** — general redesign methodology
- **soft-skill** — teach the AI to design like a high-end agency

---

## Quick Checklist: Am I Done?

✅ Brief established (dials set, colors locked)
✅ Pages rebuilt (colors, typography, layout applied)
✅ Audit run (baseline → post-rebuild vibe score)
✅ Visual QA passed (browser check, all boxes ticked)
✅ Docs written (rebuild summary + memory updated)
✅ CLAUDE.md updated (status + next steps)
✅ Commits batched (semantic, clean git history)

**If all boxes ticked: Ship it.** If not: Verify what's blocking each box.

---

**Last Updated**: 2026-09-21  
**Owner**: WISE² Design  
**Status**: PRODUCTION LIVE
