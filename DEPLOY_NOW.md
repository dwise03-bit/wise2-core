# 🚀 WISE² Visual Factory - DEPLOY NOW

## One Command on Your VPS

```bash
ssh dwise@173.208.147.165

# Then run this one command:
cd /opt/wise2-core && git pull origin claude/wise2-visual-factory-gpu-trx5zx && sudo bash services/visual-factory/scripts/install-vps.sh
```

**That's it.** The script handles everything:
- ✅ Auto-detects storage
- ✅ Installs dependencies
- ✅ Downloads model
- ✅ Tests GPU with real image
- ✅ Reports success

---

## What You'll See

```
========================================
WISE² Visual Factory - VPS Installation
========================================

[INFO] Step 1: System checks
[INFO] Checking NVIDIA GPU...
[INFO] Step 2: Auto-detecting best storage location...
[INFO] Found storage at /mnt/data with 900G available
[INFO] Installation directory: /mnt/data/wise2-visual-factory
...
[INFO] Step 14: Running end-to-end GPU generation test
[INFO] ComfyUI is ready!
[INFO] Visual Factory API is ready!
[INFO] Generating test image with GPU...
[INFO] Image generation queued
[INFO] ✓ Image generation COMPLETED in 12345ms

✓ Installation Complete & GPU Verified!

Image generation test:
  - Model: FLUX.2 Klein 4B
  - Resolution: 1024×768
  - Steps: 20
  - GPU verified: YES
```

When you see that message with **GPU verified: YES** — deployment is complete.

---

## After Installation (Next 5 Minutes)

### 1. Configure API Key
```bash
# Find where it was installed (check the output above)
# Example: /mnt/data/wise2-visual-factory/.env

nano /path/to/location/.env

# Change: API_KEY=your-secure-api-key-here
```

### 2. Verify Services Running
```bash
systemctl status wise2-visual-factory
systemctl status wise2-comfyui

# Should show: active (running)
```

### 3. Test API
```bash
curl http://localhost:8890/health

# Should show: {"status": "healthy", "gpu": true, ...}
```

### 4. Generate a Real Image
```bash
curl -X POST http://localhost:8890/images/generate \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: test-tenant" \
  -H "x-api-key: test-key" \
  -d '{
    "prompt": "A professional tech interface, clean design, modern",
    "width": 1024,
    "height": 768,
    "steps": 20,
    "guidance": 7.5
  }'

# Get the jobId from response, then check status:
curl http://localhost:8890/jobs/{jobId} \
  -H "x-tenant-id: test-tenant" \
  -H "x-api-key: test-key"
```

---

## Timing

- **Installation script**: 30-60 minutes
  - GPU checks: ~1 minute
  - Model download: 10-30 minutes (depends on internet)
  - Installation: 5-10 minutes
  - GPU test: 1 minute
- **Post-install config**: ~5 minutes
- **Total**: ~1 hour from start to production

---

## Troubleshooting

### Script Fails - GPU Not Detected
```bash
nvidia-smi
# If no output, reinstall drivers:
sudo ubuntu-drivers install
```

### Script Hangs on Model Download
```bash
# Check if disk is full:
df -h

# Check the download:
watch -n 5 'du -sh /mnt/data/wise2-visual-factory/models/checkpoints/'
```

### API Won't Start
```bash
# Check logs:
journalctl -u wise2-visual-factory -f

# Check if port 8890 is in use:
ss -tulpn | grep 8890
```

### Out of Memory During Test
```bash
# Check GPU:
nvidia-smi

# Restart and retry:
sudo systemctl restart wise2-comfyui
# Then rerun the install script
```

---

## Success Checklist

After deployment completes, verify:

- [ ] Script output shows "GPU verified: YES"
- [ ] No errors in final output
- [ ] `systemctl status wise2-visual-factory` shows active
- [ ] `curl http://localhost:8890/health` returns OK
- [ ] Generated images appear in `/path/to/location/media/outputs/`
- [ ] `nvidia-smi` shows GPU was used

---

## Monitoring During Installation

In another terminal, watch the logs:

```bash
ssh dwise@173.208.147.165
tail -f /path/to/install/logs/comfyui-startup.log
tail -f /path/to/install/logs/visual-factory-startup.log

# Or watch GPU:
watch -n 1 nvidia-smi
```

---

## Documentation

After deployment:
- `VISUAL_FACTORY_QUICKSTART.md` - 5-minute reference
- `VISUAL_FACTORY_DEPLOYMENT_GUIDE.md` - Complete manual
- `docs/WISE2_VISUAL_FACTORY.md` - Architecture deep-dive

---

## Ready?

```bash
ssh dwise@173.208.147.165
cd /opt/wise2-core && git pull origin claude/wise2-visual-factory-gpu-trx5zx
sudo bash services/visual-factory/scripts/install-vps.sh
```

**Go!**
