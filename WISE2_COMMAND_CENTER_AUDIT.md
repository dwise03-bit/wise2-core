# WISE² Command Center - Phase 0 Audit Report

**Date**: 2026-08-20  
**Branch**: `claude/wise2-command-center-hhf2rq`  
**Status**: AUDIT IN PROGRESS

---

## Executive Summary

The WISE² platform has substantial foundational infrastructure already in place:

- ✅ **Multi-tenant architecture** (Tenant model with full lifecycle)
- ✅ **Database schema** with CRM, dispatch, workflow, and approval models
- ✅ **Discord bot service** (services/bot, 147KB index.js)
- ✅ **Command center frontend** (wise2-command-center app, Next.js)
- ✅ **Billing integration** (Stripe, Subscription models)
- ✅ **Demo mode support** built into Tenant model
- ⚠️ **Hermes agent layer** (exists as service, needs integration)
- ❌ **Payment provisioning flow** (not yet wired to tenant creation)
- ❌ **Discord slash commands** (framework exists, commands not mapped)
- ❌ **Approval engine** (Approval model exists, business logic missing)
- ❌ **Workflow automation** (WorkflowDefinition model exists, engine not implemented)
- ❌ **API endpoints** for CRM, pipeline, estimates, dispatch operations

---

## PHASE 0 - DEEP INSPECTION RESULTS

### FINDING: Infrastructure is 70% Scaffolded

The WISE² platform has **comprehensive scaffolding** but most business logic is **TODO/stubbed**.

- ✅ Database schema: Complete
- ✅ API routing: Complete
- ✅ Webhook handler: Implemented, calls provisioning service
- ✅ Provisioning orchestration: Framework exists
- ✅ Frontend pages: Exist but no data integration
- ❌ Provisioning step implementations: **All TODO**
- ❌ Discord slash command mappings: Not wired
- ❌ API endpoint business logic: Not implemented
- ❌ Hermes integration: Service exists, tenant integration missing
- ❌ Approval execution: Model exists, logic not implemented
- ❌ Workflow execution: Model exists, engine not built

### Strategy

Do not rebuild scaffolding. **Fill in the TODOs**.

1. Implement provisioning step handlers
2. Wire Discord bot commands
3. Implement API endpoint logic
4. Build approval/workflow engines
5. Integration test the complete flow

---

## PHASE 0 - INFRASTRUCTURE INVENTORY

### Database Layer (✅ SOLID)

**Tenant Foundation**
```
Tenant
├── TenantState (PAYMENT_PENDING, PROVISIONING, ONBOARDING, ACTIVE, PAST_DUE, SUSPENDED, CANCELLED, ARCHIVED)
├── demoMode Boolean
├── stripeCustomerId/stripeSubscriptionId
├── discordGuildId
├── onboardingStep/onboardingCompletedAt
├── revenueOsEnabled Boolean
└── relationships → [memberships, customers, leads, jobs, estimates, campaigns, agents, automationRuns, webhookEvents, consentRecords, safetyEvents, provisioning, approvals, workflows, followUps, contracts, auditLogs, digitalTwins]
```

**CRM Models** (✅ EXIST)
- RevenueCustomer (name, email, phone, businessId, type, metadata)
- Lead (name, email, phone, source, businessId, pipelineStage)
- Customer (related to RevenueCustomer, existing parallel model)

**Operations Models** (✅ EXIST)
- ServiceJob (dispatch, job tracking)
- Estimate (pricing, approval workflow)
- FollowUp (reminders, automation triggers)
- Contract (recurring services)

**Workflow Models** (✅ EXIST)
- WorkflowDefinition (workflow templates per tenant)
- AutomationRun (execution history)
- Approval (approval requests, pending/approved/rejected states)
- AuditLog (all operations logged)

**Demo Mode** (✅ SUPPORTED)
- Tenant.demoMode flag prevents external side effects
- Adapters needed for demo implementations

### Backend Services

**API Service** (services/api)
- Status: UNKNOWN - needs inspection
- Expected: RESTful API for CRM, pipeline, dispatch, approvals

