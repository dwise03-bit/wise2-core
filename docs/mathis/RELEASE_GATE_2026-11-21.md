# Mathis Electric release gate — 2026-11-21

## Implemented on this branch
- Authentic supplied logo, entrance video controls, responsive navigation and site sections.
- VOLT DECK component with four switchable visual skins, accessible transport, seeking and volume.
- Five approved humanized track titles and explicit missing-media handling.

## Media delivery required
Place the five **approved humanized** masters at these paths in the deployed website's public assets, or replace these paths with verified CDN URLs after upload:
- `/mathis/audio/high-voltage.wav`
- `/mathis/audio/after-hours.wav`
- `/mathis/audio/power-grid.wav`
- `/mathis/audio/never-lose-power.wav`
- `/mathis/audio/powered-by-purpose.wav`

Do not use original/non-humanized mixes. Soulful Current is excluded until its humanized master is delivered. Large files should use approved object storage/CDN instead of Git when appropriate. Confirm byte integrity against the handoff manifest.

## Required before production approval
1. Identify and verify all four approved cinematic scene sources; do not infer scene mapping from filenames.
2. Implement cinematic sequence and test fallback/skip/replay, mobile performance and reduced motion.
3. Confirm approved faceplate references and align player skins to them. Current skins are functional interpretations, not pixel-exact certified matches.
4. Confirm secure estimate destination and verified company details before enabling submissions.
5. Verify `NEXT_PUBLIC_MATHIS_GLOBE_URL` service availability, embedding policy and fallback.
6. Confirm the production reverse proxy routes `mathis.wise2.net/` to the intended Next.js route; current feature route is `/mathis-electric`.
7. Run `pnpm --filter @wise2/website type-check`, `pnpm --filter @wise2/website build`, accessibility and browser smoke tests.
8. Merge only after review; deploy to authorized Ubuntu `wise2` server; record the deployed SHA and test the public homepage.

**Status:** Development work committed; production build, media availability, and deployment not verified. Do not label complete.
