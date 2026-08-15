# BYTE Mini CYD — Firmware Setup & MQTT Configuration

**Device**: BYTE Mini CYD 2.4" Touch Display  
**Goal**: Connect to WISE² Edge Hub via MQTT and send heartbeats  
**Time**: ~10 minutes  

---

## Prerequisites

- BYTE Mini CYD powered on and USB connected
- Arduino IDE or PlatformIO installed
- USB drivers for BYTE Mini (CH340)
- WiFi network accessible

---

## Step 1: Install Arduino Libraries

Open Arduino IDE → Sketch → Include Library → Manage Libraries

Search and install:
- `PubSubClient` (by Nick O'Leary) — MQTT library
- `ArduinoJson` (by Benoit Blanchon) — JSON serialization
- `WiFi` (built-in for ESP32)

---

## Step 2: MQTT Configuration Constants

Create `config.h` in your Arduino sketch:

```cpp
#ifndef CONFIG_H
#define CONFIG_H

// WiFi Configuration
const char* SSID = "your_wifi_ssid";
const char* PASSWORD = "your_wifi_password";

// MQTT Configuration
const char* MQTT_BROKER = "wisepi.tail44396d.ts.net";  // or Pi IP: 192.168.x.x
const int MQTT_PORT = 1883;
const char* MQTT_USER = "dwise";
const char* MQTT_PASSWORD = "password";

// Device Configuration
const char* DEVICE_ID = "byte-mini-01";
const char* DEVICE_TYPE = "byte-mini-cyd";
const char* FIRMWARE_VERSION = "2.0.0";

// MQTT Topics
const char* HEARTBEAT_TOPIC = "wise2/device/byte-mini-01/heartbeat";
const char* COMMAND_TOPIC = "wise2/device/byte-mini-01/command";
const char* STATUS_TOPIC = "wise2/device/byte-mini-01/status";

// Timing (milliseconds)
const long HEARTBEAT_INTERVAL = 10000;  // Send heartbeat every 10 seconds

#endif
```

---

## Step 3: Core Arduino Sketch

Create `byte_mini_edge_hub.ino`:

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "config.h"

// Initialize clients
WiFiClient espClient;
PubSubClient client(espClient);

// Timing
unsigned long lastHeartbeat = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\nBYTE Mini CYD - WISE² Edge Hub");
  Serial.println("==============================");
  
  // Initialize display (if using CYD display library)
  // initDisplay();
  // drawStatus("Initializing...", TFT_BLUE);
  
  // Connect to WiFi
  connectToWiFi();
  
  // Setup MQTT
  client.setServer(MQTT_BROKER, MQTT_PORT);
  client.setCallback(onMqttMessage);
  
  Serial.println("Setup complete!");
}

void loop() {
  // Maintain MQTT connection
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();
  
  // Send heartbeat periodically
  if (millis() - lastHeartbeat >= HEARTBEAT_INTERVAL) {
    sendHeartbeat();
    lastHeartbeat = millis();
  }
  
  delay(100);
}

void connectToWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(SSID);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi Connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    // drawStatus("WiFi Connected", TFT_GREEN);
  } else {
    Serial.println("\n✗ WiFi Failed!");
    // drawStatus("WiFi Failed", TFT_RED);
  }
}

void reconnectMQTT() {
  Serial.print("Connecting to MQTT broker: ");
  Serial.print(MQTT_BROKER);
  Serial.print(":");
  Serial.println(MQTT_PORT);
  
  int attempts = 0;
  while (!client.connected() && attempts < 3) {
    String clientId = String(DEVICE_ID);
    
    if (client.connect(clientId.c_str(), MQTT_USER, MQTT_PASSWORD)) {
      Serial.println("✓ MQTT Connected!");
      
      // Subscribe to command topic
      client.subscribe(COMMAND_TOPIC);
      Serial.print("Subscribed to: ");
      Serial.println(COMMAND_TOPIC);
      
      // Send online status
      client.publish(STATUS_TOPIC, "{\"status\":\"online\"}");
      
      // drawStatus("MQTT Connected", TFT_GREEN);
    } else {
      Serial.print("✗ MQTT Failed (");
      Serial.print(client.state());
      Serial.println(")");
      delay(2000);
      attempts++;
    }
  }
}

void sendHeartbeat() {
  // Create JSON heartbeat
  StaticJsonDocument<512> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["deviceType"] = DEVICE_TYPE;
  doc["timestamp"] = millis();  // Replace with actual time if you have NTP
  doc["uptime"] = millis();
  doc["freeMemory"] = ESP.getFreeHeap();
  doc["heap"] = ESP.getHeapSize();
  doc["wifiSignal"] = WiFi.RSSI();  // Signal strength in dBm
  doc["temperature"] = 32;  // Replace with actual sensor reading
  doc["batteryLevel"] = 95;  // Replace with actual battery level
  
  // Features
  JsonArray features = doc.createNestedArray("features");
  features.add("display");
  features.add("touch");
  features.add("wifi");
  features.add("mqtt");
  
  doc["version"] = FIRMWARE_VERSION;
  
  // Serialize and publish
  String payload;
  serializeJson(doc, payload);
  
  bool success = client.publish(HEARTBEAT_TOPIC, payload.c_str());
  
  if (success) {
    Serial.println("✓ Heartbeat sent");
    // drawHeartbeat();
  } else {
    Serial.println("✗ Heartbeat failed");
  }
}

