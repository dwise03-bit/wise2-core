# Deploy WISE² HVAC to Physical iPhone

## Prerequisites

### 1. Install Xcode (REQUIRED)
```bash
# Option A: From App Store (easiest)
open "macappstore://apps.apple.com/us/app/xcode/id497799835"

# Option B: Command line
xcode-select --install
# Then download full Xcode from App Store
```

**Why?** Full Xcode includes build tools, simulators, and device deployment capability. Command-line tools alone cannot deploy to physical devices.

After installing, verify:
```bash
xcode-select -p
# Should output: /Applications/Xcode.app/Contents/Developer
```

### 2. Set up code signing

Once Xcode is installed, open it once:
```bash
open /Applications/Xcode.app
```

Then:
1. Go **Xcode → Settings → Accounts**
2. Click **+ (Add Account)**
3. Sign in with your **Apple ID** (personal account is fine)
4. Click **Manage Certificates**
5. Click **+ (Create a Certificate)**
6. Choose **iOS Development**
7. Close Xcode

## Automated Deployment (Run This)

```bash
#!/bin/bash
set -e

HVAC_DIR="/Users/danielwise/Projects/wise2-core/apps/wise-hvac-demo"
IOS_PROJECT="$HVAC_DIR/ios/App"

echo "🚀 Deploying HVAC to Physical iPhone..."
echo "════════════════════════════════════════"

cd "$IOS_PROJECT"

# Build for connected device
echo "📱 Building for physical iPhone..."
xcodebuild -project App.xcodeproj \
  -scheme App \
  -configuration Release \
  -derivedDataPath build \
  -destination generic/platform=iOS \
  -allowProvisioningUpdates \
  build

echo "✅ Build complete!"
echo ""
echo "📲 Next steps:"
echo "1. Connect your iPhone via USB"
echo "2. Trust the computer on your iPhone"
echo "3. Run this command:"
echo ""
echo "   xcodebuild -project '$IOS_PROJECT/App.xcodeproj' \\"
echo "     -scheme App -configuration Release \\"
echo "     -derivedDataPath build \\"
echo "     -destination 'id=YOUR_DEVICE_ID' \\"
echo "     install"
echo ""
echo "4. To find YOUR_DEVICE_ID, run:"
echo "   instruments -s devices"
echo ""
```

## Manual Deployment in Xcode (If automated fails)

```bash
# 1. Open Xcode project
open /Users/danielwise/Projects/wise2-core/apps/wise-hvac-demo/ios/App/App.xcodeproj

# 2. In Xcode:
#    - Connect iPhone via USB
#    - Select iPhone from top-left device dropdown
#    - Press Cmd+R to build and run
#    - On iPhone: Tap "Trust" on the developer cert popup
#    - App launches automatically

# 3. Configure API (in the app):
#    - Settings → API Configuration
#    - Set API URL to your backend (e.g., http://192.168.1.100:3000)
```

## Troubleshooting

### "iPhone is locked with a passcode"
- Unlock your iPhone and keep it unlocked during deployment
- Tap "Trust" when prompted about the developer certificate

### "Could not find the following packages"
- Run: `cd $HVAC_DIR && pnpm install`

### "No code signing identity found"
- Must set up Apple ID in Xcode first (see Prerequisites section)

### "Build failed: ld: library not found"
- Capacitor sync may have failed. Run:
  ```bash
  cd /Users/danielwise/Projects/wise2-core/apps/wise-hvac-demo
  npx cap sync ios
  ```

## Status

✅ **Completed:**
- Next.js app built
- iOS project generated
- Capacitor synced
- Ready for Xcode deployment

⏳ **Waiting on:**
- Xcode installation
- Apple ID setup for code signing

## Quick Links

- [Xcode on Mac App Store](https://apps.apple.com/us/app/xcode/id497799835)
- [Apple Developer Account](https://developer.apple.com)
- [Capacitor iOS Guide](https://capacitorjs.com/docs/ios)
