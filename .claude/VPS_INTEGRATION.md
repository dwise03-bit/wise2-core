# WISE² Local → VPS Integration

**Goal**: Develop locally with AI, deploy instantly to wise2.net + VPS  
**Date**: 2026-08-29  
**VPS**: 173.208.147.165 (GPU NMLS instance)

---

## Architecture

```
LOCAL MACHINE (M4)
├─ Ollama (16 models)          → localhost:11434
├─ Cursor AI                   → Uses local models
├─ VS Code + Continue          → Uses local models
├─ Claude Code                 → Uses local models
└─ Project files               → /Users/danielwise/Projects/wise2-core
    ↓
SSH Tunnel (encrypted)
    ↓
VPS (173.208.147.165)
├─ Docker Containers
│  ├─ wise2-api                → :3000
│  ├─ wise2-website            → :3001
│  ├─ wise2-control-bridge     → :3004
│  ├─ wise2-langfuse           → :3010
│  ├─ wise2-chroma             → :8000
│  └─ [14 more services]
├─ PostgreSQL                  → :5433
├─ Redis                       → :6380
└─ Nginx (SSL)                 → :80, :443
    ↓
PRODUCTION
├─ wise2.net                   ✅ LIVE
├─ signal.wise2.net            ✅ LIVE
└─ api.signal.wise2.net        ✅ LIVE
```

---

## 1. SSH Tunnel Configuration

### Create persistent SSH tunnel

Create `~/.ssh/config` entry:

```bash
cat >> ~/.ssh/config << 'EOF'
Host wise2-vps
    HostName 173.208.147.165
    User dwise
    IdentityFile ~/.ssh/id_ed25519
    ServerAliveInterval 60
    ServerAliveCountMax 3
    LocalForward 3000 localhost:3000
    LocalForward 3001 localhost:3001
    LocalForward 3004 localhost:3004
    LocalForward 3005 localhost:3005
    LocalForward 5433 localhost:5433
    LocalForward 6380 localhost:6380
    LocalForward 8000 localhost:8000
    LocalForward 11434 localhost:11434
    ControlMaster auto
    ControlPath ~/.ssh/wise2-vps-%h-%p-%r
    ControlPersist 600
EOF
```

### Start persistent tunnel

```bash
# Manual
ssh -N wise2-vps &

# Or add to .claude/start-dev-stack.sh
ssh -N wise2-vps > /dev/null 2>&1 &
```

---

## 2. Local Environment Setup

Create `.env.local` in project root:

```bash
cat > .env.local << 'EOF'
# LOCAL DEVELOPMENT
OLLAMA_API=http://localhost:11434
LOCAL_API=http://localhost:3000
LOCAL_WEBSITE=http://localhost:3001

# VPS REMOTE
VPS_HOST=173.208.147.165
VPS_USER=dwise
VPS_API=http://localhost:3000
VPS_WEBSITE=http://localhost:3001
VPS_DB=localhost:5433
VPS_REDIS=localhost:6380

# WISE² PRODUCTION
PRODUCTION_API=https://api.signal.wise2.net
PRODUCTION_WEBSITE=https://wise2.net

# DEVELOPMENT MODE
DEV_MODE=local
USE_LOCAL_MODELS=true
USE_VPS_DB=true
DEBUG=true
EOF
```

---

## 3. Tunnel Manager Script

Create `~/.claude/tunnel-manager.sh`:

```bash
cat > ~/.claude/tunnel-manager.sh << 'EOF'
#!/bin/bash

# WISE² SSH Tunnel Manager
# Manages persistent connection to VPS for local development

TUNNEL_NAME="wise2-vps"
TUNNEL_SOCKET="$HOME/.ssh/${TUNNEL_NAME}-%h-%p-%r"
VPS_HOST="173.208.147.165"
VPS_USER="dwise"

case "$1" in
  start)
    echo "🔗 Starting SSH tunnel to VPS..."
    if ssh -O check wise2-vps > /dev/null 2>&1; then
      echo "✅ Tunnel already active"
    else
      ssh -N wise2-vps > /tmp/tunnel.log 2>&1 &
      echo "PID: $!"
      sleep 2
      if ssh -O check wise2-vps > /dev/null 2>&1; then
        echo "✅ Tunnel established"
        echo ""
        echo "Available ports:"
        echo "  API:        localhost:3000  → VPS:3000"
        echo "  Website:    localhost:3001  → VPS:3001"
        echo "  Bridge:     localhost:3004  → VPS:3004"
        echo "  Database:   localhost:5433  → VPS:5433"
        echo "  Redis:      localhost:6380  → VPS:6380"
        echo "  Chroma:     localhost:8000  → VPS:8000"
        echo "  Ollama:     localhost:11434 → Local:11434"
      else
        echo "❌ Tunnel failed to establish"
        cat /tmp/tunnel.log
        exit 1
      fi
    fi
    ;;
  stop)
    echo "🔌 Stopping SSH tunnel..."
    ssh -O exit wise2-vps 2>/dev/null
    echo "✅ Tunnel stopped"
    ;;
  status)
    echo "🔍 Tunnel status:"
    if ssh -O check wise2-vps > /dev/null 2>&1; then
      echo "✅ Connected"
      echo ""
      echo "Forward ports:"
      ss -tulpn 2>/dev/null | grep -E ':(3000|3001|5433|6380|8000)' || echo "  (Checking...)"
    else
      echo "❌ Disconnected"
    fi
    ;;
  logs)
    echo "📋 Tunnel logs:"
    ssh -O check wise2-vps > /dev/null 2>&1
    tail -f /tmp/tunnel.log
    ;;
  *)
    echo "Usage: $0 {start|stop|status|logs}"
    exit 1
    ;;
esac
EOF

chmod +x ~/.claude/tunnel-manager.sh
```

