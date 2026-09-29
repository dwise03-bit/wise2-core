# MAC → VPS Direct Control Layer — F5 Task Plan

Status: PLAN (no code written yet)
Date: 2026-09-05

## 1. Inspection findings (what already exists)

| Area | Reality on disk / on this Mac | Implication |
|---|---|---|
| VPS executor | `services/control-bridge` (Fastify, 774 LOC + vitest, `.github/workflows/control-bridge-ci.yml`) — bearer auth (constant-time), `@fastify/rate-limit`, name allowlists (`allowedServices` / `allowedApps`), `spawn(..., {shell:false})` with timeout + 64 KB output cap, `redactText()` (tokens/keys/PEM), JSONL audit, envelope responses. Endpoints: health, status, host metrics/gpu, docker services/stats/logs/restart, git status/revision, ollama, hermes, web, deploy, deploy status, rollback, audit. | **The allowlisted action layer is already built.** No new SSH action scripts are needed for hosts that run it. |
| Deployment | `docker-compose.production.yml:270` service `control-bridge` → `wise2-control-bridge-prod`; docs say healthy on wise2-core `:3004`. Binds `127.0.0.1`. | Relay talks HTTP to a private port, not raw SSH. |
| Discord (live bot) | `services/wise-discord/bot.js` (885 LOC), subcommand-group pattern (`/wise status`), `ADMIN_IDS` + `isAdmin(userId)`, already points at `COMMAND_CENTER_URL=http://127.0.0.1:3004`. | Host `/ops` here. Reuse `isAdmin`. |
| Discord (framework bot) | `services/discord-ecosystem` — 14 bots, `AuditLogger`, `RateLimiter`. **`BotFramework.checkPermissions()` ends in `return true` (BotFramework.ts:227)**. `DeploymentBot`/`EmergencyBot` are simulated (no exec/ssh). | ❌ Do **not** route ops through this framework until the permission default is fixed. |
| Tailscale | Installed on Mac; online peers: `big-byte` 100.122.242.22, `gpu-nmls-1` 100.68.145.5, `gl-mt3600be`. `ovh-vps` 100.123.59.122 offline. | Tailscale-first is viable for GPU/dev. |
| wise2-core VPS | `173.208.147.165` — SSH host in `~/.ssh/config` (`wise2-vps`), **not a Tailscale node**. Keys: `vps-deploy`, `id_ed25519`, `tailscale`. | Either join it to Tailscale (preferred) or reach control-bridge via an SSH local-forward. |

### Gaps that must be closed before any write command is exposed
1. control-bridge writes execute **immediately** on a valid token — no confirmation, nonce, expiry, or idempotency key.
2. Actor is a **static config string** (`WISE2_CONTROL_ACTOR`) — audit cannot attribute an action to Daniel's Discord ID.
3. Single-host: no target registry, no environment field, no `production` confirmation gate.
4. Missing action profiles: diagnose (docker/disk/network/db/worker/traefik/ollama), maintenance mode, emergency-stop.
5. No relay: nothing signs, throttles, or fails-closed between Discord and the host.

## 2. Target architecture (reuse-first)

```
Discord  →  wise-discord /ops (approval UI, RBAC, job creation)
         →  wise2-control-relay on the MacBook (signature verify, registry, freshness, idempotency)
         →  Tailscale HTTPS → control-bridge on each host  (allowlisted actions, audit, redaction)
         →  SSH-over-Tailscale + fixed scripts ONLY for hosts with no control-bridge (gpu-nmls-1)
```
The relay never forwards shell text — only `{target, actionProfile, args}` validated against the registry.

## 3. F5 tasks (smallest safe order)

