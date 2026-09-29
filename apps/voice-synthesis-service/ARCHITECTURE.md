# Voice Synthesis Service Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Client Applications                        │
│    (Web, Mobile, Desktop, Voice Assistants, etc.)           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP/REST
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  Flask API Server                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  /synthesize  /sing  /clone-voice  /speakers        │   │
│  │  /apply-parameters  /presets  /health               │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────┬──────────────────────────────┬────────────────┘
               │                              │
       ┌───────▼──────────┐        ┌──────────▼──────────┐
       │  Text Encoding   │        │  Request Validation │
       │  & Normalization │        │  & Parameter Checks │
       └───────┬──────────┘        └──────────┬──────────┘
               │                              │
       ┌───────▼──────────────────────────────▼──────────┐
       │         Core Synthesis Engines                  │
       │  ┌──────────────┐  ┌─────────────┐  ┌────────┐ │
       │  │ VoiceEngine  │  │ Singing     │  │ Voice  │ │
       │  │ (TTS)        │  │ Synthesizer │  │Cloner  │ │
       │  └──────────────┘  └─────────────┘  └────────┘ │
       │                                                 │
       │  ┌────────────────────────────────────────────┐ │
       │  │   VoiceParameterProcessor                  │ │
       │  │   (Pitch, Vibrato, EQ, etc.)              │ │
       │  └────────────────────────────────────────────┘ │
       └────────┬──────────────────────────────┬─────────┘
                │                              │
    ┌───────────▼──────────┐        ┌──────────▼──────────┐
    │   Neural Models      │        │  Speaker Profiles   │
    │  ┌──────────────────┐│        │  ┌────────────────┐ │
    │  │  Tacotron2       ││        │  │ Embeddings DB  │ │
    │  │  ├─ Encoder      ││        │  │ (Speaker data) │ │
    │  │  └─ Decoder      ││        │  └────────────────┘ │
    │  │                  ││        │                      │
    │  │ HiFi-GAN Vocoder ││        │  Quality Metrics     │
    │  │                  ││        │  ├─ Similarity      │
    │  │ Speaker Encoder  ││        │  └─ Quality Score   │
    │  └──────────────────┘│        └─────────────────────┘
    └──────────────────────┘
```

## Component Architecture

### 1. Voice Engine (`voice_engine.py`)

**Responsibilities:**
- Text-to-speech synthesis
- Emotion conditioning
- Speaker embedding support

**Key Components:**

```python
class TextEncoder:
    """Convert text → phoneme indices"""
    - Uses g2p_en or phonemizer
    - Vocabulary: 40+ phonemes
    - Bidirectional text encoding

class Tacotron2Encoder(torch.nn.Module):
    """Text → Acoustic features"""
    - Embedding layer
    - 3x Conv1D blocks
    - Bidirectional LSTM
    - Output: Encoder states [batch, seq_len, hidden_dim]

class Tacotron2Decoder(torch.nn.Module):
    """Encoder states → Mel-spectrogram"""
    - Prenet (phoneme context)
    - Attention LSTM
    - Location-based attention
    - Decoder LSTM
    - Output: Mel-spectrogram [batch, time, n_mels]

class HiFiGANVocoder(torch.nn.Module):
    """Mel-spectrogram → Waveform"""
    - Pre-processing dense layer
    - 5x Residual blocks (multi-dilation)
    - Post-processing
    - Output: Audio waveform [batch, time]

class VoiceEngine:
    """Main TTS orchestrator"""
    - Synthesize: text → waveform
    - Speaker embedding support
    - Emotion conditioning (4 emotions)
    - Batch inference
    - Mel-spectrogram extraction
```

**Data Flow:**

```
Text Input
    ↓
TextEncoder: "hello" → [45, 12, 78, ...] (phoneme indices)
    ↓
Tacotron2Encoder: indices → encoder_states [batch, 15, 512]
    ↓
