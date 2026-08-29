# WISE2 Daily Sync

Load `CLAUDE.md`, then load `promptos/agents/executive.md`.

Produce a concise morning operating brief for WISE2:

1. Read today's daily log from `data/daily-logs/<today>.md` if it exists.
2. Read the most recent 3 ADRs from `data/decisions/`.
3. Check `data/inbox/` for blockers or open ideas if it exists.
4. Run lightweight local context checks: `git status --short`, recent commits, and relevant TODO markers.
5. Synthesize:
   - current active work
   - known blockers
   - highest-leverage next actions
   - verification gaps

If today's daily log does not exist, create it using the standard daily-log headings from `CLAUDE.md`.

Append a short session entry to today's daily log summarizing the sync. Do not edit previous historical entries.
