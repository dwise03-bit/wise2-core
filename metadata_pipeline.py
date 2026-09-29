#!/usr/bin/env python3
"""
Phase 1 Step 2: Metadata Pipeline
Processes raw audio files, computes audio features, creates training metadata
Prepares train/val/test splits (80/10/10)
"""

import os
import json
import librosa
import soundfile as sf
import numpy as np
from pathlib import Path
from collections import defaultdict
import random

# Configuration
BASE_DIR = Path("/home/dwise/musicgen-training")
RAW_DIR = BASE_DIR / "raw"
PROCESSED_DIR = BASE_DIR / "processed"
METADATA_DIR = BASE_DIR / "metadata"
SPLIT_DIR = METADATA_DIR / "splits"

# Create directories
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
SPLIT_DIR.mkdir(parents=True, exist_ok=True)

print("=" * 70)
print("PHASE 1 STEP 2: METADATA PIPELINE")
print("=" * 70)

# ============================================================================
# STEP 1: Scan raw directory
# ============================================================================
print("\n[1/4] Scanning raw audio files...")
print("-" * 70)

audio_files = list(RAW_DIR.glob("*.mp3")) + list(RAW_DIR.glob("*.wav")) + list(RAW_DIR.glob("*.flac"))
audio_files = [f for f in audio_files if f.is_file()]

print(f"Found {len(audio_files)} audio files in {RAW_DIR}")

if len(audio_files) == 0:
    print("\n⚠️  WARNING: No audio files found!")
    print(f"   Please download training data to: {RAW_DIR}")
    print("""
    Quick start:
      1. Download Incompetech torrent or FMA samples
      2. Extract to /home/dwise/musicgen-training/raw/
      3. Run this script again
    """)
    exit(1)

# ============================================================================
# STEP 2: Process each audio file
# ============================================================================
print("\n[2/4] Processing audio files...")
print("-" * 70)

processed_count = 0
error_count = 0
metadata_list = []

for idx, audio_file in enumerate(audio_files, 1):
    print(f"[{idx}/{len(audio_files)}] {audio_file.name}...", end=" ", flush=True)

    try:
        # Load audio
        y, sr = librosa.load(str(audio_file), sr=None, mono=True)

        # Resample to 16kHz (MusicGen standard)
        if sr != 16000:
            y = librosa.resample(y, orig_sr=sr, target_sr=16000)
            sr = 16000

        # Trim silence at start/end
        y, _ = librosa.effects.trim(y, top_db=25)

        # Limit duration to 30 seconds (training standard)
        max_samples = 30 * sr
        if len(y) > max_samples:
            y = y[:max_samples]

        # Skip tracks shorter than 5 seconds
        duration = len(y) / sr
        if duration < 5:
            print("✗ (too short)")
            error_count += 1
            continue

        # Compute audio features
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        energy = np.mean(onset_env)

        spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
        brightness = float(np.mean(spectral_centroid))

        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        timbre = float(np.mean(np.std(mfcc, axis=1)))

        # Detect key
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
        chroma_mean = np.mean(chroma, axis=1)
        key_idx = np.argmax(chroma_mean)
        keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        key = keys[key_idx]

        # Infer mood from features
        if energy > 0.3 and brightness > 3000:
            mood = "energetic"
        elif energy < 0.15 and brightness < 2000:
            mood = "calm"
        else:
            mood = "moderate"

        # Infer genre (simplified)
        if brightness > 4000:
            genre = "bright"
        elif timbre > 5:
            genre = "rhythmic"
        else:
            genre = "melodic"

        # Create track ID
        track_id = audio_file.stem.replace(" ", "_").replace("-", "_")

        # Save processed audio
        processed_path = PROCESSED_DIR / f"{track_id}.wav"
        sf.write(str(processed_path), y, sr)

        # Create metadata JSON
        metadata = {
            "track_id": track_id,
            "source": audio_file.name,
            "duration": float(duration),
            "sample_rate": sr,
            "lyrics": "instrumental",
            "genre": genre,
            "mood": mood,
            "energy": float(energy),
            "brightness": float(brightness),
            "timbre": float(timbre),
            "key": key,
        }

        # Save metadata
        metadata_path = METADATA_DIR / f"{track_id}.json"
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)

        metadata_list.append(metadata)
        processed_count += 1
        print(f"✓ ({duration:.1f}s)")

    except Exception as e:
        print(f"✗ ({str(e)[:40]})")
        error_count += 1
        continue

