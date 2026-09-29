# Sound Labs: Custom Music Generation Model Roadmap

**Vision**: Build a proprietary music generation engine that creates tracks from lyrics, tuned to WISE² brand voice and quality standards.

---

## Architecture Overview

```
User Lyrics
    ↓
Sound Labs API (/generate)
    ↓
Model Server (FastAPI/TorchServe)
    ↓
Your Trained Model (Fine-tuned MusicGen)
    ↓
Audio Generation → S3 Storage
    ↓
Audio URL → Sound Labs Project
```

---

## Phase 1: Foundation (Weeks 1-2)

### 1.1 Model Selection
**Recommended**: Fine-tune MusicGen-large
- Already music-to-text capable
- 3.9B parameters (manageable on consumer GPU)
- Open-source & hackable
- Strong baseline quality

### 1.2 Training Data Collection

#### Option A: Use Existing Licensed Music
```
Source: Epidemic Sound, Artlist, or AudioJungle
Volume: 500-1000 high-quality tracks
Format: MP3 + lyrics/metadata
Cost: $200-500/month or one-time license
```

#### Option B: Creative Commons + Public Domain
```
Sources:
- Free Music Archive (freemusicarchive.org)
- ccMixter (ccmixter.org)
- Incompetech (incompetech.com)
Volume: 1000-5000 tracks
Quality: Variable, requires curation
Cost: Free
```

#### Option C: Generate Synthetic Data
```
Method: Use MusicGen to create base dataset
Steps:
1. Generate 5K tracks with varied prompts
2. Manual filter to best 1K
3. Use as training seed
Cost: $50-100 in API credits
Time: 2-3 days
```

**Recommendation**: Start with Option B (CC + Public Domain) + Option C (synthetic seed). Build to Option A once you have quality metrics.

### 1.3 Data Preparation Pipeline

```python
# Structure your dataset
data/
├── tracks/           # Audio files (MP3/WAV)
│   ├── track_001.wav
│   ├── track_002.wav
│   └── ...
├── metadata/         # Lyrics + metadata
│   ├── track_001.json  # {lyrics, genre, mood, bpm, energy}
│   └── ...
└── split/           # Train/val/test
    ├── train.txt    # 80% of tracks
    ├── val.txt      # 10% of tracks
    └── test.txt     # 10% of tracks
```

### 1.4 Setup Local GPU Environment

```bash
# Hardware requirements
GPU: NVIDIA A40 / RTX 4090 / M1/M2 Max (minimum RTX 3070 Ti)
VRAM: 24GB+ minimum, 48GB+ recommended
RAM: 64GB
Storage: 500GB SSD for model + data

# Software setup
conda create -n musicgen python=3.10
conda activate musicgen

pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip install transformers audiocraft accelerate wandb

# Clone musicgen
git clone https://github.com/facebookresearch/audiocraft.git
cd audiocraft
pip install -e .
```

---

## Phase 2: Model Fine-Tuning (Weeks 3-4)

### 2.1 Fine-Tuning Script

```python
# fine_tune_musicgen.py

import torch
from audiocraft import models
from audiocraft.models import MusicGen
from transformers import Trainer, TrainingArguments
import json

class MusicGenDataset(torch.utils.data.Dataset):
    def __init__(self, metadata_dir, audio_dir, split='train'):
        self.metadata_dir = metadata_dir
        self.audio_dir = audio_dir
        self.tracks = self._load_split(split)
    
    def _load_split(self, split):
        with open(f'{self.metadata_dir}/{split}.txt') as f:
            return [line.strip() for line in f]
    
    def __len__(self):
        return len(self.tracks)
    
    def __getitem__(self, idx):
        track_id = self.tracks[idx]
        
        # Load metadata
        with open(f'{self.metadata_dir}/{track_id}.json') as f:
            metadata = json.load(f)
        
        # Load audio
        audio_path = f'{self.audio_dir}/{track_id}.wav'
        audio, sr = torchaudio.load(audio_path)
        
        return {
            'input_ids': metadata['lyrics'],  # Tokenized lyrics
            'audio': audio,
            'sample_rate': sr,
        }

# Training config
training_args = TrainingArguments(
    output_dir='./wise2-musicgen-v1',
    num_train_epochs=3,
    per_device_train_batch_size=2,  # Adjust for your GPU
    per_device_eval_batch_size=2,
    warmup_steps=500,
    weight_decay=0.01,
    logging_steps=100,
    save_steps=1000,
    eval_steps=1000,
    learning_rate=1e-5,
    save_total_limit=3,
    load_best_model_at_end=True,
    report_to=['wandb'],  # Track on wandb.ai
)

# Load model
model = MusicGen.get_pretrained('facebook/musicgen-large')

# Fine-tune
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=MusicGenDataset(metadata_dir='data/metadata', 
                                   audio_dir='data/tracks', 
                                   split='train'),
    eval_dataset=MusicGenDataset(metadata_dir='data/metadata', 
                                  audio_dir='data/tracks', 
                                  split='val'),
)

trainer.train()

# Save final model
model.save_pretrained('./wise2-musicgen-final')
```

