# WISE² Superpowers HVAC XR Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Formalize the Superpowers workflow for WISE² and connect validated Pocket Node HVAC telemetry to the existing Quest 3/3S XR client without disrupting offline demo behavior.

**Architecture:** PromptOS remains the runtime agent framework; Superpowers governs repository change discovery, design approval, planning, implementation, and verification. Telemetry crosses an authenticated WISE² backend boundary through versioned shared contracts, while Unity consumes read-only snapshots behind `IWise2ApiClient` and keeps command actions previewed and approval-gated.

**Tech Stack:** pnpm monorepo, TypeScript/NestJS, existing WISE² API and edge services, Unity 6/OpenXR, C#, Jest/Vitest where established.

**Spec:** `docs/superpowers/specs/2026-09-06-wise2-superpowers-hvac-xr-design.md`

## Global Constraints

- Reuse existing PromptOS, API, edge, XR, and HVAC conventions; do not introduce a duplicate orchestration layer.
- Preserve pre-existing worktree changes; stage only files belonging to the current task.
- Offline XR behavior remains available without network access.
- Live data must never be shown without an explicit freshness/connection state.
- Unity must not contain Discord tokens, database credentials, or privileged backend secrets.
- External state-changing actions require `CommandPreview` and explicit confirmation.
- Use focused tests before broader suites and stop after requested behavior is verified.

---

### Task 1: Document the WISE² Superpowers workflow

**Files:**
- Create: `docs/superpowers/workflow.md`
- Reference: `AGENTS.md`, `CLAUDE.md`, `promptos/README.md`, `.agents/brand-context.md`

**Interfaces:**
- Produces the repository-level workflow entry point for future design and implementation work.

- [ ] **Step 1: Write the workflow document**

Document classification (spike/bounded/architectural), the brainstorming approval gate, spec and plan locations, self-review checks, implementation handoff, focused verification, and WISE² Credit Saver rules. State explicitly that PromptOS handles runtime routing and Superpowers handles development lifecycle governance.

- [ ] **Step 2: Validate the document**

Run: `rg -n 'approval|PromptOS|Credit Saver|docs/superpowers/specs|docs/superpowers/plans' docs/superpowers/workflow.md`

Expected: each required workflow concept is present and no placeholder markers are present.

- [ ] **Step 3: Commit**

Run: `git add docs/superpowers/workflow.md && git commit -m "docs: formalize WISE2 Superpowers workflow"`

### Task 2: Define shared HVAC telemetry contracts

**Files:**
- Create: `packages/wise2-hvac-contracts/package.json`
- Create: `packages/wise2-hvac-contracts/tsconfig.json`
- Create: `packages/wise2-hvac-contracts/src/index.ts`
- Create: `packages/wise2-hvac-contracts/src/telemetry.ts`
- Test: `packages/wise2-hvac-contracts/src/telemetry.test.ts`
- Modify: `package.json` only if required to register the package in existing workspace conventions

**Interfaces:**
- Produces `TelemetryQuality`, `TelemetryConnectionState`, `HvacTelemetryReading`, `PocketNodeTelemetryEnvelope`, and `HvacTelemetrySnapshot` types.
- `HvacTelemetryReading` contains optional pressure, temperature, superheat, subcooling, and electrical values, each with an explicit unit and numeric value.
- `PocketNodeTelemetryEnvelope` contains `schemaVersion`, `nodeId`, `capturedAt`, and `readings`.

- [ ] **Step 1: Write failing contract tests**

Test that a valid envelope preserves units and timestamps, rejects missing `nodeId`/`capturedAt`, rejects non-finite numeric values, and permits absent optional measurements.

- [ ] **Step 2: Run the focused test**

Run: `pnpm --filter @wise2/hvac-contracts test -- telemetry.test.ts`

Expected: FAIL because the package and validators do not exist.

- [ ] **Step 3: Implement the minimal typed contract and validator**

Expose a pure `parsePocketNodeTelemetry(input: unknown): PocketNodeTelemetryEnvelope` function. It must reject malformed input with a stable error and must not coerce strings into numbers.

- [ ] **Step 4: Run focused tests and type-check**

Run: `pnpm --filter @wise2/hvac-contracts test -- telemetry.test.ts && pnpm --filter @wise2/hvac-contracts type-check`

Expected: PASS.

- [ ] **Step 5: Commit**

Run: `git add packages/wise2-hvac-contracts package.json pnpm-lock.yaml && git commit -m "feat: add WISE2 HVAC telemetry contracts"`

### Task 3: Add authenticated HVAC telemetry API boundary

**Files:**
- Create: `packages/api/src/hvac-telemetry/hvac-telemetry.controller.ts`
- Create: `packages/api/src/hvac-telemetry/hvac-telemetry.service.ts`
- Create: `packages/api/src/hvac-telemetry/hvac-telemetry.module.ts`
- Create: `packages/api/src/hvac-telemetry/dto/telemetry.dto.ts`
- Test: `packages/api/src/hvac-telemetry/hvac-telemetry.service.spec.ts`
- Modify: `packages/api/src/app.module.ts`

**Interfaces:**
- `POST /v1/hvac/telemetry` accepts a validated `PocketNodeTelemetryEnvelope` through the existing authentication/tenant guard convention.
- `GET /v1/hvac/telemetry/:nodeId/latest` returns `HvacTelemetrySnapshot` with freshness and connection state.
- The service exposes `ingest(envelope, tenantId)` and `latest(nodeId, tenantId)` methods.

