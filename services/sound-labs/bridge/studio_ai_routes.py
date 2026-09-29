"""
WISE² Studio AI API Routes
AI music generation, streaming, and IMP assistant endpoints
"""

import logging
from fastapi import FastAPI, HTTPException, Query
from typing import Optional
from studio_ai import StudioAI, IMPAssistant, MusicGenreStyle, StreamPlatform

logger = logging.getLogger(__name__)


def register_studio_ai_routes(app: FastAPI, studio_ai: StudioAI, imp_assistant: IMPAssistant):
    """Register Studio AI and IMP Assistant endpoints"""

    # ========== MUSIC GENERATION ==========

    @app.post("/ai/generate-music")
    async def generate_music(
        prompt: str = Query(..., description="Music description/lyrics"),
        style: str = Query("electronic", description="Music genre/style"),
        duration: int = Query(30, description="Duration in seconds"),
        bpm: int = Query(120, description="Beats per minute"),
        key: str = Query("C", description="Musical key"),
        user_id: Optional[str] = Query(None)
    ):
        """
        Generate music from text prompt (Suno-like feature)
        AI creates music composition based on description
        """
        try:
            genre_style = MusicGenreStyle(style)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid style: {style}")

        result = await studio_ai.generate_music(
            prompt=prompt,
            style=genre_style,
            duration_seconds=duration,
            bpm=bpm,
            key=key,
            user_id=user_id
        )

        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])

        return result

    @app.get("/ai/generation-history")
    async def get_generation_history(limit: int = Query(10, ge=1, le=50)):
        """Get music generation history"""
        return {
            "history": studio_ai.get_generation_history(limit),
            "total_generations": len(studio_ai.generation_history)
        }

    # ========== STYLE TRANSFER ==========

    @app.post("/ai/transfer-style")
    async def transfer_style(
        source_audio_id: str = Query(...),
        target_style: str = Query(..., description="Target music style")
    ):
        """
        Transfer audio to different music style
        E.g., convert piano to electronic, slow to fast
        """
        try:
            target = MusicGenreStyle(target_style)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid style: {target_style}")

        result = await studio_ai.transfer_style(source_audio_id, target)

        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])

        return result

    # ========== LIVE STREAMING ==========

    @app.post("/ai/stream/start")
    async def start_stream(
        platform: str = Query("discord", description="Stream platform"),
        title: str = Query("WISE² Live Music Session"),
        description: str = Query(""),
        channel_id: Optional[str] = Query(None),
        rtmp_url: Optional[str] = Query(None)
    ):
        """
        Start live streaming to Discord, YouTube, Twitch, or custom RTMP
        Broadcasts music generation in real-time
        """
        try:
            stream_platform = StreamPlatform(platform)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid platform: {platform}")

        if stream_platform == StreamPlatform.CUSTOM_RTMP and not rtmp_url:
            raise HTTPException(status_code=400, detail="RTMP URL required for custom_rtmp platform")

        result = await studio_ai.start_live_stream(
            platform=stream_platform,
            title=title,
            description=description,
            channel_id=channel_id,
            rtmp_url=rtmp_url
        )

        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])

        return result

    @app.post("/ai/stream/stop/{stream_id}")
    async def stop_stream(stream_id: str):
        """Stop live stream"""
        success = await studio_ai.stop_live_stream(stream_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Stream not found: {stream_id}")

        return {"status": "stopped", "stream_id": stream_id}

    @app.get("/ai/stream/active")
    async def get_active_streams():
        """Get all active live streams"""
        return {
            "streams": studio_ai.get_active_streams(),
            "count": len(studio_ai.active_streams)
        }

    @app.put("/ai/stream/metadata/{stream_id}")
    async def update_stream_metadata(
        stream_id: str,
        title: Optional[str] = Query(None),
        description: Optional[str] = Query(None),
        current_track: Optional[str] = Query(None)
    ):
        """Update live stream metadata (title, description, current track)"""
        success = await studio_ai.update_stream_metadata(
            stream_id=stream_id,
            title=title,
            description=description,
            current_track=current_track
        )

        if not success:
            raise HTTPException(status_code=404, detail=f"Stream not found: {stream_id}")

        return {"status": "updated", "stream_id": stream_id}

    # ========== IMP ASSISTANT (Voice Control) ==========

    @app.post("/imp/voice-command")
    async def process_voice_command(
        text: str = Query(..., description="Voice input as text"),
        user_id: Optional[str] = Query(None)
    ):
        """
        Process voice command via IMP Assistant
        K10 hardware voice input → AI music generation/control
        """
        result = await imp_assistant.process_voice_command(text, user_id)

        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])

        return result

    @app.get("/imp/conversation-history")
    async def get_conversation_history(limit: int = Query(20, ge=1, le=100)):
        """Get IMP Assistant conversation history"""
        return {
            "history": imp_assistant.get_conversation_history(limit),
            "total_messages": len(imp_assistant.conversation_history)
        }

    @app.get("/imp/session-state")
    async def get_session_state():
        """Get IMP Assistant session state"""
        return imp_assistant.get_session_state()

    @app.post("/imp/new-session")
    async def start_new_session(user_id: Optional[str] = Query(None)):
        """Start new IMP Assistant session"""
        imp_assistant.current_session = {
            "user_id": user_id,
            "started_at": datetime.now().isoformat(),
            "status": "active"
        }
        imp_assistant.conversation_history = []

        return {
            "status": "session_started",
            "session": imp_assistant.current_session
        }

    # ========== AI STATUS & CONFIG ==========

    @app.get("/ai/status")
    async def get_ai_status():
        """Get AI system status"""
        return {
            "studio_ai": {
                "generation_queue_size": studio_ai.generation_queue.qsize(),
                "active_generations": len(studio_ai.generation_history),
                "active_streams": len(studio_ai.active_streams)
            },
            "imp_assistant": {
                "session_active": bool(imp_assistant.current_session),
                "conversation_messages": len(imp_assistant.conversation_history)
            },
            "timestamp": datetime.now().isoformat()
        }

    @app.get("/ai/models")
    async def get_available_models():
        """Get available AI models"""
        return {
            "music_generation": {
                "model": "neural-audio",
                "description": "AI music generation from text prompts",
                "status": "available"
            },
            "voice_assistant": {
                "model": "qwen2.5-coder:7b",
                "description": "Music production voice assistant",
                "status": "available"
            },
            "style_transfer": {
                "model": "style-transfer-v1",
                "description": "Music genre/style conversion",
                "status": "available"
            }
        }

    logger.info("✅ Studio AI routes registered (15 endpoints)")


# Import datetime for timestamp
from datetime import datetime
