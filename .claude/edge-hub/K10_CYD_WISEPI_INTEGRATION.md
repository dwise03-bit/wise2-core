# WISE² K10 + CYD 2.8 Integration via wisepi Gateway

**Date**: 2026-09-20  
**Architecture**: K10 (voice) + CYD 2.8 (display) ← Gateway → wisepi (Raspberry Pi)  
**Network**: Tailscale VPN with tag:edge routing  
**Status**: Implementation Ready

---

## Network Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    WISE² Infrastructure                  │
│  (gpu-nmls, vps, wise2-cloud-agent via Tailscale)      │
└────────────────────────┬────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐  ┌──────▼───────┐  ┌───▼──────┐
    │ wise2-  │  │    wisepi    │  │  Pocket  │
    │ skor-   │  │   (Gateway)  │  │  Node    │
    │ pious   │  │   Tailscale  │  │(HVAC)    │
    │(HVAC)   │  │   tag:edge   │  │          │
    │ port8080│  │  port 8888   │  │ port8080 │
    └─────────┘  └──┬───────┬───┘  └──────────┘
                    │       │
         ┌──────────┘       └──────────┐
         │                             │
    ┌────▼─────┐              ┌───────▼──────┐
    │    K10   │              │   CYD 2.8"   │
    │  (Voice) │              │  (Display)   │
    │  ASR/TTS │              │  ESP32       │
    │          │              │              │
    │ wiFi→    │              │ wiFi→        │
    │ 192.168. │              │ 192.168.     │
    │ x.x:4000 │              │ x.x:80       │
    └──────────┘              └──────────────┘
         │                            │
         └──────────────┬─────────────┘
                        │
                   wisepi Gateway
                   (MQTT + HTTP)
                   192.168.8.226
                   100.85.x.x (TS)
```

---

## Device Specifications

### wisepi (Gateway Hub)
- **Device**: Raspberry Pi (tag:edge)
- **Tailscale IP**: 100.85.x.x
- **Local IP**: 192.168.8.226
- **Gateway Services**:
  - MQTT Broker (mosquitto, port 1883)
  - HTTP Proxy/Router (port 8888)
  - mDNS Discovery (for local auto-discovery)
  - Dashboard Backend (port 3000)

### K10 (Voice Assistant)
- **Device**: Specialized IoT device
- **Features**: ASR (speech recognition), TTS (text-to-speech)
- **Connection**: WiFi to wisepi
- **API Port**: 4000 (on K10)
- **Communication**: HTTP/REST to wisepi gateway
- **Data Stream**: Voice commands → wisepi → HVAC diagnostics

### CYD 2.8" (Display)
- **Device**: ESP32 + 2.8" TFT display
- **Resolution**: 240x320 pixels
- **Connection**: WiFi to wisepi
- **API Port**: 80 (web interface)
- **Data Display**:
  - HVAC metrics from Pocket Node
  - System status
  - Real-time data streams
  - Alerts and notifications

---

## Implementation Steps

### Phase 1: wisepi Gateway Setup

#### 1.1 MQTT Broker Configuration
On wisepi, ensure mosquitto is running:

```bash
# SSH to wisepi
ssh user@wisepi

# Check MQTT broker
sudo systemctl status mosquitto
mosquitto_sub -h localhost -t 'wise2/#' -C 1 -W 2

# Configure for local + remote access
sudo nano /etc/mosquitto/mosquitto.conf

# Add these lines:
# listener 1883
# protocol mqtt
# allow_anonymous true
```

#### 1.2 HTTP Gateway Service
Create gateway proxy on wisepi at `192.168.8.226:8888`:

```bash
# Create gateway service
sudo tee /opt/wise2/gateway/k10-cyd-gateway.js << 'EOF'
const express = require('express');
const mqtt = require('mqtt');
const { createProxyMiddleware } = require('express-http-proxy');

const app = express();
const PORT = 8888;

// MQTT client for local bridge
const mqttClient = mqtt.connect('mqtt://localhost:1883');

// K10 proxy (voice service)
app.use('/k10', createProxyMiddleware({
  target: 'http://192.168.8.xxx:4000',  // K10 local IP
  changeOrigin: true,
  pathRewrite: { '^/k10': '' }
}));

