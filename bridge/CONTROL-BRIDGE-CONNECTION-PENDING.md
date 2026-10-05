# CONTROL-BRIDGE-CONNECTION-PENDING

> Tracking record for the unresolved production work required before Surface can
> actually connect to the WISE² control-bridge. Opened 2026-10-04.
> **No production changes made.**

## Target architecture (proposed, awaiting approval)
- **Tailscale-private** reach: Surface → VPS tailnet IP → `/v1/control/*` → `127.0.0.1:3099`.
- **Dedicated device Bearer** token (`device:wise2-surface`), independently revocable.
- **Read-only to start.** Writes require a separate signing-key entry on the VPS,
  granted per-operation-profile, approved by Daniel.
- Surface client built but **DISABLED** until endpoint + credential exist.

## Blocking items (owner: Daniel / production)
- [ ] **VPS status** — confirm `wise2-control-bridge-prod` is running
      (`docker ps`, port 3099 bound to 127.0.0.1); `curl -s http://127.0.0.1:3099/v1/control/health`.
- [ ] **Private reach** — expose `/v1/control/*` to Surface over Tailscale only
      (preferred: `tailscale serve` on the VPS; alt: nginx server block bound to
      the VPS tailnet IP). No new public port. Record the tailnet URL to set
      `BRIDGE_BASE_URL`.
- [ ] **Device Bearer** — issue a dedicated `device:wise2-surface` Bearer token
      distinct from the human/ChatGPT token; add it to the VPS environment so
      the bridge accepts it; deliver out-of-band for installation to
      `/opt/wise2/bridge/credentials/control-token` (0600).
- [ ] **(Writes, optional, later)** — if Surface is ever granted write access,
      add a `wise2-surface:<secret>` entry to `WISE2_OPS_SIGNING_KEYS`; install
      the matching secret to `/opt/wise2/bridge/credentials/signing-key` (0600);
      restrict `WISE2_ALLOWED_PROFILES` for this device to the minimum needed.
- [ ] **Enable** — set `BRIDGE_ENABLED=true` + `BRIDGE_BASE_URL`; verify
      CONFIGURED → REACHABLE → AUTHENTICATED → READY via `wise2 bridge`.

## Must NOT change without explicit approval
Production VPS, Docker, nginx, Tailscale ACL, DNS, control-bridge code, signing
keys, Bearer tokens, audit volume. (All currently untouched.)

## Evidence
Read-only inspection: `/opt/wise2/bridge/CONTROL-BRIDGE-INTEGRATION.md`.
Temp clone of `dwise03-bit/wise2-core` kept in the session scratchpad only
(not committed into `/opt/wise2`).
