# WISE² Revenue Command Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the existing Telnyx/phone, CRM/Second Brain, and Discord systems into a production-testable revenue workflow that qualifies, routes, follows up, books, and closes approved offers.

**Architecture:** Preserve the existing phone gateway and WISE² Discord bot. Introduce a normalized revenue event/service boundary between communications, CRM, and Discord so phone events are idempotently persisted before Discord side effects occur. Commercial actions are controlled by explicit offer rules and role/approval checks.

**Tech Stack:** Node.js/TypeScript and existing JavaScript bot, Asterisk/ARI + Telnyx transport, PostgreSQL/Prisma, Redis, Discord.js, existing Second Brain API, existing Docker/Compose.

**Spec:** `docs/superpowers/specs/2026-08-31-revenue-command-center-design.md`

## Global Constraints

- Reuse the existing `services/bot` Discord bot rather than creating competing bot identities.
- PostgreSQL/CRM is the source of truth; Discord is a control plane.
- Never invent prices, discounts, guarantees, contracts, capabilities, or delivery dates.
- Consent and opt-out state overrides automated outreach.
- Paid ads, mass outreach, custom contracts, out-of-policy discounts, and unusual/high-value deals require human approval.
- Every external event handler must be idempotent and correlation-ID aware.
- Never expose Telnyx, Discord, database, or AI secrets in logs or Discord.

---

### Task 1: Audit and Normalize Revenue Interfaces

**Files:**
- Inspect: `apps/phone-gateway/src/**`
- Inspect: `services/bot/**`
- Inspect: `packages/db/prisma/schema.prisma`
- Inspect: existing Second Brain and Telnyx integration files found by repository search
- Create: `packages/api/src/revenue/contracts.ts` if no equivalent shared contract exists
- Test: nearest existing API/unit-test location discovered during audit

**Interfaces:**
- Produces: normalized `RevenueEvent`, `LeadStage`, `LeadScore`, `CommercialAction`, and correlation identifiers used by later tasks.

- [ ] Search the repository for existing lead, opportunity, offer, payment, appointment, Telnyx, Discord, consent, opt-out, and attribution types before creating new ones.
- [ ] Write failing contract/validation tests for duplicate external event IDs and required correlation IDs.
- [ ] Run the targeted test and confirm failure for the missing normalized contract behavior.
- [ ] Implement the smallest shared contract/validator layer, reusing existing types where possible.
- [ ] Run targeted tests and confirm pass.
- [ ] Commit with `feat(revenue): normalize revenue event contracts`.

### Task 2: Persist Revenue State Without Duplicating Existing CRM Models

**Files:**
- Modify only as required: `packages/db/prisma/schema.prisma`
- Create migration using the repository's existing Prisma migration convention.
- Test: existing database/schema test location.

**Interfaces:**
- Consumes: Task 1 normalized contracts.
- Produces: persistent lead/deal/offer/assignment/follow-up/attribution state only for concepts not already represented.

- [ ] Map existing Prisma models to Lead, Opportunity/Deal, Offer rules, Assignment, FollowUp, and RevenueEvent requirements.
- [ ] Write a failing schema/service test proving a lead can retain stage, score, owner, source, next action, and correlation ID without duplicate external events.
- [ ] Run the targeted test and confirm failure.
- [ ] Add only missing fields/models/indexes/unique constraints.
- [ ] Generate/apply the migration in the project test environment.
- [ ] Run targeted database tests and confirm pass.
- [ ] Commit with `feat(revenue): persist lead and attribution state`.

### Task 3: Phone/Telnyx to CRM Revenue Bridge

**Files:**
- Modify: appropriate handlers under `apps/phone-gateway/src/` discovered during Task 1.
- Create focused revenue bridge/service files beside the existing phone orchestration code if no equivalent exists.
- Test: `apps/phone-gateway` test location.

**Interfaces:**
- Consumes: normalized external phone/SMS events.
- Produces: idempotent CRM updates plus internal revenue events; no direct Discord-as-database behavior.

- [ ] Write failing tests for inbound answered, missed, completed, failed, voicemail/callback, SMS received, and duplicate-event handling for the events actually exposed by the current transport.
- [ ] Run tests and confirm failure.
- [ ] Implement contact lookup/create, call correlation, lead update, and next-action creation.
- [ ] Ensure opt-out/consent state is loaded before any automated outreach is scheduled.
- [ ] Run targeted tests and confirm pass.
- [ ] Commit with `feat(phone): bridge communications into revenue CRM`.

### Task 4: Lead Qualification and Bounded Closer Rules

**Files:**
- Modify/create focused sales services in the existing phone/LLM service boundary.
- Modify existing prompt/tool definitions rather than adding a second LLM orchestration stack.
- Test beside the sales/LLM service.

**Interfaces:**
- Produces: COLD/WARM/HOT/CLOSING/WON/LOST stage decisions and `CommercialAction` decisions of allow, require-approval, or deny.

- [ ] Write failing tests for hot-lead scoring, AI-closable standard offer, below-minimum discount denial, custom-scope escalation, and high-value escalation.
- [ ] Run tests and confirm failure.
- [ ] Implement deterministic commercial guardrail checks outside free-form LLM text generation.
- [ ] Feed approved rule results into the existing LLM/tool-calling layer.
- [ ] Run targeted tests and confirm pass.
- [ ] Commit with `feat(sales): add qualification and bounded closing rules`.

### Task 5: CRM to Discord Revenue Event Publisher

**Files:**
- Extend existing Discord integration modules rather than duplicating them: `services/bot/**`, `src/services/discord-live-service.ts`, or the established shared Discord module chosen after audit.
- Test beside the chosen Discord service.

