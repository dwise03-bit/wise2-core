# WISE² Architecture

> Last updated: 2026-10-03

## Directory map (`/opt/wise2`)

```
/opt/wise2/
├── core/            # shared libraries / cross-cutting WISE² code
├── command-center/  # web app: system + security + agent dashboard (Phase 8)
├── hermes/          # second-brain memory/orchestration service (Phase 6)
├── agents/          # agent definitions, prompts, handoff artifacts
├── shannon/         # Shannon working dir (launcher cd's here)
├── security/        # authorized security engagements (see SECURITY.md)
│   ├── engagements/ targets/ configs/ evidence/ reports/ logs/
├── projects/        # dwise development projects
├── shared/          # shared assets across projects
├── context/         # <-- canonical shared context (this layer)
├── docs/            # operator docs (hardware, remote access, build report)
├── scripts/         # controlled scripts invoked by the `wise2` CLI
├── services/        # service configs / unit templates (no secrets)
├── config/          # non-secret configuration
├── logs/            # setup/audit/operational logs
├── evidence/        # general evidence store
├── backups/         # backup framework output
├── support/         # remote-support architecture (consent-based)
├── devices/         # non-secret device manifests
├── recovery/        # recovery & diagnostics docs
└── tools/           # helper tooling
```

Ownership: `dwise:dwise` throughout (least privilege). Root is used only for
`/etc`, `/usr/local/bin`, and systemd units.

## Component responsibilities

### Shared context (`context/`)
The single source of truth. Every agent reads it at task start and updates
`CURRENT-STATE.md` + `CHANGELOG.md` at task end. Versionable via Git (non-secret
content only). This is how Claude / Codex / Hermes stay coherent.

### Agents
- **Claude Code** — native install at `~/.local/bin/claude`, authenticated.
  Primary development + ops agent. Reads `/opt/wise2/CLAUDE.md`.
- **OpenAI Codex** — installed; version command verified (auth is separate). Shannon's AI backend is configured as
  `openai-codex:gpt-5.6-sol`, so Codex is also a Shannon dependency.
- **Future WISE² agents** — must conform to `AGENT-RULES.md` + `HANDOFF-TEMPLATE.md`.

### Hermes (second brain)
Surface is a disabled client of the existing remote production Hermes, not a
local Hermes host. ADR-0004/0005 and the existing connection record govern it.
No competing brain/Mongo service is installed. Endpoint and dedicated device
credential remain prerequisites owned by Daniel.

### Shannon (security center)
AI-assisted authorized pentesting. Invoked only via `wise2-shannon` /
`wise2-pentest`. Hard authorization gate. Command Center will display Shannon
status/findings through a **server-side allowlisted adapter** — never arbitrary
shell from the browser.

### Command Center
Web app (deep black/navy + chrome + electric green). Reads safe local status via
a system-status API. Binds to **localhost** unless Daniel approves exposure.
No arbitrary command execution from the browser.

### Mesh & remote admin
Tailscale (100.97.230.73) + OpenSSH over the tailnet. No router port-forwarding.
Tailscale SSH feature present but tailnet ACL does not authorize it — standard
OpenSSH over Tailscale is the supported path.

## Data-flow intent

```
            ┌──────────────┐
  operator →│ Command Center│→ system-status API (read-only, allowlisted)
            └──────┬───────┘
                   │ allowlisted adapter (no raw shell)
        ┌──────────┼───────────┐
        ▼          ▼           ▼
     Shannon    Hermes      wise2 CLI / scripts
        │          │           │
        └──────────┴───────────┘
                   │
            /opt/wise2/context  (shared truth, Git-versioned, no secrets)
```

## Trust boundaries

- Browser UI → **read-only** status + allowlisted operations only.
- Secrets live outside Git and outside context (env files, OS keyring, Tailscale).
- Security evidence stays local; only appropriate non-secret artifacts sync.

## v0.2 source upgrade — STAGED, host rollout blocked

`core/runtime.py` supplies fixed shared probes to CLI/dashboard; `core/backup.py`
provides allowlisted manifest backups and enum-only rotated logs; `core/hermes.py`
implements the existing read-only client contract without argv credentials.
Registry is local-first with separate derived observation fields. The dashboard
has no mutation routes. Source tests do not establish live service resilience.
See `docs/OPERATIONS.md` and `CURRENT-STATE.md` for status and deployment limits.
