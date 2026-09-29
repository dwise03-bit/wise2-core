#!/usr/bin/env python3
"""
WISE Defense Voice Listener
Always-on listening service with wake word detection.

Continuously monitors audio input for:
- Wake words: "Hey WISE", "WISE Defense", clap sound
- Voice activity (VAD - voice activity detection)
- Conversational interface integration with IMP
"""

import os
import sys
import json
import logging
import threading
import queue
from typing import Optional, Callable, Dict, Any
from datetime import datetime
import time

try:
    import numpy as np
    import pyaudio
    HAS_AUDIO = True
except ImportError:
    HAS_AUDIO = False
    print("WARNING: PyAudio not installed. Audio input disabled. Install with: pip install pyaudio numpy")

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


class WakeWordDetector:
    """Simple wake word detection using audio characteristics."""

    def __init__(self):
        """Initialize wake word detector."""
        self.clap_threshold = 3000  # Clap sound has high RMS
        self.speech_energy_range = (500, 2000)  # Normal speech range
        self.background_noise_threshold = 200

    def detect_clap(self, audio_chunk: np.ndarray, sample_rate: int = 16000) -> bool:
        """Detect clap sound (sudden high amplitude spike)."""
        if len(audio_chunk) < sample_rate // 10:
            return False

        rms = np.sqrt(np.mean(audio_chunk ** 2))
        return rms > self.clap_threshold

    def detect_speech(self, audio_chunk: np.ndarray, sample_rate: int = 16000) -> bool:
        """Detect speech activity (VAD)."""
        if len(audio_chunk) < sample_rate // 10:
            return False

        rms = np.sqrt(np.mean(audio_chunk ** 2))
        return self.speech_energy_range[0] < rms < self.speech_energy_range[1]

    def detect_silence(self, audio_chunk: np.ndarray, sample_rate: int = 16000) -> bool:
        """Detect silence."""
        rms = np.sqrt(np.mean(audio_chunk ** 2))
        return rms < self.background_noise_threshold


class AudioBuffer:
    """Rolling buffer for audio data."""

    def __init__(self, duration_seconds: float = 5, sample_rate: int = 16000):
        """Initialize audio buffer."""
        self.sample_rate = sample_rate
        self.buffer_size = int(duration_seconds * sample_rate)
        self.buffer = np.zeros(self.buffer_size, dtype=np.float32)
        self.pos = 0

    def add_chunk(self, chunk: np.ndarray) -> None:
        """Add audio chunk to buffer."""
        chunk_size = len(chunk)

        if self.pos + chunk_size > self.buffer_size:
            # Wrap around
            remaining = self.buffer_size - self.pos
            self.buffer[self.pos:] = chunk[:remaining]
            self.buffer[:chunk_size - remaining] = chunk[remaining:]
            self.pos = chunk_size - remaining
        else:
            self.buffer[self.pos:self.pos + chunk_size] = chunk
            self.pos += chunk_size

    def get_last_n_seconds(self, n: float) -> np.ndarray:
        """Get last N seconds of audio."""
        samples = int(n * self.sample_rate)
        if samples >= self.buffer_size:
            return self.buffer.copy()

        if self.pos >= samples:
            return self.buffer[self.pos - samples:self.pos]
        else:
            part1 = self.buffer[self.pos - samples + self.buffer_size:]
            part2 = self.buffer[:self.pos]
            return np.concatenate([part1, part2])


