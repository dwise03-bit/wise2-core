# VR Workspace Quest 3S — Testing Guide

**Status**: Ready for Hardware Testing  
**Target Device**: Meta Quest 3S  
**Date**: 2026-09-13

---

## Pre-Build Checklist

Before building the APK, ensure you have:

- [ ] Unity 2022.3.28 or later installed
- [ ] Android SDK installed (API Level 29+)
- [ ] Meta XR SDK plugin installed in Unity
- [ ] Quest 3S connected via USB-C cable
- [ ] Quest in Developer Mode (Settings → Developer → Developer Mode → ON)
- [ ] USB Debugging authorized on Quest
- [ ] adb command available in terminal

---

## Build Instructions

### Option 1: Automated Build Script (Recommended)

```bash
cd apps/vr-workspace/
chmod +x BuildQuest.sh
./BuildQuest.sh
```

This script will:
1. ✅ Validate the Unity project
2. ✅ Build the APK
3. ✅ Deploy to connected Quest
4. ✅ Launch the app automatically

### Option 2: Manual Build in Unity

1. **Open Project**
   ```bash
   unity -projectPath apps/vr-workspace/
   ```

2. **Configure Build Settings**
   - File → Build Settings
   - Select "Android" as target platform
   - Switch Platform

3. **Configure Player Settings**
   - Edit → Project Settings → Player
   - **Android Tab:**
     - Identification → Bundle Identifier: `com.wise2.vrworkspace`
     - Identification → Version: `1.0.0`
     - Identification → Version Code: `1`
     - Minimum API Level: 29
     - Target API Level: 33

4. **Enable XR Support**
   - Edit → Project Settings → XR Plug-in Management
   - Android Tab:
     - ☑ OpenXR
     - ☑ Meta Quest

5. **Build APK**
   - File → Build Settings → Build
   - Save as: `vr-workspace.apk`
   - Wait 5-10 minutes for build

6. **Deploy to Quest**
   ```bash
   adb install -r vr-workspace.apk
   ```

7. **Launch App**
   ```bash
   adb shell am start -n com.wise2.vrworkspace/com.wise2.vrworkspace.MainActivity
   ```

---

## Testing Workflow

### 1. **Initial Launch** (2 minutes)

```bash
# View logs as app starts
adb logcat | grep -E "VREnvironment|HandTracking|VRRenderer" | head -20
```

**Expected Output:**
```
[VREnvironment] Initialized for Meta Quest 3S
[HandTracking] Initialized
[VRRenderer] Initialized
[VREnvironment] Health: FPS=72, Battery=100%, Objects=0
```

**If not seeing output:**
- Check app installed: `adb shell pm list packages | grep wise2`
- Check for crashes: `adb logcat | grep FATAL`
- Verify USB debugging enabled on Quest

### 2. **Hand Tracking Test** (5 minutes)

**What to do:**
1. Put on Quest 3S
2. Look at your hands
3. Verify hand skeleton visible
4. Perform these gestures slowly:
   - **Pinch**: Thumb + index finger together
   - **Grab**: All fingers curled
   - **Point**: Index finger extended
   - **Palm**: Open hand facing camera
   - **Thumbs Up**: Thumb extended upward

**What to expect:**
- Hands render in 3D space
- Gesture detection ~<50ms latency
- Console logs: `[HandTracking] Gesture: pinch/grab/point/palm/idle`

**If hand tracking fails:**
- Ensure hand tracking enabled: Settings → Developer → Hand Tracking
- Check lighting (not too dark)
- Raise hands to shoulder height
- Move to well-lit area

### 3. **VR Environment Test** (5 minutes)

**What to do:**
1. Walk around virtual workspace
2. Perform pinch gesture to select objects
3. Point at 3D elements
4. Observe spatial response

**What to expect:**
- 3D office/workspace visible
- Lighting realistic
- No texture artifacts
- Smooth camera movement
- 72 FPS maintained (no stuttering)

**Performance Check:**
```bash
adb logcat | grep "FPS="
# Should show: FPS=72, Battery=XX%, Objects=N
```

### 4. **AI Response Test** (30 seconds)

**What to do:**
1. Perform pinch gesture
2. Watch console for request
3. Wait for AI response
4. See 3D text appear in front of you

**What to expect:**
```
Router request: VR User pinch gesture...
Routing: LOCAL via ollama
Latency: ~1200ms (first inference)
Response: 3D text in cyan appears 2m in front
Auto-disappears after 5 seconds
```

**If response doesn't appear:**
- Check Router health: `curl http://localhost:3100/health`
- Check Ollama: `docker exec ollama ollama list`
- Check network: Quest should be on same network as Router (VPS)
- Check logs: `adb logcat | grep -i "error\|failed"`

### 5. **Gesture Sequence Test** (5 minutes)

Perform this sequence and observe responses:

```
PINCH
  → Expect: 3D text "Pinch detected"
  → Latency: <100ms local

POINT at object
  → Expect: Gaze direction logged
  → Response: "Looking at workspace"

GRAB (hold for 2 sec)
  → Expect: "Object selected"

PALM (open hand)
  → Expect: "Cancelled" or back gesture

IDLE (drop hands)
  → Expect: No response, "idle" logged
```

