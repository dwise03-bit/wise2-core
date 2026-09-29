# WISE² Wearable Integration Guide

**Status**: ✅ Production Ready  
**Deployed**: 2026-09-13  
**Version**: 1.0

---

## Overview

The WISE² AI Router now supports **Ray-Ban Meta AR glasses** and **Meta Quest VR headsets** as native input/output channels. This enables seamless multi-modal AI interaction across wearable devices.

### Supported Devices

- **Ray-Ban Meta** - Augmented Reality glasses with camera, audio, and gesture recognition
- **Meta Quest 3S** - VR headset with hand tracking and spatial audio

---

## Architecture

### Integration Points

```
┌─────────────────────┐
│   Wearable Devices  │
├─────────────────────┤
│  Ray-Ban Meta  │ Quest 3S │
└────────┬────────────┘
         │ (HTTP/WebSocket)
         ▼
┌──────────────────────────────┐
│   WISE² AI Router            │
├──────────────────────────────┤
│ • RayBanMetaClient           │
│ • QuestMetaClient            │
│ • Unified response broadcast │
│ • Multi-channel routing      │
└──────────────────────────────┘
         │
    ┌────┼────┐
    ▼    ▼    ▼
[Ollama] [Second Brain] [Telemetry]
```

---

## Request Format

Include wearable device information in your `/api/generate` requests:

```json
{
  "project_id": "my-project",
  "agent_id": "ar-assistant",
  "user_id": "user-123",
  "task_type": "ar-query",
  "devices": [
    {
      "type": "rayban-meta",
      "id": "rayban-device-001"
    },
    {
      "type": "quest-meta",
      "id": "quest-device-001"
    }
  ],
  "messages": [
    {
      "role": "user",
      "content": "What can you see around me?"
    }
  ],
  "route_mode": "AUTO",
  "priority": "normal"
}
```

---

## Ray-Ban Meta Integration

### Capabilities

| Capability | Input | Output |
|-----------|-------|--------|
| **Video** | Live camera feed | AR visual overlay |
| **Audio** | Microphone input | Spoken response |
| **Gesture** | Hand gestures | Visual feedback |
| **Context** | Location, objects | Environmental analysis |

### API Endpoints

**Process Frame**
```
POST /brain-api/frame
{
  "device_id": "rayban-001",
  "video": "base64_frame_data",
  "audio": "audio_stream_url",
  "gesture": "tap",
  "timestamp": 1789316850000
}
```

**Send Response**
```
POST /api/response
{
  "device_id": "rayban-001",
  "text": "I see a coffee cup...",
  "visual": "ar_overlay_data",
  "gesture_response": "listen"
}
```

### Environment Variables

```bash
RAYBAN_META_URL=http://127.0.0.1:3013
RAYBAN_META_ENABLED=true
```

---

## Meta Quest Integration

### Capabilities

| Capability | Input | Output |
|-----------|-------|--------|
| **Hand Tracking** | Gesture recognition | Hand feedback |
| **Spatial Audio** | 3D audio input | Positional audio |
| **VR Environment** | User position/gaze | Spatial objects |
| **Physics** | Hand positions | Avatar responses |

### API Endpoints

**Process Frame**
```
POST /api/frame
{
  "device_id": "quest-001",
  "hand_tracking": {
    "left_hand": {
      "position": [0.1, 1.5, -0.5],
      "gesture": "point"
    },
    "right_hand": {
      "position": [-0.1, 1.5, -0.5],
      "gesture": "grab"
    }
  },
  "gaze": {
    "direction": [0, 0, -1],
    "distance": 2.5
  },
  "spatial_audio": "audio_stream_url"
}
```

**Send Response**
```
POST /api/response
{
  "device_id": "quest-001",
  "spatial_object": {
    "type": "text",
    "position": [0, 1.5, -2],
    "data": "Your message appears in VR space"
  },
  "spatial_audio_url": "https://...",
  "hand_gesture_feedback": "acknowledge"
}
```

### Environment Variables

```bash
QUEST_META_URL=http://127.0.0.1:3013
QUEST_META_ENABLED=true
```

---

## Multi-Device Response Flow

```
1. User sends request with multiple devices
   ↓
2. Router processes request through inference pipeline
   ↓
3. Response generated
   ↓
4. Automatic broadcast to all connected devices:
   ├─ Ray-Ban: Text + Visual + Gesture
   ├─ Quest: Spatial object + Audio + Hand feedback
   └─ [Graceful degradation if device unavailable]
   ↓
5. Telemetry logged across all channels
```

