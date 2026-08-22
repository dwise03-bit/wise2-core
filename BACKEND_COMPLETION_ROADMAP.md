# WISE² Backend Client-Ready Completion — Execution Roadmap

**Target**: Production-ready backend for CC Craft Studio launch  
**Timeline**: Immediate (Phase 1 launch in 1 week)  
**Owner**: Claude Code + dwise  
**Status**: 🔨 IN PROGRESS

---

## PHASE 1: Print Shop & Order Management (CRITICAL - This Week)

### 1.1 Print Products API ✅ Database Models Exist
**Schema**: `PrintProduct`, `PrintProductCategory`, `PrintProductVariant`

**Endpoints to Implement**:
```
POST   /v1/print-shop/products             (admin: create product)
GET    /v1/print-shop/products             (public: list products)
GET    /v1/print-shop/products/:id         (public: get product details)
PATCH  /v1/print-shop/products/:id         (admin: update product)
DELETE /v1/print-shop/products/:id         (admin: delete product)
GET    /v1/print-shop/categories           (public: list categories)
POST   /v1/print-shop/categories           (admin: create category)
```

### 1.2 Print Orders API ✅ Database Models Exist
**Schema**: `PrintOrder`, `PrintOrderItem`, `PrintQuote`

**Endpoints to Implement**:
```
POST   /v1/print-shop/orders               (customer: create order)
GET    /v1/print-shop/orders/:id           (customer/admin: get order)
GET    /v1/print-shop/orders               (admin: list all orders)
PATCH  /v1/print-shop/orders/:id/status    (admin: update order status)
DELETE /v1/print-shop/orders/:id           (admin: delete order)
POST   /v1/print-shop/quotes               (customer: request quote)
GET    /v1/print-shop/quotes/:id           (customer/admin: get quote)
PATCH  /v1/print-shop/quotes/:id/approve   (customer: approve quote)
```

### 1.3 Print Shop Controller & Service
**Location**: `packages/api/src/v1/print-shop/`

**Files to Create**:
- `print-shop.module.ts` — Module registration
- `print-shop.controller.ts` — API endpoints
- `services/print-products.service.ts` — Product management
- `services/print-orders.service.ts` — Order management
- `services/print-quotes.service.ts` — Quote management
- `dto/create-product.dto.ts` — Request validation
- `dto/create-order.dto.ts` — Order validation
- `dto/create-quote.dto.ts` — Quote validation

**Core Logic**:
- Product filtering by category, price, tags
- Order status workflow (PENDING → APPROVED → PRODUCTION → SHIPPED → DELIVERED)
- Quote generation with pricing logic
- Inventory tracking (if needed)
- Order confirmation emails

---

## PHASE 2: Tenant & Workspace Management (This Week)

### 2.1 Tenant API ✅ Database Models Exist
**Schema**: `Tenant`, `TenantMembership`

**Endpoints to Implement**:
```
POST   /v1/tenants                        (admin: create new tenant/workspace)
GET    /v1/tenants/:id                    (tenant admin: get workspace details)
PATCH  /v1/tenants/:id                    (tenant admin: update workspace)
POST   /v1/tenants/:id/members            (tenant admin: invite member)
GET    /v1/tenants/:id/members            (tenant admin: list members)
DELETE /v1/tenants/:id/members/:memberId  (tenant admin: remove member)
```

### 2.2 Tenant Context & Routing
**Implementation**:
- Middleware to extract tenant from subdomain (cc.wise2.net → tenant_cc)
- Middleware to attach tenant context to request
- Tenant isolation in all queries (WHERE tenant_id = req.tenant.id)
- Verify user membership in tenant before allowing access

### 2.3 Controller & Service
**Location**: `packages/api/src/v1/tenants/`

**Files to Create**:
- `tenants.module.ts`
- `tenants.controller.ts`
- `tenants.service.ts`
- `middleware/tenant-context.middleware.ts`
- `dto/create-tenant.dto.ts`

**Core Logic**:
- Tenant provisioning (create Stripe customer, database schema if needed)
- Member invitation and role assignment
- Multi-tenant isolation (verify all queries are scoped to tenant)
- Billing synchronization with tenant

---

## PHASE 3: Customer Portal (This Week)

### 3.1 Order Tracking API
**Endpoints**:
```
GET    /v1/customer/orders                (my orders)
GET    /v1/customer/orders/:id            (order details + status)
GET    /v1/customer/orders/:id/timeline   (order status history)
POST   /v1/customer/orders/:id/approve    (approve proof/design)
```

