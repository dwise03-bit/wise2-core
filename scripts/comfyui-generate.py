#!/usr/bin/env python3
"""Generate a single WISE² branded SDXL image via ComfyUI."""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from comfyui_client import COMFYUI_API_URL, generate_image, health_check


def main() -> int:
    p = argparse.ArgumentParser(description="WISE² ComfyUI image generation")
    p.add_argument("prompt", help="Image prompt")
    p.add_argument("--prefix", default="wise2", help="Output filename prefix")
    p.add_argument("--width", type=int, default=1024)
    p.add_argument("--height", type=int, default=1024)
    p.add_argument("--no-brand", action="store_true")
    args = p.parse_args()

    if not health_check():
        print(f"ComfyUI offline at {COMFYUI_API_URL}", file=sys.stderr)
        return 1

    prompt_id, images = generate_image(
        args.prompt,
        brand=not args.no_brand,
        width=args.width,
        height=args.height,
        prefix=args.prefix,
    )
    print(f"Done. prompt_id={prompt_id}")
    for img in images:
        print(f"  {img.get('filename')}")
    print(f"Download: bash scripts/comfyui-wise2.sh download {args.prefix.split('-')[0]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
