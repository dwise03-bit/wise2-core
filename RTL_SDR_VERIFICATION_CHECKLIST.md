# RTL-SDR Integration Verification Checklist

Use this checklist to verify the RTL-SDR integration is working correctly end-to-end.

**Date Verified**: _______________
**Verified By**: _______________
**Notes**: _______________

---

## Phase 1: RTL-SDR Hardware & Tools

- [ ] RTL-SDR receiver physically connected to Big Byte Pi
- [ ] USB device recognized: `lsusb | grep Realtek`
- [ ] rtl_power installed: `which rtl_power`
- [ ] rtl_power test passes: `rtl_test -t` (should complete without errors)
- [ ] Antenna connected to RTL-SDR connector
- [ ] No error messages in dmesg: `sudo dmesg | tail -20`

---

## Phase 2: WISE Defense API

### Database

- [ ] Database file exists: `ls -la /opt/wise2-defense/data/wise2-defense.db`
- [ ] Database readable: `sqlite3 /opt/wise2-defense/data/wise2-defense.db ".tables" | grep sdr`
- [ ] Tables created: `sdr_signals`, `alerts` tables present
- [ ] Schema correct: Check columns in sdr_signals table

```bash
sqlite3 /opt/wise2-defense/data/wise2-defense.db \
  ".schema sdr_signals"
```

### API Service

- [ ] WISE Defense API running: `curl http://localhost:3014/health`
- [ ] Response: `{"status": "OPERATIONAL", ...}`
- [ ] API logs accessible: `tail -f /var/log/wise2-defense/api.log`

### API Endpoints

- [ ] Health check works: `curl http://localhost:3014/health`

- [ ] Spectrum endpoint accessible:
```bash
curl -H "X-API-Key: YOUR_KEY" \
  http://localhost:3014/api/sdr/spectrum
```
Expected: `{"spectrum": [...], "total_signals": ...}`

- [ ] Frequencies endpoint works:
```bash
curl -H "X-API-Key: YOUR_KEY" \
  http://localhost:3014/api/sdr/frequencies
```
Expected: `{"frequencies": [...], "classified": {...}}`

- [ ] Alerts endpoint works:
```bash
curl -H "X-API-Key: YOUR_KEY" \
  http://localhost:3014/api/sdr/alerts
```
Expected: `{"alerts": [...], "count": N}`

---

## Phase 3: RTL-SDR Processor

### Processor Script

- [ ] Processor file exists: `ls -la /opt/wise2-defense/app/sdr_processor.py`
- [ ] File is executable: `chmod +x /opt/wise2-defense/app/sdr_processor.py`
- [ ] Python3 available: `which python3`
- [ ] Dependencies installed: `python3 -c "import requests; print('OK')"`

### Single Test Scan

Run a single spectrum scan to verify the processor works:

```bash
cd /opt/wise2-defense/app
python3 sdr_processor.py \
  --api-url http://localhost:3014 \
  --api-key YOUR_API_KEY \
  --once
```

- [ ] Script runs without errors
- [ ] Output shows "Running: rtl_power..."
- [ ] Output shows "Recorded X signals"
- [ ] No timeout errors
- [ ] API response success message

### Database Check After Scan

```bash
sqlite3 /opt/wise2-defense/data/wise2-defense.db \
  "SELECT COUNT(*) FROM sdr_signals WHERE detected_at > datetime('now', '-5 minutes');"
```

- [ ] Query returns count > 100 (signals recorded)
- [ ] Most recent signals are from last 5 minutes

### Processor Service

- [ ] Service file exists: `ls -la /etc/systemd/system/wise2-sdr-processor.service`
- [ ] Service enabled: `sudo systemctl is-enabled wise2-sdr-processor`
- [ ] Service running: `sudo systemctl is-active wise2-sdr-processor`
- [ ] Service status: `sudo systemctl status wise2-sdr-processor`
  - Expected: "active (running)"
- [ ] Logs accessible: `sudo journalctl -u wise2-sdr-processor -n 50`
- [ ] Logs show successful scans (every 10 seconds):
  - "Scanning spectrum..."
  - "Recorded X signals..."
- [ ] No error messages in logs

---

## Phase 4: Website API Routes

### Environment Variables

