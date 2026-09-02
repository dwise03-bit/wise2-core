# WISE² Business Audit Mobile Intelligence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the iOS/Android WISE² Business Audit MVP that records consented client conversations, produces structured AI audits and Business X-Ray results, drafts WISE² packages, synchronizes Discord, and prepares approval-gated automations.

**Architecture:** Extend the existing Consultant Audit OS in `wise2-core`. `apps/mobile` is the React Native/Expo capture-and-review client; WISE² Core and PostgreSQL remain authoritative. Asynchronous transcription, analysis, Discord notification, and package preparation run server-side through adapters/workers so providers can be replaced without changing mobile contracts.

**Tech Stack:** TypeScript, React Native, Expo, Zustand, PostgreSQL, Prisma, Node.js WISE² services, Redis/workers, Discord API, Jest/Vitest according to existing package conventions.

**Spec:** `docs/superpowers/specs/2026-09-01-wise2-business-audit-mobile-intelligence-design.md`

## Global Constraints

- Extend the existing WISE² Consultant Audit OS; do not create a parallel client/audit datastore.
- Recording must be consent-gated and visibly indicated; no covert recording.
- Mobile must survive weak connectivity and retain unsynced session data until server acknowledgement.
- Mobile owns capture/display only; transcription, scoring, package logic, Discord orchestration, and automation policy remain server-side.
- Discord is an operations surface, never the source of truth.
- Consequential external or billable automations require explicit authorized approval.
- AI outputs must be schema-validated and treated as recommendations.
- Transcription and LLM providers must sit behind replaceable interfaces.
- The same structured audit result drives mobile and web Business X-Ray views.

---

## File Structure

Implementation should preserve current repo conventions discovered during execution. These are the intended responsibility boundaries; if an equivalent existing file/module is found, extend it instead of duplicating it.

- `packages/db/prisma/schema.prisma` — authoritative persistence models/enums.
- `packages/shared/src/audit/types.ts` — transport-safe audit contracts shared by clients/services.
- `services/api/src/modules/audits/` — session, consent, result, package, and automation HTTP boundary if the existing API service is active; otherwise place routes in the repo's currently deployed API using the same contracts.
- `services/ai-orchestrator/src/audit/` — transcript-to-structured-audit analysis and provider-independent model adapter.
- `services/automation/src/audits/` — approval policy and downstream audit action planning.
- `services/bot/audits/` — Discord rendering/actions while reusing the existing bot entrypoint.
- `apps/mobile/src/features/audits/` — mobile audit state, screens, capture, sync, and Business X-Ray UI.
- `apps/dashboard/` existing audit surface — consume the shared structured result rather than independently calculating scores.

---

### Task 1: Persist the Audit Session State Machine

**Files:**
- Modify: `packages/db/prisma/schema.prisma`
- Create: `packages/shared/src/audit/types.ts`
- Create: `packages/shared/src/audit/state-machine.ts`
- Test: `packages/shared/src/audit/state-machine.test.ts`

**Interfaces:**
- Produces: `AuditSessionState`, `AuditConsentRecord`, `canTransitionAudit(from, to): boolean`, and identifiers used by all later tasks.

- [ ] **Step 1: Write failing state-machine tests** covering valid `DRAFT -> RECORDING -> UPLOADING -> TRANSCRIBING -> ANALYZING -> READY_FOR_REVIEW -> PACKAGE_DRAFTED -> APPROVED -> AUTOMATION_READY`, rejection of skipped transitions, and retry from explicit failure states.
- [ ] **Step 2: Run the shared-package test command from its `package.json`** and verify the new tests fail because the contracts/state machine do not exist.
- [ ] **Step 3: Add shared TypeScript contracts** with string-union states and `canTransitionAudit`; make transitions explicit in a readonly map so invalid states cannot silently advance.
- [ ] **Step 4: Extend Prisma** after inspecting existing Consultant Audit OS models. Add only missing session, consent, media, transcript, finding, score, opportunity, package-draft, automation-action, and Discord-link relations. Preserve existing `ConsultingClient`, `AuditStatus`, and existing audit records instead of replacing them.
- [ ] **Step 5: Generate Prisma client and migration** using the repository's package-manager scripts; inspect generated SQL to confirm it does not drop existing audit/client data.
- [ ] **Step 6: Run state-machine tests and Prisma validation**; expected result: PASS and valid schema.
- [ ] **Step 7: Commit** with `feat(audit): add mobile audit session model`.

