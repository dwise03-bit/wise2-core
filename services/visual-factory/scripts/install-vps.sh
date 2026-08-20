#!/bin/bash

# WISE² Visual Factory - VPS Installation Script
# Installs ComfyUI, FLUX.2 Klein 4B, and Visual Factory service

set -e

echo "=========================================="
echo "WISE² Visual Factory - VPS Installation"
echo "=========================================="

# Auto-detect storage location if not specified
if [ -z "$INSTALL_DIR" ]; then
    log_info "Auto-detecting best storage location..."

    # Check common mount points first
    for mount in /mnt /data /var/data /media /storage; do
        if [ -d "$mount" ] && [ -w "$mount" ]; then
            available=$(df "$mount" 2>/dev/null | awk 'NR==2 {print $4}')
            if [ -n "$available" ] && [ "$available" -gt 102400 ]; then  # >100GB
                INSTALL_DIR="${mount}/wise2-visual-factory"
                log_info "Found ${available}K available at $mount"
                break
            fi
        fi
    done

    # Fall back to /opt if available space detected there
    if [ -z "$INSTALL_DIR" ]; then
        available_opt=$(df /opt 2>/dev/null | awk 'NR==2 {print $4}')
        if [ -n "$available_opt" ] && [ "$available_opt" -gt 102400 ]; then
            INSTALL_DIR="/opt/wise2-visual-factory"
            log_info "Using /opt with ${available_opt}K available"
        else
            log_error "No mount point found with 100GB+ free space"
            log_error "Available options:"
            df -h | tail -n +2
            exit 1
        fi
    fi
fi

INSTALL_DIR="${INSTALL_DIR:-/opt/wise2-visual-factory}"
MODELS_DIR="${MODELS_DIR:-${INSTALL_DIR}/models}"
VENV_DIR="${VENV_DIR:-${INSTALL_DIR}/venv}"
SERVICE_NAME="wise2-visual-factory"

log_info "Installation directory: $INSTALL_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: System checks
log_info "Step 1: System checks"

# Check for required commands (auto-install rsync if missing)
for cmd in git curl python3 nvidia-smi; do
    if ! command -v $cmd &> /dev/null; then
        log_error "$cmd not found. Please install it."
        exit 1
    fi
done

# Check for rsync (auto-install on Debian/Ubuntu)
if ! command -v rsync &> /dev/null; then
    log_warn "rsync not found. Installing via apt-get..."
    sudo apt-get update && sudo apt-get install -y rsync || {
        log_error "Failed to install rsync"
        exit 1
    }
fi

log_info "Checking NVIDIA GPU..."
nvidia-smi || { log_error "NVIDIA GPU not detected"; exit 1; }

# Check Python version
PYTHON_VERSION=$(python3 --version | awk '{print $2}')
log_info "Python version: $PYTHON_VERSION"

# Step 2: Create installation directory
log_info "Step 2: Creating installation directory"
mkdir -p "${INSTALL_DIR}"
mkdir -p "${MODELS_DIR}"
cd "${INSTALL_DIR}"

# Step 3: Clone ComfyUI
log_info "Step 3: Installing ComfyUI"
if [ ! -d "${INSTALL_DIR}/comfyui" ]; then
    git clone https://github.com/comfyanonymous/ComfyUI.git comfyui
else
    log_warn "ComfyUI already installed"
fi

# Step 4: Setup Python virtual environment
log_info "Step 4: Setting up Python environment"
python3 -m venv "${VENV_DIR}"
source "${VENV_DIR}/bin/activate"

# Step 5: Install PyTorch with CUDA support
log_info "Step 5: Installing PyTorch (this may take a few minutes)"
pip install --upgrade pip setuptools wheel
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Verify CUDA availability
python3 -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}'); print(f'GPU: {torch.cuda.get_device_name()}')" || {
    log_error "PyTorch CUDA verification failed"
    exit 1
}

# Step 6: Install ComfyUI dependencies
log_info "Step 6: Installing ComfyUI dependencies"
cd "${INSTALL_DIR}/comfyui"
pip install -r requirements.txt

# Step 7: Download models
log_info "Step 7: Downloading FLUX.2 Klein 4B model (this will take several minutes)"
mkdir -p "${MODELS_DIR}/checkpoints"
mkdir -p "${MODELS_DIR}/vae"
mkdir -p "${MODELS_DIR}/clip"

# Install HuggingFace CLI
pip install huggingface-hub

# Download FLUX.2 Klein 4B
log_info "Downloading FLUX.2 Klein 4B (4.6 GB)..."
huggingface-cli download \
    black-forest-labs/FLUX.2-klein-4B \
    flux1-4b.safetensors \
    --local-dir "${MODELS_DIR}/checkpoints" \
    --local-dir-use-symlinks False