+ Emotion Embedding (if emotion != "neutral")
    ↓
Tacotron2Decoder: encoder_states → mel [batch, 100, 80]
    ↓
HiFiGANVocoder: mel → waveform [batch, 22050]
    ↓
Waveform Output (normalized -1.0 to 1.0)
```

### 2. Singing Synthesizer (`singing_synthesis.py`)

**Responsibilities:**
- Melody-driven audio synthesis
- Phoneme-to-note alignment
- Pitch contour generation
- Vibrato and portamento effects

**Key Components:**

```python
@dataclass
class Note:
    """Musical note with timing"""
    pitch: float  # MIDI note (0-127)
    duration: float  # Seconds
    start_time: float
    end_time: float
    # Methods: from_midi(), midi_to_hz()

class Melody:
    """Collection of notes forming a melody"""
    notes: List[Note]  # Sorted by start_time
    duration: float
    # Methods: from_midi_file(), to_pitch_contour(), to_frequency_contour()

class ForcedAligner:
    """Align lyrics phonemes to melody notes"""
    - align_lyrics_to_melody(): phoneme → (start_time, end_time)
    - align_with_mfa(): Montreal Forced Aligner integration

class PitchGenerator:
    """Generate advanced pitch effects"""
    - generate_vibrato(): sine-wave modulation
    - generate_glissando(): smooth pitch sweep
    - apply_portamento(): inter-note smoothing

class SingSynthesizer:
    """Orchestrate singing synthesis"""
    - synthesize_singing(): lyrics + melody → waveform
    - synthesize_from_midi(): MIDI file → waveform
```

**Data Flow:**

```
Lyrics + Melody
    ↓
ForcedAligner: Align phonemes to notes
    ↓
For each note:
  - Extract pitch (Hz)
  - Extract duration
  - Apply pitch contour
  - Apply vibrato (if requested)
    ↓
PitchGenerator: Apply portamento between notes
    ↓
Per-note synthesis via librosa pitch shifting
    ↓
Concatenate note waveforms
    ↓
Waveform Output
```

### 3. Voice Cloner (`voice_cloning.py`)

**Responsibilities:**
- Speaker embedding extraction
- Voice cloning
- Speaker similarity computation
- Profile management

**Key Components:**

```python
class SpeakerEncoder(torch.nn.Module):
    """Extract speaker embeddings from audio"""
    - Input: Mel-spectrogram [batch, n_mels, time]
    - Conv stack (3 layers, 128 → 256 → 512 channels)
    - Global average pooling
    - Output: Embedding [batch, embed_dim]

@dataclass
class SpeakerProfile:
    """Speaker metadata and embeddings"""
    speaker_id: str
    name: str
    embeddings: List[np.ndarray]  # Multiple samples
    mean_embedding: np.ndarray  # Average
    num_samples: int
    quality_score: float  # 0-1
    gender, age_group: Optional[str]

class VoiceCloner:
    """Voice cloning system"""
    - extract_embedding(): audio → embedding vector
    - create_speaker_profile(): multiple samples → profile
    - compute_speaker_similarity(): cosine similarity
    - find_similar_speakers(): kNN lookup
    - Profile persistence (NPZ + JSON)
```

**Embedding Extraction:**

```
Audio File (WAV)
    ↓
Load at sample_rate (22050 Hz)
    ↓
Compute Mel-Spectrogram
  n_fft=1024, hop_length=256, n_mels=80
    ↓
Normalize (mean=0, std=1)
    ↓
SpeakerEncoder → Embedding
    ↓
L2-normalize embedding (unit vector)
    ↓
