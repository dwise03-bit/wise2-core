# WISE² Pi Update Script Guide

**Script**: `update-pi.sh`  
**Purpose**: Automated updates for Raspberry Pi deployments with rollback capability  
**Status**: Production-ready  
**Last Updated**: 2026-07-23

---

## Overview

The `update-pi.sh` script automates WISE² Edge deployments on Raspberry Pi with comprehensive safeguards:

- **Pre-update validation** — Connectivity, disk space, network stability, Docker health
- **Backup snapshots** — Full backup before any update for recovery
- **Gradual rollout** — Update one service at a time with health checks between
- **Health verification** — Endpoint checks, error spike detection, stability monitoring
- **Automatic rollback** — Revert to backup if health checks fail
- **Dry-run mode** — Test updates without applying changes
- **Notifications** — Email alerts on completion/failure
- **Scheduling** — Manual, daily, or weekly update options
- **Detailed logging** — Full audit trail of every update

---

## Installation

### 1. Copy Script to Pi

From your development machine:

```bash
scp scripts/update-pi.sh pi@pi.local:/opt/wise2-edge-scripts/
```

Or if running on the Pi directly:

```bash
# No copying needed; script is part of the repository
chmod +x scripts/update-pi.sh
```

### 2. Install Dependencies (on Pi)

The script requires these commands on the Pi:

```bash
# SSH into Pi
ssh pi@pi.local

# Install required tools
sudo apt-get update
sudo apt-get install -y curl mail-utils

# Verify docker-compose is available
docker-compose --version
```

### 3. Set Up Email Notifications (Optional)

To receive update notifications:

```bash
# Install mail server (lightweight)
sudo apt-get install -y ssmtp

# Configure email
sudo nano /etc/ssmtp/ssmtp.conf
```

Example `ssmtp.conf`:

```
root=your-email@gmail.com
mailhub=smtp.gmail.com:587
AuthUser=your-email@gmail.com
AuthPass=your-app-password
UseSTARTTLS=YES
```

Then set the admin email:

```bash
export ADMIN_EMAIL="dwise03@gmail.com"
```

---

## Usage

### Basic Syntax

```bash
./update-pi.sh <pi_hostname> <update_type> [OPTIONS]
```

### Update Types

| Type | Description | When to Use |
|------|-------------|------------|
| `full-stack` | Update API + Website + Studio | Regular updates (default) |
| `api-only` | Update API service only | API-specific fixes/features |
| `website-only` | Update Website service only | Landing page changes |
| `studio-only` | Update Studio service only | Dashboard/creative tools changes |
| `system` | Update OS packages only | Security patches, kernel updates |
| `all` | Update everything including OS | Major release deployments |

### Examples

#### 1. Full Stack Update (Most Common)

```bash
# Update all services to latest
./update-pi.sh pi.local full-stack

# Update to specific version
./update-pi.sh pi.local full-stack --version v1.2.0

# Run on remote Pi via SSH
./update-pi.sh 192.168.1.100 full-stack
```

#### 2. API-Only Update

```bash
# Quick API fix without restarting website
./update-pi.sh pi.local api-only
```

#### 3. Dry Run (Test Before Applying)

```bash
# See what would be updated without doing it
./update-pi.sh pi.local full-stack --dry-run

# Output shows:
# [DRY RUN] Would pull and restart API container
# [DRY RUN] Would run database migrations
# [DRY RUN] Would pull and restart Website container
```

#### 4. Force Update (Skip Failed Checks)

```bash
# Force update even if health checks initially fail
# WARNING: Use only if you know what you're doing
./update-pi.sh pi.local full-stack --force
```

#### 5. Skip Backup (Not Recommended)

```bash
# Perform update without creating backup
# WARNING: Only use for non-critical test deployments
./update-pi.sh pi.local api-only --no-backup
```

#### 6. No Notifications

```bash
# Update without sending email notifications
./update-pi.sh pi.local system --no-notify
```

### Command-Line Options

