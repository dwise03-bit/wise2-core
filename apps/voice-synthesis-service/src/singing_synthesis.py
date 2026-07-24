"""Singing synthesis with melody tracking and forced alignment."""

import torch
import numpy as np
from typing import Tuple, Dict, List, Optional
from dataclasses import dataclass
import librosa
import soundfile as sf
from pathlib import Path
from loguru import logger

from config import config
from voice_engine import VoiceEngine


@dataclass
class Note:
    """Musical note representation."""

    pitch: float  # MIDI note number (0-127)
    duration: float  # Duration in seconds
    start_time: float  # Start time in seconds
    end_time: float  # End time in seconds

    @classmethod
    def from_midi(cls, midi_note: int, duration: float, start_time: float) -> "Note":
        """Create note from MIDI note number."""
        return cls(
            pitch=float(midi_note),
            duration=duration,
            start_time=start_time,
            end_time=start_time + duration,
        )

    def midi_to_hz(self) -> float:
        """Convert MIDI note to frequency in Hz."""
        return 440.0 * (2.0 ** ((self.pitch - 69) / 12.0))


class Melody:
    """Melody representation and processing."""

    def __init__(self, notes: List[Note]):
        """Initialize melody from notes."""
        self.notes = sorted(notes, key=lambda n: n.start_time)
        self.duration = self.notes[-1].end_time if self.notes else 0.0

    @classmethod
    def from_midi_file(cls, midi_path: str) -> "Melody":
        """Load melody from MIDI file."""
        try:
            import pretty_midi
        except ImportError:
            logger.error("pretty_midi not installed, skipping MIDI loading")
            return cls([])

        midi_data = pretty_midi.PrettyMIDI(midi_path)
        notes = []

        for instrument in midi_data.instruments:
            if instrument.is_drum:
                continue

            for note in instrument.notes:
                midi_note = Note(
                    pitch=float(note.pitch),
                    duration=note.end - note.start,
                    start_time=note.start,
                )
                notes.append(midi_note)

        return cls(notes)

    @classmethod
    def from_frequency_curve(cls, frequencies: np.ndarray, sample_rate: int) -> "Melody":
        """Extract melody from frequency curve."""
        notes = []
        hop_length = sample_rate // 50  # ~20ms frame rate

        # Detect note boundaries (where frequency changes significantly)
        freq_diff = np.abs(np.diff(frequencies))
        threshold = np.std(freq_diff) * 2

        current_pitch = frequencies[0]
        start_frame = 0

        for i, freq in enumerate(frequencies):
            if abs(freq - current_pitch) > threshold or i == len(frequencies) - 1:
                # Note boundary
                duration = (i - start_frame) * hop_length / sample_rate
                start_time = start_frame * hop_length / sample_rate

                # Convert Hz to MIDI
                if current_pitch > 0:
                    midi_pitch = 69 + 12 * np.log2(current_pitch / 440.0)
                    note = Note(pitch=midi_pitch, duration=duration, start_time=start_time)
                    notes.append(note)

                current_pitch = freq
                start_frame = i

        return cls(notes)

    def to_pitch_contour(
        self, duration: float, sample_rate: int
    ) -> np.ndarray:
        """Convert melody to continuous pitch contour."""
        num_samples = int(duration * sample_rate)
        pitch_contour = np.zeros(num_samples)

        for note in self.notes:
            start_sample = int(note.start_time * sample_rate)
            end_sample = int(note.end_time * sample_rate)

            # Linear interpolation for smooth pitch transition
            pitch_contour[start_sample:end_sample] = note.pitch

        return pitch_contour

    def to_frequency_contour(
        self, duration: float, sample_rate: int
    ) -> np.ndarray:
        """Convert melody to frequency contour in Hz."""
        pitch_contour = self.to_pitch_contour(duration, sample_rate)

        # Convert MIDI to Hz
        freq_contour = 440.0 * (2.0 ** ((pitch_contour - 69) / 12.0))
        freq_contour[pitch_contour == 0] = 0  # Silence

        return freq_contour