### 2.2 Evaluation Metrics

```python
# Measure quality during training
metrics = {
    'loss': trainer.state.best_metric,
    'inception_score': calculate_is(generated_audio),
    'frechet_audio_distance': calculate_fad(generated_audio, real_audio),
    'musicality_score': calculate_musicality(generated_audio),
}
```

### 2.3 Training Timeline
- **Data prep**: 3-5 days
- **Fine-tuning**: 5-7 days (depending on dataset size + GPU)
- **Evaluation**: 2-3 days
- **Iteration**: 1-2 weeks (quality refinement)

---

## Phase 3: Deployment (Weeks 5-6)

### 3.1 Model Server Setup

```python
# model_server.py - FastAPI server for inference

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from audiocraft import models
import torch
import uuid
import s3fs

app = FastAPI()

# Load your fine-tuned model
device = 'cuda' if torch.cuda.is_available() else 'cpu'
model = models.MusicGen.get_pretrained('./wise2-musicgen-final').to(device)

class GenerationRequest(BaseModel):
    lyrics: str
    title: str
    duration: int = 30  # seconds
    temperature: float = 0.7

class GenerationResponse(BaseModel):
    job_id: str
    audio_url: str
    duration: int

# S3 client for storage
s3 = s3fs.S3FileSystem(
    key=os.getenv('AWS_ACCESS_KEY_ID'),
    secret=os.getenv('AWS_SECRET_ACCESS_KEY'),
    client_kwargs={'Bucket': os.getenv('S3_BUCKET')}
)

@app.post('/generate')
async def generate_music(request: GenerationRequest):
    """Generate music from lyrics"""
    try:
        job_id = str(uuid.uuid4())
        
        # Prepare prompt
        prompt = f"{request.title}. {request.lyrics}"
        
        # Generate audio (16kHz, mono)
        with torch.no_grad():
            wav = model.generate(
                descriptions=[prompt],
                progress=True,
                return_tokens=False,
                top_k=250,
                top_p=0.9,
                temperature=request.temperature,
                cfg_coef=3.0,  # Guidance scale
                use_sampling=True,
                duration=request.duration,
            )
        
        # Save to S3
        audio_path = f"generated/{job_id}.wav"
        with s3.open(f"s3://{os.getenv('S3_BUCKET')}/{audio_path}", 'wb') as f:
            torchaudio.save(f, wav[0].cpu(), 16000)
        
        audio_url = f"https://{os.getenv('S3_BUCKET')}.s3.amazonaws.com/{audio_path}"
        
        return GenerationResponse(
            job_id=job_id,
            audio_url=audio_url,
            duration=request.duration,
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/health')
async def health():
    return {'status': 'ok', 'model': 'wise2-musicgen-v1'}
```

### 3.2 Docker Container

```dockerfile
# Dockerfile

FROM pytorch/pytorch:2.0.1-cuda11.8-runtime-ubuntu22.04

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy model server
COPY model_server.py .
COPY wise2-musicgen-final ./model/

# Expose port
EXPOSE 8000

# Start server
CMD ["uvicorn", "model_server:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 3.3 Deploy Options

#### Option A: AWS SageMaker (Recommended)
```bash
# Automatic scaling, built-in monitoring
aws sagemaker create-model --model-name wise2-musicgen-v1
aws sagemaker create-endpoint-config --model-name wise2-musicgen-v1
aws sagemaker create-endpoint
```

#### Option B: Google Cloud Run
```bash
# Containerized, pay-per-use
gcloud run deploy wise2-musicgen --image gcr.io/your-project/musicgen
```

#### Option C: Self-Hosted (Your VPS)
```bash
# 173.208.147.165 - add model service
docker run -d \
  -p 8000:8000 \
  -e AWS_ACCESS_KEY_ID=... \
  -e S3_BUCKET=wise2-audio \
  --gpus all \
  wise2-musicgen:latest
