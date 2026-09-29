"""
WISE² Sound Labs Controller Modes
Defines 4 deterministic modes for MASCHINE MIKRO MK3
"""

from enum import Enum
from typing import Dict, List, Any, Callable, Optional
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


class ControllerMode(Enum):
    """4 deterministic controller modes"""
    NORMAL = "normal"  # REAPER studio control
    AI = "ai"  # AI music tools (16-pad bank)
    LIVE = "live"  # Performance (samples, loops, FX)
    WISE2 = "wise2"  # Business OS / Second Brain


@dataclass
class MidiMapping:
    """MIDI event mapping to action"""
    note: Optional[int] = None  # MIDI note number
    control: Optional[int] = None  # CC number
    channel: Optional[int] = 0
    action: Optional[str] = None
    description: Optional[str] = None


class ModeNormalMappings:
    """MODE 1: NORMAL - REAPER STUDIO CONTROL"""

    # Transport controls
    PLAY = 60  # Middle C
    STOP = 61
    RECORD = 62
    PAUSE = 63

    # Loop/metronome
    LOOP = 64
    METRONOME = 65

    # Track selection (pads 1-4)
    TRACK_SELECT = {
        1: 36,  # Pad 1
        2: 37,  # Pad 2
        3: 38,  # Pad 3
        4: 39,  # Pad 4
    }

    # Track controls
    ARM = 66
    MUTE = 67
    SOLO = 68

    # Navigation
    MARKER_SET = 69
    MARKER_PREV = 70
    MARKER_NEXT = 71

    # Editing
    UNDO = 72
    REDO = 73
    SAVE = 74

    # Bank change
    BANK_SELECT = 0  # CC 0

    @classmethod
    def get_mappings(cls) -> Dict[int, Dict[str, Any]]:
        """Get all NORMAL mode mappings"""
        return {
            cls.PLAY: {"action": "transport:play", "description": "Play"},
            cls.STOP: {"action": "transport:stop", "description": "Stop"},
            cls.RECORD: {"action": "transport:record", "description": "Record"},
            cls.PAUSE: {"action": "transport:pause", "description": "Pause"},
            cls.LOOP: {"action": "transport:loop", "description": "Toggle Loop"},
            cls.METRONOME: {"action": "transport:metronome", "description": "Toggle Metronome"},
            cls.ARM: {"action": "track:arm", "description": "Arm Track"},
            cls.MUTE: {"action": "track:mute", "description": "Mute Track"},
            cls.SOLO: {"action": "track:solo", "description": "Solo Track"},
            cls.MARKER_SET: {"action": "marker:set", "description": "Set Marker"},
            cls.MARKER_PREV: {"action": "marker:prev", "description": "Previous Marker"},
            cls.MARKER_NEXT: {"action": "marker:next", "description": "Next Marker"},
            cls.UNDO: {"action": "edit:undo", "description": "Undo"},
            cls.REDO: {"action": "edit:redo", "description": "Redo"},
            cls.SAVE: {"action": "file:save", "description": "Save"},
        }


