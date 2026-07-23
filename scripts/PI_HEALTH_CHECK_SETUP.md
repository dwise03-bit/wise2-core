# WISE² Raspberry Pi Health Check Setup Guide

## Overview

The `pi-health-check.sh` script performs comprehensive system and application health monitoring on Raspberry Pi deployments, including:
- Docker container status and stability
- Connectivity checks (Internet, API, database)
- Disk space and usage trends
- Memory and CPU metrics
- Network latency
- Available system/container updates
- Backup verification
- Application log analysis
- SSL certificate expiration

## Quick Start

### 1. Make Script Executable

```bash
chmod +x /path/to/scripts/pi-health-check.sh
```

### 2. Test the Script

```bash
# Basic run with verbose output
./scripts/pi-health-check.sh --verbose

# With email reporting (requires mail configured)
./scripts/pi-health-check.sh --email --verbose

# With webhook reporting
./scripts/pi-health-check.sh --webhook https://your-webhook-url --verbose

# All options
./scripts/pi-health-check.sh --email --webhook https://your-webhook-url --verbose
```

### 3. Schedule via Cron

#### Option A: Hourly Health Checks with Email

```bash
# Edit crontab
crontab -e

# Add this line for hourly checks
0 * * * * /path/to/wise2-core/scripts/pi-health-check.sh --email >> /var/log/wise2-health-check.log 2>&1

# Save and exit (Ctrl+X, then Y in nano)
```

#### Option B: Multiple Schedules

```bash
# Frequent checks (every 30 minutes)
*/30 * * * * /path/to/wise2-core/scripts/pi-health-check.sh >> /var/log/wise2-health-check.log 2>&1

# Daily summary email (9 AM UTC)
0 9 * * * /path/to/wise2-core/scripts/pi-health-check.sh --email >> /var/log/wise2-health-check.log 2>&1

# Weekly deep report (Monday 8 AM UTC)
0 8 * * 1 /path/to/wise2-core/scripts/pi-health-check.sh --email --verbose >> /var/log/wise2-health-check.log 2>&1
```

#### Option C: Using pm2 (Persistent across reboots)

```bash
# Install pm2 if not already installed
npm install -g pm2

# Create ecosystem file
cat > /path/to/wise2-core/scripts/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'pi-health-check-hourly',
      script: '/path/to/wise2-core/scripts/pi-health-check.sh',
      args: '--email',
      cron: '0 * * * *',  // Every hour
      instances: 1,
      env: {
        ALERT_EMAIL: 'dwise03@gmail.com'
      }
    }
  ]
};
EOF

# Start pm2 service
pm2 start /path/to/wise2-core/scripts/ecosystem.config.js

# Save pm2 startup
pm2 save
pm2 startup

# Check status
pm2 status
```

## Configuration

### Environment Variables

Create a `.env.health-check` file in the project root:

```bash
# Email configuration
ALERT_EMAIL=dwise03@gmail.com
MAIL_FROM=pi-health@wise2.net

# API configuration
API_ENDPOINT=http://localhost:3001/health
CLOUD_API=api.wise2.net

# Database configuration
DB_HOST=localhost
DB_PORT=5432

# Webhook configuration (optional)
WEBHOOK_URL=https://your-webhook-endpoint.com/health-check

# Alert thresholds (optional)
DISK_WARN_PCT=85
MEMORY_WARN_PCT=90
BACKUP_MAX_AGE_HOURS=48
CERT_WARN_DAYS=30
ERROR_THRESHOLD_HOUR=10
```

Load in your cron job:

```bash
# In crontab
0 * * * * source /path/to/wise2-core/.env.health-check && /path/to/wise2-core/scripts/pi-health-check.sh --email
```

### Email Configuration

The script uses the system `mail` command. On Raspberry Pi:

```bash
# Install mail utilities
sudo apt-get install mailutils ssmtp

# Configure SSMTP
sudo nano /etc/ssmtp/ssmtp.conf

# Add your email configuration:
# root=dwise03@gmail.com
# mailhub=smtp.gmail.com:587
# AuthUser=your-email@gmail.com
# AuthPass=your-app-password
# UseSTARTTLS=YES
# FromLineOverride=YES
```

### Webhook Configuration

Send reports to a webhook endpoint (e.g., Discord, Slack, custom server):

```bash
# Example: Discord webhook
./scripts/pi-health-check.sh --webhook https://discordapp.com/api/webhooks/YOUR_WEBHOOK_ID

# Example: Slack webhook
./scripts/pi-health-check.sh --webhook https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Example: Custom API
./scripts/pi-health-check.sh --webhook https://monitoring.wise2.net/api/health-check
```

## Output and Logging

### Text Report

Reports are saved to `/logs/health-check-YYYYMMDD-HHMMSS.txt`:

```
WISE² Raspberry Pi Health Check Report
========================================
Timestamp: Thu Jul 23 10:30:15 UTC 2026
Hostname: wise2-pi-01
Uptime: 42 days, 3:25

OVERALL STATUS: WARN

Detailed Results:
=================
[OK]   Docker Daemon: Running
[WARN] Docker Containers: Running: 4/5. Failed: api (exited)
[OK]   External Connectivity: Internet reachable
[FAIL] Root Disk Usage: 92% used (threshold: 85%)
[OK]   Memory Usage: 67% used
[OK]   API Latency: 45ms
...
```

