# Wise² Launch Campaign — Veo API Generation

## Quick Start

### 1. Prerequisites
```bash
pip install requests
```

### 2. Set Your Veo API Key
```bash
export VEO_API_KEY="AQ.Ab8RN6Jt56cy2-luie8VrjsTBSdG3rtAI5UjVRRHcpKjTF4H3g"
```

### 3. Run the Generator
```bash
python wise2_veo_generate.py
```

---

## What This Does

**Batch generates 5 video clips via Veo API:**

| Clip | Format | Duration | Platform |
|------|--------|----------|----------|
| Clip 1 | 1080x1920 | 20s | Instagram (Problem) |
| Clip 2 | 1080x1920 | 20s | Instagram (Reveal) |
| Clip 3 | 1080x1920 | 20s | Instagram (Transform) |
| Clip 4 | 1080x1920 | 15s | TikTok (Accelerated) |
| Clip 5 | 1080x1920 | 15s | TikTok (CTA) |

**Output:** 
- Metadata files with job IDs + video URLs
- Generation status tracking
- Ready for download and post-production

---

## Files

### `wise2_veo_batch.json`
Complete batch configuration with all 5 clip prompts, continuity blocks, and Veo parameters.

### `wise2_veo_generate.py`
Python script that:
- Loads the batch config
- Submits each clip to Veo API
- Tracks job IDs and URLs
- Saves metadata for each clip
- Handles errors and rate limiting

---

## Step-by-Step

### Step 1: Set Environment Variable
```bash
# Replace with your actual Veo API key
export VEO_API_KEY="your_key_here"

# Verify it's set
echo $VEO_API_KEY
```

### Step 2: Run the Script
```bash
python wise2_veo_generate.py
```

Expected output:
```
🎬 Wise² Launch Campaign - Veo Batch Generator
============================================================
Batch: wise2_launch_campaign
Total clips: 5
Output directory: wise2_videos/
============================================================

[1/5] 🎬 instagram_clip1_problem
    Duration: 20s | Resolution: 1080x1920
    VO: What if there was ONE system...
    ⏳ Submitting to Veo API...
    ✅ Generation started
    Job ID: job_abc123xyz
    Video URL: https://...

[2/5] 🎬 instagram_clip2_reveal
    ...
```

### Step 3: Monitor Generation
- Check the `wise2_videos/` directory for metadata files
- Each file contains job ID, video URL, and status
- Log into Veo dashboard to track progress
- Clips typically generate in 15-30 minutes

### Step 4: Download Videos
- When Veo notifies you (email), download each clip
- Or visit the video URL from metadata files
- Save as: `wise2_instagram_clip1.mp4`, etc.

### Step 5: Post-Production
```
Instagram (60s total):
  1. wise2_instagram_clip1.mp4 (0-20s)
  2. wise2_instagram_clip2.mp4 (20-40s)
  3. wise2_instagram_clip3.mp4 (40-60s)
  
TikTok (30s total):
  1. wise2_tiktok_clip1.mp4 (0-15s)
  2. wise2_tiktok_clip2.mp4 (15-30s)
```

**Editing workflow:**
1. Concatenate clips in order (no gaps)
2. Sync voiceover (provided in script)
3. Add orchestral soundtrack
4. Color grade (cool blues, slight desaturation)
5. Export vertical 1080x1920
6. Post to platforms

---

## Troubleshooting

### "VEO_API_KEY environment variable not set"
```bash
export VEO_API_KEY="your_key"
python wise2_veo_generate.py
```

### "Authentication failed (invalid API key)"
Check that your API key is correct:
- No extra spaces
- Full key copied
- Valid for Veo account

### Rate Limit Exceeded
The script automatically waits 10s and retries. This is normal if generating multiple clips quickly.

### Timeout
Veo is taking longer than expected. Try running again:
```bash
python wise2_veo_generate.py
```

### Clip Generation Fails
Check Veo dashboard for specific error. Common issues:
- Invalid prompt syntax
- Unsupported resolution
- Rate limit
- API quota exceeded

---

## Expected Timeline

| Step | Duration |
|------|----------|
| Submission (script runs) | 1-2 min |
| Veo processing | 15-30 min per clip |
| Download | 5-10 min |
| Post-production | 30-60 min |
| **Total** | **1-2 hours** |

---

## File Structure

```
wise2-core/
├── wise2_veo_batch.json          (Clip prompts + config)
├── wise2_veo_generate.py         (Generator script)
├── VEO_GENERATION_README.md      (This file)
└── wise2_videos/                 (Generated metadata)
    ├── instagram_clip1_problem_metadata.json
    ├── instagram_clip2_reveal_metadata.json
    ├── instagram_clip3_transform_metadata.json
    ├── tiktok_clip1_accelerated_metadata.json
    └── tiktok_clip2_cta_metadata.json
```

---

## Success Checklist

- [ ] API key set: `echo $VEO_API_KEY`
- [ ] Python requests installed: `pip install requests`
- [ ] Script runs: `python wise2_veo_generate.py`
- [ ] 5 metadata files created in `wise2_videos/`
- [ ] Job IDs visible in output
- [ ] Veo dashboard shows 5 generating videos
- [ ] Videos complete (Veo sends email)
- [ ] Download all 5 videos
- [ ] Edit into Instagram + TikTok versions
- [ ] Upload to platforms

---

## Next: Post-Production

Once you have the 5 clips, use your preferred editor:
- **CapCut** (fast, mobile-friendly)
- **Adobe Premiere** (professional)
- **DaVinci Resolve** (free, color-grading focused)

**Key steps:**
1. Import 3 Instagram clips in order
2. Sync voiceover (starts at clip1 0s)
3. Add orchestral soundtrack (bed throughout)
4. Trim/adjust timing as needed
5. Color grade (cool blues, -15% saturation)
6. Export as 1080x1920 vertical MP4
7. Repeat for TikTok with 2 clips

---

**Ready? Run the script and watch Veo create your launch campaign!** 🎬
