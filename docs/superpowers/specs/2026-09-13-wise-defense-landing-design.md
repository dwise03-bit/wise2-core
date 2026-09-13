# WISE DEFENSE Landing Page Deployment Design

## Goal
Update the public WISE DEFENSE landing experience on wisedefensellc.com to the approved cinematic brand direction while preserving the existing wise2-core backend, protected dashboard routes, APIs, nginx routing, and rollback path.

## Scope
- Update only the public WISE DEFENSE presentation layer and directly related static assets/routes.
- Preserve existing WISE Defense APIs, database services, Redis, Discord, monitoring, and unrelated WISE2 services.
- Keep existing protected dashboard functionality intact.

## Approved Layout
- Header/navigation
- Cinematic Queensbridge hero
- Daniel seated in the silver vehicle using supplied real photography
- TRAIN. TEACH. PROTECT. headline
- QUEENSBRIDGE. STILL STANDING. eyebrow
- Booking and courses CTAs
- Credibility strip
- About section
- Training course cards
- Configurable stats
- KNIGHT WING public product section
- Mission callout
- Final CTA
- Footer

## Image Rules
Use supplied real Daniel source photography. Cropping, masking, compositing, positioning, and global color grading are allowed. Do not regenerate or substitute Daniel's likeness.

## KNIGHT WING
Use KNIGHT WING as the public edge-intelligence product name. Public visuals may show Crime Radar, receive-only SDR status, mesh status, weather alerts, and offline/local operation concepts without exposing private operational data.

## Typography
Typography remains intentionally replaceable via centralized theme variables.

## Deployment
Use the existing VPS/nginx/wise2-core path. Create a feature branch/worktree, preserve the current production revision, implement and test the landing page, build successfully, deploy only the affected frontend service, verify the root domain and protected routes, and retain rollback.

## Verification
- HTTPS root loads successfully.
- Approved hero composition is present.
- Real Daniel imagery is used.
- KNIGHT WING naming is used.
- No unwanted legacy public labels remain.
- Existing dashboard/API routes continue to work.
- No fabricated contact details or unverified claims ship as facts.
- Mobile and desktop layouts work without overflow.
- Lint, typecheck, tests, and production build pass.
- Previous production revision is documented for rollback.

## Definition of Done
The approved landing page is live on wisedefensellc.com, production checks pass, existing protected WISE Defense functionality remains healthy, and a tested rollback path is available.
