# RR 60s Bets Android shell

This is a small Android WebView app for the live demo at `https://rr60sbets.wise2.net/`. It requires a network connection and does not bundle the Next.js site. The app allows only that HTTPS host inside the WebView; other HTTPS links open in the device browser. Android local WebView storage holds demo state. No sportsbook or wager placement is included.

Package: `com.wise2.rr60sbets` · version `0.1.0` · minimum Android API 24.

## Build on the VPS

The VPS has Android SDK at `/opt/android-sdk`. Build from this directory using the checked-in Gradle wrapper:

```sh
export ANDROID_HOME=/opt/android-sdk ANDROID_SDK_ROOT=/opt/android-sdk
./gradlew --no-daemon :app:assembleDebug :app:lintDebug
```

For a signed, non-debuggable APK, keep the signing keystore and environment variables outside the repository. On the current VPS they are under `/home/dwise/.config/rr60s-bets/` with owner-only permissions:

```sh
set -a
. /home/dwise/.config/rr60s-bets/signing.env
set +a
./gradlew --no-daemon :app:assembleRelease :app:lintRelease
```

The release output is `app/build/outputs/apk/release/app-release.apk`. Preserve the keystore and its passwords for future updates; an APK signed with a different key cannot update an installed copy. Do not commit signing files.

## Current artifact

`/home/dwise/rr60s-bets/releases/android/RR60s-Bets-0.1.0.apk` is the signed APK built on 2026-10-04. SHA-256: `e4d148f6de858b6e48d0d9237da386c4169b8f4f645918f0180d000933a5e431`.

Gradle assemble and lint passed, and `apksigner verify` passed with a dedicated 3072-bit signing key. No Android device or emulator was connected to the VPS, so launch and interaction on a device remain unverified.
