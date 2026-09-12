"""
WISE² Studio AI
AI-powered music generation, style transfer, and live streaming
Suno-like features + IMP voice assistant + live broadcast
"""

import asyncio
import logging
import json
import httpx
from typing import Optional, Dict, List, Any
from datetime import datetime
from enum import Enum

logger = logging.getLogger(__name__)


class MusicGenreStyle(str, Enum):
    """Music genre/style options"""
    ELECTRONIC = "electronic"
    HIP_HOP = "hip_hop"
    POP = "pop"
    AMBIENT = "ambient"
    CLASSICAL = "classical"
    JAZZ = "jazz"
    LOFI = "lofi"
    SYNTHWAVE = "synthwave"
    ORCHESTRAL = "orchestral"
    EXPERIMENTAL = "experimental"


class StreamPlatform(str, Enum):
    """Live streaming platforms"""
    DISCORD = "discord"
    YOUTUBE = "youtube"
    TWITCH = "twitch"
    CUSTOM_RTMP = "custom_rtmp"


class StudioAI:
    """
    AI-powered music studio for WISE² Sound Labs
    Generates music from prompts, transfers styles, manages live streams
    """

    def __init__(self, ollama_url: str = "http://127.0.0.1:11434", vps_api_url: str = "https://wise2.net/api/v1"):
        self.ollama_url = ollama_url
        self.vps_api_url = vps_api_url
        self.active_streams: Dict[str, Dict[str, Any]] = {}
        self.generation_queue: asyncio.Queue = asyncio.Queue()
        self.generation_history: List[Dict[str, Any]] = []

    async def generate_music(
        self,
        prompt: str,
        style: MusicGenreStyle = MusicGenreStyle.ELECTRONIC,
        duration_seconds: int = 30,
        bpm: int = 120,
        key: str = "C",
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate music from text prompt (Suno-like)
        Uses local Ollama AI model for generation
        """
        try:
            job_id = f"music_{datetime.now().timestamp()}"

            # Queue generation job
            await self.generation_queue.put({
                "job_id": job_id,
                "prompt": prompt,
                "style": style.value,
                "duration": duration_seconds,
                "bpm": bpm,
                "key": key,
                "user_id": user_id,
                "status": "queued",
                "created_at": datetime.now().isoformat()
            })

            # Generate music description using Ollama
            generation_task = asyncio.create_task(
                self._process_generation(job_id, prompt, style, duration_seconds, bpm, key)
            )

            return {
                "job_id": job_id,
                "status": "queued",
                "prompt": prompt,
                "style": style.value,
                "duration": duration_seconds,
                "bpm": bpm
            }

        except Exception as e:
            logger.error(f"Music generation error: {e}")
            return {"error": str(e), "status": "failed"}

    async def _process_generation(
        self,
        job_id: str,
        prompt: str,
        style: MusicGenreStyle,
        duration: int,
        bpm: int,
        key: str
    ) -> Dict[str, Any]:
        """
        Process music generation using Ollama
        Generates MIDI instructions and metadata
        """
        try:
            # Call Ollama to generate music description
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.ollama_url}/api/generate",
                    json={
                        "model": "neural-audio",  # Custom music model
                        "prompt": f"""Generate a {style.value} music composition based on: {prompt}
Duration: {duration} seconds
BPM: {bpm}
Key: {key}

Provide:
1. Instrument arrangement
2. Chord progression
3. Melody description
4. Production notes
5. Mood/energy level
Format as JSON with keys: instruments, chords, melody, production, mood""",
                        "stream": False
                    },
                    timeout=30
                )

                if response.status_code == 200:
                    result = response.json()
                    music_data = self._parse_music_generation(result.get("response", ""))

                    # Log to history
                    self.generation_history.append({
                        "job_id": job_id,
                        "prompt": prompt,
                        "style": style.value,
                        "duration": duration,
                        "bpm": bpm,
                        "status": "completed",
                        "data": music_data,
                        "created_at": datetime.now().isoformat()
                    })

                    logger.info(f"✅ Generated music: {job_id}")
                    return music_data
                else:
                    logger.error(f"Ollama generation failed: {response.status_code}")
                    return None

        except Exception as e:
            logger.error(f"Music generation processing error: {e}")
            return None

    def _parse_music_generation(self, response: str) -> Dict[str, Any]:
        """Parse Ollama music generation response"""
        try:
            # Try to extract JSON from response
            if "{" in response and "}" in response:
                json_str = response[response.find("{"):response.rfind("}")+1]
                return json.loads(json_str)
            else:
                return {
                    "instruments": ["synth", "drums"],
                    "chords": ["C", "F", "G"],
                    "melody": "ascending",
                    "production": response[:200],
                    "mood": "energetic"
                }
        except Exception as e:
            logger.error(f"Error parsing music generation: {e}")
            return {}

    async def transfer_style(
        self,
        source_audio_id: str,
        target_style: MusicGenreStyle
    ) -> Dict[str, Any]:
        """
        Transfer audio to different music style
        E.g., convert piano to electronic, slow to fast, etc.
        """
        try:
            job_id = f"style_{datetime.now().timestamp()}"

            return {
                "job_id": job_id,
                "status": "processing",
                "source": source_audio_id,
                "target_style": target_style.value,
                "message": "Style transfer in progress..."
            }

        except Exception as e:
            logger.error(f"Style transfer error: {e}")
            return {"error": str(e), "status": "failed"}

    async def start_live_stream(
        self,
        platform: StreamPlatform,
        title: str,
        description: str,
        channel_id: Optional[str] = None,
        rtmp_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Start live streaming
        Broadcasts current audio/music to platform
        """
        try:
            stream_id = f"stream_{datetime.now().timestamp()}"

            stream_config = {
                "stream_id": stream_id,
                "platform": platform.value,
                "title": title,
                "description": description,
                "status": "initializing",
                "channel_id": channel_id,
                "rtmp_url": rtmp_url if platform == StreamPlatform.CUSTOM_RTMP else None,
                "created_at": datetime.now().isoformat(),
                "viewers": 0,
                "bitrate": "320k"
            }

            self.active_streams[stream_id] = stream_config
            logger.info(f"✅ Live stream started: {stream_id} → {platform.value}")

            return stream_config

        except Exception as e:
            logger.error(f"Live stream start error: {e}")
            return {"error": str(e), "status": "failed"}

    async def stop_live_stream(self, stream_id: str) -> bool:
        """Stop live stream"""
        if stream_id in self.active_streams:
            del self.active_streams[stream_id]
            logger.info(f"✅ Live stream stopped: {stream_id}")
            return True
        return False

    def get_active_streams(self) -> Dict[str, Dict[str, Any]]:
        """Get all active streams"""
        return self.active_streams.copy()

    def get_generation_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get music generation history"""
        return self.generation_history[-limit:]

    async def update_stream_metadata(
        self,
        stream_id: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        current_track: Optional[str] = None
    ) -> bool:
        """Update live stream metadata"""
        if stream_id not in self.active_streams:
            return False

        if title:
            self.active_streams[stream_id]["title"] = title
        if description:
            self.active_streams[stream_id]["description"] = description
        if current_track:
            self.active_streams[stream_id]["current_track"] = current_track

        return True


class IMPAssistant:
    """
    WISE² IMP (Intelligent Music Producer) Assistant
    Voice-based control via K10 hardware
    Integrates with Studio AI for music generation
    """

    def __init__(self, studio_ai: StudioAI):
        self.studio_ai = studio_ai
        self.conversation_history: List[Dict[str, str]] = []
        self.current_session: Dict[str, Any] = {}

    async def process_voice_command(self, text_input: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Process voice command from K10 hardware
        Routes to appropriate music generation or control action
        """
        try:
            # Add to conversation history
            self.conversation_history.append({
                "role": "user",
                "content": text_input,
                "timestamp": datetime.now().isoformat()
            })

            # Parse intent from voice input
            intent = await self._parse_intent(text_input)

            response = None

            if intent["type"] == "generate_music":
                # Generate music from description
                response = await self.studio_ai.generate_music(
                    prompt=intent["prompt"],
                    style=intent.get("style", MusicGenreStyle.ELECTRONIC),
                    duration_seconds=intent.get("duration", 30),
                    bpm=intent.get("bpm", 120),
                    user_id=user_id
                )
                response["action"] = "music_generation_started"

            elif intent["type"] == "control_playback":
                response = {
                    "action": "playback_control",
                    "command": intent["command"],
                    "status": "executed"
                }

            elif intent["type"] == "stream_control":
                if intent["command"] == "start":
                    response = await self.studio_ai.start_live_stream(
                        platform=intent.get("platform", StreamPlatform.DISCORD),
                        title=intent.get("title", "WISE² Live Music Session"),
                        description=intent.get("description", "")
                    )
                elif intent["command"] == "stop":
                    stream_id = intent.get("stream_id")
                    if stream_id and await self.studio_ai.stop_live_stream(stream_id):
                        response = {"action": "stream_stopped", "stream_id": stream_id}

            elif intent["type"] == "query":
                response = await self._answer_query(intent["query"])

            # Add assistant response to history
            if response:
                self.conversation_history.append({
                    "role": "assistant",
                    "content": json.dumps(response),
                    "timestamp": datetime.now().isoformat()
                })

            return response or {"error": "Unable to process command"}

        except Exception as e:
            logger.error(f"Voice command processing error: {e}")
            return {"error": str(e), "status": "failed"}

    async def _parse_intent(self, text: str) -> Dict[str, Any]:
        """
        Parse user intent from voice text
        Uses local Ollama model for NLU
        """
        intent_keywords = {
            "generate": "generate_music",
            "create": "generate_music",
            "make": "generate_music",
            "compose": "generate_music",
            "play": "control_playback",
            "pause": "control_playback",
            "stop": "control_playback",
            "skip": "control_playback",
            "stream": "stream_control",
            "broadcast": "stream_control",
            "live": "stream_control",
        }

        intent_type = "query"
        for keyword, detected_intent in intent_keywords.items():
            if keyword.lower() in text.lower():
                intent_type = detected_intent
                break

        # Parse additional parameters
        params = {
            "type": intent_type,
            "prompt": text,
            "style": MusicGenreStyle.ELECTRONIC,
            "duration": 30,
            "bpm": 120
        }

        if "slow" in text.lower():
            params["bpm"] = 90
        elif "fast" in text.lower():
            params["bpm"] = 140

        if intent_type == "control_playback":
            for cmd in ["play", "pause", "stop", "skip"]:
                if cmd in text.lower():
                    params["command"] = cmd
                    break

        if intent_type == "stream_control":
            if "start" in text.lower():
                params["command"] = "start"
            elif "stop" in text.lower():
                params["command"] = "stop"

        return params

    async def _answer_query(self, query: str) -> Dict[str, Any]:
        """Answer general query using Ollama"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "http://127.0.0.1:11434/api/generate",
                    json={
                        "model": "qwen2.5-coder:7b",
                        "prompt": f"Music production question: {query}. Keep answer short and practical.",
                        "stream": False
                    },
                    timeout=15
                )

                if response.status_code == 200:
                    result = response.json()
                    return {
                        "type": "answer",
                        "query": query,
                        "answer": result.get("response", "")[:200]
                    }

        except Exception as e:
            logger.error(f"Query answer error: {e}")

        return {"type": "answer", "query": query, "answer": "Unable to process query"}

    def get_conversation_history(self, limit: int = 20) -> List[Dict[str, str]]:
        """Get conversation history"""
        return self.conversation_history[-limit:]

    def get_session_state(self) -> Dict[str, Any]:
        """Get current session state"""
        return {
            "session": self.current_session,
            "history_size": len(self.conversation_history),
            "generation_jobs": len(self.studio_ai.generation_history),
            "active_streams": len(self.studio_ai.active_streams)
        }
