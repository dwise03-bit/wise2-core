# FieldTech VR Architecture

## Overview

FieldTech has been extended into a full 3D/VR experience for Meta Quest devices. The architecture transforms the 2D Android app into an immersive field service environment with:

- **3D Job Site Visualization** — Equipment models positioned in 3D space
- **Hand Tracking Interactions** — Meta Quest hand tracking v2 with gesture recognition
- **Spatial UI** — 3D billboards and floating panels in VR space
- **Real-time Progress** — Visual progress tracking in immersive environment

---

## Core Components

### 1. VREnvironment.kt
**Spatial world state management**

```kotlin
VREnvironment(context: Context)
├── JobSite3D(id, name, position, equipment, annotations)
├── Equipment3D(id, name, modelPath, position, rotation, status)
├── SpatialAnnotation(id, text, position, type, icon)
├── VRPanel3D(id, title, position, rotation, width, height, content)
└── HandGesture(PINCH, PALM_UP, THUMBS_UP, POINT, GRAB)
```

**Responsibilities:**
- Store 3D world state (job site, equipment, annotations)
- Manage spatial UI panels (floating windows in 3D)
- Track hand position and gesture state
- Detect gesture interactions (pinch = select, thumbs up = complete)

**Usage:**
```kotlin
val vrEnv = VREnvironment(context)
val jobSite = VREnvironment.JobSite3D(
    id = "job-123",
    name = "Customer HVAC",
    position = Vector3(0f, 0f, 0f),
    equipment = listOf(...),
    annotations = listOf(...)
)
vrEnv.initializeJobSite(jobSite)
vrEnv.updateHandTracking(handState)
```

---

### 2. HandTrackingGestureDetector.kt
**Hand gesture recognition engine**

```kotlin
HandTrackingGestureDetector()
├── detectGesture(handFrame: HandFrame) → HandGesture
├── isPinch() → Boolean (thumb + index close)
├── isGrab() → Boolean (all fingers curled)
├── isPalmUp() → Boolean (open hand, palm facing up)
├── isPoint() → Boolean (index extended, others curled)
└── isThumbsUp() → Boolean (thumb up, others curled)
```

**Hand Joint Recognition:**
- Tracks 25 hand joints per OpenXR standard
- Calculates finger curl/extension from joint distances
- Debounces gestures (requires 500ms hold)
- Provides confidence scoring

**Gesture Thresholds:**
- `PINCH_DISTANCE_THRESHOLD` = 4cm (thumb-index gap)
- `GRAB_FINGER_CURL_THRESHOLD` = 0.8 (curl percentage)
- `GESTURE_HOLD_TIME_MS` = 500 (debounce time)

**Usage:**
```kotlin
val detector = HandTrackingGestureDetector()
val handFrame = HandFrame(
    handedness = "right",
    joints = listOf(...),
    isTracked = true,
    timestamp = currentTime
)
val gesture = detector.updateHandTracking(handFrame)
when (gesture) {
    HandGesture.PINCH → selectEquipment()
    HandGesture.POINT → annotateLocation()
    HandGesture.THUMBS_UP → completeStep()
    else → {}
}
```

---

### 3. VRRenderer.kt
**OpenGL ES 3D rendering engine**

```kotlin
VRRenderer(context: Context) : GLSurfaceView.Renderer
├── onSurfaceCreated() → Initialize shaders
├── onDrawFrame() → Render 3D scene
├── PanelShader → Render UI billboards
├── EquipmentShader → Render 3D equipment models
├── AnnotationShader → Render issue/note markers
└── UIShader → Render 2D overlays
```

**Rendering Pipeline:**
1. Clear depth buffer
2. Setup camera view/projection matrices
3. Render spatial panels (facing camera)
4. Render equipment models (lighting)
5. Render annotations (issue markers)
6. Render UI overlays (progress, hand indicators)

**Shader System:**
- **Panel Shader** — Billboard rendering (always face camera)
- **Equipment Shader** — 3D model rendering with Phong lighting
- **Annotation Shader** — Small icons with distance fade
- **UI Shader** — 2D orthographic overlay

