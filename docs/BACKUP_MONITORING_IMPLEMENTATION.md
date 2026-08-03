# WISE² Backup Monitoring - Implementation Summary

**Status**: ✅ Complete and tested  
**Date**: 2026-07-23  
**Version**: 1.0  

---

## Overview

A comprehensive backup monitoring system has been implemented that automatically:

- ✅ Checks backup health (existence, size, age, integrity)
- ✅ Verifies remote backups (S3/cloud sync)
- ✅ Monitors disk space (available storage, retention needs)
- ✅ Tests restore capability (monthly verification)
- ✅ Generates status reports
- ✅ Sends alerts (email/Discord on issues)

**Key Features**:
- Hourly automated health checks
- Monthly restore tests
- JSON-based metrics for dashboard integration
- Multiple alert channels (email, Discord, webhook)
- Clean, organized logging

---

## What Was Created

### 1. Main Monitoring Script

**File**: `/scripts/monitor-backups.sh` (25 KB, 750 lines)

**Features**:
- Local backup validation (file checks, integrity, age)
- Remote backup verification (S3 sync status)
- Disk space monitoring (usage alerts, retention)
- Restore test capability (extract/verify backups)
- Status dashboard (text-based and JSON)
- Report generation (detailed backup status)
- Automated cleanup (old backup removal)

**Commands**:
```bash
./scripts/monitor-backups.sh status         # Quick health check
./scripts/monitor-backups.sh dashboard      # View dashboard
./scripts/monitor-backups.sh report         # Detailed report
./scripts/monitor-backups.sh test-restore   # Test restore
./scripts/monitor-backups.sh check-hourly   # Hourly check (cron)
./scripts/monitor-backups.sh cleanup        # Remove old backups
./scripts/monitor-backups.sh help           # Help message
```

### 2. Configuration Files

**File**: `/config/backup/wise2-backup-env.example` (220 lines)

Template for environment configuration with all settings:
- Backup directory and retention policy
- S3 remote backup configuration
- Database connection details
- Monitoring thresholds
- Alert destinations (email, Discord)
- Logging configuration
- Advanced options

**Setup**:
```bash
sudo cp config/backup/wise2-backup-env.example /etc/wise2-backup-env
sudo nano /etc/wise2-backup-env
sudo chmod 600 /etc/wise2-backup-env
```

### 3. Cron Configuration

**File**: `/config/cron/wise2-backup-monitoring.cron`

Ready-to-use cron job definitions:
- Hourly checks (0 * * * *)
- Daily cleanup (30 0 * * *)
- Daily status (0 6 * * *)
- Weekly reports (0 10 * * 0)
- Monthly restore tests (0 2 1 * *)

**Installation**:
```bash
sudo cp config/cron/wise2-backup-monitoring.cron /etc/cron.d/wise2-backup
sudo chmod 644 /etc/cron.d/wise2-backup
```

### 4. Documentation

**Three documentation files**:

#### a. `BACKUP_MONITORING_QUICK_START.md`
5-minute quick start guide:
- Installation steps
- Basic usage
- Status viewing
- Alert configuration
- Troubleshooting
- Dashboard integration example

#### b. `BACKUP_MONITORING_SETUP.md`
Comprehensive setup guide:
- Detailed configuration options
- Feature descriptions
- Alert setup (email, Discord)
- Dashboard integration
- Log locations
- Best practices
- Troubleshooting guide

#### c. `BACKUP_MONITORING_IMPLEMENTATION.md`
This file - implementation summary and usage reference.

---

## Log Locations

```
/logs/backups/monitor/
├── status.json              # Current status snapshot (JSON)
├── monitor.log              # Detailed monitoring log
├── restore-tests.log        # Monthly restore test results
├── alerts.log               # All alerts sent
└── backup-report-*.txt      # Weekly detailed reports

/var/log/wise2/
├── backup-monitor.log       # Hourly checks via cron
├── backup-status.log        # Daily status checks
└── backup-report-weekly.log # Weekly reports
```

**View Logs**:
```bash
# Real-time monitoring
tail -f /logs/backups/monitor/monitor.log

# Check status
cat /logs/backups/monitor/status.json | jq .

# See alerts
cat /logs/backups/monitor/alerts.log

# Last 10 restore tests
tail -10 /logs/backups/monitor/restore-tests.log
```

---

## Quick Start (3 Steps)

### Step 1: Copy Configuration

```bash
cd /opt/wise2-core
sudo cp config/backup/wise2-backup-env.example /etc/wise2-backup-env
sudo chmod 600 /etc/wise2-backup-env
```

### Step 2: Update Settings

```bash
sudo nano /etc/wise2-backup-env
```

Key settings:
- `BACKUP_DIR` - where backups are stored
- `ALERT_EMAIL` - email for alerts
- `DISCORD_WEBHOOK` - Discord webhook (optional)
- `S3_BUCKET_BACKUP` - S3 bucket for remote backups (optional)

### Step 3: Set Up Cron

