# WISE² Pi Deployment - Quick Reference

## Basic Commands

### First Deployment
```bash
# Prepare environment (one-time)
cp .env.production.example .env.production
nano .env.production  # Edit with your settings

# Deploy
./scripts/deploy-to-pi.sh pi.local prod
```

### Redeployment
```bash
# Simple update
./scripts/deploy-to-pi.sh pi.local prod

# Force rebuild images
./scripts/deploy-to-pi.sh -f pi.local prod

# Dry run (preview only)
./scripts/deploy-to-pi.sh -d pi.local prod
```

## Verify Deployment

```bash
# Check services running
ssh pi@pi.local "cd /opt/wise2-edge && docker compose -f docker-compose.pi3b.yml ps"

# Check API health
curl http://pi.local:3000/health

# View logs
ssh pi@pi.local "cd /opt/wise2-edge && docker compose -f docker-compose.pi3b.yml logs -f"
```

## Troubleshooting

| Issue | Command | Notes |
|-------|---------|-------|
| Out of memory | `ssh pi@pi.local free -h` | Add swap if needed |
| Disk full | `ssh pi@pi.local df -h /` | Clean Docker: `docker system prune -a` |
| Hot CPU | `ssh pi@pi.local vcgencmd measure_temp` | Add heatsink |
| Containers won't start | Check logs | See "View logs" above |
| Health check fails | `./scripts/deploy-to-pi.sh --skip-health-check pi.local prod` | Debug manually after |

## Key Paths on Pi

| Path | Purpose |
|------|---------|
| `/opt/wise2-edge` | Application directory |
| `/opt/wise2-edge-backups` | Deployment backups |
| `/opt/wise2-edge/data` | Application data |
| `/var/log/wise2-edge-appliance` | Application logs |

## Performance Expectations

**Pi 3B (1GB):** 20-30 min deployment | ~30-60% CPU under load | 800MB RAM used  
**Pi 4 (4GB):** 10-20 min deployment | ~20-40% CPU under load | 1.5GB RAM used

## SSH Access

```bash
# Default user on Pi
ssh pi@pi.local

# Custom user/port
ssh -p 2222 ubuntu@192.168.1.100

# No password prompt
ssh-keygen -t ed25519  # Generate key
ssh-copy-id pi@pi.local  # Install key
```

## Emergency Restore

```bash
ssh pi@pi.local
cd /opt/wise2-edge-backups
tar -xzf backup-YYYYMMDD-HHMMSS.tar.gz
# Restore data and restart containers
docker compose -f /opt/wise2-edge/docker-compose.pi3b.yml restart
```

## Options Reference

```bash
./scripts/deploy-to-pi.sh [OPTIONS] <pi_hostname> [prod|staging]

OPTIONS:
  -u, --user USER          SSH user (default: pi)
  -p, --port PORT          SSH port (default: 22)
  -f, --force              Force Docker rebuild
  -d, --dry-run            Preview without changes
  --skip-health-check      Skip health verification
  --registry REGISTRY      Docker registry URL
  -h, --help               Show full help
```

## Common Scenarios

### Scenario 1: First-time deployment to new Pi
```bash
# 1. Prepare
ssh pi@pi.local "sudo apt update && sudo apt upgrade -y"
cp .env.production.example .env.production
# Edit .env.production with your settings

# 2. Deploy
./scripts/deploy-to-pi.sh pi.local prod

# 3. Verify
curl http://pi.local:3000/health
```

### Scenario 2: Update after code changes
```bash
# 1. Commit changes to git main branch
git add -A && git commit -m "Updated config"
git push origin main

# 2. Deploy with fresh build
./scripts/deploy-to-pi.sh -f pi.local prod

# 3. Monitor
ssh pi@pi.local "cd /opt/wise2-edge && docker compose logs -f"
```

### Scenario 3: Troubleshooting failed deployment
```bash
# 1. Check deployment log
tail -f logs/deployments/deploy-*.log

# 2. SSH to Pi and investigate
ssh pi@pi.local
cd /opt/wise2-edge
docker compose -f docker-compose.pi3b.yml ps    # Check status
docker compose -f docker-compose.pi3b.yml logs  # View errors

# 3. Fix issue (e.g., environment variable)
nano .env
docker compose -f docker-compose.pi3b.yml restart

# 4. Redeploy
exit
./scripts/deploy-to-pi.sh pi.local prod
```

### Scenario 4: Rollback after bad deployment
```bash
# 1. List backups
ssh pi@pi.local "ls -la /opt/wise2-edge-backups/"

# 2. Stop current version
ssh pi@pi.local "cd /opt/wise2-edge && docker compose -f docker-compose.pi3b.yml down"

# 3. Restore from backup
ssh pi@pi.local "
  cd /opt/wise2-edge-backups
  tar -xzf backup-YYYYMMDD-HHMMSS.tar.gz
  rm -rf /opt/wise2-edge/data/*
  mv backup-*/* /opt/wise2-edge/data/
  rm -rf backup-*
  cd /opt/wise2-edge
  docker compose -f docker-compose.pi3b.yml up -d
"
```

## Architecture Info

| Pi Model | Arch | Bits | Base Image | Speed |
|----------|------|------|------------|-------|
| Pi 3B/3B+ | ARMv7 | 32 | arm32v7 | ~1.2GHz |
| Pi 4 | ARMv8 | 64 | arm64v8 | ~1.5GHz |

*Script auto-detects architecture - no manual selection needed*

## Monitoring

Use included monitoring script:
```bash
./pi3b-monitoring.sh status     # Quick status
./pi3b-monitoring.sh health     # API health check
./pi3b-monitoring.sh resources  # CPU/RAM/Disk
./pi3b-monitoring.sh logs       # Last 20 log lines
./pi3b-monitoring.sh report     # Full health report
./pi3b-monitoring.sh trouble    # Troubleshooting wizard
```

## Environment Variables (Key)

```bash
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
API_KEY=your-key-here        # For cloud sync
OFFLINE_MODE=false           # Run offline
VOICE_MODEL=tinyllama        # Or mistral:7b-q4
MAX_CONNECTIONS=20           # Connection pool
SYNC_INTERVAL=60000          # Cloud sync interval (ms)
```

## Links & Docs

- Full Guide: `docs/RASPBERRY_PI_DEPLOYMENT_GUIDE.md`
- Monitoring: `pi3b-monitoring.sh`
- Config Example: `.env.production.example`
- Pi Config: `docker-compose.pi3b.yml`

---

**Quick Links**  
Deploy: `./scripts/deploy-to-pi.sh pi.local prod`  
Logs: `logs/deployments/deploy-*.log`  
Backups: `/opt/wise2-edge-backups/` (on Pi)
