# K10 + CYD Integration with WISE² Existing Projects

**Date**: 2026-09-20  
**Status**: Integration Architecture Ready  
**Scope**: Connect K10 (voice), CYD (display) with 8 major WISE² systems

---

## Integration Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    WISE² Unified System                              │
│                                                                       │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────┐      │
│  │  K10 Voice  │  │ CYD Display  │  │  skorpius Gateway       │      │
│  │  (ASR/TTS)  │  │ (2.8" TFT)   │  │  (Port 8888 + MQTT)   │      │
│  └──────┬──────┘  └──────┬───────┘  └───────────┬───────────┘      │
│         │                │                      │                  │
│         └────────────────┴──────────────────────┘                  │
│                          │                                          │
│    ┌─────────────────────┼─────────────────────┐                  │
│    │                     │                     │                  │
│    ▼                     ▼                     ▼                  │
│  ┌──────────┐      ┌──────────────┐    ┌─────────────────┐      │
│  │ Pocket   │      │ Command      │    │ Second Brain    │      │
│  │ Node     │      │ Center       │    │ (Knowledge DB)  │      │
│  │ (HVAC)   │      │ (Dashboard)  │    │ (API + Search)  │      │
│  └──┬───────┘      └──────┬───────┘    └────────┬────────┘      │
│     │                     │                     │                 │
│     └─────────┬───────────┴─────────────────────┘                 │
│               │                                                    │
│    ┌──────────▼──────────────────┐                               │
│    │  Shared Data Layer           │                              │
│    │  - MQTT Topics               │                              │
│    │  - HVAC Contracts            │                              │
│    │  - Device Registry           │                              │
│    │  - Real-time Metrics         │                              │
│    └──────────────────────────────┘                              │
│               │                                                    │
│    ┌──────────▼──────────────────┐                               │
│    │  Backend Services            │                              │
│    │  - wise-discord              │                              │
│    │  - reaper-bridge             │                              │
│    │  - paperclip                 │                              │
│    └──────────────────────────────┘                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Project Integration Map

### 1. **products/byte-k10** ↔ K10 Voice Device
**Current**: K10 device firmware and APIs  
**Integration**:
```javascript
// products/byte-k10/src/networking/gateway-sync.ts
class K10GatewayBridge {
  private gatewayUrl = 'http://192.168.8.226:8888';
  
  async registerWithGateway(): Promise<void> {
    // Called on K10 boot
    await this.post('/devices/register', {
      device_type: 'k10',
      ip: this.getLocalIP(),
      port: 4000,
      hostname: 'byte-k10',
      features: ['asr', 'tts', 'voice_control']
    });
  }
  
  async publishVoiceInput(audio: AudioBuffer): Promise<void> {
    // Send ASR results to gateway
    await this.mqtt.publish('wise2/k10/voice-input', {
      timestamp: new Date().toISOString(),
      audio_base64: this.encodeAudio(audio),
      device_id: 'byte-k10'
    });
  }
}
```

**Files to create**:
- `products/byte-k10/src/networking/gateway-sync.ts`
- `products/byte-k10/docs/WISEPI_GATEWAY_INTEGRATION.md`

---

### 2. **products/byte-c5** ↔ CYD 2.8" Display
**Current**: (Placeholder for future display product)  
**Integration**: CYD becomes the display tier
```cpp
// New: products/byte-cyd-2.8/firmware/src/gateway-client.cpp
class CYDGatewayClient {
private:
  const char* gatewayIP = "192.168.8.226";
  const int gatewayPort = 8888;
  
  void registerWithGateway() {
    // Called on CYD boot
    HTTPClient http;
    http.begin(gatewayIP, gatewayPort, "/devices/register");
    http.addHeader("Content-Type", "application/json");
    
    String payload = R"({
      "device_type": "cyd",
      "ip": ")" + getLocalIP() + R"(",
      "port": 80,
      "hostname": "cyd-2.8",
      "features": ["display", "mqtt_subscribe"]
    })";
    
    http.POST(payload);
  }
  
  void displayHVACData(const char* jsonData) {
    // Parse HVAC metrics from MQTT
    // Update TFT display in real-time
  }
};
```

**Files to create**:
- `products/byte-cyd-2.8/` (new product directory)
- `products/byte-cyd-2.8/firmware/` (ESP32 firmware)
- `products/byte-cyd-2.8/docs/`

---

### 3. **packages/wise2-hvac-contracts** ↔ Data Schema
**Current**: HVAC data structures  
**Integration**: Define shared MQTT topics and message formats
```typescript
// packages/wise2-hvac-contracts/src/gateway.ts
export interface GatewayDeviceRegistry {
  [deviceType: string]: DeviceInfo;
}

export interface HVACMetricsMessage {
  timestamp: string;
  suction_psi: number;
  liquid_psi: number;
  supply_temp: number;
  return_temp: number;
  delta_t: number;
  superheat: number;
  subcooling: number;
  refrigerant: 'R-410A' | 'R-22' | 'R-32' | 'R-454B';
  equipment_id: string;
}

export interface K10VoiceInput {
  timestamp: string;
  audio_base64: string;
  device_id: string;
  language: string;
  confidence: number;
}

export interface CYDDisplayUpdate {
  timestamp: string;
  display_type: 'hvac_metrics' | 'alerts' | 'status';
  data: HVACMetricsMessage | AlertMessage;
  refresh_interval_ms: number;
}

// MQTT Topic Structure
export const MQTT_TOPICS = {
  GATEWAY_HEALTH: 'wise2/gateway/health',
  K10_VOICE_INPUT: 'wise2/k10/voice-input',
  K10_QUESTIONS: 'wise2/k10/questions',
  POCKET_NODE_HVAC: 'wise2/pocket-node/hvac',
  CYD_DISPLAY: 'wise2/cyd/display',
  DEVICE_REGISTRY: 'wise2/gateway/devices'
} as const;
```

**Files to update**:
- `packages/wise2-hvac-contracts/src/gateway.ts` (new)
- `packages/wise2-hvac-contracts/src/mqtt.ts` (new)

---

### 4. **pi/** ↔ Raspberry Pi / skorpius Gateway
**Current**: Pi configuration and scripts  
**Integration**: Deploy gateway service to skorpius
```bash
# pi/scripts/deploy-gateway.sh
#!/bin/bash
set -e

echo "Deploying WISE² K10/CYD Gateway to skorpius..."

# 1. Update system
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Node.js and MQTT
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs mosquitto mosquitto-clients

# 3. Create gateway directory
sudo mkdir -p /opt/wise2/gateway
sudo chown -R $USER:$USER /opt/wise2/gateway

# 4. Deploy gateway service
cp .claude/edge-hub/k10-cyd-gateway-service.js /opt/wise2/gateway/
cp .claude/edge-hub/k10-cyd-gateway.service /etc/systemd/system/

# 5. Install npm dependencies
cd /opt/wise2/gateway
npm install express mqtt axios

# 6. Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable k10-cyd-gateway
sudo systemctl start k10-cyd-gateway

echo "✓ Gateway deployed to skorpius at port 8888"
```

**Files to create/update**:
- `pi/scripts/deploy-gateway.sh`
- `pi/config/skorpius-gateway-config.json`
- `pi/docs/GATEWAY_DEPLOYMENT.md`

---

### 5. **wise2-command-center** ↔ Dashboard Display
**Current**: Central command dashboard  
**Integration**: Add K10/CYD status panel and HVAC display
```typescript
// wise2-command-center/src/components/K10CYDMonitor.tsx
import React from 'react';
import { useEffect, useState } from 'react';

interface GatewayStatus {
  k10: DeviceStatus;
  cyd: DeviceStatus;
  mqtt: 'connected' | 'disconnected';
  hvac_last_update: string;
}

export const K10CYDMonitor: React.FC = () => {
  const [status, setStatus] = useState<GatewayStatus | null>(null);
  const [hvacData, setHvacData] = useState(null);

  useEffect(() => {
    const fetchGatewayStatus = async () => {
      const response = await fetch('http://192.168.8.226:8888/health');
      const data = await response.json();
      setStatus(data);
    };

    const interval = setInterval(fetchGatewayStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="gateway-monitor">
      <h2>K10 + CYD Gateway</h2>
      
      {status && (
        <>
          <DeviceCard 
            name="K10 Voice" 
            status={status.k10.status}
            ip={status.k10.ip}
          />
          <DeviceCard 
            name="CYD Display" 
            status={status.cyd.status}
            ip={status.cyd.ip}
          />
          <MQTTStatus status={status.mqtt} />
          <HVACMetricsPanel data={hvacData} />
        </>
      )}
    </div>
  );
};
```

**Files to create**:
- `wise2-command-center/src/components/K10CYDMonitor.tsx`
- `wise2-command-center/src/hooks/useGatewayStatus.ts`

---

### 6. **services/** ↔ Backend Services
**Current**: wise-discord, reaper-bridge, paperclip  
**Integration**: K10/CYD events propagate to these services
```typescript
// services/wise-discord/src/handlers/gateway-events.ts
import { Client } from 'discord.js';
import mqtt from 'mqtt';

export class GatewayEventHandler {
  private mqtt: mqtt.MqttClient;
  private discord: Client;

  constructor(discordClient: Client, mqttUrl: string) {
    this.discord = discordClient;
    this.mqtt = mqtt.connect(mqttUrl);
    this.setupListeners();
  }

  private setupListeners() {
    // K10 voice commands → Discord notifications
    this.mqtt.subscribe('wise2/k10/questions');
    this.mqtt.on('message', (topic, message) => {
      if (topic === 'wise2/k10/questions') {
        const question = JSON.parse(message.toString());
        this.notifyDiscord(`K10: ${question.text}`);
      }
    });

    // HVAC alerts → Discord channel
    this.mqtt.subscribe('wise2/pocket-node/alerts');
    this.mqtt.on('message', (topic, message) => {
      if (topic === 'wise2/pocket-node/alerts') {
        const alert = JSON.parse(message.toString());
        this.sendAlertToDiscord(alert);
      }
    });
  }

  private notifyDiscord(message: string) {
    const channel = this.discord.channels.cache.get('hvac-alerts');
    if (channel?.isTextBased()) {
      channel.send(message);
    }
  }
}
```

**Files to create**:
- `services/wise-discord/src/handlers/gateway-events.ts`
- `services/wise-bridge-gateway/` (new service for gateway integration)

---

### 7. **second-brain** ↔ Knowledge Base
**Current**: API server, search, sync engine  
**Integration**: Index K10 conversations and HVAC diagnostics
```typescript
// second-brain/integrations/gateway-sync.ts
import axios from 'axios';
import mqtt from 'mqtt';

export class GatewaySyncEngine {
  private secondBrainAPI = 'http://localhost:3012';
  private mqtt: mqtt.MqttClient;

  async indexK10Conversation(question: string, response: string) {
    // Store K10 Q&A in Second Brain for learning
    await axios.post(`${this.secondBrainAPI}/api/documents`, {
      source: 'k10-voice',
      title: `K10: ${question}`,
      content: `Q: ${question}\nA: ${response}`,
      tags: ['voice', 'k10', 'hvac-assistant'],
      timestamp: new Date().toISOString()
    });
  }

  async indexHVACDiagnostic(diagnostic: any) {
    // Store HVAC diagnostics for knowledge retrieval
    await axios.post(`${this.secondBrainAPI}/api/documents`, {
      source: 'pocket-node-hvac',
      title: `HVAC: ${diagnostic.equipment_id}`,
      content: JSON.stringify(diagnostic, null, 2),
      tags: ['hvac', 'diagnostic', 'pocket-node'],
      timestamp: diagnostic.timestamp
    });
  }
}
```

**Files to create**:
- `second-brain/integrations/gateway-sync.ts`
- `second-brain/integrations/gateway-sync.test.ts`

---

### 8. **Pocket Node (existing)** ↔ K10/CYD Bridge
**Current**: HVAC diagnostics  
**Integration**: Two-way sync with K10/CYD via gateway
```typescript
// .claude/edge-hub/pocket-node-gateway-sync.ts
import mqtt from 'mqtt';
import axios from 'axios';

export class PocketNodeGatewaySync {
  private mqtt: mqtt.MqttClient;
  private gatewayURL = 'http://192.168.8.226:8888';

  async init() {
    this.mqtt = mqtt.connect('mqtt://localhost:1883');

    // Subscribe to K10 voice input
    this.mqtt.subscribe('wise2/k10/voice-input');
    this.mqtt.on('message', async (topic, message) => {
      if (topic === 'wise2/k10/voice-input') {
        await this.processK10Input(JSON.parse(message.toString()));
      }
    });

    // Publish HVAC metrics to CYD display
    setInterval(async () => {
      const hvacData = await this.getLatestHVACMetrics();
      this.mqtt.publish('wise2/pocket-node/hvac', JSON.stringify(hvacData));
    }, 5000);
  }

  private async processK10Input(input: any) {
    // K10 voice query → Pocket Node HVAC analysis
    const analysis = await this.analyzeWithHVACEngine(input);
    
    // Send response back to K10
    await axios.post(`${this.gatewayURL}/k10/ask`, {
      question: input.text,
      response: analysis.recommendation,
      equipment: input.equipment_id
    });
  }

  private async getLatestHVACMetrics() {
    // Query Pocket Node database for latest HVAC data
    return {
      timestamp: new Date().toISOString(),
      suction_psi: 100,
      liquid_psi: 200,
      supply_temp: 45,
      return_temp: 75,
      delta_t: 30,
      equipment_id: 'RTU-01'
    };
  }
}
```

**Files to create/update**:
- `.claude/edge-hub/pocket-node-gateway-sync.ts` (new)
- `.claude/edge-hub/POCKET_NODE_GATEWAY_INTEGRATION.md` (new)

---

## Deployment Sequence

### Phase 1: Core Infrastructure (Week 1)
1. Deploy gateway to skorpius: `bash pi/scripts/deploy-gateway.sh`
2. Connect K10 device to skorpius WiFi
3. Connect CYD display to skorpius WiFi
4. Verify all 3 devices register with gateway

### Phase 2: Data Layer (Week 2)
1. Update `packages/wise2-hvac-contracts` with MQTT schemas
2. Deploy Pocket Node ↔ Gateway sync
3. Test K10 voice → Pocket Node → CYD data flow

### Phase 3: Integration (Week 3)
1. Add gateway monitoring to Command Center
2. Connect wise-discord to gateway events
3. Set up Second Brain indexing of conversations
4. Enable Discord alerts from HVAC diagnostics

### Phase 4: Optimization (Week 4)
1. Performance tuning (MQTT QoS, message batching)
2. Failover handling (gateway down, device disconnects)
3. Extended monitoring and logging

---

## Files Summary

| File | Purpose | Status |
|------|---------|--------|
| `.claude/edge-hub/K10_CYD_WISEPI_INTEGRATION.md` | Implementation guide | ✅ Created |
| `.claude/edge-hub/k10-cyd-gateway-service.js` | Gateway Node.js service | ✅ Created |
| `.claude/edge-hub/k10-cyd-gateway.service` | Systemd service | ✅ Created |
| `.claude/edge-hub/deploy-k10-cyd-gateway.sh` | Deployment script | ✅ Created |
| `pi/scripts/deploy-gateway.sh` | Pi deployment | ⏳ To create |
| `packages/wise2-hvac-contracts/src/gateway.ts` | Shared types | ⏳ To create |
| `products/byte-k10/src/networking/gateway-sync.ts` | K10 integration | ⏳ To create |
| `wise2-command-center/src/components/K10CYDMonitor.tsx` | Dashboard widget | ⏳ To create |
| `services/wise-discord/src/handlers/gateway-events.ts` | Discord integration | ⏳ To create |
| `second-brain/integrations/gateway-sync.ts` | Knowledge sync | ⏳ To create |
| `.claude/edge-hub/pocket-node-gateway-sync.ts` | Pocket Node bridge | ⏳ To create |

---

## Network Configuration

```
Local Network (192.168.8.0/24):
  K10:      192.168.8.100:4000  (voice ASR/TTS)
  CYD:      192.168.8.101:80    (display)
  skorpius:   192.168.8.226:8888  (gateway)
  Pocket:   192.168.8.227:3000  (HVAC)

Tailscale Network (100.85.0.0/16):
  skorpius:   100.85.x.x:8888
  Pocket:   100.85.242.34:8080
  Cloud:    100.85.x.x (infrastructure)

MQTT Topics (Local + Tailscale):
  wise2/k10/#              (voice I/O)
  wise2/cyd/#              (display)
  wise2/pocket-node/#      (HVAC)
  wise2/gateway/#          (gateway status)
```

---

## Quick Integration Checklist

- [ ] Deploy gateway to skorpius
- [ ] Update HVAC contracts with gateway schemas
- [ ] Add K10 gateway sync to products/byte-k10
- [ ] Create Pocket Node ↔ Gateway bridge
- [ ] Add K10/CYD monitor to Command Center
- [ ] Connect wise-discord to gateway events
- [ ] Set up Second Brain indexing
- [ ] Create pi deployment script
- [ ] Document in each project's README

---

**Status**: Architecture Complete  
**Owner**: dwise (dwise03@gmail.com)  
**Ready**: Begin Phase 1 deployment
