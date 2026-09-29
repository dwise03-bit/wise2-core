# WISE² Disaster Recovery Guide

**Status**: Production Ready  
**Last Updated**: 2026-07-23  
**Version**: 1.0

## Overview

The `recover-pi.sh` script provides comprehensive disaster recovery capabilities for the WISE² Raspberry Pi deployment. It safely restores the system from backups with multiple validation layers, confirmations, and health checks.

---

## Quick Start

### Interactive Recovery (Recommended for First-Time Use)

```bash
cd /Users/danielwise/Projects/wise2-core
./scripts/recover-pi.sh
```

This launches an interactive menu that:
1. Lists all available backups with details
2. Allows you to select a backup to restore
3. Shows backup metadata (date, size, type, verification status)
4. Offers recovery options (full, database only, files only)
5. Creates pre-recovery backups for safety
6. Performs recovery with confirmations
7. Runs health checks
8. Sends notifications

### List Available Backups

```bash
./scripts/recover-pi.sh list
```

Output:
```
=========================================
Available Backups
=========================================

daily:
----------------------------------------
  [0  ] wise2-full-20260723_120000.tar  2.3G  Type: full      Date: 2026-07-23 12:00:00
         Manifest: ✓  Checksum: ✓
  [1  ] wise2-db-20260722_020000.sql.g  156M  Type: database  Date: 2026-07-22 02:00:00
         Manifest: ✓  Checksum: ✓
  [2  ] wise2-files-20260721_020000.tar 1.8G  Type: files     Date: 2026-07-21 02:00:00
         Manifest: ✓  Checksum: ✓
```

### Restore Specific Backup

```bash
./scripts/recover-pi.sh restore /data/wise2/backups/daily/wise2-full-20260723_120000.tar.gz
```

### Check System Status

```bash
./scripts/recover-pi.sh status
```

---

## Backup Types

The script supports restoration of three backup types:

### 1. Full Backup (Complete System Recovery)

**Filename**: `wise2-full-YYYYMMDD_HHMMSS.tar.gz`

Contains:
- Complete PostgreSQL database dump
- All application files and configuration
- Recent logs
- Checksums and manifest

**When to use**: System-wide disaster (corruption, data loss, malware)

**Recovery time**: 15-30 minutes depending on backup size

**Example**:
```bash
./scripts/recover-pi.sh
# Select backup type "Full Recovery"
```

### 2. Database-Only Backup

**Filename**: `wise2-db-YYYYMMDD_HHMMSS.sql.gz`

Contains:
- PostgreSQL database schema
- All tables and data
- Checksums

**When to use**: Data corruption, accidental deletions, database schema issues

**Recovery time**: 5-10 minutes

**Example**:
```bash
./scripts/recover-pi.sh
# Select backup type "Database Only"
```

### 3. Files-Only Backup

**Filename**: `wise2-files-YYYYMMDD_HHMMSS.tar.gz`

Contains:
- Application files and config
- Log archives (7 days old)
- Checksums

**When to use**: Configuration changes, missing files, corrupted application data

**Recovery time**: 3-5 minutes

**Example**:
```bash
./scripts/recover-pi.sh
# Select backup type "Files Only"
```

---

## Safety Features

### Pre-Recovery Backup

Before any recovery operation:
1. Script creates backup of current database state
2. Stored in `/data/wise2/backups/pre-recovery-backups/`
3. Labeled with timestamp for easy reference
4. Can be used to restore if recovery goes wrong

**Location of pre-recovery backups**:
```bash
ls -lah /data/wise2/backups/pre-recovery-backups/
```

**Restore pre-recovery backup if needed**:
```bash
gunzip < /data/wise2/backups/pre-recovery-backups/pre-recovery-20260723_140000.tar.gz | \
  psql -U wise2 -d wise2_prod
```

### State Snapshot

Before recovery, script captures:
- Current database state (tables, schemas)
- File listing and counts
- Service status
- Docker status
- Disk usage

**Location**: `/var/log/wise2/recovery/pre-recovery-state-YYYYMMDD_HHMMSS.txt`

### Verification Layers

1. **Checksum Verification**: SHA256 checksums verified before restore
2. **Archive Integrity**: TAR/GZIP integrity tested
3. **File Count Validation**: File counts compared before/after
4. **Database Table Count**: Table count verified after recovery
5. **Connection Test**: Database connectivity verified

### Multi-Step Confirmations

Each destructive operation requires explicit confirmation:

```
WARNING: Drop and recreate database wise2_prod? This will DELETE all current data!

Type 'yes' to confirm or 'no' to cancel:
```

Type exactly `yes` to proceed.

### Service Management