### Task 2: Session, Consent, and Processing API

**Files:**
- Create/modify: deployed API audit module under `services/api/src/modules/audits/` or the repo's existing active API equivalent discovered before editing.
- Test: colocated audit API tests following existing conventions.

**Interfaces:**
- Consumes: Task 1 audit state/contracts.
- Produces: `POST /api/audits/sessions`, `GET /api/audits/sessions/:id`, `POST /api/audits/sessions/:id/consent`, `POST /api/audits/sessions/:id/complete`, `GET /api/audits/sessions/:id/processing`.

- [ ] **Step 1: Inspect current API routing/auth patterns** and record the exact existing auth guard and error-envelope conventions in the task notes before editing.
- [ ] **Step 2: Write failing API tests** proving authenticated consultants can create/read their allowed sessions, recording cannot enter `RECORDING` without affirmative consent, manual-notes mode can proceed without recording, and unauthorized users cannot access another consultant's protected audit.
- [ ] **Step 3: Run the narrow API test suite** and verify failures are caused by missing audit endpoints.
- [ ] **Step 4: Implement minimal controllers/routes and service methods** using the existing Prisma client and `canTransitionAudit`; validate request bodies with the repo's existing validation library.
- [ ] **Step 5: Add idempotency handling** for session completion so repeated mobile requests cannot enqueue duplicate processing jobs.
- [ ] **Step 6: Run API tests plus existing auth tests**; expected result: PASS with no auth regression.
- [ ] **Step 7: Commit** with `feat(audit): add session and consent api`.

### Task 3: Reliable Media Upload and Recovery

**Files:**
- Create: audit media adapter/service in the active API module.
- Create: object-storage adapter beside that service.
- Test: media service/API tests.

**Interfaces:**
- Produces: media-init response `{ mediaId, uploadTarget, expiresAt }`, server-confirmed media completion, integrity metadata, and a queued transcription job keyed by `auditSessionId` + `mediaId`.

- [ ] **Step 1: Write failing tests** for upload initialization, server completion, duplicate completion, invalid media/session ownership, and resumable retry behavior.
- [ ] **Step 2: Run the narrow tests** and verify FAIL.
- [ ] **Step 3: Implement an `AuditMediaStorage` interface** with methods to create an upload target, confirm object existence/integrity, and create a protected read target. Put provider-specific storage code behind the interface.
- [ ] **Step 4: Implement media-init/completion endpoints** without routing large audio bytes through JSON request bodies.
- [ ] **Step 5: On successful confirmation, atomically persist the media asset and enqueue transcription exactly once.**
- [ ] **Step 6: Run tests**; expected result: PASS including duplicate completion without duplicate job creation.
- [ ] **Step 7: Commit** with `feat(audit): add resilient media ingestion`.

### Task 4: Mobile Audit Shell, Client Selection, and Consent

**Files:**
- Modify/create under `apps/mobile/` according to the existing Expo app structure.
- Create focused feature files under `apps/mobile/src/features/audits/` for API client, store, queue screen, client screen, intake screen, and consent screen.
- Test: feature store/component tests following current mobile test conventions.

**Interfaces:**
- Consumes: Task 2 APIs.
- Produces: locally durable `ActiveAuditDraft`, selected client, consent record, and navigation into live capture only when policy permits.

- [ ] **Step 1: Inspect `apps/mobile/package.json`, navigation, auth, and Zustand patterns**; reuse them rather than adding a second state/navigation framework.
- [ ] **Step 2: Write failing store tests** for draft persistence, restoring an interrupted audit, affirmative consent, and manual-notes mode.
- [ ] **Step 3: Run mobile tests** and verify FAIL.
- [ ] **Step 4: Implement the audit feature store/API client** with local persistence for unsynced draft state and server IDs.
- [ ] **Step 5: Implement Queue -> Client -> Intake -> Consent screens** using existing WISE² tokens/components and vector icons; no emoji structural icons.
- [ ] **Step 6: Add accessibility labels and explicit recording-consent copy**, including a non-recording path.
- [ ] **Step 7: Run tests and Expo typecheck**; expected result: PASS.
- [ ] **Step 8: Commit** with `feat(mobile): add business audit intake flow`.

