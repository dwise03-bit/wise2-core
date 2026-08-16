# WISE² Recovery Quick Reference Card

**Print this and keep it accessible**

---

## EMERGENCY RECOVERY (Pick One)

### 1. Interactive Recovery (Recommended)
```bash
cd /Users/danielwise/Projects/wise2-core
./scripts/recover-pi.sh
```
- Lists all backups
- Prompts for selection
- Provides recovery options
- Requires confirmations

### 2. Automatic Recovery
```bash
SKIP_CONFIRMATIONS=true \
  ./scripts/recover-pi.sh restore /data/wise2/backups/daily/wise2-full-20260723_120000.tar.gz
```
- Fast, non-interactive
- Use with known-good backup only

### 3. Check Status
```bash
./scripts/recover-pi.sh status
```
- Database connection check
- Service status
- Disk space
- File verification

---

## QUICK COMMANDS

| Action | Command |
|--------|---------|
| **List backups** | `./scripts/recover-pi.sh list` |
| **Show backup details** | See interactive menu |
| **Restore database only** | Choose "Database Only" in menu |
| **Restore files only** | Choose "Files Only" in menu |
| **Full system restore** | Choose "Full Recovery" in menu |
| **View recovery logs** | `tail -f /var/log/wise2/recovery/recovery-*.log` |
| **Restore pre-recovery backup** | `gunzip < /data/wise2/backups/pre-recovery-backups/pre-recovery-*.tar.gz \| psql -U wise2 -d wise2_prod` |

---

## RECOVERY OPTIONS (Choose One)

### Full Recovery (System-Wide Disaster)
- **Restores**: Database + Files + Config
- **Time**: 15-30 minutes
- **Use When**: Complete corruption, malware, system failure

### Database Only (Data Issues)
- **Restores**: Tables, schemas, data only
- **Time**: 5-10 minutes
- **Use When**: Data loss, accidental deletion, corruption

### Files Only (Config Issues)
- **Restores**: Application files, logs, config
- **Time**: 3-5 minutes
- **Use When**: Bad config changes, missing files

---

## BEFORE YOU START

- [ ] Backup current state (automatic, but confirm prompt)
- [ ] Have access to backup file location
- [ ] Know database password (if automated)
- [ ] Prepare team for downtime (15-30 min)
- [ ] Have log file path ready: `/var/log/wise2/recovery/`

---

## DURING RECOVERY

- [ ] Script stops services automatically
- [ ] Do NOT manually start services during recovery
- [ ] Monitor logs: `tail -f /var/log/wise2/recovery/recovery-*.log`
- [ ] Wait for "Health checks" to complete
- [ ] Do NOT interrupt script (use Ctrl+C only as last resort)

---

## AFTER RECOVERY

- [ ] Verify health checks passed: `./scripts/recover-pi.sh status`
- [ ] Check application: `curl http://localhost:3000`
- [ ] Review recovery logs: `cat /var/log/wise2/recovery/recovery-*.log`
- [ ] Confirm data integrity
- [ ] Alert team that systems are operational

---

## IF SOMETHING GOES WRONG

### Error: "Backup verification failed"
```bash
# Try older backup
./scripts/recover-pi.sh list
# Select different backup from list
```

### Error: "Database recovery failed"
```bash
# Check PostgreSQL
systemctl status postgresql

# Manual restore
BACKUP=/path/to/backup.sql.gz
gunzip < $BACKUP | PGPASSWORD=$DB_PASS psql -U wise2 -d wise2_prod
```

### Error: "Services failed to restart"
```bash
# Manual restart
systemctl restart wise2-api
systemctl restart wise2-web
systemctl restart wise2-studio
```

### Error: "File extraction failed"
```bash
# Check disk space
df -h /data

# Free space if needed
rm -rf /data/wise2/backups/pre-recovery-backups/old-files

# Retry extraction
./scripts/recover-pi.sh restore /path/to/backup.tar.gz
```

### Cannot reach database
```bash
# Check connection
PGPASSWORD=$DB_PASS psql -h localhost -U wise2 -d wise2_prod -c "SELECT 1"

# Restore pre-recovery backup if current recovery failed
gunzip < /data/wise2/backups/pre-recovery-backups/pre-recovery-*.tar.gz | \
  PGPASSWORD=$DB_PASS psql -U wise2 -d wise2_prod
```

---

## CONTACTS & RESOURCES

| Item | Location |
|------|----------|
| Full Guide | `/docs/RECOVERY_GUIDE.md` |
| Recovery Logs | `/var/log/wise2/recovery/` |
| Backup Location | `/data/wise2/backups/` |
| Database Config | `$DB_PASS`, `$DB_NAME`, `$DB_USER` |
| Email Support | dwise03@gmail.com |

---

## CRITICAL PATHS

- **Backup Root**: `/data/wise2/backups/`
- **Daily Backups**: `/data/wise2/backups/daily/`
- **Weekly Backups**: `/data/wise2/backups/weekly/`
- **Monthly Backups**: `/data/wise2/backups/monthly/`
- **Pre-Recovery**: `/data/wise2/backups/pre-recovery-backups/`
- **Recovery Logs**: `/var/log/wise2/recovery/`
- **Recovery Script**: `/scripts/recover-pi.sh`

---

## DATABASE QUICK REFERENCE

```bash
# Check database health
PGPASSWORD=$DB_PASS psql -h localhost -U wise2 -d wise2_prod -c "\dt"

# Count tables
PGPASSWORD=$DB_PASS psql -h localhost -U wise2 -d wise2_prod -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';"

# List all databases
PGPASSWORD=$DB_PASS psql -h localhost -U wise2 -l

# Stop services
systemctl stop wise2-api wise2-web wise2-studio

# Start services
systemctl start wise2-api wise2-web wise2-studio

# Check service status
systemctl status wise2-api
```

---

## SUCCESS INDICATORS

After recovery, you should see:

```
Health Checks
=============

Database connection: ✓ OK
Database tables: ✓ OK (127 tables)
Application files: ✓ OK (1,847 files)
Services: ✓ OK (3/3 running)
Disk space: ✓ OK (65% used)
```

If ANY check shows ✗ or ⚠, review logs and troubleshoot.

---

## RECOVERY TIME ESTIMATE

| Backup Type | Recovery Time | Notes |
|-------------|---------------|-------|
| Full | 15-30 min | Includes service restart |
| Database | 5-10 min | Depends on size |
| Files | 3-5 min | Depends on file count |

Add 5 minutes for confirmations and pre-recovery backup.

---

**REMEMBER**: 
- Pre-recovery backups are created automatically
- All actions are logged
- Health checks verify success
- Confirmations prevent accidents

**If unsure, choose "Interactive Mode" for guided recovery**

---

**Last Updated**: 2026-07-23  
**Version**: 1.0  
**Keep this card accessible at all times**
