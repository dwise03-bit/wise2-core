# WISE² Commerce Core V1 — Implementation Contract
Status: DEVELOPMENT / NOT DEPLOYED
Owner: WISE2 LLC
Branch: feature/enterprise-commerce-core-v1

## Scope
Shared infrastructure with strict entity segregation for WISE2 LLC and Wise Defense LLC. This is a technical specification, not an authorization to sell regulated products.

## Required modules
1. Entities + RBAC: every record carries entity_id; deny cross-entity reads/writes by default; merchant credentials isolated.
2. Catalog: immutable SKU; versioned prices; lifecycle DRAFT -> APPROVED -> ACTIVE -> RETIRED. Wise Defense regulated classifications default COMPLIANCE_HOLD.
3. CRM: lead -> qualified -> quoted -> contracted; capture consent, attribution and ownership.
4. Orders: DRAFT -> QUOTED -> CONTRACTED -> PAYMENT_PENDING -> PAYMENT_CONFIRMED -> ALLOCATED -> FULFILLING -> QA_PASSED -> DELIVERED -> ACCEPTED -> CLOSED.
5. Payments: verify Stripe/PayPal event authenticity; unique(provider_account,event_id); transactionally append event, update order and write outbox. Never fulfill from redirect.
6. Inventory: on_hand, reserved, on_order; atomic reservation guarded by available >= quantity; immutable movements and serial tracking.
7. Procurement: requisition -> budget approval -> supplier verification -> PO -> receipt -> three-way match -> payment approval.
8. Fulfillment: digital release QA, backup, rollback and customer acceptance; physical pick/pack/scan/shipping/returns.
9. Observability: correlation IDs, failure queues, audit trail, daily payment reconciliation, alert ownership.

## Production hardening prerequisites
- Disable TypeORM synchronize in production; write reversible migrations and backup before applying.
- Remove development secrets; rotate secrets; enforce MFA for privileged roles and HTTPS.
- Resolve dashboard access issue and independently verify external health.
- Confirm current Stripe/PayPal merchant account ownership and webhook endpoints.
- Obtain signed legal-entity authorization, supplier agreements and product compliance classifications.

## Initial proposed SKUs
W2-BOS-SUB-GROW-0001-R1 | WISE2 LLC | digital subscription
W2-AIW-SVC-RECP-0001-R1 | WISE2 LLC | provisioned service
W2-CLD-SUB-HOST-0001-R1 | WISE2 LLC | managed hosting
WD-APP-PHY-TSHT-0001-R1 | Wise Defense LLC | apparel
WD-DTF-PHY-TRAN-0001-R1 | Wise Defense LLC | made to order
WD-TRN-SVC-CLAS-0001-R1 | Wise Defense LLC | scheduled training

## Acceptance tests
- Cross-entity access rejected (API, SQL policy and worker).
- Duplicate or forged payment events cannot duplicate allocation.
- Payment amount mismatch holds order.
- Two concurrent reservations cannot oversell.
- Unapproved catalog/compliance items cannot be checked out.
- Failed fulfillment retries safely without duplicate shipments.
- Refund and dispute transitions reconcile to ledger.
- Production deployment has rollback, monitoring, and independent smoke-test evidence.

## Release gates
AUDIT -> IMPLEMENT -> TEST -> INDEPENDENT VERIFY -> OWNER APPROVAL -> DEPLOY.
No production deployment, financing, purchases, or payment-provider changes authorized by this document.
