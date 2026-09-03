# WOS V1 Test Plan

WOS-0001 provides a dependency-free Vitest harness in `packages/wos-foundation`.

Required release progression:

- Contract tests: envelope fields, tenant mismatch rejection, and L3/L4 approval enforcement.
- Integration tests: authenticated tenant propagation through API, jobs, webhooks, agents, and events.
- Persistence tests: transactional outbox, idempotency replay, bounded retry, and dead-letter behavior.
- Golden path: prospect intake → safe persistence → evidence → reviewed CRM mutation → project/task → consent → intelligence suggestion → approval → test-safe follow-up → audit/outbox trace.
- Security gates: no cross-tenant reads/writes, no unapproved L3/L4 action, no replayable webhook, no secret logging.
