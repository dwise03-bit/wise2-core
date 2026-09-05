# WISE² XR Command Center

Native Meta Quest 3 / 3S Unity project scaffold. The app uses OpenXR, Quest passthrough, controller/hand input, and the existing WISE² API through environment-configured endpoints.

## Build

1. Open this folder in Unity `6000.0.XXf1` (or the project-approved Unity LTS) with Android Build Support, OpenJDK, and SDK/NDK installed.
2. Switch platform to Android.
3. Open `Assets/Scenes/XRCommandCenter.unity`.
4. Set `WISE2_API_BASE_URL` in `Project Settings > Player > Other Settings > Scripting Define Symbols` or replace the development default in `Assets/Scripts/Wise2Config.cs`.
5. Build and Run, or run `bash scripts/build-quest.sh` from a machine with Unity installed.

The generated APK is written to `Build/WISE2-XR.apk`. Install with `adb install -r Build/WISE2-XR.apk`.

The initial native scene is a functional spatial shell. Service data is marked `DEMO`, `LIVE`, or `NO TELEMETRY`; no production credentials or fabricated measurements are included.
