# W² IMP Watch — Step-by-Step Build Guide

## Goal

Convert the source files and assets into a working watchOS app in Xcode, tested on simulator and/or physical Apple Watch.

## Prerequisites

- **Mac with Apple Silicon or Intel** (M1+, Intel Core i5+)
- **Xcode 15.3+** installed from App Store
- **13 GB+ free disk space** (for Xcode + simulator data)
- **For physical device testing**: iPhone paired with Apple Watch

## Step 1: Create the Xcode Project (5 min)

### Option A: Using Xcode GUI (Recommended for First Build)

1. **Open Xcode**
   ```
   /Applications/Xcode.app
   ```

2. **File → New → Project** (or ⌘⇧N)

3. **Select watchOS Template**
   - Platform: watchOS
   - Template: App
   - Click Next

4. **Configure Project**
   - Product Name: `W2IMPWatch`
   - Team: (leave blank or select your team if signing)
   - Organization Identifier: `com.wise2`
   - Bundle Identifier: `com.wise2.W2IMPWatch`
   - Interface: SwiftUI
   - Language: Swift
   - Uncheck: "Include Notification Scene" (for v1)
   - Uncheck: "Include Complications" (separate task)
   - Click Next

5. **Save Location**
   - Choose: `/Users/danielwise/Projects/wise2-core/apps/`
   - Create folder: YES
   - Click Create

Xcode will generate a new project structure.

### Option B: Using Command Line

```bash
# (Advanced) Create via xcodebuild
# This is for reference; GUI method is recommended

# After GUI setup, you'll have:
# apps/W2IMPWatch/
#   W2IMPWatch.xcodeproj/
#   W2IMPWatch/
#   W2IMPWatch.xcodeproj/project.pbxproj
```

## Step 2: Replace Source Files (5 min)

1. **In Xcode, left sidebar:**
   - Expand W2IMPWatch folder
   - Select `W2IMPWatchApp.swift`

2. **Replace Content**
   ```
   Open: apps/W2IMPWatch-Native/W2IMPWatchApp.swift (reference version)
   Paste entire contents into Xcode editor
   ⌘S to save
   ```

3. **Repeat for Other Files**
   ```
   ContentView.swift  ← Replace completely
   WatchState.swift   ← Add new file (File → New → File)
   ```

### To Add WatchState.swift

- In Xcode: File → New → File
- Choose: Swift File
- Name: `WatchState`
- Target: W2IMPWatch
- Paste content from reference version
- Save

## Step 3: Add Image Assets (10 min)

1. **In Xcode, left sidebar:**
   - Select `Assets.xcassets`

2. **Import Images**
   - In Finder: open `apps/W2IMPWatch-Native/source-assets/assets/`
   - Drag these PNG files into Xcode Assets pane:
     ```
     02_idle_state.png       → Create ImageSet named "02_idle_state"
     03_wake_state.png       → "03_wake_state"
     04_charging_state.png   → "04_charging_state"
     05_notification_state.png → "05_notification_state"
     06_night_mode.png       → "06_night_mode"
     07_always_on_mode.png   → "07_always_on_mode"
     ```

3. **Configure Each ImageSet**
   - Click the image in Assets
   - Inspector (right panel):
     - Scales: "Single Scale" (not 1x, 2x, 3x)
     - Devices: "Universal" or "Apple Watch"
     - Idiom: "Watch"
   - Repeat for each of the 6 images

### Importing Multiple Images at Once

Drag all 6 PNGs at once into the Assets folder in Xcode:

```
Finder (source-assets/assets/)
  ↓ (drag all 6 PNGs)
Xcode Assets.xcassets
  ↓ (Xcode auto-creates ImageSets)
Done
```

## Step 4: Configure Build Settings (5 min)

1. **Select Project in Sidebar**
   - `W2IMPWatch` (the blue project icon)

2. **Select Target**
   - `W2IMPWatch` (under TARGETS)

3. **Go to Build Settings Tab**

4. **Set These Values**
   ```
   Minimum Deployment Target: watchOS 9.0
   Swift Language Version: Swift 5.9
   Product Bundle Identifier: com.wise2.W2IMPWatch
   ```

   (Search "Minimum Deploy" in filter box to find it quickly)

5. **Signing (if needed for physical device)**
   - Go to Signing & Capabilities tab
   - Team: Your Apple Team (or leave blank for simulator-only)
   - Scheme: Automatically manage signing (checkmark)

## Step 5: Run on Simulator (3 min)

1. **Select Simulator Destination**
   - Top of Xcode window, next to Run button
   - Click: "W2IMPWatch" → "Apple Watch 9 (45mm)" or similar
   - Example: `Apple Watch Series 9 (45mm) (17.2)`

2. **Build & Run**
   - Press ⌘R or Product → Run
   - Xcode builds (first build ~2-3 min)
   - Simulator launches watch app

3. **Test on Simulator**
   - App displays with current time/date
   - In Simulator menu: Device → Tap (or click screen)
   - Watch should transition to Wake state
   - After 2.5 sec, returns to Idle
   - Long-press (or right-click) to open state picker