---

### 4. VRActivity.kt
**Main VR experience activity**

```kotlin
VRActivity : ComponentActivity()
├── vrEnvironment: VREnvironment
├── gestureDetector: HandTrackingGestureDetector
├── startVRServices()
│   ├── startHandTrackingListener()
│   └── startVRRenderLoop()
└── initializeJobSite(jobName: String)
```

**Responsibilities:**
- Detect Meta Quest device and enable VR mode
- Initialize hand tracking listener (60fps)
- Initialize VR rendering loop (60fps)
- Launch Compose UI (immersive or fallback 2D)

**Activity Lifecycle:**
1. `onCreate()` — Initialize VR components
2. `isMetaQuestDevice()` — Check if on Quest hardware
3. `startVRServices()` — Launch hand tracking + rendering
4. `setContent()` — Render VRFieldServiceUI Composable

---

## Interaction Model

### Hand Gestures → Actions

| Gesture | Action | Result |
|---------|--------|--------|
| **PINCH** | Select/grab equipment | Show equipment details panel |
| **PALM_UP** | Open context menu | Display floating menu near hand |
| **POINT** | Create annotation | Mark location with issue note |
| **THUMBS_UP** | Complete step | Advance job progress +25% |
| **GRAB** | Move object | Drag UI panel or equipment |

### Spatial UI Panels

```
Main Dashboard (2.0m × 1.5m)
├── Job: Customer HVAC
├── Progress: 75%
├── Current Step: Replace filter

Equipment Panels (1.0m × 0.75m each)
├── HVAC Unit — Status: needs_service
├── Thermostat — Status: operational
└── Ductwork — Status: clean

Spatial Annotations
├── 🔴 Refrigerant leak detected
├── 📍 Measurement: 2.3m
└── 📝 Note: Schedule follow-up
```

---

## Data Flow

```
Hand Tracking Input (60fps)
    ↓
HandTrackingGestureDetector.detectGesture()
    ↓
VREnvironment.updateHandTracking()
    ├── detectGestureInteractions()
    ├── Show/hide context menus
    ├── Update selected equipment
    └── Create annotations
    ↓
VRRenderer.onDrawFrame()
    ├── Render spatial panels
    ├── Render equipment models
    ├── Render annotations
    └── Render UI overlays
    ↓
Screen (60fps VR display)
```

---

## Integration with FieldTech App

### Current State (2D Compose)
- Job list screen
- Equipment details
- Photo/signature capture
- Task checklist

### VR Extension
- Immersive job site visualization
- Hand tracking instead of touch
- Spatial annotations (3D markers)
- Real-time equipment state

### Connection Points
```kotlin
// In MainActivity or dispatcher
if (isVRMode) {
    startActivity(Intent(this, VRActivity::class.java).apply {
        putExtra("JOB_ID", jobId)
        putExtra("JOB_NAME", jobName)
    })
} else {
    // Traditional 2D UI
}
```

---

## Meta Quest Manifest Configuration

**Required Permissions:**
```xml
<uses-permission android:name="com.oculus.permission.USE_HAND_TRACKING" />
<uses-permission android:name="com.oculus.permission.USE_TRACKING" />
<uses-permission android:name="com.oculus.permission.USE_SCENE" />
```

**VR Features:**
```xml
<uses-feature android:name="android.hardware.vr.headtracking" android:required="false" />
<uses-feature android:name="com.oculus.feature.HAND_TRACKING" android:required="false" />
<uses-feature android:name="com.oculus.feature.PASSTHROUGH" android:required="false" />
```

**Quest Metadata:**
```xml
<meta-data android:name="com.oculus.vr.focusaware" android:value="true" />
<meta-data android:name="com.oculus.supportedDevices" android:value="quest|quest2|quest3|quest3s" />
<meta-data android:name="com.oculus.handtracking.version" android:value="V2" />
```

---

## Real-Time Features

### 1. Hand Tracking (60fps)
- Left/right hand position
- 25 joint positions per hand
- Confidence scoring (0.0-1.0)
- Gesture recognition with debounce

