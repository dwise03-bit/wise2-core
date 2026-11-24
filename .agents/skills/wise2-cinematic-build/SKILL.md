---
name: wise2-cinematic-build
description: Audit reference footage and build, test, and independently verify cinematic WISE² web experiences with motion, 3D, Canvas, performance and accessibility gates.
---
# WISE² Cinematic Build Skill

## Trigger
Use when asked to audit a reference video, build or improve a WISE² landing page, recreate cinematic motion, or enforce WISE² visual quality across client sites.

## Evidence and boundaries
Reference: 14.87-second vertical screen recording dated 2026-11-22 22:44:41. Visible examples: floating blue/white product objects with large typography; dark cinematic heading/compass-like circular dial; overlaid creator caption 'Client paid 4000 $'. Visible technical text mentions THREE.CanvasTexture, redraw once per second with needsUpdate=true, hand-angle calculations, and one accent per section. These are snippets, not a complete verified implementation. The $4000 caption is a creator claim, not proof of sale or a pricing benchmark.

## Mandatory workflow
1. AUDIT: sample frames throughout source; document visible layout, palette, typography, 3D objects, animation, interaction, responsiveness and uncertainties. Do not infer hidden behavior from stills.
2. SPEC: produce visual-first WISE² × D's Sauce recipe (Salt/Lettuce/BBQ/Truffle/Buffalo), module choices, wireframe, motion storyboard, asset inventory, performance budget, acceptance tests and estimate. Obtain approval before production where required.
3. BUILD: implement in existing repo, reuse components, avoid duplicate routes/assets. Prefer semantic HTML and CSS/GSAP for ordinary UI motion; use Three.js/WebGL only where depth or genuine 3D materially improves experience. CanvasTexture for dynamic instrument textures; set texture.needsUpdate=true only when changed. Avoid unnecessary redraw loops.
4. ACCESSIBILITY: keyboard navigation, visible focus, reduced-motion alternative, text contrast, image alt text, graceful WebGL fallback and mobile-friendly touch targets.
5. PERFORMANCE: lazy-load 3D, cap device pixel ratio, compress models/textures, limit concurrent animation loops, pause offscreen work, test mobile Safari and low-power devices. Target LCP <=2.5s, CLS <=0.1, INP <=200ms at p75 where measurable; report actual measurement conditions rather than claiming unmeasured success.
6. QA: run lint, typecheck, tests, production build; compare screenshots/video against reference at mobile and desktop widths; inspect console/network errors; test links, menus, interaction, reduced motion, and asset loading.
7. DEPLOY: use authorized WISE² Commander/GitHub workflow; preserve audit log and rollback path. Never report deployed without deployment evidence.
8. INDEPENDENT VERIFY: check public production URL, TLS, HTTP status, rendered content, responsive layout and critical interactions from outside build process. Report verified, failed, and unverified separately.
9. ARCHIVE: save approved assets, source, build logs, screenshots, deployment evidence and lessons in Sauce Vault.

## Reference-specific visual direction
- Scene A: luminous pale blue/white product environment, floating product objects, bold oversized typography, subtle parallax and controlled lighting.
- Scene B: deep teal/charcoal instrument panel with central circular dial, fine tick marks, restrained glowing ring and minimal side controls.
- Avoid generic glowing dashboard overload, illegible type, decorative 3D with no narrative role, excessive animation, and copied brand assets.
- For dial hands, derive angles from current time/state and render at an appropriate update rate; one-second updates are suitable for clock-like displays, not smooth continuous motion.

## Required output contract
Return: (1) evidence-based audit, (2) implementation spec, (3) changed files, (4) tests and measurements, (5) deployment evidence, (6) independently verified production status, (7) remaining risks. Never substitute mockups for functioning code or confuse a local preview with a live site.
