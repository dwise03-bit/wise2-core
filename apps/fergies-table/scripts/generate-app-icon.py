#!/usr/bin/env python3
"""Generate Fergie's Table iOS icon and splash: gold cloche on royal purple."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ICON_DIR = ROOT / "ios/App/App/Assets.xcassets/AppIcon.appiconset"
SPLASH_DIR = ROOT / "ios/App/App/Assets.xcassets/Splash.imageset"

BLACK = (10, 10, 10)
DEEP = (58, 13, 110)
ROYAL = (106, 34, 226)
GOLD = (255, 215, 0)


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
    max_r = size * 0.78
    for y in range(size):
        for x in range(size):
            d = math.hypot(x - cx, y - cy) / max_r
            t = min(1.0, d)
            color = mix(DEEP, BLACK, t * 0.95)
            if t < 0.5:
                color = mix(ROYAL, color, (0.5 - t) * 0.55)
            px[x, y] = (*color, 255)
    return img


def draw_cloche(size: int) -> Image.Image:
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    cx = size / 2
    top = size * 0.22
    dome_h = size * 0.42
    width = size * 0.62
    left = cx - width / 2
    right = cx + width / 2
    stroke = max(6, int(size * 0.028))

    # handle
    r = size * 0.035
    draw.ellipse((cx - r, top - r * 1.6, cx + r, top + r * 0.4), fill=GOLD)
    # dome
    bbox = (left, top, right, top + dome_h * 2)
    draw.arc(bbox, 180, 0, fill=GOLD, width=stroke)
    # plate
    plate_y = top + dome_h
    draw.rounded_rectangle(
        (left - size * 0.02, plate_y, right + size * 0.02, plate_y + size * 0.045),
        radius=size * 0.02,
        fill=ROYAL,
    )
    draw.rounded_rectangle(
        (left - size * 0.04, plate_y + size * 0.04, right + size * 0.04, plate_y + size * 0.075),
        radius=size * 0.02,
        fill=GOLD,
    )
    return layer


def render_icon(size: int = 1024) -> Image.Image:
    base = radial_background(size)
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    g = ImageDraw.Draw(glow)
    g.ellipse(
        (size * 0.18, size * 0.22, size * 0.82, size * 0.86),
        fill=(255, 215, 0, 55),
    )
    base = Image.alpha_composite(base, glow.filter(ImageFilter.GaussianBlur(max(18, size // 28))))
    return Image.alpha_composite(base, draw_cloche(size))


def main() -> None:
    ICON_DIR.mkdir(parents=True, exist_ok=True)
    SPLASH_DIR.mkdir(parents=True, exist_ok=True)

    icon = render_icon(1024).convert("RGB")
    icon_path = ICON_DIR / "AppIcon-512@2x.png"
    icon.save(icon_path, "PNG")

    splash = render_icon(2732)
    splash.save(SPLASH_DIR / "splash-2732x2732.png", "PNG")
    splash.save(SPLASH_DIR / "splash-2732x2732-1.png", "PNG")
    splash.save(SPLASH_DIR / "splash-2732x2732-2.png", "PNG")

    print(f"Wrote {icon_path}")
    print(f"Wrote splash assets in {SPLASH_DIR}")


if __name__ == "__main__":
    main()
