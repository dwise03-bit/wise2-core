# iOS OTA Updates — WISE² Field Tech

## Overview

Over-The-Air (OTA) updates allow field technicians to update the WISE² app directly on their iPhones without the App Store. Updates are served from your VPS.

---

## Architecture

```
VPS (173.208.147.165:3000)
├── /apps/wise2-ios/WISE2.ipa          (App binary)
├── /apps/wise2-ios/ota-manifest.plist (Update manifest)
└── /apps/wise2-ios/icon.png           (App icon)
         ↓
   [OTA Update Manager on iPhone]
         ↓
   Shows update prompt + "Update Now" button
         ↓
   Opens itms-services:// to install
```

---

## Components

### 1. **OTAUpdateManager.swift**
- Checks for updates by reading manifest.plist
- Compares versions
- Initiates installation via itms-services protocol

### 2. **OTAUpdateView.swift**
- Displays update prompt to user
- Shows release notes
- Provides "Update Now" and "Later" buttons

### 3. **ota-manifest.plist**
- XML manifest describing the app update
- Hosted on VPS
- Contains bundle ID, version, download URL, release notes

### 4. **build-ota-release.sh**
- Builds release IPA
- Exports app binary
- Uploads to VPS
- Generates installation link

---

## How to Deploy an Update

### Step 1: Update App Version
Edit `WISE2/App/WISE2App.swift` or your version constant to bump the version number.

### Step 2: Build & Upload OTA Release
```bash
cd /Users/danielwise/Projects/wise2-core/apps/wise2-ios
./build-ota-release.sh
```

This will:
- ✅ Build release archive
- ✅ Export IPA
- ✅ Upload to VPS
- ✅ Print installation link

### Step 3: Share Installation Link
Field technicians can install the update by:
1. Opening the installation link on their iPhone
2. Tapping "Install"
3. Trusting the developer certificate (first time only)
4. App updates automatically

---

## Installation Link Format

```
itms-services://?action=purchaseIntent&bundleId=com.wisedefense.fieldtech&url=http://173.208.147.165:3000/apps/wise2-ios/ota-manifest.plist
```

---

## Testing OTA Updates

### Simulate Update Available
1. Edit `ota-manifest.plist` and bump version number
2. Upload to VPS: `scp ota-manifest.plist dwise@173.208.147.165:/var/www/apps/wise2-ios/`
3. On iPhone app: Settings → Check for Updates
4. "Update available" prompt should appear

### Test Installation
1. Tap "Update Now"
2. System shows installation prompt
3. Tap "Install"
4. Device downloads and installs new version
5. App relaunches

---

## Automatic Update Checks

The app checks for updates:
- ✅ Every app launch (OTAUpdateView onAppear)
- ✅ After 24 hours running
- ✅ When network becomes available

To add background refresh:
```swift
// In WISE2App.swift
.backgroundTask(.appRefresh("com.wise2.checkUpdates")) {
  await updateManager.checkForUpdates()
}
```

---

## Troubleshooting

### "Update check failed"
- Verify VPS is reachable: `ping 173.208.147.165`
- Check manifest URL: `curl http://173.208.147.165:3000/apps/wise2-ios/ota-manifest.plist`
- Verify IPA file exists on VPS

### "Installation failed"
- Check device has enough storage (app must fit uncompressed)
- Verify bundle ID matches: `com.wisedefense.fieldtech`
- Ensure device trusts your developer certificate

### "Manifest not found"
- Verify web server is serving the file
- Check file permissions: `ssh dwise@173.208.147.165 ls -la /var/www/apps/wise2-ios/`

---

## Version Management

Current version: `1.0.0` (defined in ota-manifest.plist)

Update process:
1. Bump version in manifest
2. Build new IPA with same version
3. Upload both files
4. Technicians see "update available"

---

## Security Notes

- ✅ HTTPS recommended for production (update manifest.plist URLs)
- ✅ Sign IPA with your developer certificate
- ✅ Verify manifest checksum on device (optional)
- ✅ Keep manifest.plist in version control

---

## Next Steps

1. **Enable automatic checks**: Add background refresh task
2. **Add rollback**: Store previous version on VPS
3. **Analytics**: Log update installation success/failure
4. **Staged rollout**: Limit % of devices updated per day

---

**OTA Updates Ready** ✅
Your technicians can now update directly from the field.