// CYD proxy (display service)
app.use('/cyd', createProxyMiddleware({
  target: 'http://192.168.8.yyy:80',    // CYD local IP
  changeOrigin: true,
  pathRewrite: { '^/cyd': '' }
}));

// MQTT bridge endpoint
app.post('/mqtt/publish', express.json(), (req, res) => {
  const { topic, message } = req.body;
  mqttClient.publish(topic, JSON.stringify(message));
  res.json({ status: 'published', topic, message });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'online',
    gateway: 'wisepi',
    k10: 'checking...',
    cyd: 'checking...',
    mqtt: mqttClient.connected ? 'connected' : 'disconnected'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`WISE² K10/CYD Gateway listening on port ${PORT}`);
});

mqttClient.on('connect', () => {
  console.log('MQTT connected');
  mqttClient.subscribe('wise2/k10/#');
  mqttClient.subscribe('wise2/cyd/#');
});

mqttClient.on('message', (topic, message) => {
  console.log(`[${topic}] ${message.toString()}`);
});
EOF

# Start service
node /opt/wise2/gateway/k10-cyd-gateway.js
```

#### 1.3 Network Configuration
```bash
# On wisepi, ensure local network allows device discovery
# Check UFW rules
sudo ufw allow in on eth0 from 192.168.8.0/24
sudo ufw allow 8888/tcp
sudo ufw allow 1883/tcp

# Enable mDNS for auto-discovery
sudo apt-get install avahi-daemon
sudo systemctl enable avahi-daemon
```

---

### Phase 2: K10 Configuration

#### 2.1 K10 Network Setup
On K10 device (via SSH or console):

```bash
# Connect to WiFi
iwconfig wlan0 essid "your-ssid" key your-key

# Set static IP (optional but recommended)
# Edit /etc/network/interfaces
auto wlan0
iface wlan0 inet static
  address 192.168.8.100
  netmask 255.255.255.0
  gateway 192.168.8.1
```

#### 2.2 K10 Discovery Registration
Register K10 with wisepi gateway:

```bash
# On K10, create discovery script
cat > /opt/k10/register-with-gateway.sh << 'EOF'
#!/bin/bash
GATEWAY_IP="192.168.8.226"
GATEWAY_PORT="8888"
K10_IP=$(hostname -I | awk '{print $1}')
K10_HOSTNAME=$(hostname -s)

# Register with gateway
curl -X POST http://$GATEWAY_IP:$GATEWAY_PORT/devices/register \
  -H "Content-Type: application/json" \
  -d "{
    \"device_type\": \"k10\",
    \"hostname\": \"$K10_HOSTNAME\",
    \"ip\": \"$K10_IP\",
    \"port\": 4000,
    \"features\": [\"asr\", \"tts\", \"voice_control\"]
  }"

# Subscribe to gateway commands
while true; do
  mosquitto_sub -h $GATEWAY_IP -t "wise2/k10/commands" | while read msg; do
    echo "Command received: $msg"
    # Process K10 commands
    case $msg in
      "start_listening") /opt/k10/asr.sh ;;
      "stop_listening") pkill asr ;;
      *) echo "Unknown command: $msg" ;;
    esac
  done
done
EOF

chmod +x /opt/k10/register-with-gateway.sh
```

#### 2.3 K10 MQTT Publishing
K10 publishes voice data to MQTT:

```bash
# On K10, send ASR results to gateway
cat > /opt/k10/voice-to-mqtt.sh << 'EOF'
#!/bin/bash
MQTT_HOST="192.168.8.226"
MQTT_TOPIC="wise2/k10/voice-input"

# Capture voice input and publish
while true; do
  # Example: read from audio input
  VOICE_DATA=$(arecord -t wav -c 1 -r 16000 -d 3 - | base64)
  
  mosquitto_pub -h $MQTT_HOST \
    -t $MQTT_TOPIC \
    -m "{\"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\", \"audio_base64\": \"$VOICE_DATA\"}"
  
  sleep 1
done
EOF

chmod +x /opt/k10/voice-to-mqtt.sh
```

---

### Phase 3: CYD 2.8" Configuration

#### 3.1 CYD Firmware
Load firmware on CYD ESP32:

```cpp
// CYD 2.8" Firmware (Arduino/PlatformIO)
// Display dashboard connected to wisepi gateway

#include <WiFi.h>
#include <HTTPClient.h>
#include <TFT_eSPI.h>
#include <PubSubClient.h>

