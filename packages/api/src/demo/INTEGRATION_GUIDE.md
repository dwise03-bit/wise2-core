# WISE² LIVE Integration Guide

## Overview

This guide shows how to integrate WISE² LIVE auto-provisioning into the tenant creation workflow.

## Architecture

```
Tenant Creation Event
    ↓
[Existing Provisioning System]
    ├─ CREATE_TENANT
    ├─ CREATE_MEMBERSHIP
    ├─ INITIALIZE_DATABASE
    └─ ...
    ↓
[NEW] DEMO_PROVISIONING  ← Add this step
    ├─ Create DemoEnvironment
    ├─ Create default scenarios
    ├─ Create default tours
    └─ Seed demo data
    ↓
[Existing Provisioning System continues]
    ├─ LOAD_TEMPLATE
    ├─ CREATE_PIPELINE
    └─ ...
```

## Where to Hook In

### 1. ProvisioningRun Step Addition

In `packages/db/prisma/schema.prisma`, add to `enum ProvisioningStep`:

```prisma
enum ProvisioningStep {
  CREATE_TENANT
  CREATE_MEMBERSHIP
  INITIALIZE_DATABASE
  DEMO_PROVISIONING          // ← NEW: Provision WISE² LIVE
  LOAD_TEMPLATE
  CREATE_PIPELINE
  CREATE_WORKFLOWS
  INITIALIZE_HERMES
  PROVISION_DISCORD
  START_ONBOARDING
  ACTIVATE
}
```

(Already done in this implementation.)

### 2. Provisioning Service Integration

Find wherever `ProvisioningRun` is orchestrated. This is typically in:
- `packages/api/src/revenue-os/tenant/`
- Or a central `ProvisioningService`

Add a call to `DemoProvisioningService`:

```typescript
// During provisioning workflow, when DEMO_PROVISIONING step is reached:

if (provisioningRun.currentStep === ProvisioningStep.DEMO_PROVISIONING) {
  try {
    const demoEnv = await this.demoProvisioning.provisionDemoEnvironment(tenantId);
    
    provisioningRun.completedSteps.push(ProvisioningStep.DEMO_PROVISIONING);
    provisioningRun.currentStep = ProvisioningStep.LOAD_TEMPLATE;
    
    this.logger.log(`Demo provisioning complete for ${tenantId}`);
  } catch (error) {
    provisioningRun.status = ProvisioningStatus.FAILED;
    provisioningRun.lastError = error.message;
    provisioningRun.lastErrorStep = ProvisioningStep.DEMO_PROVISIONING;
    throw error;
  }
}
```

### 3. Module Import

The `DemoModule` is already imported in `app.module.ts`.

### 4. Inject DemoProvisioningService

In any provisioning orchestrator, inject the service:

```typescript
constructor(
  // ... other deps
  private demoProvisioning: DemoProvisioningService,
) {}
```

## Tenant Creation Paths to Support

Update ALL these paths to call demo provisioning:

### Path 1: Stripe Checkout → New Customer
```
Customer → Stripe Checkout
    ↓
Webhook: charge.succeeded
    ↓
Create Tenant
    ↓
Run ProvisioningRun [includes DEMO_PROVISIONING]
    ↓
Tenant ready
```

### Path 2: Manual Admin Creation
```
Admin → Create Tenant Form
    ↓
POST /api/admin/tenants
    ↓
Create Tenant
    ↓
Run ProvisioningRun [includes DEMO_PROVISIONING]
    ↓
Tenant ready
```

### Path 3: Salesperson Creation
```
Salesperson → Generate Demo
    ↓
POST /api/admin/demo/provision/:tenantId
    ↓
DemoProvisioningService.provisionDemoEnvironment()
    ↓
Demo environment ready
```

### Path 4: API Creation
```
Partner API → POST /api/tenants
    ↓
Create Tenant
    ↓
Run ProvisioningRun [includes DEMO_PROVISIONING]
    ↓
Tenant ready
```

### Path 5: Onboarding Flow
```
Website → Start Free Trial
    ↓
Create Tenant (trial mode)
    ↓
Run ProvisioningRun [includes DEMO_PROVISIONING]
    ↓
Send demo link to prospect
```