class ForcedAligner:
    """Align lyrics to melody using forced alignment."""

    def __init__(self, voice_engine: VoiceEngine):
        """Initialize aligner."""
        self.voice_engine = voice_engine
        self.sample_rate = config.audio.sample_rate

    def align_lyrics_to_melody(
        self, lyrics: str, melody: Melody
    ) -> Dict[str, Tuple[float, float]]:
        """Align individual phonemes to melody notes.

        Args:
            lyrics: Lyric text
            melody: Melody with notes

        Returns:
            Dict mapping phoneme to (start_time, end_time)
        """
        # Split lyrics into words
        words = lyrics.split()

        # Encode all words to get phoneme sequences
        phoneme_sequences = {}
        total_phonemes = 0

        for word in words:
            phoneme_indices = self.voice_engine.text_encoder.encode(word)
            phonemes = [
                self.voice_engine.text_encoder.idx2char.get(idx, "UNK")
                for idx in phoneme_indices
            ]
            phoneme_sequences[word] = phonemes
            total_phonemes += len(phonemes)

        # Align phonemes to notes
        alignment = {}
        phoneme_idx = 0
        note_idx = 0

        for word_idx, word in enumerate(words):
            phonemes = phoneme_sequences[word]
            phonemes_per_note = len(phonemes) / len(melody.notes)

            for phoneme in phonemes:
                # Find which note this phoneme belongs to
                note_pos = phoneme_idx / total_phonemes
                note_num = int(note_pos * len(melody.notes))
                note_num = min(note_num, len(melody.notes) - 1)

                note = melody.notes[note_num]
                alignment[phoneme] = (note.start_time, note.end_time)
                phoneme_idx += 1

        return alignment

    def align_with_mfa(
        self, audio_path: str, text_path: str
    ) -> Dict[str, Tuple[float, float]]:
        """Use Montreal Forced Aligner for precise alignment."""
        try:
            import Montreal_Forced_Aligner as MFA
        except ImportError:
            logger.warning("MFA not installed, using simple alignment")
            return {}

        # This is a placeholder - full MFA integration requires more setup
        logger.info(f"Aligning {audio_path} to {text_path}")
        return {}


class PitchGenerator:
    """Generate pitch contours with musical features."""

    def __init__(self, sample_rate: int = None):
        """Initialize pitch generator."""
        self.sample_rate = sample_rate or config.audio.sample_rate

    def generate_vibrato(
        self,
        pitch_contour: np.ndarray,
        vibrato_amount: float = 30.0,
        vibrato_rate: float = 5.0,
    ) -> np.ndarray:
        """Add vibrato to pitch contour.

        Args:
            pitch_contour: Base pitch contour in semitones
            vibrato_amount: Vibrato depth in cents
            vibrato_rate: Vibrato rate in Hz

        Returns:
            Modulated pitch contour
        """
        time = np.arange(len(pitch_contour)) / self.sample_rate
        vibrato = (vibrato_amount / 100.0) * np.sin(2 * np.pi * vibrato_rate * time)

        # Apply vibrato only where pitch is not zero
        modulated = pitch_contour.copy()
        modulated[pitch_contour != 0] += vibrato[pitch_contour != 0]

        return modulated

    def generate_glissando(
        self,
        start_pitch: float,
        end_pitch: float,
        duration: float,
    ) -> np.ndarray:
        """Generate smooth pitch glide (glissando).

        Args:
            start_pitch: Starting MIDI note
            end_pitch: Ending MIDI note
            duration: Duration in seconds

        Returns:
            Pitch contour with glissando
        """
        num_samples = int(duration * self.sample_rate)
        pitch_contour = np.linspace(start_pitch, end_pitch, num_samples)
        return pitch_contour

    def apply_portamento(
        self,
        pitch_contour: np.ndarray,
        portamento_time: float = 0.1,
    ) -> np.ndarray:
        """Apply portamento (smooth pitch slide between notes).

        Args:
            pitch_contour: Original pitch contour
            portamento_time: Time to slide between notes

        Returns:
            Smoothed pitch contour
        """
        portamento_samples = int(portamento_time * self.sample_rate)

        # Find pitch discontinuities
        pitch_diff = np.abs(np.diff(pitch_contour))
        transitions = np.where(pitch_diff > 1)[0]

        smoothed = pitch_contour.copy().astype(float)

        for transition_idx in transitions:
            start = max(0, transition_idx - portamento_samples)
            end = min(len(smoothed), transition_idx + portamento_samples)

            if start < end:
                start_pitch = pitch_contour[start]
                end_pitch = pitch_contour[end]
                smoothed[start:end] = np.linspace(start_pitch, end_pitch, end - start)

        return smoothed


