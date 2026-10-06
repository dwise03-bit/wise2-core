# HERMES-PRODUCTION-CONNECTION-PENDING

> Tracking record for the unresolved production work required before Surface can
> actually connect to Hermes. Opened 2026-10-02. **No production changes made.**

## Target architecture (approved, 2026-10-06 — superseded split)
**Two reach paths** (see `context/DECISIONS.md` ADR-0008):
- **Browser → Hermes:** `wss://hermes.wise2.net/brain-stream`, Cloudflare
  Tunnel origin behind a Cloudflare Access policy. Access cookie carries
  auth; no Hermes token in the JS bundle. Browser does NOT join the tailnet.
- **Host-to-host (CLI, device agents) → Hermes:** Tailscale-private; scoped
  WISE² device credential (see DEVICE-CREDENTIAL.md). Never share JWT_SECRET.
- Surface browser UI built but **DISABLED by default**; opt-in with
  `?source=hermes` once the production path is live.

## Blocking items (owner: Daniel / production)
- [ ] **VPS status** — confirm `wise2-second-brain` (PM2) is running on the VPS
      (`173.208.x.x`, Ubuntu 22.04); confirm Mongo + Ollama health.
- [ ] **Cloudflare Tunnel (browser path)** — install `cloudflared` on the VPS;
      configure a tunnel with ingress rule `hermes.wise2.net → http://127.0.0.1:3012`
      (SSE) or the WS endpoint; publish the `hermes.wise2.net` CNAME to the
      tunnel.
- [ ] **Cloudflare Access policy** — create an Access application for
      `hermes.wise2.net`; identity provider = Google (dwise03@gmail.com) or
      email OTP allow-list; `/brain-stream` must require authentication.
- [ ] **Tailscale reach (host path)** — put the Hermes VPS on the tailnet;
      restrict `tcp:3012` on the Tailscale ACL to the Surface node tag.
- [ ] **Impl confirm** — Express `second-brain/api-server` (evidence: live) vs
      NestJS `packages/api/brain-auth` (next-gen?). Confirm on the box, and
      ensure the chosen service exposes `/brain-stream` as SSE or WS.
- [ ] **Device credential (host path only)** — mint scoped device JWT
      server-side, deliver out-of-band, install to 0600 credential file.
- [ ] **Enable** — set `HERMES_ENABLED=true` + `HERMES_BASE_URL` for CLI;
      verify browser can connect via Cloudflare Access login flow and
      receives at least one `node.status` event.

## Must NOT change without explicit approval
Production VPS, DNS, nginx, production Hermes, MongoDB, JWT config,
Tailscale ACL, Cloudflare Access policies, Cloudflare Tunnel config.
(All currently untouched by this session.)

## Evidence
Read-only inspection: `hermes/HERMES-INTEGRATION.md`. Temp clone (~610 MB) kept
in the session scratchpad only — NOT committed into /opt/wise2.