### 2. Job Progress
- Real-time sync with backend
- Visual progress bar in HUD
- Step completion tracking
- Time estimation

### 3. Media Capture
- Photo at 3D location
- 3D spatial reference
- Timestamp and position
- Sync to field record

### 4. Spatial Annotations
- Issue markers (red pins)
- Measurement notes
- Equipment status
- Checklist items

---

## Performance Considerations

### Optimization
- **Hand Tracking**: 60fps updates, gesture debouncing (500ms)
- **Rendering**: OpenGL ES 3.0, shader batching
- **Memory**: ~150MB for VR services
- **Thermal**: Monitor GPU/CPU load

### Fallback Modes
- **No Quest Device** → 2D Compose UI
- **Hand Tracking Disabled** → Touch input fallback
- **Low Performance** → Reduced shader quality

---

## Future Extensions

### Phase 2: Spatial Audio
- 3D audio cues for equipment status
- Voice commands for gestures
- Audio feedback for interactions

### Phase 3: Equipment Models
- Import glTF/obj equipment models
- Real-time lighting from scene
- Collision detection for grab interactions

### Phase 4: Cloud Sync
- Real-time job updates
- Team collaboration in shared VR
- AR passthrough overlays

### Phase 5: AI-Assisted
- Equipment diagnosis from visual inspection
- Auto-generated repair recommendations
- Historical equipment performance

---

## Testing on Meta Quest

### Build & Deploy
```bash
# Build APK
cd apps/fieldtech-android
./gradlew build -x lint

# Deploy to device
adb -s <DEVICE_ID> install app-debug.apk

# Launch activity
adb -s <DEVICE_ID> shell am start -n com.wise2.fieldtech/.vr.VRActivity
```

### Hand Tracking Testing
- Enable hand tracking in Quest settings
- Perform gesture: pinch (select), point (annotate), thumbs up (complete)
- Monitor gesture recognition confidence in HUD

### Performance Testing
- Monitor frame rate (target: 72fps+ for Quest)
- Profile hand tracking latency (<20ms)
- Check thermal throttling

---

## Architecture Diagram

```
FieldTech App (Main)
    ↓
[MainActivity]
    └── Intent(VRActivity)
    
VRActivity
    ├── VREnvironment
    │   ├── JobSite3D
    │   ├── Equipment3D[]
    │   ├── SpatialAnnotation[]
    │   └── VRPanel3D[]
    │
    ├── HandTrackingGestureDetector
    │   ├── detectGesture(HandFrame)
    │   ├── isPinch() / isGrab() / isPoint()
    │   └── gestureHistory
    │
    └── VRRenderer (OpenGL ES)
        ├── PanelShader
        ├── EquipmentShader
        ├── AnnotationShader
        └── UIShader

[Meta Quest Hardware]
    ├── Hand Tracking (OpenXR)
    ├── 6DOF Headset
    ├── Display (1800×1920)
    └── Touch Controllers (optional)
```

---

## Code Statistics

| Component | Lines | Purpose |
|-----------|-------|---------|
| VREnvironment.kt | 221 | World state, job visualization |
| HandTrackingGestureDetector.kt | 268 | Gesture recognition engine |
| VRRenderer.kt | 182 | OpenGL ES rendering |
| VRActivity.kt | 289 | Main VR activity & UI |
| **Total** | **960** | Full VR system |

---

## Deployment Status

✅ **COMPLETE**
- VR environment framework (3D job site, equipment, annotations)
- Hand tracking gesture detection (pinch, palm up, point, thumbs up, grab)
- Spatial UI rendering system (panels, overlays, HUD)
- Meta Quest manifest configuration (permissions, features, metadata)
- Compose UI (immersive VR + 2D fallback)

🔄 **Next**: OpenXR integration for actual hand tracking on physical Quest device

---

**Version**: 1.0  
**Target**: Meta Quest 3/3S (Android 14, Hand Tracking v2)  
**Last Updated**: 2026-09-07
