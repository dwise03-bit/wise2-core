# WISE² United Design System — Ecosystem Design Amendment

**Status:** Approved direction / implementation design
**Date:** 2026-08-30
**Primary repo:** `dwise03-bit/wise2-core`
**Applies to:** wise2.net, Business OS web surfaces, WISE² iOS/iPadOS, Android-facing UI, HVAC/field surfaces, client portals, sales/demo surfaces

## 1. Goal

Make the approved WISE² United visual language the shared presentation system for the WISE² ecosystem without replacing the locked Business OS architecture or working backend foundations.

The Business OS remains the operational architecture. WISE² United becomes its canonical visual and brand layer.

## 2. Canonical Visual Direction

The approved WISE² United reference establishes:

- near-black / carbon / gunmetal environments
- dimensional metallic/chrome W² identity
- acid/electric WISE² green as the primary brand accent
- controlled purple accents for SenCere Creative LLC where division identity requires it
- cinematic nighttime city / industrial atmosphere on marketing surfaces
- wet reflective materials and premium street-luxury visual language where appropriate
- futuristic HUD geometry, thin technical borders, telemetry marks, and command-center framing
- bold dimensional display typography for marketing headlines
- premium, high-contrast operational UI for software surfaces

Canonical messaging includes:

- `BUILDING EMPIRES. CHANGING CULTURE.`
- `TOGETHER WE BUILD LEGACY.`
- `ONE VISION. ONE SYSTEM. ONE FAMILY.`

These are brand/campaign lines; operational UI should prioritize clarity over decorative typography.

## 3. Identity and Face Preservation Rule

When supplied real-person source imagery is used, faces must not be regenerated, face-swapped, beautified, reshaped, or reinterpreted.

Preserve recognizable facial identity, facial proportions, eyes, nose, mouth, smile/teeth, skin tone, hairline, facial hair, and other identity-bearing features. Environment, graphic overlays, framing, lighting treatment, and approved wardrobe/brand treatments may change without altering the face itself.

Implementation consequence: approved real-person imagery is treated as a protected source asset. UI code must use the supplied raster/vector asset rather than an AI-generated substitute.

## 4. Brand Naming Rule

`PIFF CITY` is retired from active WISE² ecosystem presentation.

All new active creative-division references use:

**SenCere Creative LLC**

Do not silently rewrite archival records, historical documents, or source data whose purpose is to preserve history. User-facing active navigation, marketing, demos, dashboards, and new documentation use SenCere Creative LLC.

## 5. Shared Token Layer

Create one reusable WISE² United token layer and map platform-native representations to it.

### Core semantic colors

- `united.bg.primary`: near black
- `united.bg.elevated`: carbon/gunmetal
- `united.surface.metal`: dark metallic surface
- `united.text.primary`: high-contrast white/silver
- `united.text.secondary`: cool muted silver
- `united.brand.green`: electric/acid WISE² green
- `united.brand.chrome`: metallic silver treatment
- `united.division.sencere`: controlled purple accent when SenCere context is explicit
- `united.status.success`: green semantic success
- `united.status.info`: restrained blue/cyan information state
- `united.status.warning`: amber
- `united.status.critical`: red

Brand green and semantic success must remain distinguishable through iconography, labels, or value context rather than color alone.

### Geometry

- thin technical borders
- clipped/angled HUD corners on signature containers
- restrained corner radius on ordinary operational cards
- dimensional separators and rails
- subtle grid/telemetry textures only where they do not reduce readability

### Effects

- restrained glow around active/selected states
- chrome/metal treatment reserved for identity, display headlines, and high-level navigation moments
- no excessive glass blur
- no continuous expensive animation behind operational content

## 6. Two Presentation Modes

The same token system supports two density modes.

### United Cinematic

Use for:

- wise2.net hero and major campaign sections
- client presentations
- launch visuals
- ecosystem overview
- high-impact demo/marketing moments

May use skyline/industrial imagery, reflections, dimensional logo treatment, stronger HUD framing, and large campaign typography.

### United Operational

Use for:

- Business OS
- iOS/iPadOS/Android-facing application UI
- HVAC Field Tech
- CRM
- finance
- dispatch
- AI approvals
- client portals

Preserve black/gunmetal/chrome/green identity but reduce decoration, increase legibility, support one-handed/mobile workflows, and maintain accessible contrast and touch targets.

The software must never become a poster.

## 7. Business OS Shell

Preserve existing Business OS information architecture and backend contracts.

Restyle the shell around:

- W² chrome identity in global navigation
- United HUD side rail / top rail treatments
- electric-green active navigation state
- carbon/gunmetal content surfaces
- consistent KPI cards
- AI recommendation/approval cards
- command input / Command Orb
- live status indicators
- division/workspace badges

Primary owner dashboard continues to prioritize:

- revenue
- jobs
- active technicians
- estimates
- outstanding AR
- margin alerts
- new leads
- AI recommendations
- schedule
- technician status
- calls
- business health

No demo KPI may be presented as live production data without an authoritative source.

## 8. WISE² IMP Team

Use the established Business OS AI workforce architecture. Present specialized roles consistently under the United visual system.

Core visible roles may include:

- Owner / Executive IMP
- Sales IMP
- Dispatch / Operations IMP
- Money / Finance IMP
- Marketing IMP
- Tech / HVAC Diagnostic IMP

