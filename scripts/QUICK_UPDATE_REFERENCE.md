# WISE² Pi Update - Quick Reference

## One-Liners (Most Common Uses)

```bash
# Test what would be updated
./update-pi.sh pi.local full-stack --dry-run

# Update everything to latest
./update-pi.sh pi.local full-stack

# Update API only (quick fix)
./update-pi.sh pi.local api-only

# Update and see progress
./update-pi.sh pi.local full-stack 2>&1 | tee update-output.log

# Force update (skip checks)
./update-pi.sh pi.local full-stack --force

# Update without backup (test only)
./update-pi.sh pi.local full-stack --no-backup

# Check update log
tail -50 logs/updates/update-*.log

# View full log
less logs/updates/update-*.log
```

## Scheduling (Copy & Paste Ready)

### Daily at 3 AM (crontab)

```bash
# SSH to Pi
ssh pi@pi.local

# Edit crontab
crontab -e

# Paste this line:
0 3 * * * cd /opt/wise2-edge && /opt/wise2-edge-scripts/update-pi.sh pi.local full-stack >> /var/log/wise2-edge-appliance/auto-update.log 2>&1
```

### Weekly on Sunday (crontab)

```bash
# Same as above but:
0 3 * * 0 cd /opt/wise2-edge && /opt/wise2-edge-scripts/update-pi.sh pi.local full-stack >> /var/log/wise2-edge-appliance/auto-update.log 2>&1
```

### Systemd Timer (Linux)

```bash
# Copy timer files to Pi
scp systemd-wise2-update.* pi@pi.local:/tmp/

# SSH to Pi
ssh pi@pi.local

# Install files
sudo cp /tmp/systemd-wise2-update.service /etc/systemd/system/
sudo cp /tmp/systemd-wise2-update.timer /etc/systemd/system/

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable wise2-update.timer
sudo systemctl start wise2-update.timer

# Check status
sudo systemctl status wise2-update.timer
sudo systemctl list-timers wise2-update.timer
```

## Update Types At A Glance

```
full-stack    ← Use this for normal updates
├─ API
├─ Website  
└─ Studio

api-only      ← Use for quick API-only fixes
website-only  ← Use for landing page changes
studio-only   ← Use for dashboard changes
system        ← Use for security patches
all           ← Use for major releases
```

## Troubleshooting

```bash
# Cannot connect to Pi
ping pi.local                    # Check network
ssh pi@pi.local "echo OK"        # Check SSH

# Health check failed (after update)
ssh pi@pi.local "docker-compose logs api | tail -20"
ssh pi@pi.local "docker-compose logs website | tail -20"
ssh pi@pi.local "docker-compose ps"

# Update stuck
ssh pi@pi.local "docker ps"       # See what's running
ssh pi@pi.local "pkill -f update" # Kill stuck update (careful!)

# Disk full during update
ssh pi@pi.local "df -h"
ssh pi@pi.local "docker image prune -a"  # Remove old images

# Need to rollback
ssh pi@pi.local "cd /opt/wise2-edge && docker-compose down"
ssh pi@pi.local "sudo cp /opt/wise2-edge-backups/backup-YYYYMMDD-HHMMSS/docker-compose.prod.yml ./docker-compose.prod.yml"
ssh pi@pi.local "cd /opt/wise2-edge && docker-compose up -d"
```

## Check Status After Update

```bash
# Services running
ssh pi@pi.local "cd /opt/wise2-edge && docker-compose ps"

# Recent logs
ssh pi@pi.local "docker-compose logs --tail=20 api"
ssh pi@pi.local "docker-compose logs --tail=20 website"

# API responding
curl http://pi.local:3000/health

# Website responding
curl http://pi.local:3001

# View update history
cat logs/updates/update-*.log | grep "Start Time\|End Time\|Status"
```

## Monitoring Automated Updates

If you've set up cron or systemd timers:

```bash
# Check if update ran
ssh pi@pi.local "tail -50 /var/log/wise2-edge-appliance/auto-update.log"

# Check next scheduled time (systemd)
ssh pi@pi.local "sudo systemctl list-timers wise2-update.timer"

# Check cron logs
ssh pi@pi.local "grep CRON /var/log/syslog | tail -20"

# Disable scheduled updates temporarily
ssh pi@pi.local "sudo systemctl stop wise2-update.timer"

# Re-enable scheduled updates
ssh pi@pi.local "sudo systemctl start wise2-update.timer"
```

## Before Major Updates

