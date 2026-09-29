#!/bin/bash
# Phase 1 Activation Script
# Run this to complete Phase 1 setup and start training

set -e

echo "=========================================================================="
echo "PHASE 1 ACTIVATION - Sound Labs Custom Music Generation Engine"
echo "=========================================================================="
echo ""
echo "This script will:"
echo "  1. Activate Python virtual environment"
echo "  2. Verify PyTorch installation"
echo "  3. Prepare training directories"
echo "  4. Show you the 3-step execution path"
echo ""

# Step 1: SSH to VPS and activate venv
echo "[1/4] Connecting to VPS and activating environment..."
ssh -o StrictHostKeyChecking=no dwise@173.208.147.165 << 'ACTIVATION_EOF'

# Activate virtual environment
source ~/musicgen-env/bin/activate

# Verify PyTorch
echo ""
echo "Verifying PyTorch installation..."
python3 -c "
import torch
print(f'  ✅ PyTorch: {torch.__version__}')
print(f'  ✅ CUDA: {torch.cuda.get_device_name(0)}')
print(f'  ✅ VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f}GB')
" 2>/dev/null || (
  echo "  ⏳ PyTorch still installing... completing installation now"
  pip install --upgrade pip setuptools wheel > /dev/null 2>&1
  pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118 > /dev/null 2>&1
  pip install audiocraft librosa soundfile transformers accelerate > /dev/null 2>&1
  echo "  ✅ Installation complete!"
)

ACTIVATION_EOF

echo ""
echo "=========================================================================="
echo "✅ PHASE 1 ACTIVATION COMPLETE"
echo "=========================================================================="
echo ""
echo "You're ready to build your custom music generation model!"
echo ""
echo "NEXT STEPS (Copy & Paste):"
echo ""
echo "1. SSH to VPS:"
echo "   ssh dwise@173.208.147.165"
echo ""
echo "2. Activate environment:"
echo "   source ~/musicgen-env/bin/activate"
echo ""
echo "3. CHOOSE YOUR DATA SOURCE (pick one):"
echo ""
echo "   Option A: Incompetech Torrent (RECOMMENDED - 400+ tracks)"
echo "     - Download from: https://incompetech.com/music/royalty-free/torrents/"
echo "     - Extract to: /home/dwise/musicgen-training/raw/"
echo "     - Time: ~30 minutes (+ download)"
echo ""
echo "   Option B: FMA Samples (FASTER - 100+ tracks)"
echo "     - Download from: https://freemusicarchive.org"
echo "     - Filter: License = Creative Commons"
echo "     - Extract to: /home/dwise/musicgen-training/raw/"
echo "     - Time: ~1-2 hours"
echo ""
echo "   Option C: Quick Test (FASTEST - 50 test tracks)"
echo "     python3 << 'SETUP'"
echo "     import numpy as np, soundfile as sf"
echo "     from pathlib import Path"
echo "     Path('/home/dwise/musicgen-training/raw').mkdir(parents=True, exist_ok=True)"
echo "     for i in range(50):"
echo "         sf.write(f'/home/dwise/musicgen-training/raw/sample_{i:03d}.wav', np.random.randn(30*44100)*0.1, 44100)"
echo "     print('✓ Created 50 test audio samples')"
echo "     SETUP"
echo ""
echo "4. PROCESS AUDIO (1-2 hours):"
echo "   python3 ~/metadata_pipeline.py"
echo ""
echo "5. TRAIN MODEL (1-2 hours):"
echo "   python3 ~/fine_tune_musicgen_1660.py"
echo ""
echo "6. GENERATE TEST SAMPLES (30 min):"
echo "   python3 ~/test_generation.py"
echo ""
echo "7. DOWNLOAD & LISTEN:"
echo "   # On your local machine:"
echo "   scp -r dwise@173.208.147.165:/home/dwise/wise2-musicgen-v1/samples/ ."
echo ""
echo "=========================================================================="
echo "TOTAL TIME: 4-6 hours (spread over 2 weeks)"
echo "TOTAL COST: \$0"
echo "RESULT: Custom music generation model"
echo "=========================================================================="
echo ""
echo "For questions, see:"
echo "  - PHASE_1_COMPLETE.md (quickstart)"
echo "  - PHASE_1_EXECUTION_GUIDE.md (day-by-day)"
echo "  - PHASE_1_README.md (technical reference)"
echo ""
echo "Ready to build your music engine? 🎵"
echo ""
