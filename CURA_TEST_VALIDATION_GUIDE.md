# Cura Slicing & Print Validation Guide
## Milwaukee Packout Monitor Stand - V1.0

**Purpose**: Complete instructions for importing, slicing, and validating parts in Cura before printing.

**Target Printer**: Anycubic Kobra X (260×260 mm bed, 0.6 mm nozzle)  
**Expected Print Time**: 3 hours 12 minutes (sequential)  
**Expected Filament**: 69 grams PLA  

---

## STEP 1: EXPORT STLs FROM OPENSCAD

### 1.1: Install OpenSCAD (Free, Open-Source)

```bash
# macOS (via Homebrew)
brew install openscad

# Windows (via Chocolatey)
choco install openscad

# Linux (Ubuntu/Debian)
sudo apt-get install openscad

# Or download from: https://openscad.org/downloads.html
```

### 1.2: Export Individual Parts

```
STEP 1: Open packout_monitor_stand.scad in OpenSCAD

STEP 2: For each part, follow this process:
  
  LEFT FOOT (Part A-001):
  ├─ Find line: // left_foot();
  ├─ Uncomment: left_foot();
  ├─ Comment out: full_assembly(...);
  ├─ Press F5 (or View > Compile)
  ├─ Wait for render (30 sec)
  ├─ File > Export as STL
  ├─ Name: "A-001_Left_Foot.stl"
  └─ DONE
  
  RIGHT FOOT (Part A-002):
  ├─ Uncomment: right_foot();
  ├─ Comment out: left_foot();
  ├─ Render & Export
  ├─ Name: "A-002_Right_Foot.stl"
  └─ DONE
  
  MONITOR HOLDER (Part A-005):
  ├─ Uncomment: monitor_holder();
  ├─ Comment out others
  ├─ Render & Export
  ├─ Name: "A-005_Monitor_Holder.stl"
  └─ DONE
  
  CROSSBAR ADAPTERS (Part A-003/004):
  ├─ Uncomment: crossbar_clamp_adapter();
  ├─ Render & Export
  ├─ Name: "A-003_Crossbar_Adapter.stl"
  ├─ (Repeat, same part is used left & right)
  └─ DONE
  
  LOCK CAPS (Part A-006/007):
  ├─ Uncomment: lock_cap();
  ├─ Render & Export
  ├─ Name: "A-006_Lock_Cap.stl"
  ├─ (Same part used left & right)
  └─ DONE
  
  CABLE CLIPS (Part A-008/009):
  ├─ Uncomment: usb_c_clip();
  ├─ Render & Export
  ├─ Name: "A-008_USB_C_Clip.stl"
  ├─ Then: hdmi_clip(); → Export → "A-009_HDMI_Clip.stl"
  └─ DONE

STEP 3: Export Settings (Important!)
  └─ Angular Tolerance: 0.01 degrees
  └─ Tolerance: 0.05 mm (good balance detail/file size)
  └─ All other options: Default
```

### 1.3: Verify Exports

```bash
# List all exported STL files
ls -lh A-*.stl

# Expected files:
# A-001_Left_Foot.stl          (~2 MB)
# A-002_Right_Foot.stl         (~2 MB)
# A-003_Crossbar_Adapter.stl   (~1 MB)
# A-005_Monitor_Holder.stl     (~3 MB)
# A-006_Lock_Cap.stl           (~500 KB)
# A-008_USB_C_Clip.stl         (~400 KB)
# A-009_HDMI_Clip.stl          (~400 KB)

# Total: ~9-10 MB (all parts)
```

---

## STEP 2: IMPORT INTO CURA

### 2.1: Launch Cura

```
1. Open Ultimaker Cura (or Bambu Studio)
2. Create new project (File > New)
3. Select printer: Anycubic Kobra X
   ├─ If not available, add it:
   ├─ Printer > Add Printer
   ├─ Search: "Anycubic Kobra X"
   └─ Select & confirm
```

### 2.2: Import First Batch (Feet)

```
FILE > OPEN FILE
  ├─ Select: A-001_Left_Foot.stl
  └─ Click Open

(Part appears on build plate)

FILE > OPEN FILE (again)
  ├─ Select: A-002_Right_Foot.stl
  └─ Click Open

(Now have TWO parts on plate)
```

### 2.3: Position Parts for Batch 1

**Goal**: Nest parts to minimize print time & filament

