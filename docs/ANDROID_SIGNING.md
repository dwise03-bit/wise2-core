# WISE² HVAC Field Agent — Android Release Signing Guide

**Version**: 1.0  
**App**: WISE² HVAC Field Agent  
**Package ID**: `com.wise2.fieldtech`  

---

## Overview

This guide explains how to create, manage, and use the Android release signing key for building production APKs and Android App Bundles (AABs) for Google Play Store.

---

## Key Concepts

### Upload Key vs. App-Signing Key

| Key Type | Purpose | Management |
|----------|---------|------------|
| **Upload Key** | Used to sign APK/AAB before uploading to Play Store | You generate & manage |
| **App-Signing Key** | Google Play generates this; signs the final APK delivered to users | Google manages (cannot access) |

This separation prevents accidental key exposure while maintaining secure app updates.

---

## Setup: Create the Release Keystore

### Prerequisites

- Java/OpenJDK installed
- `keytool` available in PATH

### Step 1: Verify Java Installation

```bash
java -version
keytool -version
```

Expected output: OpenJDK 17+, keytool version 17+

### Step 2: Generate Keystore

Run this **once**, save the credentials securely:

```bash
keytool -genkeypair \
  -alias wise2-fieldtech-release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -keystore ~/.wise2/fieldtech-release.jks \
  -storepass "YOUR_STORE_PASSWORD" \
  -keypass "YOUR_KEY_PASSWORD" \
  -dname "CN=WISE2 Field Tech,O=WISE2 Inc.,L=Engineering,C=US"
```

**Interactive prompt** (if not using `-dname`):

```
Enter keystore password: [YOUR_STORE_PASSWORD]
Re-enter new password: [YOUR_STORE_PASSWORD]
What is your first and last name? [WISE2 Field Tech]
What is the name of your organizational unit? [Engineering]
What is the name of your organization? [WISE2 Inc.]
What is the name of your city or locality? [Engineering]
What is the name of your state or province? [State]
What is the two-letter country code for this unit? [US]
Is this correct? [yes]
Enter key password for <wise2-fieldtech-release>: [YOUR_KEY_PASSWORD]
```

**Key Details**:
- Alias: `wise2-fieldtech-release`
- Algorithm: RSA 2048-bit
- Validity: 10,000 days (~27 years)
- Location: `~/.wise2/fieldtech-release.jks`

### Step 3: Verify Keystore

```bash
keytool -list -v -keystore ~/.wise2/fieldtech-release.jks -storepass "YOUR_STORE_PASSWORD"
```

You should see:
- **Alias name**: wise2-fieldtech-release
- **Owner**: CN=WISE2 Field Tech,O=WISE2 Inc.,...
- **Valid from**: [creation date]
- **Valid until**: [10000 days in future]
- **Signature algorithm**: SHA256withRSA

---

## Configuration: Environment Variables

The Gradle build system reads signing credentials from environment variables. **Never hardcode these in files.**

### Set Environment Variables (Temporarily, for One Build)

```bash
export WISE2_RELEASE_KEYSTORE="$HOME/.wise2/fieldtech-release.jks"
export WISE2_RELEASE_STORE_PASSWORD="YOUR_STORE_PASSWORD"
export WISE2_RELEASE_KEY_ALIAS="wise2-fieldtech-release"
export WISE2_RELEASE_KEY_PASSWORD="YOUR_KEY_PASSWORD"
```

### Permanent Setup (Recommended)

Add to your shell rc file (`~/.zshrc`, `~/.bashrc`, or similar):

```bash
# WISE² Field Tech Signing Configuration (KEEP PRIVATE)
export WISE2_RELEASE_KEYSTORE="$HOME/.wise2/fieldtech-release.jks"
export WISE2_RELEASE_STORE_PASSWORD="YOUR_STORE_PASSWORD"
export WISE2_RELEASE_KEY_ALIAS="wise2-fieldtech-release"
export WISE2_RELEASE_KEY_PASSWORD="YOUR_KEY_PASSWORD"
```

Then reload:

```bash
source ~/.zshrc  # or source ~/.bashrc
```

---

## Building the Release APK

### Prerequisites

1. Keystore created (see above)
2. Environment variables set
3. Gradle wrapper available in `apps/fieldtech-android/`

### Build Command

```bash
cd apps/fieldtech-android && \
gradle assembleRelease -x test
```

**Output**:
- Debug APK: `app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `app/build/outputs/apk/release/app-release.apk`

---

## Building the Release AAB (for Google Play Store)

### Prerequisites

Same as above.

### Build Command

```bash
cd apps/fieldtech-android && \
gradle bundleRelease -x test
```

**Output**:
- **Release AAB**: `app/build/outputs/bundle/release/app-release.aab`

This AAB is what you upload to Google Play Console.

---

## Verifying the Signed APK/AAB

### Check APK Signing

```bash
# Using jarsigner (comes with Java)
jarsigner -verify -verbose -certs app/build/outputs/apk/release/app-release.apk
```

Expected output includes:
```
...
[certificate is valid from 2026-08-23 to 2053-10-28]
jar verified.
```

### Check APK Manifest

```bash
# Using aapt (from Android SDK)
aapt dump badging app/build/outputs/apk/release/app-release.apk | grep -E "package|version|target"
```

Expected:
```
package: name='com.wise2.fieldtech' versionCode='1' versionName='1.0.0'
sdkVersion:'26'
targetSdkVersion:'36'
```

---

## Keystore Backup & Security

### Backup Location

**CRITICAL**: Backup your keystore immediately.

```bash
# Create backup
cp ~/.wise2/fieldtech-release.jks ~/secure-backups/fieldtech-release-backup.jks