**Interfaces:**
- Consumes: persisted revenue events.
- Produces: actionable Discord cards and meaningful call-state updates.

- [ ] Write failing tests for hot lead, closer-needed, missed call, appointment, won deal, and revenue events.
- [ ] Run tests and confirm failure.
- [ ] Implement channel mapping with environment-configured IDs and fallback to existing useful channels where configured.
- [ ] Implement lead-card rendering with safe metadata and CRM identifiers.
- [ ] Do not stream every transcript token; publish state changes and summaries only.
- [ ] Run targeted tests and confirm pass.
- [ ] Commit with `feat(discord): publish actionable revenue events`.

### Task 6: Real Discord Lead Actions and Permissions

**Files:**
- Modify focused command/button handlers under `services/bot/`.
- Reuse existing bot registration and permission patterns.
- Test bot interaction handlers.

**Interfaces:**
- Produces: Claim Lead, Call, Text, Send Offer, Book, Follow Up, Escalate, Mark Won, Mark Lost, and Open CRM actions only when backend support exists.

- [ ] Write failing tests for authorized claim, duplicate claim rejection, unauthorized discount/payment action, and idempotent button retry.
- [ ] Run tests and confirm failure.
- [ ] Implement role-aware action authorization and persistent lead claiming.
- [ ] Wire only buttons that execute real backend operations; omit unsupported decorative actions.
- [ ] Register revenue slash commands incrementally, beginning with `/lead`, `/hot`, `/pipeline`, `/claim`, `/revenue`, and `/today`.
- [ ] Run targeted tests and confirm pass.
- [ ] Commit with `feat(discord): add revenue commands and lead controls`.

### Task 7: Follow-Up, Missed-Call Recovery, and Booking

**Files:**
- Extend existing scheduled-task/callback/SMS/appointment services.
- Reuse existing `services/bot/scheduled-tasks` behavior where appropriate without making Discord the scheduler source of truth.
- Test communication scheduling and appointment collision behavior.

**Interfaces:**
- Consumes: lead next action, consent/opt-out, appointment availability.
- Produces: persisted callback/follow-up tasks and confirmed appointments.

- [ ] Write failing tests for missed-call callback creation, opted-out suppression, successful-contact cancellation, and appointment double-book prevention.
- [ ] Run tests and confirm failure.
- [ ] Implement configurable immediate follow-up/callback policies using existing SMS/callback models and provider interfaces.
- [ ] Implement appointment creation through the existing scheduling boundary.
- [ ] Publish appointment/follow-up state through the Task 5 event publisher.
- [ ] Run targeted tests and confirm pass.
- [ ] Commit with `feat(revenue): automate recovery followups and booking`.

### Task 8: Revenue Attribution and Daily Money Brief

**Files:**
- Extend existing reporting/Second Brain API service and Discord scheduled-task integration.
- Test aggregation logic.

**Interfaces:**
- Produces: revenue today/week/month, pipeline, won/lost counts, average deal size, conversion, appointments, source attribution, callbacks/follow-ups due.

- [ ] Write failing aggregation tests using deterministic fixture data.
- [ ] Run tests and confirm failure.
- [ ] Implement source/campaign/phone/agent/owner attribution queries.
- [ ] Implement `/revenue` and `/today` output from persisted CRM data.
- [ ] Add a scheduled daily money brief using the existing scheduling framework.
- [ ] Run targeted tests and confirm pass.
- [ ] Commit with `feat(revenue): add attribution and daily money brief`.

### Task 9: Marketing/Reactivation Integration

**Files:**
- Extend existing ad/campaign handlers in `services/bot/index.js` or split into a focused module if that file is already too large.
- Test approval enforcement and audience suppression.

**Interfaces:**
- Consumes: eligible CRM audiences and existing campaign presets.
- Produces: approval-gated campaign proposals and attribution metadata.

- [ ] Write failing tests proving opted-out contacts are excluded and paid/mass campaign execution requires approval.
- [ ] Run tests and confirm failure.
- [ ] Connect existing campaign/ad presets to CRM lead-source and reactivation audiences.
- [ ] Preserve existing approve/cancel behavior and persist campaign attribution.
- [ ] Run targeted tests and confirm pass.
- [ ] Commit with `feat(marketing): connect campaigns to revenue CRM`.

### Task 10: End-to-End Verification and Deployment

**Files:**
- Modify existing Docker/Compose/env examples and deployment docs only where required.
- Create/update E2E simulation tests following repository convention.

**Interfaces:**
- Verifies the complete production-connected boundary without treating simulations as production evidence.

- [ ] Add an E2E simulation covering contact -> lead -> qualification -> Discord event -> approved offer/escalation -> follow-up -> attribution.
- [ ] Run the simulation and fix failures.
- [ ] Run phone-gateway tests, Discord bot tests, API/database tests, and build/type checks available in the repo.
- [ ] Validate required environment variables without printing secret values.
- [ ] Deploy to the existing WISE² VPS only from an environment with authorized server access and configured Telnyx/Discord credentials.
- [ ] Make a real test call and verify CRM persistence, Discord event delivery, next action, and attribution.
- [ ] Clearly label any untested live boundary as a blocker.
- [ ] Commit with `test(revenue): verify revenue command center flow`.

## Completion Gate

Do not call the integration production-ready until a real Telnyx/phone event creates or resolves a CRM lead, qualification persists, Discord receives the actionable event, the approved offer/escalation decision is enforced, follow-up/booking state persists, and attribution can be queried from CRM. Simulations demonstrate code behavior but do not substitute for this live verification.
