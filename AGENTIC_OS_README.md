# WISE² Agentic OS

This project now runs as a **persistent operating system** inside Claude Code. Instead of one-shot sessions, work is routed through specialist agents that maintain memory across sessions.

## Architecture

**Four Layers**:

1. **Kernel (CLAUDE.md)** — Routes tasks to agents based on intent keywords
2. **Agents (agents/*.md)** — 5 specialists: @dev, @design, @ops, @writer, @researcher
3. **Commands (.claude/commands/)** — Reusable workflows (future: /daily-sync, /deploy, etc.)
4. **Data (data/)** — File-based persistent memory (daily logs, decisions, projects)

## How It Works

You give the OS a task → Kernel parses intent → Routes to matching agent → Agent reads context from data/ → Executes → Appends to daily logs and data/decisions/

### Five Specialist Agents

| Agent | Triggered By | Tools |
|-------|---|---|
| @dev | `build`, `fix`, `refactor`, `debug`, `code`, `implement`, `test` | Read, Edit, Write, Bash, Git, React/TS reviewer |
| @design | `design`, `redesign`, `brand`, `component`, `ui`, `ux`, `spec` | Design skills, ui-ux-pro-max, brand skills |
| @ops | `deploy`, `server`, `ci`, `docker`, `pm2`, `monitoring` | SSH, Docker, PM2, GitHub Actions |
| @writer | `write`, `draft`, `copy`, `content`, `docs`, `launch`, `email` | Read, Edit, Write, content skills, brand voice |
| @researcher | `research`, `analyze`, `compare`, `competitor`, `market`, `data` | WebSearch, WebFetch, Bash, analysis |

## Data Layer

```
data/
├── daily-logs/        # Session logs (append-only, git-ignored)
├── decisions/         # ADRs (permanent, git-tracked)
├── projects/          # Project context (git-tracked)
├── inbox/             # New tasks (git-ignored)
├── contacts/          # People (git-ignored)
└── templates/         # Reusable formats (git-tracked)
```

Decisions are permanent and part of git history. Daily logs are ephemeral snapshots.

## Usage

### Route a Task
Just tell Claude Code what you need—it auto-routes:

```
"Build the live stream component" → @dev
"Redesign the live stream page" → @design
"Deploy to production" → @ops
"Write launch copy" → @writer
"Analyze competitor platforms" → @researcher
```

### Check Status
```bash
cat data/daily-logs/2026-07-17.md      # What happened today
ls data/decisions/ | tail -5            # Recent decisions
```

### Multi-Agent Workflows
```
"Design, build, and write launch copy for live stream"

Becomes:
1. @design specs the UI
2. @dev implements from specs
3. @writer creates launch copy
4. Kernel synthesizes results
```

## Key Files

| File | Purpose |
|------|---------|
| **CLAUDE.md** | Kernel; source of truth for routing |
| **agents/dev.md** | @dev definition |
| **agents/design.md** | @design definition |
| **agents/ops.md** | @ops definition |
| **agents/writer.md** | @writer definition |
| **agents/researcher.md** | @researcher definition |
| **data/README.md** | Data layer schema |
| **data/daily-logs/** | Session activity |
| **data/decisions/** | Permanent decisions |

## Rules

✅ Read CLAUDE.md at session start (kernel configuration)  
✅ Agents read data/ before each task  
✅ Log work to data/daily-logs/ after each task  
✅ Write decisions to data/decisions/ (ADR format)  
✅ Routes are in CLAUDE.md markdown table  
✅ Data is JSON/markdown only (no external DB)  

❌ Don't edit past daily logs  
❌ Don't hardcode secrets in agent files  
❌ Don't make server changes without documenting  
❌ Don't use Claude Code's built-in cron for production  

## Next Steps

1. Read CLAUDE.md + this file
2. Give it a task matching an agent keyword
3. Check data/daily-logs/ for what happened
4. Make decisions by writing to data/decisions/
5. Iterate based on reflections

---

**The OS is live. Start simple, add automation as needed. See CLAUDE.md for routing rules and agent capabilities.**