```
--version VERSION         Target version (default: latest)
--dry-run                Show what would be updated without doing it
--force                  Force update even if health checks fail
--no-backup              Skip backup creation (not recommended)
--no-notify              Skip email notifications
--schedule TYPE          Schedule mode: manual, daily, weekly
```

---

## Update Process Flow

### 1. Pre-Update Checks (Automatic)

```
✓ Connectivity check (ping, SSH)
✓ Disk space verification (error if >90% used)
✓ Network stability check (packet loss)
✓ Docker daemon running
✓ Current service status snapshot
```

**If any check fails**: Stops and requires `--force` to continue

### 2. Backup Creation (Automatic)

Creates a timestamped snapshot:
- Docker Compose configuration
- Environment variables (.env)
- Running container image list
- Database export (PostgreSQL)
- Metadata about the backup

**Location**: `/opt/wise2-edge-backups/backup-YYYYMMDD-HHMMSS/`

**Can be disabled**: `--no-backup` (not recommended)

### 3. Update Execution (Gradual Rollout)

For `full-stack` updates:

```
1. Pull API image
2. Stop API container gracefully
3. Start new API container
4. Wait 30 seconds
5. Run database migrations
6. Wait 5 seconds
7. Pull Website image
8. Stop Website container
9. Start new Website container
10. Wait 5 seconds
11. Pull Studio image
12. Stop Studio container
13. Start new Studio container
```

**Why gradual?**
- Minimizes downtime
- Easy to pinpoint which service failed
- Allows rollback of specific service
- Reduces load during updates

### 4. Health Verification (Automatic)

For each updated service:

```
Health Check:
├─ Endpoint responds (timeout: 5 min)
├─ No error spike (>10 errors in 5 min)
└─ Stability check (5 min window, 80%+ success)

If all pass: Update successful ✓
If any fail: Automatic rollback (unless --force)
```

### 5. Rollback (If Needed)

If health checks fail and backup exists:

```
1. Stop all services
2. Restore docker-compose file
3. Restore .env file
4. Pull previous images
5. Restart services
6. Verify services are up
7. Send failure notification
```

---

## Output & Logging

### Console Output

```
════════════════════════════════════════════════════════════════
WISE² Pi Update Script
════════════════════════════════════════════════════════════════

ℹ Update Type: full-stack
ℹ Target Version: latest
ℹ Hostname: pi.local
ℹ Dry Run: false

Running Pre-Update Checks
══════════════════════════════════════════════════════════════════

── Checking Pi connectivity
✓ Pi is reachable at pi.local

── Checking disk space on Pi
✓ Disk space available: 45% used (2.1G free)

...

Update Completed Successfully
══════════════════════════════════════════════════════════════════

Host:               pi.local
Update Type:        full-stack
Target Version:     latest
Start Time:         2026-07-23 14:32:15
End Time:           2026-07-23 14:38:42
Dry Run:            false
Backup ID:          20260723-143215
Force Update:       false

Update Log:         logs/updates/update-20260723-143215.log
```

### Log Files

All updates are logged to: `logs/updates/update-YYYYMMDD-HHMMSS.log`

Example log entries:

```
[2026-07-23 14:32:15] ════════════════════════════════════════════════════
[2026-07-23 14:32:15] WISE² Pi Update Script
[2026-07-23 14:32:15] ════════════════════════════════════════════════════
[2026-07-23 14:32:16] ── Checking Pi connectivity
[2026-07-23 14:32:17] ✓ Pi is reachable at pi.local
[2026-07-23 14:32:18] ── Creating backup directory: /opt/wise2-edge-backups/backup-20260723-143215
[2026-07-23 14:32:19] ✓ Backup snapshot created: 20260723-143215
[2026-07-23 14:32:20] ── Updating API service
[2026-07-23 14:32:45] ✓ API service updated
...
```

View the log:

```bash
# View most recent update log
tail -100 logs/updates/update-*.log

# View specific log
cat logs/updates/update-20260723-143215.log

# Search logs for errors
grep "✗" logs/updates/update-*.log
```

---

## Scheduling Updates

### Option 1: Manual (Recommended for Testing)

