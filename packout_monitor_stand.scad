// ============================================================================
// WISE² Milwaukee Packout Monitor Stand - OpenSCAD Model
// ============================================================================
// Design: Production-ready 3D printable monitor stand
// Material: PLA (future: PETG, ASA)
// Target: Sub-3-hour print, zero supports, field-ready
// ============================================================================

// Global Parameters (EDIT HERE FOR CUSTOMIZATION)
$fn = 50;  // Resolution (50 = smooth, 20 = faster preview)

// ============================================================================
// PARAMETERS - PACKOUT GEOMETRY
// ============================================================================
packout_rib_height = 3.0;      // Height of Packout molded ribs
packout_rib_width = 8.0;       // Width of engagement ribs
packout_rib_spacing = 50.0;    // Spacing between ribs
foot_height = 18.0;            // Overall foot height
foot_length = 80.0;            // Length of foot
foot_width = 40.0;             // Width of foot

// ============================================================================
// PARAMETERS - MONITOR SLOT
// ============================================================================
monitor_slot_width = 10.5;     // 10.3mm monitor + 0.2mm clearance
monitor_slot_depth = 30.0;     // Full depth through holder
monitor_holder_width = 220.0;  // Spans crossbar
monitor_holder_angle = 20.0;   // Viewing angle (degrees)
monitor_protection_fillet = 2.0; // Radius on slot entrance

// ============================================================================
// PARAMETERS - ALUMINUM EXTRUSION & HARDWARE
// ============================================================================
aluminum_size = 20.0;          // 20x20 mm square tube
crossbar_length = 300.0;       // Total length
m4_hole_diameter = 4.2;        // M4 bolt clearance
m3_hole_diameter = 3.2;        // M3 bolt clearance
clamp_wall_thickness = 2.5;    // Clamp adapter wall

// ============================================================================
// PARAMETERS - MATERIAL & PRINT
// ============================================================================
min_wall = 2.0;                // Minimum wall thickness (ribs)
standard_wall = 3.0;           // Standard wall thickness
fillet_radius = 1.0;           // Stress relief radius
gusset_angle = 45.0;           // Gusset angle for ribs

// ============================================================================
// PART A-001: LEFT FOOT
// ============================================================================
module left_foot() {
    difference() {
        union() {
            // Base plate
            cube([foot_length, foot_width, standard_wall], center=false);

            // Side walls for stiffness
            translate([5, 5, 0])
                cube([foot_length-10, foot_width-10, foot_height-standard_wall]);

            // Packout engagement ribs (2x, spaced apart)
            for(i=[0:1]) {
                translate([15 + i*35, -3, foot_height-packout_rib_height]) {
                    linear_extrude(packout_rib_height + 2)
                        polygon([[0,0], [packout_rib_width,0],
                                [packout_rib_width-1, packout_rib_width*0.8],
                                [1, packout_rib_width*0.8]]);
                }
            }

            // Crossbar bracket boss (top rear)
            translate([foot_length-15, foot_width/2-5, foot_height-standard_wall])
                cube([12, 10, 8]);

            // Cable clip mount boss (top front)
            translate([10, 5, foot_height-standard_wall])
                cylinder(d=8, h=6);

            // Finger grip indentation (top center)
            translate([foot_length/2, foot_width/2, foot_height])
                rotate([45, 0, 0])
                    cube([30, 8, 5], center=true);
        }

        // Carve engagement slots (NEGATIVE SPACE - no supports needed)
        for(i=[0:1]) {
            translate([18 + i*35, -2, foot_height-packout_rib_height-0.5]) {
                linear_extrude(packout_rib_height+1)
                    polygon([[0,0], [packout_rib_width-2,0],
                            [packout_rib_width-2.5, packout_rib_width*0.7],
                            [0.5, packout_rib_width*0.7]]);
            }
        }

        // M4 hole for crossbar clamp
        translate([foot_length-9, foot_width/2, foot_height+3])
            cylinder(d=m4_hole_diameter, h=10);

        // M3 hole for cable clip
        translate([10, 5, foot_height+2])
            cylinder(d=m3_hole_diameter, h=8);

        // Hollow interior (reduce weight & print time)
        translate([8, 8, standard_wall])
            cube([foot_length-16, foot_width-16, foot_height-standard_wall-2]);
    }
}

