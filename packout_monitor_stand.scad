// ============================================================================
// WISE2 Milwaukee Packout Monitor Stand  --  v2 (verified geometry)
// ============================================================================
// Every part is verified to be a SINGLE connected solid, sitting on z=0,
// in positive XY space.  Verify with: tools/verify_stl.py
//
// CLI export:
//   openscad -D 'part="foot"' -o stl_output/foot.stl packout_monitor_stand.scad
// ============================================================================

$fn = 48;

// ---- Nozzle ----------------------------------------------------------------
// Wall thicknesses and every fit clearance below are derived from this, so the
// model retargets to another nozzle by changing this one number.
nozzle = 0.4;   // PLA-CF is fine through a HARDENED 0.4: chopped fibres are
                // ~50-100 um. Abrasion is the real issue, so hardened steel is
                // the hard requirement -- not a bigger nozzle.
line_w = nozzle * 1.05;              // slicer line width (~105% of nozzle)

// ============================================================================
// !! UNVERIFIED -- MEASURE YOUR PACKOUT BEFORE PRINTING THE FEET !!
// ============================================================================
// These Packout lid numbers are PLACEHOLDERS. They were not measured from a
// real organizer. Print `fit_coupon` first (~10 min, ~4 g) and adjust these
// three values until the coupon seats on your lid without rock.
rib_pitch  = 50.0;   // centre-to-centre spacing of the lid's moulded ribs
rib_width  =  8.0;   // width of one rib
rib_height =  3.0;   // how far the rib stands proud of the lid
rib_clear  =  0.4;   // slot clearance added to rib_width
// ============================================================================

// ---- Monitor ---------------------------------------------------------------
mon_thick   = 10.3;  // measured VILVA V156F1 thickness
pad_t       =  0.5;  // thickness of ONE adhesive pad lining the slot
// The slot is deliberately oversized: the pads take up the slack and do the
// gripping. Bare slot minus pads leaves ~one line width of play.
//
// slot_adjust is the fit knob -- negative is tighter.
// Set for running BARE, no pads:
//   10.3 + 1.0 + 0.42 - 1.1 = 10.62 nominal against a 10.3 mm panel
//   -> 0.32 mm total clearance, and FDM slots print a touch under, so snug.
// Do NOT use -1.4: that lands at 10.32 on a 10.3 panel, i.e. no clearance at
// all, and it will not assemble.
// If pads are ever added back, -0.5 gives 11.22 (0.1 mm interference on 0.5 pads).
slot_adjust = -1.1;
slot_w      = mon_thick + 2*pad_t + line_w + slot_adjust;
slot_depth  = 22.0;  // how deep the monitor sits into the cradle
lean_deg    = 20.0;  // screen leans BACK this many degrees from vertical

// ---- Crossbar --------------------------------------------------------------
tube        = 20.0;  // 20x20 aluminium square tube
tube_fit    = tube + line_w;           // slip fit; FDM bores print undersized

// ---- Fasteners -------------------------------------------------------------
// Holes print undersized by roughly half a line width, so compensate with it.
m4_free     = 4.2 + line_w/2;          // M4 clearance
m4_tap      = 3.3 + line_w/2;          // M4 self-tapping into PLA
m4_head     = 7.6;                     // socket head counterbore
m3_free     = 3.2 + line_w/2;

// ---- Print / structure -----------------------------------------------------
// Round the wall up to a whole number of extrusions >= 2.4 mm so the slicer
// fills it solid with no gap-fill stripe down the middle.
wall        = line_w * ceil(2.4 / line_w);
// Base plate must leave a full wall of material above the rib slots, so it
// grows automatically if you measure a taller rib.
plate_t     = max(6.0, rib_height + wall + 1);
corner_r    = 4.0;

// ============================================================================
// helpers
// ============================================================================

// Rounded rectangular slab, corner radius r, sitting on z=0, origin at corner.
module slab(x, y, z, r=corner_r) {
    hull() for (i=[r, x-r], j=[r, y-r])
        translate([i, j, 0]) cylinder(r=r, h=z);
}

// Right-triangle gusset in the XZ plane, thickness t along +Y (y = 0..t).
// rotate([90,0,0]) sends +Z to -Y, so pre-translate to land back in +Y.
module gusset(len, ht, t) {
    translate([0, t, 0])
        rotate([90, 0, 0])
            linear_extrude(t)
                polygon([[0,0], [len,0], [0,ht]]);
}

// ============================================================================
// PART: fit_coupon   -- superseded by snap_coupon; kept for the tubed variant
// ============================================================================
// Three trial rib slots at -0.5 / nominal / +0.5 mm width so you can find the
// engagement that actually fits your lid. ~4 g, ~10 min.
module fit_coupon() {
    cw = rib_width + rib_clear;      // nominal
    l  = rib_pitch + cw + 24;
    difference() {
        slab(l, 34, plate_t, 3);
        // three trial slots across Y: nominal-0.5, nominal, nominal+0.5
        for (k = [0:2])
            translate([12, 4 + k*10, plate_t - rib_height])
                cube([rib_pitch, cw + (k - 1)*0.5, rib_height + 1]);
    }
}

// ============================================================================
// PART: foot   -- symmetric, so ONE stl prints both left and right
// ============================================================================
base_x = 76;
// The base must straddle BOTH ribs with material to spare, so derive it from
// the rib spacing rather than hardcoding it (a fixed 46 left the slots hanging
// off the edge and shed slivers).
base_margin = 9;
base_y = rib_pitch + rib_width + rib_clear + 2*base_margin;   // 76.4 @ defaults
post_h = 34;         // top of base -> top of post
// The post must be wide enough to host the tube channel PLUS a solid bolt boss
// either side. An M4 tap needs ~2 mm of meat all round, so boss_w >= 8.
boss_w = 9;
post_x = tube_fit + 2*boss_w;          // 38.5
post_y = 30;
sad_depth = 13;      // how deep the tube drops into the channel
boss_dx = tube_fit/2 + boss_w/2;       // bolt centre offset from post centre
tube_proud = tube - sad_depth;         // tube sticks this far above the post top

