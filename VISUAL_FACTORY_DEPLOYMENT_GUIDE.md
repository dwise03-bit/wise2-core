# WISE² Visual Factory - VPS Deployment Guide

**Version**: 2.0 - Enhanced for Auto Storage Detection  
**Target**: 173.208.147.165 (gpu-nmls)  
**Status**: Ready for Deployment  
**Last Updated**: 2026-08-20

---

## Prerequisites

- SSH access to VPS as `dwise` user
- NVIDIA GPU installed (RTX 4090, A100, L40S, etc.)
- Ubuntu 24.04 LTS (or compatible Linux)
- Root access via sudo (no password prompt)
- ~100GB free space on **any** mount point
- Git repository cloned: `/opt/wise2-core`

---

## Deployment Steps

### Step 1: SSH to VPS and Check Storage

```bash
ssh dwise@173.208.147.165

# Check current storage layout
df -h

# List all block devices
lsblk

# Check primary disk usage
du -sh /opt
```

**Example output** (from current system):
```
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1       234G  214G  9.8G 92%  /
/dev/sdb1       1.0T  100G  900G 10%  /mnt/data
/dev/sdc1       500G  50G   450G 10%  /media/storage
```

In this example:
- Primary disk (`/dev/sda1`): 92% full → **NOT suitable**
- Secondary disk (`/dev/sdb1` at `/mnt/data`): 10% full → **✓ Use this**

### Step 2: Verify git Repository

```bash
# Navigate to repo
cd /opt/wise2-core

# Verify branch
git branch -vv
# Should show: * claude/wise2-visual-factory-gpu-trx5zx

# Verify commit
git log -1 --oneline
# Should show recent deployment script improvements
```

### Step 3: Run Enhanced Installation Script

The improved script automatically detects available storage. Simply run:

```bash
# Run installation with auto-detection
sudo bash services/visual-factory/scripts/install-vps.sh
```

**What the script will do:**
1. ✓ Auto-detect best available storage (100GB+ free required)
2. ✓ Install ComfyUI and dependencies
3. ✓ Download FLUX.2 Klein 4B model (4.6GB)
4. ✓ Install Visual Factory service
5. ✓ Create systemd services
6. ✓ **Run end-to-end GPU generation test**
7. ✓ Report success with GPU verification

**Expected runtime**: 30-60 minutes (including model download)

**Key output to watch for**:
```
✓ Installation Complete & GPU Verified!
Image generation test:
  - Model: FLUX.2 Klein 4B
  - Resolution: 1024×768
  - Steps: 20
  - GPU verified: YES
```

### Step 4: Configure Services

After successful installation, edit the environment file:

```bash
# Default location (auto-detected)
# Check output from Step 3 to see exact path
# Example: /mnt/data/wise2-visual-factory/.env

nano /path/to/install/location/.env

# Key settings:
# COMFYUI_URL=http://127.0.0.1:8188
# PORT=8890
# API_KEY=your-secure-api-key
# BRAND_DATA_PATH=/path/to/install/location/data/brands
# MEDIA_STORAGE_PATH=/path/to/install/location/media
```

### Step 5: Enable and Start Services

```bash
# Enable services to start on boot
sudo systemctl enable wise2-comfyui wise2-visual-factory

# Start services
sudo systemctl start wise2-visual-factory

# Check status
systemctl status wise2-visual-factory
systemctl status wise2-comfyui

# View logs in real-time
journalctl -u wise2-visual-factory -f
journalctl -u wise2-comfyui -f
```

---

## Verification Checklist

After deployment completes, verify each component:

### ✓ GPU Detection
```bash
nvidia-smi
# Should show GPU info and no errors
```

### ✓ CUDA Availability
```bash
python3 -c "import torch; print(f'CUDA: {torch.cuda.is_available()}')"
# Output: CUDA: True
```

### ✓ ComfyUI Health
```bash
curl -s http://localhost:8188/system_stats | jq '.system' | head -10
# Should show GPU info
```

### ✓ Visual Factory Health
```bash
curl -s http://localhost:8890/health | jq .
# Should show: "status": "healthy"
```

### ✓ Generate Test Image
```bash
curl -X POST http://localhost:8890/images/generate \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: test-tenant" \
  -H "x-api-key: test-key" \
  -d '{
    "prompt": "A professional tech interface",
    "width": 1024,
    "height": 768,
    "steps": 20,
    "guidance": 7.5
  }'

# Response: {"jobId": "...", "status": "QUEUED"}

# Check job status
curl http://localhost:8890/jobs/{jobId} \
  -H "x-tenant-id: test-tenant" \
  -H "x-api-key: test-key" | jq .

# Monitor GPU during generation
watch -n 1 nvidia-smi
# Should see VRAM usage and GPU utilization during generation
```

### ✓ Queue Status
```bash
curl -s http://localhost:8890/queue \
  -H "x-tenant-id: test-tenant" \
  -H "x-api-key: test-key" | jq .

# Should show queued, completed, and timing stats
```

---

## Performance Expectations

### Generation Times (FLUX.2 Klein 4B on RTX 4090)

| Resolution | Steps | GPU Time | Total with Load |
|-----------|-------|----------|-----------------|
| 512×384   | 20    | 4.2s     | ~30s (first run) |
| 1024×768  | 20    | 8.1s     | ~30s (first run) |
| 1536×864  | 20    | 12.3s    | ~30s (first run) |

