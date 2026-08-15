# WISE² Pi Operations Guide

**Last Updated**: 2026-07-23  
**Environment**: Raspberry Pi 5 (4GB/8GB)  
**OS**: Raspberry Pi OS (Bullseye)  
**User**: `wise2` (sudo access required)

---

## 1. Daily Health Checks

### Quick Status Check
```bash
# SSH into Pi
ssh wise2@wise2-pi.local

# System overview
uname -a && cat /etc/os-release

# Uptime
uptime

# Disk usage
df -h

# Memory usage
free -h

# CPU temp
vcgencmd measure_temp

# Container status
docker-compose -f /opt/wise2/docker-compose.yml ps

# Recent log check (last 50 lines)
journalctl -n 50 -u wise2-docker
```

### Dashboard Health Page
```
http://wise2-pi.local:3005/dashboard/health
```

Check for:
- Green status indicators
- Uptime > 99%
- CPU temp < 80°C
- Free disk > 10%
- Container status = Running

### Log Files Location
```bash
# System logs
/var/log/wise2/
/var/log/docker/

# Application logs
/opt/wise2/logs/

# Daily summary
tail -50 /var/log/wise2/daily-check.log
```

---

## 2. Scheduled Tasks

### Backup Schedule
```bash
# View cron jobs
crontab -l

# Expected backups:
# Daily at 02:00 UTC → /mnt/backups/daily/
# Weekly (Sun) 03:00 UTC → /mnt/backups/weekly/
# Monthly (1st) 04:00 UTC → /mnt/backups/monthly/
```

### Update Schedule
```bash
# OS updates: Saturdays 01:00 UTC
# Docker images: Sundays 02:00 UTC
# Database cleanup: Daily 05:00 UTC

# View systemd timers
systemctl list-timers
```

### Modify Backup Schedule
```bash
# Edit crontab
crontab -e

# Example: trigger backup every 6 hours
0 */6 * * * /opt/wise2/scripts/backup.sh

# Or use systemd timer
sudo systemctl edit wise2-backup.timer
```

---

## 3. Common Operations

### Restart Docker Services
```bash
cd /opt/wise2

# Restart all services
docker-compose -f docker-compose.yml restart

# Restart specific service (api, website, dashboard)
docker-compose restart api

# Full stop/start (safer)
docker-compose down
docker-compose up -d
```

### View Logs
```bash
# Last 100 lines
docker-compose logs --tail=100

# Follow in real-time
docker-compose logs -f

# Specific service logs
docker-compose logs -f api

# Last N minutes
docker-compose logs --since 30m
```

### Check Disk Usage
```bash
# Overall
df -h /

# Per directory (top 10)
du -sh /* | sort -rh | head -10

# Docker storage
docker system df

# Database size
du -sh /var/lib/postgresql/

# Backup storage
du -sh /mnt/backups/
```

### Monitor Performance
```bash
# Real-time CPU/memory (Ctrl+C to exit)
top -u wise2

# Or use Pi-specific monitoring
ssh wise2@wise2-pi.local '/opt/wise2/scripts/monitor.sh'

# Save to file for analysis
top -b -u wise2 -n 1 > /tmp/top-output.txt
```

### Manual Backup
```bash
# Trigger backup script
/opt/wise2/scripts/backup.sh

# Verify backup
ls -lh /mnt/backups/daily/ | tail -5

# Check backup size
du -sh /mnt/backups/daily/wise2-$(date +%Y%m%d).tar.gz
```

### Check Backup Status
```bash
# List recent backups
ls -lht /mnt/backups/daily/ | head -10

# Verify backup integrity
tar -tzf /mnt/backups/daily/wise2-20260723.tar.gz | head -20

# Backup size trends
du -sh /mnt/backups/daily/* | sort -h
```

---

## 4. Updates

### When Updates Run
- **OS updates**: Saturdays 01:00 UTC (auto)
- **Container images**: Sundays 02:00 UTC (auto)
- **Manual updates**: Can trigger anytime

