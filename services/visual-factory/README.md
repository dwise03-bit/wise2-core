# WISE² Visual Factory

Professional AI image generation engine for WISE² platform, powered by ComfyUI and FLUX.2 Klein 4B.

## Architecture

```
WISE² Request
    ↓
[Authentication & Tenant Validation]
    ↓
[Image Router]
    ├─ Brand Profile Loading
    ├─ Workflow Selection
    ├─ Prompt Enhancement
    └─ Model Selection
    ↓
[ComfyUI Executor]
    ├─ Workflow Building
    ├─ GPU Inference
    └─ Output Processing
    ↓
[Asset Storage & Metadata]
    ↓
Response to Client
```

## Components

### Core Services

- **ImageRouter** (`src/router/ImageRouter.ts`) - Central orchestration engine
  - Routes requests to appropriate workflows
  - Manages job queue and status
  - Handles prompt enhancement and model selection

- **ComfyUIClient** (`src/comfyui/ComfyUIClient.ts`) - ComfyUI API wrapper
  - Submits workflows for execution
  - Monitors job completion
  - Collects GPU metrics

- **WorkflowManager** (`src/workflows/WorkflowManager.ts`) - Workflow templates
  - Defines 15 production workflows
  - Builds ComfyUI JSON structures
  - Manages workflow versions

- **BrandProfileManager** (`src/brand/BrandProfileManager.ts`) - Customer branding
  - Loads/caches brand profiles
  - Provides WISE² brand defaults
  - Enhances prompts based on brand identity

- **ComfyMCPBridge** (`src/mcp/ComfyMCPBridge.ts`) - Claude integration
  - MCP tool implementations
  - High-level generation API
  - Job status and polling

### API Endpoints

```
Health & Status:
  GET /health                    - Service health check
  GET /queue                     - Queue statistics
  GET /gpu/status                - GPU metrics

Generation:
  POST /images/generate          - Queue image generation
  GET /jobs/:jobId               - Get job status

Models & Workflows:
  GET /models                    - List available models
  GET /workflows                 - List workflow templates
```

### Supported Workflows

1. **01-text-to-image** - Generate from text prompt
2. **02-image-edit** - Edit/transform images
3. **04-multi-reference** - Reference-driven generation
4. **05-image-variations** - Create variations
5. **06-upscale** - 2K/4K upscaling
6. **07-background-removal** - Remove backgrounds

## Installation

### Prerequisites

- Ubuntu 24.04 or compatible Linux
- NVIDIA GPU (RTX 4090, A100, L40S, etc.)
- NVIDIA drivers 550+
- CUDA 12.0+
- Docker & Docker Compose
- 80GB+ free disk (for models)
- 20GB+ free memory

### 1. Clone Repository

```bash
cd /opt
git clone https://github.com/dwise03-bit/wise2-core.git
cd wise2-core
```

### 2. Setup ComfyUI

```bash
# Install ComfyUI
cd /opt/wise2-visual-factory
git clone https://github.com/comfyanonymous/ComfyUI.git comfyui-repo
cd comfyui-repo
python3 -m venv venv
source venv/bin/activate
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
pip install -r requirements.txt
```

### 3. Download Models

```bash
# FLUX.2 Klein 4B (4.6 GB)
huggingface-cli download \
    black-forest-labs/FLUX.2-klein-4B \
    --local-dir models/checkpoints/

# VAE
huggingface-cli download \
    black-forest-labs/FLUX.2-vae \
    --local-dir models/vae/

# CLIP models
huggingface-cli download \
    openai/clip-vit-large-patch14 \
    --local-dir models/clip/
```

### 4. Setup Visual Factory Service

```bash
cd /opt/wise2-visual-factory
cp .env.example .env
# Edit .env with your configuration

npm install
npm run build
```

### 5. Start Services

```bash
# Start ComfyUI
cd /opt/wise2-visual-factory/comfyui-repo
source venv/bin/activate
python main.py

# In another terminal, start Visual Factory
cd /opt/wise2-visual-factory
npm start
```

## Docker Deployment

```bash
# Build and start all services
docker-compose -f docker-compose.yml up -d

# Check status
docker-compose ps
docker-compose logs -f visual-factory
docker-compose logs -f comfyui

# Health check
curl http://localhost:8890/health
curl http://localhost:8188/system_stats
```

## Usage

### API Request

```bash
curl -X POST http://localhost:8890/images/generate \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: tenant-123" \
  -H "x-api-key: your-api-key" \
  -d '{
    "prompt": "A futuristic WISE² command center, dark navy aesthetic, neon green accents, premium commercial photography",
    "width": 1536,
    "height": 864,
    "steps": 20,
    "guidance": 7.5,
    "customerId": "customer-456",
    "brandId": "wise2-brand"
  }'
```

Response:
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "QUEUED",
  "message": "Generation request queued"
}
```

### Check Job Status

```bash
curl http://localhost:8890/jobs/550e8400-e29b-41d4-a716-446655440000 \
  -H "x-tenant-id: tenant-123" \
  -H "x-api-key: your-api-key"
```

### Claude MCP Integration

```bash
# In Claude Code, configure MCP:
# ~/.claude/mcp.json or .claude/mcp.json in project

