# WISE² Quest Command Center Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing WISE² Quest client into a shared-session FIELD + COMMAND interface synchronized with Field Agent, Business OS, Revenue OS, AI/Phone, telemetry, simulation, and team state.

**Architecture:** Keep `apps/wise2-xr` as the only Quest client. Reuse the existing HVAC telemetry and API clients, add a shared job/session store and source-aware measurement bus, then layer FIELD and COMMAND presenters on top. All state-changing operations go through existing WISE² backend services and use session/work-order identifiers for idempotency.

**Tech Stack:** Unity 6, OpenXR/Meta Quest 3S, C#, existing NestJS/TypeScript WISE² API, pnpm monorepo, existing HVAC contracts and Quest build scripts.

**Spec:** `docs/superpowers/specs/2026-09-12-quest-command-center-design.md`

## Global Constraints

- Reuse `apps/wise2-xr`; do not create another Quest app.
- Preserve package id `com.wise2.xrcommandcenter`.
- FIELD and COMMAND share one active session.
- Live, stale, expected, inferred, and simulated values must be visually distinct.
- Preserve offline/demo behavior.
- No provider credentials or privileged secrets in Unity assets or logs.
- Backend writes must be idempotent.
- Quest 3S readability and stable frame rate beat decorative effects.

---

### Task 1: Shared job/session contract

**Files:**
- Create: `apps/wise2-xr/Assets/Scripts/Contracts/FieldSession.cs`
- Create: `apps/wise2-xr/Assets/Tests/EditMode/FieldSessionTests.cs`
- Create or extend: `packages/wise2-field-contracts/src/session.ts`
- Create: `packages/wise2-field-contracts/src/session.test.ts`

**Interfaces:**
- `FieldSessionEnvelope`: sessionId, technicianId, customerId, workOrderId, assetId, status, version, updatedAt.
- Unity `FieldSession` mirrors those identifiers.

- [ ] Write failing contract tests for required IDs and version preservation.
- [ ] Run focused TypeScript test and confirm failure.
- [ ] Implement strict validator and closed status set: queued, active, completing, completed, blocked.
- [ ] Write Unity EditMode tests proving IDs/version survive serialization and updates.
- [ ] Run focused tests and commit `feat: add shared field session contract`.

### Task 2: Active-session resolution and persistence

**Files:**
- Create: `apps/wise2-xr/Assets/Scripts/Services/Wise2SessionApiClient.cs`
- Create: `apps/wise2-xr/Assets/Scripts/State/FieldSessionStore.cs`
- Test: `apps/wise2-xr/Assets/Tests/EditMode/FieldSessionStoreTests.cs`
- Modify: `apps/wise2-xr/Assets/Scripts/XRCommandCenterRuntime.cs`
- Modify: `apps/wise2-xr/Assets/Scripts/Wise2Config.cs`

**Interfaces:**
- `Wise2SessionApiClient.RefreshActiveSession()` returns the current session or empty.
- `FieldSessionStore.Apply()` rejects lower-version updates and preserves current state through transport failure.

- [ ] Write failing store tests for initial assignment, higher-version update, stale-version rejection, and reconnect behavior.
- [ ] Implement pure `FieldSessionStore`.
- [ ] Implement session API adapter using existing auth/base URL conventions.
- [ ] On no active session, reuse the current Contractor OS/Today queue rather than introducing another queue model.
- [ ] Bootstrap the store before XR stations; preserve current HVAC, Sound Labs, Digital Twin, and Contractor OS behaviors.
- [ ] Verify offline state keeps last active session visible and commit `feat: persist active field session in XR`.

### Task 3: FIELD and COMMAND modes

**Files:**
- Create: `apps/wise2-xr/Assets/Scripts/World/XrMode.cs`
- Create: `apps/wise2-xr/Assets/Scripts/World/XrModeController.cs`
- Create: `apps/wise2-xr/Assets/Scripts/World/CommandWorldPresenter.cs`
- Create: `apps/wise2-xr/Assets/Scripts/World/FieldWorldPresenter.cs`
- Test: `apps/wise2-xr/Assets/Tests/EditMode/XrModeControllerTests.cs`
- Modify: `apps/wise2-xr/Assets/Scripts/XRCommandCenterRuntime.cs`

**Interfaces:**
- `enum XrMode { Field, Command }`.
- `XrModeController.SwitchTo(mode)` toggles presenters without changing `FieldSessionStore.Current`.

- [ ] Write failing tests proving FIELD -> COMMAND -> FIELD preserves sessionId, workOrderId, and version.
- [ ] Implement mode controller independent of network clients.
- [ ] Extract command-world rendering into `CommandWorldPresenter` and MR diagnostic layout into `FieldWorldPresenter` without replacing the runtime entry point.
- [ ] Add one persistent FIELD / COMMAND control; switching never reloads the scene.
- [ ] Confirm existing HVAC polling, Contractor OS polling, Sound Labs, deep links, and training links still initialize.
- [ ] Commit `feat: add FIELD and COMMAND XR modes`.

### Task 4: Normalized measurement bus + simulation

**Files:**
- Create: `apps/wise2-xr/Assets/Scripts/Contracts/Measurement.cs`
- Create: `apps/wise2-xr/Assets/Scripts/Services/IMeasurementProvider.cs`
- Create: `apps/wise2-xr/Assets/Scripts/Services/HvacTelemetryMeasurementProvider.cs`
- Create: `apps/wise2-xr/Assets/Scripts/Services/SimulationMeasurementProvider.cs`
- Test: `apps/wise2-xr/Assets/Tests/EditMode/MeasurementProviderTests.cs`
- Modify: `apps/wise2-xr/Assets/Scripts/Contracts/HvacTelemetry.cs`

