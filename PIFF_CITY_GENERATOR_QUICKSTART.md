# ⚡ PIFF CITY × WISE² Generator — Quick Start
## 5 Minutes to Production Images

---

## 🚀 Run This (Copy & Paste)

```bash
# 1. Setup ComfyUI (one-time, ~5 min)
bash scripts/gpu-image-generator-setup.sh

# 2. Start ComfyUI server
bash ~/.comfyui/start-comfyui.sh

# 3. Generate all 5 posts (new terminal)
python scripts/piff-city-generator.py
```

**Done!** Check `instagram_posts/` for your images.

---

## 📊 What You Get

✅ **5 Instagram posts** (1080×1350 each)  
✅ **Cinematic quality** (SDXL, 4K HDR)  
✅ **Your brand colors** (Purple #9d4edd, Green #39ff14)  
✅ **Neon text rendering** (sharp, legible)  
✅ **Zero cost** (your GPU, free)  
✅ **~3-4 minutes** (full batch generation)  

---

## 📁 Output

```
instagram_posts/
├── instagram_post-1-hero_00001_.png       # Hero
├── instagram_post-2-split_00001_.png      # Split Screen
├── instagram_post-3-workforce_00001_.png  # Workforce
├── instagram_post-4-grid_00001_.png       # Grid
└── instagram_post-5-cta_00001_.png        # CTA
```

Each 1080×1350, ready for Instagram.

---

## 🎯 Next Steps

1. **Download** images to your Mac
2. **Import** into Figma for final polish
3. **Adjust** colors/text if needed
4. **Export** as PNG
5. **Post** to Instagram via Meta Business Suite

---

## 🔧 Troubleshooting

| Issue | Fix |
|-------|-----|
| `Connection refused` | ComfyUI not running: `bash ~/.comfyui/start-comfyui.sh` |
| `CUDA out of memory` | Reduce steps in script: change `"steps": 25` → `20` |
| `Timeout waiting` | GPU busy, try again in 30s or reduce `steps` |
| Text looks bad | Normal for SDXL, touch up in Figma |

---

## ⚙️ Advanced

**Faster (20s/image)**: Change `"steps": 25` → `15` in script  
**Better quality (60s/image)**: Change `"steps": 25` → `35` in script  
**Different model**: Download & swap `ckpt_name` in script  
**Custom prompts**: Edit `CAMPAIGN_POSTS` in script  

---

## 📞 Full Docs

See `GPU_IMAGE_GENERATION_GUIDE.md` for complete setup, prompts, troubleshooting, scheduling, and cost analysis.

---

**You now have unlimited free image generation on your GPU VPS.** 🚀

No more Midjourney subscriptions. No API costs. No rate limits.

Generate whenever you want. Regenerate with tweaks instantly.

This is the power of owning your infrastructure.
