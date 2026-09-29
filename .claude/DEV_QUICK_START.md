# WISE² Core — Development Quick Start

**Environment**: Configured for local AI coding on macOS  
**Date**: 2026-08-29  
**Branch**: feat/wise2-hvac-field-tech-v1

---

## 1. Before You Start

```bash
# Verify environment
node --version      # Should be v26.7.0+
pnpm --version      # Should be 8.15.9+
git branch          # Should show current branch

# Install dependencies (if needed)
pnpm install
```

---

## 2. Quick Dev Server Launcher

Start any app with `/preview_start`:

```bash
/preview_start {name}
```

**Available servers** (configured in `.claude/launch.json`):
- `api` — Backend API (3000)
- `website` — Landing site (3001)
- `dashboard` — Command center (3005)
- `studio` — Creative studio (3005 — share port with dashboard)
- `wise-hvac-demo` — HVAC field tech (3024)
- `getdown-demo` — Demo app (3020)

**Example**:
```bash
/preview_start api        # Start backend
/preview_start website    # Start website in browser tab
```

---

## 3. Project Structure

```
wise2-core/
├── apps/                 # User-facing applications
│   ├── website/          # Landing site (Next.js)
│   ├── dashboard/        # Admin dashboard (Next.js)
│   ├── wise-hvac-demo/   # Field tech demo (Next.js)
│   ├── studio/           # Creative studio (Next.js)
│   └── [18 more apps]/
│
├── packages/             # Shared libraries & backend
│   ├── api/              # NestJS backend (port 3000)
│   ├── db/               # Prisma schemas
│   ├── ui/               # Shared React components
│   └── [more packages]/
│
├── .claude/              # Claude Code config
│   ├── settings.json     # Project settings
│   ├── launch.json       # Dev server config
│   ├── skills/           # Custom skills
│   └── CLAUDE.md         # (at repo root)
│
└── docker-compose.prod.yml  # Production stack
```

---

## 4. Claude Code Features

### Model Selection
- **Default (Haiku)** — Fast, cheap, for routine fixes/edits
- **`@architecture`** — Sonnet for design decisions
- **`@deploy`** — Sonnet for deployment strategy
- **`@review`** — Opus for deep code review
- **`@debug`** — Sonnet for tricky bugs

**Usage**:
```
@debug: Why is the API timing out on prod?
@architecture: Design the cache layer for this feature
```

### Workflows (Multi-Agent)
Enable with `/loop` or `@workflow`:

```bash
/loop 5m /check-deploy    # Poll every 5 min
@workflow find-broken-imports  # Fan-out search
```

### Skills
Load specialized workflows:

```bash
/run                      # Launch dev server
/code-review              # Review current diff
/simplify                 # Clean up code
/security-review          # Check for vulns
```

---

## 5. Common Workflows

### ✅ Fix a Bug
```bash
1. git status
2. Read affected file(s)
3. @debug: [explain the issue]
4. Edit → fix
5. Run tests → verify
6. git commit -m "fix: [description]"
```

### 🏗 Build a Feature
```bash
1. @architecture: [outline design]
2. Create files / edit existing
3. /preview_start [server]
4. Test in browser
5. git commit
```

### 🚀 Deploy to Production
```bash
1. git status → ensure clean working tree
2. @deploy: [review deployment plan]
3. git push origin feat/wise2-hvac-field-tech-v1
4. Wait for GitHub Actions → automatic deploy
5. Verify at https://wise2.net
```

### 📝 Code Review (Self)
```bash
/code-review        # Review diff vs main
/code-review --fix  # Auto-apply suggestions
```

---

## 6. Git Workflow

**Current branch**: `feat/wise2-hvac-field-tech-v1`  
**Main branch**: `main`

```bash
# Check status
git status
git log --oneline -5

# Make changes
git add [files]
git commit -m "type: description"

# Push & create PR
git push origin feat/wise2-hvac-field-tech-v1
gh pr create --title "..." --body "..."

# Sync with main
git fetch origin
git rebase origin/main
```

---

## 7. Testing

```bash
# Run all tests
pnpm test

# Run tests for one app
pnpm --filter apps/website test

# Watch mode
pnpm test --watch
```

---

## 8. Production Deployment

**Server**: 173.208.147.165 (dwise user)  
**Method**: Docker compose + Nginx SSL  
**Auto-deploy**: Push to `main` → GitHub Actions triggers build

```bash
# Manual deploy (if needed)
ssh dwise@173.208.147.165
cd /home/dwise/wise2-core
git pull origin main
docker-compose -f docker-compose.prod.yml up -d
```

**Live Status**: https://wise2.net / https://signal.wise2.net

---

## 9. Environment Variables

**Local Development** (`.env.local`):
- Copy from `.env.example` in each app
- Never commit `.env` files

**Production** (`.env.prod.example`):
- Deployed via GitHub Secrets → Docker env
- See `DEPLOYMENT_HANDOFF.md`

---

## 10. Troubleshooting

| Issue | Fix |
|-------|-----|
| `pnpm install` fails | `rm -rf node_modules && pnpm install` |
| Port already in use | `lsof -i :3000 && kill -9 <PID>` |
| API not responding | Check `packages/api` is running on port 3000 |
| Build errors | `pnpm clean && pnpm install` |
| Git conflicts | `git merge origin/main` (don't force-push) |

---

## 11. Key References

- **Design System**: `docs/DESIGN_SYSTEM.md`
- **Brand Bible**: `docs/BRAND_BIBLE_UPDATED.md`
- **Architecture**: `CLAUDE.md` (routing via PromptOS)
- **Operations**: `DEPLOYMENT_HANDOFF.md`
- **Issues**: `OUTSTANDING_ISSUES.md`
- **Memory**: `.claude/projects/.../memory/MEMORY.md` (auto-loaded each session)

---

## 12. Quick Commands

```bash
# Status check
git status && pnpm test --run

# Start backend + website
/preview_start api
/preview_start website

# Create a feature branch
git checkout -b feat/my-feature

# Commit & push
git add . && git commit -m "feat: description"
git push origin feat/my-feature

# Verify deployment
curl https://wise2.net/api/health
```

---

**You're all set!** Start with `/preview_start api` and begin building. 🚀
