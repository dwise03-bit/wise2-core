# Print-ready — WISE² Packout Monitor Mount

Anycubic Kobra X · **0.4 mm hardened steel** nozzle · PLA-CF

## Print in this order

| # | File | Time | PLA-CF |
|---|---|---|---|
| 1 | `PLATE1_HoleTemplate.3mf` | **8 min** | 1.7 g |
| 2 | `PLATE2_Mount_x2.3mf` | **1h 16m** | 35.1 g |

**Total 1h 24m / 37 g.** Times are from the Anycubic slicer itself, not an estimate.

## Plate 1 first — it is an 8 minute gate

`hole_template` does two jobs:

1. **Bolt pattern.** Offer it to your printed Packout feet. Both M4 bolts must
   drop straight through. If not, fix `hole_pitch` in the `.scad` (measured at
   39.5 mm from CK's 3mf) and re-export before printing plate 2.
2. **Insert fit.** Melt one M4 heat-set insert into the test boss. Soldering iron
   ~200 °C, flat tip, press slowly and keep it square. If the boss splits or the
   insert sinks loose, adjust `insert_d` (5.7 mm pilot) to your brand's spec.

Do not skip it. Plate 2 is 1h 16m; this is 8 minutes.

## Filament profile

`WISE2_PLA-CF_KobraX_0.4.json` — import it into the Anycubic slicer.

Anycubic ships **no PLA-CF profile for the Kobra X** (their only CF profiles are
PA6/PAHT/PC/PET-CF, and only for the S1 Max), so this is derived from their
PLA+ profile with:

- **Nozzle 220 °C / 225 °C first layer** (up from 205/215). CF raises viscosity,
  and hardened steel conducts a little worse than brass.
- **Bed 55 °C.** Their stock PLA+ profile sets bed 60 °C while declaring
  vitrification at 60 °C, so it warns against itself. 55 clears that. Raise to 60
  if adhesion is poor and ignore the warning.

## Before you start

- **Hardened nozzle fitted.** CF destroys brass. This is the one hard requirement.
- **Filament dry.** Wet CF is the actual clog risk on a 0.4 mm bore, not the bore.
- Bed clean, levelled.

## Hardware

- 2 × M4 heat-set brass inserts
- 2 × M4 × 20 bolts
- 4 adhesive pads for the monitor slots — **structural, not cosmetic.** The slot
  is oversized on purpose and the pads take up the slack.
- CK Designs' Packout feet, printed in the same PLA-CF (their shrinkage is what
  decides whether the 39.5 mm pattern lines up)

## Not verified

**Load capacity has never been calculated.** No FEA at any point. Two M4s and a
30 mm column hold a ~1.8 kg monitor leaning 20° back. Test it before trusting it,
and note PLA-CF is stiffer but more brittle than plain PLA — PETG-CF is tougher
if this gets knocked about.
