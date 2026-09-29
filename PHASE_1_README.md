# Sound Labs Custom Model: Phase 1 - Foundation

**Timeline**: Weeks 1-2  
**Goal**: Prepare training dataset and fine-tuning environment  
**Hardware**: GTX 1660 Super (6GB VRAM) on VPS  
**Data**: 100% free (Creative Commons + public domain)

---

## Overview

Phase 1 builds the foundation for fine-tuning your custom music generation model. You'll collect 500+ training tracks, process them into standardized format, and prepare your GPU environment.

**What you'll have at the end of Phase 1:**
- ✅ 500+ high-quality audio tracks (16kHz mono WAV)
- ✅ Metadata JSON for each track (mood, genre, features)
- ✅ Train/val/test splits (80/10/10)
- ✅ GPU environment optimized for 1660 Super
- ✅ Ready to fine-tune in Phase 2

---

## Timeline Breakdown

### Week 1: Weeks 1-2 (14 Days)

**Days 1-2: Environment Setup + Data Download**
```
Day 1: Monday
  - [ ] SSH to VPS (173.208.147.165)
  - [ ] Run setup_environment.sh
  - [ ] Verify GPU access
  
Day 2: Tuesday
  - [ ] Download Incompetech torrent (400 tracks, ~5GB)
  - [ ] Download FMA samples (100 tracks, ~1GB)
  - [ ] Total: 500 tracks, 6GB, ready to process
```

**Days 3-5: Process Training Data**
```
Days 3-5: Wednesday-Friday
  - [ ] Run metadata_pipeline.py
  - [ ] Process 500 tracks (compute features, resample, etc.)
  - [ ] Create train/val/test splits
  - [ ] Verify output: /home/dwise/musicgen-training/processed/
  - [ ] Total time: ~2-3 hours
```

**Days 6-7: Quick Training Test**
```
Days 6-7: Saturday-Sunday
  - [ ] Run fine_tune_musicgen_1660.py (1 epoch)
  - [ ] Verify training works on your GPU
  - [ ] Generate test sample
  - [ ] Adjust batch size/accumulation if needed
```

### Week 2: Polish + Expand

**Days 8-14: Collect More Data (Optional)**
```
- [ ] Download more CC tracks (aim for 1000 total)
- [ ] Re-run metadata_pipeline.py
- [ ] Larger dataset = better model quality
```

---

## File Structure

```
/home/dwise/musicgen-training/
├── raw/                          # Downloaded audio files (6-15GB)
│   ├── incompetech_*.wav         # 400+ Incompetech tracks
│   ├── fma_*.mp3                 # 100+ FMA tracks
│   └── youtube_*.wav             # YouTube CC tracks (optional)
│
├── processed/                    # Processed 16kHz mono WAV (3-5GB)
│   ├── track_001.wav
│   ├── track_002.wav
│   └── ...
│
└── metadata/                     # Audio features + metadata
    ├── track_001.json            # {"genre": "...", "mood": "...", ...}
    ├── track_002.json
    └── splits/
        ├── train.txt             # 400 track IDs
        ├── val.txt               # 50 track IDs
        └── test.txt              # 50 track IDs
```

---

## Step 1: Environment Setup (30 minutes)

### SSH to VPS
```bash
ssh dwise@173.208.147.165
cd /tmp  # or wherever you want to work
```

### Run Setup Script
```bash
bash setup_environment.sh
```

This will:
- Create `/home/dwise/musicgen-training/` directories
- Install PyTorch with CUDA 11.8 support
- Install audiocraft, librosa, transformers, etc.
- Verify GPU access

### Verify Setup
```bash
python3 -c "import torch; print(torch.cuda.get_device_name(0))"
# Output: NVIDIA GeForce GTX 1660 Super

python3 -c "import audiocraft; print('✓ audiocraft installed')"
# Output: ✓ audiocraft installed
```

---

## Step 2: Download Training Data (1-3 hours)

### Option A: Incompetech (Fastest - Recommended First)

1. Download torrent from: https://incompetech.com/music/royalty-free/torrents/
2. File: `Incompetech_-_Complete_Collection.torrent` (~5GB, 400+ tracks)
3. Extract to: `/home/dwise/musicgen-training/raw/`

**Time**: ~30 minutes (depending on internet speed)
**Quality**: Professional production, CC-0 license
**Tracks**: 400+ diverse genres and moods

### Option B: Free Music Archive (Good Variety)

```bash
# Run the FMA scraper
cd /home/dwise/musicgen-training
python3 fma_scraper.py
```

Or manually:
1. Go to: https://freemusicarchive.org
2. Filter by: License = "CC"
3. Download 50-100 tracks
4. Extract to: `/home/dwise/musicgen-training/raw/`

**Time**: ~1-2 hours (manual download)
**Quality**: Varies (community-contributed)
**Tracks**: 100-200 samples

### Option C: YouTube Playlists (Most Tracks)

```bash
# Download CC music from YouTube channels
cd /home/dwise/musicgen-training
python3 youtube_downloader.py
```