### Trigger Manual OS Update
```bash
sudo apt update
sudo apt full-upgrade -y
sudo reboot  # If kernel updated
```

### Trigger Manual Docker Update
```bash
cd /opt/wise2

# Pull latest images
docker-compose pull

# Recreate containers with new images
docker-compose up -d
```

### Monitor Update Progress
```bash
# Watch logs during update
journalctl -u wise2-docker -f

# Check if services are healthy after update
docker-compose ps

# Verify app is responding
curl -s http://localhost:3000/health | jq .
curl -s http://localhost:3001/api/health | jq .
curl -s http://localhost:3005/api/health | jq .
```

### Rollback Failed Update
```bash
# Stop services
docker-compose down

# Restore from backup
/opt/wise2/scripts/restore.sh /mnt/backups/daily/wise2-20260722.tar.gz

# Start services
docker-compose up -d

# Verify health
curl -s http://localhost:3000/health
```

---

## 5. Backups

### Backup Schedule & Retention
```
Daily:   Keep last 7 days
Weekly:  Keep last 4 weeks
Monthly: Keep last 12 months
Location: /mnt/backups/
```

### Manual Backup
```bash
# Full backup (includes DB, files, configs)
/opt/wise2/scripts/backup.sh full

# Quick backup (files only, skip DB)
/opt/wise2/scripts/backup.sh quick

# Monitor progress
tail -f /var/log/wise2/backup.log
```

### Restore from Backup
```bash
# List available backups
ls -1 /mnt/backups/daily/

# Restore specific backup
/opt/wise2/scripts/restore.sh /mnt/backups/daily/wise2-20260722.tar.gz

# Restore to point-in-time
# (database backups stored separately)
pg_restore -d wise2_db /mnt/backups/daily/db-20260722.sql

# Restart services after restore
docker-compose restart
```

### Backup Retention Policy
```bash
# Auto-cleanup runs daily at 06:00 UTC
# Manual cleanup:
find /mnt/backups/daily -mtime +7 -delete
find /mnt/backups/weekly -mtime +28 -delete
find /mnt/backups/monthly -mtime +365 -delete
```

---

## 6. Monitoring & Alerts

### Alert Types & Meanings
```
GREEN   → All systems operational
YELLOW  → Warning (CPU temp high, disk 80%, memory 85%)
RED     → Critical (service down, disk 95%, memory 95%)
```

### Check Active Alerts
```bash
# Dashboard alerts
curl -s http://localhost:3005/api/alerts | jq .

# System alerts
cat /var/log/wise2/alerts.log | tail -20

# Docker health
docker-compose ps | grep -v "healthy"
```

### Acknowledge Alerts
```bash
# Via API
curl -X POST http://localhost:3005/api/alerts/acknowledge/ALERT_ID

# Or through dashboard UI
# http://wise2-pi.local:3005/dashboard/alerts
```

### Escalation Procedures
```
YELLOW Alert (Warning):
  1. Monitor for 10 minutes
  2. If persists, check logs: journalctl -n 100
  3. If needed, restart service: docker-compose restart SERVICE_NAME

RED Alert (Critical):
  1. Immediate action required
  2. Check: docker-compose ps
  3. Check logs: docker-compose logs SERVICE_NAME
  4. Restart: docker-compose restart SERVICE_NAME
  5. If still down, initiate rollback (see Updates section)
  6. Contact: dwise03@gmail.com if not resolved in 15 min
```

---

## 7. Performance Tuning

### High CPU Usage
```bash
# Identify hot processes
top -b -n 1 | head -15

# Check container CPU usage
docker stats

# Reduce container CPU limit (if set)
docker-compose logs api | grep -i cpu

# Restart service
docker-compose restart api

# If persistent, check for runaway queries
# (requires DB access)
```

