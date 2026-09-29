# WISE² AI — Mac + VPS Sync Guide

**Complete setup for running WISE² AI everywhere, perfectly in sync.**

## System Architecture

```
Mac Local
├─ wise-ai CLI (11 commands)
├─ Ollama (M4, 8 models)
└─ Assistant App (optional, for UI)

VPS Remote
├─ wise-ai CLI (synced via git)
├─ Ollama (GTX 1660, 3+ models)
├─ Assistant Backend (Express)
└─ Assistant Frontend (React)

Sync Method
└─ Git (automatic)
```

## Setup Steps

### Step 1: Verify Local Mac Setup

```bash
# Check CLI
which wise-ai
wise-ai status

# Check Ollama
ollama ps
ollama list

# Result: Should see M4 models running
```

### Step 2: Push Code to GitHub

```bash
cd /Users/danielwise/Projects/wise2-core
git push origin main
```

### Step 3: Deploy to VPS (One Command)

```bash
./scripts/wise2-ai-automate.sh all
```

This does:
1. ✅ Health check (M4, VPS, disk)
2. ✅ Model scaling (ensures core models)
3. ✅ Deploy backend to VPS
4. ✅ Install systemd (auto-start)
5. ✅ Verify all systems
6. ✅ Cost breakdown

### Step 4: Verify VPS is Running

```bash
# Check backend
curl http://173.208.147.165:3020/status

# Check models
ssh dwise@173.208.147.165 "ollama list"

# Check logs
./scripts/wise2-ai-automate.sh logs
```

### Step 5: Set Up Cron Monitoring

```bash
# Edit crontab
crontab -e

# Add this line (every 15 min)
*/15 * * * * /Users/danielwise/Projects/wise2-core/scripts/wise2-ai-cron.sh

# Verify
tail -f /tmp/wise2-ai-cron.log
```

## Usage

### Via CLI (Fastest)

**Mac local:**
```bash
wise-ai local "complex task"
wise-ai vps "quick task"
wise-ai auto "any task"
```

**VPS remote:**
```bash
ssh dwise@173.208.147.165 "wise-ai status"
```

### Via Web UI

**Mac local (dev):**
```bash
# Terminal 1
cd apps/wise-ai-assistant/backend
npm install && npm run dev

# Terminal 2
cd apps/wise-ai-assistant/frontend
npm install && npm run dev

# Browser: http://localhost:5173
```

**VPS production (after deploy):**
```
http://173.208.147.165:3020/
```

### Via API

```bash
# Single query
curl -X POST http://localhost:3020/query \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Explain quantum computing"}'

# Preview routing
curl -X POST http://localhost:3020/route \
  -H "Content-Type: application/json" \
  -d '{"prompt": "hello"}'

# System status
curl http://localhost:3020/status
```

## Keeping Mac + VPS in Sync

### Automatic Sync (Git)

```bash
# Push changes
git push origin main

# Deploy to VPS (pulls + rebuilds)
./scripts/wise2-ai-automate.sh deploy
```

### Manual Sync

```bash
# On VPS
cd /home/dwise/wise2-core
git pull origin main

# Rebuild
cd apps/wise-ai-assistant/backend
npm install && npm run build

# Restart
systemctl --user restart wise-ai-backend
```

### Check Sync Status

```bash
# Local
git log --oneline -1

# VPS
ssh dwise@173.208.147.165 "cd /home/dwise/wise2-core && git log --oneline -1"

# Should match
```

## Monitoring

### Health Check (Manual)

```bash
./scripts/wise2-ai-automate.sh health
```

### Auto-Monitoring (Every 15 min)

```bash
# Enable cron (see Step 5 above)

# View logs
tail -f /tmp/wise2-ai-cron.log

# What it checks:
# ✅ M4 Ollama
# ✅ VPS Ollama
# ✅ Backend API
# ✅ Disk space
# ✅ Auto-restarts if down
```

### Live Logs

```bash
# VPS systemd logs
ssh dwise@173.208.147.165 "journalctl --user -u wise-ai-backend -f"

# VPS backend logs
ssh dwise@173.208.147.165 "tail -f /tmp/wise-ai-backend.log"

# Cron logs
tail -f /tmp/wise2-ai-cron.log
```

## Troubleshooting

### VPS Backend Not Responding

```bash
# 1. Check if running
ssh dwise@173.208.147.165 "ps aux | grep 'node.*server'"

# 2. Check logs
ssh dwise@173.208.147.165 "tail -50 /tmp/wise-ai-backend.log"

# 3. Restart
./scripts/wise2-ai-automate.sh restart

# 4. Manual restart on VPS
ssh dwise@173.208.147.165 "systemctl --user restart wise-ai-backend"
```

### Model Mismatch Between Mac + VPS

```bash
# Check what's on each
wise-ai models
ssh dwise@173.208.147.165 "ollama list"

# Sync models
./scripts/wise2-ai-automate.sh scale
```

### Disk Full on VPS

```bash
# Check space
ssh dwise@173.208.147.165 "df -h /sdb-disk"

# Clean Docker
ssh dwise@173.208.147.165 "docker builder prune -f"

# Remove old models
ssh dwise@173.208.147.165 "ollama rm MODEL_NAME"
```

## Complete Workflow

### Day 1: Initial Setup

```bash
# 1. Verify local
wise-ai status

# 2. Push to GitHub
git push origin main

# 3. Deploy everything
./scripts/wise2-ai-automate.sh all

# 4. Verify
./scripts/wise2-ai-automate.sh health

# 5. Set up cron
crontab -e  # Add monitoring line
```

### Daily Use

```bash
# Just use it
wise-ai auto "your task"

# Cron monitors in background
# Auto-restarts if issues
```

### After Code Changes

```bash
git push origin main
./scripts/wise2-ai-automate.sh deploy
```

### Weekly Maintenance

```bash
./scripts/wise2-ai-automate.sh health
./scripts/wise2-ai-automate.sh scale
tail -20 /tmp/wise2-ai-cron.log
```

## Key Directories

| Location | Purpose |
|----------|---------|
| `~/.local/bin/wise-ai` | CLI binary |
| `~/.config/wise-ai.conf` | Config (locked) |
| `/Users/danielwise/Projects/wise2-core` | Main repo (Mac) |
| `/home/dwise/wise2-core` | Deploy target (VPS) |
| `/tmp/wise-ai-cron.log` | Monitoring logs |
| `/tmp/wise-ai-backend.log` | VPS backend logs |

## Cost

- **Local M4**: $0/month (hardware owned)
- **VPS GTX 1660**: $0/month (included in VPS fee)
- **API calls**: $0/month (no external APIs)
- **Total**: **$0/month forever**

## Status

✅ Mac: Ollama + CLI + Optional UI  
✅ VPS: Ollama + Backend + Optional Frontend  
✅ Sync: Git-based, automatic  
✅ Monitoring: Cron-based, every 15 min  
✅ Recovery: Auto-restart on crash  
✅ Cost: $0/month  

---

**Next: Run `./scripts/wise2-ai-automate.sh all` and start using it.**
