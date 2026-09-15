# WISE² API Ownership

## Canonical runtime
- `packages/api` (`@wise2/api`) is the authoritative WISE² HTTP/API boundary.
- `packages/db/prisma/schema.prisma` is the canonical relational schema.
- New cross-product API work, including Consultant Audit OS, belongs in `packages/api`.

## Legacy runtime
- `services/api` is the legacy Express API and is named `@wise2/legacy-express-api` to prevent workspace ambiguity.
- Do not add new platform features here.
- Existing routes remain in place until each runtime/deployment consumer is identified and migrated with tests.

## Operator UI
- `apps/dashboard` is the primary WISE² operator UI unless a product-specific spec states otherwise.

## Migration rule
Before removing any legacy route: identify callers, port behavior to the canonical API, add tests, update deployment references, verify production health, then archive the old route.