// The base only needs material where the ribs and the post are, so it is an
// H: a transverse bar over each rib, joined by a central spine. A solid slab
// here cost ~25 min per foot for nothing.
bar_w   = rib_width + rib_clear + 12;      // rib slot + 6 mm either side
spine_x = post_x + 8;
module foot_base() {
    cx = base_x/2;
    union() {
        for (s = [-1, 1])
            translate([0, base_y/2 + s*rib_pitch/2 - bar_w/2, 0])
                slab(base_x, bar_w, plate_t, 3);
        // spine, overlapping both bars
        translate([cx - spine_x/2, base_y/2 - rib_pitch/2 + bar_w/2 - 3, 0])
            slab(spine_x, rib_pitch - bar_w + 6, plate_t, 3);
    }
}

module foot() {
    cx = base_x/2;
    difference() {
        union() {
            foot_base();

            // upright post -- overlaps the plate so the union is one body.
            // The post itself forms the tube channel and both bolt bosses.
            translate([cx - post_x/2, base_y/2 - post_y/2, plate_t - 2])
                slab(post_x, post_y, post_h + 2, 3);

            // gussets both sides -> symmetric. Overlap the post by 3 mm and
            // embed 3 mm into the plate; thin contacts make CGAL shed bodies.
            for (s = [0, 1])
                translate([cx + (s ? post_x/2 - 3 : -post_x/2 + 3),
                           base_y/2 - post_y/2, plate_t - 3])
                    mirror([s ? 0 : 1, 0, 0])
                        gusset(20, post_h * 0.8, post_y);
        }

        // --- rib slots in the underside of the base (Packout engagement) ---
        for (s = [-1, 1])
            translate([-1, base_y/2 + s*rib_pitch/2 - (rib_width+rib_clear)/2, -0.5])
                cube([base_x + 2, rib_width + rib_clear, rib_height + 0.5]);

        // --- tube channel: square, open at the top, runs through in Y ---
        translate([cx - tube_fit/2, -1, plate_t + post_h - sad_depth])
            cube([tube_fit, base_y + 2, sad_depth + 20]);

        // --- M4 tapped holes, VERTICAL, down into the solid bosses ---
        // Ø3.7 into a 9 mm boss leaves 2.65 mm wall each side.
        for (s = [-1, 1])
            translate([cx + s*boss_dx, base_y/2, plate_t + post_h - 13])
                cylinder(d=m4_tap, h=14);

        // --- cable-clip mount on the base, front edge ---
        translate([10, 9, plate_t - 4]) cylinder(d=m3_free, h=8);
    }
}

// ============================================================================
// PART: saddle_cap   -- clamps the tube down into the foot saddle
// ============================================================================
// Bolts down onto the foot's bosses, arching over the proud part of the tube.
module saddle_cap() {
    roof = 4.8;
    h    = tube_proud + roof;          // 7 + 4.8 = 11.8
    difference() {
        slab(post_x, post_y, h, 3);
        // pocket for the proud part of the tube (open at the bottom)
        translate([post_x/2 - tube_fit/2, -1, -1])
            cube([tube_fit, post_y + 2, tube_proud + 1]);
        // M4 clearance + socket-head counterbore, on the foot's boss centres
        for (s = [-1, 1])
            translate([post_x/2 + s*boss_dx, post_y/2, -1]) {
                cylinder(d=m4_free, h=h + 2);
                translate([0, 0, 1 + roof]) cylinder(d=m4_head, h=h);
            }
    }
}

// ============================================================================
// PART: cradle   -- monitor slot bracket, slides on the tube (x2)
// ============================================================================
// Two small cradles beat one 220 mm beam: less filament, fits the bed easily,
// and the spacing is adjustable for other monitors.
cr_x = 34;
cr_y = 30;
clamp_h = tube_fit + 2*wall;   // 25.3

module cradle() {
    arm_h = slot_depth + 10;
    difference() {
        union() {
            // clamp block around the tube
            slab(cr_x, cr_y, clamp_h, 3);
            // leaning arms that carry the monitor slot -- overlap the block by
            // 4 mm. Rotating about the block centre keeps the arm in +Y.
            translate([cr_x/2, cr_y/2, clamp_h - 4])
                rotate([-lean_deg, 0, 0])
                    translate([-(slot_w/2 + wall), -cr_y/2, 0])
                        slab(slot_w + 2*wall, cr_y, arm_h + 4, 2);
        }

        // tube bore, straight through in Y
        translate([cr_x/2 - tube_fit/2, -1, wall]) cube([tube_fit, cr_y + 2, tube_fit]);

        // monitor slot, following the lean
        translate([cr_x/2, cr_y/2, clamp_h - 4])
            rotate([-lean_deg, 0, 0])
                translate([-slot_w/2, -cr_y/2 - 1, 8])
                    cube([slot_w, cr_y + 2, arm_h + 6]);

        // pinch bolt: clearance in the near cheek, tap in the far cheek
        translate([cr_x/2, -1, wall + tube_fit/2])
            rotate([-90, 0, 0]) cylinder(d=m4_free, h=cr_y/2 + 1);
        translate([cr_x/2, cr_y/2, wall + tube_fit/2])
            rotate([-90, 0, 0]) cylinder(d=m4_tap, h=cr_y/2 + 2);
        // pinch relief slot so the cheek can actually flex
        translate([-1, cr_y/2 - 0.6, wall + tube_fit + 1])
            cube([cr_x + 2, 1.2, clamp_h]);
    }
}

