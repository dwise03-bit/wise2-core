# Milwaukee Packout Monitor Stand
## 3D Print Settings & Orientation Guide

**Printer**: Anycubic Kobra X (260 × 260 mm bed)  
**Nozzle**: 0.6 mm  
**Material**: PLA  
**Target**: <3 hours total print time, zero supports  

---

## PRINT SETTINGS (FOR ALL PARTS)

### Slicer Software Setup (Cura, PrusaSlicer, or Bambu Studio)

```
┌─────────────────────────────────────────────┐
│ TEMPERATURE SETTINGS                         │
├─────────────────────────────────────────────┤
│ Nozzle Temperature:         205°C            │
│ Bed Temperature:            58°C             │
│ Nozzle Temp (first layer):  210°C            │
│ Bed Temp (first layer):     60°C             │
│ Heated chamber:             OFF              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ LAYER & RESOLUTION                          │
├─────────────────────────────────────────────┤
│ Layer Height:               0.32 mm          │
│ Line Width:                 0.65 mm          │
│ (108% of 0.6 mm nozzle)                    │
│ First Layer Height:         0.40 mm          │
│ First Layer Line Width:     0.75 mm          │
│ Wall Thickness:             1.95 mm (3x)   │
│ Top/Bottom Thickness:       1.28 mm (4x)   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ INFILL & STRUCTURE                          │
├─────────────────────────────────────────────┤
│ Infill Pattern:             Gyroid           │
│ Infill Density:             12%              │
│ Infill Before Walls:        YES              │
│ Infill Line Direction:      45°              │
│ Zig-Zag Pattern:            NO               │
│ Monotonic Top/Bottom:       YES              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ PRINT SPEED                                  │
├─────────────────────────────────────────────┤
│ Print Speed (outer):        60 mm/s          │
│ Print Speed (inner):        80 mm/s          │
│ Print Speed (infill):       80 mm/s          │
│ First Layer Speed:          30 mm/s          │
│ Travel Speed:               100 mm/s         │
│ Retraction Speed:           25 mm/s          │
│ Retraction Amount:          5 mm             │
│ Retraction Hop Height:      0.2 mm           │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ ADHESION & SUPPORTS                         │
├─────────────────────────────────────────────┤
│ Build Plate Adhesion:       Skirt (5mm)      │
│ Raft:                       OFF              │
│ Brim:                       OFF              │
│ Supports:                   OFF (CRITICAL)   │
│ Support Z Distance:         N/A              │
│ Support XY Distance:        N/A              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ ADVANCED SETTINGS                           │
├─────────────────────────────────────────────┤
│ Minimum Wall Flow:          50%              │
│ Extruder Prime Amount:      0 mm³            │
│ Coasting:                   Enabled          │
│ Coasting Volume:            0.064 mm³        │
│ Wipe Nozzle:                NO               │
│ Print Thin Walls:           YES              │
│ Alternate Extra Walls:      YES              │
│ Z Offset:                   0.0 mm           │
│ (Adjust if first layer too high/low)        │
└─────────────────────────────────────────────┘
```

### PLA Material Profile (Anycubic)

**Printer Pre-Heat Sequence**:
1. Heat bed to 58°C
2. Heat nozzle to 205°C
3. Wait for both to stabilize (2 minutes)
4. Run bed leveling (auto or manual)
5. Load filament (if not already loaded)
6. Start print

**Filament Type**: Standard PLA (not matte, not translucent)

**Drying** (important for PLA):
- Store filament in dry box with silica desiccant
- If exposed >4 hours: Dry at 50°C for 2 hours before printing
- Signs of moisture: Surface looks dull, weak layer adhesion

---

## PART-BY-PART PRINT SETTINGS

### LEFT FOOT (Part A-001)

**Orientation**:
```
     TOP VIEW                    SIDE VIEW
  ┌──────────────┐           ┌────────────┐
  │ ╱╲╱╲╱╲╱╱╱╱  │           │████████████│  ← Standing upright
  │              │           │████████████│     (engagement ribs face UP)
  │ WISE² [logo] │           │████████████│
  └──────────────┘           └────────────┘
  
  Ribs facing UP = No supports needed
  Logo facing DOWN = Clean bottom surface
```

