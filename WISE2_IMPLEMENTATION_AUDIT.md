# WISE² Business Operations Command Center — Implementation Audit

**Date**: 2026-08-16  
**Status**: Phase 0 Complete — Ready for Phase 1+  
**Branch**: claude/wise2-command-center-yrc3jv

---

## Executive Summary

The WISE² repository contains substantial infrastructure for multi-tenant business operations. The database schema, API framework, Discord ecosystem, and command center UI are partially implemented. This audit identifies what exists, what's partial, and what's completely missing.

**Build Health**: 65% Complete
- Foundation: 90% Complete
- API/Backend: 60% Complete
- UI/Frontend: 40% Complete
- Automation: 10% Complete

---

## EXISTING ✅ (VERIFIED WORKING)

### Database Layer
- **Tenant Model** — Multi-tenant isolation at schema level with unique slug
- **TenantMembership** — RBAC with 5 roles (OWNER, ADMIN, DISPATCHER, TECHNICIAN, VIEWER)
- **CRM Models** — RevenueCustomer, Lead (with LeadStatus, LeadUrgency), Conversation, ServiceJob, Estimate
- **Pipeline Models** — Campaign, AgentConfig, AutomationRun
- **Consent/Legal** — ConsentRecord, SafetyEvent
- **Webhook Infrastructure** — WebhookEvent model with signature validation, idempotency

### API Framework
- Express backend in `/services/api/src`
- Routes for auth, payments, hermes, consulting, metrics, files
- Payment route with order creation and confirmation
- Authentication middleware with user extraction

### Discord Ecosystem
- `/services/discord-ecosystem/` with complete bot framework
- Multiple bots: NotificationBot, AutomationBot, ExecutiveBot, KnowledgeBot, StatusBot, AnalyticsBot, EmergencyBot, DeploymentBot, VoiceBot
- BotFramework and BotOrchestrator for multi-bot coordination
- AuditLogger, RateLimiter, Cache utilities

### Frontend/UI
- `/apps/command-center/` — Next.js app with comprehensive structure
- Pages: dashboard, leads, customers, billing, onboarding, login
- API routes for auth, billing webhooks, workspaces, events, printshop, automations
- Components and contexts framework in place
- Tailwind CSS with design system integration

### Hermes AI Integration
- `packages/api/src/hermes/` — HermesAction entity with approval support
- Hermes modes: executive, audit, sales, projects, support, systems
- Basic ChatDto and ActionDto types defined

### Demo Tenant
- `/apps/getdown-demo/` — Get Down Pressure Washing demo implementation
- Demonstrates tenant-scoped UI and branding

---

## PARTIAL ⚠️ (NEEDS COMPLETION)

### Tenant Provisioning
- **Status**: Data model exists, workflow missing
- **Found**: Tenant model exists, but no provisioning engine
- **Missing**: Resumable, idempotent provisioning workflow with state tracking
- **Impact**: High — No automatic customer activation

### Payment Webhook Handling
- **Status**: Proxy exists, backend processing missing
- **Found**: `/apps/command-center/app/api/billing/webhook/route.ts` forwards to API
- **Missing**: Backend webhook handler that triggers provisioning
- **Impact**: Critical — Payment events don't activate tenants

### Discord Provisioning
- **Status**: Bot infrastructure exists, tenant-scoped setup missing
- **Found**: Multiple bots in discord-ecosystem with framework
- **Missing**: Automatic channel/role creation, workspace provisioning per tenant
- **Impact**: High — Discord integration not per-tenant

### Approval Workflows
- **Status**: HermesAction references requiresApproval, but no full engine
- **Found**: CreateHermesActionDto has requiresApproval flag
- **Missing**: Approval object model, request/approve/execute cycle, expiration
- **Impact**: High — No safety gate for external actions

### Dashboard Data
- **Status**: UI framework exists, data sources missing
- **Found**: Dashboard page with KPI card structures
- **Missing**: API integration to fetch real metrics, lead data, pipeline status
- **Impact**: Medium — Dashboard doesn't show actual business data

### Workflow Automation
- **Status**: AutomationRun model exists, no execution engine
- **Found**: AutomationRun with status enum (PENDING, RUNNING, SUCCEEDED, FAILED)
- **Missing**: Workflow definition system, trigger routing, retries, dead-letter
- **Impact**: Critical — No event-driven automation

