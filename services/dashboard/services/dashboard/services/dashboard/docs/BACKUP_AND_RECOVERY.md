# Backup and Recovery — Wise² Core

Disaster recovery procedures and backup management.

---

## Backup Strategy

### Overview

- **Frequency**: Daily at 2 AM UTC
- **Retention**: 30 days rolling window
- **Components Backed Up**:
  - PostgreSQL database (full dump)
  - Redis RDB snapshot
  - Configuration files
- **Location**: `/backups/production/`
- **Storage**: Local disk (recommend off-site replication)

### Recovery Time Objectives (RTO)

| Scenario | RTO | RPO |
|----------|-----|-----|
| Single file loss | <5 min | <1 hour |
| Database corruption | <30 min | <1 hour |
| Complete system failure | <1 hour | <4 hours |

---

## Backup Procedures

### Automatic Backup

Backup runs automatically every day at 2 AM UTC via cron.

**Verify backup is scheduled**:
```bash
crontab -l | grep backup

# Expected output:
# 0 2 * * * /home/wise2-core/infrastructure/scripts/backup.sh
```

### Manual Backup

Run backup on-demand:

```bash
./infrastructure/scripts/backup.sh /backups/production/manual

# Output:
# Backing up PostgreSQL...
# Backing up Redis...
# Compressing backup...
# Verification: OK
# Backup saved to: /backups/production/manual/wise2_backup_2026-07-07.tar.gz
```

### Backup Contents

Each backup contains:

```
wise2_backup_2026-07-07.tar.gz
├── postgresql/
│   ├── wise2_core.dump        # PostgreSQL dump
│   └── restore_db.sql          # Database creation script
├── redis/
│   └── dump.rdb                # Redis snapshot
├── config/
│   ├── .env.backup             # Environment variables
│   └── docker-compose.yml      # Service configuration
└── metadata.json               # Backup metadata
```

### Backup Verification

Verify backup integrity:

```bash
# List recent backups
ls -lh /backups/production/ | head -10

# Verify backup is readable
tar -tzf /backups/production/wise2_backup_2026-07-07.tar.gz | head -10

# Expected: File listing output without errors

# Check backup size (should be 50-500MB)
du -sh /backups/production/wise2_backup_2026-07-07.tar.gz
```

---

## Database Backup Details

### PostgreSQL Backup

**Type**: Full database dump (SQL format)
**Size**: ~50-200MB depending on data
**Time**: ~5 minutes
**Compression**: gzip

### Backup Command

```bash
pg_dump -U postgres -d wise2_core -F c -b -v -f wise2_core.dump

# Options:
# -U postgres       : User
# -d wise2_core     : Database
# -F c              : Custom format (compressed)
# -b                : Include blobs
# -v                : Verbose
# -f filename       : Output file
```

### What's Included

- All tables and data
- Indexes
- Constraints
- Sequences
- Views
- Stored procedures (if any)

### What's NOT Included

- Users/roles (separate backup)
- System databases (not needed)

---

## Redis Backup Details

### Redis Backup

**Type**: RDB snapshot (binary format)
**Size**: ~5-50MB
**Time**: <1 second
**Compression**: gzip

### Backup Command

```bash
redis-cli -a $REDIS_PASSWORD BGSAVE

# Creates: /var/lib/redis/dump.rdb
```

### What's Included

- All keys and values
- Database index
- TTL for keys with expiration

### What's NOT Included

- AOF (append-only file)
- Replication data

---

## Recovery Procedures

### Single File Recovery

**Scenario**: User deletes a file by mistake

**Recovery**: Restore from previous backup

```bash
# Identify file location in backup
tar -tzf /backups/production/wise2_backup_2026-07-07.tar.gz | grep filename

# Extract single file
tar -xzf /backups/production/wise2_backup_2026-07-07.tar.gz path/to/file

# Restore to original location
cp file /home/wise2-core/path/to/
```

### Database Recovery

**Scenario**: Database corruption or data loss

**Recovery Steps**:

#### Step 1: Stop Services

```bash
docker-compose stop api admin-dashboard dashboard bot worker
```

#### Step 2: Identify Backup

```bash
# List available backups
ls -lh /backups/production/

# Choose backup to restore from (usually most recent)
# wise2_backup_2026-07-07.tar.gz
```

#### Step 3: Extract Backup

```bash
cd /tmp
tar -xzf /backups/production/wise2_backup_2026-07-07.tar.gz
```

#### Step 4: Stop Database

```bash
docker-compose stop postgres
```

#### Step 5: Drop Corrupted Database

```bash
docker-compose exec postgres psql -U postgres -c "DROP DATABASE wise2_core;"
```

#### Step 6: Restore Database

```bash
# Extract dump file
cd /tmp/backup/postgresql

# Restore
docker-compose exec postgres pg_restore -U postgres -d postgres -C -F c wise2_core.dump

# Wait for completion (may take several minutes)
```

#### Step 7: Restore Redis (if needed)

```bash
# Stop Redis
docker-compose stop redis

# Replace dump file
cp /tmp/backup/redis/dump.rdb /var/lib/redis/dump.rdb

# Start Redis
docker-compose start redis
```

#### Step 8: Verify

```bash
# Check database
docker-compose exec postgres psql -U postgres -d wise2_core -c "SELECT COUNT(*) FROM users;"

# Expected: Number of user records

# Check Redis
docker-compose exec redis redis-cli -a $REDIS_PASSWORD dbsize

# Expected: Number of keys
```

#### Step 9: Restart Services

```bash
docker-compose start api admin-dashboard dashboard bot worker

# Wait for startup
sleep 30

# Verify health
curl http://localhost:3000/health
```

### Complete System Recovery

**Scenario**: Total data loss or complete system failure

**Recovery Steps**:

#### 1. Provision New Infrastructure

```bash
# Create new Raspberry Pi or server
# Install Docker and Docker Compose
# Deploy wise2-core repository
```

#### 2. Restore Database

```bash
# Follow "Database Recovery" steps above
```

#### 3. Restore Configuration

```bash
# Extract config from backup
tar -xzf /backups/production/wise2_backup_2026-07-07.tar.gz config/

# Copy to new system
cp config/.env.backup /home/wise2-core/.env
```

#### 4. Start Services

```bash
docker-compose up -d
```

#### 5. Verify

```bash
# Check all services
docker-compose ps

# Health checks
curl http://localhost:3000/health
curl http://localhost:3001/

# Database
docker-compose exec postgres psql -U postgres -d wise2_core -c "SELECT COUNT(*) FROM users;"
```

#### 6. Restore External Integrations

- Reconfigure SSL certificates
- Update DNS records
- Reconfigure GitHub webhooks
- Reconfigure Discord bot
- Reconfigure monitoring

---

## Testing Backups

### Monthly Restoration Test

**Frequency**: First Friday of each month

**Purpose**: Verify backups are usable

**Procedure**:

```bash
# 1. Take recent backup
./infrastructure/scripts/backup.sh /backups/test

# 2. Create temporary restore database
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE wise2_test;"

# 3. Restore to test database
cd /backups/test
tar -xzf wise2_backup_*.tar.gz
docker-compose exec postgres pg_restore -U postgres -d wise2_test -F c ./postgresql/wise2_core.dump

# 4. Verify data
docker-compose exec postgres psql -U postgres -d wise2_test -c "SELECT COUNT(*) FROM users;"

# 5. Compare with production
docker-compose exec postgres psql -U postgres -d wise2_core -c "SELECT COUNT(*) FROM users;"

# Should match

# 6. Cleanup
docker-compose exec postgres psql -U postgres -c "DROP DATABASE wise2_test;"
```

---

## Backup Retention Policy

### Backup Schedule

- **Daily backups**: Keep 30 days
- **Weekly backups**: Keep 12 weeks (optional)
- **Monthly backups**: Keep 12 months (optional)

### Cleanup Script

