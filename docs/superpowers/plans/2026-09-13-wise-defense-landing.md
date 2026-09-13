# WISE DEFENSE Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the approved WISE DEFENSE / KNIGHT WING public landing page on `wisedefensellc.com` without breaking existing protected dashboard/API routes.

**Architecture:** Update the existing `apps/dashboard/app/wise-defense-landing/page.tsx` route already served by nginx at the public domain. Keep the protected `/wise-defense/dashboard` and `/api/wise-defense/*` systems unchanged. Add only public static assets and presentation/config needed by the landing page, using real Daniel photography from supplied assets and preserving a rollback branch.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, existing WISE2 Core nginx/VPS deployment.

**Spec:** `docs/superpowers/specs/2026-09-13-wise-defense-landing-design.md`

## Global Constraints

- Use `KNIGHT WING` as the public edge-intelligence product name.
- Do not expose private incident, watch-zone, radio, mesh, or device telemetry on the public landing page.
- SDR messaging must remain receive-only awareness/monitoring.
- Use Daniel's real supplied photographs; do not regenerate or alter his likeness.
- Preserve `TRAIN. TEACH. PROTECT.` and `QUEENSBRIDGE. STILL STANDING.`.
- Keep typography centrally replaceable.
- Do not ship fabricated contact details, testimonials, credentials, or unverified statistics as facts.
- Preserve existing `/wise-defense/dashboard` and `/api/wise-defense/*` behavior.
- Do not modify unrelated WISE2 services.

---

### Task 1: Lock rollback point and inventory live landing assets

**Files:**
- Inspect: `apps/dashboard/app/wise-defense-landing/page.tsx`
- Inspect: `deploy/nginx/wisedefensellc.com.conf`
- Inspect: `apps/website/public/wise-defense/instructors/*`
- Create/modify only if required: `apps/dashboard/public/wise-defense/*`

**Interfaces:**
- Consumes: current `wisedefensellc.com` nginx route and existing landing page.
- Produces: confirmed source route, asset paths, and rollback branch `wise-defense-landing-v2`.

- [ ] **Step 1: Confirm nginx root route**

Verify `deploy/nginx/wisedefensellc.com.conf` sends `/` to `/wise-defense-landing` and preserves `/wise-defense/dashboard`.

- [ ] **Step 2: Confirm current landing implementation**

Read `apps/dashboard/app/wise-defense-landing/page.tsx` and note existing links, metadata, and public-only content.

- [ ] **Step 3: Confirm Daniel assets**

Use the supplied real Daniel car photo and range photo as new public assets. Do not substitute generated people.

- [ ] **Step 4: Preserve rollback**

All implementation work stays on branch `wise-defense-landing-v2`; `main` remains the production rollback reference until verification is complete.

### Task 2: Add real WISE DEFENSE visual assets

**Files:**
- Create: `apps/dashboard/public/wise-defense/daniel-car.jpg`
- Create: `apps/dashboard/public/wise-defense/daniel-range.jpg`
- Create: `apps/dashboard/public/wise-defense/wise-defense-mark.png`
- Optional create: `apps/dashboard/public/wise-defense/queensbridge-bg.webp`

**Interfaces:**
- Consumes: supplied source images from the current project handoff.
- Produces: stable public asset URLs `/wise-defense/daniel-car.jpg`, `/wise-defense/daniel-range.jpg`, `/wise-defense/wise-defense-mark.png`.

- [ ] **Step 1: Add the real car photo**

Copy the original Daniel seated-in-silver-car source image without AI regeneration.

- [ ] **Step 2: Add the real range photo**

Copy the original Daniel aiming-at-range source image without AI regeneration.

- [ ] **Step 3: Add the approved silver WISE DEFENSE mark**

Use the supplied clean silver mark asset.

- [ ] **Step 4: Verify asset integrity**

Confirm dimensions are suitable for responsive rendering and source files remain visually unchanged except for optional non-destructive format conversion.

### Task 3: Rebuild the public landing page around the locked hero

**Files:**
- Modify: `apps/dashboard/app/wise-defense-landing/page.tsx`

**Interfaces:**
- Consumes: public assets from Task 2 and existing protected dashboard route.
- Produces: responsive landing page at `/wise-defense-landing`.

- [ ] **Step 1: Replace the current generic hero**

Implement the locked hero structure:

```text
QUEENSBRIDGE. STILL STANDING.
TRAIN.
TEACH.
PROTECT.
FIREARMS TRAINING FOR REAL LIFE.
BUILT ON DISCIPLINE. DRIVEN BY PURPOSE.
[ BOOK TRAINING ] [ VIEW COURSES ]
```

The real Daniel car photo occupies the right side and remains the primary human focal point. Use layered CSS atmosphere for black/gunmetal city mood; if a Queensbridge background asset is available, layer it behind Daniel without altering Daniel.

- [ ] **Step 2: Implement production navigation**

Use working section anchors for Home, Training, About, Courses, KNIGHT WING, and Contact. Keep the protected dashboard linked separately.

- [ ] **Step 3: Implement credibility strip**

