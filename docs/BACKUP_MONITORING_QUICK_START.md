# WISE² Backup Monitoring - Quick Start Guide

**5-minute setup for backup health monitoring, alerting, and restore testing.**

---

## Installation (5 minutes)

### 1. Copy Configuration Files

```bash
cd /opt/wise2-core

# Copy environment template
sudo cp config/backup/wise2-backup-env.example /etc/wise2-backup-env
sudo chmod 600 /etc/wise2-backup-env

# Copy cron configuration
sudo cp config/cron/wise2-backup-monitoring.cron /etc/cron.d/wise2-backup
sudo chmod 644 /etc/cron.d/wise2-backup
```

### 2. Update Configuration

```bash
# Edit environment variables
sudo nano /etc/wise2-backup-env

# Key settings to update:
# - BACKUP_DIR (where backups are stored)
# - S3_BUCKET_BACKUP (optional, for remote backups)
# - ALERT_EMAIL (for alert notifications)
# - DISCORD_WEBHOOK (optional, for Discord alerts)
```

### 3. Create Log Directory

```bash
sudo mkdir -p /var/log/wise2
sudo chown nobody:nogroup /var/log/wise2
sudo chmod 755 /var/log/wise2
```

### 4. Test the Script

```bash
# Verify script is executable
ls -la /opt/wise2-core/scripts/monitor-backups.sh

# Run a health check
/opt/wise2-core/scripts/monitor-backups.sh status

# View dashboard
/opt/wise2-core/scripts/monitor-backups.sh dashboard

# Generate report
/opt/wise2-core/scripts/monitor-backups.sh report
```

**Done!** Monitoring is now active with hourly checks.

---

## What's Being Monitored

### Hourly Checks (automatic, every hour)

✓ **Local backups exist** - files found in backup directory  
✓ **Backup integrity** - gzip/tar archives can be extracted  
✓ **File age** - warning if >48h old, critical if >72h old  
✓ **File size** - warning if smaller than 1MB  
✓ **Disk space** - alert if <20% available  
✓ **Backup cleanup** - remove old backups per retention policy  

### Daily Checks (06:00 UTC)

✓ Detailed status logging  
✓ Full health assessment  

### Weekly Reports (Sunday 10:00 UTC)

✓ Summary of backup activity  
✓ Storage usage trends  
✓ Retention policy compliance  

### Monthly Tests (1st, 02:00 UTC)

✓ **Restore verification** - test if backups can actually be restored  
✓ **Archive integrity** - extract and validate backup files  
✓ **Database connectivity** - verify restore would work  

---

## View Status

### Dashboard

```bash
./scripts/monitor-backups.sh dashboard

# Output:
# WISE² BACKUP HEALTH DASHBOARD
# Overall Status: OK
#
# Backup Checks:
#   ✓ local_backups: OK
#   ✓ remote_backups: OK
#   ✓ disk_space: OK
#   ✓ restore_test: OK
#
# Latest Backup:
#   Name: backup-20260723-120000.sql.gz
#   Size: 512MB
#   Age: 12h
#
# Storage:
#   Used: 65%
#   Available: 35%
```

### JSON Metrics

```bash
# View raw metrics (for dashboard integration)
cat /logs/backups/monitor/status.json | jq .

# Use in API/frontend
curl http://localhost:3000/api/backups/status
```

### Logs

```bash
# Real-time monitoring
tail -f /var/log/wise2/backup-monitor.log

# See all errors
grep ERROR /var/log/wise2/backup-monitor.log

# Check alerts
cat /logs/backups/monitor/alerts.log
```

---

## Configure Alerts

### Email Alerts

```bash
# Set in /etc/wise2-backup-env
export ALERT_EMAIL="ops@wise2.com"

# Requires: mail command
# On Ubuntu: sudo apt-get install mailutils
# On RHEL: sudo yum install mailx
```

### Discord Alerts

1. Create Discord channel: `#backup-alerts`
2. Get webhook URL:
   - Right-click channel → Integrations → Webhooks → New Webhook
   - Copy Webhook URL
3. Set in `/etc/wise2-backup-env`:

```bash
export DISCORD_WEBHOOK="https://discordapp.com/api/webhooks/..."
```

### Alert Examples

**Critical Alert** (backup too old):
```
🚨 ERROR: Backup health check FAILED
  Local backups: FAIL (backup 72h old)
  Disk space: OK (35% available)
```

**Warning Alert** (disk running low):
```
⚠️ WARNING: Backup health check WARNING
  Disk space: WARN (22% available)
  Consider cleanup or additional storage
```

---

## Troubleshooting

### No Backups Found

```bash
# Check backup directory
ls -la /backups/wise2

# Verify backup script is running
./scripts/backup-database.sh

# Check backup logs
tail -20 /backups/wise2/backup.log
```

