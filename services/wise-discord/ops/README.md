# /ops — Discord control surface (F5-OPS-06)

Discord is the **approval interface**. Nothing here executes anything: commands are
validated, signed, and handed to the MacBook relay, which hands them to a host's control
bridge. Each hop re-verifies.

## Commands

| Command | Role | Confirmation |
|---|---|---|
| `/ops status`, `/ops services`, `/ops logs`, `/ops diagnose`, `/ops targets` | operator | none |
| `/ops restart`, `/ops deploy`, `/ops rollback`, `/ops maintenance` | owner | one, typed |
| `/ops emergency-stop` | owner | two, typed |
| `/ops confirm <job-id>` | requester only | — |

## Safety model

- **Fail-closed roles.** `roles.js` returns `null` for anyone not explicitly listed. With
  `DISCORD_OPS_OWNER_IDS` unset, `/ops` refuses everything. This intentionally differs
  from the bot's legacy `isAdmin`, which grants access to everyone when its list is empty.
- **A write cannot reach the relay before confirmation.** The command handler only creates
  a pending intent; `dispatch.js` refuses to sign anything with fewer confirmations than
  its profile requires, so a bug in the command layer cannot execute an unconfirmed action.
- **Production must be typed.** Confirming a production write opens a modal requiring the
  literal word `production`. The button alone never executes.
- **Only the requester may confirm or cancel**, and each pending job is single-use and
  expires after 10 minutes.
- **No free-form text reaches a host.** Every option is validated against the profile's
  argument allowlist (`validateArgs`) before a job is minted.
- **Refusals are audited**, not just successes.

## Configuration

| Variable | Purpose |
|---|---|
| `DISCORD_OPS_OWNER_IDS` | Comma-separated Discord ids allowed to run writes. Required. |
| `DISCORD_OPS_OPERATOR_IDS` | Ids allowed read-only commands. |
| `WISE2_OPS_SIGNING_KEY` | `keyId:secret`, the same keyring the relay and bridge hold. |
| `WISE2_RELAY_URL` | Relay base URL (default `http://127.0.0.1:4600`). |
| `WISE2_RELAY_TOKEN` | Relay bearer token. |
| `WISE2_OPS_AUDIT_FILE` | Local audit log of every `/ops` interaction. |

Unmet requirements are printed at startup as `[discord][ops]` warnings rather than
discovered mid-incident.

## Prerequisite

The protocol is loaded from `packages/ops-protocol/dist`, so build it first:

```bash
(cd packages/ops-protocol && npm install && npm run build)
```