// ============================================================================
// PART: bracket   -- TUBELESS VARIANT. Packout foot and monitor slot in one.
// ============================================================================
// Printed twice, it replaces foot x2 + saddle_cap x2 + cradle x2 + the aluminium
// tube: 6 printed parts and 6 screws down to 1 part and none.
//
// The tradeoff is real: with no crossbar tying the two brackets together, the
// Packout lid and the monitor itself carry the racking load. Fine on a desk,
// unproven in a moving vehicle. Spacing is set by which ribs you seat them on,
// so it is coarser than sliding cradles along a tube.
col_x  = 30;         // column width (lateral support for the monitor)
col_y  = 26;
col_h  = 44;         // plate top -> bottom of the monitor slot
br_slot_depth = 18;  // shallower than the cradle: less arm to print

module bracket() {
    cx = base_x/2;
    arm_h = br_slot_depth + 8;
    difference() {
        union() {
            foot_base();

            // column, embedded 2 mm into the base
            translate([cx - col_x/2, base_y/2 - col_y/2, plate_t - 2])
                slab(col_x, col_y, col_h + 2, 3);

            // leaning slot arm, overlapping the column by 4 mm
            translate([cx, base_y/2, plate_t + col_h - 4])
                rotate([-lean_deg, 0, 0])
                    translate([-(slot_w/2 + wall), -col_y/2, 0])
                        slab(slot_w + 2*wall, col_y, arm_h + 4, 2);

            // gussets, symmetric, tying the column to both base bars
            for (s = [0, 1])
                translate([cx + (s ? col_x/2 - 3 : -col_x/2 + 3),
                           base_y/2 - col_y/2, plate_t - 3])
                    mirror([s ? 0 : 1, 0, 0])
                        gusset(18, col_h * 0.55, col_y);
        }

        // rib slots in the underside
        for (s = [-1, 1])
            translate([-1, base_y/2 + s*rib_pitch/2 - (rib_width+rib_clear)/2, -0.5])
                cube([base_x + 2, rib_width + rib_clear, rib_height + 0.5]);

        // monitor slot, following the lean, open at the top
        translate([cx, base_y/2, plate_t + col_h - 4])
            rotate([-lean_deg, 0, 0])
                translate([-slot_w/2, -col_y/2 - 1, 6])
                    cube([slot_w, col_y + 2, arm_h + 8]);

        // cable-clip mount
        translate([10, 9, plate_t - 4]) cylinder(d=m3_free, h=8);
    }
}


// ============================================================================
// MOUNT-ON-PROVEN-FEET VARIANT  --  the simple one
// ============================================================================
// Packout does not snap on: it SLIDES in and a tab latches it, like a real
// Packout box. Getting that profile right is the hard part of this whole
// project, and it is already solved by well-reviewed community feet that mount
// whatever you like via through-holes (#6 or M4).
//
// So: do not design the lid interface. Bolt to it. Our part becomes a small
// monitor bracket with a bolt pattern -- no rib plate, no big footprint.
//
// Bolt pattern MEASURED from CK Designs' "Full Packout Feet Set" 3mf
// (Regular Dual Cleat): 186 x 50 x 14 mm, four Ø4.5 through-holes in a single
// row at x = ±31.25 and ±70.75, y = 0, with a Ø10 head counterbore on the far
// face. Fundamental pitch is 39.5 mm; it recurs in Single Cleat Tight Fit at
// ±19.75, which cross-checks it.
//
// The bolt comes UP through the foot into this part.
//
// M4 HEAT-SET BRASS INSERTS, not self-tapped plastic. Self-tapping into PLA was
// always the weakest joint here, and PLA-CF is more brittle and holds a cut
// thread worse than plain PLA -- so with CF it goes from weak to unreliable.
// Inserts cost pennies and make it the strongest joint instead.
//
// !! CHECK YOUR INSERTS -- these vary by brand !!
// insert_d is the PILOT HOLE, deliberately under the insert OD so the brass
// melts in and grips. Typical M4: OD 6.0-6.3, pilot 5.6-5.7, length 8.
// `hole_template` includes a test boss; try one insert in it first.
insert_d  = 5.7;     // pilot hole diameter   <-- CHECK VENDOR SPEC
insert_l  = 8.0;     // insert length         <-- CHECK VENDOR SPEC

cleat_y   = 50;      // cleat depth -- our base matches it for full bearing
cleat_h   = 14;      // how far the feet raise this part off the lid
hole_pitch = 39.5;   // fundamental pitch (adjacent holes). 62.5 or 141.5
                     // also exist if you want a wider base.

// MEASURED off the organiser: the Packout slot the feet sit in is 58.9 mm wide,
// so the base is built to that rather than derived from the hole pitch (which
// happened to give 59.5 -- 0.6 mm over).
packout_slot_w = 58.9;
mt_x    = packout_slot_w;
mt_y    = cleat_y;
mt_t    = 4.5;       // base plate: thin, it is backed by the cleat
mt_col  = 26;        // column width -- lateral support for the monitor
mt_h    = 30;        // plate top -> bottom of the monitor slot
mt_slot = 16;        // slot depth; ample grip on a 10 mm panel

// An 8 mm insert will not fit a 4.5 mm plate, so each hole gets a local boss on
// the TOP face. Bosses print as plain upward extrusions -- no overhang.
boss_od = insert_d + 2*2.6;               // ~10.9, keeps 2.6 mm wall round brass
boss_h  = insert_l + 2 - mt_t;            // total depth = insert_l + 2

module insert_boss() {
    cylinder(d=boss_od, h=mt_t + boss_h);
}