### High Memory Usage
```bash
# Check memory distribution
free -h && docker stats

# Clean Docker cache (safe)
docker system prune --all -f

# Restart memory-hungry container
docker-compose restart api
docker-compose restart website

# Check for memory leaks in logs
grep -i "memory\|leak\|oom" /var/log/wise2/*.log
```

### High Disk Usage
```bash
# Find large files
find / -type f -size +1G -ls 2>/dev/null

# Clean Docker images
docker image prune -a -f

# Clean Docker volumes (CAREFUL)
docker volume prune -f

# Compress old logs
gzip /var/log/wise2/*.log.*

# Rotate logs
logrotate -f /etc/logrotate.d/wise2
```

---

## 8. Emergency Procedures

### Service Down Recovery
```bash
# Step 1: Check service status
docker-compose ps

# Step 2: Check logs
docker-compose logs SERVICE_NAME --tail=50

# Step 3: Restart service
docker-compose restart SERVICE_NAME

# Step 4: Verify health
sleep 5
curl -s http://localhost:PORT/health

# Step 5: If still down, check resources
docker stats
free -h
df -h
```

### Disk Full (95%+)
```bash
# IMMEDIATE: Find space
du -sh /* | sort -rh | head -5

# REMOVE: Old backups (keep newest)
rm /mnt/backups/daily/*[0-9]*.gz -v | head -10

# REMOVE: Old logs
find /var/log/wise2 -mtime +30 -delete

# REMOVE: Docker cache
docker system prune -a -f --volumes

# VERIFY: Disk cleared
df -h /
```

### Database Corrupted
```bash
# Step 1: Stop services to prevent further damage
docker-compose down

# Step 2: Restore from most recent backup
/opt/wise2/scripts/restore.sh /mnt/backups/daily/wise2-LATEST.tar.gz

# Step 3: Verify restore integrity
pg_isready -h localhost -U wise2_user

# Step 4: Start services
docker-compose up -d

# Step 5: Run consistency check
psql -U wise2_user -d wise2_db -c "REINDEX DATABASE wise2_db;"
```

### Rollback Procedure
```bash
# Find backup to restore
ls -1 /mnt/backups/daily/ | sort -r | head -5

# Stop current deployment
docker-compose down

# Restore backup
tar -xzf /mnt/backups/daily/wise2-20260722.tar.gz -C /

# Restore database if separate
pg_restore -d wise2_db /mnt/backups/daily/db-20260722.sql

# Restart services
docker-compose up -d

# Verify
docker-compose ps
curl -s http://localhost:3000/health
```

---

## 9. Capacity Planning

### When to Upgrade
```
Trigger      Threshold    Action
─────────────────────────────────────
CPU Temp     > 85°C       Add heatsink or improve cooling
Memory       > 90% free   Upgrade RAM (4GB → 8GB)
Disk Space   < 5% free    Upgrade SD card or add USB storage
DB Size      > 80% space  Archive old data or upgrade storage

Pi 5 Limits:
- 4GB RAM:  ~1000 concurrent users, ~10GB DB
- 8GB RAM:  ~2000 concurrent users, ~20GB DB
```

### Monitor Database Growth
```bash
# Current size
du -sh /var/lib/postgresql/

# Growth rate (run weekly)
echo "$(date): $(du -sh /var/lib/postgresql/)" >> /tmp/db-growth.log

# Archive old records (example)
psql -U wise2_user -d wise2_db -c "
DELETE FROM events WHERE created_at < NOW() - INTERVAL '90 days';
VACUUM;
"
```

### Backup Storage Needs
```
Rule of thumb:
- DB backup: 1-2x database size
- Full backup: 3-5x database size
- 7-day retention: 7x daily backup
- 4-week retention: 4x weekly backup
- 12-month retention: 12x monthly backup

Example (10GB DB):
- Daily: 50GB (7 days)
- Weekly: 40GB (4 weeks)
- Monthly: 120GB (12 months)
- Total: ~210GB recommended
```

---

## 10. Escalation

