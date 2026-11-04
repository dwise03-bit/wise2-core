# WISE² Agency Command

Seven-agent, tenant-scoped workflow planning layer. Requires Node 20.10+ with JSON import attributes support (Node 22 recommended).

Run: `node --test packages/agency-command/engine.test.mjs`

This module validates jobs, creates deterministic idempotency keys and enforces tenant and approval checks. It does **not** execute external actions, send emails, charge cards, or call providers. Adapter execution, durable event deduplication, persistence, RBAC, audit logging and staging deployment must be implemented and verified separately.

No API keys belong in Git. Use secret storage and scoped OAuth credentials. Never merge or deploy without tests and approval.
