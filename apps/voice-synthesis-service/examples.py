#!/usr/bin/env python3
"""Example usage of voice synthesis service."""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from src.voice_engine import VoiceEngine
from src.singing_synthesis import SingSynthesizer, Melody, Note
from src.voice_cloning import VoiceCloner
from src.voice_parameters import VoiceParameterProcessor, VoiceParameters
from src.config import config


def example_tts():
    """Example: Text-to-speech synthesis."""
    print("\n" + "="*60)
    print("EXAMPLE 1: Text-to-Speech Synthesis")
    print("="*60)

    engine = VoiceEngine()

    # Synthesize with different emotions
    emotions = ["neutral", "happy", "sad"]
    for emotion in emotions:
        print(f"\nSynthesizing with {emotion} emotion...")
        waveform, sr = engine.synthesize(
            text="I love WISE² Genesis",
            emotion=emotion,
            speed=1.0
        )

        output_path = f"output/tts_{emotion}.wav"
        engine.save_audio(waveform, output_path)
        print(f"✓ Saved to {output_path}")


def example_singing():
    """Example: Singing synthesis."""
    print("\n" + "="*60)
    print("EXAMPLE 2: Singing Synthesis")
    print("="*60)

    engine = VoiceEngine()
    synthesizer = SingSynthesizer(engine)

    # Create a simple melody
    notes = [
        Note.from_midi(60, 0.5, 0.0),   # C4 (0.5s)
        Note.from_midi(62, 0.5, 0.5),   # D4 (0.5s)
        Note.from_midi(64, 0.5, 1.0),   # E4 (0.5s)
        Note.from_midi(65, 1.0, 1.5),   # F4 (1.0s)
    ]
    melody = Melody(notes)

    # Synthesize
    print("Synthesizing singing...")
    waveform, sr = synthesizer.synthesize_singing(
        lyrics="I love WISE²",
        melody=melody,
        vibrato_amount=40.0,
        vibrato_rate=5.0,
        portamento_time=0.1
    )

    output_path = "output/singing.wav"
    synthesizer.save_singing(waveform, output_path)
    print(f"✓ Saved to {output_path}")


def example_voice_cloning():
    """Example: Voice cloning (requires audio samples)."""
    print("\n" + "="*60)
    print("EXAMPLE 3: Voice Cloning")
    print("="*60)

    cloner = VoiceCloner()

    # Note: This requires actual audio files
    print("\nExample voice cloning workflow:")
    print("1. Prepare 3-10 audio samples (3-30s each)")
    print("2. Create speaker profile:")

    # Pseudo-code (requires actual files)
    profile_code = """
    profile = cloner.create_speaker_profile(
        speaker_id="my_voice",
        audio_files=["sample1.wav", "sample2.wav", "sample3.wav"],
        name="My Name",
        gender="male"
    )
    print(f"Quality score: {profile.quality_score:.2f}")
    """
    print(profile_code)

    # List speakers
    speakers = cloner.list_speakers()
    if speakers:
        print(f"\nAvailable speakers: {speakers}")
        for speaker_id in speakers:
            profile = cloner.get_speaker_profile(speaker_id)
            print(f"  {speaker_id}: {profile.num_samples} samples, quality={profile.quality_score:.2f}")
    else:
        print("\nNo speaker profiles available yet.")


def example_voice_parameters():
    """Example: Apply voice parameters."""
    print("\n" + "="*60)
    print("EXAMPLE 4: Voice Parameters")
    print("="*60)

    engine = VoiceEngine()
    processor = VoiceParameterProcessor()

    # Synthesize base audio
    print("\nSynthesizing base audio...")
    waveform, sr = engine.synthesize("Hello world")

    # Apply different voice parameters
    modifications = [
        {
            "name": "Higher pitch",
            "params": VoiceParameters(pitch_shift=7.0, vibrato_amount=20.0)
        },
        {
            "name": "Breathy",
            "params": VoiceParameters(breathiness=80.0, vibrato_amount=30.0)
        },
        {
            "name": "Warm",
            "params": processor.get_preset("warm")
        },
        {
            "name": "Powerful",
            "params": processor.get_preset("powerful")
        },
    ]

    for modification in modifications:
        print(f"\nApplying: {modification['name']}")
        processed = processor.apply_all_parameters(waveform, modification['params'])

        output_name = modification['name'].lower().replace(" ", "_")
        output_path = f"output/params_{output_name}.wav"
        engine.save_audio(processed, output_path)
        print(f"✓ Saved to {output_path}")


def example_api_usage():
    """Example: Using the API directly."""
    print("\n" + "="*60)
    print("EXAMPLE 5: API Usage")
    print("="*60)

    print("\nCURL examples:\n")

    # Text-to-speech
    print("1. Text-to-Speech:")
    print("""curl -X POST http://localhost:5000/synthesize \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Hello world",
    "emotion": "happy",
    "speed": 1.0
  }' \\
  -o output.wav
""")

    # Singing synthesis
    print("\n2. Singing Synthesis:")
    print("""curl -X POST http://localhost:5000/sing \\
  -H "Content-Type: application/json" \\
  -d '{
    "lyrics": "I love WISE²",
    "melody": [
      {"pitch": 60, "duration": 0.5, "start_time": 0.0},
      {"pitch": 62, "duration": 0.5, "start_time": 0.5}
    ]
  }' \\
  -o singing.wav
""")

    # Voice cloning
    print("\n3. Voice Cloning:")
    print("""curl -X POST http://localhost:5000/clone-voice \\
  -F "speaker_id=john" \\
  -F "name=John Doe" \\
  -F "audio_files=@sample1.wav" \\
  -F "audio_files=@sample2.wav"
""")

    # Apply parameters
    print("\n4. Apply Voice Parameters:")
    print("""curl -X POST http://localhost:5000/apply-parameters \\
  -H "Content-Type: application/json" \\
  -d '{
    "audio_source": "speaker_id",
    "pitch_shift": 5.0,
    "vibrato_amount": 50.0,
    "breathiness": 30.0
  }' \\
  -o processed.wav
""")


def example_batch_processing():
    """Example: Batch processing multiple texts."""
    print("\n" + "="*60)
    print("EXAMPLE 6: Batch Processing")
    print("="*60)

    engine = VoiceEngine()

    texts = [
        "Welcome to WISE² Genesis",
        "This is an AI-native operating system",
        "Powered by voice synthesis technology"
    ]

    print(f"\nSynthesizing {len(texts)} texts...")
    results = engine.inference_batch(texts, emotions=["neutral"] * len(texts))

    for i, (waveform, sr) in enumerate(results):
        output_path = f"output/batch_{i:03d}.wav"
        engine.save_audio(waveform, output_path)
        print(f"✓ Saved {i+1}/{len(texts)} to {output_path}")


def main():
    """Run all examples."""
    print("\n" + "="*80)
    print(" " * 20 + "VOICE SYNTHESIS SERVICE - EXAMPLES")
    print("="*80)

    # Create output directory
    Path("output").mkdir(exist_ok=True)

    # Run examples
    try:
        example_tts()
        example_singing()
        example_voice_cloning()
        example_voice_parameters()
        example_api_usage()
        example_batch_processing()

    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1

    print("\n" + "="*80)
    print(" " * 25 + "ALL EXAMPLES COMPLETED!")
    print("="*80)
    print("\nOutput files saved to: output/")
    print("Start API server: python -m src.api")
    print("="*80 + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
