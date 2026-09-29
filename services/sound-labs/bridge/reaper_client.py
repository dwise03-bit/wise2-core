"""
REAPER Bridge Client
Interface to WISE² REAPER bridge service
"""

import httpx
import logging
from typing import Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class ReaperClient:
    """Client for REAPER bridge HTTP API"""

    def __init__(self, url: str, token: str):
        self.url = url
        self.token = token
        self.connected = False
        self.last_status: Optional[Dict[str, Any]] = None

    async def health_check(self) -> bool:
        """Check REAPER bridge health"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.url}/health",
                    headers={"Authorization": f"Bearer {self.token}"},
                    timeout=5
                )
                self.connected = response.status_code == 200
                return self.connected
        except Exception as e:
            logger.error(f"REAPER health check failed: {e}")
            self.connected = False
            return False

    async def get_status(self) -> Optional[Dict[str, Any]]:
        """Get REAPER transport status"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.url}/reaper/status",
                    headers={"Authorization": f"Bearer {self.token}"},
                    timeout=5
                )
                if response.status_code == 200:
                    self.last_status = response.json()
                    return self.last_status
        except Exception as e:
            logger.error(f"Error getting REAPER status: {e}")
        return None

    async def handle_transport(self, action: str) -> bool:
        """
        Handle transport controls: play, stop, pause, record
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.url}/reaper/{action}",
                    headers={"Authorization": f"Bearer {self.token}"},
                    timeout=5
                )
                success = response.status_code == 200
                logger.debug(f"Transport action '{action}': {success}")
                return success
        except Exception as e:
            logger.error(f"Transport action error: {e}")
            return False

    async def handle_track(self, action: str, context: Dict[str, Any]) -> bool:
        """
        Handle track controls: arm, mute, solo, unsolo, disarm, unmute
        """
        try:
            # Extract track index from context or use 0
            track_idx = context.get("track_index", 0)

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.url}/reaper/tracks/{track_idx}/{action}",
                    headers={"Authorization": f"Bearer {self.token}"},
                    timeout=5
                )
                success = response.status_code == 200
                logger.debug(f"Track action '{action}' on track {track_idx}: {success}")
                return success
        except Exception as e:
            logger.error(f"Track action error: {e}")
            return False

    async def handle_marker(self, action: str) -> bool:
        """
        Handle marker controls: set, prev, next
        """
        try:
            async with httpx.AsyncClient() as client:
                if action == "set":
                    response = await client.post(
                        f"{self.url}/reaper/marker",
                        headers={"Authorization": f"Bearer {self.token}"},
                        json={"name": f"Marker {datetime.now().isoformat()}"},
                        timeout=5
                    )
                elif action in ["prev", "next"]:
                    # Markers need to be navigated via REAPER actions
                    # For now, just log
                    logger.debug(f"Marker action: {action}")
                    return True
                else:
                    return False

                success = response.status_code == 200
                logger.debug(f"Marker action '{action}': {success}")
                return success
        except Exception as e:
            logger.error(f"Marker action error: {e}")
            return False

    async def handle_edit(self, action: str) -> bool:
        """
        Handle edit controls: undo, redo
        """
        try:
            # These would need ReaScript/OSC support in REAPER
            # For now, log the intent
            logger.debug(f"Edit action: {action}")
            return True
        except Exception as e:
            logger.error(f"Edit action error: {e}")
            return False

    async def handle_file(self, action: str) -> bool:
        """
        Handle file controls: save
        """
        try:
            # File operations need ReaScript support
            logger.debug(f"File action: {action}")
            return True
        except Exception as e:
            logger.error(f"File action error: {e}")
            return False

    async def render(self, format: str = "wav", kind: str = "master") -> Optional[str]:
        """
        Render project to file
        Returns: file path or None
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.url}/reaper/render",
                    headers={"Authorization": f"Bearer {self.token}"},
                    json={"format": format, "kind": kind},
                    timeout=30
                )
                if response.status_code == 200:
                    return response.json().get("file_path")
        except Exception as e:
            logger.error(f"Render error: {e}")
        return None
