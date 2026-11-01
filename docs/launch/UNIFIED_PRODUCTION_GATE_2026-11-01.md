# WISE² unified launch gate — November 2026

This document is a **non-destructive integration plan**, not evidence of a successful production deployment.

## Verified from GitHub
- Monorepo uses pnpm/turbo with website, dashboard, command-center, admin and studio workspaces.
- Revenue readiness documentation conflicts: REVENUE_MASTER_INDEX.md says ready, while REVENUE_READY_STATUS.md records unresolved owner actions.
- Stripe documentation disagrees on webhook routes: /api/v1/billing/webhook/stripe versus /api/webhooks/stripe.
- Stripe test checklists have unchecked items. Price references also disagree.
- Existing Hermes, billing and Docker assets are present. Their live behavior is **not verified**.

## Canonical ownership
- Identity and tenancy: one authenticated account and organization membership layer.
- Command Center: tasks, assignments, notifications, audit events and approvals.
- Revenue OS: products, checkout, invoices, subscriptions, reconciliation; Stripe remains payment processor.
- Exchange: business profiles, proposals, barter valuation, agreements and fulfillment.
- Business Radar: prospect research, outreach, grants and opportunity pipeline.
- Hardware OS: assets, inventory, vendor orders, manufacturing, QR/NFC.
- Legal & HR: approved agreement templates, document signing, compensation, payroll-provider references.
- Client workspaces: Magnolia, D&D, Little Lizzie, Wise Connections, etc. Keep tenant data and business ownership separate.
- Hermes: intent parsing and orchestration, never unapproved access to money, secrets or other tenants.

## P0 production gates
1. Snapshot DB, record deployed Git SHA, list containers and nginx routes; verify backups and disk capacity.
2. Inspect running NestJS controller routes; configure only the actual Stripe webhook endpoint; verify raw-body signature and replay/idempotency handling.
3. Confirm live keys and price IDs exist by checking presence and prefix only; **never print secrets**.
4. Execute Stripe test-mode checkout and webhook, verify customer/subscription DB records, then separately verify live-mode configuration without charging a customer.
5. Test signup, login, purchase, confirmation, cancellation, email, and tenant isolation.
6. Wire chat-to-task via authenticated API, user resolution, role checks, audit log and return of persisted task ID. No claim that ChatGPT messages already reach Paige.
7. Verify Legal Center templates, signing provider connection, correct logo, and state-reviewed NDA/employment documents.
8. Check monitoring, alerts, backups, rollback, and independent smoke tests.
9. Merge only after review and CI passes; deploy in controlled steps with rollback.

## Operator verification commands (read-only)
```bash
set -e
date -u
df -h
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
docker compose ps 2>/dev/null || true
git status --short
git rev-parse HEAD
sudo nginx -t
```

Do not publish full environment files, API keys, passwords, employee compensation or personal information in issues or logs.

## Release status
- Repository review: PARTIAL
- Integration plan: DRAFT
- CI: NOT RUN
- Production health: NOT VERIFIED
- Stripe live checkout: NOT VERIFIED
- Paige task delivery: NOT VERIFIED
- Production deployment: NOT PERFORMED

Tracking issue: #212.
