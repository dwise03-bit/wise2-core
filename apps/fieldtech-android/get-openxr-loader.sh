#!/bin/bash
# Download/Build OpenXR Loader Library
# Downloads or compiles libopenxr_loader.so for Meta Quest

set -e

echo "📥 Setting up OpenXR Loader..."

ANDROID_ABI="arm64-v8a"
JNI_LIBS_DIR="app/src/main/jniLibs/$ANDROID_ABI"

mkdir -p "$JNI_LIBS_DIR"

# Option 1: Try to download pre-built from Meta CDN (if available)
echo "🔍 Checking for pre-built Meta OpenXR libraries..."

# Khronos OpenXR SDK has source code for loader
if [ ! -d "/tmp/OpenXR-SDK" ]; then
    echo "📦 Cloning Khronos OpenXR SDK..."
    git clone --depth 1 https://github.com/KhronosGroup/OpenXR-SDK.git /tmp/OpenXR-SDK
fi

# Check if we need to build the loader
if [ ! -f "$JNI_LIBS_DIR/libopenxr_loader.so" ]; then
    echo ""
    echo "⚠️  libopenxr_loader.so not found"
    echo ""
    echo "Options to obtain it:"
    echo ""
    echo "Option 1: Download from Meta XR SDK"
    echo "   https://developers.meta.com/resources/downloads/"
    echo "   Extract and copy:"
    echo "   cp OpenXR-SDK-Meta/lib/arm64-v8a/libopenxr_loader.so $JNI_LIBS_DIR/"
    echo ""
    echo "Option 2: Use Khronos pre-built (if available in releases)"
    echo "   https://github.com/KhronosGroup/OpenXR-SDK/releases"
    echo ""
    echo "Option 3: Compile from source (requires NDK)"
    echo "   cd /tmp/OpenXR-SDK"
    echo "   mkdir build && cd build"
    echo "   cmake -DCMAKE_TOOLCHAIN_FILE=\$ANDROID_NDK_ROOT/build/cmake/android.toolchain.cmake \\"
    echo "         -DANDROID_ABI=arm64-v8a -DANDROID_PLATFORM=android-29 .."
    echo "   cmake --build . --target openxr_loader"
    echo "   cp lib/libopenxr_loader.so ../../path/to/jniLibs/"
    echo ""
    echo "📝 After obtaining the loader, place it at:"
    echo "   $JNI_LIBS_DIR/libopenxr_loader.so"
    echo ""
    exit 1
else
    SIZE=$(du -h "$JNI_LIBS_DIR/libopenxr_loader.so" | cut -f1)
    echo "✅ Found existing libopenxr_loader.so ($SIZE)"
fi

# Verify we have both libraries
if [ -f "$JNI_LIBS_DIR/libopenxr_loader.so" ] && [ -f "$JNI_LIBS_DIR/libopenxr_vr.so" ]; then
    echo ""
    echo "✅ Both libraries ready:"
    ls -lh "$JNI_LIBS_DIR"/*.so
    echo ""
    echo "📝 Next: Build APK"
    echo "   ./gradlew clean assembleDebug"
elif [ -f "$JNI_LIBS_DIR/libopenxr_vr.so" ]; then
    echo ""
    echo "⚠️  libopenxr_vr.so found, but libopenxr_loader.so is missing"
    echo "Get the loader using Option 1, 2, or 3 above"
elif [ -f "$JNI_LIBS_DIR/libopenxr_loader.so" ]; then
    echo ""
    echo "⚠️  libopenxr_loader.so found, but libopenxr_vr.so is missing"
    echo "Wait for GitHub Actions build to complete, then download the artifact"
fi
