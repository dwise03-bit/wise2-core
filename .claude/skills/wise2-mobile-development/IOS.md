# WISE2 iOS / SwiftUI

Inspect `.xcodeproj`, schemes, bundle ID, entitlements, deployment target, signing settings, tests, and existing build instructions before edits.

## Verification
```bash
xcodebuild -version
xcrun simctl list devices available
xcodebuild -project <APP>.xcodeproj -scheme <SCHEME> -showdestinations
xcodebuild -project <APP>.xcodeproj -scheme <SCHEME> -destination 'platform=iOS Simulator,name=<DEVICE>' build
xcodebuild -project <APP>.xcodeproj -scheme <SCHEME> -destination 'platform=iOS Simulator,name=<DEVICE>' test
```

Launch the built app in Simulator, inspect runtime logs, and exercise the changed flow. For BLE, camera, microphone, GPS, background modes, or accessory integration, install on the connected iPhone and verify the real permission/device path.

Before distribution verify Release configuration, signing, entitlements, privacy usage descriptions, app icons, version/build number, archive generation, and App Store preflight. Never change signing identities or bundle IDs merely to make a local build pass.
