# PromptOS Module: Visual Fidelity
## Design-to-Code Website Reconstruction

Use this module whenever you create or modify a customer-facing website from a design, screenshot, prototype, or written visual brief.

### Source of truth
- Inspect every supplied design reference before coding.
- Treat Figma Dev Mode measurements, variables, component variants, screenshots, and approved assets as authoritative.
- Reuse existing repository components and tokens before creating new ones.
- Never replace a distinctive asset with a placeholder, unrelated stock image, emoji, or generic icon.

### Build contract
- Reproduce composition, section order, container widths, grid alignment, spacing rhythm, typography, wrapping, colors, borders, shadows, image crops, overlays, and decorative details.
- Implement real responsive behavior for specified desktop, tablet, and mobile viewports; do not simply scale down desktop.
- Preserve accessibility, performance, and interaction quality while matching the approved visual direction.

### Visual verification loop
1. Render at the exact reference viewport dimensions.
2. Capture full-page, critical-section, and important interaction-state screenshots.
3. Compare each render with its approved reference or baseline.
4. Correct mismatches in order: composition and section heights; grid and spacing; typography and line wrapping; assets and image crops; colors, borders, and shadows; interaction states.
5. Repeat until no meaningful mismatch remains.

Use deterministic test data and stable fonts/assets. Mask only genuinely dynamic content. Do not approve or overwrite a visual baseline merely to make a test pass; intentional changes require human review.

### Completion report
Report viewport sizes checked, visual states covered, reusable components and tokens used, and any remaining intentional deviation with its reason. If a required reference, asset, font, or measurement is missing, identify it instead of inventing a visual direction.
