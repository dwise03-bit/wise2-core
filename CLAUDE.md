# CLAUDE.md — WISE² Operating Instructions

> You are an AI development agent operating inside **WISE²** on `Wise2-surface`.
> This file is your contract. Read it first, then the context layer.
> Last updated: 2026-10-02.

## 1. What WISE² is

WISE² is a layered AI / Security / Development workstation built on Ubuntu 24.04
LTS. It unifies AI agents, authorized security testing (Shannon), durable shared
memory (Hermes), a Command Center UI, and a Tailscale private mesh. Full
description: `/opt/wise2/context/WISE2.md`.

## 2. Read these before working

1. `/opt/wise2/context/WISE2.md` — identity & principles
2. `/opt/wise2/context/ARCHITECTURE.md` — layout & components
3. `/opt/wise2/context/CURRENT-STATE.md` — what's done / pending **(update this)**
4. `/opt/wise2/context/AGENT-RULES.md` — the binding rules
5. Domain docs as needed: `SECURITY.md`, `NETWORK.md`, `SERVICES.md`,
   `DEVICES.md`, `DECISIONS.md`, `RUNBOOK.md`

## 3. Directory structure

Canonical tree is `/opt/wise2/` (owned by `dwise`). Map in `ARCHITECTURE.md`.
Your development output goes under `projects/`, `shared/`, `core/`, `agents/`.
Shared truth is `context/`. Operator docs are `docs/`. Controlled scripts are
`scripts/` (invoked by the `wise2` CLI).

## 4. Development conventions

- Shell scripts: `#!/usr/bin/env bash`, `set -euo pipefail`, quote variables,
  no `eval`, no untrusted input to a shell.
- Match surrounding code style. Prefer small, reviewable, reversible changes.
- Put reusable scripts in `/opt/wise2/scripts`; the `wise2` CLI calls them.
- Localhost-bind dev services unless Daniel approves exposure.

## 5. Safety boundaries (hard rules)

- **Never** commit or print secrets/tokens/keys/credentials.
- **Never** modify production blindly — back up unknown/production config first.
- **Prefer reversible changes**; audit before destructive work.
- **Do not** remove the Surface kernel (`6.19.8-surface-3`) or the generic
  fallback kernels.
- **Do not** expose services publicly or add router port-forwarding.
- **Do not** modify the Tailscale ACL, DNS, or firewall automatically.
- **Do not** replace validated components (Claude native, Shannon launchers,
  Docker, OpenSSH, Tailscale) without explicit instruction.

## 6. Production boundaries

Treat anything outside `/opt/wise2` (system config, other users' data, remote
hosts, GitHub remotes) as production. Changing it needs Daniel's go-ahead.

## 7. Shannon authorization requirements

- Security testing only against targets Daniel **owns or is explicitly
  authorized** to test. Full policy: `/opt/wise2/context/SECURITY.md`.
- **Never launch a scan automatically.** Use `wise2-pentest` (authorization
  gate) for engagements. You may prepare scaffolding; a human authorizes & runs.
- Command Center surfaces Shannon **read-only** via an allowlisted server-side
  adapter — never arbitrary shell from the browser.

## 8. Git workflow

- Git identity is configured in the preserved baseline; verify it read-only.
  If missing, ask Daniel rather than inventing a name/email.
- `.gitignore` must protect secrets (`.env*`, `*.pem`, `*.key`, credentials,
  tokens, SSH material, security evidence, local agent creds).
- **Before pushing anything**, show remotes + status and **ask Daniel**.
- **Never force-push automatically.** Never invent remotes/orgs/usernames.

## 9. Backup requirements

- Back up config **before** significant modifications (to `/opt/wise2/backups`).
- `wise2 backup` (Phase 9/12) snapshots config + context.

## 10. Documentation requirements

Every meaningful change updates the context layer:
- **`CURRENT-STATE.md`** — current reality + pending items.
- **`CHANGELOG.md`** — dated entry (append, newest at top).
- **`DECISIONS.md`** — add an ADR when you make an architectural choice.

### How to update CURRENT-STATE.md
Edit the relevant table/section to reflect reality now; move finished items out
of "pending"; add new warnings/blockers. Keep it factual.

### How to record an architecture decision
Append an `ADR-NNNN` block (date, decision, rationale, consequences) at the top
of `DECISIONS.md`.

## 11. Handing work between Claude / Codex / Hermes

Write a handoff using `/opt/wise2/context/HANDOFF-TEMPLATE.md` into
`/opt/wise2/agents/handoffs/<UTC-timestamp>-<slug>.md`. It must let the next
agent continue from the record alone. No secrets.

## 12. When to pause for Daniel

auth/secret needed · destructive/irreversible op · production change · GitHub
remotes/permissions/push · Tailscale ACL / DNS / firewall · security target
authorization · **sudo required (this session has no sudo password)** · a
genuine judgment call. See `AGENT-RULES.md` for the full list.

## 13. This session's environment note

The agent running this build operates as `dwise`, owns `/opt/wise2`, is in the
`docker` and `sudo` groups, **but has no sudo password** — so apt installs,
`/usr/local/bin`, systemd units, and branding changes are pause points.
