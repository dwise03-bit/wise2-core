# WISE² Raspberry Pi Health Check System

## Overview

A production-grade health monitoring system for WISE² Raspberry Pi deployments that automatically monitors 10 critical areas of system and application health.

**Status**: Ready for deployment  
**Version**: 1.0  
**Last Updated**: 2026-07-23

## What's Included

| File | Purpose | Lines |
|------|---------|-------|
| `pi-health-check.sh` | Main health check script | 650 |
| `PI_HEALTH_CHECK_SETUP.md` | Comprehensive setup guide | Full installation & configuration |
| `HEALTH_CHECK_QUICK_REFERENCE.md` | Quick command reference | Commands, cron presets, troubleshooting |
| `HEALTH_CHECK_TESTING.md` | Pre-deployment testing guide | 10-step validation checklist |
| `crontab-example.txt` | Ready-to-use cron configurations | Multiple scheduling presets |
| `.env.health-check.example` | Configuration template | Environment variables reference |

## Quick Start (2 minutes)

```bash
# 1. Make executable
chmod +x /path/to/wise2-core/scripts/pi-health-check.sh

# 2. Test it
./scripts/pi-health-check.sh --verbose

# 3. Schedule it (add to crontab)
crontab -e
# Add: 0 * * * * /path/to/wise2-core/scripts/pi-health-check.sh --email
```

## Health Checks (10 Areas)

### 1. Service Status
- Docker daemon running
- All containers running
- Container restart count monitoring

### 2. Connectivity
- External internet connectivity
- API endpoint responsiveness
- Database port connectivity
- DNS resolution

### 3. Disk Space
- Root partition usage
- Log directory size
- Database growth monitoring

### 4. Memory
- System memory usage
- Top memory-consuming process tracking

### 5. Network
- API latency measurement
- Network interface status

### 6. Updates
- Available system updates (apt)
- Docker image updates

### 7. Backups
- Backup existence verification
- Backup freshness (<48 hours)
- Backup size monitoring

### 8. Logs
- Application error count (last hour)
- Crash detection (segfaults, core dumps)

### 9. SSL Certificates
- Certificate expiration dates
- Alert if <30 days until expiry
- Alert if expired

### 10. System Information
- CPU, memory, kernel version
- Uptime
- System load average

## Features

- ✅ **10 comprehensive health checks**
- ✅ **Multiple output formats** (text + JSON)
- ✅ **Email alerting** (with configurable thresholds)
- ✅ **Webhook integration** (Discord, Slack, custom)
- ✅ **Cron scheduling** (multiple preset intervals)
- ✅ **Detailed reporting** with actionable recommendations
- ✅ **Production-ready** with error handling
- ✅ **Fast execution** (<30 seconds typical)
- ✅ **Minimal system impact** (<5% CPU, <50MB RAM)
- ✅ **Cross-platform** (Raspberry Pi OS, Ubuntu, Debian)

## Alert Thresholds (Configurable)

| Metric | Default | Action |
|--------|---------|--------|
| Disk Usage | >85% | FAIL |
| Memory Usage | >90% | FAIL |
| Backup Age | >48 hours | FAIL |
| SSL Certificate | <30 days | WARN, Expired = FAIL |
| Log Errors | >10/hour | FAIL |

All thresholds can be customized via `.env.health-check`.

## Usage Examples

### Basic Run
```bash
./scripts/pi-health-check.sh
```

### Verbose Output
```bash
./scripts/pi-health-check.sh --verbose
```

### Email Report
```bash
./scripts/pi-health-check.sh --email
```

### Webhook Report
```bash
./scripts/pi-health-check.sh --webhook https://hooks.slack.com/services/YOUR/ID
```

### All Options
```bash
./scripts/pi-health-check.sh --email --webhook https://your-webhook-url --verbose
```

## Cron Scheduling

### Hourly (Recommended)
```bash
0 * * * * /path/to/wise2-core/scripts/pi-health-check.sh --email
```

### Every 30 Minutes
```bash
*/30 * * * * /path/to/wise2-core/scripts/pi-health-check.sh
```

### Multiple Schedules
```bash
# Quick checks every 30 minutes
*/30 * * * * /path/to/wise2-core/scripts/pi-health-check.sh

# Email summary daily
0 9 * * * /path/to/wise2-core/scripts/pi-health-check.sh --email

# Deep analysis weekly
0 8 * * 1 /path/to/wise2-core/scripts/pi-health-check.sh --email --verbose
```

See `crontab-example.txt` for more presets.

## Output

### Text Report
**Location**: `logs/health-check-YYYYMMDD-HHMMSS.txt`

Human-readable summary with all checks, thresholds, and recommendations.

### JSON Report
**Location**: `/tmp/pi-health-report-TIMESTAMP.json`

Machine-readable format for integration with monitoring systems.

### Exit Codes
- `0` — OK or WARNING (healthy)
- `1` — FAIL (critical issue)

## Configuration

### Optional: Environment Variables

```bash
# Copy template
cp scripts/.env.health-check.example scripts/.env.health-check

# Edit as needed
nano scripts/.env.health-check

# Load in crontab
source /path/to/.env.health-check && /path/to/scripts/pi-health-check.sh --email
```

