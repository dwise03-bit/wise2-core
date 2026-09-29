# Voice Synthesis Service - WISE² Genesis

Production-grade voice synthesis engine with TTS, singing synthesis, and voice cloning capabilities.

## Features

### 1. Text-to-Speech (TTS)
- **Tacotron2 text encoder** → acoustic features
- **HiFi-GAN vocoder** → high-quality audio waveform
- **Emotion conditioning** (neutral, happy, sad, angry)
- **Multi-speaker support** via speaker embeddings
- **Batch inference** for multiple texts

### 2. Singing Synthesis
- **Melody-driven synthesis** (MIDI or frequency curves)
- **Forced alignment** (lyrics → melody timing)
- **Pitch contour generation** from melody
- **Vibrato & portamento** for natural singing
- **Duration stretching** to match melody

### 3. Voice Cloning
- **Speaker embedding extraction** from audio samples
- **Voice cloning** from 1-30 second samples
- **Quality scaling** (1 sample → okay, 10+ samples → excellent)
- **Speaker similarity search**
- **Voice profile management**

### 4. Voice Parameters
- **Pitch shifting** (±24 semitones)
- **Vibrato** (0-100% amount, 4-10 Hz rate)
- **Breathiness** (0-100%, affects phoneme clarity)
- **Speed control** (0.5x - 2.0x)
- **Formant shifting** (gender-like effect)
- **Vocal character presets** (breathy, raspy, clear, warm, powerful, soft)
- **3-band EQ** (bass, mid, treble)
- **Reverb** and **intensity** control

## Architecture

```
┌─────────────────────────────────────────────────┐
│          Voice Synthesis API (Flask)             │
├─────────────────────────────────────────────────┤
│  /synthesize  /sing  /clone-voice  /speakers    │
│  /apply-parameters  /presets  /health           │
└─────────────────────────────────────────────────┘
            │              │              │
     ┌──────▼──────┐  ┌───▼────┐  ┌──────▼──────┐
     │ VoiceEngine │  │Singing  │  │ VoiceCloner│
     │  (TTS)      │  │Synth    │  │  (Embeddings)
     └──────┬──────┘  └───┬────┘  └──────┬──────┘
            │             │              │
     ┌──────▼──────────────▼──────────────▼─────┐
     │      VoiceParameterProcessor             │
     │ (Pitch, Vibrato, Breathiness, EQ, etc.)  │
     └──────┬───────────────────────────────────┘
            │
     ┌──────▼──────────────────────────────────┐
     │        Waveform Output (.wav)            │
     └───────────────────────────────────────────┘
```

## Installation

### Prerequisites
- Python 3.11+
- PyTorch 2.1+
- librosa, scipy, numpy
- Docker (optional)

### Setup

**Option 1: Local Installation**

```bash
cd apps/voice-synthesis-service
pip install -r requirements.txt
```

**Option 2: Docker**

```bash
docker-compose up -d
```

## Usage

### 1. Text-to-Speech

```python
from src.voice_engine import VoiceEngine

engine = VoiceEngine()

# Simple synthesis
waveform, sr = engine.synthesize(
    text="Hello, this is WISE²",
    emotion="happy",
    speed=1.0
)
engine.save_audio(waveform, "output.wav")
```

**API Endpoint:**
```bash
curl -X POST http://localhost:5000/synthesize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello world",
    "speaker_id": "default",
    "emotion": "neutral",
    "speed": 1.0
  }' \
  -o output.wav
```

### 2. Singing Synthesis

```python
from src.singing_synthesis import SingSynthesizer, Melody, Note

synthesizer = SingSynthesizer(engine)

# Create melody
notes = [
    Note.from_midi(60, 0.5, 0.0),  # C4, 0.5s
    Note.from_midi(62, 0.5, 0.5),  # D4, 0.5s
    Note.from_midi(64, 1.0, 1.0),  # E4, 1.0s
]
melody = Melody(notes)

# Synthesize
waveform, sr = synthesizer.synthesize_singing(
    lyrics="I love WISE²",
    melody=melody,
    vibrato_amount=30.0,
    vibrato_rate=5.0
)
synthesizer.save_singing(waveform, "singing.wav")
```

