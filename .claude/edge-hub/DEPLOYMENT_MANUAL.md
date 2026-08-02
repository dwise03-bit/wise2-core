# WISE² Edge Hub — Manual Deployment Guide

**Status**: Code complete (Phases 1-3), awaiting Pi connectivity  
**Code Ready**: ✅ 2,527 lines across 9 services  
**When to use**: When automated DEPLOY.sh fails (Pi offline, network issues)

---

## Prerequisites

✅ Pi online and accessible via Tailscale  
✅ SSH key configured (`ssh-keyscan` not needed)  
✅ Node.js + npm installed on Pi  
✅ PM2 already installed (from Phase 1)  
✅ Ollama + mosquitto running  

---

## Step 1: Verify Pi is Online

```bash
# From your machine
ping wisepi.tail44396d.ts.net

# If it responds, SSH in
ssh dwise@wisepi.tail44396d.ts.net

# Once on Pi, verify services
pm2 status
ollama --version
mosquitto -v
```

---

## Step 2: Copy Edge Hub Code

```bash
# FROM YOUR MACHINE (not on Pi)
cd /Users/danielwise/Projects/wise2-core/.claude/edge-hub

# Copy all service files to Pi
scp *.ts dwise@wisepi.tail44396d.ts.net:/home/dwise/wise2-edge/app/src/

# Copy config files
scp package.json dwise@wisepi.tail44396d.ts.net:/home/dwise/wise2-edge/app/
scp ecosystem.config.js dwise@wisepi.tail44396d.ts.net:/home/dwise/wise2-edge/app/

# Verify files arrived
ssh dwise@wisepi.tail44396d.ts.net "ls -lh wise2-edge/app/src/*.ts | wc -l"
# Should output: 9
```

---

## Step 3: Build on Pi

```bash
# ON PI
ssh dwise@wisepi.tail44396d.ts.net

cd wise2-edge/app

# Install if needed (should already be done)
npm install

# Build all services
npm run build

# Verify build
ls -lh dist/
# Should show:
# device-registry.js, health-api.js, voice-coordinator.js,
# voice-api.js, remote-support.js, support-api.js, ota-coordinator.js,
# bluetooth-manager.js, device-handlers.js
```

---

## Step 4: Stop Old Services & Start New Ones

```bash
# ON PI
pm2 delete all

# Start all Phase 1-3 services
pm2 start ecosystem.config.js --env production

# Save PM2 config for auto-start on reboot
pm2 save

# Verify all running
pm2 status
# Should show 4 services:
# - wise2-edge-registry (Device Registry)
# - wise2-edge-health (Health API)
# - wise2-edge-voice (Voice Coordinator)
# - wise2-edge-support (Remote Support + OTA)
```

---

## Step 5: Verify Each Service

### Port 4900: Registry + Health API

```bash
# Quick ping
curl http://127.0.0.1:4900/ping

# Full health check
curl http://127.0.0.1:4900/health | jq .status

# Device list
curl http://127.0.0.1:4900/devices

# Audio status (E09 Bluetooth)
curl http://127.0.0.1:4900/audio
```

**Expected**:
```json
{
  "status": "healthy",
  "devices": { "total": 0, "online": 0, "devices": [] },
  "audio": {
    "bluetoothConnected": true,
    "bluetoothName": "E09",
    "capabilities": ["bluetooth_a2dp_output", "bluetooth_hsp_input"]
  }
}
```

---

### Port 4901: Voice API

```bash
# Voice service health
curl http://127.0.0.1:4901/voice/test

# Bluetooth connection status
curl http://127.0.0.1:4901/voice/status

# Audio diagnostics
curl http://127.0.0.1:4901/voice/diagnostics | jq .audio
```

**Expected**:
```json
{
  "success": true,
  "message": "Voice capture and playback working",
  "bluetooth": {
    "address": "34:17:23:01:A5:34",
    "name": "E09",
    "connected": true
  }
}
```

---

### Port 4902: Remote Support + OTA

