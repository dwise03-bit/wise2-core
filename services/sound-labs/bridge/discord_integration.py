"""
Discord Integration
Safe Discord webhook integration for Sound Labs updates
"""

import httpx
import logging
import json
from typing import Optional, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)


class DiscordIntegration:
    """
    Discord webhook integration
    Posts studio status, AI job completions, etc.
    """

    def __init__(self, webhook_url: str = ""):
        self.webhook_url = webhook_url
        self.connected = bool(webhook_url)

    async def post_status(self, status: str, details: Optional[Dict[str, Any]] = None) -> bool:
        """Post studio status to Discord"""
        if not self.connected:
            logger.debug("Discord webhook not configured")
            return False

        try:
            embed = {
                "title": "🎵 WISE² Sound Labs",
                "description": status,
                "color": 0x00FF00,
                "timestamp": datetime.now().isoformat(),
            }

            if details:
                for key, value in details.items():
                    embed["fields"] = embed.get("fields", [])
                    embed["fields"].append({
                        "name": key,
                        "value": str(value),
                        "inline": True
                    })

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.webhook_url,
                    json={"embeds": [embed]},
                    timeout=10
                )
                return response.status_code == 204

        except Exception as e:
            logger.error(f"Discord post error: {e}")
            return False

    async def post_ai_job_update(self, job_id: str, action: str, status: str, result: Optional[Dict[str, Any]] = None) -> bool:
        """Post AI job update to Discord"""
        if not self.connected:
            return False

        try:
            color_map = {
                "queued": 0xFFA500,
                "running": 0x0000FF,
                "completed": 0x00FF00,
                "failed": 0xFF0000,
            }

            embed = {
                "title": f"🤖 AI Job: {action}",
                "description": f"Status: {status}",
                "color": color_map.get(status, 0x808080),
                "fields": [
                    {"name": "Job ID", "value": job_id[:8], "inline": True},
                    {"name": "Action", "value": action, "inline": True},
                ]
            }

            if result:
                embed["fields"].append({
                    "name": "Result",
                    "value": json.dumps(result)[:100],
                    "inline": False
                })

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.webhook_url,
                    json={"embeds": [embed]},
                    timeout=10
                )
                return response.status_code == 204

        except Exception as e:
            logger.error(f"Discord job update error: {e}")
            return False

    async def post_error(self, error: str, context: Optional[Dict[str, Any]] = None) -> bool:
        """Post error notification to Discord"""
        if not self.connected:
            return False

        try:
            embed = {
                "title": "⚠️ WISE² Sound Labs Error",
                "description": error,
                "color": 0xFF0000,
                "timestamp": datetime.now().isoformat(),
            }

            if context:
                embed["fields"] = [
                    {"name": key, "value": str(value)[:100], "inline": True}
                    for key, value in context.items()
                ]

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.webhook_url,
                    json={"embeds": [embed]},
                    timeout=10
                )
                return response.status_code == 204

        except Exception as e:
            logger.error(f"Discord error post failed: {e}")
            return False
