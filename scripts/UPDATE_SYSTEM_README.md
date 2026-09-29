# WISE² Pi Update System

**Complete automated update solution for Raspberry Pi deployments**

This document provides a high-level overview of the WISE² Pi update system. For detailed usage, see the linked guides.

---

## What's Included

### Core Scripts

| File | Purpose | Type |
|------|---------|------|
| `update-pi.sh` | Main update orchestrator | Executable (25 KB) |
| `setup-update-scheduler.sh` | Automated scheduler configuration | Executable (13 KB) |
| `systemd-wise2-update.service` | Systemd service definition | Config file |
| `systemd-wise2-update.timer` | Systemd timer definition | Config file |

### Documentation

| File | Purpose |
|------|---------|
| `UPDATE_PI_GUIDE.md` | **Complete reference** — full usage, troubleshooting, advanced topics |
| `QUICK_UPDATE_REFERENCE.md` | **Quick start** — copy-paste commands for common tasks |
| `UPDATE_SYSTEM_README.md` | **This file** — overview and architecture |

---

## Quick Start (2 Minutes)

### 1. Test Update (Dry Run)

```bash
cd /path/to/wise2-core
./scripts/update-pi.sh pi.local full-stack --dry-run
```

This shows what would be updated without making changes.

### 2. Run Real Update

```bash
./scripts/update-pi.sh pi.local full-stack
```

Monitors progress, checks health, and rolls back if needed.

### 3. Set Up Automatic Scheduling

```bash
./scripts/setup-update-scheduler.sh pi.local
```

Interactive setup for daily/weekly updates. Creates cron or systemd timer.

---

## Architecture

### Update Flow

```
User Request
    ↓
Pre-Update Checks (connectivity, disk space, network)
    ↓
Create Backup Snapshot (full state backup)
    ↓
Execute Update (gradual service rollout)
    ├─ Pull new Docker image
    ├─ Stop old container (gracefully)
    ├─ Start new container
    └─ [Repeat for each service]
    ↓
Post-Update Health Checks (endpoints, stability, errors)
    ↓
Success?
├─ YES → Log success, send notification
└─ NO → Automatic rollback from backup, alert admin
```

### Service Update Order

For `full-stack` updates:

```
API (port 3000)
    ↓ [wait 5s]
Website (port 3001)
    ↓ [wait 5s]
Studio (port 3005)
```

Each service is verified before moving to the next.

### Backup Strategy

Backup is created before any update:

```
/opt/wise2-edge-backups/
└── backup-20260723-143215/
    ├── docker-compose.prod.yml      (service config)
    ├── .env.backup                   (environment)
    ├── versions.txt                  (image versions)
    ├── images.txt                    (running state)
    ├── database.sql.gz               (database dump)
    └── metadata.txt                  (backup metadata)
```

If update fails, rollback:
1. Stops all services
2. Restores config files
3. Pulls previous images
4. Restarts services

---

## Usage Patterns

### Pattern 1: Manual Updates

For testing or one-off deployments:

```bash
# Test first
./scripts/update-pi.sh pi.local full-stack --dry-run

# Do it
./scripts/update-pi.sh pi.local full-stack

# Monitor logs
tail -f logs/updates/update-*.log
```

### Pattern 2: Scheduled Automation

For production deployments:

```bash
# Set up once
./scripts/setup-update-scheduler.sh pi.local

# Then updates happen automatically (default: daily at 3 AM)
# No manual intervention needed

# Monitor from your dashboard/alerts
tail -50 /var/log/wise2-edge-appliance/auto-update.log
```

### Pattern 3: Selective Updates

Update only what changed:

```bash
# API only (quick fix)
./scripts/update-pi.sh pi.local api-only

# Website only (landing page update)
./scripts/update-pi.sh pi.local website-only

# System packages only (security patches)
./scripts/update-pi.sh pi.local system
```

### Pattern 4: Deployment Pipeline

For CI/CD integration:

```bash
#!/bin/bash
# After building and pushing Docker images to registry:

# Update staging first
./scripts/update-pi.sh pi-staging.local full-stack || {
  echo "Staging update failed"
  exit 1
}

# If successful, update production
./scripts/update-pi.sh pi-prod.local full-stack
```

---

## Key Features

### Pre-Update Validation

- **Connectivity**: Ping and SSH verification
- **Disk Space**: Error if >90% used, warn at >80%
- **Network**: Packet loss check
- **Docker**: Daemon running verification
- **Current State**: Snapshot of running services

**Effect**: Prevents updates when conditions aren't ideal

### Backup & Recovery

- **Automatic**: Backup created before every update
- **Complete**: Includes config, database, image list
- **Atomic**: Entire system can be recovered to pre-update state
- **Indexed**: Each backup gets a timestamp ID

**Rollback triggers**:
- Health check failure
- Service not responding
- Error spike detected
- Stability check failed

