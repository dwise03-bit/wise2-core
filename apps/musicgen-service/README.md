# MusicGen Inference Server

A production-ready microservice for AI music generation using Meta's MusicGen model, with TTS narration and advanced parameter control.

## Features

- **Music Generation**: Text-to-music synthesis using facebook/musicgen-large
- **Multiple Variants**: Generate multiple unique versions of the same prompt
- **Streaming Output**: Stream audio chunks as they're generated for reduced latency
- **Text-to-Speech**: Optional Tacotron2 + HiFi-GAN TTS with narration overlay
- **Advanced Control**:
  - Genre and mood conditioning
  - Tempo, key, and intensity parameters
  - Sampling parameters (temperature, top-k, top-p)
  - Deterministic generation with seed control
- **GPU Acceleration**: FP16 inference for speed and reduced memory usage
- **Batch Processing**: Handle concurrent requests efficiently
- **RESTful API**: Easy integration with Flask endpoints
- **Docker Ready**: Production container with NVIDIA CUDA support

## Architecture

### Core Components

1. **musicgen_server.py** - Flask REST API server
2. **generation_service.py** - Music generation orchestration
3. **voice_synthesis.py** - Text-to-speech implementation
4. **config.py** - Configuration management
5. **utils.py** - Audio processing utilities

### Dependencies

- `transformers` - HuggingFace model loading
- `torch/torchaudio` - PyTorch GPU acceleration
- `flask` - Web framework
- `librosa` - Audio processing
- `numpy/scipy` - Numerical computing

## Installation

### Local Development

1. Clone and navigate to service directory:
```bash
cd apps/musicgen-service
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Copy environment config:
```bash
cp .env.example .env
```

5. Run development server:
```bash
python musicgen_server.py
```

Server starts at `http://localhost:5000`

### Docker Deployment

1. Build image:
```bash
docker build -t musicgen-service:latest .
```

2. Run container (requires NVIDIA Docker):
```bash
docker run -it --gpus all \
  -p 5000:5000 \
  -v $(pwd)/models:/app/models \
  musicgen-service:latest
```

3. Using docker-compose:
```bash
docker-compose up -d
```

## Configuration

Edit `.env` file to customize:

```env
# Server
MUSICGEN_HOST=0.0.0.0
MUSICGEN_PORT=5000
DEBUG=false
GUNICORN_WORKERS=2

# Model
MUSICGEN_MODEL=facebook/musicgen-large
DEVICE=cuda
USE_FP16=true

# Generation
DEFAULT_DURATION=30
MAX_DURATION=120
DEFAULT_TEMPERATURE=1.0
DEFAULT_TOP_K=250

# TTS
ENABLE_TTS=true
```

## API Endpoints

### Health & Status

#### `GET /health`
Simple health check.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00",
  "version": "1.0.0",
  "service": "musicgen-inference"
}
```

#### `GET /status`
Detailed service status with statistics.

**Response:**
```json
{
  "status": "ok",
  "stats": {
    "active_generations": 2,
    "queue_size": 5,
    "cached_results": 15,
    "model_loaded": true,
    "device": "cuda",
    "dtype": "float16"
  },
  "config": { ... }
}
```

### Generation

#### `POST /api/v1/generate`
Generate music from text prompt.

**Request:**
```json
{
  "prompt": "upbeat electronic dance music with heavy bass",
  "duration": 30,
  "genre": "electronic",
  "mood": "energetic",
  "tempo": 120,
  "key": "C",
  "intensity": 0.8,
  "temperature": 1.0,
  "top_k": 250,
  "top_p": 0.0,
  "seed": 42,
  "use_conditioning": true
}
```

**Response:**
```json
{
  "success": true,
  "generation_id": "abc-123-def",
  "prompt": "upbeat electronic dance music with heavy bass",
  "duration": 30,
  "sample_rate": 32000,
  "genre": "electronic",
  "mood": "energetic",
  "conditioning": {
    "genre": "electronic",
    "mood": "energetic",
    "tempo": 120,
    "key": "C",
    "intensity": 0.8
  },
  "timestamp": "2024-01-01T12:00:00",
  "download_url": "/api/v1/download/abc-123-def",
  "audio_size_bytes": 1920000
}
```

#### `POST /api/v1/generate/variants`
Generate multiple variants of the same prompt.

**Request:**
```json
{
  "prompt": "calm ambient music",
  "duration": 30,
  "num_variants": 3
}
```

**Response:**
```json
{
  "success": true,
  "variants": [
    { "generation_id": "id-1", "download_url": "/api/v1/download/id-1" },
    { "generation_id": "id-2", "download_url": "/api/v1/download/id-2" },
    { "generation_id": "id-3", "download_url": "/api/v1/download/id-3" }
  ],
  "prompt": "calm ambient music"
}
```

#### `POST /api/v1/generate/stream`
Stream audio generation in real-time.

**Request:**
```json
{
  "prompt": "upbeat electronic dance music",
  "duration": 30
}
```

**Response:** WAV audio stream (application/octet-stream)

#### `POST /api/v1/generate/with-narration`
Generate music with TTS narration overlay.

**Request:**
```json
{
  "music_prompt": "calm background music",
  "narration_text": "Welcome to our podcast",
  "duration": 30
}
```

**Response:**
```json
{
  "success": true,
  "generation_id": "narration-123",
  "music_prompt": "calm background music",
  "narration_text": "Welcome to our podcast",
  "sample_rate": 32000,
  "download_url": "/api/v1/download/narration-123"
}
```

### Download & Retrieval

#### `GET /api/v1/download/<generation_id>`
Download generated audio file (WAV format).

#### `GET /api/v1/result/<generation_id>`
Get generation result metadata.

### Configuration

#### `GET /api/v1/config/genres`
List supported genres.

**Response:**
```json
{
  "genres": ["ambient", "classical", "electronic", "jazz", "pop", "rock", ...]
}
```

#### `GET /api/v1/config/moods`
List supported moods.

**Response:**
```json
{
  "moods": ["happy", "sad", "energetic", "calm", "dramatic", ...]
}
```

#### `GET /api/v1/config/parameters`
Get generation parameter defaults and ranges.

**Response:**
```json
{
  "duration": {
    "default": 30,
    "min": 1,
    "max": 120
  },
  "temperature": {
    "default": 1.0,
    "min": 0.0,
    "max": 2.0
  },
  "sample_rate": 32000,
  "channels": 1
}
```

### Maintenance

#### `POST /api/v1/cache/clear`
Clear cached results.

**Request:**
```json
{
  "max_age_seconds": 3600
}
```

#### `POST /api/v1/shutdown`
Gracefully shutdown service.

## Usage Examples

### Python Client

```python
import requests