{
  "mcpServers": {
    "comfy": {
      "command": "node",
      "args": ["./services/visual-factory/dist/mcp/server.js"],
      "env": {
        "COMFYUI_URL": "http://127.0.0.1:8188",
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

## CLI Tools

```bash
# Health check
npm run comfy:health

# System diagnostics
npm run comfy:doctor

# List models
npm run comfy:models

# List workflows
npm run comfy:workflows

# List jobs
npm run comfy:jobs

# GPU status
npm run comfy:gpu

# Generate image (CLI)
npm run comfy:generate "A professional photo"

# Customer generation
npm run comfy:customer --customer cjays --prompt "Logo variation"
```

## Configuration Files

### ComfyUI Config (`config/comfyui.conf`)

```json
{
  "comfy_object_tooltips_enabled": true,
  "disable_auto_launch": true,
  "default_graph_example": "example_workflow.json"
}
```

### Brand Profile (`data/brands/{customer}/{brand}.json`)

```json
{
  "customerId": "customer-123",
  "brandName": "Brand Name",
  "colors": {
    "primary": "#000000",
    "secondary": "#FFFFFF",
    "accent": "#00FF00"
  },
  "visualStyle": "premium, professional, commercial",
  "negativePrompts": [
    "cheap AI art",
    "watermarks"
  ],
  "defaultAspectRatios": ["16:9", "4:3", "1:1"]
}
```

## Monitoring

### Health Check

```bash
curl http://localhost:8890/health
```

Response:
```json
{
  "status": "healthy",
  "gpu": true,
  "cuda": true,
  "comfyui": true,
  "mcp": true,
  "model": "FLUX.2-klein-4B",
  "storage": true,
  "queue": true,
  "database": true,
  "checks": {
    "gpuInfo": {
      "model": "NVIDIA RTX 4090",
      "vramTotal": 24576,
      "vramUsed": 12288,
      "vramFree": 12288,
      "utilization": 50,
      "temperature": 42,
      "cudaAvailable": true,
      "driverVersion": "550.90.07"
    }
  },
  "timestamp": "2026-08-19T10:30:00Z"
}
```

### Queue Statistics

```bash
curl http://localhost:8890/queue \
  -H "x-tenant-id: tenant-123" \
  -H "x-api-key: your-api-key"
```

Response:
```json
{
  "queued": 2,
  "preparing": 1,
  "generating": 3,
  "processing": 1,
  "completed": 145,
  "failed": 2,
  "cancelled": 0,
  "averageGenerationTime": 8500,
  "totalJobsProcessed": 151
}
```

### Logs

```bash
# Service logs
tail -f logs/combined.log

# Error logs
tail -f logs/error.log

# Docker logs
docker logs -f wise2-visual-factory
docker logs -f wise2-comfyui
```

## Troubleshooting

### ComfyUI Not Responding

```bash
# Check if service is running
systemctl status wise2-comfyui

# Restart service
systemctl restart wise2-comfyui

# Check logs
journalctl -u wise2-comfyui -f
```

### GPU Not Detected

```bash
# Check NVIDIA driver
nvidia-smi

# Check CUDA
python3 -c "import torch; print(torch.cuda.is_available())"

# Reinstall drivers if needed
sudo ubuntu-drivers install
```

### Out of Memory

```bash
# Reduce model size
# Edit config and switch to SDXL or FLUX-dev-4B

# Clear GPU cache
curl -X POST http://localhost:8188/interrupt

# Monitor VRAM usage
watch -n 1 nvidia-smi
```

### Model Download Issues

```bash
# Set Hugging Face token
export HF_TOKEN="your-hf-token"

# Manually download
huggingface-cli download black-forest-labs/FLUX.2-klein-4B --local-dir models/

# Check disk space
df -h /opt/wise2-visual-factory
```

## Performance Tuning

### GPU Memory Optimization

```bash
# In .env
GPU_MEMORY_FRACTION=0.9
ENABLE_MEMORY_OPTIMIZATION=true
```

### Concurrent Job Limits

```bash
# In .env
COMFYUI_MAX_CONCURRENT_JOBS=4
```

### Model Preloading

Models are loaded on-demand. First generation ~30s, subsequent <10s.

## Security

- **Authentication**: API key + tenant ID required for all endpoints
- **Tenant Isolation**: Assets and jobs strictly isolated by tenant
- **Network**: ComfyUI only accessible via internal bridge (not public)
- **API**: HTTPS required in production (use Traefik reverse proxy)

## Systemd Service (Production)

```ini
# /etc/systemd/system/wise2-visual-factory.service

[Unit]
Description=WISE² Visual Factory
After=network.target docker.service

[Service]
Type=simple
WorkingDirectory=/opt/wise2-visual-factory
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10s
StandardOutput=journal
StandardError=journal
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable wise2-visual-factory
sudo systemctl start wise2-visual-factory
```

## Contributing

- Add new workflows to `src/workflows/`
- Add new API endpoints to `src/server.ts`
- Update MCP definitions in `ComfyMCPBridge`
- Run tests: `npm test`

## License

AGPL-3.0 - Part of WISE² Genesis

## Support

- Issues: https://github.com/dwise03-bit/wise2-core/issues
- Docs: https://wise2.net/docs/visual-factory
- Discord: https://discord.gg/wise2
