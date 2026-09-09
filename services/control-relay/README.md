# @wise2/control-relay

The MacBook relay for the Mac → VPS direct control layer (F5-OPS-04). Discord is the
approval interface; this process is the trusted execution relay; each host's control
bridge is the only thing that runs anything.

```
Discord /ops  →  control-relay (this)  →  control-bridge on the target host
   signs a job     verifies + dispatches     verifies again, then executes
```

## What it does not do

- **It never opens a shell.** The `ssh` transport is not an SSH command: it is an HTTP
  call to `127.0.0.1:<forwardPort>`, where an SSH port-forward established out-of-band
  reaches that host's control bridge. Nothing in this service spawns a process.
- **It never builds a request from operator text.** Each action profile maps to exactly
  one control-bridge route (`transport.ts`); a profile with no mapping returns
  `501 PROFILE_NOT_IMPLEMENTED` rather than a guessed path.
- **It never re-signs.** The signed job envelope is forwarded verbatim so the bridge
  verifies the same bytes independently. A compromised relay cannot mint authority.
- **It never guesses an outcome.** An unreachable host is `502 TARGET_UNREACHABLE` and the
  job is marked `failed`, never reported as done.

## Endpoints

| Route | Purpose |
|---|---|
| `GET /v1/relay/health` | Liveness. The only unauthenticated route. |
| `GET /v1/relay/targets` | Aliases only — addresses, SSH users, ports and key refs never leave the process. |
| `POST /v1/relay/jobs` | Verify a signed job and dispatch it. |
| `GET /v1/relay/jobs/:jobId` | Sanitized progress for the Discord result card. |
| `GET /v1/relay/audit` | Local audit tail. |

Every route except health requires `Authorization: Bearer $WISE2_RELAY_TOKEN`, **and**
writes additionally require the signed job and its confirmation.

## Verification order

signature → structure → freshness (10 min max) → target alias + environment → profile
allowed on that target → owner role → argument allowlist → signed confirmation
(production echoes `production`) → single-use nonce. Anything unrecognised is a rejection.

## Setup

1. `cp .env.example .env` and fill in the tokens.
2. Create the registry:
   ```bash
   mkdir -p ~/.wise2 && cp ../../packages/ops-protocol/targets.example.json ~/.wise2/targets.json
   chmod 600 ~/.wise2/targets.json
   ```
   The relay refuses to start if that file is group- or world-readable, or if any target's
   `bridgeTokenRef` environment variable is unset.
3. `npm install && npm run build && npm start`

### Running it as a login agent

`~/Library/LaunchAgents/com.wise2.control-relay.plist` — `ProgramArguments` of
`/usr/local/bin/node /Users/danielwise/Projects/wise2-core/services/control-relay/dist/services/control-relay/src/server.js`,
with `RunAtLoad` and `KeepAlive` set and the environment loaded from the `.env` values.
The relay is deliberately fail-closed: if it is not running, `/ops` writes cannot execute.

## Registry fields

`bridgeTokenRef` and `sshKeyRef` are **names, not values** — the relay resolves them from
its own environment. The registry file itself holds no secrets, and `publicTargets()` is
the only projection that may be rendered into Discord.

## Health polling (F5-OPS-08)

When `WISE2_RELAY_HEALTH_ENABLED=true`, the relay polls each target's
`GET /v1/control/status` on an interval and posts **state changes only** to the
`#fable5-activity` webhook. A steady fleet produces no messages at all.

- A phase flip needs `WISE2_RELAY_HEALTH_FAILURE_THRESHOLD` consecutive disagreeing
  probes (default 2), so a single blip does not alarm. The first observation of a target
  is reported immediately — silence would otherwise look like health.
- Phases are `healthy`, `degraded` (the bridge answered but named unhealthy components)
  and `down` (unreachable or an HTTP error). Recovery is its own transition.
- **An alert can never remediate.** The monitor is constructed with a probe and a
  notifier and nothing else — no signing key, no dispatcher, no route to the job path.
  Alerts name the command a person could run (`/ops status <alias>`); they never run it.
- Alert text goes through the shared sanitizer, and mentions are suppressed
  (`allowed_mentions: {parse: []}`) so an alert cannot ping the channel.
- A failing webhook is swallowed and reported through `onError`: losing Discord must not
  lose the state transition or stop the sweep.

`GET /v1/relay/fleet` returns the current phase of every target (aliases only) and whether
polling is running.

## Not yet wired

- `diagnose`, `maintenance` and `emergency-stop` have no bridge endpoint until F5-OPS-03.
- Progress is pollable, not pushed; live streaming into the Discord card is not built.
- The SSH tunnel itself (autossh/launchd) and tailnet ACLs are F5-OPS-05.
