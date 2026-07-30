#!/usr/bin/env python3
"""
Zordon master render generator — WISE² mascot.

Produces the source asset that BOTH deliverables need:
  - dashboard : feed the render to /animate-character to get sprite sheets
  - marketing : same render, upscaled, for print

The prompt is the locked one from docs/MASCOT_SPEC.md. It encodes all seven
canon features; renders missing any of them are off-model and should be
discarded rather than "fixed" in post.

Requires ComfyUI on :8188 with sd_xl_base_1.0.safetensors. That lives on the GPU
box, not on a Mac — scripts/gpu-image-generator-setup.sh is CUDA/Linux.

    python scripts/zordon-generator.py                 # 4 variants, cyan
    python scripts/zordon-generator.py --blue brand    # 4 variants, #0055FF
    python scripts/zordon-generator.py --variants 8
    python scripts/zordon-generator.py --pose wave
"""
import argparse
import random
import sys
import time
from pathlib import Path
from typing import Optional

try:
    import requests
except ImportError:
    sys.exit("pip install requests")

COMFY_API = "http://localhost:8188"
OUTPUT_DIR = Path("zordon_renders")
CHECKPOINT = "sd_xl_base_1.0.safetensors"

# SDXL is trained at 1024x1024. Character renders want square.
WIDTH = HEIGHT = 1024

# --- brand blue is UNDECIDED, see docs/MASCOT_SPEC.md -------------------------
# The reference art reads cyan (~#0094FF, which the login page already ships).
# BRAND_BIBLE_UPDATED.md specifies #0055FF. Render whichever you intend to keep —
# doing this twice is the expensive mistake.
BLUES = {
    "cyan":  "electric cyan-blue (#0094FF)",
    "brand": "vivid royal blue (#0055FF)",
}

POSES = {
    "idle":      "standing, arms crossed, weight on one hip, confident smirk",
    "wave":      "standing, one arm raised waving, friendly open smile",
    "thinking":  "standing, one hand on chin, head tilted, curious expression",
    "celebrate": "both arms raised in celebration, wide grin, mid-cheer",
}


def build_prompt(blue: str, pose: str) -> str:
    """Locked description from MASCOT_SPEC. All seven canon features present."""
    return (
        "Chibi imp mascot character, full body, centred, "
        "near-black skin with {blue} rim lighting, "
        "two curved matte black horns, pointed elf ears, "
        "oversized {blue} eyes with bright specular highlights, "
        "black ribbed beanie with a small gold crown emblem, "
        "gold rope chain necklace worn outside the hoodie, "
        "black hoodie with a gold letter mark on the chest, "
        "black joggers, black boots with gold accents, "
        "slim pointed spade-tip tail, "
        "{pose}, "
        "dark navy background with subtle neon city bokeh, "
        "clean vector illustration style, bold outlines, high contrast, "
        "centred composition, full character visible, studio character sheet"
    ).format(blue=blue, pose=pose)


# Off-model traits from MASCOT_SPEC, plus the usual SDXL failure modes.
NEGATIVE = (
    "realistic proportions, adult body, tall, muscular, "
    "snarling, menacing, weapon, blood, horror, "
    "red palette, purple palette, green palette, "
    "missing horns, missing tail, missing beanie, no chain, "
    "text, watermark, signature, logo text, letters, words, "
    "cropped, cut off, out of frame, multiple characters, "
    "blurry, low quality, deformed hands, extra limbs, extra fingers"
)


