"""
Discord Soundboard Integration
Trigger sounds/audio in Discord voice channels from MIDI controller
"""

import asyncio
import logging
import os
from typing import Optional, Dict, List, Any
from pathlib import Path
import json

logger = logging.getLogger(__name__)


class SoundboardLibrary:
    """Manages soundboard sound files and metadata"""

    def __init__(self, library_dir: str = "./sounds"):
        self.library_dir = Path(library_dir)
        self.library_dir.mkdir(exist_ok=True)
        self.sounds: Dict[str, Dict[str, Any]] = {}
        self.load_library()

    def load_library(self):
        """Load soundboard library from disk"""
        library_file = self.library_dir / "library.json"

        if library_file.exists():
            try:
                with open(library_file, 'r') as f:
                    self.sounds = json.load(f)
                logger.info(f"Loaded soundboard library: {len(self.sounds)} sounds")
            except Exception as e:
                logger.error(f"Error loading soundboard library: {e}")
                self.sounds = {}
        else:
            # Create default soundboard library
            self._create_default_library()

    def _create_default_library(self):
        """Create default soundboard with common production sounds"""
        self.sounds = {
            "kick": {
                "name": "Kick Drum",
                "file": "kick.wav",
                "category": "drums",
                "duration": 0.5,
                "description": "Deep 808 kick"
            },
            "snare": {
                "name": "Snare Hit",
                "file": "snare.wav",
                "category": "drums",
                "duration": 0.3,
                "description": "Crisp snare crack"
            },
            "hihat": {
                "name": "Hi-Hat",
                "file": "hihat.wav",
                "category": "drums",
                "duration": 0.15,
                "description": "Closed hi-hat"
            },
            "cymbal": {
                "name": "Crash Cymbal",
                "file": "cymbal.wav",
                "category": "drums",
                "duration": 2.0,
                "description": "Bright crash cymbal"
            },
            "bass": {
                "name": "Bass Tone",
                "file": "bass.wav",
                "category": "bass",
                "duration": 1.0,
                "description": "Warm bass note"
            },
            "lead": {
                "name": "Lead Synth",
                "file": "lead.wav",
                "category": "synth",
                "duration": 1.5,
                "description": "Bright synth lead"
            },
            "pad": {
                "name": "Pad Chord",
                "file": "pad.wav",
                "category": "synth",
                "duration": 4.0,
                "description": "Lush pad chord"
            },
            "uplifter": {
                "name": "Uplifter",
                "file": "uplifter.wav",
                "category": "effects",
                "duration": 2.0,
                "description": "Sweeping uplifter"
            },
            "transition": {
                "name": "Transition",
                "file": "transition.wav",
                "category": "effects",
                "duration": 1.0,
                "description": "Creative transition"
            },
            "applause": {
                "name": "Applause",
                "file": "applause.wav",
                "category": "sfx",
                "duration": 3.0,
                "description": "Crowd applause"
            },
            "ding": {
                "name": "Bell Ding",
                "file": "ding.wav",
                "category": "sfx",
                "duration": 0.8,
                "description": "Bright bell ding"
            },
            "notification": {
                "name": "Notification",
                "file": "notification.wav",
                "category": "sfx",
                "duration": 0.5,
                "description": "Alert notification tone"
            }
        }
        self.save_library()

    def save_library(self):
        """Save soundboard library to disk"""
        library_file = self.library_dir / "library.json"
        try:
            with open(library_file, 'w') as f:
                json.dump(self.sounds, f, indent=2)
            logger.info(f"Saved soundboard library: {len(self.sounds)} sounds")
        except Exception as e:
            logger.error(f"Error saving soundboard library: {e}")

    def get_sound(self, sound_id: str) -> Optional[Dict[str, Any]]:
        """Get sound by ID"""
        return self.sounds.get(sound_id)

    def get_all_sounds(self) -> Dict[str, Dict[str, Any]]:
        """Get all sounds"""
        return self.sounds

    def get_sounds_by_category(self, category: str) -> Dict[str, Dict[str, Any]]:
        """Get sounds filtered by category"""
        return {
            sound_id: sound
            for sound_id, sound in self.sounds.items()
            if sound.get("category") == category
        }

    def add_sound(self, sound_id: str, name: str, file: str, category: str,
                  duration: float, description: str = ""):
        """Add sound to library"""
        self.sounds[sound_id] = {
            "name": name,
            "file": file,
            "category": category,
            "duration": duration,
            "description": description
        }
        self.save_library()
        logger.info(f"Added sound: {sound_id}")

    def remove_sound(self, sound_id: str) -> bool:
        """Remove sound from library"""
        if sound_id in self.sounds:
            del self.sounds[sound_id]
            self.save_library()
            logger.info(f"Removed sound: {sound_id}")
            return True
        return False


