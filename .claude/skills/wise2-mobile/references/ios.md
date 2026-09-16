# iOS / iPadOS

## Defaults

- Swift + SwiftUI for new native UI.
- Use async/await and structured concurrency.
- Keep state ownership explicit; use the project's current observation pattern.
- Respect existing deployment target and package manager unless a change is required.
- Keep entitlement, capability, background-mode and privacy-manifest changes deliberate and reviewable.

## Inspect first

Check:
- `.xcodeproj` / `.xcworkspace` and schemes;
- `project.pbxproj` only when necessary;
- package dependencies;
- bundle identifier and deployment target;
- signing team/profile mode;
- Info.plist/privacy usage strings;
- entitlements;
- build configurations and xcconfig files;
- current simulator/device destinations.

## Build loop

Prefer an explicit scheme and destination. Example shape:

```bash
xcodebuild -workspace App.xcworkspace -scheme App -configuration Debug -destination 'platform=iOS Simulator,name=iPhone 16 Pro' build
```

Adapt to the actual project. Do not invent workspace/scheme/device names.

For physical-device work, verify the device is visible to Xcode tooling, then build/install using the existing project workflow. Capture the exact failing build step and error before changing signing or dependencies.

## SwiftUI quality

- Build reusable components from the existing design system.
- Support Dynamic Type where practical.
- Add accessibility labels/traits for interactive elements.
- Avoid giant view bodies; extract stable components.
- Avoid unnecessary global singletons.
- Keep navigation and modal state deterministic.
- Handle loading, empty, error and offline states.

## Signing

Do not rewrite signing settings blindly. Determine whether the repo uses automatic signing, manual profiles, Fastlane Match, CI-managed credentials, or another established method before changing anything.
