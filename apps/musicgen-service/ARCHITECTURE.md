# MusicGen Inference Server - Architecture

## Overview

The MusicGen Inference Server is a production-grade Python microservice providing AI music generation capabilities via REST API. It's designed to integrate seamlessly with the WISE² platform and provide scalable, high-performance music generation for various applications.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Applications                   │
│        (Dashboard, Studio, Sound Lab, Website)           │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST
                     ▼
┌─────────────────────────────────────────────────────────┐
│         MusicGen Flask API Server                        │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Route Handlers                                    │ │
│  │  - /api/v1/generate                               │ │
│  │  - /api/v1/generate/variants                      │ │
│  │  - /api/v1/generate/stream                        │ │
│  │  - /api/v1/download/{id}                          │ │
│  └────────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴───────────┐
        ▼                        ▼
┌──────────────────────┐  ┌──────────────────────┐
│ Generation Service   │  │ Voice Synthesizer    │
│  - MusicGen Model    │  │  - Tacotron2         │
│  - Model Loading     │  │  - HiFi-GAN          │
│  - Inference Logic   │  │  - TTS Processing    │
│  - Result Caching    │  │  - Voice Cloning     │
└──────────────────────┘  └──────────────────────┘
        │                        │
        │      ┌────────────────┘
        │      │
        ▼      ▼
┌──────────────────────────────────────┐
│   Audio Processing Utilities         │
│  - Audio I/O (librosa, torchaudio)  │
│  - Normalization & Mixing            │
│  - Audio Buffering & Streaming       │
└──────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│   PyTorch GPU Runtime                │
│  - CUDA Acceleration                 │
│  - FP16 Optimization                 │
│  - Memory Management                 │
└──────────────────────────────────────┘
```

## Component Architecture

### 1. Flask Application Layer (`musicgen_server.py`)

**Responsibilities:**
- HTTP request/response handling
- Route management
- Request validation
- Error handling
- CORS and security headers
- Health check and status endpoints

**Key Endpoints:**
- REST API for generation, download, configuration
- Health monitoring
- Cache management
- Service lifecycle

**Design Pattern:** Request → Validation → Service Call → Response

### 2. Generation Service (`generation_service.py`)

**Responsibilities:**
- Core music generation logic
- Model lifecycle management
- Request queuing and concurrency
- Result caching
- Parameter processing

**Key Classes:**
- `GenerationRequest` - Input parameters dataclass
- `GenerationResult` - Output result with metadata
- `MusicGenService` - Main orchestration class

**Features:**
- Lazy model loading (loads only when needed)
- Result caching for repeated prompts
- Concurrent generation handling
- Multiple variant generation
- Streaming output support

**Generation Flow:**
```
Request Validation
  ↓
Model Loading (cached)
  ↓
Input Preprocessing
  ↓
Inference (MusicGen)
  ↓
Audio Normalization
  ↓
Result Caching
  ↓
Return to Client
```

### 3. Voice Synthesis Module (`voice_synthesis.py`)

**Responsibilities:**
- Text-to-speech synthesis
- Voice cloning support
- Emotion control
- Multi-language processing
- Tacotron2 + HiFi-GAN pipeline

**Key Classes:**
- `VoiceSynthesizer` - Main TTS class

**Features:**
- Emotion controls: happy, sad, angry, neutral
- Pitch and speed scaling
- Speaker embedding extraction
- Voice cloning from audio samples
- Fallback implementations for model unavailability

**TTS Pipeline:**
```
Text Input
  ↓
Tokenization
  ↓
Mel-Spectrogram Generation (Tacotron2)
  ↓
Emotion Conditioning
  ↓
Pitch/Speed Modification
  ↓
Vocoding (HiFi-GAN)
  ↓
Audio Output
```

### 4. Configuration Management (`config.py`)

**Responsibilities:**
- Environment variable loading
- Parameter validation
- Model path management
- Default value management

**Key Features:**
- Pydantic-based validation
- Type-safe configuration
- Validation helpers for common parameters
- Cache directory management

**Configuration Sources:**
1. Environment variables (`.env` file)
2. System environment
3. Hardcoded defaults

### 5. Utilities Module (`utils.py`)

**Responsibilities:**
- Audio I/O operations
- Audio processing utilities
- Audio buffering for streaming
- Logging setup
- Parameter validation

**Key Classes:**
- `AudioBuffer` - Efficient streaming audio buffer

**Functions:**
- Audio loading/saving (librosa, torchaudio)
- Audio normalization
- Format conversion (numpy ↔ bytes)
- Concatenation and padding
- Conditioning vector creation

## Data Flow

### Generation Request Flow

```
1. Client sends JSON request
   ↓
2. Flask route handler validates JSON
   ↓
3. GenerationRequest object created
   ↓
4. Parameter validation
   ↓
5. MusicGenService.generate() called
   ↓
6. Model loading (if needed)
   ↓
7. Input preprocessing
   ↓
8. Inference execution
   ↓
9. Audio postprocessing
   ↓
10. Result caching
    ↓
11. Response JSON with metadata
```

### Streaming Generation Flow

```
1. Client sends streaming request
   ↓
2. AudioBuffer initialized
   ↓
3. Inference starts
   ↓
4. Audio chunks buffered
   ↓
5. Iterator yields chunks every N ms
   ↓
6. Chunks streamed to client
   ↓
