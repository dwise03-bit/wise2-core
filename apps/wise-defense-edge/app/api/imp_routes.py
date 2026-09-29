#!/usr/bin/env python3
"""
IMP + Display State Routes
Provides API endpoints for display animation state and audio streaming.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import asyncio
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/imp", tags=["imp"])

# Global state (in production, use Redis or database)
display_state = {
    "state": "IDLE",
    "timestamp": datetime.utcnow().isoformat(),
    "animation": {
        "radar": "pulse_slow",
        "spectrum": "idle",
        "alerts": "fade_in",
        "duration_ms": 500
    },
    "audio_level": 0,
    "is_listening": False
}

# WebSocket connections for display updates
active_connections: list[WebSocket] = []


class DisplayStateUpdate(BaseModel):
    """Display state update model."""
    state: str  # IDLE, LISTENING, PROCESSING, SPEAKING, ALERT
    audio_level: Optional[int] = None
    is_listening: Optional[bool] = None


@router.get("/state", tags=["Display"])
async def get_display_state():
    """Get current display state for Big Byte dashboard."""
    return {
        "display_state": display_state,
        "active_incidents": [],  # Would fetch from database
        "spectrum_data": [],      # Would fetch from SDR
        "mesh_nodes": 0,          # Would fetch from mesh
        "system_health": "OPERATIONAL"
    }


@router.post("/state", tags=["Display"])
async def update_display_state(update: DisplayStateUpdate):
    """Update display state (called by voice service)."""
    global display_state

    # Get animation config based on state
    animation_configs = {
        "IDLE": {
            "radar": "pulse_slow",
            "spectrum": "idle",
            "alerts": "fade_in",
            "duration_ms": 500
        },
        "LISTENING": {
            "radar": "pulse_fast",
            "spectrum": "animate_waves",
            "alerts": "slide_in",
            "duration_ms": 300
        },
        "PROCESSING": {
            "radar": "spin",
            "spectrum": "scan",
            "alerts": "pulse",
            "duration_ms": 200
        },
        "SPEAKING": {
            "radar": "pulse_medium",
            "spectrum": "respond_wave",
            "alerts": "highlight",
            "duration_ms": 400
        },
        "ALERT": {
            "radar": "flash",
            "spectrum": "warning_red",
            "alerts": "expand_urgent",
            "duration_ms": 100
        }
    }

    # Update state
    display_state = {
        "state": update.state,
        "timestamp": datetime.utcnow().isoformat(),
        "animation": animation_configs.get(update.state, animation_configs["IDLE"]),
        "audio_level": update.audio_level or display_state["audio_level"],
        "is_listening": update.is_listening if update.is_listening is not None else display_state["is_listening"]
    }

    logger.info(f"Display state updated: {update.state}")

    # Broadcast to connected WebSocket clients
    await broadcast_state_update(display_state)

    return {
        "status": "success",
        "display_state": display_state
    }


@router.get("/status", tags=["Health"])
async def get_imp_status():
    """Get IMP service status."""
    return {
        "service": "IMP",
        "status": "OPERATIONAL",
        "version": "1.0.0",
        "display_state": display_state["state"],
        "is_listening": display_state["is_listening"],
        "timestamp": datetime.utcnow().isoformat()
    }


@router.websocket("/display/stream")
async def websocket_display_stream(websocket: WebSocket):
    """WebSocket stream for real-time display updates."""
    await websocket.accept()
    active_connections.append(websocket)

    logger.info("New display stream connection")

    try:
        # Send initial state
        await websocket.send_json(display_state)

        # Keep connection alive
        while True:
            # Receive ping/keep-alive
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({
                    "type": "pong",
                    "timestamp": datetime.utcnow().isoformat()
                })
    except WebSocketDisconnect:
        active_connections.remove(websocket)
        logger.info("Display stream disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        if websocket in active_connections:
            active_connections.remove(websocket)


async def broadcast_state_update(state: Dict[str, Any]):
    """Broadcast state update to all connected clients."""
    disconnected = []

    for connection in active_connections:
        try:
            await connection.send_json(state)
        except Exception as e:
            logger.debug(f"Failed to send to client: {e}")
            disconnected.append(connection)

    # Clean up disconnected clients
    for connection in disconnected:
        if connection in active_connections:
            active_connections.remove(connection)


@router.post("/voice/query", tags=["Voice"])
async def process_voice_query(query: Dict[str, str]):
    """Process voice query (from voice_listener)."""
    text = query.get("text", "")

    logger.info(f"Voice query: {text}")

    # Set display to PROCESSING
    await update_display_state(DisplayStateUpdate(
        state="PROCESSING",
        is_listening=True
    ))

    # TODO: Route through actual IMP
    # For now, return mock response
    response_text = f"Processing query: {text}"

    # Set display to SPEAKING
    await update_display_state(DisplayStateUpdate(
        state="SPEAKING",
        is_listening=False
    ))

    return {
        "status": "success",
        "query": text,
        "response": response_text,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.post("/audio/level", tags=["Audio"])
async def update_audio_level(data: Dict[str, float]):
    """Update audio level from voice listener."""
    global display_state

    level = data.get("level", 0)
    display_state["audio_level"] = min(100, max(0, level))

    # Broadcast update
    await broadcast_state_update(display_state)

    return {"status": "success", "audio_level": display_state["audio_level"]}


@router.post("/animation/trigger", tags=["Display"])
async def trigger_animation(data: Dict[str, str]):
    """Trigger specific animation on display."""
    animation_type = data.get("type", "pulse")
    duration = data.get("duration", "500")

    logger.info(f"Triggering animation: {animation_type}")

    return {
        "status": "success",
        "animation": animation_type,
        "duration_ms": duration
    }
