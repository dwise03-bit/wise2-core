# Claude Code Setup for WISE² Production

**Last Updated**: 2026-08-20  
**Status**: ✅ Configured and Ready  
**Repository**: dwise03-bit/wise2-core  

---

## Overview

Claude Code is now configured as the **WISE² AI Engineering Command Center**. This setup enables:

✅ Full-stack development with specialized agents  
✅ Production-safe deployments with verification  
✅ Automated health checks and monitoring  
✅ Multi-domain coordination and task routing  
✅ Security and compliance standards  

---

## What's Installed

### 1. Configuration Files

- **`.claude/settings.json`** — Claude Code settings
  - Model: Claude Opus 5 (reasoning-focused)
  - Active agents: orchestrator, architect, frontend, backend, database, devops, qa, security
  - Automatic verification on builds and deployments

- **`.claude/agents/`** — Specialized agent prompts
  - `wise2-orchestrator.md` — Primary coordinator
  - `backend.md` — NestJS API development
  - `frontend.md` — React/Next.js UI development
  - `database.md` — Prisma schema & migrations
  - `devops.md` — Docker deployment & infrastructure
  - Additional agents available for extension

### 2. Verification Scripts

- **`.claude/scripts/verify-build.sh`**
  - Checks Node.js, pnpm, dependencies
  - Runs builds and TypeScript checks
  - Validates docker-compose configuration
  - Pre-deployment validation

- **`.claude/scripts/pre-deploy-check.sh`**
  - Git repository integrity
  - Branch verification
  - Environment file validation
  - Disk space checks
  - Secret scanning

- **`.claude/scripts/verify-production.sh`**
  - Post-deployment health checks
  - Service status monitoring
  - Database connectivity verification
  - Disk usage monitoring
  - Log inspection for errors

### 3. Documentation

- **`docs/claude/WISE2_SYSTEM_MAP.md`**
  - Complete architecture overview
  - All services, ports, databases
  - Directory structure
  - Health check endpoints
  - Critical configuration files

- **`docs/claude/CLAUDE_CODE_SETUP.md`** (this file)
  - Setup guide and quick reference

---

## Quick Start

### Using Claude Code

1. **Navigate to repository**:
   ```bash
   cd /home/user/wise2-core
   ```

2. **Ask Claude for help**:
   - "Build the dashboard" → Routes to Frontend Agent
   - "Fix the API health endpoint" → Routes to Backend Agent
   - "Deploy to production" → Routes to DevOps Agent
   - "Add a new database schema" → Routes to Database Agent

3. **Claude will**:
   - Read System Map for context
   - Route to appropriate agent
   - Execute work with verification
   - Report status transparently

### Manual Verification

Before claiming any change is "complete":

```bash
# Build verification
bash .claude/scripts/verify-build.sh

# Pre-deploy checks
bash .claude/scripts/pre-deploy-check.sh

# Post-deploy verification (on production)
bash .claude/scripts/verify-production.sh
```

---

## Agent Routing

Claude's orchestrator automatically routes based on keywords:

| Request | Routes To | Agent |
|---------|-----------|-------|
| "Build login form" | Frontend | frontend.md |
| "Create user endpoint" | Backend | backend.md |
| "Add email field to User" | Database | database.md |
| "Deploy to production" | DevOps | devops.md |
| "Test login flow" | QA | (qa.md when created) |
| "Check for vulnerabilities" | Security | (security.md when created) |

For complex work spanning multiple domains, the orchestrator coordinates all agents.

---

## Key Workflows

### Building a Feature (Example: New Dashboard Widget)

```
User: "Build a revenue dashboard widget"
     ↓
Orchestrator reads request
     ↓
Routes: Backend (API) + Frontend (UI) + Database (Schema)
     ↓
Backend Agent: Creates /api/revenue endpoint
Frontend Agent: Builds responsive widget component
Database Agent: Ensures schema has revenue field
     ↓
Orchestrator integrates: Browser test, health check
     ↓
✅ Complete and verified
```

### Deploying to Production

```
User: "Deploy to production"
     ↓
DevOps runs pre-deploy checks
     ├─ Git status clean
     ├─ Builds succeed
     ├─ No secrets in code
     └─ Environment configured
     ↓
Deployment
     ├─ Builds Docker images
     ├─ Runs migrations
     └─ Starts services
     ↓
Verification (post-deploy)
     ├─ Health endpoints respond
     ├─ Database connected
     ├─ No error logs
     └─ External HTTP works
     ↓
✅ Deployment verified
```

### Fixing a Bug

```
User: "API health endpoint returns 500"
     ↓
Backend Agent investigates
     ├─ Checks logs: docker logs wise2-api-prod
     ├─ Tests endpoint: curl http://localhost:3010/api/health
     ├─ Identifies issue (e.g., database connection)
     └─ Traces root cause
     ↓
Root cause found → Fix implemented
     ↓
Verification
     ├─ Code compiles
     ├─ Endpoint responds 200
     └─ Logs show no errors
     ↓
✅ Bug fixed and verified
```

---

## Verification Standards

Claude Code **never** claims success without verification:

### Frontend
- ✅ TypeScript compiles
- ✅ Component renders in browser
- ✅ Responsive on mobile/tablet/desktop
- ✅ No console errors
- ✅ Matches WISE² design system

### Backend
- ✅ Service compiles
- ✅ Endpoint responds (correct HTTP status)
- ✅ Logs show no errors
- ✅ Database queries valid
- ✅ No secrets in code

### Database
- ✅ Schema valid
- ✅ Migration runs successfully
- ✅ Prisma client generated
- ✅ No data loss
- ✅ Rollback plan available

### Deployment
- ✅ Pre-deploy checks pass
- ✅ Docker images build
- ✅ Services start
- ✅ Health checks pass
- ✅ External HTTP accessible

---

## System Map Quick Reference

**Read this first for any work**:
- `docs/claude/WISE2_SYSTEM_MAP.md`

Contains:
- All service names and ports
- Database names and credentials
- Docker-compose configuration
- API endpoints
- Health check commands
- Directory structure
- Critical files

---

## Environment Configuration

### Development
- Local PostgreSQL, Redis, MongoDB
- All services in docker-compose
- Hot-reload frontend apps
- API on localhost:3010

### Production
- VPS: 173.208.147.165
- Persistent data volumes
- Health checks enabled
- Monitoring: Prometheus (9090) + Grafana (3100)
- Auto-restart services

### Environment Files
- `.env.example` — Development template
- `.env.prod.example` — Production template
- `.env.production` — Production secrets (not in git)

---

## Common Commands

```bash
# Build
pnpm build

# Start development
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint

# Database
pnpm --filter @wise2/db prisma:generate
pnpm migration:run
pnpm migration:revert

# Docker (Production)
docker-compose -f docker-compose.production.yml up -d
docker-compose -f docker-compose.production.yml ps
docker-compose -f docker-compose.production.yml logs -f api

# Health checks
curl http://localhost:3010/api/health
curl http://localhost:3011/
docker-compose -f docker-compose.production.yml exec postgres pg_isready
```

---

## Troubleshooting

### "Build failed"
1. Run `pnpm install`
2. Run `pnpm --filter @wise2/db prisma:generate`
3. Check TypeScript errors: `pnpm type-check`
4. Review build logs

### "Port already in use"
1. Find process: `lsof -i :3010`
2. Kill if safe: `kill -9 <PID>`
3. Or change PORT in environment

### "Cannot connect to database"
1. Check Docker: `docker-compose ps`
2. Check logs: `docker-compose logs postgres`
3. Verify DATABASE_URL environment variable
4. Test connection: `docker-compose exec postgres pg_isready`

### "Deployment failed"
1. Run pre-deploy checks: `bash .claude/scripts/pre-deploy-check.sh`
2. Check git status: `git status`
3. Verify environment: `cat .env.production`
4. Check disk space: `df -h`

---

## Safety Rules (Enforced)

**Claude Code will NOT**:
- ❌ Claim success without verification
- ❌ Push to wrong branch
- ❌ Commit secrets to git
- ❌ Run destructive commands without confirmation
- ❌ Deploy without health checks
- ❌ Skip error handling
- ❌ Modify production data casually

**Claude Code WILL**:
- ✅ Read System Map first
- ✅ Route to specialist agents
- ✅ Verify before claiming success
- ✅ Protect secrets
- ✅ Test changes locally
- ✅ Check health endpoints
- ✅ Report problems transparently

---

## Extending Claude Code

### Adding a New Agent

1. Create `.claude/agents/new-agent.md`
2. Follow the format of existing agents
3. Define:
   - Role and mission
   - Trigger keywords
   - Key capabilities
   - Workflows
   - Verification checklist

### Adding Skills

Place in `.claude/skills/skill-name/SKILL.md`

### Updating Configuration

Edit `.claude/settings.json` and test:
```bash
bash .claude/scripts/verify-build.sh
```

---

## Support

### Documentation
- `docs/claude/WISE2_SYSTEM_MAP.md` — Architecture
- `CLAUDE.md` — Original project handbook
- `.claude/agents/*/` — Agent guides
- API_REFERENCE.md — Endpoint specs

### Verification Scripts
- Run anytime: `bash .claude/scripts/*.sh`
- Check logs: `docker-compose -f docker-compose.production.yml logs`
- Monitor: Grafana (localhost:3100), Prometheus (localhost:9090)

### Getting Help
- Ask Claude: "What's the architecture of WISE²?"
- Ask Claude: "How do I build X?"
- Ask Claude: "Deploy to production"

Claude will read this setup guide and work accordingly.

---

## Status

✅ **Claude Code is ready for WISE² engineering**

```
┌─────────────────────────────────────────┐
│ WISE² AI ENGINEERING COMMAND CENTER     │
│                                         │
│ Status: ✅ ACTIVE & CONFIGURED         │
│ Model: Claude Opus 5                    │
│ Agents: 5 specialized + coordinator     │
│ Scripts: Build, Deploy, Verify          │
│ Documentation: Complete                 │
│                                         │
│ Ready for production development        │
└─────────────────────────────────────────┘
```

---

**Last Updated**: 2026-08-20  
**Next**: Start using Claude Code for WISE² engineering tasks