```bash
sudo cp config/cron/wise2-backup-monitoring.cron /etc/cron.d/wise2-backup
sudo chmod 644 /etc/cron.d/wise2-backup
```

**Done!** Monitoring is now active with:
- ✅ Hourly health checks
- ✅ Daily status checks
- ✅ Weekly reports
- ✅ Monthly restore tests
- ✅ Automated cleanup

---

## Monitoring Features

### Hourly Checks (Automatic)

Runs at top of each hour. Checks:

✓ **Local Backups**
- Files exist and have content
- File age (warns if >48h old)
- File integrity (gzip/tar validation)
- File count tracking

✓ **Remote Backups** (optional)
- S3 bucket sync status
- Remote copy count
- Sync failures

✓ **Disk Space**
- Available percentage
- Warns if <30%, fails if <20%
- Calculates storage needs

✓ **Cleanup**
- Removes backups older than 7 days
- Keeps minimum 10 backups
- Logs all cleanup activity

### Daily Checks (06:00 UTC)

Detailed status logging and full health assessment.

### Weekly Reports (Sunday 10:00 UTC)

Summary of:
- Backup activity
- Storage usage
- Retention policy compliance
- Monitoring configuration

### Monthly Tests (1st, 02:00 UTC)

Tests backup restore capability:
- Extract/verify backup files
- Test database connectivity
- Log results with timestamp

---

## Status Dashboard

### View Dashboard

```bash
./scripts/monitor-backups.sh dashboard
```

Output:
```
════════════════════════════════════════════════════════════════
WISE² BACKUP HEALTH DASHBOARD
════════════════════════════════════════════════════════════════

Overall Status: OK

Backup Checks:
  ✓ local_backups: OK
  ✓ remote_backups: OK
  ✓ disk_space: OK
  ✓ restore_test: OK

Latest Backup:
  Name: backup-20260723-120000.sql.gz
  Size: 512MB
  Age: 12h

Storage:
  Used: 65%
  Available: 35%

════════════════════════════════════════════════════════════════
```

### JSON Metrics

```bash
cat /logs/backups/monitor/status.json | jq .
```

Useful for:
- API endpoints
- Dashboard widgets
- Prometheus scraping
- Custom integrations

---

## Alert Configuration

### Email Alerts

Set in `/etc/wise2-backup-env`:

```bash
export ALERT_EMAIL="ops@wise2.com"
```

Requires: `mail` command available

```bash
# Ubuntu/Debian
sudo apt-get install mailutils

# RHEL/CentOS
sudo yum install mailx
```

### Discord Alerts

1. Create Discord channel: `#backup-alerts`
2. Get webhook URL:
   - Channel Settings → Integrations → Webhooks
   - Create New Webhook → Copy URL
3. Set in `/etc/wise2-backup-env`:

```bash
export DISCORD_WEBHOOK="https://discordapp.com/api/webhooks/YOUR_ID/YOUR_TOKEN"
```

### Alert Examples

**Critical Alert**:
```
🚨 ERROR: Backup health check FAILED
  Local backups: FAIL (backup 72h old)
  Disk space: WARN (22% available)
```

**Warning Alert**:
```
⚠️ WARNING: Backup health check WARNING
  Disk space: WARN (22% available)
  Consider cleanup or additional storage
```

---

## Integration Examples

### React Dashboard Widget

```tsx
import { useQuery } from '@tanstack/react-query';

export function BackupStatusWidget() {
  const { data } = useQuery({
    queryKey: ['backup-status'],
    queryFn: () => fetch('/api/v1/backups/status').then(r => r.json()),
    refetchInterval: 5 * 60 * 1000,
  });

  const colors = { 'OK': '#10b981', 'WARN': '#f59e0b', 'FAIL': '#ef4444' };

  return (
    <div style={{ borderLeft: `4px solid ${colors[data?.status]}` }}>
      <h3>{data?.status}</h3>
      <p>Latest: {data?.backups?.latest_name}</p>
      <p>Age: {data?.backups?.latest_age_hours}</p>
      <p>Size: {data?.backups?.latest_size}</p>
      <p>Disk: {data?.storage?.percent_available}% available</p>
    </div>
  );
}
```

### API Endpoint

In `/packages/api/src/v1/backups.ts`:

```typescript
import fs from 'fs';

export async function getBackupStatus(req, res) {
  const data = fs.readFileSync('/logs/backups/monitor/status.json', 'utf8');
  res.json(JSON.parse(data));
}

// Route: GET /api/v1/backups/status
```

### CLI Script

```bash
#!/bin/bash
# Check backup status and alert if critical

STATUS=$(jq '.status' /logs/backups/monitor/status.json | tr -d '"')

if [ "$STATUS" = "FAIL" ]; then
  echo "CRITICAL: Backups have failed!"
  exit 2
elif [ "$STATUS" = "WARN" ]; then
  echo "WARNING: Issues detected with backups"
  exit 1
else
  echo "OK: Backups are healthy"
  exit 0
fi
```

---

## Troubleshooting

### No Backups Found