def build_workflow(prompt: str, negative: str, seed: int, steps: int, cfg: float) -> dict:
    """
    A COMPLETE ComfyUI graph.

    NOTE: scripts/piff-city-generator.py is missing EmptyLatentImage entirely and
    uses class_type "CLIPTextEncode(Positive)", which is not a real node. Its
    KSampler therefore has no latent_image and ComfyUI rejects the whole
    workflow — it cannot ever have produced an image. Do not copy from it.
    """
    return {
        "4": {
            "class_type": "CheckpointLoaderSimple",
            "inputs": {"ckpt_name": CHECKPOINT},
        },
        "5": {
            "class_type": "EmptyLatentImage",
            "inputs": {"width": WIDTH, "height": HEIGHT, "batch_size": 1},
        },
        "6": {
            "class_type": "CLIPTextEncode",
            "inputs": {"text": prompt, "clip": ["4", 1]},
        },
        "7": {
            "class_type": "CLIPTextEncode",
            "inputs": {"text": negative, "clip": ["4", 1]},
        },
        "9": {
            "class_type": "KSampler",
            "inputs": {
                "seed": seed,
                "steps": steps,
                "cfg": cfg,
                "sampler_name": "dpmpp_2m",
                "scheduler": "karras",
                "denoise": 1.0,
                "model": ["4", 0],
                "positive": ["6", 0],
                "negative": ["7", 0],
                "latent_image": ["5", 0],
            },
        },
        "8": {
            "class_type": "VAEDecode",
            "inputs": {"samples": ["9", 0], "vae": ["4", 2]},
        },
        "10": {
            "class_type": "SaveImage",
            "inputs": {"filename_prefix": "zordon", "images": ["8", 0]},
        },
    }


def comfy_up() -> bool:
    try:
        requests.get(f"{COMFY_API}/system_stats", timeout=3)
        return True
    except requests.RequestException:
        return False


def submit(workflow: dict, client_id: str) -> Optional[str]:
    r = requests.post(f"{COMFY_API}/prompt",
                      json={"client_id": client_id, "prompt": workflow},
                      timeout=30)
    if r.status_code != 200:
        print(f"   rejected by ComfyUI: {r.status_code} {r.text[:300]}")
        return None
    return r.json().get("prompt_id")


def wait(prompt_id: str, timeout: int = 600) -> bool:
    start = time.time()
    while time.time() - start < timeout:
        try:
            h = requests.get(f"{COMFY_API}/history/{prompt_id}", timeout=10).json()
            if prompt_id in h:
                return True
        except requests.RequestException:
            pass
        time.sleep(2)
    return False


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--variants", type=int, default=4, help="seeds to render")
    ap.add_argument("--blue", choices=BLUES, default="cyan")
    ap.add_argument("--pose", choices=POSES, default="idle")
    ap.add_argument("--steps", type=int, default=30)
    ap.add_argument("--cfg", type=float, default=7.0)
    ap.add_argument("--dry-run", action="store_true", help="print the prompt, render nothing")
    a = ap.parse_args()

    prompt = build_prompt(BLUES[a.blue], POSES[a.pose])

    if a.dry_run:
        print(f"blue  : {a.blue} — {BLUES[a.blue]}")
        print(f"pose  : {a.pose}")
        print(f"size  : {WIDTH}x{HEIGHT}\n")
        print("POSITIVE:\n" + prompt + "\n")
        print("NEGATIVE:\n" + NEGATIVE)
        return 0

    if not comfy_up():
        print(f"No ComfyUI at {COMFY_API}.")
        print("  This needs the GPU box — gpu-image-generator-setup.sh is CUDA/Linux.")
        print("  Start it with:  bash ~/.comfyui/start-comfyui.sh")
        print("  Or preview the prompt here with:  --dry-run")
        return 1

    OUTPUT_DIR.mkdir(exist_ok=True)
    print(f"Zordon — {a.variants} variants, {a.blue} blue, {a.pose} pose, {WIDTH}x{HEIGHT}")

    ok = 0
    for i in range(a.variants):
        seed = random.randint(0, 2**31 - 1)
        print(f"\n[{i+1}/{a.variants}] seed {seed}")
        pid = submit(build_workflow(prompt, NEGATIVE, seed, a.steps, a.cfg), f"zordon-{i}")
        if pid and wait(pid):
            print("   done")
            ok += 1
        else:
            print("   failed")

    print(f"\n{ok}/{a.variants} rendered. Check ComfyUI's output folder.")
    print("\nNext: pick the most on-model render against docs/MASCOT_SPEC.md")
    print("      (all seven canon features present), then /animate-character it.")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