// Pilot for the insert from above, then bolt clearance the rest of the way down
// so the bolt can reach it from underneath.
module insert_cut() {
    top = mt_t + boss_h;
    translate([0, 0, top - (insert_l + 0.5)]) cylinder(d=insert_d, h=insert_l + 1);
    translate([0, 0, -1]) cylinder(d=m4_free, h=top + 2);
    // lead-in chamfer so the insert starts square
    translate([0, 0, top - 0.6]) cylinder(d1=insert_d, d2=insert_d + 1.2, h=0.8);
}

module bolt_features(cut) {
    for (s = [-1, 1])
        translate([mt_x/2 + s*hole_pitch/2, mt_y/2, 0])
            if (cut) insert_cut(); else insert_boss();
}

// ~5 min, ~2 g. Two jobs: confirm the 39.5 mm pitch against your real feet, and
// let you test-melt one insert before committing to a mount.
module hole_template() {
    r = 6.5;
    difference() {
        union() {
            for (s = [0, 1])
                translate([r + s*hole_pitch, r, 0]) cylinder(d=2*r, h=2.4);
            translate([r - 3, r - 3, 0]) cube([hole_pitch + 6, 6, 2.4]);
            // insert test boss, offset clear of the two pitch holes, with a
            // web back to the bar so it is not a separate body
            translate([r + hole_pitch/2, r + 17, 0]) insert_boss();
            translate([r + hole_pitch/2 - 3, r, 0]) cube([6, 18, 2.4]);
        }
        for (s = [0, 1])
            translate([r + s*hole_pitch, r, -1]) cylinder(d=m4_free, h=5);
        translate([r + hole_pitch/2, r + 17, 0]) insert_cut();
    }
}

// THE STAND. Printed twice, bolted to a set of Packout feet each.
module mount() {
    cx = mt_x/2; cy = mt_y/2;
    arm_h = mt_slot + 7;
    difference() {
        union() {
            slab(mt_x, mt_y, mt_t, 3);
            bolt_features(false);         // insert bosses

            // column
            translate([cx - mt_col/2, cy - 12, mt_t - 2])
                slab(mt_col, 24, mt_h + 2, 3);

            // leaning slot arm, overlapping the column by 4 mm
            translate([cx, cy, mt_t + mt_h - 4])
                rotate([-lean_deg, 0, 0])
                    translate([-(slot_w/2 + wall), -12, 0])
                        slab(slot_w + 2*wall, 24, arm_h + 4, 2);

            // gussets tying the column to the plate
            for (s = [0, 1])
                translate([cx + (s ? mt_col/2 - 3 : -mt_col/2 + 3), cy - 12, mt_t - 2.5])
                    mirror([s ? 0 : 1, 0, 0])
                        gusset(13, mt_h * 0.6, 24);
        }

        bolt_features(true);          // insert pilots + bolt clearance

        // monitor slot
        translate([cx, cy, mt_t + mt_h - 4])
            rotate([-lean_deg, 0, 0])
                translate([-slot_w/2, -13, 5])
                    cube([slot_w, 26, arm_h + 8]);
    }
}

// ============================================================================
// LID-CLEAT VARIANT  --  drops straight into the organiser lid channel
// ============================================================================
// MEASURED: 58.8 mm across the INSIDE of the channel on the hex-pattern clear
// organiser lid (caliper photo). The tongue therefore has to come in under that.
channel_w     = 58.8;    // measured, internal
channel_clear = 0.4;     // total side clearance for a sliding fit
tongue_w      = channel_w - channel_clear;      // 58.4
tongue_l      = 44;      // length along the channel
tongue_draft  = 1.5;     // deg per side -- clears injection-moulding draft

// MEASURED: channel is 4.3 mm deep.
//
// The TONGUE is deliberately shallower than the channel. Load has to land on the
// plate sitting flat on the lid, not on the tongue tip touching the channel
// floor. Equal depths mean any first-layer squish or over-extrusion bottoms the
// tongue out first and the part rocks on it.
channel_depth = 4.3;     // measured
seat_clear    = 0.3;     // tongue sits this far off the channel floor
tongue_depth  = channel_depth - seat_clear;

lm_x = 76;               // base bears on the lid either side of the channel
lm_y = 50;

// Tongue, narrowing very slightly downward so moulding draft cannot jam it.
module lid_tongue_at(cx, cy) {
    dw = 2 * tongue_depth * tan(tongue_draft);
    hull() {
        translate([cx, cy, 0])
            cube([tongue_w - dw, tongue_l, 0.01], center=true);
        translate([cx, cy, tongue_depth])
            cube([tongue_w, tongue_l, 0.01], center=true);
    }
}
module lid_tongue() { lid_tongue_at(lm_x/2, lm_y/2); }

// ~6 min, ~3 g. Drop it in the lid channel. It should seat with the plate flat
// on the lid and no side rock. If it stands proud, raise seat_clear; if
// it rocks side to side, raise channel_clear.
module lid_coupon() {
    difference() {
        union() {
            lid_tongue();
            translate([lm_x/2 - 34, lm_y/2 - 14, tongue_depth])
                slab(68, 28, 2.6, 3);
        }
        // window so you can see the tongue seated
        translate([lm_x/2 - 10, lm_y/2 - 5, tongue_depth - 1])
            cube([20, 10, 6]);
    }
}

// THE LID-MOUNTED STAND. Printed twice. No feet, no bolts, no inserts.
module lid_mount() {
    cx = lm_x/2; cy = lm_y/2;
    z0 = tongue_depth;                 // top of tongue = underside of plate
    arm_h = mt_slot + 7;
    difference() {
        union() {
            lid_tongue();
            translate([0, 0, z0]) slab(lm_x, lm_y, mt_t, 3);

            translate([cx - mt_col/2, cy - 12, z0 + mt_t - 2])
                slab(mt_col, 24, mt_h + 2, 3);

            translate([cx, cy, z0 + mt_t + mt_h - 4])
                rotate([-lean_deg, 0, 0])
                    translate([-(slot_w/2 + wall), -12, 0])
                        slab(slot_w + 2*wall, 24, arm_h + 4, 2);

            for (s = [0, 1])
                translate([cx + (s ? mt_col/2 - 3 : -mt_col/2 + 3), cy - 12,
                           z0 + mt_t - 2.5])
                    mirror([s ? 0 : 1, 0, 0])
                        gusset(13, mt_h * 0.6, 24);
        }

        translate([cx, cy, z0 + mt_t + mt_h - 4])
            rotate([-lean_deg, 0, 0])
                translate([-slot_w/2, -13, 5])
                    cube([slot_w, 26, arm_h + 8]);
    }
}