### Gradual Rollout

- **One service at a time**: Update API, wait, update website, wait, update studio
- **Health check between**: Each service verified before next update
- **Minimal downtime**: API comes back before website is down
- **Easy debugging**: If update #2 fails, know it's the website

### Health Verification

For each updated service:

1. **Endpoint Response** (5 min timeout)
   - Service responds to health endpoint
   - Example: `http://localhost:3000/health`

2. **Error Spike Detection**
   - No >10 errors in 100 recent log lines
   - Prevents "technically started but broken" scenario

3. **Stability Check** (5 min window)
   - Service responds consistently
   - 80%+ success rate required
   - Detects intermittent failures

### Notification System

Three notification types:

| Event | When | Recipient |
|-------|------|-----------|
| **SUCCESS** | All services healthy, stable | Admin email |
| **FAILED** | Update failed before rollback | Admin email |
| **ROLLBACK** | Health checks failed, rolled back | Admin email |

Email includes:
- Full update log
- Timings and status
- Backup information
- Next steps

### Dry-Run Mode

Test updates without applying:

```bash
./scripts/update-pi.sh pi.local full-stack --dry-run
```

Shows:
- What would be downloaded
- Which services would be updated
- When health checks would run
- **No actual changes made**

Perfect for:
- Testing before real updates
- Scheduling verification
- Documentation
- Troubleshooting

---

## Scheduling Options

### Option 1: Crontab (Simple)

```bash
# Configure once
./setup-update-scheduler.sh pi.local --scheduler cron --time 03:00

# Runs daily at 3 AM
# Very reliable, lightweight
```

### Option 2: Systemd Timer (Modern)

```bash
# Configure once
./setup-update-scheduler.sh pi.local --scheduler systemd --time 03:00

# Runs daily at 3 AM
# Better logging, systemd integration
# Persists if system was down at scheduled time
```

### Option 3: Manual + Cron Reminder

```bash
# Run update manually when you want
./scripts/update-pi.sh pi.local full-stack

# Have monitoring alert you when updates are available
```

### Option 4: Admin Dashboard

Integrate with your admin interface:

```javascript
// Dashboard button click handler
async function triggerUpdate(piHostname) {
  const result = await fetch(`/api/pi/${piHostname}/update`, {
    method: 'POST',
    body: JSON.stringify({ type: 'full-stack' })
  });
  return result.json();
}
```

Backend would call:

```bash
/scripts/update-pi.sh ${piHostname} full-stack
```

---

## Update Types Reference

```
full-stack      Update API + Website + Studio (DEFAULT)
                Use for: Regular updates, new features
                Duration: 6-12 minutes

api-only        Update API service only
                Use for: Quick API fixes, backend changes
                Duration: 2-4 minutes

website-only    Update Website landing page
                Use for: Landing page changes, design updates
                Duration: 2-4 minutes

studio-only     Update Studio/Dashboard
                Use for: Dashboard changes
                Duration: 2-4 minutes

system          Update OS packages only
                Use for: Security patches, system updates
                Duration: 10-20 minutes

all             Update everything including system packages
                Use for: Major releases, full deployment
                Duration: 15-30 minutes
```

---

## File Locations

```
/opt/wise2-edge/                       # Main deployment
├── docker-compose.prod.yml             # Service definitions
├── .env                                # Environment variables
├── scripts/
│   ├── update-pi.sh                   # UPDATE ORCHESTRATOR
│   ├── setup-update-scheduler.sh      # SCHEDULER SETUP
│   ├── UPDATE_PI_GUIDE.md             # Full documentation
│   ├── QUICK_UPDATE_REFERENCE.md      # Quick reference
│   ├── UPDATE_SYSTEM_README.md        # This file
│   ├── systemd-wise2-update.service   # Service config
│   └── systemd-wise2-update.timer     # Timer config
│
/opt/wise2-edge-backups/               # Backup location
├── backup-20260723-143215/
├── backup-20260722-030000/
└── ...
│
/var/log/wise2-edge-appliance/        # Service logs
├── app.log
├── auto-update.log                    # Update logs
└── ...
│
logs/                                  # Local update logs (for reference)
└── updates/
    ├── update-20260723-143215.log
    └── ...
```

---

## Common Tasks

### Daily Updates at 3 AM

```bash
./setup-update-scheduler.sh pi.local --scheduler systemd --time 03:00
```

### Check What Changed

```bash
# Before update
docker-compose images

# After update
docker-compose images
```

### Stop Automatic Updates Temporarily

```bash
# Cron
ssh pi@pi.local 'crontab -e'  # Comment out the line

# Systemd
ssh pi@pi.local 'sudo systemctl stop wise2-update.timer'
```

### Manually Rollback (if auto-rollback failed)

```bash
BACKUP_ID="20260723-143215"

ssh pi@pi.local << EOF
  cd /opt/wise2-edge
  sudo cp /opt/wise2-edge-backups/backup-$BACKUP_ID/docker-compose.prod.yml ./
  docker-compose down
  docker-compose up -d
EOF
```