### Task 5: Mobile Audio Capture and Resumable Sync

**Files:**
- Create focused recording, local-session, and upload-sync modules under `apps/mobile/src/features/audits/`.
- Create Live Session and Processing screens.
- Test: recorder state tests, sync tests, and component tests.

**Interfaces:**
- Consumes: consent state and Task 3 media APIs.
- Produces: crash-safe local recording metadata, pause/resume state, markers/notes, confirmed `mediaId`, and processing navigation.

- [ ] **Step 1: Write failing tests** for permission denial, start without consent, pause/resume, app restart with pending media, failed upload retry, and deletion only after server confirmation.
- [ ] **Step 2: Run tests** and verify FAIL.
- [ ] **Step 3: Implement the recorder adapter** around the Expo/native recording facility already compatible with the app's SDK; expose `prepare`, `start`, `pause`, `resume`, `stop`, `dispose` rather than calling native APIs directly from screens.
- [ ] **Step 4: Implement local session persistence** so file URI, elapsed duration, markers, notes, and upload state survive process restart.
- [ ] **Step 5: Implement upload synchronization** using Task 3 targets; retry safely and retain local audio until the server confirms media completion.
- [ ] **Step 6: Implement Live Session UI** with persistent visible recording state, elapsed time, pause/resume, marker, note, and finish controls.
- [ ] **Step 7: Implement Processing UI** showing upload/transcribe/analyze state and recoverable failures from the server.
- [ ] **Step 8: Run tests, typecheck, and manual iOS/Android smoke builds**; expected result: no lost local recording through simulated offline/restart path.
- [ ] **Step 9: Commit** with `feat(mobile): add resilient audit recording`.

### Task 6: Transcription Adapter and Worker

**Files:**
- Create: provider-independent transcription module under the active AI/worker service.
- Create: worker/job handler for confirmed audit media.
- Test: adapter contract and worker tests.

**Interfaces:**
- Produces: normalized `AuditTranscript { id, sessionId, language, utterances[] }` where each utterance includes `speaker`, `startMs`, `endMs`, and `text`.

- [ ] **Step 1: Write failing adapter contract tests** using a fake provider and normalized timestamped utterances.
- [ ] **Step 2: Write failing worker tests** proving a completed media asset advances to `TRANSCRIBING`, persists transcript once, and advances to `ANALYZING`; retry must not duplicate transcript rows.
- [ ] **Step 3: Run tests** and verify FAIL.
- [ ] **Step 4: Implement `AuditTranscriptionProvider`** with a provider-neutral `transcribe(input): Promise<NormalizedTranscript>` contract.
- [ ] **Step 5: Implement the worker** using the protected media-read adapter, normalized transcript persistence, correlation IDs, and idempotent job keys.
- [ ] **Step 6: Add structured logs** for provider, latency, success/failure, and session correlation ID without logging full sensitive transcripts by default.
- [ ] **Step 7: Run tests**; expected result: PASS.
- [ ] **Step 8: Commit** with `feat(audit): add transcription pipeline`.

### Task 7: Structured Business Analysis and Explainable Scoring

**Files:**
- Create: `services/ai-orchestrator/src/audit/` analysis schema, prompt builder, analyzer, scoring engine, and tests (or equivalent active AI service path).

**Interfaces:**
- Consumes: normalized transcript.
- Produces: schema-validated findings, opportunities, category scores, evidence ranges, top-five priorities, and overall Business Health score.

- [ ] **Step 1: Define the exact runtime schema** for all domains in the spec: goals, bottlenecks, tools, leads/sales, follow-up, communications, website, reputation, brand/content, CRM, payments, cloud, repetitive work, AI readiness, mobile/field needs, budget/timing, stakeholders, objections, commitments.
- [ ] **Step 2: Write failing schema/scoring tests** using a fixed transcript fixture and invalid-model-output fixtures.
- [ ] **Step 3: Run tests** and verify FAIL.
- [ ] **Step 4: Implement `AuditAnalysisProvider`** so model choice is replaceable and provider output must parse through the runtime schema before persistence.
- [ ] **Step 5: Implement deterministic score normalization** for the twelve approved categories and an overall 0-100 score. Store score-version metadata and evidence references.
- [ ] **Step 6: Implement the analysis worker stage** so malformed AI output enters a retryable failure state rather than persisting partial trusted results.
- [ ] **Step 7: Run tests twice against fixed fixtures** to ensure deterministic normalization independent of model prose ordering.
- [ ] **Step 8: Commit** with `feat(audit): add structured business analysis`.

