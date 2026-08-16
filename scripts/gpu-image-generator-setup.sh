#!/bin/bash
# PIFF CITY × WISE² — GPU Image Generation Setup
# Installs ComfyUI + SDXL on your GPU VPS
# Run: bash scripts/gpu-image-generator-setup.sh

set -e

echo "🚀 WISE² GPU Image Generation Setup"
echo "===================================="

# Check GPU (optional, may fail on some systems)
echo "📊 Checking GPU..."
nvidia-smi --query-gpu=name,memory.total --format=csv,noheader 2>/dev/null || echo "⚠️  GPU check skipped (may be normal on remote systems)"

# Create directories
mkdir -p ~/.comfyui/{models,outputs}
mkdir -p ./instagram_posts/{raw,upscaled}

cd ~/.comfyui

# 1. Clone ComfyUI
if [ ! -d "ComfyUI" ]; then
  echo "📦 Cloning ComfyUI..."
  git clone https://github.com/comfyanonymous/ComfyUI.git
  cd ComfyUI
else
  cd ComfyUI
  echo "✅ ComfyUI already cloned"
fi

# 2. Create Python venv
if [ ! -d "venv" ]; then
  echo "🐍 Creating Python virtual environment..."
  python3 -m venv venv
fi

source venv/bin/activate

# 3. Install dependencies
echo "📥 Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

# 4. Install ComfyUI Manager
if [ ! -d "custom_nodes/ComfyUI-Manager" ]; then
  echo "🔧 Installing ComfyUI Manager..."
  mkdir -p custom_nodes
  cd custom_nodes
  git clone https://github.com/ltdrdata/ComfyUI-Manager.git
  cd ..
else
  echo "✅ ComfyUI Manager already installed"
fi

# 5. Download SDXL model (if not present)
echo "🤖 Checking SDXL model..."
if [ ! -f "models/checkpoints/sd_xl_base_1.0.safetensors" ]; then
  echo "📥 Downloading SDXL (2.1GB)... this may take a few minutes"
  cd models/checkpoints

  # Use huggingface-cli if available, else wget
  if command -v huggingface-cli &> /dev/null; then
    huggingface-cli download stabilityai/stable-diffusion-xl-base-1.0 sd_xl_base_1.0.safetensors --local-dir .
  else
    wget -q https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors
  fi

  cd ../..
else
  echo "✅ SDXL model already present"
fi

# 6. Optional: Download VAE for better quality
if [ ! -f "models/vae/sdxl_vae.safetensors" ]; then
  echo "📥 Downloading SDXL VAE..."
  cd models/vae
  wget -q https://huggingface.co/stabilityai/sdxl-vae/resolve/main/sdxl_vae.safetensors 2>/dev/null || echo "⚠️  VAE download skipped (optional)"
  cd ../..
fi

# 7. Create startup script
cat > start-comfyui.sh << 'EOF'
#!/bin/bash
cd ~/.comfyui/ComfyUI
source venv/bin/activate
echo "🚀 Starting ComfyUI on http://localhost:8188"
python main.py --listen 0.0.0.0 --port 8188 --gpu-device 0
EOF

chmod +x start-comfyui.sh

echo ""
echo "✅ Setup Complete!"
echo ""
echo "🎬 Next Steps:"
echo "1. Start ComfyUI:"
echo "   bash ~/.comfyui/start-comfyui.sh"
echo ""
echo "2. Open in browser:"
echo "   http://localhost:8188  (local)"
echo "   http://your-gpu-vps-ip:8188  (remote)"
echo ""
echo "3. Generate images:"
echo "   python scripts/piff-city-generator.py"
echo ""
echo "📊 Your GPU: $(nvidia-smi --query-gpu=name --format=csv,noheader)"
echo "💾 VRAM: $(nvidia-smi --query-gpu=memory.total --format=csv,noheader)"
echo ""
