# WISE² Apps Command Launcher Design

## Goal
Upgrade `wise2.net/apps` from a static team-app download list into the WISE² App Store / Command Launcher without breaking any existing download or workspace route.

## Current implementation
- Page: `apps/website/app/apps/page.tsx`
- Catalog and download metadata: `apps/website/lib/team-apps.ts`
- Catalog tests: `apps/website/lib/team-apps.test.ts`
- Existing public download base path: `/downloads/apps`

## Design

### Catalog model
Extend each app with presentation metadata only; keep existing `id`, `name`, `tagline`, `webUrl`, and `builds` behavior intact.

Add:
- `status`: `live | beta | dev`
- `category`: short product grouping label
- `version`: human-readable published version
- `commandUrl?`: route opened by “Launch in WISE² Command” when applicable

Extend builds with optional `version` and `releasedAt` metadata for display. No download filename is changed.

### Page structure
1. Hero: WISE² App Store / Command Launcher identity, system-online treatment, published-system count.
2. App grid: premium cards with status badge, category, version, supported platform/build actions, workspace action, and Command launch action when available.
3. Install guidance: QR-ready install section that points to existing download URLs; QR rendering is deferred unless an existing QR dependency is already present.
4. Release/status strip: clearly distinguishes LIVE, BETA, and DEV. Status is catalog metadata, not a runtime health claim.

### Safety and compatibility
- Preserve every existing `webUrl`.
- Preserve every existing filename and `/downloads/apps/<filename>` path.
- Preserve filename sanitization and MIME behavior.
- Do not claim runtime service health unless a real health endpoint is wired later.
- Avoid introducing a new dependency for QR codes in this pass; show copyable/direct install links and reserve QR generation for a follow-up if needed.

### Visual direction
Use the existing WISE² cinematic command-center language already present in the website: near-black base, chrome/steel neutrals, electric cyan, neon green live indicators, restrained gold accents, sharp bordered surfaces, and dense command-console hierarchy. Avoid generic app-store styling.

### Testing
- Expand `team-apps.test.ts` to verify catalog metadata, preserved routes, and status values.
- Run the website/unit test command used by the repo.
- Run website build/typecheck before merge.
- Verify `/apps` renders with all six existing systems and no existing download href changes.

## Definition of done
- `/apps` presents as the WISE² App Store / Command Launcher.
- All six current systems remain present.
- Existing download/workspace routes are unchanged.
- LIVE/BETA/DEV, category, and version metadata render per app.
- Command launch actions appear only where configured.
- Tests and website build pass before deployment.
