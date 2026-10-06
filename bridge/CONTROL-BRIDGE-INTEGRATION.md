# WISE² Control-Bridge — Evidence-Based Discovery & Surface Integration

> Read-only discovery 2026-10-04 from **Wise2-surface**. Source of evidence:
> read-only clone of **`dwise03-bit/wise2-core`** (scratchpad only, not committed
> into `/opt/wise2`) + production compose stanza. **Production was not modified,
> nothing deployed, no secret values printed.**

## WHAT CONTROL-BRIDGE IS

A **Fastify** service in `services/control-bridge/` (package
`@wise2/control-bridge`) that exposes a locked-down, **signed-write** control
plane for the production wise2-core stack. It is what a remote operator (or an
authorized agent) talks to in order to read status and perform a narrow set of
write operations against production, with a hard authorization gate per request.

- **Container:** `wise2-control-bridge-prod` (production compose).
- **Binds:** host-mode networking, listening on **`127.0.0.1:3099`** on the VPS.
- **Base path:** `/v1/control/*`.
- **Default actor:** `chatgpt` (configurable). Writes still require a signed job
  whose signature `keyId` identifies the actual signer.

## PORT & REACHABILITY

- **3099** on the VPS **loopback only** → not reachable from Surface or the
  tailnet directly, **by design**.
- There is **no public ingress** to control-bridge in the committed nginx
  configs. Any reach from Surface must be set up as a **private path over
  Tailscale** (same shape as the Hermes plan).

## ENDPOINTS (from `services/control-bridge/src/server.ts`)

**Open (no auth):**
- `GET /v1/control/health` — `{status:"ok"}`

**Authenticated reads (Bearer `WISE2_CONTROL_TOKEN`):**
- `GET /v1/control/audit?limit=N`
- `GET /v1/control/host/metrics` · `GET /v1/control/host/gpu`
- `GET /v1/control/docker/services` · `GET /v1/control/docker/stats`
- `GET /v1/control/docker/:service/logs?lines=N`
- `GET /v1/control/diagnose/:profile`
- `GET /v1/control/maintenance`
- `GET /v1/control/git/status` · `GET /v1/control/git/revision`
- `GET /v1/control/ollama/status` · `GET /v1/control/ollama/models`
- `GET /v1/control/hermes/status`
- `GET /v1/control/web/wise2`
- `GET /v1/control/deploy/:deploymentId`
- `GET /v1/control/status`

**Authenticated writes (Bearer **AND** HMAC-signed job envelope):**
- `POST /v1/control/docker/:service/restart`
- `POST /v1/control/deploy/:app` · `POST /v1/control/rollback/:app`
- `POST /v1/control/maintenance/:state`
- `POST /v1/control/emergency/:service/stop`

Write envelopes carry a signed `job` (sha-256 HMAC over a canonicalized payload,
`keyId` names the signing key), a per-job `nonce` stored server-side to prevent
replay, and an `idempotencyKey` recorded in a ledger so a repeated identical
request returns the prior result instead of running twice.

## AUTH MODEL

- **Bearer token** (`WISE2_CONTROL_TOKEN`, ≥16 chars in production): verified
  constant-time (`timingSafeEqual`) in a Fastify `preHandler` for **every**
  route except `GET /v1/control/health`.
- **Signed writes** (`WISE2_REQUIRE_SIGNED_WRITES=true` in production): writes
  are refused unless the job envelope is signed with one of
  `WISE2_OPS_SIGNING_KEYS` (format `keyId:secret,…`, secrets ≥32 chars). The
  server fails closed on start if signed writes are required but no keys
  are configured.
- **Protected services** can never be stopped by an operator, even if listed in
  `WISE2_ALLOWED_STOPPABLE`: `postgres, redis, mongodb, api, control-bridge`.
- **Rate limit:** `WISE2_CONTROL_RATE_LIMIT_MAX` (default 60) per
  `WISE2_CONTROL_RATE_LIMIT_WINDOW_MS` (default 60 000 ms) per IP.
