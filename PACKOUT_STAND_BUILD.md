# Milwaukee Packout Monitor Stand — Build Notes

**Status:** geometry verified printable. **Fit to a real Packout is unverified.**
**Model:** `packout_monitor_stand.scad` · **Checker:** `tools/verify_stl.py`

---

## Read this first

Two things about this design are genuinely unknown, and no amount of CAD
tidiness fixes them:

1. **The Packout lid dimensions are placeholders.** `rib_pitch = 50`,
   `rib_width = 8`, `rib_height = 3` at the top of the `.scad` were not measured
   from a real organizer. Until you measure yours, the feet will probably not
   engage. This is what `fit_coupon` exists for — print it first.
2. **Print time is unmeasured.** Neither installed slicer would run headless
   (both fail on the vendor bed-exclusion resource), so the time figures have to
   come from your slicer GUI. Any number you may have seen from me earlier for
   print time, filament mass, or safety factor was invented, not derived.

Filament mass below *is* computed — from the actual STL volume and surface area
with a stated shell/infill model. It is an estimate, not a slicer readout.

---

## Parts

`foot`, `saddle_cap` and `cradle` are each printed **twice** from the same STL,
so there are only 5 unique parts. The foot is symmetric — there is no separate
left and right.

| Part | Qty | Bbox (mm) | Est. PLA | Role |
|---|---|---|---|---|
| `fit_coupon` | 1 | 82 × 34 × 6 | 16 g | **print first** — dial in the rib fit |
| `foot` | 2 | 76 × 76 × 40 | 52 g ea | sits on the lid, hosts the tube channel |
| `saddle_cap` | 2 | 39 × 30 × 12 | 10 g ea | bolts down, traps the tube |
| `cradle` | 2 | 34 × 41 × 60 | 23 g ea | monitor slot, slides along the tube |
| `clip_usbc` | 1 | 17 × 14 × 12 | 1.5 g | cable routing |
| `clip_hdmi` | 1 | 20 × 14 × 15 | 2 g | cable routing |

**Full set ≈ 174 g PLA**, plus 16 g for the test coupon.
Every part is a single solid, sits on z = 0, and fits the 260 mm bed.

### Bought parts

| Item | Qty | Note |
|---|---|---|
| 20 × 20 mm aluminium square tube | ~300 mm | length sets the foot spacing |
| M4 × 20 socket cap screw | 4 | cap → foot boss, self-taps into PLA |
| M4 × 16 socket cap screw | 2 | cradle pinch bolts |
| M3 × 10 screw | 2 | cable clips |
| TPU / felt pad, adhesive | 4 | line the monitor slot |

No M4 nuts or T-nuts — the screws self-tap into the printed bosses. (An earlier
BOM listed T-slot nuts; the design no longer uses them.)

---

## Export and verify

```bash
OSCAD="/Applications/OpenSCAD-2021.01.app/Contents/MacOS/OpenSCAD"
mkdir -p stl_output
for p in fit_coupon foot saddle_cap cradle clip_usbc clip_hdmi; do
  "$OSCAD" -o "stl_output/$p.stl" -D "part=\"$p\"" packout_monitor_stand.scad
done
python3 tools/verify_stl.py
```

`verify_stl.py` exits non-zero if any part is more than one body, sits off the
bed, or busts the build volume. **Run it after every geometry edit** — that
check is the whole reason the current model works. The first version of this
model had 4 of 7 parts silently exporting as loose disconnected chunks.

---

## Slicing

Anycubic Kobra X, 0.6 mm nozzle. In the Anycubic slicer the stock
**`0.30mm Standard @Anycubic Kobra X 0.6 nozzle`** process is the right starting
point; in Cura there is no Kobra X definition, so start from Kobra Plus and set
the bed to 260 × 260.

Then set:

| Setting | Value | Why |
|---|---|---|
| Layer height | 0.30 mm | stock profile; 0.32 also fine |
| Walls | 3 | `verify_stl.py` assumes this for its mass estimate |
| Infill | 12 % gyroid | |
| Supports | **off** | geometry is designed support-free — see below |
| Nozzle / bed | 205 / 58 °C | generic PLA |

**Read the print time off the slicer.** I have not measured it.

### Orientation

All parts export already oriented — bottom face flat on the bed, nothing below
z = 0. Do not rotate them. The overhangs that matter:

- **`foot`** — the rib slots are grooves in the underside, printed as bridges
  ~8 mm wide over a 3 mm drop. Fine unsupported. The tube channel opens upward,
  so it needs nothing.
- **`saddle_cap`** — the tube pocket opens *downward*, a 20.5 mm bridge. This is
  the one span worth watching on the first print. If it sags, print the cap
  rotated 180° (roof down) and accept counterbores that need cleaning out.
- **`cradle`** — the slot arm leans 20°, well under the 45° threshold.

---

## Assembly

1. **Print `fit_coupon` and fit it to your Packout.** It has three trial slots
   at nominal −0.5 / nominal / +0.5 mm. Find the one that seats without rock,
   then edit `rib_width` (and `rib_pitch`/`rib_height` if the coupon shows they
   are wrong) at the top of the `.scad` and re-export. **Do not print the feet
   until the coupon fits** — they are 52 g each.
2. Cut the tube. Foot spacing = tube length − ~40 mm of engagement. Deburr.
3. Drop the tube into both foot channels. It stands 7 mm proud of the post top.
4. Slide the two `cradle`s onto the tube before capping, then fit a `saddle_cap`
   over each foot and drive the M4 × 20 screws down into the bosses. Snug only —
   these are self-tapping into PLA; overtightening strips them. Cut a starter
   thread by running each screw in and out once before final assembly.
5. Position the cradles to suit the monitor width and tighten their pinch bolts.
6. Line the cradle slots with the adhesive pads. Slot is 10.9 mm for a 10.3 mm
   monitor, so the pads take up the slack — fit them before trusting the monitor
   to it.
7. Screw the clips to the foot base and route the cables.

---

## Known weaknesses

- **Rib engagement is a plain groove, not a positive lock.** It resists sliding
  but nothing holds the foot down. A real latch needs the measured lid geometry
  first. Treat the current feet as a fit prototype.
- **The feet are heavy** — 52 g each, mostly the 76 × 76 × 6 base plate. There
  is easy weight to remove from the underside once the rib geometry is settled;
  I left it solid rather than risk cutting into the slots.
- **Load capacity is uncalculated.** No FEA has been run. The 20 × 20 aluminium
  tube carries the bending load and will be far stiffer than the printed parts;
  the likely failure points are the self-tapped M4 bosses and the cradle arms.
  Test with the actual monitor before trusting it in a vehicle.
- **Cap bridge** — see orientation note above.

---

## Changing the design

Everything dimensional is a variable at the top of the `.scad`. The ones you are
most likely to touch:

```scad
rib_pitch / rib_width / rib_height   // Packout lid — MEASURE THESE
mon_thick = 10.3                     // your monitor
lean_deg  = 20                        // screen lean back from vertical
tube      = 20                        // if you use a different extrusion
```

Two traps this model already hit, worth avoiding on edits:

- **Never drill a hole wider than the wall it passes through.** A Ø3.7 mm M4 tap
  through a 2.4 mm cheek severed the part into three pieces. Bosses are 9 mm
  wide for exactly this reason.
- **Overlap unioned solids by 2–3 mm, not 0.5 mm.** Thin contacts make CGAL emit
  separate bodies. And `rotate([90,0,0])` extrudes toward −Y — pre-translate or
  the feature lands off the bed.

Re-run `tools/verify_stl.py` after any change.
