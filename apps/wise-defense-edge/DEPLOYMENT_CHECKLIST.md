# WISE DEFENSE DEPLOYMENT CHECKLIST

Pre-deployment verification and testing.

---

## PRE-DEPLOYMENT (Before Running Installer)

### Hardware
- [ ] Raspberry Pi 3B+ or newer
- [ ] microSD card with Raspberry Pi OS (32-bit or 64-bit)
- [ ] 5V 2.5A power supply
- [ ] Ethernet or WiFi connectivity
- [ ] 2GB swap configured (`dphys-swapfile`)

### Network
- [ ] Internet connectivity verified
- [ ] SSH access to Pi (or local console)
- [ ] DNS resolution working (`ping 8.8.8.8`)
- [ ] 2GB free disk space available
- [ ] sudo access enabled

### Optional Hardware
- [ ] RTL-SDR USB device (for spectrum monitoring)
- [ ] Meshtastic device (for mesh radio)
- [ ] USB GPS module (for location)

---

## INSTALLATION (Run Installer)

```bash
# On Raspberry Pi:
sudo bash /path/to/install-wise2-defense.sh
```

Installer will:
- [ ] Detect OS (Raspberry Pi OS)
- [ ] Check disk space (2GB minimum)
- [ ] Install dependencies (Python, git, curl, etc.)
- [ ] Create wise2 user
- [ ] Create directory structure
- [ ] Initialize SQLite database
- [ ] Create Python venv
- [ ] Install pip packages
- [ ] Generate environment configuration
- [ ] Install systemd services
- [ ] Test API startup
- [ ] Produce verification report

---

## POST-INSTALLATION (Verification)

### API Connectivity
```bash
curl http://localhost:3014/health
# Expected response:
# {"status": "OPERATIONAL", "device_id": "...", "timestamp": "..."}
```
- [ ] API responds with 200 OK
- [ ] Status is "OPERATIONAL"
- [ ] Device ID is present
- [ ] Timestamp is current

### Database
```bash
sqlite3 /opt/wise2-defense/data/wise2-defense.db \
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```
- [ ] 8 tables present: incidents, watch_zones, alerts, mesh_nodes, mesh_telemetry, sdr_signals, system_events, sync_queue
- [ ] Database file is readable by wise2 user

### Service Status
```bash
systemctl status wise2-defense
```
- [ ] Service is active (running)
- [ ] No error messages
- [ ] Restart count is 0 or stable

### Logs
```bash
journalctl -u wise2-defense -n 10
```
- [ ] Last 10 log entries visible
- [ ] No ERROR messages
- [ ] "WISE Defense Edge Intelligence Node starting..." present

### File Permissions
```bash
ls -la /opt/wise2-defense/
ls -la /var/log/wise2-defense/
```
- [ ] wise2 user owns /opt/wise2-defense/
- [ ] wise2 user owns /var/log/wise2-defense/
- [ ] Permissions are 755 (directories), 644 (files)

---

## FUNCTIONAL TESTS

### Test 1: Create Watch Zone
```bash
API_KEY=$(grep WISE_DEFENSE_API_KEY /opt/wise2-defense/.env | cut -d= -f2)

curl -X POST http://localhost:3014/api/watch-zones \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Zone",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "radius_miles": 1.0,
    "kind": "CUSTOM"
  }'
```
- [ ] Response: 200 OK
- [ ] Returns zone ID
- [ ] Zone name is "Test Zone"

### Test 2: Create Incident
```bash
curl -X POST http://localhost:3014/api/incidents \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "test",
    "headline": "Test Incident",
    "category": "police",
    "incident_type": "test",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "approximate_location": "Test Location"
  }'
```
- [ ] Response: 200 OK
- [ ] Returns incident ID
- [ ] Threat level is calculated (LOW, ELEVATED, HIGH)

### Test 3: List Incidents
```bash
curl http://localhost:3014/api/incidents \
  -H "x-api-key: $API_KEY"
```
- [ ] Response: 200 OK
- [ ] Returns array of incidents
- [ ] Test incident is included

### Test 4: System Health
```bash
curl http://localhost:3014/api/system/health \
  -H "x-api-key: $API_KEY"
```
- [ ] Response: 200 OK
- [ ] cpu_percent is a number
- [ ] memory_percent is a number
- [ ] disk_percent is a number
- [ ] temperature (if available) is a number

### Test 5: Dashboard
```bash
curl http://localhost:3014/api/dashboard \
  -H "x-api-key: $API_KEY"
```
- [ ] Response: 200 OK
- [ ] Returns incidents array
- [ ] Returns mesh_nodes array
- [ ] Returns alerts array
- [ ] Returns timestamp

