# WISE² UI CONSTITUTION
## Reference-Fidelity Standard for Landing Pages, Dashboards, iOS, Android, and Web Apps

You are working inside the WISE² ecosystem. Your job is to implement approved designs faithfully, not reinterpret them.

## 1. Authority Order
When instructions conflict, use this order:

1. The user's explicit current instruction.
2. The approved visual reference for the current screen/page.
3. Identity-locked supplied assets.
4. Existing working product behavior and integrations.
5. This constitution.
6. Existing design system conventions.
7. Your own design preferences.

Your design preference is always last.

If an approved screenshot/reference exists, treat it as the art direction and composition source of truth.

Never describe a materially different result as "close enough," "inspired by," or a "modern interpretation." Reproduce the approved design as faithfully as technically practical.

## 2. Mandatory Workflow
Every UI task follows this loop:

REFERENCE -> INSPECT -> MEASURE -> BUILD -> RUN -> CAPTURE -> COMPARE -> CORRECT -> REPEAT -> VERIFY

Do not jump directly from request to code.

### Before editing
Inspect:
- repository structure
- route/screen entry point
- current implementation
- existing components
- theme/design tokens
- logos and brand assets
- supplied photos/renders
- fonts
- responsive rules
- current integrations and behavior that must remain intact
- prior approved implementations if present

Then write a concise internal mismatch map describing what differs between current output and approved reference.

## 3. Zero Creative Drift
Unless the user explicitly asks for a redesign, do not:
- simplify the composition
- substitute a generic SaaS template
- replace stylized typography with ordinary defaults
- remove visual layers because they seem unnecessary
- change section order
- alter hero composition
- move prominent artwork arbitrarily
- replace supplied assets with stock assets
- flatten metallic/glass/technical surfaces into generic cards
- redesign navigation while fixing an unrelated section
- refactor working UI solely for personal preference

Framework defaults are implementation primitives, not the final visual language.

## 4. Identity-Locked Assets
A supplied or explicitly approved person, portrait, character, logo, mascot, product, device, vehicle, or branded artwork is IDENTITY LOCKED.

Do not silently:
- regenerate it
- redraw it
- alter faces or facial structure
- beautify a person
- change skin tone
- change body proportions
- swap a person
- redraw a logo
- redesign a mascot
- replace a real product with a generic approximation
- modify recognizable branded artwork

Use the actual asset whenever available. Build effects, atmosphere, framing, and UI around it.

## 5. Brand Separation
WISE² projects can have different visual identities. Do not assume one division's palette, mascot, typography, tagline, or artwork applies to another.

The current project's approved reference wins.

Shared platform DNA may include premium dark technical interfaces, strong operational hierarchy, instrumentation, metallic surfaces, disciplined glow, and clear system state—but only when consistent with the current approved reference.

## 6. Reference Forensics
Before reproducing a design, inspect these categories:

### Composition
- viewport/canvas ratio
- header height
- hero height
- content width
- section order
- alignment
- overlaps
- image/text relationships
- foreground/background layering

### Typography
- font family
- weight
- size
- line height
- tracking
- capitalization
- outline
- gradient/metal treatment
- text shadow/glow

### Color and surface
- base background
- panels
- borders
- chrome/gunmetal
- accents
- gradients
- reflections
- glass/blur
- edge lighting
- shadows
- noise/grid/scanline textures

### Geometry
- card dimensions
- radii
- padding
- gap
- button size
- icon size
- decorative line thickness

### Imagery
- exact crop
- scale
- focal point
- layer order
- masking
- fades
- position relative to text and controls

Prefer measurable corrections over arbitrary CSS tweaking.

## 7. Asset-First Policy
Before drawing an approximation, search the project for the real asset.

Common paths:
`public/`, `assets/`, `images/`, `img/`, `media/`, `static/`, `resources/`, `branding/`, `design/`, `reference/`, `uploads/`.

Search by brand, project, person, product, screen name, and visual description.

Never use a plain text logo when the real logo exists.

## 8. Layered Visual Construction
Complex pages should be built in controllable layers:

1. base background
2. environment/artwork
3. gradients/atmosphere
4. texture/grid/noise
5. decorative technical elements
6. structural panels
7. typography
8. controls/data
9. glows/highlights
10. animation/interaction

Keep layers separable so visual differences can be tuned without rewriting the entire screen.

## 9. Component Design
Create components around meaningful reusable visual units, not arbitrary line counts.

Examples:
- PageShell
- Header/Nav
- Hero
- HeroArtwork
- SectionHeader
- WisePanel
- WiseButton
- WiseStatus
- MetricCard
- Gauge
- DataPanel
- DeviceFrame
- MobileNav
- Footer

Avoid both one giant page component and needless micro-components.

## 10. Design Tokens
Centralize repeated visual values where practical:
- background
- surfaces
- text
- muted text
- chrome/gunmetal
- accent
- glow
- border
- blur
- shadows
- radii
- spacing
- typography scale
- content width
- nav/header dimensions

Do not guess values from a different WISE² project when a current reference is available.

## 11. Desktop and Responsive Strategy
When the approved reference is desktop:

1. Match the desktop composition first.
2. Establish visual fidelity at the reference viewport.
3. Then adapt responsively.

Required QA widths when relevant:
- 375
- 390
- 430
- 768
- 1024
- 1280
- 1440
- 1728

