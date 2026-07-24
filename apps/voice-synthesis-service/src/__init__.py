"""Voice Synthesis Service for WISE² Genesis."""

__version__ = "1.0.0"
__author__ = "WISE² Team"
__description__ = "Production-grade voice synthesis with TTS, singing, and voice cloning"

from .voice_engine import VoiceEngine, TextEncoder, Tacotron2Encoder, Tacotron2Decoder, HiFiGANVocoder
from .singing_synthesis import SingSynthesizer, Melody, Note, ForcedAligner, PitchGenerator
from .voice_cloning import VoiceCloner, SpeakerProfile, SpeakerEncoder
from .voice_parameters import VoiceParameterProcessor, VoiceParameters
from .config import config, get_config, Config

__all__ = [
    "VoiceEngine",
    "SingSynthesizer",
    "VoiceCloner",
    "VoiceParameterProcessor",
    "VoiceParameters",
    "config",
    "get_config",
]
