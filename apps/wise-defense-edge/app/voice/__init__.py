"""
WISE² Defense - Voice Listening Module

Always-on voice listening service with wake word detection.
Integrates with IMP for conversational control.
"""

from .voice_listener import VoiceListener, WakeWordDetector, AudioBuffer, AlwaysOnListeningService
from .imp_voice_integration import IMPVoiceOrchestrator

__version__ = "1.0.0"
__all__ = [
    "VoiceListener",
    "WakeWordDetector",
    "AudioBuffer",
    "AlwaysOnListeningService",
    "IMPVoiceOrchestrator",
]