**Placement on Bed**:
- Position: Front-left quadrant of bed
- Orientation: Ribs UP, cable clip mount at rear
- Clearance: 20 mm from edge (prevent warping)

**Print Time**: ~45 minutes  
**Weight (printed)**: ~12 g  
**Filament**: ~4.0 m  

**Print Quality Checklist**:
- ✅ First layer: Even nozzle pressure, no gaps
- ✅ Ribs: Clean, no bridging failure
- ✅ Slot: Smooth interior
- ✅ Top surface: Glossy finish (no print artifacts)

**Post-Print**:
- Cool on bed for 2 minutes
- Remove with plastic scraper (NEVER pry with metal)
- Clean nozzle while warm (wipe on cloth)

---

### RIGHT FOOT (Part A-002)

**Orientation**: Mirror of left foot

**Placement on Bed**: Front-right quadrant (nests next to left foot)

**Combined Print Time** (both feet): ~90 minutes  
**Combined Weight**: ~24 g  
**Combined Filament**: ~8.0 m  

---

### CROSSBAR CLAMP ADAPTERS (Part A-003, A-004)

**Orientation**:
```
     TOP VIEW                    SIDE VIEW
  ┌──────────┐               ┌──────────┐
  │ M4 Holes │               │  ║       │  ← Mounting tab DOWN
  │ ╱╲╱╱╱╱╱  │               │ ║║║║║║║║  │     (connects to foot)
  │ Clamp    │               │ ╲╲╲╲╲╲╲╲ │
  └──────────┘               └──────────┘
  
  Side-mounted, tab pointing toward foot
  No supports needed (ribs bridge cleanly)
```

**Placement on Bed**: Center area (after feet are printing)

**Print Time** (each): ~20 minutes  
**Weight** (each): ~9 g  
**Filament** (each): ~3.0 m  

**Print Quality**:
- ✅ M4 holes: Clean, no thread striping
- ✅ Clamp body: Smooth curves
- ✅ Mounting tab: Flush with clamp body

---

### MONITOR HOLDER (Part A-005)

**Orientation**:
```
     TOP VIEW                      SIDE VIEW
  ┌────────────────────┐       ┌──────────────┐
  │ Cable pass-through │       │ ╱╱╱╱╱╱╱╱╱╱╱  │  ← Angled UP
  │ WISE²              │       │  Monitor Slot │     (20° viewing angle)
  │ [────────────────] │       │ ╲╲╲╲╲╲╲╲╲╲╲  │
  └────────────────────┘       └──────────────┘
  
  Slot UP, angled toward user
  No supports needed (angle is <45°, ribs bridge)
```

**Placement on Bed**: Center, after feet cleared

**Print Time**: ~50 minutes  
**Weight**: ~20 g  
**Filament**: ~6.5 m  

**Print Quality**:
- ✅ Monitor slot: Smooth, no layer ridges
- ✅ Cable routing: Open, no blockages
- ✅ Angle face: Smooth transition
- ✅ WISE² logo: Crisp (no fuzzy text)

---

### QUICK-RELEASE LOCK CAPS (Part A-006, A-007)

**Orientation**: Cap-side UP (flat printing face)

```
     TOP VIEW              SIDE VIEW
  ┌────────────┐       ┌──────────┐
  │ Flat       │       │  |╱╲|    │  ← Flat side DOWN
  │ Surface    │       │  |  |    │     (easier to print)
  │ [Thread]   │       │  |__|    │
  └────────────┘       └──────────┘
```

**Placement on Bed**: Anywhere (small parts)

**Print Time** (each): ~3 minutes  
**Weight** (each): ~2 g  
**Filament** (each): ~0.6 m  

---

### USB-C CABLE CLIP (Part A-008)

**Orientation**: Mount plate DOWN, cable loop UP

```
     TOP VIEW              SIDE VIEW
  ┌────────┐           ┌────────┐
  │ Loop   │           │  ⊙      │  ← Loop UP
  │ [⊙]    │           │ [████]  │     (no supports)
  │ Mount  │           │        │
  └────────┘           └────────┘
```

**Print Time**: ~3 minutes  
**Weight**: ~1.5 g  
**Filament**: ~0.5 m  

---

