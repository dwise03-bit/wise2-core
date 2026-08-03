# BYTE Mini CYD — Flash Quickstart (5 minutes)

**What You Need**:
- Arduino IDE (free download)
- USB cable (likely included with BYTE Mini)
- WiFi SSID + password
- ~5 minutes

---

## Step 1: Install Arduino IDE (if needed)

```bash
# On Mac via Homebrew
brew install arduino-ide

# Or download from https://www.arduino.cc/en/software
```

---

## Step 2: Open Arduino IDE and Install Libraries

1. Open Arduino IDE
2. Go to **Sketch → Include Library → Manage Libraries**
3. Search for and install:
   - **PubSubClient** (by Nick O'Leary) — click Install
   - **ArduinoJson** (by Benoit Blanchon) — click Install

Wait for each to complete.

---

## Step 3: Connect BYTE Mini via USB

Plug in your BYTE Mini CYD with a USB cable to your Mac.

Check it's recognized:

```bash
# On Mac terminal
ls /dev/tty.* | grep -i usb
# Should show: /dev/tty.usbserial-XXXXX (or similar)
```

---

## Step 4: Create Arduino Sketch

In Arduino IDE:
1. **File → New**
2. Copy entire code below into the sketch

---

## Step 5: Sketch Code (Copy & Paste This)

**Sketch File 1: `byte_mini_edge_hub.ino`**

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ===== CONFIGURATION =====
// CHANGE THESE FOR YOUR NETWORK:
const char* SSID = "your_wifi_ssid";              // ← CHANGE THIS
const char* PASSWORD = "your_wifi_password";      // ← CHANGE THIS

// MQTT Configuration (don't change)
const char* MQTT_BROKER = "wisepi.tail44396d.ts.net";
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

// Timing
const long HEARTBEAT_INTERVAL = 10000;  // 10 seconds

// ===== SETUP =====
WiFiClient espClient;
PubSubClient client(espClient);
unsigned long lastHeartbeat = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\nBYTE Mini CYD - WISE² Edge Hub");
  Serial.println("==============================");
  
  connectToWiFi();
  
  client.setServer(MQTT_BROKER, MQTT_PORT);
  client.setCallback(onMqttMessage);
  
  Serial.println("Setup complete!");
}

void loop() {
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();
  
  if (millis() - lastHeartbeat >= HEARTBEAT_INTERVAL) {
    sendHeartbeat();
    lastHeartbeat = millis();
  }
  
  delay(100);
}

// ===== WIFI CONNECT =====
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
  } else {
    Serial.println("\n✗ WiFi Failed!");
  }
}

// ===== MQTT CONNECT =====
void reconnectMQTT() {
  Serial.print("Connecting to MQTT: ");
  Serial.println(MQTT_BROKER);
  
  int attempts = 0;
  while (!client.connected() && attempts < 3) {
    String clientId = String(DEVICE_ID);
    
    if (client.connect(clientId.c_str(), MQTT_USER, MQTT_PASSWORD)) {
      Serial.println("✓ MQTT Connected!");
      client.subscribe(COMMAND_TOPIC);
      client.publish(STATUS_TOPIC, "{\"status\":\"online\"}");
    } else {
      Serial.print("✗ MQTT Failed (");
      Serial.print(client.state());
      Serial.println(")");
      delay(2000);
      attempts++;
    }
  }
}

// ===== HEARTBEAT =====
void sendHeartbeat() {
  StaticJsonDocument<512> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["deviceType"] = DEVICE_TYPE;
  doc["timestamp"] = millis();
  doc["uptime"] = millis();
  doc["freeMemory"] = ESP.getFreeHeap();
  doc["heap"] = ESP.getHeapSize();
  doc["wifiSignal"] = WiFi.RSSI();
  doc["temperature"] = 32;
  doc["batteryLevel"] = 95;
  
  JsonArray features = doc.createNestedArray("features");
  features.add("display");
  features.add("touch");
  features.add("wifi");
  features.add("mqtt");
  
  doc["version"] = FIRMWARE_VERSION;
  
  String payload;
  serializeJson(doc, payload);
  
  bool success = client.publish(HEARTBEAT_TOPIC, payload.c_str());
  
  if (success) {
    Serial.println("✓ Heartbeat sent");
  }
}