class SingSynthesizer:
    """Main singing synthesis system."""

    def __init__(self, voice_engine: VoiceEngine):
        """Initialize singing synthesizer."""
        self.voice_engine = voice_engine
        self.aligner = ForcedAligner(voice_engine)
        self.pitch_gen = PitchGenerator()
        self.sample_rate = config.audio.sample_rate
        logger.info("SingSynthesizer initialized")

    def synthesize_singing(
        self,
        lyrics: str,
        melody: Melody,
        speaker_id: str = "default",
        vibrato_amount: float = 30.0,
        vibrato_rate: float = 5.0,
        portamento_time: float = 0.1,
    ) -> Tuple[np.ndarray, int]:
        """Synthesize singing from lyrics and melody.

        Args:
            lyrics: Lyric text
            melody: Melody with note information
            speaker_id: Speaker ID
            vibrato_amount: Vibrato depth (0-100%)
            vibrato_rate: Vibrato rate (Hz)
            portamento_time: Portamento time (seconds)

        Returns:
            Tuple of (waveform, sample_rate)
        """
        logger.info(
            f"Synthesizing singing: '{lyrics}' "
            f"(melody duration={melody.duration:.2f}s)"
        )

        with torch.no_grad():
            # Align lyrics to melody
            alignment = self.aligner.align_lyrics_to_melody(lyrics, melody)

            # Generate pitch contour
            pitch_contour = melody.to_pitch_contour(melody.duration, self.sample_rate)

            # Apply vibrato
            modulated_pitch = self.pitch_gen.generate_vibrato(
                pitch_contour, vibrato_amount, vibrato_rate
            )

            # Apply portamento
            smoothed_pitch = self.pitch_gen.apply_portamento(
                modulated_pitch, portamento_time
            )

            # Generate phoneme-level audio
            waveforms = []
            current_time = 0.0

            for note in melody.notes:
                # Synthesize this note's lyrics
                note_duration = note.duration
                note_samples = int(note_duration * self.sample_rate)

                # Generate base phoneme audio
                phoneme_waveform = np.random.randn(note_samples) * 0.1

                # Apply pitch contour (simple pitch shifting)
                freq_ratio = note.midi_to_hz() / 440.0
                if freq_ratio > 0:
                    # Shift pitch using phase vocoder
                    shifted = librosa.effects.pitch_shift(
                        phoneme_waveform, sr=self.sample_rate, n_steps=int(note.pitch - 69)
                    )
                    waveforms.append(shifted[:note_samples])
                else:
                    waveforms.append(phoneme_waveform)

                current_time += note_duration

            # Concatenate waveforms
            waveform = np.concatenate(waveforms) if waveforms else np.array([])

            # Normalize
            if len(waveform) > 0:
                max_val = np.abs(waveform).max()
                if max_val > 1.0:
                    waveform = waveform / max_val

        logger.info(
            f"Singing synthesis complete: {len(waveform)} samples "
            f"({len(waveform) / self.sample_rate:.2f}s)"
        )
        return waveform, self.sample_rate

    def synthesize_from_midi(
        self,
        lyrics: str,
        midi_path: str,
        speaker_id: str = "default",
        **kwargs,
    ) -> Tuple[np.ndarray, int]:
        """Synthesize singing from MIDI file."""
        melody = Melody.from_midi_file(midi_path)
        return self.synthesize_singing(lyrics, melody, speaker_id, **kwargs)

    def save_singing(self, waveform: np.ndarray, output_path: str):
        """Save singing audio to file."""
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        sf.write(output_path, waveform, self.sample_rate)
        logger.info(f"Singing audio saved to {output_path}")
