# Cherry Count™ — Architecture

## Layer Model

```
┌─────────────────────────────────────────────────────────┐
│  APPLICATION LAYER — Cherry Count™                      │
│  apps/cherry-count (Next.js, mobile-first UI)           │
│  client-presentation/cherry-count (client deck)         │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  API LAYER — packages/api/src/cherry-count/             │
│  JwtAuthGuard + CherryCountTenantGuard                  │
│  Tenant-scoped queries via Prisma                       │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  WISE² BUSINESS OPERATING SYSTEM                        │
│  ├── Identity (JWT auth, packages/api/src/auth/)        │
│  ├── Organizations (Tenant + TenantMembership)          │
│  ├── RBAC (TenantRole: OWNER, ADMIN, MANAGER, STAFF…)   │
│  ├── AI Gateway (Hermes + packages/ai)                  │
│  ├── Notifications, Audit, Files                        │
│  └── Prisma (packages/db)                               │
└─────────────────────────────────────────────────────────┘
```

---

## Reused WISE² Infrastructure

| Component | Path | Status |
|-----------|------|--------|
| JWT Authentication | `packages/api/src/auth/` | WORKING |
| Tenant + Membership | `packages/db/prisma/schema.prisma` (Tenant) | WORKING |
| Tenant Guard pattern | `packages/api/src/cjays/cjays-tenant.guard.ts` | REUSED (adapted) |
| AI providers | `packages/ai/src/manager.ts` | WORKING |
| Hermes approval flow | `packages/api/src/hermes/` | WORKING |
| Design patterns | `apps/wise-hvac-demo/`, `clients/cc-craft-create/` | REFERENCE |

---

## New Cherry Count Components

| Component | Path | Status |
|-----------|------|--------|
| Cherry Count App | `apps/cherry-count/` | IN PROGRESS |
| Cherry Count API | `packages/api/src/cherry-count/` | IN PROGRESS |
| Prisma models | `packages/db/prisma/schema.prisma` (CherryCount*) | IN PROGRESS |
| Client presentation | `client-presentation/cherry-count/` | IN PROGRESS |
| Brand tokens | `apps/cherry-count/lib/brand-tokens.ts` | IN PROGRESS |

---

## Multi-Tenancy

All Cherry Count business data is scoped by `tenantId`.

**Rules:**
- Never trust `organizationId` / `tenantId` from browser alone
- Resolve tenant from authenticated session + verified `TenantMembership`
- Optional `x-tenant-id` header only honored after membership check
- Every Prisma query includes `where: { tenantId }`

**Roles** (mapped from TenantRole):
- OWNER — full access
- ADMIN — full access except billing
- DISPATCHER → MANAGER — events, inventory, sales
- TECHNICIAN → STAFF — operational tasks
- VIEWER — read-only

---

## API Endpoints (MVP)

```
GET  /v1/cherry-count/bootstrap          — tenant + dashboard summary
GET  /v1/cherry-count/products           — list products
POST /v1/cherry-count/products           — create product
GET  /v1/cherry-count/products/:id       — product detail
PATCH /v1/cherry-count/products/:id      — update product
POST /v1/cherry-count/inventory/adjust     — stock adjustment (audited)
GET  /v1/cherry-count/containers         — bins, racks, totes
POST /v1/cherry-count/containers         — create container
GET  /v1/cherry-count/events             — pop-up events
POST /v1/cherry-count/events             — create event
POST /v1/cherry-count/events/:id/pack    — update packing status
POST /v1/cherry-count/events/:id/close   — close event
GET  /v1/cherry-count/sales              — sales list
POST /v1/cherry-count/sales              — record sale
GET  /v1/cherry-count/customers          — CRM list
POST /v1/cherry-count/customers          — create customer
POST /v1/cherry-count/ai/insights        — read-only AI insights
GET  /v1/cherry-count/health             — health check
```

---

## Security

- JWT bearer auth on all business endpoints
- Server-side RBAC checks per action
- Rate limiting via existing API middleware
- Input validation via DTOs
- Audit log on inventory mutations
- No secrets in client-side code
- AI destructive actions require explicit confirmation

---

## AI Architecture

Cherry AI uses WISE² Intelligence abstraction:
- Provider-agnostic via `packages/ai`
- Hermes for approval on high-impact actions
- MVP: read-only recommendations only
- Tenant boundaries enforced in all AI context assembly

---

## Deployment

- App: `apps/cherry-count` on port 3025 (dev)
- API: existing `packages/api` deployment
- Database: shared PostgreSQL via Prisma
- Health: `GET /v1/cherry-count/health`
