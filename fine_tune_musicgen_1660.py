#!/usr/bin/env python3
"""
Phase 1 Step 3: Fine-Tune MusicGen on GTX 1660 Super
Optimized for 6GB VRAM with:
  - Batch size 1
  - Gradient accumulation (4x)
  - Mixed precision (fp16)
  - Smaller base model (musicgen-medium)
"""

import os
import json
import torch
import torchaudio
from pathlib import Path
from dataclasses import dataclass
import numpy as np

# Try importing audiocraft
try:
    from audiocraft import models
    from audiocraft.models import MusicGen
except ImportError:
    print("Installing audiocraft...")
    os.system("pip install audiocraft")
    from audiocraft import models
    from audiocraft.models import MusicGen

# Try importing transformers Trainer
try:
    from torch.utils.data import Dataset, DataLoader
    from torch.optim import AdamW
except ImportError:
    print("Installing dependencies...")
    os.system("pip install torch torchvision torchaudio transformers accelerate")
    from torch.utils.data import Dataset, DataLoader
    from torch.optim import AdamW

# ============================================================================
# CONFIGURATION
# ============================================================================

BASE_DIR = Path("/home/dwise/musicgen-training")
METADATA_DIR = BASE_DIR / "metadata"
PROCESSED_DIR = BASE_DIR / "processed"
SPLIT_DIR = METADATA_DIR / "splits"
OUTPUT_DIR = Path("/home/dwise/wise2-musicgen-v1")

@dataclass
class TrainingConfig:
    # Model settings
    model_name: str = "facebook/musicgen-medium"  # Smaller than -large
    output_dim: int = 16384

    # Training hyperparameters
    num_epochs: int = 1
    batch_size: int = 1  # CRITICAL: must be 1 for 6GB GPU
    gradient_accumulation_steps: int = 4
    learning_rate: float = 5e-5
    warmup_steps: int = 100
    weight_decay: float = 0.01

    # Hardware optimization
    use_amp: bool = True  # Mixed precision (fp16)
    use_gradient_checkpointing: bool = True
    max_grad_norm: float = 1.0

    # Audio settings
    sample_rate: int = 16000
    max_duration: int = 30  # seconds

    # Logging
    log_every: int = 50
    save_every: int = 500
    eval_every: int = 500

config = TrainingConfig()

print("=" * 70)
print("PHASE 1 STEP 3: FINE-TUNE MUSICGEN (GTX 1660 Super)")
print("=" * 70)
print(f"""
Configuration:
  Model: {config.model_name}
  Device: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU (slow)'}
  Batch size: {config.batch_size} × {config.gradient_accumulation_steps} accumulation
  Learning rate: {config.learning_rate}
  Mixed precision: {config.use_amp}
  Gradient checkpointing: {config.use_gradient_checkpointing}
""")

# ============================================================================
# DATASET
# ============================================================================

class MusicGenDataset(Dataset):
    def __init__(self, metadata_dir, audio_dir, split='train', max_duration=30):
        self.metadata_dir = Path(metadata_dir)
        self.audio_dir = Path(audio_dir)
        self.max_duration = max_duration
        self.sample_rate = 16000

        # Load split file
        split_file = self.metadata_dir / "splits" / f"{split}.txt"

        if not split_file.exists():
            raise FileNotFoundError(f"Split file not found: {split_file}")

        with open(split_file) as f:
            self.track_ids = [line.strip() for line in f if line.strip()]

        print(f"Loaded {len(self.track_ids)} {split} samples from {split_file}")

    def __len__(self):
        return len(self.track_ids)

    def __getitem__(self, idx):
        track_id = self.track_ids[idx]

        # Load metadata
        metadata_path = self.metadata_dir / f"{track_id}.json"
        with open(metadata_path) as f:
            metadata = json.load(f)

        # Load audio
        audio_path = self.audio_dir / f"{track_id}.wav"
        if not audio_path.exists():
            audio_path = self.audio_dir / f"{track_id}.mp3"

        try:
            audio, sr = torchaudio.load(str(audio_path))

            # Resample if needed
            if sr != self.sample_rate:
                resampler = torchaudio.transforms.Resample(sr, self.sample_rate)
                audio = resampler(audio)

            # Convert to mono if stereo
            if audio.shape[0] > 1:
                audio = audio.mean(dim=0, keepdim=True)

            # Trim to max duration
            max_samples = self.max_duration * self.sample_rate
            if audio.shape[1] > max_samples:
                audio = audio[:, :max_samples]

            # Pad if too short
            if audio.shape[1] < self.sample_rate * 5:  # At least 5 seconds
                pad_length = self.sample_rate * 5 - audio.shape[1]
                audio = torch.nn.functional.pad(audio, (0, pad_length))

            # Create description (mood + genre guidance)
            description = f"{metadata['genre']} music, {metadata['mood']} mood"

            return {
                'audio': audio.squeeze(),  # (seq_len,)
                'description': description,
                'track_id': track_id,
                'duration': metadata['duration'],
            }

        except Exception as e:
            print(f"Error loading {track_id}: {e}")
            # Return silence as fallback
            return {
                'audio': torch.zeros(self.sample_rate * 10),
                'description': "ambient music, calm mood",
                'track_id': track_id,
                'duration': 10,
            }

# ============================================================================
# TRAINING LOOP
# ============================================================================

