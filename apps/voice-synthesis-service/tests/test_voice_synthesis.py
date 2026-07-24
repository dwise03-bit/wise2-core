"""Tests for voice synthesis service."""

import pytest
import numpy as np
import torch
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.config import config
from src.voice_engine import VoiceEngine, TextEncoder
from src.singing_synthesis import SingSynthesizer, Melody, Note
from src.voice_cloning import VoiceCloner
from src.voice_parameters import VoiceParameterProcessor, VoiceParameters


class TestTextEncoder:
    """Tests for text encoding."""

    def test_encode(self):
        """Test text encoding."""
        encoder = TextEncoder()
        indices = encoder.encode("hello")
        assert len(indices) > 0
        assert all(isinstance(i, (int, np.integer)) for i in indices)

    def test_decode(self):
        """Test text decoding."""
        encoder = TextEncoder()
        indices = encoder.encode("hello")
        decoded = encoder.decode(indices)
        assert isinstance(decoded, str)
        assert len(decoded) > 0

    def test_empty_text(self):
        """Test empty text handling."""
        encoder = TextEncoder()
        indices = encoder.encode("")
        assert len(indices) == 0


class TestVoiceEngine:
    """Tests for voice engine."""

    def test_initialization(self):
        """Test engine initialization."""
        engine = VoiceEngine()
        assert engine.device in ["cpu", "cuda"]
        assert engine.text_encoder is not None
        assert engine.encoder is not None
        assert engine.decoder is not None
        assert engine.vocoder is not None

    def test_synthesize(self):
        """Test TTS synthesis."""
        engine = VoiceEngine()
        waveform, sr = engine.synthesize("Hello world")

        assert isinstance(waveform, np.ndarray)
        assert sr == config.audio.sample_rate
        assert len(waveform) > 0
        assert np.max(np.abs(waveform)) <= 1.0  # Normalized

    def test_synthesize_emotions(self):
        """Test synthesis with different emotions."""
        engine = VoiceEngine()

        for emotion in ["neutral", "happy", "sad", "angry"]:
            waveform, sr = engine.synthesize("Test", emotion=emotion)
            assert isinstance(waveform, np.ndarray)
            assert len(waveform) > 0

    def test_synthesize_speed(self):
        """Test synthesis with different speeds."""
        engine = VoiceEngine()

        waveform_normal, _ = engine.synthesize("Hello", speed=1.0)
        waveform_fast, _ = engine.synthesize("Hello", speed=1.5)
        waveform_slow, _ = engine.synthesize("Hello", speed=0.7)

        # Fast should be shorter than normal, slow should be longer
        assert len(waveform_fast) < len(waveform_normal)
        assert len(waveform_slow) > len(waveform_normal)

    def test_eval_mode(self):
        """Test model evaluation mode."""
        engine = VoiceEngine()
        engine.eval_mode()

        assert not engine.encoder.training
        assert not engine.decoder.training
        assert not engine.vocoder.training

    def test_mel_spectrogram(self):
        """Test mel-spectrogram computation."""
        engine = VoiceEngine()
        waveform = np.random.randn(22050)  # 1 second

        mel = engine.get_mel_spectrogram(waveform)

        assert isinstance(mel, np.ndarray)
        assert mel.shape[0] == config.audio.n_mels


class TestMelody:
    """Tests for melody handling."""

    def test_melody_creation(self):
        """Test melody creation."""
        notes = [
            Note(pitch=60, duration=0.5, start_time=0.0),
            Note(pitch=62, duration=0.5, start_time=0.5),
        ]
        melody = Melody(notes)

        assert len(melody.notes) == 2
        assert melody.duration == 1.0

    def test_midi_conversion(self):
        """Test MIDI to Hz conversion."""
        note = Note.from_midi(60, 0.5, 0.0)
        hz = note.midi_to_hz()

        # MIDI 60 = C4 = ~261.63 Hz
        assert 260 < hz < 263

    def test_pitch_contour(self):
        """Test pitch contour generation."""
        notes = [
            Note.from_midi(60, 0.5, 0.0),
            Note.from_midi(62, 0.5, 0.5),
        ]
        melody = Melody(notes)

        pitch_contour = melody.to_pitch_contour(1.0, 22050)

        assert len(pitch_contour) == 22050
        assert pitch_contour[0] > 0  # First note
        assert pitch_contour[-1] > 0  # Last note

    def test_frequency_contour(self):
        """Test frequency contour generation."""
        notes = [
            Note.from_midi(60, 1.0, 0.0),
        ]
        melody = Melody(notes)

        freq_contour = melody.to_frequency_contour(1.0, 22050)

        assert len(freq_contour) == 22050
        assert np.all(freq_contour > 0)


