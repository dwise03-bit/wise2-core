# WISE² Sound Labs Android

The Android app is a Capacitor shell around the same production web UI. It uses
the existing Sound Labs bridge (`services/sound-labs/bridge`, port `8788`) for
MASCHINE, REAPER, AI, and WebSocket state updates.

## Build

```bash
pnpm build
npx cap sync android
cd android
./gradlew assembleDebug
```

The debug APK is written to
`android/app/build/outputs/apk/debug/app-debug.apk`.

Java 21 is required by the current Capacitor Android toolchain. On this Mac:

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
```

## Install

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## Bridge endpoint

The web build uses `VITE_BRIDGE_URL` when supplied and otherwise defaults to the
current Tailscale bridge address. For another studio or network, build with:

```bash
VITE_BRIDGE_URL=http://<bridge-host>:8788 pnpm build
npx cap sync android
```

The bridge permits cleartext HTTP because local/Tailscale studio endpoints are
supported. Keep the bridge on a trusted LAN or private Tailscale network.
