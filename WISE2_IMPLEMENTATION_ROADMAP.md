# WISE² Command Center - Implementation Roadmap

**Date**: 2026-08-20  
**Branch**: `claude/wise2-command-center-hhf2rq`  
**Status**: PLANNING → IMPLEMENTATION

---

## Phase Overview

The WISE² platform is **70% scaffolded** with complete database schemas, API routing, and webhook infrastructure. The task is to **fill in the TODOs** and wire the existing pieces together.

```
PAYMENT FLOW (Current State)

Stripe Payment → Webhook ✅ → Provisioning Service ✅ → Provisioning Steps ❌ TODO
                                                              ├─ CREATE_TENANT ✅ (stub)
                                                              ├─ CREATE_MEMBERSHIP ⚠️ TODO
                                                              ├─ INITIALIZE_DATABASE ✅ (stub)
                                                              ├─ LOAD_TEMPLATE ❌ TODO
                                                              ├─ CREATE_PIPELINE ❌ TODO
                                                              ├─ CREATE_WORKFLOWS ❌ TODO
                                                              ├─ INITIALIZE_HERMES ❌ TODO
                                                              ├─ PROVISION_DISCORD ❌ TODO
                                                              ├─ START_ONBOARDING ❌ TODO
                                                              └─ ACTIVATE ✅ (stub)
```

---

## Critical Path to MVP

### Phase 0 - Audit & Planning (CURRENT) ✅ DONE
- [x] Database schema inventory
- [x] API routing review
- [x] Discord bot assessment
- [x] Frontend page structure review
- [x] Identified TODOs
- [x] Created implementation roadmap

### Phase 1A - Provisioning Engine Implementation (BLOCKER)
**Goal**: Complete tenant provisioning flow (payment → active)

**Tasks**:
- [ ] Implement `stepCreateMembership` - create owner membership from webhook metadata
- [ ] Implement `stepLoadTemplate` - load industry template (HVAC, Pressure Washing, etc.)
- [ ] Implement `stepCreatePipeline` - create pipeline stages from template
- [ ] Implement `stepCreateWorkflows` - create default workflows (lead scoring, follow-up reminders)
- [ ] Implement `stepInitializeHermes` - create Hermes agent config for tenant
- [ ] Implement `stepProvisionDiscord` - create Discord channels, roles, send welcome
- [ ] Implement `stepStartOnboarding` - send welcome/onboarding prompt to tenant Discord
- [ ] Add retry logic & idempotency keys to all steps
- [ ] Test full flow end-to-end

**Files to modify**:
- `services/api/src/services/provisioning.service.ts` (8 step implementations)
- `packages/db/prisma/schema.prisma` (may need migrations for industry templates)

**Estimated effort**: 2-3 days

**Success criteria**:
- Payment triggered → Webhook processed → Tenant fully provisioned with ACTIVE state
- Tenant has memberships, pipeline, workflows, Discord workspace
- Onboarding step progresses automatically

---

### Phase 1B - Industry Templates System
**Goal**: Define HVAC, Pressure Washing, and generic service templates

**Tasks**:
- [ ] Create database records for industry templates
- [ ] Define pipeline stages per industry
- [ ] Define service catalog per industry
- [ ] Define pricebook structure per industry
- [ ] Load template data during provisioning (stepLoadTemplate)
- [ ] Create seed data for Get Down Pressure Washing demo

**Files to modify**:
- `packages/db/prisma/schema.prisma` (create IndustryTemplate models if missing)
- `services/api/src/services/provisioning.service.ts` (stepLoadTemplate implementation)
- Create seed file: `packages/db/prisma/seeds/industry-templates.ts`

**Estimated effort**: 1-2 days

**Success criteria**:
- Template loading creates correct pipeline stages
- Service catalog available for new tenant

---

### Phase 2 - Discord Command Integration (CUSTOMER FACING)
**Goal**: Wire `/dashboard`, `/leads`, `/pipeline`, `/estimates`, etc. to API

**Commands to implement**:
- `/dashboard` - show KPIs, revenue, pipeline summary
- `/leads` - list leads with filtering, pagination
- `/lead-details <leadId>` - full lead view with history
- `/create-lead` - modal form to create lead
- `/pipeline` - show pipeline by stage with counts
- `/estimates` - list estimates by status
- `/create-estimate` - modal to create estimate
- `/dispatch` - show unassigned jobs
- `/job-details <jobId>` - view job and update status
- `/followups` - show pending follow-ups
- `/customers` - list customers
- `/contracts` - show active contracts
- `/approvals` - list pending approvals requiring action
- `/ai` - ask Hermes for business insights
- `/settings` - tenant configuration
- `/onboarding` - continue/restart onboarding

**Tasks**:
- [ ] Create Discord command handlers for each
- [ ] Implement authorization (resolve user → tenant)
- [ ] Fetch data from API endpoints
- [ ] Build Discord embeds with KPI data
- [ ] Implement buttons for actions (Approve Lead, Create Estimate, etc.)
- [ ] Implement modals for data entry
- [ ] Handle pagination with ⬅️ ➡️ buttons
- [ ] Test each command in Discord