```bash
# One-time update
./update-pi.sh pi.local full-stack

# Check status by viewing log
tail -50 logs/updates/update-*.log
```

### Option 2: Daily Scheduled Updates

Create a cron job on the Pi:

```bash
# SSH to Pi
ssh pi@pi.local

# Edit crontab
crontab -e

# Add this line (runs daily at 3 AM, low-traffic time)
0 3 * * * cd /opt/wise2-edge && /opt/wise2-edge-scripts/update-pi.sh pi.local full-stack --schedule daily
```

### Option 3: Weekly Scheduled Updates

```bash
# In crontab (runs every Sunday at 3 AM)
0 3 * * 0 cd /opt/wise2-edge && /opt/wise2-edge-scripts/update-pi.sh pi.local full-stack --schedule weekly
```

### Option 4: Systemd Timer (Linux)

Create `/etc/systemd/system/wise2-update.service`:

```ini
[Unit]
Description=WISE² Pi Update Service
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
User=pi
ExecStart=/opt/wise2-edge-scripts/update-pi.sh pi.local full-stack
StandardOutput=journal
StandardError=journal
```

Create `/etc/systemd/system/wise2-update.timer`:

```ini
[Unit]
Description=WISE² Pi Update Timer
Requires=wise2-update.service

[Timer]
OnCalendar=daily
OnCalendar=03:00
Persistent=true

[Install]
WantedBy=timers.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable wise2-update.timer
sudo systemctl start wise2-update.timer

# Check status
sudo systemctl status wise2-update.timer
```

### Option 5: Admin Dashboard Integration

If you have a web dashboard, add a button that calls:

```bash
curl -X POST http://pi.local:3000/api/updates \
  -H "Content-Type: application/json" \
  -d '{
    "update_type": "full-stack",
    "dry_run": false,
    "notify": true
  }'
```

The API endpoint would execute:

```bash
/opt/wise2-edge-scripts/update-pi.sh pi.local full-stack
```

---

## Troubleshooting

### Problem: "Cannot ping pi.local"

**Cause**: Network connectivity issue

**Solution**:

```bash
# Verify Pi is on network
arp-scan -l | grep -i raspberry

# Try IP address directly
./update-pi.sh 192.168.1.100 full-stack

# Check if SSH works
ssh pi@pi.local "echo OK"
```

### Problem: "Disk usage too high"

**Cause**: Not enough free space for update

**Solution**:

```bash
# SSH to Pi and clean up
ssh pi@pi.local

# Remove old docker images
sudo docker image prune -a

# Remove old logs
sudo rm -rf /var/log/wise2-edge-appliance/*.log.1

# Check disk space
df -h
```

Then retry update.

### Problem: "Health checks failed"

**Cause**: Service not responding after update

**Solution**:

1. Check logs:

```bash
ssh pi@pi.local
cd /opt/wise2-edge
docker-compose logs api | tail -50
docker-compose logs website | tail -50
```

2. If services failed to start, check recent rollback:

```bash
# View rollback log
tail -200 logs/updates/update-*.log | grep -i rollback
```

3. Manual rollback if automatic failed:

```bash
# SSH to Pi
ssh pi@pi.local
cd /opt/wise2-edge

# Find backup
ls -lh /opt/wise2-edge-backups/

# Restore manually
sudo cp /opt/wise2-edge-backups/backup-20260723-143215/docker-compose.prod.yml ./
docker-compose down
docker-compose up -d
```

### Problem: "Cannot connect to Docker daemon"

**Cause**: Docker not running on Pi

**Solution**:

```bash
# SSH to Pi
ssh pi@pi.local

# Start Docker
sudo systemctl start docker
sudo systemctl status docker

# Verify it's running
docker ps

# Retry update
cd /opt/wise2-edge && ./scripts/update-pi.sh pi.local full-stack
```

### Problem: "Backup creation failed"

**Cause**: Insufficient disk space or permission issue

**Solution**:

```bash
# Check disk space on Pi
ssh pi@pi.local "df -h"

# Check backup directory permissions
ssh pi@pi.local "ls -ld /opt/wise2-edge-backups"

# Create directory if missing
ssh pi@pi.local "sudo mkdir -p /opt/wise2-edge-backups && sudo chown pi:pi /opt/wise2-edge-backups"

# Retry with --force if necessary
./update-pi.sh pi.local full-stack --force
```

### Problem: "Email notification failed"

**Cause**: Mail server not configured

**Solution**:

```bash
# Skip notifications (temporary)
./update-pi.sh pi.local full-stack --no-notify

# Or set up mail server
ssh pi@pi.local
sudo apt-get install -y ssmtp
sudo nano /etc/ssmtp/ssmtp.conf
# Configure with your email provider
```

---

## Best Practices

### 1. Always Test First

```bash
# Test with dry-run before real update
./update-pi.sh pi.local full-stack --dry-run

# Review output
# If looks good, run real update
./update-pi.sh pi.local full-stack
```

### 2. Update During Low-Traffic Windows

**Best times**:
- Early morning (3-5 AM)
- Late night (11 PM - 1 AM)
- Sunday morning
- Before holidays

**Avoid**:
- Business hours
- During known peak usage
- Right before important events

### 3. Keep Backups

```bash
# Backups are automatic but verify they exist
ssh pi@pi.local "ls -lh /opt/wise2-edge-backups/"

# Optionally archive old backups
ssh pi@pi.local "tar -czf /opt/wise2-edge-backups/archive-2026-07.tar.gz /opt/wise2-edge-backups/backup-202607*"
```

### 4. Monitor After Update

```bash
# Check service health
./health-check.sh pi.local

# Monitor logs
ssh pi@pi.local "tail -f /var/log/wise2-edge-appliance/app.log"

# Quick status
ssh pi@pi.local "cd /opt/wise2-edge && docker-compose ps"
```

### 5. Document Major Updates

```bash
# Keep a changelog
echo "2026-07-23 - Updated to v1.2.0 - API performance improvements" >> UPDATE_HISTORY.md

# Log what changed
ssh pi@pi.local "cat /opt/wise2-edge-backups/backup-20260723-143215/versions.txt"
```

### 6. Test Rollback Procedure

```bash
# Once a month, test the rollback:
# 1. Do a dry-run update
./update-pi.sh pi.local full-stack --dry-run

# 2. Do a real update
./update-pi.sh pi.local full-stack

# 3. Verify services work
./health-check.sh pi.local

# 4. (Don't actually rollback, just verify backup exists)
ssh pi@pi.local "ls -lh /opt/wise2-edge-backups/"
```

### 7. Regular Backup Maintenance

```bash
# Once a month, clean up old backups
ssh pi@pi.local << 'EOF'
cd /opt/wise2-edge-backups
# Keep only last 10 backups
ls -t1 | tail -n +11 | xargs rm -rf
EOF
```

---

## Email Notifications

### Understanding Email Alerts

The script sends three types of notifications:

| Event | Condition | Subject Line |
|-------|-----------|--------------|
| **SUCCESS** | Update completed, all health checks passed | `[SUCCESS] Update: pi.local - full-stack` |
| **FAILED** | Update failed before rollback | `[FAILED] Update: pi.local - api-only` |
| **ROLLBACK** | Health checks failed, automatic rollback triggered | `[ROLLBACK] Update: pi.local - full-stack` |

### Email Content

Each email includes:

```
WISE² Edge Update Report
========================

Host: pi.local
Update Type: full-stack
Target Version: latest
Status: SUCCESS
Start Time: 2026-07-23 14:32:15
End Time: 2026-07-23 14:38:42

Dry Run: false
Backup Created: Yes (ID: 20260723-143215)

Full Log:
[Complete update log with all status messages]
```

### Disable Notifications

```bash
# Skip email for this update
./update-pi.sh pi.local full-stack --no-notify

# Or globally disable
export NOTIFY_EMAIL=false
./update-pi.sh pi.local full-stack
```

---

## Performance Considerations

### Update Duration

