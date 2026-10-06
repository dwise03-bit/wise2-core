# WISE² Architecture Decisions

> Append-only log of decisions that shape WISE². Each entry: date, decision,
> rationale, consequences. Newest at top. Last updated: 2026-10-06.

## ADR-0008 — Hermes reach: Cloudflare Access in the browser, Tailscale host-to-host (2026-10-06)
**Decision:** Browser clients (Command Graph UI) reach Hermes through
`wss://hermes.wise2.net/brain-stream`, where the hostname is a Cloudflare
Tunnel origin protected by a Cloudflare Access policy. The browser
authenticates via the Cloudflare Access session cookie; no Hermes token lives
in the JS bundle. Tailscale remains the private reach between the VPS and
other WISE² hosts (CLI tooling, device agents) — the browser does not join
the tailnet. ADR-0005's "Tailscale-private only, DISABLED until endpoint
+ credential exist" is superseded for the browser path; its credential-
custody principle still binds every non-browser integration.
**Rationale:** Browsers can't reasonably join a Tailscale network, and
putting a Hermes device JWT in a bundle (even locally served) leaks it to
every page viewer. Cloudflare Access gives revocable per-identity auth that
the browser already understands (cookie, SSO), the Tunnel keeps the VPS
origin private (no public port, no public DNS A record pointing at the box),
and the server-side token custody that ADR-0005 required is still intact
for the CLI/device agent paths over Tailscale.
**Consequences:** New production work owned by Daniel: stand up `cloudflared`
on the VPS pointing at the second-brain `/brain-stream` SSE/WS endpoint;
create a Cloudflare Access application for `hermes.wise2.net` with an email
allow-list or SSO identity provider; publish the `wss://` endpoint. The UI
is opt-in: default source stays `SimulatedEventSource` and the real client
only activates with `?source=hermes` in the URL. The real client reconnects
on close with a 3-second backoff and never sends auth material in the URL.
Updates in `hermes/HERMES-PRODUCTION-CONNECTION-PENDING.md`.

## ADR-0007 — Agent Command Graph UI as a sibling React app (2026-10-06)
**Decision:** Add `command-center-ui/` next to the existing Python
`command-center/` as a Vite + React + TypeScript app using `@xyflow/react` and
`zustand`, bound to 127.0.0.1:3011. The existing stdlib HTTP server at
127.0.0.1:3010 is untouched. Live events flow through an `EventSource` adapter;
`SimulatedEventSource` drives development, `WebSocketEventSource` is wired to
connect through a same-origin loopback path (e.g. `ws://127.0.0.1:3010/brain-stream`)
once Daniel confirms the production Hermes gateway (`hermes.wise2.net`) and
supplies the scoped device credential.
**Rationale:** The pasted Command Center 4.0 spec requires an animated,
interactive, real-time graph canvas — React Flow + custom SVG edges with
`animateMotion` cover the first-slice vertical (Hermes + 5 agents, animated
edges, drag/pan/zoom, selection, inspector, follow-execution, timeline, replay).
A vanilla-JS implementation inside `command-center/public/` is possible but
would duplicate the viewport primitives React Flow already provides and does
not scale cleanly to the full spec's node inspector, timeline replay, and
layer toggles. Keeping the two UIs side-by-side preserves the audited Python
server, respects CLAUDE.md's "small, reversible changes" guidance, and lets
the new app be removed as a unit if a different stack is chosen.
**Consequences:** New npm dependencies (`react`, `react-dom`, `@xyflow/react`,
`zustand`) locked to this subdirectory only. No systemd unit is added; the
app is launched manually via `npm run dev` or built static assets served by a
future same-origin route under the Python server (loopback only, read-only).
Browser never holds Hermes credentials; a loopback proxy is required before
`WebSocketEventSource` becomes the active source. CSP for any route that
serves the built bundle must widen beyond the current `script-src 'self'`
only enough for a hashed/served bundle — no external CDNs. First slice is
STAGED and runs against simulated events; it is not wired to production and
is not reachable off-loopback.