**Interfaces:**
- Measurement fields include sourceDeviceId, type, value, unit, capturedAt, quality, battery, equipmentPoint, and sourceKind.
- sourceKind: Live, Simulated, Expected, Inferred, Stale.

- [ ] Write failing source-classification tests.
- [ ] Implement source-aware measurement types without UI logic.
- [ ] Adapt existing `Wise2HvacApiClient` into `HvacTelemetryMeasurementProvider`; do not duplicate HTTP code.
- [ ] Add deterministic simulation scenarios: normal cooling, low charge, restricted airflow, open pressure switch, contactor/control fault.
- [ ] Add explicit LIVE / SIMULATION runtime indicator and prevent simulation data from writing to live asset history.
- [ ] Commit `feat: add normalized live and simulation measurement bus`.

### Task 5: Immersive stations + refrigerant/electrical twins

**Files:**
- Create: `apps/wise2-xr/Assets/Scripts/Stations/ActiveJobStation.cs`
- Create: `apps/wise2-xr/Assets/Scripts/Stations/FieldAgentStation.cs`
- Create: `apps/wise2-xr/Assets/Scripts/Stations/RevenueStation.cs`
- Create: `apps/wise2-xr/Assets/Scripts/Stations/AiCommunicationsStation.cs`
- Create: `apps/wise2-xr/Assets/Scripts/Twin/RefrigerantFlowPresenter.cs`
- Create: `apps/wise2-xr/Assets/Scripts/Twin/ElectricalSchematicPresenter.cs`
- Test: `apps/wise2-xr/Assets/Tests/EditMode/SystemTwinSourceTests.cs`

**Interfaces:**
- Stations consume `FieldSessionStore` and measurement providers only.
- Refrigerant/electrical presenters may animate confirmed live or explicit simulation state, never inferred values as live.

- [ ] Write tests proving inferred voltage never renders as confirmed energized and stale data stops live animation.
- [ ] Build active-job, Field Agent, Revenue, and AI/Communications stations using the approved color hierarchy.
- [ ] Build source-badged refrigerant flow view.
- [ ] Build electrical schematic states for confirmed energized, confirmed de-energized, simulated, stale, and unknown.
- [ ] Add grab/pin/expand behavior using the existing XR interaction framework.
- [ ] Commit `feat: add immersive XR stations and system twins`.

### Task 6: Shared completion + Revenue OS + communications

**Files:**
- Create: `apps/wise2-xr/Assets/Scripts/Services/WorkOrderActionClient.cs`
- Create: `apps/wise2-xr/Assets/Scripts/Actions/CompleteJobCoordinator.cs`
- Test: `apps/wise2-xr/Assets/Tests/EditMode/CompleteJobCoordinatorTests.cs`
- Modify existing backend work-order/session completion files discovered during implementation; reuse current invoice/CRM models.

**Interfaces:**
- `Prepare()` validates without mutating backend state.
- `Commit(idempotencyKey)` submits one canonical completion request and returns the updated session/work-order version.

- [ ] Write failing tests for missing required data, success, duplicate submit, version conflict, and offline queue behavior.
- [ ] Implement client coordinator; Quest never directly duplicates invoice/CRM/Discord/Telnyx side effects.
- [ ] Extend the canonical backend completion flow to emit one deduplicated job-completed event keyed to the work order/session.
- [ ] Surface call/text/transcript-summary/follow-up status through the AI/Communications station without provider credentials on Quest.
- [ ] Test near-simultaneous phone + Quest completion and prove one finalization/invoice event.
- [ ] Commit `feat: synchronize XR completion with revenue and communications`.

### Task 7: Quest 3S verification and operational docs

**Files:**
- Modify: `apps/wise2-xr/README.md`
- Modify: `apps/wise2-xr/VERIFICATION_CHECKLIST.md`
- Create: `docs/WISE2-QUEST-COMMAND-CENTER-OPS.md`

- [ ] Run all touched TypeScript/backend tests.
- [ ] Run Unity EditMode tests under `apps/wise2-xr/Assets/Tests/EditMode`.
- [ ] Build with `bash apps/wise2-xr/scripts/build-quest.sh`; record an exact blocker instead of claiming success if Unity is unavailable.
- [ ] Install the resulting APK with the existing WISE² Quest deployment workflow and preserve app data during update.
- [ ] On Quest 3S verify: active/selected job -> FIELD -> simulated diagnostics -> COMMAND -> Field Agent/Revenue/AI stations -> FIELD with same session -> offline -> reconnect -> completion validation.
- [ ] Inspect runtime logs for repeated exceptions, secret leakage, and session-reset loops.
- [ ] Record APK path, device/Quest OS, test results, known limitations, and rollback branch/commit in the ops guide.
- [ ] Commit `docs: verify WISE2 Quest Command Center integration`.

---

## Follow-on Modules After V1 Verification

The V1 contracts intentionally prepare for but do not block on: vendor-specific Bluetooth adapters, Ray-Ban Meta capture transport, multiplayer remote-expert streaming, full voice-agent control, and additional Business/Revenue districts. These must reuse the same session IDs and measurement model rather than introducing parallel data models.

## Definition of Done

Do not mark this plan complete until the existing Quest app has been rebuilt, installed on Quest 3S, launched successfully, passed the FIELD -> COMMAND -> FIELD session-persistence flow, displayed source-correct simulation/live state, retained a job through offline/reconnect, and demonstrated that shared completion cannot duplicate backend actions.