// ============================================================================
// PART: pi_mount   -- same lid tongue, Raspberry Pi platform on top
// ============================================================================
// Identical cleat to lid_mount, so it drops into the same 58.8 mm lid channel.
//
// Pi mounting is standardised: an 85 x 56 mm board with four M2.5 holes 3.5 mm
// in from each edge, giving 58 x 49 mm centres. True for Pi 3B+, 4B and 5.
// The board runs its long axis ALONG the channel so it does not overhang the
// channel walls.
pi_hole_x   = 49;        // across the channel
pi_hole_y   = 58;        // along the channel
pi_board    = [56, 85];  // for reference / clearance checks
m25_tap     = 2.1 + line_w/2;      // M2.5 self-tap into PLA
standoff_h  = 4.0;       // clearance under the PCB for the SD card + solder
standoff_od = 6.0;

pm_x = 76;               // wider than the board so the plate bears on the lid
pm_y = 93;
pm_t = 4.5;

// Slots for a zip tie / velcro strap, so a CASED Pi can be strapped down
// instead of screwed to the standoffs.
module strap_slots(z0) {
    for (sy = [-1, 1])
        for (sx = [-1, 1])
            translate([pm_x/2 + sx*30 - 1.6, pm_y/2 + sy*34 - 5, z0 - 1])
                cube([3.2, 10, pm_t + 2]);
}

module pi_mount() {
    cx = pm_x/2; cy = pm_y/2;
    z0 = tongue_depth;
    top = z0 + pm_t;
    difference() {
        union() {
            lid_tongue_at(cx, cy);
            translate([0, 0, z0]) slab(pm_x, pm_y, pm_t, 3);
            // standoffs
            for (sx = [-1, 1], sy = [-1, 1])
                translate([cx + sx*pi_hole_x/2, cy + sy*pi_hole_y/2, top - 1])
                    cylinder(d=standoff_od, h=standoff_h + 1);
        }
        // M2.5 self-tap down the standoffs
        for (sx = [-1, 1], sy = [-1, 1])
            translate([cx + sx*pi_hole_x/2, cy + sy*pi_hole_y/2, top - 3])
                cylinder(d=m25_tap, h=standoff_h + 4);
        strap_slots(z0);
        // vent / weight relief under the board, clear of the standoffs
        for (sy = [-1, 1])
            translate([cx, cy + sy*18, z0 - 1]) {
                for (i = [-1, 0, 1])
                    translate([i*13, 0, 0]) cylinder(d=9, h=pm_t + 2);
            }
    }
}

// ============================================================================
// PART: pi_case   -- integrated Pi 3B case on the lid tongue
// ============================================================================
// Board size and hole pattern are solid: 85 x 56 x 17 mm, four M2.5 at
// 58 x 49 mm centres, 3.5 mm in from each edge.
//
// Port OFFSETS are not. I could not find a verifiable dimensioned drawing for
// the 3B's HDMI / micro-USB / audio / USB / Ethernet positions, so this does NOT
// cut individual port holes -- guessing five offsets is how you make scrap.
// Instead each wall is opened across its full span, leaving corner columns. No
// port can be blocked because there is no wall in front of any of them. It also
// vents far better than a sealed shell.
//
// Consequence to be aware of: this is a cradle/skeleton, not a sealed box. It
// will not keep dust out. Sealing it needs those five measurements.
pi_bx = 56;              // board width  (across the pocket)
pi_by = 85;              // board length (along the pocket)
pi_clear = 0.6;          // clearance around the board
pi_wall_h = 18;          // wall height above the plate
pi_post = 8;             // corner column width left either side of each opening

module pi_case() {
    cx = pm_x/2; cy = pm_y/2;
    z0 = tongue_depth;
    top = z0 + pm_t;                       // plate top
    iw = pi_bx + pi_clear;                 // inside wall dims
    il = pi_by + pi_clear;
    ow = iw + 2*wall;
    ol = il + 2*wall;
    difference() {
        union() {
            lid_tongue_at(cx, cy);
            translate([0, 0, z0]) slab(pm_x, pm_y, pm_t, 3);
            // perimeter wall
            translate([cx - ow/2, cy - ol/2, top - 1])
                slab(ow, ol, pi_wall_h + 1, 3);
            // standoffs
            for (sx = [-1, 1], sy = [-1, 1])
                translate([cx + sx*pi_hole_x/2, cy + sy*pi_hole_y/2, top - 1])
                    cylinder(d=standoff_od, h=standoff_h + 1);
        }
        // hollow the wall interior
        translate([cx - iw/2, cy - il/2, top]) slab(iw, il, pi_wall_h + 2, 2);

        // --- full-span openings, from below the board up past the top ---
        // Start 1 mm under the board underside so the microSD (which sits on the
        // underside of a short edge) clears too.
        oz = top + standoff_h - 1;
        oh = pi_wall_h + 4;
        for (sy = [-1, 1])                       // long edges: USB/Ethernet, GPIO
            translate([cx - (il - 2*pi_post)/2 + (il-2*pi_post)/2, cy + sy*ol/2, oz])
                translate([-(il - 2*pi_post)/2, -wall*2, 0])
                    cube([il - 2*pi_post, wall*4, oh]);
        for (sx = [-1, 1])                       // short edges: HDMI/power/audio
            translate([cx + sx*ow/2, cy - (iw - 2*pi_post)/2, oz])
                translate([-wall*2, 0, 0])
                    cube([wall*4, iw - 2*pi_post, oh]);

        // M2.5 self-tap down the standoffs
        for (sx = [-1, 1], sy = [-1, 1])
            translate([cx + sx*pi_hole_x/2, cy + sy*pi_hole_y/2, top + standoff_h - 3])
                cylinder(d=m25_tap, h=standoff_h + 4);

        // floor vents, clear of the standoffs
        for (sy = [-1, 0, 1])
            for (i = [-1, 0, 1])
                translate([cx + i*13, cy + sy*16, z0 - 1])
                    cylinder(d=9, h=pm_t + 2);
    }
}