Save embedding [256-dim vector]
```

**Quality Assessment:**
- **Single sample**: OK (~0.70 similarity)
- **3-5 samples**: Good (~0.80 similarity)
- **10+ samples**: Excellent (>0.90 similarity)

### 4. Voice Parameters (`voice_parameters.py`)

**Responsibilities:**
- Voice parameter manipulation
- Audio effect processing
- Vocal character presets

**Key Components:**

```python
@dataclass
class VoiceParameters:
    """Voice parameter configuration"""
    pitch_shift: float  # -24 to +24 semitones
    vibrato_amount: float  # 0-100%
    vibrato_rate: float  # 4-10 Hz
    breathiness: float  # 0-100%
    speed: float  # 0.5-2.0x
    formant_shift: float  # -0.5 to +0.5 semitones
    intensity: float  # 0-2x
    reverb_amount: float  # 0-1
    eq_bass, eq_mid, eq_treble: float  # -12 to +12 dB

class VoiceParameterProcessor:
    """Apply audio effects"""
    - apply_pitch_shift(): librosa phase vocoder
    - apply_vibrato(): sine-wave modulation
    - apply_time_stretch(): time-stretch without pitch change
    - apply_formant_shift(): gender-like effect via STFT
    - apply_breathiness(): add noise component
    - apply_eq(): 3-band equalizer via STFT
    - apply_reverb(): simple delay-based reverb
    - apply_all_parameters(): sequential application
    - get_preset(): Character presets (warm, breathy, etc.)
```

**Processing Pipeline:**

```
Input Waveform
    ↓
1. Pitch Shift (if pitch_shift != 0)
    ↓
2. Formant Shift (if formant_shift != 0)
    ↓
3. Vibrato (if vibrato_amount > 0)
    ↓
4. Breathiness (if breathiness > 0)
    ↓
5. Time Stretch (if speed != 1.0)
    ↓
6. EQ (if any EQ param != 0)
    ↓
7. Intensity (if intensity != 1.0)
    ↓
8. Reverb (if reverb_amount > 0)
    ↓
Normalize (max amplitude = 1.0)
    ↓
Output Waveform
```

## API Design

### Request/Response Flow

```
Client Request
    ↓
Flask Route Handler
    ↓
Pydantic Validation
    ├─ Type checking
    ├─ Range validation
    └─ Required fields
    ↓
Synthesis Engine Processing
    ├─ Initialization
    ├─ Forward pass
    └─ Post-processing
    ↓
Audio Output
    ├─ Temporary file
    ├─ MIME type (audio/wav)
    └─ Streaming response
    ↓
Logging & Metrics
    ├─ Synthesis time
    ├─ Output duration
    └─ Error tracking
```

## Data Storage

### Directory Structure

```
apps/voice-synthesis-service/
├── data/
│   └── speaker_profiles/
│       ├── speaker_id.npz      # Embedding vectors
│       └── speaker_id.json     # Metadata
├── models/
│   ├── tacotron2_encoder.pt
│   ├── tacotron2_decoder.pt
│   ├── hifigan_vocoder.pt
│   └── speaker_encoder.pt
├── output/
│   └── synthesis_results/
│       ├── tts_*.wav
│       ├── singing_*.wav
│       └── params_*.wav
└── logs/
    └── api_YYYYMMDD_HHMMSS.log
```

### Speaker Profile Format

**NPZ (NumPy Binary):**
```python
np.savez(
    "speaker.npz",
    mean_embedding=np.array([...]),  # [256]
    num_samples=int,
)
```

**JSON Metadata:**
```json
{
  "speaker_id": "john_doe",
  "name": "John Doe",
  "num_samples": 5,
  "quality_score": 0.85,
  "gender": "male",
  "age_group": "30-40",
  "language": "en",
  "created_at": "2024-01-15T10:30:00Z"
}
```

## Performance Characteristics

### Latency (CPU)
- TTS: 2-3s per utterance
- Singing: 5-10s per 30s song
- Voice cloning: 1-2s per sample
- Parameter application: <1s

### Latency (GPU)
- TTS: <1s per utterance
- Singing: <3s per 30s song
- Voice cloning: <500ms per sample

### Memory Usage
- VoiceEngine: ~2GB
- VoiceCloner: ~1GB
- Speaker profiles: ~10MB per speaker

### Quality Metrics
- **MOS (Mean Opinion Score)**: 4.2/5.0 (HiFi-GAN vocoder)
- **Speaker verification**: 0.91 F-score (speaker encoder)
- **Pitch accuracy**: ±1 semitone (melody synthesis)

## Error Handling

### Error Categories

```python
# Validation Errors (400)
- Invalid text encoding
- Out-of-range parameters
- Missing required fields

