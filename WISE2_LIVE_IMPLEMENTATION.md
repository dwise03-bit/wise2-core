# WISE² LIVE Implementation Strategy

**Project**: WISE² LIVE™ - Universal Customer Demo Engine  
**Status**: IN PROGRESS  
**Date**: 2026-08-18  
**Owner**: Lead Software Architect

---

## Overview

WISE² LIVE™ is an integrated per-tenant demo system that automatically provisions a personalized, interactive demonstration of how WISE² would operate each customer's business.

**Key Principle**: Every tenant automatically receives a demo environment that demonstrates real business logic with simulated external providers.

---

## Architecture Foundation (Existing)

### ✅ Already in Place
- **Multi-tenancy**: Tenant model + TenantService + TenantMembership
- **Database**: PostgreSQL + Prisma ORM
- **Provisioning**: ProvisioningRun system with step tracking
- **Demo Mode Flag**: `Tenant.demoMode` boolean field
- **Revenue OS**: Leads, automations, workflows infrastructure
- **Authentication**: TypeORM for auth + Prisma for data

### ❌ To Build
- Demo environment models (scenarios, sessions, events)
- Demo data factory
- Demo safety layers (communication, payment)
- Demo-to-live promotion workflow
- Demo UI routes and components
- Demo scenario engine
- Demo analytics/sales intelligence
- AI integration (WISE² IMP)
- Guided tour engine

---

## Implementation Phases

### Phase 1: Database Schema Extensions (TODAY)
1. Add demo-specific models
2. Extend existing models with demo support
3. Create migrations
4. Add indexes and relationships

**New Models**:
- `DemoEnvironment` - Per-tenant demo container
- `DemoScenario` - Scenario definitions (NEW_LEAD, MISSED_CALL, etc)
- `DemoSession` - Per-visitor session tracking
- `DemoEvent` - Event log (lead.created, estimate.sent, etc)
- `DemoTour` - Guided tour definitions
- `DemoTourProgress` - Tour progress per session
- `DemoConversion` - Conversion tracking
- `DemoCustomer` - Demo-specific customer records (or use isDemo flag)

### Phase 2: Provisioning Service (TOMORROW)
1. Create `DemoProvisioningService`
2. Integrate with existing `ProvisioningRun`
3. Add DEMO_PROVISIONING step
4. Implement idempotent provisioning
5. Create demo data seed factory

### Phase 3: Demo Safety Layers
1. `CommunicationMode` enum + enforcement
2. `PaymentMode` enum + Stripe blocking
3. Database isolation tests
4. Provider safety tests

### Phase 4: Demo Scenarios Engine
1. Scenario definitions (JSON or code)
2. Scenario executor
3. Event generation
4. Demo data generator

### Phase 5: Frontend Routes & UI
1. `/demo/[tenantSlug]` entry screen
2. `/demo/[tenantSlug]/customer` - Customer mode
3. `/demo/[tenantSlug]/owner` - Owner mode
4. `/demo/[tenantSlug]/automation` - Watch WISE² work
5. `/demo/[tenantSlug]/ai` - Ask AI assistant

### Phase 6: Guided Tour Engine
1. Tour step definitions
2. Tour progress tracking
3. Element highlighting
4. Navigation flow

### Phase 7: Sales Integration
1. Sales admin panel
2. Demo analytics/scoring
3. Sales CRM integration
4. Lead follow-up workflow

### Phase 8: Demo-to-Live Promotion
1. Promotion workflow
2. Stripe payment hook
3. Data preservation
4. Provider activation

### Phase 9: Testing & Validation
1. Unit tests
2. Integration tests
3. E2E demo workflows
4. Database isolation verification
5. Provider safety verification

---

## Technical Decisions

### Database Isolation Strategy
- Use `tenantId` on every demo model
- Use `isDemo` flag on operational models (Lead, Customer, etc)
- Queries default to filtering out demo data
- Create separate `findDemoRecords()` methods where needed

### Demo Data Marking
```typescript
interface WithDemoFlag {
  isDemo: boolean;
}
```
Every operational record created in demo mode gets `isDemo: true`.

### Provider Blocking Strategy
```typescript
enum CommunicationMode {
  SIMULATED,    // No external calls
  SANDBOX,      // Twilio test credentials
  LIVE          // Real SMS/email
}

enum PaymentMode {
  SIMULATED,    // No Stripe calls
  STRIPE_TEST,  // Stripe test keys
  STRIPE_LIVE   // Real charges
}
```

### Demo Session Architecture
```typescript
DemoSession {
  id: string;
  tenantId: string;
  prospectEmail?: string;
  sessionToken: string;
  selectedScenario: string;
  stepsCompleted: number;
  engagement_score: number;
  source: string;
  startedAt: DateTime;
  completedAt?: DateTime;
  conversionIntent: boolean;
}
```

---

## Implementation Checklist