// ============================================================================
// PART: pi_upright  --  ALTERNATIVE, NOT THE DEFAULT
// ============================================================================
// Kept because it verifies clean, but pi_case (flat) is the chosen layout --
// upright was a wrong turn on my part. Use this only if bed space or footprint
// matters more than lying the board flat.
//
// Matches lid_mount's 76 x 50 base and shares the identical lid tongue.
//
// The Pi board is 85 x 56, which cannot lie flat on a 50 mm deep base -- so it
// stands upright on a backplate instead. That also vents better than a flat tray
// (chimney effect) and takes less bed space.
//
// Backplate is VERTICAL, not leaned 20 deg like the monitor. A 92 mm plate leaned
// 20 deg would throw its top back by 92*sin20 = 31 mm over a 50 mm deep base,
// which is asking to tip. Viewing angle does not matter for a Pi.
pu_plate_x = 62;         // >= board 56, fits within the 76 base
pu_plate_y = 3.6;        // backplate thickness
pu_plate_h = 92;         // >= board 85 plus margin
pu_board_z = 6;          // board bottom edge, above the base top
// Holes sit 3.5 mm in from the board edge, so the pair straddles this centre.
// Deriving it stopped the lower standoffs landing at z = -6.5, under the bed.
pu_hole_zc = pu_board_z + 3.5 + pi_hole_y/2;

module pi_upright() {
    cx = lm_x/2; cy = lm_y/2;
    z0 = tongue_depth;
    top = z0 + mt_t;
    difference() {
        union() {
            lid_tongue_at(cx, cy);
            translate([0, 0, z0]) slab(lm_x, lm_y, mt_t, 3);

            // backplate, embedded 2 mm into the base
            translate([cx - pu_plate_x/2, cy - pu_plate_y/2, top - 2])
                slab(pu_plate_x, pu_plate_y, pu_plate_h + 2, 3);

            // standoffs stand off the FRONT face, board solder-side inward
            for (sx = [-1, 1], sy = [-1, 1])
                translate([cx + sx*pi_hole_x/2,
                           cy + pu_plate_y/2,
                           top + pu_hole_zc + sy*pi_hole_y/2])
                    rotate([-90, 0, 0])
                        cylinder(d=standoff_od, h=standoff_h);

            // Buttress BACKWARD from the plate's rear face. Sideways gussets do
            // not fit: a 62 mm plate on a 76 mm base leaves only 7 mm a side, and
            // they ran off to x = -6.
            for (i = [-1, 0, 1])
                translate([cx + i*20 + 2.5, cy - pu_plate_y/2 + 0.5, top - 2.5])
                    rotate([0, 0, -90])
                        gusset(18, pu_plate_h * 0.38, 5);
        }

        // M2.5 self-tap into each standoff, through the plate
        for (sx = [-1, 1], sy = [-1, 1])
            translate([cx + sx*pi_hole_x/2,
                       cy - pu_plate_y/2 - 1,
                       top + pu_hole_zc + sy*pi_hole_y/2])
                rotate([-90, 0, 0])
                    cylinder(d=m25_tap, h=standoff_h + pu_plate_y + 2);

        // lightening / airflow slots up the backplate, clear of the standoffs
        for (i = [-1, 0, 1])
            translate([cx + i*17, cy - pu_plate_y, top + 40])
                cube([9, pu_plate_y*3, 34], center=true);
    }
}

// ============================================================================
// PART: pi_cradle   -- holds a GENERIC cased Pi, on the lid tongue
// ============================================================================
// There is no single "generic Pi case" size:
//   Official Pi 3 case   93 x 62 x 31
//   Flirc                90 x 62 x 24
//   cheap ABS clones     ~90 x 62 x 30
//   Argon ONE            106 x 70 x 30
// A close-fitting box would suit exactly one of those. So this uses four CORNER
// BRACKETS rather than continuous walls: they locate a box by its corners and
// tolerate a few mm of variation in either direction, and any radius on the
// case's own corners just seats into the bracket.
//
// Set case_l / case_w to your case and re-export if it is outside ~90-100 x
// 60-68. Anything in that window should drop in as-is.
case_l = 91.5;           // MEASURED off the user's clear case
case_w = 61.7;           // MEASURED. Both case dimensions are now real numbers,
                         // so nothing in this part is assumed any more.
case_fit = 0.8;          // total clearance so it drops in rather than presses
brk_h = 12;              // bracket height -- enough to retain, not to enclose
brk_leg = 15;            // how far each bracket leg runs along the case edge

cr_px = case_w + case_fit + 2*wall + 8;      // base plate
cr_py = case_l + case_fit + 2*wall + 8;