- [ ] **Step 1: Write failing service tests**

Cover unauthenticated access, valid ingestion, malformed readings, stale timestamps, tenant isolation, and latest-snapshot state mapping.

- [ ] **Step 2: Run the focused API test**

Run: `pnpm --filter @wise2/api test -- hvac-telemetry.service.spec.ts --runInBand`

Expected: FAIL because the module and service do not exist.

- [ ] **Step 3: Implement validation and persistence using existing API/database patterns**

Reuse the existing auth guard, tenant extraction, logger, and Prisma/TypeORM conventions discovered in neighboring modules. Store only the normalized fields required for the snapshot; do not create a parallel HVAC job model.

- [ ] **Step 4: Add the module to the API application**

Register `HvacTelemetryModule` in `packages/api/src/app.module.ts` and preserve the project’s existing route prefix behavior.

- [ ] **Step 5: Run focused tests and type-check**

Run: `pnpm --filter @wise2/api test -- hvac-telemetry.service.spec.ts --runInBand && pnpm --filter @wise2/api type-check`

Expected: PASS.

- [ ] **Step 6: Commit**

Run: `git add packages/api/src/hvac-telemetry packages/api/src/app.module.ts && git commit -m "feat: add authenticated HVAC telemetry API"`

### Task 4: Connect the XR HVAC station through a read-only adapter

**Files:**
- Create: `apps/wise2-xr/Assets/Scripts/Contracts/HvacTelemetry.cs`
- Create: `apps/wise2-xr/Assets/Scripts/Services/Wise2HvacApiClient.cs`
- Modify: `apps/wise2-xr/Assets/Scripts/XRCommandCenterRuntime.cs`
- Modify: `apps/wise2-xr/README.md`

**Interfaces:**
- `Wise2HvacApiClient` implements the existing `IWise2ApiClient` boundary for latest HVAC snapshots.
- The client maps backend state to `WorldState.Connected`, `OfflineDemo`, `Degraded`, or `CriticalAlert` and never treats stale data as connected.
- The existing scene/station shell remains reusable; HVAC is the first station to display a live-capable snapshot.

- [ ] **Step 1: Add a pure state-mapping test or testable helper**

Verify mappings for fresh data, no data, stale data, transport failure, and explicit demo mode before changing scene behavior.

- [ ] **Step 2: Implement the adapter**

Use the configured `WISE2_API_BASE_URL`, scoped authentication mechanism already used by the project, bounded request timeouts, and explicit fallback to the existing offline demo service. Do not add secrets to serialized Unity assets.

- [ ] **Step 3: Update HVAC station rendering**

Replace only the HVAC station’s static status text with the adapter’s state and a compact set of units-labeled readings. Keep all other stations and the current visual palette intact.

- [ ] **Step 4: Verify Unity project consistency**

Run: `bash apps/wise2-xr/scripts/build-quest.sh` when Unity is installed.

Expected: Android build succeeds, or the environment limitation is recorded without claiming a successful build.

- [ ] **Step 5: Commit**

Run: `git add apps/wise2-xr/Assets/Scripts/Contracts/HvacTelemetry.cs apps/wise2-xr/Assets/Scripts/Services/Wise2HvacApiClient.cs apps/wise2-xr/Assets/Scripts/XRCommandCenterRuntime.cs apps/wise2-xr/README.md && git commit -m "feat: connect XR HVAC telemetry adapter"`

### Task 5: Verify integration boundaries and document operation

**Files:**
- Create: `docs/WISE2-HVAC-XR-TELEMETRY.md`
- Test/inspect: `packages/wise2-hvac-contracts/src/telemetry.test.ts`, `packages/api/src/hvac-telemetry/hvac-telemetry.service.spec.ts`, XR build output

**Interfaces:**
- Documents endpoint behavior, state meanings, sample safe payloads, offline operation, and approval/security boundaries.

- [ ] **Step 1: Run focused contract and API tests**

Run: `pnpm --filter @wise2/hvac-contracts test && pnpm --filter @wise2/api test -- hvac-telemetry.service.spec.ts --runInBand`

Expected: PASS.

- [ ] **Step 2: Run repository type-check for touched packages**

Run: `pnpm --filter @wise2/hvac-contracts type-check && pnpm --filter @wise2/api type-check`

Expected: PASS.

- [ ] **Step 3: Review security and state behavior**

Confirm no secrets are tracked, all remote actions remain preview/confirmation-gated, and `DEMO`/`NO TELEMETRY`/`DEGRADED` states are visible and distinct.

- [ ] **Step 4: Write the operational document**

Include a safe example envelope, endpoint semantics, freshness rules, local demo behavior, and Quest build/install verification steps without including credentials.

- [ ] **Step 5: Commit**

Run: `git add docs/WISE2-HVAC-XR-TELEMETRY.md && git commit -m "docs: add HVAC XR telemetry operations guide"`

---

## Completion Criteria

- WISE² has a discoverable Superpowers workflow document.
- Contracts, API, and XR boundaries are independently testable.
- Offline demo remains functional.
- Live telemetry has explicit authentication, validation, freshness, and failure states.
- No unrelated dirty files are staged or modified.
- Focused tests pass; Quest build status is explicitly verified or reported as unavailable.