**Files to modify**:
- `services/bot/index.js` (add command definitions)

**Estimated effort**: 2-3 days

**Success criteria**:
- All 15+ commands registered and callable
- User can view business data in Discord
- User can perform basic actions (create lead, update status)

---

### Phase 3 - Hermes Agent Integration
**Goal**: Initialize and wire Hermes AI for tenant context

**Tasks**:
- [ ] Create default Hermes agent configs per industry
- [ ] Define system prompts for RECEPTIONIST, SPEED_TO_LEAD agents
- [ ] Implement `stepInitializeHermes` (create AgentConfig records)
- [ ] Wire `/ai` command to Hermes API
- [ ] Test Hermes with tenant context isolation

**Files to modify**:
- `services/api/src/services/provisioning.service.ts` (stepInitializeHermes)
- `services/api/src/routes/hermes.ts` (if needed)

**Estimated effort**: 1 day

**Success criteria**:
- Tenant can query Hermes via Discord
- Hermes responds with tenant-specific insights

---

### Phase 4 - Approval Execution Engine
**Goal**: Implement SMS/Email/Social publishing execution handlers

**Tasks**:
- [ ] Implement `executeSendSMS` - integrate Twilio or similar
- [ ] Implement `executeSendEmail` - integrate SendGrid or similar
- [ ] Implement `executePublishSocial` - integrate Facebook/Instagram
- [ ] Implement `executeChargePayment` - integrate Stripe charges
- [ ] Build demo adapters (DemoSmsProvider, DemoEmailProvider, etc.)
- [ ] Add approval creation endpoints for external actions
- [ ] Test approval workflow (request → approve → execute)

**Files to modify**:
- `services/api/src/routes/approvals.ts` (execution handlers)
- `services/api/src/services/` (create provider adapters)

**Estimated effort**: 1-2 days

**Success criteria**:
- Demo mode: approval execution creates realistic results
- Production mode: integration with Twilio, SendGrid, etc. ready

---

### Phase 5 - Workflow Automation Engine
**Goal**: Build workflow execution and event-driven automation

**Tasks**:
- [ ] Create workflow step execution engine
- [ ] Implement event-driven triggers (lead.created, estimate.sent, etc.)
- [ ] Build retry and idempotency logic
- [ ] Create default workflows (lead scoring, follow-up reminders, invoicing)
- [ ] Wire approval workflow (estimate approval, charge approval)
- [ ] Test workflow execution and failure recovery

**Files to modify**:
- `services/worker/` (workflow execution engine)
- `services/api/src/routes/workflows.ts` (workflow management)

**Estimated effort**: 2-3 days

**Success criteria**:
- Workflows execute in background
- Failed workflows retry safely
- Audit trail logs all workflow events

---

### Phase 6 - API Endpoint Implementation (CRM, Estimates, Dispatch)
**Goal**: Full CRUD endpoints for business entities

**Status Check**: 
Most CRM endpoints are already implemented! Check:
- `services/api/src/routes/crm.ts` - Leads, Customers, Properties
- `services/api/src/routes/estimates.ts` - Estimates
- `services/api/src/routes/dispatch.ts` - Jobs and Dispatch
- `services/api/src/routes/approvals.ts` - Approval flow
- `services/api/src/routes/followups.ts` - Follow-ups
- `services/api/src/routes/contracts.ts` - Contracts

**Tasks**:
- [ ] Audit existing endpoints for completeness
- [ ] Fill in any missing CRUD operations
- [ ] Ensure tenant-scoped queries (businessId filtering)
- [ ] Test with tenant isolation (create Tenant A, Tenant B, verify isolation)

**Estimated effort**: 1-2 days (mostly validation)

**Success criteria**:
- All CRUD endpoints functional
- Tenant isolation verified in tests

---

### Phase 7 - Frontend Integration (Command Center)
**Goal**: Connect Next.js dashboard to API

**Pages to implement**:
- `/dashboard` - KPI cards, pipeline, revenue, upcoming actions
- `/crm/leads` - lead list, create, edit, detail view
- `/crm/customers` - customer list, detail view, contact history
- `/crm/pipeline` - kanban board view of pipeline stages
- `/crm/estimates` - estimate list, create, edit, approval workflow
- `/dispatch` - unassigned jobs, assign job to technician
- `/followups` - pending follow-ups with AI recommendations
- `/marketing` - content creation, approval, publishing
- `/analytics` - reports, KPIs, trend analysis
- `/settings` - tenant configuration, integrations

**Tasks**:
- [ ] Create API service layer (useTenant, useCRM, useEstimates, etc.)
- [ ] Build dashboard components
- [ ] Implement data loading and caching
- [ ] Add forms for create/edit operations
- [ ] Connect to approval workflows
- [ ] Add real-time updates (via WebSocket or polling)

