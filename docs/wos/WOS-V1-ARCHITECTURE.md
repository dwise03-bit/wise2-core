# WISE² OS V1 Authoritative Architecture

## Runtime authority

For WOS V1, `packages/api` is the authoritative HTTP/API boundary; `packages/db/prisma/schema.prisma` is the canonical schema source; `packages/reaper-worker` and the API queue module are existing job implementations to be adapted behind the WOS job envelope; `apps/dashboard` is the primary operator UI; `services/wise-discord` is an interface adapter only. `services/api`, `services/dashboard`, root `src`, and vertical/client apps remain legacy or adjacent until deployment evidence promotes them. No directories were moved.

## Execution envelope

`@wise2/wos-foundation` defines `ExecutionEnvelope` for HTTP, job, webhook, agent, and event work. Required fields are `kind`, `tenantId`, `correlationId`, `traceId`, and `createdAt`; `actorId/userId`, `jobId`, `provider/model`, and usage/cost metadata are included when applicable. Tenant context is server-derived and must be asserted before reads or writes.

## Risk and audit

`AuditEnvelope` is append-only logical history: event ID/type, action, entity, outcome, risk level, execution context, optional approval ID, and non-secret metadata. L3/L4 requires an existing approval ID; no foundation helper authorizes approval itself.

## Jobs, outbox, and idempotency

One WOS job is identified by `jobId` and carries the same execution envelope. New job conventions must use the existing BullMQ/Redis ownership selected per deployment; no second queue convention is introduced. `OutboxMessage` carries event identity, aggregate identity, envelope, payload, and occurrence time. Delivery must be transactional with the state mutation, deduplicated by event ID/idempotency key, retried with bounded exponential backoff, and dead-lettered after exhaustion. External sends remain test-safe and approval-gated.

## Data ownership policy

Prisma is the preferred owner for WOS business schema evolution. Existing TypeORM and raw-SQL migrations remain historical/owned by their current runtime until each table is explicitly mapped and an approved migration plan exists. No production schema or data was changed by WOS-0001.
