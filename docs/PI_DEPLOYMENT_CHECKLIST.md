# Raspberry Pi Deployment Checklist

Use this checklist to ensure a successful WISE² Core deployment to Raspberry Pi.

## Pre-Deployment

### Local Machine Setup
- [ ] macOS/Linux/WSL environment ready
- [ ] `git` installed and configured
- [ ] `docker` installed locally
- [ ] `ssh` and `scp` available in PATH
- [ ] Network connectivity to Pi verified

### Raspberry Pi Preparation
- [ ] Pi powered on and accessible
- [ ] SSH enabled on Pi
- [ ] Public key authentication configured (or password ready)
- [ ] Network connection stable (Ethernet recommended)
- [ ] At least 16GB microSD card installed
- [ ] 2GB+ swap configured (optional but recommended)

### SSH Access Verification
```bash
# Verify SSH works
ssh pi@pi.local "echo 'SSH OK'"

# Verify SCP works
echo "test" > /tmp/test.txt
scp /tmp/test.txt pi@pi.local:/tmp/test.txt
ssh pi@pi.local "cat /tmp/test.txt"
```
- [ ] SSH connectivity confirmed
- [ ] SCP transfer working
- [ ] No password prompts expected (or ready to provide)

### Repository Preparation
- [ ] Local repository up to date: `git pull origin main`
- [ ] All changes committed: `git status`
- [ ] No uncommitted changes: `git diff --quiet`
- [ ] Correct branch: `git branch` (should show `* main`)

### Environment Configuration
- [ ] `.env.production` file exists
  ```bash
  [ -f .env.production ] && echo "OK" || echo "MISSING"
  ```
- [ ] `.env.production` not committed: Check `.gitignore`
  ```bash
  grep ".env" .gitignore
  ```
- [ ] All required variables set in `.env.production`:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3000`
  - [ ] `LOG_LEVEL=info` (or appropriate level)
  - [ ] `API_KEY` (if cloud sync needed)
  - [ ] `OFFLINE_MODE=false` (unless offline-only)

### Disk Space Verification
```bash
# On local machine (for network storage)
df -h | head -1

