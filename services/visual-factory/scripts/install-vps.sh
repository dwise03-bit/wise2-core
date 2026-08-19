#!/bin/bash

# WISE² Visual Factory - VPS Installation Script
# Installs ComfyUI, FLUX.2 Klein 4B, and Visual Factory service

set -e

echo "=========================================="
echo "WISE² Visual Factory - VPS Installation"
echo "=========================================="

# Configuration
INSTALL_DIR="${INSTALL_DIR:-/opt/wise2-visual-factory}"
MODELS_DIR="${MODELS_DIR:-${INSTALL_DIR}/models}"
VENV_DIR="${VENV_DIR:-${INSTALL_DIR}/venv}"
SERVICE_NAME="wise2-visual-factory"

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

# Check for required commands
for cmd in git curl python3 nvidia-smi; do
    if ! command -v $cmd &> /dev/null; then
        log_error "$cmd not found. Please install it."
        exit 1
    fi
done

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
cd "${INSTALL_DIR}"

# Check Node.js
if ! command -v node &> /dev/null; then
    log_warn "Node.js not found. Installing Node 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

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

log_info ""
log_info "=========================================="
log_info "Installation Complete!"
log_info "=========================================="
log_info ""
log_info "Next steps:"
log_info "1. Edit configuration:      nano ${INSTALL_DIR}/.env"
log_info "2. Enable services:         sudo systemctl enable wise2-comfyui wise2-visual-factory"
log_info "3. Start services:          sudo systemctl start wise2-visual-factory"
log_info "4. Check status:            systemctl status wise2-visual-factory"
log_info "5. View logs:               journalctl -u wise2-visual-factory -f"
log_info "6. Test API:                curl http://localhost:8890/health"
log_info ""
