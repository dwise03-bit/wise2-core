#!/usr/bin/env python3
"""
PIFF CITY × WISE² Instagram Campaign Generator
Generates all 5 posts via ComfyUI API on your local GPU

Requirements:
- ComfyUI running on http://localhost:8188
- SDXL model downloaded

Usage:
python scripts/piff-city-generator.py
"""

import requests
import json
import time
import sys
from pathlib import Path
from datetime import datetime

# Configuration
COMFY_API = "http://localhost:8188"
OUTPUT_DIR = Path("instagram_posts")
OUTPUT_DIR.mkdir(exist_ok=True)

# Adapted prompts for Stable Diffusion XL
# Removed Midjourney-specific flags, simplified for better SDXL compatibility
CAMPAIGN_POSTS = [
    {
        "id": "post-1-hero",
        "title": "Hero Announcement - Culture Meets Systems",
        "prompt": "A cinematic luxury composition with neon purple and electric green neon text reading 'CULTURE MEETS SYSTEMS' and 'PIFF CITY × WISE²' on a matte black background, volumetric purple fog and rim lighting, ultra-premium typography, chrome accents, brushed steel elements, subtle holographic reflections, cinematic depth of field, studio lighting with edge highlights, dark moody atmosphere, luxury tech aesthetic, 4K HDR, professional advertising photography, shot with 50mm lens, shallow depth of field, stopped down to f/2.8",
        "negative": "blurry, low quality, distorted text, watermark, signature",
        "cfg": 7.5,
        "steps": 25,
    },
    {
        "id": "post-2-split",
        "title": "Split Identity - Culture vs Systems",
        "prompt": "A split-screen luxury composition: left side dominated by royal purple with a crown emoji and 'PIFF CITY CULTURE PRODUCTION' text in elegant typography, right side brilliant electric green with a lightning bolt emoji and 'WISE² SYSTEMS INTELLIGENCE' text, separated by a glowing neon line divider, matte black background, volumetric lighting effects, professional product photography style, cinematic color grading, high contrast, luxury brand aesthetic, studio lighting, 4K HDR, architectural precision, premium luxury brand collaboration style, shot at 35mm",
        "negative": "blurry, asymmetric, unbalanced, low quality, distorted",
        "cfg": 7.5,
        "steps": 25,
    },
    {
        "id": "post-3-workforce",
        "title": "Digital Workforce - Meet Your AI Team",
        "prompt": "A futuristic command center interior at night with sleek matte black surfaces and electric green neon accents, a holographic AI interface in the center displaying a robot icon with 'DIGITAL WORKFORCE' text, surrounding elements show data streams and digital particles floating, volumetric cyan fog, rim lighting, cinematic depth, luxury tech aesthetic, professional corporate photography, 4K HDR, shot with 85mm lens, f/2.0 aperture, ultra-sharp focus on central hologram, blurred neon background, modern futuristic architecture, high-end product photography",
        "negative": "blurry hologram, distorted interface, low quality, cluttered",
        "cfg": 7.5,
        "steps": 25,
    },
    {
        "id": "post-4-grid",
        "title": "Capabilities Grid - Built For Tomorrow",
        "prompt": "A premium grid layout composition with four luxury product cards arranged in a 2x2 grid: 1) Film reel icon 'PREMIUM PRODUCTION' with purple gradient, 2) Gear icon 'SMART AUTOMATION' with green gradient, 3) Chart icon 'REAL-TIME ANALYTICS' with blue gradient, 4) Brain icon 'ENTERPRISE AI' with purple gradient. Matte black background, cards have chrome borders with subtle glow, neon accent lines, professional dashboard aesthetic, luxury tech visualization, 4K HDR, premium typography, cinematic lighting, high contrast, studio professional photography",
        "negative": "blurry cards, distorted icons, misaligned grid, low quality, cluttered",
        "cfg": 7.5,
        "steps": 25,
    },
    {
        "id": "post-5-cta",
        "title": "Call to Action - Ready To Level Up?",
        "prompt": "A luxury nighttime rooftop scene in a premium NYC urban setting, vast cityscape in the background with soft bokeh lights, foreground shows glowing neon text 'READY TO LEVEL UP?' and 'PIFF CITY × WISE²' with a star icon burst effect, matte black surfaces with purple and green neon accents, volumetric atmospheric fog, cinematic depth with layers, professional luxury product photography, 4K HDR, shot with 50mm lens at f/1.8, ultra-sharp text, blurred city lights, premium brand aesthetic, high-end advertising photography style",
        "negative": "blurry text, distorted city, low quality, cluttered background",
        "cfg": 7.5,
        "steps": 25,
    },
]