# On Pi (critical - must have 10GB+)
ssh pi@pi.local "df -h /"
```
- [ ] Local machine has 5GB+ free
- [ ] Pi has 10GB+ free disk space
- [ ] Pi has at least 1GB free in root partition

### Memory Verification
```bash
# Check Pi memory and swap
ssh pi@pi.local "free -h"
```
- [ ] Pi has 1GB+ RAM (Pi 3B minimum)
- [ ] Swap is configured (at least 2GB for Pi 3B)
- [ ] Swap usage acceptable (not maxed out)

## Deployment Day

### Pre-Deployment Review
```bash
# Verify repository state
cd /path/to/wise2-core
git status
git log --oneline | head -3
```
- [ ] Repository is clean (no uncommitted changes)
- [ ] Latest commits are visible
- [ ] Correct branch checked out (`main`)

### Deployment Execution

#### Standard Deployment
```bash
./scripts/deploy-to-pi.sh pi.local prod
```
- [ ] Script starts successfully
- [ ] No SSH connection errors
- [ ] No Docker errors reported
- [ ] All build steps complete
- [ ] Health checks pass

#### Custom Deployment (if applicable)
```bash
# Example: Custom SSH port
./scripts/deploy-to-pi.sh -u pi -p 2222 192.168.1.100 prod
```
- [ ] Command syntax correct
- [ ] All options specified correctly
- [ ] Deployment proceeds without errors

#### Dry Run First (Optional but Recommended)
```bash
# Preview deployment without making changes
./scripts/deploy-to-pi.sh -d pi.local prod
```
- [ ] Output shows all planned steps
- [ ] No errors in dry run
- [ ] Logic and steps appear correct
- [ ] Ready to proceed with real deployment

### During Deployment

Monitor the deployment progress:

#### Phase 1: Prerequisites (1-2 min)
- [ ] Local git/docker verified
- [ ] SSH connection to Pi successful
- [ ] Pi architecture detected (arm32v7 or arm64v8)
- [ ] Docker on Pi available or installed

#### Phase 2: Repository (1-2 min)
- [ ] Repository cloned or updated
- [ ] Latest main branch pulled
- [ ] No git errors reported

#### Phase 3: Configuration (30 sec)
- [ ] Environment file uploaded
- [ ] Configuration validated
- [ ] No validation errors

#### Phase 4: Docker Build (10-30 min, depends on Pi)
- [ ] Build starts successfully
- [ ] No timeout errors
- [ ] All three images built (api, website, studio)
- [ ] No out-of-memory errors during build

#### Phase 5: Container Lifecycle (1-2 min)
- [ ] Backup created successfully
- [ ] Old containers stopped gracefully
- [ ] New containers started
- [ ] Containers stabilizing

#### Phase 6: Database (1-3 min)
- [ ] Database detected as ready
- [ ] Migrations run successfully
- [ ] No migration errors reported

#### Phase 7: Health Checks (1-2 min)
- [ ] Container health status checked
- [ ] API endpoints responding
- [ ] All health checks pass (or skip if intentional)

#### Phase 8: Report (30 sec)
- [ ] Deployment report generated
- [ ] Status shows SUCCESS
- [ ] No warnings or errors (expected)

## Post-Deployment Verification

### Immediate Verification (Right After)

```bash
# Check services running
ssh pi@pi.local "cd /opt/wise2-edge && docker compose -f docker-compose.pi3b.yml ps"
```
- [ ] All containers show `Up` status
- [ ] No containers show `Exited` or `Unhealthy`
- [ ] All expected services present

### API Health Check
```bash
# Test API endpoint
curl http://pi.local:3000/health
```
- [ ] API responds with 200 status
- [ ] Health response shows `"status": "healthy"`
- [ ] All services listed as connected

### Container Log Check
```bash
# View recent logs
ssh pi@pi.local "cd /opt/wise2-edge && docker compose -f docker-compose.pi3b.yml logs --tail 50"
```
- [ ] No ERROR level messages in logs
- [ ] No repeated warning patterns
- [ ] Initialization messages show successful startup

### Resource Check
```bash
# Check Pi resource usage
ssh pi@pi.local "docker stats --no-stream"
```
- [ ] Memory usage reasonable (<80% for Pi 3B, <60% for Pi 4)
- [ ] CPU usage below 100%
- [ ] No crashed containers

### Data Integrity Check
```bash
# Verify data directory exists
ssh pi@pi.local "ls -la /opt/wise2-edge/data"
```
- [ ] Data directory exists
- [ ] Contains expected files/subdirectories
- [ ] Permissions are correct (owned by pi user)

### Network Access Check
```bash
# Test connectivity from multiple clients
curl http://pi.local:3000/health      # From local machine
curl http://192.168.1.100:3000/health # From another machine (change IP)
```
- [ ] API accessible via hostname
- [ ] API accessible via IP address
- [ ] Network routing working correctly

## Environment-Specific Checks

### Production Deployment Additional Checks
- [ ] OFFLINE_MODE set correctly for cloud sync
- [ ] API_KEY configured for cloud connectivity
- [ ] SSL/TLS certificates configured (if applicable)
- [ ] Monitoring and alerting configured
- [ ] Backup schedule configured

### Staging Deployment Additional Checks
- [ ] Environment clearly marked as staging
- [ ] LOG_LEVEL set to debug or info
- [ ] Testing credentials used (not production secrets)
- [ ] May need to disable some features for testing

## Troubleshooting Checklist

If deployment fails, work through these in order:

### Phase 1: Connectivity Issues
```bash
ping pi.local
ssh pi@pi.local "echo ok"
```
- [ ] Pi is reachable on network
- [ ] SSH authentication working
- [ ] No timeout issues
**If failed**: Check network, SSH setup, firewall

### Phase 2: Repository Issues
```bash
ssh pi@pi.local "cd /opt/wise2-edge && git status"
```
- [ ] Repository exists on Pi
- [ ] Main branch checked out
- [ ] No merge conflicts
**If failed**: Re-clone or manually fix repository

### Phase 3: Environment Issues
```bash
ssh pi@pi.local "cat /opt/wise2-edge/.env | head -5"
```
- [ ] Environment file uploaded
- [ ] Content looks correct (no truncation)
- [ ] All required variables present
**If failed**: Re-upload .env file

### Phase 4: Docker Issues
```bash
ssh pi@pi.local "docker ps -a"
ssh pi@pi.local "docker images"
```
- [ ] Docker daemon running
- [ ] Images built or available
- [ ] No corrupted images
**If failed**: Restart Docker daemon

### Phase 5: Build Issues
```bash
ssh pi@pi.local "docker logs wise2-api 2>&1 | tail -30"
```
- [ ] Build errors visible in logs
- [ ] Out-of-memory errors? Increase swap or timeout
- [ ] Network errors? Check Pi internet connectivity
**If failed**: Use `-f --force-rebuild` flag or build locally

### Phase 6: Runtime Issues
```bash
ssh pi@pi.local "cd /opt/wise2-edge && docker compose logs edge-runtime"
```
- [ ] Application startup errors clear
- [ ] Database connection issues?
- [ ] Missing environment variables?
**If failed**: Fix issue and redeploy

## Rollback Checklist

If deployment causes problems:

```bash
# 1. List available backups
ssh pi@pi.local "ls -la /opt/wise2-edge-backups/"

# 2. Identify latest successful backup
# Note the backup name (e.g., backup-20260723-104532)

# 3. Execute rollback (see troubleshooting guide for details)
```

- [ ] Latest backup identified
- [ ] Backup file size reasonable (not 0 bytes)
- [ ] Ready to restore if needed
- [ ] Have tested restore procedure

## Sign-Off

Complete this section when deployment is fully verified:

```
Deployed By: _____________________
Date: _____________________________
Time: _____________________________
Environment: [ ] Production  [ ] Staging
Pi Hostname/IP: ___________________
Status: [ ] SUCCESS  [ ] FAILED (documented below)

Notes:
_____________________________________________________________________
_____________________________________________________________________
_____________________________________________________________________

Issues Encountered: [ ] None  [ ] Yes - Details:
_____________________________________________________________________
_____________________________________________________________________

Rollback Needed: [ ] No  [ ] Yes - Date/Time: ____________
```

---

## Quick Command Reference

| Task | Command |
|------|---------|
| Deploy | `./scripts/deploy-to-pi.sh pi.local prod` |
| Dry run | `./scripts/deploy-to-pi.sh -d pi.local prod` |
| Check status | `ssh pi@pi.local "cd /opt/wise2-edge && docker compose -f docker-compose.pi3b.yml ps"` |
| View logs | `ssh pi@pi.local "cd /opt/wise2-edge && docker compose logs -f"` |
| Stop services | `ssh pi@pi.local "cd /opt/wise2-edge && docker compose down"` |
| Start services | `ssh pi@pi.local "cd /opt/wise2-edge && docker compose up -d"` |
| Check health | `curl http://pi.local:3000/health` |
| Monitor resources | `ssh pi@pi.local "docker stats"` |
| Check temperature | `ssh pi@pi.local "vcgencmd measure_temp"` |
| View backups | `ssh pi@pi.local "ls -la /opt/wise2-edge-backups/"` |

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-23  
**For Issues**: See `docs/RASPBERRY_PI_DEPLOYMENT_GUIDE.md`
