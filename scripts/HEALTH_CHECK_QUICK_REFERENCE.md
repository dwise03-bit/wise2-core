# Health Check Script - Quick Reference

## File Locations

- **Main Script**: `/scripts/pi-health-check.sh`
- **Setup Guide**: `/scripts/PI_HEALTH_CHECK_SETUP.md`
- **Cron Examples**: `/scripts/crontab-example.txt`
- **Configuration Template**: `/scripts/.env.health-check.example`

## Quick Start (30 seconds)

```bash
# 1. Make executable (one-time)
chmod +x /path/to/wise2-core/scripts/pi-health-check.sh

# 2. Test it
./scripts/pi-health-check.sh --verbose

# 3. Schedule it (edit crontab)
crontab -e
# Add: 0 * * * * /path/to/wise2-core/scripts/pi-health-check.sh --email
```

## Command Usage

```bash
# Basic run
./scripts/pi-health-check.sh

# Verbose (see details while running)
./scripts/pi-health-check.sh --verbose

# Send email report
./scripts/pi-health-check.sh --email

# Send to webhook (Discord, Slack, etc.)
./scripts/pi-health-check.sh --webhook https://your-webhook-url

# All options combined
./scripts/pi-health-check.sh --email --webhook https://your-webhook-url --verbose
```

## What It Checks (10 Areas)

| # | Check | Alerts On |
|---|-------|-----------|
| 1 | **Docker Containers** | Not running, high restart count |
| 2 | **Connectivity** | Internet, API, database unreachable |
| 3 | **Disk Space** | >85% used, logs >500MB |
| 4 | **Memory** | >90% used |
| 5 | **Network** | High API latency, interface DOWN |
| 6 | **Updates** | Apt or Docker updates available |
| 7 | **Backups** | Missing, >48h old, or too large |
| 8 | **Logs** | >10 errors/hour, crashes detected |
| 9 | **SSL Certificates** | Expired or <30 days until expiry |
| 10 | **System** | CPU load, uptime, kernel version |

## Cron Scheduling Presets

### Minimal (Hourly)
```bash
0 * * * * /path/to/scripts/pi-health-check.sh --email
```

### Recommended (Every 30 minutes)
```bash
*/30 * * * * /path/to/scripts/pi-health-check.sh >> /var/log/wise2-health.log 2>&1
0 9 * * * /path/to/scripts/pi-health-check.sh --email
```

### Comprehensive (Multiple schedules)
```bash
# Quick check every 30 minutes
*/30 * * * * /path/to/scripts/pi-health-check.sh >> /var/log/wise2-health.log 2>&1

# Email daily at 9 AM
0 9 * * * /path/to/scripts/pi-health-check.sh --email

# Webhook to Discord every 2 hours
0 */2 * * * /path/to/scripts/pi-health-check.sh --webhook "https://discordapp.com/api/webhooks/ID/TOKEN"

# Deep analysis weekly (Monday 8 AM)
0 8 * * 1 /path/to/scripts/pi-health-check.sh --email --verbose
```

## Output Files

| Type | Location | Format |
|------|----------|--------|
| Text Reports | `logs/health-check-*.txt` | Human-readable summary |
| JSON Reports | `/tmp/pi-health-report-*.json` | Machine-readable data |
| Cron Logs | `/var/log/wise2-health-check.log` | Script execution history |

## Configuration

### Environment Variables

```bash
# Copy and customize
cp scripts/.env.health-check.example scripts/.env.health-check

# Load in crontab
0 * * * * source /path/to/.env.health-check && /path/to/scripts/pi-health-check.sh --email
```

### Key Settings

- `DISK_WARN_PCT=85` — Alert if disk >85% used
- `MEMORY_WARN_PCT=90` — Alert if memory >90% used
- `BACKUP_MAX_AGE_HOURS=48` — Alert if backup older than 2 days
- `CERT_WARN_DAYS=30` — Alert if SSL cert expires in <30 days
- `ERROR_THRESHOLD_HOUR=10` — Alert if >10 errors per hour

## Interpreting Results

### Exit Codes
- `0` — OK or WARNING (success)
- `1` — FAIL (critical issue)

### Status Indicators
- `[OK]` — Healthy, no action
- `[WARN]` — Monitor, may need attention
- `[FAIL]` — Critical, needs immediate action

