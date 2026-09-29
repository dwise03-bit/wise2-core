# BLAKKHAIL iOS - Quick Start Guide

## 🎯 The Goal
Install BLAKKHAIL app on 2 iPhones + run automated tests

## ⚡ TL;DR - 5 Minutes

### Step 1: Connect & Trust (2 minutes)
```bash
# On each iPhone:
1. Plug into USB cable
2. Tap "Trust" when prompted on device
3. Unlock device
```

### Step 2: Run Orchestrator (1 minute)
```bash
cd /Users/danielwise/Projects/wise2-core/apps/blakkhail-ios
./DEPLOY_ORCHESTRATOR.sh
```

This will:
- ✅ Verify Xcode is installed
- ✅ Detect connected iPhones
- ✅ Configure code signing
- ✅ Build the app
- ✅ Show installation instructions

### Step 3: Install in Xcode (2 minutes)

**For iPhone 1:**
1. Open Xcode: `open -a Xcode .`
2. Product → Destination → [Select iPhone 1]
3. Product → Run (Cmd + R)
4. Wait ~30 seconds for install

**For iPhone 2:**
1. Disconnect iPhone 1 (or select iPhone 2)
2. Product → Destination → [Select iPhone 2]
3. Product → Run (Cmd + R)
4. Wait ~30 seconds for install

### Step 4: Run Tests (optional)
```bash
# After installation:
./run_tests.sh
```

Or in Xcode:
- Product → Test (Cmd + U)

---

## 📋 Prerequisites Checklist

- [ ] Xcode 15+ installed (`xcode-select -p` should show path)
- [ ] Both iPhones connected via USB
- [ ] Both iPhones unlocked
- [ ] Trust dialog tapped on both devices
- [ ] Apple Developer Account (free tier is fine)

---

## 🚨 Troubleshooting

### "Device not found"
```bash
# Restart trust process on iPhone:
Settings → General → Reset → Reset Location & Privacy
Reconnect and tap Trust again
```

### "Code signing error"
```bash
# Re-add Apple Developer Account to Xcode:
1. Xcode → Settings → Accounts
2. Click + to add account
3. Sign in with Apple ID
4. Download certificates
```

### "App crashes on launch"
```bash
# Check console for errors:
Xcode → Window → Console (Cmd + Shift + Y)

# Common fixes:
1. Clean build: Product → Clean Build Folder (Cmd + Shift + K)
2. Rebuild: Product → Build (Cmd + B)
3. Reinstall: Product → Run (Cmd + R)
```

### "No devices in Xcode"
```bash
# Wait 5-10 seconds after connecting
# Then unplug and reconnect USB cable
# Tap "Trust" again on device
```

---

## 📊 Test Suite (20+ Tests)

After installation, run tests:

```bash
./run_tests.sh
```

Tests cover:
- ✅ Authentication (login/signup)
- ✅ Home screen
- ✅ Product catalog (browse/search/filter)
- ✅ Shopping cart
- ✅ Checkout
- ✅ Brand story
- ✅ Account management
- ✅ Performance

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `BlakkhailApp.swift` | Main app entry point |
| `DEPLOY_ORCHESTRATOR.sh` | Build/install orchestrator |
| `AUTOMATE_BUILD_TEST.sh` | Alternative automation |
| `run_tests.sh` | Test runner script |
| `TEST_SUITE.swift` | 20+ automated tests |
| `DEVICE_DEPLOYMENT.md` | Detailed deployment guide |
| `Info.plist` | App configuration |
| `project.pbxproj` | Xcode project settings |

---

## 🎯 Status

**App**: ✅ Complete (2,500+ lines)  
**Tests**: ✅ Complete (20+ tests)  
**Build**: ✅ Ready  
**Deployment**: ✅ Ready  

---

## 💡 Pro Tips

1. **Speed up builds**: Use Release configuration (slower build, faster app)
2. **Debug on device**: Use Xcode console to see live logs
3. **Wireless install**: Connect via network after first USB install
4. **Save time**: Don't unplug phones between installs if using wireless

---

## 🆘 Need Help?

1. Read `DEVICE_DEPLOYMENT.md` for detailed step-by-step guide
2. Check Xcode console: Product → Run, then Window → Console
3. Review build logs: Look for `.log` files in `build-*` folders

---

**Ready? Run:** `./DEPLOY_ORCHESTRATOR.sh`