Each agent card exposes state, current job, approvals, result summaries, failure/retry state, and provider/cost metadata where available.

AI authority remains governed by the existing permission model; visual treatment must clearly distinguish read/analyze/recommend/prepare/approval-required/approved-automation states.

## 9. HVAC and Field Experience

HVAC remains a specialized Work workspace, not a separate data silo.

Apply United Operational styling to:

- today's route
- customer/property
- equipment history
- measurements
- photos/notes
- diagnostic workflow
- supported Fieldpiece/device integrations
- estimates
- approval
- job completion

Field use requirements override decoration:

- high contrast
- minimum practical touch targets
- one-handed operation for core flows
- reduced motion support
- clear offline/cached/live indicators
- warnings never communicated by color alone

## 10. Public Website

wise2.net becomes the cinematic front door to the same Business OS product.

Recommended page hierarchy:

1. United cinematic hero
2. WISE² Business OS promise
3. business problems / money leaks
4. interactive command-center preview
5. IMP AI workforce
6. operating workflow
7. HVAC flagship vertical
8. permission/approval engine
9. verified integrations
10. onboarding journey
11. packages / conversion path
12. FAQ
13. final WISE² Audit CTA

Primary conversion remains the WISE² Audit / business assessment rather than exposing infrastructure complexity first.

## 11. Division Architecture

WISE² United is the umbrella visual system.

Current active division presentation includes WISE² Business OS, Wise Shine where applicable, SenCere Creative LLC, WISE² HVAC, and other approved WISE² workspaces/products.

Each division may receive a controlled accent while retaining shared United chrome, black, typography, geometry, and command-system identity.

SenCere Creative LLC uses its approved identity and may use purple selectively; do not label it PIFF CITY.

## 12. Platform Mapping

### Web / Next.js

Create shared design tokens/components rather than page-specific hard-coded styles. Existing routes and working business logic remain intact.

### iOS/iPadOS

Map United tokens to SwiftUI colors/materials/components. Preserve the existing native SwiftUI architecture, AuthManager, APIClient, AppState strategy, Keychain auth, and five-tab shell unless a tested incompatibility is found.

### Android-facing surfaces

Use the same semantic token contract and interaction hierarchy. Do not create a visually unrelated Android theme.

### Client portals

Use United Operational as the default shell with client-brand accents only where appropriate. WISE² remains visible as the platform/powered-by identity according to product rules.

## 13. Migration Strategy

Implement as an incremental migration, not a rewrite.

1. Inventory current tokens, logos, fonts, shared components, and active brand references.
2. Add United semantic tokens.
3. Build shared United primitives.
4. Migrate Business OS shell.
5. Migrate high-traffic dashboard modules.
6. Migrate mobile shell/components.
7. Migrate HVAC/field surfaces.
8. Update wise2.net cinematic sales surfaces.
9. Update client portal shell.
10. Remove active PIFF CITY presentation references after verifying they are not archival/historical data.
11. Run visual regression, responsive, accessibility, and functional tests.

At each stage, preserve existing APIs and data contracts unless a separate approved architecture change is required.

## 14. Asset Policy

- Store approved canonical assets in a documented brand-assets location.
- Do not overwrite source/reference imagery destructively.
- Use optimized derivatives for runtime delivery while preserving the source master.
- Real-person imagery must use the approved source/reference asset; no generated face substitutes.
- Logo variants must preserve W² geometry and legibility.
- Record which assets are marketing-only versus safe for in-app runtime use.

## 15. Performance and Accessibility

- decorative imagery must not block first meaningful operational content
- use responsive image sizing and modern formats where supported
- avoid animation that causes dashboard jank
- respect reduced-motion preferences
- preserve text contrast
- do not use chrome effects on body copy
- maintain mobile touch-target requirements
- status requires text/icon reinforcement

## 16. Testing

Required migration checks:

- existing unit/API tests remain green
- navigation and auth smoke tests
- Business OS dashboard smoke tests
- iOS primary navigation smoke tests
- HVAC critical-flow smoke tests
- viewport checks for phone/tablet/desktop
- visual snapshots for shared United primitives where supported
- accessibility checks for contrast, labels, touch targets, and reduced motion
- repository scan confirms no new active PIFF CITY user-facing references
- protected-face assets are referenced rather than regenerated

## 17. Non-Goals

This amendment does not:

- replace `wise2-core`
- replace the locked Business OS backend architecture
- replace the native iOS app with a web wrapper
- move business logic into presentation code
- create fake integrations
- create fake live metrics
- authorize AI actions beyond existing permission rules
- redesign every client brand into identical WISE² green

## 18. Definition of Done

WISE² United is successfully integrated when the public site, Business OS, mobile control plane, HVAC/field surfaces, and client portal shell visibly belong to one premium ecosystem while preserving the underlying product architecture and operational clarity.

A user should immediately recognize:

**WISE² United** — one system, one visual language, multiple powered businesses/workspaces.

The experience should communicate:

**BUILDING EMPIRES. CHANGING CULTURE.**

while the operational product continues to answer:

- What is happening?
- What needs attention?
- Where is money being lost?
- What does WISE² recommend?
- What is WISE² authorized to handle?

**TOGETHER WE BUILD LEGACY.**