- **Audit:** every request appended to `WISE2_AUDIT_FILE`
  (`/data/control-bridge/audit.jsonl`), with the Bearer token redacted.

## ENVIRONMENT (production compose, NAMES only — values never read/printed)

Required: `WISE2_CONTROL_TOKEN`, `WISE2_OPS_SIGNING_KEYS` (when
`WISE2_REQUIRE_SIGNED_WRITES=true`).
Target config: `WISE2_TARGET_ALIAS`, `WISE2_TARGET_ENVIRONMENT`.
Paths & binaries: `WISE2_REPO_DIR`, `WISE2_COMPOSE_FILE`,
`WISE2_COMPOSE_PROJECT_NAME`, `WISE2_AUDIT_FILE`, `WISE2_DEPLOYMENT_FILE`,
`WISE2_IDEMPOTENCY_FILE`, `WISE2_MAINTENANCE_FILE`.
Health URLs: `WISE2_OLLAMA_URL`, `WISE2_HERMES_URL`, `WISE2_API_HEALTH_URL`,
`WISE2_PUBLIC_URL`.
Scope: `WISE2_ALLOWED_SERVICES`, `WISE2_ALLOWED_APPS`,
`WISE2_ALLOWED_PROFILES`, `WISE2_ALLOWED_STOPPABLE`.

## SAFE SURFACE INTEGRATION PATH (recommended — not yet implemented)

Preferred: **Surface → private VPS endpoint → authenticated control-bridge**,
no new public exposure, read-only first:

1. **Tailscale-private reach.** On the VPS, expose `127.0.0.1:3099` to Surface
   **only over Tailscale** — e.g. `tailscale serve` mapping a tailnet HTTPS
   path to `http://127.0.0.1:3099`, or an nginx server block bound to the VPS
   tailnet IP that proxies `/v1/control/*` to `:3099`. No new public port.
2. **Surface client layer** (`/opt/wise2/bridge/client/`): thin, config-driven,
   **DISABLED by default**.
   - `config/bridge.conf` (non-secret): `BRIDGE_BASE_URL`, path prefix,
     `BRIDGE_ENABLED=false`.
   - `credentials/control-token` (0600, git-ignored): the Bearer token.
   - `credentials/signing-key` (0600, git-ignored): **only if** write access is
     ever granted to this device — Surface should start **read-only**.
   - `wise2 bridge` surfaces status (CONFIGURED → REACHABLE → AUTHENTICATED → READY).
3. **Scope.** Begin with **read-only** calls (health + metrics + services +
   logs + status). **Writes stay off** on Surface unless Daniel explicitly
   grants a `device:wise2-surface` signing key and a bounded profile set.
4. **Command Center.** When read-only works, mirror the production pattern:
   same-origin proxy from the Command Center to the private tailnet URL, so the
   browser never holds the Bearer or signing key.

## MISSING INFORMATION (to finish wiring — needs Daniel)

1. **Is `wise2-control-bridge-prod` actually running** on the VPS right now?
   (Compose + CI exist; live status unverified from Surface.)
2. **Private reach:** is the Hermes-VPS also on the tailnet, or does it need to
   join? If joined, the tailnet IP + the chosen proxy path (`tailscale serve`
   vs nginx) must be recorded here before `BRIDGE_BASE_URL` can be set.
3. **Device credential:** issue a `device:wise2-surface` Bearer token (16+
   chars) separate from the human/ChatGPT token so Surface is independently
   revocable. **Claude does not mint it.**
4. **Signing key (writes):** if (and only if) Surface is ever granted write
   access, add a `wise2-surface:<secret>` entry to `WISE2_OPS_SIGNING_KEYS` on
   the VPS; store the matching secret in `/opt/wise2/bridge/credentials/signing-key`
   (0600). Start without this — reads only.

## GUARDRAILS HONORED

- Public repo cloned read-only in scratchpad; not committed under `/opt/wise2`.
- No VPS login. No Tailscale/DNS/firewall change. No production edit.
- No credential value read or printed. No new public port.
- Surface client created but **DISABLED** until the pending items above resolve.