module corner_bracket(ix, iy) {
    // ix/iy are +-1: which corner. Legs run inward from that corner.
    w = case_w + case_fit;
    l = case_l + case_fit;
    x0 = ix < 0 ? -w/2 - wall : w/2;
    y0 = iy < 0 ? -l/2 - wall : l/2;
    union() {
        // leg along X
        translate([ix < 0 ? -w/2 - wall : w/2 - brk_leg + wall,
                   y0, 0]) cube([brk_leg, wall, brk_h]);
        // leg along Y
        translate([x0,
                   iy < 0 ? -l/2 - wall : l/2 - brk_leg + wall,
                   0]) cube([wall, brk_leg, brk_h]);
    }
}

module pi_cradle() {
    cx = cr_px/2; cy = cr_py/2;
    z0 = tongue_depth;
    top = z0 + mt_t;
    difference() {
        union() {
            lid_tongue_at(cx, cy);
            translate([0, 0, z0]) slab(cr_px, cr_py, mt_t, 3);
            for (ix = [-1, 1], iy = [-1, 1])
                translate([cx, cy, top - 1])
                    corner_bracket(ix, iy);
        }
        // strap slots, so the case is actually held down and not just fenced in
        for (sy = [-1, 1])
            for (sx = [-1, 1])
                translate([cx + sx*(case_w/2 - 6) - 1.6, cy + sy*cr_py/2 - sy*5 - 5, z0 - 1])
                    cube([3.2, 10, mt_t + 2]);
        // floor vents under the case
        for (iy = [-1, 0, 1])
            for (ix = [-1, 0, 1])
                translate([cx + ix*20, cy + iy*24, z0 - 1])
                    cylinder(d=11, h=mt_t + 2);
    }
}

// ============================================================================
// PACKOUT BOX-TOP CLEAT  --  the structural interlock, not the lid
// ============================================================================
// From the caliper photos of a 48-22-8436 underside:
//   36.1 mm   rib width          <- USED HERE as the tongue width
//   25.2 mm   (role unconfirmed) probably the gap between ribs
//   75.1 mm   (role unconfirmed) span of some kind
// 75.1 does not reconcile cleanly with the other two: 36.1 + 25.2 = 61.3, and
// 36.1 x 2 = 72.2, so 75.1 is measuring something else again. Noted, unused.
// Cross-check: CK's dovetail measured 38.05 mm across its top face, same
// ballpark as 36.1, which supports 36.1 being the rib width.
//
// STILL UNKNOWN, and why cleat_coupon exists:
//   - rib height / engagement depth       -> cleat_h below is a guess
//   - whether the flank undercuts (dovetail) or is straight
// A straight tongue is the safe starting point: if the real channel undercuts,
// a straight tongue still locates and takes side load, it just will not resist
// lift. Cutting a dovetail the wrong way round is worse than not cutting one.
cleat_w  = 36.1;      // measured rib width
cleat_h  = 5.0;       // GUESS -- deliberately shallow so it cannot bottom out
cleat_len = 22;       // along the slide direction

// One tongue, w wide, sitting under a plate whose top is at z=cleat_h.
module cleat_tongue(w, l = cleat_len) {
    translate([-w/2, -l/2, 0]) cube([w, l, cleat_h]);
}

// ~12 min, ~5 g. Three tongues at 35.7 / 36.1 / 36.5 mm, notch-coded 1/2/3.
// Try each in a box-top channel: you want the one that slides with light thumb
// pressure and no side rock. Set cleat_w to it.
//   - if none go in at all           -> 36.1 is not the rib width, tell me
//   - if all three slide loosely     -> the channel is wider; measure the female
//   - if it slides but lifts out     -> the flank undercuts, I need that angle
module cleat_coupon() {
    ws = [35.7, 36.1, 36.5];
    pitch = 30;
    px = 44; py = 3*pitch + 10;
    difference() {
        union() {
            translate([0, 0, cleat_h]) slab(px, py, 2.6, 3);
            for (i = [0:2])
                translate([px/2, 20 + i*pitch, 0]) cleat_tongue(ws[i]);
        }
        // notch code: 1, 2 or 3 marks beside each tongue
        for (i = [0:2])
            for (k = [0:i])
                translate([3 + k*4, 20 + i*pitch - 2, cleat_h + 1.2])
                    cube([2, 4, 2]);
    }
}

// ============================================================================
// PART: firstlayer_test   -- 5 min. Print THIS to dial Z, not a real part.
// ============================================================================
// Five pads spread across the bed, joined by thin ribs so it stays one body.
// One layer tall, so it is over in minutes and tells you two things at once:
//   Z OFFSET  -- lines should be flat and fused with no gaps between them. Round,
//                separated lines = nozzle too high. Translucent, scarred, or
//                ridged = too low.
//   BED LEVEL -- compare all five pads. If the centre looks different from the
//                corners, level before anything else.
// Peel a pad afterwards: it should resist and leave a matte imprint on the PEI.
fl_pad = 25;
fl_span = 180;           // spread across the bed to catch a level error

module firstlayer_test() {
    h = 0.28;            // matches initial_layer_print_height
    o = fl_span/2;
    pts = [[0,0], [-o,-o], [o,-o], [-o,o], [o,o]];
    translate([fl_span/2 + fl_pad, fl_span/2 + fl_pad, 0]) {
        for (p = pts)
            translate([p[0], p[1], 0])
                linear_extrude(h) square([fl_pad, fl_pad], center=true);
        // ribs to the centre, so the gate still sees a single body
        for (p = [pts[1], pts[2], pts[3], pts[4]])
            hull() {
                translate([p[0], p[1], 0]) linear_extrude(h) square([4,4], center=true);
                linear_extrude(h) square([4,4], center=true);
            }
    }
}

