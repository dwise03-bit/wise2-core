# WISE² Backup Cheatsheet

Quick reference for common backup operations.

## Setup

```bash
# Initial installation
sudo scripts/backup-install.sh

# Check installation status
sudo scripts/backup-install.sh --check-only

# Edit configuration
sudo nano /etc/wise2/backup.env
```

## Backup Operations

### Manual Backups

```bash
# Full backup (database + files)
sudo -u wise2 /usr/local/bin/wise2-backup full

# Database only
sudo -u wise2 /usr/local/bin/wise2-backup db-only

# Files only
sudo -u wise2 /usr/local/bin/wise2-backup files-only

# With S3 upload
sudo -u wise2 /usr/local/bin/wise2-backup full --upload-s3
```

### View Backups

```bash
# List recent backups
ls -lht /data/wise2/backups/daily/ | head -5

# Show backup sizes
du -sh /data/wise2/backups/{daily,weekly,monthly}

# Total backup storage
du -sh /data/wise2/backups/

# Show today's log
tail -50 /var/log/wise2/backup-$(date +%Y-%m-%d).log

# Follow log in real-time
tail -f /var/log/wise2/backup-$(date +%Y-%m-%d).log
```

## Restore Operations

### Restore Database

```bash
# List backups
ls /data/wise2/backups/daily/*.sql.gz

# Restore to production (DANGEROUS!)
BACKUP=/data/wise2/backups/daily/wise2-*.sql.gz
gunzip < $BACKUP | psql -U wise2 -d wise2_prod

# Restore to test database (SAFE)
BACKUP=/data/wise2/backups/daily/wise2-*.sql.gz
gunzip < $BACKUP | psql -U wise2 -d wise2_test
```

### Restore Files

```bash
# List backups
ls /data/wise2/backups/daily/*.tar.gz

# Preview backup contents
BACKUP=/data/wise2/backups/daily/wise2-full-*.tar.gz
tar -tzf $BACKUP | head -20

# Extract to temporary location
mkdir -p /tmp/wise2-restore
tar -xzf $BACKUP -C /tmp/wise2-restore

# Restore to production
sudo tar -xzf $BACKUP -C /
```

### Emergency Recovery

```bash
# 1. Stop services
sudo systemctl stop wise2-api wise2-website wise2-dashboard

# 2. Verify backup integrity
sha256sum -c /data/wise2/backups/daily/wise2-full-*.sha256

# 3. Restore
gunzip < /data/wise2/backups/daily/wise2-db-*.sql.gz | psql -U wise2 -d wise2_prod
sudo tar -xzf /data/wise2/backups/daily/wise2-files-*.tar.gz -C /

# 4. Fix permissions
sudo chown -R wise2:wise2 /data/wise2/app /var/log/wise2

# 5. Start services
sudo systemctl start wise2-api wise2-website wise2-dashboard

# 6. Verify
sudo systemctl status wise2-api wise2-website wise2-dashboard
```

## Verification

### Verify Backup Integrity

```bash
# Check checksum
BACKUP=/data/wise2/backups/daily/wise2-full-*.tar.gz
sha256sum -c ${BACKUP}.sha256

# Test archive validity
tar -tzf $BACKUP > /dev/null && echo "Archive OK"

# Test SQL dump validity
SQLFILE=/data/wise2/backups/daily/wise2-db-*.sql.gz
gunzip -t $SQLFILE && echo "SQL OK"
```

### View Backup Manifest

```bash
# Show what's in backup
BACKUP=/data/wise2/backups/daily/wise2-full-*.tar.gz
cat ${BACKUP}.manifest

# List first 10 files
tar -tzf $BACKUP | head -10
```

## Monitoring

### Backup Status

```bash
# Quick status check
du -sh /data/wise2/backups/daily
find /data/wise2/backups/daily -name "wise2-*" | wc -l

# Detailed status
echo "=== Backup Status ==="
echo "Daily:   $(find /data/wise2/backups/daily -name "wise2-*" | wc -l) backups ($(du -sh /data/wise2/backups/daily | cut -f1))"
echo "Weekly:  $(find /data/wise2/backups/weekly -name "wise2-*" | wc -l) backups ($(du -sh /data/wise2/backups/weekly | cut -f1))"
echo "Monthly: $(find /data/wise2/backups/monthly -name "wise2-*" | wc -l) backups ($(du -sh /data/wise2/backups/monthly | cut -f1))"
echo "Total:   $(du -sh /data/wise2/backups | cut -f1)"
```

### Recent Errors

```bash
# Show recent backup errors
grep ERROR /var/log/wise2/backup-*.log

# Show last 5 error details
grep -A 5 ERROR /var/log/wise2/backup-*.log | tail -20
```

## Cron Jobs

### View Schedule

```bash
# Show current backup schedule
cat /etc/cron.d/wise2-backup

# Show next scheduled run
at -l

# View with human-readable times (if installed)
sudo crontab -u wise2 -l
```

### Manually Trigger Cron

```bash
# Test daily backup cron
sudo -u wise2 bash -c 'source /etc/wise2/backup.env && /usr/local/bin/wise2-backup full'

# Test weekly S3 backup cron
sudo -u wise2 bash -c 'source /etc/wise2/backup.env && /usr/local/bin/wise2-backup full --upload-s3'
```

