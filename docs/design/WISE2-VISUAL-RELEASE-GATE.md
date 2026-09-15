# WISE² Visual Release Gate

## Purpose
Customer-facing WISE² and client surfaces must be visually verified before production release. Automated checks provide repeatable evidence; they supplement, rather than replace, human review for flagship brand work.

## Verdicts
- `PASS`: all blocking criteria pass.
- `PASS WITH WARNINGS`: blocking criteria pass; documented non-blocking visual issues remain.
- `FAIL`: one or more blocking criteria fail.

## Required viewports
At minimum verify a representative desktop and mobile viewport. Add tablet and additional mobile dimensions when the product's users require them.

## Blocking automated criteria
- No uncaught/blocking console errors caused by the product
- No critical 4xx/5xx requests on required first-party assets/API calls
- No horizontal page overflow at required viewports
- Primary navigation is reachable and functional
- Primary CTA is visible and actionable
- Core page content renders without catastrophic layout shift
- Required forms can reach their intended validation/success/error states

## Visual quality criteria

### Brand
- Correct approved WISE²/client identity
- Approved colors and typography
- Supplied human likenesses remain faithful to approved references
- No accidental cross-brand assets

### Hierarchy
- One obvious primary action per major section
- Headings, supporting copy, metrics, and controls have clear hierarchy
- Dense dashboards remain scannable

### Layout
- Consistent spacing rhythm
- No clipped controls/text
- No unintended overlap
- Touch targets remain usable on mobile
- Content does not depend on hover on touch devices

### States
Verify applicable loading, empty, success, disabled, warning, and error states. An attractive happy path is insufficient.

### Motion
Animation must improve clarity, feedback, or polish. Respect reduced-motion behavior where applicable. Avoid animation that delays core interaction or makes dashboards harder to read.

### 3D / premium effects
Use only where the experience benefits. Provide practical mobile/performance fallbacks. Product operation must not depend on a decorative 3D scene loading successfully.

## Playwright implementation target
The existing Playwright suite should eventually cover representative public surfaces with assertions for console errors, failed critical requests, overflow, navigation, CTA visibility, and screenshots. Backend-only changes should not be blocked by frontend visual tests.

## Evidence
For each release retain enough evidence to identify URL/build, viewport, test result, screenshot where appropriate, blocking failures, warnings, and reviewer when human review is required.

## Release rule
`FAIL` blocks production. `PASS WITH WARNINGS` requires warnings to be recorded and accepted by the responsible owner. `PASS` may proceed through the normal deployment/health/rollback gates.