**Time**: ~2-3 hours (depending on playlist size)
**Quality**: Varies
**Tracks**: 100-200 samples

### Recommended: A + B

1. Download Incompetech torrent (400 tracks) → 30 min
2. Download FMA samples (100 tracks) → 1 hour
3. **Total: 500 tracks, ~2 hours**

This gives you a solid dataset with good variety.

---

## Step 3: Process Training Data (1-2 hours)

### Run Metadata Pipeline

```bash
cd /home/dwise/musicgen-training
python3 metadata_pipeline.py
```

This will:
1. **Scan** raw audio files (MP3, WAV, FLAC)
2. **Process** each track:
   - Resample to 16kHz (MusicGen standard)
   - Convert to mono
   - Trim silence
   - Limit to 30 seconds
3. **Compute** audio features:
   - Energy, brightness, timbre
   - Key detection
   - Mood inference (calm/energetic/moderate)
   - Genre classification
4. **Save**:
   - Processed audio: `/processed/track_001.wav`
   - Metadata: `/metadata/track_001.json`
5. **Split**: Train (80%), Val (10%), Test (10%)

### Expected Output

```
[1/500] incompetech_ambient_01.wav... ✓ (28.3s)
[2/500] incompetech_ambient_02.wav... ✓ (25.1s)
...
[500/500] fma_jazz_vocal_100.wav... ✓ (29.8s)

✓ Processed: 500 files
✗ Errors: 2 files
→ Output: /home/dwise/musicgen-training/processed/

Dataset Statistics:
  Total tracks: 498
  Train/Val/Test: 398/50/50
  
Duration: 5.2s - 30.0s (avg: 24.1s)
Energy: 0.05 - 0.85 (avg: 0.35)

Mood Distribution:
  calm: 150
  energetic: 180
  moderate: 168

Genre Distribution:
  melodic: 250
  rhythmic: 180
  bright: 68
```

### Check Progress

```bash
# See processed audio files
ls -lh /home/dwise/musicgen-training/processed/ | head -20
# Should show: track_001.wav, track_002.wav, etc.

# See metadata
cat /home/dwise/musicgen-training/metadata/track_001.json
# Should show: {"track_id": "...", "duration": 28.5, "mood": "calm", ...}

# Check splits
wc -l /home/dwise/musicgen-training/metadata/splits/*.txt
# Should show: 398 train.txt, 50 val.txt, 50 test.txt
```

---

## Step 4: Start Fine-Tuning (2-4 hours)

### Run Training Script

```bash
cd /home/dwise/musicgen-training
python3 fine_tune_musicgen_1660.py
```

### What Happens

```
Configuration:
  Model: facebook/musicgen-medium (2.8B params)
  Device: NVIDIA GeForce GTX 1660 Super
  Batch size: 1 × 4 accumulation
  Learning rate: 5e-5
  Mixed precision: Enabled (fp16)

Loading datasets from /home/dwise/musicgen-training/metadata/splits...
Loaded 398 train samples
Loaded 50 val samples
Train batches: 398
Val batches: 50

Loading model: facebook/musicgen-medium...
✓ Model loaded (2.8B parameters)

======================================================================
TRAINING START
======================================================================

Epoch 1/1
------
[Batch 1/398] Loss: 3.2456
[Batch 50/398] Loss: 3.1234
[Batch 100/398] Loss: 2.9876
...
[Batch 398/398] Loss: 2.5432

Train Loss: 2.7234

✓ Saved checkpoint to /home/dwise/wise2-musicgen-v1/epoch_1

======================================================================
✓ TRAINING COMPLETE
======================================================================

Model saved to: /home/dwise/wise2-musicgen-v1

Next steps:
  1. Test generation: python3 test_generation.py
  2. Deploy to FastAPI server (Phase 3)
  3. Integrate with Sound Labs (Phase 4)
```

### GPU Monitoring (Optional)

In another terminal:
```bash
# Monitor GPU usage
watch -n 1 nvidia-smi

# Should show:
# - Process: fine_tune_musicgen_1660.py
# - Memory: ~5.5GB / 6.0GB
# - GPU Util: 85-95%
```

### Expected Training Time

| Tracks | Epochs | Time (1660 Super) | Notes |
|--------|--------|-------------------|-------|
| 100 | 1 | 10-15 min | Quick test |
| 300 | 1 | 30-40 min | Standard |
| 500 | 1 | 50-70 min | Full dataset |
| 1000 | 1 | 2-3 hours | Extended |

### If You Hit VRAM Errors

1. **Out of Memory**: Reduce batch size or gradient accumulation
   ```python
   # In fine_tune_musicgen_1660.py, adjust:
   batch_size: int = 1  # Already at minimum
   gradient_accumulation_steps: int = 2  # Reduce from 4 to 2
   ```

2. **Model too large**: Use smaller base model
   ```python
   # Change from:
   model = MusicGen.get_pretrained("facebook/musicgen-medium")
   # To:
   model = MusicGen.get_pretrained("facebook/musicgen-small")
   ```

---

## Step 5: Test Your Model

### Generate a Test Sample

