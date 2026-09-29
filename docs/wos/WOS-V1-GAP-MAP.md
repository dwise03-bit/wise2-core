# WISE² OS V1 Gap Map

**Date:** 2026-09-03
**Basis:** repository discovery; statuses reflect verified evidence, not intended design.

| Requirement | Existing implementation | Status | Gap / action | Risk | Work item |
|---|---|---|---|---|---|
| Monorepo/tooling | pnpm workspace, Turbo, root build/lint/test/type-check | READY | Freeze authoritative V1 paths | Medium | WOS-0001 |
| Environments/secrets | Docker/Compose variants, env examples, deployment docs | PARTIAL | Document one environment matrix and secret boundary | High | WOS-0001 |
| Health/observability | Health tests, security checks, service logging | PARTIAL | Standardize correlation, tenant, user, job, cost fields | High | WOS-0001 |
| PostgreSQL canonical state | Large Prisma schema | PARTIAL | Prisma/TypeORM/raw SQL migrations coexist; declare policy | Critical | WOS-0001 |
| Authentication | Nest auth, Passport/JWT/OAuth, brain-auth | PARTIAL | Select authoritative identity/session contract | Critical | WOS-0002 |
| Tenant isolation | Tenant/TenantMembership, guards, middleware, tests | PARTIAL | Prove coverage across routes, jobs, webhooks and tools | Critical | WOS-0002 |
| Users/RBAC/permissions | User/tenant roles, collaborators, agent config permissions | PARTIAL | Normalize authorization vocabulary and decision point | High | WOS-0003 |
| Audit history | AuditLog, ActivityLog, audit service, workflow records | PARTIAL | One append-only/tamper-evident WOS envelope and trace | High | WOS-0001/3 |
| Prospect capture | Prospect model, prospects API, website intake | READY | Confirm canonical source/event contract | Medium | WOS-0004 |
| Qualification/evidence | Reaper domain/intelligence/scoring and audit models | PARTIAL | Provenance-to-CRM boundary and human review | High | WOS-0008 |
| CRM lifecycle | Lead, Prospect, RevenueCustomer, consulting lead, Revenue OS | PARTIAL | Choose canonical V1 mapping; avoid duplicate tables | High | WOS-0004 |
| Companies/contacts/opportunities | Customer/consulting/revenue concepts | PARTIAL | No verified unified aggregate | High | WOS-0004 |
| Activities/notes | ActivityLog, comments, updates and domain notes | PARTIAL | Define generic CRM activity/note adapter | Medium | WOS-0004 |
| Project/task delivery | Generic Project, consulting tasks, API/dashboard modules | PARTIAL | Choose canonical or adapter strategy | High | WOS-0005 |
| Files/assets | File/asset migrations and storage modules | PARTIAL | Unify object reference and recording lifecycle | High | WOS-0005/7 |
| Approvals | Approval model, safety/consent modules and tests | PARTIAL | Universal L3/L4 gate and audit linkage unproven | Critical | WOS-0003/5 |
| Discord interface | `services/wise-discord`, ecosystem, API schema/docs | PARTIAL | Typed API/event adapter and idempotent handlers | High | WOS-0006 |
| Workers/queues | BullMQ in API/Reaper; Redis worker | PARTIAL | Select V1 worker owner and job envelope | High | WOS-0001/7 |
| Recording consent | ConsentRecord and phone recording-consent models | PARTIAL | Provider-neutral state machine and enforcement | Critical | WOS-0007 |
| Transcription | Phone transcript and consulting recording models | PARTIAL | Unified media → transcript adapter | High | WOS-0007 |
| Meeting intelligence | Summaries, action items, consulting moments/tasks | PARTIAL | Unified structured output, confidence, human review | Critical | WOS-0007 |
| CRM/project extraction | AI/revenue/consulting workflows | MISSING | No verified reviewed-suggestion application path | High | WOS-0007 |
| Follow-up | Revenue OS follow-up services/models | PARTIAL | Draft → approval → idempotent delivery trace | Critical | WOS-0004/6 |
| Agent registry/policy | Agent framework, Revenue agents, agent configs | PARTIAL | One L0–L4 enforcement boundary | Critical | WOS-0010 |
| Prompt versions | Agent/AI code exists | MISSING | No verified single prompt registry | Medium | WOS-0010 |
| AI abstraction | `packages/ai`, provider services, orchestrators | PARTIAL | Minimal model class/provider-neutral interface | Medium | WOS-0010 |
| AI cost accounting | Usage/cost-like schema records and cost policy | PARTIAL | One event shape across providers/jobs | Medium | WOS-0001/10 |
| Outbox/idempotency | Webhook/event models, queues, webhook tests | PARTIAL | Universal transactional/replay contract unproven | Critical | WOS-0001/6 |
| Dave Mode/PWA | Dashboard/command-center mobile surfaces and mobile tests | PARTIAL | Dedicated operator PWA flow not proven | Medium | WOS-0009 |
| CI/CD/deployment | GitHub workflows, Docker, Compose, nginx, docs | PARTIAL | Authoritative pipeline and rollback need confirmation | High | WOS-0001 |
| Golden-path release gate | Many integration, approval, isolation and safety tests | MISSING | No single verified prospect→follow-up gate | Critical | WOS-0001 then all |

## Readout

The repository is not a blank foundation. Most individual capabilities are READY or PARTIAL; the critical missing property is composition: one tenant-safe, approval-controlled, observable, idempotent business loop. WOS-0001 should close cross-cutting foundation gaps and establish the verification harness before new domain tables or broad UI work.

## Approval boundary

This discovery phase stops here. Review the audit and this map before implementation, schema changes, deployment, or production actions.