class ModeAIMappings:
    """MODE 2: AI - WISE² AI MUSIC TOOLS (16-pad bank)"""

    # Pad bank (36-51 is standard 4x4 grid on many controllers)
    PAD_1_GENERATE_BEAT = 36
    PAD_2_REMIX = 37
    PAD_3_SPLIT_STEMS = 38
    PAD_4_VOCAL_CLEAN = 39

    PAD_5_AUTO_MIX = 40
    PAD_6_MASTER = 41
    PAD_7_LYRICS_ASSIST = 42
    PAD_8_SOUND_DESIGN = 43

    PAD_9_CHANGE_STYLE = 44
    PAD_10_BPM_TEMPO = 45
    PAD_11_VARIATION = 46
    PAD_12_EXTEND_SECTION = 47

    PAD_13_CAPTURE_IDEA = 48
    PAD_14_ASK_WISE2 = 49
    PAD_15_EXPORT_STEMS = 50
    PAD_16_AI_SETTINGS = 51

    @classmethod
    def get_mappings(cls) -> Dict[int, Dict[str, Any]]:
        """Get all AI mode mappings"""
        return {
            cls.PAD_1_GENERATE_BEAT: {"action": "ai:generate_beat", "description": "Generate Beat", "async": True},
            cls.PAD_2_REMIX: {"action": "ai:remix", "description": "Remix / Variation", "async": True},
            cls.PAD_3_SPLIT_STEMS: {"action": "ai:split_stems", "description": "Split Stems", "async": True},
            cls.PAD_4_VOCAL_CLEAN: {"action": "ai:vocal_clean", "description": "Vocal Clean", "async": True},

            cls.PAD_5_AUTO_MIX: {"action": "ai:auto_mix", "description": "Auto Mix", "async": True},
            cls.PAD_6_MASTER: {"action": "ai:master", "description": "Master", "async": True},
            cls.PAD_7_LYRICS_ASSIST: {"action": "ai:lyrics_assist", "description": "Lyrics Assist", "async": True},
            cls.PAD_8_SOUND_DESIGN: {"action": "ai:sound_design", "description": "Sound Design", "async": True},

            cls.PAD_9_CHANGE_STYLE: {"action": "ai:change_style", "description": "Change Style", "async": True},
            cls.PAD_10_BPM_TEMPO: {"action": "ai:bpm_tempo", "description": "BPM / Tempo", "async": True},
            cls.PAD_11_VARIATION: {"action": "ai:variation", "description": "Generate Variation", "async": True},
            cls.PAD_12_EXTEND_SECTION: {"action": "ai:extend_section", "description": "Extend Section", "async": True},

            cls.PAD_13_CAPTURE_IDEA: {"action": "ai:capture_idea", "description": "Capture Idea"},
            cls.PAD_14_ASK_WISE2: {"action": "ai:ask_wise2", "description": "Ask WISE²"},
            cls.PAD_15_EXPORT_STEMS: {"action": "ai:export_stems", "description": "Export Stems"},
            cls.PAD_16_AI_SETTINGS: {"action": "ai:settings", "description": "AI Settings"},
        }


class ModeLiveMappings:
    """MODE 3: LIVE - PERFORMANCE"""

    # Sample banks
    PAD_BANK_1 = (36, 37, 38, 39)  # Row 1
    PAD_BANK_2 = (40, 41, 42, 43)  # Row 2
    PAD_BANK_3 = (44, 45, 46, 47)  # Row 3
    PAD_BANK_4 = (48, 49, 50, 51)  # Row 4

    @classmethod
    def get_mappings(cls) -> Dict[int, Dict[str, Any]]:
        """Get all LIVE mode mappings"""
        mappings = {}

        # All pads trigger samples/loops
        for pad in range(36, 52):
            mappings[pad] = {
                "action": f"live:sample:{pad}",
                "description": f"Sample Pad {pad}",
                "pad_index": pad - 36,
            }

        return mappings


