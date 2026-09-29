# WISE² Core - Disaster Recovery Operations Manual

**Purpose**: Complete operational guide for recovering from Raspberry Pi deployment failures  
**Audience**: DevOps, Platform Engineers, On-Call Responders  
**Last Updated**: 2026-07-23  
**Version**: 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [Tools Inventory](#tools-inventory)
3. [Before Deployment (Prevention)](#before-deployment-prevention)
4. [During Outage (Recovery)](#during-outage-recovery)
5. [After Recovery (Analysis)](#after-recovery-analysis)
6. [Runbooks by Scenario](#runbooks-by-scenario)
7. [Backup Strategy](#backup-strategy)
8. [Automation & Monitoring](#automation--monitoring)

---

## Overview

### Architecture

```
WISE² Raspberry Pi Deployment
├── Container Orchestration (Docker Compose)
│   ├── PostgreSQL (Database)
│   ├── Redis (Cache/Sessions)
│   ├── API (NestJS backend)
│   └── Website (Next.js frontend)
├── Data Persistence (Volumes)
│   ├── postgres_data
│   └── redis_data
└── Disaster Recovery
    ├── Backup Management (backup-manager.sh)
    └── Rollback System (rollback-pi.sh)
```

### Recovery Time Objectives (RTO)

| Scenario | RTO | Notes |
|----------|-----|-------|
| Bug fix | 5-10 min | Code rollback + service restart |
| Database corruption | 15-30 min | Restore from backup + verify |
| Complete failure | 30-60 min | Full restore from snapshot |
| Security incident | 10-20 min | Rollback + credential rotation |

### Recovery Point Objectives (RPO)

| Component | RPO | Strategy |
|-----------|-----|----------|
| Database | 1-2 hours | Continuous backups |
| Application code | Immediate | Git-based rollback |
| Configuration | Real-time | .env backup + restore |
| Docker images | Real-time | Pull from registry |

---

## Tools Inventory

### 1. Rollback Script (`rollback-pi.sh`)

**Purpose**: Automated rollback to previous working version

**Features**:
- Interactive version selection
- Automatic deployment history display
- Pre-rollback snapshots
- Database schema migration handling
- Health verification
- Detailed reporting

**Usage**:
```bash
./scripts/rollback-pi.sh pi.local prod
```

**Output**:
- Logs: `logs/rollbacks/rollback-YYYYMMDD-HHMMSS.log`
- Report: `logs/rollbacks/rollback-report-YYYYMMDD-HHMMSS.md`

---

### 2. Backup Manager (`backup-manager.sh`)

**Purpose**: Create, list, and restore backups

**Features**:
- Backup creation (database + volumes)
- Automatic retention/cleanup
- Multi-destination support
- Restore capability

**Usage**:
```bash
# Create backup
./scripts/backup-manager.sh pi.local create

# List backups
./scripts/backup-manager.sh pi.local list

# Cleanup old backups
./scripts/backup-manager.sh pi.local cleanup

# Restore from backup
./scripts/backup-manager.sh pi.local restore backup-20260723-120000
```

**Output**:
- Logs: `logs/backups/backup.log`
- Backups: `logs/backups/backup-YYYYMMDD-HHMMSS/`

---

### 3. Health Check Script (`health-check.sh`)

**Purpose**: Verify service health (already exists)

**Usage**:
```bash
./scripts/health-check.sh
```

---

## Before Deployment (Prevention)

### Pre-Deployment Checklist

Run before EVERY deployment to Pi:

```bash
# 1. Verify current state
./scripts/health-check.sh

# 2. Create backup
./scripts/backup-manager.sh pi.local create

# 3. Verify backup success
./scripts/backup-manager.sh pi.local list

# 4. Check git status
git status
git log --oneline -n 5

# 5. Verify deployment script
ls -l ./scripts/deploy-to-pi.sh

# 6. Then deploy
./scripts/deploy-to-pi.sh pi.local prod
```

### Automated Pre-Deployment Backup

Add to deployment script wrapper:

```bash
#!/bin/bash
# deploy-with-backup.sh

set -e

PI_HOST="${1:-pi.local}"
ENVIRONMENT="${2:-prod}"

echo "Creating pre-deployment backup..."
./scripts/backup-manager.sh "$PI_HOST" create

echo "Deploying..."
./scripts/deploy-to-pi.sh "$PI_HOST" "$ENVIRONMENT"

echo "Deployment complete. Backup available for rollback."
```

---

## During Outage (Recovery)

### Initial Response (0-2 minutes)

1. **Acknowledge the incident**
   ```bash
   # Notify stakeholders
   # - Update status page
   # - Post in team chat
   ```

2. **Verify connectivity**
   ```bash
   ping pi.local
   ssh pi@pi.local "echo 'responsive'"
   ```

3. **Quick health check**
   ```bash
   ./scripts/health-check.sh
   ```

### Diagnosis (2-5 minutes)

Determine root cause:

```bash
ssh pi@pi.local

# Check services
docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml ps

# Check logs
docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml logs -f api

# Check resources
free -h
df -h
docker stats

# Check database
docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml exec postgres \
  psql -U wise2 -d wise2_prod -c "SELECT 1;"
```

### Decision Tree

```
Is Pi responsive?
├─ No → Network issue → troubleshoot network
└─ Yes
   ├─ Are containers running?
   │  ├─ No → Start services: docker-compose up -d
   │  └─ Yes
   │     ├─ Are they healthy?
   │     │  ├─ No → Check logs, try restart
   │     │  └─ Yes
   │     │     ├─ Is database accessible?
   │     │     │  ├─ No → Investigate DB, may need restore
   │     │     │  └─ Yes → Application-level issue
   │     └─ Application issue → Review logs → Identify change
   │
   └─ Recent deployment?
      ├─ Yes → Rollback: ./scripts/rollback-pi.sh pi.local prod
      └─ No → Gradual failure → Investigate root cause
```

---

## Rollback Decision Matrix

### Should I Rollback?

| Condition | Rollback? | Why |
|-----------|-----------|-----|
| API returns 500 errors | ✓ YES | Likely deployment bug |
| Slow responses (>5s) | ⚠ MAYBE | Could be resource issue |
| Database connection errors | ✓ YES | Schema incompatibility likely |
| Auth not working | ✓ YES | Security-critical |
| All services down | ✓ YES | Recent deployment likely cause |
| 1 feature broken | ⚠ MAYBE | Try config change first |
| Memory errors (OOM) | ⚠ MAYBE | May just need restart |

### Execution (5-15 minutes)

When rollback is necessary:

```bash
# 1. Confirm rollback needed
echo "Rollback confirmed - starting..."

# 2. Execute rollback
./scripts/rollback-pi.sh pi.local prod

# During script execution:
# - Review rollback plan
# - Confirm "yes" when prompted
# - Monitor progress
# - Wait for health checks

# 3. Verify success
curl http://pi.local:3000/health
curl http://pi.local:3001

# 4. Notify team
echo "Rollback successful. Services restored to previous version."
```

---

## After Recovery (Analysis)

### Post-Incident Review

Within 1 hour of recovery:

1. **Collect artifacts**
   ```bash
   # The script auto-generates these:
   cat logs/rollbacks/rollback-report-*.md
   cat logs/rollbacks/rollback-*.log
   ```

2. **Document findings**
   - What went wrong?
   - When did it start?
   - Why wasn't it caught earlier?
   - How can we prevent recurrence?

3. **Communicate**
   - Send incident summary to team
   - Include link to rollback report
   - Outline investigation plan

### Root Cause Analysis

```bash
# 1. Compare versions
git log --oneline
git show <bad-commit>
git show <good-commit>

# 2. Review logs
docker-compose logs --since "30m ago" | grep -i error

# 3. Check deployment config
cat .env.prod
cat docker-compose.pi3b.yml

# 4. Identify what changed
git diff <good>..<bad>

# 5. Fix the issue
# ... make fixes ...
git commit -m "Fix: [issue description]"
```

### Prevention for Next Time

Update playbooks:
```bash
# Add scenario to ROLLBACK_GUIDE.md
# Add check to pre-deployment script
# Add test to CI/CD pipeline
# Update monitoring/alerts
```

---

## Runbooks by Scenario

### Scenario A: Bug in Deployment

**Symptoms**: API returns 500s after deployment

**Steps**:
```bash
# 1. Verify it's a new bug
curl -v http://pi.local:3000/health
docker-compose logs api | tail -20

# 2. Check if previous version works
./scripts/rollback-pi.sh pi.local prod
# Select option 1 (previous version)
# Confirm: yes

# 3. Verify
sleep 30
curl -v http://pi.local:3000/health

# 4. If successful, fix and redeploy
# ... apply fix to code ...
git commit -m "Fix: [issue]"
./scripts/deploy-to-pi.sh pi.local prod
```

**Estimated Duration**: 10-15 minutes

---

### Scenario B: Database Corruption

**Symptoms**: Database queries fail with schema errors

**Steps**:
```bash
# 1. Verify database issue
ssh pi@pi.local
docker-compose exec postgres psql -U wise2 -d wise2_prod -c "\dt"

# 2. Check backup availability
./scripts/backup-manager.sh pi.local list

# 3. Create pre-restore snapshot
ssh pi@pi.local 'cp -r /var/lib/docker/volumes/wise2_postgres_data \
  /opt/wise2-edge-backups/corrupted-snapshot'

# 4. Restore from backup
./scripts/backup-manager.sh pi.local restore backup-20260722-150000

# 5. Verify restoration
docker-compose exec postgres psql -U wise2 -d wise2_prod -c "SELECT count(*) FROM users;"

# 6. Identify cause
# ... review what happened ...

# 7. Monitor going forward
./scripts/health-check.sh  # every 5 minutes
```

**Estimated Duration**: 15-30 minutes

---

### Scenario C: Security Incident

**Symptoms**: Unauthorized access detected

**Steps**:
```bash
# 1. IMMEDIATE: Isolate if needed
ssh pi@pi.local
# Option A: Stop services
docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml stop

# Option B: Disconnect from network
# sudo ifconfig eth0 down

# 2. Create forensic backup
./scripts/backup-manager.sh pi.local create

# 3. Rotate credentials
export STRIPE_SECRET_KEY="sk_live_new_..."
export SENDGRID_API_KEY="SG.new_..."
# Update in .env file

# 4. Rollback to before incident
./scripts/rollback-pi.sh pi.local prod
# Select older version before incident

# 5. Deploy with new credentials
export STRIPE_SECRET_KEY="sk_live_new_..."
./scripts/deploy-to-pi.sh pi.local prod

# 6. Investigate in forensic backup
# ... analyze logs, identify breach ...

# 7. Monitor for re-exploitation
tail -f /var/log/wise2-edge-appliance/*
```

**Estimated Duration**: 20-40 minutes

---

### Scenario D: Cascading Failures

**Symptoms**: Multiple services failing, hard to debug

**Steps**:
```bash
# 1. Go back several versions
./scripts/rollback-pi.sh pi.local prod
# Select option 2: Specific commit
# Use commit from 2-3 days ago (before failures started)

# 2. Test
curl -v http://pi.local:3000/health
curl -v http://pi.local:3001

# 3. Gradually roll forward
# Apply one fix at a time
# Re-deploy and test each fix

# 4. Identify the bad commit
git log --oneline
# Find commit that broke things

# 5. Fix properly
git show <bad-commit>
# Apply targeted fix
git commit -m "Fix: [specific issue]"
./scripts/deploy-to-pi.sh pi.local prod
```

**Estimated Duration**: 30-60 minutes

---

## Backup Strategy

### Backup Frequency

| Component | Frequency | Retention |
|-----------|-----------|-----------|
| Database | Daily (automatic) | 7 days |
| Volumes | Daily (automatic) | 7 days |
| Configuration (.env) | Before each deployment | N/A |
| Docker images | After each build | Latest 5 |

### Automated Backup Scheduling

Add to crontab:

```bash
# /etc/cron.daily/wise2-backup.sh
#!/bin/bash
cd /home/pi/wise2-core
./scripts/backup-manager.sh pi.local create
./scripts/backup-manager.sh pi.local cleanup
```

Or use systemd timer:

```bash
# Create /etc/systemd/system/wise2-backup.timer
[Unit]
Description=WISE² Daily Backup

[Timer]
OnCalendar=daily
OnBootSec=10min
Persistent=true

[Install]
WantedBy=timers.target

# Create /etc/systemd/system/wise2-backup.service
[Unit]
Description=WISE² Backup Service

[Service]
ExecStart=/opt/wise2-core/scripts/backup-manager.sh pi.local create
User=pi

# Enable
sudo systemctl enable wise2-backup.timer
sudo systemctl start wise2-backup.timer
```

### Backup Verification

Test backups monthly:

```bash
# 1. Create test environment (spare Pi or container)
# 2. List available backups
./scripts/backup-manager.sh pi.local list

# 3. Restore one backup
./scripts/backup-manager.sh pi.test restore backup-20260720-000000

# 4. Verify data integrity
# ... check database ...
# ... check file uploads ...

# 5. Document results
echo "Backup test: PASSED" >> logs/backup-verification.log
```

---

## Automation & Monitoring

### Health Monitoring

Continuous monitoring catches issues before they're critical:

```bash
# Set up continuous health check
watch -n 5 'curl -sf http://pi.local:3000/health && echo "OK" || echo "FAIL"'

# Or in background
(while true; do
  curl -sf http://pi.local:3000/health || echo "ALERT: API DOWN" | mail -s "WISE² API Alert" admin@example.com
  sleep 300  # Every 5 minutes
done) &
```

### Alert Escalation

```
API down for 5 min?  → Notify on-call
API down for 15 min? → Wake up engineering lead
API down for 30 min? → CEO notification + status page
```

### Automated Recovery

For known failure patterns:

```bash
#!/bin/bash
# auto-restart.sh - Run every 5 minutes

if ! curl -sf http://localhost:3000/health; then
  # API is down
  docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml restart api
  
  # Wait for recovery
  sleep 30
  
  if ! curl -sf http://localhost:3000/health; then
    # Still down, escalate
    ./scripts/rollback-pi.sh pi.local prod <<< "yes"
  fi
fi
```

---

## Deployment Workflow with Built-in Recovery

Recommended deployment workflow:

```bash
#!/bin/bash
# complete-deployment.sh

set -e

PI_HOST="${1:-pi.local}"
ENVIRONMENT="${2:-prod}"

echo "=== Pre-Deployment ==="
./scripts/health-check.sh                    # Verify current health
./scripts/backup-manager.sh "$PI_HOST" create  # Create backup

echo "=== Deployment ==="
./scripts/deploy-to-pi.sh "$PI_HOST" "$ENVIRONMENT"

echo "=== Post-Deployment Validation ==="
sleep 30  # Let services stabilize

if ! ./scripts/health-check.sh; then
  echo "Health check failed! Rolling back..."
  ./scripts/rollback-pi.sh "$PI_HOST" "$ENVIRONMENT" <<< "yes"
  exit 1
fi

echo "=== Cleanup ==="
./scripts/backup-manager.sh "$PI_HOST" cleanup  # Remove old backups

echo "✓ Deployment successful!"
```

---

## Communication Templates

### During Incident

**Slack/Teams message**:
```
[INCIDENT] WISE² API is down

Status: Investigating
ETA: 5-10 minutes
Recent change: [deployment 10 min ago]

Will update in 5 min.
```

### After Rollback

**Status update**:
```
[UPDATE] WISE² service restored

We identified a critical issue in the recent deployment and 
rolled back to the previous stable version. Services are now
operational at full capacity.

Investigation: [link to postmortem]
```

### Post-Mortem

**Email template**:
```
Subject: Incident Postmortem - [Date] [Duration]

## Summary
[1 paragraph overview]

## Timeline
- HH:MM - Detection
- HH:MM - Investigation start
- HH:MM - Rollback started
- HH:MM - Services restored

## Root Cause
[What actually went wrong]

## Impact
- Downtime: X minutes
- Users affected: ~Y
- Revenue impact: $Z

## Action Items
- [ ] Fix the bug
- [ ] Add monitoring
- [ ] Add automated test
- [ ] Update docs

## Owner: [Name]
```

---

## Quick Reference Card

### Essential Commands

```bash
# List backups
./scripts/backup-manager.sh pi.local list

# Create backup NOW
./scripts/backup-manager.sh pi.local create

# Rollback (interactive)
./scripts/rollback-pi.sh pi.local prod

# Check health
./scripts/health-check.sh

# View recent logs
ssh pi@pi.local "docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml logs -f"

# SSH to Pi
ssh pi@pi.local

# View previous deployments
git log --oneline -n 20
```

### Critical Paths

**Total system down**:
1. `./scripts/rollback-pi.sh pi.local prod` (10-15 min)
2. Verify `./scripts/health-check.sh` (2 min)

**Database issues**:
1. `./scripts/backup-manager.sh pi.local list` (1 min)
2. `./scripts/backup-manager.sh pi.local restore backup-XXX` (5-10 min)

**Deploy with rollback ready**:
1. `./scripts/backup-manager.sh pi.local create` (2-5 min)
2. `./scripts/deploy-to-pi.sh pi.local prod` (5-10 min)

---

## Training & Documentation

### For On-Call Engineers

1. Read ROLLBACK_GUIDE.md completely
2. Practice rollback in staging (dry-run)
3. Know where to find logs and reports
4. Know escalation procedures

### For DevOps Team

1. Understand backup rotation policy
2. Test backup restoration quarterly
3. Monitor backup storage usage
4. Review rollback logs monthly

### For Leadership

1. Understand RTO/RPO for each component
2. Know communication escalation path
3. Understand incident impact assessment
4. Review postmortems

---

## Support & Escalation

### Getting Help

1. **Script errors** → Check logs in `logs/rollbacks/rollback-*.log`
2. **Connectivity issues** → Verify Pi SSH access: `ssh pi@pi.local`
3. **Backup issues** → Check `logs/backups/backup.log`
4. **Deployment issues** → Refer to `DEPLOYMENT_GUIDE.md`

### Escalation Contact

- **Tier 1**: On-call engineer
- **Tier 2**: DevOps lead
- **Tier 3**: Platform architect
- **Tier 4**: CEO (for >1 hour outage)

---

## Appendix: Common Issues & Fixes

| Issue | Fix | Time |
|-------|-----|------|
| API won't start | Check `docker logs wise2-api` | 5 min |
| Database locked | Restart PostgreSQL | 5 min |
| Out of memory | Restart services | 3 min |
| Port conflict | Change docker-compose ports | 10 min |
| Network timeout | Check Pi connectivity | 5 min |

---

**End of Disaster Recovery Operations Manual**

Last updated: 2026-07-23  
Version: 1.0  
Maintained by: DevOps Team