- [ ] `.env.production` has `WISE_DEFENSE_API_URL` set
- [ ] `.env.production` has `WISE_DEFENSE_API_KEY` set
- [ ] Values are not empty: `grep WISE_DEFENSE /path/to/.env.production`

### Route Testing

Test from website server:

```bash
# Test spectrum route
curl http://localhost:3000/api/sdr/spectrum 2>&1

# Test frequencies route
curl http://localhost:3000/api/sdr/frequencies 2>&1

# Test alerts route
curl http://localhost:3000/api/sdr/alerts 2>&1
```

- [ ] Spectrum route returns JSON with spectrum data
- [ ] Frequencies route returns JSON with frequencies
- [ ] Alerts route returns JSON with alerts array
- [ ] No CORS errors
- [ ] No 404 errors
- [ ] No 500 server errors

### HTTPS Test (Production)

```bash
# From another machine
curl https://wisedefensellc.com/api/sdr/spectrum
```

- [ ] Returns valid JSON
- [ ] HTTPS works (no cert errors)
- [ ] Response time < 500ms

---

## Phase 5: Website Components

### File Locations

- [ ] Component exists: `ls -la src/components/spectrum-monitor/SpectrumMonitor.tsx`
- [ ] Dashboard page exists: `ls -la app/dashboard/spectrum/page.tsx`
- [ ] API routes exist:
  - `src/app/api/sdr/spectrum/route.ts`
  - `src/app/api/sdr/frequencies/route.ts`
  - `src/app/api/sdr/alerts/route.ts`

### Component Build

- [ ] Build succeeds: `pnpm build` (no TypeScript errors)
- [ ] No missing dependencies
- [ ] Component imports correctly

### Dashboard Link

- [ ] Link added to `/dashboard` page
- [ ] Link text: "📡 Spectrum Monitor"
- [ ] Link href: "/dashboard/spectrum"
- [ ] Link styling visible (green accent color)

---

## Phase 6: Website Display

### Live Testing

Navigate to https://wisedefensellc.com/dashboard

- [ ] Page loads without errors
- [ ] "📡 Spectrum Monitor" button visible in Quick Actions
- [ ] Can click button without errors

Navigate to https://wisedefensellc.com/dashboard/spectrum

- [ ] Page loads (no 404)
- [ ] Title shows "RTL-SDR Spectrum Monitor"
- [ ] Header text visible
- [ ] Back link works

### Component Rendering

**Wait 15 seconds for data to load:**

- [ ] No console errors (F12 → Console)
- [ ] "Loading spectrum data..." message appears briefly
- [ ] Spectrum graph renders (should see green lines on black background)
- [ ] Stats cards appear:
  - Peak Power (green)
  - Signals Detected (blue)
  - Active Alerts (yellow)
- [ ] Values are non-zero:
  - Peak Power > -100 dB
  - Signals Detected > 0
  - Active Alerts ≥ 0

### Interactive Features

- [ ] Graph displays with grid lines
- [ ] X-axis shows frequencies (88M, 100M, 200M, etc.)
- [ ] Y-axis shows power levels (-100dB to 0dB)
- [ ] Filled area under curve (green)
- [ ] "Top Detected Frequencies" list shows frequencies
- [ ] Frequencies have power values in dB
- [ ] Frequency values make sense (real radio stations should appear)

### Auto-Refresh

- [ ] Wait 10 seconds, graph updates
- [ ] "Last update" timestamp changes
- [ ] Data changes naturally (power values fluctuate)
- [ ] No repeated identical data

### Alerts Section

- [ ] If there are alerts, they display
- [ ] Alert title, message, and timestamp visible
- [ ] Color-coded by severity (red=CRITICAL, yellow=WARNING, blue=INFO)

---

## Phase 7: Performance

### Response Times

```bash
# Measure API response time
time curl -s http://localhost:3014/api/sdr/spectrum \
  -H "X-API-Key: YOUR_KEY" > /dev/null
```

- [ ] Spectrum endpoint: < 100ms
- [ ] Frequencies endpoint: < 100ms
- [ ] Alerts endpoint: < 50ms

### Browser Performance

Open browser DevTools (F12) → Network tab:

- [ ] Spectrum route: < 500ms
- [ ] Frequencies route: < 500ms
- [ ] Alerts route: < 300ms
- [ ] Graph renders: < 200ms

### System Resource Usage