def build_workflow(prompt: str, negative: str, steps: int, cfg: float) -> dict:
    """Build ComfyUI workflow for image generation"""
    return {
        "4": {
            "inputs": {"ckpt_name": "sd_xl_base_1.0.safetensors"},
            "class_type": "CheckpointLoaderSimple",
        },
        # Was missing entirely, so KSampler had no latent_image and ComfyUI
        # rejected the whole workflow. Also the only place the 1080x1350 the
        # quickstart promises can actually come from.
        "5": {
            "inputs": {"width": 1080, "height": 1350, "batch_size": 1},
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
                "seed": int(time.time()) % 1000000,
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
            "inputs": {
                "filename_prefix": "instagram",
                "images": ["8", 0],
            },
            "class_type": "SaveImage",
        },
    }

def generate_post(post_data: dict) -> bool:
    """Generate a single post image"""
    post_id = post_data["id"]
    title = post_data["title"]
    prompt = post_data["prompt"]
    negative = post_data["negative"]
    cfg = post_data["cfg"]
    steps = post_data["steps"]

    print(f"\n📸 Generating: {title}")
    print(f"   Prompt: {prompt[:80]}...")

    workflow = build_workflow(prompt, negative, steps, cfg)
    payload = {
        "client_id": post_id,
        "prompt": workflow,
    }

    try:
        # Submit generation
        response = requests.post(
            f"{COMFY_API}/api/prompt",
            json=payload,
            timeout=30,
        )

        if response.status_code == 200:
            data = response.json()
            prompt_id = data.get("prompt_id")
            print(f"   ✅ Submitted (ID: {prompt_id})")

            # Poll for completion
            max_retries = 120  # 2 minutes max wait
            retry_count = 0

            while retry_count < max_retries:
                try:
                    hist_response = requests.get(
                        f"{COMFY_API}/api/history/{prompt_id}",
                        timeout=10,
                    )

                    if hist_response.status_code == 200:
                        history = hist_response.json()

                        if prompt_id in history:
                            if "outputs" in history[prompt_id]:
                                # Generation complete
                                print(f"   ✅ Completed!")
                                return True

                except requests.RequestException:
                    pass

                retry_count += 1
                if retry_count % 10 == 0:
                    print(f"   ⏳ Still processing ({retry_count}s)...")

                time.sleep(1)

            print(f"   ⚠️  Timeout waiting for generation")
            return False
        else:
            print(f"   ❌ API Error: {response.status_code}")
            print(f"   {response.text}")
            return False

    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def main():
    print("\n" + "=" * 70)
    print("🎬 PIFF CITY × WISE² INSTAGRAM CAMPAIGN GENERATOR")
    print("=" * 70)
    print(f"📸 Posts to generate: {len(CAMPAIGN_POSTS)}")
    print(f"📁 Output directory: {OUTPUT_DIR.absolute()}")
    print(f"🤖 Model: SDXL 1.0")
    print(f"⏰ Time per image: ~30-45 seconds")
    print(f"⏱️  Total time: ~3-4 minutes")
    print("=" * 70)

    # Check ComfyUI connection
    print("\n🔌 Checking ComfyUI connection...")
    try:
        response = requests.get(f"{COMFY_API}/api", timeout=5)
        if response.status_code == 200:
            print("✅ ComfyUI is running and accessible!")
        else:
            print(f"❌ ComfyUI returned status {response.status_code}")
            print(f"   Make sure ComfyUI is running: bash ~/.comfyui/start-comfyui.sh")
            sys.exit(1)
    except requests.ConnectionError:
        print(f"❌ Cannot connect to ComfyUI at {COMFY_API}")
        print(f"   Make sure ComfyUI is running: bash ~/.comfyui/start-comfyui.sh")
        sys.exit(1)

    # Generate all posts
    print("\n🚀 Starting generation...\n")

    successful = 0
    failed = 0
    start_time = time.time()

    for i, post_data in enumerate(CAMPAIGN_POSTS, 1):
        print(f"\n[{i}/{len(CAMPAIGN_POSTS)}]", end="")

        if generate_post(post_data):
            successful += 1
        else:
            failed += 1

        # Small delay between posts to avoid queue overload
        if i < len(CAMPAIGN_POSTS):
            time.sleep(2)

    elapsed_time = time.time() - start_time

    # Summary
    print("\n" + "=" * 70)
    print("✅ GENERATION COMPLETE")
    print("=" * 70)
    print(f"📊 Results: {successful} successful, {failed} failed")
    print(f"⏱️  Total time: {elapsed_time:.1f} seconds")
    print(f"📁 Output: {OUTPUT_DIR.absolute()}/instagram/")
    print("\n🎯 Next steps:")
    print("1. Download the generated images from the output folder")
    print("2. Import into Figma or your design tool for final touch-ups")
    print("3. Adjust colors to match exact brand specs if needed")
    print("4. Export at 1080×1350 for Instagram feed")
    print("5. Schedule posts using Meta Business Suite")
    print("=" * 70 + "\n")

    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
