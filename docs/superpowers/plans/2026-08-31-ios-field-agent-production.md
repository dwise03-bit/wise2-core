# WISE² iOS Field Agent Production Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a road-ready native WISE² Field Tech iOS client with verified Fieldpiece capture, offline-first CRM synchronization, complete technician closeout, and a stable wise2.net install/update portal.

**Architecture:** Keep `apps/wise2-ios` as the native field client, use a durable local job store plus idempotent sync queue between the app and existing WISE² fieldtech APIs, and keep `apps/wise-hvac-demo` as the web CRM/fallback surface. Publish a stable `/fieldtech` install page that points to the current signed Apple distribution target.

**Tech Stack:** Swift/SwiftUI, CoreBluetooth, URLSession, Keychain, native persistence (SwiftData/Core Data according to existing project deployment target), XCTest, Next.js 14/React/Tailwind, existing WISE² fieldtech API, Apple signed distribution/TestFlight.

**Spec:** `docs/superpowers/specs/2026-08-31-ios-field-agent-production-design.md`

## Global Constraints

- Do not break the live `apps/wise-hvac-demo` production workflow.
- Production must never label simulated or unverified BLE bytes as Fieldpiece measurements.
- Credentials belong in Keychain; unsynced field work must survive authentication expiry and app termination.
- Measurements and attachments are append-only during synchronization.
- All queued mutations require stable operation IDs for idempotency.
- `https://wise2.net/fieldtech` remains the permanent technician-facing install URL.
- Initial broad iOS distribution uses TestFlight unless a valid alternative Apple signing/distribution program is configured.

---

### Task 1: Lock Fieldpiece Protocol Boundary

**Files:**
- Modify: `apps/wise2-ios/WISE2/Core/Bluetooth/BLEManager.swift`
- Modify: `apps/wise2-ios/WISE2/Core/Bluetooth/FieldpieceModels.swift`
- Create: `apps/wise2-ios/WISE2/Core/Bluetooth/FieldpieceDecoder.swift`
- Test: `apps/wise2-ios/WISE2Tests/FieldpieceDecoderTests.swift`

**Interfaces:**
- Produces: `FieldpieceDecoder.decode(_:) -> VerifiedToolReading?`
- Produces: `VerifiedToolReading { deviceID, role, measurementKey, value, unit, capturedAt, verification }`
- BLEManager may publish only `VerifiedToolReading` into production measurement state.

- [ ] Write decoder tests proving unknown manufacturer bytes return `nil`, verified fixtures decode to expected role/value/unit, malformed frames return `nil`, and unsupported devices remain unsupported.
- [ ] Run the focused XCTest target and verify the new tests fail before implementation.
- [ ] Move raw byte interpretation out of `BLEManager`; make scanning/discovery independent from trusted measurement decoding.
- [ ] Implement explicit verified decoding adapters only for protocol fixtures/documentation actually available in the repository or approved Fieldpiece SDK. Do not guess missing characteristics.
- [ ] Run decoder tests and existing iOS tests; require PASS.
- [ ] Commit `feat(ios): verify Fieldpiece measurement decoding`.

### Task 2: Native Measurement Session

**Files:**
- Create: `apps/wise2-ios/WISE2/Features/FieldTech/Measurements/MeasurementSession.swift`
- Create: `apps/wise2-ios/WISE2/Features/FieldTech/Measurements/DerivedMeasurements.swift`
- Modify: `apps/wise2-ios/WISE2/Core/Bluetooth/FieldpieceModels.swift`
- Test: `apps/wise2-ios/WISE2Tests/MeasurementSessionTests.swift`

**Interfaces:**
- Consumes: `VerifiedToolReading`
- Produces: `CapturedMeasurement` with `jobID`, optional `equipmentID`, `probeID`, `role`, `measurementKey`, `value`, `unit`, `capturedAt`, `source`, `verification`.
- Produces: pure derived-value functions that return `nil` when required inputs are absent/invalid.

- [ ] Write failing tests for attaching readings to the active job, manual-entry source tagging, duplicate sample handling, Delta-T, TESP, superheat/subcooling input validation, and missing-input `nil` behavior.
- [ ] Run focused tests and confirm failure.
- [ ] Implement the measurement session and pure derived-measurement functions without UI dependencies.
- [ ] Run focused and full iOS tests; require PASS.
- [ ] Commit `feat(ios): add job measurement sessions`.

### Task 3: Durable Offline Job Store

**Files:**
- Create: `apps/wise2-ios/WISE2/Core/Offline/FieldJobStore.swift`
- Create: `apps/wise2-ios/WISE2/Core/Offline/OfflineModels.swift`
- Create: `apps/wise2-ios/WISE2/Core/Security/KeychainSessionStore.swift`
- Test: `apps/wise2-ios/WISE2Tests/FieldJobStoreTests.swift`

**Interfaces:**
- Produces: `FieldJobStore.cacheBootstrap(_:)`, `job(id:)`, `saveMeasurement(_:)`, `saveNote(_:)`, `saveRepair(_:)`, `saveAttachmentMetadata(_:)`, `saveSignature(_:)`.
- Produces: Keychain-backed session/token storage separate from the job database.