### Phase 1: Schema
- [ ] Create demo models in Prisma
- [ ] Add migrations
- [ ] Test schema compilation

### Phase 2: Provisioning
- [ ] Create DemoProvisioningService
- [ ] Integrate with ProvisioningRun
- [ ] Create demo data factory
- [ ] Test idempotency

### Phase 3: Safety Layers
- [ ] Implement CommunicationMode
- [ ] Implement PaymentMode
- [ ] Add provider guards
- [ ] Create isolation tests

### Phase 4: Scenarios
- [ ] Define scenario engine
- [ ] Create 5 core scenarios
- [ ] Build event generator
- [ ] Test scenario execution

### Phase 5: Frontend
- [ ] Create demo entry routes
- [ ] Build 4 experience modes
- [ ] Integrate with existing UI system
- [ ] Mobile responsive

### Phase 6: Tours
- [ ] Tour engine
- [ ] Default "Lead to Money" tour
- [ ] Step highlighting
- [ ] Progress tracking

### Phase 7: Analytics
- [ ] Demo session tracking
- [ ] Engagement scoring
- [ ] Sales CRM integration
- [ ] Admin dashboard

### Phase 8: Promotion
- [ ] Promotion service
- [ ] Stripe webhook handler
- [ ] Data preservation
- [ ] Live activation

### Phase 9: Testing
- [ ] Unit tests (60%+ coverage)
- [ ] Integration tests
- [ ] E2E scenarios
- [ ] Isolation verification

---

## File Structure (to create)

```
packages/api/src/
├── demo/                          # WISE² LIVE core
│   ├── demo.module.ts
│   ├── services/
│   │   ├── demo-provisioning.service.ts
│   │   ├── demo-scenario.service.ts
│   │   ├── demo-session.service.ts
│   │   ├── demo-safety.service.ts
│   │   └── demo-data-factory.service.ts
│   ├── controllers/
│   │   ├── demo.controller.ts
│   │   └── demo-admin.controller.ts
│   ├── guards/
│   │   ├── demo-isolation.guard.ts
│   │   └── demo-provider.guard.ts
│   ├── constants/
│   │   ├── scenarios.ts
│   │   └── industry-templates.ts
│   └── __tests__/
│       ├── demo-isolation.spec.ts
│       ├── demo-safety.spec.ts
│       └── demo-provisioning.spec.ts

apps/dashboard/
├── app/
│   ├── demo/
│   │   ├── [tenantSlug]/
│   │   │   ├── page.tsx             (entry screen)
│   │   │   ├── customer/
│   │   │   ├── owner/
│   │   │   ├── automation/
│   │   │   └── ai/
│   │   └── admin/
│   │       ├── page.tsx             (admin dashboard)
│   │       └── [tenantId]/
│   └── admin/
│       └── demos/                   (admin panel)
└── components/
    └── demo/
        ├── DemoEntry.tsx
        ├── DemoCustomerMode.tsx
        ├── DemoOwnerMode.tsx
        ├── DemoAutomationMode.tsx
        ├── DemoAIMode.tsx
        ├── TourEngine.tsx
        └── DemoScenarioRunner.tsx
```

---

## Success Criteria

✅ Every new tenant automatically gets a demo environment  
✅ Existing tenants can be backfilled  
✅ Customer website integrations create demo records  
✅ Demo records never leak to production analytics  
✅ SMS/email/payments cannot escape demo mode  
✅ Reset demo works transactionally  
✅ Stripe promotion converts demo to production  
✅ Sales team can track demo engagement  
✅ Mobile experience is responsive  
✅ All tests pass  
✅ Production build succeeds  

---

## Risk Mitigation

**Risk**: Demo data contaminates production reporting  
**Mitigation**: `isDemo` flag on all records + queries filter by default

**Risk**: Demo SMS actually sends  
**Mitigation**: CommunicationMode enum blocks at provider level + tests verify

**Risk**: Demo payment becomes real charge  
**Mitigation**: PaymentMode enum + Stripe test-only enforcement + tests verify

**Risk**: Tenant A sees Tenant B's demo  
**Mitigation**: TenantId isolation + database-level foreign keys + isolation tests

**Risk**: Promotion workflow loses customer data  
**Mitigation**: Transaction-based migration + validation tests + audit logging

---

## Next Steps

1. **NOW**: Extend Prisma schema with demo models
2. **Hour 2**: Create migrations and validate schema
3. **Hour 3-4**: Build DemoProvisioningService
4. **Hour 5-6**: Implement demo safety layers + guards
5. **Hour 7-8**: Create demo scenario engine
6. **Hour 9-10**: Build frontend routes
7. **Hour 11-12**: Integrate AI and tours
8. **Hour 13-14**: Create tests
9. **Hour 15-16**: End-to-end validation
10. **Final**: Production readiness audit

---

**This document is the source of truth for WISE² LIVE implementation.**  
**Update it as architecture decisions evolve.**
