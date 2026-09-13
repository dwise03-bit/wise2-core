# VR Workspace — Quick Start Guide

**Build for Meta Quest 3S in 3 Steps**

---

## Prerequisites

Before you start, have these installed:

1. **Unity 2022.3.28+**
   - Download: https://unity.com/download
   - Select Android Build Support during install

2. **Android SDK**
   - Via Unity Hub → Android Build Support
   - Or: https://developer.android.com/studio (include SDK, NDK, tools)
   - Minimum API Level: 29

3. **Meta XR SDK Plugin** (in Unity)
   - Window → TextMesh Pro → Import TMP Essential Resources
   - Window → OpenXR → Create OpenXR Feature Set (Android)
   - Window → Meta XR → Configure Unity Project (Quest 3S)

4. **Quest 3S Connected via USB**
   - Enable Developer Mode: Settings → Developer → Developer Mode ON
   - Authorize USB debugging when prompted

---

## Build & Deploy (5 Minutes)

### Step 1: Open Project in Unity

```bash
cd wise2-core/apps/vr-workspace
unity -projectPath . &
```

Wait for Unity Editor to load (2-3 minutes).

### Step 2: Build APK

**Automated (Recommended):**
```bash
./BuildQuest.sh
```

This builds and deploys automatically. Skip to Step 3.

**Manual:**
1. File → Build Settings → Select "Android"
2. File → Build Settings → Build
3. Save as `vr-workspace.apk` in `build/` directory
4. Wait 5-10 minutes for build to complete

### Step 3: Test on Quest

```bash
# Install APK (if not done by BuildQuest.sh)
adb install -r build/vr-workspace.apk

# Launch app
adb shell am start -n com.wise2.vrworkspace/com.wise2.vrworkspace.MainActivity

# View logs
adb logcat | grep VREnvironment
```

**Put on your Quest and:**
- ✅ Look at your hands
- ✅ Perform pinch gesture (thumb + index)
- ✅ Watch for 3D response text
- ✅ See spatial audio play from that position

---

## What You Should See

**App Startup** (3-5 seconds):
```
[VREnvironment] Initialized
[HandTracking] Initialized  
[VRRenderer] Initialized
```

**On First Gesture**:
```
[VREnvironment] Processing gesture: pinch
[RouterClient] Request sent to 173.208.147.165:3100
Router response received in 1200ms
3D cyan text appears 2m in front of you
```

**Continuous FPS Monitor**:
```
[VREnvironment] Health: FPS=72, Battery=95%, Objects=1
```

---

## Gestures

| Gesture | Action | Expected Result |
|---------|--------|-----------------|
| **Pinch** | Thumb + index close | AI response as 3D text |
| **Grab** | All fingers curled | "Object selected" |
| **Point** | Index extended | Gaze direction logged |
| **Palm** | Open hand | Back/cancel gesture |
| **Idle** | Hands dropped | No response |

---

## Troubleshooting

**"adb: command not found"**
```bash
# Add to PATH
export PATH=$PATH:~/Library/Android/sdk/platform-tools
adb devices  # Should show your Quest
```

**"Hand tracking not visible"**
- Settings → Developer → Hand Tracking: ON
- Move to well-lit area
- Raise hands to shoulder height

**"Build fails in Unity"**
- Check: File → Build Settings → Scenes selected
- Verify Android SDK path: Edit → Preferences → External Tools → Android SDK
- If missing: Install via Unity Hub → Android Build Support

**"App crashes on launch"**
```bash
adb logcat | grep FATAL
# Copy error and check against TESTING_GUIDE.md
```

**"Can't connect to Router"**
```bash
# On Mac/VPS
curl http://localhost:3100/health
# Should return: {"ok":true,...}

# From Quest: Must be on same network as VPS
# Check: Quest Wi-Fi → Connected to same network as PC
```

---

## Next Steps

1. **After build succeeds:**
   - Test all 5 gestures on real Quest 3S
   - Monitor console: `adb logcat | grep VREnvironment | tail`
   - Run 10-minute session to verify FPS/battery

2. **Performance optimization:**
   - Window → Analysis → Profiler
   - Target 72 FPS (refresh rate of Quest 3S)
   - Check memory: <600MB

3. **When ready for production:**
   - See `/apps/vr-workspace/TESTING_GUIDE.md` for full test plan
   - See `/docs/AR_VR_APPLICATION_GUIDE.md` for API details

---

## Files Created

```
apps/vr-workspace/
├── Assets/Scripts/
│   ├── VREnvironment.cs      (Main controller)
│   ├── HandTracking.cs        (Gesture detection)
│   ├── SpatialAudio.cs        (3D sound)
│   └── VRRenderer.cs          (72 FPS optimization)
├── Assets/Editor/
│   └── BuildScript.cs         (Automated build)
├── Assets/Plugins/Android/
│   └── AndroidManifest.xml    (Quest configuration)
├── ProjectSettings/           (Unity config)
├── BuildQuest.sh             (One-command build)
├── QUICK_START.md            (This file)
├── TESTING_GUIDE.md          (Complete test plan)
└── README.md                 (Architecture overview)
```

---

## Support

- **Questions**: dwise03@gmail.com
- **Issues**: Check TESTING_GUIDE.md → Troubleshooting
- **Logs**: `adb logcat > session.log` then inspect

---

**Status**: ✅ Ready to build & test  
**Estimated Build Time**: 5-10 minutes  
**Estimated Test Time**: 15-30 minutes  

**Start here:** `./BuildQuest.sh`

---

**Last Updated**: 2026-09-13
