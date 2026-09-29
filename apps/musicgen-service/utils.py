"""Utility functions for MusicGen inference server."""
import io
import logging
from typing import Tuple, Optional
import numpy as np
import librosa
import torch
import torchaudio

logger = logging.getLogger(__name__)


def setup_logging(level: str = "INFO") -> None:
    """Configure logging for the application."""
    logging.basicConfig(
        level=getattr(logging, level.upper()),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )


def audio_to_numpy(audio_path: str) -> Tuple[np.ndarray, int]:
    """Load audio file and convert to numpy array."""
    try:
        audio, sr = librosa.load(audio_path, sr=None)
        return audio, sr
    except Exception as e:
        logger.error(f"Failed to load audio: {e}")
        raise


def numpy_to_bytes(audio: np.ndarray, sr: int, format: str = "wav") -> bytes:
    """Convert numpy array to audio bytes."""
    try:
        # Ensure audio is in correct range
        audio = np.clip(audio, -1.0, 1.0)

        # Convert to torch tensor
        tensor = torch.from_numpy(audio).float()

        # Create bytes buffer
        buffer = io.BytesIO()

        # Save to buffer
        torchaudio.save(buffer, tensor.unsqueeze(0), sr, format=format)
        buffer.seek(0)
        return buffer.getvalue()
    except Exception as e:
        logger.error(f"Failed to convert audio to bytes: {e}")
        raise


def bytes_to_numpy(audio_bytes: bytes, sr: int = None) -> Tuple[np.ndarray, int]:
    """Convert audio bytes to numpy array."""
    try:
        buffer = io.BytesIO(audio_bytes)
        tensor, sample_rate = torchaudio.load(buffer)
        audio = tensor.squeeze().numpy()

        # Resample if needed
        if sr and sr != sample_rate:
            audio = librosa.resample(audio, orig_sr=sample_rate, target_sr=sr)
            sample_rate = sr

        return audio, sample_rate
    except Exception as e:
        logger.error(f"Failed to convert bytes to audio: {e}")
        raise


def normalize_audio(audio: np.ndarray, target_max: float = 0.95) -> np.ndarray:
    """Normalize audio to prevent clipping."""
    max_val = np.max(np.abs(audio))
    if max_val > 0:
        audio = audio * (target_max / max_val)
    return audio


def concatenate_audio(audio_list: list, sr: int) -> np.ndarray:
    """Concatenate multiple audio arrays."""
    try:
        # Resample all to same rate if needed
        resampled = []
        for audio in audio_list:
            if len(audio.shape) > 1:
                audio = audio.mean(axis=1)
            resampled.append(audio)

        return np.concatenate(resampled)
    except Exception as e:
        logger.error(f"Failed to concatenate audio: {e}")
        raise


def get_audio_duration(audio: np.ndarray, sr: int) -> float:
    """Get duration of audio in seconds."""
    return len(audio) / sr


def pad_audio(audio: np.ndarray, target_length: int, pad_mode: str = "constant") -> np.ndarray:
    """Pad audio to target length."""
    if len(audio) >= target_length:
        return audio[:target_length]

    pad_length = target_length - len(audio)
    if pad_mode == "constant":
        return np.pad(audio, (0, pad_length), mode="constant", constant_values=0)
    elif pad_mode == "reflect":
        return np.pad(audio, (0, pad_length), mode="reflect")
    else:
        return np.pad(audio, (0, pad_length), mode=pad_mode)


def validate_text_prompt(text: str, max_length: int = 512) -> str:
    """Validate and clean text prompt."""
    text = text.strip()
    if len(text) == 0:
        raise ValueError("Prompt cannot be empty")
    if len(text) > max_length:
        text = text[:max_length]
        logger.warning(f"Prompt truncated to {max_length} characters")
    return text


def create_conditioning_vector(
    genre: Optional[str] = None,
    mood: Optional[str] = None,
    tempo: Optional[int] = None,
    key: Optional[str] = None,
    intensity: Optional[float] = None,
) -> dict:
    """Create conditioning vector from music parameters."""
    conditioning = {}

    if genre:
        conditioning["genre"] = genre.lower()

    if mood:
        conditioning["mood"] = mood.lower()

    if tempo:
        # Clamp tempo to 40-240 BPM
        conditioning["tempo"] = max(40, min(tempo, 240))

    if key:
        valid_keys = [
            "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
            "Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm",
        ]
        if key.upper() in valid_keys:
            conditioning["key"] = key.upper()

    if intensity is not None:
        # Clamp intensity to 0-1
        conditioning["intensity"] = max(0.0, min(intensity, 1.0))

    return conditioning


class AudioBuffer:
    """Efficient audio buffer for streaming."""

    def __init__(self, sr: int = 32000):
        self.sr = sr
        self.buffer = np.array([])
        self.position = 0

    def add_chunk(self, chunk: np.ndarray) -> None:
        """Add audio chunk to buffer."""
        if len(self.buffer) == 0:
            self.buffer = chunk
        else:
            self.buffer = np.concatenate([self.buffer, chunk])

    def get_chunk(self, chunk_duration: float) -> Optional[np.ndarray]:
        """Get next chunk from buffer."""
        chunk_samples = int(chunk_duration * self.sr)

        if self.position + chunk_samples <= len(self.buffer):
            chunk = self.buffer[self.position : self.position + chunk_samples]
            self.position += chunk_samples
            return chunk
        elif self.position < len(self.buffer):
            chunk = self.buffer[self.position :]
            self.position = len(self.buffer)
            return chunk
        else:
            return None

    def clear(self) -> None:
        """Clear buffer and reset position."""
        self.buffer = np.array([])
        self.position = 0

    def get_duration(self) -> float:
        """Get total duration of buffered audio."""
        return len(self.buffer) / self.sr
