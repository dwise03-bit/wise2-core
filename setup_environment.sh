#!/bin/bash
# Phase 1 Setup: Install dependencies and create directory structure

set -e

echo "==========================================================================="
echo "PHASE 1 ENVIRONMENT SETUP"
echo "==========================================================================="

# Get home directory
HOME_DIR="/home/dwise"
PROJECT_DIR="$HOME_DIR/musicgen-training"

echo ""
echo "Setting up training environment..."
echo "Project directory: $PROJECT_DIR"
echo ""

# ============================================================================
# Step 1: Create directory structure
# ============================================================================
echo "[1/4] Creating directory structure..."

mkdir -p "$PROJECT_DIR"/{raw,processed,metadata/splits}

echo "✓ Created directories:"
echo "  - $PROJECT_DIR/raw (for raw audio files)"
echo "  - $PROJECT_DIR/processed (for 16kHz mono WAV)"
echo "  - $PROJECT_DIR/metadata (for JSON metadata)"
echo "  - $PROJECT_DIR/metadata/splits (for train/val/test)"

# ============================================================================
# Step 2: Python dependencies
# ============================================================================
echo ""
echo "[2/4] Installing Python dependencies..."
echo "      (this may take 5-10 minutes)"

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo "Python: $PYTHON_VERSION"

# Upgrade pip
python3 -m pip install --upgrade pip setuptools wheel

# Core dependencies
echo "Installing core libraries..."
python3 -m pip install \
    torch torchvision torchaudio \
    --index-url https://download.pytorch.org/whl/cu118

# Audio processing
echo "Installing audio libraries..."
python3 -m pip install \
    librosa \
    soundfile \
    audiocraft \
    transformers \
    accelerate \
    numpy \
    scipy

# Optional: YouTube downloader
echo "Installing YouTube downloader..."
python3 -m pip install yt-dlp

# Optional: Weights & Biases (free tier for monitoring)
echo "Installing monitoring tools..."
python3 -m pip install wandb

echo "✓ All Python dependencies installed"

# ============================================================================
# Step 3: Download system dependencies (if on Linux)
# ============================================================================
echo ""
echo "[3/4] Checking system dependencies..."

if command -v ffmpeg &> /dev/null; then
    echo "✓ ffmpeg is installed"
else
    echo "⚠️  ffmpeg not found"
    echo "   (Install with: sudo apt-get install ffmpeg)"
fi

# ============================================================================
# Step 4: Verify GPU access
# ============================================================================
echo ""
echo "[4/4] Verifying GPU access..."

python3 << 'EOF'
import torch

print("\nGPU Status:")
print(f"  CUDA available: {torch.cuda.is_available()}")

if torch.cuda.is_available():
    print(f"  GPU: {torch.cuda.get_device_name(0)}")
    print(f"  VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f}GB")
    print(f"  CUDA version: {torch.version.cuda}")

    # Test memory
    x = torch.randn(1000, 1000).cuda()
    print(f"  ✓ GPU memory access OK")
else:
    print("  ⚠️  CUDA not available (CPU training will be very slow)")

print("")
EOF

# ============================================================================
# Summary
# ============================================================================
echo ""
echo "==========================================================================="
echo "✓ PHASE 1 ENVIRONMENT SETUP COMPLETE"
echo "==========================================================================="

cat << 'EOF'

Your training environment is ready!

NEXT STEPS:

1. DOWNLOAD TRAINING DATA (Week 1, Days 1-2)

   Choose data sources:

   Option A: Incompetech (400+ tracks, fastest)
   - Download torrent: https://incompetech.com/music/royalty-free/torrents/
   - Extract to: /home/dwise/musicgen-training/raw/
   - Time: ~30 minutes (depending on internet)

   Option B: Free Music Archive (100+ tracks)
   - Website: https://freemusicarchive.org
   - Download CC-licensed tracks
   - Extract to: /home/dwise/musicgen-training/raw/
   - Time: ~1-2 hours

   Option C: YouTube playlists (100+ tracks)
   - Run: python3 youtube_downloader.py
   - Time: ~2-3 hours

   RECOMMENDED: Start with Options A + B (600+ tracks total)

2. PROCESS TRAINING DATA (Week 1, Days 3-5)

   $ python3 metadata_pipeline.py

   This will:
   - Scan downloaded audio files
   - Resample to 16kHz mono
   - Compute audio features
   - Create metadata JSON
   - Split into train/val/test

   Time: ~1 hour for 500 tracks
   Output: /home/dwise/musicgen-training/processed/

3. START TRAINING (Week 1, Days 6-7)

   $ python3 fine_tune_musicgen_1660.py

   This will:
   - Load fine-tuning dataset
   - Fine-tune MusicGen-medium on your data
   - Save model checkpoints
   - Print training metrics

   Time: ~1-2 hours for 1 epoch on 500 tracks
   VRAM: ~5.5GB peak (1660 Super: 6GB available)

MONITORING:

- Set up free Weights & Biases account: https://wandb.ai
- Run: wandb login
- Training metrics will auto-track

VERIFY YOUR SETUP:

$ python3 -c "import audiocraft; print('✓ audiocraft OK')"
$ python3 -c "import torch; print(f'✓ GPU: {torch.cuda.get_device_name(0)}')"

You're ready to build your music generation engine! 🎵

Questions? Check the scripts for inline documentation.
EOF

echo ""
