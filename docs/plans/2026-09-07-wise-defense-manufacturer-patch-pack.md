# WISE DEFENSE LLC Manufacturer Patch Pack — Implementation Plan

## Source of truth

- Approved reference: `/Users/danielwise/Desktop/patches.png`
- Brand: WISE² / WISE DEFENSE LLC
- Palette: black, warm metallic gold, signal red, white only where required for legibility
- Explicit exclusion: no bear artwork
- Output directory: `manufacturer-patch-pack/`

## Deliverables

Create 10 individual vector masters in `masters/`, one transparent PNG preview per master in `previews/`, and one production/spec sheet at the pack root.

1. Primary Logo Patch — 3.5 × 2.5 in — embroidered — Velcro backing
2. Motto Patch — 3.5 × 2 in — embroidered — Velcro backing
3. Crew Patch — 3 × 2 in — embroidered — Velcro backing
4. Crown Patch — 2.5 × 2 in — PVC/rubber — Velcro backing
5. W² Patch — 2 × 2 in — woven — sew-on / Velcro
6. Flag Patch — 3.5 × 2 in — embroidered — Velcro backing
7. Wordmark Patch — 4 × 1.5 in — embroidered — Velcro backing
8. 1776 Patch — 3 × 1.5 in — embroidered — Velcro backing
9. Owl Patch — 2.5 × 2.5 in — PVC/rubber — Velcro backing
10. Lifestyle Patch — 2.5 × 2 in — embroidered — Velcro backing

## Build method

- Use deterministic, editable SVG masters with no raster dependencies.
- Use bold geometric/brush-style approximations only where native fonts are unavailable; all copy remains live SVG text and is listed verbatim in the spec sheet.
- Include a black base/edge, gold primary marks, red accent strokes, and a transparent outside-the-patch area.
- Render previews through `rsvg-convert` at 4× nominal size; retain alpha transparency.
- Keep manufacturer notes separate from artwork so production can substitute thread/PVC colors without redrawing.

## Validation

- Confirm 10 SVG masters and 10 PNG previews exist.
- Parse SVG dimensions and confirm each matches the specified physical size.
- Confirm PNG alpha channel and nonzero visible content.
- Inspect a contact sheet for hierarchy, legibility, palette, and absence of bear artwork.
- Report any limitations: vector approximation of supplied raster reference; final thread/PVC swatches remain manufacturer-dependent.
