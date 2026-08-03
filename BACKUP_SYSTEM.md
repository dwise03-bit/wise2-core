# WISE² Raspberry Pi Backup System

A comprehensive, production-grade backup solution for WISE² Core deployment on Raspberry Pi.

## Features

- **Multiple Backup Types**
  - Full backups (database + application files)
  - Database-only backups (pg_dump SQL)
  - Files-only backups (application data + logs)

- **Automatic Retention Policies**
  - 30 daily backups
  - 12 weekly backups
  - 12 monthly backups
  - Automatic cleanup of old backups

- **Data Verification**
  - SHA256 checksums for integrity verification
  - Archive validation on backup completion
  - Dry-run restore testing

- **Multiple Storage Options**
  - Local storage at `/data/wise2/backups/`
  - Optional AWS S3 with intelligent tiering
  - Encrypted backups in S3 (AES256)

- **Notifications**
  - Email alerts on backup success/failure
  - Slack integration for team notifications
  - Backup manifests with metadata

- **Comprehensive Logging**
  - Detailed backup logs per day
  - Backup reports with metrics
  - Aggregated backup history

- **Scheduling**
  - Cron-based daily/weekly scheduling
  - Optional systemd timer integration
  - Configurable backup windows

## Quick Start

### 1. Install Prerequisites

```bash
# On Raspberry Pi:
sudo apt-get update
sudo apt-get install -y postgresql-client-13 tar gzip curl mailutils

# Optional (for S3 backups):
sudo apt-get install -y awscli
```

### 2. Run Installation Script

```bash
# Navigate to project
cd /path/to/wise2-core

# Run installer with sudo
sudo scripts/backup-install.sh
```

The installer will:
- Create backup directories
- Install backup script to `/usr/local/bin/wise2-backup`
- Copy configuration to `/etc/wise2/backup.env`
- Setup cron jobs for automatic backups
- Test PostgreSQL connection

### 3. Configure Backup Settings

```bash
# Edit configuration
sudo nano /etc/wise2/backup.env

# Important settings:
# - DB_PASS: PostgreSQL password
# - NOTIFY_EMAIL: Your email address
# - SLACK_WEBHOOK: Slack webhook URL (optional)
# - S3_BUCKET: AWS S3 bucket (optional)
```

### 4. Test Backup

```bash
# Run full backup manually
sudo -u wise2 /usr/local/bin/wise2-backup full

# Watch the logs
tail -f /var/log/wise2/backup-$(date +%Y-%m-%d).log

# Verify backup created
ls -lah /data/wise2/backups/daily/
```

## File Structure

```
scripts/
├── backup-pi.sh              # Main backup script (production)
├── backup-install.sh         # Installation automation
├── backup.env.example        # Configuration template
└── BACKUP_SETUP.md          # Detailed setup guide

BACKUP_SYSTEM.md             # This file
```

## Configuration

All configuration is in `/etc/wise2/backup.env`:

| Setting | Purpose | Example |
|---------|---------|---------|
| `DB_NAME` | PostgreSQL database | `wise2_prod` |
| `DB_USER` | PostgreSQL user | `wise2` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_PASS` | PostgreSQL password | `secure-password` |
| `NOTIFY_EMAIL` | Email for alerts | `ops@wise2.dev` |
| `SLACK_WEBHOOK` | Slack webhook URL | `https://hooks.slack.com/...` |
| `S3_ENABLED` | Enable S3 backups | `true` or `false` |
| `S3_BUCKET` | S3 bucket name | `wise2-backups` |
| `RETENTION_DAILY` | Daily backups to keep | `30` |
| `RETENTION_WEEKLY` | Weekly backups to keep | `12` |
| `RETENTION_MONTHLY` | Monthly backups to keep | `12` |

## Backup Scheduling

### Automatic Schedules (via cron)

Default schedules installed by `backup-install.sh`:

```
0 2 * * *     Daily backup at 2:00 AM UTC
0 2 * * 0     Weekly S3 backup Sunday 2:00 AM UTC
0 3 * * *     Cleanup/retention Sunday 3:00 AM UTC
```

Modify in `/etc/cron.d/wise2-backup` or with `crontab -e`.

### Manual Execution

```bash
# Full backup
/usr/local/bin/wise2-backup full

# Database only
/usr/local/bin/wise2-backup db-only

# Files only
/usr/local/bin/wise2-backup files-only

# With S3 upload
/usr/local/bin/wise2-backup full --upload-s3
```

## Backup Storage

### Local Storage

Backups stored at `/data/wise2/backups/`:

