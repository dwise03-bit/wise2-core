# WISE Field Tech — Android Release Build

The native app lives at `apps/fieldtech-android` and uses Kotlin/Compose. It is not a Capacitor app.

## Required release inputs

```bash
export WISE2_FIELD_API_BASE_URL="https://wise2.net/api/"
export WISE2_GOOGLE_WEB_CLIENT_ID="<Google OAuth web client ID>"
export WISE2_RELEASE_KEYSTORE="/absolute/path/to/wise-field-release.jks"
export WISE2_RELEASE_STORE_PASSWORD="<store password>"
export WISE2_RELEASE_KEY_ALIAS="wise-field"
export WISE2_RELEASE_KEY_PASSWORD="<key password>"
```

The API base URL must end in `/`. Signing material belongs outside source control.

## Build and verify

```bash
cd apps/fieldtech-android
JAVA_HOME=/path/to/jdk17 ./gradlew testDebugUnitTest assembleRelease bundleRelease
```

Outputs:

- APK: `app/build/outputs/apk/release/app-release.apk`
- Play bundle: `app/build/outputs/bundle/release/app-release.aab`

Verify the APK before distribution:

```bash
apksigner verify --verbose app/build/outputs/apk/release/app-release.apk
adb install -r app/build/outputs/apk/release/app-release.apk
```

## App identity

- Application ID: `com.wise2.fieldtech`
- Current version: `1.0.1` (`versionCode 2`)
- Minimum Android: API 26
- Target Android: API 36

## External release gates

- `https://wise2.net/api/` must serve the `/v1/auth`, `/v1/fieldtech`, and `/v1/hermes` routes.
- Google Cloud must authorize the Android package/SHA certificate and the web client ID used for ID tokens.
- The release AAB must use the same long-lived signing identity for every update.
