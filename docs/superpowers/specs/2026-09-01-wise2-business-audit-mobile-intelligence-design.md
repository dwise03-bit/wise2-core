# WISE² Business Audit — Mobile Intelligence System Design

**Date:** 2026-09-01
**Status:** Approved architecture / implementation planning gate
**Repository:** `dwise03-bit/wise2-core`
**Product:** WISE² Business Audit

## 1. Purpose

WISE² Business Audit turns a live consultant/client conversation into a structured business assessment, visual opportunity map, recommended WISE² client package, and automation-ready implementation plan.

The product must run on iOS and Android, integrate with the existing WISE² Consultant Audit OS in `wise2-core`, and use Discord as an operational collaboration surface. The mobile app is a capture-and-review client; WISE² Core remains the system of record and intelligence layer.

## 2. Product Outcome

One consultant session should produce a durable audit chain:

`Client -> Audit Session -> Consent -> Recording -> Transcript -> Findings -> Scores -> Opportunity Map -> Recommended Services -> Package Draft -> Proposal Draft -> Automation Plan -> Discord Workflow`

The user must be able to begin with a conversation and finish with a polished, reviewable client package without manually re-entering the same information in multiple systems.

## 3. Architectural Decision

Use one cross-platform React Native application, preferably Expo-managed where practical with native modules for production-grade audio capture where Expo abstractions are insufficient.

The mobile application must not own business scoring, transcription policy, pricing logic, Discord orchestration, or automation logic. These live behind WISE² Core APIs and workers so that mobile, web dashboard, Discord, and future clients share one authoritative audit state.

## 4. Existing WISE² Integration Boundary

This product extends the existing WISE² Consultant Audit OS and its database models, design system, dashboard audit interface, and post-call processing patterns. It must not create a parallel client/audit datastore.

Existing concepts should be reused where possible:

- Consulting client records
- Audit records and audit dashboard
- Existing WISE² design system
- Post-call summary persistence
- Consultant notification workflow
- Existing PostgreSQL/Prisma persistence
- Existing Redis/worker infrastructure

New fields or tables should be introduced only where required for mobile capture, media lifecycle, transcript structure, analysis outputs, package drafts, consent evidence, and automation state.

## 5. Mobile Application

### 5.1 Core Screens

1. **Home / Audit Queue** — recent audits, drafts, processing sessions, follow-ups, and assigned consultant work.
2. **Client Select/Create** — find an existing consulting client or create one without duplicate records.
3. **Pre-Audit Intake** — business name, industry, contact, website, location, current tools, known goals, and optional consultant notes.
4. **Consent Gate** — explicit recording consent status, method, timestamp, optional note, and a manual-notes-only fallback.
5. **Live Session** — audio recording, elapsed time, pause/resume, markers, quick tags, photos, typed notes, and connection/upload status.
6. **Processing** — upload state, transcription state, analysis state, recoverable errors, and retry controls.
7. **Business X-Ray** — overall score, category scores, major gaps, revenue leaks, opportunities, priorities, and supporting transcript evidence.
8. **Package Builder** — recommended WISE² services, editable inclusions, package tier, implementation phases, pricing placeholders, and exclusions.
9. **Automation Review** — proposed downstream actions with explicit human approval before external or billable actions.
10. **Share / Follow-Up** — Discord status, proposal readiness, CRM follow-up, client-ready export links, and ownership.

### 5.2 Offline and Interrupted Sessions

The app must tolerate weak field connectivity. Audio, notes, markers, photos, and session state must be locally durable until the server confirms receipt. Uploads should be chunked or resumable where practical. The app must never report an audit as fully synced until server acknowledgement exists.

## 6. Recording and Consent

Recording consent is a first-class audit artifact.

Each recorded session stores:

- consent status
- consent method
- consent timestamp
- consultant identity
- client/contact identity when available
- jurisdiction/location metadata when voluntarily provided or already part of the client record
- optional consent note
- whether recording was disabled and manual notes used instead

The app must surface a clear recording indicator while capture is active. It must not attempt covert recording. The product should support configurable retention rules and deletion workflows for audio and transcripts.

## 7. Audio and Transcript Pipeline

### 7.1 Capture

Mobile captures high-quality mono speech audio with predictable sample format, local buffering, crash-safe session metadata, and resumable upload.

### 7.2 Server Pipeline

1. Create media asset record.
2. Validate upload integrity.
3. Persist original recording in configured object storage.
4. Queue transcription job.
5. Produce timestamped transcript with speaker separation when available.
6. Normalize transcript into utterances.
7. Run business-audit extraction.
8. Run scoring and opportunity analysis.
9. Persist outputs with model/version provenance.
10. Notify mobile, dashboard, and Discord of state changes.

