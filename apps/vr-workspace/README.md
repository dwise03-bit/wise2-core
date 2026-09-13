# WISE² VR Workspace
**Meta Quest 3S Native Application**

Real-time immersive collaboration + AI guidance in 3D space.

## Architecture

### Core Components

**VREnvironment** — Immersive workspace
- 3D job site / office environment
- Equipment models and annotations
- 3D data visualization (charts, dashboards)
- Real-time object placement

**HandTracking** — User input
- Left/right hand tracking (6DOF)
- Gesture recognition (pinch, grab, point, palm, thumbs-up)
- Visual hand feedback
- Interaction state machine

**SpatialAudio** — 3D sound
- Positional audio responses
- Realistic attenuation by distance
- Voice narration for guidance
- Background ambience

**VRRenderer** — Real-time graphics
- 72 FPS target (Quest native refresh)
- OpenGL ES 3.1 rendering pipeline
- Optimized mesh batching
- Spatial shadows and lighting

### Application Flow

```
User puts on Quest
    ↓
VR Environment loads (office/job site/warehouse)
    ↓
User performs hand gestures
    ↓
Hand tracking → Router AI request
    ↓
AI generates 3D response
    ↓
Spatial objects rendered at gaze direction
    ↓
Spatial audio response positioned in 3D space
    ↓
User gestures acknowledgment
```

## Implementation Phases

### Phase 1: Workspace Foundation (WEEK 1)
- [x] Unity Quest setup + OpenXR integration
- [ ] VREnvironment: basic 3D scene
- [ ] HandTracking: basic gesture detection
- [ ] SDK: Quest client initialization
- [ ] Test: Hand tracking on real Quest 3S

### Phase 2: AI Integration (WEEK 2)
- [ ] Route hand gestures → Router API
- [ ] Parse AI responses → 3D spatial objects
- [ ] Real-time object placement in VR space
- [ ] User feedback mechanisms (hands, gaze)

### Phase 3: Spatial Audio (WEEK 3)
- [ ] Spatial audio positioning
- [ ] Text-to-speech integration
- [ ] Voice command input
- [ ] Surround ambience

### Phase 4: Production Optimization (WEEK 4)
- [ ] Performance tuning (72 FPS target)
- [ ] Battery optimization
- [ ] Gesture refinement
- [ ] Real device testing

### Phase 5: Launch Ready (WEEK 5)
- [ ] Documentation
- [ ] Example scenarios
- [ ] Deployment to Meta Store
- [ ] User onboarding

## API Integration

**Router Endpoint** — `/api/generate`

```json
{
  "project_id": "vr-workspace",
  "agent_id": "vr-assistant",
  "user_id": "user-123",
  "task_type": "vr-interaction",
  "devices": [{"type": "quest-meta", "id": "device-001"}],
  "messages": [{
    "role": "user",
    "content": "User gesture: pinch. Looking at: workspace whiteboard. Distance: 1.5m"
  }],
  "route_mode": "AUTO",
  "priority": "normal"
}
```

**Response Format** — `/api/response`

```json
{
  "device_id": "device-001",
  "spatial_objects": [{
    "type": "text",
    "position": [0, 1.5, -2],
    "data": "This is a 3D message"
  }],
  "spatial_audio": {
    "url": "https://api.wise2.net/audio/response.wav",
    "position": [0, 1.5, -2],
    "volume": 1.0
  }
}
```

## File Structure

```
apps/vr-workspace/
├── Assets/
│   ├── Scenes/
│   │   ├── MainWorkspace.unity
│   │   └── LoadingScene.unity
│   ├── Scripts/
│   │   ├── VREnvironment.cs
│   │   ├── HandTracking.cs
│   │   ├── SpatialAudio.cs
│   │   ├── VRRenderer.cs
│   │   ├── RouterClient.cs
│   │   └── GestureRecognizer.cs
│   └── Models/
│       ├── Office/
│       ├── Warehouse/
│       └── JobSite/
├── Packages/
│   ├── com.meta.xr.sdk.unityxr/
│   └── com.wise2.vr-workspace-sdk/
├── ProjectSettings/
├── README.md
└── BuildQuest.cs
```

## Build Instructions

### Prerequisites
- Unity 2022.3+ with Android Build Support
- Meta XR SDK plugin installed
- Quest 3S connected via USB-C with developer mode enabled

### Build Steps

```bash
# 1. Open project in Unity
unity -projectPath ./apps/vr-workspace

# 2. Switch to Android platform
# (File → Build Settings → Android)

# 3. Build APK
# (File → Build Settings → Build)

# 4. Install to Quest
adb install vr-workspace.apk

# 5. Launch on device
adb shell am start -n com.wise2.vrworkspace/com.wise2.vrworkspace.MainActivity
```

## Testing Checklist

- [ ] Hand tracking works on real Quest 3S
- [ ] Gestures recognized accurately
- [ ] API requests reach router successfully
- [ ] Spatial objects render at correct positions
- [ ] Spatial audio positions correctly
- [ ] 72 FPS maintained throughout session
- [ ] Battery drain < 5% per hour
- [ ] No crashes or freezes

## Future Enhancements

- Multi-user presence (avatars in shared workspace)
- Gesture-to-command mapping
- Voice command input
- Environment recording + playback
- Performance analytics
- Custom workspace creation
- Asset library management
- Collaboration features

## Support

For issues or questions, contact: dwise03@gmail.com

---

**Status**: Foundation phase ready  
**Last Updated**: 2026-09-13