Automatic cleanup (included in backup.sh):

```bash
# Remove backups older than 30 days
find /backups/production -name "wise2_backup_*.tar.gz" -mtime +30 -delete

# Log old backups being removed
find /backups/production -name "wise2_backup_*.tar.gz" -mtime +30 -exec ls -lh {} \;
```

### Storage Calculation

```bash
# Daily backup size: ~100MB
# 30 days × 100MB = 3GB

# Recommended storage: 10GB (allow buffer)
# Check: df -h /backups/

# Alert if <5GB free
```

---

## Off-Site Backup (Recommended)

### Setup Sync to Cloud

**Option 1: AWS S3**

```bash
# Install AWS CLI
apt-get install awscli

# Configure credentials
aws configure

# Create sync script
cat > /home/wise2-core/infrastructure/scripts/sync-to-s3.sh << 'EOF'
#!/bin/bash
aws s3 sync /backups/production/ s3://wise2-backups/ --delete
EOF

# Schedule daily (after local backup)
crontab -e
# Add: 30 2 * * * /home/wise2-core/infrastructure/scripts/sync-to-s3.sh
```

**Option 2: Google Cloud Storage**

```bash
# Install gsutil
curl https://sdk.cloud.google.com | bash

# Authenticate
gcloud auth login

# Create sync script
gsutil -m cp -r /backups/production/* gs://wise2-backups/
```

---

## Disaster Recovery Plan

### Recovery Priority

1. **Database** (Critical data)
2. **Redis** (Sessions, cache)
3. **Code** (From GitHub, not backup)
4. **Configuration** (From backup)

### RTO by Scenario

| Scenario | Duration | Process |
|----------|----------|---------|
| Service restart | 5 min | docker-compose restart |
| Service re-deploy | 15 min | docker-compose down/up |
| Database restore | 30 min | Extract, restore, verify |
| Full system | 1 hour | New infrastructure + restore |
| Off-site recovery | 2-4 hours | Provision + download backup + restore |

### Communication Plan

**When disaster occurs**:

1. **Assess**: Determine scope of failure
2. **Notify**: Alert team and management
3. **Activate**: Start recovery procedure
4. **Update**: Status page every 30 minutes
5. **Communicate**: Customer updates when recovered

---

## Backup Checklist

Before going live:

- [ ] Backup script deployed and tested
- [ ] Cron schedule verified
- [ ] Backup location has sufficient space
- [ ] Backup retention policy configured
- [ ] Monthly restoration test scheduled
- [ ] Off-site backup configured (optional)
- [ ] Team trained on restore procedures
- [ ] Recovery procedures documented
- [ ] Emergency contacts configured
- [ ] Disaster recovery plan reviewed

---

## Troubleshooting

### Backup Fails

**Symptoms**: Backup doesn't complete

**Diagnosis**:
```bash
# Check script logs
tail -50 /var/log/backup.log

# Check disk space
df -h

# Check database connectivity
docker-compose exec postgres pg_isready -U postgres
```

**Solution**:
- Ensure >5GB disk free
- Verify database is running
- Check database connection string
- Retry backup manually

### Restore Fails

**Symptoms**: Restore produces errors

**Diagnosis**:
```bash
# Check backup file
tar -tzf backup.tar.gz

# Check PostgreSQL version compatibility
docker-compose exec postgres psql --version

# Compare with backup
tar -tzf backup.tar.gz | grep -i version
```

**Solution**:
- Ensure PostgreSQL versions match
- Try restoring to test database first
- Check for database ownership issues

### Backup Storage Full

**Symptoms**: No disk space

**Diagnosis**:
```bash
# Check usage
df -h /backups/

# Find largest backups
du -sh /backups/production/* | sort -rh | head -10
```

**Solution**:
- Delete backups older than 30 days manually
- Expand storage
- Configure off-site backup

---

**Backup and Recovery Version**: 1.0
**Last Updated**: 2026-07-07
**Owner**: DevOps / Infrastructure Team
**Review Frequency**: Quarterly
