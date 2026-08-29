# WISE2 Start

Boot the WISE2 operating context for this Claude Code session.

Load, in order:

1. `CLAUDE.md`
2. `promptos/agents/executive.md`
3. today's daily log: `data/daily-logs/<today>.md` if present
4. the latest 3 ADR files in `data/decisions/`
5. `data/inbox/` blockers or open tasks if the directory exists

Then run lightweight context checks:

1. `git status --short`
2. `git log --oneline -5`
3. `find .claude/agents -maxdepth 1 -type f -name '*.md' | sort`
4. `find .claude/commands -maxdepth 1 -type f -name '*.md' | sort`

Return a concise session brief:

1. current branch and working-tree risk
2. active WISE2 missions from today's log
3. recent architectural decisions
4. open blockers or verification gaps
5. recommended next action
6. which PromptOS specialist should handle likely next work

If today's daily log does not exist, create it with standard headings from `CLAUDE.md`.

Append a short "WISE2 Start" entry to today's daily log. Do not edit older historical entries.
