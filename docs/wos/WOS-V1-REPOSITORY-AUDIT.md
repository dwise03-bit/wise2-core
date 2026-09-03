# WISE² OS V1 Repository Audit

**Date:** 2026-09-03
**Repository:** `dwise03-bit/wise2-core`
**Phase:** discovery only; no feature implementation

## Executive conclusion

The repository already contains most raw capabilities required for WOS V1, but they are distributed across a very large monorepo and several historical runtime patterns. The strongest reusable foundation is `packages/api` + `packages/db` (NestJS, Prisma, PostgreSQL-oriented domain models), supported by Revenue OS tenant/lead/follow-up modules, `packages/reaper-*`, `packages/agent-framework`, and the Discord and worker services.

The main V1 risk is not missing models. It is proving one canonical, tenant-safe, auditable workflow across prospect → lead → meeting intelligence → project/task → approval → follow-up without duplicating CRM, auth, migration, or worker implementations.

## Repository state

- Branch: `main`
- HEAD: `fc5b1492 Add Long Island market sales academy materials — 3 modules complete`
- Remote: `origin git@github.com:dwise03-bit/wise2-core.git`
- Recent history includes deployment, production wiring, tenant isolation, phone, HVAC, and dashboard work.
- The working tree was already dirty. Unmodified by this audit: the three Sound Labs live files and `petals-landing.tsx` listed as modified by git, plus untracked phone-AI, website, XR, ritual, GetDown, and cinematic-video work. These must remain isolated from WOS work.

## Topology

This is a pnpm/Turbo TypeScript monorepo with `apps/*`, `packages/*`, `services/*`, legacy root `src/*`, device/mobile projects, and client projects. Root scripts provide build, lint, test, type-check, Prisma generation, and operational start/stop commands.

Relevant surfaces include:

- `apps/dashboard`: Next.js dashboard with CRM, projects, audits, AI, phone, sales, and Wise Defense areas.
- `apps/command-center`: Next.js command-center surface; build/start currently delegate to `apps/dashboard`.
- `apps/website`: public website and intake surfaces.
- `apps/phone-gateway`, `packages/ai-phone`, and phone-related API modules.
- `services/wise-discord`, `services/discord-ecosystem`, and `services/reaper-bridge`.
- `apps/wise-defense-edge`, HVAC, trading, music, printing, client, and embedded/mobile projects.

Multiple additional API/dashboard trees exist (`services/api`, `services/dashboard`, root `src/api`, and `packages/api`). Runtime/deployment ownership is not yet unambiguous.

## Discovery matrix

| Component | Location | Existing purpose | Disposition | V1 responsibility | Risk / change needed |
|---|---|---|---|---|---|
| API | `packages/api` | NestJS API with Prisma, TypeORM, queues, auth, Revenue OS, v1 modules | Keep/adapt | Core API | Confirm deployed entrypoint |
| Database | `packages/db/prisma/schema.prisma` | Large schema covering users, tenants, CRM/revenue, audits, phone, projects, approvals and verticals | Keep/adapt | Canonical state | Inspect overlaps before migration |
| Migrations | `packages/db/prisma/migrations`, `packages/db/migrations`, `packages/api/src/migrations`, `services/worker/migrations` | Prisma, SQL and TypeORM histories | Policy-consolidate; do not rewrite | Safe evolution | Critical data-integrity risk |
| Auth/tenant | `packages/api/src/auth`, `brain-auth`, `revenue-os/tenant`; `Tenant`, `TenantMembership` | JWT/OAuth/Passport, guards, context and middleware | Keep/harden | Auth and isolation | Split identity seam needs one contract |
| Prospect/CRM | `v1/prospects`, `revenue-os/leads`, `Prospect`, `Lead`, `RevenueCustomer` | Capture, claims, scoring, follow-ups | Reuse/adapt | Capture and CRM | Several overlapping lead/customer models |
| Reaper | `packages/reaper-*`, `services/reaper-bridge` | Evidence, scoring, jobs and bridge | Reuse/adapt | Audit intelligence | Add provenance and controlled CRM conversion |
| Meetings | Consulting recording/session models, post-call models, phone transcript models, audit modules | Recording/transcription/summary/action pieces | Adapt | Meeting Brain | No single provider-neutral golden path verified |
| Projects | `Project`, consulting tasks, API project module, dashboard project routes | Projects, tasks, updates | Reuse/adapt | Delivery after approval | Generic and consulting variants overlap |
| Approvals/follow-up | Revenue `Approval`, safety/consent, follow-up services/models | Guarded actions and drafts | Reuse/harden | Human gates and delivery | Universal L3/L4 enforcement unproven |
| Discord | `services/wise-discord`, ecosystem, API Discord SQL | Bot commands and notifications | Keep as interface | Commands/approvals | Must remain non-canonical and idempotent |
| Workers | BullMQ in API/Reaper; Redis/ioredis worker | Background jobs and automation | Reuse/adapt | Transcription, analysis, outbox | Multiple runtimes need ownership decision |
| Agents/AI | `packages/agent-framework`, Revenue agents, `packages/ai`, orchestrator services | Agent definitions, orchestration, providers | Reuse/adapt | Registry, policy, executions, costs | Multiple execution boundaries |
| Deployment/CI | Docker/Compose, nginx, GitHub workflows | Build/deploy/health/security | Preserve | Foundation consistency | Many variants; release gate unclear |
| Tests | API, Revenue OS, business-os, phone, dashboard, control-bridge, integration suites | Unit/e2e/security coverage | Extend | Golden path and release gates | No single verified release gate |

