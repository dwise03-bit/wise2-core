import sys
from pathlib import Path

sys.path.insert(0, str(Path('/Users/danielwise/.agents/skills/3d-print/scripts')))
import manifold3d as m3d
from generate_model import export_3mf, export_stl

# Credit-card footprint, with a slightly undersized AirTag opening.  Print in
# TPU so the opening can stretch over the AirTag and retain it.
W, H, T = 85.6, 54.0, 1.6
CORNER = 3.0
AIRTAG_D = 31.9
OPENING_D = 31.6

def rounded_plate(w, h, t, r):
    # Union of a center cross and four corner cylinders.
    p = m3d.Manifold.cube([w - 2*r, h, t]).translate([r, 0, 0])
    p = p + m3d.Manifold.cube([w, h - 2*r, t]).translate([0, r, 0])
    for x in (r, w-r):
        for y in (r, h-r):
            p = p + m3d.Manifold.cylinder(height=t, radius_low=r,
                                           circular_segments=32).translate([x, y, 0])
    return p

plate = rounded_plate(W, H, T, CORNER)
hole = m3d.Manifold.cylinder(height=T + 0.4, radius_low=OPENING_D / 2,
                             circular_segments=96).translate([W/2, H/2, -0.2])
part = plate - hole

out = Path('/Users/danielwise/.agents/skills/3d-print/output')
export_3mf(part, out / 'ekster_airtag_card_insert.3mf', name='ekster_airtag_card_insert')
export_stl(part, out / 'ekster_airtag_card_insert.stl')
