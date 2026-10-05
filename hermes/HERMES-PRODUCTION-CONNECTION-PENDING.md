# HERMES-PRODUCTION-CONNECTION-PENDING

> Tracking record for the unresolved production work required before Surface can
> actually connect to Hermes. Opened 2026-10-02. Last reviewed 2026-10-05 —
> still blocked on the items below. **No production changes made.**

## Target architecture (approved)
- **Tailscale-private** reach: Surface → private Hermes endpoint → authenticated API.
- **Dedicated WISE² device credential** (see DEVICE-CREDENTIAL.md). Never share JWT_SECRET.
- Surface client built but **DISABLED** until endpoint + credential exist.

## 2026-10-05 findings (read-only probe from Surface)

- **VPS confirmed as `gpu-nmls-1`** (tailnet `100.68.145.5`), owner `dwise03@`.
  TSMP pong 264 ms — peer is live and reachable from Surface.
- **Loopback-only ports as documented:** TCP 3012 (Hermes) and 3099 (control-bridge)
  are closed from the tailnet — expected, no change needed.
- **nginx is running** (`nginx/1.24.0 Ubuntu`) and open on 80 + 443. Port 80
  redirects everything to HTTPS same-host.
- **nginx TLS gap:** every HTTPS handshake to `100.68.145.5:443` fails with
  `TLSv1.3 internal error` for every SNI tried (`100.68.145.5`, `gpu-nmls-1`,
  `command.wise2.net`, `wise2.net`, `brain.wise2.net`). nginx has no cert
  matching any hostname Surface can reach. Either fix the nginx TLS config, or
  (preferred) bypass it entirely with `tailscale serve` (see runbook below).

## Blocking items (owner: Daniel / production)
- [ ] **VPS status** — confirm `wise2-second-brain` (PM2) is running on
      `gpu-nmls-1`; confirm Mongo + Ollama health.
- [ ] **Public DNS** — `command.wise2.net` has NO A/AAAA/CNAME now. Decide:
      intentionally down vs restore. (Private path preferred regardless.)
- [ ] **Private reach (preferred: `tailscale serve`)** — on `gpu-nmls-1`, run
      the steps in `docs/VPS-TAILSCALE-SERVE-RUNBOOK.md` to publish
      `/brain-api → 127.0.0.1:3012` on the tailnet. Record the resulting
      `https://gpu-nmls-1.<tailnet>.ts.net/brain-api` URL in `HERMES_BASE_URL`.
- [ ] **Impl confirm** — Express `second-brain/api-server` (evidence: live) vs
      NestJS `packages/api/brain-auth` (next-gen?). Confirm on the box.
- [ ] **Device credential** — choose design (scoped device JWT recommended),
      mint server-side, deliver out-of-band, install to 0600 credential file.
- [ ] **Enable** — set `HERMES_ENABLED=true` + `HERMES_BASE_URL`; verify
      CONFIGURED→REACHABLE→AUTHENTICATED→MEMORY→READY via `wise2 hermes`.

## Must NOT change without explicit approval
Production VPS, DNS, Cloudflare, nginx, production Hermes, MongoDB, JWT config,
Tailscale ACL. (All currently untouched.)

## Evidence
Read-only inspection: `hermes/HERMES-INTEGRATION.md`. Temp clone (~610 MB) kept
in the session scratchpad only — NOT committed into /opt/wise2.