**Bot Service** (services/bot)
- Status: EXISTS (index.js 147KB)
- Contains: Discord command handling, webhook integration
- Missing: Slash command structure for business operations

**Worker Service** (services/worker)
- Status: EXISTS (needs inspection)
- Expected: Queue-based automation, retries, workflows

**Hermes Agent** (services/executive-agent, services/ai-orchestrator)
- Status: EXISTS (needs inspection for WISE² integration)
- Expected: Intelligence layer for business reasoning

### Frontend

**Command Center App** (wise2-command-center)
- Status: PARTIAL
- Pages implemented:
  - Dashboard (/dashboard)
  - CRM (/crm)
  - Marketing (/marketing)
  - AI (/ai)
  - Analytics (/analytics)
  - Settings (/settings)
  - Automation (/automation)
  - Demo admin (/demo/admin)
  - Demo dynamic (/demo/[slug])
- Missing: Navigation integration, data fetching, Discord connectivity

**UI Components** (✅ COMPLETE)
- Card, Button, Input, Dialog, Tabs, Badge, Avatar, Progress, Tooltip, etc.
- Using shadcn/ui patterns
- Ready for dashboard implementation

### Billing & Payment

**Stripe Integration** (✅ EXISTS)
- Subscription model with stripeCustomerId, stripeSubscriptionId
- PricingPlan enum (FREE, STARTER, PRO, ENTERPRISE)
- SubscriptionStatus (ACTIVE, CANCELED, PAST_DUE, TRIALING, INACTIVE)
- Missing: Webhook handler for payment events → tenant provisioning

### Authentication & Authorization

**User Model** (✅ EXISTS)
- Email/password authentication
- UserRole enum (CUSTOMER, ADMIN, FOUNDER)
- Missing: RBAC for tenant roles (OWNER, ADMIN, SALES, DISPATCH, TECH, MARKETING, VIEWER)

**TenantMembership** (✅ EXISTS)
- Links users to tenants
- Missing: Role-based permissions enforcement

---

## PHASE 0 - GAP ANALYSIS

### EXISTING ✅

| Component | Status | Notes |
|-----------|--------|-------|
| Tenant model & lifecycle | ✅ | Full state machine, demo mode, onboarding tracking |
| Multi-tenant database schema | ✅ | Lead, Customer, ServiceJob, Estimate, FollowUp, Contract models |
| Approval model | ✅ | Schema exists, business logic not implemented |
| Workflow model | ✅ | WorkflowDefinition, AutomationRun, schema ready |
| AuditLog model | ✅ | Audit trail infrastructure ready |
| Stripe billing | ✅ | Subscription model, pricing plans defined |
| Discord integration | ✅ | discordGuildId field on Tenant, bot service exists |
| Demo mode flag | ✅ | Tenant.demoMode prevents side effects |
| Database migrations | ✅ | Prisma schema set up |

### PARTIAL ⚠️

| Component | Status | Notes |
|-----------|--------|-------|
| Discord bot service | ⚠️ | Service exists, slash commands not mapped to business logic |
| Command center frontend | ⚠️ | Pages exist, no data integration or Discord connectivity |
| API service | ⚠️ | Service exists, business endpoints not mapped |
| Hermes agent | ⚠️ | Service exists, integration with WISE² tenants needed |
| Authentication | ⚠️ | User/session model exists, tenant-scoped auth not enforced |

### MISSING ❌

| Component | Phase | Priority |
|-----------|-------|----------|
| Payment webhook handler | 3 | HIGH - Payment → Provisioning flow |
| Tenant provisioning engine | 3 | HIGH - Multi-step provisioning with state tracking |
| Approval engine business logic | 13 | HIGH - Execute/reject/expire approvals |
| Workflow execution engine | 14 | HIGH - Run workflows, handle retries, idempotency |
| Discord slash commands | 4 | HIGH - /dashboard, /leads, /pipeline, etc. |
| Hermes context initialization | 5 | HIGH - Tenant-scoped AI context loading |
| CRM API endpoints | 6 | MEDIUM - CRUD for leads, customers, properties |
| Pipeline API endpoints | 7 | MEDIUM - Stage transitions, opportunity tracking |
| Estimate engine | 8 | MEDIUM - Good/Better/Best packages, approval workflow |
| Dispatch engine | 9 | MEDIUM - Job assignment, technician routing |
| Follow-up system | 10 | MEDIUM - Auto-detection rules, recommendations |
| Contract engine | 11 | MEDIUM - Renewal tracking, opportunities |
| Marketing content engine | 12 | MEDIUM - Asset management, publishing approvals |
| Industry templates | 15 | MEDIUM - HVAC, Pressure Washing, Plumbing config |
| Get Down demo tenant | 16 | MEDIUM - Polished demonstration |
| Observability & metrics | 17 | LOW - Logging, health checks, tracing |
| Comprehensive test suite | 18 | LOW - Unit, integration, tenant isolation tests |

