# WISE² Architecture Decisions

> Append-only log of decisions that shape WISE². Each entry: date, decision,
> rationale, consequences. Newest at top. Last updated: 2026-10-02.

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
