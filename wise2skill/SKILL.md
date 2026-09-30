---
name: wise2-cinematic-website-handoff
description: Turn a rough website or business idea into a 4K cinematic visual-production handoff, including a visual world, asset plan, generation prompts, motion, responsive rules, and implementation notes. Use for premium website visual direction and production handoffs; not for routine UI-only pages.
metadata:
  short-description: Build WISE² cinematic web handoffs
---

# WISE² Cinematic Website Handoff

Create a usable production handoff, not a mood-board summary. The invariant is production quality; the brand world must be derived afresh for every project.

## Non-negotiables

- Never introduce crowns or crown-like symbols, motifs, watermarks, or logos unless the user explicitly asks for one for this visual.
- Do not invent business claims, testimonials, certifications, metrics, or client lists. Mark reasonable visual choices as **Production assumption**.
- Treat generated imagery as scene plates: reserve copy and interface space; do not ask the model to render essential text or UI inside the image.
- Use realistic materials, physically plausible light, foreground/midground/background depth, controlled contrast, and a deliberate focal hierarchy. Avoid generic neon, stock-photo staging, arbitrary holograms, excessive flare, clutter, and unrelated cards over a background.
- Preserve approved decisions as **Locked decisions**. `NEXT` advances the next incomplete production step; `LOCK` records the current decision; `VISUAL` specifies or generates the next asset; `BUILD` moves into implementation; `HANDOFF` packages the current state.

## Start with an intake

Read [project_intake.md](templates/project_intake.md). Extract known facts, decisions already locked, and material unknowns. Ask one focused question only if it changes the visual system substantially; otherwise continue with labelled production assumptions.

Then define a compact creative direction: subject, audience, emotional temperature, camera language, palette, material cues, environmental story, and desired conversion action. For the shared quality bar and derived patterns, read [visual_standard.md](references/visual_standard.md) and [reference-implementations.md](references/reference-implementations.md).

## Build the handoff

Use [production_handoff.md](templates/production_handoff.md) and complete all twenty numbered sections. Select only the sections that serve the business story; never force a fixed page architecture.

For each hero and section scene, specify foreground, subject/midground, background, lighting sources, camera/lens feeling, depth, material behavior, desktop copy safe zone, mobile crop, and a reason the scene advances the narrative. Read the focused references only when needed:

- [cinematic_composition.md](references/cinematic_composition.md) for framing and section rhythm.
- [materials_lighting_ui.md](references/materials_lighting_ui.md) for believable surfaces and environment-bound UI.
- [motion_responsive.md](references/motion_responsive.md) for motion, crop, accessibility, and implementation guardrails.

Create the asset map using [asset_manifest.md](templates/asset_manifest.md), sorting entries into MUST HAVE, SHOULD HAVE, and OPTIONAL. Write every image prompt with [image_prompt.md](templates/image_prompt.md); write video-ready prompts only for scenes where motion materially adds value, using [video_prompt.md](templates/video_prompt.md).

## Validate before handoff

Run `scripts/validate-skill.ps1` for package integrity. Apply [qa_checklist.md](templates/qa_checklist.md) to the project handoff. Confirm desktop, tablet, and 9:16 mobile compositions—not merely a resized desktop crop—and reduce movement for `prefers-reduced-motion`.

## Deliver

Return the completed handoff, asset manifest, prompt sheets, and implementation notes. State the next build action and separately list locked decisions and production assumptions. See [premium-mobile-detailing.md](examples/premium-mobile-detailing.md) for a complete independent acceptance example.
