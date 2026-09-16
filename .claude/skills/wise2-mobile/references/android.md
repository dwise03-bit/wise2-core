# Android

## Defaults

- Kotlin + Jetpack Compose for new native UI.
- Coroutines + Flow for asynchronous/reactive work.
- Preserve the project's existing DI, persistence and navigation stack.
- Prefer repository boundaries between UI/domain/data.
- Make field-critical flows offline-first.

## Inspect first

Check:
- `settings.gradle(.kts)` and root/app build files;
- Gradle wrapper version;
- Android Gradle Plugin and Kotlin versions;
- compileSdk/minSdk/targetSdk;
- product flavors/build types;
- manifest permissions and exported components;
- signing configuration without printing secrets;
- versionCode/versionName;
- connected devices via `adb devices`.

## Build loop

Use the wrapper from the repo:

```bash
./gradlew tasks
./gradlew assembleDebug
```

Run the narrowest relevant test/lint tasks before a release build. Do not globally upgrade Gradle/AGP/Kotlin to fix a local compile error unless compatibility evidence requires it.

## Compose quality

- Hoist state appropriately.
- Keep composables small and previewable when practical.
- Make lifecycle collection safe.
- Provide loading/empty/error/offline states.
- Respect system insets, keyboard, screen sizes and accessibility.
- Avoid excessive recomposition and unstable state containers.

## APK/AAB

Debug APK is for internal/device testing. Use AAB for Play release unless the distribution path specifically requires APK. Keep release signing out of source control.