---

## HARDWARE TESTS (If Applicable)

### RTL-SDR Device
```bash
lsusb | grep RTL
```
- [ ] Device appears in lsusb output
- [ ] Device ID: 0bda:2838

### Meshtastic Device
```bash
lsusb | grep SEGGER
```
- [ ] Device appears in lsusb output
- [ ] Device ID: 1366:0105

### GPS Device
```bash
ls /dev/ttyUSB*
```
- [ ] USB serial device appears
- [ ] Readable by wise2 user

---

## REBOOT TEST

Test that service auto-starts after reboot:

```bash
sudo reboot
# ... wait 30 seconds ...
```

After reboot:
```bash
curl http://localhost:3014/health
systemctl status wise2-defense
```
- [ ] API responds with 200 OK
- [ ] Service status is active (running)
- [ ] No errors in logs

---

## CONFIGURATION TESTS

### Environment Variables
```bash
cat /opt/wise2-defense/.env
```
- [ ] WISE_DEFENSE_DEVICE_ID is set
- [ ] WISE_DEFENSE_API_PORT is 3014
- [ ] WISE_DEFENSE_API_KEY is non-empty

### Device Configuration
```bash
cat /opt/wise2-defense/config/device.yaml
```
- [ ] Device ID matches
- [ ] Location coordinates are valid
- [ ] Watch zones configured (if applicable)

---

## OPTIONAL: CLOUD CONNECTIVITY

### Tailscale (Optional)
```bash
which tailscale
tailscale status
```
- [ ] Tailscale installed (optional)
- [ ] Connected to Tailscale (if installed)
- [ ] Can ping cloud API endpoint (if configured)

### Cloud API Key (Optional)
```bash
grep CLOUD_API_KEY /opt/wise2-defense/.env
```
- [ ] If cloud sync desired, API key is set
- [ ] Cloud URL is configured

---

## DISASTER RECOVERY

### Backup Database
```bash
sudo -u wise2 cp /opt/wise2-defense/data/wise2-defense.db \
  /opt/wise2-defense/data/wise2-defense.db.backup
```
- [ ] Backup created
- [ ] Backup is readable

### View Logs
```bash
journalctl -u wise2-defense --all
```
- [ ] Full history accessible
- [ ] No truncated messages

### Manual Database Repair (if needed)
```bash
sudo -u wise2 sqlite3 /opt/wise2-defense/data/wise2-defense.db \
  "PRAGMA integrity_check;"
```
- [ ] Integrity check returns "ok"
- [ ] No corruption detected

---

## SECURITY CHECKS

### API Key Security
```bash
grep WISE_DEFENSE_API_KEY /opt/wise2-defense/.env
# Should NOT print or log the key
```
- [ ] API key is random (not "test" or "admin")
- [ ] API key is at least 32 characters

### File Permissions
```bash
stat /opt/wise2-defense/.env | grep Access
```
- [ ] .env file permissions are 0600 (read/write owner only)
- [ ] wise2 user can read but not other users

### Network Exposure
```bash
netstat -tuln | grep 3014
```
- [ ] API only listens on 0.0.0.0:3014 (or 127.0.0.1 if local-only)
- [ ] Not accidentally exposed to internet (use Tailscale for remote access)

---

## PERFORMANCE BASELINE

### Memory Usage
```bash
free -h
ps aux | grep python | grep wise2-defense
```
- [ ] System has ≥1GB available RAM
- [ ] API process uses <300MB

### Disk Usage
```bash
du -sh /opt/wise2-defense/
```
- [ ] Installation uses <500MB
- [ ] Database is small initially (<10MB)

### API Response Time
```bash
time curl -s http://localhost:3014/health > /dev/null
```
- [ ] Response time is <100ms
- [ ] No timeout errors

---

## FINAL APPROVAL

- [ ] All tests passed
- [ ] No error messages in logs
- [ ] API is responsive
- [ ] Database is functional
- [ ] Service auto-starts on reboot
- [ ] API key is secure
- [ ] File permissions are correct
- [ ] Optional hardware detected (if connected)
- [ ] Incident creation works
- [ ] Watch zones work
- [ ] System health reports accurately

---

## GO / NO-GO DECISION

### Ready for Production: YES / NO

**If NO**, list issues:
1. _____________________________________
2. _____________________________________
3. _____________________________________

**If YES**, production deployment is approved.

---

## SIGN-OFF

**Tested By**: _____________________  
**Date**: _____________________  
**Device ID**: _____________________  
**Pi Model**: _____________________  
**OS Version**: _____________________  

---

**WISE DEFENSE L.L.C.**  
**TRAIN. TEACH. PROTECT.**