```bash
python3 << 'EOF'
from audiocraft import models
import torchaudio

# Load your fine-tuned model
model = models.MusicGen.get_pretrained('/home/dwise/wise2-musicgen-v1/epoch_1')

# Generate music
descriptions = [
    'calm ambient music, peaceful mood',
    'energetic electronic music, rhythmic beat',
    'melodic piano music, contemplative mood',
]

for desc in descriptions:
    print(f"Generating: {desc}")
    wav = model.generate(descriptions=[desc], progress=True, return_tokens=False)
    
    # Save to file
    filename = f"test_{desc.replace(' ', '_')}.wav"
    torchaudio.save(filename, wav[0].cpu(), 16000)
    print(f"  ✓ Saved: {filename}\n")
EOF
```

### Listen to Results

```bash
# Download test files and play locally
scp dwise@173.208.147.165:/home/dwise/test_*.wav .
```

---

## Phase 1 Checklist

**Week 1:**
- [ ] Day 1: SSH + run setup_environment.sh
- [ ] Day 2: Download Incompetech torrent + FMA samples (500 tracks)
- [ ] Days 3-5: Run metadata_pipeline.py (process + split)
- [ ] Days 6-7: Run fine_tune_musicgen_1660.py (1 epoch test)

**Week 2:**
- [ ] Days 8-14: Optional - download more data, retrain

**Success Criteria:**
- ✅ 500+ tracks processed in `/processed/`
- ✅ Training completes without VRAM errors
- ✅ Model checkpoint saved to `/wise2-musicgen-v1/`
- ✅ Can generate test samples

---

## Troubleshooting

### Issue: "No audio files found"
```
✗ Run metadata_pipeline.py → "No audio files found in /raw"
```
**Solution**: Download training data first (Step 2)

### Issue: "Split file not found"
```
✗ Run fine_tune_musicgen_1660.py → FileNotFoundError: /metadata/splits/train.txt
```
**Solution**: Run metadata_pipeline.py first (Step 3)

### Issue: CUDA out of memory
```
✗ RuntimeError: CUDA out of memory. Tried to allocate X.XX GB
```
**Solution**:
1. Reduce gradient_accumulation_steps: 4 → 2
2. Use smaller model: musicgen-medium → musicgen-small
3. Reduce batch size (already at 1, so not possible)

### Issue: "audiocraft" not found
```
✗ ModuleNotFoundError: No module named 'audiocraft'
```
**Solution**: 
```bash
pip install audiocraft
# or
python3 setup_environment.sh
```

### Issue: Slow processing
```
metadata_pipeline.py is taking forever (5+ hours for 500 tracks)
```
**Solution**: 
- This is normal (depends on CPU). Grab coffee ☕
- Typical speed: 1-2 tracks per second
- 500 tracks = 30-60 minutes

---

## Hardware Notes

### GTX 1660 Super Specs
- VRAM: 6GB
- CUDA Cores: 1280
- Memory Bandwidth: 288 GB/s
- Peak FP32: 5.2 TFLOPS

### Optimization Summary
- **Batch size**: 1 (VRAM constraint)
- **Gradient accumulation**: 4x (simulates batch=4)
- **Mixed precision**: fp16 (saves ~40% VRAM)
- **Model**: musicgen-medium (2.8B params, not -large)
- **Peak VRAM**: ~5.5GB / 6.0GB

### Alternative Strategies

**If you want faster training:**
1. Rent GPU for Phase 2: Lambda Labs ($0.50/hour for A100)
2. Use AWS SageMaker: Pay per training hour
3. Local multi-GPU: Add RTX 4090 (~$1500)

**If you want better quality:**
1. Collect more data: 1000+ tracks
2. Train longer: 3-5 epochs (vs. 1)
3. Use finer tuning: Lower learning rate over more epochs

---

## Data Sources Summary

| Source | Tracks | License | Quality | Speed | Size |
|--------|--------|---------|---------|-------|------|
| Incompetech | 400+ | CC-0 | Excellent | 30 min | 5GB |
| Free Music Archive | 100+ | CC-BY/BY-SA | Good | 1-2 hrs | 1GB |
| YouTube CC | 100+ | CC | Variable | 2-3 hrs | 1-2GB |
| Synthetic (MusicGen) | 100+ | Generated | Varies | 1 week | 1GB |

---

## Next: Phase 2

Once Phase 1 is complete, Phase 2 focuses on:
- Training longer (3-5 epochs)
- Larger dataset (1000+ tracks)
- Quality evaluation (Inception Score, user ratings)
- Model versioning and checkpoints

**Estimated time**: Weeks 3-4

---

## Questions?

- **Can I stop training early?** Yes, Ctrl+C anytime. Model saves every 500 batches.
- **How many epochs should I do?** Start with 1 (Week 1), do 3-5 in Phase 2.
- **Can I add more data later?** Yes, re-run metadata_pipeline.py + retrain.
- **How do I monitor training?** Set up wandb.ai (free tier) for real-time charts.

---

**Ready to build your music generation engine?** 🎵

Let's start Phase 1!