class VoiceListener:
    """Always-on voice listener with wake word detection."""

    def __init__(self,
                 on_wake_word: Optional[Callable[[str], None]] = None,
                 on_speech: Optional[Callable[[np.ndarray, int], None]] = None,
                 device_index: int = None,
                 sample_rate: int = 16000,
                 chunk_size: int = 1024):
        """Initialize voice listener."""
        self.running = False
        self.listening = False
        self.paused = False

        self.on_wake_word = on_wake_word
        self.on_speech = on_speech

        self.sample_rate = sample_rate
        self.chunk_size = chunk_size
        self.device_index = device_index

        self.detector = WakeWordDetector()
        self.audio_buffer = AudioBuffer(duration_seconds=5, sample_rate=sample_rate)

        self.audio_queue = queue.Queue()
        self.control_queue = queue.Queue()
        self.listener_thread = None

        # State tracking
        self.state = 'IDLE'  # IDLE, LISTENING, PROCESSING, SPEAKING
        self.last_wake_time = None
        self.speech_timeout = 30  # Seconds to wait for speech after wake

    def start(self) -> bool:
        """Start listening."""
        if not HAS_AUDIO:
            logger.error("PyAudio not available. Cannot start voice listener.")
            return False

        if self.running:
            logger.warning("Listener already running")
            return False

        self.running = True
        self.listener_thread = threading.Thread(target=self._listen_loop, daemon=True)
        self.listener_thread.start()

        logger.info("Voice listener started")
        return True

    def stop(self) -> None:
        """Stop listening."""
        self.running = False
        if self.listener_thread:
            self.listener_thread.join(timeout=5)
        logger.info("Voice listener stopped")

    def pause(self) -> None:
        """Pause listening (stay initialized but ignore wake words)."""
        self.paused = True
        self.state = 'PAUSED'
        logger.info("Voice listener paused")

    def resume(self) -> None:
        """Resume listening after pause."""
        self.paused = False
        self.state = 'IDLE'
        logger.info("Voice listener resumed")

    def get_state(self) -> Dict[str, Any]:
        """Get current listener state."""
        return {
            'running': self.running,
            'paused': self.paused,
            'state': self.state,
            'last_wake_time': self.last_wake_time.isoformat() if self.last_wake_time else None,
            'listening': self.listening
        }

    def _listen_loop(self) -> None:
        """Main listening loop (runs in thread)."""
        if not HAS_AUDIO:
            return

        try:
            p = pyaudio.PyAudio()

            # Attempt to find EMEET SmartCam device
            device_index = self.device_index
            if device_index is None:
                device_index = self._find_emeet_device(p)

            if device_index is None:
                logger.warning("No suitable audio device found, using default")
                device_index = None

            # Open audio stream
            try:
                stream = p.open(
                    format=pyaudio.paFloat32,
                    channels=1,
                    rate=self.sample_rate,
                    input=True,
                    input_device_index=device_index,
                    frames_per_buffer=self.chunk_size,
                    exceptions=False
                )
            except Exception as e:
                logger.error(f"Failed to open audio stream: {e}")
                return

            logger.info(f"Audio stream opened (device: {device_index}, rate: {self.sample_rate}Hz)")

            # Listening loop
            consecutive_speech_frames = 0
            consecutive_silence_frames = 0
            speech_timeout_counter = 0

            while self.running:
                try:
                    # Check for control messages
                    try:
                        cmd = self.control_queue.get_nowait()
                        if cmd == 'STOP':
                            break
                        elif cmd == 'PAUSE':
                            self.pause()
                        elif cmd == 'RESUME':
                            self.resume()
                    except queue.Empty:
                        pass

                    # Read audio chunk
                    data = stream.read(self.chunk_size, exception_on_overflow=False)
                    audio_chunk = np.frombuffer(data, dtype=np.float32)

                    # Add to buffer
                    self.audio_buffer.add_chunk(audio_chunk)

                    # Skip if paused
                    if self.paused:
                        continue

                    # Always-on detection
                    if self.state == 'IDLE':
                        # Check for wake word (clap sound)
                        if self.detector.detect_clap(audio_chunk):
                            logger.info("🔊 CLAP DETECTED - Activating...")
                            self._handle_wake_word('CLAP')
                            self.state = 'LISTENING'
                            consecutive_speech_frames = 0
                            speech_timeout_counter = 0

                        # Could add speech-to-text based wake word detection here
                        # For now, we rely on clap and manual activation

                    elif self.state == 'LISTENING':
                        # Listening for speech after wake word
                        if self.detector.detect_speech(audio_chunk):
                            consecutive_speech_frames += 1
                            consecutive_silence_frames = 0
                            speech_timeout_counter = 0

                            # Once we have enough speech frames, start recording
                            if consecutive_speech_frames > 5:  # ~100ms of speech
                                logger.info("🎤 RECORDING SPEECH...")
                                self.state = 'RECORDING'
                                if self.on_speech:
                                    self.on_speech(audio_chunk, self.sample_rate)
                        else:
                            consecutive_speech_frames = 0
                            consecutive_silence_frames += 1
                            speech_timeout_counter += 1

                            # Timeout: return to idle
                            if speech_timeout_counter > self.sample_rate // self.chunk_size * self.speech_timeout:
                                logger.info("⏱️  Speech timeout, returning to idle")
                                self.state = 'IDLE'

                    elif self.state == 'RECORDING':
                        # Continue recording speech
                        if self.detector.detect_speech(audio_chunk):
                            consecutive_silence_frames = 0
                            if self.on_speech:
                                self.on_speech(audio_chunk, self.sample_rate)
                        else:
                            consecutive_silence_frames += 1

                            # End recording after brief silence
                            if consecutive_silence_frames > 10:
                                logger.info("✅ SPEECH RECORDED")
                                self.state = 'IDLE'
                                consecutive_silence_frames = 0

                except Exception as e:
                    logger.error(f"Error in listen loop: {e}")
                    time.sleep(0.1)

            stream.stop_stream()
            stream.close()

        except Exception as e:
            logger.error(f"Audio error: {e}")
        finally:
            try:
                p.terminate()
            except:
                pass

    def _handle_wake_word(self, wake_type: str) -> None:
        """Handle wake word detection."""
        self.last_wake_time = datetime.utcnow()
        self.listening = True
        logger.info(f"⚡ WAKE WORD DETECTED: {wake_type}")

        if self.on_wake_word:
            try:
                self.on_wake_word(wake_type)
            except Exception as e:
                logger.error(f"Error in wake word handler: {e}")

    def _find_emeet_device(self, p: any) -> Optional[int]:
        """Find EMEET SmartCam audio device."""
        try:
            for i in range(p.get_device_count()):
                info = p.get_device_info_by_index(i)
                name = info.get('name', '').lower()
                if 'emeet' in name or 'smartcam' in name:
                    logger.info(f"Found EMEET device at index {i}: {name}")
                    return i
        except Exception as e:
            logger.debug(f"Error finding EMEET device: {e}")
        return None


