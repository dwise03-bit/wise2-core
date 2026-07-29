#!/usr/bin/env python3
"""
Slice every exported STL with CuraEngine and report real print time and mass.

CuraEngine's gcode header carries a placeholder (;TIME:6666, Filament used: 0m)
that Cura's GUI rewrites after slicing; in CLI mode it is never patched. The
authoritative figures come from the engine's own log lines, which is what this
parses.

Settings below approximate the Anycubic Kobra X 0.4 mm profile. They are NOT
the vendor profile -- treat the output as a close estimate, and confirm in the
slicer GUI before a long print.

usage: python3 tools/slice_report.py [part ...]
"""
import json, os, re, subprocess, sys

RES = "/Applications/UltiMaker Cura.app/Contents/Resources/share/cura/resources"
ENG = "/Applications/UltiMaker Cura.app/Contents/Resources/CuraEngine"
DEF = f"{RES}/definitions/fdmprinter.def.json"

NOZZLE, LAYER = 0.4, 0.20
LW = round(NOZZLE * 1.05, 2)
PLA = 1.24                      # g/cm^3

# one of each part in a full build
QTY = {'foot': 2, 'saddle_cap': 2, 'cradle': 2, 'clip_usbc': 1, 'clip_hdmi': 1,
       'fit_coupon': 0}         # coupon is a pre-test, not part of the set
ORDER = ['fit_coupon', 'foot', 'saddle_cap', 'cradle', 'clip_usbc', 'clip_hdmi']


def base_settings():
    """Every fdmprinter default, flattened. CuraEngine's CLI does not evaluate
    the inheritance/expression tree, so unresolved settings abort the slice."""
    d = json.load(open(DEF))
    s = {}

    def walk(node):
        for k, v in node.items():
            if not isinstance(v, dict):
                continue
            if 'default_value' in v:
                dv = v['default_value']
                s[k] = 'true' if dv is True else 'false' if dv is False else str(dv)
            if 'children' in v:
                walk(v['children'])
    walk(d['settings'])

    s.update({
        'machine_width': '260', 'machine_depth': '260', 'machine_height': '260',
        'machine_nozzle_size': str(NOZZLE), 'machine_center_is_zero': 'false',
        'machine_extruder_count': '1', 'machine_heated_bed': 'true',
        'machine_gcode_flavor': 'RepRap (Marlin/Sprinter)',
        'machine_start_gcode': '', 'machine_end_gcode': '',
        'machine_extruder_start_code': '', 'machine_extruder_end_code': '',
        'material_diameter': '1.75',
        'layer_height': str(LAYER), 'layer_height_0': '0.24',
        'line_width': str(LW), 'wall_line_width': str(LW),
        'wall_line_width_0': str(LW), 'wall_line_width_x': str(LW),
        'skin_line_width': str(LW), 'infill_line_width': str(LW),
        'skirt_brim_line_width': str(LW), 'support_line_width': str(LW),
        'initial_layer_line_width_factor': '110',
        'wall_line_count': '3', 'top_layers': '5', 'bottom_layers': '4',
        'wall_thickness': str(round(3 * LW, 2)), 'top_bottom_thickness': '1.0',
        'infill_sparse_density': '12', 'infill_pattern': 'gyroid',
        'infill_line_distance': str(round(2 * LW * 100 / 12, 2)),
        'roofing_layer_count': '0', 'flooring_layer_count': '0',
        'material_print_temperature': '205',
        'material_print_temperature_layer_0': '210',
        'default_material_print_temperature': '205',
        'material_initial_print_temperature': '205',
        'material_final_print_temperature': '205',
        'material_bed_temperature': '58',
        'material_bed_temperature_layer_0': '60',
        'material_flow': '100', 'machine_nozzle_temp_enabled': 'true',
        'speed_print': '60', 'speed_infill': '60', 'speed_wall': '40',
        'speed_wall_0': '30', 'speed_wall_x': '45', 'speed_topbottom': '40',
        'speed_roofing': '40', 'speed_flooring': '40', 'speed_travel': '150',
        'speed_layer_0': '20', 'speed_travel_layer_0': '60',
        'speed_support': '50', 'speed_prime_tower': '50', 'skirt_brim_speed': '20',
        'acceleration_enabled': 'true', 'acceleration_print': '2500',
        'acceleration_travel': '3000', 'acceleration_layer_0': '1000',
        'acceleration_wall': '2000', 'acceleration_wall_0': '1500',
        'acceleration_wall_x': '2500', 'acceleration_infill': '2500',
        'acceleration_topbottom': '2000', 'acceleration_travel_layer_0': '1500',
        'acceleration_skirt_brim': '1000', 'acceleration_roofing': '2000',
        'acceleration_flooring': '2000', 'acceleration_support': '2500',
        'acceleration_support_infill': '2500', 'acceleration_support_roof': '2500',
        'acceleration_support_bottom': '2500', 'acceleration_prime_tower': '2500',
        'acceleration_support_interface': '2500',
        'acceleration_wall_0_roofing': '2000', 'acceleration_wall_x_roofing': '2000',
        'acceleration_wall_0_flooring': '2000', 'acceleration_wall_x_flooring': '2000',
        'jerk_enabled': 'false',
        'machine_max_acceleration_x': '3000', 'machine_max_acceleration_y': '3000',
        'machine_max_feedrate_x': '300', 'machine_max_feedrate_y': '300',
        'retraction_enable': 'true', 'retraction_amount': '5',
        'retraction_speed': '40', 'retraction_retract_speed': '40',
        'retraction_prime_speed': '40',
        'support_enable': 'false', 'adhesion_type': 'skirt', 'skirt_line_count': '2',
        'cool_fan_enabled': 'true', 'cool_fan_speed': '100', 'cool_min_layer_time': '5',
    })
    return s