7. Connection remains open until complete
```

## Technology Stack

### Core Libraries

| Component | Library | Purpose |
|-----------|---------|---------|
| Model Loading | transformers | HuggingFace model loading |
| Deep Learning | torch/torchaudio | GPU acceleration, audio operations |
| Web Framework | flask | HTTP server, routing |
| Audio Processing | librosa | Audio I/O, analysis |
| Utilities | numpy, scipy | Numerical computing |

### Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Containerization | Docker | Reproducible deployment |
| Container Runtime | NVIDIA CUDA 12.1 | GPU support |
| Web Server | Gunicorn | Production WSGI server |
| Orchestration | Docker Compose | Multi-container deployment |

## Performance Characteristics

### Model Performance

| Metric | Value |
|--------|-------|
| Model Size | ~3.5 GB (MusicGen-Large) |
| Memory Usage | 8-12 GB VRAM |
| Inference Time | 10-30s per 30s track |
| Throughput | 2-4 concurrent generations |
| API Response Latency | <100ms |

### Optimization Strategies

1. **FP16 Precision** - Reduces memory, increases speed
2. **Model Caching** - Lazy load and keep in memory
3. **Result Caching** - Reuse results for identical prompts
4. **Batch Processing** - Process multiple requests together
5. **Streaming** - Return chunks as generated
6. **GPU Memory Management** - Careful allocation and cleanup

## Error Handling

### Error Categories

1. **Validation Errors** (400)
   - Invalid JSON
   - Missing required parameters
   - Out-of-range values

2. **Model Errors** (500)
   - Model loading failures
   - GPU out of memory
   - Inference timeouts

3. **Generation Errors** (500)
   - Text processing errors
   - Audio processing errors
   - Cache write errors

4. **Resource Errors** (503)
   - Queue full
   - Model not loaded
   - Memory exhausted

### Error Recovery

- Fallback models when primary unavailable
- Graceful degradation (return cached results)
- Request queuing for transient errors
- Automatic retry with exponential backoff

## Integration Points

### With WISE² Dashboard

```
Dashboard UI
  ↓
Music Generation Widget
  ↓
API Call to /api/v1/generate
  ↓
Receive generation_id
  ↓
Poll /api/v1/result/{id} for status
  ↓
Download via /api/v1/download/{id}
```

### With Sound Lab

```
Sound Lab Audio Project
  ↓
Background Music Generator
  ↓
/api/v1/generate request
  ↓
Receive audio stream
  ↓
Import to timeline
```

### With Website

```
Website Landing Page
  ↓
"Generate Music" Action
  ↓
Client-side /api/v1/generate
  ↓
Stream chunks to player
  ↓
Display waveform
```

## Deployment Architecture

### Development

```
Local Machine
  ├─ Python virtual environment
  ├─ Flask dev server (http://localhost:5000)
  ├─ Models cached locally
  └─ No GPU required (fallbacks available)
```

### Production

```
Docker Container
  ├─ NVIDIA CUDA runtime
  ├─ Gunicorn (2-4 workers)
  ├─ NVIDIA GPU (Tesla T4 or better)
  ├─ Volume mounts:
  │  ├─ Models cache
  │  ├─ Application logs
  │  └─ Cache storage
  └─ Health checks enabled
```

### Scaling Strategy

1. **Horizontal Scaling**
   - Multiple service instances
   - Load balancer (nginx)
   - Shared model cache (NFS or S3)

2. **Vertical Scaling**
   - Larger GPU (V100, A100)
   - More CPU workers
   - Increased memory allocation

3. **Queue-Based Scaling**
   - RabbitMQ for job queue
   - Celery workers for async processing
   - Result storage in Redis/database

## Security Considerations

1. **Input Validation**
   - Length limits on text prompts
   - Parameter range enforcement
   - Type validation with Pydantic

2. **Rate Limiting**
   - Queue-based throttling
   - Max concurrent generations
   - Timeout enforcement

3. **Resource Protection**
   - Max model size limits
   - Memory usage monitoring
   - CPU usage throttling

4. **API Security**
   - CORS headers
   - No sensitive data in URLs
   - Request logging
   - Error message sanitization

## Monitoring & Observability

### Metrics to Track

```
- Active generations (counter)
- Generation latency (histogram)
- Queue depth (gauge)
- Cache hit rate (percentage)
- Model load time (histogram)
- Error rate (counter)
- Memory usage (gauge)
- GPU utilization (gauge)
```

### Logging

```
musicgen_server.py
  ├─ Route access logs
  ├─ Error logs with tracebacks
  └─ Performance metrics

generation_service.py
  ├─ Model loading logs
  ├─ Generation progress
  └─ Cache statistics

voice_synthesis.py
  ├─ TTS model loading
  └─ Synthesis operations
```

### Health Checks

```
GET /health
  ├─ Simple liveness check
  └─ Returns 200 if running

GET /status
  ├─ Detailed health info
  ├─ Service statistics
  └─ Model availability
```

## Future Enhancements

1. **Advanced Features**
   - MIDI input support
   - Style transfer
   - Audio analysis and adaptation
   - Real-time interactive generation

2. **Performance**
   - Model quantization
   - Distillation to smaller models
   - Multi-GPU support
   - JAX/Triton optimization

3. **Integration**
   - Webhook callbacks
   - gRPC interface
   - WebSocket for real-time updates
   - GraphQL API

4. **Operations**
   - Prometheus metrics export
   - OpenTelemetry tracing
   - ELK stack logging
   - Kubernetes deployment

## References

- [MusicGen Paper](https://arxiv.org/abs/2306.05284)
- [Tacotron2 Paper](https://arxiv.org/abs/1712.05884)
- [HiFi-GAN Paper](https://arxiv.org/abs/2010.05646)
- [HuggingFace Transformers](https://huggingface.co/docs/transformers/)
- [PyTorch Documentation](https://pytorch.org/docs/)
- [Flask Documentation](https://flask.palletsprojects.com/)

---

**Architecture Document v1.0 - MusicGen Inference Server**
