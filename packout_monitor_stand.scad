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
mon_clear   =  0.6;  // total slot clearance (0.3 per side) -- 0.6 nozzle needs this
slot_w      = mon_thick + mon_clear;   // 10.9
slot_depth  = 22.0;  // how deep the monitor sits into the cradle
lean_deg    = 20.0;  // screen leans BACK this many degrees from vertical

// ---- Crossbar --------------------------------------------------------------
tube        = 20.0;  // 20x20 aluminium square tube
tube_fit    = 20.5;  // bore for the tube (slip fit, printed)

// ---- Fasteners -------------------------------------------------------------
m4_free     =  4.4;  // M4 clearance hole
m4_tap      =  3.7;  // M4 self-tapping into plastic
m4_head     =  7.6;  // M4 socket head counterbore
m3_free     =  3.4;

// ---- Print / structure -----------------------------------------------------
wall        =  2.4;  // 4 x 0.6 extrusions -- solid, no gaps
plate_t     =  6.0;  // foot base plate (must exceed rib_height + 2.4)
corner_r    =  4.0;

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
// PART: fit_coupon   -- PRINT THIS FIRST
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

module foot() {
    cx = base_x/2;
    difference() {
        union() {
            // base plate
            slab(base_x, base_y, plate_t);

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
// PART: clip   -- cable clip; loop_d 6 for USB-C, 9 for HDMI
// ============================================================================
module clip(loop_d = 6) {
    od = loop_d + 2*wall;
    difference() {
        union() {
            slab(od + 6, 14, 3, 2);
            translate([(od + 6)/2, 7, 2]) cylinder(d=od, h=loop_d + 4);
        }
        // cable bore, open on one side so the cable snaps in
        translate([(od + 6)/2, 7, 4]) cylinder(d=loop_d, h=loop_d + 4);
        translate([(od + 6)/2 - loop_d*0.35, 7, 5]) cube([loop_d*0.7, 14, loop_d + 4]);
        // mount hole
        translate([(od + 6)/2, 7, -1]) cylinder(d=m3_free, h=6);
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

if      (part == "fit_coupon") fit_coupon();
else if (part == "foot")       foot();
else if (part == "saddle_cap") saddle_cap();
else if (part == "cradle")     cradle();
else if (part == "clip_usbc")  clip(6);
else if (part == "clip_hdmi")  clip(9);
else                           assembly();
