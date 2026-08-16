# WISE² United Edge Hub - Deployment Guide

## Quick Start

Deploy the Edge Hub to Raspberry Pi 3B+:

```bash
# 1. Copy files to Pi
scp -r .claude/edge-hub dwise@wisepi.tail44396d.ts.net:/home/dwise/wise2-edge/app

# 2. SSH into Pi
ssh dwise@wisepi.tail44396d.ts.net

# 3. Install dependencies
cd wise2-edge/app
npm install
npm run build

# 4. Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
```

## Manual MQTT Setup (requires sudo)

The automated PHASE 1 script needs sudo for MQTT auth. If it failed, set up manually:

### Step 1: Create MQTT Users

```bash
sudo bash -c 'cat > /etc/mosquitto/passwd << EOF
# WISE² Edge Hub users (passwords will be hashed)
EOF

# Add users interactively (will prompt for password)
sudo mosquitto_passwd -b /etc/mosquitto/passwd dwise "your-password"
sudo mosquitto_passwd -b /etc/mosquitto/passwd admin "admin-password"
sudo mosquitto_passwd -b /etc/mosquitto/passwd edge-device "device-password"
```

### Step 2: Create ACL File

```bash
sudo bash -c 'cat > /etc/mosquitto/acl << EOF'
# Device heartbeats
pattern read wise2/device/+/heartbeat
pattern write wise2/device/+/command
pattern write wise2/device/+/telemetry

# Voice coordination
pattern read wise2/voice/+

# OTA updates
pattern read wise2/ota/+

# System admin - full access
user dwise
topic #

user admin
topic #

# Edge services
user edge-device
topic wise2/device/+/heartbeat
topic wise2/device/+/telemetry
topic wise2/command
EOF
```

### Step 3: Enable MQTT Auth

```bash
sudo bash -c 'cat > /etc/mosquitto/conf.d/auth.conf << EOF'
# Authentication
allow_anonymous false
password_file /etc/mosquitto/passwd
acl_file /etc/mosquitto/acl

# Secure listener
listener 1883
  protocol mqtt
  bind_address 127.0.0.1
EOF

# Apply changes
sudo systemctl restart mosquitto
```

## Health API Endpoints

Once running, check health at `http://127.0.0.1:4900`:

```bash
# Full system health
curl http://127.0.0.1:4900/health

# Quick ping
curl http://127.0.0.1:4900/ping

# Device registry
curl http://127.0.0.1:4900/devices

# Specific device
curl http://127.0.0.1:4900/devices/byte-mini-01

# Audio diagnostics
curl http://127.0.0.1:4900/audio

# System metrics
curl http://127.0.0.1:4900/system
```

## E09 Bluetooth Speaker Setup

### Connect Speaker

```bash
# Put speaker in pairing mode (hold power button 3s)
# Then on Pi:
bluetoothctl
> power on
> connect 34:17:23:01:A5:34
> exit

# Verify connection
bluetoothctl info 34:17:23:01:A5:34 | grep Connected
```

### Verify Microphone

Once connected, check audio devices:

```bash
# List input devices (will show Bluetooth mic when connected)
pactl list sources short

# Set as default input
pactl set-default-source <bluetooth_device_name>
```

## Device Heartbeat Format

Devices publish heartbeats to `wise2/device/{deviceId}/heartbeat`:

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

## Troubleshooting

### MQTT Not Connecting

```bash
# Check MQTT is running
systemctl status mosquitto

# View logs
journalctl -u mosquitto -n 50

# Test connection (with auth)
mosquitto_sub -h 127.0.0.1 -u dwise -P your-password -t "wise2/device/+/heartbeat"
```

### Audio Issues

```bash
# Restart PulseAudio
pulseaudio -k
sleep 1
pulseaudio --start

# List all audio devices
aplay -l  # output
arecord -l  # input

# Test speaker output
speaker-test -t wav -c 2 -l 1
```

### Device Registry Not Detecting Devices

```bash
# Check registry is running
pm2 status

# View logs
pm2 logs wise2-edge-registry

# Manually publish test heartbeat
mosquitto_pub -h 127.0.0.1 -u dwise -P password \
  -t "wise2/device/test-01/heartbeat" \
  -m '{"deviceId":"test-01","deviceType":"byte-mini-cyd","timestamp":'$(date +%s000)',"uptime":0,"freeMemory":100000,"heap":200000,"features":["audio"],"version":"1.0.0"}'
```

## Logs

View running services:

```bash
# PM2 processes
pm2 status
pm2 logs

# MQTT
journalctl -u mosquitto -f

# System
systemctl status bluetooth
systemctl status nginx
systemctl status ollama
```

## Next Phases

- **Phase 3**: Voice coordination (STT/TTS via Hermes)
- **Phase 4**: Remote support functions
- **Phase 5**: OTA firmware coordinator
- **Phase 6+**: Dashboard, security hardening, full integration

## Files

- `device-registry.ts` — Device heartbeat listener and online/offline tracking
- `health-api.ts` — Health/diagnostic API on port 4900
- `ecosystem.config.js` — PM2 process configuration
- `package.json` — Dependencies

## Support

Check `/home/dwise/wise2-edge/PRE_ADAPTATION_REPORT.txt` for full system baseline and known issues.
