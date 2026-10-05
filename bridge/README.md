# Bridge — WISE² Control-Bridge (Surface client layer)

> Status 2026-10-04: Surface is a **CLIENT** of the production WISE²
> control-bridge. This directory is the local integration/client layer — it
> does **NOT** host or replace the production service. See
> **CONTROL-BRIDGE-INTEGRATION.md** for the read-only discovery results and the
> connection plan.

## What control-bridge is

A Fastify service in `services/control-bridge/` of the canonical repo
`dwise03-bit/wise2-core` (container `wise2-control-bridge-prod`, port
`127.0.0.1:3099` on the VPS). It exposes a locked-down `/v1/control/*` plane:
authenticated reads of host/docker/git/ollama/hermes/web status plus a narrow
set of signed-write operations (restart, deploy, rollback, maintenance,
emergency-stop). Writes are refused in production unless the request carries a
valid HMAC-signed job envelope with a non-replayed nonce.

## This machine's role

Wise2-surface connects to the existing control-bridge as a **read-only** client
(by default). The service is **remote** and bound to the VPS loopback, so
Surface requires a private tailnet path before it can reach `/v1/control/*`.
The live endpoint, device Bearer token, and (optionally) signing key must be
provided out-of-band by Daniel before this client can succeed.

## Do NOT

- Deploy a second control-bridge or expose the production one publicly.
- Share the human/ChatGPT Bearer token with this device.
- Grant Surface write access without an explicit, bounded profile allowlist.
- Commit any credential — `**/credentials*` is git-ignored.

## Next (needs Daniel)

1. Confirm the VPS has `wise2-control-bridge-prod` running + a private tailnet path.
2. Mint a dedicated `device:wise2-surface` Bearer; deliver out-of-band to the
   0600 credential file at `credentials/control-token`.
3. (Later) if write access is granted: add a per-device signing-key entry on
   the VPS and install the matching secret at `credentials/signing-key` (0600).
4. Set `BRIDGE_ENABLED=true` + `BRIDGE_BASE_URL=<tailnet>`; verify with
   `wise2 bridge`.
