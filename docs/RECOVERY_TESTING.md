# WISE² Disaster Recovery Testing & Validation

**How to test and verify the disaster recovery script works**

---

## Overview

Regular recovery testing ensures:
- Backups are valid and restorable
- Recovery script functions correctly
- Team knows how to perform recovery
- No surprises during actual disaster
- RTO/RPO targets are met

---

## Testing Schedule

| Frequency | Type | Duration | Effort |
|-----------|------|----------|--------|
| Monthly | Backup verification | 5 min | Low |
| Quarterly | Database-only recovery | 30 min | Medium |
| Quarterly | Files-only recovery | 30 min | Medium |
| Annually | Full recovery test | 2 hours | High |

---

## Test 1: Monthly - Backup Verification (5 minutes)

**Objective**: Verify backups exist and have valid checksums

**Steps**:

```bash
cd /Users/danielwise/Projects/wise2-core

# 1. List all backups
./scripts/recover-pi.sh list

# 2. Check for recent backups (within last 24 hours)
# Look for backups from today in the output

# 3. Verify checksums exist
ls -lah /data/wise2/backups/daily/*.sha256

# 4. Test checksum verification
sha256sum -c /data/wise2/backups/daily/wise2-full-*.sha256
```

**Success Criteria**:
- ✓ Recent backup exists (today or yesterday)
- ✓ All backups have `.sha256` files
- ✓ `sha256sum` output shows "OK" for all files

**Log Results**:
```bash
# Log to results file
echo "
BACKUP VERIFICATION - $(date)
- Backups found: $(ls /data/wise2/backups/daily/*.tar.gz | wc -l)
- Recent backup: $(ls -lt /data/wise2/backups/daily/*.tar.gz | head -1 | awk '{print $NF}')
- Checksum status: PASSED
" >> /var/log/wise2/recovery-tests.log
```

---

## Test 2: Quarterly - Database-Only Recovery (30 minutes)

**Objective**: Verify database can be restored from backup

**Setup**: 
- Use non-production database for testing
- Schedule during maintenance window
- Coordinate with team for 30-min downtime

**Steps**:

### Phase 1: Pre-Test (5 min)

```bash
# 1. Create test database clone
PGPASSWORD=$DB_PASS psql -h localhost -U wise2 -d postgres \
  -c "CREATE DATABASE wise2_test AS TEMPLATE wise2_prod;"

# 2. Record current table count
CURRENT_TABLES=$(PGPASSWORD=$DB_PASS psql -h localhost -U wise2 -d wise2_test -t \
  -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';")
echo "Current tables in test DB: $CURRENT_TABLES"

# 3. Record current data
CURRENT_DATA=$(PGPASSWORD=$DB_PASS psql -h localhost -U wise2 -d wise2_test -t \
  -c "SELECT count(*) FROM public.users;" 2>/dev/null || echo "unknown")
echo "Current users: $CURRENT_DATA"
```

### Phase 2: Select Backup (5 min)

```bash
# 1. List available database backups
./scripts/recover-pi.sh list

# 2. Select most recent backup
# Example: /data/wise2/backups/daily/wise2-db-20260723_020000.sql.gz
BACKUP_FILE="/data/wise2/backups/daily/wise2-db-20260723_020000.sql.gz"

# 3. Verify backup integrity
tar -tzf "$BACKUP_FILE" >/dev/null 2>&1 && echo "Backup valid" || echo "Backup corrupted"
```

### Phase 3: Restore Test (15 min)

```bash
# 1. Drop test database
PGPASSWORD=$DB_PASS psql -h localhost -U wise2 -d postgres \
  -c "DROP DATABASE IF EXISTS wise2_test;"

# 2. Create fresh test database
PGPASSWORD=$DB_PASS psql -h localhost -U wise2 -d postgres \
  -c "CREATE DATABASE wise2_test WITH OWNER wise2;"

# 3. Restore from backup
echo "Restoring from backup..."
gunzip < "$BACKUP_FILE" | PGPASSWORD=$DB_PASS psql -h localhost -U wise2 -d wise2_test

# 4. Verify restoration
RESTORED_TABLES=$(PGPASSWORD=$DB_PASS psql -h localhost -U wise2 -d wise2_test -t \
  -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';")
echo "Tables after restore: $RESTORED_TABLES"

# 5. Check data integrity
RESTORED_DATA=$(PGPASSWORD=$DB_PASS psql -h localhost -U wise2 -d wise2_test -t \
  -c "SELECT count(*) FROM public.users;" 2>/dev/null || echo "0")
echo "Users after restore: $RESTORED_DATA"
```

