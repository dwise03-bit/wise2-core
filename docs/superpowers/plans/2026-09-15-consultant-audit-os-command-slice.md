# WISE² Consultant Audit OS Command Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder consulting admin surface with a production-oriented Consultant Audit OS command slice that connects lead intake, guided audit, Business X-Ray, revenue leaks, WISE² solution mapping, package drafting, and close tracking without creating a second CRM.

**Architecture:** Extend the existing `wise2-core` consulting stack. Keep Prisma/WISE² Core as the source of truth, expose audit-specific backend contracts under the existing consulting API, and render the consultant command experience in the existing admin dashboard. Use pure, versioned audit scoring/mapping helpers so the same structured result can later power mobile and web clients.

**Tech Stack:** TypeScript, React/Next.js, Express, Prisma/PostgreSQL, Redis events, pnpm/Turbo.

**Spec:** `docs/superpowers/specs/2026-09-01-wise2-business-audit-mobile-intelligence-design.md`

## Global Constraints

- Do not create a second CRM/client datastore.
- WISE² Core remains the authoritative audit state and intelligence layer.
- Discord remains an operations surface, not the database.
- Consequential external or billable actions remain approval-gated.
- Local-first AI routing remains the preferred default for routine extraction/scoring.
- Reuse existing `ConsultingLead`, booking/project, post-call summary, Redis worker, and Prisma infrastructure before adding new entities.
- Preserve current lead intake and checkout behavior.

---

### Task 1: Audit domain helpers and contracts

**Files:**
- Create: `services/api/src/services/consulting-audit.ts`
- Create: `services/api/src/services/__tests__/consulting-audit.test.ts`

**Interfaces:**
- Produces: `AuditCategoryKey`, `AuditAnswerMap`, `AuditCategoryScore`, `RevenueLeak`, `SolutionRecommendation`, `AuditXRayResult`, `scoreAudit()`, `detectRevenueLeaks()`, `mapWise2Solutions()`, `buildAuditXRay()`.
- Consumes: no database access; pure functions only.

- [ ] Write failing unit tests for category scoring, score clamping, revenue leak prioritization, and WISE² solution mapping.
- [ ] Run the focused test file and confirm failures are caused by missing implementation.
- [ ] Implement the minimal pure helper module.
- [ ] Re-run the focused test file until green.
- [ ] Run the API package test/type-check command.
- [ ] Commit the helper and tests.

### Task 2: Consultant command summary API

**Files:**
- Modify: `services/api/src/services/consulting.service.ts`
- Modify: `services/api/src/routes/consulting.ts`
- Create: `services/api/src/services/__tests__/consulting-command-summary.test.ts`

**Interfaces:**
- Produces: `consultingService.getCommandSummary()` and authenticated `GET /api/v1/consulting/command-summary`.
- Returns: lead totals by qualification stage, recent lead activity, booked/completed project counts, and revenue-safe summary fields derived from existing records.

- [ ] Write a failing service test for the normalized command-summary result shape.
- [ ] Verify the focused test fails for the missing method.
- [ ] Implement `getCommandSummary()` using existing Prisma models only.
- [ ] Add an authenticated founder/admin route.
- [ ] Re-run focused and package tests.
- [ ] Commit the API summary endpoint.

### Task 3: Audit X-Ray preview API

**Files:**
- Modify: `services/api/src/routes/consulting.ts`
- Modify: `services/api/src/services/consulting.service.ts`
- Create: `services/api/src/services/__tests__/consulting-audit-preview.test.ts`

**Interfaces:**
- Produces: `POST /api/v1/consulting/leads/:leadId/audit-preview`.
- Consumes: current lead data plus an explicit `answers` object from the guided audit UI.
- Returns: deterministic `AuditXRayResult`; does not send proposals, charge clients, or provision services.

- [ ] Write a failing test proving the preview is linked to the requested lead and produces an explainable X-Ray result.
- [ ] Verify RED.
- [ ] Implement service method and founder/admin route using Task 1 helpers.
- [ ] Verify GREEN and package tests.
- [ ] Commit the preview API.

