#!/bin/bash
# Build Quest VR Workspace APK for Meta Quest 3S

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_OUTPUT="${PROJECT_ROOT}/build"
APK_PATH="${BUILD_OUTPUT}/vr-workspace.apk"
GRADLE_BUILD="${BUILD_OUTPUT}/gradle"

echo "🚀 VR Workspace Quest Build Script"
echo "=================================="
echo "Project: $PROJECT_ROOT"
echo "Output: $APK_PATH"
echo ""

# Check for Unity
if ! command -v unity &> /dev/null; then
    echo "❌ Unity not found. Please install Unity 2022.3 or later."
    echo "   Download: https://unity.com/download"
    exit 1
fi

# Check for Android SDK
if [ -z "$ANDROID_SDK_ROOT" ]; then
    echo "⚠️  ANDROID_SDK_ROOT not set. Attempting to find Android SDK..."

    if [ -d ~/Library/Android/sdk ]; then
        export ANDROID_SDK_ROOT=~/Library/Android/sdk
        echo "   Found: $ANDROID_SDK_ROOT"
    else
        echo "❌ Android SDK not found."
        echo "   Please set ANDROID_SDK_ROOT or install Android SDK."
        exit 1
    fi
fi

# Create build directory
mkdir -p "$BUILD_OUTPUT"

echo "Step 1️⃣  Validating project..."
if [ ! -f "$PROJECT_ROOT/ProjectSettings/ProjectVersion.txt" ]; then
    echo "❌ ProjectSettings not found. Is this a valid Unity project?"
    exit 1
fi
echo "✅ Project validated"

echo ""
echo "Step 2️⃣  Building APK with Unity..."
echo "This may take 5-10 minutes..."
echo ""

# Build using Unity command line
unity -projectPath "$PROJECT_ROOT" \
    -buildTarget Android \
    -executeMethod BuildScript.BuildAPK \
    -quit -nographics -batchmode \
    2>&1 | tee "$BUILD_OUTPUT/build.log"

# Check if build succeeded
if [ ! -f "$APK_PATH" ]; then
    echo ""
    echo "❌ Build failed. Check build.log for details:"
    tail -50 "$BUILD_OUTPUT/build.log"
    exit 1
fi

echo ""
echo "✅ APK built successfully: $APK_PATH"
echo "   Size: $(du -h "$APK_PATH" | cut -f1)"
echo ""

echo "Step 3️⃣  Checking for connected Quest device..."
if ! command -v adb &> /dev/null; then
    echo "⚠️  adb not found. Cannot deploy automatically."
    echo "   To deploy manually, run:"
    echo "   adb install -r \"$APK_PATH\""
    exit 0
fi

# List connected devices
DEVICES=$(adb devices | grep -v "List of" | grep "device$" | awk '{print $1}')

if [ -z "$DEVICES" ]; then
    echo "⚠️  No Quest device found via adb."
    echo "   Troubleshooting:"
    echo "   1. Connect Quest 3S via USB"
    echo "   2. Enable Developer Mode on Quest"
    echo "   3. Authorize USB debugging when prompted"
    echo "   4. Re-run this script"
    echo ""
    echo "   To deploy manually later:"
    echo "   adb install -r \"$APK_PATH\""
    exit 0
fi

echo "✅ Found device(s): $DEVICES"
echo ""

echo "Step 4️⃣  Installing APK to Quest..."
for DEVICE in $DEVICES; do
    echo "   Installing to $DEVICE..."
    adb -s "$DEVICE" install -r "$APK_PATH"
done

echo ""
echo "✅ Installation complete!"
echo ""

echo "Step 5️⃣  Launching app..."
adb shell am start -n com.wise2.vrworkspace/com.wise2.vrworkspace.MainActivity || true

echo ""
echo "🎉 Build & Deploy Complete!"
echo ""
echo "Next steps:"
echo "1. Put on your Meta Quest 3S"
echo "2. Look for 'VR Workspace' in your app library"
echo "3. Launch the app"
echo "4. Perform hand gestures:"
echo "   - Pinch: Interact with objects"
echo "   - Point: Direct attention"
echo "   - Grab: Select"
echo "   - Palm: Cancel/Back"
echo ""
echo "To view logs:"
echo "adb logcat | grep VREnvironment"
echo ""
