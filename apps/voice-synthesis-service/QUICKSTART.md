# Quick Start Guide - Voice Synthesis Service

## 5-Minute Setup

### 1. Install Dependencies

```bash
cd apps/voice-synthesis-service
pip install -r requirements.txt
```

### 2. Start the API Server

```bash
python -m src.api
```

Server will start at `http://localhost:5000`

### 3. Test with cURL

**Health Check:**
```bash
curl http://localhost:5000/health
```

**Text-to-Speech:**
```bash
curl -X POST http://localhost:5000/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world"}' \
  -o output.wav
```

**List Speakers:**
```bash
curl http://localhost:5000/speakers
```

## Docker Setup (1 minute)

```bash
# Build and run
docker-compose up -d

# Check logs
docker-compose logs -f voice-synthesis

# Stop
docker-compose down
```

## Python Examples

### Text-to-Speech
```python
from src.voice_engine import VoiceEngine

engine = VoiceEngine()
waveform, sr = engine.synthesize("Hello WISE²", emotion="happy")
engine.save_audio(waveform, "output.wav")
```

### Singing
```python
from src.singing_synthesis import SingSynthesizer, Melody, Note

synth = SingSynthesizer(engine)
notes = [
    Note.from_midi(60, 0.5, 0.0),
    Note.from_midi(62, 0.5, 0.5),
]
melody = Melody(notes)

waveform, sr = synth.synthesize_singing("I love WISE²", melody)
synth.save_singing(waveform, "singing.wav")
```

### Voice Cloning
```python
from src.voice_cloning import VoiceCloner

cloner = VoiceCloner()
profile = cloner.create_speaker_profile(
    speaker_id="john",
    audio_files=["sample1.wav", "sample2.wav"]
)
print(f"Quality: {profile.quality_score:.2f}")
```

### Voice Parameters
```python
from src.voice_parameters import VoiceParameterProcessor, VoiceParameters

processor = VoiceParameterProcessor()
params = VoiceParameters(pitch_shift=5.0, vibrato_amount=30.0)
processed = processor.apply_all_parameters(waveform, params)
```

## Common Tasks

### Create a Speaker Profile

```bash
# Prepare 3-10 audio samples (3-30 seconds each)
# Then:

curl -X POST http://localhost:5000/clone-voice \
  -F "speaker_id=alice" \
  -F "name=Alice" \
  -F "gender=female" \
  -F "audio_files=@alice1.wav" \
  -F "audio_files=@alice2.wav" \
  -F "audio_files=@alice3.wav"
```

### Synthesize with Different Emotions

```bash
for emotion in neutral happy sad angry; do
  curl -X POST http://localhost:5000/synthesize \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"Hello world\", \"emotion\": \"$emotion\"}" \
    -o output_${emotion}.wav
done
```

### Apply Voice Effects

```bash
curl -X POST http://localhost:5000/apply-parameters \
  -H "Content-Type: application/json" \
  -d '{
    "audio_source": "speaker_id",
    "pitch_shift": 7.0,
    "vibrato_amount": 50.0,
    "breathiness": 30.0,
    "speed": 1.1
  }' \
  -o modified.wav
```

### Get Available Presets

```bash
curl http://localhost:5000/presets | jq
```

Output:
```json
{
  "presets": {
    "breathy": { "breathiness": 80, ... },
    "raspy": { "breathiness": 50, ... },
    "clear": { "breathiness": 10, ... },
    "warm": { "formant_shift": -2, ... },
    "powerful": { "intensity": 1.3, ... },
    "soft": { "speed": 0.9, ... }
  }
}
```

## Configuration

Edit `config/default.yaml` or `.env`:

```yaml
# Device
device: cpu  # or 'cuda'

# API
api_port: 5000
api_host: 0.0.0.0

# Audio
sample_rate: 22050
n_mels: 80

# Features
enable_voice_cloning: true
enable_singing: true
enable_emotion: true
enable_cache: true
```

## Troubleshooting

### API won't start
```bash
# Check port is free
lsof -i :5000

# Check dependencies
python -c "import torch; print(torch.__version__)"
```

### CUDA not detected
```python
import torch
print(torch.cuda.is_available())  # Should be True
print(torch.cuda.get_device_name(0))  # GPU name
```

### Audio quality issues
- Check sample rate (should be 22050 Hz)
- Normalize input audio to -1.0 to 1.0
- Use at least 5 samples for voice cloning

### Memory issues
- Reduce batch size in config
- Use CPU instead of GPU
- Reduce model hidden dimensions

## Next Steps

1. **Read full docs**: See `README.md`
2. **Explore examples**: Run `python examples.py`
3. **Check architecture**: See `ARCHITECTURE.md`
4. **Run tests**: `pytest tests/`
5. **Deploy**: Use `docker-compose` or Kubernetes manifests

## API Endpoints Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Health check |
| POST | `/synthesize` | Text-to-speech |
| POST | `/sing` | Singing synthesis |
| POST | `/clone-voice` | Create speaker profile |
| GET | `/speakers` | List speakers |
| GET | `/speaker/<id>` | Get speaker details |
| DELETE | `/speaker/<id>` | Delete speaker |
| POST | `/apply-parameters` | Apply voice effects |
| GET | `/presets` | Get vocal presets |
| GET | `/status` | Service status |

## Performance Benchmarks

| Operation | CPU | GPU |
|-----------|-----|-----|
| TTS (10s text) | 2-3s | <1s |
| Singing (30s) | 5-10s | <3s |
| Voice clone (5 samples) | 5-10s | <3s |
| Parameter application | <1s | <500ms |

## Support

- **Issues**: Create GitHub issue
- **Questions**: Email dwise03@gmail.com
- **Docs**: See README.md and ARCHITECTURE.md

---

**Ready to synthesize?** 🎤🎵