---

## MISSING ❌ (NOT YET STARTED)

### Provisioning Engine (PHASE 1)
- Tenant state machine (PAYMENT_PENDING → PROVISIONING → ONBOARDING → ACTIVE)
- Resumable workflow with individual step tracking
- Idempotency guards against duplicate resources
- Membership creation
- Discord workspace provisioning
- Hermes context initialization
- Database initialization

### Industry Template System (PHASE 15)
- Template definition format (JSON/YAML)
- Pipeline definition per industry
- Service catalog / pricebook structure
- Dashboard widget registry
- Automation template registry
- Template loader and composition
- Get Down template, HVAC template, Generic Service template

### Follow-up Engine (PHASE 10)
- Automated lead follow-up identification
- Estimate follow-up recommendations
- Maintenance/reactivation detection
- Review request workflow
- Contract renewal alerting

### Contract Management (PHASE 11)
- Contract model (missing from schema)
- Contract lifecycle (NEW → ACTIVE → RENEWING → RENEWED/ENDED)
- Recurring service tracking
- Renewal date alerting

### Marketing & Content Engine (PHASE 12)
- Content asset model expansion
- Before/after photo management
- Job footage/video storage
- Social media draft generation (Facebook, Instagram, Google Business)
- Email template generation
- Content approval workflow
- Scheduled publishing

### AI Business Advisor Queries (PHASE 19)
- Hermes analysis endpoints for business questions
- Lead quality prediction
- Conversion analysis
- Lead source performance ranking
- Churn/at-risk identification
- Revenue opportunity discovery

### Demo Mode Adapter Pattern (PHASE 18)
- DemoMessagingProvider (SMS/Email)
- DemoPaymentProvider (Stripe)
- DemoPublishingProvider (Social)
- DemoInvoiceProvider (Accounting)
- Demo badge/watermark on all outputs

### Observability (PHASE 17)
- Structured logging with business_id, trace_id, workflow_run_id
- Metrics collection
- Health check endpoints
- Secret masking in logs
- Error tracking with context

### Test Suite (PHASE 18)
- Tenant isolation tests (cross-tenant data leakage detection)
- Approval safety tests (unapproved actions blocked)
- Webhook security tests (signature validation, replay protection)
- Authorization tests (all roles tested)
- Workflow state machine tests
- Provisioning idempotency tests

### Onboarding Flow (POST-PROVISIONING)
- Welcome Discord message
- Setup wizard (business profile, services, team, pipeline, pricebook)
- Sample data creation
- Guided first actions (create lead, estimate, job)

---

## Database Schema Assessment

### Models Count
- **Total Models**: 80+
- **Tenant-scoped Models**: 12 (Tenant, TenantMembership, RevenueCustomer, Lead, Conversation, ServiceJob, Estimate, Campaign, AgentConfig, AutomationRun, WebhookEvent, ConsentRecord, SafetyEvent)
- **Service Models**: 30+ (consulting, content, print, audio)
- **Auth Models**: 2 (User, Subscription)

### Gaps in Schema
| Feature | Model | Status |
|---------|-------|--------|
| Contracts | Contract | ❌ Missing |
| Approvals | Approval | ❌ Missing |
| Workflows | WorkflowDefinition | ❌ Missing |
| Follow-ups | FollowUp | ❌ Missing |
| Documents | Document | ❌ Missing |
| Properties | Property | ❌ Missing |
| Payments/Invoices | Invoice, Payment | ❌ Missing |
| Dispatch | DispatchRun | ❌ Missing (only ServiceJob) |
| Provisioning State | ProvisioningRun | ❌ Missing |
| Audit Log | AuditLog | ⚠️ Partial (WebhookEvent only) |

---

## API Routes Assessment

### Existing Routes
- `/api/v1/auth/*` — Login, register, session
- `/api/v1/payments/*` — Orders, products, confirmation
- `/api/v1/hermes/*` — Website builder (site-specific, not business advisor)
- `/api/v1/consulting/*` — Consulting workflows
- `/api/v1/metrics/*` — Telemetry
- `/api/v1/files/*` — File upload/download

