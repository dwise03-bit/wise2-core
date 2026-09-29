"""
AI Router - Local-First Decision Making
Routes AI jobs with LOCAL preference, falls back to CLOUD
"""

import httpx
import logging
from typing import Dict, Any, Optional
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)


class AIRouter:
    """
    Routes AI tasks with local-first preference
    LOCAL (Ollama) → WISE² Cloud AI → Fallback
    """

    def __init__(self, ollama_url: str, vps_api_url: str):
        self.ollama_url = ollama_url
        self.vps_api_url = vps_api_url
        self.ollama_models = []
        self.active_jobs: Dict[str, Dict[str, Any]] = {}
        self._update_ollama_models()

    def _update_ollama_models(self):
        """Detect available local Ollama models"""
        try:
            # This would be called once on startup
            # For now, assume qwen2.5-coder is available
            self.ollama_models = ["qwen2.5-coder:7b", "mistral"]
            logger.info(f"Available local AI models: {self.ollama_models}")
        except Exception as e:
            logger.error(f"Error detecting Ollama models: {e}")

    async def handle_action(self, action: str, context: Dict[str, Any]) -> Optional[str]:
        """
        Handle AI action asynchronously
        Returns: job_id
        """
        job_id = str(uuid.uuid4())

        try:
            # Determine routing: LOCAL or CLOUD
            route = self._select_route(action)
            logger.info(f"AI action '{action}' → {route} (job: {job_id})")

            self.active_jobs[job_id] = {
                "action": action,
                "route": route,
                "status": "queued",
                "created_at": datetime.now().isoformat(),
                "context": context
            }

            if route == "LOCAL":
                # Route to Ollama
                asyncio.create_task(self._run_local_job(job_id, action, context))
            else:
                # Route to Cloud/VPS
                asyncio.create_task(self._run_cloud_job(job_id, action, context))

            return job_id

        except Exception as e:
            logger.error(f"Error handling AI action: {e}")
            if job_id in self.active_jobs:
                self.active_jobs[job_id]["status"] = "error"
                self.active_jobs[job_id]["error"] = str(e)
            return None

    def _select_route(self, action: str) -> str:
        """
        Select LOCAL or CLOUD routing
        Criteria:
        - audio processing (stem splitting, vocal cleaning) → LOCAL
        - beat generation, remixing → LOCAL if possible, else CLOUD
        - content generation (lyrics, ideas) → CLOUD
        """
        local_preferred = [
            "split_stems",
            "vocal_clean",
            "auto_mix",
            "master",
            "beat",
            "remix",
        ]

        for prefix in local_preferred:
            if prefix in action:
                return "LOCAL"

        return "CLOUD"

    async def _run_local_job(self, job_id: str, action: str, context: Dict[str, Any]):
        """Execute job locally via Ollama"""
        try:
            self.active_jobs[job_id]["status"] = "running"

            # Map action to Ollama prompt
            prompt = self._build_prompt(action, context)

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.ollama_url}/api/generate",
                    json={
                        "model": "qwen2.5-coder:7b",
                        "prompt": prompt,
                        "stream": False
                    },
                    timeout=120
                )

                if response.status_code == 200:
                    result = response.json()
                    self.active_jobs[job_id]["status"] = "completed"
                    self.active_jobs[job_id]["result"] = result.get("response")
                    logger.info(f"Local AI job {job_id} completed")
                else:
                    # Fallback to cloud
                    logger.warning(f"Local AI failed, falling back to cloud for {job_id}")
                    await self._run_cloud_job(job_id, action, context)

        except Exception as e:
            logger.error(f"Local AI job error: {e}")
            self.active_jobs[job_id]["status"] = "failed"
            self.active_jobs[job_id]["error"] = str(e)
            # Fallback to cloud
            await self._run_cloud_job(job_id, action, context)

    async def _run_cloud_job(self, job_id: str, action: str, context: Dict[str, Any]):
        """Execute job on WISE² Cloud"""
        try:
            self.active_jobs[job_id]["status"] = "running"
            self.active_jobs[job_id]["route"] = "CLOUD"

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.vps_api_url}/sound-labs/ai/{action}",
                    headers={"Authorization": f"Bearer {context.get('vps_token', '')}"},
                    json=context,
                    timeout=120
                )

                if response.status_code in [200, 202]:
                    self.active_jobs[job_id]["status"] = "completed"
                    self.active_jobs[job_id]["result"] = response.json()
                    logger.info(f"Cloud AI job {job_id} completed")
                else:
                    self.active_jobs[job_id]["status"] = "failed"
                    self.active_jobs[job_id]["error"] = response.text
                    logger.error(f"Cloud AI job failed: {response.text}")

        except Exception as e:
            logger.error(f"Cloud AI job error: {e}")
            self.active_jobs[job_id]["status"] = "failed"
            self.active_jobs[job_id]["error"] = str(e)

    def _build_prompt(self, action: str, context: Dict[str, Any]) -> str:
        """Build prompt for Ollama based on action"""
        prompts = {
            "generate_beat": "Generate a 4-bar drum pattern in JSON format with kick, snare, hi-hat",
            "remix": "Create a remix variation of the given track",
            "split_stems": "Analyze audio and separate into stems (drums, bass, melody, vocals)",
            "vocal_clean": "Remove background noise and enhance vocal clarity",
            "auto_mix": "Balance and EQ the provided tracks for a cohesive mix",
            "master": "Apply mastering processing for loudness and clarity",
        }
        return prompts.get(action, f"Process audio for: {action}")

    def get_status(self) -> Dict[str, Any]:
        """Get AI router status"""
        return {
            "ollama_url": self.ollama_url,
            "available_models": self.ollama_models,
            "active_jobs": len(self.active_jobs),
            "jobs": {
                job_id: {
                    "status": job["status"],
                    "route": job["route"],
                    "created_at": job["created_at"]
                }
                for job_id, job in self.active_jobs.items()
            }
        }


# Import asyncio at module level
import asyncio
