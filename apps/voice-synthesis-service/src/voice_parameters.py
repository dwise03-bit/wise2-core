"""Voice parameter manipulation and control."""

import numpy as np
import librosa
from typing import Dict, Tuple, Optional
from dataclasses import dataclass, asdict
from loguru import logger

from config import config


@dataclass
class VoiceParameters:
    """Voice parameter configuration."""

    pitch_shift: float = 0.0  # Semitones, -24 to +24
    vibrato_amount: float = 30.0  # Percentage, 0-100
    vibrato_rate: float = 5.0  # Hz, 4-10
    breathiness: float = 0.0  # Percentage, 0-100
    vocal_character: str = "neutral"  # Preset: breathy, raspy, clear, warm, powerful, soft
    speed: float = 1.0  # Multiplier, 0.5-2.0
    formant_shift: float = 0.0  # Semitones for gender-like effect
    intensity: float = 1.0  # 0-2
    reverb_amount: float = 0.0  # 0-1
    eq_bass: float = 0.0  # Boost/cut in dB, -12 to +12
    eq_mid: float = 0.0
    eq_treble: float = 0.0

    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return asdict(self)

    def from_dict(self, data: dict) -> "VoiceParameters":
        """Load from dictionary."""
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        return self

    def validate(self) -> bool:
        """Validate parameter ranges."""
        config_voice = config.voice_params

        valid = (
            -24 <= self.pitch_shift <= 24
            and 0 <= self.vibrato_amount <= 100
            and 4 <= self.vibrato_rate <= 10
            and 0 <= self.breathiness <= 100
            and 0.5 <= self.speed <= 2.0
            and -0.5 <= self.formant_shift <= 0.5
        )

        if not valid:
            logger.warning(f"Invalid voice parameters: {self.to_dict()}")

        return valid


