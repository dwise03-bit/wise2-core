# WISE² Pi Update System - Testing Guide

**Verify the update system works before relying on it in production**

This guide walks through testing procedures to ensure the update system is properly configured and working.

---

## Pre-Testing Checklist

Before you start testing, verify:

```bash
# 1. Script is executable
ls -l /scripts/update-pi.sh
# Should show: -rwxr-xr-x (executable)

# 2. Pi is reachable
ping pi.local
ssh pi@pi.local "echo OK"

# 3. Docker is running on Pi
ssh pi@pi.local "docker ps"

# 4. Backup directory exists
ssh pi@pi.local "ls -ld /opt/wise2-edge-backups"

# 5. Update script exists on Pi
ssh pi@pi.local "ls -l /opt/wise2-edge-scripts/update-pi.sh"
```

If any fail, fix before testing.

---

## Test 1: Dry Run (No Changes)

**Goal**: Verify the script can execute without making any changes

**Time**: 2-3 minutes

### Steps

```bash
# Run dry-run
./scripts/update-pi.sh pi.local full-stack --dry-run

# Expected output:
# ✓ Pre-update checks pass
# [DRY RUN] Would pull and restart API container
# [DRY RUN] Would run database migrations
# [DRY RUN] Would pull and restart Website container
# [DRY RUN] Would pull and restart Studio container
# ✓ All services passed health checks (simulated)
```

### Verification

```bash
# Verify nothing changed
ssh pi@pi.local "cd /opt/wise2-edge && docker-compose ps"
# Same services running before and after

ssh pi@pi.local "docker-compose images"
# Same image versions before and after
```

### Success Criteria

- [ ] Script completes without errors
- [ ] Output shows [DRY RUN] for all updates
- [ ] No actual changes made to Pi
- [ ] Log file created in `logs/updates/`

---

## Test 2: API-Only Update

**Goal**: Test updating a single service with real Docker operations

**Time**: 3-5 minutes

### Prerequisites

```bash
# Note current API version
ssh pi@pi.local "cd /opt/wise2-edge && docker-compose images | grep api"
# Record the tag (e.g., latest, v1.2.0)
```

### Steps

```bash
# Update API only
./scripts/update-pi.sh pi.local api-only

# Monitor progress
tail -f logs/updates/update-*.log

# Expected phases:
# 1. Pre-update checks (2-3 min)
# 2. Backup creation (2-3 min)
# 3. API update (1 min)
# 4. Health checks (2-3 min)
```

### Verification

```bash
# Check API is running
curl http://pi.local:3000/health

# Check API container
ssh pi@pi.local "cd /opt/wise2-edge && docker-compose logs api | tail -10"

# Verify service still works
curl http://pi.local:3000/api/health  # Or your API endpoint
```

### Success Criteria

- [ ] Script completes with "Update Completed Successfully"
- [ ] Health check passes
- [ ] API endpoint responds
- [ ] Log shows no errors
- [ ] Email notification sent (if configured)

---

## Test 3: Full-Stack Update

**Goal**: Test the complete update workflow for all services

**Time**: 8-15 minutes

### Prerequisites

Ensure test window is acceptable:
- Not during business hours if production
- No critical operations running
- Have monitoring dashboard open

### Steps

```bash
# Record current state
ssh pi@pi.local "cd /opt/wise2-edge && docker-compose images > /tmp/before.txt"

# Run full-stack update
./scripts/update-pi.sh pi.local full-stack

# Monitor in real-time
tail -f logs/updates/update-*.log

# Expected sequence:
# 1. Pre-checks (5 min)
# 2. Backup (3-5 min)
# 3. API update (2 min)
# 4. Website update (2 min)
# 5. Studio update (2 min)
# 6. Health checks (5 min)
```

### Verification

```bash
# Check all services
curl http://pi.local:3000/health  # API
curl http://pi.local:3001         # Website
curl http://pi.local:3005         # Studio

# Check container status
ssh pi@pi.local "cd /opt/wise2-edge && docker-compose ps"
# All should be "Up"

# Compare versions
ssh pi@pi.local "cd /opt/wise2-edge && docker-compose images > /tmp/after.txt"
diff /tmp/before.txt /tmp/after.txt
# Should show updated versions

# Check no errors
ssh pi@pi.local "docker-compose logs | grep -i error | wc -l"
# Should be 0 or very small
```

### Success Criteria

