# WISE² Core - Raspberry Pi Rollback & Disaster Recovery Guide

**Document Purpose**: Complete guide to rolling back Raspberry Pi deployments in case of issues.

**Last Updated**: 2026-07-23  
**Version**: 1.0

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [When to Rollback](#when-to-rollback)
3. [Pre-Rollback Checklist](#pre-rollback-checklist)
4. [Rollback Process](#rollback-process)
5. [Understanding the Script](#understanding-the-script)
6. [Recovery Scenarios](#recovery-scenarios)
7. [Troubleshooting](#troubleshooting)
8. [Post-Rollback Steps](#post-rollback-steps)

---

## Quick Start

### Basic Rollback to Previous Version

```bash
cd /path/to/wise2-core

# Interactive rollback (recommended)
./scripts/rollback-pi.sh pi.local prod

# Alternative with IP address
./scripts/rollback-pi.sh 192.168.1.100 staging
```

### What Happens

1. **Connects** to Pi via SSH
2. **Lists** available deployment versions
3. **Shows** detailed rollback plan
4. **Requests** your confirmation
5. **Executes** rollback with full verification
6. **Reports** results with detailed documentation

---

## When to Rollback

### Good Reasons to Rollback

✓ Critical bug introduced in latest deployment  
✓ Data corruption after deployment  
✓ Performance degradation (services extremely slow)  
✓ Security vulnerability discovered  
✓ Breaking API changes affecting clients  
✓ Database schema incompatibility  

### Use With Caution

⚠ Recent schema changes (may lose data)  
⚠ Multiple days of accumulated data  
⚠ If you're unsure of rollback impact  
⚠ Production environment under heavy load  

### When NOT to Rollback

✗ If the issue is a configuration problem (update config instead)  
✗ If just restarting services might fix it (try restart first)  
✗ If you don't have a backup (create one before rolling back)  

---

## Pre-Rollback Checklist

Before running the rollback script:

### 1. Assess the Situation

- [ ] Confirm the issue is deployment-related
- [ ] Check if services are still responsive
- [ ] Review recent error logs
- [ ] Document the problem (attach to rollback report)

### 2. Notify Team

- [ ] Inform team of planned rollback
- [ ] Estimate downtime (~2-5 minutes)
- [ ] Provide status page/message to users if needed

### 3. Create Backups

```bash
# Backup the current state before rolling back
ssh pi@pi.local 'cd /opt/wise2-edge && \
  docker-compose -f docker-compose.pi3b.yml exec postgres \
  pg_dump -U wise2 wise2_prod > /opt/wise2-edge-backups/pre-rollback-db.sql'

# Backup Docker volumes
ssh pi@pi.local 'docker run --rm \
  -v wise2_postgres_data:/data \
  -v /opt/wise2-edge-backups:/backup \
  alpine tar czf /backup/volumes-pre-rollback.tar.gz -C /data .'
```

### 4. Gather Information

```bash
# Document current state
ssh pi@pi.local 'cd /opt/wise2-edge && \
  docker-compose -f docker-compose.pi3b.yml ps > /tmp/current-state.txt && \
  docker images >> /tmp/current-state.txt && \
  cat /tmp/current-state.txt'

# Check git history to identify target version
git log --oneline -n 20
```

---

## Rollback Process

### Step-by-Step Flow

The script follows this sequence automatically:

#### 1. Pre-Rollback Setup

```
✓ Verify Pi connectivity (SSH)
✓ Verify Docker is available
✓ Display deployment history
✓ Show recent commits
```

#### 2. Version Selection

Choose one of three options:

**Option 1: Previous Version (Recommended)**
- Rolls back to the previous stable deployment
- Best if current deployment has obvious bugs
- Fastest option

**Option 2: Specific Commit**
- Specify exact git commit hash
- Use if you know exactly which version was good
- Good for rolling back through multiple versions

**Option 3: Backup-Based**
- Restore from timestamped backup file
- Use if git repository is corrupted
- Includes full data state from backup time

#### 3. Rollback Plan Generation

Script generates detailed plan showing:
- Current state (commit, version)
- Target state (commit, version)
- Step-by-step execution plan
- Risk assessment
- Data loss implications

**Review this plan carefully!**

#### 4. Confirmation

```
WARNING: This will roll back your deployment to a previous version.
Data integrity will be preserved, but you may lose recent changes.

Do you want to proceed with the rollback? (yes/no):
```

Type `yes` to confirm (required for safety).

#### 5. Execution

The script then:

1. **Creates Pre-Rollback Snapshot**
   - Docker container state
   - Current images
   - Environment backup
   - Container logs
   - Database backup (if accessible)

2. **Stops Services**
   - Website (stops taking requests)
   - API (stops processing)
   - Redis (preserves for restart)
   - PostgreSQL (kept running for migration)

3. **Rolls Back Code**
   - Updates git repository to target commit
   - Or restores from backup if backup-based

4. **Handles Database**
   - Executes backward migrations (if available)
   - Verifies schema compatibility
   - Preserves data integrity

5. **Restores Volumes**
   - Restores data volumes if needed
   - Fixes permissions

6. **Starts Services**
   - PostgreSQL (with health check)
   - Redis (with health check)
   - API (with health check)
   - Website (with health check)

#### 6. Verification

```
✓ API health endpoint responding
✓ Website available
✓ Database connectivity verified
✓ No critical errors in logs
```

---

## Understanding the Script

### Key Components

#### Configuration

```bash
# Pi paths (hardcoded to standard locations)
PI_DEPLOY_DIR="/opt/wise2-edge"
PI_BACKUPS_DIR="/opt/wise2-edge-backups"
PI_DATA_DIR="/opt/wise2-edge/data"

# Health check endpoints
API_HEALTH_ENDPOINT="http://localhost:3000/health"
WEBSITE_HEALTH_ENDPOINT="http://localhost:3001"

# Timing
HEALTH_CHECK_TIMEOUT=120  # seconds
HEALTH_CHECK_INTERVAL=5   # seconds
```

#### Environment Variables (Optional)

```bash
# SSH configuration
export SSH_USER="pi"          # default
export SSH_PORT="22"         # default
export SSH_TIMEOUT="30"      # seconds

# Notifications (future)
export ALERT_EMAIL="..."
export SLACK_WEBHOOK="..."
export DISCORD_WEBHOOK="..."
```

#### Logging

All output is logged to:
```
logs/rollbacks/rollback-YYYYMMDD-HHMMSS.log
logs/rollbacks/rollback-report-YYYYMMDD-HHMMSS.md
```

#### Reports

After rollback, detailed report includes:
- Rollback scope and targets
- Execution steps taken
- Results and status
- Container/service status
- Recent logs
- Next steps and monitoring advice

### Output Colors

- `✓` Green (success)
- `⚠` Yellow (warning)
- `✗` Red (error)
- `ℹ` Blue (information)

---

## Recovery Scenarios

### Scenario 1: Deployment Has Bug

**Symptoms**:
- API returns 500 errors
- Website not loading
- Specific feature broken after deployment

**Recovery**:

```bash
./scripts/rollback-pi.sh pi.local prod

# When prompted:
# Select option 1: Previous version
# Confirm: yes
```

**Why This Works**:
- Previous version didn't have the bug
- Database schema is compatible
- Data is preserved

---

### Scenario 2: Critical Security Issue

**Symptoms**:
- Unauthorized access detected
- Credentials compromised
- Vulnerability published for current version

**Recovery**:

```bash
# First: Change all credentials immediately
export STRIPE_SECRET_KEY="sk_live_new_key_..."
export SENDGRID_API_KEY="SG.new_key..."
# Update in .env files

# Then rollback
./scripts/rollback-pi.sh pi.local prod

# Select option 2: Specific commit
# Enter: known-good-commit-hash
# Confirm: yes
```

**Why This Works**:
- Rollback removes any malicious code
- New credentials prevent re-exploitation

---

### Scenario 3: Database Corruption

**Symptoms**:
- Database queries failing
- Data integrity errors
- PostgreSQL won't start properly

**Recovery**:

```bash
./scripts/rollback-pi.sh pi.local prod

# Select option 3: Restore from backup
# Choose a backup from before corruption occurred
# Confirm: yes
```

**Post-Recovery**:
```bash
# Verify data integrity
ssh pi@pi.local

docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml exec postgres \
  psql -U wise2 -d wise2_prod -c "SELECT count(*) FROM users;"

docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml exec postgres \
  psql -U wise2 -d wise2_prod -c "ANALYZE;"
```

---

### Scenario 4: Cascading Failures After Updates

**Symptoms**:
- Multiple services failing
- Impossible to debug
- Nothing works after recent deployment

**Recovery**:

```bash
# Go back 2-3 versions
./scripts/rollback-pi.sh pi.local prod

# Select option 2: Specific commit
# Use git log to find stable version from a few days ago
git log --oneline --since="2 days ago"
# Enter that commit hash
# Confirm: yes
```

---

### Scenario 5: Docker Image Issues

**Symptoms**:
- Container won't start
- Out of memory errors
- Image build problems

**Recovery**:

```bash
# Rollback to previous code which has working images
./scripts/rollback-pi.sh pi.local prod

# Select option 1: Previous version
# Confirm: yes

# Script will pull previous images automatically
```

---

## Troubleshooting

### Issue: "Cannot connect to Pi"

**Symptoms**:
```
✗ Cannot connect to Pi at 192.168.1.100
  User: pi
  Port: 22
```

**Solutions**:

```bash
# 1. Verify Pi is reachable
ping pi.local
ping 192.168.1.100

# 2. Verify SSH access
ssh pi@pi.local "echo 'test'"

# 3. Check SSH port
ssh -p 22 pi@pi.local "echo 'test'"

# 4. Try with explicit SSH key
export SSH_USER="pi"
ssh -i ~/.ssh/id_rsa pi@192.168.1.100 "echo 'test'"

# 5. Reset SSH connection
ssh-keygen -R pi.local
ssh-keygen -R 192.168.1.100
# Try again
```

---

### Issue: "Docker Compose not found"

**Symptoms**:
```
✗ Docker Compose not installed on Pi
```

**Solutions**:

```bash
# Install Docker Compose on Pi
ssh pi@pi.local

# Option A: Install latest
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Option B: Use Docker Compose V2 (built-in)
sudo apt-get update
sudo apt-get install docker-compose

# Verify
docker-compose --version
```

---

### Issue: "Services won't start after rollback"

**Symptoms**:
```
docker-compose ps

# Shows "Exited" status for services
```

**Debugging**:

```bash
# Check logs
docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml logs -f api

# Common causes:
# 1. Database not ready
docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml logs postgres

# 2. Port already in use
netstat -tlnp | grep 3000
netstat -tlnp | grep 3001

# 3. Insufficient memory
free -h
docker stats

# 4. Health check too strict
# Wait longer before checking
sleep 30
curl -f http://localhost:3000/health
```

---

### Issue: "Database migrations failed"

**Symptoms**:
```
✗ Database schema rollback complete (with errors)
```

**Recovery**:

```bash
# SSH to Pi
ssh pi@pi.local
cd /opt/wise2-edge

# Check migration status
docker-compose -f docker-compose.pi3b.yml exec api npm run migrate:status

# Manually review schema
docker-compose -f docker-compose.pi3b.yml exec postgres psql -U wise2 -d wise2_prod

# View schema
\dt            # Tables
\di            # Indexes
\d+ table_name # Column details
\q             # Exit

# If corrupted, restore from backup
docker-compose -f docker-compose.pi3b.yml exec -T postgres \
  psql -U wise2 -d wise2_prod < /opt/wise2-edge-backups/pre-rollback-db.sql
```

---

### Issue: "Health checks failing"

**Symptoms**:
```
✗ API health check failed after 120s
✗ Website health check failed after 120s
```

**Solutions**:

```bash
# 1. Check if service is running
ssh pi@pi.local
docker ps | grep -E "api|website"

# 2. Check logs for errors
docker logs wise2-api | tail -50

# 3. Increase health check timeout in script
# Edit rollback-pi.sh:
HEALTH_CHECK_TIMEOUT=300  # Increase from 120 to 300 seconds

# 4. Check Pi resources
free -h        # Memory
df -h          # Disk
top -b -n 1    # CPU

# 5. Manually test endpoints
curl -v http://localhost:3000/health
curl -v http://localhost:3001/
```

---

## Post-Rollback Steps

### Immediate (0-5 minutes)

- [ ] Verify all endpoints responding
- [ ] Check data looks correct
- [ ] Review logs for errors
- [ ] Test critical workflows

### Short Term (5-30 minutes)

- [ ] Document what went wrong
- [ ] Identify root cause of issue
- [ ] Take corrective action
- [ ] Plan improved fix

### Medium Term (30 minutes - 2 hours)

- [ ] Apply corrective fix
- [ ] Run additional testing
- [ ] Re-deploy with improved version
- [ ] Monitor new deployment closely

### Long Term

- [ ] Add automated tests for this scenario
- [ ] Improve deployment validation
- [ ] Update CI/CD pipeline
- [ ] Train team on prevention

---

### Monitoring After Rollback

```bash
# Set up continuous monitoring
ssh pi@pi.local

# Watch logs in real-time
docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml logs -f

# Monitor resource usage
docker stats

# Check for errors
docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml logs | grep -i error

# Performance check
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/health
```

---

### Re-deployment After Rollback

Once issue is fixed:

```bash
# 1. Verify fix in development
npm test

# 2. Commit fix to git
git add .
git commit -m "Fix: description of issue and solution"
git push origin main

# 3. Deploy to Pi
./scripts/deploy-to-pi.sh pi.local prod

# 4. Monitor closely
tail -f logs/deployments/deploy-*.log
```

---

## Advanced Usage

### Automated Rollback on Failure

If deployment health checks fail, you could automate rollback:

```bash
#!/bin/bash
# deploy-with-auto-rollback.sh

PREVIOUS_COMMIT=$(git rev-parse HEAD~1)

./scripts/deploy-to-pi.sh pi.local prod

if ! curl -f http://localhost:3000/health &>/dev/null; then
    echo "Deployment health check failed, rolling back..."
    ./scripts/rollback-pi.sh pi.local prod <<< "yes"
fi
```

### Custom Rollback Hooks

Add custom logic to rollback-pi.sh:

```bash
# Add to rollback-pi.sh before line "main "$@""

# Custom notification function
send_custom_notification() {
    local status="$1"
    
    # Send Slack
    curl -X POST $SLACK_WEBHOOK -d "{
        \"text\": \"Rollback ${status}: Check report at $(cat $ROLLBACK_REPORT)\"
    }"
    
    # Send email
    mail -s "WISE² Rollback ${status}" dwise03@gmail.com < $ROLLBACK_REPORT
}

# Update notifications in finalize_rollback_report()
send_custom_notification "$status"
```

---

## Support & Questions

For issues or questions:

1. Check this guide's troubleshooting section
2. Review detailed rollback report: `logs/rollbacks/rollback-report-*.md`
3. Check logs: `logs/rollbacks/rollback-*.log`
4. Contact: dwise03@gmail.com

---

## Appendix: Script Reference

### Full Usage

```bash
./scripts/rollback-pi.sh <hostname> [staging|prod]
```

### Examples

```bash
# Rollback production on Pi at pi.local
./scripts/rollback-pi.sh pi.local prod

# Rollback staging on Pi at 192.168.1.100
./scripts/rollback-pi.sh 192.168.1.100 staging

# With custom SSH user
SSH_USER=ubuntu ./scripts/rollback-pi.sh ubuntu@pi.local prod

# With custom SSH port
SSH_PORT=2222 ./scripts/rollback-pi.sh pi.local prod
```

### Exit Codes

- `0`: Rollback successful
- `1`: Rollback failed or cancelled

### Generated Artifacts

After running rollback:

```
logs/
├── rollbacks/
│   ├── rollback-20260723-120000.log        # Full log
│   └── rollback-report-20260723-120000.md  # Detailed report
└── alerts.log                              # Alert log
```

---

**End of Rollback Guide**

Last updated: 2026-07-23  
Version: 1.0