// ============================================================================
// TWO-PIECE TONGUE  --  the fix for the unprintable overhang
// ============================================================================
// The single-piece parts put a narrow tongue (58.4 x 44) under a wide plate
// (up to 75.5 x 105.3). At the top of the tongue the cross-section steps out by
// up to 30.7 mm PER SIDE into open air, so the plate printed into nothing and
// every one of those parts failed at ~21% height. No orientation fixes it: the
// tongue is below the plate and the brackets are above it.
//
// Splitting it removes the overhang completely:
//   plate   prints face-down, brackets pointing UP -> cross-section only ever
//           shrinks with height, so zero overhang
//   tongue  prints as a separate block, mating face down -> also zero overhang
//
// The tongue block is UNIVERSAL: same 2-hole pattern on every plate, so one STL
// serves the cradle, the monitor mount and the Pi case. It also makes the tongue
// swappable, which the still-unmeasured lid geometry argues for anyway.
tb_bolt_pitch = 30;      // 2 x M3, along the tongue's long axis
m3_tap        = 2.6 + line_w/2;
m3_head       = 6.0;

// Holes in a PLATE: clearance through, head counterbored flush into the top so
// the case or monitor still sits flat.
module tongue_bolt_holes(cx, cy, plate_t_local) {
    for (s = [-1, 1])
        translate([cx, cy + s*tb_bolt_pitch/2, -1]) {
            cylinder(d=m3_free, h=plate_t_local + 2);
            translate([0, 0, 1 + plate_t_local - 2.2])
                cylinder(d=m3_head, h=plate_t_local);
        }
}

// The tongue, as its own part. Printed mating-face DOWN: the widest section is
// on the bed and it narrows going up, so nothing overhangs.
module tongue_block() {
    dw = 2 * tongue_depth * tan(tongue_draft);
    difference() {
        hull() {
            translate([tongue_w/2, tongue_l/2, 0])
                cube([tongue_w, tongue_l, 0.01], center=true);
            translate([tongue_w/2, tongue_l/2, tongue_depth])
                cube([tongue_w - dw, tongue_l, 0.01], center=true);
        }
        // M3 self-tap, entered from the mating face (which is on the bed)
        for (s = [-1, 1])
            translate([tongue_w/2, tongue_l/2 + s*tb_bolt_pitch/2, -0.5])
                cylinder(d=m3_tap, h=tongue_depth + 1);
    }
}

// ============================================================================
// PART: cradle_plate  -- pi_cradle with NO tongue. Prints flat, zero overhang.
// ============================================================================
module cradle_plate() {
    cx = cr_px/2; cy = cr_py/2;
    difference() {
        union() {
            slab(cr_px, cr_py, mt_t, 3);
            for (ix = [-1, 1], iy = [-1, 1])
                translate([cx, cy, mt_t - 1])
                    corner_bracket(ix, iy);
        }
        tongue_bolt_holes(cx, cy, mt_t);
        for (sy = [-1, 1])
            for (sx = [-1, 1])
                translate([cx + sx*(case_w/2 - 6) - 1.6,
                           cy + sy*cr_py/2 - sy*5 - 5, -1])
                    cube([3.2, 10, mt_t + 2]);
        for (iy = [-1, 0, 1])
            for (ix = [-1, 0, 1])
                translate([cx + ix*20, cy + iy*24, -1])
                    cylinder(d=11, h=mt_t + 2);
    }
}

// ============================================================================
// PART: clip   -- cable clip; loop_d 6 for USB-C, 9 for HDMI
// ============================================================================
module clip(loop_d = 6) {
    od = loop_d + 2*wall;
    bx = od + 6;
    by = od + 1;             // base must contain the loop, whatever wall is
    difference() {
        union() {
            slab(bx, by, 3, 2);
            translate([bx/2, by/2, 2]) cylinder(d=od, h=loop_d + 4);
        }
        // cable bore, open on one side so the cable snaps in
        translate([bx/2, by/2, 4]) cylinder(d=loop_d, h=loop_d + 4);
        translate([bx/2 - loop_d*0.35, by/2, 5]) cube([loop_d*0.7, by, loop_d + 4]);
        // mount hole
        translate([bx/2, by/2, -1]) cylinder(d=m3_free, h=6);
    }
}

// ============================================================================
// ASSEMBLY (reference view only -- not for export)
// ============================================================================
span = 250;   // centre-to-centre foot spacing

module assembly() {
    color("gray")      foot();
    translate([span, 0, 0]) color("gray") foot();

    for (x = [0, span])
        translate([x + base_x/2 - (tube_fit/2 + wall), base_y/2 - post_y/2,
                   plate_t + post_h - sad_depth + tube])
            color("dimgray") saddle_cap();

    // aluminium tube (bought, not printed)
    color("silver")
        translate([base_x/2 - tube/2, base_y/2 - tube/2,
                   plate_t + post_h - sad_depth])
            cube([span + tube, tube, tube]);

    for (x = [70, span - 40])
        translate([base_x/2 - cr_x/2 + x, base_y/2 - cr_y/2,
                   plate_t + post_h - sad_depth - wall])
            color("gray") cradle();
}

// ============================================================================
// PART SELECTOR
// ============================================================================
part = "assembly";

if      (part == "cradle_plate")  cradle_plate();
else if (part == "tongue_block")  tongue_block();
else if (part == "firstlayer_test") firstlayer_test();
else if (part == "pi_cradle")     pi_cradle();
else if (part == "pi_upright")    pi_upright();
else if (part == "cleat_coupon")  cleat_coupon();
else if (part == "pi_case")       pi_case();
else if (part == "pi_mount")      pi_mount();
else if (part == "lid_mount")     lid_mount();
else if (part == "lid_coupon")    lid_coupon();
else if (part == "mount")         mount();
else if (part == "hole_template") hole_template();
else if (part == "fit_coupon")    fit_coupon();
else if (part == "bracket")    bracket();
else if (part == "foot")       foot();
else if (part == "saddle_cap") saddle_cap();
else if (part == "cradle")     cradle();
else if (part == "clip_usbc")  clip(6);
else if (part == "clip_hdmi")  clip(9);
else                           assembly();