- [ ] All services updated successfully
- [ ] All health checks pass
- [ ] All endpoints respond
- [ ] No error spike detected
- [ ] Backup created (verify with `ls -lh /opt/wise2-edge-backups/`)
- [ ] Log shows "Update Completed Successfully"
- [ ] Email notification sent

---

## Test 4: Rollback Mechanism

**Goal**: Verify automatic rollback works if health checks fail

**Time**: 10-15 minutes

### Important

This test is optional for production systems. Only run in staging or dev.

### Setup

Create a scenario where health check fails:

**Option A**: Simulate endpoint failure

```bash
# SSH to Pi
ssh pi@pi.local << 'EOF'
  cd /opt/wise2-edge
  
  # Temporarily stop API
  docker-compose stop api
  
  # Note the backup ID we'll need
  ls -lt /opt/wise2-edge-backups | head -1 | awk '{print $NF}' > /tmp/backup_id.txt
EOF
```

**Option B**: Use existing broken version

If you have a known broken image in your registry, use it.

### Steps

```bash
# Run update that will fail health checks
./scripts/update-pi.sh pi.local api-only

# Monitor the logs
tail -f logs/updates/update-*.log

# Expected sequence:
# 1. Pre-checks pass
# 2. Backup created
# 3. Update attempted
# 4. Health check FAILS (service not responding)
# 5. ROLLBACK initiated
# 6. Services restored from backup
# 7. Health check PASSES after rollback
```

### Verification

```bash
# Verify services are back up
ssh pi@pi.local "cd /opt/wise2-edge && docker-compose ps"
# All should be Up

# Verify API responds
curl http://pi.local:3000/health

# Check rollback was logged
grep -i "rollback" logs/updates/update-*.log

# Check backup was used
grep -i "restoring from backup" logs/updates/update-*.log
```

### Success Criteria

- [ ] Health check fails as expected
- [ ] Automatic rollback is triggered
- [ ] Services are restored from backup
- [ ] All endpoints respond after rollback
- [ ] Log shows "ROLLING BACK UPDATE"
- [ ] Email notification shows ROLLBACK status

---

## Test 5: Backup Verification

**Goal**: Ensure backups can be restored manually

**Time**: 5-10 minutes

### Steps

```bash
# List existing backups
ssh pi@pi.local "ls -lh /opt/wise2-edge-backups/"

# Find the most recent backup
BACKUP_ID=$(ssh pi@pi.local "ls -t /opt/wise2-edge-backups | head -1 | sed 's/backup-//'")
echo "Latest backup: $BACKUP_ID"

# Check backup contents
ssh pi@pi.local "ls -lh /opt/wise2-edge-backups/backup-$BACKUP_ID/"

# Expected files:
# - docker-compose.prod.yml
# - .env.backup
# - versions.txt
# - images.txt
# - database.sql.gz
# - metadata.txt
```

### Manual Restore Test

Only do this in staging/dev:

```bash
BACKUP_ID="20260723-143215"  # Use actual backup ID

ssh pi@pi.local << EOF
  cd /opt/wise2-edge
  
  # Stop services
  sudo docker-compose down
  
  # Restore config
  sudo cp /opt/wise2-edge-backups/backup-$BACKUP_ID/docker-compose.prod.yml ./docker-compose.prod.yml
  
  # Restore env (if exists)
  if [ -f /opt/wise2-edge-backups/backup-$BACKUP_ID/.env.backup ]; then
    sudo cp /opt/wise2-edge-backups/backup-$BACKUP_ID/.env.backup ./.env
  fi
  
  # Pull images and restart
  docker-compose pull
  docker-compose up -d
  
  # Verify
  docker-compose ps
EOF
```

### Verification

```bash
# Check services are running
ssh pi@pi.local "cd /opt/wise2-edge && docker-compose ps"

# Check connectivity
curl http://pi.local:3000/health
```

### Success Criteria

- [ ] Backup directory exists
- [ ] All expected files present
- [ ] Restore process completes
- [ ] Services start after restore
- [ ] Endpoints respond after restore

---

## Test 6: Scheduler Setup

**Goal**: Verify automated update scheduler works

**Time**: 5 minutes setup + verification

### Setup

```bash
# Run scheduler setup
./scripts/setup-update-scheduler.sh pi.local

# Choose: systemd timer (recommended) or cron
# Set time to run in 2 minutes for testing (e.g., current time + 2 min)
```

### Verification - Cron

