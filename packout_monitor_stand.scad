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
// slot_adjust is the fit knob -- negative is tighter. Measured on a printed
// mount, the computed slot came out loose, so it is pulled in 0.5 mm.
// NOTE this assumes the pads ARE fitted:
//   bare slot        10.3 + 1.0 + 0.42 - 0.5 = 11.22
//   minus 2 x 0.5 pad                        = 10.22 against a 10.3 panel
//   -> ~0.1 mm interference, i.e. a grip.
// Running WITHOUT pads leaves ~0.9 mm of play; use slot_adjust = -1.4 instead.
slot_adjust = -0.5;
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

if      (part == "mount")         mount();
else if (part == "hole_template") hole_template();
else if (part == "fit_coupon")    fit_coupon();
else if (part == "bracket")    bracket();
else if (part == "foot")       foot();
else if (part == "saddle_cap") saddle_cap();
else if (part == "cradle")     cradle();
else if (part == "clip_usbc")  clip(6);
else if (part == "clip_hdmi")  clip(9);
else                           assembly();
