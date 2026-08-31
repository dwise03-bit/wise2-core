# WISE² HVAC Field Tech v1 — Progress

## Discovered application root

- **Repo**: `/Users/danielwise/Projects/wise2-core`
- **App path**: `apps/wise-hvac-demo`
- **Public URL**: `https://hvac.wise2.net` → nginx `infrastructure/nginx/hvac.wise2.net.conf` → Tailscale `100.64.72.14:3024`
- **Do not modify**: other WISE² apps (website, cherry-count, command-center, etc.)

## Framework

- Next.js 14.2 (`basePath: /wise-hvac-demo`), React 18, Tailwind, hash-based Field Tech SPA
- Capacitor wrappers exist (iOS/Android) for native Field Tech; production web is the live surface at `hvac.wise2.net`
- Auth: Google OAuth → local code exchange → WISE² JWT (`/api/v1/auth/google`); demo mode optional via `WISE_HVAC_DEMO_MODE=true`

## Deployment method

- PM2 `ecosystem.config.cjs` (`wise-hvac-demo`, port 3024, `next start`)
- Deploy script: `scripts/deploy-hvac-fieldtech.sh` (build + PM2 restart + OAuth smoke)
- VPS nginx TLS termination at `173.208.147.165`; app runs on Mac via Tailscale
- Docker image available (`apps/wise-hvac-demo/Dockerfile`) but production uses PM2

## Important routes

| Route | Role |
|---|---|
| `/` (hvac.wise2.net) | Proxies to `/wise-hvac-demo/field-tech` |
| `/wise-hvac-demo/field-tech` | Field Tech SPA shell |
| `/wise-hvac-demo/signin` | Google sign-in |
| `/wise-hvac-demo/api/field/jobs` | Job list (WISE² API or demo store) |
| `/wise-hvac-demo/api/field/jobs/[id]` | PATCH status/notes |
| `/wise-hvac-demo/api/field/diagnose` | IMP diagnosis |
| `/wise-hvac-demo/api/auth/google/*` | OAuth authorize/callback |
| `/wise-hvac-demo/api/health` | Health |

**SPA tabs** (bottom nav): TODAY | JOB | TOOLS | IMP | MORE

**Hash routes**: `#today` `#work-order` `#instruments` `#live` `#trends` `#diagnostics` `#test` `#guided` `#repair` `#notes` `#report`

## Existing components

| Component | Role |
|---|---|
| `field-tech-app.tsx` | Shell, session state, workflow orchestration |
| `TechnicianDashboard` | TODAY screen |
| `ActiveWorkOrder` | JOB / work order |
| `SmartToolsPane` | TOOLS discover / live / trends |
| `ImpWorkspace` | IMP capture, results, next-best-test, guided tests |
| `CloseoutPane` | Repair, notes, report, closeout |
| `FieldChrome` | Header, status strip, workflow rail |
| `FieldTechBottomNav` | Primary navigation |
| `ImpDiagnosticResultsScreen`, `DiagnosticFullReport`, etc. | IMP presentation |

## Existing APIs / data

- Production jobs: `lib/field-jobs-server.ts` → `https://wise2.net/api/v1/fieldtech/*` with session JWT
- Demo jobs: `lib/field-data.ts` in-memory store when `WISE_HVAC_DEMO_MODE=true`
- Session cache: `lib/field-session.ts` (localStorage — measurements, repair, attachments, notes)
- IMP: `lib/imp-structured.ts` (evidence-based) + `/api/field/diagnose` (OpenAI when keyed, verified fallback)
- Measurements: `lib/measurements.ts`, stability: `lib/stability.ts`, P-T: `lib/refrigerant-pt.ts`

## Existing tool integrations

- **No Fieldpiece SDK / Web Bluetooth** on web
- Demo stream labeled `DEMO STREAM` / `simulated: true` — never presented as LIVE TOOL
- Manual entry supported; calculated SH/SC/Delta-T/TESP from valid inputs only
- Native APK download route preserved

## Baseline (2026-08-30)

- **Branch**: `feat/wise2-hvac-field-tech-v1`
- **Tests**: 26 pass (`field-tech-v1`, `field-tech-local`, `imp-diagnostics`, `fieldtech-mapper`)
- **Typecheck**: pass
- **Lint**: pass (2 existing hook warnings in `field-tech-app.tsx`)
- **Production**: `demoMode=false`, `googleConfigured=true`, health OK
- **Google login fix**: OAuth code exchanged locally (prod API lacks `/oauth/google/exchange`); uses `/v1/auth/google` with id_token

## Implementation phases (handoff status)

| Phase | Status | Notes |
|---|---|---|
| 1 Discovery + baseline | **Done** | This document, tests, route inventory |
| 2 Navigation + active job | **Done** | TODAY/JOB/TOOLS/IMP/MORE, workflow rail, status strip |
| 3 Equipment + Smart Tools | **Done** | QR/token resolve, manual entry, demo stream labeling |
| 4 Live + Trends + Stability | **Done** | Grouped measurements, trend ranges, stability engine |
| 5 IMP structured diagnostics | **Done** | Evidence, confidence, contradicting evidence, no fake % |
| 6 Next Best Test + Guided Tests | **Done** | `ImpWorkspace`, `guided-tests.ts` |
| 7 Repair + Test-In/Out | **Done** | Comparison table, verification states |
| 8 Notes + Attachments + Report | **Done** | Draft notes/report, photo/voice local attach |
| 9 Offline/error states | **Partial** | Offline banner, SAVED LOCALLY; no full sync worker |
| 10 Production QA + deploy | **Done** | PM2 production build live at hvac.wise2.net |

## Completed changes (2026-08-30 session)

- Google OAuth login fixed for production (local token exchange + WISE² id_token auth)
- Logout redirect fixed (`force-dynamic`)
- TODAY dashboard job cards now select the work order before opening JOB tab
- Progress document updated to reflect full v1 state

## Remaining changes

- Native Fieldpiece/BLE only in Android/iOS field app (not web)
- Full offline sync queue / background worker
- Camera nameplate OCR (photo attach only today)
- Enthalpy / CFM withheld without valid inputs (by design)
- NestJS `packages/api` Fieldtech routes not fully deployed on wise2.net (web uses existing endpoints)
- Git commit for HVAC v1 branch not yet requested

## Blockers

- Web has no Fieldpiece SDK / Web Bluetooth
- Production WISE² API missing `POST /v1/auth/oauth/google/exchange` (workaround: local exchange in HVAC app)
- Assigned jobs require authenticated technician with fieldtech API access

## Definition of done checklist

Technician can (when data exists):

1. Open WISE² Field Tech — **yes**
2. See/select assigned call — **yes** (empty state when none)
3. Identify equipment — **yes** (QR/token/manual; unknown stays unknown)
4. Connect or enter measurements — **yes** (manual + labeled demo stream)
5. Observe live readings — **yes**
6. Verify stability — **yes**
7. Run IMP — **yes**
8. Understand IMP evidence — **yes**
9. Receive next-best-test — **yes**
10. Perform and save guided test — **yes**
11. Record repair — **yes**
12. Compare Test-In/Test-Out — **yes**
13. Verify repair — **yes** (technician-selected status)
14. Generate/edit service notes — **yes** (draft until accepted)
15. Attach evidence — **yes** (local photo/voice)
16. Review report — **yes**
17. Complete job — **yes**

Zero fabricated production data when `WISE_HVAC_DEMO_MODE=false`.
