---
type: decision
date: 2026-07-07
tags: [wise2, brand, visual-identity, historical]
ai-first: true
confidence: high (historical)
status: SUPERSEDED
---

⚠️ **DEPRECATED 2026-07-12**

This decision has been **superseded** by the canonical brand system documented in `docs/DESIGN_SYSTEM.md` v10.0 (2026-07-11).

**Key differences from current spec:**
- This doc specifies **orange (#FF6B35)** as the secondary accent; current spec uses **purple (#B300FF)**.
- This doc specifies **dark-mode only**; current spec supports **dual-mode (dark + light)**.

Kept for historical decision-making reference only.

---

# Brand Decision: Neon Cyberpunk Aesthetic (HISTORICAL RECORD)

## For future Claude

**Decision:** Wise² Core brand identity is neon cyberpunk with holographic floating UI elements. Primary colors are neon blue (#00D9FF) and orange (#FF6B35) on dark backgrounds. Visual language is futuristic, high-tech, and cinematic — inspired by sci-fi interfaces like Iron Man's JARVIS.

**Who:** Daniel Wise (founder), Claude Code (design)  
**When:** 2026-07-07  
**Status:** Locked in, live on landing page  
**Rationale:** Differentiates from generic SaaS landing pages; matches infrastructure-as-art positioning

---

## Context

Initial landing page was "basic AI-generated garbage" (founder quote) — generic startup template with minimal personality. User rejected it and showed reference image of neon tech comic aesthetic with two characters: "The Idea Hunter" and "The System Builder."

Realization: Wise² Core isn't a typical SaaS — it's infrastructure for operators who don't compromise. The brand should feel like advanced technology, not corporate minimalism.

---

## The Decision

### Visual Identity

**Primary Colors:**
- Neon Blue: `#00D9FF` — Main accent, glow effects, primary interactive elements
- Dark Background: `#000000` — Deep black with subtle gradients
- Orange: `#FF6B35` — Secondary accent for emphasis

**Aesthetic:**
- Floating holographic panels with glassmorphism
- Neon glow effects on text and borders
- Grid background overlay (subtle tech feel)
- Corner bracket accents (like sci-fi UI)
- Smooth animations (float, fade, pulse)

**Typography:**
- Bold, high-contrast headings
- Monospace for code/technical elements
- All-caps labels for tech feel

**Imagery:**
- Two-character narrative: Idea Hunter vs System Builder
- Cinematic, high-contrast photography
- Neon lighting (blue on dark)
- Comic/graphic novel panel layouts

### The Two Characters

**The Idea Hunter (Darren Wise)**
- Persona: Sees possibilities, revenue, scale
- Pain: Infrastructure distracts from building
- Tags: VISION, INSIGHT, INNOVATE

**The System Builder (Danny Wise)**
- Persona: Builds things that don't break
- Pain: Tired of setting up infrastructure from scratch
- Tags: ENGINEER, BUILD, DEPLOY

**Unified message:** "One sees the possibilities. One builds the reality. Together, we are Wise²."

---

## What This Means

### Landing Page Redesign
1. Full-screen comic hero (visual impact)
2. Neon blue/orange color scheme throughout
3. Floating holographic panel sections
4. Four-act journey narrative
5. Real founder outcomes (social proof)
6. Single email capture moment
7. No redundant CTAs or template patterns

### Brand System
- 5 brand guides created (strategy, voice, identity, messaging, D2C)
- 30 integrated skills from Brand-building repo
- Comprehensive brand documentation
- Color tokens, typography system, component patterns

### Technical Implementation
- Tailwind CSS v4 with neon color variables
- CSS backdrop blur for glassmorphism
- SVG icons with glow filters
- Smooth animations (fade-in, float, pulse)
- Responsive across mobile/tablet/desktop
- Dark mode only (brand commitment)

---

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| Minimal corporate (white/gray) | Generic, indistinguishable |
| Warm cream + terracotta | Nice but already overdone |
| Bright acid-green | Too harsh, not sophisticated |
| Purple-to-blue gradient | Template default, feels AI-generic |
| Playful/colorful | Wrong for infrastructure positioning |

---

## Implications

### What This Commits Us To
1. **Neon blue as primary** — Every screen, every marketing asset
2. **High-polish cinematic feel** — No rough edges, every pixel intentional
3. **Two-character narrative** — All copy anchors to Idea Hunter / System Builder duality
4. **Floating holographic UI** — Not just on landing page, but entire product
5. **Bold typography** — Clear hierarchy, high contrast, readable at all sizes
6. **No compromise** — Stick to the aesthetic even when tempted by trends

### Design Debt to Avoid
- ❌ Mixing neon with other accent colors (will dilute identity)
- ❌ Using sans-serif anywhere except body text
- ❌ Rounded corners on everything (establish rules for when to use them)
- ❌ Dropping the neon for "more professional" (this IS professional for our market)
- ❌ Adding light mode "for accessibility" (our users work in dark environments)

### Where This Appears
1. Landing page (wise2.net) ✅
2. API documentation
3. Admin dashboard
4. Marketing materials (blog, Product Hunt, Twitter)
5. Email templates
6. Social media (Twitter, LinkedIn, GitHub)
7. Product UI (future)

---

## How We Got Here

1. **Round 1:** Generic startup landing page → Rejected
2. **Round 2:** Founder-focused narrative page → Still "basic AI garbage"
3. **Round 3:** Founder provides neon comic reference image → aha moment
4. **Round 4:** Complete redesign with floating holographic panels → Locked in

**The breakthrough:** Stop trying to please everyone. Wise² Core is for operators who see infrastructure as art. Commit to that positioning fully.

---

## Next Steps

- [ ] Apply neon cyberpunk to admin dashboard (Q3)
- [ ] Create neon brand guidelines (100% locked in)
- [ ] Extend to email templates (waitlist, welcome)
- [ ] Launch Product Hunt with full brand applied
- [ ] Case studies with neon branding
- [ ] Collect founder testimonials in neon format

---

## Related Decisions

- [[ADR-004: Neon Cyberpunk]] — Technical implementation
- [[Brand Strategy - Positioning]] — Market positioning
- [[D2C Marketing - Launch]] — How we'll tell this story

---

**Decision owner:** Daniel Wise  
**Reviewed by:** Claude Code (design), Anthropic frontend-design skill  
**Status:** ✅ LOCKED IN, LIVE  
**Confidence:** high  
**Reversibility:** LOW (brand is now public, changing would confuse market)  
**Last updated:** 2026-07-07  
**Next review:** 2026-08-07 (or when Product Hunt launches)
