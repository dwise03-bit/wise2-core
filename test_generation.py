#!/usr/bin/env python3
"""
Test Generation: Generate samples from your fine-tuned model
Run this after Phase 1 training completes
"""

import torch
import torchaudio
from pathlib import Path

try:
    from audiocraft import models
except ImportError:
    print("Installing audiocraft...")
    import os
    os.system("pip install audiocraft")
    from audiocraft import models

print("=" * 70)
print("TEST GENERATION: Fine-Tuned MusicGen Model")
print("=" * 70)

# Paths
MODEL_PATH = Path("/home/dwise/wise2-musicgen-v1/epoch_1")
OUTPUT_DIR = Path("/home/dwise/wise2-musicgen-v1/samples")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Check if model exists
if not MODEL_PATH.exists():
    print(f"\n✗ Model not found at: {MODEL_PATH}")
    print("  Please run: python3 fine_tune_musicgen_1660.py")
    exit(1)

print(f"\n✓ Loading model from: {MODEL_PATH}")
print("  (This may take 30-60 seconds...)")

try:
    model = models.MusicGen.get_pretrained(str(MODEL_PATH))
except Exception as e:
    print(f"\n✗ Error loading model: {e}")
    print("\nTrying fallback (base MusicGen)...")
    model = models.MusicGen.get_pretrained("facebook/musicgen-medium")

print("✓ Model loaded!\n")

# Test prompts
test_prompts = [
    {
        "description": "calm ambient music, peaceful atmosphere, slow strings",
        "filename": "01_calm_ambient.wav",
    },
    {
        "description": "energetic electronic music, driving synthesizers, rhythmic beat",
        "filename": "02_energetic_electronic.wav",
    },
    {
        "description": "melodic piano music, contemplative, jazz influence",
        "filename": "03_melodic_piano.wav",
    },
    {
        "description": "upbeat indie rock, acoustic guitar, vocal melody",
        "filename": "04_indie_rock.wav",
    },
    {
        "description": "atmospheric cinematic music, orchestral elements, epic mood",
        "filename": "05_cinematic_orchestral.wav",
    },
]

print("=" * 70)
print("GENERATING TEST SAMPLES")
print("=" * 70)

for idx, prompt in enumerate(test_prompts, 1):
    description = prompt["description"]
    filename = prompt["filename"]
    filepath = OUTPUT_DIR / filename

    print(f"\n[{idx}/{len(test_prompts)}] {description}")
    print(f"  Generating...", end=" ", flush=True)

    try:
        # Generate 30-second track
        with torch.no_grad():
            wav = model.generate(
                descriptions=[description],
                progress=False,
                return_tokens=False,
                duration=30,  # 30 seconds
            )

        # Save
        torchaudio.save(
            str(filepath),
            wav[0].cpu(),
            16000,
        )

        print(f"✓")
        print(f"  Saved: {filepath}")

    except Exception as e:
        print(f"✗ ({str(e)[:60]})")
        continue

print("\n" + "=" * 70)
print("✓ TEST GENERATION COMPLETE")
print("=" * 70)

print(f"""
Generated samples saved to: {OUTPUT_DIR}

Files:
""")

for sample_file in sorted(OUTPUT_DIR.glob("*.wav")):
    size_mb = sample_file.stat().st_size / 1e6
    print(f"  - {sample_file.name} ({size_mb:.1f}MB)")

print(f"""
Next steps:

1. Download samples to your computer:
   scp -r dwise@173.208.147.165:{OUTPUT_DIR}/*.wav .

2. Listen to the samples in your favorite music player

3. Evaluate quality:
   - Are the prompts reflected in the generated audio?
   - Is the audio coherent and musical?
   - Any artifacts or distortions?

4. Iterate:
   - If quality is poor: collect more training data + retrain
   - If quality is good: continue to Phase 2 (longer training)
   - If satisfied: continue to Phase 3 (model deployment)

Training tips:
  - More data = better quality
  - More epochs = better adaptation to your data
  - Different base models = different styles
  - Fine-tune on specific genres for specialized models

You can also generate directly:

  from audiocraft import models
  model = models.MusicGen.get_pretrained('/home/dwise/wise2-musicgen-v1/epoch_1')
  wav = model.generate(descriptions=['your description here'])
  import torchaudio
  torchaudio.save('output.wav', wav[0].cpu(), 16000)
""")