#define SCREEN_WIDTH 320
#define SCREEN_HEIGHT 240

TFT_eSPI tft = TFT_eSPI();
WiFiClient espClient;
PubSubClient mqttClient(espClient);

const char* ssid = "SSID";
const char* password = "PASSWORD";
const char* mqtt_server = "192.168.8.226";
const char* gateway = "192.168.8.226:8888";

void setup() {
  Serial.begin(115200);
  tft.init();
  tft.setRotation(1);
  tft.fillScreen(TFT_BLACK);
  
  // Connect to WiFi
  connectWiFi();
  
  // Setup MQTT
  mqttClient.setServer(mqtt_server, 1883);
  mqttClient.setCallback(onMqttMessage);
  
  drawInitScreen();
}

void loop() {
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();
  
  // Update display every 5 seconds
  delay(5000);
  updateDisplay();
}

void connectWiFi() {
  WiFi.begin(ssid, password);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  Serial.println("\nWiFi connected");
}

void reconnectMQTT() {
  if (mqttClient.connect("CYD_2.8")) {
    Serial.println("MQTT connected");
    mqttClient.subscribe("wise2/pocket-node/hvac");
    mqttClient.subscribe("wise2/cyd/commands");
  } else {
    delay(5000);
  }
}

void onMqttMessage(char* topic, byte* payload, unsigned int length) {
  String msg = String((char*)payload).substring(0, length);
  
  if (strcmp(topic, "wise2/pocket-node/hvac") == 0) {
    displayHVACData(msg);
  } else if (strcmp(topic, "wise2/cyd/commands") == 0) {
    handleCommand(msg);
  }
}

void displayHVACData(String data) {
  tft.fillScreen(TFT_BLACK);
  tft.setTextColor(TFT_WHITE);
  tft.setTextSize(2);
  
  tft.drawString("HVAC Status", 10, 10);
  tft.setTextSize(1);
  tft.drawString(data, 10, 40);
  
  // Parse and display key metrics
  // Example: suction PSI, liquid PSI, supply temp, return temp
}

void drawInitScreen() {
  tft.fillScreen(TFT_NAVY);
  tft.setTextColor(TFT_CYAN);
  tft.setTextSize(2);
  tft.drawString("WISE2 CYD Display", 30, 50);
  tft.setTextSize(1);
  tft.drawString("Connecting to gateway...", 40, 100);
}

void updateDisplay() {
  // Fetch latest data from gateway
  HTTPClient http;
  http.begin("http://192.168.8.226:8888/health");
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String payload = http.getString();
    // Parse and display
  }
  http.end();
}

void handleCommand(String cmd) {
  if (cmd == "refresh") {
    updateDisplay();
  } else if (cmd == "brightness:50") {
    // Adjust brightness
  }
}
```

#### 3.2 CYD Deployment
```bash
# Via PlatformIO
platformio run -e esp32s3 --target upload

# Or via Arduino IDE
# 1. Select ESP32-S3-DevKitC-1
# 2. Upload compiled .ino sketch
# 3. Monitor serial for debug output
```

---

### Phase 4: Pocket Node Integration

#### 4.1 Sync K10 Data to Pocket Node
```bash
# On wisepi, forward K10 voice data to Pocket Node
cat > /opt/wise2/gateway/sync-k10-to-pocket.js << 'EOF'
const mqtt = require('mqtt');

const localMqtt = mqtt.connect('mqtt://localhost:1883');
const pocketNodeMqtt = mqtt.connect('mqtt://100.85.242.34:1883'); // Pocket Node Tailscale IP

localMqtt.on('message', (topic, message) => {
  if (topic.includes('wise2/k10')) {
    // Forward to Pocket Node
    pocketNodeMqtt.publish(topic, message);
    console.log(`[K10→Pocket] ${topic}: ${message.toString().substring(0,50)}...`);
  }
});

localMqtt.subscribe('wise2/k10/#');
EOF
```

#### 4.2 Push HVAC Data to CYD
```bash
# On Pocket Node, send HVAC data to CYD via wisepi gateway
GATEWAY="192.168.8.226:8888"

curl -X POST http://$GATEWAY/mqtt/publish \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "wise2/pocket-node/hvac",
    "message": {
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
      "suction_psi": 100,
      "liquid_psi": 200,
      "supply_temp": 45,
      "return_temp": 75,
      "delta_t": 30,
      "superheat": 12,
      "subcooling": 10
    }
  }'
