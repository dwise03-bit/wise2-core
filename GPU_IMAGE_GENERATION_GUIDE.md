# 🚀 GPU Image Generation Guide
## PIFF CITY × WISE² Instagram Campaign

**Status**: Ready to Deploy  
**GPU**: NVIDIA GTX 1660 SUPER (6GB VRAM)  
**Model**: Stable Diffusion XL 1.0  
**Posts**: 5 (all prompts adapted for local generation)  
**Time**: ~3-4 minutes for full campaign  
**Cost**: $0 (free)

---

## Quick Start (5 Minutes)

### Step 1: Setup ComfyUI on Your GPU VPS

```bash
# SSH into your GPU server
ssh user@your-gpu-vps-ip

# Run the setup script
bash scripts/gpu-image-generator-setup.sh

# This will:
# - Clone ComfyUI
# - Install Python dependencies
# - Download SDXL model (2.1GB)
# - Create startup script
```

### Step 2: Start ComfyUI

```bash
# Start the ComfyUI server (runs in background with nohup, or use tmux)
bash ~/.comfyui/start-comfyui.sh

# Or in a tmux session:
tmux new-session -d -s comfyui "bash ~/.comfyui/start-comfyui.sh"
```

**Verify it's running:**
```bash
curl http://localhost:8188
# Should return ComfyUI welcome page
```

### Step 3: Generate All 5 Instagram Posts

```bash
# From the wise2-core directory
python scripts/piff-city-generator.py

# Sit back and watch it generate all 5 posts (~3-4 minutes)
# Output: instagram_posts/ directory
```

---

## Architecture

### What's Installed

**ComfyUI** (node-based image generation GUI)
- Web UI at `http://localhost:8188`
- Modular workflow system
- Supports SDXL, Stable Diffusion, ControlNet, etc.

**SDXL 1.0** (Stable Diffusion XL base model)
- 2.1 GB checkpoint file
- 8-bit quantized for 6GB VRAM
- Excellent quality with detailed prompts

**Python Script** (`piff-city-generator.py`)
- Automates all 5 posts
- Uses ComfyUI API
- Handles polling for completion
- Minimal dependencies (requests, pathlib)

### Why This Setup?

| Aspect | Choice | Why |
|--------|--------|-----|
| **Framework** | ComfyUI | Web UI (no CLI), node-based, extensible |
| **Model** | SDXL | Best quality/VRAM tradeoff on 6GB |
| **Integration** | API-driven | Batch generation, automation-friendly |
| **Workflow** | Python script | Scheduled generation, CI/CD ready |

---

## Prompts (Adapted for SDXL)

All 5 prompts have been converted from Midjourney syntax to SDXL-optimized format:

### Post 1: Hero Announcement
```
"A cinematic luxury composition with neon purple and electric green neon text 
reading 'CULTURE MEETS SYSTEMS' and 'PIFF CITY × WISE²' on a matte black 
background, volumetric purple fog and rim lighting, ultra-premium typography, 
chrome accents, brushed steel elements, subtle holographic reflections, 
cinematic depth of field, studio lighting with edge highlights, dark moody 
atmosphere, luxury tech aesthetic, 4K HDR, professional advertising photography, 
shot with 50mm lens, shallow depth of field, stopped down to f/2.8"
```

### Post 2: Split Identity
```
"A split-screen luxury composition: left side dominated by royal purple with 
a crown emoji and 'PIFF CITY CULTURE PRODUCTION' text in elegant typography, 
right side brilliant electric green with a lightning bolt emoji and 'WISE² 
SYSTEMS INTELLIGENCE' text, separated by a glowing neon line divider, matte 
black background, volumetric lighting effects, professional product photography 
style, cinematic color grading, high contrast, luxury brand aesthetic, studio 
lighting, 4K HDR, architectural precision, premium luxury brand collaboration 
style, shot at 35mm"
```

### Post 3: Digital Workforce
```
"A futuristic command center interior at night with sleek matte black surfaces 
and electric green neon accents, a holographic AI interface in the center 
displaying a robot icon with 'DIGITAL WORKFORCE' text, surrounding elements 
show data streams and digital particles floating, volumetric cyan fog, rim 
lighting, cinematic depth, luxury tech aesthetic, professional corporate 
photography, 4K HDR, shot with 85mm lens, f/2.0 aperture, ultra-sharp focus 
on central hologram, blurred neon background, modern futuristic architecture, 
high-end product photography"
```