### Overall Status
- **OK** — All systems healthy
- **WARN** — At least one warning detected
- **FAIL** — At least one critical failure

## Example Report

```
================================================================================
1. SERVICE STATUS
================================================================================
[OK]   Docker Daemon: Running
[OK]   Docker Containers: All 4 containers running
[OK]   Container Stability: No excessive restarts detected

================================================================================
2. CONNECTIVITY
================================================================================
[OK]   External Connectivity: Internet reachable
[OK]   API Endpoint: Responding on port 3001
[WARN] Database Port: Cannot reach localhost:5432

================================================================================
3. DISK SPACE
================================================================================
[WARN] Root Disk Usage: 78% used (threshold: 85%)
[OK]   Log Directory Size: 245MB

================================================================================
4. MEMORY
================================================================================
[OK]   Memory Usage: 67% used
[OK]   Top Memory Process: root 512 node

[OK overall status]
```

## Troubleshooting

### Script not executing
```bash
# Check permissions
ls -l /path/to/scripts/pi-health-check.sh
# Should show: -rwxr-xr-x (executable)

# Run with bash explicitly
bash /path/to/scripts/pi-health-check.sh --verbose
```

### Email not sending
```bash
# Verify mail is installed
apt-get install mailutils

# Test mail
echo "Test" | mail -s "Subject" your-email@example.com

# Check mail config
cat /etc/ssmtp/ssmtp.conf
```

### Docker checks failing
```bash
# Verify docker is running
systemctl status docker

# Add user to docker group
usermod -aG docker $USER
```

### Cron not running
```bash
# Check crontab
crontab -l

# Check cron logs
grep CRON /var/log/syslog

# Make sure script is executable
chmod +x /path/to/scripts/pi-health-check.sh
```

## Integration Examples

### Discord
```bash
WEBHOOK_URL="https://discordapp.com/api/webhooks/YOUR_ID/YOUR_TOKEN"
./scripts/pi-health-check.sh --webhook "$WEBHOOK_URL"
```

### Slack
```bash
WEBHOOK_URL="https://hooks.slack.com/services/YOUR/ID/TOKEN"
./scripts/pi-health-check.sh --webhook "$WEBHOOK_URL"
```

### Custom Monitoring API
```bash
WEBHOOK_URL="https://monitoring.wise2.net/api/health-check"
./scripts/pi-health-check.sh --webhook "$WEBHOOK_URL"
```

## Performance

- **Runtime**: 10-30 seconds
- **CPU Impact**: Minimal (<5% peak)
- **Memory Impact**: <50MB
- **Disk I/O**: Minimal
- **Network**: 2-3 HTTP requests

Safe to run:
- ✅ Every 15 minutes
- ✅ Every 30 minutes
- ✅ Hourly
- ✅ During production hours

## Advanced Usage

### Parsing JSON Reports

```bash
# Get latest report
LATEST=$(find /tmp -name "pi-health-report-*.json" -mmin -120 | sort -r | head -1)

# Check overall status
jq '.overall_status' "$LATEST"

# Get specific check
jq '.checks.Docker_Daemon' "$LATEST"

# Export to CSV
jq -r '[] | to_entries | .[] | [.key, .value.status, .value.details] | @csv' "$LATEST"
```

### Custom Alerting

```bash
#!/bin/bash
# Alert on FAIL status only

./scripts/pi-health-check.sh > /tmp/report.txt

if grep -q "OVERALL STATUS: FAIL" /tmp/report.txt; then
    # Send alert
    curl -X POST your-alert-webhook \
        -d @/tmp/report.txt
fi
```

### Monitoring Dashboard Integration

```bash
# Generate Prometheus metrics from health check
./scripts/pi-health-check.sh | while read line; do
    if [[ $line =~ \[([A-Z]+)\] ]]; then
        status="${BASH_REMATCH[1]}"
        echo "wise2_health_status{check=\"$check\",status=\"$status\"} 1"
    fi
done
```

## Support & Documentation

- **Full Setup Guide**: See `PI_HEALTH_CHECK_SETUP.md`
- **Cron Examples**: See `crontab-example.txt`
- **Config Template**: See `.env.health-check.example`

---

**Last Updated**: 2026-07-23  
**Script Version**: 1.0  
**Compatibility**: Raspberry Pi OS (Debian-based), Ubuntu 20.04+
