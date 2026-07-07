#!/usr/bin/env python3
"""
Wise² Launch Campaign - Veo API Batch Generator
Generates all 5 clips for Instagram Reel + TikTok via Veo API
"""

import requests
import json
import time
from pathlib import Path
import sys
import os

# CONFIG
VEO_API_ENDPOINT = "https://api.veo.vimeo.com/generate"
VEO_API_KEY = os.getenv("VEO_API_KEY")
BATCH_FILE = "wise2_veo_batch.json"
OUTPUT_DIR = "wise2_videos"

def main():
    # Validate API key
    if not VEO_API_KEY:
        print("❌ ERROR: VEO_API_KEY environment variable not set")
        print("Set it with: export VEO_API_KEY='your_key_here'")
        sys.exit(1)

    # Create output directory
    Path(OUTPUT_DIR).mkdir(exist_ok=True)

    # Load batch config
    try:
        with open(BATCH_FILE, 'r') as f:
            batch_config = json.load(f)
    except FileNotFoundError:
        print(f"❌ ERROR: {BATCH_FILE} not found")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"❌ ERROR: {BATCH_FILE} is not valid JSON")
        sys.exit(1)

    print(f"🎬 Wise² Launch Campaign - Veo Batch Generator")
    print(f"{'='*60}")
    print(f"Batch: {batch_config['generation_batch']}")
    print(f"Total clips: {len(batch_config['clips'])}")
    print(f"Output directory: {OUTPUT_DIR}/")
    print(f"{'='*60}\n")

    # Track results
    results = []

    # Generate each clip
    for idx, clip in enumerate(batch_config['clips'], 1):
        clip_id = clip['clip_id']
        prompt = clip['prompt']
        duration = clip['duration']
        resolution = clip['resolution']
        voiceover = clip.get('voiceover', '')

        print(f"[{idx}/{len(batch_config['clips'])}] 🎬 {clip_id}")
        print(f"    Duration: {duration}s | Resolution: {resolution}")
        print(f"    VO: {voiceover[:50]}...")

        # Prepare API payload
        payload = {
            "prompt": prompt,
            "duration": duration,
            "resolution": resolution,
            "cfg_scale": clip.get('cfg_scale', 7.5),
            "output_format": clip.get('output_format', 'mp4')
        }

        headers = {
            "Authorization": f"Bearer {VEO_API_KEY}",
            "Content-Type": "application/json"
        }

        try:
            # Send request
            print("    ⏳ Submitting to Veo API...")
            response = requests.post(VEO_API_ENDPOINT, json=payload, headers=headers, timeout=120)

            if response.status_code == 200:
                result = response.json()
                video_url = result.get('video_url')
                job_id = result.get('job_id')

                print(f"    ✅ Generation started")
                print(f"    Job ID: {job_id}")
                if video_url:
                    print(f"    Video URL: {video_url}")

                # Save metadata
                metadata = {
                    "clip_id": clip_id,
                    "clip_order": clip.get('clip_order'),
                    "job_id": job_id,
                    "video_url": video_url,
                    "prompt": prompt[:100] + "...",
                    "duration": duration,
                    "resolution": resolution,
                    "status": "generating",
                    "submitted_at": time.strftime("%Y-%m-%d %H:%M:%S")
                }

                with open(f"{OUTPUT_DIR}/{clip_id}_metadata.json", 'w') as f:
                    json.dump(metadata, f, indent=2)

                results.append({
                    "clip_id": clip_id,
                    "status": "success",
                    "job_id": job_id,
                    "video_url": video_url
                })

            elif response.status_code == 401:
                print(f"    ❌ Authentication failed (invalid API key)")
                results.append({
                    "clip_id": clip_id,
                    "status": "error",
                    "error": "Invalid API key"
                })
            elif response.status_code == 429:
                print(f"    ⚠️  Rate limit exceeded - waiting 10s...")
                time.sleep(10)
                results.append({
                    "clip_id": clip_id,
                    "status": "rate_limited"
                })
            else:
                print(f"    ❌ Error: HTTP {response.status_code}")
                try:
                    error_detail = response.json().get('error', response.text)
                    print(f"    Details: {error_detail}")
                except:
                    print(f"    Details: {response.text[:200]}")
                results.append({
                    "clip_id": clip_id,
                    "status": "error",
                    "error": f"HTTP {response.status_code}"
                })

        except requests.exceptions.Timeout:
            print(f"    ❌ Request timeout")
            results.append({
                "clip_id": clip_id,
                "status": "error",
                "error": "Request timeout"
            })
        except Exception as e:
            print(f"    ❌ Exception: {str(e)}")
            results.append({
                "clip_id": clip_id,
                "status": "error",
                "error": str(e)
            })

        # Rate limiting between requests
        if idx < len(batch_config['clips']):
            print(f"    ⏳ Waiting 3s before next clip...\n")
            time.sleep(3)
        else:
            print()

    # Summary
    print(f"{'='*60}")
    print(f"✅ BATCH SUBMISSION COMPLETE")
    print(f"{'='*60}")

    successful = [r for r in results if r['status'] == 'success']
    failed = [r for r in results if r['status'] == 'error']

    print(f"\n📊 RESULTS:")
    print(f"   ✅ Successful: {len(successful)}/{len(results)}")
    print(f"   ❌ Failed: {len(failed)}/{len(results)}")

    if successful:
        print(f"\n📋 Job IDs (track at Veo dashboard):")
        for r in successful:
            print(f"   • {r['clip_id']}: {r['job_id']}")

    if failed:
        print(f"\n⚠️  Failed clips:")
        for r in failed:
            print(f"   • {r['clip_id']}: {r.get('error', 'Unknown error')}")

    print(f"\n📁 Metadata saved to: {OUTPUT_DIR}/")
    print(f"   Monitor Veo dashboard for generation status")
    print(f"   Download videos when complete")

    print(f"\n{'='*60}")
    print(f"🎬 Next steps:")
    print(f"   1. Wait for Veo to generate clips (15-30 min)")
    print(f"   2. Download videos from URLs in metadata files")
    print(f"   3. Cut together: Instagram clip1 → clip2 → clip3")
    print(f"   4. Cut together: TikTok clip1 → clip2")
    print(f"   5. Sync voiceover + orchestral soundtrack")
    print(f"   6. Color grade for consistency (blue tones)")
    print(f"   7. Export and post to platforms")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    main()