The transcription provider must be behind an interface so WISE² can swap cloud or local inference without changing mobile clients.

## 8. Audit Intelligence Engine

The analysis layer transforms conversation evidence into structured fields rather than only a prose summary.

### 8.1 Extracted Domains

- Business profile and customer type
- Stated goals
- Problems and operational bottlenecks
- Current software/tools/vendors
- Lead sources and sales process
- Customer follow-up process
- Phone and messaging workflow
- Website and online presence
- Reviews and reputation workflow
- Branding/content needs
- CRM maturity
- Billing/payment workflow
- Hosting/cloud needs
- Manual repetitive work
- AI readiness
- Mobile/field workflow needs
- Budget/timing signals
- Decision makers and stakeholders
- Risks, objections, and unresolved questions
- Promises and follow-up commitments made during the meeting

Every high-impact finding should reference one or more transcript evidence ranges when possible.

### 8.2 Category Scores

Initial scoring categories:

- Website / Digital Presence
- Brand / Creative
- CRM / Customer Data
- AI Phone / Communications
- Lead Generation / Sales
- Reputation / Reviews
- Automation / Workflow
- Hosting / Cloud
- Payments / Billing
- Operations
- Mobile / Field Enablement
- AI Readiness

Scores are advisory, versioned, and explainable. The system should show why a score was assigned and which evidence influenced it.

## 9. WISE² Business X-Ray Visual

The primary result view is a client-facing-quality visual, not a text dump.

It contains:

- Overall Business Health score
- Category score rings or bars
- Critical issues
- Revenue-leak / lost-opportunity callouts
- Top five opportunities
- Current-state versus future-state map
- WISE² solution mapping
- Priority and estimated effort labels
- 30/60/90-day roadmap
- Recommended package preview

The mobile visual and web dashboard visual must be rendered from the same structured audit result object.

## 10. Package Builder

The package engine maps findings to WISE² offerings using rules and AI recommendations. It produces a draft, never an automatically binding offer.

Package output includes:

- package name/tier
- recommended WISE² services
- rationale tied to findings
- must-have versus optional components
- implementation phases
- deliverables
- dependencies
- client asset requests
- pricing placeholders or approved price-book values
- recurring services
- expected business impact
- exclusions and assumptions

Recommended initial tiers:

- Starter
- Growth
- Automation
- Custom

A consultant can edit, remove, reorder, or add services before approval.

## 11. Discord Integration

Discord is an operations surface, not the database.

For each qualifying audit, WISE² Core can create or update a structured Discord thread/message containing:

- client name
- consultant
- processing state
- overall audit score
- top findings
- top opportunities
- recommended package
- audit/dashboard deep link
- proposal state
- follow-up owner

Supported Discord actions should map to authenticated backend commands such as:

- Review Audit
- Build Package
- Generate Proposal
- Assign Owner
- Request Assets
- Start Onboarding
- Create Follow-Up

Discord actions must call WISE² Core; they must not duplicate package or workflow logic inside the bot.

## 12. Automation Layer

Audit completion prepares automation but does not silently execute consequential actions.

### 12.1 Safe Automatic Actions

Examples that may run automatically after analysis:

- save transcript and summary
- compute scores
- create internal task suggestions
- notify assigned consultant
- post internal Discord audit status
- prepare draft package
- prepare draft onboarding checklist

### 12.2 Approval-Gated Actions

Require explicit authorized approval before actions such as:

- sending a client proposal
- creating billable subscriptions
- charging or invoicing a client
- provisioning paid third-party services
- changing DNS or production websites
- enabling outbound AI calling/messaging
- creating external client accounts
- launching ad campaigns

Each downstream automation receives immutable audit/package IDs and records its own status and audit trail.

## 13. Data Model Extensions

Prefer extending existing audit/client models. Logical entities required by this design include:

- `AuditSession`
- `AuditConsent`
- `AuditMediaAsset`
- `AuditTranscript`
- `AuditUtterance`
- `AuditFinding`
- `AuditScore`
- `AuditOpportunity`
- `AuditPackageDraft`
- `AuditPackageItem`
- `AuditAutomationPlan`
- `AuditAutomationAction`
- `DiscordAuditLink`

Exact Prisma names may differ to fit the current schema conventions. Avoid duplicating existing entities when equivalent models already exist.

## 14. API Surface

Representative backend contracts:

- `POST /api/audits/sessions`
- `GET /api/audits/sessions/:id`
- `POST /api/audits/sessions/:id/consent`
- `POST /api/audits/sessions/:id/media`
- `POST /api/audits/sessions/:id/complete`
- `GET /api/audits/sessions/:id/processing`
- `GET /api/audits/sessions/:id/result`
- `POST /api/audits/sessions/:id/package-draft`
- `PATCH /api/audits/packages/:id`
- `POST /api/audits/packages/:id/approve`
- `GET /api/audits/sessions/:id/automation-plan`
- `POST /api/audits/automation-actions/:id/approve`

Final routes should follow existing `wise2-core` route conventions after implementation planning inspects the current API layout.

## 15. Processing State Machine

An audit session should expose deterministic states such as:

`DRAFT -> RECORDING -> UPLOADING -> TRANSCRIBING -> ANALYZING -> READY_FOR_REVIEW -> PACKAGE_DRAFTED -> APPROVED -> AUTOMATION_READY`

Failure states must be explicit and retryable without losing prior completed work. A failed package analysis must not force retranscription of already completed audio.

## 16. Security and Privacy

- authenticated consultant access
- role-based access to audits and packages
- encrypted transport
- protected object storage
- least-privilege media access
- signed/expiring media URLs where used
- retention and deletion controls
- append-only activity/audit logging for key actions
- no secrets embedded in mobile binaries
- Discord interactions authenticated and authorization-checked server-side
- model outputs treated as untrusted recommendations until validated by application rules

## 17. Observability

Track per-stage metrics and structured logs for:

- recording/upload failures
- transcription latency and failures
- analysis latency and failures
- model/provider used
- token/inference cost where applicable
- package-generation success
- Discord delivery failures
- automation approval/execution states

Use correlation IDs from the audit session through every worker job.

## 18. Testing Strategy

### Mobile

- recording lifecycle tests
- pause/resume tests
- interrupted upload recovery
- offline persistence
- permission denial flows
- consent gate enforcement
- process restart/crash recovery
- iOS and Android device validation

### Backend

- session state-machine tests
- media validation
- transcription adapter contract tests
- deterministic schema validation for AI outputs
- scoring tests
- package recommendation rule tests
- authorization tests
- Discord command verification
- automation approval-gate tests

### End-to-End

The required golden-path test is:

`create client -> record consent -> capture conversation -> upload -> transcribe -> analyze -> render X-Ray -> draft package -> post Discord summary -> approve automation plan`

Also test failures at every asynchronous boundary and confirm recovery resumes from the last successful stage.

## 19. MVP Scope

The first production slice should include:

- cross-platform consultant login
- client create/select
- consent capture
- audio recording
- resumable upload
- transcription
- structured audit analysis
- Business X-Ray result
- package draft generation
- Discord audit summary
- human approval gate
- audit dashboard synchronization

Defer advanced proposal design, automatic website generation, billing provisioning, ad-platform provisioning, outbound AI campaigns, and fully autonomous onboarding until the core audit loop is proven reliable.

## 20. Success Criteria

The MVP is successful when a consultant can conduct a real client meeting from either iOS or Android and, without retyping the conversation afterward, receive a reviewable audit result and WISE² package draft synchronized to the WISE² dashboard and Discord.

Additional acceptance criteria:

- no lost recording during ordinary network interruptions
- transcript and findings remain linked to the correct client/session
- each critical finding is explainable from transcript evidence when available
- Discord reflects server state rather than maintaining independent state
- package creation is editable and approval-gated
- consequential automations cannot run without the required approval
- the same audit result object drives both mobile and web visualizations

## 21. Implementation Sequencing

Implementation should be decomposed into independently testable slices:

1. Existing Audit OS model/API inspection and schema extensions
2. Audit session + consent API/state machine
3. React Native shell + authentication/client selection
4. Reliable mobile audio capture and upload
5. Transcription adapter and worker
6. Structured analysis/scoring engine
7. Business X-Ray UI
8. Package recommendation/draft engine
9. Discord orchestration
10. Automation-plan approval framework
11. End-to-end hardening, privacy controls, and device testing

## 22. Non-Goals for MVP

- covert/background surveillance recording
- fully autonomous client contracting
- automatic charging without approval
- replacing the existing WISE² Consultant Audit OS
- creating a second CRM/client database
- embedding Discord as the source of truth
- hard-coding one transcription or LLM provider

## 23. Final Design Decision

Build WISE² Business Audit as a cross-platform mobile capture and visualization client backed by the existing WISE² Consultant Audit OS in `wise2-core`. WISE² Core owns transcription orchestration, structured business analysis, scoring, package generation, Discord integration, automation planning, authorization, and persistence. Human approval remains mandatory before consequential external or billable automation.