### JSON Report

For integration with monitoring systems, a JSON report is generated:

```json
{
  "timestamp": "2026-07-23T10:30:15Z",
  "hostname": "wise2-pi-01",
  "overall_status": "WARN",
  "checks": {
    "Docker_Daemon": {"status": "OK", "details": "Running"},
    "Docker_Containers": {"status": "WARN", "details": "Running: 4/5. Failed: api (exited)"},
    "Root_Disk_Usage": {"status": "FAIL", "details": "92% used (threshold: 85%)"},
    ...
  }
}
```

## Health Check Details

### 1. Service Status

- **Docker Daemon**: Verifies Docker daemon is running
- **Docker Containers**: Checks all containers are in `running` state
- **Container Stability**: Alerts if containers restart too frequently (>2 restarts)

### 2. Connectivity

- **External Connectivity**: Ping 8.8.8.8 to verify internet access
- **API Endpoint**: HTTP GET to `/health` endpoint
- **Database Port**: TCP connection test to database port
- **DNS Resolution**: Test DNS lookup capability

### 3. Disk Space

- **Root Usage**: Alert if >85% used (configurable)
- **Log Directory**: Warn if logs exceed 500MB
- **Database Size**: Track database size growth

### 4. Memory

- **Memory Usage**: Alert if >90% used (configurable)
- **Top Process**: Display highest memory consumer

### 5. Network

- **API Latency**: Measure round-trip time to cloud API
- **Network Interface**: Check if eth0/wlan0 is UP

### 6. Updates

- **System Updates**: Count available apt updates
- **Docker Images**: Check for new image versions

### 7. Backups

- **Latest Backup**: Verify most recent backup exists
- **Freshness**: Alert if older than 48 hours
- **Backup Size**: Display backup file size

### 8. Logs

- **Error Count**: Count ERROR/Exception/FATAL in logs (last hour)
- **Crash Detection**: Search for segfaults or core dumps

### 9. SSL Certificates

- **Certificate Expiry**: Check all `.crt` and `.pem` files
- **Expiring Soon**: Alert if <30 days until expiry
- **Expired**: Alert if certificate has expired

## Interpreting Results

### Status Levels

| Status | Meaning | Action |
|--------|---------|--------|
| **OK** | All is well | No action needed |
| **WARN** | Minor issue, monitor closely | Investigate soon, may not be urgent |
| **FAIL** | Critical issue | Immediate attention required |

### Overall Status

- **OK**: All checks passed
- **WARN**: At least one warning, no failures
- **FAIL**: At least one failure detected

## Troubleshooting

### Script Won't Run

```bash
# Verify permissions
ls -la /path/to/scripts/pi-health-check.sh
# Should show: -rwxr-xr-x

# Check bash availability
which bash

# Run with explicit bash
bash /path/to/scripts/pi-health-check.sh --verbose
```

### Mail Not Sending

```bash
# Check if mail is installed
which mail

# Test mail delivery
echo "Test" | mail -s "Test Subject" your-email@example.com

# Check mail logs
tail -50 /var/log/syslog | grep -i mail
```

### Docker Checks Fail

```bash
# Verify docker is installed and running
sudo systemctl status docker

# Check docker permissions
sudo usermod -aG docker $USER
newgrp docker

# Verify docker ps works
docker ps
```

### Database Connection Issues

```bash
# For PostgreSQL, verify connectivity
psql -h localhost -p 5432 -U user -d database -c "SELECT 1"

# For MySQL, test connection
mysql -h localhost -u user -p database -e "SELECT 1"
```

## Integration Examples

### Send to Discord

```bash
# Create a webhook in Discord server settings
# Then run:
./scripts/pi-health-check.sh --webhook https://discordapp.com/api/webhooks/YOUR_ID/YOUR_TOKEN
```

### Send to Slack

```bash
# Create incoming webhook in Slack app settings
./scripts/pi-health-check.sh --webhook https://hooks.slack.com/services/YOUR/ID
```

### Send to Custom Monitoring Service

```bash
# Implement webhook receiver:
# POST /api/health-check with JSON body
./scripts/pi-health-check.sh --webhook https://monitoring.wise2.net/api/health-check
```

### Grafana Integration

Store JSON reports and query with:

```bash
# Query latest health status
cat /tmp/pi-health-report-*.json | jq '.overall_status'

# Parse into Prometheus metrics
find /tmp -name "pi-health-report-*.json" -mmin -60 | xargs cat | jq '...'
```

## Performance Notes

- Script completes in ~10-30 seconds depending on system load
- Suitable for running every 30 minutes or hourly
- Minimal CPU/memory footprint during execution
- Reports stored in `/tmp` and project `/logs` directory

## See Also

- [Deployment Guide](../DEPLOYMENT_GUIDE.md)
- [Production Checklist](../PRODUCTION_CHECKLIST.md)
- [Docker Compose Config](../docker-compose.prod.yml)

---

**Last Updated**: 2026-07-23  
**Maintainer**: WISE² Infrastructure Team  
**Support**: dwise03@gmail.com
