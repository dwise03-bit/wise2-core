# WISE² Client Readiness Audit

Date: 2026-09-14

## Executive readout

WISE² has a strong product surface and a differentiated WISE COMMAND experience. The highest-value readiness work is now clear: make the public site consistently explain the product, make the conversion path measurable, and move protected operational features behind explicit tenant/auth boundaries before onboarding external clients.

## Completed in this pass

- Added `WISE COMMAND` to the canonical public navigation and Products footer.
- Added page-specific title, description, canonical URL, and Open Graph metadata for `/hermes`.
- Added an app-generated `https://wise2.net/sitemap.xml` route for core public pages.
- Removed the incorrect Blakkhail sitemap declaration from the shared robots file.
- Updated the API tenant guard to recognize the authenticated identity attached by the current JWT middleware.
- Allowed `X-Tenant-ID` through API CORS so tenant-scoped clients can make authorized requests.
- Preserved the existing Hermes command API and cinematic interface.

## Findings

| Area | Finding | Priority | Recommendation |
| --- | --- | --- | --- |
| UX | Hermes is now discoverable from the primary nav, but the public site still has many parallel product routes. | P1 | Use WISE COMMAND as the operating-system hub and link product pages back to it. |
| SEO | The live result is intake-led (“Capture Your Vision”) and the site had a sitemap declaration without an app sitemap route. | P1 | Keep the intake flow as conversion CTA; use `/hermes` as the product-intent landing page. |
| Content | Public pages need audience/use-case proof that is specific enough for search and sales conversations. | P1 | Build a small, high-quality persona set (contractors, agencies, operators) rather than thin location pages. |
| API | Hermes chat behavior exists, but rate limits, audit events, and retention policy must be verified before external access. A legacy tenant middleware still needs migration tests and database adapter cleanup. | P0 | Complete the backend gate below before client data enters the system. |
| Cloudflare MCP | No verified Worker/MCP deployment configuration was found in this repository. | P0 | Create a separate authenticated Worker only after account, domain, OAuth, and secret ownership are confirmed. |
| Operations | Existing health/deployment scripts are present, but client-facing SLO, RPO, RTO, incident owner, and rollback runbook are not consolidated. | P1 | Publish an operational readiness sheet and run a pre-client restore drill. |

## Backend gate before onboarding clients

These inputs are required before choosing a production architecture:

- Read/write ratio and one-year p99 QPS forecast.
- Tenancy model: single-tenant, shared multi-tenant, or isolated multi-tenant.
- Data sensitivity: public, internal, PII, PHI, or PCI.
- SLO and named error-budget owner.
- Target p50/p95/p99 latency, uptime target, RPO, and RTO.

Recommended provisional floor for a first shared SaaS pilot: p50 < 150 ms, p95 < 400 ms, p99 < 600 ms for synchronous command APIs; 99.9% monthly availability; RPO ≤ 15 minutes; RTO ≤ 1 hour. These are planning defaults, not a final commitment.

## Client launch checklist

- [ ] Tenant isolation and authorization tests pass.
- [ ] API rate limiting and request-size limits are enabled.
- [ ] Sensitive logs and prompts have a documented retention policy.
- [ ] Client terms, privacy notice, DPA posture, and subprocessors are reviewed.
- [ ] Billing, onboarding, support, and cancellation flows are tested end to end.
- [ ] Health checks, alert routing, backups, restore drill, and rollback are verified.
- [ ] Analytics events cover nav-to-command, CTA conversion, API errors, and activation.
- [ ] Cloudflare MCP OAuth and secret ownership are confirmed before deployment.

## Next recommended sequence

1. Lock the client/tenant and data-sensitivity decisions.
2. Harden Hermes API access and audit logging.
3. Add analytics and a WISE COMMAND product landing page.
4. Stand up an authenticated Cloudflare MCP Worker in a separate deployable package.
5. Run a controlled pilot with one low-risk client and measure the SLOs above.
