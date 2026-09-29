# WISE² Revenue OS

Revenue OS is the tenant-scoped revenue engine inside WISE² Core. It takes a
home-services business — the reference tenant is **Wise HVAC Solutions** — and
runs the path from advertisement to repeat customer with an AI workforce
sitting on top of a normal relational pipeline.

It is a *bolt-on*, not a rewrite. Every route and every automation is behind a
double feature gate (see [DEPLOYMENT.md](./DEPLOYMENT.md)); with the gate off,
WISE² behaves exactly as it did before.

Code lives in:

| Area | Path |
|---|---|
| Data model | `packages/db/prisma/schema.prisma` (Revenue OS section, end of file) |
| Migration | `packages/db/prisma/migrations/20260814191006_add_revenue_os_domain/` |
| Seed | `packages/db/prisma/seed-revenue-os.ts` |
| API | `packages/api/src/revenue-os/` |
| UI | `apps/command-center/src/components/revenue-os/` |

---

## The revenue flow

```
ATTRACT → RESPOND → QUALIFY → BOOK → DISPATCH → SELL → FOLLOW UP → REVIEW → REACTIVATE
```

| Stage | What happens | Model / code |
|---|---|---|
| **ATTRACT** | Paid and organic demand creates a lead with its source attached. | `Campaign`, `Lead.source`, `Lead.campaignId` |
| **RESPOND** | The lead is contacted within minutes, not hours. Inbound calls are answered 24/7. | `SpeedToLeadWorkflow`, `InboundReceptionistWorkflow`, `Conversation` |
| **QUALIFY** | Intent, urgency and customer status are classified — and the safety gate runs first. | `HvacClassifierService`, `HvacSafetyService`, `Lead.hvacCategory`, `Lead.urgency`, `SafetyEvent` |
| **BOOK** | Real calendar slots are offered and an appointment is created. | `WISE Booking` agent, `CalendarProvider.availableSlots()` |
| **DISPATCH** | The job is scheduled, assigned and worked. | `ServiceJob` (`SCHEDULED → DISPATCHED → ON_SITE → COMPLETED`) |
| **SELL** | An estimate is presented; sold work becomes revenue with its source still attached. | `Estimate`, `ServiceJob.revenue`, `ServiceJob.sourceAttribution` |
| **FOLLOW UP** | Unsold estimates are worked, objections captured, pricing escalated to a human. | `EstimateRecoveryWorkflow` |
| **REVIEW** | Every completed job gets the same feedback request; unhappy customers route to service recovery, never suppression. | `ReviewWorkflow` |
| **REACTIVATE** | Dormant customers are re-engaged from service history, and maintenance plans offered. | `ReactivationWorkflow`, `MembershipWorkflow`, `RevenueCustomer.membershipStatus` |

Two rules cut across the whole flow:

- **Consent before contact.** `ConsentService.canContact()` denies by default —
  an unknown consent state is treated as refusal, not permission.
- **Never invent.** Agents may not invent prices, availability, arrival times,
  review links, financing, rebates, warranties or membership pricing. With no
  provider configured, nothing is sent and the agent reports `NEEDS_CONFIG`
  (see [PROVIDERS.md](./PROVIDERS.md)).

---

## The AI workforce

Seven agents, defined in
`packages/api/src/revenue-os/agents/agent-definitions.ts` and seeded per tenant
by `AgentsService.seedForTenant()` and by `seed-revenue-os.ts`:

| Agent | Type | Requires | Job |
|---|---|---|---|
| WISE Receptionist | `RECEPTIONIST` | telephony, calendar | 24/7 inbound front desk; identify, classify, book or route |
| WISE Speed-to-Lead | `SPEED_TO_LEAD` | messaging, telephony, calendar | Work new leads immediately toward a booking |
| WISE Booking | `BOOKING` | calendar | Offer real slots, create appointments |
| WISE Recovery | `RECOVERY` | messaging | Follow up unsold estimates, capture objections |
| WISE Membership | `MEMBERSHIP` | messaging | Offer the tenant's approved maintenance plan |
| WISE Review | `REVIEW` | messaging, review | Post-job feedback; recovery task on negative feedback |
| WISE Reactivation | `REACTIVATION` | messaging | Re-engage dormant customers |

An agent is only allowed to run when it is **enabled** *and* every capability it
requires has a configured provider (`AgentsService.canRun()`). Otherwise its
status is `NEEDS_CONFIG` and workflows skip it with a recorded reason rather
than failing or improvising.

