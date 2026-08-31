# WISE² AI Action & Dispatch Center

Simulated Home Services command queue. It turns inbound conversations into a prioritized, auditable action desk for iPhone, iPad, and desktop.

**This first release is a safe simulation.** Seed data and provider adapters are labeled. Live carrier service, phone numbers, CRM, dispatching, messaging, estimates, payments, and technician routing are not connected.

## Run it

```bash
pnpm --filter @wise2/action-dispatch install
pnpm --filter @wise2/action-dispatch test
pnpm --filter @wise2/action-dispatch dev
```

Open **http://localhost:3027**. No login, no database, no secrets.

```bash
pnpm --filter @wise2/action-dispatch build
pnpm --filter @wise2/action-dispatch start
```

Health: `GET /api/health`

## What you can do

1. The highest-risk unhandled conversation is Priority 01 (no cooling, 88°F, elderly occupant).
2. Open it to see the statement, scoring factors, equipment history, opportunity range, recommended action, transcript, and timeline.
3. Choose Dispatch. Cancel makes no conversation change.
4. Confirm records a simulated dispatch, appends an audit event, marks the item dispatched, updates metrics, and reranks the remaining queue.

## Architecture

| Area | Path |
| --- | --- |
| Scoring | `lib/priority/score.ts` |
| Queue / search / filters | `lib/conversations/queue.ts` |
| State transitions | `lib/actions/transitions.ts` |
| Provider ports | `lib/integrations/ports.ts` |
| Simulated adapters | `lib/integrations/simulated.ts` |
| Seed catalog | `lib/seed.ts` |
| Command workspace | `components/CommandWorkspace.tsx` |

Read models stay in TypeScript so a future Nest/mobile client can share the same contracts.

## Integration notes

The UI does not call production APIs. When WISE² AI Phone and the mobile API are ready:

- Implement `PhoneProvider` against `apps/phone-gateway` / Nest phone modules. Keep confirmation in the action service.
- Implement `CRMProvider` against existing customer/job routes. Do not invent missing customer or equipment fields.
- Implement `SchedulerProvider` and `DispatchProvider` against Field Tech / job APIs. Autonomous outbound contact stays out of scope.
- `GET /api/queue` and `POST /api/actions` are the first application-service boundary. Live adapters should replace `simulatedPorts` only.

## Tests

`node --test` covers scoring factors, clamp/ties/overrides, legal transitions, confirmation, filters, search, cancel, and the Dispatch acceptance path.

Not verified here: visual contrast on a physical device, production deploy, or live provider adapters.

## Deploy

`Dockerfile` builds a standalone Next.js image on port 3027. Do not enable this in production compose until asked. Preview URL is not published from this change.
