#!/usr/bin/env python3
"""Generate Cherry Count iOS icon assets from the locked master reference."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = ROOT.parents[1]
ASSETS = REPO_ROOT / "docs/cherry-count/assets"
MASTER_REF = ASSETS / "master-reference-v1.jpg"
ICON_DIR = ROOT / "ios/App/App/Assets.xcassets/AppIcon.appiconset"
SPLASH_DIR = ROOT / "ios/App/App/Assets.xcassets/Splash.imageset"

# Locked palette — Cherry Count Master Reference v1.0
COLORS = {
    "black": (5, 5, 5),
    "plum": (23, 8, 24),
    "hot": (255, 46, 136),
    "bubblegum": (255, 63, 162),
}

PANEL_BOX = (910, 45, 1020, 165)
HEART_BOX = (0, 0, 108, 54)
CROWN_BOX = (8, 56, 110, 120)


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
    max_r = size * 0.76
    for y in range(size):
        for x in range(size):
            d = math.hypot(x - cx, y - cy) / max_r
            t = min(1.0, d)
            color = mix(COLORS["plum"], COLORS["black"], t * 0.98)
            if t < 0.42:
                color = mix(COLORS["hot"], color, (0.42 - t) * 0.14)
            px[x, y] = (*color, 255)
    return img


def remove_dark_background(img: Image.Image, threshold: int = 38) -> Image.Image:
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if r < threshold and g < threshold and b < threshold:
                pixels[x, y] = (r, g, b, 0)
            elif r < 80 and g < 80 and b < 80 and abs(r - g) < 12 and abs(g - b) < 12:
                pixels[x, y] = (r, g, b, 0)
    return rgba


def trim_transparent(img: Image.Image) -> Image.Image:
    bbox = img.getbbox()
    return img.crop(bbox) if bbox else img


def extract_brand_assets(master: Image.Image) -> tuple[Image.Image, Image.Image]:
    panel = master.crop(PANEL_BOX)
    heart = trim_transparent(remove_dark_background(panel.crop(HEART_BOX)))
    crown = trim_transparent(remove_dark_background(panel.crop(CROWN_BOX)))
    return heart, crown


def paste_centered(base: Image.Image, asset: Image.Image, scale: float, y_offset: float = 0.0) -> None:
    target = int(base.size[0] * scale)
    asset = ImageOps.contain(asset, (target, target), Image.Resampling.LANCZOS)
    x = (base.size[0] - asset.size[0]) // 2
    y = int((base.size[1] - asset.size[1]) // 2 + base.size[1] * y_offset)
    base.alpha_composite(asset, (x, y))


def render_icon(size: int = 1024) -> Image.Image:
    if not MASTER_REF.exists():
        raise FileNotFoundError(f"Master reference not found: {MASTER_REF}")

    master = Image.open(MASTER_REF)
    heart, crown = extract_brand_assets(master)

    ASSETS.mkdir(parents=True, exist_ok=True)
    heart.save(ASSETS / "icon-heart-gem.png")
    crown.save(ASSETS / "icon-chrome-crown.png")

    base = radial_background(size)
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse(
        (size * 0.2, size * 0.34, size * 0.8, size * 0.86),
        fill=(255, 46, 136, 65),
    )
    base = Image.alpha_composite(base, glow.filter(ImageFilter.GaussianBlur(max(22, size // 24))))

    paste_centered(base, crown, 0.62, y_offset=0.1)
    paste_centered(base, heart, 0.28, y_offset=-0.27)
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
