# BYTE Mini CYD — Display Update Guide

**Device**: BYTE Mini CYD 2.4" Touch Display  
**Status**: Ready for MQTT heartbeats and display commands  
**Ports**: MQTT (1883), Health API (4900)

---

## Device Registration

### Step 1: Send MQTT Heartbeat

Register the device by sending a heartbeat to the registry:

```bash
mosquitto_pub -h wisepi.tail44396d.ts.net \
  -u dwise -P [password] \
  -t "wise2/device/byte-mini-01/heartbeat" \
  -m '{
    "deviceId": "byte-mini-01",
    "deviceType": "byte-mini-cyd",
    "timestamp": '$(date +%s000)',
    "uptime": 3600000,
    "freeMemory": 102400,
    "heap": 204800,
    "wifiSignal": -45,
    "temperature": 32,
    "battery": 95,
    "features": ["display", "touch", "wifi", "mqtt"],
    "version": "1.0.0"
  }'
```

### Step 2: Verify Registration

```bash
curl http://wisepi.tail44396d.ts.net:4900/devices | jq '.devices[] | select(.deviceId=="byte-mini-01")'
```

**Expected Response**:
```json
{
  "deviceId": "byte-mini-01",
  "deviceType": "byte-mini-cyd",
  "isOnline": true,
  "lastHeartbeat": {
    "timestamp": 1722707800000,
    "battery": 95,
    "features": ["display", "touch", "wifi", "mqtt"]
  }
}
```

---

## Display Update Commands

### Command 1: Show Text

```bash
mosquitto_pub -h wisepi.tail44396d.ts.net \
  -u dwise -P [password] \
  -t "wise2/device/byte-mini-01/command" \
  -m '{
    "action": "display_update",
    "text": "WISE² Edge Hub",
    "x": 0,
    "y": 10,
    "color": "white",
    "fontSize": 24,
    "timestamp": '$(date +%s000)'
  }'
```

### Command 2: Show Status Message

```bash
mosquitto_pub -h wisepi.tail44396d.ts.net \
  -u dwise -P [password] \
  -t "wise2/device/byte-mini-01/command" \
  -m '{
    "action": "show_status",
    "message": "Voice Ready",
    "icon": "mic",
    "color": "green",
    "duration": 3000,
    "timestamp": '$(date +%s000)'
  }'
```

### Command 3: Show Image

```bash
mosquitto_pub -h wisepi.tail44396d.ts.net \
  -u dwise -P [password] \
  -t "wise2/device/byte-mini-01/command" \
  -m '{
    "action": "show_image",
    "image": "base64_encoded_image_data_here",
    "x": 0,
    "y": 0,
    "width": 240,
    "height": 320,
    "timestamp": '$(date +%s000)'
  }'
```

### Command 4: Clear Display

```bash
mosquitto_pub -h wisepi.tail44396d.ts.net \
  -u dwise -P [password] \
  -t "wise2/device/byte-mini-01/command" \
  -m '{
    "action": "clear",
    "color": "black",
    "timestamp": '$(date +%s000)'
  }'
```

### Command 5: Show Dashboard

```bash
mosquitto_pub -h wisepi.tail44396d.ts.net \
  -u dwise -P [password] \
  -t "wise2/device/byte-mini-01/command" \
  -m '{
    "action": "show_dashboard",
    "layout": "4x2",
    "widgets": [
      {"type": "text", "label": "Status", "value": "Online", "x": 0, "y": 0},
      {"type": "battery", "value": 95, "x": 1, "y": 0},
      {"type": "signal", "value": -45, "x": 2, "y": 0},
      {"type": "temperature", "value": 32, "x": 3, "y": 0},
      {"type": "device_count", "value": 1, "x": 0, "y": 1},
      {"type": "uptime", "value": "24h 12m", "x": 1, "y": 1},
      {"type": "memory", "value": 75, "x": 2, "y": 1},
      {"type": "cpu", "value": 8, "x": 3, "y": 1}
    ],
    "timestamp": '$(date +%s000)'
  }'
```

---

## Display States

### Startup Sequence

```
Screen 1: "WISE² Edge Hub"
           "Initializing..."
           [2 seconds]

Screen 2: "Device Registry: Online"
          "Health API: Online"
          "Voice API: Online"
          "Support API: Online"
          [3 seconds]

Screen 3: Dashboard view
          [Continuous update every 5s]
```

### Voice Active Sequence

```
Screen 1: "Listening..."
          [Microphone icon animated]
          [During capture - 5s]

Screen 2: "Processing..."
          [Spinning icon]
          [During STT/LLM - varies]

Screen 3: "Speaking..."
          [Speaker icon animated]
          [During TTS - varies]

Screen 4: Display response text
          [3 seconds]

Screen 5: Return to dashboard
```

### Device Offline Sequence

```
Screen 1: "⚠ Offline"
          "Device not responding"
          [Red background]
          [Continuous until reconnect]
```

---

## HTTP API for Display Updates

You can also send display updates via the Health API:

```bash
curl -X POST http://wisepi.tail44396d.ts.net:4900/devices/byte-mini-01/command \
  -H "Content-Type: application/json" \
  -d '{
    "command": "show_status",
    "args": {
      "message": "Status Updated",
      "icon": "check",
      "color": "green"
    }
  }'
```