1. **Stop services** before recovery to prevent conflicts
2. **Wait** for services to fully stop (2 seconds)
3. **Perform recovery** with database/files
4. **Restart services** in correct order
5. **Wait** for services to start (3 seconds)
6. **Verify** each service is running

---

## Recovery Workflow

### Full Recovery Flow

```
1. List backups → User selects backup
2. Verify backup → Checksum, integrity checks
3. Confirm selection → Show backup details
4. Confirm recovery → Multiple confirmations
5. Create pre-recovery backup → Safety backup created
6. Create state snapshot → Current state recorded
7. Stop services → Graceful shutdown
8. Extract full backup → Database + files extracted
9. Drop/recreate database → Clean slate for import
10. Restore database → pg_dump import
11. Restore files → TAR extraction
12. Fix permissions → Verify file ownership
13. Restart services → Bring system online
14. Health checks → Verify all systems operational
15. Send notification → Alert team of success
16. Log recovery → Detailed audit trail
```

### Database-Only Recovery Flow

```
1. [same as above: 1-4]
2. Create pre-recovery backup
3. Create state snapshot
4. Stop services
5. Drop/recreate database (ONLY)
6. Restore database (ONLY)
7. Restart services
8. Health checks
9. Send notification
10. Log recovery
```

### Files-Only Recovery Flow

```
1. [same as above: 1-4]
2. Create state snapshot
3. Stop services
4. Extract files from backup
5. Fix file permissions
6. Restart services
7. Health checks
8. Send notification
9. Log recovery
```

---

## Health Checks

After recovery, the script runs automated health checks:

```
Health Checks
=============

Database connection: ✓ OK
Database tables: ✓ OK (127 tables)
Application files: ✓ OK (1,847 files)
Services: ✓ OK (3/3 running)
Disk space: ✓ OK (65% used)
```

**If health checks fail**:
1. Check recovery logs: `/var/log/wise2/recovery/recovery-YYYY-MM-DD.log`
2. Verify database: `psql -U wise2 -d wise2_prod -c "\dt"`
3. Check services: `systemctl status wise2-api`
4. Review pre-recovery state: Check pre-recovery backup

---

## Logging

All recovery operations are logged in detail.

### Log Location

- **Recovery logs**: `/var/log/wise2/recovery/recovery-YYYY-MM-DD.log`
- **State snapshots**: `/var/log/wise2/recovery/pre-recovery-state-YYYYMMDD_HHMMSS.txt`

### Log Example

```
[2026-07-23 14:30:15] [INFO] ==========================================
[2026-07-23 14:30:15] [INFO] WISE² Disaster Recovery Started
[2026-07-23 14:30:15] [INFO] Command: interactive
[2026-07-23 14:30:15] [INFO] Timestamp: 20260723_143015
[2026-07-23 14:30:15] [INFO] ==========================================
[2026-07-23 14:30:16] [INFO] Listing available backups...
[2026-07-23 14:30:17] [INFO] Verifying backup: wise2-full-20260723_120000.tar.gz
[2026-07-23 14:30:17] [SUCCESS] Checksum verification passed
[2026-07-23 14:30:18] [SUCCESS] Archive integrity test passed
[2026-07-23 14:30:20] [INFO] Creating pre-recovery backup of current state...
[2026-07-23 14:30:45] [SUCCESS] Pre-recovery backup created
[2026-07-23 14:30:46] [INFO] Creating pre-recovery state snapshot...
[2026-07-23 14:30:47] [INFO] State snapshot saved
[2026-07-23 14:30:48] [INFO] Stopping services...
[2026-07-23 14:30:52] [SUCCESS] Services stopped
[2026-07-23 14:30:53] [INFO] Starting full recovery...
[2026-07-23 14:31:20] [SUCCESS] Full recovery completed
```

### View Logs

```bash
# View today's recovery log
tail -f /var/log/wise2/recovery/recovery-2026-07-23.log

# View latest state snapshot
cat /var/log/wise2/recovery/pre-recovery-state-*.txt | tail -50

# View all recovery logs
ls -lah /var/log/wise2/recovery/
```

---

## Notifications

The script sends notifications on completion (success or failure).

### Email Notifications

Sent to: `dwise03@gmail.com` (configured in environment)

**Success email**:
```
Subject: WISE² Recovery RECOVERY_SUCCESS

WISE² Disaster Recovery - SUCCESS

Hostname: pi-server
Date: 2026-07-23
Time: 14:35:22
Status: COMPLETED

Recovery Details:
Full recovery completed from wise2-full-20260723_120000.tar.gz

All systems operational. Please verify data integrity.

Recovery log: /var/log/wise2/recovery/recovery-2026-07-23.log
```