### Task 4: Consultant Command Dashboard UI

**Files:**
- Modify: `services/dashboard/apps/admin/app/consulting/page.tsx`
- Create: `services/dashboard/apps/admin/app/consulting/components/MetricCard.tsx`
- Create: `services/dashboard/apps/admin/app/consulting/components/PipelinePanel.tsx`
- Create: `services/dashboard/apps/admin/app/consulting/components/ConsultantFlow.tsx`

**Interfaces:**
- Consumes: `GET /api/v1/consulting/command-summary`.
- Produces: the Lead → Audit → X-Ray → Diagnose → Recommend → Package → Present → Close → Deploy → Verify command surface.

- [ ] Add component-level tests if the dashboard package already has a test runner; otherwise keep display helpers pure and cover them in a colocated unit test where supported.
- [ ] Replace hard-coded placeholder metrics with API-backed loading/error/empty states.
- [ ] Add premium WISE² command styling matching the approved visual direction.
- [ ] Add quick actions for Guided Audit, Business X-Ray, Revenue Leaks, Solution Mapper, Packages, Proposals, Follow-Ups, and Projects.
- [ ] Run dashboard type-check/build.
- [ ] Commit the command dashboard.

### Task 5: Guided Audit + X-Ray workspace

**Files:**
- Create: `services/dashboard/apps/admin/app/consulting/audits/new/page.tsx`
- Create: `services/dashboard/apps/admin/app/consulting/audits/new/audit-schema.ts`
- Create: `services/dashboard/apps/admin/app/consulting/audits/new/AuditWorkspace.tsx`

**Interfaces:**
- Consumes: existing lead IDs and `POST /api/v1/consulting/leads/:leadId/audit-preview`.
- Produces: structured answers and a client-ready X-Ray preview with score, category breakdown, revenue leaks, and mapped WISE² solutions.

- [ ] Write failing tests for audit question normalization/scoring input shape where supported.
- [ ] Build a structured guided audit covering Website/Digital Presence, CRM/Customer Data, AI Phone/Communications, Lead Generation/Sales, Reputation, Automation, Hosting/Cloud, Payments, Operations, Mobile/Field, Brand/Creative, and AI Readiness.
- [ ] Add lead selection/input and explicit save/preview action.
- [ ] Render overall score, category scores, revenue leaks, and recommended WISE² solutions from the server response.
- [ ] Do not send proposals or trigger external actions from this page.
- [ ] Run type-check/build.
- [ ] Commit the audit workspace.

### Task 6: Package and close handoff shell

**Files:**
- Create: `services/dashboard/apps/admin/app/consulting/packages/page.tsx`
- Create: `services/dashboard/apps/admin/app/consulting/proposals/page.tsx`

**Interfaces:**
- Consumes: existing consulting services and audit recommendations.
- Produces: editable draft-only package/proposal work surfaces. External send/charge actions remain disabled until approval workflow is implemented.

- [ ] Render Starter, Growth, Automation, and Custom package lanes.
- [ ] Add must-have/optional solution grouping and rationale display.
- [ ] Add proposal state fields: decision maker, objections, next action, follow-up date, owner.
- [ ] Clearly label outputs as drafts and keep send/charge controls approval-gated.
- [ ] Run type-check/build.
- [ ] Commit package and close surfaces.

### Task 7: Verification and handoff

**Files:**
- Modify: `docs/superpowers/plans/2026-09-15-consultant-audit-os-command-slice.md` only if verification findings require documentation updates.

**Interfaces:**
- Produces: verified branch ready for review/PR.

- [ ] Run focused API tests.
- [ ] Run API type-check/build.
- [ ] Run dashboard type-check/build.
- [ ] Run root lint/type-check/build scopes that cover changed packages.
- [ ] Confirm no Stripe charge, outbound communication, DNS, client provisioning, or other consequential action can execute from the new audit preview path.
- [ ] Review git diff for unrelated changes and secrets.
- [ ] Open a pull request to `main` only after checks pass; do not deploy automatically.