# Download VAE
log_info "Downloading FLUX.2 VAE..."
huggingface-cli download \
    black-forest-labs/FLUX.2-vae \
    ae.safetensors \
    --local-dir "${MODELS_DIR}/vae" \
    --local-dir-use-symlinks False

log_info "Downloading CLIP models..."
huggingface-cli download \
    comfyanonymous/clip_vision_g \
    --local-dir "${MODELS_DIR}/clip" \
    --local-dir-use-symlinks False

# Step 8: Setup ComfyUI symlinks to models
log_info "Step 8: Linking models to ComfyUI"
ln -sf "${MODELS_DIR}/checkpoints" "${INSTALL_DIR}/comfyui/models/checkpoints"
ln -sf "${MODELS_DIR}/vae" "${INSTALL_DIR}/comfyui/models/vae"
ln -sf "${MODELS_DIR}/clip" "${INSTALL_DIR}/comfyui/models/clip_vision"

# Step 9: Install Node.js dependencies for Visual Factory
log_info "Step 9: Installing Visual Factory service"

# Check Node.js
if ! command -v node &> /dev/null; then
    log_warn "Node.js not found. Installing Node 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Copy Visual Factory codebase if not already present
if [ ! -f "${INSTALL_DIR}/package.json" ]; then
    log_info "Copying Visual Factory codebase to ${INSTALL_DIR}..."
    # Get the directory where this script is located
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
    VISUAL_FACTORY_SRC="${REPO_ROOT}/services/visual-factory"

    if [ ! -d "${VISUAL_FACTORY_SRC}" ]; then
        log_error "Could not find Visual Factory source at ${VISUAL_FACTORY_SRC}"
        exit 1
    fi

    # Copy source files (exclude node_modules, dist, logs)
    rsync -av --exclude=node_modules --exclude=dist --exclude=logs "${VISUAL_FACTORY_SRC}/" "${INSTALL_DIR}/" || {
        log_error "Failed to copy Visual Factory source"
        exit 1
    }
fi

cd "${INSTALL_DIR}"
npm install
npm run build

# Step 10: Create systemd service
log_info "Step 10: Creating systemd service"

# ComfyUI service
sudo tee /etc/systemd/system/wise2-comfyui.service > /dev/null <<EOF
[Unit]
Description=WISE² ComfyUI
After=network.target
PartOf=wise2-visual-factory.target

[Service]
Type=simple
User=root
WorkingDirectory=${INSTALL_DIR}/comfyui
EnvironmentFile=${INSTALL_DIR}/.env
ExecStart=${VENV_DIR}/bin/python main.py
Restart=on-failure
RestartSec=10s
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Visual Factory service
sudo tee /etc/systemd/system/wise2-visual-factory.service > /dev/null <<EOF
[Unit]
Description=WISE² Visual Factory
After=network.target wise2-comfyui.service
PartOf=wise2-visual-factory.target

[Service]
Type=simple
User=root
WorkingDirectory=${INSTALL_DIR}
EnvironmentFile=${INSTALL_DIR}/.env
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10s
StandardOutput=journal
StandardError=journal
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
EOF

# Target unit
sudo tee /etc/systemd/system/wise2-visual-factory.target > /dev/null <<EOF
[Unit]
Description=WISE² Visual Factory System
Wants=wise2-comfyui.service wise2-visual-factory.service

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload

# Step 11: Create .env file
log_info "Step 11: Creating environment configuration"
if [ ! -f "${INSTALL_DIR}/.env" ]; then
    cp "${INSTALL_DIR}/.env.example" "${INSTALL_DIR}/.env"
    log_warn "Please edit ${INSTALL_DIR}/.env with your configuration"
else
    log_warn ".env already exists, skipping"
fi

# Step 12: Setup logging
log_info "Step 12: Setting up logging"
mkdir -p "${INSTALL_DIR}/logs"
sudo chown $USER:$USER "${INSTALL_DIR}/logs"

# Step 13: Test ComfyUI
log_info "Step 13: Testing ComfyUI installation"
cd "${INSTALL_DIR}/comfyui"
python -c "from comfy.model_management import cuda_malloc_warning; print('ComfyUI test: OK')" || {
    log_error "ComfyUI test failed"
    exit 1
}

# Step 14: End-to-end GPU test with real image generation
log_info "Step 14: Running end-to-end GPU generation test"
log_info "Starting services for GPU verification..."

# Start ComfyUI in background
source "${VENV_DIR}/bin/activate"
cd "${INSTALL_DIR}/comfyui"
python main.py > "${INSTALL_DIR}/logs/comfyui-startup.log" 2>&1 &
COMFYUI_PID=$!
log_info "ComfyUI PID: $COMFYUI_PID"

