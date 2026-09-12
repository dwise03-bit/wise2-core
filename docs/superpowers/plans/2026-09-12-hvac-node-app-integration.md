# WISE² HVAC Node App Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one offline-first HVAC Node workflow to WISE² Field Tech that supports Raspberry Pi 5 Node Ultra and Arduino UNO Q Node Pro through a shared normalized device contract.

**Architecture:** Extend the existing `apps/fieldtech-android` Compose/ViewModel/repository/Room/Retrofit architecture and its `FieldToolAdapter`/`ToolManager` device layer. Normalize Pi 5 and UNO Q telemetry into shared domain snapshots, calculate HVAC values locally, cache sessions offline, and batch-sync them into additive WISE² Core HVAC node APIs and database models.

**Tech Stack:** Kotlin, Jetpack Compose, StateFlow, Room, Retrofit/OkHttp, WorkManager, Bluetooth LE, local Wi-Fi HTTP/WebSocket, Prisma/PostgreSQL, Next.js route handlers, JUnit.

**Spec:** `docs/superpowers/specs/2026-09-12-hvac-node-app-integration-design.md`

## Global Constraints

- One `HVAC Node` screen controls both hardware families.
- Preserve existing Field Tech, HVAC, K10, authentication, and offline-sync behavior.
- Basic readings, calculations, diagnostics, notes, and session recording work without internet.
- Initial database changes are additive; do not remove or rename K10 endpoints/models.
- Never hard-code WISE² cloud credentials on hardware.
- Unsupported sensors are represented as unavailable, never synthesized.
- Stale values must be visibly marked stale and never presented as live.
- Derived HVAC calculations remain in the pure Kotlin domain layer.
- New functionality remains feature-flagged until physical field verification passes.

---

### Task 1: Normalized HVAC Node Domain Contract

**Files:**
- Create: `apps/fieldtech-android/app/src/main/kotlin/com/wise2/fieldtech/domain/model/HvacNode.kt`
- Create: `apps/fieldtech-android/app/src/test/kotlin/com/wise2/fieldtech/domain/model/HvacNodeTest.kt`

**Interfaces:**
- Produces: `HvacNodeDevice`, `HvacNodeCapabilities`, `HvacNodeSnapshot`, `HvacNodeConnectionState`, `HvacNodeSession`, `HvacNodeAlert`, `HvacNodeModel`, `HvacNodeTransport`.
- Snapshot identity is `deviceId + sessionId + sequence`.

- [ ] Write tests asserting Pi 5 and UNO Q devices can be represented by the same contract, optional capabilities remain null/false, and snapshot identity is stable.
- [ ] Run `./gradlew test --tests '*HvacNodeTest*'` from `apps/fieldtech-android` and verify failure because types do not exist.
- [ ] Implement immutable Kotlin data classes/enums with nullable optional sensor channels, timestamps, sequence number, sensor-health flags, and transport metadata. Do not import `android.*`.
- [ ] Run the targeted test and verify PASS.
- [ ] Commit with `git commit -m "feat(fieldtech): add normalized HVAC node domain contract"`.

### Task 2: Telemetry Validation and Mapping

**Files:**
- Create: `apps/fieldtech-android/app/src/main/kotlin/com/wise2/fieldtech/domain/hvacnode/HvacNodeTelemetryValidator.kt`
- Create: `apps/fieldtech-android/app/src/test/kotlin/com/wise2/fieldtech/domain/hvacnode/HvacNodeTelemetryValidatorTest.kt`

**Interfaces:**
- Consumes: `HvacNodeSnapshot`.
- Produces: `validate(snapshot): HvacNodeValidationResult` with valid channels, rejected channels, and stale/clock-skew flags.

- [ ] Write failing tests for impossible pressure/temperature/RH values, missing optional channels, stale timestamps, and valid partial snapshots.
- [ ] Run targeted tests and confirm failure.
- [ ] Implement pure validation with explicit engineering bounds and channel-level rejection so one bad sensor does not invalidate healthy channels.
- [ ] Run targeted tests and verify PASS.
- [ ] Commit `feat(fieldtech): validate HVAC node telemetry`.

### Task 3: Device Adapter Contract and Simulated Nodes

**Files:**
- Modify: existing files under `apps/fieldtech-android/app/src/main/kotlin/com/wise2/fieldtech/bluetooth/` containing `FieldToolAdapter`, `ToolManager`, and `SimulatedToolAdapter`.
- Create: `apps/fieldtech-android/app/src/main/kotlin/com/wise2/fieldtech/bluetooth/HvacNodeAdapter.kt`
- Create: `apps/fieldtech-android/app/src/test/kotlin/com/wise2/fieldtech/bluetooth/HvacNodeAdapterTest.kt`

**Interfaces:**
- Produces: `HvacNodeAdapter : FieldToolAdapter` exposing `StateFlow<HvacNodeConnectionState>`, `StateFlow<HvacNodeSnapshot?>`, `connect()`, `disconnect()`, and discovery identity/capabilities.
- `ToolManager` remains the facade and selects an active adapter.

