# WISE² Backup Script Setup Guide

## Overview

The `backup-pi.sh` script provides automated data backup for the WISE² Raspberry Pi deployment. It handles:

- Full backups (database + application files)
- Incremental backups (database-only or files-only)
- Automatic retention policies (30 daily, 12 weekly, 12 monthly)
- Local and S3 backups
- Backup verification and integrity checking
- Email and Slack notifications
- Comprehensive logging

## Installation

### 1. Prerequisites

```bash
# On Raspberry Pi, install required tools:
sudo apt-get update
sudo apt-get install -y postgresql-client-13 tar gzip curl mailutils awscli

# Verify PostgreSQL client
psql --version

# Verify tar and gzip
tar --version
gzip --version
```

### 2. Create Backup Directories

```bash
sudo mkdir -p /data/wise2/backups/{daily,weekly,monthly,tmp}
sudo mkdir -p /var/log/wise2
sudo chmod 700 /data/wise2/backups
sudo chown wise2:wise2 /data/wise2/backups /var/log/wise2
```

### 3. Configure Environment Variables

Create a backup configuration file at `/etc/wise2/backup.env`:

```bash
sudo mkdir -p /etc/wise2
sudo cat > /etc/wise2/backup.env << 'EOF'
# Database Configuration
DB_NAME=wise2_prod
DB_USER=wise2
DB_HOST=localhost
DB_PORT=5432
DB_PASS=<your-postgres-password>

# Notification Configuration
NOTIFY_EMAIL=ops@wise2.dev
NOTIFY_SLACK=true
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# S3 Configuration (optional)
S3_ENABLED=false
S3_BUCKET=wise2-backups
S3_REGION=us-east-1

# Retention Policies
RETENTION_DAILY=30
RETENTION_WEEKLY=12
RETENTION_MONTHLY=12
EOF

sudo chmod 600 /etc/wise2/backup.env
```

### 4. Copy Script

```bash
sudo cp scripts/backup-pi.sh /usr/local/bin/wise2-backup
sudo chmod 755 /usr/local/bin/wise2-backup
```

## Scheduling (Crontab)

### Add Cron Jobs

```bash
# Edit crontab as the pi user
sudo crontab -e -u wise2

# Add these lines:

# Daily backup at 2:00 AM
0 2 * * * source /etc/wise2/backup.env && /usr/local/bin/wise2-backup full >> /var/log/wise2/backup.log 2>&1

# Weekly full backup with S3 upload (Sunday at 2:00 AM)
0 2 * * 0 source /etc/wise2/backup.env && /usr/local/bin/wise2-backup full --upload-s3 >> /var/log/wise2/backup.log 2>&1

# Backup retention cleanup (daily at 3:00 AM)
0 3 * * * find /data/wise2/backups/daily -mtime +30 -delete; find /data/wise2/backups/weekly -mtime +84 -delete; find /data/wise2/backups/monthly -mtime +365 -delete
```

### Verify Cron Job

```bash
sudo crontab -l -u wise2
```

## Alternative: systemd Service + Timer

If you prefer systemd over cron:

### Create Service File

```bash
sudo cat > /etc/systemd/system/wise2-backup.service << 'EOF'
[Unit]
Description=WISE² Backup Service
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
EnvironmentFile=/etc/wise2/backup.env
ExecStart=/usr/local/bin/wise2-backup %i
User=wise2
StandardOutput=journal
StandardError=journal
EOF
```

### Create Timer File

```bash
sudo cat > /etc/systemd/system/wise2-backup.timer << 'EOF'
[Unit]
Description=WISE² Daily Backup Timer
Requires=wise2-backup.service

[Timer]
# Daily backup at 2:00 AM
OnCalendar=*-*-* 02:00:00
Persistent=true

[Install]
WantedBy=timers.target
EOF

# Weekly S3 backup timer (Sunday 2:00 AM)
sudo cat > /etc/systemd/system/wise2-backup-s3.timer << 'EOF'
[Unit]
Description=WISE² Weekly S3 Backup Timer
Requires=wise2-backup-s3.service

[Timer]
OnCalendar=Sun *-*-* 02:00:00
Persistent=true

[Install]
WantedBy=timers.target
EOF
```

