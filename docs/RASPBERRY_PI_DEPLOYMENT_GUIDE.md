# Raspberry Pi Deployment Guide - WISE² Core

This guide covers deploying WISE² Core to Raspberry Pi 3B+ and Raspberry Pi 4 using the automated deployment script.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Deployment Script Features](#deployment-script-features)
4. [Architecture Detection](#architecture-detection)
5. [Environment Configuration](#environment-configuration)
6. [Deployment Process](#deployment-process)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)
9. [Rollback Procedure](#rollback-procedure)

---

## Prerequisites

### Local Machine Requirements
- macOS, Linux, or Windows (with WSL)
- `git` installed
- `docker` installed (for local builds if needed)
- `ssh` and `scp` available
- Network access to Pi

### Raspberry Pi Requirements

#### Hardware
- **Raspberry Pi 3B+** (1GB RAM, ARMv7 32-bit) - Minimum
- **Raspberry Pi 4** (4GB+ RAM, ARMv8 64-bit) - Recommended
- **Storage**: 16GB+ microSD card recommended
- **Power**: Proper 5V USB power supply (not USB hub)
- **Network**: Ethernet or WiFi (Ethernet recommended for stability)

#### Operating System
- Raspberry Pi OS (Lite or Desktop)
- Fresh installation recommended
- SSH enabled and accessible

#### Software
- Docker & Docker Compose (script can auto-install)
- 2GB+ swap configured (optional but recommended)

### Network Setup
- Pi must be on accessible network
- SSH access configured (usually password-based on Raspberry Pi OS)
- At least 10GB free disk space

---

## Quick Start

### 1. Prepare Environment Configuration

```bash
# Copy the environment template
cp .env.production.example .env.production

# Edit with your configuration
vi .env.production

# Required settings for Pi:
# - PORT (should be 3000 for edge runtime)
# - Database credentials
# - API keys (if connecting to cloud)
```

### 2. Run Deployment

```bash
# Deploy to Pi with hostname "pi.local"
./scripts/deploy-to-pi.sh pi.local prod

# Or use IP address
./scripts/deploy-to-pi.sh 192.168.1.100 prod

# Deploy to staging
./scripts/deploy-to-pi.sh pi.local staging

# With custom SSH user and port
./scripts/deploy-to-pi.sh -u pi -p 2222 192.168.1.100 prod

# Dry run (see what would happen)
./scripts/deploy-to-pi.sh -d pi.local prod
```

### 3. Verify Deployment

```bash
# Check if services are running
ssh pi@pi.local "cd /opt/wise2-edge && docker compose -f docker-compose.pi3b.yml ps"

# Check API health
curl http://pi.local:3000/health

# View logs
ssh pi@pi.local "cd /opt/wise2-edge && docker compose -f docker-compose.pi3b.yml logs -f edge-runtime"
```

---

## Deployment Script Features

### Prerequisite Checks
- Verifies local git and docker installation
- Tests SSH connectivity to Pi
- Confirms Pi has Docker installed (auto-installs if needed)
- Checks Docker Compose version
- Validates free disk space (warns if <10GB, errors if <5GB)
- Reports available memory

### Architecture Detection
Automatically detects and configures for:
- **Pi 3B/3B+**: ARMv7 32-bit (arm32v7 images)
- **Pi 4**: ARMv8 64-bit (arm64v8 images)

### Repository Management
- Clones fresh repo on first deployment
- Updates existing repo on subsequent deployments
- Ensures clean main branch state

### Environment Configuration
- Loads `.env.production` or `.env.staging`
- Validates configuration before deployment
- Securely uploads via SCP

### Docker Image Building
- Builds ARM-optimized images on Pi
- Multi-stage builds to minimize size
- Uses BuildKit for efficient caching
- Separate builds for API, Website, and Studio

### Graceful Container Lifecycle
- Creates backup before any changes
- Stops containers with 30s timeout
- Force-kills if necessary
- Waits for stabilization

### Database Migrations
- Waits for database to be ready
- Runs migrations automatically
- Reports if manual intervention needed

### Health Checks
- Monitors container health status
- Tests API endpoints
- Polls with 5-second intervals
- 60-second default timeout
- Can be skipped if needed

### Automatic Rollback
- Creates timestamped backups before deployment
- Restores data if health checks fail
- Preserves backup archives for manual recovery
- Detailed rollback logging

### Comprehensive Logging
- All operations logged to timestamped file
- Deployment report generated
- Separate report file with deployment summary
- Failure reasons clearly documented

---

## Architecture Detection

The script automatically detects Pi architecture and uses appropriate Docker images:

```bash
# Raspberry Pi 3B+ (ARMv7)
uname -m  # Returns: armv7l
# Uses: arm32v7 base images (lighter, 32-bit optimized)

# Raspberry Pi 4 (ARMv8)
uname -m  # Returns: aarch64
# Uses: arm64v8 base images (faster, 64-bit optimized)
```

Image selection is automatic - no manual configuration needed.

---

## Environment Configuration

### Configuration Files

**Production**: `.env.production`
```bash
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
API_KEY=your_api_key_here
# ... other config
```

**Staging**: `.env.staging`
```bash
NODE_ENV=production
PORT=3000
LOG_LEVEL=debug
API_KEY=your_staging_key_here
# ... other config
```

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Runtime environment | `production` |
| `PORT` | API server port | `3000` |
| `LOG_LEVEL` | Logging verbosity | `info`, `debug` |
| `API_KEY` | Cloud sync key (optional) | `sk_live_abc123...` |
| `OFFLINE_MODE` | Run without cloud sync | `true`, `false` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OLLAMA_URL` | Local LLM inference | `http://ollama:11434` |
| `VOICE_MODEL` | Lightweight model | `tinyllama` |
| `MAX_CONNECTIONS` | Connection pool size | `20` |
| `SYNC_INTERVAL` | Cloud sync interval (ms) | `60000` |

### Create Configuration

```bash
# Copy example
cp .env.production.example .env.production

# Edit with your values
nano .env.production

# Key settings for Pi deployment:
# 1. Set NODE_ENV=production
# 2. Set PORT=3000 (or your preferred port)
# 3. Set API_KEY if using cloud sync
# 4. Set OFFLINE_MODE based on your setup
# 5. Adjust resource limits for Pi 3B vs Pi 4
```

---

## Deployment Process

### Step-by-Step Flow

```
1. Local Checks
   └─ Verify git, docker installed
   └─ Test SSH to Pi

2. Pi Checks
   └─ Detect architecture (arm32v7 or arm64v8)
   └─ Verify Docker installed (auto-install if needed)
   └─ Check Docker Compose version
   └─ Validate free disk space
   └─ Report memory availability

3. Repository
   └─ Clone or update repo on Pi
   └─ Reset to main branch

4. Configuration
   └─ Upload .env file
   └─ Validate configuration

5. Docker Build
   └─ Build API image (ARM-optimized)
   └─ Build website image
   └─ Build studio image
   └─ Timeout after 30 minutes

6. Backup
   └─ Create timestamped data backup
   └─ Save container state JSON

7. Container Lifecycle
   └─ Stop existing containers (30s timeout)
   └─ Start new containers
   └─ Wait for stabilization

8. Database
   └─ Wait for DB to be ready
   └─ Run migrations

9. Health Checks
   └─ Check container health (60s timeout)
   └─ Test API endpoints
   └─ Report overall status

10. Reporting
    └─ Generate deployment report
    └─ Display summary and next steps
```

### Deployment Commands

```bash
# Standard production deployment
./scripts/deploy-to-pi.sh pi.local prod

# Staging deployment
./scripts/deploy-to-pi.sh pi.local staging

# Force rebuild Docker images
./scripts/deploy-to-pi.sh -f pi.local prod

# Dry run (no changes made)
./scripts/deploy-to-pi.sh -d pi.local prod

# Skip health checks
./scripts/deploy-to-pi.sh --skip-health-check pi.local prod

# Custom SSH settings
./scripts/deploy-to-pi.sh -u ubuntu -p 2222 192.168.1.50 prod

# All options
./scripts/deploy-to-pi.sh \
  -u pi \
  -p 22 \
  -f \
  --skip-health-check \
  pi.local prod
```

### Expected Output

```
════════════════════════════════════════════════════════════════
WISE² Core - Raspberry Pi Deployment
════════════════════════════════════════════════════════════════
ℹ Start time: Wed Jul 23 10:45:32 EDT 2026
ℹ Log file: /Users/user/Projects/wise2-core/logs/deployments/deploy-20260723-104532.log

════════════════════════════════════════════════════════════════
Checking Prerequisites
════════════════════════════════════════════════════════════════
✓ git found
✓ docker found locally
── Checking SSH connectivity to Pi (pi.local)
✓ SSH connection successful

[... more output ...]

════════════════════════════════════════════════════════════════
Deployment Report
════════════════════════════════════════════════════════════════
✓ Deployment completed successfully!

Deployment Report:

================================================================================
WISE² Core - Raspberry Pi Deployment Report
Generated: Wed Jul 23 10:52:15 EDT 2026
================================================================================

DEPLOYMENT DETAILS
------------------
Pi Hostname/IP: pi.local
Environment: prod
Architecture: arm32v7
Status: SUCCESS
Duration: 425 seconds
Backup: backup-20260723-104532

SERVICES
--------
API Server: http://pi.local:3000
Ollama: http://pi.local:11434 (if running)

[... more details ...]
```

### Deployment Time Estimates

**Raspberry Pi 3B+ (1GB RAM)**
- Prerequisites: 10-15 seconds
- Repository: 20-30 seconds
- Docker build: 15-25 minutes
- Container lifecycle: 5-10 seconds
- Health checks: 30-60 seconds
- **Total: 20-30 minutes**

**Raspberry Pi 4 (4GB+ RAM)**
- Prerequisites: 10-15 seconds
- Repository: 20-30 seconds
- Docker build: 8-15 minutes
- Container lifecycle: 5-10 seconds
- Health checks: 30-60 seconds
- **Total: 10-20 minutes**

---

## Monitoring

### Check Deployment Status

```bash
# SSH to Pi
ssh pi@pi.local

# View container status
cd /opt/wise2-edge
docker compose -f docker-compose.pi3b.yml ps

# View container logs
docker compose -f docker-compose.pi3b.yml logs -f edge-runtime

# Check resource usage
docker stats

# Monitor temperature
vcgencmd measure_temp

# Check memory
free -h

# Check disk
df -h /
```

### Health Check

```bash
# API health endpoint
curl http://pi.local:3000/health

# Expected response
{
  "status": "healthy",
  "uptime": 3600,
  "services": {
    "database": "connected",
    "cache": "connected",
    "ollama": "connected"
  }
}
```

### Access Points

| Service | URL | Notes |
|---------|-----|-------|
| API | `http://pi.local:3000` | Main edge runtime |
| Ollama | `http://pi.local:11434` | Local LLM (if enabled) |
| Logs | SSH + `docker logs` | View container output |

---

## Troubleshooting

### Common Issues

#### SSH Connection Failed
```
Error: SSH connection failed to pi@pi.local
```

**Solution:**
1. Verify Pi is powered on: `ping pi.local`
2. Check SSH is enabled: SSH into Pi using other method
3. Verify SSH key/password: `ssh -v pi@pi.local`
4. Check firewall on Pi: `sudo ufw status`

#### Docker Not Installed
```
Error: Docker not installed on Pi
```

**Solution:**
- Script will auto-install Docker
- If manual install needed:
  ```bash
  ssh pi@pi.local
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker pi
  exit
  ```

#### Insufficient Disk Space
```
Error: Critical: Less than 5GB free disk space
```

**Solution:**
```bash
ssh pi@pi.local
# Check what's taking space
du -sh /opt/wise2-edge/*
df -h /

# Clean Docker if needed
docker system prune -a
docker image prune -a

# Remove old logs
sudo find /var/log -type f -name '*.log' -mtime +30 -delete
```

#### Out of Memory
```
containers not responding to health check
```

**Solution:**
1. Check memory: `free -h` on Pi
2. Reduce connection limits in `.env`
3. Restart containers: `docker compose restart`
4. Increase swap: `sudo fallocate -l 3G /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile`

#### High Temperature
```
Warning: Temperature elevated (78.5°C)
```

**Solution:**
1. Add heatsink to CPU
2. Improve air circulation
3. Check for blocked vents
4. Reduce CPU frequency (if thermal throttling):
   ```bash
   # Edit /boot/config.txt
   sudo nano /boot/config.txt
   # Add: arm_freq=1000  # Reduce from 1200 MHz
   ```

#### Docker Image Build Timeout
```
Error: Docker image build failed (timeout after 1800s)
```

**Solution:**
1. Pi 3B might be too slow - increase timeout:
   ```bash
   ./scripts/deploy-to-pi.sh --build-timeout 3600 pi.local prod
   ```
2. Use pre-built images:
   ```bash
   # Skip build, pull from registry
   docker pull wise2/api:latest
   ```
3. Build on faster machine and push to registry

#### API Health Check Fails
```
Error: Health check timeout after 60s
```

**Solution:**
1. Check logs: `docker compose logs edge-runtime`
2. Verify environment: `docker exec wise2-edge-runtime env`
3. Test database: `curl http://pi.local:3000/db-health`
4. Skip health checks and investigate manually:
   ```bash
   ./scripts/deploy-to-pi.sh --skip-health-check pi.local prod
   ```

### Debug Deployment

#### Enable verbose logging
```bash
# Run with bash debug mode
bash -x ./scripts/deploy-to-pi.sh pi.local prod

# Or check log file
tail -f logs/deployments/deploy-*.log
```

#### Manual intervention
```bash
# SSH to Pi
ssh pi@pi.local

# Navigate to deployment
cd /opt/wise2-edge

# Inspect Docker state
docker ps -a
docker images
docker logs wise2-edge-runtime

# Manually restart
docker compose -f docker-compose.pi3b.yml restart

# Run migrations manually
docker compose -f docker-compose.pi3b.yml exec edge-runtime npm run db:migrate
```

---

## Rollback Procedure

### Automatic Rollback

If health checks fail, script automatically attempts rollback:

```bash
# Script detects health check failure
# Creates backup before deployment
# Restores data from backup
# Restarts containers with previous version
# Reports rollback status
```

### Manual Rollback

```bash
# SSH to Pi
ssh pi@pi.local

# List available backups
ls -la /opt/wise2-edge-backups/

# Stop current containers
cd /opt/wise2-edge
docker compose -f docker-compose.pi3b.yml down

# Extract backup
cd /opt/wise2-edge-backups
tar -xzf backup-20260723-104532.tar.gz

# Restore data
rm -rf /opt/wise2-edge/data/*
mv backup-20260723-104532/* /opt/wise2-edge/data/

# Clean up
rm -rf backup-20260723-104532

# Restart containers
cd /opt/wise2-edge
docker compose -f docker-compose.pi3b.yml up -d
```

### Previous Version Recovery

```bash
# List Docker image history
docker images wise2-api

# Run previous image version
docker run -d \
  --name wise2-api-backup \
  -p 3000:3000 \
  wise2-api:previous-hash
```

---

## Performance Tuning

### Pi 3B (1GB RAM) Optimization
```bash
# Set resource limits in docker-compose.pi3b.yml
deploy:
  resources:
    limits:
      cpus: '1.8'
      memory: 512M
    reservations:
      memory: 256M

# Reduce connection pool
MAX_CONNECTIONS=10
SYNC_INTERVAL=120000

# Use lightweight model
VOICE_MODEL=tinyllama
```

### Pi 4 (4GB+ RAM) Tuning
```bash
# Increase resource allocation
deploy:
  resources:
    limits:
      cpus: '3.5'
      memory: 2G

# More aggressive connection pooling
MAX_CONNECTIONS=30

# Can use larger model
VOICE_MODEL=mistral:7b-q4
```

### Monitoring Script

```bash
# Use included monitoring script
./pi3b-monitoring.sh status      # Container status
./pi3b-monitoring.sh health      # API health
./pi3b-monitoring.sh resources   # CPU/memory/disk
./pi3b-monitoring.sh logs        # Recent logs
./pi3b-monitoring.sh report      # Full report
```

---

## Support

### Getting Help

1. **Check logs**:
   ```bash
   cat logs/deployments/deploy-*.log
   ```

2. **Enable debug mode**:
   ```bash
   bash -x ./scripts/deploy-to-pi.sh pi.local prod 2>&1 | tee debug.log
   ```

3. **Verify environment**:
   ```bash
   ssh pi@pi.local
   env | grep -E '^(PORT|NODE_ENV|LOG_LEVEL)'
   ```

4. **Test connectivity**:
   ```bash
   ping pi.local
   ssh pi@pi.local "docker ps"
   curl http://pi.local:3000/health
   ```

### Useful Commands

```bash
# Restart deployment
./scripts/deploy-to-pi.sh pi.local prod

# Rebuild images
./scripts/deploy-to-pi.sh -f pi.local prod

# Check status
ssh pi@pi.local "cd /opt/wise2-edge && docker compose -f docker-compose.pi3b.yml ps"

# View logs
ssh pi@pi.local "cd /opt/wise2-edge && docker compose -f docker-compose.pi3b.yml logs -f"

# Restart services
ssh pi@pi.local "cd /opt/wise2-edge && docker compose -f docker-compose.pi3b.yml restart"

# Stop services
ssh pi@pi.local "cd /opt/wise2-edge && docker compose -f docker-compose.pi3b.yml down"

# Manual database migration
ssh pi@pi.local "cd /opt/wise2-edge && docker compose -f docker-compose.pi3b.yml exec edge-runtime npm run db:migrate"
```

---

## Additional Resources

- [docker-compose.pi3b.yml](../docker-compose.pi3b.yml) - Pi-optimized configuration
- [pi3b-monitoring.sh](../pi3b-monitoring.sh) - Monitoring and troubleshooting
- [.env.production.example](../.env.production.example) - Configuration template
- [CLAUDE.md](../CLAUDE.md) - Project architecture and guidelines

---

**Last Updated**: 2026-07-23  
**Version**: 1.0
