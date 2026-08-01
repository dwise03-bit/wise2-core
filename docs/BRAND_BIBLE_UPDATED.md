# WISE² BRAND BIBLE — MASTER REFERENCE
**Version**: 12.0 (EMPIRE IDENTITY)  
**Date**: 2026-08-01  
**Status**: CANONICAL — All implementations must conform to this  
**Supersedes**: v11.0 "Organized Chaos" (2026-07-14)

---

## VISUAL REFERENCE
**Master Hero**: `WISE2_BRAND_HERO_EMPIRE.png` — the authoritative brand image  
**Brand Board**: Published artifact — WISE² Brand Identity System v12.0  
**Previous**: `WISE2_DESIGN_SYSTEM_MASTER_VISUAL.png` (retired, kept for archive)

---

## PRODUCT IDENTITY

### Name
**WISE²** (superscript 2)

### Taglines
- **Primary**: "BUILDING EMPIRES, CHANGING CULTURE"
- **Secondary**: "One System. Three Powered Businesses. Four Leaders."
- **Tertiary**: "Together We Build Legacy."

### Core Promise
One platform where you build, sell, deploy, monitor, automate, recover, and scale — no fragmented tools, no compromise.

### Positioning
AI-native business operating system for builders who ship, not theorize. Built by hustlers who design, implement, and execute.

### Location
Atlanta, GA — 33.7490° N, 84.3880° W

---

## COLOR SYSTEM

### Primary Palette

| Token | Name | Hex | RGB | Usage |
|-------|------|-----|-----|-------|
| `--void` | Void Black | #07080A | 7, 8, 10 | Primary ground. All page backgrounds. |
| `--void-elevated` | Elevated Surface | #0E1015 | 14, 16, 21 | Cards, panels, raised surfaces. |
| `--void-surface` | Surface Border | #14161C | 20, 22, 28 | Borders, dividers, subtle separation. |
| `--empire-green` | Empire Green | #39FF14 | 57, 255, 20 | Primary accent. Logo glow, CTAs, active states, links. |
| `--empire-green-dim` | Empire Green Dim | #1A8A0A | 26, 138, 10 | Muted green for backgrounds, inactive states. |
| `--chrome` | Chrome | #C8CCD4 | 200, 204, 212 | Primary text color. Body copy, descriptions. |
| `--chrome-bright` | Chrome Bright | #E8EAEF | 232, 234, 239 | Headlines, emphasis text, bright UI elements. |
| `--chrome-dim` | Chrome Dim | #6B7080 | 107, 112, 128 | Secondary text, captions, metadata. |
| `--signal-white` | Signal White | #F0F0F2 | 240, 240, 242 | Maximum emphasis. Logo wordmark, hero text. |

### Sub-Brand Accents

| Token | Name | Hex | Division | Usage |
|-------|------|-----|----------|-------|
| `--studio-purple` | Studio Purple | #9333EA | Piff City | Creative division accent. Only in Piff City contexts. |
| `--studio-purple-dim` | Studio Purple Dim | #5B21B6 | Piff City | Muted purple for backgrounds, borders. |
| `--gold` | Gold Thread | #C5A55A | Wise Defense | Tertiary warmth. Connectors, premium details, legacy markers. |
| `--gold-dim` | Gold Dim | #8B7540 | Wise Defense | Muted gold for backgrounds, borders. |

### Semantic Colors

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--success` | Success | #39FF14 | Same as Empire Green — success is brand-aligned. |
| `--warning` | Warning | #F59E0B | Caution states, approaching limits. |
| `--danger` | Danger | #EF4444 | Errors, destructive actions, critical alerts. |
| `--info` | Info | #3B82F6 | Informational states, neutral highlights. |

### Glow Effects (Sparingly)

```css
/* Empire Green glow — for logo, focus states, active elements */
box-shadow: 0 0 20px rgba(57, 255, 20, 0.15);
text-shadow: 0 0 40px rgba(57, 255, 20, 0.15);

/* Studio Purple glow — Piff City contexts only */
box-shadow: 0 0 20px rgba(147, 51, 234, 0.15);
```

---

## BRAND ARCHITECTURE

```
                    WISE²
            Business Operating System
            Empire Green + Chrome + Void
                      │
          ┌───────────┼───────────┐
          │           │           │
    WISE SHINE    PIFF CITY   WISE DEFENSE
    Premium       Creative    Security &
    Detailing     Studios     Technology
    Empire Green  Studio      Gold Thread
                  Purple
