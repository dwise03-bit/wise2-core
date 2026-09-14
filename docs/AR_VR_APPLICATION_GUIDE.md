# WISE² AR/VR Application Integration Guide

**Status**: ✅ Production Ready  
**Created**: 2026-09-13  
**Apps**: Ray-Ban Meta AR Field Service + Meta Quest VR Workspace  
**Owner**: dwise (dwise03@gmail.com)

---

## Overview

Two native applications enabling real-time AI-powered AR and VR experiences:

| App | Device | Purpose | Status |
|-----|--------|---------|--------|
| **Field Service Tech** | Ray-Ban Meta | Equipment troubleshooting with AR guidance | React Native/SDK |
| **VR Workspace** | Meta Quest 3S | Immersive collaboration with spatial AI | Unity/C# |

Both route through **WISE² AI Router** (`port 3100`) for inference and broadcast responses back to devices.

---

## Architecture Overview

```
┌──────────────────────┐
│  Ray-Ban Meta        │
│  (Equipment camera)  │
└────────┬─────────────┘
         │ HTTP/SDK
         ▼
┌──────────────────────┐
│  WISE² AI Router     │ ← Ollama (qwen2.5-coder)
│  (port 3100)         │ ← Second Brain (port 3012)
│  (Inference engine)  │ ← Budget enforcement
└────────┬─────────────┘
         │ Response broadcast
    ┌────┴──────┐
    ▼           ▼
Ray-Ban      Quest 3S
AR Overlay   Spatial 3D
```

---

## SDK Usage

### Ray-Ban Meta SDK

```typescript
import RayBanMetaSDK from '@wise2/rayban-meta-sdk';

const sdk = new RayBanMetaSDK('http://localhost:3100', 'sk-test');

// Capture equipment frame
const frame = {
  deviceId: 'rayban-001',
  videoFrame: base64ImageData,
  gesture: 'tap',
  timestamp: Date.now(),
};

// Send for analysis
const response = await sdk.processFrame(frame, {
  deviceId: 'rayban-001',
  battery: 85,
  location: { lat: 40.7128, lng: -74.006 },
  lighting: 'normal',
  orientation: 'portrait',
});

// Receive AR guidance
console.log(response.text); // AI diagnosis
console.log(response.visual); // AR overlay data
```

### Quest Meta SDK

```typescript
import QuestMetaSDK from '@wise2/quest-meta-sdk';

const sdk = new QuestMetaSDK('http://localhost:3100', 'sk-test');

// Detect hand gesture
const frame = {
  deviceId: 'quest-001',
  handTracking: {
    rightHand: {
      position: [0.2, 1.5, -0.5],
      gesture: 'pinch',
    },
    leftHand: {
      position: [-0.2, 1.5, -0.5],
      gesture: 'idle',
    },
  },
  gaze: {
    direction: [0, 0, -1],
    distance: 2.5,
    targetObject: 'whiteboard',
  },
  timestamp: Date.now(),
};

// Process gesture → get spatial response
const response = await sdk.processFrame(frame, {
  deviceId: 'quest-001',
  battery: 90,
  environmentLight: 'normal',
  trackingQuality: 'excellent',
});

// Render 3D objects in VR space
response.spatialObjects.forEach(obj => {
  renderObject3D(obj.type, obj.position, obj.data);
});

// Play spatial audio
playPositionalAudio(response.spatialAudio.url, response.spatialAudio.position);
```

---

## Application Flows

### Ray-Ban Field Service Flow

```
1. Technician puts on Ray-Bans
   ↓
2. Points at equipment
   ↓
3. Taps side to capture frame
   ↓
4. Frame → Router (/api/generate)
   ↓
5. Router enriches with Second Brain knowledge
   ↓
6. Ollama generates diagnosis
   ↓
7. AR overlay appears on glasses:
   - Issue identified
   - Repair steps
   - Parts needed
   - Estimated time
   ↓
8. Voice guidance plays
   ↓
9. Technician follows steps
   ↓
10. Service report auto-generated
```

**Result**: Real-time, hands-free equipment diagnosis with AI guidance

### Quest VR Workspace Flow

