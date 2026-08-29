# WISE² Cloud Architecture Design

## Goal
Launch `cloud.wise2.net` as a WISE²-branded reseller hosting storefront and customer control plane that sells recurring web-hosting plans first and can add VPS resale through a replaceable provider adapter.

## Product Scope
Phase 1 sells WISE² managed web hosting with the locked WISE² Cloud / Piff City presentation. Customers can choose a plan, pay through Stripe, receive an account, and see provisioning status in the WISE² dashboard. Phase 2 adds VPS products behind the same provider interface.

## Architecture
WISE² Core remains the system of record. The existing NestJS API owns catalog, orders, subscriptions, provisioning jobs, and customer-facing status. Stripe owns payment collection. A provider adapter translates WISE² provisioning requests to a reseller backend such as 20i or a WHM/cPanel-compatible provider. PostgreSQL stores durable state; Redis backs queued provisioning work.

Flow:

`Customer -> cloud.wise2.net -> WISE² API -> Stripe Checkout -> Stripe Webhook -> Provisioning Queue -> Provider Adapter -> Hosting Account -> WISE² Dashboard + Welcome Email`

## Frontend
Add a dedicated WISE² Cloud surface under `apps/website` or the current public Next.js site with:

- `/cloud` landing page in the locked WISE² Cloud / Piff City visual system.
- `/cloud/plans` menu-style price sheet.
- `/cloud/checkout` purchase handoff.
- `/cloud/order/[id]` live order/provisioning status.
- `/dashboard/cloud` customer service dashboard.

The UI must preserve the approved black/electric-blue/steel/chrome/white palette, brush/chrome WISE² CLOUD identity, crown/Piff City motifs, glowing modular panels, datacenter imagery, and `HOST. AUTOMATE. PROFIT.` positioning.

## Initial Catalog
Launch with three simple recurring plans to reduce support complexity:

- Starter — $19/month — 1 website, SSL, email, backups.
- Business — $39/month — up to 5 websites, SSL, email, daily backups, monitoring.
- Pro — $59/month — higher limits, priority support, staging/managed features.

Contractor and Managed plans remain visible only after their bundled CRM/automation entitlements are wired to WISE² Core.

## Backend Domain Model
Create a dedicated Cloud module in `packages/api/src/v1/cloud/`.

Entities:

- `CloudProduct`: WISE² SKU, name, billing interval, Stripe price ID, provider product mapping, display metadata, active flag.
- `CloudOrder`: user, product, Stripe checkout/session/subscription IDs, amount, lifecycle state, failure reason.
- `CloudService`: provisioned customer service, provider, external service ID, domain, status, resource metadata.
- `ProvisioningJob`: idempotency key, action, payload, state, retry count, provider response/error.

Order states: `pending_payment`, `paid`, `queued`, `provisioning`, `active`, `failed`, `cancelled`.

## Billing
Reuse the existing Stripe integration and webhook surface rather than creating a second billing stack. Stripe Checkout creates recurring subscriptions. Webhook processing must be idempotent and enqueue provisioning only after confirmed payment. Subscription cancellation or payment failure updates WISE² state and queues provider suspension only after the configured grace policy.

No card data is stored by WISE².

## Provider Adapter
Define a provider-neutral interface:

```ts
interface HostingProvider {
  provision(input: ProvisionInput): Promise<ProvisionResult>;
  suspend(externalId: string): Promise<void>;
  unsuspend(externalId: string): Promise<void>;
  terminate(externalId: string): Promise<void>;
  getStatus(externalId: string): Promise<ProviderStatus>;
}
```

Implement `TwentyIProvider` first if credentials and product mappings are available. If the selected production supplier exposes only WHM/cPanel, implement `WhmProvider` against that API without changing Cloud domain logic.

Secrets live only in environment variables / deployment secret storage. Provider credentials are never exposed to the browser.

## Provisioning and Reliability
Provisioning runs asynchronously through Redis-backed jobs so Stripe webhooks return quickly. Every provisioning action uses an idempotency key derived from the WISE² order/action pair. Jobs retry transient provider failures with bounded exponential backoff and land in a failed state that is visible to admins instead of silently duplicating accounts.

## Customer Experience
After successful payment:

1. Customer sees `Payment received — setting up your WISE² Cloud service`.
2. Provisioning starts automatically.
3. Order page polls or subscribes to WISE² status.
4. When active, the dashboard shows domain, service status, SSL/backups/email status, plan, renewal date, and support action.
5. A branded welcome email is sent only after the provider confirms the account exists.

## Admin Experience
Add Cloud operations to the command center:

- MRR and active-service summary.
- Orders by lifecycle state.
- Failed provisioning jobs with retry action.
- Provider health/status.
- Product/provider mapping management.
- Customer service suspend/unsuspend/terminate actions with confirmation and audit trail.

## Security
- Validate Stripe webhook signatures using raw request bodies.
- Enforce authentication and ownership for all customer Cloud endpoints.
- Require admin role for operational mutations.
- Encrypt or secret-store provider credentials; never persist raw credentials in customer records.
- Log provisioning actions with correlation IDs while redacting secrets.
- Use production database migrations; do not rely on TypeORM auto-sync.

## Deployment
Keep WISE² Cloud control-plane code inside `wise2-core`, but customer hosting workloads remain outside WISE² Core infrastructure. Route `cloud.wise2.net` to the public WISE² web deployment and `/api/v1/cloud/*` to the existing API behind TLS. Provider-hosted customer sites must never share the WISE² Core database, Redis, or application containers.

Required production configuration includes Stripe keys/webhook secret, public Cloud base URL, selected provider credentials, product mappings, mail sender configuration, Redis, PostgreSQL, TLS, and production CORS settings.

## Testing
- Unit tests for product/order state transitions and provider adapters.
- Stripe webhook signature/idempotency tests.
- Provisioning job retry and duplicate-delivery tests.
- API authorization/ownership tests.
- Frontend tests for plan selection, checkout creation, and provisioning status.
- End-to-end test using Stripe test mode plus a fake provider adapter before any real reseller account is touched.
- Production smoke test: health, Stripe test checkout, webhook receipt, fake/test provisioning, dashboard visibility.

## Launch Gate
Do not accept live customer payments until:

- Production provider credentials are configured and a real test account can be created and terminated.
- Stripe live webhook is verified.
- DNS/TLS for `cloud.wise2.net` is healthy.
- Backups and monitoring are confirmed.
- Terms, refund policy, acceptable-use policy, privacy policy, and support contact are published.
- Failure/retry path is exercised without creating duplicate customer accounts.

## Success Criteria
A new customer can select a WISE² Cloud plan, pay once through the approved recurring checkout, receive exactly one provider account automatically, see it become active in the WISE² dashboard, and receive a branded welcome message without manual provisioning.