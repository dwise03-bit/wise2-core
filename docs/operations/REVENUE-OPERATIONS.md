# WISE² Revenue Operations

## Objective

Turn the existing WISE² Prospect CRM, agent stack, automation, deployment, and design systems into one repeatable revenue pipeline. Extend existing systems; do not create a second CRM, scheduler, or orchestration platform.

## Canonical pipeline

`Lead -> Audit -> Package -> Quote/Checkout -> Build -> Visual QA -> Deploy -> Onboard -> Support -> Upsell`

## Existing system of record

The existing Prospect CRM remains authoritative for lead and opportunity management. Relevant code includes:

- `packages/api/src/v1/prospects/prospects.module.ts`
- `packages/api/src/v1/prospects/prospects.service.ts`
- `packages/api/src/v1/prospects/prospects.controller.ts`
- `apps/website/app/api/prospects/route.ts`
- `apps/website/app/crm/prospects/page.tsx`
- `apps/website/app/crm/prospects/[id]/page.tsx`

Existing CRM stages remain the commercial qualification stages. New delivery state should be added only when a failing test proves the current model cannot represent the required behavior.

## Stage contracts

### Lead
Capture business identity, contact information, primary problem, source, tags, notes, and estimated opportunity. Prefer structured CRM data over rereading raw conversations.

### Audit
Produce a concise audit record with pain points, measurable opportunity, recommended WISE² capabilities, required integrations, dependencies, risks, and estimated scope. No paid provisioning occurs during audit.

### Package
Convert the audit into one primary client outcome with included services, setup work, recurring services, dependencies, exclusions, and acceptance criteria. Reuse existing WISE² products/templates before creating custom one-offs.

### Quote / Checkout
Use the repository's existing billing/Stripe path where applicable. Payment success never implies deployment success. Webhooks must be idempotent. Do not invent prices or payment state.

### Build
Build from the approved package. Every build brief must include scope, locked brand references, target app/domain, integrations, acceptance criteria, deployment target, and rollback requirements.

### Visual QA
Every customer-facing web/mobile surface must pass the WISE² visual release gate before release. See `docs/design/WISE2-VISUAL-RELEASE-GATE.md`.

### Deploy
Use the existing deployment/CI architecture. Conceptual gate: `Build -> Test -> Candidate -> Health Check -> Smoke Test -> Release -> Verify`. Roll back if verification fails.

### Onboard
Use `docs/operations/CLIENT-DELIVERY-CHECKLIST.md`. Credentials must be delivered only through approved secure channels and never committed to Git.

### Support
Track owner, severity, response target, open issue state, maintenance obligations, system health, and satisfaction signals against the same client identity.

### Upsell
Recommend additions only when a demonstrated need exists. Examples: website -> AI phone/CRM/automation; hosting -> managed monitoring/support; HVAC -> Field Tech/phone/reporting; brand -> content studio/campaign automation.

## Revenue ownership contract

For every active prospect/client, the operating layer should be able to determine:

- lifecycle stage
- opportunity value
- next best action
- owner
- target date or trigger
- selected package/offers
- payment state
- build state
- QA state
- deployment state
- onboarding state
- support state
- recurring-revenue state
- blocker reason

## Credit Saver policy

1. Deterministic rules before LLM judgment.
2. Structured CRM fields before transcripts.
3. Summarize long conversations once and reuse the summary.
4. Local/GPU models for routine classification and summarization when safe.
5. Claude/Codex escalation for complex architecture, package design, debugging, or negotiation support.
6. Do not regenerate approved media or reread large unchanged files unnecessarily.

## KPIs

Track at minimum: new leads, qualified leads, audits scheduled/completed, proposals sent, wins, losses, pipeline opportunity, won opportunity, conversion rate, lead-to-audit time, won-to-live time, blocked launches, active recurring-revenue clients, and 7/30-day post-launch reviews.

## Safety

No secrets in Git. No production database resets. No destructive Docker cleanup. No unverified DNS changes. No paid provisioning without authorization. No production release without relevant tests, health checks, and rollback readiness.