```
backups/
├── daily/          # Last 30 days
│   ├── wise2-full-20260723_020000.tar.gz
│   ├── wise2-full-20260723_020000.tar.gz.sha256
│   └── wise2-full-20260723_020000.tar.gz.manifest
├── weekly/         # Last 12 weeks
│   └── wise2-full-20260721_020000.tar.gz
├── monthly/        # Last 12 months
│   └── wise2-full-20260701_020000.tar.gz
└── postgres/       # Raw SQL dumps (compressed)
    └── wise2-20260723_020000.sql.gz
```

### S3 Remote Storage (Optional)

For cloud backup, configure S3:

```bash
# 1. Create S3 bucket
aws s3 mb s3://wise2-backups

# 2. Configure in /etc/wise2/backup.env
S3_ENABLED=true
S3_BUCKET=wise2-backups

# 3. Test S3 access
aws s3 ls s3://wise2-backups/

# 4. S3 backups are stored at:
# s3://wise2-backups/wise2-backups/YYYY-MM/wise2-*.tar.gz
```

## Restore Procedures

### Restore Database

```bash
# List available backups
ls -la /data/wise2/backups/daily/*.sql.gz

# Restore from most recent
BACKUP_FILE="/data/wise2/backups/daily/wise2-full-20260723_020000.sql.gz"

# Option 1: Restore to production database (dangerous!)
gunzip < ${BACKUP_FILE} | psql -U wise2 -d wise2_prod

# Option 2: Restore to test database (safe)
gunzip < ${BACKUP_FILE} | psql -U wise2 -d wise2_test
```

### Restore Application Files

```bash
# Extract backup to temporary location for inspection
BACKUP_FILE="/data/wise2/backups/daily/wise2-full-20260723_020000.tar.gz"
mkdir -p /tmp/wise2-restore
tar -xzf ${BACKUP_FILE} -C /tmp/wise2-restore

# Verify contents
ls -la /tmp/wise2-restore/data/wise2/app/

# Restore to production (after backup!)
sudo tar -xzf ${BACKUP_FILE} -C /
```

### Full Recovery (Complete System Restore)

```bash
# 1. Stop services
sudo systemctl stop wise2-api wise2-website wise2-dashboard

# 2. Verify backup integrity
sha256sum -c /data/wise2/backups/daily/wise2-full-*.sha256

# 3. Restore database
gunzip < /data/wise2/backups/daily/wise2-db-*.sql.gz | \
  psql -U wise2 -d wise2_prod -h localhost

# 4. Restore files
sudo tar -xzf /data/wise2/backups/daily/wise2-files-*.tar.gz -C /

# 5. Fix permissions
sudo chown -R wise2:wise2 /data/wise2/app /var/log/wise2

# 6. Start services
sudo systemctl start wise2-api wise2-website wise2-dashboard

# 7. Verify restoration
sudo systemctl status wise2-api wise2-website wise2-dashboard
```

## Monitoring & Maintenance

### Check Backup Status

```bash
# View latest backups
ls -lt /data/wise2/backups/daily/ | head -5

# Check disk usage
du -sh /data/wise2/backups/{daily,weekly,monthly}

# View today's backup log
tail -100 /var/log/wise2/backup-$(date +%Y-%m-%d).log
```

### Verify Backup Integrity

```bash
# Check backup file
BACKUP_FILE=/data/wise2/backups/daily/wise2-full-20260723_020000.tar.gz

# Verify checksum
sha256sum -c ${BACKUP_FILE}.sha256

# Test archive extraction (dry-run)
tar -tzf ${BACKUP_FILE} | head -20

# Test database backup validity
gunzip -t ${BACKUP_FILE%.*}.sql.gz
```

### Monitor Backup Performance

```bash
# Backup size trends
du -sh /data/wise2/backups/daily/* | sort -h

# Backup count
find /data/wise2/backups/daily -name "*.tar.gz" | wc -l

# Total storage used
du -sh /data/wise2/backups/
```

### Retention Policy Audit

```bash
# List all backups with dates
find /data/wise2/backups -name "wise2-*" -exec ls -lh {} \; | \
  awk '{print $6, $7, $8, $9}' | sort

# Count backups per tier
echo "Daily:   $(find /data/wise2/backups/daily -name "wise2-*" | wc -l)"
echo "Weekly:  $(find /data/wise2/backups/weekly -name "wise2-*" | wc -l)"
echo "Monthly: $(find /data/wise2/backups/monthly -name "wise2-*" | wc -l)"
```

## Troubleshooting

### Backup Script Won't Run

```bash
# Check permissions
ls -la /usr/local/bin/wise2-backup

# Verify configuration
source /etc/wise2/backup.env
echo "DB_NAME=$DB_NAME, DB_USER=$DB_USER"

# Test with verbose output
bash -x /usr/local/bin/wise2-backup full 2>&1 | head -50
```

### Database Connection Error