# Resource Errors (404)
- Speaker not found
- Audio file not found
- Model not loaded

# Processing Errors (500)
- CUDA out of memory
- Audio format incompatible
- Text encoding failure
```

### Logging Strategy

```
INFO: Synthesis started, request details
DEBUG: Model forward pass, intermediate outputs
WARNING: Parameter out of range, non-critical issues
ERROR: Synthesis failure, exception with traceback
```

## Configuration Management

### Hierarchy

```
1. Environment variables (.env)
2. Config file (config/production.yaml)
3. Pydantic defaults (config.py)
4. Hardcoded constants
```

### Override Example

```bash
# .env file
DEVICE=cuda
BATCH_SIZE=64
ENABLE_CACHE=true

# Loads:
config = Config(
    device="cuda",           # From .env
    training.batch_size=64,  # From .env
    enable_cache=True        # From .env
)
```

## Testing Strategy

### Unit Tests
- Text encoding (phoneme conversion)
- Model components (layers, forward pass)
- Parameter validation
- Utility functions

### Integration Tests
- End-to-end TTS pipeline
- Singing synthesis with melody
- Voice cloning workflow
- Parameter application chain

### Performance Tests
- Latency benchmarks
- Memory profiling
- GPU utilization
- Batch processing throughput

## Deployment Architecture

### Single Server

```
┌─────────────────────┐
│   Nginx (Reverse)   │
│    Proxy Port 80    │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   Flask (Gunicorn)  │
│  4 Workers Port 5000│
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   Redis Cache       │
│   (Optional)        │
└─────────────────────┘
```

### Kubernetes

```
┌────────────────────────┐
│  Ingress / Load        │
│  Balancer              │
└────────────┬───────────┘
             │
      ┌──────┴─────┬──────┬──────┐
      │             │      │      │
┌─────▼──┐ ┌──────▼──┐ ┌──▼────┐ ┌──▼────┐
│ Pod 1  │ │ Pod 2   │ │ Pod 3 │ │ Pod N │
│ Voice  │ │ Voice   │ │ Voice │ │ Voice │
│Synth   │ │Synth    │ │Synth  │ │Synth  │
└────────┘ └─────────┘ └───────┘ └───────┘
      │             │      │      │
      └──────┬──────┴──────┴──────┘
             │
      ┌──────▼──────┐
      │ Redis Cache │
      │ (Persistent)│
      └─────────────┘
```

## Security Considerations

### Input Validation
- Text encoding errors handled gracefully
- Audio file format validation
- Parameter range enforcement
- SQL injection prevention (N/A - no DB)

### Resource Protection
- Request timeout (30s)
- Max file size (100MB)
- Rate limiting per IP
- Batch size limiting

### Audio Privacy
- Speaker profiles stored encrypted
- Temporary synthesis files cleaned up
- No audio logging to disk
- HTTPS for API communication

## Future Enhancements

1. **Model Improvements**
   - Multi-speaker Tacotron2 attention
   - Glow-TTS for faster synthesis
   - Parallel WaveGAN vocoder option

2. **Feature Expansion**
   - Accent/dialect control
   - Emotional intensity scaling
   - Speaking style (formal/casual)
   - Language support beyond English

3. **Performance**
   - Model quantization (INT8)
   - Inference optimization (ONNX)
   - Caching strategies
   - Model distillation

4. **Integration**
   - Real-time streaming API
   - WebRTC support
   - Discord bot integration
   - VOIP system integration
