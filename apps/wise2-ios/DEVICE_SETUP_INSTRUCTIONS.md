# iPhone Setup for WISE² Deployment

**Device Found**: iPhone 15 Pro (00008130-001455242861401C)  
**Status**: Needs developer disk image preparation

---

## One-Time Setup (5 minutes)

### Step 1: Open Xcode with Device Connected

```bash
open WISE2.xcodeproj
```

**Device Status**: Your iPhone should show in Xcode's device selector (top-left corner)

### Step 2: Trust Device Certificates

On your **iPhone** screen, you'll see:
```
"Trust This Computer?"
Do you want to allow this computer to access information 
on your iPhone?
```

**Tap: TRUST**

### Step 3: Wait for Developer Disk Image to Mount

Xcode will automatically:
1. Download necessary developer tools (~500 MB)
2. Copy them to your iPhone
3. Mount the developer disk

**Look for**: Progress indicator in Xcode that says "Mounting Developer Disk Image"

**Time**: 2-3 minutes (depends on connection speed)

### Step 4: Confirm Device is Ready

In Xcode, verify:
- [ ] Device shows in top-left selector as "iPhone 15 Pro"
- [ ] No error messages about "developer disk image"
- [ ] Device is listed in Window > Devices and Simulators
- [ ] Status shows "Connected" (green dot next to device name)

---

## Then Deploy App

Once device shows as "Connected" in Xcode:

```bash
xcodebuild -scheme WISE2 \
  -configuration Release \
  -destination 'id=00008130-001455242861401C' \
  -derivedDataPath build \
  -allowProvisioningUpdates \
  CODE_SIGN_IDENTITY="Apple Development" \
  build
```

Or from Xcode GUI:
1. Select your iPhone in device selector (top-left)
2. Product > Run (or ⌘R)
3. App will build, sign, and deploy to device

---

## Troubleshooting

### "Developer disk image could not be mounted"
- [ ] Make sure iPhone is unlocked
- [ ] Unplug and plug in again
- [ ] Restart Xcode: Cmd+Q, then reopen
- [ ] Restart iPhone: Hold power button, slide to power off, wait 10s, power on

### "No Account for Team"
- [ ] Xcode > Preferences > Accounts
- [ ] Click '+' button
- [ ] Select 'Apple ID'
- [ ] Sign in: dwise954@icloud.com
- [ ] Close preferences, try building again

### "Trust This Computer" dialog doesn't appear
- [ ] Unlock iPhone screen
- [ ] Unplug USB cable
- [ ] Plug back in
- [ ] Dialog should appear on iPhone

---

## Quick Status Check

```bash
# See if device is ready
xcode-select -p
# Should show: /Applications/Xcode.app/Contents/Developer

# List connected devices
xcrun xcode-select --version
```

---

**Once setup is complete**, deployment takes ~2 minutes per build.

For Fieldpiece testing, you'll be able to:
1. ✅ Scan for Bluetooth probes
2. ✅ Connect to Job Link® tools
3. ✅ See live measurements
4. ✅ Record diagnostic data