```bash
# Support service health
curl http://127.0.0.1:4902/support/diagnostics

# Generate test bundle
curl -X POST http://127.0.0.1:4902/support/bundle

# List bundles
curl http://127.0.0.1:4902/support/bundles | jq .

# OTA status (no devices yet)
curl http://127.0.0.1:4902/ota/status/test-device 2>/dev/null || echo "No devices yet"
```

**Expected**:
```json
{
  "service": "support",
  "status": "healthy",
  "uptime": 45.123,
  "bundleCount": 1,
  "otaRegistrations": 0
}
```

---

## Step 6: Test Full Voice Pipeline

Once E09 is connected:

```bash
# Process voice (mic → STT → LLM → TTS → speaker)
curl -X POST http://127.0.0.1:4901/voice/request \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "edge-hub",
    "context": {"user": "test"}
  }' | jq .

# Expected output:
{
  "success": true,
  "deviceId": "edge-hub",
  "transcription": "[what was said]",
  "response": "[AI response]",
  "latency": 2500
}
```

---

## Step 7: Monitor Logs

```bash
# All services
pm2 logs

# Specific service
pm2 logs wise2-edge-registry
pm2 logs wise2-edge-voice
pm2 logs wise2-edge-support

# System logs
journalctl -u mosquitto -f
journalctl -u ollama -f
```

---

## Troubleshooting

### "Build failed" or "npm install failed"

```bash
# On Pi
cd wise2-edge/app

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

### Services not starting

```bash
# Check what's running
pm2 status

# Kill and restart
pm2 delete all
pm2 start ecosystem.config.js --env production

# Watch logs
pm2 logs
```

### E09 Bluetooth not connecting

```bash
# Check pairing
bluetoothctl paired-devices | grep -i e09

# Manual connect
bluetoothctl
> connect 34:17:23:01:A5:34
> quit

# Restart PulseAudio
pulseaudio -k
sleep 1
pulseaudio --start
```

### Voice API won't start

```bash
# Check dependencies
curl http://127.0.0.1:3012/health  # Hermes
curl http://127.0.0.1:11434/api/tags  # Ollama

# If Hermes down: on Pi, start it
cd wise2-core
npm run start:brain  # or however it's started

# Check logs
pm2 logs wise2-edge-voice
```

---

## Quick Reference: Service Ports

| Port | Service | Purpose |
|------|---------|---------|
| 4900 | Registry + Health | Device tracking, system health |
| 4901 | Voice Coordinator | Microphone, STT, LLM, TTS |
| 4902 | Support + OTA | Diagnostics, firmware updates |
| 1883 | MQTT | Device heartbeats (localhost) |
| 11434 | Ollama | Local AI inference |
| 3012 | Hermes | Remote AI/LLM gateway |

---

## Next Steps After Deployment

### Phase 4: Systemd Hardening
- Create systemd service files for Pi reboot persistence
- Auto-start on boot
- Log rotation + limits
- Resource caps (memory, CPU)

**Files needed**:
```
/etc/systemd/system/wise2-edge-registry.service
/etc/systemd/system/wise2-edge-health.service
/etc/systemd/system/wise2-edge-voice.service
/etc/systemd/system/wise2-edge-support.service
```

### Phase 5: Dashboard Integration
- Connect Pi health API to WISE² dashboard
- Real-time device status
- Voice command UI
- Remote diagnostics panel

### Phase 6: Device Integration
- BYTE Mini CYD display updates
- XIAO ESP32-S3 sensor relay
- ESP32-C5 BLE gateway
- MQTT auto-discovery

---

## Deployment Checklist

- [ ] Pi online and Tailscale connected
- [ ] SSH access verified (`ssh dwise@wisepi...`)
- [ ] Code copied to `/home/dwise/wise2-edge/app/src/`
- [ ] npm build succeeded (dist/ has 9 .js files)
- [ ] PM2 started all 4 services
- [ ] Port 4900 responds to /ping
- [ ] Port 4901 responds to /voice/test
- [ ] Port 4902 responds to /support/diagnostics
- [ ] E09 Bluetooth connected
- [ ] Voice pipeline tested end-to-end
- [ ] Logs clean (no errors)

---

**Deployment Status**: Ready to deploy (Pi connectivity pending)  
**Last Updated**: 2026-08-02  
**Code Size**: 2,527 lines (production-ready)