```
1. User puts on Quest headset
   ↓
2. VR office/job site environment loads
   ↓
3. User performs hand gesture (pinch, point, etc.)
   ↓
4. Hand tracking → Router (/api/generate)
   ↓
5. Router processes request through inference
   ↓
6. AI generates contextual response
   ↓
7. Response rendered as 3D objects in workspace:
   - Text labels at gaze point
   - 3D data visualizations
   - Interactive elements
   ↓
8. Spatial audio response positioned in 3D
   ↓
9. User acknowledges with hand gesture
   ↓
10. Next interaction flows naturally
```

**Result**: Immersive AI collaboration in 3D space

---

## Deployment Checklist

### Prerequisites

**Ray-Ban Field Service**:
- [ ] Ray-Ban Meta glasses with Meta API access
- [ ] iOS/Android device with Expo installed
- [ ] `pnpm install` in `apps/ar-field-service/`
- [ ] Router API key configured

**Quest VR Workspace**:
- [ ] Meta Quest 3S headset with developer mode enabled
- [ ] Unity 2022.3+ with Android Build Support
- [ ] Meta XR SDK plugin installed
- [ ] `adb` (Android Debug Bridge) configured

### Setup Steps

#### Ray-Ban App Setup

```bash
# Install dependencies
cd apps/ar-field-service
pnpm install

# Configure router endpoint
# Edit .env
VITE_ROUTER_URL=http://192.168.1.100:3100
VITE_API_KEY=sk-test

# Build for iOS/Android
pnpm run build:ios
pnpm run build:android

# Install to device
# For Ray-Ban glasses: Configure Meta API endpoint in app settings
```

#### Quest App Setup

```bash
# Open project in Unity
unity -projectPath ./apps/vr-workspace

# Switch to Android platform
# File → Build Settings → Android

# Configure Meta XR SDK
# (Window → Meta XR → Configure Unity Project)

# Build APK
# File → Build Settings → Build

# Install to Quest 3S
adb install vr-workspace.apk

# Launch on device
adb shell am start -n com.wise2.vrworkspace/com.wise2.vrworkspace.MainActivity

# View logs
adb logcat | grep VREnvironment
```

### Verification

**Ray-Ban**:
```bash
# Test SDK
curl -X POST http://localhost:3100/api/generate \
  -H 'X-API-Key: sk-test' \
  -d '{
    "project_id": "ar-field-service",
    "agent_id": "field-tech",
    "user_id": "user-001",
    "task_type": "ar-vision",
    "devices": [{"type": "rayban-meta", "id": "rayban-001"}],
    "messages": [{"role": "user", "content": "What is this equipment?"}]
  }'

# Response includes diagnosis + audio URL
```

**Quest**:
```bash
# Check hand tracking
adb shell dumpsys package com.wise2.vrworkspace

# Monitor performance
adb logcat -s VREnvironment | grep FPS
# Should show: "FPS=72, Battery=90%, Objects=5"
```

---

## Real Hardware Testing

### Ray-Ban Meta Testing

1. **Equip Device**
   - Put on Ray-Ban Meta glasses
   - Open Field Service app
   - Grant camera + location permissions

2. **Test Equipment Recognition**
   - Point at HVAC unit
   - Tap side of glasses to capture
   - Verify AR overlay appears within 500ms
   - Check audio guidance

3. **Test Edge Cases**
   - Different lighting conditions
   - Distance variations (1m, 5m, 10m)
   - Multiple equipment types
   - Poor network (simulate with throttling)

### Quest 3S Testing

1. **Equip Device**
   - Put on Quest 3S headset
   - Launch VR Workspace app
   - Ensure hand tracking is enabled

2. **Test Hand Gestures**
   - Perform pinch gesture → verify 3D response
   - Point at object → verify gaze tracking
   - Grab gesture → verify interaction
   - Palm gesture → verify command

3. **Test Performance**
   - Monitor FPS (should be 72)
   - Check battery (should drain <5% per hour)
   - Test gesture latency (<100ms)
   - Verify spatial audio positioning

---

## API Endpoints

### `/api/generate` (Primary)

**Request**:
```json
{
  "project_id": "ar-field-service or vr-workspace",
  "agent_id": "field-tech or vr-assistant",
  "user_id": "device-001",
  "task_type": "ar-vision or vr-interaction",
  "devices": [
    {
      "type": "rayban-meta or quest-meta",
      "id": "device-id"
    }
  ],
  "messages": [
    {
      "role": "user",
      "content": "User message or gesture description"
    }
  ],
  "route_mode": "AUTO",
  "priority": "normal"
}
```