### HDMI CABLE CLIP (Part A-009)

**Orientation**: Mount plate DOWN, cable loop UP  
**Print Time**: ~3 minutes  
**Weight**: ~1.8 g  
**Filament**: ~0.6 m  

---

## PRINT SCHEDULE (RECOMMENDED)

### Batch 1: Feet (Parallel if 2 Printers Available)
- Left Foot + Right Foot
- Time: ~90 minutes
- Weight: ~24 g
- Filament: ~8.0 m

### Batch 2: Main Components
- Monitor Holder + Crossbar Adapters (×2)
- Time: ~90 minutes
- Weight: ~45 g
- Filament: ~12.5 m

### Batch 3: Accessories
- Lock Caps (×2) + Cable Clips (×2)
- Time: ~30 minutes
- Weight: ~8 g
- Filament: ~2.2 m

**TOTAL SEQUENTIAL**: ~3.3 hours (exceeds 3-hr target by 20 min)  
**TOTAL PARALLEL** (3 printers): ~90 minutes

### Optimization to Hit <3 Hours

**Option A**: Reduce infill to 10% (vs 12%)
- Save: ~10 minutes
- Trade-off: Slightly less stiff (still >3× safety factor)

**Option B**: Increase layer height to 0.36 mm
- Save: ~15 minutes
- Trade-off: Visible layer lines, may need sanding

**Option C**: Reduce first layer to 30 mm/s (vs custom)
- Not recommended (first layer is critical)

**RECOMMENDED**: Use Option A (reduce infill to 10% only)

---

## BED PREPARATION & LEVELING

### Pre-Print Checklist

- ✅ Bed is clean (isopropyl alcohol wipe)
- ✅ Nozzle is clean (previous filament burned off)
- ✅ Bed is level (paper test at 4 corners + center)
  - Adjust bed until paper is slightly gripped by nozzle
  - Thickness of paper = ~0.1 mm (perfect gap)
- ✅ Filament loaded and purging correctly
- ✅ Print bed is free of debris/bumps
- ✅ Glue stick or PEI sheet is present (optional, helps removal)

### First Layer Manual Leveling

1. Heat bed to 58°C, nozzle to 205°C
2. Disable extruder motor (move nozzle to center manually)
3. Place paper under nozzle
4. Adjust bed until paper is gripped with light resistance
5. Test at 4 corners: front-left, front-right, rear-left, rear-right
6. Adjust leveling knobs until consistent across bed
7. Re-test center
8. Start print

### Automatic Leveling (if Kobra X has bed sensor)

1. Run leveling probe (Menu > Leveling)
2. Wait for probe to complete
3. Observe mesh map (should be ±0.2 mm)
4. If mesh is uneven >0.5 mm: Manually level bed again
5. Start print

---

## PRINT MONITORING & TROUBLESHOOTING

### First Layer Failure Diagnostics

| Symptom | Cause | Solution |
|---------|-------|----------|
| Filament not sticking | Bed too cold | Increase bed temp to 62°C |
| Filament sticks too much | Bed too hot | Reduce bed temp to 55°C |
| Gaps between lines | Nozzle too high | Lower Z offset by 0.1 mm |
| Filament dragging | Nozzle too low | Raise Z offset by 0.1 mm |
| Nozzle clogs | Filament too cold | Increase nozzle to 210°C |
| Warping (corners curl) | Bed cooling too fast | Reduce draft, increase enclosure temp |

### Mid-Print Monitoring

- **Time 0-10 min**: Watch first layer (should be glossy, no gaps)
- **Time 10-60 min**: Spot-check every 15 min (no extrusion errors)
- **Time 60-end**: Less critical (infill is forgiving)

### Post-Print Inspection

After each part cools:

1. **Visual Inspection**
   - ✅ No layer shifts (ghosting)
   - ✅ No blob/ooze marks
   - ✅ Surface smooth (not fuzzy)
   - ✅ Edges sharp (not rounded from heat)

2. **Dimensional Check**
   - Monitor slot: 10.5 ± 0.3 mm (use calipers)
   - M4 holes: 4.2 ± 0.1 mm (dry-fit bolt)
   - M3 holes: 3.2 ± 0.1 mm (dry-fit bolt)

