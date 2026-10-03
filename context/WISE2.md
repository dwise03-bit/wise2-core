# WISE² — What This Is

> Canonical identity document. Human- and agent-readable. Keep factual.
> Last updated: 2026-10-02

## Summary

**WISE²** is an operating environment built on a stable Ubuntu 24.04 LTS
foundation. It is not "Ubuntu with a wallpaper" — it is a layered workstation
that unifies AI development agents, authorized security testing, durable shared
memory, a command center, and secure private-mesh remote administration.

This machine — **WISE² Surface** (`Wise2-surface`) — is the **primary WISE²
Linux AI / Security / Development Workstation**.

## The layers

1. **Foundation** — Ubuntu 24.04.5 LTS + Surface kernel (`6.19.8-surface-3`).
2. **Workspace** — `/opt/wise2` canonical tree (owned by `dwise`).
3. **Shared context** — `/opt/wise2/context` (this layer): one truth for all agents.
4. **AI agents** — Claude Code (native), OpenAI Codex (installed; auth separately verified), future WISE² agents.
5. **Hermes** — the durable second-brain / memory & orchestration layer.
6. **Shannon** — AI-assisted *authorized* security testing (flagship capability).
7. **Command Center** — web UI surfacing system, security, and agent state.
8. **Mesh** — Tailscale private device network + OpenSSH remote administration.

## Core principles

- **One brain, not many.** Claude, Codex, Hermes and future agents read and
  write the same `/opt/wise2/context`. They must not drift into conflicting
  private views of the project. See `AGENT-RULES.md`.
- **Least privilege.** `dwise` owns development content; root is used only where
  genuinely required (system paths, services).
- **Reversible first.** Prefer changes that can be undone. Back up before
  modifying anything unknown or production-shaped.
- **Authorized security only.** Shannon tests only targets Daniel owns or is
  explicitly authorized to test. No scan ever starts automatically.
- **No secrets in Git, logs, or context.** Ever.
- **Preserve what works.** Surface kernel, touch stack, Claude, Tailscale,
  OpenSSH, Docker, Shannon are validated and must not be casually replaced.

## Key paths

| Path | Purpose |
|---|---|
| `/etc/wise2-release` | WISE² identity marker |
| `/opt/wise2` | WISE² root (dwise-owned) |
| `/opt/wise2/context` | Shared context layer (this directory) |
| `/opt/wise2/CLAUDE.md` | Agent operating instructions |
| `/opt/wise2/security` | Shannon engagement workspace |
| `/usr/local/bin/wise2-shannon` | Shannon launcher |
| `/usr/local/bin/wise2-pentest` | Guarded authorized-testing launcher |
| `/opt/wise2/logs` | Setup/audit logs |

## Related docs

`ARCHITECTURE.md` · `CURRENT-STATE.md` · `DEVICES.md` · `NETWORK.md` ·
`SERVICES.md` · `SECURITY.md` · `DECISIONS.md` · `RUNBOOK.md` ·
`AGENT-RULES.md` · `HANDOFF-TEMPLATE.md` · `CHANGELOG.md`