| ID | Task | Scope | Done when |
|---|---|---|---|
| **F5-OPS-01** ✅ | Signed job protocol + registry schema — **DONE** (`packages/ops-protocol`, 73 tests green) | New `packages/ops-protocol`: zod schemas for `Job {jobId, actor, target, env, actionProfile, args, nonce, issuedAt, expiresAt(10m), idempotencyKey}`, HMAC-SHA256 detached signature helpers, and `targets.schema` (alias, tailscale addr, ssh user/key ref, env, allowed profiles, health cmd). No IPs/keys in the schema's serialized output. | Unit tests: bad signature, stale `issuedAt`, replayed nonce, unknown profile all rejected. |
| **F5-OPS-02** ✅ | control-bridge: identity + confirmation + idempotency — **DONE** (59 tests green) | Extend `services/control-bridge`: accept signed job envelope on writes (restart/deploy/rollback); record real `actor` + `jobId` in audit; reject replayed `idempotencyKey`; require `env=production` echo for prod writes. Read endpoints unchanged. | New vitest cases green; existing 5 test files still pass. |
| **F5-OPS-03** | control-bridge: missing action profiles | Add `diagnose/{docker,disk,network,database,worker,traefik,ollama}`, `maintenance on/off`, `emergency-stop` (separate `WISE2_ALLOWED_STOPPABLE` allowlist, never core services). All via existing `runCommand` allowlist pattern — no new shell surface. | Each profile returns a bounded, redacted envelope; non-allowlisted service → 403. |
| **F5-OPS-04** ✅ | `wise2-control-relay` (MacBook) — **DONE** (`services/control-relay`, 41 tests green) | New `services/control-relay`: Fastify on `127.0.0.1`, verifies signature/freshness/nonce/actor-role/confirmation, loads `~/.wise2/targets.json` (chmod 600, git-ignored), forwards to the target's control-bridge over Tailscale, SSH-forward fallback for `wise2-core` until it joins Tailscale (an HTTP call through an out-of-band tunnel — the relay never opens a shell), pollable sanitized progress, local `relay-audit.jsonl`, denies everything unknown. | Tests: unknown target, unknown profile, expired job, missing confirmation, relay-down → fail closed with a clear code. |
| **F5-OPS-05** ⚠️ | Tailscale + SSH hardening — **code/config DONE, host steps pending** (see `docs/OPS_CONNECTIVITY.md`) | Join `173.208.147.165` to the tailnet (or document the SSH-forward path), tailnet ACL limiting the Mac→hosts to the control-bridge port, dedicated least-privilege `wise2-ops` SSH key for the fallback path only. | `tailscale status` shows the host; relay reaches `/v1/control/health` without a public port. |
| **F5-OPS-06** ✅ | Discord `/ops` command surface — **DONE** (`services/wise-discord/ops`, 37 tests green) | In `services/wise-discord/bot.js`: `/ops status|services|logs|diagnose` (read, trusted operators) and `/ops restart|deploy|rollback|maintenance|emergency-stop` (owner-only via `isAdmin`) + `/ops confirm <job-id>`. Button confirmation, 10-minute expiry, double confirm for emergency-stop, `production` typed confirmation for prod. | Non-admin gets refusal + audit entry; write without confirm never reaches the relay. |
| **F5-OPS-07** | Result card + sanitized reporting | Shared renderer producing the OPS-XXXX card (actor/target/env/action/status/started/finished/evidence/rollback/next action). Log lines capped and passed through `redactText()` before embedding. | Snapshot test proves a token/PEM/connection string in raw output is redacted in the card. |
| **F5-OPS-08** ✅ | Health polling → `#fable5-activity` — **DONE** (relay monitor, 21 health tests + 4 chain proofs) | Relay polls each target's `/v1/control/status` on an interval and posts state changes only. **Alerts never trigger writes** — the card's "Next action" is advisory. | Simulated outage posts one alert, zero automatic remediation. |
| **F5-OPS-09** | Security test suite (the ten proofs) | Cross-package suite covering: unauthorized user blocked, raw shell rejected, stale/replayed job rejected, prod write needs confirmation, unknown target/service rejected, secrets redacted, duplicate action idempotent, relay outage fails closed. | Suite green in `ci.yml` + `control-bridge-ci.yml`. |

**Deferred (not in this pass):** fixing `BotFramework.checkPermissions()` in `services/discord-ecosystem` — required only if ops commands ever move to that framework. Track separately.

## 4. Suggested execution order
`01 → 02 → 04 → 05 → 06 → 03 → 07 → 09 → 08`
(read-only path end-to-end first: `/ops status` through the relay to a real host, before any write profile is exposed.)
