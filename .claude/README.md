# Claude Code Setup for WISE2

This directory makes Claude Code operate as a WISE2 PromptOS collaborator when opened at the repository root.

## Startup Contract

At the start of each Claude session:

1. Read `CLAUDE.md`.
2. Read `promptos/agents/executive.md`.
3. Read `data/daily-logs/<today>.md` if it exists.
4. List the latest files in `data/decisions/` and read the relevant recent ADRs.
5. Check `data/inbox/` for blockers or untriaged work if the directory exists.
6. Route the request to the relevant PromptOS specialist prompt under `promptos/agents/`.

## Command Palette

Slash commands live in `.claude/commands/`:

- `/daily-sync` - summarize current status, blockers, and next actions.
- `/wise2-start` - boot the full WISE2 operating context for a fresh session.
- `/status` - run a lightweight repo and service health check.
- `/deploy` - perform the WISE2 deployment workflow with verification gates.
- `/research <topic>` - run cited research and store durable findings.
- `/decision <topic>` - record an ADR in `data/decisions/`.
- `/live-stream-redesign` - coordinate the legacy live-stream page workflow.

## Native Subagents

Project subagents live in `.claude/agents/` and mirror the PromptOS specialists:

- `wise2-developer`
- `wise2-infrastructure`
- `wise2-qa`
- `wise2-security`
- `wise2-research`
- `wise2-marketing`

Each subagent loads `CLAUDE.md`, the Executive prompt, and its matching `promptos/agents/*.md` specialization before doing work.

## Operating Rules

- Treat `CLAUDE.md` as the Claude-specific mirror of `AGENTS.md`.
- Use PromptOS prompts for routing; do not hardcode agent behavior in scripts.
- Keep `data/daily-logs/` append-only.
- Put durable decisions in `data/decisions/` as ADRs.
- Do not store credentials in prompts, command files, or git-tracked docs.
- Do not claim production readiness without build, test, and live verification evidence.
- Keep destructive commands out of shared approvals; require explicit user intent before any reset, clean, recursive delete, or broad permission change.
- Review `.claude/settings.local.json` periodically with `/config` because it contains personal one-off permission approvals and is intentionally not project-shared.
