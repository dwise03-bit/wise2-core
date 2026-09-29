# Contractor OS — Phase 0 Audit

**Date**: 2026-08-22
**Purpose**: Ground-truth the existing wise2-core architecture before building the WISE² Contractor OS, per CLAUDE.md Phase 0 directive. Findings are based on reading actual code, not the ~250 aspirational `*_COMPLETE.md` / `*_STATUS.md` files at repo root, which do not reliably reflect what is actually shipped or wired up.

---

## Headline finding

**A substantially complete contractor CRM already exists** at `packages/api/src/revenue-os/` (NestJS backend) + `apps/command-center/app/revenue-os/` (Next.js frontend), currently flavored for the HVAC vertical. It already has:

- Multi-tenant `Tenant`/`TenantMembership` model with server-side tenant resolution and isolation tests
- `Lead`, `RevenueCustomer`, `Estimate`, `ServiceJob`, `Conversation`, `Campaign`, `Contract`, `FollowUp`, `Approval`, `WebhookEvent`, `AuditLog` Prisma models (~100+ total models in the schema)
- BullMQ-backed workflow engine with real workflows (speed-to-lead, estimate-recovery, membership, reactivation, review, inbound-receptionist)
- Tenant-scoped Stripe billing
- An agents/agent-definitions layer for AI actions
- ~1,500 lines of tests: tenant isolation, safety/consent, agent workflow, webhook provider, attribution
- A full command-center frontend: leads, estimates, dispatch, conversations, agents, automations, analytics, customers, settings

**Recommendation**: Generalize this existing system (extract the HVAC-specific naming/fields behind a `vertical` config) rather than building a parallel "Contractor OS" module from scratch. Building fresh would duplicate the tenant-isolation security model and test suite that already exists and works.

---

## 1. Monorepo structure

Pnpm workspace + Turborepo. Real, currently-live Next.js 14 apps: `website` (3001), `dashboard` (3002), `admin` (3004), `studio` (3005), `command-center` (newest, no fixed port yet). Several `apps/*-demo` directories (`wise-hvac-demo`, `getdown-demo`, `jo-credit-os-demo`, `lexis-inks-demo`) are thin, self-contained marketing shells — not backed by the real API.

Two backends coexist and overlap only partially:
- `packages/api` (`@wise2/platform-api`, NestJS) — labeled "legacy" in its own package.json, but is where Revenue OS actually lives.
- `services/api` (`@wise2/api`, Express) — smaller, separate REST service.

`services/dashboard` contains a corrupted, recursively-nested `services/dashboard/services/dashboard/services/dashboard/...` directory — dead weight, not a symlink, don't build from it.

## 2. Database & ORM

Prisma is the real, actively-used ORM: `packages/db/prisma/schema.prisma`, 4,042 lines, 100+ models. Contains the full Revenue OS model set described above. A separate, older `Prospect`/`ConsultingClient`/`ConsultingLead` family exists from a prior consulting-CRM attempt — legacy, disconnected from the Tenant-scoped models, do not build on it.

TypeORM also exists in parallel (`packages/api/src/auth/` entities: `user.entity.ts`, `session.entity.ts`) — two ORMs coexist for different subsystems (auth vs. Revenue OS domain data).

## 3. Auth & multi-tenancy

Custom JWT auth via NestJS (no NextAuth/Clerk). Multi-tenancy is well-designed and real:
- `packages/api/src/revenue-os/tenant/tenant.guard.ts` runs after `JwtAuthGuard`, resolves tenant membership server-side via `TenantService.resolveForUser()` — never trusts a client-supplied tenant id except as a hint.
- Enforces a `REVENUE_OS_ENABLED` global flag plus a per-tenant `revenueOsEnabled` flag; returns 404 (not 403) when disabled, to avoid leaking existence.
- `TenantContext` attached to `request.tenant` / `request.tenant_id`.
- Dedicated `tenant-isolation.spec.ts` test file exists and should be extended for any new Contractor OS scoping.

## 4. Stripe / billing