**Failure email**:
```
Subject: WISE² Recovery RECOVERY_FAILED

WISE² Disaster Recovery - FAILED

Hostname: pi-server
Date: 2026-07-23
Time: 14:35:22
Status: ERROR

Error Details:
[Error message]

URGENT: Manual intervention required!
Recovery log: /var/log/wise2/recovery/recovery-2026-07-23.log
```

### Slack Notifications

Set `SLACK_WEBHOOK` environment variable:

```bash
export SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
./scripts/recover-pi.sh
```

Notifications appear in Slack with recovery status, hostname, and timestamp.

---

## Advanced Usage

### Non-Interactive Recovery (Automated)

```bash
# Restore with automatic confirmations (use with caution!)
SKIP_CONFIRMATIONS=true ./scripts/recover-pi.sh restore /path/to/backup.tar.gz
```

**Warning**: Skipping confirmations can cause data loss if wrong backup is selected.

### Verbose Output

```bash
# Show detailed progress
VERBOSE=true ./scripts/recover-pi.sh

# Pipe output to file
./scripts/recover-pi.sh 2>&1 | tee recovery-session.log
```

### Dry Run (Preview Only)

```bash
# Show what would be done without making changes
DRY_RUN=true ./scripts/recover-pi.sh
```

### Custom Configuration

```bash
# Override database settings
export DB_NAME="custom_database"
export DB_USER="custom_user"
export DB_HOST="db.example.com"

./scripts/recover-pi.sh
```

### Email Notifications

```bash
# Enable email notifications
export NOTIFY_EMAIL="team@example.com"

./scripts/recover-pi.sh
```

---

## Troubleshooting

### Issue: "Backup file not found"

**Cause**: Backup path is incorrect or backup was deleted

**Solution**:
1. List backups: `./scripts/recover-pi.sh list`
2. Verify backup exists: `ls -lah /data/wise2/backups/`
3. Check retention policy in `backup-pi.sh`

### Issue: "Checksum verification failed"

**Cause**: Backup file is corrupted

**Solution**:
1. Try different backup: `./scripts/recover-pi.sh list`
2. Use `--skip-verification` if backup is critical
3. Check disk space: `df -h`
4. Review backup logs: `/var/log/wise2/backup-*.log`

### Issue: "Database connection failed"

**Cause**: PostgreSQL not running or credentials incorrect

**Solution**:
1. Check PostgreSQL status: `systemctl status postgresql`
2. Verify credentials: `echo $DB_PASS`
3. Test connection: `psql -U wise2 -d postgres -c "SELECT 1"`
4. Restart PostgreSQL: `systemctl restart postgresql`

### Issue: "File extraction failed"

**Cause**: Insufficient disk space or corrupted TAR

**Solution**:
1. Check disk space: `df -h /data`
2. Test TAR integrity: `tar -tzf /path/to/backup.tar.gz | head`
3. Use files-only recovery instead of full
4. Delete old backups to free space

### Issue: "Services failed to restart"

**Cause**: Service dependencies or ports already in use

**Solution**:
1. Check service status: `systemctl status wise2-api`
2. Check logs: `journalctl -u wise2-api -n 50`
3. Manual restart: `systemctl restart wise2-api`
4. Check port conflicts: `lsof -i :3000`

### Issue: "Health checks failed"

**Cause**: Partial recovery or corrupted data

**Solution**:
1. Review health check output
2. Restore pre-recovery backup: See "Pre-Recovery Backup" section
3. Contact support with logs: `/var/log/wise2/recovery/`

---

## Emergency Recovery (Manual)

If the script fails and automatic recovery is needed:

### Manual Database Recovery

```bash
# Find backup file
BACKUP_FILE="/data/wise2/backups/daily/wise2-db-20260723_120000.sql.gz"

# Stop application services
systemctl stop wise2-api

# Drop and recreate database
sudo -u postgres psql -d postgres -c "DROP DATABASE IF EXISTS wise2_prod;"
sudo -u postgres psql -d postgres -c "CREATE DATABASE wise2_prod WITH OWNER wise2;"

# Restore from backup
gunzip < "$BACKUP_FILE" | PGPASSWORD=$DB_PASS psql -h localhost -U wise2 -d wise2_prod

# Verify
PGPASSWORD=$DB_PASS psql -h localhost -U wise2 -d wise2_prod -c "\dt"

# Restart services
systemctl start wise2-api
```

### Manual File Recovery

```bash
# Find backup file
BACKUP_FILE="/data/wise2/backups/daily/wise2-files-20260723_120000.tar.gz"

# Stop application services
systemctl stop wise2-api

# Extract files
tar -xzf "$BACKUP_FILE" -C /

# Fix permissions
chown -R wise2:wise2 /data/wise2/app
chmod -R u+rw,g+r,o-rwx /data/wise2/app

# Restart services
systemctl start wise2-api
```