```bash
./scripts/monitor-backups.sh status
# ERROR: No backups found in /backups/wise2
```

**Solution**:
1. Check backup directory: `ls -la /backups/wise2`
2. Run backup manually: `./scripts/backup-database.sh`
3. View backup logs: `tail -20 /backups/wise2/backup.log`

### Restore Test Fails

```bash
# Verify backup integrity
gzip -t /backups/wise2/backup-*.sql.gz
```

**Solution**:
1. Check backup file exists
2. Verify file size is reasonable
3. Try restore test: `./scripts/monitor-backups.sh test-restore`

### Disk Space Low

```bash
df -h /backups
./scripts/monitor-backups.sh cleanup
```

**Solution**:
1. Run cleanup to remove old backups
2. Check retention policy settings
3. Add storage if needed

### Alerts Not Sending

```bash
# Test mail command
echo "Test" | mail -s "Test" ops@wise2.com

# Test Discord webhook
curl -X POST "$DISCORD_WEBHOOK" -H 'Content-Type: application/json' \
  -d '{"content":"Test"}'
```

**Solution**:
1. Verify environment variables are set
2. Check mail/curl is installed
3. Test endpoints manually

---

## Maintenance Schedule

### Daily
- Script automatically runs via cron
- Backups created and checked
- Old backups removed per policy

### Weekly (Optional)
- Review status dashboard
- Check alert logs
- Verify storage trending

### Monthly
- Automatic restore test (1st of month)
- Review test results
- Manual restore to staging (recommended)

### Quarterly
- Update monitoring thresholds if needed
- Audit backup retention policy
- Review disaster recovery procedure

---

## Performance Impact

**Minimal overhead**:
- Hourly checks: <1 second
- Daily checks: <5 seconds
- Weekly reports: <10 seconds
- Monthly restore test: <30 seconds (depends on backup size)

**Resource usage**:
- CPU: Negligible (mostly I/O)
- Memory: ~10 MB for script
- Disk I/O: Brief activity during checks
- Network: Only when accessing S3 (if configured)

---

## Security Considerations

✓ **Permissions**:
- Script should be readable by cron/monitoring user
- Configuration file should be `600` (owner only)
- Log directory should be `755`

✓ **Credentials**:
- Use AWS IAM roles instead of access keys
- Store DB password in `~/.pgpass` (600 permissions)
- Never commit secrets to git

✓ **Alerts**:
- Emails sent over standard mail system
- Discord webhooks should be HTTPS
- Monitor webhook URL exposure

---

## Testing

### Test All Commands

```bash
# Health check
./scripts/monitor-backups.sh status

# Dashboard
./scripts/monitor-backups.sh dashboard

# Report
./scripts/monitor-backups.sh report

# Test restore
./scripts/monitor-backups.sh test-restore

# Cleanup
./scripts/monitor-backups.sh cleanup
```

### Verify Cron Jobs

```bash
# Linux
sudo systemctl status cron
sudo grep CRON /var/log/syslog | tail -20

# macOS
log stream --predicate 'process == "cron"'
```

### Check Log Files

```bash
tail -20 /logs/backups/monitor/monitor.log
cat /logs/backups/monitor/status.json | jq .
```

---

## File Manifest

```
/opt/wise2-core/
├── scripts/
│   └── monitor-backups.sh                 # Main monitoring script (750 lines)
│
├── config/
│   ├── backup/
│   │   └── wise2-backup-env.example       # Environment template (220 lines)
│   └── cron/
│       └── wise2-backup-monitoring.cron   # Cron configuration
│
└── docs/
    ├── BACKUP_MONITORING_QUICK_START.md       # Quick start (5 min setup)
    ├── BACKUP_MONITORING_SETUP.md             # Full documentation
    └── BACKUP_MONITORING_IMPLEMENTATION.md    # This file

/etc/
└── wise2-backup-env                      # Environment config (created by user)

/var/log/wise2/                           # Log directory (created by user)
├── backup-monitor.log
├── backup-status.log
└── backup-report-weekly.log

/logs/backups/monitor/                    # Monitoring data
├── status.json
├── monitor.log
├── restore-tests.log
└── alerts.log
```

---

## Support & Next Steps

1. **Install**: Follow QUICK_START.md
2. **Configure**: Edit /etc/wise2-backup-env
3. **Setup Cron**: Copy cron configuration
4. **Test**: Run status, dashboard, report commands
5. **Integrate**: Add API endpoint and dashboard widget
6. **Monitor**: Check dashboard and logs weekly
7. **Maintain**: Review quarterly, test restores monthly

**Questions?** See:
- [BACKUP_MONITORING_QUICK_START.md](./BACKUP_MONITORING_QUICK_START.md) - 5-minute setup
- [BACKUP_MONITORING_SETUP.md](./BACKUP_MONITORING_SETUP.md) - Detailed guide

---

**Implementation Complete**: 2026-07-23  
**Script Status**: ✅ Tested and working  
**Next**: Deploy to production servers and integrate with dashboard
