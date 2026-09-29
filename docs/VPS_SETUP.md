# Knight Wing Viral Ad - GPU Video Generation

Since this cloud environment lacks GPU access and Python video libraries, we'll generate the video on your VPS (173.208.147.165) which has GPU capability.

## Option 1: Quick Setup (Recommended)

### Step 1: SSH to VPS
```bash
ssh dwise@173.208.147.165
```

### Step 2: Install dependencies
```bash
# Check GPU availability
nvidia-smi

# Install Python video libraries
pip3 install opencv-python pillow numpy

# Verify ffmpeg
ffmpeg -version
```

### Step 3: Download and run generation script
```bash
# Copy the script to VPS
scp /tmp/claude-0/-home-user-wise2-core/dd390cab-e378-5f7f-b980-b1b8f857abb1/scratchpad/generate-video-simple.py dwise@173.208.147.165:/tmp/

# Run on VPS
ssh dwise@173.208.147.165 'python3 /tmp/generate-video-simple.py /tmp/knight_wing_30s.mp4'

# Download result
scp dwise@173.208.147.165:/tmp/knight_wing_30s.mp4 ./knight_wing_30s.mp4
```

**Result**: ~20-50 MB MP4 video, 30 seconds, 1080x1080, professional quality

---

## Option 2: Docker Container (GPU-optimized)

### On VPS:
```bash
# Build container
docker build -f Dockerfile.video -t knight-wing-video .

# Run with GPU
docker run --gpus all \
  -v /tmp:/app/output \
  knight-wing-video \
  /app/output/knight_wing_30s.mp4
```

---

## Option 3: Advanced AI Models (Uses free open-source)

For higher quality with AI-generated effects:

```bash
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip3 install diffusers transformers accelerate

# Run GPU-accelerated generation
python3 generate-video-gpu.py /tmp/knight_wing_30s.mp4
```

**Inference time**: 
- Simple (Option 1): ~30-60 seconds on GPU
- Advanced (Option 3): ~5-10 minutes on GPU (much higher quality)

---

## Output

All options produce:
- **Format**: MP4 (h264 codec, ffmpeg-compatible)
- **Resolution**: 1080x1080 (Facebook viral square)
- **Duration**: 30 seconds @ 30 fps
- **Size**: 15-50 MB depending on quality
- **Animation**: 4-phase sequence (headlight pulse → dashboard glow → operator focus → logo reveal)

---

## Post-Generation

Once video is generated on VPS:

```bash
# Upload to Discord via API
curl -X POST \
  -F "file=@knight_wing_30s.mp4" \
  -H "Content-Type: multipart/form-data" \
  https://discord.com/api/v10/webhooks/{WEBHOOK_ID}/{WEBHOOK_TOKEN}
```

Or use Hermes image service with video extension (not yet implemented).

---

## Troubleshooting

**GPU not detected**:
- Verify: `nvidia-smi`
- Update drivers: `apt-get install nvidia-driver-535` (or latest)

**ffmpeg missing**:
```bash
apt-get install ffmpeg
```

**Python module errors**:
```bash
pip3 install --upgrade opencv-python pillow numpy
```

**Low disk space**:
```bash
du -sh /tmp  # Check space
# Video needs ~1-2GB temp space for frames + final MP4
```