**Customizable Settings**:
- Email address for alerts
- API endpoint URL
- Database host/port
- Webhook URL
- Alert thresholds (disk, memory, backups, SSL)
- Backup directory location

## Deployment Checklist

- [ ] Copy `pi-health-check.sh` to `/scripts/`
- [ ] Make executable: `chmod +x`
- [ ] Test locally: `./scripts/pi-health-check.sh --verbose`
- [ ] Review configuration (`.env.health-check.example`)
- [ ] Setup email (if using `--email` flag)
- [ ] Setup webhook URL (if using `--webhook`)
- [ ] Add to crontab: `crontab -e`
- [ ] Verify cron is running: `crontab -l`
- [ ] Monitor logs for 24 hours
- [ ] Adjust alert thresholds as needed

## Integration Examples

### Discord
```bash
DISCORD_WEBHOOK="https://discordapp.com/api/webhooks/YOUR_ID/YOUR_TOKEN"
./scripts/pi-health-check.sh --webhook "$DISCORD_WEBHOOK"
```

### Slack
```bash
SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/ID/TOKEN"
./scripts/pi-health-check.sh --webhook "$SLACK_WEBHOOK"
```

### Custom Monitoring
```bash
MONITOR_URL="https://monitoring.wise2.net/api/health-check"
./scripts/pi-health-check.sh --webhook "$MONITOR_URL"
```

## Troubleshooting

### Script Won't Run
```bash
# Check permissions
ls -l /path/to/scripts/pi-health-check.sh
# Should show: -rwxr-xr-x

# Run with bash
bash /path/to/scripts/pi-health-check.sh --verbose
```

### Email Not Sending
```bash
# Install mail utilities
apt-get install mailutils

# Test mail
echo "Test" | mail -s "Subject" your-email@example.com
```

### Docker Checks Failing
```bash
# Verify Docker is installed
which docker

# Add user to docker group
usermod -aG docker $USER
```

### Cron Not Executing
```bash
# Check crontab
crontab -l

# Check cron logs
grep CRON /var/log/syslog | tail -20

# Ensure script is executable
chmod +x /path/to/scripts/pi-health-check.sh
```

For detailed troubleshooting, see:
- `PI_HEALTH_CHECK_SETUP.md` — Full setup & configuration guide
- `HEALTH_CHECK_QUICK_REFERENCE.md` — Command reference & common issues
- `HEALTH_CHECK_TESTING.md` — Pre-deployment testing procedures

## Performance

| Metric | Value |
|--------|-------|
| Typical Runtime | 10-30 seconds |
| CPU Peak | <5% |
| Memory Usage | <50MB |
| Network Requests | 2-3 HTTP calls |
| Cron Frequency | Safe every 15 minutes |

Safe to run hourly on production systems.

## File Structure

```
scripts/
├── pi-health-check.sh                    # Main script (650 lines)
├── README_HEALTH_CHECK.md                # This file
├── PI_HEALTH_CHECK_SETUP.md              # Setup & configuration guide
├── HEALTH_CHECK_QUICK_REFERENCE.md       # Quick reference & commands
├── HEALTH_CHECK_TESTING.md               # Pre-deployment testing
├── crontab-example.txt                   # Ready-to-use cron configs
└── .env.health-check.example             # Configuration template
```

## Documentation

| Document | Purpose |
|----------|---------|
| `README_HEALTH_CHECK.md` | Overview & quick start (this file) |
| `PI_HEALTH_CHECK_SETUP.md` | Complete setup, config, and integration guide |
| `HEALTH_CHECK_QUICK_REFERENCE.md` | Command reference, cron presets, troubleshooting |
| `HEALTH_CHECK_TESTING.md` | Pre-deployment validation checklist |

## Key Capabilities

### Comprehensive Monitoring
Tracks 10 critical system areas with detailed reporting and actionable alerts.

### Flexible Alerting
- Email notifications (system mail)
- Webhook integration (Discord, Slack, custom APIs)
- Exit codes for integration with external monitoring

### Production Ready
- Error handling & robustness
- Minimal performance impact
- Compatible with Raspberry Pi OS and Ubuntu
- Extensive documentation

### Easy Scheduling
- Multiple cron presets provided
- Works with systemd timers
- Compatible with pm2 for persistent scheduling

### Customizable Thresholds
All alert thresholds can be adjusted via environment variables without modifying the script.

## Next Steps

1. **Read**: `PI_HEALTH_CHECK_SETUP.md` for complete setup instructions
2. **Test**: Run `./scripts/pi-health-check.sh --verbose` to verify
3. **Configure**: Customize `.env.health-check` if needed
4. **Deploy**: Add to crontab using presets from `crontab-example.txt`
5. **Monitor**: Check logs in `logs/` directory for ongoing health

## Support

For questions or issues:

1. Check `HEALTH_CHECK_QUICK_REFERENCE.md` for common issues
2. Review `HEALTH_CHECK_TESTING.md` for validation procedures
3. Consult `PI_HEALTH_CHECK_SETUP.md` for detailed configuration
4. Review script comments in `pi-health-check.sh` for implementation details

Contact: dwise03@gmail.com

---

**Version**: 1.0  
**Status**: Production Ready  
**Last Updated**: 2026-07-23  
**Compatibility**: Raspberry Pi OS, Ubuntu 20.04+, Debian 11+
