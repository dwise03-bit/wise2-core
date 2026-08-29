# WISE² HVAC Field Tech v1 — Progress

## Discovered application root

- **Repo**: `/Users/danielwise/Projects/wise2-core`
- **App path**: `apps/wise-hvac-demo`
- **Public URL**: `https://hvac.wise2.net` → nginx `infrastructure/nginx/hvac.wise2.net.conf` → Tailscale `100.64.72.14:3024` and/or Docker `hvac` service on `127.0.0.1:3024`
- **Do not modify**: other WISE² apps (website, cherry-count, command-center, etc.)

## Framework

- Next.js 14.2 (`basePath: /wise-hvac-demo`), React 18, Tailwind, hash-based Field Tech SPA
- Capacitor wrappers exist (iOS/Android) but production web is the live surface
- Auth: NextAuth (optional when `WISE_HVAC_DEMO_MODE !== 'false'`)

## Deployment method

- PM2 `ecosystem.config.cjs` (`wise-hvac-demo`, port 3024)
- Docker image via `apps/wise-hvac-demo/Dockerfile` / `docker-compose.prod.yml` service `hvac`
- VPS nginx TLS termination; app is not rebuilt from a parallel demo

## Important routes

| Route | Role |
|---|---|
| `/wise-hvac-demo/field-tech` | Field Tech SPA (hvac.wise2.net `/` proxies here) |
| `/wise-hvac-demo/signin` | Auth |
| `/wise-hvac-demo/api/field/jobs` | Job list |
| `/wise-hvac-demo/api/field/jobs/[id]` | PATCH status/notes |
| `/wise-hvac-demo/api/field/diagnose` | IMP diagnosis |
| `/wise-hvac-demo/api/health` | Health |
| Hash tabs | `#dashboard` `#work-order` `#instruments` `#diagnostics` `#more` |

SPA tabs: dashboard / jobs / tools / imp / more (single `FieldTechApp`).

## Existing components

- `app/field-tech/field-tech-app.tsx` — shell + panes
- `FieldTechBottomNav`, `DiagnosticHeader`, `ImpDiagnosticResultsScreen`, `FaultHeroCard`, `DiagnosticMetricCard`, `ConfidencePanel`, `RecommendedActionRow`, `DiagnosticFullReport`, `DiagnosticReportActions`

## Existing APIs / data

- In-app job store: `lib/field-data.ts` (in-memory; demo job unless `WISE_HVAC_DEMO_MODE=false`)
- Nested NestJS Fieldtech API (`packages/api/src/fieldtech`) is a separate contract used by native apps — **not replaced**, web continues to use `/api/field/*`
- IMP: OpenAI when keyed, otherwise verified fallback. Must not invent measurements.

## Existing tool integrations

- **No Fieldpiece SDK / Web Bluetooth** on the web app
- Native APK download + labeled **demo stream** in Tools (`simulated: true`)
- Preserve that architecture; never label demo/manual/calculated as LIVE TOOL

## Baseline (2026-08-29)

- Branch: `feat/wise2-hvac-field-tech-v1` (from `feat/wise2-business-os`)
- Existing tests: **14 pass** (`lib/field-tech-local.test.ts`, `lib/imp-diagnostics.test.ts`)
- Default demo job remains dispatch-seeded data when demo mode is on; empty state retained when the queue is empty

## Completed changes

- Branch `feat/wise2-hvac-field-tech-v1` (not committed)
- Navigation: TODAY | JOB | TOOLS | IMP | MORE with workflow rail and status strip
- TODAY dashboard: active call, today's work buckets, quick actions, empty queue state
- JOB: work order, equipment (unknown stays unknown), scan token, photo/voice actions
- TOOLS: Fieldpiece-accurate labeling (no SDK), demo stream, manual entry, live groups, trends
- Measurement store, P-T calculated SH/SC, stability engine, session local cache
- IMP structured result: finding, confidence band, supporting/contradicting evidence, probable causes, next-best-test, guided tests
- Repair + test-in/out comparison (change is not auto-verified) + notes/report drafts
- Diagnose API accepts measurements and returns structured fields without inventing readings
- Tests: 24 pass. Typecheck pass. Lint pass (2 existing-style hook warnings). `next build` compiled.

## Remaining changes

- Native Fieldpiece/BLE still only in the Android/iOS field app
- Offline queue is localStorage session cache, not a full sync worker
- Camera nameplate OCR not implemented (photo attach only)
- Enthalpy / CFM not calculated (withheld without valid inputs)
- Production `https://hvac.wise2.net` follows this Mac PM2 `next dev` process; a formal Docker deploy was not run
- No git commit yet (not requested)

## Blockers

- Web has no Fieldpiece SDK / Web Bluetooth
- NestJS `packages/api` Fieldtech Prisma API is a separate native contract; web still uses `/api/field/*`
- `next start` is incompatible with `output: standalone` (existing). PM2 uses `pnpm run dev`.
