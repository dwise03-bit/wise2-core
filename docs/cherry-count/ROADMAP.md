# Cherry Count™ — Implementation Roadmap

## Phase 0 — Discovery ✅

- [x] Repository inspection
- [x] Reuse inventory (Tenant, Auth, CJAYS pattern, AI)
- [x] Gap analysis (no inventory module exists)
- [x] Documentation created

## Phase 1 — Foundation (Current)

- [ ] Prisma models + migration
- [ ] API module (`packages/api/src/cherry-count/`)
- [ ] Tenant guard + bootstrap endpoint
- [ ] App scaffold (`apps/cherry-count/`)
- [ ] Brand tokens + design system CSS
- [ ] Client presentation deck

## Phase 2 — MVP

- [ ] Dashboard with live stats
- [ ] Inventory CRUD + variants
- [ ] Inventory adjustments (audited)
- [ ] Storage locations / containers
- [ ] Pop-up event CRUD
- [ ] Event inventory assignment
- [ ] Packing workflow
- [ ] Sales recording
- [ ] Customer CRM
- [ ] Basic analytics

## Phase 3 — Signature Features

- [ ] QR code generation + scanning
- [ ] Barcode scanning
- [ ] Pop-Up Mode (mobile event UI)
- [ ] Pack Smart container workflow
- [ ] Inventory transfer between locations
- [ ] Event closeout + return inventory
- [ ] Low-stock alerts

## Phase 4 — AI

- [ ] Cherry AI read-only insights
- [ ] Inventory restock suggestions
- [ ] Packing recommendations
- [ ] Event summaries
- [ ] Sales trend analysis
- [ ] Customer demand signals

## Phase 5 — Polish

- [ ] Motion / animations
- [ ] Loading, empty, error states
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Offline capability (where feasible)

## Phase 6 — Client Demo

- [ ] Realistic seeded demo data (Brianna's Boutique story)
- [ ] Demo walkthrough script
- [ ] Onboarding checklist

## Phase 7 — Test

- [ ] Auth + tenant isolation
- [ ] Inventory math correctness
- [ ] Packing workflow E2E
- [ ] Sales calculations
- [ ] QR workflows
- [ ] Responsive layouts
- [ ] AI permissions

## Phase 8 — Deploy

- [ ] Health check endpoint
- [ ] Docker / nginx config
- [ ] Rollback documentation
- [ ] Client handoff package

---

## Deliverable Status Labels

| Label | Meaning |
|-------|---------|
| WORKING | Verified functional |
| PARTIAL | Some functionality, gaps remain |
| MOCKED | UI with demo/fake data |
| PLANNED | Documented, not built |
| BLOCKED | Dependency or decision needed |

---

## Available at Launch vs Coming Next

### Available at Launch (MVP Target)
- Custom branded platform
- Inventory management with variants
- Pop-Up Planner
- Packing Assistant (basic)
- Sales tracking (manual entry)
- Customer CRM
- Basic analytics
- QR system (generate + scan)
- Mobile + desktop experience
- WISE² platform support

### Coming Next
- Square / Shopify payment integrations
- Offline sync
- Barcode hardware scanner support
- Advanced AI pricing recommendations
- Multi-location warehouse management
- Team chat / notifications

### Optional Integrations (Not Promised)
- Square POS API
- Shopify sync
- Stripe payments
- Instagram shopping
