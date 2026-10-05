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

## 2026-10-05 findings (read-only probe from Surface)

- **VPS confirmed as `gpu-nmls-1`** (tailnet `100.68.145.5`). TSMP pong 264 ms.
- **TCP 3099 closed from tailnet** — control-bridge is bound to the VPS
  loopback (`127.0.0.1`) as documented. No change needed on 3099 itself.
- **nginx TLS gap:** HTTPS handshakes to `100.68.145.5:443` fail with
  `TLSv1.3 internal error` for every SNI tried. Any HTTPS reverse-proxy path
  (Option B) is blocked until the nginx cert is fixed; the preferred fix is
  `tailscale serve` (Option A), which uses the automatic Tailscale cert and
  does not touch nginx.

## Blocking items (owner: Daniel / production)
- [ ] **VPS status** — confirm `wise2-control-bridge-prod` is running on
      `gpu-nmls-1` (`docker ps`, port 3099 bound to 127.0.0.1);
      `curl -fsS http://127.0.0.1:3099/v1/control/health` on the VPS.
- [ ] **Private reach (preferred: `tailscale serve`)** — on `gpu-nmls-1`, run
      the steps in `docs/VPS-TAILSCALE-SERVE-RUNBOOK.md` to publish
      `/v1/control → 127.0.0.1:3099` on the tailnet. Record the resulting
      `https://gpu-nmls-1.<tailnet>.ts.net` URL in `BRIDGE_BASE_URL`.
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