---

## Multi-tenancy and isolation

- Tenant context is resolved **from the authenticated user's `TenantMembership`
  row only** (`TenantService.resolveForUser`). A client may *request* a tenant
  via `x-tenant-id`, but it is honoured only after membership is confirmed
  server-side.
- `TenantMembership.userId` is an unconstrained `String` — it points at the
  TypeORM auth user, which lives in a different ORM than this Prisma schema.
  This seam is documented in the schema itself.
- Webhooks never take tenant from the payload body; `WebhookSecurityService`
  resolves it from a trusted server-side provider mapping, after a size bound,
  a constant-time HMAC check and a replay/idempotency check against
  `WebhookEvent`.

---

## Implementation status

Accurate as of commit `3fae8eff` (2026-08-14/15). Revenue OS is under active
multi-phase construction; re-check the code before relying on any line here.

### Built and in the repo

- **Data model + migration** — 13 models and their enums; migration
  `20260814191006_add_revenue_os_domain` (476 lines of SQL).
- **Tenant isolation** — `TenantService`, `TenantGuard`, `@Tenant()` decorator,
  with the feature gate enforced inside the guard.
- **Safety + classification** — `HvacSafetyService`, `HvacClassifierService`,
  `SafetyEvent` logging.
- **Consent** — `ConsentService` with STOP/START keyword handling and
  deny-by-default contact checks.
- **Providers** — capability interfaces plus `MockProvider`, which sends
  nothing and reports `NEEDS_CONFIG`.
- **Webhook admission control** — `WebhookSecurityService`.
- **Agents** — the seven definitions, per-tenant seeding, status derivation and
  `canRun()` gating.
- **Workflows** — all six: speed-to-lead, inbound receptionist, estimate
  recovery, review, membership offer, reactivation. Each is wrapped by
  `WorkflowRunnerService`, which writes an `AutomationRun` audit row before the
  work starts and closes it afterwards, including on failure.
- **Queue + worker** — `RevenueQueueService` (BullMQ on the existing Redis) and
  `RevenueWorkerService`, which consumes the queue and is registered in
  `RevenueOsModule`. The worker only starts when **both** `REVENUE_OS_ENABLED`
  and `REVENUE_OS_WORKER` are `true`, so the same image runs as API or as a
  dedicated worker container.
- **API surface** — two controllers: `api/revenue-os/leads` and
  `api/revenue-os/attribution`.
- **UI** — Command Center components under
  `apps/command-center/src/components/revenue-os/` (`KpiGrid`, `PipelineBoard`,
  `HotLeadsTable`, `WorkforcePanel`, `RevenueHeader`, states, and the
  `useRevenueData` fetch hook).
- **Tests** — `packages/api/src/revenue-os/__tests__/`: agents/workflow,
  attribution, safety+consent, tenant isolation, webhook+provider.

### Not built yet

- **No live provider adapters.** `MockProvider` is the only implementation of
  every capability. No SMS is sent, no call is placed, no calendar slot is
  real, no review link exists. See [PROVIDERS.md](./PROVIDERS.md).
- **No webhook controllers.** `WebhookSecurityService` exists, but no HTTP
  route accepts an inbound telephony or Meta lead webhook yet — so nothing
  currently *enqueues* speed-to-lead or receptionist work from the outside.
- **No agents/consent/safety controllers.** `AgentsService.listForTenant()` and
  `setEnabled()` are not exposed over HTTP, so the Command Center workforce
  panel has no live endpoint behind it yet.
- **No scheduler.** Reactivation and membership are workflows that must be
  enqueued by something; there is no cron/repeatable-job registration.
- **No tenant membership seeding.** `seed-revenue-os.ts` cannot create a
  `TenantMembership`, because the `userId` belongs to the TypeORM auth store.
  Someone must insert that row before any Revenue OS route is reachable.
- **No tenant safety script.** `Tenant.safetyScript` is left `null` by the
  seed on purpose — the AI must use operator-*approved* language on a safety
  trigger, and a seed cannot approve copy.
- **No agent prompt files.** The definitions reference
  `promptos/agents/revenue-os/*.md`; that directory does not exist yet.
- **No end-to-end run.** As of this commit the seed has not been executed
  against any database, and no workflow has been observed running end to end.

---

See also: [DEPLOYMENT.md](./DEPLOYMENT.md) · [PROVIDERS.md](./PROVIDERS.md)
