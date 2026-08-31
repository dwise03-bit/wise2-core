# WISE² UI Constitution

## Prime directive
Approved visual references are the source of truth. Reproduce them faithfully; do not reinterpret, simplify, modernize, or replace them with generic SaaS/UI templates unless explicitly requested.

## Mandatory workflow
REFERENCE -> INSPECT -> MEASURE -> BUILD -> RUN -> SCREENSHOT -> COMPARE -> CORRECT -> REPEAT -> VERIFY.

A build is not complete merely because it compiles. Visual work requires rendered comparison against the approved reference.

## Before coding
1. Inspect the repository and existing implementation.
2. Locate logos, imagery, fonts, design tokens, and previous approved screens.
3. Preserve working architecture, routes, APIs, authentication, integrations, and deployment behavior.
4. Identify which assets and visual regions are identity-locked.

## Reference forensics
Analyze composition, typography, colors, surfaces, geometry, imagery, layering, spacing, crop, lighting, glow, shadows, borders, and responsive behavior. Use measurable differences rather than random CSS tweaks.

## Identity lock
Approved portraits, people, logos, mascots, products, devices, vehicles, artwork, and branded graphics are identity-locked. Do not redraw, regenerate, beautify, swap, or silently alter them. Use the actual supplied asset whenever available.

## Brand separation
WISE² products and client brands may have different visual identities. Do not leak colors, mascots, taglines, or art direction from one brand into another. The current project's approved reference wins.

## No generic AI website
Do not default to a generic nav + centered gradient headline + three cards + pricing + FAQ layout. Framework components are primitives, not the brand.

## Layered construction
Prefer explicit visual layers: base background, environment/artwork, atmosphere, texture/grid, technical decoration, panels, typography, controls, highlights, and interaction.

## Components and tokens
Centralize reusable colors, surfaces, spacing, radii, typography, glow, border, and layout tokens. Build reusable WISE² primitives where patterns genuinely repeat, while allowing each product to retain its own theme.

## Desktop and responsive fidelity
For desktop references, establish desktop fidelity first, then adapt intentionally at 375, 390, 430, 768, 1024, 1280, 1440, and 1728px. Mobile must preserve brand hierarchy and key artwork while remaining touch-usable; never merely shrink desktop.

## Mobile apps
Match approved headers, navigation, cards, gauges, data visualization, typography, spacing, controls, iconography, backgrounds, states, and selected/unselected treatment while respecting native ergonomics.

## Operational dashboards
Every panel should answer what is happening, what needs attention, what changed, what can be controlled, or what should happen next. Avoid meaningless filler analytics.

## Instrumentation
When a reference uses professional instrumentation, do not replace it with generic progress bars. Preserve radial gauges, segmented meters, digital readouts, status rings, pressure/temperature/electrical displays, and other appropriate instrumentation.

## Visual difference loop
After implementation, capture the target viewport and compare it side-by-side with the reference. Fix differences in this order:
1. Page structure
2. Hero composition
3. Imagery/crop
4. Typography scale
5. Major colors/surfaces
6. Section sizing
7. Card geometry
8. Spacing
9. Shadows/glows
10. Micro-alignment

If two correction passes still miss badly, stop random tweaking and diagnose structural causes such as wrong assets, DOM structure, container sizing, aspect ratio, font, positioning model, breakpoint, missing layers, crop, inherited CSS, or component overrides.

## Screenshot scorecard
Rate Composition, Typography, Color, Artwork, Spacing, Geometry, Lighting/effects, Responsive behavior, Brand fidelity, and Functional fidelity from 0-10. No category should be below 8; target overall fidelity is 9/10 or better.

## Asset-first policy
Search existing public/assets/images/media/static/resources/branding/design/reference/uploads paths before drawing substitutes. Never replace an available logo, portrait, product render, or branded graphic with a placeholder.

## Functionality preservation
Visual work must not break authentication, APIs, forms, routing, CRM/payment/device integrations, streaming, synchronization, deep links, analytics, environment variables, or server communication.

## Real states
Account for loading, loaded, empty, offline, disconnected, error, partial data, permission denied, success, updating, disabled, selected, hover, focus, and pressed states where applicable.

## Animation
Use restrained, purposeful animation: subtle entrances, status pulses, instrument movement, hover illumination, smooth number transitions. Avoid gratuitous bouncing, spinning, floating, or distracting perpetual motion. Respect reduced motion.

## Accessibility and performance
Maintain semantic structure, keyboard navigation, focus states, ARIA where required, contrast, readable type, alt text, optimized images/fonts/bundles, and efficient rendering.

## Anti-drift
Before changing an approved screen ask: does this directly support the requested change? If not, leave it alone. Preserve already-correct sections and prevent regressions.

## Visual reference record
For major screens maintain `docs/design/VISUAL_REFERENCE.md` using the project template. Record the project, brand, reference, locked assets, palette, typography, layout/responsive rules, do-not-alter items, known differences, and current visual score.

## Completion evidence
Before declaring visual work complete report BUILD, TYPECHECK, TESTS, DESKTOP VISUAL QA, MOBILE VISUAL QA, ASSET FIDELITY, and any known differences. Never hide behind “similar,” “inspired by,” or “general feel.”

## Absolute override
Whenever an agent's design preference conflicts with an approved reference, the approved reference wins.