## Step 6: Run on Physical Apple Watch (5 min)

### Enable Developer Mode on Watch

**Important:** This is required for v1 testing.

1. **On the Apple Watch**
   ```
   Settings (gear icon)
   → Privacy & Security
   → Developer Mode
   → Toggle ON
   ```

2. **Confirm on Watch**
   - Swipe down from top
   - Tap "Enable"

3. **Restart Watch** (optional but recommended)
   - Press and hold Digital Crown + Side Button
   - Hold until Apple logo appears
   - Release

### Install App in Xcode

1. **Select Physical Watch**
   - In Xcode, destination dropdown
   - Choose: `<Your Name>'s Apple Watch (watchOS 11.0)` or similar
   - (Must be paired to iPhone via Bluetooth)

2. **Build & Run**
   - ⌘R
   - First install: 30-60 seconds
   - Watch displays "Installing..." animation
   - App installs when complete

3. **Launch App on Watch**
   - Swipe up from bottom (Dock)
   - Look for "W2IMPWatch" icon (likely at bottom)
   - Tap to open
   - Full-screen watch app launches

### Troubleshooting Physical Device

| Issue | Fix |
|-------|-----|
| "Development cannot proceed..." | Enable Developer Mode (step above) and restart watch |
| App won't install (stuck installing) | Restart watch; clear Xcode build folder (⇧⌘K); retry |
| "No such module..." build error | Clean build folder: ⇧⌘K, then ⌘R |
| Watch disconnected / offline | Restart iPhone and watch; re-pair in iPhone Settings → Bluetooth |

## Step 7: Visual Testing (10 min)

### On Simulator or Device

1. **Launch the app**
2. **Verify Each State**
   ```
   Idle (default)      → Time and date visible, IMP at rest
   Wake (tap screen)   → IMP eyes glow, transition smooth
   Charging            → Special glow/aura around IMP
   Notification        → Alert visual treatment
   Night               → Dim, restful appearance
   Always On           → Dim, no animation, static display
   ```

3. **Check Safe Zones**
   ```
   ✓ Time/date in top 8% of screen
   ✓ State label in bottom 5% (if shown)
   ✓ No text over IMP's face
   ✓ No text over W² chest mark
   ✓ Pedestal fully visible
   ```

4. **Test Interaction**
   ```
   Tap → Wake (0.2s animation)
   Wait 2.5 sec → Returns to Idle
   Repeat 3 times ✓
   ```

## Step 8: Verify Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| Builds in Xcode without errors | ☐ |
| Runs on 41mm simulator | ☐ |
| Runs on 45mm simulator | ☐ |
| Runs on physical Apple Watch | ☐ |
| Time displays correctly | ☐ |
| Date displays correctly | ☐ |
| Tap → Wake → Idle cycle works | ☐ |
| All 6 states visible | ☐ |
| No cropped IMP on 41mm | ☐ |
| No cropped IMP on 45mm | ☐ |
| Pedestal fully visible | ☐ |
| W² mark visible | ☐ |

✅ **All checked** = Acceptance criteria met for v1

## Common Build Issues

### "Swift compiler error" / "Expected declaration"

- **Cause:** Syntax error in one of the Swift files
- **Fix:** 
  - Check all `}` match `{`
  - Verify no extra/missing `import` statements
  - In Xcode: Editor → Fix All Issues (⌘A, then menu)

### "Image not found" / "Could not find bundle"

- **Cause:** Assets not added to Assets.xcassets
- **Fix:**
  - Open Assets.xcassets
  - Verify all 6 images are there with correct names
  - Names must match exactly: `02_idle_state`, `03_wake_state`, etc.

### "Cannot install app on watch" / "Provisioning Profile"

- **Cause:** Signing configuration issue
- **Fix:**
  - In Xcode: Project → Target → Signing & Capabilities
  - If using personal team: Select your team name
  - If testing on simulator only: Can leave blank
  - Check "Automatically manage signing"

### "Reduce Motion" or VoiceOver Not Working

- **Cause:** Simulator accessibility settings not enabled
- **Fix:**
  - Simulator: Device → Settings → Accessibility
  - Toggle Reduce Motion ON/OFF to test

## Next Steps After v1

1. **WidgetKit Complication** (v1.1)
   - Add Smart Stack widget
   - Display in compatible system faces

2. **Haptic Feedback** (v1.2)
   - Tap haptics on wake transition
   - Battery level haptics on charge complete

3. **Health Integration** (v2.0)
   - Read heart rate from HealthKit
   - Adapt display based on activity level

4. **Animations** (v2.0+)
   - Optional motion on state transitions
   - Wake-loop animation (per storyboard)

## Reference Documentation

- **Apple watchOS HIG:** https://developer.apple.com/design/human-interface-guidelines/watchos
- **SwiftUI docs:** https://developer.apple.com/documentation/swiftui
- **Xcode Help:** Help → Xcode Help (in Xcode menu)

---

**Build Status:** Ready to implement  
**Estimated Time:** 30-45 minutes for full setup (first time)  
**Testing Environment:** Mac + Apple Watch simulator + (optional) physical watch
