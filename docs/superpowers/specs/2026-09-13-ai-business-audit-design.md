# WISE² AI Business Audit Hybrid Funnel — Design

**Date:** 2026-09-13
**Status:** Approved direction (Option C: Hybrid)
**Repository:** `dwise03-bit/wise2-core`

## Objective

Build a customer-acquisition front door for WISE² that converts paid/social/direct traffic into qualified CRM prospects through a premium AI Business Audit experience. The funnel must launch quickly as a public-facing experience while reusing the existing WISE² Core API, PostgreSQL/Prisma data model, prospect CRM, scheduling fields, and sales pipeline.

## Product Promise

Primary CTA: **GET YOUR FREE AI BUSINESS AUDIT**

Core value proposition: identify practical, measurable AI and automation opportunities inside a business, estimate potential impact, and turn the audit into a concrete WISE² implementation roadmap.

The product must not copy third-party branding, copy, assets, or proprietary flows. We use the reference funnel only as inspiration for conversion structure.

## User Journey

1. Visitor lands on `/ai-audit` from ads, direct traffic, QR code, referral, or sales outreach.
2. Hero presents a single primary CTA and clear outcome.
3. Visitor completes a short business profile: company, contact, website, industry, team size, revenue band, primary pain points, current tools, and highest-priority workflow.
4. Frontend submits the lead into the existing `/api/v1/prospects` pipeline with `leadSource=WEBSITE`, tags including `ai-audit`, and primary problem synthesized from the intake.
5. Audit scoring runs using deterministic rules first; optional AI enhancement may summarize or prioritize findings, but the funnel must remain functional if cloud AI is unavailable.
6. Visitor receives an immediate on-screen Opportunity Snapshot with category scores, top opportunities, implementation priority, and conservative impact ranges.
7. Full report is persisted and associated with the prospect.
8. Visitor is prompted to schedule a strategy call.
9. CRM shows the audit result on the prospect record and advances the prospect to `QUALIFIED` or `AUDIT_SCHEDULED` when appropriate.
10. Sales uses the report to transition into proposal and implementation.

## Architecture

### Public frontend

Add the audit experience inside `apps/website` using the existing Next.js App Router and WISE² design system.

Primary routes:
- `apps/website/app/ai-audit/page.tsx` — landing + CTA
- `apps/website/app/ai-audit/start/page.tsx` — multi-step intake
- `apps/website/app/ai-audit/results/[auditId]/page.tsx` — personalized result

Reusable feature code lives under `apps/website/components/ai-audit/` and `apps/website/lib/ai-audit/` so the public funnel remains isolated from unrelated site code.

### Backend

Reuse the existing Prospect model and API as the CRM system of record. Add a focused audit module rather than duplicating lead storage.

New API namespace:
- `POST /api/v1/ai-audits` — create audit tied to a Prospect
- `GET /api/v1/ai-audits/:id` — fetch public-safe audit result by opaque id/token
- `GET /api/v1/ai-audits/prospect/:prospectId` — internal CRM lookup
- `POST /api/v1/ai-audits/:id/schedule` — record scheduling intent and update prospect stage when appropriate

### Data model

Add `AiBusinessAudit` in Prisma with:
- `id`
- `prospectId`
- `industry`
- `teamSizeBand`
- `revenueBand`
- `currentTools` JSON
- `painPoints` JSON
- `workflowPriority`
- `scores` JSON
- `opportunities` JSON
- `estimatedAnnualImpactLow`
- `estimatedAnnualImpactHigh`
- `summary`
- `status` enum (`DRAFT`, `COMPLETE`, `SCHEDULED`)
- `createdAt`
- `updatedAt`

Add a relation from Prospect to audit records. No duplication of company/contact identity fields inside the audit beyond immutable presentation data when needed.

## Scoring System

Version 1 uses deterministic scoring so cost stays low and results are stable/testable.

Categories:
- Lead Capture & Follow-up
- Sales & CRM
- Customer Service / AI Phone
- Internal Operations
- Marketing / Content
- Knowledge / Local AI
- Field / Mobile Workflows

Each category receives a 0–100 score using intake answers. The scoring engine returns ranked `AuditOpportunity[]` objects with:
- category
- title
- problem
- recommended WISE² capability
- priority (`NOW`, `NEXT`, `LATER`)
- effort (`LOW`, `MEDIUM`, `HIGH`)
- impactLow
- impactHigh
- rationale

Impact ranges must be presented as estimates, not guarantees.