```bash
# Check cron job exists
ssh pi@pi.local "crontab -l | grep update-pi"

# Verify it's set correctly
ssh pi@pi.local "crontab -l"

# Monitor for execution (wait until scheduled time)
ssh pi@pi.local "tail -f /var/log/wise2-edge-appliance/auto-update.log"
```

### Verification - Systemd Timer

```bash
# Check timer status
ssh pi@pi.local "sudo systemctl status wise2-update.timer"

# Check next run time
ssh pi@pi.local "sudo systemctl list-timers wise2-update.timer"

# Monitor for execution (wait until scheduled time)
ssh pi@pi.local "sudo journalctl -u wise2-update -f"
```

### Success Criteria

- [ ] Scheduler installed successfully
- [ ] Next scheduled time shows correctly
- [ ] Update runs at scheduled time
- [ ] Log shows update completed
- [ ] No errors in scheduler logs

---

## Test 7: Notifications

**Goal**: Verify email notifications work

**Time**: 1-2 minutes

### Prerequisites

Email must be configured:

```bash
# Test mail on Pi
ssh pi@pi.local "echo 'Test' | mail -s 'Test' dwise03@gmail.com"

# Wait 1-2 minutes, check email
```

### Run Notification Test

```bash
# Run update with notifications
./scripts/update-pi.sh pi.local api-only

# Monitor script output for:
# "Notification email sent to dwise03@gmail.com"
```

### Verification

```bash
# Check email inbox for message with:
# - Subject: [SUCCESS] Update: pi.local - api-only
# - Contains: Update log
# - Contains: Backup ID
# - Contains: Timestamps

# On Pi, check mail logs
ssh pi@pi.local "sudo tail -20 /var/log/mail.log"
```

### Success Criteria

- [ ] Email received in inbox
- [ ] Subject line correct
- [ ] Email body contains full log
- [ ] Timestamps included
- [ ] No mail errors in logs

---

## Test 8: Force Update

**Goal**: Verify --force flag overrides health checks

**Time**: 5-10 minutes

### Setup

Create a scenario where health check is slightly problematic (e.g., endpoint takes time to respond).

### Steps

```bash
# Run update with force flag
./scripts/update-pi.sh pi.local api-only --force

# Expected behavior:
# - Pre-checks run normally
# - Update proceeds even if health check might fail
# - No automatic rollback even if problems detected
```

### Verification

```bash
# Check log for --force acknowledgment
grep -i "force" logs/updates/update-*.log

# Verify services are running
ssh pi@pi.local "cd /opt/wise2-edge && docker-compose ps"
```

### Success Criteria

- [ ] Update proceeds with --force
- [ ] Log shows forced update
- [ ] No rollback occurs
- [ ] Services can be manually verified

---

## Test 9: No-Backup Mode

**Goal**: Verify update works without backup (for testing only)

**Time**: 2-3 minutes

### Warning

Only use --no-backup in development/staging. Not recommended for production.

### Steps

```bash
# Run update without backup
./scripts/update-pi.sh pi.local api-only --no-backup

# Expected behavior:
# - Skip backup creation phase
# - Update proceeds normally
# - Rollback not available if needed
```

### Verification

```bash
# Check no new backup was created
BACKUP_COUNT_BEFORE=$(ssh pi@pi.local "ls -1 /opt/wise2-edge-backups | wc -l")
echo "Backups before: $BACKUP_COUNT_BEFORE"

./scripts/update-pi.sh pi.local api-only --no-backup

BACKUP_COUNT_AFTER=$(ssh pi@pi.local "ls -1 /opt/wise2-edge-backups | wc -l")
echo "Backups after: $BACKUP_COUNT_AFTER"

# Should be equal (no new backup)
```

### Success Criteria

- [ ] Log shows "Backup creation skipped"
- [ ] Update proceeds normally
- [ ] No new backup directory created
- [ ] Update completes successfully

---

## Test 10: Error Handling

**Goal**: Verify script handles common errors gracefully

**Time**: 10-15 minutes

### Test 10a: Network Disconnection

```bash
# Start update
./scripts/update-pi.sh pi.local api-only &

# After a few seconds, disconnect network (for test only!)
# Script should timeout gracefully and report error

# Expected: "Cannot reach pi.local"
```

### Test 10b: Disk Full

```bash
# Fill up disk on Pi (testing only!)
ssh pi@pi.local "dd if=/dev/zero of=/tmp/fillup.bin bs=1M count=1000"

# Try update
./scripts/update-pi.sh pi.local api-only

# Expected: "Disk usage too high: 95%"
# Rollback should handle this gracefully
```

