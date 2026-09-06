# WISE² Superpowers Methodology and HVAC XR Telemetry Design

**Date:** 2026-09-06  
**Status:** Architecture approved; written-spec review pending  
**Scope:** Establish the Superpowers development workflow for WISE² and define the first governed project: Pocket Node telemetry for the existing Meta Quest 3/3S XR app.

## Context

WISE² already has PromptOS runtime agents under `promptos/`, a monorepo with API and service boundaries, and an existing Unity client at `apps/wise2-xr`. The repository also contains Superpowers-style design and implementation artifacts under `docs/superpowers/`. The goal is to formalize the workflow without replacing PromptOS, rebuilding the XR shell, or disturbing unrelated work already present in the checkout.

The first project is HVAC XR telemetry: connect an ESP32 Pocket Node through an authenticated WISE² edge/API boundary to the Quest client, while retaining the current offline demo behavior and command approval safeguards.

## Goals

- Make architecture approval a hard prerequisite for implementation work.
- Keep design specs and implementation plans versioned in `docs/superpowers/`.
- Reuse PromptOS for runtime agent routing and add no duplicate orchestration layer.
- Establish stable, testable contracts between Pocket Node, backend services, and Unity.
- Add real telemetry without making network connectivity a prerequisite for the XR demo.
- Preserve WISE² brand, security, approval, and Credit Saver conventions.

## Non-goals

- Replacing PromptOS or its existing agents.
- Rebuilding the existing Unity XR Command Center.
- Introducing a second database model for HVAC jobs in this project.
- Moving secrets, Discord credentials, or privileged backend actions into Unity.
- Broad repository cleanup, refactoring, or normalization of unrelated dirty files.

## Methodology

The WISE² workflow is:

1. Inspect the repository, applicable instructions, current status, and existing assets.
2. Classify the request as spike, bounded, or architectural.
3. For architectural work, brainstorm intent and constraints, present alternatives, and obtain approval section by section.
4. Write an approved design spec and self-review it for placeholders, contradictions, ambiguity, and scope.
5. Obtain written-spec review before creating an implementation plan.
6. Create a detailed implementation plan; implementation begins only after the plan is approved where the task requires it.
7. Implement the smallest safe change, using focused tests first.
8. Verify behavior, security boundaries, and relevant build paths; stop when the requested result is verified.

PromptOS remains the runtime routing system. Superpowers governs how repository changes are conceived, approved, planned, implemented, and verified. The WISE² Credit Saver rule applies at every stage: inspect only relevant files, reuse existing code/assets, batch related work, avoid speculative dependencies, and prefer focused verification.

## Target architecture

```text
ESP32 Pocket Node
  → authenticated edge/API ingestion
  → normalized WISE² HVAC telemetry contract
  → Quest 3/3S XR client
  → Context Engine / Hermes
  → preview-and-approval command workflow
```

The backend is the trust boundary. The Pocket Node submits telemetry through an authenticated ingestion endpoint or existing edge service. The backend validates, timestamps, normalizes, and exposes read-only snapshots to Unity. Unity uses the existing service/contract abstraction and never connects directly to the database or privileged integrations.

## Components and responsibilities

### Superpowers workflow documentation

`docs/superpowers/workflow.md` will document WISE²-specific classification, approval gates, artifact locations, review expectations, and Credit Saver practices. It will reference the repository’s existing `AGENTS.md`, `CLAUDE.md`, PromptOS, and brand context rather than duplicating them.

### Shared contracts

A focused shared contract package (or the repository’s existing contract location if inspection shows a better fit) will define:

- Pocket Node identity and authentication metadata boundaries.
- HVAC readings: pressure, temperature, superheat, subcooling, electrical values, units, timestamp, and quality.
- Equipment/job association identifiers without embedding database models in the client.
- Connection and data freshness states.
- Versioning and forward-compatible optional fields.

The exact package path and transport representation will be confirmed in the implementation plan after inspecting existing API and edge conventions.

### API and edge boundary

The server validates identity, schema, units, ranges, timestamps, and freshness. Invalid or stale readings are rejected or marked degraded with an auditable reason. Read endpoints provide snapshots suitable for XR polling or a future streaming adapter. Write-side commands remain separate from telemetry and require `CommandPreview` plus explicit confirmation.

### Quest XR client

`apps/wise2-xr` remains the client. Its current offline demo service and explicit `DEMO`/`NO TELEMETRY` states remain first-class. A real API adapter is added behind the existing `IWise2ApiClient` boundary. The existing stations are reused; HVAC becomes the first live-capable station and can later expose gauges, diagnostics, work orders, and equipment context.

### Context Engine and Hermes

Hermes receives normalized context through an existing WISE² backend boundary. XR requests are read-oriented by default. Any action that changes external state is represented as a preview with an audit identifier, then confirmed through the approval service.

## Data and failure behavior

- Offline: show demo values and a visible `DEMO` state.
- No recent readings: show `NO TELEMETRY`, retain last-known timestamp if available.
- Auth or transport failure: show `DEGRADED`; do not silently present stale data as live.
- Malformed/out-of-range readings: reject or mark invalid at ingestion; expose a safe diagnostic reason.
- Backend unavailable: XR remains navigable and does not block other stations.
- Command approval failure: show `FAILED` or `AWAITING APPROVAL`; never retry a privileged action automatically.

## Security and privacy

- Device/API credentials stay in protected device or server configuration and out of source control.
- Unity receives scoped, short-lived access where required; it does not receive Discord tokens or database credentials.
- Ingestion is authenticated and rate-limited.
- Commands are auditable, previewed, and confirmation-gated.
- Logs avoid raw secrets and unnecessary customer or job data.

## Testing and verification

Focused tests will cover:

- Contract serialization, required fields, units, ranges, and version compatibility.
- Ingestion authentication and validation.
- Freshness and state mapping (`CONNECTED`, `DEMO`, `NO TELEMETRY`, `DEGRADED`).
- Offline XR behavior without network access.
- Approval gating for outbound actions.

Verification will use the smallest relevant package/API tests first, followed by the existing Quest build check when Unity tooling is available. A build or hardware check that cannot run locally will be reported as an explicit environment limitation, not represented as passed.

## Phasing

1. Formalize workflow documentation and repository entry points.
2. Confirm/reuse existing API, edge, and contract boundaries.
3. Add validated simulated/live telemetry contract path.
4. Connect the XR HVAC station to the read-only adapter.
5. Add focused tests and Quest/offline verification.
6. Extend to diagnostics, work orders, and spatial equipment context only after the telemetry slice is stable.

## Decisions requiring implementation-plan confirmation

- Exact shared-contract package path after inspecting current packages.
- Existing API route or new versioned route for telemetry ingestion.
- Polling versus streaming transport for the first live slice; polling is the default for minimal scope.
- Device provisioning mechanism; no new provisioning system is included until required by the existing edge architecture.

