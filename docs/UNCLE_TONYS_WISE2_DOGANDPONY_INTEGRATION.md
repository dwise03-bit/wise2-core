# WISE² × Uncle Tony's Freeze Dry WISE × Dog & Pony Show

## Source and scope
Source: Uncle-Tonys-Partner-Handoff-2026-11-22.zip, prepared November 22, 2026. This is a development demo, not a completed marketplace. Keep the original handoff archive private because it contains a family photograph and audio.

## Architecture
- WISE² Core: business OS, Hermes orchestration, Living Hive project approval and evidence tracking.
- Uncle Tony's: separate branded Next.js experience. Preserve selected owl, walnut styling, candle-glow treatment and existing home design.
- Dog & Pony Show: investor-facing showcase at /dogandpony, with a clearly labeled Uncle Tony's concept section. Do not imply active restaurant partnerships, approvals, payments or fulfillment.
- Proposed public path: /uncletonys, **only after** review-only deployment security requirements are met. Prefer an isolated service behind a reverse proxy rather than copying its root app into the WISE² website.

## Actual handoff implementation
- Homepage: app/page.tsx, app/layout.tsx, app/globals.css, app/home-depth.css
- Demo browse: /browse, no verified listings
- Local request intake: /request and /api/requests; .demo-data/demo.sqlite; NOT suitable for public production
- Bearer-link status: /status/[id]; NOT a production identity control
- /demo: fictional browser-only operational examples
- lib/feasibility.ts and lib/tracking.ts: tested helper rules, not real authorization, payments, shipping or tracking
- Audio and family photo are excluded by .gitignore; do not commit them without explicit rights and distribution approval

## Safe integration phases
1. Archive original ZIP privately and verify checksums. Record owner approvals and media rights.
2. Build isolated staging with Node >=24; npm ci; npm test; npm run typecheck; npm run build; npm run test:e2e (set WISE_BROWSER_PATH on Linux). No public customer intake. Protect preview with authentication.
3. Connect WISE²/Hermes via documented, authenticated APIs and feature flags. Keep AI recommendations advisory only; no automated regulatory, facility, recipe, or route approvals.
4. Replace local SQLite with durable PostgreSQL, authenticated roles, auditable transactions, retention controls, suppression/consent and secure media storage.
5. Verify partner agreements, food safety and facility permissions, eligibility and real inventory before listings, checkout, outreach or shipping.
6. Independently verify the preview, investor page and production route separately with HTTP response, expected content, browser tests and rollback readiness.

## Launch gates
- Website and domain: independent public verification
- Lead capture: secure and tested, or disabled
- Commercial readiness: real payment and partner approvals, or disabled
- Onboarding: role/identity and consent tests
- Security and recovery: independent review
- Production acceptance: documented independent checks

## Current status
Integration specification only. No server upload, public deployment, live meeting URL or production approval is claimed.