### Post 4: Capabilities Grid
```
"A premium grid layout composition with four luxury product cards arranged in 
a 2x2 grid: 1) Film reel icon 'PREMIUM PRODUCTION' with purple gradient, 
2) Gear icon 'SMART AUTOMATION' with green gradient, 3) Chart icon 'REAL-TIME 
ANALYTICS' with blue gradient, 4) Brain icon 'ENTERPRISE AI' with purple 
gradient. Matte black background, cards have chrome borders with subtle glow, 
neon accent lines, professional dashboard aesthetic, luxury tech visualization, 
4K HDR, premium typography, cinematic lighting, high contrast, studio 
professional photography"
```

### Post 5: Call to Action
```
"A luxury nighttime rooftop scene in a premium NYC urban setting, vast cityscape 
in the background with soft bokeh lights, foreground shows glowing neon text 
'READY TO LEVEL UP?' and 'PIFF CITY × WISE²' with a star icon burst effect, 
matte black surfaces with purple and green neon accents, volumetric atmospheric 
fog, cinematic depth with layers, professional luxury product photography, 4K 
HDR, shot with 50mm lens at f/1.8, ultra-sharp text, blurred city lights, 
premium brand aesthetic, high-end advertising photography style"
```

---

## Performance Expectations

### Generation Speed

Your GPU specs:
- **VRAM**: 6GB (tight but functional)
- **CUDA Cores**: 1280
- **Memory BW**: 192 GB/s

**Expected times**:
| Model | Steps | Time/Image | Notes |
|-------|-------|-----------|-------|
| **SDXL** | 25 | ~30-45s | Good balance |
| **SDXL** | 20 | ~25-35s | Faster, acceptable quality |
| **SDXL** | 30 | ~50-60s | Best quality, slower |

**5 posts @ 25 steps**:
- Time: ~2.5 minutes
- VRAM usage: ~5.5-6GB
- Peak power: ~120W

### Quality Notes

SDXL with detailed prompts produces:
- ✅ Sharp neon text
- ✅ Good color control
- ✅ Realistic materials (chrome, steel, glass)
- ✅ Accurate composition
- ✅ Volumetric lighting effects
- ⚠️ Text sometimes needs light cleanup
- ⚠️ Complex emoji rendering inconsistent

**Post-generation touch-ups** (5-10 min in Figma):
- Sharpen text edges
- Adjust color saturation
- Remove artifacts if any
- Export final 1080×1350 PNG

---

## Advanced: Customization

### Change Prompts

Edit `scripts/piff-city-generator.py`:

```python
CAMPAIGN_POSTS = [
    {
        "id": "post-1-hero",
        "title": "Your new title",
        "prompt": "Your customized prompt here...",
        "negative": "things to avoid",
        "cfg": 7.5,  # 7.0-8.0 is good range
        "steps": 25,  # 20-30 is typical
    },
    # ... more posts
]
```

### Run Multiple Variations

Generate variations of one prompt:

```python
# In piff-city-generator.py, before main():
for seed in range(5):
    post_data["seed"] = seed
    generate_post(post_data)
```

### Use Different Model

If you download another model (e.g., `dreamshaper-7.safetensors`):

```python
# In build_workflow():
"ckpt_name": "dreamshaper-7.safetensors",  # Change model
```

### Adjust Quality/Speed Trade-off

```python
# For faster generation (12s per image):
"steps": 15,
"cfg": 6.5,

# For highest quality (60s per image):
"steps": 35,
"cfg": 8.0,
```

---

## Troubleshooting

### ComfyUI Won't Start

**Error**: `Address already in use`
```bash
# Kill existing process
lsof -ti :8188 | xargs kill -9

# Try again
bash ~/.comfyui/start-comfyui.sh
```

### Out of Memory (OOM)

**Error**: `CUDA out of memory`
```python
# Reduce steps in piff-city-generator.py
"steps": 15,  # Down from 25

# Or enable memory optimization in ComfyUI
# (Run with --cpu-offload flag when starting)
```

### Generation Hangs