BASE_URL = "http://localhost:5000"

# Generate music
response = requests.post(
    f"{BASE_URL}/api/v1/generate",
    json={
        "prompt": "upbeat electronic music",
        "duration": 30,
        "genre": "electronic",
        "mood": "energetic"
    }
)

result = response.json()
generation_id = result["generation_id"]

# Download audio
audio_response = requests.get(f"{BASE_URL}/api/v1/download/{generation_id}")
with open("music.wav", "wb") as f:
    f.write(audio_response.content)
```

### JavaScript/Node.js

```javascript
const BASE_URL = "http://localhost:5000";

async function generateMusic(prompt) {
  const response = await fetch(`${BASE_URL}/api/v1/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      duration: 30,
      genre: "electronic",
      mood: "energetic"
    })
  });

  const result = await response.json();
  return result.generation_id;
}

async function downloadAudio(generationId) {
  const response = await fetch(
    `${BASE_URL}/api/v1/download/${generationId}`
  );
  const blob = await response.blob();
  return blob;
}
```

### cURL

```bash
# Generate
curl -X POST http://localhost:5000/api/v1/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "upbeat electronic music",
    "duration": 30,
    "genre": "electronic"
  }'

# Download
curl -O http://localhost:5000/api/v1/download/abc-123-def
```

## Performance

### Benchmarks

- **Inference Time**: ~10-30 seconds for 30-second track (depending on prompt complexity)
- **Memory Usage**: ~8-12 GB VRAM (MusicGen-Large with FP16)
- **Throughput**: 2-4 concurrent generations with batch_size=4
- **Latency**: <100ms API response time

### Optimization Tips

1. Use FP16 inference (`USE_FP16=true`)
2. Batch requests when possible
3. Stream responses for large durations
4. Cache results for repeated prompts
5. Use smaller models (musicgen-medium) for faster inference

## Troubleshooting

### CUDA Out of Memory

1. Reduce batch size in config
2. Enable FP16 precision
3. Use smaller model (musicgen-medium)
4. Reduce max_duration setting

### Model Download Issues

1. Set HF_HOME environment variable to model cache directory
2. Manually download models using transformers CLI:
   ```bash
   transformers-cli download facebook/musicgen-large
   ```
3. Check internet connectivity and HuggingFace server status

### Slow Generation

1. Verify GPU is being used (check DEVICE setting)
2. Monitor GPU utilization with `nvidia-smi`
3. Reduce temperature for faster sampling
4. Use smaller model for testing

## Development

### Project Structure

```
musicgen-service/
├── musicgen_server.py       # Flask API server
├── generation_service.py    # Generation orchestration
├── voice_synthesis.py       # TTS implementation
├── config.py               # Configuration
├── utils.py                # Utilities
├── requirements.txt        # Dependencies
├── Dockerfile              # Container config
├── docker-compose.yml      # Compose config
├── .env.example            # Config template
└── README.md              # This file
```

### Testing

```bash
# Check health
curl http://localhost:5000/health

# Generate sample
curl -X POST http://localhost:5000/api/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test music"}'
```

## Integration

### With WISE² Dashboard

```python
# In dashboard backend
from musicgen_service import MusicGenService

service = MusicGenService()
result = service.generate(GenerationRequest(
    prompt="background music for podcast",
    duration=30
))
```

### With Sound Lab

The MusicGen service can provide music generation capabilities for the Sound Lab application, allowing users to generate background tracks and loops.

## Advanced Features

### Voice Cloning

Add speaker embeddings for voice cloning:

```python
synthesizer.add_speaker_embedding(
    "speaker_1",
    "audio_sample.wav"
)

audio, sr = synthesizer.clone_voice(
    "Hello world",
    speaker_id="speaker_1"
)
```

### Batch Processing

```python
requests = [
    GenerationRequest(prompt="sad piano music"),
    GenerationRequest(prompt="upbeat dance music"),
    GenerationRequest(prompt="ambient soundscape")
]

results = [service.generate(req) for req in requests]
```

## License

WISE² Platform (Proprietary)

## Support

For issues or questions:
- Create GitHub issue in wise2-core repo
- Contact: dwise03@gmail.com

## Changelog

### v1.0.0 (2024-01-01)
- Initial release
- MusicGen model integration
- TTS narration support
- RESTful API with full streaming
- Docker containerization
- Production-ready configuration

---

**Built as part of WISE² Genesis - AI-Native Business Operating System**
