# BYTE Mini CYD — Edge Hub Integration

**Device**: BYTE Mini CYD (2.4" TFT touchscreen)  
**Status**: Ready for parallel setup while Phase 2 voice services deploy  
**Integration**: Display output + touchscreen input via MQTT

## Hardware

- **Display**: 2.4" TFT (240×320)
- **Processor**: ESP32-S3 (assumed, typical for BYTE Mini)
- **Connectivity**: WiFi + Bluetooth
- **Touch Input**: Capacitive touchscreen
- **Power**: USB-C
- **LED**: RGB status indicator

## Firmware Requirements

The BYTE Mini must publish heartbeats to MQTT for edge hub to track it:

**Topic**: `wise2/device/byte-mini-01/heartbeat`

**Payload**:
```json
{
  "deviceId": "byte-mini-01",
  "deviceType": "byte-mini-cyd",
  "timestamp": 1722625920000,
  "uptime": 3600000,
  "freeMemory": 102400,
  "heap": 204800,
  "wifiSignal": -45,
  "features": ["display", "touch", "wifi", "mqtt", "audio"],
  "version": "1.0.0"
}
```

## Edge Hub Integration

Once BYTE Mini connects via WiFi and publishes heartbeats, the edge hub will:

1. ✅ Detect device in registry
2. ✅ Track online/offline state
3. ✅ Route display commands via MQTT
4. ✅ Handle touchscreen input (when subscribed)

### Display Commands

Edge hub sends display updates to: `wise2/device/byte-mini-01/command`

**Examples**:

```bash
# Show text
mosquitto_pub -h 127.0.0.1 -u dwise -P password \
  -t "wise2/device/byte-mini-01/command" \
  -m '{"action":"display_update","text":"Hello WISE²","x":20,"y":100,"color":"#00D4FF"}'

# Show status message (auto-dismiss after 3s)
mosquitto_pub -h 127.0.0.1 -u dwise -P password \
  -t "wise2/device/byte-mini-01/command" \
  -m '{"action":"show_status","message":"WiFi Connected","duration":3000}'

# Show listening indicator (voice mode)
mosquitto_pub -h 127.0.0.1 -u dwise -P password \
  -t "wise2/device/byte-mini-01/command" \
  -m '{"action":"show_listening"}'

# Clear display
mosquitto_pub -h 127.0.0.1 -u dwise -P password \
  -t "wise2/device/byte-mini-01/command" \
  -m '{"action":"clear"}'
```

### Touchscreen Input

BYTE Mini should publish touch events to: `wise2/device/byte-mini-01/input`

**Expected payload**:
```json
{
  "action": "touch",
  "x": 120,
  "y": 160,
  "timestamp": 1722625920000
}
```

These events are available via voice API for UI interaction.

## Setup Steps

### 1. Flash Firmware

If not already done, flash the BYTE Mini with firmware that:
- Connects to WiFi network (same as Pi)
- Publishes MQTT heartbeats
- Subscribes to `wise2/device/byte-mini-01/command`
- Has GPIO/driver support for 2.4" TFT

**Recommended approach**:
- Use PlatformIO or Arduino IDE
- Include TFT driver (ILI9341 or device-specific)
- MQTT library (ArduinoMqttClient or PubSubClient)

### 2. Configure WiFi

Set BYTE Mini to connect to your network:
```cpp
// Example Arduino sketch
#include <WiFi.h>

const char* ssid = "YourSSID";
const char* password = "YourPassword";

void setup() {
  WiFi.begin(ssid, password);
  // Wait for connection...
}
```

### 3. Configure MQTT

Set up MQTT connection to Pi:
```cpp
#include <PubSubClient.h>

const char* mqtt_server = "192.168.6.136";  // Pi IP
const int mqtt_port = 1883;
const char* mqtt_user = "edge-device";      // MQTT user
const char* mqtt_pass = "device-password";  // MQTT password

void callback(char* topic, byte* payload, unsigned int length) {
  // Handle display commands here
  if (strcmp(topic, "wise2/device/byte-mini-01/command") == 0) {
    // Parse JSON and update display
  }
}
```

### 4. Publish Heartbeats

Every 5-10 seconds, publish to `/heartbeat` topic:
```cpp
void publishHeartbeat() {
  StaticJsonDocument<256> doc;
  doc["deviceId"] = "byte-mini-01";
  doc["deviceType"] = "byte-mini-cyd";
  doc["timestamp"] = millis();
  doc["uptime"] = millis();
  doc["freeMemory"] = ESP.getFreeHeap();
  doc["heap"] = ESP.getHeapSize();
  doc["wifiSignal"] = WiFi.RSSI();
  doc["features"][0] = "display";
  doc["features"][1] = "touch";
  doc["features"][2] = "wifi";
  doc["features"][3] = "mqtt";
  doc["version"] = "1.0.0";

  char buffer[256];
  serializeJson(doc, buffer);
  client.publish("wise2/device/byte-mini-01/heartbeat", buffer);
}
```

## Testing Checklist

- [ ] BYTE Mini connected to WiFi
- [ ] MQTT connection established
- [ ] Heartbeats publishing every 5-10s
- [ ] Edge hub detects device (check registry)
- [ ] Display command received (manual publish test)
- [ ] Display renders text correctly
- [ ] Touchscreen input captured (if enabled)
- [ ] Voice API display updates working (phase 2 integration)

## Testing via Voice API

Once phase 2 voice services deploy:

```bash
# Voice request → Shows listening indicator on BYTE Mini
curl -X POST http://127.0.0.1:4901/voice/request \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "byte-mini-01",
    "context": {"display": true}
  }'

# Sequence:
# 1. BYTE Mini shows "🎤 Listening..."
# 2. Audio captured from E09 microphone
# 3. BYTE Mini shows "⏳ Processing..."
# 4. Response received
# 5. BYTE Mini shows response text
# 6. Audio plays from E09 speaker
```

## Troubleshooting

### Device Not Appearing in Registry

```bash
# Check MQTT messages
mosquitto_sub -h 127.0.0.1 -u dwise -P password -t "wise2/device/#" -v

# Check heartbeat format (must be valid JSON)
cat heartbeat.json | jq .

# Verify device ID matches subscriptions
```

### Display Not Updating

```bash
# Manually test display command
mosquitto_pub -h 127.0.0.1 -u dwise -P password \
  -t "wise2/device/byte-mini-01/command" \
  -m '{"action":"display_update","text":"Test","x":20,"y":100}'

# Check BYTE Mini logs (serial monitor) for errors
# Verify device subscribed to command topic
```

### WiFi Disconnects

- Check signal strength (should be > -70 dBm)
- Verify MQTT reconnection logic in firmware
- Consider adding WiFi retry/fallback

## Next Steps (Phase 3)

- [ ] Full display UI framework (layouts, widgets)
- [ ] Touchscreen event handling + response
- [ ] Real-time sensor display (temperature, status)
- [ ] QR code generation for pairing
- [ ] Camera integration (if available)

## Reference

- **Device Registry Endpoint**: GET http://127.0.0.1:4900/devices
- **Device Detail**: GET http://127.0.0.1:4900/devices/byte-mini-01
- **Voice API**: POST http://127.0.0.1:4901/voice/request

---

**Status**: Ready for parallel integration | Edge Hub Phase 2 in progress