```

---

## Tagging & Network Policy

### Machine Tags
- **wisepi** (gateway): `tag:edge`
- **wise2-skorpious** (Pocket Node): `tag:edge`
- K10 and CYD: Local network only (no Tailscale, connect via wisepi)

### ACL Rules (for Pocket Node ↔ wisepi)
```json
{
  "action": "accept",
  "src": ["tag:edge"],
  "dst": ["tag:edge:1883,8080,3000,8888"]
}
```

### Network Routing
```
K10 (192.168.8.100:4000)
  ↓ WiFi + MQTT
wisepi Gateway (192.168.8.226:8888)
  ↓ MQTT (local) + Tailscale (remote)
Pocket Node (100.85.242.34:8080)
  ↓ Tailscale
Infrastructure (GPU, VPS)
```

---

## Testing & Verification

### 1. Gateway Health Check
```bash
curl http://192.168.8.226:8888/health
# Expected: { "status": "online", "k10": "...", "cyd": "...", "mqtt": "connected" }
```

### 2. K10 Registration
```bash
mosquitto_sub -h 192.168.8.226 -t 'wise2/k10/+' -C 5
# Should see voice data, commands
```

### 3. CYD Display
```bash
# Check CYD serial output
# Should show: WiFi connected, MQTT connected, HVAC data received
```

### 4. Pocket Node Sync
```bash
# On Pocket Node
mosquitto_sub -t 'wise2/k10/#' -C 1
# Should see K10 voice data forwarded from wisepi
```

### 5. End-to-End Voice Test
```bash
# Speak to K10
# K10 → wisepi gateway → MQTT → Pocket Node
# Pocket Node → HVAC diagnostics → CYD display
```

---

## File Structure

```
wisepi:/opt/wise2/
├── gateway/
│   ├── k10-cyd-gateway.js          (HTTP proxy + MQTT bridge)
│   ├── sync-k10-to-pocket.js       (Data forwarding)
│   └── gateway-systemd.service     (Auto-start)
├── k10/
│   └── register-with-gateway.sh
└── cyd/
    ├── firmware.ino                (CYD ESP32 sketch)
    └── platformio.ini              (Build config)

Pocket Node:/opt/wise2/
├── integrations/
│   └── gateway-sync-service.js     (Receives K10 + CYD data)
└── dashboard/
    └── add CYD metrics display

K10:/opt/k10/
├── register-with-gateway.sh
└── voice-to-mqtt.sh

CYD:/firmware/
└── cyd-2.8-wise2.bin               (Compiled firmware)
```

---

## Deployment Checklist

- [ ] wisepi gateway HTTP service running (port 8888)
- [ ] wisepi MQTT broker accessible from local network
- [ ] K10 WiFi connected to wisepi LAN
- [ ] K10 registered with gateway (/health shows K10: "online")
- [ ] K10 voice data publishing to MQTT
- [ ] CYD WiFi connected to wisepi LAN
- [ ] CYD firmware flashed and running
- [ ] CYD subscribing to MQTT (serial shows connected)
- [ ] wisepi forwarding K10 data to Pocket Node (Tailscale)
- [ ] Pocket Node receiving K10 voice data
- [ ] Pocket Node publishing HVAC data to CYD via gateway
- [ ] CYD displaying HVAC metrics in real-time
- [ ] End-to-end test: speak to K10 → see results on CYD
- [ ] All data synced to WISE² infrastructure

---

## Quick Start

```bash
# 1. SSH to wisepi
ssh user@wisepi

# 2. Deploy gateway service
node /opt/wise2/gateway/k10-cyd-gateway.js &

# 3. Deploy K10 integration
ssh k10-user@192.168.8.100 'bash register-with-gateway.sh' &

# 4. Flash CYD with firmware
# (Upload via Arduino IDE or platformio)

# 5. Verify integration
curl http://192.168.8.226:8888/health
mosquitto_sub -h 192.168.8.226 -t 'wise2/#' -C 5

# 6. Test end-to-end
# Speak to K10, watch CYD display update with HVAC data
```

---

**Status**: Architecture Complete, Ready for Implementation  
**Owner**: dwise (dwise03@gmail.com)  
**Last Updated**: 2026-09-20
