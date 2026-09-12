"""
Tests for MIDI Device Manager
Unit tests for MASCHINE MIKRO detection and connection
"""

import pytest
from unittest.mock import MagicMock, patch
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from bridge.midi_device import MidiDeviceManager, MidiPortInfo


class TestMidiDeviceDetection:
    """Test MIDI port detection"""

    @patch("bridge.midi_device.mido.get_input_names")
    @patch("bridge.midi_device.mido.get_output_names")
    def test_detect_ports_found(self, mock_outputs, mock_inputs):
        """Test successful MASCHINE detection"""
        mock_inputs.return_value = [
            "IAC Driver Bus 1",
            "MASCHINE MIKRO MK3 In",
            "System Synth Input"
        ]
        mock_outputs.return_value = [
            "IAC Driver Bus 1",
            "MASCHINE MIKRO MK3 Out",
            "System Synth Output"
        ]

        manager = MidiDeviceManager()
        result = manager.detect_ports()

        assert result["found"] is True
        assert "MASCHINE MIKRO MK3 In" in result["input"]
        assert "MASCHINE MIKRO MK3 Out" in result["output"]

    @patch("bridge.midi_device.mido.get_input_names")
    @patch("bridge.midi_device.mido.get_output_names")
    def test_detect_ports_not_found(self, mock_outputs, mock_inputs):
        """Test when MASCHINE is not connected"""
        mock_inputs.return_value = ["IAC Driver Bus 1"]
        mock_outputs.return_value = ["IAC Driver Bus 1"]

        manager = MidiDeviceManager()
        result = manager.detect_ports()

        assert result["found"] is False
        assert result["input"] is None
        assert result["output"] is None


class TestMidiConnection:
    """Test MIDI connection management"""

    @patch("bridge.midi_device.mido.open_input")
    @patch("bridge.midi_device.mido.open_output")
    def test_connect_success(self, mock_output, mock_input):
        """Test successful connection"""
        mock_input.return_value = MagicMock()
        mock_output.return_value = MagicMock()

        manager = MidiDeviceManager()
        success = manager.connect("MASCHINE MIKRO MK3 In", "MASCHINE MIKRO MK3 Out")

        assert success is True
        assert manager.is_connected() is True
        mock_input.assert_called_once()
        mock_output.assert_called_once()

    @patch("bridge.midi_device.mido.open_input")
    def test_connect_failure(self, mock_input):
        """Test connection failure"""
        mock_input.side_effect = Exception("Port not found")

        manager = MidiDeviceManager()
        success = manager.connect("Invalid Port", "Invalid Port")

        assert success is False
        assert manager.is_connected() is False

    def test_disconnect(self):
        """Test disconnection"""
        manager = MidiDeviceManager()
        manager.input_port = MagicMock()
        manager.output_port = MagicMock()

        success = manager.disconnect()

        assert success is True
        assert manager.input_port is None
        assert manager.output_port is None


class TestMidiMessages:
    """Test MIDI message sending"""

    @patch("bridge.midi_device.mido.Message")
    def test_send_note_on(self, mock_message_class):
        """Test sending Note On message"""
        mock_port = MagicMock()
        manager = MidiDeviceManager()
        manager.output_port = mock_port

        success = manager.send_note_on(60, 127)

        assert success is True
        mock_message_class.assert_called_with("note_on", note=60, velocity=127, channel=0)
        mock_port.send.assert_called_once()

    @patch("bridge.midi_device.mido.Message")
    def test_send_note_off(self, mock_message_class):
        """Test sending Note Off message"""
        mock_port = MagicMock()
        manager = MidiDeviceManager()
        manager.output_port = mock_port

        success = manager.send_note_off(60)

        assert success is True
        mock_message_class.assert_called_with("note_off", note=60, channel=0)
        mock_port.send.assert_called_once()

    def test_send_disconnected(self):
        """Test sending when disconnected"""
        manager = MidiDeviceManager()
        success = manager.send_note_on(60, 127)

        assert success is False


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