- [ ] Inspect current adapter signatures before editing and preserve existing consumers.
- [ ] Write failing tests for simulated Pi 5 and UNO Q discovery, connection, normalized snapshots, disconnect, and reconnect.
- [ ] Implement the smallest backward-compatible extension to `FieldToolAdapter`/`ToolManager`; adapt `SimulatedToolAdapter` rather than deleting it.
- [ ] Run adapter and existing unit tests.
- [ ] Commit `feat(fieldtech): add shared HVAC node adapter layer`.

### Task 4: Offline HVAC Node Session Persistence

**Files:**
- Create focused Room entity/DAO files under `apps/fieldtech-android/app/src/main/kotlin/com/wise2/fieldtech/data/local/hvacnode/`.
- Modify: existing `AppDatabase` registration/migrations.
- Create: `apps/fieldtech-android/app/src/main/kotlin/com/wise2/fieldtech/data/repository/HvacNodeRepository.kt`
- Test: repository/Room tests in matching test packages.

**Interfaces:**
- Produces: `startSession(deviceId, jobId?, equipmentId?)`, `recordSnapshot(snapshot)`, `endSession(sessionId)`, `observeSession(sessionId)`, `pendingSyncBatches()`.
- Dedup key: device ID + session ID + sequence.

- [ ] Write failing tests for session creation, snapshot persistence, duplicate suppression, job/equipment association, and pending-sync selection.
- [ ] Add additive Room entities/DAO/migration; do not alter existing data destructively.
- [ ] Implement offline-first repository and mappers between Room and domain objects.
- [ ] Run Room/repository tests and existing tests.
- [ ] Commit `feat(fieldtech): persist HVAC node sessions offline`.

### Task 5: HVAC Node Screen and ViewModel

**Files:**
- Create: `apps/fieldtech-android/app/src/main/kotlin/com/wise2/fieldtech/ui/screens/hvacnode/HvacNodeViewModel.kt`
- Create: `apps/fieldtech-android/app/src/main/kotlin/com/wise2/fieldtech/ui/screens/hvacnode/HvacNodeScreen.kt`
- Modify: `apps/fieldtech-android/app/src/main/kotlin/com/wise2/fieldtech/ui/navigation/WiseNavGraph.kt`
- Modify: `apps/fieldtech-android/app/src/main/kotlin/com/wise2/fieldtech/di/AppContainer.kt`
- Test: ViewModel tests under matching test package.

**Interfaces:**
- Consumes: `ToolManager`, `HvacNodeRepository`, existing `HvacCalculations` and diagnostics.
- Produces: one screen state covering disconnected/scanning/connecting/live/stale/error and hardware badge `NODE ULTRA / PI5` or `NODE PRO / UNO Q`.

- [ ] Write ViewModel tests for scan/connect/live/stale/disconnect, capability-based hiding, and offline session recording.
- [ ] Implement ViewModel state reduction without Android dependencies where practical.
- [ ] Implement Compose UI using WISE² HVAC dark navy, electric-blue cooling metrics, orange attention/heating states, large gauges/readouts, connection quality, calculations, and session controls.
- [ ] Add one navigation destination and container dependencies; do not create model-specific screens.
- [ ] Run unit tests and Compose compile.
- [ ] Commit `feat(fieldtech): add unified HVAC Node screen`.

### Task 6: Generic WISE² Core HVAC Node Schema and API

**Files:**
- Modify: `packages/db/prisma/schema.prisma`
- Create additive Prisma migration under the repository's established migrations path.
- Create route handlers under `apps/website/app/api/hvac/nodes/` for register, device, latest, sessions, telemetry batch, and alerts.
- Add API tests following existing website API test conventions.

**Interfaces:**
- Accepts generic device model (`PI5_ULTRA`, `UNO_Q_PRO`) and normalized telemetry.
- Batch ingest is idempotent by device/session/sequence.
- Device/session rows optionally relate to existing HVAC equipment/work-order/property records where current schema permits.

- [ ] Write failing API tests for authenticated registration, unauthorized rejection, valid batch ingest, duplicate ingest, malformed/range-invalid payloads, latest reading, and session history.
- [ ] Add additive Prisma models/indexes/relations without modifying K10 endpoints or destructive migration operations.
- [ ] Implement authenticated route handlers with payload-size/range/timestamp/device validation.
- [ ] Run migration validation and API tests.
- [ ] Commit `feat(core): add generic HVAC node telemetry API`.

### Task 7: Retrofit Sync and WorkManager Queue

**Files:**
- Modify: existing `data/remote/ApiService` and DTO files.
- Modify or extend: existing `data/sync/SyncWorker`.
- Modify: `HvacNodeRepository.kt`.
- Test: sync tests in matching packages.

**Interfaces:**
- Adds typed DTOs for register/session/batch/alert endpoints.
- Sync sends bounded batches and marks rows synced only after successful idempotent server acknowledgement.

- [ ] Write failing tests for successful batch sync, server retry, auth failure, duplicate acknowledgement, and offline preservation.
- [ ] Add Retrofit methods/DTO mappers using existing auth interceptor/token authenticator.
- [ ] Extend the existing sync queue with bounded exponential backoff; do not create a second competing scheduler.
- [ ] Run sync tests and existing repository tests.
- [ ] Commit `feat(fieldtech): sync HVAC node sessions to Core`.