```
LEFT FOOT POSITIONING:
  1. Click LEFT_FOOT part (highlight)
  2. Move tool (press M or click move icon)
  3. Position: X=30, Y=50, Z=0 (front-left of bed)
  4. Confirm

RIGHT FOOT POSITIONING:
  1. Click RIGHT_FOOT part
  2. Move tool
  3. Position: X=180, Y=50, Z=0 (front-right of bed)
  4. Confirm

VERIFY:
  └─ Both feet visible on bed preview
  └─ ~80 mm gap between them (good nesting)
  └─ No parts overlapping
```

---

## STEP 3: APPLY CURA PROFILE

### 3.1: Load Profile

```
PREFERENCES > PROFILES > MANAGE PROFILES
  ├─ Click: Import
  ├─ Select: cura_packout_stand_profile.ini
  └─ Click Import

(Profile loads)

MANAGE PROFILES (again)
  ├─ Find: "WISE² Packout Monitor Stand"
  ├─ Click: Set as Default
  └─ Close
```

### 3.2: Verify Settings

**Check that these are applied** (they should be if profile imported correctly):

```
┌──────────────────────────────────┐
│ CRITICAL SETTINGS                │
├──────────────────────────────────┤
│ Nozzle Temperature:    205°C     │ ✓ Verify
│ Bed Temperature:       58°C      │ ✓ Verify
│ Layer Height:          0.32 mm   │ ✓ Verify
│ Line Width:            0.65 mm   │ ✓ Verify
│ Wall Thickness:        1.95 mm   │ ✓ Verify (3 walls)
│ Infill:                12%       │ ✓ Verify
│ Infill Pattern:        Gyroid    │ ✓ Verify
│ Supports:              OFF       │ ✓ CRITICAL - must be OFF
│ Raft:                  OFF       │ ✓ Verify
│ Adhesion:              Skirt     │ ✓ Verify
│ Print Speed:           60 mm/s   │ ✓ Verify (outer walls)
│ Infill Speed:          80 mm/s   │ ✓ Verify
└──────────────────────────────────┘
```

### 3.3: Manual Settings Adjustment (if needed)

If profile didn't import, set manually:

```
SETTINGS (right panel):
  
  Temperature:
    ├─ Nozzle Temp: 205°C
    └─ Bed Temp: 58°C

  Adhesion:
    └─ Type: Skirt (5 mm distance, 1 line)

  Infill:
    ├─ Infill Density: 12%
    ├─ Infill Pattern: Gyroid
    └─ Infill Before Walls: ON

  Support:
    └─ Generate Support: OFF (CRITICAL)

  Speed:
    ├─ Print Speed: 60 mm/s
    ├─ Infill Speed: 80 mm/s
    ├─ Travel Speed: 100 mm/s
    └─ Retraction Speed: 25 mm/s

  (More settings in advanced tab if needed)
```

---

## STEP 4: ORIENTATION & SLICING VERIFICATION

### 4.1: Check Orientation

**LEFT FOOT**:
```
View from TOP:
  └─ Should see flat base
  └─ Engagement ribs should be at TOP (pointing up on preview)

View from FRONT:
  └─ Height should be ~18 mm
  └─ Should look like foot shape (wider at base)
```

**RIGHT FOOT**:
```
View from TOP:
  └─ Mirror image of LEFT FOOT
  └─ Ribs facing UP
```

### 4.2: Preview Slice

```
SLICE / SLICE NOW (bottom right button)

Wait for slice to complete (30 sec - 2 min depending on CPU)
```

### 4.3: Verify Slice Result

Once sliced, check the PREVIEW tab:

```
LAYER VIEW:
  1. Drag slider to view different layers
  2. Start layer (layer 0):
     ├─ Should see rectangle shape (foot base)
     ├─ Should be SOLID (no holes)
     └─ Should fill entire 0.40 mm layer
  
  3. Middle layers (layer 50-100):
     ├─ Should show foot walls/ribs
     ├─ Should show 3 perimeter walls
     └─ Should show gyroid infill pattern inside
  
  4. Top layers:
     ├─ Should show solid top surface
     ├─ Should NOT have any overhangs
     └─ Should have ribs oriented correctly
```

### 4.4: Check Print Time & Filament

Bottom of screen shows:

```
┌──────────────────────────────────┐
│ BATCH 1 (FEET) ESTIMATE          │
├──────────────────────────────────┤
│ Print Time:     ~90 minutes      │ ✓ Expected
│ Filament:       ~8 grams         │ ✓ Expected
│ Build Plate:    260×260 mm       │ ✓ Fits
└──────────────────────────────────┘

(If time is significantly different, something is wrong)
```

### 4.5: Quality Checks Before Export