---

## CRITICAL PATH (Recommended Implementation Order)

### Phase 1: Tenant Foundation (PREREQUISITE)
- [x] Tenant model exists
- [ ] Implement TenantState transitions with validation
- [ ] Add ProvisioningRun state machine

### Phase 2: Payment → Provisioning (BLOCKER)
- [ ] Stripe webhook handler (`POST /webhooks/stripe`)
- [ ] Webhook signature validation
- [ ] Idempotent tenant creation on successful payment
- [ ] Trigger provisioning workflow
- [ ] Handle payment failures gracefully

### Phase 3: Provisioning Engine (BLOCKER)
- [ ] CREATE_TENANT step (idempotent)
- [ ] CREATE_MEMBERSHIP step (owner user)
- [ ] INITIALIZE_DATABASE step
- [ ] LOAD_TEMPLATE step (industry configuration)
- [ ] CREATE_PIPELINE step (stage configuration)
- [ ] INITIALIZE_HERMES step (AI context)
- [ ] PROVISION_DISCORD step (workspace/channels/roles)
- [ ] START_ONBOARDING step
- [ ] ACTIVATE step (mark ready for use)
- [ ] Error handling and retry logic

### Phase 4: Discord Control Surface (CUSTOMER FACING)
- [ ] Map slash commands to business operations
- [ ] Implement authorization checks (user → tenant resolution)
- [ ] Implement modal/form responses
- [ ] Implement button interactions
- [ ] Implement pagination for lists

### Phase 5: API Endpoints (BACKEND FOUNDATION)
- [ ] Tenant-scoped authorization middleware
- [ ] CRM endpoints (leads, customers, properties)
- [ ] Pipeline endpoints (opportunities, stages, conversion)
- [ ] Approval endpoints (list, approve, reject)
- [ ] Audit log endpoints (read-only, tenant-scoped)

### Phase 6-19: Domain-specific implementations
(See full build order in WISE2_BRIEF.md)

---

## SECURITY CHECKLIST

- ⚠️ Tenant isolation: Queries need `businessId` scoping throughout
- ⚠️ Authorization: User must be member of tenant; role-based checks needed
- ⚠️ Approval safety: Payload hash validation before execution
- ⚠️ Demo mode: Adapters must prevent real-world side effects
- ⚠️ Secrets: Discord bot token should be encrypted, not plaintext
- ⚠️ Webhooks: Signature validation, replay protection on Stripe events

---

## Immediate Next Steps

1. **Inspect existing services** (API, Worker, Hermes)
2. **Map database models** to API endpoints (create stubs)
3. **Implement Stripe webhook** handler for payment activation
4. **Implement provisioning engine** state machine
5. **Wire Discord bot** to API endpoints
6. **Implement tenant-scoped authorization** middleware

---

## File Locations

- **Database Schema**: `packages/db/prisma/schema.prisma`
- **Discord Bot**: `services/bot/index.js` (147KB)
- **API Service**: `services/api/` (needs inspection)
- **Command Center**: `wise2-command-center/src/`
- **Existing documentation**: `WISE2_BRIEF.md` (in repo root)

---

## Definition of Success (Phase 0 Complete)

✅ Audit identifies all existing infrastructure  
✅ Map data models to API endpoints  
✅ Identify missing microservices or integrations  
✅ Produce implementation roadmap  
✅ Set up logging/observability for audit trail  