class TestSingSynthesizer:
    """Tests for singing synthesis."""

    def test_initialization(self):
        """Test synthesizer initialization."""
        engine = VoiceEngine()
        synth = SingSynthesizer(engine)

        assert synth.voice_engine is not None
        assert synth.aligner is not None
        assert synth.pitch_gen is not None

    def test_synthesize_singing(self):
        """Test singing synthesis."""
        engine = VoiceEngine()
        synth = SingSynthesizer(engine)

        notes = [
            Note.from_midi(60, 0.5, 0.0),
            Note.from_midi(62, 0.5, 0.5),
        ]
        melody = Melody(notes)

        waveform, sr = synth.synthesize_singing(
            lyrics="Test",
            melody=melody,
            vibrato_amount=30.0,
        )

        assert isinstance(waveform, np.ndarray)
        assert sr == config.audio.sample_rate
        assert len(waveform) > 0


class TestVoiceParameters:
    """Tests for voice parameters."""

    def test_parameter_validation(self):
        """Test parameter validation."""
        params = VoiceParameters(
            pitch_shift=5.0,
            vibrato_amount=50.0,
            speed=1.5,
        )

        assert params.validate()

    def test_invalid_parameters(self):
        """Test invalid parameters."""
        params = VoiceParameters(
            pitch_shift=50.0,  # Out of range
            vibrato_amount=150.0,  # Out of range
        )

        # Should still set values but validation fails
        assert not params.validate()

    def test_preset_loading(self):
        """Test preset loading."""
        processor = VoiceParameterProcessor()

        for character in ["breathy", "raspy", "clear", "warm", "powerful", "soft"]:
            params = processor.get_preset(character)
            assert isinstance(params, VoiceParameters)

    def test_pitch_shift(self):
        """Test pitch shifting."""
        processor = VoiceParameterProcessor()
        waveform = np.random.randn(22050)

        shifted = processor.apply_pitch_shift(waveform, 5.0)

        assert isinstance(shifted, np.ndarray)
        assert len(shifted) > 0

    def test_vibrato(self):
        """Test vibrato application."""
        processor = VoiceParameterProcessor()
        waveform = np.random.randn(22050)

        vibrato = processor.apply_vibrato(waveform, amount=30.0, rate=5.0)

        assert isinstance(vibrato, np.ndarray)
        assert len(vibrato) == len(waveform)

    def test_time_stretch(self):
        """Test time stretching."""
        processor = VoiceParameterProcessor()
        waveform = np.random.randn(22050)

        stretched = processor.apply_time_stretch(waveform, speed=1.5)

        assert isinstance(stretched, np.ndarray)
        assert len(stretched) < len(waveform)  # Faster = shorter

    def test_apply_all_parameters(self):
        """Test applying all parameters."""
        processor = VoiceParameterProcessor()
        waveform = np.random.randn(22050)

        params = VoiceParameters(
            pitch_shift=3.0,
            vibrato_amount=20.0,
            breathiness=30.0,
            speed=1.1,
            eq_bass=3.0,
        )

        processed = processor.apply_all_parameters(waveform, params)

        assert isinstance(processed, np.ndarray)
        assert np.max(np.abs(processed)) <= 1.0  # Normalized


class TestVoiceCloner:
    """Tests for voice cloning."""

    def test_initialization(self):
        """Test cloner initialization."""
        cloner = VoiceCloner()

        assert cloner.device in ["cpu", "cuda"]
        assert cloner.encoder is not None
        assert isinstance(cloner.speaker_profiles, dict)

    def test_list_speakers(self):
        """Test listing speakers."""
        cloner = VoiceCloner()
        speakers = cloner.list_speakers()

        assert isinstance(speakers, list)

    def test_speaker_similarity(self):
        """Test speaker similarity computation."""
        cloner = VoiceCloner()

        # Create mock speaker profiles
        if len(cloner.list_speakers()) >= 2:
            speakers = cloner.list_speakers()[:2]
            similarity = cloner.compute_speaker_similarity(speakers[0], speakers[1])

            assert isinstance(similarity, float)
            assert 0 <= similarity <= 1


class TestConfig:
    """Tests for configuration."""

    def test_config_loading(self):
        """Test config loading."""
        assert config is not None
        assert config.device in ["cpu", "cuda"]
        assert config.api_port > 0

    def test_config_to_dict(self):
        """Test config to dict conversion."""
        config_dict = config.to_dict()

        assert isinstance(config_dict, dict)
        assert "device" in config_dict
        assert "audio" in config_dict
        assert "model" in config_dict


@pytest.fixture
def engine():
    """Fixture for voice engine."""
    return VoiceEngine()


@pytest.fixture
def synthesizer(engine):
    """Fixture for singing synthesizer."""
    return SingSynthesizer(engine)


@pytest.fixture
def processor():
    """Fixture for parameter processor."""
    return VoiceParameterProcessor()


@pytest.fixture
def cloner():
    """Fixture for voice cloner."""
    return VoiceCloner()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
