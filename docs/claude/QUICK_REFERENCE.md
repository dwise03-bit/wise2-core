# Claude Code Quick Reference

**Status**: ✅ Production Ready | All CI Passed | 5 Agents Active  
**Repository**: dwise03-bit/wise2-core  
**Branch**: claude/wise2-claude-code-install-3jnypi → PR #39

---

## At a Glance

### What Is This?
Claude Code configured as an **AI Engineering Command Center** for WISE². Specialized agents coordinate across full-stack development with automated verification at each step.

### How to Use It
1. **Ask Claude** — "Build X feature", "Fix Y bug", "Deploy to production"
2. **Claude routes** — Orchestrator analyzes, delegates to specialists
3. **Agents execute** — Backend/Frontend/Database/DevOps work in parallel or sequence
4. **Verification happens** — Each step verified before moving forward
5. **Status reported** — No claims of success without proof

---

## Agent Routing

Ask Claude with keywords, get the right agent:

```
"Build dashboard widget"    → Frontend Agent (React/Next.js)
"Create API endpoint"       → Backend Agent (NestJS)
"Add database field"        → Database Agent (Prisma)
"Deploy to production"      → DevOps Agent (Docker)
"Test the flow"            → QA Agent (testing)
```

The orchestrator is smart about multi-domain requests—it coordinates automatically.

---

## Verification Scripts

Run anytime. Use in CI/CD pipelines:

```bash
# Pre-build: check dependencies, TypeScript, structure
bash .claude/scripts/verify-build.sh

# Pre-deploy: git status, secrets scan, env vars
bash .claude/scripts/pre-deploy-check.sh

# Post-deploy: health checks, logs, disk space
bash .claude/scripts/verify-production.sh
```

All scripts exit 0 on success, 1 on failure. Use in automation.

---

## Architecture at a Glance

```
User Request
    ↓
Orchestrator (reads System Map, routes work)
    ↓
    ├─→ Frontend Agent  (UI/UX)
    ├─→ Backend Agent   (API/Logic)
    ├─→ Database Agent  (Schema)
    ├─→ DevOps Agent    (Deploy)
    └─→ QA Agent        (Test)
    ↓
Verification (each step checks)
    ↓
Report (✅ Success or ❌ Blocker)
```

---

## Verification Standards

### Frontend
- ✅ TypeScript compiles
- ✅ Component renders in browser (no 500 errors)
- ✅ Responsive: mobile → tablet → desktop
- ✅ No console errors
- ✅ Matches WISE² design system

### Backend
- ✅ Code compiles without errors
- ✅ Endpoint responds with correct status code
- ✅ Logs show no error traces
- ✅ Database queries valid
- ✅ No secrets in code or git

### Database
- ✅ Schema is valid Prisma
- ✅ Migrations apply without errors
- ✅ Prisma client generates successfully
- ✅ Data integrity maintained
- ✅ Rollback plan documented

### Deployment
- ✅ Pre-deploy checks pass
- ✅ Docker images build successfully
- ✅ Services start and stay running
- ✅ Health checks return 200 OK
- ✅ Logs show no critical errors

---

## Configuration Files

### `.claude/settings.json`
Model, agents, routing rules, verification hooks. Edit to:
- Change model (default: claude-opus-5)
- Add/remove agents
- Adjust verification commands
- Configure skills

### `.claude/agents/*.md`
Role-based specialization. Each agent is a complete handbook:
- **wise2-orchestrator.md** → Coordination & routing
- **backend.md** → NestJS API development
- **frontend.md** → React/Next.js UI
- **database.md** → Prisma & migrations
- **devops.md** → Docker & deployment

### `.claude/scripts/*.sh`
Executable verification. Used in development and CI/CD.

---

## Documentation

### Start Here
- **WISE2_SYSTEM_MAP.md** — Complete architecture (ports, services, config)
- **CLAUDE_CODE_SETUP.md** — Setup guide & workflow examples

### For Developers
- **CLAUDE.md** — Project handbook (existing, preserved)
- **API_REFERENCE.md** — Endpoint specs

### For Ops
- **docker-compose.production.yml** — All services defined
- **.env.prod.example** → **.env.production** (production secrets)

---

## Common Tasks

### Build a Feature
```
User: "Build a revenue dashboard"
      ↓
Claude: [Reads system map, plans work across domains]
      ↓
Backend Agent:   Creates /api/revenue endpoint
Frontend Agent:  Builds dashboard widget component
Database Agent:  Ensures schema supports revenue data
      ↓
Claude: [Verifies all domains, tests integration]
      ↓
✅ Feature complete and verified
```

### Deploy to Production
```
User: "Deploy to production"
      ↓
DevOps: Runs pre-deploy checks
├─ Git status clean?
├─ Builds succeed?
├─ Secrets in code? (No!)
└─ Environment configured?
      ↓
Deployment
├─ Docker build
├─ Run migrations
└─ Start services
      ↓
Verification: Health checks, logs, external HTTP
      ↓
✅ Deployment verified and live
```