---

## 4. Development Server Bridge

Create `packages/api/.env.local`:

```bash
# Database (use VPS PostgreSQL via tunnel)
DATABASE_URL="postgresql://postgres:password@localhost:5433/wise2"

# Redis (use VPS Redis via tunnel)
REDIS_URL="redis://localhost:6380"

# Local Ollama models
OLLAMA_URL="http://localhost:11434"
USE_LOCAL_MODELS=true

# Environment
NODE_ENV=development
DEBUG=true
CORS_ORIGIN=http://localhost:3001,http://localhost:3000,https://wise2.net
```

Create `apps/website/.env.local`:

```bash
# API endpoint (local dev server)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_PRODUCTION_URL=https://api.signal.wise2.net

# Ollama for server-side operations
OLLAMA_API_URL=http://localhost:11434

# Environment
NEXT_ENV=development
DEBUG=true
```

---

## 5. Deployment Bridge Script

Create `~/.claude/deploy-to-vps.sh`:

```bash
cat > ~/.claude/deploy-to-vps.sh << 'EOF'
#!/bin/bash
set -e

# Deploy local changes to VPS instantly

PROJECT_ROOT="/Users/danielwise/Projects/wise2-core"
VPS_HOST="173.208.147.165"
VPS_USER="dwise"
VPS_PROJECT="/home/dwise/wise2-core"

echo "🚀 Deploying to VPS..."
echo ""

# 1. Check git status
echo "1️⃣  Git Status:"
cd "$PROJECT_ROOT"
if [ -n "$(git status --porcelain)" ]; then
  echo "   ⚠️  Uncommitted changes. Commit first:"
  git status --short
  echo ""
  read -p "   Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# 2. Get current branch and commit
BRANCH=$(git branch --show-current)
COMMIT=$(git rev-parse --short HEAD)
echo "   Branch: $BRANCH"
echo "   Commit: $COMMIT"
echo ""

# 3. Push to remote
echo "2️⃣  Pushing to GitHub..."
git push origin "$BRANCH" || echo "   (Already up-to-date)"
echo ""

# 4. SSH into VPS and deploy
echo "3️⃣  Deploying on VPS..."
ssh "$VPS_USER@$VPS_HOST" << DEPLOY_COMMANDS
  set -e
  cd "$VPS_PROJECT"
  
  # Pull latest
  git pull origin "$BRANCH"
  
  # Install dependencies
  pnpm install
  
  # Build
  pnpm build
  
  # Restart containers (Docker Compose)
  docker-compose -f docker-compose.prod.yml down
  docker-compose -f docker-compose.prod.yml up -d
  
  # Health check
  echo "   Waiting for services..."
  sleep 5
  curl -s http://localhost:3000/api/health || echo "   (API starting...)"
DEPLOY_COMMANDS

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Live at:"
echo "  • https://wise2.net"
echo "  • https://api.signal.wise2.net/health"
EOF

chmod +x ~/.claude/deploy-to-vps.sh
```

---

## 6. Integrated Dev Stack Launcher

Update `~/.claude/start-dev-stack.sh`:

```bash
cat > ~/.claude/start-dev-stack.sh << 'EOF'
#!/bin/bash
set -e

# ... (previous launcher code) ...

# NEW: Start SSH tunnel to VPS
echo ""
echo -e "${YELLOW}🔗 Establishing VPS tunnel...${NC}"
~/.claude/tunnel-manager.sh start

# NEW: Load environment
if [ -f /Users/danielwise/Projects/wise2-core/.env.local ]; then
  echo -e "${GREEN}✅ Local environment loaded${NC}"
fi

# ... (rest of launcher) ...
EOF
```

---

## 7. Git Hooks for Auto-Deploy

Create `.git/hooks/post-commit`:

```bash
cat > /Users/danielwise/Projects/wise2-core/.git/hooks/post-commit << 'EOF'
#!/bin/bash
# Auto-deploy to VPS after commit (optional)

# Uncomment to enable auto-deploy on every commit
# ~/.claude/deploy-to-vps.sh

# Or just notify
BRANCH=$(git branch --show-current)
if [ "$BRANCH" = "main" ]; then
  echo "✨ Commit to main. Ready to deploy:"
  echo "   ~/.claude/deploy-to-vps.sh"
fi
EOF

chmod +x /Users/danielwise/Projects/wise2-core/.git/hooks/post-commit
```

