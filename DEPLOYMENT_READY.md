# ✅ WISE² Visual Factory - READY FOR DEPLOYMENT

**Date**: 2026-08-20  
**Status**: PRODUCTION READY  
**Branch**: `claude/wise2-visual-factory-gpu-trx5zx`  
**Target**: 173.208.147.165 (gpu-nmls)

---

## ONE COMMAND TO DEPLOY

```bash
ssh dwise@173.208.147.165
cd /opt/wise2-core
sudo bash services/visual-factory/scripts/install-vps.sh
```

**That's it.** Everything else is automated.

---

## What You'll Get

✅ **ComfyUI** - Installed and configured  
✅ **FLUX.2 Klein 4B** - Downloaded (4.6GB model)  
✅ **Visual Factory API** - Running on port 8890  
✅ **Systemd Services** - Auto-restart on failure  
✅ **GPU Test** - Real image generation to verify GPU works  
✅ **Brand Profiles** - Multi-tenant support  
✅ **MCP Integration** - Claude Code ready  

---

## Installation Steps Built-In

The script automatically:
1. Detects available storage (auto-finds location with 100GB+ free)
2. Validates NVIDIA GPU is present
3. Installs Python dependencies
4. Clones ComfyUI
5. Downloads FLUX.2 Klein 4B model
6. Installs Visual Factory
7. Creates systemd services
8. **Generates real test image on GPU** ← This proves it works
9. Reports success/failure with metrics

**Runtime**: 30-60 minutes

---

## Success Indicator

When you see this in the output, you're done:

```
✓ Installation Complete & GPU Verified!

Image generation test:
  - Model: FLUX.2 Klein 4B
  - Resolution: 1024×768
  - Steps: 20
  - GPU verified: YES
```

---

## After Installation

```bash
# 1. Configure
nano /path/to/install/location/.env

# 2. Start services permanently
sudo systemctl enable wise2-comfyui wise2-visual-factory
sudo systemctl start wise2-visual-factory

# 3. Test
curl http://localhost:8890/health
```

---

## Documentation

- **Quick Start** (5 min): `VISUAL_FACTORY_QUICKSTART.md`
- **Full Guide** (reference): `VISUAL_FACTORY_DEPLOYMENT_GUIDE.md`
- **Architecture** (deep dive): `docs/WISE2_VISUAL_FACTORY.md`

---

## What's New This Session

- ✅ Smart storage auto-detection (handles full primary disks)
- ✅ Auto-install rsync if missing
- ✅ End-to-end GPU test during installation
- ✅ Real image generation verification
- ✅ Comprehensive deployment guides
- ✅ Quick start guide

---

## Ready? Let's Go

```bash
ssh dwise@173.208.147.165
cd /opt/wise2-core && git pull
sudo bash services/visual-factory/scripts/install-vps.sh
```

Monitor the output. When you see the GPU verification success message, you're done.

---

**Status**: 🟢 GO FOR LAUNCH