Not centralized. `packages/api/src/v1/billing/` is tenant-aware (ties to `Tenant.stripeCustomerId`/`stripeSubscriptionId`) — this is the one to extend for Contractor OS packages/pricing. Separately, `apps/website`, `apps/podcast-music`, `apps/jo-credit-os-demo`, and `clients/cc-craft-create/website` each run their own independent, non-tenant-scoped Stripe checkout — unrelated single-store flows, not part of the platform billing model.

## 5. Background workers / Redis / queues

BullMQ is real and used specifically by Revenue OS (`packages/api/src/revenue-os/automations/queue.service.ts`, lazily initialized against `REDIS_URL`, gated by the feature flag), processed by `revenue-worker.service.ts`. An older in-memory Map-based queue also exists elsewhere in the same package — explicitly commented in code as "fine for best-effort email, unacceptable for booked jobs." `docker-compose.production.yml` runs `redis:7-alpine`.

## 6. Docker & deployment

~15 docker-compose files at root; most are stale. `docker-compose.prod.yml` is explicitly commented as legacy (kept only because `deploy.sh`/`deploy-prod` still reference it). **`docker-compose.production.yml` is current** — runs postgres, redis, mongodb, api, ollama, open-webui, website, dashboard, admin, studio, command-center, a content worker, prometheus, grafana. `nginx.conf` at root is actively maintained. Per prior memory, there's a known port-mismatch history (app defaults 3000 vs nginx expecting 3001) — re-verify before routing anything new.

## 7. Existing CRM / contractor-like features

See headline finding — this is the core discovery of the audit. `revenue-os.module.ts` is imported and registered in `app.module.ts` (confirmed, not just present on disk). Compiled `dist`/`dist-revenue` output confirms it has built successfully. Currently HVAC-flavored (`HvacServiceCategory`, "safetyScript") but the schema shape (tenant, vertical field, lead/estimate/job/customer) is already generic enough to extend to multiple verticals rather than rebuild.

## 8. AI / agent infrastructure

`promptos/` matches the structure described in CLAUDE.md (`core/`, `agents/*.md`, `modules/*.md`) and `promptos/core/*.ts` is real, non-trivial TypeScript (688 lines) — but **grep confirms zero files anywhere in the repo import from `promptos/core`**. It is fully disconnected, dead scaffolding, never wired into any running app. The CLAUDE.md routing flow is aspirational, not implemented.

Real, in-use AI infra: `packages/ai` (`@wise2/ai`) with provider adapters for Claude/ChatGPT/Gemini/Ollama plus a manager/service layer, built to `dist/`. `packages/agent-framework` has a compiled `AgentRegistry`, `AgentRouter`, `BaseAgent`, `AgentMemory`, `AgentTools`. Revenue OS's own `agents.service.ts` is a narrower, separate agent-definitions layer specific to HVAC workflows — not built on `packages/agent-framework`.

---

## What to avoid

- `promptos/` — dead scaffolding, do not route through it.
- `Prospect` / `ConsultingClient` / `ConsultingLead` models — legacy, unrelated CRM attempt.
- `docker-compose.prod.yml` — legacy, superseded by `docker-compose.production.yml`.
- `services/dashboard/services/dashboard/...` — corrupted nested directory, not real code.
- Treat any root-level `*_COMPLETE.md` / `*_STATUS.md` claim as unverified until checked against actual code.

## Recommended path forward

1. Generalize Revenue OS's HVAC-specific fields/naming behind a `vertical` config rather than forking a new module.
2. Extend the existing tenant-isolation guard and test suite rather than reimplementing multi-tenancy.
3. Extend `apps/command-center`'s existing Revenue OS frontend pages rather than building a new dashboard shell.
4. Route new Contractor OS billing/packages through `packages/api/src/v1/billing/`, not the ad-hoc per-app Stripe integrations.
5. Do not touch `promptos/` unless a decision is made to actually wire it up — it currently does nothing.

This is a large, multi-phase undertaking (CRM, jobs/dispatch, estimating, invoicing, team chat, AI operator, automations, supplier/accounting integrations, demo generator, multi-tenant admin). It should proceed phase-by-phase with a checkpoint after each phase, not as a single pass.
