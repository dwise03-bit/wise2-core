# Revenue OS — Deployment

How to get the Revenue OS schema, seed and feature flags into an environment,
and how to back out.

> **Not yet executed anywhere.** As of commit `3fae8eff`, the migration below
> has not been applied to any environment and `seed-revenue-os.ts` has never
> been run against a database. It has been type-checked and the schema
> validated, nothing more. Treat the first run as a real deployment step, on a
> backed-up database, in staging first.

---

## 0. Prerequisites

- PostgreSQL reachable via `DATABASE_URL`.
- Redis reachable via `REDIS_URL` — only needed once the worker is turned on.
- A **verified backup** of the target database before step 1.
- `ts-node` available for the seed (see step 2).

---

## 1. Migration

The migration is `packages/db/prisma/migrations/20260814191006_add_revenue_os_domain/migration.sql`.

It is **purely additive**: 15 new enum types and 13 new tables (`Tenant`,
`TenantMembership`, `RevenueCustomer`, `Lead`, `Conversation`, `ServiceJob`,
`Estimate`, `Campaign`, `AgentConfig`, `AutomationRun`, `WebhookEvent`,
`ConsentRecord`, `SafetyEvent`) plus their indexes and foreign keys. It does
not alter, rename or drop a single pre-existing table or column, so applying it
cannot change the behaviour of anything already running.

### Validate first (no database needed)

```bash
cd packages/db
DATABASE_URL="postgresql://u:p@localhost:5432/x" npx prisma validate --schema prisma/schema.prisma
npx prisma generate --schema prisma/schema.prisma
```

### Apply

```bash
cd packages/db
DATABASE_URL="postgresql://…" npx prisma migrate deploy --schema prisma/schema.prisma
```

> ⚠️ **Check the migration history before running this.** `packages/db/prisma/migrations/`
> contains older directories that are *not* timestamp-prefixed
> (`add_consulting_revenue_system`, `add_prospect_crm`, `soundlabs_cloud_storage`,
> and others). `migrate deploy` applies every migration Prisma does not find in
> the `_prisma_migrations` table, in directory order — so on a database whose
> history was never tracked by Prisma it may try to replay those older
> migrations too. Before deploying, inspect the target:
>
> ```sql
> SELECT migration_name, finished_at FROM "_prisma_migrations" ORDER BY started_at;
> ```
>
> If the older migrations are not recorded but their tables already exist, mark
> them applied without re-running them:
>
> ```bash
> npx prisma migrate resolve --applied <migration_directory_name> --schema prisma/schema.prisma
> ```
>
> Only then run `migrate deploy`. Never reach for `prisma db push` or
> `prisma migrate reset` on a shared database — both are destructive.

### Verify

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('Tenant','TenantMembership','RevenueCustomer','Lead',
                     'Conversation','ServiceJob','Estimate','Campaign',
                     'AgentConfig','AutomationRun','WebhookEvent',
                     'ConsentRecord','SafetyEvent')
