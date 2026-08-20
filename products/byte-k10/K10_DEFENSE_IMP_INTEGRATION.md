# WISE² K10 Defense IMP Integration

Integrate the WISE² Defense IMP system into K10 devices for real-time incident tracking, alert management, and system health monitoring on a compact embedded display.

## Overview

K10 displays Defense IMP data as overlays on the animated IMP character face:

- **Center**: Animated IMP character (unchanged)
- **Top Bar**: Incident counter + latest critical incident
- **Bottom Bar**: System health metrics (CPU, RAM, signal strength)
- **Right Side**: Connectivity status indicators (WiFi, Mesh, SDR, USB)

## Architecture

```
K10 Device (240x320 display)
    ↓
[WiFi] → http://edge-host:3000/defense-imp/data
    ↓
Edge Appliance (EdgeRuntime)
    ├─ DefenseImpDataProvider
    ├─ WiseDefenseHardware
    └─ HealthMonitor
    
Fallback path:
K10 Device
    ↓
[USB Serial] → Host/Edge Device
    ↓
[JSON over serial at 115200 baud]
```

## Setup

### 1. Edge Appliance Configuration

Enable Defense IMP on the edge device:

```bash
# Copy environment template
cp .env.example .env

# Set Defense IMP configuration
WISE_DEFENSE_GATEWAY_ENABLED=true
WISE_DEFENSE_GATEWAY_ID=gateway-k10-001
WISE_DEFENSE_GATEWAY_TOKEN=your_token_here
WISE_DEFENSE_TENANT_ID=tenant-id
WISE_DEFENSE_API_URL=https://defense.wise2.cloud

# Hardware connections (optional)
MESHTASTIC_CONNECTION_TYPE=serial
MESHTASTIC_SERIAL_PORT=/dev/serial/by-id/usb-device-id

SDR_ENABLED=true
SDR_DEVICE_TYPE=rtl-sdr

# Start services
docker-compose up -d
```

### 2. K10 Firmware Setup

Update `byte-k10.ino`:

```cpp
#include "defense-imp-integration.h"

DefenseImpIntegration defense_imp;

void setup() {
  // ... existing K10 setup ...
  
  // Initialize Defense IMP
  String api_url = "http://192.168.1.100:3000";  // Edge device IP
  defense_imp.init(&k10.display, api_url, "k10-001");
  
  Serial.begin(115200);  // USB fallback
}

void loop() {
  // ... existing K10 loop code ...
  
  // Update Defense IMP display
  if (defense_imp.should_update(5000)) {  // Poll every 5 seconds
    defense_imp.fetch_data();
  }
  
  // Render overlays on IMP face
  defense_imp.render_overlay();
  
  // ... rest of loop ...
}
```

### 3. USB Serial Fallback

If WiFi is unavailable, K10 uses USB serial communication:

**Protocol**: JSON over UART at 115200 baud

**Request** (K10 → Host):
```json
{
  "type": "get_defense_imp_data",
  "device_id": "k10-001",
  "timestamp": 1692547200000
}
```

**Response** (Host → K10):
```json
{
  "timestamp": 1692547200000,
  "deviceId": "k10-001",
  "incidents": {
    "total": 3,
    "recent": [
      {
        "id": "inc_001",
        "type": "fire",
        "distance": 0.8,
        "location": "Main St & 5th Ave",
        "timestamp": 1692547200000,
        "severity": "critical"
      }
    ]
  },
  "alerts": [
    "21:42 - Fire Department: 3 units en route",
    "21:40 - Severe Weather Warning"
  ],
  "health": {
    "cpu": 34,
    "memory": 48,
    "disk": 22,
    "temperature": 51,
    "uptime": 786000,
    "network": {
      "connected": true,
      "signal": 75
    }
  },
  "connectivity": {
    "wifi": true,
    "mesh": true,
    "sdr": false,
    "usb": true
  }
}
```

## Display Layout

### 240x320 Screen (Portrait)

