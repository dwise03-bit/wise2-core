# WISE² Visual Factory - Complete Guide

**Version**: 1.0  
**Status**: Production Ready  
**Last Updated**: 2026-08-19

## Table of Contents

1. [Architecture](#architecture)
2. [System Requirements](#system-requirements)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [API Reference](#api-reference)
6. [Claude Integration](#claude-integration)
7. [Operations](#operations)
8. [Troubleshooting](#troubleshooting)

## Architecture

### System Diagram

```
┌─────────────────────┐
│   WISE² Platform    │
│   (Dashboard/API)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────┐
│   WISE² Image Router    │
│  - Tenant Validation    │
│  - Brand Loading        │
│  - Workflow Selection   │
│  - Prompt Enhancement   │
└──────────┬──────────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
┌────────┐    ┌──────────┐
│ Claude │    │WISE² API │
│  (MCP) │    │  Clients │
└────────┘    └──────────┘
    │             │
    └──────┬──────┘
           ▼
┌──────────────────────────┐
│  Visual Factory Service  │
│   - Job Queue/Mgmt       │
│   - Workflow Execution   │
│   - Asset Processing     │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│      ComfyUI             │
│   - Node Graph Exec      │
│   - Model Loading        │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│    NVIDIA GPU Cluster    │
│    - FLUX.2 Klein 4B     │
│    - Real-time Inference │
└──────────────────────────┘
```

### Data Flow - Text to Image

```
1. User/Claude Request
   ↓
2. Route through Image Router
   ├─ Extract tenant/customer
   ├─ Load brand profile
   ├─ Select workflow (text-to-image)
   ├─ Enhance prompt with brand
   └─ Select model (FLUX.2 Klein 4B)
   ↓
3. Create ComfyUI Workflow JSON
   ├─ Map prompt → CLIP encoder
   ├─ Set generation params
   ├─ Configure VAE/sampler
   └─ Define output node
   ↓
4. Submit to ComfyUI
   ├─ Validate nodes/connections
   ├─ Check GPU memory
   ├─ Load model into VRAM
   └─ Execute inference
   ↓
5. Process Output
   ├─ Validate image (size, channels)
   ├─ Apply metadata
   ├─ Store in tenant media
   └─ Update job status
   ↓
6. Return Asset URL
```

## System Requirements

### Hardware

- **GPU**: NVIDIA RTX 4090, A100, L40S, L40, or equivalent
  - Minimum 20GB VRAM (for FLUX.2 Klein 4B)
  - Recommended 24GB+ VRAM
- **CPU**: 8+ cores (modern)
- **RAM**: 32GB+ system memory
- **Storage**: 100GB+ SSD
  - 50GB for ComfyUI + models
  - 50GB for outputs + cache

### Software

- **OS**: Ubuntu 24.04 LTS (recommended) or compatible Linux
- **NVIDIA Driver**: 550.90+ (CUDA 12.0 compatible)
- **Python**: 3.10+
- **Node.js**: 20+
- **Docker**: 24+ (optional, for containerized deployment)

### Network

- Internal network only (not public internet)
- ComfyUI: 127.0.0.1:8188 (internal)
- Visual Factory API: 127.0.0.1:8890 (local)
- Access through WISE² API gateway (Traefik) with auth

## Installation

### Quick Start (Manual)

```bash
# 1. SSH to VPS
ssh dwise@173.208.147.165

# 2. Make install script executable
chmod +x /opt/wise2-core/services/visual-factory/scripts/install-vps.sh

# 3. Run installation
sudo /opt/wise2-core/services/visual-factory/scripts/install-vps.sh

# 4. Start services
sudo systemctl start wise2-visual-factory

# 5. Verify
curl http://localhost:8890/health
```

### Docker Installation

```bash
cd /opt/wise2-core/services/visual-factory

# Create external network (if not exists)
docker network create wise2-network || true

# Build and start
docker-compose up -d

# Monitor startup
docker-compose logs -f visual-factory
docker-compose logs -f comfyui
```

### Post-Installation Steps

1. **Edit Configuration**
   ```bash
   sudo nano /opt/wise2-visual-factory/.env
   ```

2. **Test GPU Access**
   ```bash
   /opt/wise2-visual-factory/venv/bin/python -c "import torch; print(torch.cuda.is_available())"
   ```

3. **Test ComfyUI**
   ```bash
   curl http://localhost:8188/system_stats
   ```

4. **Test Visual Factory**
   ```bash
   curl http://localhost:8890/health
   ```

## Configuration

### Environment Variables

```bash
# ComfyUI
COMFYUI_URL=http://127.0.0.1:8188
COMFYUI_MAX_CONCURRENT_JOBS=4
COMFYUI_DEFAULT_TIMEOUT=600000

# Visual Factory Service
PORT=8890
HOST=127.0.0.1
NODE_ENV=production
LOG_LEVEL=info

# Security
API_KEY=your-secure-random-key

# Storage
BRAND_DATA_PATH=/opt/wise2-visual-factory/data/brands
MEDIA_STORAGE_PATH=/media/wise2-visual-factory/outputs

# GPU/Performance
GPU_MEMORY_FRACTION=0.9
ENABLE_MEMORY_OPTIMIZATION=true
```

### Brand Profiles

Create tenant-specific brand configurations:

```bash
mkdir -p /opt/wise2-visual-factory/data/brands/tenants/{tenant-id}/{brand-id}
```

**Example**: `data/brands/tenants/cjays/brand/brand.json`

```json
{
  "customerId": "cjays",
  "brandName": "CJays",
  "colors": {
    "primary": "#1a1a2e",
    "secondary": "#16c784",
    "accent": "#00ff00"
  },
  "visualStyle": "professional, tech-forward, modern, clean",
  "negativePrompts": [
    "unprofessional",
    "cartoon",
    "sketch"
  ],
  "defaultAspectRatios": ["16:9", "1:1", "3:4"]
}
```

## API Reference

### Authentication

All requests require:
- `x-tenant-id`: Tenant identifier
- `x-api-key`: API key (from environment)

### Endpoints

#### Health Check
```
GET /health

Response:
{
  "status": "healthy",
  "gpu": true,
  "cuda": true,
  "comfyui": true,
  "checks": { ... }
}
```

#### Generate Image
```
POST /images/generate

Headers:
  x-tenant-id: tenant-123
  x-api-key: api-key-here

Body:
{
  "prompt": "A professional photo of...",
  "width": 1024,
  "height": 768,
  "steps": 20,
  "guidance": 7.5,
  "customerId": "customer-123",
  "brandId": "brand-id"
}

Response (202 Accepted):
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "QUEUED"
}
```

#### Get Job Status
```
GET /jobs/{jobId}

Response:
{
  "jobId": "550e8400...",
  "status": "GENERATING",
  "progress": 65,
  "outputAssets": [],
  "logs": [...]
}
```

#### List Models
```
GET /models

Response:
[
  {
    "name": "FLUX.2-klein-4B",
    "type": "checkpoint",
    "sizeGB": 4.6,
    "commercialUse": true
  }
]
```

#### Queue Statistics
```
GET /queue

Response:
{
  "queued": 2,
  "preparing": 1,
  "generating": 3,
  "completed": 145,
  "averageGenerationTime": 8500
}
```

## Claude Integration

### MCP Configuration

File: `.claude/mcp.json` (or project root)

```json
{
  "mcpServers": {
    "wise2-visual-factory": {
      "command": "node",
      "args": [
        "/opt/wise2-core/services/visual-factory/dist/mcp/server.js"
      ],
      "env": {
        "COMFYUI_URL": "http://127.0.0.1:8188",
        "API_KEY": "your-api-key",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### Available Tools

- `generate_image` - Create image from prompt
- `job_status` - Check generation status
- `wait_for_job` - Poll until completion
- `server_info` - System health/models
- `fetch_outputs` - Retrieve generated assets
- `run_workflow` - Execute raw ComfyUI workflow

### Usage from Claude

```javascript
// Generate image
const result = await tools.generate_image({
  prompt: "A professional WISE² interface mockup",
  width: 1536,
  height: 864,
  steps: 25
});

// Wait for completion
const final = await tools.wait_for_job({
  jobId: result.jobId,
  timeoutMs: 600000
});

// Retrieve assets
const assets = await tools.fetch_outputs({
  jobId: result.jobId
});
```

## Operations

### Service Management

```bash
# Start services
sudo systemctl start wise2-visual-factory

# Stop services
sudo systemctl stop wise2-visual-factory

# Restart
sudo systemctl restart wise2-visual-factory

# Enable on boot
sudo systemctl enable wise2-visual-factory

# Check status
systemctl status wise2-visual-factory
sudo systemctl status wise2-comfyui
```

### Monitoring

```bash
# Live logs
journalctl -u wise2-visual-factory -f
journalctl -u wise2-comfyui -f

# Or Docker
docker-compose logs -f visual-factory

# Check GPU utilization
watch -n 1 nvidia-smi

# Monitor service health
while true; do
  curl -s http://localhost:8890/health | jq .
  sleep 5
done
```

### Maintenance

```bash
# Clear old generations
rm -rf /opt/wise2-visual-factory/comfyui/output/*

# Clear temporary files
rm -rf /opt/wise2-visual-factory/comfyui/temp/*

# Reload models
curl -X POST http://localhost:8188/interrupt

# Check disk usage
du -sh /opt/wise2-visual-factory/models
du -sh /media/wise2-visual-factory/outputs
```

### Backups

```bash
# Backup brand profiles
tar -czf wise2-brands-$(date +%Y%m%d).tar.gz \
  /opt/wise2-visual-factory/data/brands/

# Backup configuration
cp /opt/wise2-visual-factory/.env .env.backup

# Don't backup models (re-download if needed)
```

## Troubleshooting

### GPU Not Detected

```bash
# Check driver
nvidia-smi

# Check CUDA
python3 -c "import torch; print(torch.cuda.is_available())"

# Reinstall drivers if needed
sudo ubuntu-drivers install
```

### ComfyUI Not Responding

```bash
# Check if service is running
systemctl status wise2-comfyui

# Check logs
journalctl -u wise2-comfyui -20

# Restart service
sudo systemctl restart wise2-comfyui

# Manual start for debugging
cd /opt/wise2-visual-factory/comfyui
source /opt/wise2-visual-factory/venv/bin/activate
python main.py
```

### Out of Memory

```bash
# Check current GPU usage
nvidia-smi

# Reduce concurrent jobs
# Edit .env: COMFYUI_MAX_CONCURRENT_JOBS=2

# Clear GPU cache
curl -X POST http://localhost:8188/interrupt
sleep 5

# Restart ComfyUI
sudo systemctl restart wise2-comfyui
```

### Model Download Issues

```bash
# Check free disk space
df -h /opt/wise2-visual-factory

# Set HF token
export HF_TOKEN="your-token-here"

# Manual download
cd /opt/wise2-visual-factory
source venv/bin/activate
huggingface-cli download \
  black-forest-labs/FLUX.2-klein-4B \
  --local-dir models/checkpoints
```

### Slow Inference

```bash
# Check GPU utilization
nvidia-smi dmon

# Expected times:
# - First generation: ~30s (model loading + inference)
# - Subsequent: ~8-12s (inference only)

# If slower than expected:
# 1. Check GPU temperature (should be <70°C)
# 2. Check for CPU bottleneck
# 3. Reduce image dimensions
# 4. Check disk I/O for bottleneck
```

### API Connection Issues

```bash
# Test connectivity
curl -v http://localhost:8890/health

# Check firewall
sudo ufw status
sudo ufw allow 8890

# Check service logs
journalctl -u wise2-visual-factory -30

# Restart service
sudo systemctl restart wise2-visual-factory
```

## Performance Benchmarks

### Generation Times (FLUX.2 Klein 4B on RTX 4090)

| Resolution | Steps | Time | VRAM Used |
|-----------|-------|------|-----------|
| 512×384   | 20    | 5.2s | 18 GB     |
| 1024×768  | 20    | 8.1s | 21 GB     |
| 1536×864  | 20    | 12.3s| 23 GB     |
| 2048×1536 | 20    | 22.1s| 24 GB     |

### Throughput

- **Single GPU**: 5-8 images/minute (1024×768, 20 steps)
- **Max concurrent**: 4 jobs (with queue balancing)
- **Peak throughput**: 30-40 images/minute (batch processing)

## Security Best Practices

1. **Never expose ComfyUI publicly** - Use internal network only
2. **Always use HTTPS** - Proxy through Traefik with TLS
3. **Rotate API keys** - Monthly rotation recommended
4. **Audit logs** - Review generation logs for anomalies
5. **Tenant isolation** - Strictly enforce tenant_id validation
6. **Model licensing** - Verify commercial use rights before deployment

## Support & Documentation

- **GitHub Issues**: https://github.com/dwise03-bit/wise2-core/issues
- **Internal Docs**: https://wise2.net/docs/
- **API Docs**: https://api.wise2.net/docs/visual-factory
- **Claude MCP**: https://wise2.net/docs/mcp/

---

**Last Updated**: 2026-08-19  
**Status**: Production Ready - v1.0  
**Owner**: dwise03@gmail.com
