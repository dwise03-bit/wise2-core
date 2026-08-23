# WISE² HVAC Field Agent — Build & Release Guide

---

## Quick Start

### Build Debug APK (Testing)

```bash
cd apps/fieldtech-android
gradle assembleDebug -x test
# Output: app/build/outputs/apk/debug/app-debug.apk
```

### Build Release AAB (Google Play)

```bash
cd apps/fieldtech-android
export WISE2_RELEASE_KEYSTORE="$HOME/.wise2/fieldtech-release.jks"
export WISE2_RELEASE_STORE_PASSWORD="your_password"
export WISE2_RELEASE_KEY_ALIAS="wise2-fieldtech-release"
export WISE2_RELEASE_KEY_PASSWORD="your_password"

gradle bundleRelease -x test
# Output: app/build/outputs/bundle/release/app-release.aab
```

---

## Setup (First Time Only)

### 1. Install Java/OpenJDK

```bash
brew install openjdk@17
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
```

### 2. Create Release Keystore

See `docs/ANDROID_SIGNING.md` for full instructions. Summary:

```bash
keytool -genkeypair \
  -alias wise2-fieldtech-release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -keystore ~/.wise2/fieldtech-release.jks \
  -storepass "YOUR_PASSWORD" \
  -keypass "YOUR_PASSWORD" \
  -dname "CN=WISE2 Field Tech,O=WISE2 Inc.,C=US"
```

### 3. Configure Environment

Add to `~/.zshrc` or `~/.bashrc`:

```bash
export WISE2_RELEASE_KEYSTORE="$HOME/.wise2/fieldtech-release.jks"
export WISE2_RELEASE_STORE_PASSWORD="YOUR_PASSWORD"
export WISE2_RELEASE_KEY_ALIAS="wise2-fieldtech-release"
export WISE2_RELEASE_KEY_PASSWORD="YOUR_PASSWORD"
```

---

## Build Verification

### Check Build Output

```bash
# List outputs
ls -lah app/build/outputs/apk/debug/
ls -lah app/build/outputs/bundle/release/
```

### Verify Release APK Signing

```bash
jarsigner -verify -verbose -certs app/build/outputs/apk/release/app-release.apk | grep -A5 "jar verified"
```

### Inspect APK Manifest

```bash
# Using aapt from Android SDK
aapt dump badging app/build/outputs/apk/release/app-release.apk | grep -E "package|version|target"
```

---

## Version Management

### Update Version Code & Name

Edit `app/build.gradle.kts`:

```kotlin
defaultConfig {
    versionCode = 2          // Increment for each release
    versionName = "1.0.1"    // Semantic versioning
    ...
}
```

**Rules**:
- `versionCode` must always increase (Google Play compares these)
- `versionName` is for humans (1.0.0, 1.0.1, 1.1.0, etc.)

### Release Version Scheme

- **1.0.0**: Initial release (current)
- **1.0.1**: Bug fixes only
- **1.1.0**: New features
- **2.0.0**: Major refactor or significant changes

---

## CI/CD Integration (Optional)

### GitHub Actions Example

Create `.github/workflows/android-release.yml`:

```yaml
name: Android Release Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      
      - name: Build Release AAB
        working-directory: apps/fieldtech-android
        run: |
          gradle bundleRelease -x test
        env:
          WISE2_RELEASE_KEYSTORE: ${{ secrets.RELEASE_KEYSTORE_PATH }}
          WISE2_RELEASE_STORE_PASSWORD: ${{ secrets.RELEASE_STORE_PASSWORD }}
          WISE2_RELEASE_KEY_ALIAS: ${{ secrets.RELEASE_KEY_ALIAS }}
          WISE2_RELEASE_KEY_PASSWORD: ${{ secrets.RELEASE_KEY_PASSWORD }}
      
      - name: Upload to Google Play
        # Use google-play-release-action or manual upload
        run: |
          # ... upload app/build/outputs/bundle/release/app-release.aab
```

**Note**: Secrets must be configured in GitHub repository settings.

---

## Testing Checklist

Before releasing:

- [ ] Unit tests pass: `gradle test`
- [ ] Lint passes: `gradle lint`
- [ ] Builds without warnings: `gradle clean build`
- [ ] APK installs on device: `adb install -r app-debug.apk`
- [ ] App launches and basic navigation works
- [ ] Auth (login/logout) works
- [ ] Job list loads
- [ ] Diagnostics workflow works
- [ ] IMP chat works
- [ ] Photos can be captured
- [ ] Reports generate
- [ ] Sync works (online/offline transitions)
- [ ] No crashes in logcat: `adb logcat | grep FATAL`

---

## Release to Google Play

### Step 1: Upload AAB

1. Go to Google Play Console
2. Select WISE² HVAC Field Agent
3. Release → Production
4. Upload `app-release.aab`

### Step 2: Review & Test

1. Fill in release notes
2. Submit for review
3. Wait for review (typically 24-48 hours)

### Step 3: Roll Out

1. Internal testing (1 day)
2. Closed testing (optional, if needed)
3. Production (full rollout or staged)

---

## Troubleshooting

### Build Fails: "Cannot find symbol"

Solution: Run `gradle clean` then rebuild.

### Build Fails: "Keystore password incorrect"

Solution: Check environment variables:
```bash
echo $WISE2_RELEASE_KEYSTORE
echo $WISE2_RELEASE_STORE_PASSWORD
```

### Build Fails: "No such file: ~/.wise2/fieldtech-release.jks"

Solution: Create keystore (see Setup section above).

### APK Won't Install: "INSTALL_FAILED_UPDATE_INCOMPATIBLE"

Solution: Increment `versionCode` in `build.gradle.kts`.

---

## Build Optimization

### Reduce APK Size

Current debug APK: ~20 MB  
Current release AAB: ~12 MB (after Play Store optimization)

To further reduce:
- Enable R8 minification (already enabled for release)
- Remove unused dependencies
- Compress resources

### Build Speed

Current debug build: ~60 seconds

To speed up:
- Use Gradle daemon: Already enabled
- Parallel builds: `gradle build --parallel`
- Incremental compilation: Automatic

---

## Gradle Tasks Reference

```bash
# Clean
gradle clean

# Build tasks
gradle assembleDebug          # Debug APK
gradle assembleRelease        # Release APK
gradle bundleDebug            # Debug AAB
gradle bundleRelease          # Release AAB

# Testing
gradle test                   # Unit tests
gradle connectedAndroidTest   # Instrumentation tests (requires device/emulator)

# Linting
gradle lint                   # Android lint
gradle ktlint               # Kotlin lint (if added)

# Inspection
gradle dependencies           # Show dependency tree
gradle tasks                 # List all tasks
```

---

## App Bundle Structure

The release AAB contains:

```
app-release.aab
├── base/
│   ├── dex/
│   ├── res/
│   ├── lib/
│   ├── manifest/
│   └── assets/
├── ...other modules (if added in future)
└── BundleConfig.pb
```

Google Play uses this to generate optimized APKs per device.

---

## Next Steps

1. ✅ Setup Java/Gradle
2. ✅ Create release keystore
3. ✅ Run `gradle bundleRelease`
4. ➡️ Upload to Google Play Console
5. ➡️ Fill store listing (see `play-store/STORE_LISTING.md`)
6. ➡️ Submit for review

