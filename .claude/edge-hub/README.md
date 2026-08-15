# WISE² United Edge Hub

**The intelligent brain of WISE² distributed infrastructure** — coordinates devices, manages voice I/O, handles remote support, and orchestrates firmware updates across the WISE² ecosystem.

## Overview

The Edge Hub runs on **Raspberry Pi 3B+** (Debian 13, 905MB RAM, 57GB disk) and serves as:

- **Device Coordinator** — Tracks BYTE Mini CYD, XIAO ESP32-S3, ESP32-C5, Bluetooth speaker via MQTT
- **Voice Processor** — Microphone input → STT → Hermes AI → TTS → E09 speaker output
- **Health Monitor** — Real-time diagnostics API (localhost:4900)
- **Remote Support Hub** — Troubleshooting, logs, firmware updates
- **AI Inference** — Local Ollama models for low-latency processing

## Status: Phase 1 Complete ✅

| Phase | Scope | Status |
|-------|-------|--------|
| **0** | System Inspection | ✅ Complete |
| **1** | Infrastructure & MQTT | ✅ Complete |
| **2** | Device Registry + Voice | ⏳ Next |
| **3** | Bluetooth Audio Path | 📋 Planned |
| **4** | Remote Support | 📋 Planned |
| **5** | OTA Coordinator | 📋 Planned |

## Architecture

```
┌─────────────────────────────────────────────────┐
│         WISE² United Edge Hub                   │
├─────────────────────────────────────────────────┤
│  Layer 1: Device Management                     │
│  ├─ device-registry.ts — MQTT heartbeat tracker │
│  └─ Tracks: BYTE Mini, XIAO S3, ESP32-C5, E09   │
├─────────────────────────────────────────────────┤
│  Layer 2: Health & Diagnostics                  │
│  ├─ health-api.ts — HTTP diagnostics (port 4900)│
│  ├─ System metrics, audio state, services       │
│  └─ Used by remote support + monitoring         │
├─────────────────────────────────────────────────┤
│  Layer 3: Services (Coming Phase 2-5)           │
│  ├─ Voice Coordinator (Hermes integration)      │
│  ├─ OTA Firmware Manager                        │
│  ├─ Remote Support Bundle                       │
│  └─ Dashboard Backend                           │
├─────────────────────────────────────────────────┤
│  Infrastructure (PM2, MQTT, Nginx, Ollama)      │
└─────────────────────────────────────────────────┘
```

## Quick Start

### 1. Copy Files to Pi

```bash
scp -r .claude/edge-hub dwise@wisepi.tail44396d.ts.net:/home/dwise/wise2-edge/app
```

### 2. Build on Pi

```bash
ssh dwise@wisepi.tail44396d.ts.net
cd wise2-edge/app
npm install
npm run build
```

### 3. Start Services

```bash
pm2 start ecosystem.config.js --env production
pm2 save
```

### 4. Verify Health

```bash
curl http://127.0.0.1:4900/health
```

## Files

| File | Purpose | Lines |
|------|---------|-------|
| `device-registry.ts` | MQTT device tracking, online/offline state | 240 |
| `health-api.ts` | HTTP diagnostics API | 320 |
| `package.json` | Dependencies (mqtt, express) | 25 |
| `ecosystem.config.js` | PM2 process configuration | 60 |
| `DEPLOYMENT.md` | Setup guide, troubleshooting | 200+ |
| `README.md` | This file | — |

## Core Services

### Device Registry (`device-registry.ts`)

Listens to MQTT heartbeats and tracks device state.

**Topic**: `wise2/device/{deviceId}/heartbeat`

**Heartbeat Schema**:
```json
{
  "deviceId": "byte-mini-01",
  "deviceType": "byte-mini-cyd",
  "timestamp": 1722625920000,
  "uptime": 3600000,
  "freeMemory": 102400,
  "heap": 204800,
  "wifiSignal": -45,
  "temperature": 32,
  "features": ["audio", "display", "wifi", "mqtt"],
  "version": "1.0.0"
}
```

**Events**:
- `device-registered` — New device joined
- `device-online` — Offline device came online
- `device-offline` — Online device went offline
- `heartbeat` — Any heartbeat received

### Health API (`health-api.ts`)

HTTP endpoints on `http://127.0.0.1:4900`:

| Endpoint | Response |
|----------|----------|
| `/health` | Full system health status |
| `/ping` | Quick heartbeat |
| `/devices` | All registered devices |
| `/devices/{id}` | Specific device detail |
| `/audio` | Audio device state (Bluetooth, mic, speaker) |
| `/system` | System metrics (memory, disk, CPU) |

**Example**:
```bash
curl http://127.0.0.1:4900/health | jq '.audio'

# Output:
{
  "bluetoothConnected": true,
  "bluetoothAddress": "34:17:23:01:A5:34",
  "bluetoothName": "E09",
  "outputDevice": "bluetooth_a2dp",
  "inputDevice": "bluetooth_hsp",
  "capabilities": [
    "bluetooth_a2dp_output",
    "bluetooth_hsp_input",
    "mqtt_messaging",
    "ollama_inference"
  ]
}
```

## E09 Bluetooth Speaker

**Hardware**: JBL E09 (built-in microphone + speaker)

**MAC Address**: `34:17:23:01:A5:34`

**Status**: Paired, microphone will auto-discover on connection

