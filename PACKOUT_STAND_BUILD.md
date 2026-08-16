# Milwaukee Packout Monitor Stand — Build Notes

**Model:** `packout_monitor_stand.scad` · **Checker:** `tools/verify_stl.py` ·
**Timing:** `tools/slice_report.py`

---

## The simple build (use this)

**Don't design the Packout interface — bolt onto proven feet.**

Packout does not snap on: it *slides* in and a tab latches, like a real Packout
box. Getting that profile right is the hard part of this whole project, and
CK Designs' *Packout Feet Easy Alignment* already solves it (4.9 / 127 ratings,
reviewers specifically confirming fitment). Those feet mount anything via
through-holes, so our job shrinks to a small monitor bracket that bolts to them.

**Material: PLA-CF, 0.4 mm hardened steel nozzle.**

Ready-to-print plates are in **`print_ready/`** — see its README.

| Plate | Time | PLA-CF |
|---|---|---|
| `PLATE1_HoleTemplate.3mf` | **8 min** | 1.7 g |
| `PLATE2_Mount_x2.3mf` | **1h 16m** | 35.1 g |

**Total 1h 24m / 37 g**, measured by the Anycubic slicer itself. Plus CK's feet
(their own profile: 0.2 mm layer, 2 walls, 15 % infill).

`print_ready/WISE2_PLA-CF_KobraX_0.4.json` is a PLA-CF filament profile for this
machine — Anycubic ships none (their CF profiles are PA6/PC/PET-CF, S1 Max only).

Note `tools/slice_report.py` predicted 3h 04m for the same parts. It runs
conservative settings (60 mm/s vs Anycubic stock) and **over-estimates time by
roughly 2×**. It is useful for comparing geometry options against each other, not
for planning a print — the vendor slicer figures above are the real ones.

Also needed: **2 × M4 heat-set brass inserts**, 2 × M4 × 20 bolts, 4 adhesive
pads for the slot.

### PLA-CF changes two things

1. **Hardened nozzle required — this is the real constraint.** Carbon fibre is
   abrasive and will wear out brass. Nozzle *diameter* is not the issue: chopped
   fibres are ~50–100 µm, so a 0.4 mm hardened nozzle handles PLA-CF fine and is
   the mainstream setup. Keep the filament dry, though — wet CF plus a small
   nozzle is where clogs actually come from.
2. **Heat-set inserts, not self-tapped threads.** Self-tapping M4 into plain PLA
   was already the weakest joint in this design; PLA-CF is more brittle and holds
   a cut thread worse, which takes it from weak to unreliable. Each mount now has
   two bosses on its top face for M4 brass inserts. Pennies each, and it turns
   the weakest joint into the strongest.

   `insert_d = 5.7` (pilot) and `insert_l = 8.0` are typical but **vary by
   brand** — check your vendor's spec sheet. `hole_template` includes a test boss
   so you can melt one insert in before committing to a mount.

Everything dimensional derives from `nozzle` at the top of the `.scad`, so
retargeting between 0.4 and 0.6 is one line plus a re-export. Update `NOZZLE` in
both tools to match.

Print the feet themselves in the same PLA-CF: it is their shrinkage that decides
whether the bolt pattern lines up, which is why `hole_template` should be printed
in CF too, not plain PLA.

### Bolt pattern — measured, not guessed

Extracted from the `Full Packout Feet Set.3mf` geometry (Regular Dual Cleat):

- Cleat **186 × 50 × 14 mm** — the feet raise the mount 14 mm off the lid
- **Ø4.5 mm** through-holes, **Ø10 mm** head counterbore on the far face
- Four holes in a **single row** at x = ±31.25 and ±70.75, y = 0
- **Fundamental pitch 39.5 mm** — cross-checked against Single Cleat Tight Fit,
  whose two holes sit at ±19.75

`hole_pitch = 39.5` in the `.scad`; 62.5 (the ±31.25 pair) and 141.5 (±70.75)
also exist if you want a wider base. The bolt enters from **below**, up through
the foot, so the mount's holes are blind M4 self-tap — not clearance holes.

### Steps

1. Print `hole_template` (3–7 min) and offer it to your printed feet. If the
   bolts don't drop straight through, fix `hole_pitch` before printing anything
   bigger.
2. Print CK's feet, and two `mount`s.
3. Melt an M4 insert into each boss on the mount's top face, using a soldering
   iron at ~200 °C and a flat tip. Press slowly and keep it square; let it cool
   before loading. Practise on `hole_template` first.
4. Bolt each mount to a set of feet, 2 × M4 × 20 up from underneath. Into brass
   you can torque these properly — that is the point of the inserts.
5. Line both slots with the adhesive pads. **The pads are structural** — the slot
   is `mon_thick + 2*pad_t + line_w`, so without them the monitor rattles.
6. Slide the feet onto the lid and latch them.
7. Lower the monitor into both slots together, supporting it until seated.

### Licence

CK Designs' files are under a Standard Digital File License: no redistribution
and **no derivative works**. So do not vendor their STLs into this repo or ship
them. Our `mount` is an independent part that interoperates via a measured bolt
pattern, which is fine — but if this is ever sold under the WISE² brand, get
that cleared, and don't bundle their geometry.

---

## Still unverified

- **Load capacity.** No FEA, no calculation. Two M4 bolts and a 30 mm column
  carry a ~1.8 kg monitor leaning 20° back. The inserts make the joint far
  stronger than self-tapped PLA, but nobody has calculated whether the column or
  the gussets are adequate. Test before trusting it.
- **PLA-CF is stiffer but more brittle** than plain PLA. Better against creep
  under the bolt load, worse under impact. If this gets knocked about, PETG-CF is
  the tougher choice.
- **`mon_thick = 10.3`** is your measurement of the VILVA panel; the slot follows
  it. Check the fit on the first mount before printing the second.

---

## Older variants (kept, not recommended)

Both of these design the lid interface themselves, using **invented** rib
dimensions (`rib_pitch`, `rib_width`, `rib_height`) that were never measured off
an organizer — and both engage with a plain groove, which is not how Packout
attaches. They are slower and less likely to fit. Superseded by the mount above.

| Variant | Parts | 0.4/0.20 | 0.6/0.30 |
|---|---|---|---|
| `mount` ×2 (recommended) | 2 printed | 3h 04m · 39 g | 1h 51m · 50 g |
| `bracket` ×2 + clips | 4 printed | 5h 11m · 66 g | 2h 45m · 88 g |
| `foot`/`saddle_cap`/`cradle` ×2 + tube | 6 printed + tube + 6 screws | 8h 24m · 103 g | 4h 22m · 139 g |

Legacy figures still use self-tapped threads; only `mount` has been updated for
PLA-CF and heat-set inserts.

The tubed one is the only variant with a rigid crossbar, so it is the stiffest
if you ever need that. `fit_coupon` sweeps rib slot widths for either.

---

## Export and verify

```bash
OSCAD="/Applications/OpenSCAD-2021.01.app/Contents/MacOS/OpenSCAD"
mkdir -p stl_output
for p in hole_template mount; do
  "$OSCAD" -o "stl_output/$p.stl" -D "part=\"$p\"" packout_monitor_stand.scad
done
python3 tools/verify_stl.py        # topology gate
python3 tools/slice_report.py      # real time + mass via CuraEngine
```

`verify_stl.py` fails on multi-body, off-bed, or oversized parts. **Run it after
every edit.** It has caught three real breakages so far: the original model
exporting 4 of 7 parts as loose chunks, the 0.4 mm retarget pushing a clip
0.02 mm off its own base, and a check part that came out in two pieces.

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