### Phase 4: Validation (5 min)

```bash
# 1. Compare table counts
if [ "$CURRENT_TABLES" -eq "$RESTORED_TABLES" ]; then
  echo "✓ Table count matches"
else
  echo "✗ Table count mismatch: $CURRENT_TABLES vs $RESTORED_TABLES"
fi

# 2. Verify key tables exist
PGPASSWORD=$DB_PASS psql -h localhost -U wise2 -d wise2_test \
  -c "\dt" | grep -q "users" && echo "✓ Users table found"

# 3. Check for data integrity issues
PGPASSWORD=$DB_PASS psql -h localhost -U wise2 -d wise2_test \
  -c "SELECT COUNT(*) FROM pg_class WHERE relname = 'users';" | grep -q "1" \
  && echo "✓ Data integrity OK"

# 4. Cleanup
PGPASSWORD=$DB_PASS psql -h localhost -U wise2 -d postgres \
  -c "DROP DATABASE IF EXISTS wise2_test;"
```

**Success Criteria**:
- ✓ Backup extracts without errors
- ✓ Database restoration completes
- ✓ Table count matches original
- ✓ No data integrity issues
- ✓ All key tables present

**Log Results**:
```bash
echo "
DATABASE RECOVERY TEST - $(date)
- Backup: $(basename $BACKUP_FILE)
- Current tables: $CURRENT_TABLES
- Restored tables: $RESTORED_TABLES
- Status: PASSED
" >> /var/log/wise2/recovery-tests.log
```

---

## Test 3: Quarterly - Files-Only Recovery (30 minutes)

**Objective**: Verify application files can be restored from backup

**Setup**:
- Test on non-production if possible
- Or test during maintenance window
- Have test directory ready: `/tmp/wise2-recovery-test/`

**Steps**:

### Phase 1: Pre-Test (5 min)

```bash
# 1. Create test directory
mkdir -p /tmp/wise2-recovery-test
cd /tmp/wise2-recovery-test

# 2. Record current file count
CURRENT_FILES=$(find /data/wise2/app -type f 2>/dev/null | wc -l)
echo "Current files: $CURRENT_FILES"

# 3. Record file tree
find /data/wise2/app -type f | head -20 > current-files.txt
echo "File list recorded"
```

### Phase 2: Extract Test (10 min)

```bash
# 1. Select files backup
./scripts/recover-pi.sh list
# Example: /data/wise2/backups/daily/wise2-files-20260723_020000.tar.gz
BACKUP_FILE="/data/wise2/backups/daily/wise2-files-20260723_020000.tar.gz"

# 2. Test archive integrity
echo "Testing archive integrity..."
tar -tzf "$BACKUP_FILE" >/dev/null 2>&1 && echo "✓ Archive valid" || echo "✗ Archive corrupted"

# 3. Count files in backup
BACKUP_FILES=$(tar -tzf "$BACKUP_FILE" 2>/dev/null | wc -l)
echo "Files in backup: $BACKUP_FILES"

# 4. Extract to test directory (don't overwrite production)
echo "Extracting to test directory..."
tar -xzf "$BACKUP_FILE" -C /tmp/wise2-recovery-test/ 2>/dev/null || true

# 5. Count extracted files
EXTRACTED_FILES=$(find /tmp/wise2-recovery-test -type f 2>/dev/null | wc -l)
echo "Files extracted: $EXTRACTED_FILES"
```

### Phase 3: Validation (10 min)

```bash
# 1. Compare file counts
if [ "$BACKUP_FILES" -eq "$EXTRACTED_FILES" ]; then
  echo "✓ File count matches"
else
  echo "⚠ File count mismatch: $BACKUP_FILES vs $EXTRACTED_FILES (may be OK)"
fi

# 2. Check for key directories
for dir in app data logs config; do
  if [ -d "/tmp/wise2-recovery-test/data/wise2/$dir" ]; then
    echo "✓ Directory found: $dir"
  fi
done

# 3. Sample file integrity
if [ -f "/tmp/wise2-recovery-test/data/wise2/app/package.json" ]; then
  echo "✓ Package.json found"
  # Verify it's valid JSON
  python -m json.tool "/tmp/wise2-recovery-test/data/wise2/app/package.json" >/dev/null \
    && echo "✓ Valid JSON" || echo "⚠ JSON validation failed"
fi

# 4. Cleanup
rm -rf /tmp/wise2-recovery-test
```

**Success Criteria**:
- ✓ Archive extracts without errors
- ✓ File count is reasonable (not 0)
- ✓ Key directories present
- ✓ No corruption detected