---

## Dashboard Layout (4x2 Grid)

```
┌─────────────────────────────────┐
│ Status    │ Battery │ Signal  │ Temp   │  Row 0
├─────────────────────────────────┤
│ Devices   │ Uptime  │ Memory  │ CPU    │  Row 1
└─────────────────────────────────┘
```

### Widget Types

| Widget | Shows | Updates |
|--------|-------|---------|
| `text` | Custom text | Manual |
| `battery` | Battery % | Device heartbeat |
| `signal` | WiFi signal dBm | Device heartbeat |
| `temperature` | Temp in °C | Device heartbeat |
| `device_count` | Registered devices | Registry changes |
| `uptime` | Edge Hub uptime | Continuous |
| `memory` | RAM usage % | System metrics |
| `cpu` | CPU usage % | System metrics |
| `bluetooth` | E09 connection | Voice service |
| `voice_status` | STT/LLM/TTS | Voice service |

---

## Animation Effects

### Pulse (Breathing Effect)
```json
{
  "action": "show_status",
  "message": "Connecting...",
  "animation": "pulse",
  "duration": 2000
}
```

### Slide (Text Entry)
```json
{
  "action": "show_status",
  "message": "Device Online",
  "animation": "slide_in_from_left",
  "duration": 1000
}
```

### Fade (Smooth Transition)
```json
{
  "action": "show_status",
  "message": "Status Updated",
  "animation": "fade_in",
  "duration": 500
}
```

---

## Touch Interactions (Future)

When touch is implemented, BYTE Mini CYD can send:

```json
{
  "action": "touch",
  "x": 120,
  "y": 160,
  "timestamp": 1722707800000
}
```

Mapped to zones:
- **Top-left**: Previous screen
- **Top-right**: Next screen
- **Center**: Select active widget
- **Bottom**: Return to dashboard

---

## Testing Checklist

- [ ] Device sends MQTT heartbeat
- [ ] Device appears in registry (`/devices`)
- [ ] Display shows text update
- [ ] Display shows status message
- [ ] Dashboard layout renders correctly
- [ ] Battery/signal/temp update from heartbeat
- [ ] Voice status updates when voice service active
- [ ] Display clears properly
- [ ] Brightness/contrast adjustable

---

## Troubleshooting

### Display Not Updating

1. **Check device is online**:
   ```bash
   curl http://wisepi.tail44396d.ts.net:4900/devices | jq '.devices[] | select(.deviceId=="byte-mini-01")'
   ```
   Should show `"isOnline": true`

2. **Check MQTT message format**:
   ```bash
   mosquitto_sub -h wisepi.tail44396d.ts.net -u dwise -P [password] \
     -t "wise2/device/byte-mini-01/command" -v
   ```
   Should receive published messages

3. **Check device logs** (on BYTE Mini itself):
   ```bash
   # Via SSH to CYD if available
   tail -f /var/log/wise2-device.log
   ```

### Message Not Received

1. Verify MQTT connection:
   ```bash
   mosquitto_pub -h wisepi.tail44396d.ts.net -u dwise -P [password] \
     -t "test/topic" -m "test"
   ```

2. Check credentials:
   ```bash
   ssh dwise@wisepi.tail44396d.ts.net
   mosquitto_passwd -c /etc/mosquitto/passwd dwise
   ```

3. Verify MQTT broker is running:
   ```bash
   sudo systemctl status mosquitto
   ```

---

## Complete Demo Script

```bash
#!/bin/bash

HOST="wisepi.tail44396d.ts.net"
TOPIC="wise2/device/byte-mini-01"

# Register device
echo "1. Registering device..."
mosquitto_pub -h $HOST -u dwise -P password \
  -t "$TOPIC/heartbeat" \
  -m '{"deviceId":"byte-mini-01","deviceType":"byte-mini-cyd","timestamp":'$(date +%s000)',"features":["display"]}'

sleep 2

# Show welcome message
echo "2. Showing welcome..."
mosquitto_pub -h $HOST -u dwise -P password \
  -t "$TOPIC/command" \
  -m '{"action":"show_status","message":"WISE² Ready","color":"green","duration":2000}'

sleep 3

# Show dashboard
echo "3. Showing dashboard..."
mosquitto_pub -h $HOST -u dwise -P password \
  -t "$TOPIC/command" \
  -m '{"action":"show_dashboard","layout":"4x2"}'

echo "Demo complete!"
```

---

## Integration Points

### With Voice Service
When voice request starts, display updates automatically:
```
Listening... → Processing... → Speaking... → Response
```

### With Device Registry
Display automatically updates with:
- Online/offline device count
- Signal strength
- Battery level
- Uptime

### With Dashboard API
BYTE Mini can request latest stats and render them:
```bash
curl http://wisepi.tail44396d.ts.net:4903/dashboard | jq .
```

---

## Next: Touch Interface

Once touch is detected by BYTE Mini, it can:
- Navigate between screens
- Control volume/brightness
- Accept confirmations
- Trigger actions via MQTT

Send touch coordinates back to Edge Hub for processing.

---

*Ready to deploy display updates to BYTE Mini CYD 2.8!*