Render Real World Training, Safety First Always, All Levels Welcome, and Built on Experience using semantic icon/text blocks.

- [ ] **Step 4: Implement About Daniel section**

Use the real range photo and the approved safety-focused quote. Keep copy focused on instruction, discipline, responsible ownership, and preparedness.

- [ ] **Step 5: Implement training cards**

Render Basic Firearms, Concealed Carry, Home Defense, and Advanced Training cards with non-operational safety-focused descriptions and working course/contact links.

- [ ] **Step 6: Implement configurable stats**

Do not state unverified counts as confirmed facts. Use neutral proof points such as `SAFETY FIRST`, `REAL WORLD`, `ALL LEVELS`, `MISSION FOCUSED` unless verified numerical values already exist in approved business data.

### Task 4: Add KNIGHT WING public product section

**Files:**
- Modify: `apps/dashboard/app/wise-defense-landing/page.tsx`

**Interfaces:**
- Consumes: protected route `/wise-defense/dashboard`.
- Produces: public marketing preview for KNIGHT WING with no sensitive telemetry.

- [ ] **Step 1: Add KNIGHT WING header and tactical-bat identity treatment**

Use public copy:

```text
KNIGHT WING
EDGE INTELLIGENCE NODE
LOCAL AWARENESS. OFFLINE RESILIENCE. MISSION READY.
```

- [ ] **Step 2: Add public capability cards**

Show:

```text
CRIME RADAR — local incident awareness
SDR MONITORING — receive-only radio-frequency awareness
MESH NETWORKING — resilient local connectivity
WEATHER ALERTS — local weather intelligence
OFFLINE FIRST — local-first resilient operation
```

- [ ] **Step 3: Add a non-live visual dashboard preview**

Render a clearly illustrative map/radar panel and spectrum graph using CSS/SVG only. Do not expose real incident coordinates, frequencies tied to private usage, device identifiers, authentication state, or watch-zone data.

- [ ] **Step 4: Link authenticated operations separately**

Provide `OPEN KNIGHT WING` linking to `/wise-defense/dashboard`; protected routing remains unchanged.

### Task 5: Accessibility, responsive layout, and naming audits

**Files:**
- Modify: `apps/dashboard/app/wise-defense-landing/page.tsx`

**Interfaces:**
- Consumes: completed landing page.
- Produces: accessible desktop/tablet/mobile public page.

- [ ] **Step 1: Mobile verification**

Ensure hero stacks correctly, text remains legible, buttons are at least 44px high, no horizontal overflow exists, and Daniel images use deliberate object positioning.

- [ ] **Step 2: Accessibility pass**

Use semantic landmarks, logical headings, meaningful alt text, visible focus states, and `prefers-reduced-motion` compatible effects.

- [ ] **Step 3: Naming audit**

Search new public landing code for legacy `IMP`, `BLACK OPS`, `Black Ops`, and `black ops` wording. New public presentation must use `KNIGHT WING`.

- [ ] **Step 4: Link audit**

Confirm no `href="#"` dead links remain.

### Task 6: Test and build

**Files:**
- No production file changes unless failures require fixes.

**Interfaces:**
- Consumes: dashboard app after Tasks 2-5.
- Produces: evidence that the branch is buildable.

- [ ] **Step 1: Install workspace dependencies if needed**

Run from repository root using the repo's pnpm workspace.

- [ ] **Step 2: Lint dashboard app**

Run the dashboard package lint command or workspace equivalent and resolve landing-page errors introduced by this branch.

- [ ] **Step 3: Typecheck**

Run the dashboard package typecheck or workspace equivalent. Expected: exit 0.

- [ ] **Step 4: Build**

Run the production dashboard build. Expected: exit 0 and `/wise-defense-landing` included successfully.

- [ ] **Step 5: Existing route smoke tests**

Verify `/wise-defense/dashboard` and existing WISE Defense APIs still resolve as before.

### Task 7: Deploy and verify VPS production

**Files:**
- Deployment-only; no unrelated service changes.

**Interfaces:**
- Consumes: verified branch/build.
- Produces: live `https://wisedefensellc.com/` landing page with retained rollback.

- [ ] **Step 1: Confirm remote access and clean production state**

Verify the authorized VPS is online, identify the currently deployed git SHA/container image, and record it as rollback target.

- [ ] **Step 2: Deploy only the affected dashboard/frontend service**

Use the existing WISE2 Core VPS/nginx deployment process. Do not restart PostgreSQL, Redis, API, Hermes, Discord, or unrelated apps unless required by the existing compose dependency chain.

- [ ] **Step 3: Verify nginx**

Run nginx config validation before reload/restart. Expected: configuration valid.

- [ ] **Step 4: Public smoke test**

Verify HTTPS 200/redirect chain for `https://wisedefensellc.com/` and visual landing route.

- [ ] **Step 5: Protected route smoke test**

Verify `/wise-defense/dashboard` still reaches the protected system and API health endpoints still return expected authenticated/unauthenticated behavior.

- [ ] **Step 6: Record deployment result**

Document deployed commit SHA, frontend container/service, verification results, and exact rollback SHA/image.
