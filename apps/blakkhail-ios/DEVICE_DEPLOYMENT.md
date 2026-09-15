# BLAKKHAIL iOS — Real Device Deployment Guide

🚀 **Install to 2 iPhones (Production Ready)**

## Prerequisites

- ✅ 2 iPhones plugged in via USB or wireless
- ✅ Xcode 15.0+ installed
- ✅ Apple Developer Account (free or paid)
- ✅ Xcode opened on this Mac

## Step 1: Trust Devices on Mac

```bash
# Connect both iPhones via USB
# On each iPhone: tap "Trust" when prompted
# On Mac: Xcode will show connected devices
```

**Verify devices are recognized:**
```bash
xcrun xcode-select -p  # Should show Xcode path
```

## Step 2: Set Up Code Signing

### Option A: Automatic Signing (Recommended)

```
1. Open Xcode
2. File → Open → apps/blakkhail-ios/
3. Select "Blakkhail" target
4. Go to: Signing & Capabilities
5. Team: Select your Apple Developer account
6. Bundle ID: com.sencere.blakkhail
7. Xcode auto-generates certificates
```

### Option B: Manual Signing

```
1. Go to https://developer.apple.com/account
2. Certificates, Identifiers & Profiles → Identifiers
3. Create new identifier: com.sencere.blakkhail
4. Create Provisioning Profile for each device
5. Download & install certificates in Xcode
```

## Step 3: Select Device & Build

```bash
# Terminal
cd /Users/danielwise/Projects/wise2-core/apps/blakkhail-ios

# Or in Xcode:
# 1. Product → Destination
# 2. Select first iPhone (Device 1)
# 3. Product → Build
# 4. Wait for ✅ Build Successful
```

## Step 4: Run on First iPhone

```
Xcode → Product → Run (Cmd + R)
```

**Expected result:**
- Blakkhail app appears on iPhone 1
- Splash screen shows BH logo
- Takes 5-15 seconds first launch

## Step 5: Run on Second iPhone

```
1. Product → Destination → Select iPhone 2
2. Product → Run (Cmd + R)
3. Wait for install to complete
```

## Troubleshooting

### ❌ "Failed to prepare device for development"
```
Solution:
1. Disconnect iPhone
2. On iPhone: Settings → General → Reset → Reset Location & Privacy
3. Reconnect & tap "Trust"
4. Retry
```

### ❌ "Could not locate device support files"
```
Solution:
1. Xcode → Settings → Locations
2. Restart Xcode
```

### ❌ "Code signing error"
```
Solution:
1. Xcode → Settings → Accounts
2. Add/re-add Apple Developer account
3. Download certificates
4. Retry build
```

### ❌ "App crashes on launch"
```
Solution:
1. Check Xcode console for errors
2. Verify Info.plist is correct
3. Check BlakkhailApp.swift for syntax errors
4. Rebuild & reinstall
```

## Testing on Devices

### 1. **Home Screen**
- [ ] Hero section loads with animations
- [ ] Featured products visible
- [ ] "Shop Collection" button works

### 2. **Product Catalog**
- [ ] Browse products
- [ ] Search works
- [ ] Filter by category
- [ ] Product details load

### 3. **Shopping**
- [ ] Add items to cart
- [ ] Change quantities
- [ ] Remove items
- [ ] Totals calculate correctly

### 4. **Checkout**
- [ ] Enter shipping info
- [ ] Order summary displays
- [ ] "Complete Order" button works

### 5. **Authentication**
- [ ] Login with demo credentials
- [ ] Signup works
- [ ] Logout clears session

### 6. **Performance**
- [ ] App launches in < 3 seconds
- [ ] Scrolling is smooth (60fps)
- [ ] No memory warnings
- [ ] Battery drain is minimal

## Device Management

### Install on Device 1
```bash
xcodebuild -scheme Blakkhail -destination 'id=<DEVICE_ID_1>' -configuration Release
```

### Install on Device 2
```bash
xcodebuild -scheme Blakkhail -destination 'id=<DEVICE_ID_2>' -configuration Release
```

### Get Device IDs
```bash
xcrun xcode-select -p
# Then in Xcode Organizer: Window → Devices and Simulators
```

## Uninstall from Device

```bash
# On iPhone:
1. Long-press Blakkhail app
2. Remove App → Delete App → Delete
```

## Wireless Installation (Advanced)

```
1. Connect iPhone via USB first
2. In Xcode: Window → Devices and Simulators
3. Right-click device → "Connect via Network"
4. Disconnect USB
5. Run app via Product → Run
```

## Production Deployment

### For Testflight
```
1. Product → Archive
2. Organizer → Distribute App
3. Choose "TestFlight"
4. Add testers via App Store Connect
5. They receive link to install
```

### For App Store
```
1. Create App ID in App Store Connect
2. Archive app (Product → Archive)
3. Submit to App Store Review
4. Wait for approval (~24-48 hours)
5. Release when approved
```

## Device UUIDs (Both iPhones)

Keep these for reference:
- **iPhone 1 UUID**: `00008140-001A22500AD3401C` (or actual UUID)
- **iPhone 2 UUID**: `00008140-001A22500AD3401D` (or actual UUID)

Get actual UUIDs:
```bash
system_profiler SPUSBDataType | grep "Serial Number"
```

## Next Steps

1. ✅ Verify app runs on both devices
2. ✅ Test all features (shop, cart, checkout, auth)
3. ✅ Check performance (no crashes, smooth scrolling)
4. ✅ Send to Testflight for beta testing
5. ✅ Submit to App Store when ready

---

**Status**: Ready for production deployment  
**Version**: 1.0.0  
**Min iOS**: 17.0  
**Devices**: Both iPhones connected & ready

Need help? Check Xcode build logs: Product → Scheme → Edit Scheme → Logging