print(f"\n✓ Processed: {processed_count} files")
print(f"✗ Errors: {error_count} files")
print(f"→ Output: {PROCESSED_DIR}")

# ============================================================================
# STEP 3: Create train/val/test splits
# ============================================================================
print("\n[3/4] Creating train/val/test splits...")
print("-" * 70)

random.seed(42)  # Reproducible splits
random.shuffle(metadata_list)

total = len(metadata_list)
train_size = int(0.8 * total)
val_size = int(0.1 * total)

train_split = metadata_list[:train_size]
val_split = metadata_list[train_size:train_size+val_size]
test_split = metadata_list[train_size+val_size:]

# Write split files
for split_name, split_data in [
    ("train", train_split),
    ("val", val_split),
    ("test", test_split),
]:
    split_file = SPLIT_DIR / f"{split_name}.txt"
    with open(split_file, 'w') as f:
        for meta in split_data:
            f.write(meta["track_id"] + "\n")
    print(f"  {split_name}: {len(split_data)} tracks → {split_file.name}")

# ============================================================================
# STEP 4: Summary statistics
# ============================================================================
print("\n[4/4] Summary Statistics")
print("-" * 70)

if metadata_list:
    durations = [m["duration"] for m in metadata_list]
    energies = [m["energy"] for m in metadata_list]
    brightnesses = [m["brightness"] for m in metadata_list]

    moods = defaultdict(int)
    genres = defaultdict(int)
    for m in metadata_list:
        moods[m["mood"]] += 1
        genres[m["genre"]] += 1

    print(f"""
Dataset Statistics:
  Total tracks: {total}
  Train/Val/Test: {len(train_split)}/{len(val_split)}/{len(test_split)}

Duration:
  Min: {min(durations):.1f}s
  Max: {max(durations):.1f}s
  Mean: {np.mean(durations):.1f}s

Energy:
  Min: {min(energies):.3f}
  Max: {max(energies):.3f}
  Mean: {np.mean(energies):.3f}

Brightness:
  Min: {min(brightnesses):.0f}
  Max: {max(brightnesses):.0f}
  Mean: {np.mean(brightnesses):.0f}

Mood Distribution:
{chr(10).join(f"  {mood}: {count}" for mood, count in sorted(moods.items()))}

Genre Distribution:
{chr(10).join(f"  {genre}: {count}" for genre, count in sorted(genres.items()))}
    """)

# ============================================================================
# TRAINING-READY CHECK
# ============================================================================
print("\n" + "=" * 70)
print("✓ PHASE 1 STEP 2 COMPLETE")
print("=" * 70)

if processed_count >= 100:
    print(f"""
✓ Training data is ready!

Next steps:
  1. Review dataset: ls -lah {PROCESSED_DIR}
  2. Start training: python3 fine_tune_musicgen_1660.py
  3. Monitor training: open https://wandb.ai (free account)

Dataset location:
  - Processed audio: {PROCESSED_DIR}/
  - Metadata: {METADATA_DIR}/
  - Splits: {SPLIT_DIR}/
  - Estimated size: {sum(durations):.0f}s of audio ({processed_count * 1.5:.0f}MB)

Ready to fine-tune! 🎵
    """)
else:
    print(f"""
⚠️  Dataset is small ({processed_count} tracks)

To get better results, download more training data:
  1. Run: python3 collect_data.py
  2. Download more from:
     - Incompetech torrent (400 tracks)
     - Free Music Archive (100+ tracks)
     - YouTube playlists (100+ tracks)
  3. Extract to: {RAW_DIR}/
  4. Run this script again

Target: 500+ tracks for production quality
Current: {processed_count} tracks
    """)
