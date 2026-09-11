# WISE² Field Tech Command Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the native Android WISE² Field Tech home screen to match the approved command dashboard, wire every available control to a real workflow, add a real New Job form, and produce a verified debug APK.

**Architecture:** Keep `HomeViewModel` as the source of home state and `WiseNavGraph` as the navigation owner. Add small pure policy helpers for active-job/action availability, focused Jobs/Customers/New Job screens backed by the existing `JobRepository`, and use existing Diagnose, Live Readings, Equipment, Report, IMP, CameraX, BLE, offline-sync, and settings flows. Capabilities not present in the app contract (inventory, messaging, checklist, barcode scanner) must be visibly disabled as `Not configured`, not mocked.

**Tech Stack:** Kotlin 1.9.24, Jetpack Compose + Material 3, Navigation Compose, Room, WorkManager, Retrofit/OkHttp, CameraX, Android BLE APIs, JUnit 4 + Truth, Gradle 8.7 / AGP 8.5.2, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-08-fieldtech-command-home-design.md`

## Global Constraints
- Canonical app: `apps/fieldtech-android`.
- Preserve application ID `com.wise2.fieldtech`, auth/data contracts, offline-first job mutations, and existing signing configuration.
- No hard-coded production customer/job/tool data.
- No decorative dead buttons: actions are functional or visibly disabled.
- Do not route AI to `ui/screens/agent`, whose current implementation contains mock/TODO behavior; use the existing `ImpChat` repository-backed flow.
- No barcode/QR scanner dependency exists in the current app, so Scan Equipment / Asset Scan render disabled with `Not configured` until a real scanner is added.
- No inventory or checklist domain exists in the current app, so those controls render disabled with `Not configured`.
- Existing job/customer data may be used to build Jobs and Customers directory views.
- Verify `testDebugUnitTest`, `lintDebug`, and `assembleDebug` before completion.

---

### Task 1: Home action policy and Android CI

**Files:**
- Create: `apps/fieldtech-android/app/src/test/kotlin/com/wise2/fieldtech/ui/screens/home/HomeCommandPolicyTest.kt`
- Create: `apps/fieldtech-android/app/src/main/kotlin/com/wise2/fieldtech/ui/screens/home/HomeCommandPolicy.kt`
- Create: `.github/workflows/fieldtech-android.yml`

**Interfaces:**
- Produces: `activeJob(jobs: List<Job>): Job?`, `canCall(job: Job): Boolean`, `canNavigate(job: Job): Boolean`, `canOpenEquipment(job: Job?): Boolean`, `dialUri(phone: String): String?`, `navigationUri(address: String): String?`.

- [ ] **Step 1: Write failing tests for active-job selection and Call/Navigate/Equipment availability.**
- [ ] **Step 2: Run `./gradlew testDebugUnitTest` in CI and confirm the tests fail because `HomeCommandPolicy` is not yet implemented.**
- [ ] **Step 3: Implement the pure policy helper with trimmed/nonblank validation and URL-safe map query generation.**
- [ ] **Step 4: Run `./gradlew testDebugUnitTest` and confirm PASS.**
- [ ] **Step 5: Keep Android CI building unit tests, lint, debug APK, and uploading `app-debug.apk` as `wise2-field-tech-debug-apk`.**

### Task 2: Real New Job workflow

**Files:**
- Create: `apps/fieldtech-android/app/src/main/kotlin/com/wise2/fieldtech/ui/screens/newjob/NewJobViewModel.kt`
- Create: `apps/fieldtech-android/app/src/main/kotlin/com/wise2/fieldtech/ui/screens/newjob/NewJobScreen.kt`
- Modify: `apps/fieldtech-android/app/src/main/kotlin/com/wise2/fieldtech/ui/navigation/Destinations.kt`
- Modify: `apps/fieldtech-android/app/src/main/kotlin/com/wise2/fieldtech/ui/navigation/WiseNavGraph.kt`

**Interfaces:**
- `NewJobViewModel` consumes `JobRepository.createJob(...)` and emits the created job ID.
- `NewJobScreen(viewModel, onBack, onCreated)` collects technician input and never silently creates blank placeholder customers.

- [ ] **Step 1: Add validation tests for required customer name/address and save state.**
- [ ] **Step 2: Implement `NewJobViewModel` with customer name, phone, address, complaint, appointment time, saving/error state, and created-job event.**
- [ ] **Step 3: Implement the Compose form with Create Job / Cancel controls and field validation.**
- [ ] **Step 4: Add `Destination.NewJob` and route Home's New Job action to it; remove the old immediate `New Customer` placeholder creation.**
- [ ] **Step 5: On creation, open the real Job Detail route using the returned job ID.**

### Task 3: Jobs and Customers directories

**Files:**
- Create: `apps/fieldtech-android/app/src/main/kotlin/com/wise2/fieldtech/ui/screens/home/DirectoryScreens.kt`
- Modify: `apps/fieldtech-android/app/src/main/kotlin/com/wise2/fieldtech/ui/navigation/Destinations.kt`
- Modify: `apps/fieldtech-android/app/src/main/kotlin/com/wise2/fieldtech/ui/navigation/WiseNavGraph.kt`

**Interfaces:**
- `JobsScreen` consumes `HomeViewModel` job state and emits `onJobClick(jobId)`.
- `CustomersScreen` derives unique customer entries from real cached jobs and emits the newest matching job ID for customer drill-in.

- [ ] **Step 1: Add `Jobs` and `Customers` destinations.**
- [ ] **Step 2: Render all cached work orders/jobs with status and appointment time.**
- [ ] **Step 3: Render unique customer cards using actual job-backed customer name/phone/address data.**
- [ ] **Step 4: Wire bottom navigation and shortcut actions to these routes.**

### Task 4: Rebuild the command home UI and wire every supported button

**Files:**
- Replace: `apps/fieldtech-android/app/src/main/kotlin/com/wise2/fieldtech/ui/screens/home/HomeScreen.kt`
- Modify: `apps/fieldtech-android/app/src/main/kotlin/com/wise2/fieldtech/ui/components/ModernNavigationBar.kt`
- Modify: `apps/fieldtech-android/app/src/main/kotlin/com/wise2/fieldtech/ui/navigation/WiseNavGraph.kt`

**Interfaces:**
- Home callbacks: Job Detail, Diagnose, Live Readings, Report, Equipment, IMP, New Job, Settings, Jobs, Customers.
- External Call/Navigate use `dialUri` / `navigationUri` and Android `ACTION_DIAL` / `ACTION_VIEW` only when policy permits.

- [ ] **Step 1: Rebuild header, sync/online banner, greeting, shortcut row, job cards, quick actions, integrations strip, bottom CTAs, and bottom navigation using the existing WISE² theme.**
- [ ] **Step 2: Wire View Job, Diagnose, Live Readings, Create Report, Fieldpiece/Bluetooth, Cloud Sync, WISE² AI, New Job, Jobs, Customers, Settings/More.**
- [ ] **Step 3: Wire Call and Navigate per job with disabled states when phone/address is missing.**
- [ ] **Step 4: Wire Asset/Equipment to existing Equipment screen when an equipment ID exists.**
- [ ] **Step 5: Render Scan Equipment, Parts & Inventory, Messages, and Checklists disabled with explicit `Not configured` copy because those real contracts are absent; never no-op silently.**
- [ ] **Step 6: Keep job-specific quick actions disabled when there is no active non-complete job.**
- [ ] **Step 7: Make bottom-nav items support disabled state so Messages is visibly unavailable rather than a dead tap target.**

### Task 5: Verification and APK artifact

**Files:**
- Modify as required by compiler/lint only within the feature scope.

- [ ] **Step 1: Run `./gradlew testDebugUnitTest`. Expected: PASS.**
- [ ] **Step 2: Run `./gradlew lintDebug`. Expected: PASS with no blocking errors.**
- [ ] **Step 3: Run `./gradlew assembleDebug`. Expected: `apps/fieldtech-android/app/build/outputs/apk/debug/app-debug.apk`.**
- [ ] **Step 4: Download the GitHub Actions artifact and confirm the APK bytes exist.**
- [ ] **Step 5: If an ADB device is available, install using `adb install -r app-debug.apk` and smoke-test Home, New Job, Job Detail, Diagnose, Live Readings, Report, Call/Maps, Jobs, Customers, and Settings. If no device is reachable from this environment, state that limitation explicitly.**
- [ ] **Step 6: Update PR #70 with verified checks and mark ready for review only after all available verification passes.**