**API Endpoint:**
```bash
curl -X POST http://localhost:5000/sing \
  -H "Content-Type: application/json" \
  -d '{
    "lyrics": "I love WISE²",
    "melody": [
      {"pitch": 60, "duration": 0.5, "start_time": 0.0},
      {"pitch": 62, "duration": 0.5, "start_time": 0.5}
    ],
    "speaker_id": "default",
    "vibrato_amount": 30.0,
    "vibrato_rate": 5.0
  }' \
  -o singing.wav
```

### 3. Voice Cloning

```python
from src.voice_cloning import VoiceCloner

cloner = VoiceCloner()

# Create speaker profile
profile = cloner.create_speaker_profile(
    speaker_id="john_doe",
    audio_files=[
        "sample1.wav",
        "sample2.wav",
        "sample3.wav"
    ],
    name="John Doe",
    gender="male"
)

# Check quality
print(f"Profile quality: {profile.quality_score:.2f}")
```

**API Endpoint:**
```bash
curl -X POST http://localhost:5000/clone-voice \
  -F "speaker_id=john_doe" \
  -F "name=John Doe" \
  -F "gender=male" \
  -F "audio_files=@sample1.wav" \
  -F "audio_files=@sample2.wav" \
  -F "audio_files=@sample3.wav"
```

### 4. Voice Parameters

```python
from src.voice_parameters import VoiceParameterProcessor, VoiceParameters

processor = VoiceParameterProcessor()

# Create parameter configuration
params = VoiceParameters(
    pitch_shift=5.0,           # 5 semitones higher
    vibrato_amount=50.0,       # 50% vibrato
    breathiness=30.0,          # 30% breathiness
    speed=1.1,                 # 10% faster
    vocal_character="warm"
)

# Apply to waveform
processed = processor.apply_all_parameters(waveform, params)
```

**API Endpoint:**
```bash
curl -X POST http://localhost:5000/apply-parameters \
  -H "Content-Type: application/json" \
  -d '{
    "audio_source": "speaker_id",
    "pitch_shift": 5.0,
    "vibrato_amount": 50.0,
    "breathiness": 30.0,
    "speed": 1.1,
    "eq_bass": 3.0,
    "eq_treble": 2.0
  }' \
  -o processed.wav
```

## API Reference

### Endpoints

#### Health Check
```
GET /health
```
Returns service status and enabled features.

#### Text-to-Speech
```
POST /synthesize
Content-Type: application/json

{
  "text": string,
  "speaker_id": string (optional, default: "default"),
  "emotion": string (optional, default: "neutral"),
  "speed": float (optional, default: 1.0),
  "pitch_shift": float (optional)
}
```

#### Singing Synthesis
```
POST /sing
Content-Type: application/json

{
  "lyrics": string,
  "melody": [
    {
      "pitch": int (MIDI note 0-127),
      "duration": float (seconds),
      "start_time": float (seconds)
    }
  ],
  "speaker_id": string (optional),
  "vibrato_amount": float (0-100),
  "vibrato_rate": float (4-10),
  "portamento_time": float (seconds)
}
```

#### Voice Cloning
```
POST /clone-voice
Content-Type: multipart/form-data

speaker_id: string
name: string (optional)
gender: string (optional: male/female/other)
age_group: string (optional)
audio_files: file[] (1-30 second audio samples)
```

#### List Speakers
```
GET /speakers
```
Returns list of available speaker profiles.

#### Get Speaker Details
```
GET /speaker/<speaker_id>
```
Returns speaker profile with statistics.

#### Delete Speaker
```
DELETE /speaker/<speaker_id>
```

