# WISE² Environment Checklist

Last Verified: 2026-08-29

## ✅ System Setup

- [x] Node.js v26.7.0+ installed
- [x] pnpm 8.15.9 installed
- [x] Git configured
- [x] Docker configured
- [x] SSH key for 173.208.147.165 set up

## ✅ Claude Code Configuration

- [x] Global settings.json → `~/.claude/settings.json`
  - Model: Haiku (default, fast)
  - Fallback: wise2-coder:latest (local)
  - Workflows enabled
  - MCP servers enabled

- [x] Project settings.json → `.claude/settings.json`
  - Model overrides for @architecture, @deploy, @review
  - Fast mode enabled
  - Proper permissions allowlist
  - Hooks configured

- [x] Project launch.json → `.claude/launch.json`
  - API server (port 3000)
  - Website (port 3001)
  - Dashboard/Studio (port 3005)
  - Other demo apps configured

## ✅ Project Structure

- [x] Monorepo configured (pnpm workspaces)
- [x] Apps directory: 20+ applications
- [x] Packages directory: Shared code, API, DB schemas
- [x] Docker compose for production available
- [x] GitHub Actions for auto-deploy enabled

## ✅ Development Workflow

- [x] Git branches available
  - Current: feat/wise2-hvac-field-tech-v1
  - Main: main (production)

- [x] Development quick start guide created
- [x] Environment variables structure understood
- [x] Testing framework configured

## ✅ Deployment Ready

- [x] Production server: 173.208.147.165
- [x] SSL/HTTPS via Nginx configured
- [x] Auto-deploy on push to main via GitHub Actions
- [x] Docker containers running in production
- [x] Health check endpoints available

## ✅ Claude Skills Configured

- [x] `/preview_start` — Start dev servers
- [x] `/code-review` — Review code changes
- [x] `/simplify` — Clean up code
- [x] `/security-review` — Check security
- [x] `/run` — Execute dev tasks
- [x] Custom project skills in `.claude/skills/`

## ✅ MCP Servers

- [x] Global MCP servers enabled
- [x] Project MCP servers available
- [x] GitHub integration ready (for PR/issue operations)

## 🔧 Next Steps If Needed

### If pnpm install fails:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### If local Ollama is needed (for local AI):
```bash
# Install Ollama from https://ollama.ai
# Pull a model: ollama pull wise2-coder:latest
# Configure in settings.json: "fallbackModel": ["wise2-coder:latest"]
```

### If GitHub auth is needed (for MCP):
```bash
# In interactive Claude Code session:
/mcp
# Select GitHub → authorize
```

### If Docker containers won't start:
```bash
docker ps                    # See running containers
docker-compose logs api      # Check API logs
docker-compose restart       # Restart services
```

## 📋 Verification Steps

Run this to confirm everything works:

```bash
# 1. Check tools
node --version
pnpm --version
git --version
docker --version

# 2. Check project
cd /Users/danielwise/Projects/wise2-core
git status
git branch

# 3. Check dependencies
pnpm list --depth=0

# 4. Try a quick build
pnpm build --filter packages/db

# 5. Start a dev server
/preview_start api
```

## 📞 Support

- **Project docs**: See `CLAUDE.md` at repo root
- **Design system**: `docs/DESIGN_SYSTEM.md`
- **Deployment**: `DEPLOYMENT_HANDOFF.md`
- **Issues**: `OUTSTANDING_ISSUES.md`
- **Memory**: Auto-loaded from `.claude/projects/.../memory/`

---

**Setup complete!** You're ready to develop on WISE² Core.