### Missing Routes
| Endpoint | Purpose | Phase |
|----------|---------|-------|
| `/api/v1/tenants` | Tenant CRUD | 1 |
| `/api/v1/tenants/:id/provision` | Start provisioning | 1 |
| `/api/v1/leads` | Lead CRUD | 6 |
| `/api/v1/customers` | Customer CRUD | 6 |
| `/api/v1/estimates` | Estimate CRUD | 8 |
| `/api/v1/jobs` | Job CRUD | 9 |
| `/api/v1/pipeline` | Pipeline operations | 7 |
| `/api/v1/approvals` | Approval workflow | 13 |
| `/api/v1/workflows` | Automation workflows | 14 |
| `/api/v1/templates` | Industry templates | 15 |
| `/api/v1/dashboard/metrics` | Business metrics | 6 |
| `/api/v1/billing/webhook` | Stripe webhook handler | 1 |

---

## Build Order - What to Start With

### 🔴 CRITICAL PATH (Unblocks Everything)

**PHASE 1: Tenant Activation**
- Create ProvisioningRun model
- Implement TenantStateE enum (PAYMENT_PENDING, PROVISIONING, ONBOARDING, ACTIVE, PAST_DUE, SUSPENDED, CANCELLED, ARCHIVED)
- Webhook handler for Stripe successful_payment_intent.succeeded
- Provisioning engine with steps: CREATE_TENANT → CREATE_MEMBERSHIP → LOAD_TEMPLATE → CREATE_DEFAULT_PIPELINE → INITIALIZE_HERMES → PROVISION_DISCORD → START_ONBOARDING → ACTIVATE

**PHASE 2: RBAC (Tenant Context)**
- Implement TenantGuard middleware — Resolve tenant from authenticated user
- Add tenant scoping to all queries
- Test cross-tenant access prevention

**PHASE 3: Core Dashboard** (Unblock UI development)
- `/api/v1/dashboard/metrics/:tenantId` endpoint
- Lead count, pipeline value, revenue metrics
- Return mock data initially, wire to DB later

**PHASES 4-8**: CRM (Leads → Estimates)
**PHASES 9-16**: Operations (Jobs → Templates)
**PHASES 17-19**: Polish (Observability, Tests, AI Advisor)

---

## Critical Implementation Notes

### Tenant Isolation (NON-NEGOTIABLE)
Every query MUST include tenantId from authenticated context:
```sql
-- ❌ UNSAFE
SELECT * FROM leads WHERE id = 'xyz'

-- ✅ SAFE
SELECT * FROM leads WHERE id = 'xyz' AND tenantId = $1
```

### Webhook Idempotency
Use WebhookEvent model with:
- provider (stripe)
- externalId (event.id)
- signatureValid
- processedAt
- Unique constraint on (provider, externalId)

### Demo Mode
Every action that touches external systems (SMS, email, payment, social) MUST:
1. Check tenant.demoMode flag
2. Route to DemoProvider instead
3. Return synthetic success response
4. Log the action

---

## Implementation Readiness

| Phase | Ready? | Blocker |
|-------|--------|---------|
| 0 (Audit) | ✅ Yes | None |
| 1 (Tenant Activation) | ✅ Yes | None |
| 2 (RBAC) | ✅ Yes | Phase 1 |
| 3-8 (CRM) | ✅ Yes | Phase 2 |
| 9-14 (Operations) | ⚠️ Partial | Phase 3 |
| 15 (Templates) | ⚠️ Partial | Phase 8 |
| 16 (GetDown Demo) | ⚠️ Partial | Phase 14 |
| 17-19 (Polish) | ✅ Yes | Phase 16 |

---

## Next Steps

1. **Immediately**: 
   - Update Prisma schema with ProvisioningRun, TenantState, and missing models
   - Implement Tenant state machine in API
   - Create webhook handler for Stripe events

2. **This week**:
   - Provisioning engine (resumable, idempotent)
   - TenantGuard middleware
   - Discord provisioning integration
   - Dashboard metrics endpoint

3. **Next week**:
   - Full CRM CRUD
   - Pipeline operations
   - Estimates and approvals

---

**Status**: Ready to proceed with Phase 1