class VoiceParameterProcessor:
    """Apply voice parameter modifications to audio."""

    def __init__(self, sample_rate: int = None):
        """Initialize processor."""
        self.sample_rate = sample_rate or config.audio.sample_rate
        logger.info(f"VoiceParameterProcessor initialized (sr={self.sample_rate})")

    def apply_pitch_shift(self, waveform: np.ndarray, semitones: float) -> np.ndarray:
        """Apply pitch shift.

        Args:
            waveform: Input waveform
            semitones: Pitch shift in semitones

        Returns:
            Pitch-shifted waveform
        """
        if semitones == 0:
            return waveform

        logger.info(f"Applying pitch shift: {semitones} semitones")

        # Use librosa pitch shifting
        shifted = librosa.effects.pitch_shift(
            waveform, sr=self.sample_rate, n_steps=semitones, n_fft=2048
        )

        return shifted

    def apply_vibrato(
        self, waveform: np.ndarray, amount: float = 30.0, rate: float = 5.0
    ) -> np.ndarray:
        """Apply vibrato modulation.

        Args:
            waveform: Input waveform
            amount: Vibrato depth (cents, 0-100)
            rate: Vibrato rate in Hz

        Returns:
            Vibrato-modulated waveform
        """
        if amount == 0:
            return waveform

        logger.info(f"Applying vibrato: {amount}% @ {rate}Hz")

        # Convert cents to frequency ratio
        freq_ratio = 2 ** (amount / 1200.0)

        # Create time-varying phase modulation
        time = np.arange(len(waveform)) / self.sample_rate
        modulation = np.sin(2 * np.pi * rate * time)

        # Apply phase modulation using phase vocoder
        vibrato_waveform = librosa.effects.pitch_shift(
            waveform, sr=self.sample_rate, n_steps=amount / 100.0 * 2
        )

        # Blend original with vibrato
        blended = waveform * (1 - amount / 200) + vibrato_waveform * (amount / 200)

        return blended

    def apply_time_stretch(self, waveform: np.ndarray, speed: float) -> np.ndarray:
        """Apply time stretching (change speed without pitch).

        Args:
            waveform: Input waveform
            speed: Speed multiplier (0.5-2.0)

        Returns:
            Time-stretched waveform
        """
        if speed == 1.0:
            return waveform

        logger.info(f"Applying time stretch: {speed}x")

        stretched = librosa.effects.time_stretch(waveform, rate=speed)
        return stretched

    def apply_formant_shift(self, waveform: np.ndarray, semitones: float) -> np.ndarray:
        """Apply formant shifting (gender-like effect).

        Args:
            waveform: Input waveform
            semitones: Formant shift in semitones

        Returns:
            Formant-shifted waveform
        """
        if semitones == 0:
            return waveform

        logger.info(f"Applying formant shift: {semitones} semitones")

        # Use phase vocoder with different stretch factors
        # This creates a gender-like effect without changing pitch
        hop_length = 512
        stft = librosa.stft(waveform, hop_length=hop_length, n_fft=2048)

        # Stretch magnitude spectrum
        shift_factor = 2 ** (semitones / 12.0)
        stretched_stft = np.zeros_like(stft)

        for i in range(stft.shape[1]):
            for j in range(stft.shape[0]):
                new_j = int(j / shift_factor)
                if 0 <= new_j < stft.shape[0]:
                    stretched_stft[j, i] = stft[new_j, i]

        # Inverse STFT
        formant_shifted = librosa.istft(stretched_stft, hop_length=hop_length)

        return formant_shifted

    def apply_breathiness(self, waveform: np.ndarray, amount: float = 0.0) -> np.ndarray:
        """Add breathiness/airiness to voice.

        Args:
            waveform: Input waveform
            amount: Breathiness amount (0-100%)

        Returns:
            Breathy waveform
        """
        if amount == 0:
            return waveform

        logger.info(f"Applying breathiness: {amount}%")

        # Generate noise component
        noise = np.random.randn(len(waveform)) * 0.1
        noise = librosa.effects.time_stretch(noise, rate=2.0)  # High-frequency noise

        # Blend with original
        breathy = waveform * (1 - amount / 200) + noise * (amount / 200)

        return breathy

    def apply_reverb(self, waveform: np.ndarray, amount: float = 0.0) -> np.ndarray:
        """Apply simple reverb effect.

        Args:
            waveform: Input waveform
            amount: Reverb amount (0-1)

        Returns:
            Reverb-applied waveform
        """
        if amount == 0:
            return waveform

        logger.info(f"Applying reverb: {amount}")

        # Create delayed copies
        delay_samples = int(0.05 * self.sample_rate)  # 50ms delay
        delayed = np.zeros_like(waveform)
        delayed[delay_samples:] = waveform[:-delay_samples] * 0.7

        # Blend
        reverb = waveform * (1 - amount) + delayed * amount

        return reverb

    def apply_eq(
        self, waveform: np.ndarray, bass: float = 0, mid: float = 0, treble: float = 0
    ) -> np.ndarray:
        """Apply 3-band equalizer.

        Args:
            waveform: Input waveform
            bass: Bass boost/cut in dB (-12 to +12)
            mid: Mid boost/cut in dB
            treble: Treble boost/cut in dB

        Returns:
            EQ-processed waveform
        """
        if bass == 0 and mid == 0 and treble == 0:
            return waveform

        logger.info(f"Applying EQ: bass={bass}dB, mid={mid}dB, treble={treble}dB")

        # Compute STFT
        stft = librosa.stft(waveform)
        frequencies = librosa.fft_frequencies(sr=self.sample_rate)

        # Create frequency response
        response = np.ones_like(frequencies)

        # Bass (< 250 Hz)
        bass_mask = frequencies < 250
        response[bass_mask] *= 10 ** (bass / 20)

        # Mid (250 Hz - 4 kHz)
        mid_mask = (frequencies >= 250) & (frequencies < 4000)
        response[mid_mask] *= 10 ** (mid / 20)

        # Treble (> 4 kHz)
        treble_mask = frequencies >= 4000
        response[treble_mask] *= 10 ** (treble / 20)

        # Apply EQ
        eq_stft = stft * response[:, np.newaxis]

        # Inverse STFT
        eq_waveform = librosa.istft(eq_stft)

        return eq_waveform

    def apply_intensity(self, waveform: np.ndarray, intensity: float = 1.0) -> np.ndarray:
        """Apply intensity scaling (amplitude scaling with saturation).

        Args:
            waveform: Input waveform
            intensity: Intensity multiplier (0-2)

        Returns:
            Intensity-adjusted waveform
        """
        if intensity == 1.0:
            return waveform

        logger.info(f"Applying intensity: {intensity}x")

        # Scale amplitude
        scaled = waveform * intensity

        # Soft saturation
        scaled = np.tanh(scaled)

        return scaled

    def apply_all_parameters(
        self, waveform: np.ndarray, params: VoiceParameters
    ) -> np.ndarray:
        """Apply all voice parameters in sequence.

        Args:
            waveform: Input waveform
            params: VoiceParameters configuration

        Returns:
            Processed waveform
        """
        logger.info(f"Applying voice parameters: {params.to_dict()}")

        # Validate parameters
        params.validate()

        # Apply parameters in order
        # 1. Pitch shift (before time stretch)
        if params.pitch_shift != 0:
            waveform = self.apply_pitch_shift(waveform, params.pitch_shift)

        # 2. Formant shift
        if params.formant_shift != 0:
            waveform = self.apply_formant_shift(waveform, params.formant_shift)

        # 3. Vibrato
        if params.vibrato_amount > 0:
            waveform = self.apply_vibrato(waveform, params.vibrato_amount, params.vibrato_rate)

        # 4. Breathiness
        if params.breathiness > 0:
            waveform = self.apply_breathiness(waveform, params.breathiness)

        # 5. Time stretch (after pitch shift)
        if params.speed != 1.0:
            waveform = self.apply_time_stretch(waveform, params.speed)

        # 6. EQ
        if params.eq_bass != 0 or params.eq_mid != 0 or params.eq_treble != 0:
            waveform = self.apply_eq(waveform, params.eq_bass, params.eq_mid, params.eq_treble)

        # 7. Intensity
        if params.intensity != 1.0:
            waveform = self.apply_intensity(waveform, params.intensity)

        # 8. Reverb
        if params.reverb_amount > 0:
            waveform = self.apply_reverb(waveform, params.reverb_amount)

        # Normalize
        max_val = np.abs(waveform).max()
        if max_val > 1.0:
            waveform = waveform / max_val

        logger.info("Voice parameters applied successfully")
        return waveform

    def get_preset(self, character: str) -> VoiceParameters:
        """Get preset voice parameters.

        Args:
            character: Vocal character (breathy, raspy, clear, warm, powerful, soft)

        Returns:
            VoiceParameters preset
        """
        presets = {
            "breathy": VoiceParameters(
                breathiness=80,
                vibrato_amount=20,
                eq_treble=6,
                vocal_character="breathy",
            ),
            "raspy": VoiceParameters(
                breathiness=50,
                eq_mid=8,
                intensity=1.2,
                vocal_character="raspy",
            ),
            "clear": VoiceParameters(
                breathiness=10,
                eq_treble=3,
                intensity=1.1,
                vocal_character="clear",
            ),
            "warm": VoiceParameters(
                formant_shift=-2,
                vibrato_amount=30,
                eq_bass=3,
                eq_treble=-3,
                vocal_character="warm",
            ),
            "powerful": VoiceParameters(
                breathiness=5,
                intensity=1.3,
                eq_mid=5,
                vocal_character="powerful",
            ),
            "soft": VoiceParameters(
                breathiness=40,
                speed=0.9,
                vibrato_amount=20,
                intensity=0.8,
                vocal_character="soft",
            ),
        }

        return presets.get(character, VoiceParameters())
