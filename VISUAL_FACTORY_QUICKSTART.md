# WISE² Visual Factory - Quick Start (5 minutes)

## On Your VPS (173.208.147.165)

```bash
# SSH into VPS
ssh dwise@173.208.147.165

# Go to repository
cd /opt/wise2-core

# Verify correct branch
git branch -vv
# Should show: * claude/wise2-visual-factory-gpu-trx5zx

# Run one command - everything else is automatic
sudo bash services/visual-factory/scripts/install-vps.sh
```

**That's it!** The script will:
- ✓ Auto-detect available storage (finds best location with 100GB+ free)
- ✓ Install ComfyUI + FLUX.2 Klein 4B
- ✓ Install Visual Factory service
- ✓ **Test real image generation on GPU**
- ✓ Report success/failure with performance metrics

**Expected runtime**: 30-60 minutes (mostly waiting for 4.6GB model download)

---

## Watch the Script Run

```bash
# During installation, watch logs in another terminal
ssh dwise@173.208.147.165
tail -f /path/to/install/logs/comfyui-startup.log
tail -f /path/to/install/logs/visual-factory-startup.log
```

---

## After Installation (Next Steps)

### 1. Configure API Key
```bash
# Edit configuration
nano /path/to/install/location/.env

# Change this line:
# API_KEY=your-secure-api-key-here
```

### 2. Start Services for Real
```bash
# Enable on boot
sudo systemctl enable wise2-comfyui wise2-visual-factory

# Start services
sudo systemctl start wise2-visual-factory

# Check status
systemctl status wise2-visual-factory
```

### 3. Verify Everything Works
```bash
# Health check
curl http://localhost:8890/health | jq .

# Generate image
curl -X POST http://localhost:8890/images/generate \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: test" \
  -H "x-api-key: test" \
  -d '{"prompt":"A tech interface","width":1024,"height":768}'

# Check job status
curl http://localhost:8890/queue -H "x-tenant-id: test" -H "x-api-key: test" | jq .
```

### 4. Monitor GPU
```bash
# Real-time GPU stats
watch -n 1 nvidia-smi

# Follow logs
journalctl -u wise2-visual-factory -f
```

---

## What Gets Installed

```
/path/to/auto-detected/location/wise2-visual-factory/
├── comfyui/                    # ComfyUI node engine
├── models/
│   ├── checkpoints/            # FLUX.2 Klein 4B (4.6GB)
│   ├── vae/                    # VAE model
│   └── clip/                   # CLIP embeddings
├── venv/                       # Python virtual environment
├── dist/                       # Compiled Visual Factory
├── logs/                       # Service logs
├── media/                      # Generated images
└── .env                        # Configuration
```

---

## Success Indicators

✓ Script finishes without errors  
✓ Output shows: "✓ Installation Complete & GPU Verified!"  
✓ GPU verification test completes  
✓ Image generation test passes  
✓ `systemctl status wise2-visual-factory` shows "active (running)"  
✓ `curl http://localhost:8890/health` returns healthy status  

---

## If Something Goes Wrong

### GPU Not Detected
```bash
nvidia-smi  # Check driver
python3 -c "import torch; print(torch.cuda.is_available())"  # Check CUDA
```

### Script Fails
```bash
# Check what went wrong
tail -50 /path/to/install/logs/*  # View logs
cat services/visual-factory/scripts/install-vps.sh  # Review script
```

### Disk Full
```bash
df -h  # Check all mounts
# The script auto-detects best location; if it still fails, manually free up 100GB
```

---

## Commands Cheat Sheet

```bash
# Service control
sudo systemctl start wise2-visual-factory
sudo systemctl stop wise2-visual-factory
sudo systemctl restart wise2-visual-factory
sudo systemctl status wise2-visual-factory

# Logs
journalctl -u wise2-visual-factory -f
journalctl -u wise2-comfyui -f

# API calls
curl http://localhost:8890/health
curl http://localhost:8890/queue -H "x-tenant-id: test" -H "x-api-key: test"
curl http://localhost:8188/system_stats  # ComfyUI stats

# GPU
nvidia-smi
watch -n 1 nvidia-smi

# Diagnostics
npm run comfy:doctor
npm run comfy:gpu
npm run comfy:models
```

---

## Next: MCP Integration for Claude Code

Once services are running:

```bash
mkdir -p /opt/wise2-core/.claude
cat > /opt/wise2-core/.claude/mcp.json <<'EOF'
{
  "mcpServers": {
    "wise2-visual-factory": {
      "command": "node",
      "args": ["/path/to/install/location/dist/mcp/server.js"],
      "env": {
        "COMFYUI_URL": "http://127.0.0.1:8188",
        "API_KEY": "your-api-key"
      }
    }
  }
}
EOF
```

---

**Total time**: ~45 minutes (auto-detection + download + GPU test)

**Next**: See `VISUAL_FACTORY_DEPLOYMENT_GUIDE.md` for detailed reference