class DiscordSoundboard:
    """
    Discord soundboard for triggering audio in voice channels
    Integrates with Sound Labs MIDI controller
    """

    def __init__(self, library_dir: str = "./sounds"):
        self.library = SoundboardLibrary(library_dir)
        self.active_sounds: Dict[str, Any] = {}
        self.sound_queue: asyncio.Queue = asyncio.Queue()

    async def play_sound(self, sound_id: str, voice_channel_id: Optional[str] = None) -> bool:
        """Queue sound for playback in voice channel"""
        sound = self.library.get_sound(sound_id)
        if not sound:
            logger.error(f"Sound not found: {sound_id}")
            return False

        try:
            await self.sound_queue.put({
                "sound_id": sound_id,
                "sound": sound,
                "voice_channel_id": voice_channel_id,
                "timestamp": asyncio.get_event_loop().time()
            })
            logger.info(f"Queued sound: {sound_id}")
            return True
        except Exception as e:
            logger.error(f"Error queuing sound: {e}")
            return False

    async def stop_sound(self, sound_id: str) -> bool:
        """Stop playing sound"""
        if sound_id in self.active_sounds:
            self.active_sounds[sound_id]["stopped"] = True
            logger.info(f"Stopped sound: {sound_id}")
            return True
        return False

    async def stop_all_sounds(self) -> bool:
        """Stop all playing sounds"""
        for sound_id in list(self.active_sounds.keys()):
            self.active_sounds[sound_id]["stopped"] = True
        logger.info("Stopped all sounds")
        return True

    def get_library(self) -> Dict[str, Dict[str, Any]]:
        """Get soundboard library"""
        return self.library.get_all_sounds()

    def get_library_by_category(self, category: str) -> Dict[str, Dict[str, Any]]:
        """Get sounds filtered by category"""
        return self.library.get_sounds_by_category(category)

    def get_active_sounds(self) -> Dict[str, Any]:
        """Get currently playing sounds"""
        return {
            sound_id: {
                "name": sound.get("name"),
                "category": sound.get("category"),
                "elapsed": asyncio.get_event_loop().time() - sound["timestamp"]
            }
            for sound_id, sound in self.active_sounds.items()
            if not sound.get("stopped", False)
        }

    def get_soundboard_state(self) -> Dict[str, Any]:
        """Get complete soundboard state"""
        return {
            "library_size": len(self.library.sounds),
            "categories": list(set(s.get("category") for s in self.library.sounds.values())),
            "active_sounds": self.get_active_sounds(),
            "queue_size": self.sound_queue.qsize()
        }


class SoundboardMidiMapper:
    """Maps MIDI controller pads to soundboard sounds"""

    def __init__(self, soundboard: DiscordSoundboard):
        self.soundboard = soundboard
        self.pad_mappings: Dict[int, str] = {}
        self._setup_default_mappings()

    def _setup_default_mappings(self):
        """Setup default pad-to-sound mappings (16 pads)"""
        # LIVE mode soundboard layout (4x4 pads)
        self.pad_mappings = {
            0: "kick",      # Pad 1 - Kick
            1: "snare",     # Pad 2 - Snare
            2: "hihat",     # Pad 3 - Hi-Hat
            3: "cymbal",    # Pad 4 - Cymbal
            4: "bass",      # Pad 5 - Bass
            5: "lead",      # Pad 6 - Lead Synth
            6: "pad",       # Pad 7 - Pad
            7: "uplifter",  # Pad 8 - Uplifter
            8: "transition",# Pad 9 - Transition
            9: "applause",  # Pad 10 - Applause
            10: "ding",     # Pad 11 - Ding
            11: "notification",  # Pad 12 - Notification
            12: None,       # Pad 13 - Reserved
            13: None,       # Pad 14 - Reserved
            14: None,       # Pad 15 - Reserved
            15: None,       # Pad 16 - Reserved
        }

    async def trigger_pad(self, pad_index: int, voice_channel_id: Optional[str] = None) -> bool:
        """Trigger soundboard sound from MIDI pad press"""
        sound_id = self.pad_mappings.get(pad_index)
        if not sound_id:
            logger.debug(f"Pad {pad_index} not mapped to soundboard")
            return False

        return await self.soundboard.play_sound(sound_id, voice_channel_id)

    def map_pad(self, pad_index: int, sound_id: str) -> bool:
        """Map MIDI pad to soundboard sound"""
        if not self.soundboard.library.get_sound(sound_id):
            logger.error(f"Sound not found: {sound_id}")
            return False

        self.pad_mappings[pad_index] = sound_id
        logger.info(f"Mapped pad {pad_index} to sound {sound_id}")
        return True

    def unmap_pad(self, pad_index: int) -> bool:
        """Remove pad mapping"""
        if pad_index in self.pad_mappings:
            self.pad_mappings[pad_index] = None
            logger.info(f"Unmapped pad {pad_index}")
            return True
        return False

    def get_mappings(self) -> Dict[int, Optional[str]]:
        """Get all pad-to-sound mappings"""
        return self.pad_mappings.copy()
