# WISE² iOS OTA Update Deployment Guide

This guide explains how to build and deploy the WISE² iOS app as an OTA update for field technicians.

## Prerequisites

- **macOS 13+** with Xcode 15+
- **SSH access** to VPS: `dwise@173.208.147.165`
- **Apple Developer Account** (for code signing if needed)

## Step 1: Update App Version (macOS Only)

On your Mac, open the Xcode project and update the version:

```bash
cd /path/to/wise2-core/apps/wise2-ios
open WISE2.xcodeproj
```

In Xcode:
1. Select `WISE2` target
2. Go to **Build Settings**
3. Search for "Bundle Version Short String"
4. Update the version number (e.g., `1.0.4`)

Or edit directly:
```bash
# Edit Info.plist
plutil -replace CFBundleShortVersionString -string "1.0.4" WISE2/Info.plist
```

## Step 2: Build OTA Release (macOS)

```bash
cd /path/to/wise2-core/apps/wise2-ios
./build-ota-release.sh
```

This script will:
- ✅ Build the app in Release configuration
- ✅ Create an IPA file
- ✅ Upload to VPS
- ✅ Generate installation link

### Expected Output

```
🔨 Building OTA Release...
════════════════════════════════════════
📦 Building app...
[xcodebuild output...]
✅ IPA built successfully

📤 Uploading to VPS...
WISE2.ipa                                    100%   45MB   2.1MB/s   00:21
ota-manifest.plist                           100%   1.2KB  500KB/s   00:01
✅ OTA update published!

🔗 Installation link:
itms-services://?action=purchaseIntent&bundleId=com.wise2.commandcenter.ios&url=http://173.208.147.165:3000/apps/wise2-ios/ota-manifest.plist
```

## Step 3: Update Manifest Version

After building, update the manifest version to match the app:

```bash
# Edit the bundle-version in ota-manifest.plist
plutil -replace items[0].metadata.bundle-version -string "1.0.4" apps/wise2-ios/ota-manifest.plist

# Push to git (commit the version bump)
git add apps/wise2-ios/ota-manifest.plist
git commit -m "Update OTA manifest to v1.0.4"
git push
```

## Step 4: Verify Deployment

### Check VPS Files

```bash
ssh dwise@173.208.147.165 "ls -lah /var/www/apps/wise2-ios/"
```

Should show:
```
-rw-r--r-- WISE2.ipa
-rw-r--r-- ota-manifest.plist
-rw-r--r-- icon.png
-rw-r--r-- icon-large.png
```

### Test on Device

1. Open the installation link on iPhone:
```
itms-services://?action=purchaseIntent&bundleId=com.wise2.commandcenter.ios&url=http://173.208.147.165:3000/apps/wise2-ios/ota-manifest.plist
```

2. App should show "Update Available" prompt
3. Tap "Update Now" to install

## Troubleshooting

### Build Fails with Code Signing Errors

```bash
# Use the no-sign build approach
xcodebuild clean build \
  -scheme WISE2 \
  -configuration Release \
  -destination generic/platform=iOS \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGNING_ALLOWED=NO
```

### SSH Upload Fails

Verify VPS connectivity:
```bash
ssh dwise@173.208.147.165 "echo 'Connected!'"
```

### Update Not Detected on Device

1. Verify manifest URL is reachable:
```bash
curl -I http://173.208.147.165:3000/apps/wise2-ios/ota-manifest.plist
```

2. Check that version in manifest is higher than app version
3. Force check: Go to Settings → Check for Updates

## Deployment Checklist

- [ ] App version updated in Xcode (Info.plist)
- [ ] Build runs without errors
- [ ] IPA file created successfully
- [ ] Files uploaded to VPS
- [ ] Manifest version matches app version
- [ ] Installation link tested on device
- [ ] Update prompt appears correctly
- [ ] Installation completes without errors
- [ ] App launches after update
- [ ] Commit pushed to git

## Releases

### v1.0.3 (Current)
- Fieldpiece tool integration
- Live diagnostics recording
- Field technician features
- OTA update system

### How to Deploy New Version

1. Make code changes
2. Update version in Info.plist
3. Run `./build-ota-release.sh`
4. Test installation on device
5. Commit and push

## Support

For issues or questions:
- Check VPS logs: `ssh dwise@173.208.147.165 tail -f /var/log/nginx/access.log`
- Review app logs on device in Console.app
- Contact: dwise03@gmail.com

---

**Last Updated**: 2026-09-01  
**Current Version**: 1.0.3  
**Deployment Status**: Ready for field distribution
