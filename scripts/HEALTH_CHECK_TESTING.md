# Health Check Script - Testing & Validation Guide

## Pre-Deployment Testing Checklist

Use this guide to verify the health check script works correctly before deploying to production.

## 1. Basic Functionality Test

### Test 1.1: Script Execution

```bash
# Make script executable
chmod +x /path/to/scripts/pi-health-check.sh

# Run with verbose output
/path/to/scripts/pi-health-check.sh --verbose

# Expected output:
# - Should complete in <30 seconds
# - Should display all 10 check sections
# - Should show status [OK], [WARN], or [FAIL] for each check
# - Should display OVERALL STATUS at the end
```

### Test 1.2: Exit Codes

```bash
# Test exit code on success (OK/WARN)
/path/to/scripts/pi-health-check.sh --verbose
echo "Exit code: $?"
# Expected: 0 for OK/WARN

# Test exit code on failure (FAIL)
# (May require creating a failure condition)
echo "Exit code after FAIL: $?"
# Expected: 1 for FAIL
```

### Test 1.3: Help & Arguments

```bash
# Test invalid argument handling
/path/to/scripts/pi-health-check.sh --invalid

# Expected: Error message about unknown option

# Test all valid options
/path/to/scripts/pi-health-check.sh --verbose --email --webhook "http://test"
# Expected: Should execute without errors
```

## 2. Output Testing

### Test 2.1: Text Report

```bash
# Check text report is created
/path/to/scripts/pi-health-check.sh

# Verify report file exists and contains expected content
REPORT=$(find /tmp -name "pi-health-report-*.txt" -mmin -1 | head -1)
ls -lh "$REPORT"

# Expected:
# - File size > 1KB
# - Contains timestamp
# - Contains hostname
# - Contains all check sections

# Verify content
cat "$REPORT" | head -20
# Should show header with timestamp and hostname
```

### Test 2.2: JSON Report

```bash
# Verify JSON report is valid
REPORT_JSON=$(find /tmp -name "pi-health-report-*.json" -mmin -1 | head -1)

# Parse JSON to verify it's valid
jq '.' "$REPORT_JSON"

# Expected: Valid JSON structure with:
# - timestamp
# - hostname
# - overall_status
# - checks object with all check results

# Verify JSON fields
jq '.overall_status' "$REPORT_JSON"
jq '.checks | keys | length' "$REPORT_JSON"
```

### Test 2.3: Log Directory

```bash
# Verify logs are saved correctly
ls -lh /path/to/wise2-core/logs/health-check-*.txt | head -5

# Expected:
# - Multiple dated log files
# - Each >1KB in size
# - Newest file is most recent run
```

## 3. Check-Specific Testing

### Test 3.1: Service Status Checks

```bash
# Docker should be installed and running
which docker
docker ps

# Check output should show:
# [OK]   Docker Daemon: Running
# [OK]   Docker Containers: All X containers running

# If Docker is not installed, check should show:
# [FAIL] Docker Installation: Docker not installed
```

### Test 3.2: Connectivity Checks

```bash
# Internet should be reachable
ping -c 1 8.8.8.8

# Database should be reachable (if configured)
nc -zv localhost 5432  # or your DB port

# Check output should show:
# [OK]   External Connectivity: Internet reachable
# [OK/WARN/FAIL] Database Port: ...
```

### Test 3.3: Disk Space Checks

```bash
# Check disk usage
df -h /

# Should show current usage
# If >85%, check should show FAIL
# If 75-85%, check should show WARN

# Verify log directory
du -sh /path/to/wise2-core/logs/

# Should show size accurately
```

### Test 3.4: Memory Checks

```bash
# Check memory usage
free -h

# Should accurately report memory usage
# If >90%, check should show FAIL
# If 80-90%, check should show WARN
```

### Test 3.5: Backup Checks

```bash
# Create test backup
mkdir -p /path/to/wise2-core/backups
touch /path/to/wise2-core/backups/test-backup-$(date +%s).tar.gz

# Run health check
/path/to/scripts/pi-health-check.sh --verbose

# Should show:
# [OK]   Latest Backup: Latest backup is Xh old
# [OK]   Latest Backup Size: ...MB

# Test old backup detection
touch -d "3 days ago" /path/to/wise2-core/backups/old-backup.tar.gz
/path/to/scripts/pi-health-check.sh --verbose

# Should show:
# [FAIL] Backup Freshness: Latest backup is 72h old (max: 48h)
```