**Log Results**:
```bash
echo "
FILES RECOVERY TEST - $(date)
- Backup: $(basename $BACKUP_FILE)
- Current files: $CURRENT_FILES
- Backup files: $BACKUP_FILES
- Status: PASSED
" >> /var/log/wise2/recovery-tests.log
```

---

## Test 4: Annually - Full Recovery Test (2 hours)

**Objective**: Perform complete recovery in controlled environment

**Setup**:
- Schedule during maintenance window
- Prepare 2-hour downtime
- Notify all stakeholders
- Have rollback plan ready

**Steps**:

### Phase 1: Pre-Test Assessment (15 min)

```bash
# 1. Create pre-test snapshot
./scripts/recover-pi.sh list

# 2. Document current state
echo "Pre-recovery state:" > /tmp/pre-recovery-state.txt
PGPASSWORD=$DB_PASS psql -h localhost -U wise2 -d wise2_prod -c "\dt" >> /tmp/pre-recovery-state.txt
find /data/wise2/app -type f 2>/dev/null | wc -l >> /tmp/pre-recovery-state.txt
df -h /data >> /tmp/pre-recovery-state.txt

# 3. Select backup (use 1-2 weeks old for realistic test)
BACKUP_FILE=$(ls -t /data/wise2/backups/daily/wise2-full-*.tar.gz 2>/dev/null | head -1)
echo "Selected backup: $BACKUP_FILE"

# 4. Verify backup integrity
echo "Verifying backup..."
sha256sum -c "${BACKUP_FILE}.sha256" || echo "⚠ Checksum failed"
tar -tzf "$BACKUP_FILE" >/dev/null 2>&1 && echo "✓ Archive valid"
```

### Phase 2: Execute Recovery (90 min)

```bash
# 1. Create pre-recovery backup (automatic in script, but verify)
echo "Recovery starting at $(date)"

# 2. Run recovery (use script with confirmations for safety)
cd /Users/danielwise/Projects/wise2-core
export SKIP_CONFIRMATIONS=false  # Force confirmations for test

./scripts/recover-pi.sh restore "$BACKUP_FILE"

# 3. Monitor logs
tail -f /var/log/wise2/recovery/recovery-*.log &
TAIL_PID=$!

# 4. Wait for completion
sleep 90
kill $TAIL_PID 2>/dev/null || true

echo "Recovery completed at $(date)"
```

### Phase 3: Post-Recovery Validation (30 min)

```bash
# 1. Run health checks
./scripts/recover-pi.sh status

# 2. Verify database
echo "Database verification:"
RESTORED_TABLES=$(PGPASSWORD=$DB_PASS psql -h localhost -U wise2 -d wise2_prod -t \
  -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';")
echo "Tables: $RESTORED_TABLES"

# 3. Test application
echo "Testing application..."
curl -s http://localhost:3000 >/dev/null && echo "✓ Website responding" || echo "✗ Website not responding"
curl -s http://localhost:3000/api/health >/dev/null && echo "✓ API responding" || echo "✗ API not responding"

# 4. Verify services
systemctl status wise2-api
systemctl status wise2-web
systemctl status wise2-studio

# 5. Compare with pre-recovery state
echo "Post-recovery state:" > /tmp/post-recovery-state.txt
PGPASSWORD=$DB_PASS psql -h localhost -U wise2 -d wise2_prod -c "\dt" >> /tmp/post-recovery-state.txt
find /data/wise2/app -type f 2>/dev/null | wc -l >> /tmp/post-recovery-state.txt
df -h /data >> /tmp/post-recovery-state.txt

# 6. Document any differences
echo "Comparing pre/post recovery states..."
diff /tmp/pre-recovery-state.txt /tmp/post-recovery-state.txt || true
```

### Phase 4: Documentation (15 min)

```bash
# 1. Record test results
cat > /tmp/full-recovery-test-report.txt << EOF
FULL RECOVERY TEST REPORT
Date: $(date)
Duration: 2 hours

Pre-Recovery State:
$(cat /tmp/pre-recovery-state.txt)

Post-Recovery State:
$(cat /tmp/post-recovery-state.txt)

Test Status: [PASSED/FAILED]

Issues Found:
[List any issues]

Recommendations:
[List any improvements]

Recovery Completed By: [Name]
EOF

# 2. Store report
cp /tmp/full-recovery-test-report.txt /var/log/wise2/recovery/full-recovery-test-$(date +%Y%m%d).txt

# 3. Email report
mail -s "Full Recovery Test Report - $(date +%Y-%m-%d)" dwise03@gmail.com < /tmp/full-recovery-test-report.txt

# 4. Notify team
echo "Full recovery test completed successfully" | slack-notify
```