// ============================================================================
// PART A-002: RIGHT FOOT (mirror of left)
// ============================================================================
module right_foot() {
    mirror([1, 0, 0])
        left_foot();
}

// ============================================================================
// PART A-003/004: CROSSBAR CLAMP ADAPTERS
// ============================================================================
module crossbar_clamp_adapter() {
    difference() {
        union() {
            // Main clamp body (wraps 20x20 aluminum)
            linear_extrude(aluminum_size + 4) {
                polygon([[0,0], [aluminum_size+5, 0],
                        [aluminum_size+5, aluminum_size+3],
                        [0, aluminum_size+3]]);
            }

            // Reinforcement ribs (internal)
            translate([0, 2, 0])
                cube([aluminum_size+4, 1.5, aluminum_size+4]);
            translate([0, aluminum_size, 0])
                cube([aluminum_size+4, 1.5, aluminum_size+4]);

            // Mounting boss (to foot)
            translate([0, -8, 0])
                cube([aluminum_size+5, 8, aluminum_size+3]);
        }

        // Hollow interior (for aluminum tube)
        translate([2, 2, -1])
            cube([aluminum_size-4, aluminum_size-4, aluminum_size+6]);

        // M4 bolt holes (top & bottom)
        translate([aluminum_size/2 + 3, 0, 2])
            cylinder(d=m4_hole_diameter, h=aluminum_size, center=true);
        translate([aluminum_size/2 + 3, aluminum_size+3, 2])
            cylinder(d=m4_hole_diameter, h=aluminum_size, center=true);

        // Mounting hole to foot
        translate([aluminum_size/2, -4, aluminum_size/2])
            cylinder(d=m4_hole_diameter, h=8);
    }
}

// ============================================================================
// PART A-005: MONITOR HOLDER
// ============================================================================
module monitor_holder() {
    difference() {
        union() {
            // Main body (angled support)
            linear_extrude(monitor_holder_angle*0.5)
                square([monitor_holder_width, 45]);

            // Raised slot area (front)
            translate([0, 0, 0])
                linear_extrude(15)
                    square([monitor_holder_width, 40]);

            // Monitor slot support ribs (left & right)
            translate([30, 12, 0])
                cube([monitor_slot_depth, standard_wall, 25]);
            translate([monitor_holder_width-30-monitor_slot_depth, 12, 0])
                cube([monitor_slot_depth, standard_wall, 25]);

            // Crossbar connection bosses
            translate([10, 20, 10])
                cube([8, 5, 8]);
            translate([monitor_holder_width-18, 20, 10])
                cube([8, 5, 8]);

            // Rear cable pass-through support
            translate([0, 35, 0])
                linear_extrude(12)
                    square([monitor_holder_width, 8]);
        }

        // Monitor slot (10.5mm wide, 30mm deep)
        translate([50, 12, 10])
            cube([monitor_slot_width, monitor_slot_depth, 20]);
        translate([monitor_holder_width-50-monitor_slot_width, 12, 10])
            cube([monitor_slot_width, monitor_slot_depth, 20]);

        // Soften slot entrance (fillet simulation)
        translate([50 + monitor_slot_width/2, 12, 10])
            cylinder(r=monitor_protection_fillet, h=5);
        translate([monitor_holder_width-50-monitor_slot_width/2, 12, 10])
            cylinder(r=monitor_protection_fillet, h=5);

        // Cable routing slots
        translate([monitor_holder_width/2 - 15, 38, 8])
            cube([12, 8, 8]);  // USB-C routing
        translate([monitor_holder_width/2 + 3, 38, 8])
            cube([12, 8, 8]);  // HDMI routing

        // Crossbar mounting holes
        translate([14, 22.5, 14])
            cylinder(d=m4_hole_diameter, h=8);
        translate([monitor_holder_width-14, 22.5, 14])
            cylinder(d=m4_hole_diameter, h=8);

        // Hollow interior (reduce weight)
        translate([10, 2, standard_wall])
            cube([monitor_holder_width-20, 35, 20]);
    }