```bash
# Test PostgreSQL connection
psql -h localhost -U wise2 -d wise2_prod -c "SELECT version();"

# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify credentials in config
sudo cat /etc/wise2/backup.env | grep DB_
```

### Disk Space Issues

```bash
# Check available disk space
df -h /data

# Show backup sizes
du -sh /data/wise2/backups/{daily,weekly,monthly}

# Remove old backups manually
find /data/wise2/backups/daily -mtime +30 -delete
```

### Email Notifications Not Working

```bash
# Test mail command
echo "Test message" | mail -s "Test" ops@wise2.dev

# Check mail service
sudo systemctl status postfix  # or sendmail, exim4, etc.

# View mail logs
sudo tail -50 /var/log/mail.log
```

### S3 Upload Failures

```bash
# Check AWS credentials
aws configure list

# Test S3 access
aws s3 ls s3://wise2-backups/ --region us-east-1

# Check bucket permissions
aws s3api head-bucket --bucket wise2-backups
```

## Performance Tuning

### Database Backup Speed

```bash
# Increase PostgreSQL maintenance memory
# Edit: /etc/postgresql/13/main/postgresql.conf
# Set: maintenance_work_mem = 512MB

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Compression Tuning

Modify backup script compression level:

```bash
# Fast compression (size vs speed trade-off)
gzip -6 < input > output.gz

# Maximum compression (slower but smaller)
gzip -9 < input > output.gz
```

### S3 Upload Speed

```bash
# Use parallel uploads (if supported)
aws s3 cp large-file.tar.gz s3://wise2-backups/ --expected-size 1000000000 --metadata "source=wise2-backup"
```

## Security Best Practices

1. **Secure Configuration**
   - Store `/etc/wise2/backup.env` with mode 600
   - Use `.pgpass` file for database credentials
   - Never hardcode passwords in cron jobs

2. **Encrypted Backups**
   - Use S3 server-side encryption (SSE-S3)
   - Enable S3 versioning for accidental deletes
   - Consider S3 Object Lock for compliance

3. **Access Control**
   - Restrict backup directories to `wise2` user
   - Use IAM roles instead of access keys (AWS)
   - Rotate AWS credentials regularly

4. **Monitoring**
   - Log all backup operations
   - Alert on backup failures
   - Regularly test restore procedures
   - Keep backup logs for audit trail

## Advanced Configuration

### Point-in-Time Recovery (PITR)

Enable PostgreSQL WAL archiving for PITR:

```bash
# Configure in postgresql.conf:
archive_mode = on
archive_command = 'cp %p /data/wise2/wal-archive/%f'

# Create archive directory
sudo mkdir -p /data/wise2/wal-archive
sudo chown postgres:postgres /data/wise2/wal-archive
sudo chmod 700 /data/wise2/wal-archive

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Incremental Backups

For faster daily backups, implement incremental strategy:

```bash
# Backup only files changed in last 24 hours
tar -czf wise2-incremental-$(date +%Y%m%d).tar.gz \
  --newer-mtime-than /data/wise2/backups/last-full.timestamp \
  /data/wise2/app
```

### Off-site Replication

Mirror backups to secondary location:

```bash
# Using rsync to another server
rsync -av --delete /data/wise2/backups/ \
  backup-user@backup-server:/backups/wise2/

# Using AWS S3 cross-region replication
aws s3 sync s3://wise2-backups s3://wise2-backups-backup \
  --region us-east-1 --source-region us-east-1
```

## SLA & Compliance

### Backup SLA

- **RPO (Recovery Point Objective)**: 24 hours
- **RTO (Recovery Time Objective)**: 4 hours
- **Frequency**: Daily backups at 02:00 UTC
- **Retention**: 30 daily, 12 weekly, 12 monthly

### Compliance

- **GDPR**: Backups include PII (encrypt in transit/rest)
- **HIPAA**: Archive backups to S3 Glacier after 90 days
- **SOC2**: Log all backup operations, test restores quarterly

## References

- [BACKUP_SETUP.md](scripts/BACKUP_SETUP.md) - Detailed setup guide
- [PostgreSQL pg_dump](https://www.postgresql.org/docs/13/app-pgdump.html)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [systemd Timers](https://www.freedesktop.org/software/systemd/man/systemd.timer.html)

## Support

For issues or questions:

1. Check logs: `/var/log/wise2/backup-*.log`
2. Run diagnostic: `sudo scripts/backup-install.sh --check-only`
3. Review [BACKUP_SETUP.md](scripts/BACKUP_SETUP.md) troubleshooting section
4. Contact: ops@wise2.dev

---

**Last Updated**: 2026-07-23  
**Version**: 1.0  
**Maintainer**: WISE² DevOps