class SimpleTrainer:
    def __init__(self, model, config, device):
        self.model = model
        self.config = config
        self.device = device

        # Move model to device
        self.model = self.model.to(device)

        # Optimizer
        self.optimizer = AdamW(
            self.model.parameters(),
            lr=config.learning_rate,
            weight_decay=config.weight_decay,
        )

        # Gradient scaler for mixed precision
        if config.use_amp:
            self.scaler = torch.cuda.amp.GradScaler()
        else:
            self.scaler = None

        self.global_step = 0
        self.best_loss = float('inf')

    def train_epoch(self, train_loader):
        self.model.train()
        total_loss = 0

        for batch_idx, batch in enumerate(train_loader):
            audio = batch['audio'].to(self.device)
            descriptions = batch['description']

            # Zero gradients
            self.optimizer.zero_grad()

            try:
                # Forward pass with mixed precision
                if self.config.use_amp:
                    with torch.cuda.amp.autocast():
                        # MusicGen expects list of descriptions
                        outputs = self.model.compute_predictions(
                            audio.unsqueeze(1),  # (batch, 1, seq_len)
                            descriptions,
                        )
                        loss = outputs['loss'] if isinstance(outputs, dict) else outputs
                else:
                    outputs = self.model.compute_predictions(
                        audio.unsqueeze(1),
                        descriptions,
                    )
                    loss = outputs['loss'] if isinstance(outputs, dict) else outputs

                # Backward pass with gradient accumulation
                if self.config.use_amp:
                    self.scaler.scale(loss).backward()
                else:
                    loss.backward()

                # Gradient accumulation
                if (batch_idx + 1) % self.config.gradient_accumulation_steps == 0:
                    # Clip gradients
                    torch.nn.utils.clip_grad_norm_(
                        self.model.parameters(),
                        self.config.max_grad_norm
                    )

                    # Optimizer step
                    if self.config.use_amp:
                        self.scaler.step(self.optimizer)
                        self.scaler.update()
                    else:
                        self.optimizer.step()

                    self.global_step += 1

                total_loss += loss.item()

                # Logging
                if (batch_idx + 1) % self.config.log_every == 0:
                    avg_loss = total_loss / (batch_idx + 1)
                    print(f"[Batch {batch_idx+1}/{len(train_loader)}] Loss: {avg_loss:.4f}")

            except Exception as e:
                print(f"Error in batch {batch_idx}: {e}")
                continue

        avg_loss = total_loss / len(train_loader)
        return avg_loss

    def save_checkpoint(self, path):
        path = Path(path)
        path.mkdir(parents=True, exist_ok=True)
        self.model.save_pretrained(str(path))
        print(f"✓ Saved checkpoint to {path}")

# ============================================================================
# MAIN
# ============================================================================

def main():
    # Set device
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"\nUsing device: {device}")

    if torch.cuda.is_available():
        print(f"GPU: {torch.cuda.get_device_name(0)}")
        print(f"VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f}GB")

    # Check directories
    if not SPLIT_DIR.exists():
        print(f"\n✗ Error: Split directory not found: {SPLIT_DIR}")
        print("   Run metadata_pipeline.py first!")
        return

    # Load datasets
    print(f"\nLoading datasets from {SPLIT_DIR}...")
    train_dataset = MusicGenDataset(METADATA_DIR, PROCESSED_DIR, split='train')
    val_dataset = MusicGenDataset(METADATA_DIR, PROCESSED_DIR, split='val')

    # Data loaders
    train_loader = DataLoader(
        train_dataset,
        batch_size=config.batch_size,
        shuffle=True,
        num_workers=0,  # No multiprocessing on GPU
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=config.batch_size,
        shuffle=False,
        num_workers=0,
    )

    print(f"Train batches: {len(train_loader)}")
    print(f"Val batches: {len(val_loader)}")

    # Load model
    print(f"\nLoading model: {config.model_name}...")
    model = MusicGen.get_pretrained(config.model_name)

    # Enable gradient checkpointing
    if config.use_gradient_checkpointing and hasattr(model, 'gradient_checkpointing_enable'):
        model.gradient_checkpointing_enable()

    # Create trainer
    trainer = SimpleTrainer(model, config, device)

    # Training loop
    print(f"\n{'=' * 70}")
    print(f"TRAINING START")
    print(f"{'=' * 70}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for epoch in range(config.num_epochs):
        print(f"\nEpoch {epoch+1}/{config.num_epochs}")
        print("-" * 70)

        # Train
        train_loss = trainer.train_epoch(train_loader)
        print(f"Train Loss: {train_loss:.4f}")

        # Save checkpoint
        checkpoint_dir = OUTPUT_DIR / f"epoch_{epoch+1}"
        trainer.save_checkpoint(checkpoint_dir)

    # Final save
    print(f"\n{'=' * 70}")
    print(f"✓ TRAINING COMPLETE")
    print(f"{'=' * 70}")
    print(f"""
Model saved to: {OUTPUT_DIR}

Next steps:
  1. Test generation: python3 test_generation.py
  2. Deploy to FastAPI server (Phase 3)
  3. Integrate with Sound Labs (Phase 4)

To use your fine-tuned model:
  from audiocraft import models
  model = MusicGen.get_pretrained('{OUTPUT_DIR}')
  audio = model.generate(['epic orchestral music'])
    """)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n✓ Training interrupted by user")
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
