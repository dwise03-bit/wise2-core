# WISE² Core - Backup Monitoring Setup

**Purpose**: Comprehensive backup health monitoring with hourly checks, monthly restore tests, and automated alerting.

**Script**: `/scripts/monitor-backups.sh`  
**Config**: Environment variables or `.env` file  
**Logs**: `/logs/backups/monitor/`  
**Dashboard**: JSON-based metrics for integration into admin dashboards

---

## Quick Start

### 1. Test the Script

```bash
# Check backup health
./scripts/monitor-backups.sh status

# View dashboard
./scripts/monitor-backups.sh dashboard

# Generate detailed report
./scripts/monitor-backups.sh report
```

### 2. Set Up Cron Jobs

Create or edit `/etc/crontab` (or use `crontab -e`):

```bash
# Hourly health checks (runs at top of each hour)
0 * * * * /opt/wise2-core/scripts/monitor-backups.sh check-hourly >> /var/log/wise2-backups-hourly.log 2>&1

# Monthly restore test (1st of month at 02:00 UTC)
0 2 1 * * /opt/wise2-core/scripts/monitor-backups.sh test-restore >> /var/log/wise2-backups-monthly.log 2>&1

# Weekly report (Sunday at 10:00 UTC)
0 10 * * 0 /opt/wise2-core/scripts/monitor-backups.sh report >> /var/log/wise2-backups-report.log 2>&1
```

### 3. Configure Alerting (Optional)

Set environment variables for alerts:

```bash
# Email alerts
export ALERT_EMAIL="ops@wise2.com"

# Discord webhook
export DISCORD_WEBHOOK="https://discordapp.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_TOKEN"

# AWS S3 remote backups
export S3_BUCKET_BACKUP="wise2-backups"
export AWS_REGION="us-east-1"
```

Store in `/etc/wise2-backup-env` and source in cron:

```bash
# In crontab
0 * * * * source /etc/wise2-backup-env && /opt/wise2-core/scripts/monitor-backups.sh check-hourly
```

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKUP_DIR` | `/backups/wise2` | Location of backup files |
| `S3_BUCKET_BACKUP` | (none) | AWS S3 bucket for remote backups |
| `AWS_REGION` | `us-east-1` | AWS region for S3 |
| `ALERT_EMAIL` | (none) | Email for alerts |
| `DISCORD_WEBHOOK` | (none) | Discord webhook URL |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `wise2_prod` | Database name |
| `DB_USER` | `wise2_prod` | Database user |

### Thresholds

Edit these in the script to customize monitoring:

```bash
BACKUP_AGE_WARN_HOURS=48          # Warn if backup older than 48h
BACKUP_AGE_CRITICAL_HOURS=72      # Fail if backup older than 72h
MIN_DISK_SPACE_PERCENT=20         # Fail if <20% disk available
MIN_BACKUP_SIZE_MB=1              # Warn if backup <1 MB
BACKUP_RETENTION_DAYS=7           # Delete backups older than 7 days
BACKUP_RETENTION_MIN_COUNT=10     # Always keep at least 10 backups
```

---

## Monitoring Features

### 1. Local Backup Checks

✓ File existence verification  
✓ File size validation  
✓ File age monitoring  
✓ Integrity checks (gzip/tar validation)  
✓ Count tracking  

**Output**:
```
INFO: Checking local backups...
INFO:   Found: backup-20260723-120000.sql.gz (512MB, 12h old)
OK:   Backup integrity verified: backup-20260723-120000.sql.gz
```

### 2. Remote Backup Checking (S3)

✓ List remote backups via AWS CLI  
✓ Verify sync status  
✓ Count remote copies  

**Requires**: `aws` CLI installed and configured

**Setup**:
```bash
# Install AWS CLI
pip install awscli

# Configure credentials
aws configure

