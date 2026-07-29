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
2. **There are two variants.** The **tubeless** one (`bracket` ×2) is the
   default recommendation: 5h 11m and 66 g, or **2h 45m on a 0.6 mm nozzle**,
   which is the only configuration that meets the original "under 3 hours"
   target. The **tubed** one is stiffer but 8h 24m and 103 g. Any earlier
   "3h 12m" figure from me was invented, not measured.

Print time and mass below are **measured** — CuraEngine slicing the actual
STLs (`tools/slice_report.py`). Load capacity is still uncalculated.

**Nozzle: 0.4 mm.** Every wall thickness and fit clearance in the model derives
from `nozzle` at the top of the `.scad`, so changing that one number retargets
the whole design.

---

## Parts

`foot`, `saddle_cap` and `cradle` are each printed **twice** from the same STL,
so there are only 5 unique parts. The foot is symmetric — there is no separate
left and right.

| Part | Qty | Bbox (mm) | Est. PLA | Role |
|---|---|---|---|---|
| Part | Qty | Bbox (mm) | Each | PLA ea | Role |
|---|---|---|---|---|---|
| `fit_coupon` | 1 | 82 × 34 × 7 | 55 m | 11 g | **print first** — dial in the rib fit |
| `foot` | 2 | 76 × 70 × 41 | 2h 14m | 28 g | sits on the lid, hosts the tube channel |
| `saddle_cap` | 2 | 38 × 30 × 12 | 29 m | 6 g | bolts down, traps the tube |
| `cradle` | 2 | 34 × 41 × 60 | 1h 18m | 16 g | monitor slot, slides along the tube |
| `clip_usbc` | 1 | 17 × 12 × 12 | 7 m | 1.3 g | cable routing |
| `clip_hdmi` | 1 | 20 × 15 × 15 | 10 m | 2.1 g | cable routing |

**Full set: 8h 24m, 103 g PLA** (0.4 mm nozzle, 0.20 mm layers), plus 55 m for
the coupon. Every part is a single solid, sits on z = 0, fits the 260 mm bed.

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
model had 4 of 7 parts silently exporting as loose disconnected chunks, and the
0.4 mm retarget later pushed a clip 0.02 mm off its own base.

For time and mass, `python3 tools/slice_report.py` drives CuraEngine directly.
Its mass figures supersede the rough shell estimate `verify_stl.py` prints,
which runs about 20 % high.

---

## Slicing

