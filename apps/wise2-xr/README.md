# WISE² XR Command Center

Native Meta Quest 3 / 3S Unity command-room build. The app uses OpenXR, Quest passthrough, controller/hand input, and an offline demo service with explicit state labels. The contracts in `Assets/Scripts/Contracts` keep future WISE² API and Discord adapters behind authenticated backend boundaries.

## Build

1. Open this folder in Unity `6000.0.XXf1` (or the project-approved Unity LTS) with Android Build Support, OpenJDK, and SDK/NDK installed.
2. Switch platform to Android.
3. Open `Assets/Scenes/XRCommandCenter.unity`.
4. Set `WISE2_API_BASE_URL` in `Project Settings > Player > Other Settings > Scripting Define Symbols` or replace the development default in `Assets/Scripts/Wise2Config.cs`.
5. Build and Run, or run `bash scripts/build-quest.sh` from a machine with Unity installed.

The generated APK is written to `Build/WISE2-XR.apk`. Install with `adb install -r Build/WISE2-XR.apk`. The VPS build script writes to `/sdb-disk/unity/builds/wise2-xr`.

The native scene is an offline-first spatial command shell with a central context engine, KPI/activity surfaces, explicit `DEMO`/`NO TELEMETRY` states, and camera fallback for Quest. Remote actions must use `CommandPreview` and an approval service; Discord tokens never belong in Unity, Android, or source control.

## Delivery checks

- OpenXR loader starts or reports a desktop-preview fallback.
- Offline demo data is available without network access.
- All outbound Discord actions are previewed and confirmation-gated.
- Build with `bash scripts/build-quest.sh`, then install over USB with `adb install -r`.

## HVAC telemetry adapter

The HVAC station is the first live-capable station. `Wise2HvacApiClient`
(`Assets/Scripts/Services/`) polls the authenticated backend endpoint
`GET {WISE2_API_BASE_URL}/v1/hvac/telemetry/{nodeId}/latest` and renders the
returned `HvacTelemetrySnapshot`.

- Base URL comes from `Wise2Config.ApiBaseUrl`. The bearer token is read at
  runtime from the `WISE2_XR_TOKEN` environment variable and is never stored in a
  serialized Unity asset.
- State mapping is pure and UnityEngine-free in `HvacStateMapper`
  (`Assets/Scripts/Contracts/HvacTelemetry.cs`): `CONNECTED → Connected`,
  `DEMO → OfflineDemo`, `DEGRADED`/`NO_TELEMETRY → Degraded`. Transport, auth, or
  parse failure falls back to the offline demo source with an explicit
  non-connected state; stale data is never shown as live.
- All other stations and the current visual palette are unchanged.

The Quest build check (`bash scripts/build-quest.sh`) requires a machine with
Unity and the Android toolchain installed; it cannot be run in every environment.