---

## Recovery Scenarios

### Scenario 1: Complete Server Failure

**Situation**: Server crashed, need full restore

**Steps**:
1. Boot server, SSH in
2. Run: `./scripts/recover-pi.sh`
3. Select "List" to see available backups
4. Choose most recent full backup
5. Select "Full Recovery"
6. Confirm multiple times
7. Wait for completion (15-30 min)
8. Health checks run automatically
9. Verify with: `./scripts/recover-pi.sh status`

### Scenario 2: Accidental Data Deletion

**Situation**: Important database records deleted

**Steps**:
1. Stop application: `systemctl stop wise2-api`
2. Run: `./scripts/recover-pi.sh`
3. Select backup from BEFORE deletion
4. Choose "Database Only"
5. This restores database to previous state
6. Verify restored data
7. Restart application

### Scenario 3: Configuration Changes Gone Wrong

**Situation**: Bad config changes broke the app

**Steps**:
1. Run: `./scripts/recover-pi.sh`
2. Choose backup from BEFORE config changes
3. Select "Files Only"
4. This restores config to known-good state
5. Don't restore database (data is fine)
6. Restart and test

### Scenario 4: Point-in-Time Recovery

**Situation**: Need data from specific date/time

**Steps**:
1. Run: `./scripts/recover-pi.sh list` to see all backups
2. Review backup dates/times
3. Select backup from desired time
4. Perform recovery
5. Use pre-recovery backup if needed to restore to different time

---

## Performance Considerations

### Backup/Restore Sizes

| Backup Type | Typical Size | Restore Time |
|-------------|------------|--------------|
| Full | 2-4 GB | 15-30 min |
| Database | 150-300 MB | 5-10 min |
| Files | 1-2 GB | 3-5 min |

### Disk Space Required

- **Minimum**: 1.5x largest backup size
- **Recommended**: 3x largest backup size (for pre-recovery backup + original)

### Example

If full backup is 2.4 GB:
- Minimum disk: 3.6 GB available
- Recommended disk: 7.2 GB available

Check disk space:
```bash
df -h /data/wise2
```

---

## Backup Strategy

### Recommended Schedule

```bash
# Daily full backup
0 2 * * * /home/dwise/wise2-core/scripts/backup-pi.sh full

# Weekly S3 upload (Friday)
0 2 * * 5 /home/dwise/wise2-core/scripts/backup-pi.sh full --upload-s3
```

### Retention Policy (from backup-pi.sh)

- **Daily**: Keep 30 backups (30 days)
- **Weekly**: Keep 12 backups (3 months)
- **Monthly**: Keep 12 backups (1 year)

### Testing Recovery

Test recovery regularly (quarterly minimum):

```bash
# List backups
./scripts/recover-pi.sh list

# Select oldest backup
./scripts/recover-pi.sh restore /path/to/old/backup.tar.gz

# Verify all systems operational
./scripts/recover-pi.sh status

# Document any issues
```

---

## Security Considerations

### Pre-Recovery Backups

- Stored in `/data/wise2/backups/pre-recovery-backups/`
- Contain unencrypted database dumps
- Should be encrypted if sensitive data
- Clean up old pre-recovery backups monthly

### Permissions

- Script must run as root or user with sudo
- Database password should be in environment or .pgpass
- Backup files should be readable only by authorized users

```bash
# Set restrictive permissions on backups
chmod 700 /data/wise2/backups
chmod 600 /data/wise2/backups/*
```

### Audit Trail

All recovery operations logged to:
- `/var/log/wise2/recovery/recovery-*.log` (detailed)
- `/var/log/wise2/recovery/pre-recovery-state-*.txt` (snapshots)
- Email/Slack notifications (summary)

### Environment Variables

**Never hardcode in script**:
```bash
# Instead, use environment variables
export DB_PASS="your_password"
export NOTIFY_EMAIL="team@example.com"
export SLACK_WEBHOOK="https://hooks.slack.com/services/..."

./scripts/recover-pi.sh
```

---

## References

- **Backup Script**: `/scripts/backup-pi.sh`
- **Database Backup**: `/scripts/backup-database.sh`
- **Deployment Guide**: `/DEPLOYMENT_GUIDE.md`
- **Production Checklist**: `/PRODUCTION_CHECKLIST.md`

---

## Support

For recovery issues:

1. Check recovery logs: `/var/log/wise2/recovery/recovery-*.log`
2. Run health check: `./scripts/recover-pi.sh status`
3. Review this guide for troubleshooting
4. Contact dwise03@gmail.com with logs attached

---

**Last Updated**: 2026-07-23  
**Version**: 1.0.0  
**Owner**: WISE² Team