- [ ] Write failing persistence tests proving cached jobs and unsynced evidence survive store recreation while credentials are not persisted in ordinary job records.
- [ ] Run tests and confirm failure.
- [ ] Implement persistence using the project's supported native persistence framework and iOS data protection.
- [ ] Implement Keychain session storage and migration-safe Codable/domain boundaries.
- [ ] Run tests; require PASS.
- [ ] Commit `feat(ios): add offline field job persistence`.

### Task 4: Idempotent Sync Queue

**Files:**
- Create: `apps/wise2-ios/WISE2/Core/Sync/SyncOperation.swift`
- Create: `apps/wise2-ios/WISE2/Core/Sync/FieldSyncQueue.swift`
- Create: `apps/wise2-ios/WISE2/Core/Sync/FieldSyncWorker.swift`
- Test: `apps/wise2-ios/WISE2Tests/FieldSyncQueueTests.swift`

**Interfaces:**
- Produces: stable UUID operation IDs.
- Produces: queue states `pending`, `sending`, `retrying`, `acknowledged`, `terminalFailure`.
- Produces: retry classification and per-job ordering.

- [ ] Write failing tests for persistence, ordered operations within a job, retry backoff classification, duplicate operation suppression, terminal failure retention, and resume after worker recreation.
- [ ] Run focused tests and confirm failure.
- [ ] Implement queue storage and worker with stable operation IDs and reachability-triggered resume.
- [ ] Ensure logout/auth expiry never deletes pending operations.
- [ ] Run tests; require PASS.
- [ ] Commit `feat(ios): add durable CRM sync queue`.

### Task 5: Typed WISE² FieldTech API Client

**Files:**
- Create: `apps/wise2-ios/WISE2/Core/API/FieldTechAPIClient.swift`
- Create: `apps/wise2-ios/WISE2/Core/API/FieldTechAPIModels.swift`
- Create: `apps/wise2-ios/WISE2/Core/API/FieldTechAPIError.swift`
- Test: `apps/wise2-ios/WISE2Tests/FieldTechAPIClientTests.swift`

**Interfaces:**
- Produces: bootstrap jobs, append measurements, diagnostic persistence, repair/test-out persistence, attachment lifecycle, signature metadata, completion and sync acknowledgement calls.
- Produces typed errors: `auth`, `forbidden`, `validation`, `conflict`, `transient`, `unsupported`.

- [ ] Write URLProtocol-backed failing tests for auth headers, stable operation-id header/body propagation, success decoding and every typed error family.
- [ ] Run tests and confirm failure.
- [ ] Implement the smallest API client matching existing fieldtech routes; gate missing server contracts behind explicit unsupported errors rather than inventing success.
- [ ] Connect transient/terminal classifications to `FieldSyncWorker`.
- [ ] Run tests; require PASS.
- [ ] Commit `feat(ios): add typed fieldtech API client`.

### Task 6: Server Idempotency and Missing CRM Contracts

**Files:**
- Inspect/modify the existing WISE² fieldtech API modules under `packages/api` or the currently deployed API package discovered in the repo.
- Add focused API tests beside the existing fieldtech tests.

**Interfaces:**
- Consumes: stable client operation ID.
- Produces: operation acknowledgement with server entity/revision metadata.
- Repeated accepted operation ID must not duplicate append-only records or job completion.

- [ ] Map the actual deployed fieldtech routes before editing and record exact route/file mapping in the progress document.
- [ ] Write failing API tests for duplicate measurement operation, duplicate completion operation, validation failure and unauthorized technician access.
- [ ] Implement processed-operation/idempotency persistence using the existing database patterns.
- [ ] Add only missing endpoints required by the iOS client; reuse existing contracts wherever possible.
- [ ] Run fieldtech API tests and existing API regression tests; require PASS.
- [ ] Commit `feat(api): make field sync idempotent`.

### Task 7: Technician Workflow UI

**Files:**
- Inspect existing SwiftUI Field Tech views under `apps/wise2-ios/WISE2` and modify the current navigation shell rather than creating a competing app shell.
- Create focused views only where absent: Today, Customer/Equipment, Tool Hub, Live, Repair/Test-Out, Closeout/Signature, Sync Status.
- Test: existing/new view-model tests under `apps/wise2-ios/WISE2Tests`.

**Interfaces:**
- Consumes: local `FieldJobStore`, `MeasurementSession`, `BLEManager`, `FieldSyncQueue`.
- Produces technician workflow `TODAY -> CUSTOMER -> EQUIPMENT -> TOOLS -> LIVE -> IMP -> REPAIR -> TEST OUT -> NOTES -> SIGNATURE -> COMPLETE`.

- [ ] Write failing view-model tests for job selection, offline banner/status, tool assignment, completion queued offline, and re-auth-required-with-work-retained states.
- [ ] Run tests and confirm failure.
- [ ] Wire the existing UI to local-first data and the new services.
- [ ] Add clear states `OFFLINE`, `SAVED LOCALLY`, `SYNCING`, `SYNCED`, `ACTION REQUIRED`; never display unsupported tool data as live.
- [ ] Preserve existing WISE² visual language and accessibility/dynamic type behavior.
- [ ] Run tests and build the iOS target; require PASS.
- [ ] Commit `feat(ios): complete field technician workflow`.

