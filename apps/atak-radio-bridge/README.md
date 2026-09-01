# WISE² ATAK Radio Bridge

Android-side preparation for the UV‑PRO Bluetooth SPP bridge. The module is intentionally independent of the main WISE² monorepo.

## Build on the Razr

1. Install Android Studio/SDK 35 and ATAK CIV 5.6 on the Razr.
2. Obtain the authorized ATAK CIV 5.6 SDK AAR and copy it to `app/libs/atak-civ-5.6.0.aar`.
3. From this directory run `./gradlew assembleDebug`.
4. Enable USB debugging on the Razr, connect it, and run `adb install -r app/build/outputs/apk/debug/app-debug.apk`.
5. Pair the UV‑PRO in Android Bluetooth settings before launching ATAK.

The current checkout has no radio or ATAK SDK attached, so physical SPP and ATAK-host validation remains pending. Do not transmit until the radio channel, callsign, power, and legal operating parameters are explicitly configured.
