# WISE² Remote Desktop Commander Bridge

**Status**: ✅ **FULLY OPERATIONAL**  
**Date**: 2026-09-24

---

## Overview

The WISE² Mac Remote Control Bridge provides secure remote access to your Mac desktop via Tailscale. It runs as a launchd service and exposes a simple HTTP API for remote command execution.

---

## Service Details

### Configuration
```
Service Name:    com.wise2.desktopcommander.remote
Process:         /opt/homebrew/bin/node ./packages/api/bin/desktop-commander-remote.js
Port:            9999
Listen:          0.0.0.0 (all interfaces)
PID:             21338 (currently running)
Uptime:          ~30 minutes
Status:          ✅ Healthy
```

### Tailscale Integration
```
Mac Tailscale IP:    100.109.186.4
Remote Access:       http://100.109.186.4:9999
Local Access:        http://localhost:9999
Direct LAN:          http://127.0.0.1:9999
```

---

## API Endpoints

### 1. Health Check
**GET** `/health`

Returns the current health status of the bridge.

```bash
curl http://localhost:9999/health
```

Response:
```json
{
  "status": "healthy",
  "pid": 21338,
  "uptime": 1859,
  "timestamp": "2026-09-24T17:19:28.725Z"
}
```

### 2. Status
**GET** `/status`

Returns detailed status information.

```bash
curl http://localhost:9999/status
```

Response:
```json
{
  "status": "running",
  "pid": 21338,
  "timestamp": "2026-09-24T17:19:00.028Z",
  "uptime": 1830
}
```

### 3. Execute Command
**POST** `/exec`

Execute arbitrary shell commands on the Mac.

```bash
curl -X POST http://localhost:9999/exec \
  -H "Content-Type: application/json" \
  -d '{"command":"echo hello"}'
```

Response:
```json
{
  "success": true,
  "stdout": "hello\n",
  "stderr": "",
  "command": "echo hello"
}
```

---

## Connectivity Verification

### Local (Loopback)
```bash
curl http://127.0.0.1:9999/health     # IPv4 loopback
curl http://[::1]:9999/health          # IPv6 loopback
```

### Tailscale (Remote)
```bash
curl http://100.109.186.4:9999/health  # Via Tailscale VPN
```

### LAN (Direct)
```bash
curl http://localhost:9999/health      # hostname.local or IP
```

---

## Service Management

### Check Status
```bash
# Full bridge health
wise2-bridge doctor

# Process status
ps aux | grep desktop-commander-remote

# Port listening
lsof -i :9999
```

### Restart Service
```bash
# Safe restart (unload/reload)
wise2-bridge recover

# Or manual
launchctl unload ~/Library/LaunchAgents/com.wise2.desktopcommander.remote.plist
launchctl load ~/Library/LaunchAgents/com.wise2.desktopcommander.remote.plist
```

### View Logs
```bash
# Bridge logs
tail -f ~/.wise2/bridge.log
tail -f ~/.wise2/bridge.error.log

# Last 20 requests
tail -20 ~/.wise2/bridge.log
```

---

## Usage Examples

### Remote Health Check via Tailscale
```bash
curl http://100.109.186.4:9999/health | jq .
```

### Execute Remote Command
```bash
curl -X POST http://100.109.186.4:9999/exec \
  -H "Content-Type: application/json" \
  -d '{"command":"whoami"}'
```

### Get System Info
```bash
curl -X POST http://localhost:9999/exec \
  -H "Content-Type: application/json" \
  -d '{"command":"system_profiler SPHardwareDataType | head -5"}'
```

### Run Script
```bash
curl -X POST http://localhost:9999/exec \
  -H "Content-Type: application/json" \
  -d '{"command":"osascript -e '\''tell app \"Finder\" to activate'\'''"}'
```

---

## Verification Results (2026-09-24)

✅ **Local Testing**
- Health endpoint: Working
- Status endpoint: Working
- Command execution: Working

✅ **Remote Testing**
- Tailscale access (100.109.186.4:9999): Working
- Health check via Tailscale: Responsive
- Command execution via Tailscale: Functional

✅ **Service Health**
- Process running (PID 21338)
- Uptime: ~30 minutes (consistent)
- Port: Listening on 9999
- Interface: All (0.0.0.0)
- Logs: Active and logging

---

## Troubleshooting

### Service Not Running
```bash
# Check if service is loaded
launchctl list | grep desktopcommander

# Restart service
wise2-bridge recover

# Check logs for errors
tail -50 ~/.wise2/bridge.error.log
```

### Port Not Listening
```bash
# Verify port is open
lsof -i :9999

# Check if process is alive
ps aux | grep desktop-commander-remote

# Restart process
launchctl unload ~/Library/LaunchAgents/com.wise2.desktopcommander.remote.plist
sleep 2
launchctl load ~/Library/LaunchAgents/com.wise2.desktopcommander.remote.plist
```

### Remote Access Not Working
```bash
# Verify Tailscale is running
tailscale status | head -3

# Check Mac's Tailscale IP
tailscale status | grep dwise-mac

# Test local first
curl http://localhost:9999/health

# Then test remote
curl http://100.109.186.4:9999/health
```

---

## Security Notes

- Bridge listens on all interfaces (0.0.0.0) for Tailscale and local access
- Executed commands run with the user's permissions (danielwise)
- No authentication layer (relies on Tailscale VPN for security)
- All requests are logged to ~/.wise2/bridge.log
- Executed commands have stdout/stderr captured and returned

---

## Performance

- Process uptime: Continuous (launchd-managed auto-restart)
- Response time: <100ms typical
- Memory usage: ~7.9 MB
- CPU usage: <0.1% (idle)

---

**Last Verified**: 2026-09-24  
**Status**: ✅ PRODUCTION READY  
**Support**: See logs at ~/.wise2/bridge.log
