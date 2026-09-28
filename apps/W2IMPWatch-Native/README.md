# W² IMP Watch — Native watchOS App

A native SwiftUI watchOS application featuring the W² IMP character with six interactive visual states.

## Project Structure

```
W2IMPWatch-Native/
├── W2IMPWatchApp.swift         # Main app entry point
├── ContentView.swift            # UI and interaction logic
├── WatchState.swift             # State management (DisplayState enum + WatchViewModel)
├── Assets.xcassets/             # Image assets (to be added)
├── Info.plist                   # App configuration
├── source-assets/               # Reference materials (not compiled)
│   ├── assets/                  # 6 state PNGs (941 × 1672 px)
│   │   ├── 02_idle_state.png
│   │   ├── 03_wake_state.png
│   │   ├── 04_charging_state.png
│   │   ├── 05_notification_state.png
│   │   ├── 06_night_mode.png
│   │   └── 07_always_on_mode.png
│   └── boards/                  # Reference visuals (motion + concept)
└── BUILD_INSTRUCTIONS.md        # Xcode setup guide
```

## Features

### Core Behavior
- **Six Visual States**: Idle, Wake, Charging, Notification, Night, Always On
- **Tap Interaction**: Tap the watch face → Wake state → Auto-return to Idle after 2.5 seconds
- **Live Time/Date**: Shows current time (top) and date (below) in white text
- **Accessibility**: Respects system Reduce Motion setting (disables animations when enabled)
- **Always-On Mode**: Static, no animations, low-impact OLED treatment

### Development Features
- **State Picker** (DEBUG builds only): Long-press watch face to open state selector
- **Hot Reload**: Full SwiftUI support with live preview
- **Safe Zones**: Text positioned to avoid eyes, face, pedestal, and W² mark

## Interaction Model

1. **Launch**: App starts in `idle` state
2. **Tap Wake**: User taps screen → transitions to `wake` state with animation
3. **Auto-Return**: After 2.5 seconds, automatically returns to `idle`
4. **Manual State** (DEBUG): Long-press to access state picker for testing all six states

## Building in Xcode

### Prerequisites
- macOS with Xcode 15.3+
- Paired iPhone/Apple Watch or Apple Watch simulator
- CocoaPods or Swift Package Manager (if adding dependencies)

### Manual Setup Steps

1. **Create Xcode Project**
   - Open Xcode → Create New Project
   - Choose watchOS → App
   - Product Name: `W2IMPWatch`
   - Interface: SwiftUI
   - Uncheck "Include Notification Scene" for now

2. **Replace Source Files**
   ```bash
   # Copy Swift files to project
   cp W2IMPWatchApp.swift <XcodeProject>/W2IMPWatchApp.swift
   cp ContentView.swift <XcodeProject>/ContentView.swift
   cp WatchState.swift <XcodeProject>/WatchState.swift
   ```

3. **Add Assets**
   - Open `Assets.xcassets` in Xcode
   - Drag-and-drop images from `source-assets/assets/`:
     - `02_idle_state.png` → Name: `02_idle_state`
     - `03_wake_state.png` → Name: `03_wake_state`
     - `04_charging_state.png` → Name: `04_charging_state`
     - `05_notification_state.png` → Name: `05_notification_state`
     - `06_night_mode.png` → Name: `06_night_mode`
     - `07_always_on_mode.png` → Name: `07_always_on_mode`
   - For each image:
     - Set Scales to "Single Scale"
     - Set Devices to "Universal" or specific watch sizes
     - Skip App Icon for v1

4. **Configure Build Settings**
   - Target: W2IMPWatch
   - Minimum Deployment: watchOS 9.0+
   - Swift Language: Swift 5.9+
   - Team ID: (use your Apple Team)
   - Bundle Identifier: `com.wise2.W2IMPWatch`

5. **Enable Developer Mode (Physical Watch)**
   - On Apple Watch: Settings → Privacy & Security → Developer Mode → Enable
   - Confirm on watch when prompted
   - Restart watch if needed

### Run on Simulator

```bash
# From Xcode:
# 1. Select target: W2IMPWatch (the watch target, not iPhone companion)
# 2. Select destination: "Apple Watch Series 9 (45mm)" or "Apple Watch Ultra (49mm)"
# 3. Click Run (⌘R)
```

### Run on Physical Watch