## Database and domain findings

The Prisma schema already has `User`, `Tenant`, `TenantMembership`, `Prospect`, `Lead`, `Project`, `ActionItem`, audit-session and recording models, `Approval`, `FollowUp`, `AuditLog`, consent records, agent configuration, webhook/automation records, phone calls/transcripts, and usage/cost-like records. Migrations show prior work for tenant isolation, prospect CRM, audit/recording, communication, revenue, phone, and Reaper foundations.

The domain is materially ahead of greenfield, but prospect/lead/customer/consulting-lead, project/task, and audit/activity/workflow concepts overlap. Prisma, TypeORM, and raw SQL migration paths coexist. The schema itself was not changed.

## Security and tenancy

Positive evidence includes tenant guards/context/middleware, tenant-isolation tests, tenant ownership columns/indexes, consent and approval models, security CI, and control-bridge redaction tests. Code comments explicitly warn against trusting client-supplied tenant IDs.

The release risk is coverage: every V1 route, repository query, queue job, webhook, Discord command, and agent tool must carry authenticated tenant context. This requires a uniform test matrix.

## AI and cost controls

Provider seams and AI services exist, as do agent definitions and an AI cost policy configuration. A single provider-neutral execution and cost-event contract spanning all jobs was not verified. WOS should normalize policy and provenance before autonomous behavior. L3/L4 actions must remain approval-gated.

## What exists / what is missing

Already present or nearly present: monorepo tooling; Next.js/NestJS/Prisma/Redis/BullMQ/Docker/GitHub Actions; tenant and membership foundations; prospect/lead capture; Reaper evidence/scoring; project/task/approval/consent/audit/follow-up concepts; Discord interface; agent and AI provider seams; broad tests.

Unproven or missing for the complete loop: one canonical cross-domain workflow and trace ID; one provider-neutral Meeting Brain with consent, extraction, review, and approved application; an end-to-end golden-path test; a single enforced L0–L4 policy; uniform outbox/idempotency; one AI cost-event contract; and a definitive runtime/deployment map.

## Dangerous-to-change areas

Preserve the existing dirty work; Prisma schema and migration histories; auth identity and tenant membership; production Compose/nginx/network and deployment workflows; phone/HVAC/client/embedded/customer-facing applications; active Discord commands; and shared models such as `User`, `Project`, `Lead`, `Approval`, `FollowUp`, and audit tables.

## Recommended WOS-0001 scope

WOS-0001 should be a foundation and proof-of-boundaries increment, not new CRM or Meeting Brain implementation:

1. Select and document authoritative V1 API, database, worker, dashboard, and Discord runtime paths.
2. Define shared correlation/request/job/tenant/user context and structured logging rules.
3. Define typed domain-event, transactional outbox, and idempotency interfaces; adapt existing implementations.
4. Define L0–L4 policy vocabulary and the approval-boundary contract.
5. Map existing models to canonical V1 concepts without adding duplicate tables.
6. Add non-destructive tests for tenant propagation, authorization denial, idempotency, audit metadata, and cost-event shape.
7. Produce the reviewed golden-path test design and deployment/rollback prerequisites.

Proposed first implementation commit after approval: `wos: establish v1 foundation contracts and verification harness`.

Explicitly defer native mobile apps, billing expansion, broad calendar/Drive automation, a large workflow engine, advanced analytics, broad autonomous agents, plugin ecosystem work, and architecture-wide directory moves.

## Stop condition

Discovery is complete. No WOS-0001 implementation, migration, deployment, merge, or production action should occur until this audit and the gap map are reviewed and approved.