```
COMMON PROBLEMS TO LOOK FOR:

✗ Red areas on preview
  └─ Means parts hitting nozzle limits
  └─ Solution: Rotate or reposition parts

✗ Support structures shown
  └─ Means Supports were NOT set to OFF
  └─ Solution: Turn OFF supports, re-slice

✗ Very thick lines (>0.8 mm)
  └─ May indicate model mesh issue
  └─ Solution: Re-export from OpenSCAD

✗ Missing geometry
  └─ May indicate model error
  └─ Solution: Check STL export in OpenSCAD

✗ Huge time/filament estimates
  └─ Infill may be too high
  └─ Solution: Check infill is 12%, not 100%
```

---

## STEP 5: EXPORT GCODE FOR PRINTER

### 5.1: Export to SD Card

```
FILE > SAVE AS / EXPORT G-CODE
  ├─ Filename: "WISE2_Batch1_Feet.gcode"
  ├─ Location: SD card (usually /media/sdcard or similar)
  └─ Click Save
```

### 5.2: Transfer to Printer

```
1. Safely eject SD card from computer
2. Insert SD card into Anycubic Kobra X SD slot
3. Printer will auto-detect file
4. Use printer menu to select print job
```

---

## STEP 6: REPEAT FOR REMAINING BATCHES

### BATCH 2 (MAIN COMPONENTS)

```
Repeat Steps 2.1-5.2 for:
  ├─ A-003_Crossbar_Adapter.stl (×2 copies)
  ├─ A-005_Monitor_Holder.stl
  └─ Position to nesting diagram

Expected print time: ~90 minutes
Expected filament: ~45 grams
```

### BATCH 3 (ACCESSORIES)

```
Repeat for:
  ├─ A-006_Lock_Cap.stl (×2 copies)
  ├─ A-008_USB_C_Clip.stl
  └─ A-009_HDMI_Clip.stl

Expected print time: ~30 minutes
Expected filament: ~12 grams
```

---

## STEP 7: PRE-PRINT CHECKLIST

Before pressing START on printer, verify:

```
PRINTER SETUP:
  ☐ Bed is clean (isopropyl alcohol wipe)
  ☐ Nozzle is clean (no old filament)
  ☐ Bed is level (paper test at 4 corners + center)
  ☐ Build surface is smooth (no dents/bumps)
  ☐ Bed adhesive is present (glue stick or PEI sheet)

FILAMENT:
  ☐ Correct material loaded (PLA, not ABS/PETG)
  ☐ Filament is dry (not humid)
  ☐ Filament diameter is 1.75 mm
  ☐ No tangles in spool

GCODE:
  ☐ Correct file on SD card
  ☐ SD card inserted in printer
  ☐ Printer recognizes file
  ☐ No error messages shown

START CONDITIONS:
  ☐ Print bed is room temperature
  ☐ No children/pets nearby
  ☐ Camera ready (to monitor first layer)
```

---

## STEP 8: FIRST LAYER MONITORING

### Critical: Watch First 5-10 Minutes

```
GOOD FIRST LAYER:
  ✓ Nozzle is ~0.1 mm from bed (slight drag on paper)
  ✓ Filament is squishing out into smooth line
  ✓ No gaps between lines
  ✓ No filament bunching/balling
  ✓ Extrusion is glossy (not dull)

PROBLEM SIGNS:
  ✗ Nozzle is too high: Filament doesn't stick, gaps between lines
    └─ Solution: Stop print, raise Z offset by +0.05 mm, retry

  ✗ Nozzle is too low: Filament is very thin, scratching bed
    └─ Solution: Stop print, lower Z offset by -0.05 mm, retry

  ✗ Bed too cold: Filament balls up, won't stick
    └─ Solution: Raise bed temp to 60°C, retry

  ✗ Bed too hot: Filament sticks too much, can't remove
    └─ Solution: Lower bed temp to 55°C, next print

  ✗ Nozzle clogged: No filament extrusion
    └─ Solution: Stop, heat to 210°C, clear nozzle, retry
```

### If Problems Occur

```
STOP PRINT (emergency stop on printer)
  ↓
Allow to cool slightly (1-2 min)
  ↓
Diagnose problem using checklist above
  ↓
Fix (adjust Z offset, temperature, bed level, etc.)
  ↓
Clear bed, reload new print
  ↓
START AGAIN
```

---

## PRINT TIME VERIFICATION

### Expected vs Actual

```
BATCH 1 (FEET):
  Expected: 90 minutes
  ±Tolerance: ±10 minutes (80-100 min acceptable)
  
  If <80 min: Infill might be too low (check 12%)
  If >110 min: Infill too high, or speed too slow

BATCH 2 (COMPONENTS):
  Expected: 90 minutes
  ±Tolerance: ±10 minutes
  
  If significantly different, check layer height (should be 0.32 mm)

BATCH 3 (ACCESSORIES):
  Expected: 30 minutes
  ±Tolerance: ±5 minutes
```

