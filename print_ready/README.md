# Print-ready — WISE² Packout Monitor Mount

Anycubic Kobra X · **0.4 mm hardened steel** nozzle · PLA-CF

## Print

| File | Time | PLA-CF |
|---|---|---|
| `PLATE2_Mount_x2.3mf` | **1h 16m** | 35.1 g |

Times are from the Anycubic slicer itself, not an estimate.

**Before you hit print, check one number:** `insert_d = 5.7` is the pilot hole for
the M4 heat-set inserts, and it varies by brand. If your inserts are not ~6.0 mm
OD × 8 mm long, set `insert_d` / `insert_l` in the `.scad` and re-export.

Recovery if it turns out wrong: too tight, run a 5.8–6.0 mm drill through the
boss by hand; too loose, more iron heat and a sliver of filament packed alongside.
Only two holes per mount, so it is not fatal either way.

## `PLATE1_HoleTemplate.3mf` — optional 8 min pre-check

Kept if you want it. It confirms the 39.5 mm bolt pattern against your real
printed feet and lets you test-melt one insert first. Skippable because feet and
mounts printed in the same PLA-CF shrink proportionally on the same 39.5 mm, so
the pattern stays matched.

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