### View Update History

```bash
# Recent updates
tail -50 logs/updates/update-*.log

# All updates (search)
grep "Update Completed\|ROLLBACK" logs/updates/update-*.log

# Latest backup
ls -lt /opt/wise2-edge-backups | head -5
```

### Export Backup for Safety

```bash
BACKUP_ID="20260723-143215"
ssh pi@pi.local "tar -czf ~/backup-$BACKUP_ID.tar.gz /opt/wise2-edge-backups/backup-$BACKUP_ID/"
scp pi@pi.local:~/backup-$BACKUP_ID.tar.gz ~/backups/
```

---

## Troubleshooting Quick Links

See `UPDATE_PI_GUIDE.md` Troubleshooting section for:

- Cannot connect to Pi
- Health check failures
- Disk space issues
- Docker problems
- Email notification failures
- And more...

---

## Performance Notes

### Typical Update Times

- API only: 2-4 minutes
- Website only: 2-4 minutes
- Studio only: 2-4 minutes
- Full stack: 6-12 minutes
- System packages: 10-20 minutes

### Network Impact

- Bandwidth: 200-500 MB per service (ARM images are small)
- Duration: 2-3 minutes for image pull
- Peak: During `docker pull` operation

### System Impact

- CPU: High during image extraction (2-3 min)
- Memory: Stable after update
- Disk I/O: High during image operations

### Best Practice

Schedule updates during:
- **Early morning** (3-5 AM)
- **Late night** (11 PM - 1 AM)
- **Weekends** (especially Sunday)
- **Low-traffic periods**

Avoid:
- Business hours
- Known peak usage times
- Before important events

---

## Integration Examples

### Prometheus Alerting

```yaml
groups:
  - name: wise2_updates
    rules:
      - alert: UpdateFailed
        expr: increase(wise2_update_failures_total[1h]) > 0
        annotations:
          summary: "WISE² update failed on {{ $labels.hostname }}"
```

### Slack Notifications

Modify email notification to Slack webhook:

```bash
# In send_notification_email()
curl -X POST $SLACK_WEBHOOK -d "{text: 'Update complete on $PI_HOSTNAME'}"
```

### Datadog Monitoring

```bash
# Log update events
echo "Update completed on $PI_HOSTNAME" | \
  dd_agent_logger -p "WISE²" -s "pi.updates"
```

### Home Assistant Automation

```yaml
automation:
  - alias: Check WISE² Pi Update Status
    trigger:
      platform: time
      at: "04:00:00"  # After scheduled 3 AM update
    action:
      - service: shell_command.check_pi_update
        data:
          host: "pi.local"
```

---

## Security Considerations

### Backup Security

- Backups stored locally on Pi
- Consider encrypting for production
- Archive old backups regularly
- Test restore procedures

### Update Source

- Images pulled from Docker registry (configure in docker-compose)
- Ensure registry is trusted
- Verify image signatures if available

### SSH Access

- Uses SSH key-based auth (configure beforehand)
- No passwords in script
- Requires `ssh-keygen` setup on dev machine

### Email Security

- Notifications sent via Pi's mail server
- Configure SSMTP with app-specific passwords
- Don't store credentials in script

---

## Support & Help

### Getting Help

1. **Quick questions**: See `QUICK_UPDATE_REFERENCE.md`
2. **Detailed guide**: See `UPDATE_PI_GUIDE.md`
3. **Troubleshooting**: See UPDATE_PI_GUIDE.md § Troubleshooting
4. **Advanced topics**: See UPDATE_PI_GUIDE.md § Advanced Configuration

### Debug Information

Collect when reporting issues:

```bash
# Pi system info
ssh pi@pi.local 'uname -a; df -h; free -h; docker --version'

# Recent update log
cat logs/updates/update-*.log | tail -100

# Service status
ssh pi@pi.local 'docker-compose ps'
```

### Log Locations

- Update logs: `logs/updates/update-YYYYMMDD-HHMMSS.log`
- Scheduled updates: `/var/log/wise2-edge-appliance/auto-update.log`
- Service logs: `docker-compose logs api`
- System logs: `/var/log/syslog` (on Pi)

---

## Version & Updates

**Current Version**: 1.0  
**Last Updated**: 2026-07-23  
**Status**: Production-ready

---

## Related Documentation

- **Deployment**: DEPLOYMENT_GUIDE.md — Initial Pi setup
- **Health Checks**: PI_HEALTH_CHECK_SETUP.md — Service health monitoring
- **Monitoring**: MONITORING_SETUP_GUIDE.md — Full monitoring stack
- **Docker**: docker-compose.prod.yml — Service definitions

---

**Questions?** Check UPDATE_PI_GUIDE.md or contact dwise03@gmail.com