### When to Contact Support
```
Scenario                    Action
─────────────────────────────────────────────────────
Service down > 10 min       Email support immediately
Disk corruption             Restore from backup + contact
Database won't start        Restore from backup + contact
Update failed               Rollback + contact
Performance degraded > 1hr  Collect diagnostics + contact
Security concern            Stop services + contact immediately
```

### Collect Diagnostics
```bash
# All-in-one diagnostics bundle
cat > /tmp/collect-diagnostics.sh << 'EOF'
#!/bin/bash
OUTDIR="/tmp/wise2-diagnostics-$(date +%Y%m%d-%H%M%S)"
mkdir -p $OUTDIR

echo "Collecting diagnostics..."

# System info
echo "=== SYSTEM INFO ===" > $OUTDIR/system.txt
uname -a >> $OUTDIR/system.txt
cat /etc/os-release >> $OUTDIR/system.txt
vcgencmd measure_temp >> $OUTDIR/system.txt

# Resource usage
echo "=== RESOURCES ===" > $OUTDIR/resources.txt
uptime >> $OUTDIR/resources.txt
free -h >> $OUTDIR/resources.txt
df -h >> $OUTDIR/resources.txt
top -b -n 1 -u wise2 >> $OUTDIR/resources.txt

# Docker status
echo "=== DOCKER ===" > $OUTDIR/docker.txt
docker-compose ps >> $OUTDIR/docker.txt
docker stats --no-stream >> $OUTDIR/docker.txt

# Logs (last 200 lines each)
mkdir -p $OUTDIR/logs
docker-compose logs --tail=200 > $OUTDIR/logs/docker.log 2>&1
journalctl -n 200 > $OUTDIR/logs/systemd.log
tail -200 /var/log/wise2/*.log > $OUTDIR/logs/app.log 2>&1

# Create tarball
tar -czf $OUTDIR.tar.gz $OUTDIR/
echo "Diagnostics saved to: $OUTDIR.tar.gz"
ls -lh $OUTDIR.tar.gz
EOF

chmod +x /tmp/collect-diagnostics.sh
/tmp/collect-diagnostics.sh
```

### Support Contact
```
Email:    dwise03@gmail.com
Response: Best-effort within 4 hours (US business hours)
Severity: Include "URGENT" in subject line for critical issues

Attach diagnostics bundle when contacting support
(see Collect Diagnostics section above)
```

---

## Quick Command Reference

```bash
# Status check (1 command)
docker-compose ps && df -h / && free -h && uptime

# Restart all (if services acting up)
cd /opt/wise2 && docker-compose restart

# View logs (follow in real-time)
cd /opt/wise2 && docker-compose logs -f

# Backup now
/opt/wise2/scripts/backup.sh

# Restore from backup
/opt/wise2/scripts/restore.sh /mnt/backups/daily/wise2-LATEST.tar.gz

# Check temperature
vcgencmd measure_temp

# Check disk
df -h

# Check memory
free -h

# Check CPU load
uptime

# View alerts
curl -s http://localhost:3005/api/alerts | jq .

# Health check (all services)
for port in 3000 3001 3005; do echo "Port $port:" && curl -s http://localhost:$port/health | jq . || echo "FAIL"; done
```

---

## Directory Structure Reference

```
/opt/wise2/                    # Application root
├── docker-compose.yml         # Service definitions
├── scripts/
│   ├── backup.sh             # Backup script
│   ├── restore.sh            # Restore script
│   └── monitor.sh            # Performance monitor
├── logs/                      # Application logs
└── data/
    └── postgres/             # Database storage

/mnt/backups/                 # Backup storage
├── daily/                    # 7-day retention
├── weekly/                   # 4-week retention
└── monthly/                  # 12-month retention

/var/log/wise2/               # System logs
├── daily-check.log
├── backup.log
├── alerts.log
└── *.log
```

---

**Last Reviewed**: 2026-07-23  
**Next Review**: 2026-08-20  
Contact dwise03@gmail.com with updates.