## WISE² Offer Mapping

The report may recommend only capabilities WISE² can actually deliver or explicitly mark as planned/not configured.

Initial mappings:
- AI Phone / call handling
- CRM / pipeline automation
- lead follow-up automation
- customer-service automation
- websites / conversion funnels
- local/private AI
- Discord / communications workflows
- operational dashboards
- field-service/mobile automation
- custom API/integration work

## Visual Design

Use the current WISE² cinematic command-center language: dark navy/black, chrome identity, electric cyan/blue system glow, neon green for positive states, restrained red/orange for blockers.

Hero should feel like an executive diagnostic system, not a generic marketing template.

Recommended sections:
- Hero + CTA
- “What WISE² finds” diagnostic categories
- Interactive ROI/opportunity preview
- How the audit works (3 steps)
- WISE² implementation capabilities
- trust/results section using only verified customer claims
- final CTA

The intake should feel like a guided command workflow with visible progress, not a long form.

## CRM Integration

Existing Prospect pipeline remains authoritative.

Creation behavior:
- new audit visitor → create Prospect with `status=NEW`
- completed qualifying audit → update to `QUALIFIED`
- scheduling confirmed/intended → update to `AUDIT_SCHEDULED`
- audit record stores the score/report
- CRM detail view gains an “AI Business Audit” panel

Do not create a second lead table.

## AI Routing / Cost Control

The scoring engine must not require paid cloud AI.

Order of operation:
1. deterministic rules compute all scores and opportunity selections;
2. local/existing WISE² AI may optionally rewrite the summary for readability;
3. cloud AI is optional and never blocks submission or report delivery.

If AI enhancement fails, persist and display the deterministic report.

## Tracking

Capture UTM parameters and referral source on the audit session and persist them with the audit/prospect tags or dedicated metadata.

Track these funnel events:
- `ai_audit_viewed`
- `ai_audit_started`
- `ai_audit_step_completed`
- `ai_audit_submitted`
- `ai_audit_result_viewed`
- `ai_audit_schedule_clicked`
- `ai_audit_scheduled`

No personally sensitive fields should be sent to third-party analytics unless explicitly approved.

## Validation and Abuse Protection

- server-side DTO validation
- normalized email and URL fields
- honeypot field and rate limiting for public submission
- no secrets exposed to the browser
- public result route uses opaque identifiers and returns only public-safe audit fields
- internal prospect endpoints retain existing auth expectations

## Error Handling

- CRM prospect creation failure: stop and show retryable error; do not generate orphan audit
- scoring failure: return a safe generic report only if deterministic inputs were accepted; log the scoring exception
- optional AI enhancement failure: ignore and continue with deterministic summary
- scheduling integration unavailable: preserve audit, show manual contact fallback, do not falsely mark scheduled

## Testing

Backend:
- scoring unit tests for every category
- deterministic fixture tests
- audit create/read integration tests
- prospect stage transition tests
- validation and rate-limit tests

Frontend:
- form-step validation
- API error states
- successful end-to-end intake → result
- analytics event emission
- mobile responsive coverage

Manual production verification:
1. submit a test lead on public domain;
2. verify Prospect exists once, with correct source/tags;
3. verify audit report attached to that Prospect;
4. verify result route works on mobile;
5. verify scheduling CTA behaves truthfully;
6. verify CRM panel renders result;
7. verify no duplicate leads on refresh/resubmit;
8. verify health checks and existing WISE² routes remain unaffected.

## Deployment Strategy

Ship behind an environment flag `NEXT_PUBLIC_AI_AUDIT_ENABLED` until verified.

Sequence:
1. database migration
2. backend API + scoring engine
3. frontend intake/result pages
4. CRM detail integration
5. analytics
6. staging/manual verification
7. enable public route on wise2.net

## Rollback

Rollback is feature-flag-first: disable `NEXT_PUBLIC_AI_AUDIT_ENABLED` and leave existing CRM untouched. The new database table is additive and should not require destructive rollback for an application rollback.

## Definition of Done

- `/ai-audit` is live and responsive on wise2.net
- a visitor can complete the audit without authentication
- one Prospect is created/reused correctly
- deterministic audit report is generated and persisted
- result page shows ranked WISE² opportunities with non-guaranteed impact ranges
- CRM prospect detail displays the report
- scheduling CTA updates status only after a real scheduling action
- UTM/source tracking is captured
- tests pass
- no secrets are exposed
- existing WISE² CRM and website flows are not regressed