### Task 8: Raspberry Pi 5 Node Ultra Agent

**Files:**
- Create a focused product/edge-agent directory following existing repository conventions after inspecting current edge products.
- Include configuration example, service entrypoint, sensor abstraction, local authenticated API/WebSocket transport, ring buffer, and unit tests.

**Interfaces:**
- Emits the normalized telemetry schema from Task 1/6.
- Supports local Wi-Fi telemetry; BLE is discovery/pairing/status fallback where available.
- Uses per-device credentials; contains no WISE² cloud secret in source.

- [ ] Write tests against fake sensors for sampling, sequence numbers, invalid-channel flags, ring-buffer replay, and authenticated local access.
- [ ] Implement sensor abstraction first so ADS1115/pressure/temp/RH/current drivers remain replaceable.
- [ ] Implement local telemetry endpoint/WebSocket and ring-buffer resume by sequence.
- [ ] Add systemd/container launch documentation consistent with repository deployment patterns.
- [ ] Run agent tests.
- [ ] Commit `feat(hvac-node): add Raspberry Pi 5 Node Ultra agent`.

### Task 9: UNO Q Node Pro Adapter/Agent

**Files:**
- Create UNO Q product directory following Task 8's external contract.
- Separate Linux networking/persistence from MCU sensor polling/IO code.
- Add contract tests using captured/fake MCU frames.

**Interfaces:**
- Externally identical normalized API/telemetry contract to Pi 5.
- MCU-to-Linux framing includes sequence, timestamp, channel values, and health flags.

- [ ] Write failing contract tests proving UNO Q payloads normalize identically to equivalent Pi readings.
- [ ] Implement MCU frame parser and Linux-side node service without duplicating app/Core schemas.
- [ ] Implement mobile `UnoQHvacNodeAdapter` against the shared adapter contract.
- [ ] Run contract/adapter tests.
- [ ] Commit `feat(hvac-node): add UNO Q Node Pro support`.

### Task 10: Job/Equipment Attachment and Reports

**Files:**
- Modify the existing job/equipment/report repositories and relevant Field Tech screens only after inspecting their current APIs.
- Add tests for associations and report serialization.

**Interfaces:**
- `HvacNodeSession` may reference current job/equipment IDs.
- Report includes session summary, validated readings, derived calculations, alerts, and technician notes without fabricating unavailable values.

- [ ] Write failing tests for attaching/detaching a session and producing a report from validated data.
- [ ] Add minimal repository/UI hooks using existing job/equipment/report models.
- [ ] Verify offline attachment queues and later sync.
- [ ] Run report/job tests.
- [ ] Commit `feat(fieldtech): attach HVAC node diagnostics to jobs`.

### Task 11: Feature Flag, Regression Suite, and Build Verification

**Files:**
- Modify existing feature/config mechanism discovered in repo; if none exists, add one focused `HvacNodeFeatureFlags` preference/config file.
- Update relevant docs only after verification.

**Interfaces:**
- HVAC Node destination is disabled by default in production configuration until field acceptance is recorded.

- [ ] Add tests proving disabled flag leaves current app behavior/navigation unchanged.
- [ ] Run full Android unit suite: `./gradlew test`.
- [ ] Run headless Android build using the documented `ci/android-build.Dockerfile` flow and verify `assembleDebug` succeeds.
- [ ] Run backend tests/migration validation and verify existing K10 endpoints remain intact.
- [ ] Record exact commands/results in an implementation verification document.
- [ ] Commit `test: verify HVAC node integration without regressions`.

### Task 12: Physical Hardware Acceptance

**Files:**
- Create: `docs/hvac/HVAC_NODE_FIELD_ACCEPTANCE.md`

**Interfaces:**
- Produces a signed/dated acceptance record for each hardware model; no software API changes.

- [ ] Install verified debug/release candidate on a physical Android field phone.
- [ ] Pair Pi 5 Ultra; compare each sensor channel against trusted HVAC reference instruments and record deviations.
- [ ] Repeat for UNO Q Pro.
- [ ] Disconnect internet and verify live readings, calculations, diagnostics, notes, and session recording continue.
- [ ] Interrupt Wi-Fi/BLE and verify stale indication, reconnect, sequence resume, deduplication, and ring-buffer recovery.
- [ ] Restore internet and verify queued session/report data syncs once with correct job/equipment association.
- [ ] Only enable the production feature flag after both hardware models pass agreed calibration/reliability thresholds.
- [ ] Commit `docs: record HVAC node field acceptance`.

## Final Verification Gate

Before calling this production-ready, verify all of the following with captured command/device evidence: Android tests pass; Android APK builds; backend tests and migrations pass; existing K10/HVAC/auth flows regress cleanly; Pi 5 and UNO Q both connect through the same screen; offline mode works; stale data is labeled; reconnect/dedup works; work-order attachment syncs; and physical sensor readings have been compared against trusted instruments.
