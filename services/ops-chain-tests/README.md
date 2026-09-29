# @wise2/ops-chain-tests

The security proofs for the Mac → VPS direct control layer (F5-OPS-09), run against the
**whole chain in one process**: the Discord `/ops` handlers, the MacBook relay, and a
host's control bridge, wired together with real HTTP bodies. No hop is stubbed — the only
fake is the process runner at the very end, which records the argv the bridge would have
executed instead of running it.

`chain.commands` is therefore the ground truth every proof asserts on: **empty means
nothing ran**, anywhere.

## The proofs

| # | Proof | Where it bites |
|---|---|---|
| 1 | Unauthorized users cannot control hosts | Strangers and operators refused at Discord; wrong relay token, wrong bridge token, and forged signatures refused at their hops |
| 2 | Raw commands are rejected | Five injection shapes refused at all three layers; no endpoint accepts a command; a signature for one service cannot steer another |
| 3 | Stale or replayed jobs are rejected | Expiry, over-long TTL, replay at the relay, and replay sent **straight at the bridge** to bypass the relay |
| 4 | Production writes require confirmation | The button alone opens a modal; the wrong word does nothing; unconfirmed jobs refused at relay and bridge; emergency-stop needs two |
| 5 | Unknown targets and services are rejected | Unknown alias, non-allowlisted service, protected service, unknown diagnostic, profile not allowed on that target |
| 6 | Secrets are redacted | Leaked token, connection string, bearer header and PEM key absent from the card, from bridge output, and from all three audit logs; addresses absent from the target list |
| 7 | Duplicate actions are idempotent | The same unit of work twice executes once and says so |
| 8 | Relay outage fails closed | A down relay opens no write at all; a relay that dies mid-flow reports `failed`, never `complete` |
| 9 | The authorized path works | A confirmed restart reaches a real `docker compose` argv, attributed to the Discord user in every audit log |

## Running

```bash
(cd packages/ops-protocol && npm install && npm run build)   # the bot loads dist/
cd services/ops-chain-tests && npm install && npm test
```

CI runs this in `.github/workflows/ops-chain-ci.yml` on any change to a hop or to the
shared protocol.

## What this suite caught

Three defects that every per-package suite missed, because each one lived in the seam
between two hops:

1. **The bridge's log output was not redacting connection strings.** It kept a private
   copy of the sanitizer that never learned the `postgres://user:pass@host` rule added to
   the shared one. It now re-exports the shared implementation.
2. **The relay flattened the bridge's HTTP status**, turning a `403` refusal into a
   generic `400`.
3. **The result card could not find evidence through two envelopes**, so an idempotent
   replay rendered as raw JSON instead of "Already executed".