Anycubic Kobra X, **0.4 mm nozzle**. In the Anycubic slicer the stock
**`0.20mm Standard @Anycubic Kobra X 0.4 nozzle`** process is the right starting
point (`0.24mm Standard` if you want it faster and don't mind layer lines). In
Cura there is no Kobra X definition, so start from Kobra Plus and set the bed to
260 × 260.

Then set:

| Setting | Value | Why |
|---|---|---|
| Layer height | 0.20 mm | 0.24 or 0.28 trade finish for speed |
| Walls | 3 | `verify_stl.py` assumes this for its mass estimate |
| Infill | 12 % gyroid | |
| Supports | **off** | geometry is designed support-free — see below |
| Nozzle / bed | 205 / 58 °C | generic PLA |

### Print time

Measured with `tools/slice_report.py` (CuraEngine on the real STLs):

| Nozzle / layer | Tubeless | Tubed |
|---|---|---|
| 0.4 mm, 0.20 mm | 5h 11m · 66 g | 8h 24m · 103 g |
| 0.4 mm, 0.28 mm | 4h 15m · 73 g | 6h 27m · 107 g |
| 0.6 mm, 0.30 mm | 3h 08m · 84 g | 5h 03m · 133 g |
| 0.6 mm, 0.36 mm | **2h 45m · 88 g** | 4h 22m · 139 g |

Only **tubeless on a 0.6 mm nozzle** meets the original "under 3 hours". On a
0.4 mm nozzle it is not reachable at either variant: 66 g in 3 hours needs
~22 g/hr, beyond a Kobra X at three walls.

Note coarser layers *raise* mass while cutting time — the solid top and bottom
layers get thicker — so the two do not trade cleanly. Optimise for whichever you
actually care about.

What was tried, measured, and kept:

- **Tubeless variant** — collapsing foot + cap + cradle into one part cut 3h 12m
  (38 %) and 37 g, and removed the tube and all six M4 screws. Biggest single win.
- **H-profile foot base** — the base only needs material over the ribs and under
  the post, not a solid 76 × 76 slab. Saved 11 min and 2.5 g per foot, no
  functional change. Applied to both variants.
- **`post_h` 34 → 20** — a further 20 min and 5 g per foot, but sits the monitor
  14 mm lower. Left at 34; change it if you want the time.
- **Slicer settings alone** cannot do it: the fastest 0.4 mm config still lands at
  6h 27m tubed. Geometry was the lever, not settings.

### Orientation

All parts export already oriented — bottom face flat on the bed, nothing below
z = 0. Do not rotate them. The overhangs that matter:

- **`foot`** — the rib slots are grooves in the underside, printed as bridges
  ~8 mm wide over a 3 mm drop. Fine unsupported. The tube channel opens upward,
  so it needs nothing.
- **`saddle_cap`** — the tube pocket opens *downward*, a ~20.4 mm bridge. This
  is the one span worth watching on the first print, though a 0.4 nozzle bridges
  noticeably better than a 0.6. If it sags, print the cap rotated 180° (roof
  down) and accept counterbores that need cleaning out.
- **`cradle`** — the slot arm leans 20°, well under the 45° threshold.

---

## Assembly

### Tubeless (variant A)

1. Print and fit `fit_coupon` (see step 1 below), then print two `bracket`s.
2. Seat both brackets on the lid, on ribs spaced to suit your monitor —
   ~250–300 mm apart for a 15.6".
3. Line both slots with the adhesive pads. **The pads are structural** — see
   step 6 below.
4. Lower the monitor into both slots together. Support it until it is seated in
   both; with no crossbar, a bracket can tip on its own.
5. Screw the clips to a bracket base and route the cables.

### Tubed (variant B)

1. **Print `fit_coupon` and fit it to your Packout.** It has three trial slots
   at nominal −0.5 / nominal / +0.5 mm. Find the one that seats without rock,
   then edit `rib_width` (and `rib_pitch`/`rib_height` if the coupon shows they
   are wrong) at the top of the `.scad` and re-export. **Do not print the feet
   until the coupon fits** — they are 38 g each.
2. Cut the tube. Foot spacing = tube length − ~40 mm of engagement. Deburr.
3. Drop the tube into both foot channels. It stands 7 mm proud of the post top.
4. Slide the two `cradle`s onto the tube before capping, then fit a `saddle_cap`
   over each foot and drive the M4 × 20 screws down into the bosses. Snug only —
   these are self-tapping into PLA; overtightening strips them. Cut a starter
   thread by running each screw in and out once before final assembly.
5. Position the cradles to suit the monitor width and tighten their pinch bolts.
6. Line the cradle slots with the adhesive pads. The slot is sized
   `mon_thick + 2*pad_t + line_w` — 11.7 mm for a 10.3 mm monitor with 0.5 mm
   pads — so **the pads are structural, not cosmetic.** Fit them before trusting
   the monitor to it, or use thicker pads and widen `pad_t` to match.
7. Screw the clips to the foot base and route the cables.

---

## Known weaknesses

- **Rib engagement is a plain groove, not a positive lock.** It resists sliding
  but nothing holds the foot down. A real latch needs the measured lid geometry
  first. Treat the current feet as a fit prototype.
- **Tubeless has no crossbar.** The lid and the monitor take the racking load,
  and each bracket can tip until the monitor is seated in both. If that matters,
  use the tubed variant and accept the extra 3h 12m.
- **Print time is dominated by the Packout footprint**, which is driven by
  `rib_pitch` — still a guess. If the real pitch is tighter, both variants shrink
  and get faster. Another reason to measure before printing anything large.
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
nozzle    = 0.4                      // walls + all clearances derive from this
rib_pitch / rib_width / rib_height   // Packout lid — MEASURE THESE
mon_thick = 10.3                     // your monitor
pad_t     = 0.5                      // one slot pad; slot width follows
lean_deg  = 20                       // screen lean back from vertical
tube      = 20                       // if you use a different extrusion
```

If you change `nozzle`, also update `NOZZLE` in `tools/verify_stl.py` so the
mass estimate stays honest.

Two traps this model already hit, worth avoiding on edits:

- **Never drill a hole wider than the wall it passes through.** A Ø3.7 mm M4 tap
  through a 2.4 mm cheek severed the part into three pieces. Bosses are 9 mm
  wide for exactly this reason.
- **Overlap unioned solids by 2–3 mm, not 0.5 mm.** Thin contacts make CGAL emit
  separate bodies. And `rotate([90,0,0])` extrudes toward −Y — pre-translate or
  the feature lands off the bed.
- **Size enclosing shapes off the derived wall, not a constant.** Retargeting to
  0.4 mm grew `wall` and pushed the HDMI clip's loop 0.02 mm outside its own base
  plate; the checker caught it, but only because it was run.

Re-run `tools/verify_stl.py` after any change.
