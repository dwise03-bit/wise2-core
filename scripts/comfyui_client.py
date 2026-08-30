#!/usr/bin/env python3
"""Shared ComfyUI SDXL client for WISE² generators."""
from __future__ import annotations

import os
import time
import uuid
from typing import Any
from urllib.parse import urljoin

import requests

COMFYUI_API_URL = os.environ.get("COMFYUI_API_URL", "http://127.0.0.1:8188").rstrip("/")
CHECKPOINT = os.environ.get("COMFYUI_CHECKPOINT", "sd_xl_base_1.0.safetensors")

WISE2_BRAND_SUFFIX = (
    ", WISE² brand aesthetic, purple #9d4edd and electric green #39ff14 accents, "
    "matte black background, cinematic HDR, premium luxury tech, 4K"
)

DEFAULT_NEGATIVE = (
    "blurry, low quality, watermark, signature, distorted text, ugly, deformed"
)


def health_check(base_url: str | None = None) -> bool:
    url = (base_url or COMFYUI_API_URL).rstrip("/")
    try:
        r = requests.get(f"{url}/system_stats", timeout=8)
        return r.status_code == 200
    except requests.RequestException:
        return False


def build_sdxl_workflow(
    prompt: str,
    *,
    negative: str = DEFAULT_NEGATIVE,
    width: int = 1024,
    height: int = 1024,
    steps: int = 25,
    cfg: float = 7.5,
    seed: int | None = None,
    prefix: str = "wise2",
) -> dict[str, Any]:
    if seed is None:
        seed = int(time.time()) % 1_000_000_000
    return {
        "4": {
            "inputs": {"ckpt_name": CHECKPOINT},
            "class_type": "CheckpointLoaderSimple",
        },
        "5": {
            "inputs": {"width": width, "height": height, "batch_size": 1},
            "class_type": "EmptyLatentImage",
        },
        "6": {
            "inputs": {"text": prompt, "clip": ["4", 1]},
            "class_type": "CLIPTextEncode",
        },
        "7": {
            "inputs": {"text": negative, "clip": ["4", 1]},
            "class_type": "CLIPTextEncode",
        },
        "8": {
            "inputs": {"samples": ["9", 0], "vae": ["4", 2]},
            "class_type": "VAEDecode",
        },
        "9": {
            "inputs": {
                "seed": seed,
                "steps": steps,
                "cfg": cfg,
                "sampler_name": "euler",
                "scheduler": "normal",
                "denoise": 1.0,
                "model": ["4", 0],
                "positive": ["6", 0],
                "negative": ["7", 0],
                "latent_image": ["5", 0],
            },
            "class_type": "KSampler",
        },
        "10": {
            "inputs": {"filename_prefix": prefix, "images": ["8", 0]},
            "class_type": "SaveImage",
        },
    }


def submit_prompt(
    workflow: dict[str, Any],
    *,
    client_id: str | None = None,
    base_url: str | None = None,
) -> str:
    url = (base_url or COMFYUI_API_URL).rstrip("/")
    payload = {
        "client_id": client_id or str(uuid.uuid4()),
        "prompt": workflow,
    }
    r = requests.post(f"{url}/prompt", json=payload, timeout=60)
    r.raise_for_status()
    data = r.json()
    prompt_id = data.get("prompt_id")
    if not prompt_id:
        raise RuntimeError(f"No prompt_id in response: {data}")
    return prompt_id


def wait_for_images(
    prompt_id: str,
    *,
    timeout_s: int = 300,
    poll_s: float = 1.0,
    base_url: str | None = None,
) -> list[dict[str, str]]:
    url = (base_url or COMFYUI_API_URL).rstrip("/")
    deadline = time.time() + timeout_s
    while time.time() < deadline:
        r = requests.get(f"{url}/history/{prompt_id}", timeout=15)
        if r.status_code == 200:
            history = r.json()
            if prompt_id in history and history[prompt_id].get("outputs"):
                images: list[dict[str, str]] = []
                for node_out in history[prompt_id]["outputs"].values():
                    for img in node_out.get("images", []):
                        images.append(img)
                if images:
                    return images
        time.sleep(poll_s)
    raise TimeoutError(f"ComfyUI job {prompt_id} timed out after {timeout_s}s")


def image_view_url(img: dict[str, str], base_url: str | None = None) -> str:
    base = (base_url or COMFYUI_API_URL).rstrip("/") + "/"
    q = f"filename={img['filename']}&type={img.get('type', 'output')}"
    if img.get("subfolder"):
        q += f"&subfolder={img['subfolder']}"
    return urljoin(base, f"view?{q}")


def generate_image(
    prompt: str,
    *,
    brand: bool = True,
    width: int = 1024,
    height: int = 1024,
    prefix: str = "wise2",
    base_url: str | None = None,
) -> tuple[str, list[dict[str, str]]]:
    full_prompt = f"{prompt}{WISE2_BRAND_SUFFIX}" if brand else prompt
    workflow = build_sdxl_workflow(
        full_prompt, width=width, height=height, prefix=prefix
    )
    prompt_id = submit_prompt(workflow, base_url=base_url)
    images = wait_for_images(prompt_id, base_url=base_url)
    return prompt_id, images
