# PHASE 2: Voice Coordination — Testing & Deployment

**Status**: Code complete, ready for Pi deployment  
**Services**: Device Registry + Health API + Voice Coordinator + Voice API  
**Parallel**: BYTE Mini CYD setup in progress

## What's New in Phase 2

✅ **Voice Coordinator** (voice-coordinator.ts)
- Microphone capture via PulseAudio
- STT via Ollama whisper-small
- Hermes API query with fallback to local Ollama
- TTS via espeak-ng/Piper (with fallback)
- Bluetooth A2DP playback

✅ **Bluetooth Manager** (bluetooth-manager.ts)
- E09 speaker auto-connect
- Keep-alive pings (prevent sleep)
- Connection monitoring + auto-reconnect
- Audio device discovery (mic + speaker)

✅ **Device Handlers** (device-handlers.ts)
- BYTE Mini CYD: display commands
- XIAO ESP32-S3: sensor control + LEDs
- ESP32-C5: BLE gateway + WiFi AP

✅ **Voice API** (voice-api.ts)
- POST /voice/request — Process voice
- GET /voice/test — Verify audio works
- GET /voice/status — Bluetooth state
- GET /voice/diagnostics — Audio details
- POST /voice/reconnect — Reconnect E09

## Deployment (10 minutes)

### 1. Copy Phase 2 Code to Pi

```bash
# From your machine
cd /Users/danielwise/Projects/wise2-core/.claude/edge-hub

# Copy all TypeScript files
scp *.ts dwise@wisepi.tail44396d.ts.net:/home/dwise/wise2-edge/app/src/

# Verify copy
ssh dwise@wisepi.tail44396d.ts.net ls -la wise2-edge/app/src/
```

### 2. Build on Pi

```bash
ssh dwise@wisepi.tail44396d.ts.net

cd wise2-edge/app
npm install  # Already did phase 1
npm run build

# Verify build succeeded
ls -la dist/voice-coordinator.js dist/voice-api.js
```

### 3. Update PM2

```bash
# Restart with new services
pm2 delete all
pm2 start ecosystem.config.js --env production

# Verify all running
pm2 status

# Should show:
# wise2-edge-registry   online
# wise2-edge-health     online
# wise2-edge-voice      online
```

### 4. Verify Services Started

```bash
# Health API should still work
curl http://127.0.0.1:4900/health | jq .status

# Voice API should be listening
curl http://127.0.0.1:4901/voice/test
```

## Testing Checklist

### Audio Capture

```bash
# Test microphone input (E09 should be connected first)
curl http://127.0.0.1:4901/voice/test

# Expected:
# { "success": true, "message": "Voice capture and playback working" }
```

### E09 Bluetooth Connection

```bash
# Get Bluetooth status
curl http://127.0.0.1:4901/voice/status | jq .

# Expected output:
# {
#   "bluetooth": {
#     "address": "34:17:23:01:A5:34",
#     "name": "E09",
#     "connected": true,
#     "paired": true
#   },
#   "connected": true
# }
```

### Voice Request (Full Pipeline)

```bash
# Process voice (mic → STT → LLM → TTS → speaker)
curl -X POST http://127.0.0.1:4901/voice/request \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "edge-hub",
    "context": {"user": "test"}
  }' | jq .

# Expected:
# {
#   "success": true,
#   "deviceId": "edge-hub",
#   "transcription": "What time is it",
#   "response": "It is 3:45 PM",
#   "latency": 2340
# }
```

### Audio Diagnostics

```bash
# Check audio devices and routing
curl http://127.0.0.1:4901/voice/diagnostics | jq .audio

# Should show PulseAudio sources and sinks
```

### Device Registry (BYTE Mini)

```bash
# Once BYTE Mini connects
curl http://127.0.0.1:4900/devices | jq .

# Should include:
# {
#   "total": 1,
#   "online": 1,
#   "devices": [{
#     "deviceId": "byte-mini-01",
#     "deviceType": "byte-mini-cyd",
#     "isOnline": true,
#     "lastHeartbeat": {...}
#   }]
# }
```

### Display Output to BYTE Mini

```bash
# Trigger display update via device handler
curl -X POST http://127.0.0.1:4900/devices/byte-mini-01/command \
  -H "Content-Type: application/json" \
  -d '{
    "command": "show_status",
    "args": {"message": "WISE² Edge Hub Ready"}
  }'

# BYTE Mini should show the message
```

## Monitoring Logs

```bash
# All services
pm2 logs

# Specific service
pm2 logs wise2-edge-voice
pm2 logs wise2-edge-registry

# System logs
journalctl -u mosquitto -f
journalctl -u ollama -f
```

## API Endpoints Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /voice/request | Process voice (capture → output) |
| GET | /voice/test | Test audio capture/playback |
| GET | /voice/status | Bluetooth connection status |
| GET | /voice/diagnostics | Audio device details |
| POST | /voice/reconnect | Reconnect E09 speaker |
| POST | /voice/disconnect | Disconnect E09 |
| GET | /voice/devices/{id} | Device voice capabilities |

## Troubleshooting

### Voice API Won't Start

```bash
# Check logs
pm2 logs wise2-edge-voice

# Likely issues:
# - Hermes not running (curl http://127.0.0.1:3012/health)
# - Ollama not running (curl http://127.0.0.1:11434/api/tags)
# - MQTT authentication failed (check /etc/mosquitto/passwd)
```

### E09 Not Connecting

```bash
# On Pi, try manual connection
bluetoothctl
> connect 34:17:23:01:A5:34

# If fails:
# - Put speaker in pairing mode (hold power 3s)
# - Try pairing via bluetoothctl pair
```

### No Audio Input

```bash
# Verify Bluetooth mic exists
pactl list sources | grep -i bluetooth

# If not found:
# - Restart PulseAudio: pulseaudio -k
# - Reconnect E09: curl -X POST http://127.0.0.1:4901/voice/reconnect
```

### STT Not Working

```bash
# Verify Ollama has whisper model
curl http://127.0.0.1:11434/api/tags

# If whisper-small missing:
ollama pull whisper-small

# Test STT directly (on Pi)
echo "audio.wav" | ollama embed whisper-small
```

## Next Phase: Phase 3 (Remote Support)

- Remote device diagnostics
- Log export + analysis
- Firmware update coordination
- Support bundle generation
- Remote shell access (via Tailscale)

**Timeline**: 2-3 hours

---

**Ready to deploy?** Push Phase 2 code to Pi and run the testing checklist above.
