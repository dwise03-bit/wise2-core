"""
Tests for Controller Modes
Unit tests for mode definitions and mode manager
"""

import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from bridge.modes import (
    ControllerMode,
    ModeNormalMappings,
    ModeAIMappings,
    ModeLiveMappings,
    ModeWise2Mappings,
    ModeManager,
)


class TestModeMappings:
    """Test mode mappings"""

    def test_normal_mode_has_mappings(self):
        """Test NORMAL mode has all required actions"""
        mappings = ModeNormalMappings.get_mappings()
        assert len(mappings) > 0
        assert ModeNormalMappings.PLAY in mappings
        assert mappings[ModeNormalMappings.PLAY]["action"] == "transport:play"

    def test_ai_mode_has_16_pads(self):
        """Test AI mode has 16-pad bank"""
        mappings = ModeAIMappings.get_mappings()
        assert len(mappings) == 16

        # Check async flags
        async_actions = [m for m in mappings.values() if m.get("async")]
        assert len(async_actions) > 0

    def test_live_mode_has_16_pads(self):
        """Test LIVE mode has 16 sample pads"""
        mappings = ModeLiveMappings.get_mappings()
        assert len(mappings) == 16

    def test_wise2_mode_has_16_pads(self):
        """Test WISE² mode has 16-pad bank"""
        mappings = ModeWise2Mappings.get_mappings()
        assert len(mappings) == 16


class TestModeManager:
    """Test mode manager"""

    def test_initial_mode(self):
        """Test initial mode is NORMAL"""
        manager = ModeManager()
        status = manager.get_status()
        assert status["current_mode"] == "normal"

    def test_mode_switching(self):
        """Test switching modes"""
        manager = ModeManager()

        assert manager.set_mode(ControllerMode.AI)
        status = manager.get_status()
        assert status["current_mode"] == "ai"

        assert manager.set_mode(ControllerMode.LIVE)
        status = manager.get_status()
        assert status["current_mode"] == "live"

        assert manager.set_mode(ControllerMode.WISE2)
        status = manager.get_status()
        assert status["current_mode"] == "wise2"

    def test_get_action_for_midi(self):
        """Test getting action for MIDI note"""
        manager = ModeManager()

        # NORMAL mode
        action = manager.get_action_for_midi(ModeNormalMappings.PLAY)
        assert action is not None
        assert action["action"] == "transport:play"

        # Switch to AI mode
        manager.set_mode(ControllerMode.AI)
        action = manager.get_action_for_midi(ModeAIMappings.PAD_1_GENERATE_BEAT)
        assert action is not None
        assert action["action"] == "ai:generate_beat"

    def test_handler_registration(self):
        """Test registering action handlers"""
        manager = ModeManager()

        def dummy_handler():
            pass

        manager.register_handler("transport:play", dummy_handler)
        assert "transport:play" in manager.action_handlers
        assert manager.action_handlers["transport:play"] == dummy_handler


class TestModeConstraints:
    """Test mode safety constraints"""

    def test_one_action_per_event(self):
        """Verify one note = one action (no ambiguous mappings)"""
        all_modes = [
            ModeNormalMappings.get_mappings(),
            ModeAIMappings.get_mappings(),
            ModeLiveMappings.get_mappings(),
            ModeWise2Mappings.get_mappings(),
        ]

        for mode_mappings in all_modes:
            # Each note should have exactly one action
            for note, mapping in mode_mappings.items():
                assert "action" in mapping
                assert "description" in mapping


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
