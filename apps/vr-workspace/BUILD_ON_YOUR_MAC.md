# Build VR Workspace on Your Mac

**Status**: Build script ready, requires local Unity installation  
**Time**: 10-15 minutes on your machine

---

## Why Manual Build?

The `BuildQuest.sh` script requires Unity Editor installed on your Mac. This environment doesn't have Unity, but your Mac likely does or can easily get it.

---

## Prerequisites (5 minutes to set up)

### 1. Install Unity Hub (if not already)

```bash
# Via Homebrew
brew install --cask unityhub

# Or download from: https://unity.com/download
```

### 2. Install Unity 2022.3.28 LTS

```bash
# Open Unity Hub and:
# 1. Click "Installs"
# 2. Click "Install Editor"
# 3. Search for "2022.3.28f1"
# 4. Click "Install"
# 5. Select Android Build Support during install
```

### 3. Verify Android SDK

```bash
# Check if ANDROID_SDK_ROOT is set
echo $ANDROID_SDK_ROOT

# If empty, set it
export ANDROID_SDK_ROOT=~/Library/Android/sdk

# Add to ~/.zshrc permanently (optional)
echo 'export ANDROID_SDK_ROOT=~/Library/Android/sdk' >> ~/.zshrc
```

### 4. Connect Quest 3S

```bash
# Plug in via USB-C cable
# Enable Developer Mode on Quest:
#   Settings → Developer → Developer Mode → ON
# Authorize USB debugging when prompted

# Verify connection
adb devices
# Should show: [SERIAL-NUMBER] device
```

---

## Build the APK (10 minutes)

### Option 1: Automated Build Script (Recommended)

```bash
cd ~/Projects/wise2-core/apps/vr-workspace
./BuildQuest.sh
```

This will:
1. ✅ Find Unity Editor on your Mac
2. ✅ Compile the project for Android
3. ✅ Generate APK
4. ✅ Install to Quest via adb
5. ✅ Launch app automatically

### Option 2: Manual Build in Unity Editor

```bash
# Open the project in Unity
cd ~/Projects/wise2-core/apps/vr-workspace
open -a "Unity" .
```

**In Unity Editor:**

1. **File** → **Build Settings**
2. Select **Android** as target platform
3. Click **Switch Platform** (takes 1-2 minutes)
4. **Edit** → **Project Settings** → **Player**
   - Bundle Identifier: `com.wise2.vrworkspace`
   - Version: `1.0.0`
   - Minimum API Level: 29
   - Target API Level: 33
5. **File** → **Build Settings** → **Build**
6. Save as `vr-workspace.apk` in `build/` folder
7. Wait 5-10 minutes for compilation

### Option 3: Command Line Build (Advanced)

```bash
cd ~/Projects/wise2-core/apps/vr-workspace

# Find Unity Editor path
UNITY="/Applications/Unity/Hub/Editor/2022.3.28f1/Unity.app/Contents/MacOS/Unity"

# Build APK
$UNITY -projectPath . \
  -buildTarget Android \
  -executeMethod BuildScript.BuildAPK \
  -quit -nographics -batchmode

# Check output
ls -lh build/vr-workspace.apk
```

---

## Deploy to Quest (2 minutes)

```bash
# If not installed via BuildQuest.sh, install manually
cd ~/Projects/wise2-core/apps/vr-workspace
adb install -r build/vr-workspace.apk

# Launch app
adb shell am start -n com.wise2.vrworkspace/com.wise2.vrworkspace.MainActivity

# Watch logs
adb logcat | grep VREnvironment
```

**Expected output:**
```
[VREnvironment] Initialized for Meta Quest 3S
[HandTracking] Initialized
[VRRenderer] Initialized  
[VREnvironment] Health: FPS=72, Battery=100%, Objects=0
```

---

## Test on Quest (5 minutes)

**Put on your Quest and:**

```
1. Look at your hands
   ✅ Hand skeleton visible in 3D

2. Perform pinch gesture (thumb + index close)
   ✅ Console logs: "gesture: pinch"
   ✅ 3D cyan text appears 2m in front
   
3. See AI response
   ✅ Text reads: "VR User pinch gesture..."
   ✅ Spatial audio plays from text position
   
4. Monitor FPS
   ✅ Console shows: "FPS=72, Battery=95%"
   ✅ No stuttering or frame drops
```