### Test 10c: Docker Daemon Stopped

```bash
# Stop Docker on Pi
ssh pi@pi.local "sudo systemctl stop docker"

# Try update
./scripts/update-pi.sh pi.local api-only

# Expected: "Docker is not running"

# Restore
ssh pi@pi.local "sudo systemctl start docker"
```

### Success Criteria

- [ ] Script detects each error condition
- [ ] Exits gracefully without hanging
- [ ] Provides helpful error message
- [ ] Suggests recovery steps

---

## Post-Testing Summary

After all tests complete, create a summary:

```markdown
# WISE² Update System Test Summary

Date: 2026-07-23
Tester: dwise

## Tests Completed

- [x] Test 1: Dry Run
- [x] Test 2: API-Only Update
- [x] Test 3: Full-Stack Update
- [x] Test 4: Rollback Mechanism
- [x] Test 5: Backup Verification
- [x] Test 6: Scheduler Setup
- [x] Test 7: Notifications
- [x] Test 8: Force Update
- [x] Test 9: No-Backup Mode
- [x] Test 10: Error Handling

## Issues Found

None

## Status

✅ READY FOR PRODUCTION

System is fully tested and operational. Safe to schedule daily updates.
```

---

## Continuous Verification

After going into production, periodically verify:

### Monthly

```bash
# Test dry-run to ensure scripts still work
./scripts/update-pi.sh pi.local full-stack --dry-run

# Verify latest backup exists
ssh pi@pi.local "ls -lht /opt/wise2-edge-backups | head -3"
```

### After Each Real Update

```bash
# Verify all services healthy
curl http://pi.local:3000/health
curl http://pi.local:3001
curl http://pi.local:3005

# Check for errors in logs
ssh pi@pi.local "docker-compose logs | grep -i error"
```

### Quarterly

```bash
# Test rollback procedure (in staging only!)
# Test backup restore (in staging only!)
# Review update logs for patterns
grep "FAILED\|ROLLBACK" logs/updates/update-*.log
```

---

## When Tests Fail

### Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot SSH to pi" | Check SSH key setup, try `ssh -v` for debug |
| "Health check timeout" | Check if services are starting, review Docker logs |
| "Backup fails" | Verify disk space, check /opt/wise2-edge-backups permissions |
| "Email not sending" | Verify mail server on Pi, test with `echo "test" \| mail user@example.com` |
| "Rollback fails" | Verify backup exists, check Docker health |

### Debug Checklist

```bash
# 1. Check Pi connectivity
ping pi.local
ssh pi@pi.local "echo OK"

# 2. Check Docker
ssh pi@pi.local "docker ps"
ssh pi@pi.local "docker-compose ps"

# 3. Check services
curl http://pi.local:3000/health || echo "API failed"
curl http://pi.local:3001 || echo "Website failed"
curl http://pi.local:3005 || echo "Studio failed"

# 4. Check logs
tail -100 logs/updates/update-*.log
ssh pi@pi.local "docker-compose logs api | tail -50"

# 5. Check backups
ssh pi@pi.local "ls -lh /opt/wise2-edge-backups/"
```

---

## Getting Help

If tests fail:

1. Check the specific test section above
2. Review `UPDATE_PI_GUIDE.md` § Troubleshooting
3. Collect debug info (see Debug Checklist)
4. Contact support with:
   - Error messages (full text)
   - Update log (last 100 lines)
   - System info (Pi model, OS version, Docker version)

---

## Test Checklist Template

Copy this for tracking your test runs:

```markdown
# Test Run - [DATE]

## Pre-Test
- [ ] Pi is reachable
- [ ] Docker running
- [ ] Backup dir exists
- [ ] Update script present

## Tests
- [ ] Test 1: Dry Run
- [ ] Test 2: API-Only Update
- [ ] Test 3: Full-Stack Update
- [ ] Test 4: Rollback Mechanism
- [ ] Test 5: Backup Verification
- [ ] Test 6: Scheduler Setup
- [ ] Test 7: Notifications
- [ ] Test 8: Force Update
- [ ] Test 9: No-Backup Mode
- [ ] Test 10: Error Handling

## Results
- [ ] All tests passed
- [ ] Issues found: ___________
- [ ] System status: READY / NEEDS FIXES

## Sign-Off
Tested by: ___________
Date: ___________
```

---

**Ready to test?** Start with Test 1: Dry Run, then proceed sequentially.