# Store passwords securely
# Option 1: Encrypted note or password manager
# Option 2: Separate USB drive (physical backup)
# Option 3: Encrypted file with strong passphrase
```

### Danger: Do NOT Lose the Keystore

If you lose the keystore and its passwords:
- **You cannot update the app on Google Play**
- **You must publish as a new app**
- Old users cannot upgrade to new app ID
- **All ratings, reviews, install count reset to zero**

**Backup NOW.**

### Danger: Do NOT Commit to Git

Ensure `.gitignore` includes:

```
# Signing keys
*.jks
*.keystore
.keystore

# Environment files with secrets
.env.local
.env.*.local
```

Verify:

```bash
git status
# Should NOT show fieldtech-release.jks
```

---

## Troubleshooting

### Error: "Keystore was tampered with, or password was incorrect"

**Solution**: Verify keystore path and password.

```bash
keytool -list -keystore ~/.wise2/fieldtech-release.jks -storepass "YOUR_PASSWORD"
```

### Error: "Keystore doesn't contain the key alias wise2-fieldtech-release"

**Solution**: Verify the alias matches.

```bash
keytool -list -keystore ~/.wise2/fieldtech-release.jks -storepass "YOUR_PASSWORD" -alias "wise2-fieldtech-release"
```

### Error: "Gradle build fails with 'keytool: No such file or directory'"

**Solution**: Add Java to PATH.

```bash
export PATH="/usr/libexec/java_home -v 17/bin:$PATH"
```

Or add to shell rc:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH="$JAVA_HOME/bin:$PATH"
```

### Error: "No such file or directory: ~/.wise2/fieldtech-release.jks"

**Solution**: Keystore not created yet. Run Step 2 above.

---

## Automated Build Scripts

### `scripts/android-release.sh`

Simple wrapper for release builds:

```bash
#!/bin/bash
set -e

cd "$(dirname "$0")/../apps/fieldtech-android"

echo "Building WISE² HVAC Field Agent v1.0.0 (release)"

if [ -z "$WISE2_RELEASE_KEYSTORE" ]; then
  echo "ERROR: WISE2_RELEASE_KEYSTORE not set"
  exit 1
fi

gradle bundleRelease -x test

AAB_PATH="app/build/outputs/bundle/release/app-release.aab"

if [ ! -f "$AAB_PATH" ]; then
  echo "ERROR: AAB not found at $AAB_PATH"
  exit 1
fi

echo ""
echo "✅ Release AAB built successfully"
echo "📦 Location: $AAB_PATH"
echo ""
echo "To upload to Google Play Console:"
echo "  1. Go to https://play.google.com/apps"
echo "  2. Select 'WISE² HVAC Field Agent'"
echo "  3. Go to Release → Production"
echo "  4. Upload the AAB above"
```

---

## Updating Version Numbers

When releasing a new version:

**In `app/build.gradle.kts`**:

```kotlin
defaultConfig {
    versionCode = 2          // Increment
    versionName = "1.0.1"    // Update
    ...
}
```

**Rules**:
- `versionCode` must always increase (1, 2, 3, ...)
- `versionName` is for humans (1.0.0, 1.0.1, 1.1.0, 2.0.0)
- Google Play compares `versionCode` for updates

---

## Release Workflow Checklist

- [ ] Keystore created and backed up
- [ ] Environment variables configured
- [ ] `versionCode` and `versionName` updated
- [ ] Code committed to git
- [ ] Tests passing
- [ ] `gradle bundleRelease` succeeds
- [ ] AAB verified with `aapt`
- [ ] Upload to Google Play Console
- [ ] Internal testing → Closed testing → Production
- [ ] Monitor crash reports

---

## Google Play App Signing

After uploading your signed AAB:

1. **Google Play generates a new key** (App-Signing Key)
2. Google uses this key to sign the final APKs sent to users
3. You retain the **Upload Key** (what you just created)
4. Users receive APKs signed by Google's key

This is secure because your Upload Key never touches user devices.

---

## Support

If you lose credentials or need help:

1. **Check `.wise2/` directory**: Is the keystore still there?
2. **Check environment variables**: `echo $WISE2_RELEASE_KEYSTORE`
3. **Retrieve from backup**: Do you have a backup copy?
4. **Last resort**: Contact WISE2 team with backup credentials

**Do not ask users to update their app manually.**

---

## Next Steps

1. ✅ Create keystore (you did this above)
2. ✅ Set environment variables
3. ✅ Build release AAB: `gradle bundleRelease`
4. ➡️ Upload to Google Play Console (next guide)