## Configuration

### View Config

```bash
# Show configuration (masked)
sudo grep -v '^#' /etc/wise2/backup.env | grep -v '^$'

# Show specific setting
sudo grep DB_NAME /etc/wise2/backup.env
sudo grep SLACK_WEBHOOK /etc/wise2/backup.env
```

### Edit Config

```bash
# Edit backup configuration
sudo nano /etc/wise2/backup.env

# Test PostgreSQL connection with config
source /etc/wise2/backup.env
PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT version();"
```

## Troubleshooting

### Debug Backup Script

```bash
# Run with verbose output
bash -x /usr/local/bin/wise2-backup full 2>&1 | head -100

# Check script permissions
ls -la /usr/local/bin/wise2-backup

# Verify backup user
id wise2

# Test directories exist
ls -la /data/wise2/backups/daily
ls -la /var/log/wise2
```

### Check Dependencies

```bash
# PostgreSQL client
psql --version

# Compression utilities
tar --version
gzip --version

# AWS CLI (for S3)
aws --version

# Mail utility
which mail
```

### Database Troubleshooting

```bash
# Test PostgreSQL connection
psql -h localhost -U wise2 -d wise2_prod -c "SELECT version();"

# Check PostgreSQL status
sudo systemctl status postgresql

# View PostgreSQL logs
sudo tail -50 /var/log/postgresql/postgresql.log

# Check disk space on PostgreSQL
du -sh /var/lib/postgresql/
```

### Disk Space Issues

```bash
# Check available space
df -h /data

# Find large files
find /data/wise2/backups -type f -size +500M -exec du -h {} \;

# Remove oldest backups
find /data/wise2/backups/daily -mtime +30 -delete
```

## Performance

### Speed Up Backups

```bash
# Reduce compression (faster, larger files)
# In backup-pi.sh, change: gzip -9 to gzip -6

# Increase PostgreSQL maintenance memory
# In postgresql.conf: maintenance_work_mem = 512MB

# Check current backup time
grep "duration:" /var/log/wise2/backup-*.log

# Measure database size
psql -U wise2 -d wise2_prod -c "\l+ wise2_prod"
```

### Monitor Backup Progress

```bash
# Watch backup in progress
watch -n 5 'du -sh /data/wise2/backups/daily/*'

# Monitor disk I/O during backup
iostat -x 1 10

# Check PostgreSQL processes
ps aux | grep postgres | grep dump
```

## S3 Backups

### Setup S3

```bash
# Configure AWS CLI
aws configure

# Create S3 bucket
aws s3 mb s3://wise2-backups

# List S3 backups
aws s3 ls s3://wise2-backups/ --recursive

# Test S3 upload
aws s3 cp /path/to/file s3://wise2-backups/test.txt
```

### Restore from S3

```bash
# List available backups in S3
aws s3 ls s3://wise2-backups/wise2-backups/2026-07/

# Download backup from S3
aws s3 cp s3://wise2-backups/wise2-backups/2026-07/wise2-full-*.tar.gz /tmp/

# Verify S3 backup checksum
aws s3 cp s3://wise2-backups/wise2-backups/2026-07/wise2-full-*.sha256 /tmp/
sha256sum -c /tmp/wise2-full-*.sha256
```

## Email & Slack

### Test Email

```bash
# Send test email
echo "Backup test email" | mail -s "WISE² Backup Test" ops@wise2.dev

# Check mail queue
mailq

# View mail logs
tail -50 /var/log/mail.log
```

### Test Slack

```bash
# Send test message to Slack
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"WISE² Backup test message"}' \
  $SLACK_WEBHOOK
```

## Useful Commands

```bash
# Find all backups created in last 24 hours
find /data/wise2/backups/daily -mtime -1 -type f

# Sort backups by size
ls -lSh /data/wise2/backups/daily/ | head -10

# Get backup age in days
find /data/wise2/backups/daily -name "wise2-*" -mtime +n

# Archive old backups (move to cold storage)
find /data/wise2/backups/daily -mtime +90 -exec mv {} /data/wise2/backups/archive/ \;

# Calculate backup compression ratio
ORIGINAL=$(du -sb /data/wise2/app | cut -f1)
BACKUP=$(ls -l /data/wise2/backups/daily/wise2-files-*.tar.gz | awk '{print $5}' | tail -1)
echo "Compression ratio: $((ORIGINAL * 100 / BACKUP))%"
```

## Emergency Contacts

- DevOps Team: ops@wise2.dev
- Database Admin: dba@wise2.dev
- On-call: [on-call rotation]

## Backup Locations

| Type | Path |
|------|------|
| Daily | `/data/wise2/backups/daily/` |
| Weekly | `/data/wise2/backups/weekly/` |
| Monthly | `/data/wise2/backups/monthly/` |
| Logs | `/var/log/wise2/backup-*.log` |
| Config | `/etc/wise2/backup.env` |
| S3 | `s3://wise2-backups/wise2-backups/YYYY-MM/` |

---

**Print this cheatsheet and post it near your server for quick reference!**
