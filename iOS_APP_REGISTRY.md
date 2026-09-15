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

### WISE² Command Center 🔧 NEEDS FIX
```
Bundle ID: com.dwise954.wise2
Team ID: [CONFLICTING - needs update]
Issue: Different team than Blakkhail
Fix: Update to FB042344774DE4FA29C74D7260790DD49A04F257
Status: Simulator-only, device install fails
```

### WISE² RP 🔧 NEEDS FIX
```
Bundle ID: com.wise2.rp
Team ID: [MIXED/UNKNOWN]
Issue: Inconsistent provisioning
Fix: Standardize to main team
Status: Development only
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

✅ **Done**: Blakkhail installed and working  
🔧 **To Do**: Fix WISE² apps signing  
📋 **Planned**: Multi-device testing  

---

**Note**: Document controls unified iOS app deployment across WISE² ecosystem.