def slice_one(part, args, env):
    stl = f'stl_output/{part}.stl'
    if not os.path.exists(stl):
        return None
    p = subprocess.run(args + ['-o', f'/tmp/{part}.gcode', '-l', stl],
                       capture_output=True, text=True, env=env)
    log = p.stdout + p.stderr
    t = re.search(r'Print time \(s\): (\d+)', log)
    v = re.search(r'Filament \(mm\^?3\): (\d+)', log)
    if not (t and v):
        miss = sorted(set(re.findall(r'no value given: (\w+)', log)))
        print(f"  {part}: slice failed" + (f"  missing={miss[:6]}" if miss else ""))
        return None
    return int(t.group(1)), int(v.group(1)) / 1000.0 * PLA


def hm(s):
    return f"{int(s)//3600}h {(int(s)%3600)//60:02d}m"


def main():
    parts = sys.argv[1:] or ORDER
    args = [ENG, 'slice', '-v', '-j', DEF]
    for k, v in base_settings().items():
        args += ['-s', f'{k}={" " if chr(10) in v else v}']
    env = dict(os.environ,
               CURA_ENGINE_SEARCH_PATH=f"{RES}/definitions:{RES}/extruders")

    print(f"CuraEngine · {NOZZLE} mm nozzle · {LAYER} mm layers · 3 walls · 12% gyroid · no supports")
    print(f"{'part':<12}{'qty':>4}{'each':>10}{'each g':>9}{'total':>10}{'total g':>9}")
    print('-' * 56)

    tt = tg = 0
    for part in parts:
        r = slice_one(part, args, env)
        if not r:
            continue
        secs, grams = r
        q = QTY.get(part, 1)
        note = '  (pre-test, not in set)' if q == 0 else ''
        tt += secs * q
        tg += grams * q
        print(f"{part:<12}{q:>4}{hm(secs):>10}{grams:>9.1f}"
              f"{hm(secs*q) if q else '-':>10}{(grams*q if q else 0):>9.1f}{note}")

    print('-' * 56)
    print(f"{'FULL SET':<12}{'':>4}{'':>10}{'':>9}{hm(tt):>10}{tg:>9.1f}")
    print("\nApproximates the Kobra X 0.4 mm profile; confirm in the slicer GUI.")
    return 0


if __name__ == '__main__':
    sys.exit(main())