### Test 3.6: Log/Error Checks

```bash
# Create test log file with errors
mkdir -p /path/to/wise2-core/logs
echo "[2026-07-23 10:30:15] ERROR: Test error 1" >> /path/to/wise2-core/logs/application.log
echo "[2026-07-23 10:31:15] ERROR: Test error 2" >> /path/to/wise2-core/logs/application.log

# Run health check
/path/to/scripts/pi-health-check.sh --verbose

# Should count errors and report status
```

### Test 3.7: SSL Certificate Checks

```bash
# Create test certificate directory
mkdir -p /path/to/wise2-core/certs

# Create self-signed test cert (valid for 30 days)
openssl req -x509 -newkey rsa:2048 -keyout /path/to/wise2-core/certs/test.key \
    -out /path/to/wise2-core/certs/test.crt -days 30 -nodes -subj "/CN=localhost"

# Run health check
/path/to/scripts/pi-health-check.sh --verbose

# Should show:
# [WARN] Certificate test.crt: Valid for 30 days

# Test expired certificate
openssl req -x509 -newkey rsa:2048 -keyout /path/to/wise2-core/certs/expired.key \
    -out /path/to/wise2-core/certs/expired.crt -days 0 -nodes -subj "/CN=localhost"

# Should show:
# [FAIL] Certificate expired.crt: Expired X days ago
```

## 4. Integration Testing

### Test 4.1: Email Integration

```bash
# Setup test email
export ALERT_EMAIL="test@example.com"

# Run with email flag
/path/to/scripts/pi-health-check.sh --email --verbose

# Expected:
# - Script completes successfully
# - Email is sent (verify with mail logs)

# Check mail logs
tail -20 /var/log/syslog | grep -i mail

# If mail not configured, should show:
# Mail not configured. Cannot send email report.
```

### Test 4.2: Webhook Integration

```bash
# Test with echo server (for testing)
# In one terminal, start a simple HTTP server:
# python3 -m http.server 8888

# In another terminal, run health check with webhook
/path/to/scripts/pi-health-check.sh --webhook "http://localhost:8888/health" --verbose

# Expected:
# - Script completes successfully
# - Webhook is called (check server logs)
# - JSON report is sent to webhook
```

### Test 4.3: Discord Integration (if applicable)

```bash
# Test with Discord webhook
DISCORD_WEBHOOK="https://discordapp.com/api/webhooks/YOUR_ID/YOUR_TOKEN"

/path/to/scripts/pi-health-check.sh --webhook "$DISCORD_WEBHOOK" --verbose

# Expected:
# - Script completes successfully
# - Message appears in Discord channel
# - JSON report is included
```

## 5. Error Condition Testing

### Test 5.1: Missing Docker

```bash
# Temporarily hide docker (for testing only)
DOCKER_PATH=$(which docker)
sudo mv $DOCKER_PATH ${DOCKER_PATH}.bak

# Run health check
/path/to/scripts/pi-health-check.sh --verbose

# Expected:
# [FAIL] Docker Installation: Docker not installed

# Restore docker
sudo mv ${DOCKER_PATH}.bak $DOCKER_PATH
```

### Test 5.2: No Internet Connection (Simulate)

```bash
# Test DNS failure detection
# (Difficult to simulate without breaking network, skip in production)

# Expected behavior when internet is down:
# [FAIL] External Connectivity: Cannot reach external network
# [FAIL] DNS Resolution: Cannot resolve DNS
```

### Test 5.3: Full Disk Simulation

```bash
# Check current disk usage
df -h /

# If >85%, health check will show FAIL
# To test on a system with low usage:
# - Add a large test file, or
# - Modify the script to use a lower threshold temporarily

# Restore disk usage to normal
```

## 6. Performance Testing

### Test 6.1: Execution Time

```bash
# Measure script execution time
time /path/to/scripts/pi-health-check.sh --verbose

# Expected:
# - real: <30 seconds
# - user: <2 seconds
# - sys: <1 second
```

### Test 6.2: System Impact

