# WISE2 Status Check

Load `CLAUDE.md`, then load these PromptOS agents:

- `promptos/agents/executive.md`
- `promptos/agents/developer.md`
- `promptos/agents/infrastructure.md`
- `promptos/agents/qa.md`

Run a lightweight status check without making code changes unless the user explicitly asks for fixes:

1. `git status --short`
2. recent commits on the current branch
3. package manager and runtime versions relevant to the current app
4. targeted build/test commands only when they are cheap and relevant
5. service/container checks only when the request concerns deployment or runtime health

Report findings in this order:

1. overall status
2. active changes and risk
3. verification evidence
4. blockers
5. recommended next action

Append a short status-check entry to `data/daily-logs/<today>.md`. Keep prior log content append-only.
