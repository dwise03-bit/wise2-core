# OpenXR Library Compilation Guide

## Option 1: Use Pre-Built Libraries (Recommended)

Meta provides pre-built OpenXR libraries for Android. Download from Meta's developer portal:

```bash
# Download Meta XR SDK
# https://developers.meta.com/resources/downloads/

# Extract and copy to jniLibs:
mkdir -p app/src/main/jniLibs/arm64-v8a
cp OpenXR-SDK/lib/android/arm64-v8a/libopenxr_loader.so app/src/main/jniLibs/arm64-v8a/

# Also copy our wrapper library (once compiled)
cp app/src/main/cpp/lib/libopenxr_vr.so app/src/main/jniLibs/arm64-v8a/
```

## Option 2: Compile from Source (Advanced)

Requires Android NDK r25 or higher and OpenXR SDK.

### Prerequisites

```bash
# Install Android NDK via Android Studio or:
# https://developer.android.com/studio/projects/install-ndk

# Set environment variables:
export ANDROID_NDK_ROOT=/path/to/android-ndk-r25c
export ANDROID_HOME=/path/to/android-sdk
export PATH=$ANDROID_NDK_ROOT/toolchains/llvm/prebuilt/darwin-x86_64/bin:$PATH
```

### Build Steps

```bash
cd apps/fieldtech-android/app/src/main/cpp

# Create build directory
mkdir -p build
cd build

# Configure CMake for Android
cmake -DCMAKE_TOOLCHAIN_FILE=$ANDROID_NDK_ROOT/build/cmake/android.toolchain.cmake \
      -DANDROID_ABI=arm64-v8a \
      -DANDROID_PLATFORM=android-29 \
      -DCMAKE_BUILD_TYPE=Release \
      ..

# Build
cmake --build . --config Release

# Output: libopenxr_vr.so will be in build/
cp build/libopenxr_vr.so ../../jniLibs/arm64-v8a/
```

### Copy Pre-Built OpenXR Loader

```bash
# Download OpenXR SDK: https://github.com/KhronosGroup/OpenXR-SDK
# Or use Meta's pre-built loader

cp openxr-sdk/build/loader/libopenxr_loader.so ../../jniLibs/arm64-v8a/
```

## Option 3: Use Docker (Mac/Linux)

```bash
docker run --rm \
  -v $(pwd):/workspace \
  -w /workspace/apps/fieldtech-android/app/src/main/cpp \
  android-ndk:r25 \
  bash -c "
    mkdir -p build
    cd build
    cmake -DCMAKE_TOOLCHAIN_FILE=/opt/android-ndk/build/cmake/android.toolchain.cmake \
          -DANDROID_ABI=arm64-v8a \
          -DANDROID_PLATFORM=android-29 \
          ..
    cmake --build . --config Release
  "
```

## Verify Build

```bash
# Check library was created
ls -lh app/src/main/jniLibs/arm64-v8a/*.so

# Expected:
# -rw-r--r--  libopenxr_loader.so (from Meta SDK)
# -rw-r--r--  libopenxr_vr.so     (our wrapper)
```

## Rebuild APK

```bash
./gradlew clean assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

## Testing

The app will now:
1. Load `libopenxr_vr.so` successfully
2. Initialize OpenXR runtime
3. Create hand trackers
4. Begin receiving real hand tracking data at 60fps

```bash
adb logcat | grep "OpenXR"
# Should show: "OpenXR JNI library loaded successfully"
```

---

## Current Status

- ✅ C++ code written (`openxr_vr.cpp`)
- ✅ CMakeLists.txt configured
- ✅ jniLibs directory created
- ⏳ Pending: Compile libraries (requires NDK)
- ⏳ Pending: Download Meta OpenXR SDK pre-built loader

## Next Steps

1. **Option A (Fastest)**: Download Meta XR SDK pre-built libraries
2. **Option B (Full Control)**: Install Android NDK and compile from source
3. **Option C (CI/CD)**: Use GitHub Actions to compile automatically

Once libraries are in place, rebuild the APK and redeploy.

---

**Estimated Time**: 30 min (Option A) to 2 hours (Option B from scratch)

**Blocked By**: Android NDK or Meta OpenXR SDK availability on this system