### Task 8: Shared Business X-Ray Result and Mobile Visualization

**Files:**
- Extend: shared audit result contracts.
- Modify: existing dashboard audit result surface.
- Create: mobile Business X-Ray components/screens.
- Test: result mapping and UI tests.

**Interfaces:**
- Produces: one `BusinessXRayResult` consumed by both dashboard and mobile.

- [ ] **Step 1: Write failing contract tests** proving one serialized result includes overall score, twelve categories, critical issues, revenue leaks, top five opportunities, current/future state, solution mapping, effort/priority, and 30/60/90 roadmap.
- [ ] **Step 2: Run tests** and verify FAIL.
- [ ] **Step 3: Implement the shared result mapper** from persisted findings/scores/opportunities; do not recalculate scores in UI code.
- [ ] **Step 4: Update dashboard audit rendering** to consume this mapper/contract while preserving existing navigation and styling conventions.
- [ ] **Step 5: Implement mobile Business X-Ray** with WISE² dark/chrome/neon-green design tokens, accessible score visualizations, evidence drill-down, and responsive portrait layout.
- [ ] **Step 6: Run shared, dashboard, and mobile tests/typechecks**; expected result: PASS with the same fixture producing semantically identical results on both clients.
- [ ] **Step 7: Commit** with `feat(audit): add shared business xray`.

### Task 9: WISE² Package Draft Engine

**Files:**
- Create: package recommendation module near the audit domain.
- Extend: audit API with package draft/read/update/approve routes.
- Create: mobile Package Builder screen.
- Test: package rules/API/UI tests.

**Interfaces:**
- Produces: editable `AuditPackageDraft` with `STARTER | GROWTH | AUTOMATION | CUSTOM`, items, rationale, phase, dependencies, asset requests, price placeholders/approved price-book references, recurring services, impact, exclusions, assumptions, and approval state.

- [ ] **Step 1: Write failing recommendation tests** mapping fixed audit fixtures to service recommendations while proving recommendations remain editable and are not automatically approved.
- [ ] **Step 2: Run tests** and verify FAIL.
- [ ] **Step 3: Implement the package engine** by resolving services from the existing WISE² service catalog where available; never duplicate price-book values into model prompts as authoritative pricing.
- [ ] **Step 4: Implement draft/update/approve API operations** with optimistic concurrency/version checks so two editors cannot silently overwrite each other.
- [ ] **Step 5: Implement mobile Package Builder** supporting add/remove/reorder, must-have/optional, phases, and review approval.
- [ ] **Step 6: Run tests/typechecks**; expected result: PASS and no package becomes approved merely because AI generated it.
- [ ] **Step 7: Commit** with `feat(audit): add package draft builder`.

### Task 10: Discord Audit Command Center

**Files:**
- Modify: `services/bot/index.js` only for registration/wiring.
- Create: focused audit Discord module(s) under `services/bot/audits/`.
- Test: Discord rendering/action tests using mocked REST/interactions.

**Interfaces:**
- Consumes: authoritative audit/package APIs.
- Produces: Discord audit summary and authenticated actions for Review Audit, Build Package, Generate Proposal, Assign Owner, Request Assets, Start Onboarding, Create Follow-Up.

- [ ] **Step 1: Write failing renderer tests** for client, consultant, state, score, findings, opportunities, package, dashboard deep link, proposal state, and owner.
- [ ] **Step 2: Write failing interaction tests** proving Discord actions call backend commands and cannot mutate audit state locally.
- [ ] **Step 3: Run bot tests** and verify FAIL.
- [ ] **Step 4: Implement focused audit message renderer/action router**; keep Discord credentials and authorization server-side and reuse the bot's existing REST setup.
- [ ] **Step 5: Add idempotent create/update behavior** so processing state changes update the intended audit thread/message instead of producing uncontrolled duplicates.
- [ ] **Step 6: Run tests**; expected result: PASS.
- [ ] **Step 7: Commit** with `feat(discord): add business audit workflow`.