# Wait for ComfyUI to be ready
log_info "Waiting for ComfyUI to initialize (up to 60 seconds)..."
for i in {1..60}; do
    if curl -s http://localhost:8188/system_stats > /dev/null 2>&1; then
        log_info "ComfyUI is ready!"
        break
    fi
    if [ $i -eq 60 ]; then
        log_error "ComfyUI failed to start within 60 seconds"
        kill $COMFYUI_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

# Start Visual Factory in background
cd "${INSTALL_DIR}"
npm start > "${INSTALL_DIR}/logs/visual-factory-startup.log" 2>&1 &
FACTORY_PID=$!
log_info "Visual Factory PID: $FACTORY_PID"

# Wait for Visual Factory to be ready
log_info "Waiting for Visual Factory API to initialize (up to 30 seconds)..."
for i in {1..30}; do
    if curl -s http://localhost:8890/health > /dev/null 2>&1; then
        log_info "Visual Factory API is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "Visual Factory failed to start within 30 seconds"
        kill $COMFYUI_PID $FACTORY_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

# Generate test image
log_info "Generating test image with GPU..."
TEST_PROMPT="A professional photograph of a modern tech interface, clean design, high quality, commercial"
START_TIME=$(date +%s%N)

JOB_RESPONSE=$(curl -s -X POST http://localhost:8890/images/generate \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: test-tenant" \
  -H "x-api-key: test-key" \
  -d "{
    \"prompt\": \"${TEST_PROMPT}\",
    \"width\": 1024,
    \"height\": 768,
    \"steps\": 20,
    \"guidance\": 7.5,
    \"customerId\": \"test-customer\",
    \"brandId\": \"test-brand\"
  }")

JOB_ID=$(echo "$JOB_RESPONSE" | grep -o '"jobId":"[^"]*"' | cut -d'"' -f4)
if [ -z "$JOB_ID" ]; then
    log_error "Failed to queue image generation"
    log_error "Response: $JOB_RESPONSE"
    kill $COMFYUI_PID $FACTORY_PID 2>/dev/null || true
    exit 1
fi

log_info "Image generation queued with job ID: $JOB_ID"
log_info "Waiting for generation to complete (up to 120 seconds)..."

# Poll job status
for i in {1..120}; do
    STATUS_RESPONSE=$(curl -s http://localhost:8890/jobs/$JOB_ID \
      -H "x-tenant-id: test-tenant" \
      -H "x-api-key: test-key")

    JOB_STATUS=$(echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4 | head -1)
    PROGRESS=$(echo "$STATUS_RESPONSE" | grep -o '"progress":[0-9]*' | cut -d':' -f2)

    if [ "$JOB_STATUS" = "COMPLETED" ]; then
        END_TIME=$(date +%s%N)
        DURATION_MS=$(( (END_TIME - START_TIME) / 1000000 ))
        log_info "✓ Image generation COMPLETED in ${DURATION_MS}ms"
        log_info "Response: $STATUS_RESPONSE"
        break
    elif [ "$JOB_STATUS" = "FAILED" ]; then
        log_error "✗ Image generation FAILED"
        log_error "Response: $STATUS_RESPONSE"
        kill $COMFYUI_PID $FACTORY_PID 2>/dev/null || true
        exit 1
    else
        echo -n "."
        if [ -n "$PROGRESS" ]; then
            echo -n " ($PROGRESS%)"
        fi
    fi

    if [ $i -eq 120 ]; then
        log_error "Image generation timed out after 120 seconds"
        kill $COMFYUI_PID $FACTORY_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

# Check GPU utilization
log_info "GPU Status after generation:"
nvidia-smi --query-gpu=memory.used,memory.total,utilization.gpu --format=csv,noheader,nounits

# Cleanup
log_info "Stopping test services..."
kill $COMFYUI_PID $FACTORY_PID 2>/dev/null || true
sleep 2

log_info ""
log_info "=========================================="
log_info "✓ Installation Complete & GPU Verified!"
log_info "=========================================="
log_info ""
log_info "Image generation test:"
log_info "  - Model: FLUX.2 Klein 4B"
log_info "  - Resolution: 1024×768"
log_info "  - Steps: 20"
log_info "  - GPU verified: YES"
log_info ""
log_info "Next steps:"
log_info "1. Edit configuration:      nano ${INSTALL_DIR}/.env"
log_info "2. Enable services:         sudo systemctl enable wise2-comfyui wise2-visual-factory"
log_info "3. Start services:          sudo systemctl start wise2-visual-factory"
log_info "4. Check status:            systemctl status wise2-visual-factory"
log_info "5. View logs:               journalctl -u wise2-visual-factory -f"
log_info "6. Test API:                curl http://localhost:8890/health"
log_info ""