## ADR-0006 — Shared observations and metadata-only recovery (2026-10-03)
**Decision:** CLI/dashboard use one standard-library read-only probe layer;
registration is separate from observation. Backups use a compiled source/metadata
allowlist with full manifest verification, excluding credentials, runtime env,
security evidence and arbitrary system/project data. Operation logs accept only
fixed safe event fields. Hermes stays the existing remote client contract.
**Rationale:** Prevent false PASS/telemetry drift and avoid treating file presence
or incomplete archives as health/recovery evidence. Keep authorization boundaries
and existing service/launchers intact.
**Consequences:** v0.2 is staged in a separate writable checkout because this
session cannot apply/test live operations on `/opt/wise2`. Host rollout,
physical/browser checks and post-reboot acceptance remain required. No automatic
restore, remote job/approval engine or competing Hermes daemon is created.

## ADR-0005 — Hermes: Tailscale-private target + dedicated device credential (2026-10-02)
**Decision:** Surface connects to the existing production Hermes over a
Tailscale-PRIVATE endpoint using a dedicated, scoped, revocable WISE² device
credential (NOT JWT_SECRET). The Surface client is built but DISABLED until the
real endpoint + credential exist. Production (VPS/DNS/Cloudflare/nginx/Hermes/
Mongo/JWT/Tailscale ACL) is not modified.
**Rationale:** Read-only discovery confirmed Hermes = Express second-brain
api-server (PM2 wise2-second-brain, :3012 loopback on VPS 173.208.x.x), JWT auth,
Mongo+Ollama; no safe machine-auth exists in code (no service accounts/API keys/
device flow). Sharing JWT_SECRET with a client is unsafe; a per-device credential
is revocable and auditable.
**Consequences:** Honest 4-state (CONFIGURED/REACHABLE/AUTHENTICATED/MEMORY;
READY only if all pass) shown in `wise2 hermes`, `wise2 doctor`, Command Center.
Open production work tracked in hermes/HERMES-PRODUCTION-CONNECTION-PENDING.md.
Evidence in hermes/HERMES-INTEGRATION.md. See hermes/DEVICE-CREDENTIAL.md.
## ADR-0004 — Surface is a Hermes CLIENT, not a Hermes host (2026-10-02)
**Decision:** /opt/wise2/hermes on Wise2-surface is a thin client/integration
layer to the existing production Hermes (canonical repo dwise03-bit/wise2-core,
second-brain/api-server, MongoDB, port 3012, Command Center via /brain-api).
No local Hermes server/stub is deployed here.
**Rationale:** Production Hermes already exists; a second instance would fork the
"one brain." Read-only audit (2026-10-02) confirmed Hermes is remote and not
present/reachable from Surface; historic public endpoint command.wise2.net does
not currently resolve, so the live endpoint must be confirmed before wiring.
**Consequences:** Earlier stub-skeleton plan cancelled. Wiring blocked on: live
endpoint confirmation, GitHub auth to read wise2-core, and an agreed auth/sync
contract. See hermes/HERMES-INTEGRATION.md.
## ADR-0003 — Context layer is the single source of truth (2026-10-02)
**Decision:** All agents (Claude, Codex, Hermes) read/write `/opt/wise2/context`
and must update `CURRENT-STATE.md` + `CHANGELOG.md` per task.
**Rationale:** Prevent divergent, conflicting per-agent project state.
**Consequences:** Agents follow `AGENT-RULES.md`; context syncs via Git (no secrets).

## ADR-0002 — Least-privilege ownership of /opt/wise2 (2026-10-02)
**Decision:** `/opt/wise2` and children are owned by `dwise`, not root.
**Rationale:** Development content shouldn't need root; reduces blast radius.
**Consequences:** Root reserved for /etc, /usr/local/bin, systemd units.

## ADR-0001 — Preserve validated components (2026-10-02)
**Decision:** Do not reinstall/replace Surface kernel, touch stack, Claude
native install, Tailscale, OpenSSH, Docker, or Shannon launchers.
**Rationale:** They are audited and working; churn risks boot/networking/touch.
**Consequences:** Build is additive; replacements require explicit instruction.
