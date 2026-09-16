# Signing and Release

## Release sequence

`clean source state -> version -> tests -> release build -> sign -> artifact verify -> install/smoke test -> publish/distribute -> post-release verify`

## iOS

Before release verify:
- bundle identifier;
- marketing/build version;
- signing team and profile method;
- entitlements/capabilities;
- privacy strings/manifests;
- archive succeeds;
- exported/distributed artifact corresponds to the intended commit.

Use existing App Store Connect/Fastlane/Xcode workflows rather than inventing a second release pipeline.

## Android

Before release verify:
- applicationId;
- versionCode/versionName;
- target SDK requirements;
- release signing source is secure;
- R8/proguard behavior if enabled;
- release AAB/APK builds;
- artifact can be installed or validated as appropriate.

## wise2.net direct distribution

For internal/customer Android APK distribution:
- publish only a verified artifact;
- show version/build/date;
- preserve checksum when practical;
- ensure HTTPS;
- avoid exposing signing keys or build secrets;
- retain rollback artifact or previous known-good version.

Do not present iOS direct-download workflows as equivalent to Android APK hosting; iOS distribution must follow Apple's permitted provisioning/distribution path.