---

## Performance Validation

### Frame Rate Monitoring

```bash
# Watch FPS in real-time
adb logcat | grep "FPS=" | tail -5
```

**Targets:**
- FPS: 72 (Quest native refresh rate)
- Variance: ±2 FPS acceptable
- Latency: <16.7ms per frame

### Memory Usage

```bash
adb shell dumpsys meminfo com.wise2.vrworkspace
```

**Acceptable Ranges:**
- Native Heap: <500MB
- Art Heap: <200MB
- Total: <800MB

### Battery Drain

- Start: Note battery %
- Run app for 10 minutes
- End: Check battery %
- Expected drain: <5% (0.5% per minute)

---

## Test Scenarios

### Scenario 1: Clean Start

```bash
# Uninstall + reinstall
adb uninstall com.wise2.vrworkspace
adb install -r vr-workspace.apk
adb shell am start -n com.wise2.vrworkspace/com.wise2.vrworkspace.MainActivity

# Monitor startup
adb logcat | grep VREnvironment | head -10
```

**Expected result**: App launches in <3 seconds, all systems initialize

### Scenario 2: Network Loss

```bash
# Disable Wi-Fi on Quest while app running
# Perform gesture → observe graceful error

# Re-enable Wi-Fi
# Next gesture should work normally
```

**Expected result**: Error logged, app doesn't crash, recovers when network returns

### Scenario 3: Extended Session

```bash
# Run app for 30 minutes
# Perform gestures every 30 seconds
# Monitor for crashes, frame drops, or memory leaks
```

**Expected result**: Consistent FPS, no crashes, battery <20% drain

### Scenario 4: Gesture Spam

```bash
# Perform rapid pinch/grab/point in succession
# (5 gestures per second for 30 seconds)
```

**Expected result**: No dropped gestures, consistent latency, no stuttering

---

## Troubleshooting

| Issue | Diagnosis | Solution |
|-------|-----------|----------|
| **App crashes on launch** | Check: `adb logcat \| grep FATAL` | Build in DEBUG mode, check for missing permissions |
| **Hand tracking invisible** | Quest → Settings → Developer → Hand Tracking | Enable hand tracking, update app |
| **FPS drops below 60** | `adb logcat \| grep FPS` shows <60 | Reduce draw calls, optimize shaders, check battery |
| **AI response timeout** | `curl http://localhost:3100/health` | Verify router running, check network connectivity |
| **3D text not visible** | Check console: "SpatialText created at X,Y,Z" | Verify text appears in front of camera (Z < 0) |
| **Gesture not detected** | Hands not tracked or lighting poor | Move to bright area, raise hands to shoulder height |
| **adb connection lost** | `adb devices` shows "offline" | Restart adb: `adb kill-server && adb start-server` |

---

## Logs & Debugging

### Real-Time Log Filtering

```bash
# All VR components
adb logcat | grep -E "VREnvironment|HandTracking|SpatialAudio|VRRenderer"

# Errors only
adb logcat | grep ERROR

# FPS monitoring
adb logcat | grep "FPS=" | tail -1

# Network requests
adb logcat | grep -i "http\|router\|request"
```

### Save Logs to File

```bash
# Capture 5-minute session
adb logcat > vr-workspace-session.log &
LOGPID=$!

# Run test...
sleep 300

# Stop logging
kill $LOGPID

# Analyze
grep -i "error\|warning\|crash" vr-workspace-session.log
```

### Performance Profiling

```bash
# CPU usage
adb shell top -n 1 | grep wise2

# Memory snapshot
adb shell dumpsys meminfo com.wise2.vrworkspace | grep TOTAL

# Frame time
adb logcat -s Unity | grep "fps\|frame"
```

---

## Success Criteria

✅ **All tests pass** when:

- [ ] App launches without crashes
- [ ] Hand tracking visible and responsive (<50ms)
- [ ] FPS maintained at 72
- [ ] Gestures detected accurately
- [ ] AI responses appear as 3D text
- [ ] Spatial audio plays at correct position
- [ ] No frame drops during 30-min session
- [ ] Battery drain <5% per hour
- [ ] Network loss handled gracefully
- [ ] All logs clean (no errors/exceptions)

---

## Next Steps After Testing

1. **Gesture Refinement**
   - Fine-tune detection thresholds
   - Test with different hand sizes
   - Optimize for different lighting

2. **Performance Optimization**
   - Profile with Profiler: Window → Analysis → Profiler
   - Target 72 FPS consistently
   - Reduce memory to <600MB

3. **Production Hardening**
   - Add crash reporting
   - Implement analytics tracking
   - Create error recovery flows

4. **Deployment**
   - Submit to Meta App Lab
   - Create store listing
   - Set up beta testing program

---

## Contact & Support

- **Build Issues**: Check `build/build.log` for details
- **Runtime Crashes**: Attach `vr-workspace-session.log` with issue report
- **Hand Tracking Problems**: Try different lighting/environment
- **Questions**: dwise03@gmail.com

---

**Testing Status**: Ready for Hardware Validation  
**Last Updated**: 2026-09-13
