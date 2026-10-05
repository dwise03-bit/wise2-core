# HERMES-PRODUCTION-CONNECTION-PENDING

> Tracking record for the unresolved production work required before Surface can
> actually connect to Hermes. Opened 2026-10-02. Last reviewed 2026-10-05 —
> still blocked on the items below. **No production changes made.**

## Target architecture (approved)
- **Tailscale-private** reach: Surface → private Hermes endpoint → authenticated API.
- **Dedicated WISE² device credential** (see DEVICE-CREDENTIAL.md). Never share JWT_SECRET.
- Surface client built but **DISABLED** until endpoint + credential exist.

## Blocking items (owner: Daniel / production)
- [ ] **VPS status** — confirm `wise2-second-brain` (PM2) is running on the VPS
      (`173.208.x.x`, Ubuntu 22.04); confirm Mongo + Ollama health.
- [ ] **Public DNS** — `command.wise2.net` has NO A/AAAA/CNAME now. Decide:
      intentionally down vs restore. (Private path preferred regardless.)
- [ ] **Private reach** — put the Hermes VPS on the tailnet (or a relay), expose
      `/brain-api → :3012` over Tailscale only (no new public port). Record the
      tailnet IP to set `HERMES_BASE_URL`.
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