```

### Division Rules
- **WISE²** (Parent): Empire Green + Chrome on Void Black. All technology, infrastructure, and platform identity.
- **Wise Shine**: Inherits Empire Green. Premium automotive care. Precision, luxury, wet-look finishes.
- **Piff City Creative Studios**: Studio Purple (#9333EA). Music production, media, creative services. Its own visual world.
- **Wise Defense**: Gold Thread (#C5A55A). Security, protection, technology services. Understated, never flashy.
- **Judio Production**: Operates under Piff City's visual identity.

### Color Isolation Rule
Sub-brand colors NEVER cross divisions. Studio Purple never appears on Wise Shine materials. Gold Thread never appears on Piff City materials. Empire Green is the only color shared across all divisions (as the parent brand connector).

---

## TYPOGRAPHY

### Hierarchy

| Role | Weight | Case | Tracking | Color | Size Range |
|------|--------|------|----------|-------|------------|
| **Display / Hero** | 800 (ExtraBold) | UPPERCASE | +0.06em | Chrome Bright / Signal White | 36–72px |
| **Section Title** | 700 (Bold) | UPPERCASE | +0.04em | Chrome | 18–24px |
| **Body** | 400 (Regular) | Sentence case | Normal | Chrome Dim | 14–16px |
| **Label / Overline** | 600 (SemiBold) | UPPERCASE | +0.15em | Empire Green | 10–12px |
| **Data / Technical** | 500 (Medium) | UPPERCASE | +0.04em | Chrome Dim | 12–14px |

### Font Stack
```css
--font-display: 'Segoe UI', system-ui, -apple-system, sans-serif;
--font-body: 'Segoe UI', system-ui, -apple-system, sans-serif;
--font-mono: 'SF Mono', 'Cascadia Code', 'Fira Code', monospace;
```

### Rules
- Headlines are ALWAYS uppercase with wide letter-spacing
- Body text uses sentence case, max 60ch line length
- Monospace for all technical data, ports, URLs, stats
- No serif fonts anywhere in the system
- `text-wrap: balance` on all headlines

---

## MESSAGING HIERARCHY

### Level 1 — Primary Tagline
**"BUILDING EMPIRES, CHANGING CULTURE"**

### Level 2 — Structure
**"One System. Three Powered Businesses. Four Leaders."**

### Level 3 — Legacy
**"Together We Build Legacy."**

### Level 4 — Action Description
"The AI-native business operating system for builders who ship, not theorize."

### Level 5 — Promise
"Build. Sell. Deploy. Monitor. Automate. Recover. Scale. — One platform, no fragmented tools."

### Level 6 — CTA
"START BUILDING" (primary green button)

---

## BRAND VOICE

### Personality
- **Hustler**: We execute, not theorize
- **Builder**: We ship production-grade systems
- **Empire**: We think multi-business, multi-division
- **Legacy**: We build for permanence, not trends
- **Culture**: We represent Atlanta, creativity, and ambition

### Tone
- Direct, no-nonsense
- Confident, never arrogant
- Empowering, action-oriented
- Professional but never corporate
- Speaks to builders and founders, not enterprises

### Language
- Active voice always
- Short, punchy sentences
- Technical when needed, never jargon for jargon's sake
- "We build" not "Solutions are provided"
- "Ship it" not "Deploy the deliverable"

---

## VISUAL DESIGN PRINCIPLES

### 1. Dark Mode Exclusively
Void Black (#07080A) for all backgrounds. No light mode. No white backgrounds. The brand lives in darkness — the green and purple glow against it.

### 2. Chrome Text, Not White
Text is Chrome (#C8CCD4), not pure white. Chrome Bright (#E8EAEF) for emphasis. Signal White (#F0F0F2) only for the logo wordmark and hero-level text. This creates the metallic, industrial feel.

### 3. Glow Is Earned
Neon glow effects are reserved for:
- The WISE² logo mark
- Active/focused interactive elements
- Success states
- Never on static text, never on backgrounds, never on cards

### 4. Elevated Surfaces
Cards and panels use Elevated Surface (#0E1015) with Surface Border (#14161C) edges. No drop shadows. No gradients. Flat, layered darkness.

### 5. Industrial Typography
All headlines are uppercase, tracked wide, heavy weight. This is not a friendly SaaS — it's a command center for builders.

---

## KEY MODULES

### Platform Modules
1. **Command Center** — Central hub, AI orchestration, system health
2. **SoundLab** — Audio production, brand sounds, music creation
3. **Live Studio** — Livestream management, multi-platform broadcasting
4. **Print Shop** — 3D printing, DTF transfers, production management
5. **CRM & Clients** — Customer relationships, prospect pipeline
6. **Analytics** — Real-time dashboards, performance metrics
7. **Marketing Suite** — Campaigns, content, social posting
8. **Developer API** — Webhooks, integrations, documentation
9. **Second Brain** — Knowledge management, RAG, Hermes AI
10. **Automation Engine** — Event-driven workflows, triggers, jobs

---

## COMPONENT STYLING

### Buttons
```css
/* Primary CTA */
background: var(--empire-green);
color: var(--void);
font-weight: 700;
letter-spacing: 0.06em;
text-transform: uppercase;
border-radius: 6px;