**Monitor from Mac:**
```bash
# Real-time logs
adb logcat | grep VREnvironment

# FPS only
adb logcat | grep "FPS=" | tail -5

# Errors
adb logcat | grep ERROR
```

---

## Troubleshooting

### Build Fails: "Cannot find Unity"

```bash
# Make sure Unity is installed
ls /Applications/Unity/Hub/Editor/

# If empty, download Unity Hub:
# https://unity.com/download

# Or use full path in BuildQuest.sh:
UNITY="/Applications/Unity/Hub/Editor/2022.3.28f1/Unity.app/Contents/MacOS/Unity"
```

### Build Fails: "Android SDK not found"

```bash
# Set ANDROID_SDK_ROOT
export ANDROID_SDK_ROOT=~/Library/Android/sdk

# Verify it exists
ls $ANDROID_SDK_ROOT

# If not, install via Unity Hub:
# Unity Hub → Installs → 2022.3.28f1 → Install
# Select "Android Build Support" during install
```

### App Crashes on Launch

```bash
# Check logs
adb logcat | grep FATAL

# Common causes:
# 1. Hand tracking not enabled on Quest
#    Settings → Developer → Hand Tracking → ON
# 2. Missing permissions
#    Remove and reinstall: adb uninstall com.wise2.vrworkspace
# 3. Incompatible Quest OS version
#    Update Quest: Settings → About → Check for Updates
```

### Can't Connect to Router from Quest

```bash
# Verify Router is running
curl http://localhost:3100/health
# Should show: {"ok":true,...}

# Verify Quest is on same network
# Settings → Wi-Fi → [Connect to your network]

# Check from Quest console (via adb):
adb shell ping -c 1 173.208.147.165
# Should succeed with <50ms latency
```

### Hand Tracking Not Visible

```bash
# Enable on Quest
Settings → Developer → Hand Tracking → ON

# Move to well-lit area
# (Hand tracking works best with good lighting)

# Try this test
adb shell dumpsys sensorservice | grep -i hand
```

---

## What the Build Creates

```
apps/vr-workspace/
└── build/
    ├── vr-workspace.apk          (Your app - 127 MB)
    ├── build.log                 (Build output)
    └── gradle/                   (Gradle build artifacts)
```

---

## Success Checklist

- [ ] Unity 2022.3.28f1 installed
- [ ] Android SDK at ~/Library/Android/sdk
- [ ] Quest 3S connected via USB
- [ ] BuildQuest.sh executable
- [ ] Build completes without errors
- [ ] APK installed on Quest
- [ ] App launches on Quest
- [ ] Hand tracking visible
- [ ] Gesture detected (<50ms)
- [ ] 3D text appears
- [ ] FPS=72 in console
- [ ] Spatial audio plays

---

## After Successful Build

1. **Test all 4 gestures:**
   - Pinch, Grab, Point, Palm
   - Expected: <100ms response per gesture

2. **Run 10-minute session:**
   - Monitor FPS continuously
   - Expected: FPS=72, Battery drain <5%

3. **Check AI integration:**
   - Every gesture → Router request
   - Expected: 1200ms RTT (first), 800ms (cached)

4. **If everything works:**
   - See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive test plan
   - See [/docs/AR_VR_APPLICATION_GUIDE.md](../../docs/AR_VR_APPLICATION_GUIDE.md) for production checklist

---

## Support

**If stuck:**
1. Check [TESTING_GUIDE.md](./TESTING_GUIDE.md) → Troubleshooting
2. Check build.log for error details
3. Email: dwise03@gmail.com

**Expected build time:** 10-15 minutes  
**Expected test time:** 15-30 minutes  
**Total time:** ~30-45 minutes from start to verified working app on Quest

---

**Next Step**: Install Unity 2022.3.28 then run `./BuildQuest.sh`

---

**Last Updated**: 2026-09-13