### Alerts Not Sending

```bash
# Test email
echo "Test" | mail -s "Test" ops@wise2.com

# Test Discord webhook
curl -X POST "$DISCORD_WEBHOOK" \
  -H 'Content-Type: application/json' \
  -d '{"content":"Test"}'

# Verify environment file is sourced
source /etc/wise2-backup-env
echo $ALERT_EMAIL
```

### Restore Test Fails

```bash
# Check backup integrity
gzip -t /backups/wise2/backup-*.sql.gz

# Test restore manually
./scripts/monitor-backups.sh test-restore

# Check restore log
tail -20 /logs/backups/monitor/restore-tests.log
```

### Disk Space Low

```bash
# Check usage
df -h /backups

# Run cleanup
./scripts/monitor-backups.sh cleanup

# View retention policy
head -20 /opt/wise2-core/scripts/monitor-backups.sh | grep RETENTION
```

---

## Integration with Dashboard

Add backup status widget to WISE² dashboard:

### Admin API Endpoint

Create `/packages/api/src/v1/backups.ts`:

```typescript
import fs from 'fs';

export async function getBackupStatus(req, res) {
  try {
    const data = fs.readFileSync(
      '/logs/backups/monitor/status.json',
      'utf8'
    );
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Cannot read backup status' });
  }
}

// Route: GET /api/v1/backups/status
```

### Dashboard Widget

```tsx
import { useQuery } from '@tanstack/react-query';

export function BackupHealthWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ['backup-status'],
    queryFn: () => fetch('/api/v1/backups/status').then(r => r.json()),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  if (isLoading) return <div>Loading...</div>;

  const statusColor = {
    'OK': '#10b981',
    'WARN': '#f59e0b',
    'FAIL': '#ef4444',
  }[data?.status];

  return (
    <div className="backup-widget" style={{ borderLeft: `4px solid ${statusColor}` }}>
      <h3>Backup Status</h3>
      <p>Latest: {data?.backups?.latest_name}</p>
      <p>Age: {data?.backups?.latest_age_hours}</p>
      <p>Size: {data?.backups?.latest_size}</p>
      <p>Disk Available: {data?.storage?.percent_available}%</p>
    </div>
  );
}
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| No backups found | Verify backup directory, run backup script manually |
| Backup too old | Check if backup-database.sh is running (cron job status) |
| Disk space low | Run cleanup: `./scripts/monitor-backups.sh cleanup` |
| Restore test fails | Verify database connectivity, check backup integrity |
| Alerts not sending | Verify email/Discord config in /etc/wise2-backup-env |
| Permission denied | Ensure script is executable: `chmod +x /opt/wise2-core/scripts/monitor-backups.sh` |

---

## Maintenance

### Weekly

- [ ] Check dashboard for status
- [ ] Review alerts in log file
- [ ] Verify disk space trending

### Monthly

- [ ] Review restore test results
- [ ] Check backup retention compliance
- [ ] Test restore to staging environment (manual)

### Quarterly

- [ ] Review and update alert thresholds
- [ ] Audit backup retention policy
- [ ] Verify disaster recovery procedure works

---

## File Locations

```
/opt/wise2-core/
├── scripts/
│   └── monitor-backups.sh          # Main monitoring script
├── config/
│   ├── backup/
│   │   └── wise2-backup-env.example
│   └── cron/
│       └── wise2-backup-monitoring.cron
└── docs/
    ├── BACKUP_MONITORING_SETUP.md       # Full documentation
    └── BACKUP_MONITORING_QUICK_START.md # This file

/var/log/wise2/
├── backup-monitor.log                   # Hourly checks
├── backup-status.log                    # Daily status
├── backup-report-weekly.log             # Weekly reports
└── ...

/logs/backups/monitor/
├── status.json                          # Current status (JSON)
├── monitor.log                          # Detailed logs
├── restore-tests.log                    # Test results
└── alerts.log                           # All alerts sent
```

---

## Command Reference

```bash
# Check health (all checks)
./scripts/monitor-backups.sh status

# View dashboard
./scripts/monitor-backups.sh dashboard

# Generate detailed report
./scripts/monitor-backups.sh report

# Test restore capability
./scripts/monitor-backups.sh test-restore

# Cleanup old backups
./scripts/monitor-backups.sh cleanup

# Run hourly check (for cron)
./scripts/monitor-backups.sh check-hourly

# Show help
./scripts/monitor-backups.sh help
```

---

## Next Steps

1. ✅ Install & configure monitoring (you are here)
2. Integrate with dashboard (see Dashboard Widget above)
3. Set up alerting (email/Discord)
4. Test restore procedure monthly
5. Review trends weekly
6. Document any issues found

---

**Questions?** See [BACKUP_MONITORING_SETUP.md](./BACKUP_MONITORING_SETUP.md) for detailed documentation.