### 3.2 Design Upload & Proof
**Endpoints**:
```
POST   /v1/customer/designs/upload        (upload design file)
GET    /v1/customer/designs/:designId     (get design details)
POST   /v1/customer/proofs/generate       (request proof/mockup)
GET    /v1/customer/proofs/:proofId       (get proof details)
POST   /v1/customer/proofs/:proofId/approve  (approve proof)
POST   /v1/customer/proofs/:proofId/reject   (reject with feedback)
```

### 3.3 Controller & Service
**Location**: `packages/api/src/v1/customer-portal/`

**Files to Create**:
- `customer-portal.module.ts`
- `customer-portal.controller.ts`
- `services/customer-orders.service.ts`
- `services/customer-proofs.service.ts`

---

## PHASE 4: Admin Dashboard (This Week)

### 4.1 Order Management API
**Endpoints**:
```
GET    /v1/admin/dashboard/orders         (all orders, filterable)
GET    /v1/admin/dashboard/orders/:id     (order details)
PATCH  /v1/admin/dashboard/orders/:id     (update order status)
POST   /v1/admin/dashboard/orders/:id/send-update  (send customer update)
GET    /v1/admin/dashboard/revenue        (revenue metrics)
GET    /v1/admin/dashboard/customers      (customer list + stats)
```

### 4.2 Analytics & Reporting
**Endpoints**:
```
GET    /v1/admin/dashboard/metrics        (KPIs: orders, revenue, customers)
GET    /v1/admin/dashboard/products       (product performance)
GET    /v1/admin/dashboard/trends         (sales trends, popular products)
```

### 4.3 Controller & Service
**Location**: `packages/api/src/v1/admin-dashboard/`

**Files to Create**:
- `admin-dashboard.module.ts`
- `admin-dashboard.controller.ts`
- `services/admin-orders.service.ts`
- `services/admin-analytics.service.ts`

---

## PHASE 5: Automation & Workflows (Next Week)

### 5.1 Email Notifications
**Events to Trigger**:
- Order created → Send confirmation email
- Quote generated → Send quote email to customer
- Quote approved → Send approval to admin
- Order status changed → Send status update to customer
- Order shipped → Send shipping notification

### 5.2 Workflow Automation
**Endpoints**:
```
POST   /v1/workflows/triggers/:event      (trigger workflow)
GET    /v1/workflows/:workflowId/status   (check workflow status)
```

### 5.3 Service
**Location**: `packages/api/src/v1/workflows/`

**Files to Create**:
- `workflows.module.ts`
- `services/workflow.service.ts`
- `services/email-notifications.service.ts`
- `templates/order-confirmation.template.ts`
- `templates/quote-email.template.ts`
- `templates/status-update.template.ts`

---

## PHASE 6: Stripe Integration Testing

### 6.1 Payment Processing
- Verify Stripe checkout endpoint creates payment intent
- Test webhook handling for payment success/failure
- Sync order status with payment status
- Test refund workflow

### 6.2 Endpoint
```
POST   /v1/billing/checkout               (create Stripe session)
POST   /v1/billing/webhook                (handle Stripe events)
```

---

## CRITICAL SETUP: Tenant Middleware & Multi-Tenancy

**Must Be Done First** (Before Phase 2):
```typescript
// packages/api/src/common/middleware/tenant-context.middleware.ts
// Extract tenant from:
// 1. Subdomain: cc.wise2.net → tenant_cc
// 2. Request header: X-Tenant-ID
// 3. JWT user claims: user.tenantId
// 4. Database: lookup user's tenant memberships

// Apply to all v1 routes
// Verify user has access to requested tenant
// Attach tenant context to request: req.tenant = { id, name, ... }
```

---

## TESTING & VERIFICATION GATES

### Unit Tests (Each Service)
- Service initialization
- CRUD operations
- Error handling

### Integration Tests
- End-to-end order flow (create → approve → ship)
- Tenant isolation (can't access other tenant's data)
- Payment processing

### E2E Tests
- Customer: Browse products → Create order → Get quote → Approve
- Admin: View dashboard → Update order status → Send notification
- Multi-tenant: Different tenants see isolated data

---

## DEPLOYMENT CHECKLIST

- [ ] All services created and tested
- [ ] Database migrations applied
- [ ] Tenant middleware in place
- [ ] Stripe keys configured
- [ ] Email service configured
- [ ] API documented
- [ ] Monitoring/logging enabled
- [ ] Error tracking configured
- [ ] Backup strategy tested
- [ ] Security audit passed
- [ ] Performance baseline established

---

## EXPECTED OUTCOMES

✅ **Week 1**: Core APIs ready, CC Craft website launches with working order system  
✅ **Week 2**: Dashboard + automation complete  
✅ **Week 3**: Analytics & growth tools live  
✅ **Week 4**: Full production deployment, ready to onboard next client  

---

**This roadmap is the source of truth for backend completion. Update as features are completed.**
