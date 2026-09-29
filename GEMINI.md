# WISE² Gemini CLI Context

@./CLAUDE.md

## Gemini-specific operating notes

- Treat the imported `CLAUDE.md` as shared WISE² project guidance; references to Claude mean the active coding agent, including Gemini.
- This is a large, active monorepo. Inspect the nearest `README.md`, `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md` before changing a component.
- Preserve unrelated working-tree changes. Never discard, overwrite, or reformat user work outside the requested scope.
- Never read, print, commit, or copy secret values from `.env*`, credentials, certificates, or production configuration. Use tracked example files for variable names only.
- Use `pnpm` from the repository root. Prefer workspace-scoped checks before full-repository checks.
- Before editing, inspect relevant code and current git status. After editing, run the narrowest relevant type-check, lint, or test and report anything not verified.
- Ask before deployments, destructive commands, production data changes, external messages, purchases, or account-level configuration changes.
- Do not automatically create daily logs, decisions, reflections, or other operational records unless the user asks or the task materially requires one.

