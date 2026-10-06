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

## Progress (2026-10-06)
- [x] **cloudflared installed locally** on Surface at `~/.local/bin/cloudflared`
      (v2026.10.0; user-local, no sudo).
- [x] **Cloudflare account cert** written at `~/.cloudflared/cert.pem` (0600)
      via `cloudflared tunnel login` on the `wise2.net` zone.
- [x] **Tunnel object created** — name `wise2-hermes`,
      UUID `caa3dcb1-a944-4e46-9478-8490629f3b23`. Credentials JSON stored
      at `~/.cloudflared/<UUID>.json` (0400). Not committed; never leaves disk.
- [x] **DNS CNAME live** — `hermes.wise2.net` → `<UUID>.cfargotunnel.com`.
      Verified propagation; HTTPS probe currently returns Cloudflare 530
      (expected until tunnel origin is running on gpu-nmls-1).
- [x] **Browser-path reach architecture recorded** — ADR-0008, runbook at
      `hermes/HERMES-CLOUDFLARE-TUNNEL-RUNBOOK.md`.

## Blocking items (owner: Daniel / production)
- [ ] **Tunnel origin on gpu-nmls-1** — SSH deploy via tailnet still pending.
      Tailscale ACL requires one-time check-mode approval
      (`https://login.tailscale.com/a/...`) which must be done from an
      interactive terminal, not a backgrounded `!` command. After approval,
      run `bash /tmp/.../scratchpad/vps-deploy.sh` (not in repo yet).
- [ ] **VPS status** — confirm `wise2-second-brain` (PM2) is running on the VPS
      (`173.208.x.x`, Ubuntu 22.04); confirm Mongo + Ollama health.
- [ ] **Cloudflare Access policy** — create an Access application for
      `hermes.wise2.net`; identity provider = Google (dwise03@gmail.com) or
      email OTP allow-list; `/brain-stream` must require authentication.
- [ ] **Tailscale reach (host path)** — put the Hermes VPS on the tailnet;
      restrict `tcp:3012` on the Tailscale ACL to the Surface node tag.
      (Partial — gpu-nmls-1 is already on the tailnet; ACL scoping pending.)
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