### Enable and Start

```bash
sudo systemctl daemon-reload
sudo systemctl enable wise2-backup.timer wise2-backup-s3.timer
sudo systemctl start wise2-backup.timer wise2-backup-s3.timer
sudo systemctl status wise2-backup.timer
```

## Testing

### Test Full Backup

```bash
# Run manually (as wise2 user)
sudo -u wise2 source /etc/wise2/backup.env && /usr/local/bin/wise2-backup full

# Check results
ls -lah /data/wise2/backups/daily/
cat /var/log/wise2/backup-$(date +%Y-%m-%d).log
```

### Test Database-Only Backup

```bash
sudo -u wise2 source /etc/wise2/backup.env && /usr/local/bin/wise2-backup db-only
```

### Test Files-Only Backup

```bash
sudo -u wise2 source /etc/wise2/backup.env && /usr/local/bin/wise2-backup files-only
```

### Test S3 Upload

```bash
# First configure AWS credentials
aws configure

# Then run with S3 upload
sudo -u wise2 source /etc/wise2/backup.env && /usr/local/bin/wise2-backup full --upload-s3
```

### Monitor Backup Progress

```bash
# Watch logs in real-time
tail -f /var/log/wise2/backup-$(date +%Y-%m-%d).log

# Check disk usage
du -sh /data/wise2/backups/
du -sh /data/wise2/backups/{daily,weekly,monthly}
```

## Restore Procedures

### Restore Database from Backup

```bash
# List available backups
ls -la /data/wise2/backups/daily/*.sql.gz

# Restore from most recent backup
BACKUP_FILE=/data/wise2/backups/daily/wise2-full-20260723_140000.sql.gz

# Method 1: Gunzip and pipe to psql
gunzip < ${BACKUP_FILE} | psql -U wise2 -d wise2_prod -h localhost

# Method 2: Restore to different database (for testing)
gunzip < ${BACKUP_FILE} | psql -U wise2 -d wise2_prod_restore -h localhost
```

### Restore Application Files from Backup

```bash
# List available backups
ls -la /data/wise2/backups/daily/*.tar.gz

# Extract to restore location (test first!)
BACKUP_FILE=/data/wise2/backups/daily/wise2-full-20260723_140000.tar.gz
tar -tzf ${BACKUP_FILE} | head -20  # Verify contents

# Restore (with caution!)
sudo tar -xzf ${BACKUP_FILE} -C /

# Or restore to temporary location for inspection
mkdir -p /tmp/wise2-restore
tar -xzf ${BACKUP_FILE} -C /tmp/wise2-restore
```

### Complete Recovery Procedure

```bash
# 1. Verify backup integrity
sha256sum -c /data/wise2/backups/daily/wise2-full-*.tar.gz.sha256

# 2. Stop application
sudo systemctl stop wise2-api wise2-website wise2-dashboard

# 3. Restore database
gunzip < /data/wise2/backups/daily/wise2-db-*.sql.gz | \
  psql -U wise2 -d wise2_prod -h localhost

# 4. Restore application files
sudo tar -xzf /data/wise2/backups/daily/wise2-files-*.tar.gz -C /

# 5. Fix permissions
sudo chown -R wise2:wise2 /data/wise2/app

# 6. Start application
sudo systemctl start wise2-api wise2-website wise2-dashboard

# 7. Verify restoration
sudo systemctl status wise2-api wise2-website wise2-dashboard
```

## Backup Verification

### Check Backup Integrity

```bash
# Verify checksum
sha256sum -c /data/wise2/backups/daily/wise2-full-*.sha256

# Test archive extraction (dry-run)
tar -tzf /data/wise2/backups/daily/wise2-full-*.tar.gz | head

# Test database backup validity
gunzip -t /data/wise2/backups/daily/wise2-db-*.sql.gz
```

### View Backup Manifest

```bash
# Show backup contents and metadata
cat /data/wise2/backups/daily/wise2-full-*.manifest
```

### Monitor Backup Metrics

```bash
# Backup size trends
du -sh /data/wise2/backups/daily/* | sort -h

# Backup count by type
find /data/wise2/backups/daily -name "*.tar.gz" | wc -l
find /data/wise2/backups/daily -name "*.sql.gz" | wc -l

# Total backup storage
du -sh /data/wise2/backups
```