### Fix a Bug
```
User: "API health endpoint returns 500"
      ↓
Backend: Investigates
├─ Checks logs: docker logs wise2-api-prod
├─ Tests endpoint: curl http://localhost:3010/api/health
├─ Identifies root cause (e.g., database connection)
└─ Implements fix
      ↓
Verification: Code builds, endpoint responds 200, logs clean
      ↓
✅ Bug fixed and verified
```

---

## Safety Rules (Enforced)

### Claude Code WILL
✅ Read System Map before starting  
✅ Route to specialist agents  
✅ Verify before claiming success  
✅ Protect secrets (never commit to git)  
✅ Test locally before deploying  
✅ Report problems transparently  

### Claude Code WILL NOT
❌ Claim success without verification  
❌ Push to wrong branch  
❌ Commit secrets to git  
❌ Skip error handling  
❌ Run destructive commands casually  
❌ Deploy without health checks  

---

## System Map Reference

**Quick lookup**: `docs/claude/WISE2_SYSTEM_MAP.md`

Contains:
- All service names & container IDs
- All ports (local mappings)
- All databases & credentials
- Docker compose config reference
- API health endpoints
- Directory structure
- Critical files

**Always read this first** before complex work.

---

## Environment Setup

### Development
```bash
# Install
pnpm install

# Generate Prisma
pnpm --filter @wise2/db prisma:generate

# Start services (Docker)
docker-compose up -d postgres redis mongodb

# Dev all apps
pnpm dev
```

### Production
```bash
# All services in docker-compose
docker-compose -f docker-compose.production.yml up -d

# Apply migrations
docker-compose -f docker-compose.production.yml exec api \
  npm run migration:run

# Check status
docker-compose -f docker-compose.production.yml ps
```

---

## Troubleshooting

### "Build failed"
1. Run verification: `bash .claude/scripts/verify-build.sh`
2. Check TypeScript: `pnpm type-check`
3. Check node_modules: `rm -rf node_modules && pnpm install`

### "Port in use"
```bash
# Find process
lsof -i :3010

# Kill if safe
kill -9 <PID>

# Or change port
PORT=3011 pnpm dev
```

### "Cannot connect to database"
```bash
# Check Docker
docker-compose ps

# Check logs
docker-compose logs postgres

# Verify DATABASE_URL
echo $DATABASE_URL
```

### "Deployment failed"
1. Run pre-deploy checks: `bash .claude/scripts/pre-deploy-check.sh`
2. Check git: `git status`
3. Check disk: `df -h`
4. Check env: `cat .env.production | grep -E 'DATABASE|JWT|API'`

---

## When Something Goes Wrong

1. **Get context**: Read recent logs
   ```bash
   docker-compose -f docker-compose.production.yml logs --tail=50 api
   ```

2. **Identify scope**: Which component fails?
   - Frontend: Check browser console, verify API URL
   - Backend: Check service logs, verify database connection
   - Database: Check migrations, verify schema
   - Deployment: Check pre-deploy script output

3. **Root cause**: Don't change code randomly
   - Trace execution path
   - Check logs for actual error
   - Verify assumptions (env vars, connections, etc.)
   - Make smallest correct fix

4. **Verify**: Run appropriate verification script
   - Build issues: `bash .claude/scripts/verify-build.sh`
   - Deploy issues: `bash .claude/scripts/pre-deploy-check.sh`
   - Production issues: `bash .claude/scripts/verify-production.sh`

---

## Key Files (Always Accessible)

```
wise2-core/
├── .claude/
│   ├── settings.json                  # Configuration
│   ├── agents/                        # Agent specialization
│   └── scripts/                       # Verification scripts
├── docs/claude/
│   ├── WISE2_SYSTEM_MAP.md           # Architecture (read first!)
│   ├── CLAUDE_CODE_SETUP.md          # Setup guide
│   ├── QUICK_REFERENCE.md            # This file
│   └── VISUAL_GUIDE.html             # Interactive guide
├── docker-compose.production.yml     # Production services
├── CLAUDE.md                         # Project handbook
└── API_REFERENCE.md                  # Endpoint specs
```

---

## Support

### Quick Questions
- "What's the architecture?" → Read WISE2_SYSTEM_MAP.md
- "How do I deploy?" → Read CLAUDE_CODE_SETUP.md or ask Claude
- "What's the API?" → Read API_REFERENCE.md

### Blockers
- Run verification scripts first
- Check logs: `docker-compose logs <service>`
- Ask Claude for help (it reads the whole system)

### Changes
- Configuration: Edit `.claude/settings.json`
- Agent behavior: Edit `.claude/agents/*.md`
- Scripts: Edit `.claude/scripts/*.sh`
- Docs: Update `docs/claude/*.md`

---

## Status

```
┌──────────────────────────────────────┐
│ CLAUDE CODE STATUS                   │
├──────────────────────────────────────┤
│ ✅ Installed & Configured            │
│ ✅ All CI Checks Passed              │
│ ✅ 5 Agents Deployed                 │
│ ✅ Verification Scripts Active       │
│ ✅ Documentation Complete            │
│ ✅ Production Ready                  │
└──────────────────────────────────────┘
```

**You're all set. Start building.**

---

**Last Updated**: 2026-08-20  
**PR**: #39 (Configure Claude Code as WISE² AI Engineering Command Center)