### Task 11: Approval-Gated Automation Plan

**Files:**
- Create: audit automation policy/planner in `services/automation/src/audits/` or equivalent active automation service.
- Extend: API endpoints for plan retrieval and action approval.
- Create: mobile Automation Review screen.
- Test: policy, API, and UI tests.

**Interfaces:**
- Produces: `AuditAutomationPlan` containing actions classified `SAFE_INTERNAL` or `REQUIRES_APPROVAL`, immutable audit/package references, status, approver, and execution audit trail.

- [ ] **Step 1: Write failing policy tests** proving summary persistence, scoring, internal task suggestions, consultant notification, internal Discord status, draft package, and draft checklist can be safe-internal while proposals, billing, paid provisioning, DNS/production changes, outbound AI communications, external account creation, and ad launches require approval.
- [ ] **Step 2: Run tests** and verify FAIL.
- [ ] **Step 3: Implement the policy as an explicit allowlist**, defaulting unknown action types to `REQUIRES_APPROVAL`.
- [ ] **Step 4: Implement plan/read/approve endpoints** with authenticated approver identity, timestamp, immutable source IDs, and append-only action events.
- [ ] **Step 5: Implement mobile Automation Review** clearly separating prepared actions from approved/executed actions.
- [ ] **Step 6: Run tests** including an unknown-action regression test; expected result: PASS and unknown actions cannot auto-run.
- [ ] **Step 7: Commit** with `feat(audit): add automation approval gate`.

### Task 12: End-to-End Golden Path, Privacy, and Release Gate

**Files:**
- Create: end-to-end audit fixture/tests in the repo's established E2E location.
- Modify: relevant environment example/deployment docs for new non-secret configuration names.
- Modify: product docs only where needed to document retention/deletion and operator behavior.

**Interfaces:**
- Validates all prior tasks as one production slice.

- [ ] **Step 1: Create a deterministic golden transcript fixture** representing a small-business consultation with several clear gaps and opportunities but no real personal data.
- [ ] **Step 2: Write the golden-path E2E test**: create client -> consent -> media confirmation -> transcript -> analysis -> Business X-Ray -> package draft -> Discord summary -> automation plan -> explicit approval.
- [ ] **Step 3: Write failure-path tests** for offline upload recovery, transcription retry, malformed analysis, Discord outage, duplicate completion, and unauthorized automation approval.
- [ ] **Step 4: Run E2E tests** and verify any failures before release are fixed at their owning boundary rather than bypassed in the E2E test.
- [ ] **Step 5: Run repository lint/typecheck/test commands** for every touched workspace and Prisma validation/migration checks.
- [ ] **Step 6: Perform physical-device smoke tests on one supported iPhone and one supported Android device**: permissions, consent, 10+ minute recording, pause/resume, airplane-mode interruption, restored upload, processing, X-Ray, package edit, Discord update.
- [ ] **Step 7: Verify privacy controls**: protected media access, deletion/retention workflow, no secrets in mobile bundle, no full transcript in ordinary logs, authorization checks on audit/media/package/automation routes.
- [ ] **Step 8: Record observability evidence** for correlation ID, stage latency, provider identifier, failure state, and retry state across one golden run.
- [ ] **Step 9: Commit** with `test(audit): verify mobile audit golden path`.

---

## Plan Self-Review

- **Spec coverage:** All MVP requirements are mapped: cross-platform login/client flow (Task 4), consent/audio/offline recovery (Tasks 4-5), transcription (Task 6), structured analysis/scoring (Task 7), shared Business X-Ray (Task 8), package draft (Task 9), Discord (Task 10), approval-gated automation (Task 11), security/privacy/observability/E2E (Task 12).
- **Scope:** Work is intentionally sliced by independently testable subsystem while retaining one shared spec and contracts.
- **No parallel datastore:** Tasks 1-2 explicitly extend existing Consultant Audit OS models.
- **Provider independence:** Storage, transcription, and analysis are adapter-based.
- **Human approval:** Package approval and consequential automation approval are independently enforced.
- **Recovery:** State-machine/idempotency rules prevent retries from repeating completed transcription or downstream work.
- **Release gate:** No production-ready claim is allowed until Task 12 passes on both a physical iOS and Android device.