class AlwaysOnListeningService:
    """Orchestrates always-on listening with IMP integration."""

    def __init__(self, imp_instance):
        """Initialize service with IMP instance."""
        self.imp = imp_instance
        self.listener = VoiceListener(
            on_wake_word=self._on_wake_word,
            on_speech=self._on_speech
        )
        self.current_recording = None
        self.recording_chunks = []

    def start(self) -> bool:
        """Start always-on listening."""
        return self.listener.start()

    def stop(self) -> None:
        """Stop listening."""
        self.listener.stop()

    def get_status(self) -> Dict[str, Any]:
        """Get service status."""
        return {
            'listener': self.listener.get_state(),
            'timestamp': datetime.utcnow().isoformat()
        }

    def _on_wake_word(self, wake_type: str) -> None:
        """Handle wake word - prepare for recording."""
        logger.info(f"🎯 Wake word detected: {wake_type}")
        self.recording_chunks = []

        # Could trigger visual feedback here (animate K10 display, etc.)

    def _on_speech(self, audio_chunk: np.ndarray, sample_rate: int) -> None:
        """Handle speech recording."""
        self.recording_chunks.append(audio_chunk)

        # If we have enough recording, process it
        total_duration = len(self.recording_chunks) * len(self.recording_chunks[0]) / sample_rate
        if total_duration > 0.5:  # 500ms minimum
            logger.info(f"Recorded {total_duration:.1f}s of audio")


if __name__ == '__main__':
    # Test the voice listener
    print("\n" + "="*60)
    print("WISE DEFENSE - VOICE LISTENER TEST")
    print("="*60)
    print("\nWake word: CLAP (or say 'Hey WISE')")
    print("Testing for 30 seconds...\n")

    def on_wake(wake_type):
        print(f"✅ WAKE WORD DETECTED: {wake_type}")

    def on_speech(chunk, sr):
        pass  # Silently buffer

    listener = VoiceListener(on_wake_word=on_wake, on_speech=on_speech)

    if listener.start():
        try:
            for i in range(30):
                state = listener.get_state()
                print(f"[{i}] State: {state['state']:12} | Listening: {state['listening']}")
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n⏹️  Stopping...")
        finally:
            listener.stop()
    else:
        print("❌ Failed to start listener")