#### Apply Voice Parameters
```
POST /apply-parameters
Content-Type: application/json

{
  "audio_source": string,
  "pitch_shift": float (-24 to +24),
  "vibrato_amount": float (0-100),
  "vibrato_rate": float (4-10),
  "breathiness": float (0-100),
  "speed": float (0.5-2.0),
  "formant_shift": float (-0.5 to +0.5),
  "intensity": float (0-2),
  "reverb_amount": float (0-1),
  "eq_bass": float (-12 to +12),
  "eq_mid": float (-12 to +12),
  "eq_treble": float (-12 to +12)
}
```

#### Get Presets
```
GET /presets
```
Returns available vocal character presets.

### Response Format

Successful responses return audio as `.wav` file or JSON:
```json
{
  "success": true,
  "speaker_id": "john_doe",
  "num_samples": 3,
  "quality_score": 0.85
}
```

Error responses:
```json
{
  "error": "Error message"
}
```

## Configuration

Edit `config/default.yaml` to customize:

```yaml
# Device: cpu or cuda
device: cpu

# API port
api_port: 5000

# Audio settings
audio:
  sample_rate: 22050
  n_mels: 80

# Model settings
model:
  encoder_hidden_dim: 512
  decoder_hidden_dim: 1024
  speaker_embed_dim: 256

# Feature flags
enable_voice_cloning: true
enable_singing: true
enable_emotion: true
enable_cache: true
```

## Performance

### Latency
- **TTS**: ~2-3s per utterance (CPU), <1s (GPU)
- **Singing**: ~5-10s per song (CPU)
- **Voice cloning**: ~1-2s per sample
- **Parameter application**: <1s

### Quality
- **Sample rate**: 22,050 Hz (industry standard for TTS)
- **Bit depth**: 16-bit PCM
- **Vocoder**: HiFi-GAN (state-of-the-art MOS scores)

### Voice Cloning
- **Quality scaling**:
  - 1 sample: OK (similarity ~0.70)
  - 3-5 samples: Good (similarity ~0.80)
  - 10+ samples: Excellent (similarity >0.90)

## Deployment

### Docker Deployment

```bash
# Build and run
docker-compose up -d

# Check logs
docker-compose logs -f voice-synthesis

# Stop service
docker-compose down
```

### Kubernetes (Production)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: voice-synthesis
spec:
  replicas: 3
  selector:
    matchLabels:
      app: voice-synthesis
  template:
    metadata:
      labels:
        app: voice-synthesis
    spec:
      containers:
      - name: voice-synthesis
        image: wise2/voice-synthesis:latest
        ports:
        - containerPort: 5000
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
```

## Training

To fine-tune models:

```python
from src.voice_engine import VoiceEngine, Tacotron2Encoder, Tacotron2Decoder
import torch
import torch.optim as optim

# Initialize models
encoder = Tacotron2Encoder(vocab_size=50, hidden_dim=512)
decoder = Tacotron2Decoder(hidden_dim=1024, mel_dim=80)

# Setup training
optimizer = optim.Adam(
    list(encoder.parameters()) + list(decoder.parameters()),
    lr=1e-3
)

# Training loop
for epoch in range(config.training.epochs):
    for batch in dataloader:
        phoneme_indices, mel_spectrograms = batch
        
        # Forward pass
        encoder_outputs = encoder(phoneme_indices)
        mel_outputs, _, _ = decoder(encoder_outputs)
        
        # Compute loss
        loss = F.mse_loss(mel_outputs, mel_spectrograms)
        
        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
```

## Troubleshooting

### GPU Not Detected
```python
from src.config import config
print(config.device)  # Check device
config.device = "cuda"  # Force CUDA
```

### Poor Voice Cloning Quality
- Use 5-10 audio samples (minimum 3s total)
- Ensure clean audio without background noise
- Use same speaker for all samples

### Synthesis Too Slow
- Use GPU (CUDA)
- Reduce mel-spectrogram resolution
- Use batch processing

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

Proprietary - WISE² Genesis Platform

## Support

- Documentation: `/docs/`
- Issues: GitHub Issues
- Email: dwise03@gmail.com
