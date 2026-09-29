#!/usr/bin/env python3
"""Generate CC Craft & Create iOS icon and splash assets."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ICON_DIR = ROOT / "ios/App/App/Assets.xcassets/AppIcon.appiconset"
SPLASH_DIR = ROOT / "ios/App/App/Assets.xcassets/Splash.imageset"

PURPLE = (109, 45, 189)
LAVENDER = (183, 133, 211)
LILAC = (243, 232, 255)
GOLD = (212, 175, 55)
DARK = (41, 35, 61)


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
            color = mix(PURPLE, DARK, t * 0.9)
            if t < 0.45:
                color = mix(LAVENDER, color, (0.45 - t) * 0.35)
            px[x, y] = (*color, 255)
    return img


def draw_monogram(size: int) -> Image.Image:
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    ring = int(size * 0.34)
    cx = cy = size // 2
    draw.ellipse((cx - ring, cy - ring, cx + ring, cy + ring), outline=(*GOLD, 255), width=max(4, size // 64))

    font_size = int(size * 0.28)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia Bold.ttf", font_size)
    except OSError:
        font = ImageFont.load_default()

    text = "CC"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text((cx - tw / 2, cy - th / 2 - size * 0.02), text, fill=(*GOLD, 255), font=font)

    sparkle_y = int(cy - ring * 0.72)
    draw.ellipse((cx - 6, sparkle_y - 6, cx + 6, sparkle_y + 6), fill=(*LILAC, 255))
    return layer


def render_icon(size: int = 1024) -> Image.Image:
    base = radial_background(size)
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse(
        (size * 0.22, size * 0.22, size * 0.78, size * 0.78),
        fill=(*LAVENDER, 70),
    )
    base = Image.alpha_composite(base, glow.filter(ImageFilter.GaussianBlur(max(18, size // 28))))
    base.alpha_composite(draw_monogram(size))
    return base


def main() -> None:
    icon = render_icon(1024)
    ICON_DIR.mkdir(parents=True, exist_ok=True)
    icon_path = ICON_DIR / "AppIcon-512@2x.png"
    icon.save(icon_path, "PNG")

    splash = render_icon(2732)
    SPLASH_DIR.mkdir(parents=True, exist_ok=True)
    splash.save(SPLASH_DIR / "splash-2732x2732.png", "PNG")
    splash.save(SPLASH_DIR / "splash-2732x2732-1.png", "PNG")
    splash.save(SPLASH_DIR / "splash-2732x2732-2.png", "PNG")

    print(f"Wrote {icon_path}")
    print(f"Wrote splash assets in {SPLASH_DIR}")


if __name__ == "__main__":
    main()
