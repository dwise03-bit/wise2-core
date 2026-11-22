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
1. **Approved final-master path (preferred):** The previously approved, corrected 42.1-second entrance video `copy_2068F7CE-228B-444D-982F-4E32D61FDB4E.mp4` is the replacement master. The user approved the finished four-scene sequence (Electric City/Atlanta skyline → God’s Eye View Atlanta-to-orbit → Living Grid electrical Earth → Mathis Electric reveal/engineering command center), with its original soundtrack retained. The file is present in the original verified video handoff under `video/source-clips-mapping-unverified/`, SHA-256 `e80a0eb4c10f44c3daed` (prefix; verify full digest against the package manifest). **Codex must inspect the actual final master to confirm it contains the approved complete sequence before staging it as `/mathis/entrance.mp4`.** When that inspection passes, use the single final-master video, preserve its internal cuts and original soundtrack, and **do not require an additional four-raw-clips-to-scenes mapping**. The seven individual clips are optional editing source material, not required to publish an already-approved finished film. Do not substitute `copy_9C301699-81CC-4E6E-A5D0-A039FB1E8539.mp4` or the older `website/assets/entrance.mp4` without verified approval. If the corrected final master is missing, corrupt, or fails visual review, stop and obtain grounded scene mapping; never guess it.
2. Implement cinematic sequence and test fallback/skip/replay, mobile performance and reduced motion.
3. Confirm approved faceplate references and align player skins to them. Current skins are functional interpretations, not pixel-exact certified matches.
4. Confirm secure estimate destination and verified company details before enabling submissions.
5. Verify `NEXT_PUBLIC_MATHIS_GLOBE_URL` service availability, embedding policy and fallback.
6. Confirm the production reverse proxy routes `mathis.wise2.net/` to the intended Next.js route; current feature route is `/mathis-electric`.
7. Run `pnpm --filter @wise2/website type-check`, `pnpm --filter @wise2/website build`, accessibility and browser smoke tests.
8. Merge only after review; deploy to authorized Ubuntu `wise2` server; record the deployed SHA and test the public homepage.

**Status:** Mathis-specific TypeScript and Next.js production build passed in GitHub Actions run 44965457760 on commit fc69d19139f4c19f8d803c078f1462d85187a408. Raw clip-to-scene mapping is no longer a release prerequisite IF the approved final-master inspection succeeds. Production media upload, configuration, live accessibility/browser checks, merge/review and deployment remain unverified. Do not label deployed or complete.