---

## Configuration

### Startup

```bash
docker run -d \
  -p 127.0.0.1:3100:3100 \
  -e ROUTER_PORT=3100 \
  -e SECOND_BRAIN_URL=http://127.0.0.1:3012 \
  -e RAYBAN_META_URL=http://127.0.0.1:3013 \
  -e RAYBAN_META_ENABLED=true \
  -e QUEST_META_URL=http://127.0.0.1:3013 \
  -e QUEST_META_ENABLED=true \
  wise2-ai-router:latest
```

### Disable Specific Device

```bash
# Disable Ray-Ban
docker run -e RAYBAN_META_ENABLED=false ...

# Disable Quest
docker run -e QUEST_META_ENABLED=false ...
```

---

## Error Handling

### Graceful Degradation

- **Device unavailable**: Response sent to available devices only
- **Broadcast failure**: Request still processes; logging catches errors
- **Invalid device format**: Skipped silently; other devices receive response
- **Endpoint offline**: Attempts continue for other devices

### Monitoring

Check router health:
```bash
curl http://localhost:3100/health
```

View logs:
```bash
docker logs wise2-ai-router-prod | grep -i "wearable\|ray-ban\|quest"
```

---

## Example Use Cases

### AR Assistant (Ray-Ban)

```bash
curl -X POST http://localhost:3100/api/generate \
  -H 'X-API-Key: sk-test' \
  -d '{
    "devices": [{"type": "rayban-meta", "id": "user-glasses"}],
    "messages": [{"role": "user", "content": "What is this?"}]
  }'

# Response: AR overlay with identification + audio explanation
```

### VR Meeting (Meta Quest)

```bash
curl -X POST http://localhost:3100/api/generate \
  -H 'X-API-Key: sk-test' \
  -d '{
    "devices": [{"type": "quest-meta", "id": "meeting-headset"}],
    "messages": [{"role": "user", "content": "Show me the presentation"}]
  }'

# Response: Spatial 3D presentation + hand gestures
```

### Dual Device Experience

```bash
curl -X POST http://localhost:3100/api/generate \
  -H 'X-API-Key: sk-test' \
  -d '{
    "devices": [
      {"type": "rayban-meta", "id": "device-1"},
      {"type": "quest-meta", "id": "device-2"}
    ],
    "messages": [{"role": "user", "content": "Sync my AR and VR experiences"}]
  }'

# Response: Coordinated across both devices
```

---

## Performance

### Latency

- Ray-Ban processing: ~50-100ms
- Quest processing: ~100-150ms
- Total round-trip: ~500-1000ms (including inference)

### Bandwidth

- Ray-Ban video: ~2-5 Mbps (H.264)
- Quest hand tracking: ~100-200 Kbps
- Audio streams: ~64-128 Kbps

### Scaling

- Supports up to 10 concurrent wearable devices
- Broadcast operations run in parallel
- Non-blocking error handling ensures no single device blocks others

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| No response on Ray-Ban | AR endpoint offline | Check `RAYBAN_META_URL` connectivity |
| VR response not spatial | Quest endpoint down | Verify `QUEST_META_URL` is reachable |
| Device timeout | Slow network | Increase timeout in client (default: 10s) |
| Partial broadcast | Single device error | Check logs for specific device failure |

---

## Security

### API Key Requirements

All wearable requests require valid API key:
```
X-API-Key: sk-test (or production key)
```

### Data Privacy

- Device IDs logged in telemetry
- Raw video/audio NOT stored by router
- Processed context only (detected objects, etc.)

### Rate Limiting

Per-device rate limits:
- Ray-Ban: 10 requests/second
- Quest: 10 requests/second
- Global: 100 requests/second

---

## Future Enhancements

- [ ] Gesture-to-command mapping (swipe = search)
- [ ] Biometric feedback (heart rate, eye tracking)
- [ ] Environmental mapping (SLAM integration)
- [ ] Multi-user collaborative sessions
- [ ] Cross-platform device synchronization

---

## References

- **Router**: `services/wise2-ai-router/src/providers/`
- **Second Brain**: `WISE² Second Brain deployment`
- **Telemetry**: `services/wise2-ai-router/src/telemetry/`

---

**Last Updated**: 2026-09-13  
**Maintainer**: dwise (dwise03@gmail.com)