```

---

## Phase 4: Integration with Sound Labs (Week 6-7)

### 4.1 Update Generate Route

```typescript
// apps/website/app/api/v1/sound-labs/me/projects/[projectId]/generate/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: { projectId: string } }) {
  const body = await request.json();
  const { lyrics, title, engine = 'custom' } = body;
  
  if (engine === 'custom') {
    const response = await fetch(process.env.CUSTOM_MODEL_ENDPOINT + '/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CUSTOM_MODEL_API_KEY}`,
      },
      body: JSON.stringify({
        lyrics,
        title,
        duration: 30,
        temperature: 0.7,
      }),
    });
    
    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      jobId: result.job_id,
      status: 'completed',
      engine: 'custom',
      audioUrl: result.audio_url,
    });
  }
}
```

### 4.2 Environment Variables

```bash
# .env.production
MUSIC_GEN_ENGINE=custom
CUSTOM_MODEL_ENDPOINT=https://musicgen.wise2.net  # Your deployed model
CUSTOM_MODEL_API_KEY=sk_...
S3_BUCKET=wise2-audio
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

---

## Phase 5: Quality Iteration (Ongoing)

### 5.1 Monitoring Dashboard

```python
# Track generation quality over time
metrics = {
    'avg_generation_time': 45,  # seconds
    'user_ratings': 4.2,  # 1-5 scale
    'completion_rate': 0.95,  # % successful
    'audio_quality_score': 0.87,  # Objective measure
}
```

### 5.2 User Feedback Loop

```
User generates → Rates audio (👍 👎) → 
Collect metadata → Retrain on good examples → 
Improve model quality
```

### 5.3 Continuous Improvement

```
Month 1: MVP quality (Inception Score 6.5+)
Month 2: Professional quality (IS 7.5+)
Month 3: Production quality (IS 8.5+)
Month 6: Branded sound (unique, recognizable)
```

---

## Infrastructure & Costs

### Monthly Operating Costs

| Item | Estimate | Notes |
|------|----------|-------|
| Model Inference (AWS) | $500-1000 | 100 generations/day |
| S3 Storage | $50-100 | 10GB stored audio |
| GPU Training (rental) | $200-400 | 1-2 training runs/month |
| Monitoring/Logging | $50-100 | CloudWatch, DataDog |
| **Total** | **$800-1600/mo** | Scales with usage |

### One-Time Setup Costs

| Item | Estimate |
|------|----------|
| GPU Server (if self-hosted) | $3000-5000 |
| S3 Setup + CDN | $100 |
| Model Optimization | $500 |
| **Total** | **$3600-5600** |

---

## Implementation Timeline

```
Week 1-2:   Collect & prepare training data
Week 3-4:   Fine-tune model on your data
Week 5-6:   Deploy model server (AWS/GCP)
Week 6-7:   Integrate with Sound Labs
Week 8+:    Monitor, iterate, improve quality
```

---

## Success Metrics

**Phase 1 Success**: Model generates coherent music (any lyrics)
- Inception Score: 5.0+
- Generation time: <2 min

**Phase 2 Success**: Music quality matches professional standards
- Inception Score: 7.5+
- Generation time: <90 sec
- User rating: 4.0+/5.0

**Phase 3 Success**: Branded, recognizable Sound Labs sound
- Inception Score: 8.5+
- Generation time: <60 sec
- Unique musical fingerprint

---

## Getting Started: Week 1 Action Items

- [ ] Choose training data source (CC + synthetic recommended)
- [ ] Set up GPU environment locally or rent cloud GPU
- [ ] Download MusicGen base model
- [ ] Collect 500 initial tracks + lyrics
- [ ] Create metadata pipeline
- [ ] Start data preprocessing

---

## Questions & Support

**Do you have a GPU?**
- Yes → Use local machine
- No → Rent from: Lambda Labs, Paperspace, RunPod, AWS

**Training budget?**
- $0-100 → Use public domain + CC + synthetic data
- $100-500 → License 500-1000 professional tracks
- $500+ → License full professional dataset + hire ML engineer

**Timeline pressure?**
- Need MVP in 2 weeks? → Use MusicGen API initially, parallel train
- Can wait 2 months? → Invest in quality training dataset

---

## Next Steps

Ready to build your custom model?

1. **Confirm data source strategy** (CC, synthetic, licensed, or hybrid)
2. **Set up training environment** (local GPU or cloud rental)
3. **Collect initial dataset** (500-1000 tracks)
4. **I'll create the fine-tuning pipeline** ready to run
5. **Deploy model server** to AWS/VPS
6. **Integrate with Sound Labs** - users generate tracks with YOUR model

**Let's build this. 🎵**