# Export bucket name
export S3_BUCKET_BACKUP="wise2-backups"
```

### 3. Disk Space Monitoring

✓ Current usage percentage  
✓ Available space tracking  
✓ Alert if <20% available  
✓ Warn if <30% available  

**Output**:
```
INFO: Checking backup storage disk space...
INFO: Disk usage: 65% used, 35% available
INFO:   Total: 1TB
INFO:   Used: 650GB
INFO:   Available: 350GB
```

### 4. Restore Testing (Monthly)

✓ Verify latest backup can be extracted  
✓ Test archive/SQL integrity  
✓ Simulate database connectivity  
✓ Log test results with timestamps  

**Monthly Schedule**: Automatically runs on 1st of each month at 02:00 UTC

**Manual Trigger**:
```bash
./scripts/monitor-backups.sh test-restore
```

**Log Location**: `/logs/backups/monitor/restore-tests.log`

### 5. Status Dashboard

JSON-based metrics for dashboard integration:

**Location**: `/logs/backups/monitor/status.json`

**Format**:
```json
{
  "timestamp": "2026-07-23T12:00:00Z",
  "status": "OK|WARN|FAIL",
  "checks": {
    "local_backups": "OK|WARN|FAIL",
    "remote_backups": "OK|WARN|FAIL|SKIP",
    "disk_space": "OK|WARN|FAIL",
    "restore_test": "OK|WARN|FAIL|UNTESTED"
  },
  "backups": {
    "count": 10,
    "latest_name": "backup-20260723-120000.sql.gz",
    "latest_size": "512MB",
    "latest_age_hours": "12h"
  },
  "storage": {
    "percent_used": 65,
    "percent_available": 35
  }
}
```

**View Dashboard**:
```bash
./scripts/monitor-backups.sh dashboard
```

---

## Alerting

### Email Alerts

Requires `mail` command available:

```bash
export ALERT_EMAIL="ops@wise2.com"
```

Alerts sent on:
- Backup too old (>72 hours)
- Backup integrity check failure
- Disk space critical (<20%)
- Restore test failure

### Discord Notifications

Setup webhook:

1. Create Discord channel: `#wise2-backups-alerts`
2. Get webhook URL from channel settings
3. Set environment variable:

```bash
export DISCORD_WEBHOOK="https://discordapp.com/api/webhooks/YOUR_ID/YOUR_TOKEN"
```

Sends rich embeds with:
- Alert severity (color coded)
- Message content
- Timestamp
- More details in thread

### Custom Alerting

Add to your monitoring stack via the JSON status file:

```bash
# Prometheus-style scraping
curl -s http://localhost:8080/metrics/backups | grep backup_

# Custom integration
jq '.status' /logs/backups/monitor/status.json
```

---

## Backup File Rotation

Automatic cleanup runs hourly via `check-hourly` command:

**Retention Policy**:
- Keep backups for 7 days, OR
- Keep minimum 10 backups (whichever is longer)

**Example**:
```
backup-20260716-120000.sql.gz  (7 days old)  → DELETED
backup-20260717-120000.sql.gz  (6 days old)  → KEPT
backup-20260718-120000.sql.gz  (5 days old)  → KEPT
... (more recent backups)
```

---

## Integration with Dashboard

The monitoring script exports JSON metrics that can be displayed in the WISE² dashboard:

### React Component Integration

```typescript
import { useEffect, useState } from 'react';

export function BackupHealthWidget() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetch('/api/backups/status')
      .then(r => r.json())
      .then(setStatus);
  }, []);

  if (!status) return <div>Loading...</div>;

  const statusColor = {
    'OK': 'green',
    'WARN': 'yellow',
    'FAIL': 'red'
  }[status.status];

  return (
    <div className={`backup-widget status-${statusColor}`}>
      <h3>Backup Status: {status.status}</h3>
      <p>Latest: {status.backups.latest_name}</p>
      <p>Age: {status.backups.latest_age_hours}</p>
      <p>Size: {status.backups.latest_size}</p>
      <p>Disk: {status.storage.percent_available}% available</p>
    </div>
  );
}
```

### API Endpoint

Add to your API (`packages/api/src/v1/`):