---

## 8. Local Testing Against VPS Database

### Option A: Use VPS Database (via tunnel)

```bash
# .env.local in API package
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5433/wise2"

# Test connection
pnpm --filter packages/api run db:migrate

# Run API against VPS database
pnpm --filter packages/api run dev
```

### Option B: Use Local Database

```bash
# Start PostgreSQL locally
docker run -d \
  -e POSTGRES_PASSWORD=dev \
  -e POSTGRES_DB=wise2 \
  -p 5432:5432 \
  postgres:15
```

---

## 9. Live Development Workflow

### Workflow: Feature Development

```
1. LOCAL CODING
   $ cd ~/Projects/wise2-core
   $ git checkout -b feat/new-feature
   $ ~/.claude/start-dev-stack.sh --all
   
2. LOCAL TESTING
   $ /preview_start api
   $ /preview_start website
   • Test locally on http://localhost:3001
   • Use Cursor AI for coding (offline)
   • Test against VPS DB (via tunnel)
   
3. DECISION LOGGING
   $ open -a Obsidian ~/Documents/wise2-brain
   • Log decisions & findings
   
4. CODE REVIEW
   • Use @architecture in Claude Code
   • Use /code-review for automated review
   
5. COMMIT & DEPLOY
   $ git add .
   $ git commit -m "feat: description"
   $ git push origin feat/new-feature
   
6. GITHUB ACTIONS DEPLOY
   • CI/CD runs automatically
   • Tests pass
   • Merges to main
   • Auto-deploys to VPS
   
7. VERIFY PRODUCTION
   $ curl https://wise2.net/api/health
   $ curl https://api.signal.wise2.net/health
```

---

## 10. Monitoring & Debugging

### Check VPS Services

```bash
# From local machine
ssh dwise@173.208.147.165 "docker ps --format 'table {{.Names}}\t{{.Status}}'"

# Check API logs
ssh dwise@173.208.147.165 "docker logs wise2-api -f --tail 50"

# Check database connection
psql "postgresql://postgres@localhost:5433/wise2" -c "SELECT version();"
```

### Local Performance

```bash
# Monitor local Ollama
curl localhost:11434/api/ps

# Check tunnel latency
ping -c 5 173.208.147.165

# Monitor SSH tunnel
~/.claude/tunnel-manager.sh status
```

---

## 11. Quick Commands

```bash
# Tunnel Management
~/.claude/tunnel-manager.sh start      # Open VPS tunnel
~/.claude/tunnel-manager.sh stop       # Close tunnel
~/.claude/tunnel-manager.sh status     # Check status

# Development
~/.claude/start-dev-stack.sh --all     # Start everything
/preview_start api                     # Start API server
/preview_start website                 # Start website

# Deployment
~/.claude/deploy-to-vps.sh             # Deploy to production

# Monitoring
ssh dwise@173.208.147.165 "docker ps"  # Check VPS services
```

---

## 12. Environment Variables

### Local (.env.local)
```
OLLAMA_API=http://localhost:11434
DATABASE_URL=postgresql://...@localhost:5433/wise2
REDIS_URL=redis://localhost:6380
USE_LOCAL_MODELS=true
DEBUG=true
```

### VPS (via SSH)
```
DATABASE_URL=postgresql://...@localhost:5432/wise2
REDIS_URL=redis://localhost:6379
NODE_ENV=production
USE_LOCAL_MODELS=false
```

---

## 13. Cost & Performance

| Component | Local | VPS | Notes |
|-----------|-------|-----|-------|
| **Inference** | Free (M4) | Free (idle) | Use local for dev |
| **Database** | Shared | PostgreSQL | VPS DB via tunnel |
| **Cache** | Redis | Redis | VPS Redis via tunnel |
| **Deployment** | Instant | 2-5 min | GitHub Actions |
| **Cost** | $0 | $10/mo | GPU instance |

---

## Setup Checklist

- [ ] SSH tunnel configured (~/.ssh/config)
- [ ] Tunnel manager script created (~/.claude/tunnel-manager.sh)
- [ ] Local .env.local files created
- [ ] Deploy script created (~/.claude/deploy-to-vps.sh)
- [ ] Git hooks configured (.git/hooks/post-commit)
- [ ] VPS connectivity verified
- [ ] Database tunnel tested
- [ ] First deployment tested

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| SSH tunnel fails | Check: `ssh -v wise2-vps` |
| Database timeout | Check tunnel: `~/.claude/tunnel-manager.sh status` |
| Port in use | `lsof -i :3000` then `kill -9 <PID>` |
| Deploy hangs | Check VPS: `ssh dwise@173.208.147.165 docker ps` |
| API not responding | Check logs: `docker logs wise2-api` |

---

**You now have**:
- ✅ Local development with AI models
- ✅ Tunnel to VPS for testing
- ✅ One-command deploy to production
- ✅ Full integration with wise2.net
- ✅ GitHub Actions CI/CD

Ready to build! 🚀
