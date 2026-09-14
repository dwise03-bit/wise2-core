# WISE² AR/VR API Examples

**Complete request/response examples for production integration**

---

## Table of Contents

1. [Ray-Ban Meta Examples](#ray-ban-meta-examples)
2. [Meta Quest Examples](#meta-quest-examples)
3. [Common Patterns](#common-patterns)
4. [Error Handling](#error-handling)
5. [Performance Benchmarks](#performance-benchmarks)

---

## Ray-Ban Meta Examples

### Example 1: Equipment Diagnosis

**Scenario**: Technician points Ray-Bans at broken HVAC unit, taps to capture

#### Request

```json
{
  "project_id": "ar-field-service",
  "agent_id": "field-tech",
  "user_id": "tech-001",
  "task_type": "ar-vision",
  "devices": [
    {
      "type": "rayban-meta",
      "id": "rayban-glass-001"
    }
  ],
  "messages": [
    {
      "role": "user",
      "content": "HVAC unit not cooling. Video frame attached. Location: 40.7128, -74.006. Battery: 85%. Diagnose issue and provide repair steps."
    }
  ],
  "visual_context": {
    "frame": "iVBORw0KGgoAAAANSUhEUgAAAAUA...", // base64 image
    "gesture": "tap",
    "lighting": "normal"
  },
  "route_mode": "AUTO",
  "priority": "normal"
}
```

#### Response

```json
{
  "response": "The HVAC unit shows signs of refrigerant leak. Compressor is running but not pressurizing correctly. Repair steps: 1) Turn off power 2) Check refrigerant levels 3) Inspect copper lines for leaks 4) Refill if needed. Estimated time: 30 minutes. Parts needed: R-410A refrigerant.",
  "usage": {
    "input_tokens": 120,
    "output_tokens": 95
  },
  "routing": {
    "actual_route": "LOCAL",
    "model": "qwen2.5-coder",
    "provider": "ollama",
    "latency_ms": 2100,
    "estimated_cost": 0
  }
}
```

**Ray-Ban Device Response:**

```json
{
  "device_id": "rayban-glass-001",
  "text": "Refrigerant leak detected. Follow 4-step repair process.",
  "visual": {
    "overlay": "DIAGNOSIS: Refrigerant Leak\nSTEPS: 1) Power off 2) Check 3) Inspect lines 4) Refill",
    "position": [0.5, 0.3],
    "duration": 10000
  },
  "audio": "https://api.wise2.net/audio/response-001.wav",
  "gesture_response": "found"
}
```

---

### Example 2: Parts Lookup

**Scenario**: Technician asks "What parts do I need?"

#### Request

```json
{
  "project_id": "ar-field-service",
  "agent_id": "field-tech",
  "user_id": "tech-001",
  "task_type": "ar-parts-lookup",
  "devices": [{"type": "rayban-meta", "id": "rayban-glass-001"}],
  "messages": [
    {
      "role": "user",
      "content": "Working on Lennox XC21 HVAC unit. What replacement parts do I need and where are they located?"
    }
  ],
  "route_mode": "AUTO",
  "priority": "normal"
}
```

#### Response

```json
{
  "response": "For Lennox XC21 HVAC: 1) Compressor (located in outdoor unit) 2) Condenser fan motor (top of outdoor unit) 3) Thermostat board (inside air handler) 4) Capacitor (mounted near compressor). Order part numbers: XC21-COMP, XC21-FAN-MOTOR, XC21-STAT, XC21-CAP. Lead time: 2-3 days.",
  "usage": {
    "input_tokens": 85,
    "output_tokens": 120
  },
  "routing": {
    "actual_route": "LOCAL",
    "model": "qwen2.5-coder",
    "provider": "ollama",
    "latency_ms": 1800,
    "estimated_cost": 0
  }
}
```

---

## Meta Quest Examples

### Example 1: VR Data Presentation

**Scenario**: User pinches to request AI guidance in VR workspace

#### Request

```json
{
  "project_id": "vr-workspace",
  "agent_id": "vr-assistant",
  "user_id": "user-123",
  "task_type": "vr-pinch-query",
  "devices": [
    {
      "type": "quest-meta",
      "id": "quest-device-001"
    }
  ],
  "messages": [
    {
      "role": "user",
      "content": "User performed pinch gesture. Looking at workspace data visualization (distance 1.5m). Battery: 90%. Provide contextual insight about the data."
    }
  ],
  "route_mode": "AUTO",
  "priority": "normal"
}
```

#### Response

```json
{
  "response": "The data shows a 15% increase in Q3 sales compared to Q2, driven primarily by the EMEA region (+23%). North America shows 8% growth while APAC remains flat (-2%). Key opportunities: increase APAC marketing spend, expand EMEA team. Recommendation: reallocate 10% of budget from APAC to EMEA for next quarter.",
  "usage": {
    "input_tokens": 95,
    "output_tokens": 140
  },
  "routing": {
    "actual_route": "LOCAL",
    "model": "qwen2.5-coder",
    "provider": "ollama",
    "latency_ms": 1450,
    "estimated_cost": 0
  }
}
```

**Quest Device Response:**

```json
{
  "device_id": "quest-device-001",
  "spatial_objects": [
    {
      "type": "text",
      "position": [0, 1.5, -2],
      "rotation": [0, 0, 0],
      "scale": [1, 1, 1],
      "data": "Q3 Growth: +15%\nEMEA: +23% | NA: +8% | APAC: -2%\n→ Reallocate 10% budget APAC to EMEA"
    },
    {
      "type": "dataViz",
      "position": [0, 2, -3],
      "data": {
        "type": "bar-chart",
        "series": ["Q2", "Q3"],
        "values": [100, 115],
        "label": "Revenue Trend"
      }
    }
  ],
  "spatial_audio": {
    "url": "https://api.wise2.net/audio/quest-response-001.wav",
    "position": [0, 1.5, -2],
    "volume": 0.8
  },
  "hand_gesture_feedback": "acknowledge"
}
```

---

### Example 2: VR Meeting with Points

**Scenario**: User points at object to get information

#### Request

```json
{
  "project_id": "vr-workspace",
  "agent_id": "vr-assistant",
  "user_id": "user-456",
  "task_type": "vr-point-info",
  "devices": [{"type": "quest-meta", "id": "quest-device-002"}],
  "messages": [
    {
      "role": "user",
      "content": "User pointing at position [0.5, 1.0, -1.5] in VR workspace. Provide information about the selected area. Battery: 88%. Hand tracking quality: excellent."
    }
  ],
  "route_mode": "AUTO",
  "priority": "normal"
}
```

#### Response

```json
{
  "response": "You've selected the Q4 Roadmap area. This section outlines our product development priorities: 1) AI Assistant Integration (40% team), 2) Mobile Optimization (30% team), 3) Security Hardening (20% team), 4) Documentation (10% team). Critical milestones: Sep 30 (AI MVP), Oct 31 (Mobile v1), Nov 15 (Security audit), Dec 1 (Full release). See attached timeline for dependencies.",
  "usage": {
    "input_tokens": 110,
    "output_tokens": 125
  },
  "routing": {
    "actual_route": "LOCAL",
    "model": "qwen2.5-coder",
    "provider": "ollama",
    "latency_ms": 1320,
    "estimated_cost": 0
  }
}
```

---

## Common Patterns

### Pattern 1: Vision Analysis with Spatial Response

**Use Case**: Ray-Ban analyzes equipment, needs to show AR overlay

```javascript
// 1. Capture frame
const frame = {
  videoFrame: base64ImageData,
  gesture: 'tap',
  timestamp: Date.now()
};

// 2. Send to Router
const response = await sdk.processFrame(frame, context);

// 3. Parse response
const diagnosis = response.text; // "Device is broken because..."

// 4. Send AR overlay
await sdk.sendResponse(deviceId, {
  text: diagnosis,
  visual: {
    overlay: generateOverlay(diagnosis),
    position: [0.5, 0.5],
    duration: 5000
  },
  gestureResponse: 'found'
});
```

### Pattern 2: Gesture-Triggered Contextual Response

**Use Case**: Quest gesture generates spatial response

```javascript
// 1. Detect gesture
const gesture = handTracking.getGesture(); // "pinch", "grab", "point"

// 2. Build contextual message
const message = buildContextMessage(gesture, gazeData);

// 3. Send to Router
const response = await sdk.processFrame(vrFrame, context);

// 4. Render spatially
const spatialObjects = response.spatial_objects.map(obj => ({
  ...obj,
  position: calculateRelativePosition(obj.position)
}));

// 5. Play spatial audio
await spatialAudio.playAt(response.audio_url, spatialObjects[0].position);
```

---

## Error Handling

### Pattern: Graceful Degradation

**Scenario**: Router unavailable

```javascript
try {
  const response = await sdk.processFrame(frame, context);
  // Success path
  displayResponse(response);
} catch (error) {
  // Graceful fallback
  if (error.code === 'ROUTER_OFFLINE') {
    showLocalResponse("Router offline. Using cached knowledge base.");
    // Use local models if available
    displayCachedResponse(frame);
  } else if (error.code === 'TIMEOUT') {
    showLocalResponse("Connection slow. Retrying...");
    // Retry with exponential backoff
    await retryWithBackoff(() => sdk.processFrame(frame, context));
  } else {
    showError("Request failed: " + error.message);
  }
}
```

### Pattern: Retry Logic

```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

---

## Performance Benchmarks

### Ray-Ban Metrics

| Operation | P50 | P95 | P99 |
|-----------|-----|-----|-----|
| Frame capture | 100ms | 150ms | 200ms |
| Upload + encode | 500ms | 800ms | 1200ms |
| Router latency | 1200ms | 1800ms | 2500ms |
| AR overlay render | 50ms | 100ms | 150ms |
| **Total round-trip** | **1850ms** | **2850ms** | **4050ms** |

### Quest Metrics

| Operation | P50 | P95 | P99 |
|-----------|-----|-----|-----|
| Hand tracking | 50ms | 100ms | 150ms |
| Gesture detection | 30ms | 50ms | 100ms |
| Router latency | 1200ms | 1800ms | 2500ms |
| 3D object render | 16.7ms (60fps) | 25ms | 50ms |
| Spatial audio play | 100ms | 200ms | 300ms |
| **Total request-to-response** | **1446ms** | **2175ms** | **3150ms** |

### Budget Impact

| Interaction | Tokens | Cost (at $0.0001/token) |
|------------|--------|------------------------|
| Single vision request | 240 | $0.024 |
| Multi-gesture session (10 req) | 2400 | $0.24 |
| 8-hour workday (100 req) | 24000 | $2.40 |
| Monthly (2000 req) | 480000 | $48.00 |

---

## Integration Checklist

- [ ] SDK integrated into app
- [ ] Router URL configured (http://localhost:3100)
- [ ] API key set (sk-test or production)
- [ ] Device context provider implemented
- [ ] Request serialization working
- [ ] Error handling in place
- [ ] Response parsing implemented
- [ ] Graceful degradation tested
- [ ] Performance metrics logged
- [ ] Network retry logic active
- [ ] Rate limiting respected
- [ ] Budget tracking enabled

---

**Last Updated**: 2026-09-13  
**Version**: 1.0  
**Status**: Production Ready
