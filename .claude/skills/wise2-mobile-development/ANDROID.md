# WISE2 Android / Kotlin

Inspect Gradle files, namespace/applicationId, SDK levels, manifest permissions, Compose setup, flavors, signing configuration, tests, and existing CI before edits.

## Verification
```bash
adb devices -l
./gradlew test
./gradlew lint
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell monkey -p <PACKAGE_ID> 1
adb logcat -d -t 300
```

Exercise the changed workflow on emulator or device. BLE, camera, microphone, GPS, NFC, USB, background services, and vendor-specific behavior require a physical Android test. Keep generated `.gradle/`, build outputs, keystores, and local secrets out of commits.

Before release run the project's release tests/lint, build the expected AAB/APK, validate permissions and target SDK behavior, and perform Play Store preflight. Do not alter production signing to bypass a build failure.