## Troubleshooting

### Backup Script Fails to Start

```bash
# Check script permissions
ls -la /usr/local/bin/wise2-backup

# Test script directly
bash -x /usr/local/bin/wise2-backup full 2>&1 | tee /tmp/debug.log

# Check environment variables
source /etc/wise2/backup.env
echo $DB_NAME
echo $DB_USER
```

### Database Connection Fails

```bash
# Test PostgreSQL connection
psql -h localhost -U wise2 -d wise2_prod -c "SELECT version();"

# Check PostgreSQL service
sudo systemctl status postgresql

# Verify credentials
grep "^DB_" /etc/wise2/backup.env
```

### Disk Space Issues

```bash
# Check available disk space
df -h /data

# Show backup storage breakdown
du -sh /data/wise2/backups/{daily,weekly,monthly}

# Remove old backups manually
find /data/wise2/backups/daily -mtime +30 -ls -delete
```

### Notifications Not Working

```bash
# Test email
echo "Test message" | mail -s "Test" ops@wise2.dev

# Test Slack webhook
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test message"}' \
  $SLACK_WEBHOOK

# Check mail logs
tail -f /var/log/mail.log
```

### S3 Upload Fails

```bash
# Check AWS credentials
aws configure

# Test S3 access
aws s3 ls s3://wise2-backups/ --region us-east-1

# Check IAM permissions
aws iam get-user
```

## Monitoring & Alerts

### Setup Log Monitoring

```bash
# Watch backup logs
tail -f /var/log/wise2/backup-*.log

# Check latest backups
ls -lt /data/wise2/backups/daily | head -5

# Verify recent backup success
grep "SUCCESS" /var/log/wise2/backup-$(date +%Y-%m-%d).log
```

### Create Monitoring Dashboard

```bash
# Install backup status script
sudo cat > /usr/local/bin/wise2-backup-status << 'EOF'
#!/bin/bash
echo "WISE² Backup Status"
echo "=================="
echo ""
echo "Disk Usage:"
du -sh /data/wise2/backups/*
echo ""
echo "Last Backups:"
ls -lt /data/wise2/backups/daily | head -3
echo ""
echo "Recent Errors:"
grep ERROR /var/log/wise2/backup-*.log | tail -5
EOF

sudo chmod +x /usr/local/bin/wise2-backup-status

# Run status check
wise2-backup-status
```

## Performance Tuning

### Optimize Backup Performance

```bash
# Use faster compression (sacrifices size for speed)
# Edit backup script and change: gzip -9 to gzip -6

# Increase PostgreSQL maintenance_work_mem for faster dumps
# In /etc/postgresql/13/main/postgresql.conf:
# maintenance_work_mem = 512MB

# Use parallel backup for large databases
# Replace pg_dump with: pg_dump --jobs=4 (if supported)
```

### Database WAL Archiving for Point-in-Time Recovery (PITR)

```bash
# Enable WAL archiving in PostgreSQL config
# archive_mode = on
# archive_command = 'cp %p /data/wise2/wal-archive/%f'

# Create WAL archive directory
sudo mkdir -p /data/wise2/wal-archive
sudo chmod 700 /data/wise2/wal-archive
sudo chown postgres:postgres /data/wise2/wal-archive
```

## Backup Summary

| Type | Frequency | Retention | Location | Size |
|------|-----------|-----------|----------|------|
| Daily | Every night | 30 days | `/data/wise2/backups/daily` | ~500MB-1GB |
| Weekly | Sunday night | 12 weeks | `/data/wise2/backups/weekly` | ~500MB-1GB |
| Monthly | 1st of month | 12 months | `/data/wise2/backups/monthly` | ~500MB-1GB |
| S3 | Weekly | 12 months | AWS S3 | ~500MB-1GB |

## References

- PostgreSQL pg_dump: https://www.postgresql.org/docs/13/app-pgdump.html
- Systemd Timers: https://www.freedesktop.org/software/systemd/man/systemd.timer.html
- AWS S3 CLI: https://docs.aws.amazon.com/cli/latest/userguide/
- WISE² Deployment: See DEPLOYMENT_GUIDE.md