### Total Print Time Calculation

```
Batch 1:  90 min
Batch 2:  90 min
Batch 3:  30 min
─────────────────
TOTAL:    210 min = 3 hours 30 minutes

(Target was <3 hours 12 min for sequential)

If total is >3:30, consider:
  - Reducing infill from 12% to 10% (saves ~10 min)
  - Increasing print speed from 60 to 70 mm/s (saves ~15 min)
  - Using multiple printers in parallel
```

---

## QUALITY VALIDATION (AFTER PRINT)

### Visual Inspection

```
For each part, inspect:

✓ Surface Quality
  └─ Smooth, no visible layer artifacts
  └─ No "elephant foot" (bulge at base)
  └─ Edges are clean (not fuzzy)

✓ Dimensional Check
  └─ Monitor slot: 10.5 ± 0.3 mm (use calipers)
  └─ M4 holes: 4.2 ± 0.1 mm (test-fit bolt)
  └─ M3 holes: 3.2 ± 0.1 mm (test-fit bolt)
  └─ Overall height: Within ±0.5 mm of design

✓ Structural Integrity
  └─ No cracks or voids
  └─ No layer adhesion failures (peeling)
  └─ No print shifts (ghosting)

✓ Details
  └─ Logo is crisp (not fuzzy text)
  └─ Engagement ribs are clean
  └─ Cable clip loops are smooth
```

### Mechanical Test

```
Flex Test:
  1. Gently press on part (hand pressure)
  2. Should have minimal deflection (<1 mm)
  3. Should return to shape immediately
  4. No sound of internal breakage

Tap Test:
  1. Tap part gently with screwdriver handle
  2. Should produce solid "tink" sound
  3. NOT hollow/empty sounding
  4. Indicates good layer adhesion

Weight Test:
  1. Weigh each printed part
  2. Compare to expected weight (from BOM)
  3. ±10% variance is normal
  4. If much heavier: Infill might be higher than 12%
```

---

## TROUBLESHOOTING QUICK REFERENCE

| Problem | Cause | Solution |
|---------|-------|----------|
| Parts not sticking to bed | Bed too cold or not level | Raise bed temp to 60°C, re-level |
| Filament strings between parts | Retraction insufficient | Check retraction amount (5 mm) |
| Layer lines very visible | Layer height too high | Reduce to 0.28 mm, re-slice |
| Part broke during print | Insufficient infill | Increase to 15%, re-slice |
| Print time much longer than expected | Infill too high | Check infill is 12%, not 20%+ |
| Nozzle clogging | Temperature too low | Raise nozzle temp to 210°C |
| Parts warping at corners | Bed cooling too fast | Add enclosure, increase bed temp |
| Dimensional errors | Scale setting wrong | Check model scale in Cura (should be 1.0) |

---

## CURA PROFILE INSTALLATION SUMMARY

### Quick Install (If Not Using Manual Settings)

```bash
# Copy profile to Cura config folder

# macOS:
cp cura_packout_stand_profile.ini \
  ~/Library/Application\ Support/Cura/5.0/profiles/

# Windows (PowerShell):
Copy-Item cura_packout_stand_profile.ini `
  -Destination "$env:APPDATA\Cura\5.0\profiles\"

# Linux:
cp cura_packout_stand_profile.ini \
  ~/.local/share/cura/5.0/profiles/

# Then restart Cura
# Profile will appear in: Profiles > Manage Profiles > WISE² Packout Monitor Stand
```

---

## NEXT STEPS AFTER SUCCESSFUL PRINT

1. ✅ Clean printed parts (remove support material - there should be none)
2. ✅ Sand if desired (240 grit for smooth finish)
3. ✅ Clean with dry cloth
4. ✅ Test-fit bolts and holes
5. ✅ Assemble according to ASSEMBLY_INSTRUCTIONS_BOM.md
6. ✅ Test on actual Packout organizer
7. ✅ Verify monitor fit and stability

---

## CURA RESOURCES

- **Cura Download**: https://ultimaker.com/software/ultimaker-cura
- **Cura Manual**: https://support.ultimaker.com/hc/en-us/categories/360003030720
- **Anycubic Support**: https://www.anycubic.com/support
- **PLA Material Guide**: https://ultimaker.com/materials/pla

---

**This guide is complete and ready to use. Good luck with your first print!**

---

**Document Version**: V1.0  
**Date**: 2026-07-29  
**Revision**: Complete Cura Test & Validation Guide
