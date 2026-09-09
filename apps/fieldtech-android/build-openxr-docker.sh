#!/bin/bash
# Build OpenXR library using Docker
# No local NDK required!

set -e

echo "🐳 Building OpenXR library using Docker..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Install Docker Desktop first."
    exit 1
fi

PROJECT_ROOT=$(pwd)
BUILD_DIR="app/src/main/cpp/build"

# Create build directory on host
mkdir -p "$BUILD_DIR"

echo "📦 Pulling Android NDK image..."
docker pull mcr.microsoft.com/android/ndk:r25c-api29

echo "🔨 Compiling in Docker..."
docker run --rm \
    -v "$PROJECT_ROOT/app/src/main/cpp:/workspace" \
    -w /workspace/build \
    mcr.microsoft.com/android/ndk:r25c-api29 \
    bash -c "
        set -e
        echo '📋 Configuring CMake...'
        cmake \
            -DCMAKE_TOOLCHAIN_FILE=/opt/android-ndk/build/cmake/android.toolchain.cmake \
            -DANDROID_ABI=arm64-v8a \
            -DANDROID_PLATFORM=android-29 \
            -DCMAKE_BUILD_TYPE=Release \
            ..

        echo '🔨 Building...'
        cmake --build . --config Release -- -j\$(nproc)

        echo '✅ Build complete!'
    "

# Verify
JNI_LIBS_DIR="$PROJECT_ROOT/app/src/main/jniLibs/arm64-v8a"
mkdir -p "$JNI_LIBS_DIR"

if [ -f "$BUILD_DIR/libopenxr_vr.so" ]; then
    cp "$BUILD_DIR/libopenxr_vr.so" "$JNI_LIBS_DIR/"
    SIZE=$(du -h "$JNI_LIBS_DIR/libopenxr_vr.so" | cut -f1)

    echo ""
    echo "✅ SUCCESS! OpenXR library built:"
    echo "   📦 Size: $SIZE"
    echo "   📍 Location: $JNI_LIBS_DIR/libopenxr_vr.so"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Download OpenXR loader from Meta SDK or Khronos"
    echo "   2. Place libopenxr_loader.so in: $JNI_LIBS_DIR/"
    echo "   3. Rebuild APK: ./gradlew clean assembleDebug"
else
    echo "❌ Build failed: libopenxr_vr.so not found"
    exit 1
fi