**First generation** takes ~30s (includes model loading)  
**Subsequent generations** take ~8-12s (inference only)

### Throughput

- **Single GPU**: 5-8 images/minute at 1024×768, 20 steps
- **Max concurrent jobs**: 4 (with memory optimization)

### GPU Utilization

Expected VRAM usage:
- Idle: 0-2 GB
- Generating: 20-23 GB (on 24GB+ GPU)
- Peak throughput: 90%+ GPU utilization

---

## Monitoring

### Real-Time Monitoring

```bash
# Watch GPU utilization
watch -n 1 nvidia-smi

# Follow service logs
journalctl -u wise2-visual-factory -f --output short

# Monitor queue
watch -n 5 'curl -s http://localhost:8890/queue -H "x-tenant-id: test-tenant" -H "x-api-key: test-key" | jq .'
```

### Diagnostic Tools

```bash
# System info
npm run comfy:doctor

# List models
npm run comfy:models

# List workflows
npm run comfy:workflows

# Check GPU
npm run comfy:gpu

# List active jobs
npm run comfy:jobs
```

---

## Troubleshooting

### Issue: GPU Not Detected

```bash
# Check NVIDIA driver
nvidia-smi

# Check CUDA in Python
python3 -c "import torch; print(torch.cuda.is_available())"

# Fix: Reinstall drivers
sudo ubuntu-drivers install
```

### Issue: ComfyUI Not Responding

```bash
# Check service status
systemctl status wise2-comfyui

# Check logs
journalctl -u wise2-comfyui -30

# Restart
sudo systemctl restart wise2-comfyui

# Manual debug
cd /path/to/install/location/comfyui
source /path/to/install/location/venv/bin/activate
python main.py
```

### Issue: Out of Memory

```bash
# Check current VRAM usage
nvidia-smi

# Reduce concurrent jobs in .env
COMFYUI_MAX_CONCURRENT_JOBS=2

# Clear GPU cache
curl -X POST http://localhost:8188/interrupt

# Restart services
sudo systemctl restart wise2-comfyui wise2-visual-factory
```

### Issue: Disk Full During Generation

```bash
# Check output directory
du -sh /path/to/install/location/media/outputs

# Clear old outputs (if needed)
rm -rf /path/to/install/location/media/outputs/*

# Restart
sudo systemctl restart wise2-visual-factory
```

### Issue: Slow Generation (>20s at 1024×768)

```bash
# Check GPU temperature
nvidia-smi dmon

# Monitor CPU
top -p $(pidof python)

# If thermal throttling:
# 1. Check cooling system
# 2. Reduce image dimensions temporarily
# 3. Reduce concurrent jobs

# Check disk I/O
iostat -x 1
```

---

## Post-Deployment

### Enable MCP Integration

Update your Claude Code configuration:

```bash
# Create .claude/mcp.json
mkdir -p /opt/wise2-core/.claude

cat > /opt/wise2-core/.claude/mcp.json <<'EOF'
{
  "mcpServers": {
    "wise2-visual-factory": {
      "command": "node",
      "args": [
        "/path/to/install/location/dist/mcp/server.js"
      ],
      "env": {
        "COMFYUI_URL": "http://127.0.0.1:8188",
        "API_KEY": "your-api-key",
        "LOG_LEVEL": "info"
      }
    }
  }
}
EOF
```

### Create Brand Profiles

```bash
# Create brand directory
mkdir -p /path/to/install/location/data/brands/tenants/customer-id/brand-id

# Create brand.json
cat > /path/to/install/location/data/brands/tenants/customer-id/brand-id/brand.json <<'EOF'
{
  "customerId": "customer-id",
  "brandName": "Brand Name",
  "colors": {
    "primary": "#1a1a2e",
    "secondary": "#16c784",
    "accent": "#00ff00"
  },
  "visualStyle": "professional, tech-forward, modern",
  "negativePrompts": [
    "unprofessional",
    "cartoon"
  ],
  "defaultAspectRatios": ["16:9", "1:1"]
}
EOF
```

### Setup Backup

```bash
# Backup brand profiles daily
0 2 * * * tar -czf /backup/wise2-brands-$(date +\%Y\%m\%d).tar.gz \
  /path/to/install/location/data/brands/

# Don't backup models (re-download if needed)
```

---

## Security Checklist

- [ ] Change API_KEY in .env to secure random value
- [ ] Enable firewall: `sudo ufw allow 8890`
- [ ] Restrict access: Use reverse proxy (Traefik) with auth
- [ ] Monitor logs: Regular audit of generation requests
- [ ] Update models: Monitor HuggingFace for security updates
- [ ] Rotate credentials: Change API keys monthly

---

## Next Steps

1. **Verify GPU generation** - Run test image generation
2. **Configure brand profiles** - Set up customer branding
3. **Setup monitoring** - Implement alerting
4. **Deploy MCP bridge** - Enable Claude Code integration
5. **Load test** - Verify throughput under load

---

## Support

- **Logs**: `/path/to/install/location/logs/`
- **Status**: `systemctl status wise2-visual-factory`
- **Health**: `curl http://localhost:8890/health`
- **Issues**: https://github.com/dwise03-bit/wise2-core/issues

**Installation script**: `services/visual-factory/scripts/install-vps.sh`  
**Documentation**: `docs/WISE2_VISUAL_FACTORY.md`  
**API Reference**: `services/visual-factory/README.md`

---

**Ready to deploy!** Run the installation script and monitor the output for GPU verification.
