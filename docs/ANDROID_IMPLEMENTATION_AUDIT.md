# WISE² Field Tech — Android Implementation Audit

**Date**: 2026-08-23
**Scope**: Pre-build inspection required by the Field Tech Android build spec, section 2.

---

## 1. Existing Android Code

**None found.** A repo-wide search (`find . -iname "*android*"`, `*.gradle*`, `AndroidManifest.xml`, `*fieldtech*`) turned up zero matches outside of unrelated node_modules noise.

The build spec's framing ("take the existing WISE² Field Tech Android starter project") does not match repo state — **there is no starter project**. This will be a greenfield native Android build, not a modernization of existing code.

## 2. Repo Shape

This is a single pnpm/Turborepo monorepo, 100% TypeScript/Next.js/NestJS today:

- `apps/` — `admin`, `api` (NestJS backend), `command-center`, `dashboard`, `website`, `wise-hvac-demo` (a Next.js **marketing demo site** for a fictional HVAC company — unrelated to the field-tech mobile app beyond sharing an HVAC theme), others.
- `packages/` — `api`, `auth`, `db` (Prisma), `types`, `ui-components`, `design-system`, `shared`, etc.

There is no existing native-mobile package, no Kotlin/Java anywhere, no `android/` directory convention established. The Android app will be a new top-level project (e.g. `apps/fieldtech-android/` or a sibling repo — recommend `apps/fieldtech-android/` so release scripts can live alongside the rest of the monorepo's `scripts/`).

## 3. Local Toolchain — Build Verification Constraint

Checked on this machine:

- `java -version` → **no JRE/JDK installed** ("Unable to locate a Java Runtime").
- `gradle`, `adb`, `android-studio` → **not found** on PATH.
- `$ANDROID_HOME` / `$ANDROID_SDK_ROOT` → unset, no SDK directory present.
- **Docker is available** (`docker 29.6.1`) — this is the viable path to `./gradlew test` / `./gradlew assembleDebug` verification: a containerized JDK17 + Android cmdline-tools image can run Gradle headlessly.

**Hard constraint**: there is no Android emulator or physical device attached to this environment, and no GUI here to drive one even if there were (unlike the iOS Simulator tooling available in this session, there is no equivalent Android emulator control here). Consequences:

- I can write all source, and prove it **compiles and unit-tests pass** via a Docker-based Gradle build.
- I **cannot** visually verify Compose screens, run instrumented/UI tests, or install/exercise the APK on a device from here. The spec's "Definition of Done" (§30, items 1–17) requires installing and operating the app on a real Android device — that verification step has to happen on your end (sideload the debug APK, or use Android Studio's emulator).
- `./gradlew assembleRelease` additionally needs a signing keystore + passwords, which per the spec (§20/22) must never be committed — those secrets don't exist yet and I won't generate/store them; release signing will be wired via env vars with the keystore itself supplied by you out-of-band.

## 4. Reusable WISE² Backend Infrastructure

Inspected `packages/api/src/**/*.controller.ts`. Real, working NestJS routes exist for several of the spec's required domains — these should be reused/extended, not duplicated:

| Domain | Existing route | File |
|---|---|---|
| Auth | `POST /v1/auth/login`, `signup`, `refresh`, `logout`, `password-reset(/confirm)`, `change-password`, `verify-email` — JWT-based (`JwtAuthGuard`), throttled | `packages/api/src/auth/auth.controller.ts` |
| IMP / AI chat | `POST /v1/hermes/chat`, `GET /v1/hermes/brief/daily`, `actions` CRUD+approve/reject | `packages/api/src/hermes/hermes.controller.ts` |
| Jobs | `GET /revenue-os/service-jobs`, `GET .../today-jobs`, `GET .../:id`, `POST`, `PATCH .../:id` | `packages/api/src/**/service-jobs.controller.ts` |
| Customers | `POST/GET /v1/customers`, `GET .../stats`, `GET .../:id`, `POST .../convert-from-prospect/:id` | `packages/api/src/v1/customers/customers.controller.ts` |