| Type | Duration | Notes |
|------|----------|-------|
| API only | 2-4 minutes | Fastest option |
| Website only | 2-4 minutes | Minimal service impact |
| Full stack | 6-12 minutes | Longest, but least frequent |
| System | 10-20 minutes | Requires OS restart sometimes |

### Network Impact

- Download: ~200-500 MB per service update (ARM images are small)
- Upload: Minimal (only logs)
- Peak bandwidth: During Docker image pull

### Resource Impact on Pi

- CPU: Peaks during Docker operations (2-5 min)
- Memory: Stable after update (~60% of 1GB)
- Disk I/O: High during image pull (3-5 min)
- Network: Used during download phase

---

## Integration with Monitoring

### Send Alert to Slack (Example)

Modify notification in `update-pi.sh`:

```bash
# After line ~450, in send_notification_email():

# Send to Slack
if command -v curl &> /dev/null; then
    curl -X POST "$SLACK_WEBHOOK" \
      -H "Content-Type: application/json" \
      -d "{
        \"text\": \"WISE² Update [$status] on $PI_HOSTNAME\",
        \"blocks\": [{
          \"type\": \"section\",
          \"text\": {\"type\": \"mrkdwn\", \"text\": \"*WISE² Update Report*\n*Host:* $PI_HOSTNAME\n*Type:* $UPDATE_TYPE\n*Status:* $status\"}
        }]
      }"
fi
```

Then set webhook:

```bash
export SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
./update-pi.sh pi.local full-stack
```

---

## Advanced Configuration

### Custom Health Check Endpoints

Modify timeout and interval in `update-pi.sh`:

```bash
# In CONFIGURATION section (line ~60)
HEALTH_CHECK_TIMEOUT=300       # 5 minutes (increase for slow Pi)
HEALTH_CHECK_INTERVAL=5         # Check every 5 seconds
STABILITY_WINDOW=300            # 5 minutes of stability required
ERROR_SPIKE_THRESHOLD=10        # More than 10 errors = spike
```

### Custom Update Ordering

If you need a specific order for your services:

```bash
# Edit the update execution section (around line ~680)
# Change from:
update_api
update_website
update_studio

# To:
update_website          # Update website first
sleep 10
update_api             # Then API
sleep 10
update_studio          # Finally studio
```

### Dry Run + Email Preview

```bash
# Do dry-run and get email preview
./update-pi.sh pi.local full-stack --dry-run

# Would show all steps without executing
# Great for scheduling new updates
```

---

## Support & Debugging

### Collect Debug Info

When reporting issues, collect:

```bash
# Pi system info
ssh pi@pi.local << 'EOF'
echo "=== System Info ===" 
uname -a
echo "=== Disk Space ===" 
df -h
echo "=== Memory ===" 
free -h
echo "=== Docker ===" 
docker --version
docker-compose --version
docker ps
echo "=== Network ===" 
ifconfig
echo "=== Recent Logs ===" 
tail -100 /var/log/wise2-edge-appliance/app.log
EOF

# Upload update log
cat logs/updates/update-*.log
```

### Common Error Messages

| Error | Fix |
|-------|-----|
| `Cannot ping pi.local` | Verify Pi is powered on and on network |
| `Disk usage too high` | Remove old Docker images: `docker image prune -a` |
| `Health checks failed` | Check `docker-compose logs api` for errors |
| `SSH connection refused` | Verify SSH is enabled: `ssh-keygen -A` on Pi |
| `Docker daemon not running` | Start Docker: `sudo systemctl start docker` |

---

## Related Documentation

- **Deployment**: `DEPLOYMENT_GUIDE.md` — Initial Pi setup
- **Health Checks**: `PI_HEALTH_CHECK_SETUP.md` — Monitoring service health
- **Monitoring**: `MONITORING_SETUP_GUIDE.md` — Setting up comprehensive monitoring
- **Backups**: See backup section in this guide

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-07-23 | Initial release with full-stack/API/website/studio update types |

---

## Questions?

- Check logs: `logs/updates/update-*.log`
- Test with dry-run: `--dry-run` flag
- Contact: dwise03@gmail.com