## Existing Tenant Backfill

To provision demo for existing tenants that don't have one:

```bash
# Dry run (shows what would happen)
curl -X POST http://localhost:3000/api/admin/demo/backfill \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true, "limit": 100}'

# Run (actually provisions)
curl -X POST http://localhost:3000/api/admin/demo/backfill \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false, "limit": 100}'
```

## Feature Flags (Optional)

Add to your feature flag system:

```typescript
WISE2_LIVE_ENABLED = true          // Enable/disable all WISE² LIVE features
WISE2_LIVE_AUTO_PROVISION = true   // Auto-provision on tenant creation
WISE2_LIVE_TOURS_ENABLED = true    // Enable guided tours
WISE2_LIVE_AI_ENABLED = true       // Enable AI assistant in demo
```

## API Endpoints (Summary)

### Public Endpoints
```
GET    /api/demo/status/:tenantId
POST   /api/demo/session
GET    /api/demo/session/:token
POST   /api/demo/session/:id/action
POST   /api/demo/session/:id/conversion-intent
GET    /api/demo/scenarios/:demoEnvironmentId
GET    /api/demo/safety/:tenantId
POST   /api/demo/reset/:demoEnvironmentId
```

### Admin Endpoints
```
POST   /api/admin/demo/provision/:tenantId
GET    /api/admin/demo/:tenantId
GET    /api/admin/demo/analytics/:demoEnvironmentId
GET    /api/admin/demo/sessions/:demoEnvironmentId
POST   /api/admin/demo/backfill
POST   /api/admin/demo/cleanup-sessions
```

## Testing Integration

### Unit Tests
```bash
pnpm test:demo:provisioning
pnpm test:demo:isolation
pnpm test:demo:safety
```

### E2E Test: Full Demo Workflow
```bash
pnpm test:e2e:demo:workflow

# Should verify:
# 1. Tenant created → demo auto-provisioned
# 2. Salesperson can access demo
# 3. Customer can visit demo URL
# 4. Demo session tracked
# 5. Engagement scored
# 6. Conversion intent recorded
# 7. Demo reset works
# 8. Demo-to-live promotion works
```

## Next Steps

After integrating WISE² LIVE into provisioning:

1. **Phase 3**: Create demo UI routes
2. **Phase 4**: Implement demo scenarios + events
3. **Phase 5**: Integrate with AI (WISE² IMP)
4. **Phase 6**: Build guided tour engine
5. **Phase 7**: Create sales admin dashboard
6. **Phase 8**: Implement demo-to-live promotion
7. **Phase 9**: Full E2E testing

## Troubleshooting

### Demo Environment Not Created
```
Check: Is DEMO_PROVISIONING step being called?
Check: Are migrations applied (DemoEnvironment table exists)?
Check: Is DemoModule properly imported in AppModule?
```

### Demo Records Showing in Production Reports
```
Check: Are all queries filtering out isDemo: true records?
Check: Are revenue/analytics queries using findDemoRecords() properly?
Check: Are SafetyEvent records tracking this issue?
```

### Real SMS/Email Escaping Demo
```
Check: Is CommunicationMode.SIMULATED being enforced?
Check: Is SMS provider checking verifySMSSafe() first?
Check: Is email provider checking verifyEmailSafe() first?
Check: Are blocked calls being logged?
```

### Real Stripe Charges in Demo
```
CRITICAL: This should never happen.
Check: Is DemoSafetyService.verifyPaymentSafe() being called?
Check: Is PaymentMode.SIMULATED being enforced?
Check: Are Stripe webhooks filtering demo payments?
```

## Production Checklist

Before WISE² LIVE goes to production:

- [ ] Schema migrations applied
- [ ] DemoModule tests passing (100% provider safety)
- [ ] Database isolation tests passing
- [ ] Provisioning integration tests passing
- [ ] Demo URL routing works
- [ ] Admin dashboard functional
- [ ] Stripe promotion workflow tested
- [ ] Email/SMS not escaping demo
- [ ] Payments not being charged
- [ ] Analytics properly filtered
- [ ] Backfill script tested
- [ ] Monitoring/alerts setup
- [ ] Documentation updated
- [ ] Load testing passed
- [ ] Security audit passed