```
┌────────────────────────────┐  ← Top Bar (30px)
│ ▸ 3 incidents              │     - Incident count
│ Fire: 0.8 mi @ Main St     │     - Latest incident
├────────────────────────────┤
│                            │
│                            │
│         IMP FACE           │     - Centered
│      (Animated)            │     - 200x240px core
│                            │     - Overlays around edges
│                            │
├────────────────────────────┤  ← Bottom Bar (30px)
│ CPU  RAM  Sig:85%  OK      │     - Health metrics
└────────────────────────────┘

Right side (40px):
W ← WiFi status
M ← Mesh status
S ← SDR status
U ← USB status (indicators)
```

## API Endpoints

### Get Defense IMP Data

**GET** `/defense-imp/data`

**Response** (200 OK):
```json
{
  "timestamp": 1692547200000,
  "deviceId": "k10-001",
  "incidents": {
    "total": 5,
    "recent": [/* incident array */]
  },
  "alerts": [/* alert array */],
  "health": {/* health metrics */},
  "connectivity": {/* connection status */}
}
```

### Report Incident

**POST** `/defense-imp/incident`

**Body**:
```json
{
  "type": "fire|police|ems|traffic|weather|radio|mesh",
  "distance": 0.8,
  "location": "Main St & 5th Ave",
  "severity": "info|warning|critical"
}
```

**Response** (200 OK):
```json
{
  "success": true
}
```

### Post Alert

**POST** `/defense-imp/alert`

**Body**:
```json
{
  "message": "Fire Department: 3 units en route"
}
```

**Response** (200 OK):
```json
{
  "success": true
}
```

## Connection Priority

1. **WiFi (Primary)** - Polls API every 5 seconds over HTTP
2. **USB Serial (Fallback)** - JSON over UART if WiFi unavailable
3. **Display Last Cached Data** - If both connections fail

## Data Refresh Rates

- **Incidents**: 5 second poll (or USB push)
- **Health Metrics**: Aggregated from EdgeRuntime every update
- **Connectivity**: Status updated with each poll
- **Alerts**: Queued as they arrive, displayed in feed

## Integration Points

### DefenseImpDataProvider (Edge Appliance)

Handles:
- Incident aggregation from Meshtastic/SDR
- System health collection via HealthMonitor
- Connectivity status tracking
- Alert queue management

### DefenseImpIntegration (K10)

Handles:
- WiFi + USB fallback logic
- JSON parsing and caching
- Display rendering
- Data update scheduling

## Troubleshooting

### K10 Not Connecting to Edge Device

1. Verify WiFi credentials in K10 firmware
2. Check edge device IP matches API URL
3. Confirm edge appliance is running: `docker-compose ps`
4. Test endpoint: `curl http://edge-device-ip:3000/defense-imp/data`

### USB Serial Not Working

1. Verify USB cable is connected
2. Check device appears in `/dev/ttyUSB*` or `/dev/ttyACM*`
3. Confirm K10 serial baud rate is 115200
4. Test with `screen /dev/ttyUSB0 115200`

### No Incidents Appearing

1. Check Meshtastic/RTL-SDR hardware is connected
2. Verify SDR_DEVICE_TYPE and MESHTASTIC_CONNECTION_TYPE are set
3. Test hardware detection: `curl http://edge-device-ip:3000/wise-defense/hardware`
4. Post test incident: `curl -X POST http://edge-device-ip:3000/defense-imp/incident -d '{"type":"fire","distance":0.5,"location":"Test"}' -H "Content-Type: application/json"`

## Performance Considerations

- **Screen Updates**: 5 second poll interval (200ms update latency)
- **Memory**: ~4KB for cached incident/alert data
- **Network**: ~1-2KB JSON response per poll
- **CPU**: <5% on K10 ESP32 during display update

## Future Enhancements

- Real-time WebSocket updates (vs. polling)
- Map fragment showing nearby incidents
- Voice alerts via IMP character
- Two-way communication (K10 reporting to Defense IMP)
- Mesh network integration for offline operation

---

**Version**: 1.0  
**Last Updated**: 2026-08-20  
**Owner**: WISE² Defense IMP Team
