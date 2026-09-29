# Paperclip — WISE² Agent Orchestration Runtime

[Paperclip](https://paperclip.ing/) (`paperclipai`, MIT) is a self-hosted platform
for running teams of AI agents as if they were a company: an org chart, per-agent
budgets, goal alignment, approvals, and a full audit log. It is the **runtime** for
the agent-registry concept described in the repo's [CLAUDE.md](../../CLAUDE.md).

- Upstream: https://github.com/paperclipai/paperclip
- Package: `paperclipai` (pinned to `2026.707.0` in `paperclip.sh`)
- Stack: Node.js CLI + `@paperclipai/server` (WebSocket) + Postgres (bundled
  `embedded-postgres`, or bring your own via `DATABASE_URL`)

## Quick start

```bash
cd services/paperclip
cp .env.example .env          # fill in model API keys
./paperclip.sh onboard        # interactive first-run wizard (creates local DB + server)
./paperclip.sh run            # onboard + doctor, then start the instance
./paperclip.sh doctor         # diagnose an existing setup
./paperclip.sh --help         # full command surface
```

> ⚠️ `onboard` and `run` are **stateful**: they stand up a local Postgres data
> directory and a long-running server process, and the wizard is interactive.
> Run them in a real terminal — not in a headless/CI context.

## Mapping WISE² agents → Paperclip org chart

The WISE² kernel already defines specialist agents. In Paperclip these become
hireable agents on the org chart, each with a role, budget, and audit trail:

| WISE² agent  | Paperclip role            | Suggested monthly budget |
|--------------|---------------------------|--------------------------|
| `@dev`       | Software Engineer         | $100                     |
| `@design`    | Product/UX Designer       | $50                      |
| `@ops`       | DevOps / Infrastructure   | $50                      |
| `@writer`    | Content Strategist        | $30                      |
| `@researcher`| Analyst / Research        | $50                      |

After onboarding, create them via the CLI (examples — see `./paperclip.sh org`
and `./paperclip.sh agent` for exact flags):

```bash
./paperclip.sh org            # inspect / edit the org chart
./paperclip.sh agent          # agent operations (create, configure, pause)
./paperclip.sh budget         # per-agent spend policies & incidents
./paperclip.sh approval       # approve agent actions as the board
./paperclip.sh activity       # audit log of tool calls & decisions
```

## Why this lives here (not auto-run)

Incorporation is intentionally **config-only** in the repo. Standing up the
embedded Postgres cluster + daemon is a persistent, machine-local action with an
interactive wizard, so it is left for a human to run rather than executed during
an automated session. Everything needed to launch it is in this directory.

## Governance notes

- Budgets auto-pause agents at their monthly ceiling (`PAPERCLIP_DEFAULT_AGENT_BUDGET_USD`).
- All agent tool calls and decisions are logged — surface them with `activity`.
- Model-agnostic: works with Anthropic, OpenAI, Gemini, or custom agents via
  heartbeat signals (`./paperclip.sh heartbeat`).
