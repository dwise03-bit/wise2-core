"""Configuration management for voice synthesis service."""

import os
from pathlib import Path
from typing import Optional
import torch
import yaml
from pydantic import BaseSettings, Field


class AudioConfig(BaseSettings):
    """Audio processing configuration."""

    sample_rate: int = Field(22050, description="Sample rate in Hz")
    n_fft: int = Field(1024, description="FFT size")
    hop_length: int = Field(256, description="Hop length")
    n_mels: int = Field(80, description="Number of mel bins")
    f_min: int = Field(40, description="Minimum frequency")
    f_max: int = Field(11025, description="Maximum frequency")
    ref_db: float = Field(20.0, description="Reference dB for normalization")
    min_db: float = Field(-100.0, description="Minimum dB")
    normalize: bool = Field(True, description="Normalize audio")
    preemphasis: float = Field(0.97, description="Preemphasis coefficient")


class ModelConfig(BaseSettings):
    """Model configuration."""

    # Tacotron2 config
    encoder_hidden_dim: int = Field(512, description="Encoder hidden dimension")
    encoder_num_layers: int = Field(1, description="Encoder number of layers")
    encoder_kernel_size: int = Field(5, description="Encoder kernel size")
    encoder_dropout: float = Field(0.5, description="Encoder dropout")

    # Decoder config
    decoder_hidden_dim: int = Field(1024, description="Decoder hidden dimension")
    decoder_num_layers: int = Field(2, description="Decoder number of layers")
    decoder_dropout: float = Field(0.5, description="Decoder dropout")

    # Attention config
    attention_dim: int = Field(128, description="Attention dimension")
    attention_location_kernel_size: int = Field(31, description="Attention location kernel size")

    # Speaker embedding
    speaker_embed_dim: int = Field(256, description="Speaker embedding dimension")
    speaker_embed_layers: int = Field(2, description="Speaker embedding layers")

    # Pitch prediction
    pitch_hidden_dim: int = Field(256, description="Pitch predictor hidden dimension")
    pitch_num_layers: int = Field(2, description="Pitch predictor layers")
    pitch_kernel_size: int = Field(3, description="Pitch predictor kernel size")


class TrainingConfig(BaseSettings):
    """Training configuration."""

    batch_size: int = Field(32, description="Batch size")
    learning_rate: float = Field(1e-3, description="Learning rate")
    weight_decay: float = Field(1e-6, description="Weight decay")
    epochs: int = Field(1000, description="Number of epochs")
    warmup_steps: int = Field(4000, description="Warmup steps")
    checkpoint_interval: int = Field(5, description="Checkpoint interval (epochs)")
    max_norm: float = Field(400.0, description="Gradient clipping max norm")


class VoiceParameterConfig(BaseSettings):
    """Voice parameter configuration."""

    # Pitch shifting
    pitch_shift_range: tuple = Field((−24, 24), description="Pitch shift range (semitones)")

    # Vibrato
    vibrato_amount_range: tuple = Field((0, 100), description="Vibrato amount % range")
    vibrato_rate_range: tuple = Field((4, 10), description="Vibrato rate Hz range")

    # Breathiness
    breathiness_range: tuple = Field((0, 100), description="Breathiness % range")

    # Speed
    speed_range: tuple = Field((0.5, 2.0), description="Speed multiplier range")

    # Formant shift (for gender-like effect)
    formant_shift_range: tuple = Field((−0.5, 0.5), description="Formant shift semitones")

    # Vocal character presets
    vocal_characters: dict = Field(
        {
            "breathy": {"breathiness": 80, "formant_shift": 0},
            "raspy": {"breathiness": 50, "pitch_noise": 0.3},
            "clear": {"breathiness": 10, "formant_shift": 0},
            "warm": {"formant_shift": −2, "vibrato_amount": 30},
            "powerful": {"breathiness": 5, "pitch_emphasis": 1.2},
            "soft": {"breathiness": 40, "speed": 0.9},
        },
        description="Preset vocal character configurations",
    )


class Config(BaseSettings):
    """Main configuration."""

    # Environment
    environment: str = Field("development", description="Environment")
    debug: bool = Field(True, description="Debug mode")
    device: str = Field("cuda" if torch.cuda.is_available() else "cpu", description="Torch device")

    # Paths
    data_dir: Path = Field(Path("data"), description="Data directory")
    models_dir: Path = Field(Path("models"), description="Models directory")
    output_dir: Path = Field(Path("output"), description="Output directory")
    logs_dir: Path = Field(Path("logs"), description="Logs directory")

    # API
    api_host: str = Field("0.0.0.0", description="API host")
    api_port: int = Field(5000, description="API port")
    api_workers: int = Field(4, description="Number of API workers")

    # Sub-configs
    audio: AudioConfig = Field(default_factory=AudioConfig)
    model: ModelConfig = Field(default_factory=ModelConfig)
    training: TrainingConfig = Field(default_factory=TrainingConfig)
    voice_params: VoiceParameterConfig = Field(default_factory=VoiceParameterConfig)

    # Feature flags
    enable_voice_cloning: bool = Field(True, description="Enable voice cloning")
    enable_singing: bool = Field(True, description="Enable singing synthesis")
    enable_emotion: bool = Field(True, description="Enable emotion conditioning")
    enable_cache: bool = Field(True, description="Enable result caching")

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "allow"

    def __init__(self, **data):
        """Initialize config and create directories."""
        super().__init__(**data)
        self._create_directories()

    def _create_directories(self):
        """Create necessary directories."""
        for dir_path in [self.data_dir, self.models_dir, self.output_dir, self.logs_dir]:
            dir_path.mkdir(parents=True, exist_ok=True)

    @classmethod
    def from_yaml(cls, yaml_path: str) -> "Config":
        """Load config from YAML file."""
        with open(yaml_path, "r") as f:
            data = yaml.safe_load(f)
        return cls(**data)

    def to_dict(self) -> dict:
        """Convert config to dictionary."""
        return {
            "environment": self.environment,
            "debug": self.debug,
            "device": self.device,
            "audio": self.audio.dict(),
            "model": self.model.dict(),
            "training": self.training.dict(),
            "voice_params": self.voice_params.dict(),
            "enable_voice_cloning": self.enable_voice_cloning,
            "enable_singing": self.enable_singing,
            "enable_emotion": self.enable_emotion,
            "enable_cache": self.enable_cache,
        }


# Load config from environment or default
def get_config() -> Config:
    """Get configuration instance."""
    config_path = os.getenv("CONFIG_PATH", "config/default.yaml")
    if os.path.exists(config_path):
        return Config.from_yaml(config_path)
    return Config()


# Global config instance
config = get_config()
