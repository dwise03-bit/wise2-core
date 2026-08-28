# WISE2 Command Center iOS

Native SwiftUI command center for Daniel Wise's WISE2 business operating system.

## Current Scope

- Product: WISE2 Command Center
- Scheme: `WISE2`
- Bundle identifier: `com.dwise954.wise2.app`
- Deployment target: iOS 16.0+
- Signing: automatic, team `9N5L62DHKJ`
- API default: `https://wise2.net/api/v1`

The app is native-first. Home, AI, Work, Systems, and More are SwiftUI screens with business scope visible throughout. Critical actions are represented as approval previews and must be enforced by backend capabilities before execution.

## Verification

Build:

```bash
xcodebuild build -scheme WISE2 -destination 'platform=iOS Simulator,name=iPhone 17 Pro Max'
```

Tests are currently blocked because the `WISE2` scheme has no configured test action or test target.
