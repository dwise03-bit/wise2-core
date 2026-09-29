# iOS App Signing Registry & Organization

**Last Updated**: 2026-09-15  
**Team ID**: FB042344774DE4FA29C74D7260790DD49A04F257  
**Signing Method**: Automatic (iOS Team Provisioning Profile)

---

## App Inventory

| App | Bundle ID | Location | Status | Devices |
|-----|-----------|----------|--------|---------|
| **Blakkhail** | com.sencere.blakkhail | `/apps/blakkhail-ios/` | ✅ INSTALLED | iPhone 26.6.1+ |
| WISE² CC | com.dwise954.wise2 | `/apps/wise2-live-controller/` | 🔧 FIX NEEDED | iPhone 26.4.2+ |
| WISE² RP | com.wise2.rp | `/apps/mobile-ios/` | 🔧 FIX NEEDED | iPhone 26.0+ |

---

## Code Signing Status

### Blakkhail ✅ WORKING
```
Bundle ID: com.sencere.blakkhail
Team ID: FB042344774DE4FA29C74D7260790DD49A04F257
Provisioning: iOS Team Profile (valid)
Status: INSTALLED on iPhone (26.6.1)
Features: AI Style Assistant, Clothing Uploader
```

### WISE² Command Center ✅ FIXED
```
Bundle ID: com.dwise954.wise2
Team ID: FB042344774DE4FA29C74D7260790DD49A04F257
Status: FIXED - Ready for rebuild
Location: apps/wise2-ios/WISE2.xcodeproj
```

### WISE² RP ✅ FIXED
```
Bundle ID: com.wise2.rp
Team ID: FB042344774DE4FA29C74D7260790DD49A04F257
Status: FIXED - Ready for rebuild
Location: apps/mobile-ios/WISE2RP.xcodeproj
```

---

## Device Tracking

**Connected Devices**:
- iPhone (26.6.1) - Blakkhail ✅
- iPhone (27.0) - Available for testing
- iPhone 15 Pro maxx (26.4.2) - Available for testing

---

## Fix Implementation Plan

### Step 1: Standardize Team ID
All apps must use: `FB042344774DE4FA29C74D7260790DD49A04F257`

### Step 2: Update Project Settings
```
Each .xcodeproj must have:
- Development Team: FB042344774DE4FA29C74D7260790DD49A04F257
- Signing Certificate: iOS Team
- Provisioning Profile: Automatic
```

### Step 3: Rebuild & Test
```
Blakkhail:   Already working ✅
WISE² CC:    Rebuild + test on all devices
WISE² RP:    Rebuild + test on all devices
```

### Step 4: Install on All Devices
```
Device 1 (26.6.1):   Blakkhail ✅ + others
Device 2 (27.0):     All three apps
Device 3 (15 Pro):   All three apps
```

---

## Status Summary

✅ **Signing Fixes Complete**: All 3 apps unified to team FB042344774DE4FA29C74D7260790DD49A04F257  
✅ **Blakkhail**: Installed and working on iPhone (26.6.1)  
🔨 **Next**: Rebuild WISE² Command Center and WISE² RP  
📋 **Then**: Install on all 3 devices and verify  

---

**Note**: Document controls unified iOS app deployment across WISE² ecosystem.