**Success Criteria**:
- ✓ Recovery completes without errors
- ✓ All health checks pass
- ✓ Application responds to requests
- ✓ Database has all tables
- ✓ Files restored correctly
- ✓ Services operational
- ✓ Pre/post state matches

---

## Test Automation

Create a cron job for monthly verification:

```bash
# /etc/cron.d/wise2-recovery-test

# Monthly backup verification (1st of month)
0 2 1 * * /home/dwise/wise2-core/scripts/recover-pi.sh list >> /var/log/wise2/recovery-verification.log 2>&1

# Email results
0 3 1 * * cat /var/log/wise2/recovery-verification.log | mail -s "WISE² Recovery Verification" dwise03@gmail.com || true
```

---

## Test Results Template

```
TEST DATE: 2026-07-23
TEST TYPE: Database Recovery
BACKUP USED: wise2-db-20260723_020000.sql.gz
DURATION: 8 minutes

PRE-TEST STATE:
- Tables: 127
- Users: 1,243
- Disk: 65%

POST-TEST STATE:
- Tables: 127
- Users: 1,243
- Disk: 65%

VALIDATION:
[✓] Backup integrity verified
[✓] Checksum validation passed
[✓] Extraction successful
[✓] Table count matches
[✓] Data integrity OK
[✓] Services restart OK

ISSUES: None
STATUS: PASSED
TESTER: dwise
```

---

## Troubleshooting Test Failures

### Backup Verification Fails
```bash
# 1. Check backup file
file /path/to/backup.tar.gz

# 2. Test extraction
tar -tzf /path/to/backup.tar.gz | head

# 3. Verify checksum
sha256sum -c /path/to/backup.tar.gz.sha256

# 4. If failed, test previous backup
ls -t /data/wise2/backups/daily/*.tar.gz | head -5
```

### Recovery Fails
```bash
# 1. Check logs
tail -50 /var/log/wise2/recovery/recovery-*.log

# 2. Verify disk space
df -h /data

# 3. Check database
PGPASSWORD=$DB_PASS psql -U wise2 -d postgres -c "\l"

# 4. Verify pre-recovery backup
ls -lah /data/wise2/backups/pre-recovery-backups/
```

### Data Mismatch After Recovery
```bash
# 1. Check table structure
PGPASSWORD=$DB_PASS psql -U wise2 -d wise2_prod -c "\d users"

# 2. Sample data
PGPASSWORD=$DB_PASS psql -U wise2 -d wise2_prod -c "SELECT * FROM users LIMIT 5"

# 3. Check for indexes
PGPASSWORD=$DB_PASS psql -U wise2 -d wise2_prod -c "\di"

# 4. Restore from pre-recovery backup if needed
gunzip < /data/wise2/backups/pre-recovery-backups/pre-recovery-*.tar.gz | \
  PGPASSWORD=$DB_PASS psql -U wise2 -d wise2_prod
```

---

## Test Schedule Template

```
RECOVERY TEST SCHEDULE - 2026

January:   Backup verification
April:     Database recovery test
July:      Files recovery test (this plan)
October:   Full recovery test

Monthly (1st):   Automated backup verification
Quarterly:       Manual recovery test + documentation
Annually (Q4):   Full disaster recovery drill
```

---

## Communication Template

### Test Announcement
```
Subject: WISE² Recovery Test Scheduled

Team,

We will be performing a scheduled recovery test on [DATE] at [TIME].

Duration: [30 min / 2 hours]
Impact: [Optional downtime / No user impact]
Backup Used: [Backup file name]

This is a routine test to ensure disaster recovery procedures work correctly.

Questions? Contact dwise03@gmail.com
```

### Test Completion Report
```
Subject: WISE² Recovery Test Complete - Results Attached

Team,

Recovery test completed successfully on [DATE].

Results:
- Recovery Time: [X minutes]
- Data Integrity: [OK / Issues found]
- Services: [All operational / Some issues]
- Overall Status: [PASSED / FAILED]

Details in attached report.
Next test scheduled: [DATE]
```

---

## References

- **Recovery Script**: `/scripts/recover-pi.sh`
- **Recovery Guide**: `/docs/RECOVERY_GUIDE.md`
- **Quick Reference**: `/docs/RECOVERY_QUICK_REFERENCE.md`
- **Test Log**: `/var/log/wise2/recovery-tests.log`

---

**Testing ensures readiness for actual disasters**

Test regularly, document thoroughly, improve continuously.

---

**Last Updated**: 2026-07-23  
**Version**: 1.0  
**Owner**: WISE² Operations
