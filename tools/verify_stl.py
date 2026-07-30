#!/usr/bin/env python3
"""
Verify exported STLs for the Packout monitor stand.

Checks that matter before printing:
  bodies   -- MUST be 1. More than 1 means the part prints as loose chunks.
  origin   -- should be ~(0,0,0): part sits on the bed, in positive space.
  bbox     -- must fit the Kobra X 260x260x260 build volume.
  overhang -- cross-section must not step outward more than MAX_OVERHANG per side
              at any height. A part on a narrow pedestal under a wide plate prints
              the plate into thin air. This check was ADDED AFTER shipping seven
              unprintable parts whose plates overhung their tongues by up to
              30.7 mm; topology was fine and they still could not print.

Mass is an ESTIMATE computed from geometry (shell + infill), not a slicer
result. Confirm in your slicer before ordering filament.

usage: python3 tools/verify_stl.py [stl_dir]
"""
import struct, sys, os

# --- print assumptions (keep in sync with the slicer profile) ---------------
WALLS       = 3
NOZZLE      = 0.4
LINE_WIDTH  = NOZZLE * 1.05
INFILL      = 0.12      # 12%
PLA_DENSITY = 1.24      # g/cm^3
BED         = (260.0, 260.0, 260.0)
MAX_OVERHANG = 2.0      # mm per side of unsupported outward step
OVERHANG_SLICES = 60

WALL_T = WALLS * LINE_WIDTH


def read_stl(path):
    with open(path, 'rb') as f:
        if f.read(5) == b'solid':
            f.seek(0)
            tris, verts = [], []
            for line in f:
                if line.strip().startswith(b'vertex'):
                    verts.append(tuple(float(x) for x in line.split()[1:4]))
                    if len(verts) == 3:
                        tris.append(tuple(verts)); verts = []
            return tris
        f.seek(84)
        data = f.read()
        out = []
        for i in range(len(data) // 50):
            v = struct.unpack_from('<12f', data, i * 50)
            out.append(((v[3], v[4], v[5]), (v[6], v[7], v[8]), (v[9], v[10], v[11])))
        return out


def worst_overhang(tris):
    """Largest outward step per side, scanning cross-sections up Z."""
    zs = [p[2] for t in tris for p in t]
    lo, hi = min(zs), max(zs)
    if hi - lo < 0.1:
        return 0.0, None

    def extent(z):
        xs, ys = [], []
        for tri in tris:
            for a, b in ((0, 1), (1, 2), (2, 0)):
                z1, z2 = tri[a][2], tri[b][2]
                if (z1 - z) * (z2 - z) < 0:
                    f = (z - z1) / (z2 - z1)
                    xs.append(tri[a][0] + f * (tri[b][0] - tri[a][0]))
                    ys.append(tri[a][1] + f * (tri[b][1] - tri[a][1]))
        return (max(xs) - min(xs), max(ys) - min(ys)) if xs else (0.0, 0.0)

    worst, at_z, prev = 0.0, None, None
    for i in range(1, OVERHANG_SLICES):
        z = lo + (hi - lo) * i / OVERHANG_SLICES
        e = extent(z)
        if prev:
            step = max((e[0] - prev[0]) / 2, (e[1] - prev[1]) / 2)
            if step > worst:
                worst, at_z = step, z
        prev = e
    return worst, at_z


def analyse(path):
    tris = read_stl(path)
    if not tris:
        return None

    pts = [p for t in tris for p in t]
    xs, ys, zs = zip(*pts)

    vol = 0.0
    area = 0.0
    for a, b, c in tris:
        vol += (a[0] * (b[1] * c[2] - b[2] * c[1])
                - a[1] * (b[0] * c[2] - b[2] * c[0])
                + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6.0
        u = (b[0] - a[0], b[1] - a[1], b[2] - a[2])
        v = (c[0] - a[0], c[1] - a[1], c[2] - a[2])
        cr = (u[1] * v[2] - u[2] * v[1],
              u[2] * v[0] - u[0] * v[2],
              u[0] * v[1] - u[1] * v[0])
        area += 0.5 * (cr[0] ** 2 + cr[1] ** 2 + cr[2] ** 2) ** 0.5
    vol = abs(vol)

    # connected components via shared (rounded) vertices
    parent = {}

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb

    key = lambda p: (round(p[0], 4), round(p[1], 4), round(p[2], 4))
    for t in tris:
        k = [key(p) for p in t]
        for kk in k:
            parent.setdefault(kk, kk)
        union(k[0], k[1])
        union(k[1], k[2])
    bodies = len({find(k) for k in parent})

    oh, oh_z = worst_overhang(tris)
    shell = min(area * WALL_T, vol)
    printed = shell + max(0.0, vol - shell) * INFILL

    return dict(
        bodies=bodies,
        bbox=(round(max(xs) - min(xs), 2), round(max(ys) - min(ys), 2), round(max(zs) - min(zs), 2)),
        origin=(round(min(xs), 2), round(min(ys), 2), round(min(zs), 2)),
        solid_cm3=vol / 1000.0,
        est_g=printed / 1000.0 * PLA_DENSITY,
        overhang=oh,
        overhang_z=oh_z,
    )


def main():
    d = sys.argv[1] if len(sys.argv) > 1 else 'stl_output'
    files = sorted(f for f in os.listdir(d) if f.endswith('.stl'))
    if not files:
        print(f"no STLs in {d}/")
        return 1

    print(f"{'part':<14}{'bodies':>7}{'bbox (mm)':>24}{'ovhang':>8}"
          f"{'est g':>8}  status")
    print('-' * 104)

    total, bad = 0.0, []
    for f in files:
        a = analyse(os.path.join(d, f))
        if not a:
            bad.append(f)
            continue
        problems = []
        if a['bodies'] != 1:
            problems.append(f"{a['bodies']} SEPARATE BODIES")
        if any(o < -0.01 for o in a['origin']):
            problems.append("negative space / off bed")
        if any(b > lim for b, lim in zip(a['bbox'], BED)):
            problems.append("exceeds build volume")
        if a['overhang'] > MAX_OVERHANG:
            problems.append(f"OVERHANG {a['overhang']:.1f} mm/side at z={a['overhang_z']:.1f}"
                            " -- needs supports or a chamfer")
        if problems:
            bad.append(f)
        status = 'OK' if not problems else 'FAIL: ' + '; '.join(problems)
        total += a['est_g']
        print(f"{f[:-4]:<14}{a['bodies']:>7}{str(a['bbox']):>24}"
              f"{a['overhang']:>7.1f} {a['est_g']:>7.1f}  {status}")

    print('-' * 104)
    print(f"one of each: {total:.1f} g PLA  (ESTIMATE: {WALLS} walls x {LINE_WIDTH:.2f} mm ({NOZZLE} nozzle), "
          f"{int(INFILL * 100)}% infill, {PLA_DENSITY} g/cm3)")
    print("Print time is NOT estimated here -- read it off your slicer.")
    if bad:
        print(f"\n{len(bad)} part(s) need attention: {', '.join(bad)}")
        return 1
    print("\nAll parts are single solids, sitting on the bed, within build volume.")
    return 0


if __name__ == '__main__':
    sys.exit(main())
