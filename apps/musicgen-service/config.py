"""Configuration management for MusicGen inference server."""
import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings."""

    # Server configuration
    HOST: str = os.getenv("MUSICGEN_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("MUSICGEN_PORT", "5000"))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    WORKERS: int = int(os.getenv("GUNICORN_WORKERS", "2"))

    # Model configuration
    MUSICGEN_MODEL: str = os.getenv("MUSICGEN_MODEL", "facebook/musicgen-large")
    DEVICE: str = os.getenv("DEVICE", "cuda")
    USE_FP16: bool = os.getenv("USE_FP16", "true").lower() == "true"
    CACHE_DIR: str = os.getenv("HF_HOME", "/app/models")

    # TTS configuration
    TACOTRON2_MODEL: str = os.getenv("TACOTRON2_MODEL", "tacotron2")
    HIFIGAN_MODEL: str = os.getenv("HIFIGAN_MODEL", "hifigan")
    ENABLE_TTS: bool = os.getenv("ENABLE_TTS", "true").lower() == "true"

    # Generation defaults
    DEFAULT_DURATION: int = 30  # seconds
    MAX_DURATION: int = 120  # seconds
    DEFAULT_TOP_K: int = 250
    DEFAULT_TOP_P: float = 0.0
    DEFAULT_TEMPERATURE: float = 1.0
    BATCH_SIZE: int = 4

    # Queue configuration
    MAX_QUEUE_SIZE: int = 100
    QUEUE_TIMEOUT: int = 3600  # seconds

    # Audio output
    SAMPLE_RATE: int = 32000
    CHANNELS: int = 1

    # Streaming
    CHUNK_DURATION: float = 0.5  # seconds per chunk
    ENABLE_STREAMING: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()


def get_model_path(model_name: str) -> Path:
    """Get or create model cache path."""
    model_path = Path(settings.CACHE_DIR) / model_name
    model_path.mkdir(parents=True, exist_ok=True)
    return model_path


def validate_duration(duration: int) -> int:
    """Validate and clamp duration to allowed range."""
    return max(1, min(duration, settings.MAX_DURATION))


def validate_temperature(temperature: float) -> float:
    """Validate and clamp temperature to allowed range."""
    return max(0.0, min(temperature, 2.0))


def validate_top_p(top_p: float) -> float:
    """Validate and clamp top_p to allowed range."""
    return max(0.0, min(top_p, 1.0))