ORDER BY table_name;   -- expect 13 rows
```

---

## 2. Seed

`packages/db/prisma/seed-revenue-os.ts` creates, idempotently:

1. Tenant **Wise HVAC Solutions** — slug `wise-hvac`, vertical `hvac`,
   timezone `America/New_York`, `revenueOsEnabled = false`.
2. Tenant **WISE²** — slug `wise2`, vertical `consulting`,
   `revenueOsEnabled = false`. **The tenant row only.** No existing WISE²
   consulting record is migrated, re-pointed or backfilled; that is a separate,
   reviewed data migration.
3. The **seven AI agents** for `wise-hvac`, each `enabled = false`,
   `status = NEEDS_CONFIG`, with instructions (purpose + global rules +
   guardrails) and a `config` payload of `{ agentId, promptPath, tools, requires }`
   — the same row shape `AgentsService.seedForTenant()` writes.

It creates **no** customers, leads, conversations, jobs, estimates or campaigns
unless demo mode is explicitly enabled (below).

### Run

`ts-node` is not currently a dependency of `@wise2/db`. Either install it as a
dev dependency or invoke it via `npx`:

```bash
cd packages/db
DATABASE_URL="postgresql://…" npx ts-node -O '{"module":"commonjs","rootDir":"."}' prisma/seed-revenue-os.ts
```

Once `ts-node` is installed in the package, the packaged script is equivalent:

```bash
cd packages/db
DATABASE_URL="postgresql://…" pnpm run seed:revenue-os
```

Run `npx prisma generate` first if the Prisma client in `node_modules` predates
the Revenue OS models — otherwise the seed will fail to resolve `AgentType`.

### Idempotency

Safe to run on every deploy:

- **Tenants** are upserted on the unique `slug`. The `update` branch touches
  only `name` / `vertical` / `timezone`. `revenueOsEnabled` is an operator
  decision and is written **only on create**, so re-running never flips a
  live tenant off — or on.
- **Agents** are upserted on the unique `[tenantId, type]`. The `update` branch
  refreshes `name`, `instructions` and `config` so a redeploy picks up new
  tools or guardrails, and deliberately **omits `enabled` and `status`**. An
  agent an operator paused stays paused; an agent the API marked `ERROR` keeps
  that state.
- **`Tenant.safetyScript`** is never written. Safety-trigger language must be
  operator-approved; a seed cannot approve copy.
- Nothing is ever deleted.

### Demo data — off by default

Demo fixtures are written **only** when:

- `SEED_DEMO=true`, **or**
- `NODE_ENV === 'development'`

and are refused outright when `NODE_ENV === 'production'` — `SEED_DEMO=true`
against production throws rather than writing. When demo mode is on, the seed
prints a loud banner before writing anything.

The fixture set is three rows on `wise-hvac`: one inactive campaign, one
customer and one lead, all named/prefixed `DEMO`, on fixed ids
(`demo-wise-hvac-customer-1`, `demo-wise-hvac-lead-1`) so repeat runs update
rather than multiply them. The phone number is in the reserved `555-01xx`
fictional range and no `ConsentRecord` is created, so nothing in the fixture
set is contactable even if an agent were enabled.

To remove them later, delete exactly those ids — do not run a blanket delete.

---

## 3. Post-seed manual steps

The seed cannot do these:

1. **Create a `TenantMembership`.** `userId` refers to the TypeORM auth user,
   which lives in a different store than this Prisma schema. Without a
   membership row, `TenantGuard` refuses every Revenue OS request.

   ```sql
   INSERT INTO "TenantMembership" ("id","tenantId","userId","role","createdAt","updatedAt")
   SELECT gen_random_uuid()::text, t.id, '<auth-user-id>', 'OWNER', now(), now()
   FROM "Tenant" t WHERE t.slug = 'wise-hvac';
   ```

2. **Set `Tenant.safetyScript`** to operator-approved language.
3. **Configure providers** — see [PROVIDERS.md](./PROVIDERS.md). Until then
   every agent stays `NEEDS_CONFIG`.

---

## 4. Feature-flag rollout

Revenue OS is behind **two** gates, and **both must be true** for anything to
run. This is enforced in `TenantGuard.canActivate()`:

| Gate | Where | Scope |
|---|---|---|
| `REVENUE_OS_ENABLED=true` | environment | the whole deployment |
| `Tenant.revenueOsEnabled = true` | database column | one tenant |

With either off, `TenantGuard` throws `NotFoundException` — a 404 rather than a
403, so a disabled product does not advertise its own existence. The queue is
also inert: `RevenueQueueService` opens no Redis connection and enqueues
nothing while `REVENUE_OS_ENABLED` is not `'true'`.

Note the string comparison: the code checks `=== 'true'`. `REVENUE_OS_ENABLED=1`
or `True` will read as disabled.

### Recommended order

1. **Deploy dark.** Migration + seed applied, `REVENUE_OS_ENABLED=false`.
   Nothing changes for anyone. Verify the 13 tables and the seeded rows.
2. **Enable globally, keep tenants off.** `REVENUE_OS_ENABLED=true`, every
   `Tenant.revenueOsEnabled` still `false`. Still no route reachable — this
   only proves the app boots with the flag on.
3. **Enable one tenant, agents still disabled.**

   ```sql
   UPDATE "Tenant" SET "revenueOsEnabled" = true WHERE slug = 'wise-hvac';
   ```

   The Command Center can now read the pipeline. Every agent is still
   `enabled = false` / `NEEDS_CONFIG`, so no customer is contacted.
4. **Configure one provider capability at a time** and confirm the agent's
   status changes from `NEEDS_CONFIG` before enabling it.
5. **Enable agents one at a time**, lowest risk first. Suggested order:
   Booking → Review → Recovery → Membership → Reactivation → Speed-to-Lead →
   Receptionist. Watch `AutomationRun` rows between each.
6. **Start the worker** only when you intend automations to actually execute:
   `REVENUE_OS_WORKER=true` (plus `REVENUE_OS_ENABLED=true`). Optional
   `REVENUE_OS_WORKER_CONCURRENCY`, default `5`. The worker can run inside the
   API process or as a separate container from the same image.

### Environment variables

```bash
REVENUE_OS_ENABLED=false          # global gate
REVENUE_OS_WORKER=false           # start the BullMQ consumer in this process
REVENUE_OS_WORKER_CONCURRENCY=5   # optional
WISE_HVAC_TENANT_SLUG=wise-hvac   # slug the seed uses for the HVAC tenant
REDIS_URL=redis://127.0.0.1:6379  # defaults to this if unset
DATABASE_URL=postgresql://…
```

Provider credentials: see [PROVIDERS.md](./PROVIDERS.md). All of them are blank
in `.env.example` on purpose.

---

## 5. Rollback

Roll back in this order. The first step alone stops everything, costs nothing
and loses no data — prefer it.

### Level 1 — flip the flags (instant, reversible, no data loss)

```bash
REVENUE_OS_WORKER=false
REVENUE_OS_ENABLED=false
```

and/or per tenant:

```sql
UPDATE "Tenant" SET "revenueOsEnabled" = false WHERE slug = 'wise-hvac';
```

Every route 404s, the worker does not start, the queue accepts nothing. In-flight
BullMQ jobs stay in Redis and resume when the flags come back on — if you do not
want that, drain or delete the `revenue-os` queue keys before re-enabling.

### Level 2 — pause the workforce

```sql
UPDATE "AgentConfig" SET "enabled" = false WHERE "tenantId" =
  (SELECT id FROM "Tenant" WHERE slug = 'wise-hvac');
```

Workflows then skip with "agent disabled" and record the reason in
`AutomationRun`, while the pipeline data stays readable.

### Level 3 — revert the code

Redeploy the previous image. The schema is additive, so an older build simply
ignores the new tables. No schema change is required to roll the code back.

### Level 4 — remove the schema (destructive; last resort)

Only with a verified backup, and only if the tables are genuinely unwanted —
they hold customer records once the system is live.

Prisma has no down-migration. Removal is manual DDL against the 13 tables and
15 enum types listed above, dropped in foreign-key-safe order (children before
`Tenant`), followed by deleting the `20260814191006_add_revenue_os_domain` row
from `_prisma_migrations`. Write and review that script deliberately; do not
improvise it during an incident. **Never** use `prisma migrate reset` or
`prisma db push` to achieve it — both will take other schemas with them.

---

See also: [README.md](./README.md) · [PROVIDERS.md](./PROVIDERS.md)
