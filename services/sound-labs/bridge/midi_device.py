"""
WISE² Sound Labs MIDI Device Manager
Detects and manages MASCHINE MIKRO MK3 connections
"""

import mido
from typing import Optional, Dict, Any
from dataclasses import dataclass
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


@dataclass
class MidiPortInfo:
    """MIDI port metadata"""
    name: str
    port_type: str  # 'input' or 'output'
    is_virtual: bool
    is_connected: bool


class MidiDeviceManager:
    """Manages MASCHINE MIKRO MK3 MIDI connections"""

    def __init__(self):
        self.input_port: Optional[mido.MidiFile] = None
        self.output_port: Optional[mido.MidiFile] = None
        self.device_name = "MASCHINE MIKRO MK3"
        self.reconnect_attempts = 0
        self.max_reconnect_attempts = 10
        self.last_connection_time: Optional[datetime] = None

    def detect_ports(self) -> Dict[str, Any]:
        """
        Detect available MIDI ports and find MASCHINE MIKRO MK3
        Returns: { 'input': port_name, 'output': port_name, 'found': bool }
        """
        try:
            input_ports = mido.get_input_names()
            output_ports = mido.get_output_names()

            logger.info(f"Available input ports: {input_ports}")
            logger.info(f"Available output ports: {output_ports}")

            # Search for MASCHINE in port names (case-insensitive)
            maschine_input = None
            maschine_output = None

            for port in input_ports:
                if "MASCHINE" in port.upper() or "mk3" in port.lower():
                    maschine_input = port
                    logger.info(f"Found MASCHINE input: {port}")
                    break

            for port in output_ports:
                if "MASCHINE" in port.upper() or "mk3" in port.lower():
                    maschine_output = port
                    logger.info(f"Found MASCHINE output: {port}")
                    break

            return {
                "input": maschine_input,
                "output": maschine_output,
                "found": maschine_input is not None and maschine_output is not None,
                "all_inputs": input_ports,
                "all_outputs": output_ports,
            }
        except Exception as e:
            logger.error(f"Error detecting MIDI ports: {e}")
            return {"found": False, "error": str(e)}

    def connect(self, input_port: str, output_port: str) -> bool:
        """
        Connect to MASCHINE MIKRO MK3
        Returns: True if connection successful
        """
        try:
            self.input_port = mido.open_input(input_port)
            self.output_port = mido.open_output(output_port)
            self.last_connection_time = datetime.now()
            self.reconnect_attempts = 0
            logger.info(f"Connected to MASCHINE MIKRO MK3: {input_port} / {output_port}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to MASCHINE: {e}")
            return False

    def disconnect(self) -> bool:
        """Disconnect from MASCHINE"""
        try:
            if self.input_port:
                self.input_port.close()
                self.input_port = None
            if self.output_port:
                self.output_port.close()
                self.output_port = None
            logger.info("Disconnected from MASCHINE MIKRO MK3")
            return True
        except Exception as e:
            logger.error(f"Error disconnecting: {e}")
            return False

    def is_connected(self) -> bool:
        """Check if MASCHINE is currently connected"""
        return self.input_port is not None and self.output_port is not None

    def send_note_on(self, note: int, velocity: int = 127, channel: int = 0) -> bool:
        """Send Note On message to MASCHINE"""
        if self.output_port is None:
            return False
        try:
            msg = mido.Message("note_on", note=note, velocity=velocity, channel=channel)
            self.output_port.send(msg)
            return True
        except Exception as e:
            logger.error(f"Error sending note_on: {e}")
            return False

    def send_note_off(self, note: int, channel: int = 0) -> bool:
        """Send Note Off message to MASCHINE"""
        if self.output_port is None:
            return False
        try:
            msg = mido.Message("note_off", note=note, channel=channel)
            self.output_port.send(msg)
            return True
        except Exception as e:
            logger.error(f"Error sending note_off: {e}")
            return False

    def send_control_change(self, control: int, value: int, channel: int = 0) -> bool:
        """Send Control Change message to MASCHINE"""
        if self.output_port is None:
            return False
        try:
            msg = mido.Message("control_change", control=control, value=value, channel=channel)
            self.output_port.send(msg)
            return True
        except Exception as e:
            logger.error(f"Error sending CC: {e}")
            return False

    def get_status(self) -> Dict[str, Any]:
        """Get connection status"""
        return {
            "connected": self.is_connected(),
            "input_port": self.input_port.name if self.input_port else None,
            "output_port": self.output_port.name if self.output_port else None,
            "last_connection_time": self.last_connection_time.isoformat() if self.last_connection_time else None,
            "reconnect_attempts": self.reconnect_attempts,
        }