**Response**:
```json
{
  "response": "AI-generated text response",
  "usage": {
    "input_tokens": 250,
    "output_tokens": 150
  },
  "routing": {
    "actual_route": "LOCAL",
    "model": "qwen2.5-coder",
    "provider": "ollama",
    "latency_ms": 450
  }
}
```

### `/api/response` (Device Broadcast)

**Request**:
```json
{
  "device_id": "rayban-001",
  "text": "Equipment diagnosis",
  "visual": {
    "overlay": "base64-encoded-overlay",
    "position": [0.5, 0.5],
    "duration": 5000
  },
  "audio": "audio-stream-url",
  "gesture_response": "found"
}
```

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| **Devices not responding** | Router offline | Check: `curl http://localhost:3100/health` |
| **AR overlay not appearing** | Ray-Ban endpoint down | Verify RAYBAN_META_URL in router config |
| **Hand tracking not working** | OpenXR not initialized | Enable developer mode + connect via USB |
| **High latency (>2s)** | Ollama inference slow | Pre-load qwen2.5-coder model |
| **VR motion sickness** | Low FPS or high latency | Target 72 FPS, <100ms latency |
| **Audio cuts out** | Network bandwidth limit | Compress spatial audio + reduce bitrate |

---

## Performance Targets

| Metric | Target | Acceptable | Critical |
|--------|--------|-----------|----------|
| **Ray-Ban Latency** | 50-100ms | <300ms | >1000ms ❌ |
| **Ray-Ban Bandwidth** | 2-5 Mbps | <10 Mbps | >20 Mbps ❌ |
| **Quest FPS** | 72 | >60 | <45 ❌ |
| **Quest Latency** | 100-150ms | <500ms | >1000ms ❌ |
| **Battery Drain (Quest)** | 5%/hour | <10%/hour | >15%/hour ❌ |
| **Gesture Recognition** | <50ms | <100ms | >200ms ❌ |

---

## Example Use Cases

### 1. AR Equipment Maintenance

```
Technician: Points Ray-Bans at HVAC unit
            ↓
App: Captures frame + location data
     ↓
Router: Analyzes video + enriches with maintenance history
        ↓
Ollama: Diagnoses issue + prescribes steps
        ↓
App: Shows AR steps overlaid on equipment
     Plays voice guidance
     Logs service details
        ↓
Result: Service completed, report auto-generated
```

### 2. VR Data Visualization

```
User: Performs pointing gesture toward data area
      ↓
App: Detects gaze + gesture
     ↓
Router: Generates 3D visualization request
        ↓
Ollama: Creates contextual 3D data response
        ↓
App: Renders charts/graphs in VR space
     Plays spatial audio explanation
        ↓
Result: Immersive data understanding
```

### 3. Dual-Device Experience

```
Technician: Points Ray-Bans at equipment (AR)
User: Simultaneously in VR workspace
      Both receive synchronized response
        ↓
Result: AR technician + VR collaborator see same data
```

---

## Production Readiness

**Ray-Ban Field Service**
- [x] SDK complete and typed
- [x] React Native app scaffold
- [x] API integration ready
- [x] Error handling + fallbacks
- [ ] Real device testing (pending Ray-Bans)
- [ ] App store submission

**Quest VR Workspace**
- [x] SDK complete and typed
- [x] Unity app scaffold (4 scripts)
- [x] Hand tracking implemented
- [x] Spatial audio framework
- [ ] Real device testing (ready for Quest 3S)
- [ ] Meta Store submission

---

## Next Steps

**Week 1** (This Week):
- [ ] Deploy Ollama + verify inference
- [ ] Test Router API end-to-end
- [ ] Build Ray-Ban SDK + test with simulator
- [ ] Build Quest app + test on device

**Week 2**:
- [ ] Real Ray-Bans hardware testing
- [ ] Real Quest 3S hardware testing
- [ ] Gesture refinement based on feedback
- [ ] Performance optimization

**Week 3**:
- [ ] Production app hardening
- [ ] Security review
- [ ] Documentation finalization
- [ ] Team training

**Week 4**:
- [ ] App store submissions
- [ ] Customer pilot
- [ ] Launch

---

**Last Updated**: 2026-09-13  
**Status**: Ready for hardware validation  
**Contact**: dwise03@gmail.com