/* Secondary */
background: transparent;
border: 1px solid var(--chrome-dim);
color: var(--chrome);

/* Danger */
background: var(--danger);
color: var(--signal-white);
```

### Cards
```css
background: var(--void-elevated);
border: 1px solid var(--void-surface);
border-radius: 8px;
/* No shadows. No gradients. */
```

### Input Fields
```css
background: var(--void);
border: 1px solid var(--void-surface);
color: var(--chrome);
border-radius: 6px;
/* Focus: border-color: var(--empire-green); */
```

### Navigation
- Left sidebar, ~240px, Void Black
- Active item: Empire Green text + left border accent
- Inactive: Chrome Dim text
- Icons: Chrome Dim, Empire Green when active

---

## CSS CUSTOM PROPERTIES (Complete)

```css
:root {
  /* Ground */
  --void: #07080A;
  --void-elevated: #0E1015;
  --void-surface: #14161C;

  /* Brand */
  --empire-green: #39FF14;
  --empire-green-dim: #1A8A0A;
  --empire-green-glow: rgba(57, 255, 20, 0.15);

  /* Text */
  --chrome: #C8CCD4;
  --chrome-bright: #E8EAEF;
  --chrome-dim: #6B7080;
  --signal-white: #F0F0F2;

  /* Sub-brands */
  --studio-purple: #9333EA;
  --studio-purple-dim: #5B21B6;
  --studio-purple-glow: rgba(147, 51, 234, 0.15);
  --gold: #C5A55A;
  --gold-dim: #8B7540;

  /* Semantic */
  --success: #39FF14;
  --warning: #F59E0B;
  --danger: #EF4444;
  --info: #3B82F6;

  /* Typography */
  --font-display: 'Segoe UI', system-ui, -apple-system, sans-serif;
  --font-body: 'Segoe UI', system-ui, -apple-system, sans-serif;
  --font-mono: 'SF Mono', 'Cascadia Code', 'Fira Code', monospace;
}
```

---

## RETIRED FROM v11.0

The following elements from the v11.0 "Organized Chaos" identity are **retired**:

| Retired | Was | Replaced By |
|---------|-----|-------------|
| Electric Blue (#0055FF) | Primary accent | Empire Green (#39FF14) |
| Accent Red (#FF5535) | CTA / alerts | Danger Red (#EF4444) — semantic only |
| "ORGANIZED CHAOS COMMAND CENTER" | Product name | "WISE² Business OS" |
| "BUILD. AUTOMATE. DOMINATE." | Primary tagline | "BUILDING EMPIRES, CHANGING CULTURE" |
| "The AI Operating System for Modern Business" | Secondary tagline | "One System. Three Powered Businesses. Four Leaders." |
| "START FREE TODAY" | CTA text | "START BUILDING" |
| Blue/Red interactive scheme | Button colors | Green primary + Chrome secondary |

---

## DO's

- Dark mode exclusively — Void Black ground
- Empire Green for all primary interactive elements
- Chrome text hierarchy (Bright → Standard → Dim)
- Bold, uppercase headlines with wide tracking
- Studio Purple ONLY in Piff City contexts
- Gold Thread ONLY in Wise Defense contexts
- Neon glow sparingly, on focus/active states
- High contrast — WCAG AA minimum
- Monospace for technical data

## DON'Ts

- Light mode or white backgrounds
- Electric Blue as primary (retired)
- Red as accent color (retired — red is semantic danger only)
- Pastel or muted tones
- Serif fonts
- Lowercase-only headlines
- Generic SaaS copy or stock imagery
- Sub-brand colors outside their division
- Glow effects on static elements
- Drop shadows on cards

---

## VALIDATION CHECKLIST

Before shipping any WISE² UI:
- [ ] Void Black (#07080A) background throughout
- [ ] Empire Green (#39FF14) for primary actions and accents
- [ ] Chrome text hierarchy applied correctly
- [ ] Headlines uppercase with letter-spacing
- [ ] No Electric Blue or Accent Red from v11.0
- [ ] Sub-brand colors isolated to their divisions
- [ ] Glow effects only on interactive/active elements
- [ ] "BUILDING EMPIRES, CHANGING CULTURE" messaging visible
- [ ] Responsive design tested on mobile/tablet/desktop
- [ ] WCAG AA contrast ratios met
- [ ] Monospace used for all technical/data content

---

**Owner**: Wise Defense LLC  
**Founders**: Daniel Wise, Darrin  
**Maintained By**: Claude Code (Architecture)  
**Last Updated**: 2026-08-01  
**Status**: CANONICAL REFERENCE — v12.0 EMPIRE IDENTITY
