# WISE² Cinematic Website Handoff™

A reusable, brand-adaptive skill for taking a conversational website idea to a design, image/video-generation, Figma, and implementation-ready visual handoff. It was derived from the supplied 12-project WISE² reference collection; it retains the production standard while preventing those brands from becoming a default look.

## What it produces

- A complete 20-part cinematic website handoff
- Visual-board, asset-manifest, image-prompt, and video-prompt templates
- Responsive, motion, UI-integration, and implementation requirements
- JSON schemas for intake, assets, and visual boards
- Reference patterns and an independent premium mobile-detailing acceptance run

## Use

1. Install/copy the `wise2-cinematic-website-handoff` folder into your Codex skills directory, or make it available as a project skill.
2. Invoke `$wise2-cinematic-website-handoff` with the business idea, available brand material, target audience, and any locked decisions.
3. Complete the handoff with `templates/production_handoff.md`; create only the asset and prompt records needed to build it.
4. Run `powershell -ExecutionPolicy Bypass -File scripts/validate-skill.ps1` from this folder, then use `templates/qa_checklist.md` before handoff.

## Design logic

The standard is fixed: 4K-ready, hyper-realistic scene design, credible materials and light, environmental storytelling, connected UI, motion restraint, and responsive art direction. Brand DNA is variable: industry, pace, materials, color, cultural cues, character use, and conversion path determine the world.

Source material is preserved unchanged in the original supplied ZIP. Its distilled patterns are documented in [reference-implementations.md](references/reference-implementations.md).
