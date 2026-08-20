# K10 Defense IMP Integration Example

Add these changes to `byte-k10.ino` to integrate Defense IMP display:

## Step 1: Add Include at Top

```cpp
// Add after existing includes
#include "defense-imp-integration.h"
```

## Step 2: Add Global Instance

```cpp
// Add with other global declarations
DefenseImpIntegration defense_imp;
```

## Step 3: Update Setup()

```cpp
void setup() {
  // ... existing setup code ...
  
  // Initialize display with defensive coding
  k10.begin();
  k10.setScreenBrightness(200);
  
  // NEW: Initialize Defense IMP
  String api_url = "http://192.168.1.100:3000";  // Configure IP
  defense_imp.init(&k10.display, api_url, DEVICE_ID);  // DEVICE_ID = "k10-001"
  
  // NEW: Start serial for USB fallback
  // Serial already initialized by K10, but ensure baud is 115200
  Serial.begin(115200);
  
  // ... rest of setup ...
}
```

## Step 4: Update Loop()

```cpp
void loop() {
  uint32_t loop_start = millis();
  
  // ... existing IMP face rendering ...
  render_imp_face();
  
  // NEW: Defense IMP display update
  if (defense_imp.should_update(5000)) {  // Poll every 5 seconds
    defense_imp.fetch_data();              // WiFi or USB fallback
  }
  defense_imp.render_overlay();            // Draw overlays on face
  
  // ... rest of loop ...
}
```

## Step 5: Configuration

Create `.env.k10` or configure in code:

```dotenv
# K10 Network Configuration
WIFI_SSID=WISE2_DEMO
WIFI_PASS=demo123456
EDGE_API_URL=http://192.168.1.100:3000
K10_DEVICE_ID=k10-001

# USB Serial Fallback
K10_SERIAL_PORT=/dev/ttyUSB0
K10_SERIAL_BAUD=115200
```

## Step 6: Test Connectivity

### Test WiFi API

```bash
# Test from development machine
curl -X GET http://192.168.1.100:3000/defense-imp/data

# Sample response:
# {
#   "timestamp": 1692547200000,
#   "incidents": {"total": 0, "recent": []},
#   "alerts": [],
#   "health": {"cpu": 34, "memory": 48, ...},
#   "connectivity": {"wifi": true, "mesh": false, ...}
# }
```

### Test USB Serial Fallback

```bash
# Start the USB serial bridge
node usb-serial-bridge.js

# Or manually test with minicom
minicom -D /dev/ttyUSB0 -b 115200

# Send JSON from K10 (simulated):
# {"type": "get_defense_imp_data", "device_id": "k10-001", "timestamp": 1692547200000}

# Should receive:
# {"timestamp": 1692547200000, "incidents": {...}, ...}
```

### Test Incident Reporting

```bash
# Post an incident to trigger display update
curl -X POST http://192.168.1.100:3000/defense-imp/incident \
  -H "Content-Type: application/json" \
  -d '{
    "type": "fire",
    "distance": 0.8,
    "location": "Main St & 5th Ave",
    "severity": "critical"
  }'
```

## Display Preview

When running, you'll see:

```
┌────────────────────────────┐
│ ▸ 1 incident               │
│ Fire: 0.8 mi @ Main St     │
├────────────────────────────┤
│                            │
│         😈 IMP             │
│       (Animated)           │
│                            │
├────────────────────────────┤
│ CPU  RAM  Sig:85%  OK      │
└────────────────────────────┘

      W  ← Indicators
      M
      S
      U
```

## Performance Notes

- Display updates: ~200ms (5s poll interval)
- WiFi queries: 1-2KB JSON responses
- USB fallback: 115200 baud = ~11KB/s throughput
- Memory usage: ~4KB for cached data

## Troubleshooting

### IMP Face Not Showing

- Check K10 hardware is initialized: `k10.begin()`
- Verify display backlight is on
- Check face engine isn't blocked by overlays

### No Data Appearing

- Verify WiFi is connected: `Serial.println(WiFi.status())`
- Check API URL in firmware
- Test API directly: `curl http://api:3000/defense-imp/data`

### USB Not Working

- Check device is connected: `ls /dev/ttyUSB*`
- Verify baud rate: `stty -F /dev/ttyUSB0 115200`
- Start serial bridge: `node usb-serial-bridge.js`

### Incidents Not Showing

- Post test incident (see above)
- Check Alert Feed is getting data
- Verify edge device has Defense IMP enabled

## Next Steps

1. Compile and upload to K10
2. Power on and verify WiFi connects
3. Observe incident updates in real-time
4. Test USB fallback by disconnecting WiFi
5. Deploy to production edge nodes

---

**Questions?** See `K10_DEFENSE_IMP_INTEGRATION.md` for full documentation.
