#!/usr/bin/env python3
"""Generate SenCere iOS icon from the Blakk Hail / Piff City bunny emblem."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[1]
EMBLEM = REPO / "apps/website/public/sencere-assets/blakkhail/sencere-emblem.jpg"
ICON_DIR = ROOT / "SenCere/Assets.xcassets/AppIcon.appiconset"
EMBLEM_DIR = ROOT / "SenCere/Assets.xcassets/SenCereEmblem.imageset"

JET = (10, 10, 10)
GOLD = (214, 163, 49)
GOLD_SOFT = (232, 196, 107)


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def mix(c1: tuple[int, int, int], c2: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return (
        int(lerp(c1[0], c2[0], t)),
        int(lerp(c1[1], c2[1], t)),
        int(lerp(c1[2], c2[2], t)),
    )


def radial_background(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size))
    px = img.load()
    cx = cy = size / 2
    max_r = size * 0.72
    for y in range(size):
        for x in range(size):
            d = math.hypot(x - cx, y - cy) / max_r
            t = min(1.0, d)
            color = mix((26, 26, 28), JET, t)
            if t < 0.55:
                color = mix(GOLD, color, (0.55 - t) * 0.22)
            px[x, y] = (*color, 255)
    return img


def load_emblem(size: int) -> Image.Image:
    if not EMBLEM.exists():
        raise SystemExit(f"Missing emblem source: {EMBLEM}")
    emblem = Image.open(EMBLEM).convert("RGBA")
    emblem = ImageOps.fit(emblem, (size, size), method=Image.Resampling.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    inset = int(size * 0.04)
    draw.ellipse((inset, inset, size - inset, size - inset), fill=255)
    emblem.putalpha(mask)
    return emblem


def render_icon(size: int = 1024) -> Image.Image:
    base = radial_background(size)
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    g = ImageDraw.Draw(glow)
    pad = size * 0.12
    g.ellipse((pad, pad, size - pad, size - pad), fill=(*GOLD, 48))
    base = Image.alpha_composite(base, glow.filter(ImageFilter.GaussianBlur(max(16, size // 32))))

    ring = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    rd = ImageDraw.Draw(ring)
    inset = int(size * 0.055)
    rd.ellipse(
        (inset, inset, size - inset, size - inset),
        outline=(*GOLD_SOFT, 220),
        width=max(4, size // 128),
    )
    base = Image.alpha_composite(base, ring)

    emblem_size = int(size * 0.78)
    emblem = load_emblem(emblem_size)
    offset = (size - emblem_size) // 2
    base.paste(emblem, (offset, offset), emblem)
    return base


def main() -> None:
    ICON_DIR.mkdir(parents=True, exist_ok=True)
    EMBLEM_DIR.mkdir(parents=True, exist_ok=True)

    icon = render_icon(1024)
    icon_path = ICON_DIR / "AppIcon-1024.png"
    icon.convert("RGB").save(icon_path, "PNG")

    emblem_copy = EMBLEM_DIR / "sencere-emblem.jpg"
    if EMBLEM.exists():
        Image.open(EMBLEM).convert("RGB").save(emblem_copy, "JPEG", quality=92)

    contents = """{
  "images" : [
    {
      "filename" : "sencere-emblem.jpg",
      "idiom" : "universal",
      "scale" : "1x"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
"""
    (EMBLEM_DIR / "Contents.json").write_text(contents, encoding="utf-8")
    print(f"Wrote {icon_path}")
    print(f"Wrote {emblem_copy}")


if __name__ == "__main__":
    main()