    // WISE² Logo emboss (bottom surface)
    translate([monitor_holder_width/2 - 25, 5, 0])
        linear_extrude(0.5)
            text("WISE²", font="Arial Bold", size=8, halign="center");
}

// ============================================================================
// PART A-006/007: QUICK-RELEASE LOCK CAPS
// ============================================================================
module lock_cap() {
    difference() {
        union() {
            // Main cap body
            cylinder(d=30, h=8, $fn=40);

            // Finger indentation (grip)
            translate([0, 0, 4])
                sphere(d=12);
        }

        // Central hole for threaded insert
        cylinder(d=6, h=10, center=true);

        // Keying slot (prevents rotation)
        translate([-2, 0, 0])
            cube([4, 8, 9]);
    }
}

// ============================================================================
// PART A-008: USB-C CABLE CLIP
// ============================================================================
module usb_c_clip() {
    difference() {
        union() {
            // Main clip body
            cube([12, 12, 3]);

            // Cable guide loop
            translate([6, 6, 3])
                cylinder(d=10, h=8, $fn=30);
        }

        // Hollow interior (cable passage)
        translate([6, 6, 2])
            cylinder(d=6, h=10);

        // Mounting hole
        translate([6, 6, -1])
            cylinder(d=m3_hole_diameter, h=5);
    }
}

// ============================================================================
// PART A-009: HDMI CABLE CLIP
// ============================================================================
module hdmi_clip() {
    difference() {
        union() {
            // Main clip body
            cube([14, 14, 3]);

            // Cable guide loop (larger for HDMI)
            translate([7, 7, 3])
                cylinder(d=12, h=8, $fn=30);
        }

        // Hollow interior (cable passage)
        translate([7, 7, 2])
            cylinder(d=8, h=10);

        // Mounting hole
        translate([7, 7, -1])
            cylinder(d=m3_hole_diameter, h=5);
    }
}

// ============================================================================
// ASSEMBLY: FULL MONITOR STAND
// ============================================================================
module full_assembly(show_aluminum=true, show_monitor=false) {
    // Left foot
    translate([0, 0, 0])
        left_foot();

    // Right foot
    translate([220, 0, 0])
        right_foot();

    // Crossbar clamp adapters
    translate([30, -15, 0])
        crossbar_clamp_adapter();
    translate([190, -15, 0])
        crossbar_clamp_adapter();

    // Aluminum crossbar (reference only, not printed)
    if(show_aluminum) {
        translate([60, -15, 10])
            cube([160, aluminum_size, aluminum_size], center=false);
    }

    // Monitor holder
    translate([0, -5, 25])
        monitor_holder();

    // Lock caps
    translate([15, 15, foot_height])
        lock_cap();
    translate([205, 15, foot_height])
        lock_cap();

    // Cable clips
    translate([25, 5, foot_height])
        usb_c_clip();
    translate([195, 5, foot_height])
        hdmi_clip();

    // Monitor reference (not printed)
    if(show_monitor) {
        translate([110, 15, 35])
            cube([160, monitor_slot_depth, 10], center=false);
    }
}

// ============================================================================
// RENDERING OPTIONS - UNCOMMENT TO VIEW/EXPORT
// ============================================================================

// Option 1: Render full assembly
full_assembly(show_aluminum=true, show_monitor=true);

// Option 2: Individual parts (uncomment one to export as STL)
// left_foot();
// right_foot();
// crossbar_clamp_adapter();
// monitor_holder();
// lock_cap();
// usb_c_clip();
// hdmi_clip();

// ============================================================================
// EXPORT GUIDE
// ============================================================================
// 1. In OpenSCAD: View → Render (F12) to get full geometry
// 2. File → Export as STL for each part
// 3. Use settings:
//    - Angular Tolerance: 0.01 degrees
//    - Tolerance: 0.001 mm
//    - Advanced options: OFF
// 4. Orient STLs for printing (see print orientation guide)
// ============================================================================