On Raspberry Pi:

```bash
# Check CPU/Memory usage
top -bn1 | grep sdr_processor

# Check disk space
df -h /opt/wise2-defense/data/
```

- [ ] CPU usage: 25-35% (normal for RTL-SDR)
- [ ] Memory usage: < 200 MB
- [ ] Disk usage growing but not explosively (< 1 GB/day)

---

## Phase 8: Data Quality

### Spectrum Data

```bash
# Check latest signals
sqlite3 /opt/wise2-defense/data/wise2-defense.db \
  "SELECT frequency, signal_strength FROM sdr_signals \
   WHERE detected_at > datetime('now', '-10 seconds') \
   LIMIT 10;"
```

- [ ] Frequencies are in range 88-1200 MHz
- [ ] Power values are in reasonable range (-100 to -20 dB)
- [ ] Timestamps are recent (within 10 seconds)
- [ ] No NaN or null values

### Signal Classification

Check that signals are classified correctly:

```bash
# Query classified signals
curl -s -H "X-API-Key: YOUR_KEY" \
  http://localhost:3014/api/sdr/frequencies | jq '.classified'
```

- [ ] FM Radio signals near 88-108 MHz
- [ ] GMRS/FRS signals near 462-467 MHz (if present)
- [ ] Other categories present as appropriate

### Anomaly Detection

- [ ] Alerts table populated: `SELECT COUNT(*) FROM alerts WHERE alert_type LIKE 'sdr%'`
- [ ] Alerts have reasonable timestamps
- [ ] Alert severity levels vary (INFO, WARNING, CRITICAL)

---

## Phase 9: Integration Test

### End-to-End Flow

1. RTL-SDR scans spectrum → 2. Processor sends to API → 3. API stores in DB → 4. Website fetches → 5. Component displays

- [ ] RTL-SDR generates data
- [ ] Processor processes and sends (check logs)
- [ ] API receives and stores (check database)
- [ ] Website fetches (check API routes)
- [ ] Component displays (check browser)
- [ ] Entire flow < 15 seconds

### Manual Data Verification

Send test data directly to API:

```bash
curl -X POST http://localhost:3014/api/sdr/spectrum/snapshot \
  -H "X-API-Key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "signals": [
      {"frequency": 101.5, "power_db": -30, "mode": "test"},
      {"frequency": 462.5, "power_db": -35, "mode": "test"}
    ]
  }'
```

- [ ] API accepts POST request
- [ ] Response: `{"status": "recorded", ...}`
- [ ] Data appears in database
- [ ] Data appears on website (within 10 seconds)

---

## Phase 10: Cleanup & Hardening

### Security

- [ ] API key changed from default
- [ ] API key not in version control
- [ ] API key in `.env` files only (not config.ts)
- [ ] systemd service running as `wise2` user (not root)
- [ ] File permissions restrictive: `ls -la /opt/wise2-defense/data/`

### Logging

- [ ] Logs being written: `ls -la /var/log/wise2-defense/`
- [ ] Log rotation configured (optional, but recommended)
- [ ] No sensitive data in logs (no API keys, passwords)

### Database Cleanup

Optional: Clean up old data (keep last 24 hours):

```bash
sqlite3 /opt/wise2-defense/data/wise2-defense.db \
  "DELETE FROM sdr_signals \
   WHERE detected_at < datetime('now', '-24 hours');"
```

- [ ] Database file size reasonable (< 500 MB)

---

## Summary

**Total Checks**: 100+

**Status**: 
- [ ] All checks passing
- [ ] Ready for production
- [ ] Issues found (document below)

**Issues Found**:
```
[List any failed checks and remediation steps]
```

**Date Completed**: _______________

**Verified By**: _______________ (signature/name)

---

## Rollback Procedure (If Needed)

If integration doesn't work, rollback:

```bash
# Stop processor
sudo systemctl stop wise2-sdr-processor

# Remove service
sudo systemctl disable wise2-sdr-processor
sudo rm /etc/systemd/system/wise2-sdr-processor.service

# Remove processor script
sudo rm /opt/wise2-defense/app/sdr_processor.py

# Revert website changes
cd apps/website
git checkout -- .

# Rebuild and redeploy website
pnpm build && npm run deploy
```

---

**Last Updated**: 2026-08-24