void onMqttMessage(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message from MQTT: ");
  Serial.println(topic);
  
  // Parse JSON command
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, payload, length);
  
  if (error) {
    Serial.print("JSON parse error: ");
    Serial.println(error.c_str());
    return;
  }
  
  String action = doc["action"] | "";
  
  if (action == "display_update") {
    String text = doc["text"] | "No text";
    String color = doc["color"] | "white";
    int x = doc["x"] | 0;
    int y = doc["y"] | 0;
    
    Serial.println("Display command received:");
    Serial.print("  Text: ");
    Serial.println(text);
    Serial.print("  Color: ");
    Serial.println(color);
    
    // updateDisplay(text, color, x, y);
  } 
  else if (action == "show_status") {
    String message = doc["message"] | "Status";
    String icon = doc["icon"] | "";
    String color = doc["color"] | "green";
    
    Serial.println("Status command received:");
    Serial.print("  Message: ");
    Serial.println(message);
    Serial.print("  Icon: ");
    Serial.println(icon);
    
    // showStatusMessage(message, icon, color);
  }
  else if (action == "clear") {
    Serial.println("Clear display command received");
    // clearDisplay();
  }
  else if (action == "show_dashboard") {
    Serial.println("Show dashboard command received");
    // showDashboard(doc);
  }
}

// Display update function (implement for your display)
// void updateDisplay(String text, String color, int x, int y) {
//   // Draw text on display
//   // tft.setCursor(x, y);
//   // tft.println(text);
// }
```

---

## Step 4: Upload to BYTE Mini

1. **Select board**: Tools → Board → esp32 → BYTE Mini or similar ESP32 variant
2. **Select port**: Tools → Port → /dev/ttyUSB0 (or COM port on Windows)
3. **Set upload speed**: Tools → Upload Speed → 921600
4. **Upload**: Sketch → Upload (or Ctrl+U)

Wait for "Upload complete" message.

---

## Step 5: Verify Connection

Open Serial Monitor (Tools → Serial Monitor, 115200 baud) and watch for:

```
BYTE Mini CYD - WISE² Edge Hub
==============================
Connecting to WiFi: your_wifi_ssid
....✓ WiFi Connected!
IP: 192.168.x.x
Connecting to MQTT broker: wisepi.tail44396d.ts.net:1883
✓ MQTT Connected!
Subscribed to: wise2/device/byte-mini-01/command
✓ Heartbeat sent
✓ Heartbeat sent
...
```

---

## Step 6: Verify on Edge Hub

On the Pi, check device registration:

```bash
curl http://127.0.0.1:4900/devices | jq '.devices[] | select(.id=="byte-mini-01")'
```

Should show:
```json
{
  "id": "byte-mini-01",
  "online": true,
  "battery": 95,
  "signal": -45
}
```

---

## Step 7: Test Display Updates

Send a display command from Pi:

```bash
mosquitto_pub -h 127.0.0.1 -u dwise -P password \
  -t "wise2/device/byte-mini-01/command" \
  -m '{"action":"display_update","text":"Hello WISE²","color":"green","fontSize":24}'
```

Should see on BYTE Mini display: **"Hello WISE²"**

---

## Troubleshooting

### WiFi Not Connecting
- Check SSID and password in config.h
- Verify WiFi is 2.4GHz (not 5GHz)
- Check router range/signal

### MQTT Not Connecting
- Verify broker IP/hostname
- Check credentials (dwise/password)
- Try connecting to localhost first: `mosquitto_pub -h 127.0.0.1 -u dwise -P password -t test -m hello`

### No Display Output
- Check display library initialization
- Verify display is connected
- Check pin assignments for display
- Test with Serial.println() first

### Heartbeats Not Received
- Check MQTT topic name matches exactly
- Verify JSON serialization with `mosquitto_sub -v`
- Restart MQTT broker: `sudo systemctl restart mosquitto`

---

## Next Steps (Optional)

1. **Add display rendering** — Implement drawStatus(), drawDashboard(), etc.
2. **Add touch input** — Read touch events and publish to MQTT
3. **Add sensors** — Temperature, humidity, brightness
4. **Add battery monitoring** — Use ADC to measure battery level
5. **Time synchronization** — Use NTP to set accurate timestamp

---

## Reference

- **MQTT Topics**:
  - Heartbeat → `wise2/device/byte-mini-01/heartbeat`
  - Commands ← `wise2/device/byte-mini-01/command`
  - Status → `wise2/device/byte-mini-01/status`

- **Heartbeat Fields**:
  - deviceId, deviceType, timestamp, uptime
  - freeMemory, heap, wifiSignal, temperature
  - batteryLevel, features[], version

- **Command Actions**:
  - `display_update` — Show text at position
  - `show_status` — Status message with icon
  - `clear` — Clear display
  - `show_dashboard` — Show widget grid

---

**Ready to flash? Follow Steps 1-7 above to get your BYTE Mini connected!**
