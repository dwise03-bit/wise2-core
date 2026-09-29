#!/bin/bash
# OpenXR Library Build Script for FieldTech VR
# Builds libopenxr_vr.so from C++ source using Android NDK

set -e

echo "🔨 Building OpenXR Native Library for Meta Quest..."

# Configuration
ANDROID_NDK="${ANDROID_NDK_ROOT:-$ANDROID_HOME/ndk/25.2.9519653}"
ANDROID_ABI="arm64-v8a"
ANDROID_PLATFORM="android-29"
BUILD_TYPE="Release"

# Validate NDK
if [ ! -d "$ANDROID_NDK" ]; then
    echo "❌ ERROR: Android NDK not found at $ANDROID_NDK"
    echo "Set ANDROID_NDK_ROOT or ANDROID_HOME environment variable"
    echo ""
    echo "Example:"
    echo "  export ANDROID_NDK_ROOT=/path/to/android-ndk-r25c"
    echo "  export ANDROID_HOME=/path/to/android-sdk"
    exit 1
fi

echo "✅ Using NDK: $ANDROID_NDK"

# Create build directory
BUILD_DIR="app/src/main/cpp/build"
mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"

# Run CMake configuration
echo "📋 Configuring CMake..."
cmake \
    -DCMAKE_TOOLCHAIN_FILE="$ANDROID_NDK/build/cmake/android.toolchain.cmake" \
    -DANDROID_ABI="$ANDROID_ABI" \
    -DANDROID_PLATFORM="$ANDROID_PLATFORM" \
    -DANDROID_NDK="$ANDROID_NDK" \
    -DCMAKE_BUILD_TYPE="$BUILD_TYPE" \
    -DCMAKE_FIND_ROOT_PATH="$ANDROID_NDK" \
    ..

# Compile
echo "🔨 Compiling..."
cmake --build . --config "$BUILD_TYPE" -- -j$(nproc)

# Copy to jniLibs
JNI_LIBS_DIR="../jniLibs/$ANDROID_ABI"
mkdir -p "$JNI_LIBS_DIR"

echo "📦 Installing library..."
cp "libopenxr_vr.so" "$JNI_LIBS_DIR/"

# Verify
if [ -f "$JNI_LIBS_DIR/libopenxr_vr.so" ]; then
    SIZE=$(du -h "$JNI_LIBS_DIR/libopenxr_vr.so" | cut -f1)
    echo ""
    echo "✅ SUCCESS! Library compiled and installed:"
    echo "   Path: $JNI_LIBS_DIR/libopenxr_vr.so"
    echo "   Size: $SIZE"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Download OpenXR loader from Meta SDK:"
    echo "      https://developers.meta.com/resources/downloads/"
    echo "   2. Extract libopenxr_loader.so to: app/src/main/jniLibs/$ANDROID_ABI/"
    echo "   3. Rebuild APK:"
    echo "      ./gradlew clean assembleDebug"
    echo "   4. Deploy:"
    echo "      adb install app/build/outputs/apk/debug/app-debug.apk"
else
    echo "❌ FAILED: Library not found at $JNI_LIBS_DIR/libopenxr_vr.so"
    exit 1
fi
