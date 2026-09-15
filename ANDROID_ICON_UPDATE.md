# Android APK Icon Update - Sound Labs Edition

**Date**: 2026-09-14  
**App**: FieldTech Android (Sound Labs)  
**Target**: Replace icon with WISE² logo + music elements

---

## Icon Specification

### Visual Design
- **Primary**: WISE² logo (navy #050607)
- **Secondary**: Music element (🎵, 🎧, or musical note)
- **Colors**: 
  - Background: Navy #050607
  - Accent: Cyan #00D9FF or Neon Green #00FF7F
  - Logo: White/Gold blend

### File Locations to Update

**Adaptive Icon (Android 8.0+)**:
```
apps/fieldtech-android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml
```

**Legacy Icons** (for backward compatibility):
```
apps/fieldtech-android/app/src/main/res/
├── mipmap-hdpi/ic_launcher.png       (72x72)
├── mipmap-ldpi/ic_launcher.png       (36x36)
├── mipmap-mdpi/ic_launcher.png       (48x48)
├── mipmap-xhdpi/ic_launcher.png      (96x96)
├── mipmap-xxhdpi/ic_launcher.png     (144x144)
└── mipmap-xxxhdpi/ic_launcher.png    (192x192)
```

---

## Implementation Steps

### Option 1: Vector Drawable (Recommended)
Create `ic_launcher_foreground.xml` as an SVG vector:

```xml
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    
    <!-- WISE² logo background circle -->
    <path
        android:pathData="M54,54m-50,0a50,50 0 1,1 100,0a50,50 0 1,1 -100,0"
        android:fillColor="#050607" />
    
    <!-- Music note icon (centered) -->
    <path
        android:pathData="M54,35L54,65C54,72.7 47.7,79 40,79C32.3,79 26,72.7 26,65C26,57.3 32.3,51 40,51C45,51 49.3,54.2 51,58.7L51,35Z"
        android:fillColor="#00FF7F"
        android:strokeColor="#00D9FF"
        android:strokeWidth="1.5" />
    
    <!-- Second music note -->
    <path
        android:pathData="M58,40L58,65C58,72.7 64.3,79 72,79C79.7,79 86,72.7 86,65C86,57.3 79.7,51 72,51C67,51 63,54.2 61,58.7L61,40L58,40"
        android:fillColor="#00D9FF"
        android:strokeColor="#00FF7F"
        android:strokeWidth="1.5" />
</vector>
```

Update `ic_launcher.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/jet_black" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
```

### Option 2: PNG Icons
1. Export icon set from design tool (Figma, Adobe XD, etc.)
2. Generate sizes: 36x36, 48x48, 72x72, 96x96, 144x144, 192x192
3. Place in respective mipmap directories
4. Update `ic_launcher.xml` to reference PNG foreground:

```xml
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/jet_black" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
```

---

## Current Configuration

**App Name**: FieldTech  
**Package**: `com.wise2.fieldtech`  
**Current Icon**: Navy background + Electric Blue foreground (adaptive icon)  
**Target**: WISE² logo + music note + cyan/neon accents

---

## Build & Test

After updating icons:

```bash
# Build debug APK
cd apps/fieldtech-android
./gradlew assembleDebug

# Install on device
adb install -r app/build/outputs/apk/debug/app-debug.apk

# Verify icon on launcher
# Expected: WISE² logo with music notes, navy background
```

---

## Color Palette Reference

```
Navy:        #050607
Cyan:        #00D9FF
Neon Green:  #00FF7F
Gold:        #C4A369
White:       #FFFFFF
```

---

## Next Steps

1. **Create Icon Design**
   - Get WISE² logo SVG/PNG from brand assets
   - Add music note overlay (🎵)
   - Apply color palette

2. **Update Android Resources**
   - Place icon files in mipmap directories
   - Update adaptive icon XML

3. **Rebuild APK**
   ```bash
   bash scripts/build-android-release.sh
   ```

4. **Deploy to Play Store / Distribution**
   - Update version in build.gradle.kts
   - Upload signed APK

---

## Notes

- Adaptive icons automatically add safe zone circles on Android 8.0+
- Legacy PNG icons support Android 7.1 and earlier
- Icon must be at least 192x192 for highest quality
- Test on multiple device DPIs to ensure clarity

---

**Status**: Ready for design asset integration  
**Owner**: dwise (dwise03@gmail.com)  
**Priority**: Medium (icon refresh for branding)