3. **Mechanical Test**
   - Flex test: Gentle press should have <1 mm deflection
   - Tap test: No hollow sound (indicates voids)

---

## MATERIAL USAGE SUMMARY

```
Part                  Print Time    Weight    Filament
────────────────────────────────────────────────────
Left Foot             45 min        12 g      4.0 m
Right Foot            45 min        12 g      4.0 m
Crossbar Clamp (L)    20 min        9 g       3.0 m
Crossbar Clamp (R)    20 min        9 g       3.0 m
Monitor Holder        50 min        20 g      6.5 m
Lock Cap (L)          3 min         2 g       0.6 m
Lock Cap (R)          3 min         2 g       0.6 m
USB-C Clip            3 min         1.5 g     0.5 m
HDMI Clip             3 min         1.8 g     0.6 m
────────────────────────────────────────────────────
TOTAL (All PLA)       3 hr 12 min   69 g      23.0 m

Additional:
TPU Pads (separate)   15 min        8 g       2.7 m
────────────────────────────────────────────────────
TOTAL PROJECT         3 hr 27 min   77 g      25.7 m

Filament Cost @ $0.15/gram: $3.45 (PLA) + $0.80 (TPU) = $4.25
```

---

## STORAGE & LONGEVITY

### Filament Storage (PLA)
- Dry storage: Spool box with desiccant
- Temperature: 15–25°C
- Humidity: <20% RH (use silica gel packs)
- Shelf life: 1 year in dry storage
- Check for brittleness before printing (bend test)

### Printed Part Storage
- Dry environment (not damp basement)
- Avoid direct sunlight (UV degrades PLA)
- Temperature: 15–25°C
- Do NOT store in heated vehicles (warping risk)
- Re-print replaceable feet annually (wear item)

---

## CALIBRATION & TUNING

### Nozzle Temperature Tuning

PLA prints best between 200–210°C:
- **200°C**: Excellent surface quality, but slow extrusion
- **205°C**: BEST (recommended)
- **210°C**: Faster, but slight stringing risk
- **215°C**: Too hot (nozzle ooze, blurry details)

**Test**: Print small tower, inspect top surface

### Bed Temperature Tuning

PLA is less bed-temperature-sensitive than ABS:
- **55°C**: Minimum (good for fast removal)
- **58°C**: BEST (recommended)
- **60°C**: Slightly better adhesion, but harder to remove
- **65°C+**: Risk of bed warping, not needed

### Infill Density Trade-Off

| Density | Weight | Time | Cost | Stiffness |
|---------|--------|------|------|-----------|
| 5% | 63 g | 2h 50m | $3.20 | Too flexy |
| 10% | 66 g | 3h 00m | $3.30 | Good balance |
| 12% | 69 g | 3h 12m | $3.45 | Recommended |
| 15% | 73 g | 3h 30m | $3.65 | Overkill |
| 20% | 78 g | 3h 50m | $3.90 | Excessive |

**Recommendation**: Stick with 12% (sweet spot)

---

## CURA EXPORT SETTINGS

To export STL from OpenSCAD and import to Cura:

```
OpenSCAD Export:
  File → Export as STL
  Tolerance: 0.05 mm (good detail/small file)
  Angular Tolerance: 0.01 degrees
  Click "Export"

Cura Import:
  File → Open File
  Select STL file
  Auto-place on bed
  Check orientation (compare to guide above)
  Adjust if needed
  Export G-code (File → Export as G-code)
```

---

## NEXT STEPS

1. ✅ Prepare bed & level nozzle
2. ✅ Load PLA filament
3. ✅ Import STLs to slicer (use settings above)
4. ✅ Orient each part (see diagrams)
5. ✅ Slice & export G-code
6. ✅ Print Batch 1 (Feet)
7. ✅ Monitor first layer for 5 minutes
8. ✅ Return when done, remove parts
9. ✅ Clean nozzle, repeat for Batches 2 & 3
10. ✅ Proceed to Assembly Instructions

---

**TOTAL PROJECT PRINT TIME**: 3 hours 12 minutes (sequential)  
**TOTAL FILAMENT**: 69 g PLA + 8 g TPU  
**TOTAL COST**: ~$4.25 in materials