**Audio Path**:
```
Microphone (HSP/HFP input)
    ↓
PulseAudio source (pactl list sources)
    ↓
Hermes STT (Ollama whisper-small model)
    ↓
Hermes LLM (Ollama model selection)
    ↓
Hermes TTS (Ollama model)
    ↓
PulseAudio sink (pactl set-default-sink)
    ↓
Bluetooth A2DP output
    ↓
E09 Speaker
```

**Connect**:
```bash
bluetoothctl
> connect 34:17:23:01:A5:34
> exit
```

## MQTT Setup

**Broker**: mosquitto on localhost:1883

**Users** (to be created):
- `dwise` — Full access (admin)
- `admin` — Full access (admin)
- `edge-device` — Device heartbeat only

**Topics**:
```
wise2/device/+/heartbeat       → Device online/offline status
wise2/device/+/telemetry       → System metrics (temp, memory)
wise2/device/+/command         → Commands from hub to device
wise2/voice/+                  → Voice coordination (STT results, TTS requests)
wise2/ota/+                    → Firmware update metadata
```

**Create Users**:
```bash
sudo mosquitto_passwd -b /etc/mosquitto/passwd dwise "password"
sudo systemctl restart mosquitto
```

See `DEPLOYMENT.md` for full MQTT setup.

## System Baseline

**Hardware**: Raspberry Pi 3B+ (ARM64 Cortex-A72/A53)
- **CPU**: 1.8 GHz
- **RAM**: 905 MB total (57% used)
- **Disk**: 57 GB total (38% used)
- **Bluetooth**: B8:27:EB:9B:19:66
- **Network**: Ethernet (192.168.6.136), Tailscale (100.69.116.79)

**Running Services**:
- MQTT Broker (mosquitto) — port 1883
- Web Server (nginx) — port 80
- Node.js App (PM2) — port 3000
- AI Inference (ollama) — port 11434
- Bluetooth (bluetooth.service)
- Audio (PulseAudio/PipeWire)

**Full baseline**: See `/home/dwise/wise2-edge/PRE_ADAPTATION_REPORT.txt`

## Logs

**View Services**:
```bash
pm2 status
pm2 logs

# Or specific service
pm2 logs wise2-edge-registry
pm2 logs wise2-edge-health
```

**MQTT**:
```bash
journalctl -u mosquitto -f
```

**System**:
```bash
systemctl status bluetooth
systemctl status nginx
systemctl status ollama
```

## Troubleshooting

### MQTT Not Authenticating

```bash
# Check service is running
systemctl is-active mosquitto

# Verify password file exists
ls -la /etc/mosquitto/passwd

# Test connection
mosquitto_sub -h 127.0.0.1 -u dwise -P password -t "#" -v
```

### Audio Not Working

```bash
# Verify E09 is connected
bluetoothctl info 34:17:23:01:A5:34 | grep Connected

# List audio devices
pactl list sources short
pactl list sinks short

# Restart PulseAudio
pulseaudio -k
sleep 1
pulseaudio --start
```

### Device Not Registering

```bash
# Manually publish test heartbeat
mosquitto_pub -h 127.0.0.1 -u dwise -P password \
  -t "wise2/device/test-01/heartbeat" \
  -m '{"deviceId":"test-01","deviceType":"byte-mini-cyd","timestamp":'$(date +%s000)',"uptime":0,"freeMemory":100000,"heap":200000,"features":["audio"],"version":"1.0.0"}'

# Check registry logs
pm2 logs wise2-edge-registry
```

## Phase 2: Voice Coordination (Next)

**Coming Soon**:
- Voice Coordinator service (Hermes ↔ E09 routing)
- STT/TTS pipeline via Ollama
- Bluetooth auto-reconnect with keepalive
- BYTE Mini CYD display support
- XIAO ESP32-S3 sensor integration
- ESP32-C5 multi-protocol node support

**Timeline**: 1-2 hours

**Key Tasks**:
1. Verify E09 microphone capture
2. Wire Hermes API to voice coordinator
3. Test STT → Ollama → TTS pipeline
4. Add device-type-specific handlers
5. End-to-end voice flow test

## Architecture Decisions

✅ **Why MQTT?**
- Lightweight pub/sub for constrained ESP32 devices
- Proven reliability in IoT deployments
- PubSub for asynchronous coordination
- Works offline (queue on edge hub)

✅ **Why Node.js/TypeScript?**
- Existing PM2 on Pi (already running)
- Minimal additional process overhead
- Fast prototyping with TypeScript
- Mature mqtt + express libraries

✅ **Why HTTP Health API?**
- Easy remote debugging via Tailscale
- No authentication needed for localhost access
- Integrates with standard monitoring tools
- Minimal overhead vs WebSocket

✅ **Why E09 Built-in Mic?**
- Eliminates USB audio complexity
- Single Bluetooth connection for I/O
- Professional audio quality
- Paired + ready to go

## Support & Debugging

**Quick Health Check**:
```bash
curl -s http://127.0.0.1:4900/health | jq .
```

**Full Diagnostics**:
- System: `/system` endpoint
- Audio: `/audio` endpoint
- Devices: `/devices` endpoint
- Logs: `pm2 logs`

**Remote Access** (via Tailscale):
```bash
# From your machine
ssh dwise@wisepi.tail44396d.ts.net
curl http://127.0.0.1:4900/health
```

## License & Ownership

**WISE² Genesis** — proprietary, maintained by dwise (dwise03@gmail.com)

---

**Status**: Phase 1 ✅ Complete | Next: Phase 2 Voice Coordination  
**Updated**: 2026-08-02  
**Endpoint**: http://127.0.0.1:4900 (Tailscale only)