// ===== MQTT MESSAGE HANDLER =====
void onMqttMessage(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message: ");
  Serial.println(topic);
  
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, payload, length);
  
  if (error) {
    Serial.print("JSON error: ");
    Serial.println(error.c_str());
    return;
  }
  
  String action = doc["action"] | "";
  
  if (action == "display_update") {
    String text = doc["text"] | "No text";
    String color = doc["color"] | "white";
    Serial.print("Display: ");
    Serial.println(text);
  }
}
```

---

## Step 6: Configure Board & Port

1. **Select Board**: Tools → Board → esp32 → **BYTE Mini** (or generic ESP32)
2. **Select Port**: Tools → Port → `/dev/tty.usbserial-XXXXX` (the one from Step 3)
3. **Set Speed**: Tools → Upload Speed → **921600**

---

## Step 7: Upload to Device

1. Click the **Upload** button (arrow icon) or press **Ctrl+U**
2. Watch the console for upload progress
3. Wait for: **"Leaving... Hard resetting via RTS pin..."**

---

## Step 8: Watch the Serial Output

1. **Tools → Serial Monitor**
2. Set baud rate to **115200** (bottom-right dropdown)
3. Watch for output:

```
BYTE Mini CYD - WISE² Edge Hub
==============================
Connecting to WiFi: your_wifi_ssid
....✓ WiFi Connected!
IP: 192.168.x.x
Connecting to MQTT: wisepi.tail44396d.ts.net:1883
✓ MQTT Connected!
✓ Heartbeat sent
✓ Heartbeat sent
✓ Heartbeat sent
...
```

If you see this, **SUCCESS!** ✅

---

## Step 9: Verify on Pi

From your Mac terminal:

```bash
ssh dwise@wisepi.tail44396d.ts.net
curl http://127.0.0.1:4900/devices | jq '.devices[] | select(.id=="byte-mini-01")'
```

Should show:
```json
{
  "deviceId": "byte-mini-01",
  "deviceType": "byte-mini-cyd",
  "isOnline": true,
  "lastHeartbeat": {
    "timestamp": 1722707800000,
    "batteryLevel": 95,
    "wifiSignal": -45
  }
}
```

---

## Troubleshooting

### "Board not found" in Upload
- **Check port**: Is `/dev/tty.usbserial-*` listed in Tools → Port?
- **Check USB cable**: Try a different cable
- **Check drivers**: On Mac, may need CH340 driver (google "CH340 driver mac")

### "WiFi won't connect"
- Verify WiFi SSID and password in code (line 7-8)
- Ensure it's 2.4GHz (not 5GHz)
- Check signal strength (device close to router)

### "MQTT won't connect"
- Make sure Pi is reachable: `ping wisepi.tail44396d.ts.net`
- Check credentials: user=`dwise`, password=`password`
- Verify MQTT broker is running on Pi

### No serial output in monitor
- Check baud rate is **115200**
- Unplug/replug USB cable
- Try a different USB port on your Mac

---

## Next Steps (After Success)

Once device is online and sending heartbeats:

1. **Send a display message**:
   ```bash
   ssh dwise@wisepi.tail44396d.ts.net
   mosquitto_pub -h 127.0.0.1 -u dwise -P password \
     -t "wise2/device/byte-mini-01/command" \
     -m '{"action":"display_update","text":"WISE² Ready","color":"green"}'
   ```

2. **See the display update** (if you have the display library installed on BYTE Mini)

3. **Check the dashboard** to see device status in real-time

---

## Done! 🎉

Your BYTE Mini CYD is now connected to the WISE² Edge Hub and ready for display updates!