**Gaps** (no existing route — net-new, per spec §19 "inspect first, don't duplicate"):
- `/api/v1/equipment/*` — no equipment/HVAC-unit model exists yet.
- `/api/v1/readings/*` — no refrigerant/electrical/airflow reading storage exists.
- `/api/v1/reports/*` — no service-report generation/PDF endpoint exists.
- `/api/v1/fieldtech/releases/latest` — no APK update-check endpoint exists.
- `service-jobs` is a generic "revenue-os" job, not an HVAC job with equipment/diagnostic/reading associations — it will need either extension (new fields/relations) or a parallel `fieldtech` job model that references it. Needs a decision: extend `service-jobs` in place, or create a dedicated field-tech job table that links to it for revenue reporting. Recommend extending in place to avoid two sources of truth for "jobs."

No `GET /api/v1/fieldtech/*` namespace exists at all — it will be net-new, added to `packages/api`.

## 5. Security Concerns to Carry Into the Android Build

- Auth is JWT-based with a `refresh` endpoint — Android client must store tokens in `EncryptedSharedPreferences`/Keystore-backed DataStore (spec §18), never plain SharedPreferences.
- `ThrottlerGuard` is present on login/signup/password-reset — Android client should surface 429s cleanly rather than retry-looping.
- No `/fieldtech/*` auth scoping exists yet — need to confirm whether field techs get a distinct role/permission (vs. general dashboard users) before wiring job/equipment endpoints; recommend adding a `technician` role check server-side rather than trusting the client.

## 6. Fieldpiece / Bluetooth Integration Reality Check

No existing Bluetooth/instrument-integration code anywhere in the repo. Fieldpiece does not publish a public BLE SDK/protocol doc as of this writing — consistent with the spec's own instruction (§9) not to invent an undocumented protocol. The `FieldToolAdapter` interface will ship with a `SimulatedToolAdapter` only; real `FieldpieceAdapter` is a documented blocker pending vendor SDK access.

## 7. Recommended Android Implementation Plan (Phased)

Given the scope (native Kotlin/Compose app, offline-first sync, Bluetooth abstraction, camera, AI chat, guided diagnostics, private APK release + update system — ~15 subsystems), building and landing this as one unreviewed pass is high risk with no on-device visual verification available in this environment. Recommended phasing:

1. **Skeleton + Auth + Jobs (read-only)** — Gradle project scaffold, Compose navigation shell, Material 3 theme (WISE² palette), login against real `/v1/auth/login`, Today's Jobs screen against real `/revenue-os/service-jobs/today-jobs`, Room + DataStore wiring, Docker-based `gradlew assembleDebug` proof of compilation.
2. **Job detail + Equipment + offline cache** — job detail screen, new `/api/v1/equipment/*` backend routes, Room offline cache + WorkManager sync queue skeleton.
3. **Live Readings + calculation engine + SimulatedToolAdapter** — instrumentation dashboard UI, superheat/subcooling/etc. calculators (pure functions, unit-testable without a device), Bluetooth abstraction with demo data only.
4. **Diagnose engine + IMP chat** — guided troubleshooting trees, `/v1/hermes/chat` integration with job-context payload.
5. **Camera + Job Report + demo end-to-end scenario** — CameraX capture, report screen, wiring the spec's §26 test scenario start-to-finish in demo mode.
6. **Release infra** — build scripts, update-check endpoint, `wise2.net/fieldtech` portal page.

Each phase ends with a real Docker Gradle build (`test` + `assembleDebug`) before moving on, and a debug APK handed off for you to sideload/verify visually, since that step can't be done from here.

## 8. Immediate Next Step

Awaiting direction on: (a) confirm the phasing above, or build differently; (b) where the Android project should live in the repo (`apps/fieldtech-android/` recommended); (c) whether to extend `service-jobs` in place for HVAC fields or create a parallel model.