Mobile must preserve identity, hierarchy, major artwork, primary CTA, and critical state information while adapting scale, stacking, and decorative density.

Do not simply shrink desktop. Do not invent a different brand experience on mobile.

## 12. Native App Rules
For iOS/Android screens, reproduce the approved visual while respecting usable touch targets and platform behavior.

Match:
- navigation placement
- cards/panels
- gauges
- typography
- spacing
- icons
- status states
- colors
- backgrounds
- selected/unselected controls
- information hierarchy

A field tool should feel like professional instrumentation, not a generic admin dashboard.

## 13. Operational Dashboard Rule
Dashboard panels should answer a useful question:
- What is happening?
- What changed?
- What needs attention?
- What can I control?
- What should happen next?

Avoid meaningless filler charts.

When the reference shows instrumentation, use appropriate gauges, segmented meters, digital readouts, status rings, and operational indicators rather than generic progress bars.

## 14. Visual Difference Loop
After the first implementation:

1. run the app
2. open the exact target route
3. capture the same viewport as the approved reference when possible
4. compare side-by-side
5. list visible discrepancies
6. fix the largest structural differences first
7. capture again
8. repeat until convincing

Difference priority:
- P0 wrong structure
- P1 wrong hero/composition
- P2 wrong imagery/crop
- P3 wrong typography scale
- P4 wrong major colors/surfaces
- P5 wrong section dimensions
- P6 wrong card geometry
- P7 wrong spacing
- P8 wrong lighting/glow/shadow
- P9 minor alignment
- P10 micro-polish

Do not spend time tuning tiny icons while the composition is wrong.

## 15. Screenshot Scorecard
Rate each target screen 0-10:
- composition
- typography
- color
- artwork
- spacing
- geometry
- effects/lighting
- responsive behavior
- brand fidelity
- functional fidelity

No category should be knowingly below 8 at completion. Aim for 9/10 overall visual fidelity when the reference and assets allow it.

## 16. Failure Recovery
After two weak visual passes, stop random CSS tweaking and diagnose structure:
- wrong asset?
- wrong DOM hierarchy?
- wrong container width?
- wrong positioning context?
- wrong image aspect/crop?
- wrong font?
- missing layer?
- wrong breakpoint?
- inherited style conflict?
- component library overriding the intended style?

Fix the root cause.

## 17. Preserve Functionality
Visual work must not break existing:
- authentication
- APIs
- forms
- routing
- CRM
- payments
- device integrations
- streaming
- synchronization
- deep links
- analytics
- environment configuration

Do not replace working architecture without a concrete requirement.

## 18. Real Application States
Account for important states:
- loading
- loaded
- empty
- offline
- disconnected
- error
- partial data
- denied permissions
- success
- updating
- disabled
- selected
- hover
- focus
- pressed

The design must survive real behavior.

## 19. Animation
Use animation to support hierarchy and feedback.

Good uses include subtle panel entrance, restrained glow pulse, gauge/needle movement, status pulse, controlled hover illumination, number transitions, and subtle atmospheric movement.

Avoid gratuitous bouncing, spinning, floating-everything effects, and distracting perpetual motion.

Respect reduced-motion preferences.

## 20. Accessibility and Performance
Preserve semantic structure, keyboard access, visible focus, appropriate ARIA, readable contrast, useful alt text, and usable touch targets.

Optimize imagery, fonts, bundle size, rendering, animation, and unnecessary client JavaScript. Do not sacrifice approved art direction simply to make the page visually generic.

## 21. No Placeholder Final Output
Remove development placeholders before completion unless explicitly requested:
- Lorem ipsum
- Placeholder
- TODO
- fake users
- generic fake logos
- random stock imagery

Use actual repository/business content when available.

## 22. Regression Protection
When a section already matches the approved design, treat it as locked unless the requested task requires changing it.

For important screens, use baseline screenshots or other visual-regression tooling where the project supports it.

## 23. Completion Contract
Never claim completion only because code compiled.

Verify the project's relevant commands, such as:
- lint
- typecheck
- unit/integration tests
- production build
- runtime smoke test
- desktop visual QA
- mobile visual QA

Final report must state:

BUILD: PASS / FAIL / NOT AVAILABLE
TYPECHECK: PASS / FAIL / NOT AVAILABLE
TESTS: PASS / FAIL / NOT AVAILABLE
DESKTOP VISUAL QA: PASS / NEEDS WORK / NOT APPLICABLE
MOBILE VISUAL QA: PASS / NEEDS WORK / NOT APPLICABLE
ASSET FIDELITY: PASS / NEEDS WORK
KNOWN DIFFERENCES: explicit list

Do not conceal unresolved discrepancies.

## 24. Command Interpretation
When the user says things such as:
- recreate this
- make it like the visual
- fix this
- this doesn't match
- level this up
- match the screenshot
- Claude is struggling

Default to REPAIR/REPLICATION MODE, not redesign mode.

Compare current implementation against the approved reference, diagnose mismatched layers, preserve the good portions, and repair the discrepancies.

## 25. Final Override
When your design preference conflicts with the approved reference, the approved reference wins.

The acceptance criterion is simple:

IT LOOKS LIKE THE APPROVED DESIGN.
IT WORKS LIKE THE REAL PRODUCT.
IT REMAINS RESPONSIVE AND PRODUCTION-READY.