```typescript
// GET /api/v1/backups/status
export async function getBackupStatus(req, res) {
  const statusFile = '/logs/backups/monitor/status.json';
  const data = fs.readFileSync(statusFile, 'utf8');
  res.json(JSON.parse(data));
}
```

---

## Troubleshooting

### Backups Not Found

```bash
./scripts/monitor-backups.sh status
# ERROR: No backups found in /backups/wise2
```

**Solution**:
1. Check backup directory exists: `ls -la /backups/wise2`
2. Verify backup script is running: `./scripts/backup-database.sh`
3. Check backup logs: `tail -20 /backups/wise2/backup.log`

### Restore Test Fails

```bash
# ERROR: Cannot extract backup file
```

**Solution**:
1. Verify backup file: `gzip -t /backups/wise2/backup-*.sql.gz`
2. Check file size: `ls -lh /backups/wise2/backup-*`
3. Test with newer backup: `./scripts/monitor-backups.sh test-restore`

### Disk Space Low

```bash
# ERROR: Disk space critically low: only 15% available
```

**Solution**:
1. Check disk usage: `df -h /backups`
2. Remove old backups: `./scripts/monitor-backups.sh cleanup`
3. Verify retention settings in script
4. Consider adding storage or increasing backup rotation

### S3 Upload Fails

```bash
# WARN: S3 upload failed
```

**Solution**:
1. Verify AWS credentials: `aws s3 ls`
2. Check bucket exists: `aws s3 ls s3://wise2-backups/`
3. Verify IAM permissions for S3 upload
4. Check region: `export AWS_REGION=us-east-1`

### Alerts Not Sending

**Email**:
```bash
# Test mail command
echo "Test" | mail -s "Test" ops@wise2.com
```

**Discord**:
```bash
# Test webhook
curl -X POST "$DISCORD_WEBHOOK" \
  -H 'Content-Type: application/json' \
  -d '{"content":"Test"}'
```

---

## Logs & Reports

### Log Locations

```
/logs/backups/monitor/
├── monitor.log              # All monitoring activity
├── status.json              # Latest status snapshot
├── metrics.json             # Historical metrics
├── restore-tests.log        # Monthly restore test results
└── alerts.log               # All alerts sent
```

### View Logs

```bash
# Monitor in real-time
tail -f /logs/backups/monitor/monitor.log

# View recent errors
grep ERROR /logs/backups/monitor/monitor.log | tail -20

# See alerts
cat /logs/backups/monitor/alerts.log

# Last 10 restore tests
tail -10 /logs/backups/monitor/restore-tests.log
```

### Generate Report

```bash
./scripts/monitor-backups.sh report
# Generates /logs/backups/monitor/backup-report-YYYYMMDD-HHMMSS.txt
```

---

## Maintenance

### Monthly Tasks

- [ ] Review restore test results
- [ ] Check disk space trending
- [ ] Verify alert delivery
- [ ] Update retention policy if needed
- [ ] Test backup restore to non-production environment

### Quarterly Tasks

- [ ] Audit backup storage costs (if using S3)
- [ ] Review and update monitoring thresholds
- [ ] Verify disaster recovery procedure works
- [ ] Document any backup issues/resolutions

---

## Best Practices

✓ **Test Regularly**: Monthly restore tests catch issues early  
✓ **Monitor Proactively**: Hourly checks prevent surprises  
✓ **Alert on Issues**: Configure email/Discord for critical failures  
✓ **Keep Retention Policy**: Balance storage vs. historical recovery needs  
✓ **Document Changes**: Track backup strategy modifications  
✓ **Automate Everything**: Cron ensures consistent execution  
✓ **Verify Integrity**: Gzip/tar checks catch corrupted files  

---

## Related Documentation

- [Backup Strategy](./BACKUP_STRATEGY.md)
- [Disaster Recovery](./DISASTER_RECOVERY.md)
- [Database Maintenance](./DATABASE_MAINTENANCE.md)
- [Production Checklist](../PRODUCTION_CHECKLIST.md)