1. **Test first**
   ```bash
   ./update-pi.sh pi.local full-stack --dry-run
   ```

2. **Check backup exists**
   ```bash
   ssh pi@pi.local "ls -lh /opt/wise2-edge-backups/ | head -5"
   ```

3. **Verify connectivity**
   ```bash
   ssh pi@pi.local "echo 'Connected'"
   ```

4. **Check disk space**
   ```bash
   ssh pi@pi.local "df -h /"
   ```

5. **Do the update**
   ```bash
   ./update-pi.sh pi.local full-stack
   ```

6. **Monitor the log**
   ```bash
   tail -f logs/updates/update-*.log
   ```

7. **Verify services**
   ```bash
   curl http://pi.local:3000/health
   ssh pi@pi.local "docker-compose ps"
   ```

## Email Notifications

### Enable
- Set: `export ADMIN_EMAIL="your@email.com"`
- Requires: Mail server configured on Pi

### Disable for one update
```bash
./update-pi.sh pi.local full-stack --no-notify
```

### Check email sent
```bash
# On Pi, check mail logs
ssh pi@pi.local "sudo tail -20 /var/log/mail.log"
```

## Performance Tips

1. **Update during low-traffic times** (3-5 AM, Sundays)
2. **Update API separately** from website if needed (faster)
3. **Check disk space first** (need 2-3 GB free)
4. **Monitor resources** during update:
   ```bash
   ssh pi@pi.local "watch -n1 'docker ps --format \"table {{.Names}}\t{{.CPUPerc}}\t{{.MemUsage}}\"'"
   ```

## Log Locations

| Log | Location | View With |
|-----|----------|-----------|
| Update logs | `logs/updates/update-*.log` | `tail -100 logs/updates/update-*.log` |
| Auto-update (cron) | `/var/log/wise2-edge-appliance/auto-update.log` | `ssh pi@pi.local "tail -50 /var/log/wise2-edge-appliance/auto-update.log"` |
| Docker logs | Local containers | `docker-compose logs api` |
| System logs | `/var/log/syslog` | `ssh pi@pi.local "grep UPDATE /var/log/syslog"` |

## Emergency Procedures

### Stop Ongoing Update
```bash
ssh pi@pi.local "pkill -f 'update-pi.sh'"
```

### Manual Rollback (if automatic failed)
```bash
BACKUP_ID="20260723-143215"  # Use correct ID from /opt/wise2-edge-backups/

ssh pi@pi.local << EOF
  cd /opt/wise2-edge
  sudo cp /opt/wise2-edge-backups/backup-$BACKUP_ID/docker-compose.prod.yml ./
  sudo cp /opt/wise2-edge-backups/backup-$BACKUP_ID/.env.backup ./.env 2>/dev/null || true
  docker-compose down
  docker-compose up -d
  docker-compose ps
EOF
```

### Restore Database from Backup
```bash
BACKUP_ID="20260723-143215"

ssh pi@pi.local << EOF
  docker-compose exec -T postgres psql -U wise2 wise2_prod < /opt/wise2-edge-backups/backup-$BACKUP_ID/database.sql.gz
EOF
```

## Tips & Tricks

1. **Auto-follow logs during update**
   ```bash
   ./update-pi.sh pi.local full-stack & tail -f logs/updates/update-*.log
   ```

2. **Update multiple Pis in sequence**
   ```bash
   for pi in pi-1.local pi-2.local pi-3.local; do
     echo "Updating $pi..."
     ./update-pi.sh $pi full-stack
     sleep 60  # Wait 1 min between
   done
   ```

3. **Parallel updates (careful!)**
   ```bash
   ./update-pi.sh pi-1.local api-only &
   ./update-pi.sh pi-2.local api-only &
   ./update-pi.sh pi-3.local api-only &
   wait  # Wait for all to finish
   ```

4. **Compare versions before/after**
   ```bash
   # Before
   ssh pi@pi.local "cd /opt/wise2-edge && docker-compose images"
   
   # Do update
   ./update-pi.sh pi.local full-stack
   
   # After
   ssh pi@pi.local "cd /opt/wise2-edge && docker-compose images"
   ```

5. **Backup important data before major updates**
   ```bash
   ssh pi@pi.local << EOF
     tar -czf ~/wise2-backup-full-$(date +%Y%m%d).tar.gz \
       /opt/wise2-edge /opt/wise2-edge-backups
   EOF
   ```

---

**More Help**: See `UPDATE_PI_GUIDE.md` for detailed documentation