1. **Pair Watch to iPhone**
   - iPhone → Settings → Bluetooth → Pair with Apple Watch
   - Complete setup

2. **Select Destination in Xcode**
   - Xcode → Top menu bar → Select destination
   - Choose your paired Apple Watch

3. **Run Build**
   - Xcode → Product → Run (⌘R)
   - First run may take 30-60 seconds to install
   - Watch will display app after installation

4. **Launch App on Watch**
   - Swipe up on watch Dock
   - Tap "W2IMPWatch" icon
   - App launches full-screen

## Testing Checklist

### Functional Tests
- [ ] App launches on 41mm and 45mm watches
- [ ] Time updates every second
- [ ] Date displays correctly (e.g., "Sep 27")
- [ ] Tap transitions to Wake state
- [ ] Wake state returns to Idle after 2.5 seconds
- [ ] Long-press opens state picker (DEBUG only)
- [ ] All 6 states display correctly
- [ ] Always-On mode shows no animations

### Visual Tests
- [ ] No cropped IMP head on 41mm watch
- [ ] No cropped horns, tail, or W² mark on any size
- [ ] Pedestal fully visible
- [ ] Time/date text readable against background
- [ ] Text does not overlap IMP's face, eyes, or chest

### Accessibility Tests
- [ ] VoiceOver describes states correctly
- [ ] Reduce Motion disabled: animations play smoothly
- [ ] Reduce Motion enabled: state change is instant (no animation)
- [ ] Tap gesture is responsive

### Battery/Performance
- [ ] App launches in < 3 seconds
- [ ] No memory leaks (check Xcode Instruments)
- [ ] Idle state draws minimal power
- [ ] Always-On mode does not drain battery excessively

## Acceptance Criteria (v1)

✅ Native watchOS app builds in Xcode  
✅ Runs on Apple Watch simulator (any size)  
✅ Runs on physical Apple Watch  
✅ Time and date visible in top safe zone  
✅ Tap → Wake sequence works, returns to Idle after 2.5 sec  
✅ All 6 states visible and correct  
✅ Always-On remains static with no animation  
✅ No cropped character or pedestal on 41mm and 45mm  
✅ Respects Reduce Motion accessibility setting  

## Known Limitations (v1)

- No iPhone companion app (watch-only)
- No WidgetKit complication (separate future task)
- No persistent state storage
- No health/fitness integration
- Debug state picker removed in Release builds

## Future Enhancements

- **Smart Stack Widget**: Complication to surface Watch app from system face
- **Haptic Feedback**: Tap haptics on wake
- **Battery Indicator**: Display charging state based on device battery
- **Custom Complications**: Show time in various formats
- **Animations**: Optional micro-animations on state transitions (if approved)

## Troubleshooting

### App Won't Build
- Ensure Xcode 15.3+ is installed
- Check iOS Deployment Target matches watchOS target
- Verify all images are in Assets.xcassets

### App Won't Install on Watch
- Ensure watch is paired and Developer Mode is enabled
- Restart watch: Press and hold Digital Crown + Side Button
- Re-pair watch and re-enable Developer Mode

### Images Appear Cropped or Stretched
- Verify image dimensions are 941 × 1672 px
- In Assets.xcassets, set Scales to "Single Scale"
- Check content mode in code (currently: .scaledToFill)

### Time/Date Not Updating
- Verify timer is active: check for `onReceive(timer)`
- Ensure `@State private var currentTime = Date()` is initialized
- Check system date/time is correct on watch

## References

- [watchOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/watchos)
- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui)
- [watchOS App Development](https://developer.apple.com/watchos/)
- Original Handoff: See `source-assets/` for Figma boards and reference images

## Build & Run (Quick Start)

For the fastest setup on a Mac with Xcode already installed:

```bash
# 1. Open the workspace or project in Xcode
open apps/W2IMPWatch-Native

# 2. In Xcode:
#    - Select W2IMPWatch target (not companion)
#    - Select Apple Watch simulator or paired device
#    - Press ⌘R to build and run

# 3. On first physical watch install:
#    - Settings → Privacy & Security → Developer Mode → On
#    - Confirm on watch, then restart
#    - Re-run ⌘R from Xcode
```

## Support

For questions or issues, refer to:
- Apple Developer Forums: https://developer.apple.com/forums/
- SwiftUI Discussions: Search Stack Overflow for [swiftui] [watchos]
- Project: WISE² Genesis (dwise03@gmail.com)