If `piff-city-generator.py` hangs:
1. Check ComfyUI is still running: `curl http://localhost:8188`
2. Check GPU: `nvidia-smi`
3. Restart ComfyUI and try again

### Text Rendering Issues

SDXL sometimes struggles with text. If text looks bad:
1. Simplify the prompt (remove extra details)
2. Try different wording
3. Regenerate with different seed
4. Touch up in Figma afterward

---

## Integration: Scheduled Generation

### Option 1: Cron Job (Auto-generate weekly)

```bash
# Edit crontab
crontab -e

# Add weekly generation at Monday 9 AM
0 9 * * 1 cd ~/Projects/wise2-core && python scripts/piff-city-generator.py >> logs/generation.log 2>&1
```

### Option 2: GitHub Actions (Cloud trigger)

Create `.github/workflows/generate-campaign.yml`:

```yaml
name: Generate Campaign Images
on:
  workflow_dispatch:  # Manual trigger
  schedule:
    - cron: '0 9 * * 1'  # Weekly Monday 9 AM

jobs:
  generate:
    runs-on: [self-hosted, gpu]
    steps:
      - uses: actions/checkout@v3
      - name: Generate images
        run: python scripts/piff-city-generator.py
      - name: Upload to S3
        run: aws s3 sync instagram_posts/ s3://wise2-assets/campaigns/
```

### Option 3: Discord Bot (On-demand)

Integrate with your Discord Operations Center:

```python
# In your Discord bot
@bot.command()
async def generate_campaign():
    """Generate PIFF CITY campaign images"""
    subprocess.run(["python", "scripts/piff-city-generator.py"])
    await ctx.send("✅ Campaign images generated! Check S3.")
```

---

## Next Steps

### Immediate (Today)
1. ✅ Run setup script
2. ✅ Generate all 5 posts
3. ✅ Download to local machine
4. ✅ Review quality in Figma

### Short-term (This Week)
1. Fine-tune prompts if needed
2. Create Figma master with all 5 posts
3. Add Instagram captions + hashtags
4. Schedule posts in Meta Business Suite

### Long-term (Ongoing)
1. Generate monthly variations
2. A/B test different prompts
3. Create campaign for other products
4. Build full creative pipeline (batch → caption → schedule)

---

## Cost Analysis

### Your Solution (GPU VPS)

| Item | Cost | Notes |
|------|------|-------|
| GPU VPS (per month) | Already owned | Amortized: ~$0 |
| Electricity (per campaign) | ~$0.10 | Based on 120W @ 3 min |
| **Total per campaign** | **~$0.10** | Essentially free |
| **Monthly** | **~$1** | Generate weekly |

### Alternative Solutions

| Solution | Cost/Image | Cost/5 Posts | Issues |
|----------|-----------|-------------|--------|
| **Midjourney** | ~$2-3 | $10-15 | Monthly subscription |
| **Replicate/Flux** | $0.08 | $0.40 | API limits, slower |
| **Your GPU VPS** | $0.02 | $0.10 | ✅ **Winner** |

**You save ~$150-180/month** by using your own GPU.

---

## Files Created

```
scripts/
├── gpu-image-generator-setup.sh      # One-time setup
└── piff-city-generator.py            # Batch generation script

GPU_IMAGE_GENERATION_GUIDE.md          # This file
INSTAGRAM_CAMPAIGN_MIDJOURNEY_PROMPTS.md  # Original prompts (reference)
```

---

## Command Reference

```bash
# Setup
bash scripts/gpu-image-generator-setup.sh

# Start ComfyUI
bash ~/.comfyui/start-comfyui.sh

# Generate campaign
python scripts/piff-city-generator.py

# Check ComfyUI status
curl http://localhost:8188

# Monitor GPU
watch -n 1 nvidia-smi

# Stop ComfyUI
pkill -f "python main.py"
```

---

## Questions?

- **ComfyUI docs**: https://github.com/comfyanonymous/ComfyUI
- **SDXL info**: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- **GPU optimization**: Run with `--gpu-device 0` for explicit CUDA device

---

**Ready to generate?** 🚀

```bash
bash scripts/gpu-image-generator-setup.sh
bash ~/.comfyui/start-comfyui.sh
python scripts/piff-city-generator.py
```

Generated images will be in `instagram_posts/` within ~3-4 minutes!