**Files to modify**:
- `wise2-command-center/src/app/` (page components)
- `wise2-command-center/src/lib/api.ts` (API client)

**Estimated effort**: 3-5 days

**Success criteria**:
- Dashboard displays live business data
- User can create leads, estimates, jobs
- Approval workflow visible and actionable

---

### Phase 8 - Testing & Security
**Goal**: Comprehensive test coverage and security validation

**Test Categories**:
- [ ] **Tenant isolation tests** - Verify Tenant A cannot read Tenant B
- [ ] **Approval safety tests** - Unapproved/expired/modified approvals fail
- [ ] **Webhook tests** - Payment webhook idempotency, replay protection
- [ ] **Authorization tests** - Role-based access control enforced
- [ ] **Workflow tests** - Retries, failures, event ordering
- [ ] **Integration tests** - Full flow from payment to active tenant

**Security checks**:
- [ ] Secrets not exposed in logs or responses
- [ ] Database queries scoped by businessId
- [ ] User must be TenantMembership to access tenant
- [ ] Rates limited on sensitive endpoints
- [ ] CSRF protection on state-changing operations

**Files to create**:
- `services/api/src/__tests__/tenant-isolation.test.ts`
- `services/api/src/__tests__/approval-safety.test.ts`
- `services/api/src/__tests__/webhooks.test.ts`

**Estimated effort**: 2-3 days

**Success criteria**:
- Test suite passes
- Tenant isolation verified
- No secrets in logs

---

### Phase 9 - Production Readiness
**Goal**: Documentation, deployment, monitoring

**Tasks**:
- [ ] Write deployment guide
- [ ] Create runbooks for common issues
- [ ] Set up monitoring/alerting for provisioning failures
- [ ] Create tenant offboarding workflow
- [ ] Document API for third-party integrations
- [ ] Create SDK or client library

**Files to create**:
- `DEPLOYMENT.md`
- `OPERATIONS.md`
- `API_DOCUMENTATION.md`

**Estimated effort**: 1-2 days

---

## Implementation Strategy

### Work Execution Order

1. **Complete Phase 1A** (Provisioning engine) - This is the blocking dependency
2. **In parallel**: Phase 1B (Templates) while provisioning steps work
3. **After 1A+1B complete**: Phase 2 (Discord commands)
4. **Continue in parallel**: Phases 3, 4, 5 (Hermes, Approvals, Workflows)
5. **Final**: Phase 6-9 (Frontend, Testing, Production)

### Git Workflow

- Branch: `claude/wise2-command-center-hhf2rq`
- Commit after each phase completion
- Create PR when ready for review

### Testing Strategy

- Test each provisioning step in isolation
- Test full provisioning flow with demo tenant
- Test tenant isolation with pytest/jest
- Test Discord commands manually, then script tests

---

## Success Criteria (MVP)

✅ **End-to-end payment → active tenant flow works**
✅ **Discord commands operational for basic CRM/Pipeline/Dispatch**
✅ **Approval workflow prevents external side effects without approval**
✅ **Tenant isolation verified**
✅ **Demo Get Down Pressure Washing tenant fully functional**
✅ **Hermes responds with tenant-specific insights**
✅ **Workflows execute and retry safely**
✅ **All tests pass**

---

## Risk & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Provisioning step failure | Medium | HIGH | Comprehensive error handling, audit logs, retry logic |
| Tenant isolation breach | Low | CRITICAL | Exhaustive testing, code review, database constraints |
| Discord command rate limits | Low | MEDIUM | Batch requests, caching, rate-limit handling |
| Hermes integration fails | Medium | MEDIUM | Fallback to Hermes API, graceful degradation |
| Webhook replay attacks | Low | MEDIUM | Idempotency keys, event deduplication |

---

## Timeline Estimate

| Phase | Effort | Timeline |
|-------|--------|----------|
| 0 - Audit | 1 day | ✅ DONE |
| 1A - Provisioning | 2-3 days | Week 1 |
| 1B - Templates | 1-2 days | Week 1 |
| 2 - Discord Commands | 2-3 days | Week 2 |
| 3 - Hermes | 1 day | Week 2 |
| 4 - Approvals | 1-2 days | Week 2 |
| 5 - Workflows | 2-3 days | Week 3 |
| 6 - API (validation) | 1-2 days | Week 3 |
| 7 - Frontend | 3-5 days | Week 3-4 |
| 8 - Testing | 2-3 days | Week 4 |
| 9 - Production | 1-2 days | Week 4 |
| **Total** | **18-27 days** | **~4 weeks** |

---

## Next Steps

1. **Start Phase 1A** - Implement provisioning step handlers
2. **Create test tenant** - Verify provisioning flow works end-to-end
3. **Build Discord commands** - Start with `/dashboard` and `/leads`
4. **Wire Hermes** - Connect AI to tenant context
5. **Test tenant isolation** - Write comprehensive security tests
6. **Document & deploy** - Production readiness

---

**Ready to start Phase 1A: Provisioning Engine Implementation**