### Task 8: Attachments, Signature, GPS and Closeout

**Files:**
- Create/modify focused native services under `apps/wise2-ios/WISE2/Features/FieldTech` for media capture, location event capture and signature persistence.
- Test corresponding service/view-model tests.

**Interfaces:**
- Produces attachment metadata sync operations and arrival/departure location events with explicit permission state.
- Produces locally durable signature metadata/image reference associated with a job.

- [ ] Write failing tests for permission-denied states, offline attachment metadata retention, signature retention and completion dependency rules.
- [ ] Implement camera/photo attachment flow, voice attachment metadata, explicit location events and signature capture using native APIs already permitted by project entitlements.
- [ ] Queue upload metadata separately from local media so failed uploads do not lose evidence.
- [ ] Run tests and physical-device permission smoke checks.
- [ ] Commit `feat(ios): add field evidence and closeout capture`.

### Task 9: IMP Integration with Trusted Measurements

**Files:**
- Modify existing iOS IMP/diagnostic client and shared mapping code discovered in the repo.
- Add tests beside current IMP tests.

**Interfaces:**
- Consumes trusted/manual `CapturedMeasurement` snapshots.
- Produces persisted diagnostic request/result and guided-test sync operations.

- [ ] Write failing tests proving unverified BLE readings are excluded, manual readings remain source-labeled, and diagnostic snapshots are immutable once submitted.
- [ ] Implement measurement-to-IMP mapping and persistence.
- [ ] Preserve evidence/confidence semantics and prohibit fabricated percentages/data.
- [ ] Run IMP + iOS tests; require PASS.
- [ ] Commit `feat(ios): connect trusted field data to IMP`.

### Task 10: wise2.net FieldTech Install Portal

**Files:**
- Inspect `dwise03-bit/wise2.net` and/or the actual site package serving wise2.net before editing.
- Create/modify route for `/fieldtech` plus configuration for current signed iOS distribution URL.
- Add route/component tests according to the site's existing framework.

**Interfaces:**
- Stable public URL: `https://wise2.net/fieldtech`.
- Configured distribution target may change without changing the public portal URL.

- [ ] Write failing route/component tests for iOS install CTA, current version/build, release notes, minimum iOS, API status state and QR target.
- [ ] Implement WISE²-branded technician install/update page using the existing site design system.
- [ ] Make TestFlight/App Store/managed target configuration-driven; do not hard-code an unsigned IPA as a general install path.
- [ ] Add safe non-iOS instructions and a link to the browser fallback at `https://hvac.wise2.net`.
- [ ] Run site tests/build; require PASS.
- [ ] Commit `feat(web): add Field Tech install portal`.

### Task 11: Signing, Release and Physical Field QA

**Files:**
- Modify existing Xcode project signing/release configuration only as required.
- Create: `docs/WISE2-IOS-FIELD-RELEASE.md`.
- Update: `docs/WISE2-HVAC-V1-PROGRESS.md`.

**Interfaces:**
- Produces a signed archive and approved Apple distribution destination.
- Produces release runbook and rollback instructions.

- [ ] Verify bundle ID, team, capabilities, Bluetooth/camera/location/photo permission strings, background modes actually required, minimum iOS and version/build number.
- [ ] Run full iOS test suite and clean archive.
- [ ] Install on a physical iPhone and test Bluetooth permission denial/re-enable, supported probe discovery, out-of-range reconnect, airplane-mode job work, app kill/relaunch, weak-network sync and auth-expiry retention.
- [ ] Upload the signed build to the configured Apple distribution path when credentials/account access permit; otherwise record the exact signing/account blocker without claiming deployment.
- [ ] Point `/fieldtech` at the approved build only after release validation.
- [ ] Smoke test production login, assigned jobs, one measurement capture path, offline queue recovery and completion acknowledgement.
- [ ] Update progress/release docs with actual build, test evidence and remaining limitations.
- [ ] Commit `release: prepare WISE2 Field Tech iOS`.

### Task 12: Final Regression and Release Gate

**Files:**
- No new production files unless a failing regression requires a scoped fix.

**Interfaces:**
- Validates all prior task outputs together.

- [ ] Run all iOS unit/integration tests.
- [ ] Run API fieldtech tests and relevant API regression suite.
- [ ] Run `apps/wise-hvac-demo` tests, typecheck and lint to prove the existing live fallback remains healthy.
- [ ] Run wise2.net site tests/build.
- [ ] Verify production never converts unknown BLE bytes to trusted measurements.
- [ ] Verify repeated sync operations do not duplicate measurements or completion.
- [ ] Verify unsynced work survives app restart and expired authentication.
- [ ] Verify `https://wise2.net/fieldtech` resolves to the approved current distribution path.
- [ ] Record exact verification commands/results in the progress document.
- [ ] Commit any documentation-only verification update as `docs: record Field Tech release verification`.