```bash
# Monitor system during health check
# Terminal 1:
/path/to/scripts/pi-health-check.sh --verbose

# Terminal 2 (during execution):
watch -n 0.1 'ps aux | grep pi-health'
htop -p $PID

# Expected:
# - CPU usage: <50%
# - Memory usage: <50MB
# - No hang or timeout
```

### Test 6.3: Cron Integration

```bash
# Create test cron job
echo "*/5 * * * * /path/to/scripts/pi-health-check.sh >> /tmp/health-check-test.log 2>&1" | crontab -

# Wait 5+ minutes and check logs
tail -50 /tmp/health-check-test.log

# Expected:
# - Script runs every 5 minutes
# - Each run completes successfully
# - No errors in output

# Remove test cron job
crontab -e  # Remove the test line
```

## 7. Report Validation

### Test 7.1: Text Report Format

```bash
# Get latest report
REPORT=$(find /tmp -name "pi-health-report-*.txt" -mmin -1 | head -1)

# Check required sections
grep -E "SERVICE STATUS|CONNECTIVITY|DISK SPACE|MEMORY" "$REPORT"

# Expected: All sections present

# Verify format
head -10 "$REPORT" | grep -E "WISE²|Timestamp|Hostname|Uptime"
```

### Test 7.2: JSON Report Validation

```bash
# Get latest JSON report
REPORT_JSON=$(find /tmp -name "pi-health-report-*.json" -mmin -1 | head -1)

# Validate JSON structure
jq 'keys' "$REPORT_JSON"
# Expected: ["timestamp", "hostname", "overall_status", "checks"]

# Check all checks have status and details
jq '.checks | to_entries[] | select(.value.status == null)' "$REPORT_JSON"
# Expected: Empty (no results)
```

## 8. Pre-Production Checklist

Before deploying to production, verify:

- [ ] Script is executable (`chmod +x`)
- [ ] Script completes successfully (`--verbose` test)
- [ ] Exit codes are correct (0 for OK/WARN, 1 for FAIL)
- [ ] Text report is generated and readable
- [ ] JSON report is valid and parseable
- [ ] Email integration works (if enabled)
- [ ] Webhook integration works (if enabled)
- [ ] All 10 check sections appear in output
- [ ] Performance is acceptable (<30s execution time)
- [ ] System load impact is minimal (<5% CPU)
- [ ] Cron scheduling works correctly
- [ ] Logs are saved to correct directory
- [ ] No unhandled errors or crashes
- [ ] Configuration template is in place

## 9. Deployment Steps

Once testing is complete:

```bash
# 1. Copy script to production location
cp /path/to/scripts/pi-health-check.sh /production/path/

# 2. Make executable
chmod +x /production/path/scripts/pi-health-check.sh

# 3. Setup configuration (if needed)
cp /path/to/scripts/.env.health-check.example /production/path/.env.health-check
# Edit .env.health-check with production values

# 4. Setup cron jobs
crontab -e
# Add hourly: 0 * * * * /production/path/scripts/pi-health-check.sh --email

# 5. Verify cron is running
crontab -l

# 6. Monitor logs
tail -f /var/log/wise2-health-check.log
```

## 10. Production Monitoring

### Initial 24 Hours

```bash
# Monitor cron execution
grep pi-health-check /var/log/syslog

# Check report generation
ls -lt /path/to/wise2-core/logs/health-check-*.txt | head -10

# Verify no errors
grep -i error /var/log/wise2-health-check.log
```

### Ongoing

```bash
# Set up daily email digest (optional)
# In CLAUDE.md, add task to check logs daily

# Monitor for false positives
# Adjust thresholds if needed in .env.health-check

# Archive old reports weekly
find /path/to/wise2-core/logs -name "health-check-*.txt" -mtime +30 -delete
```

---

## Support

If tests fail, check:

1. **Script permissions**: `ls -l /path/to/scripts/pi-health-check.sh`
2. **Dependencies**: `which bash`, `which docker`, `which mail`
3. **Log directory**: `mkdir -p /path/to/wise2-core/logs`
4. **Cron service**: `systemctl status cron`

For issues, review:
- `PI_HEALTH_CHECK_SETUP.md` — Full setup guide
- `HEALTH_CHECK_QUICK_REFERENCE.md` — Quick reference
- Script comments in `pi-health-check.sh`

---

**Last Updated**: 2026-07-23  
**Testing Protocol Version**: 1.0