class ModeWise2Mappings:
    """MODE 4: WISE² - BUSINESS OS / SECOND BRAIN"""

    PAD_1_NEW_PROJECT = 36
    PAD_2_OPEN_CLIENT = 37
    PAD_3_SAVE_SYNC = 38
    PAD_4_DISCORD_POST = 39

    PAD_5_TRANSCRIBE = 40
    PAD_6_GENERATE_CONTENT = 41
    PAD_7_SUMMARIZE_SESSION = 42
    PAD_8_CLIENT_REPORT = 43

    PAD_9_SCHEDULE_POST = 44
    PAD_10_AI_MEETING = 45
    PAD_11_SEARCH_FILES = 46
    PAD_12_TEAM_UPDATE = 47

    PAD_13_SYSTEM_STATUS = 48
    PAD_14_REMOTE_COMMAND = 49
    PAD_15_BACKUP_PROJECT = 50
    PAD_16_CUSTOM_MACRO = 51

    @classmethod
    def get_mappings(cls) -> Dict[int, Dict[str, Any]]:
        """Get all WISE² mode mappings"""
        return {
            cls.PAD_1_NEW_PROJECT: {"action": "wise2:new_project", "description": "New Project"},
            cls.PAD_2_OPEN_CLIENT: {"action": "wise2:open_client", "description": "Open Client"},
            cls.PAD_3_SAVE_SYNC: {"action": "wise2:save_sync", "description": "Save / Sync"},
            cls.PAD_4_DISCORD_POST: {"action": "wise2:discord_post", "description": "Discord Post", "async": True},

            cls.PAD_5_TRANSCRIBE: {"action": "wise2:transcribe", "description": "Transcribe Audio", "async": True},
            cls.PAD_6_GENERATE_CONTENT: {"action": "wise2:generate_content", "description": "Generate Content", "async": True},
            cls.PAD_7_SUMMARIZE_SESSION: {"action": "wise2:summarize_session", "description": "Summarize Session", "async": True},
            cls.PAD_8_CLIENT_REPORT: {"action": "wise2:client_report", "description": "Client Report", "async": True},

            cls.PAD_9_SCHEDULE_POST: {"action": "wise2:schedule_post", "description": "Schedule/Post"},
            cls.PAD_10_AI_MEETING: {"action": "wise2:ai_meeting", "description": "AI Meeting", "async": True},
            cls.PAD_11_SEARCH_FILES: {"action": "wise2:search_files", "description": "Search Files"},
            cls.PAD_12_TEAM_UPDATE: {"action": "wise2:team_update", "description": "Send Team Update"},

            cls.PAD_13_SYSTEM_STATUS: {"action": "wise2:system_status", "description": "System Status"},
            cls.PAD_14_REMOTE_COMMAND: {"action": "wise2:remote_command", "description": "Remote Command"},
            cls.PAD_15_BACKUP_PROJECT: {"action": "wise2:backup_project", "description": "Backup Project", "async": True},
            cls.PAD_16_CUSTOM_MACRO: {"action": "wise2:custom_macro", "description": "Custom Macro"},
        }


class ModeManager:
    """Manages controller mode switching and mapping"""

    def __init__(self):
        self.current_mode = ControllerMode.NORMAL
        self.mode_mappings = {
            ControllerMode.NORMAL: ModeNormalMappings.get_mappings(),
            ControllerMode.AI: ModeAIMappings.get_mappings(),
            ControllerMode.LIVE: ModeLiveMappings.get_mappings(),
            ControllerMode.WISE2: ModeWise2Mappings.get_mappings(),
        }
        self.action_handlers: Dict[str, Callable] = {}

    def set_mode(self, mode: ControllerMode) -> bool:
        """
        Switch to new mode
        One mode = one action maximum (no ambiguous mappings)
        """
        if mode not in ControllerMode:
            logger.error(f"Unknown mode: {mode}")
            return False

        old_mode = self.current_mode
        self.current_mode = mode
        logger.info(f"Mode switched: {old_mode.value} → {mode.value}")
        return True

    def get_action_for_midi(self, note: int) -> Optional[Dict[str, Any]]:
        """Get action mapping for MIDI note in current mode"""
        mappings = self.mode_mappings.get(self.current_mode, {})
        return mappings.get(note)

    def register_handler(self, action: str, handler: Callable) -> None:
        """Register handler for action"""
        self.action_handlers[action] = handler
        logger.debug(f"Registered handler for action: {action}")

    def get_status(self) -> Dict[str, Any]:
        """Get mode manager status"""
        return {
            "current_mode": self.current_mode.value,
            "available_modes": [m.value for m in ControllerMode],
            "handlers_registered": len(self.action_handlers),
        }
