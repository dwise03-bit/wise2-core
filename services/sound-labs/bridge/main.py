"""
WISE² Sound Labs MIDI Bridge
FastAPI server for MASCHINE MIKRO MK3 control
Hybrid local-first architecture with VPS sync
"""

import os
import logging
from fastapi import FastAPI, WebSocket, HTTPException, Depends
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import asyncio
from typing import Dict, Any, Optional, Set
from datetime import datetime
import json

from midi_device import MidiDeviceManager
from modes import ControllerMode, ModeManager
from reaper_client import ReaperClient
from ai_router import AIRouter
from discord_integration import DiscordIntegration
from state_manager import StateManager

# Configure logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Global instances
midi_manager: Optional[MidiDeviceManager] = None
mode_manager: Optional[ModeManager] = None
reaper_client: Optional[ReaperClient] = None
ai_router: Optional[AIRouter] = None
discord_integration: Optional[DiscordIntegration] = None
state_manager: Optional[StateManager] = None
active_websockets: Set[WebSocket] = set()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan context manager
    Initialize services on startup, cleanup on shutdown
    """
    global midi_manager, mode_manager, reaper_client, ai_router, discord_integration, state_manager

    logger.info("🚀 WISE² Sound Labs MIDI Bridge starting...")

    # Initialize managers
    midi_manager = MidiDeviceManager()
    mode_manager = ModeManager()
    reaper_client = ReaperClient(
        url=os.getenv("REAPER_BRIDGE_URL", "http://127.0.0.1:8787"),
        token=os.getenv("REAPER_BRIDGE_TOKEN", "")
    )
    ai_router = AIRouter(
        ollama_url=os.getenv("OLLAMA_URL", "http://127.0.0.1:11434"),
        vps_api_url=os.getenv("VPS_API_URL", "https://wise2.net/api/v1")
    )
    discord_integration = DiscordIntegration(
        webhook_url=os.getenv("DISCORD_WEBHOOK_URL", "")
    )
    state_manager = StateManager()

    # Auto-detect MASCHINE
    detect_result = midi_manager.detect_ports()
    if detect_result.get("found"):
        input_port = detect_result["input"]
        output_port = detect_result["output"]
        logger.info(f"MASCHINE detected: {input_port} / {output_port}")
        if midi_manager.connect(input_port, output_port):
            logger.info("✅ MASCHINE MIKRO MK3 connected")
            await state_manager.set_state("midi_connected", True)
        else:
            logger.warning("⚠️ MASCHINE detected but connection failed")
    else:
        logger.warning("⚠️ MASCHINE not detected. Waiting for manual connection...")

    # Start MIDI polling task
    asyncio.create_task(midi_polling_loop())

    yield

    logger.info("🛑 Shutting down WISE² Sound Labs MIDI Bridge...")
    if midi_manager and midi_manager.is_connected():
        midi_manager.disconnect()
    logger.info("✅ Shutdown complete")


async def midi_polling_loop():
    """
    Background task: Poll MIDI device for messages
    Process and dispatch actions
    """
    while True:
        try:
            if midi_manager and midi_manager.is_connected():
                # Check for MIDI messages (non-blocking)
                msg = midi_manager.input_port.poll()
                if msg:
                    await handle_midi_message(msg)
            else:
                # Try to reconnect if disconnected
                if midi_manager:
                    detect_result = midi_manager.detect_ports()
                    if detect_result.get("found") and midi_manager.reconnect_attempts < midi_manager.max_reconnect_attempts:
                        logger.info(f"Attempting reconnection ({midi_manager.reconnect_attempts + 1}/{midi_manager.max_reconnect_attempts})...")
                        if midi_manager.connect(detect_result["input"], detect_result["output"]):
                            await state_manager.set_state("midi_connected", True)
                            await broadcast_state_update()
                        else:
                            midi_manager.reconnect_attempts += 1

            await asyncio.sleep(0.01)  # Poll every 10ms (100Hz)
        except Exception as e:
            logger.error(f"MIDI polling error: {e}")
            await asyncio.sleep(1)


async def handle_midi_message(msg: Any):
    """
    Process incoming MIDI message
    Prevent duplicate actions
    """
    try:
        if msg.type == "note_on" and msg.velocity > 0:
            # Get action mapping for current mode
            action_info = mode_manager.get_action_for_midi(msg.note)
            if action_info:
                await dispatch_action(action_info["action"], {
                    "note": msg.note,
                    "velocity": msg.velocity,
                    "timestamp": datetime.now().isoformat()
                })
                logger.debug(f"Action: {action_info['action']} (pad {msg.note})")
        elif msg.type == "control_change":
            # Handle mode switching or other CC events
            if msg.control == 0:  # Bank select
                # Switch modes based on CC value
                mode_value = msg.value // 32  # Convert 0-127 to 0-3
                if mode_value < len(list(ControllerMode)):
                    new_mode = list(ControllerMode)[mode_value]
                    await set_controller_mode(new_mode)
    except Exception as e:
        logger.error(f"Error handling MIDI message: {e}")


async def dispatch_action(action: str, context: Dict[str, Any]):
    """
    Dispatch action to appropriate handler
    Async jobs don't block MIDI processing
    """
    try:
        # Determine action type and route accordingly
        parts = action.split(":")

        if parts[0] == "transport":
            # Route to REAPER
            await reaper_client.handle_transport(parts[1])
        elif parts[0] == "track":
            # Route to REAPER
            await reaper_client.handle_track(parts[1], context)
        elif parts[0] == "marker":
            # Route to REAPER
            await reaper_client.handle_marker(parts[1])
        elif parts[0] == "edit":
            # Route to REAPER
            await reaper_client.handle_edit(parts[1])
        elif parts[0] == "file":
            # Route to REAPER
            await reaper_client.handle_file(parts[1])
        elif parts[0] == "ai":
            # Route to AI (async, don't wait)
            asyncio.create_task(ai_router.handle_action(parts[1], context))
        elif parts[0] == "live":
            # Route to LIVE mode handler
            await handle_live_action(parts[1], context)
        elif parts[0] == "wise2":
            # Route to WISE² mode handler (async)
            asyncio.create_task(handle_wise2_action(parts[1], context))

        # Log action to state
        await state_manager.append_action_log(action, context)

        # Broadcast state update to all WebSocket clients
        await broadcast_state_update()

    except Exception as e:
        logger.error(f"Error dispatching action {action}: {e}")


async def set_controller_mode(mode: ControllerMode) -> bool:
    """
    Switch controller mode
    Must return to NORMAL immediately
    """
    if mode_manager.set_mode(mode):
        await state_manager.set_state("current_mode", mode.value)
        await broadcast_state_update()
        logger.info(f"Mode: {mode.value}")
        return True
    return False


async def handle_live_action(action: str, context: Dict[str, Any]):
    """Handle LIVE mode actions (samples, loops, FX)"""
    logger.debug(f"LIVE action: {action}")
    # Dispatch to audio engine or sample player
    await state_manager.append_action_log(f"live:{action}", context)


async def handle_wise2_action(action: str, context: Dict[str, Any]):
    """Handle WISE² mode actions (async, don't block MIDI)"""
    logger.debug(f"WISE² action: {action}")
    # These are async operations
    # Send to Second Brain, Discord, etc.
    await state_manager.append_action_log(f"wise2:{action}", context)


async def broadcast_state_update():
    """Send state update to all connected WebSocket clients"""
    state = await get_current_state()
    message = json.dumps({
        "type": "state_update",
        "data": state,
        "timestamp": datetime.now().isoformat()
    })

    # Broadcast to all connected clients
    disconnected = set()
    for ws in active_websockets:
        try:
            await ws.send_text(message)
        except Exception as e:
            logger.debug(f"WebSocket send error: {e}")
            disconnected.add(ws)

    # Clean up disconnected clients
    for ws in disconnected:
        active_websockets.discard(ws)


async def get_current_state() -> Dict[str, Any]:
    """Get current bridge state"""
    return {
        "midi": midi_manager.get_status() if midi_manager else None,
        "mode": mode_manager.get_status() if mode_manager else None,
        "reaper": await reaper_client.get_status() if reaper_client else None,
        "ai": ai_router.get_status() if ai_router else None,
        "state": await state_manager.get_snapshot() if state_manager else None,
    }


# Create FastAPI app
app = FastAPI(
    title="WISE² Sound Labs MIDI Bridge",
    description="MASCHINE MIKRO MK3 bridge for WISE² Sound Labs",
    version="0.1.0",
    lifespan=lifespan
)


# ============================================================================
# HTTP Endpoints
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "wise2-sound-labs-bridge",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/state")
async def get_state():
    """Get current bridge state"""
    return await get_current_state()


@app.post("/mode/{mode}")
async def change_mode(mode: str):
    """Switch controller mode"""
    try:
        mode_enum = ControllerMode[mode.upper()]
        if await set_controller_mode(mode_enum):
            return {"status": "ok", "mode": mode}
        else:
            raise HTTPException(status_code=400, detail=f"Failed to switch to mode: {mode}")
    except KeyError:
        raise HTTPException(status_code=400, detail=f"Unknown mode: {mode}")


@app.get("/midi/ports")
async def detect_midi():
    """Detect available MIDI ports"""
    if not midi_manager:
        raise HTTPException(status_code=503, detail="MIDI manager not initialized")
    return midi_manager.detect_ports()


@app.post("/midi/connect/{input_port}/{output_port}")
async def connect_midi(input_port: str, output_port: str):
    """Manually connect to MIDI ports"""
    if not midi_manager:
        raise HTTPException(status_code=503, detail="MIDI manager not initialized")

    if midi_manager.connect(input_port, output_port):
        await state_manager.set_state("midi_connected", True)
        await broadcast_state_update()
        return {"status": "connected"}
    else:
        raise HTTPException(status_code=500, detail="Connection failed")


@app.post("/midi/disconnect")
async def disconnect_midi():
    """Disconnect from MIDI device"""
    if not midi_manager:
        raise HTTPException(status_code=503, detail="MIDI manager not initialized")

    if midi_manager.disconnect():
        await state_manager.set_state("midi_connected", False)
        await broadcast_state_update()
        return {"status": "disconnected"}
    else:
        raise HTTPException(status_code=500, detail="Disconnection failed")


# ============================================================================
# WebSocket Endpoint
# ============================================================================

@app.websocket("/ws/state")
async def websocket_state(websocket: WebSocket):
    """WebSocket for realtime state updates"""
    await websocket.accept()
    active_websockets.add(websocket)
    logger.info("WebSocket client connected")

    try:
        # Send initial state
        state = await get_current_state()
        await websocket.send_json({
            "type": "state_update",
            "data": state,
            "timestamp": datetime.now().isoformat()
        })

        # Keep connection alive and receive messages
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages (e.g., mode changes, manual actions)
            try:
                msg = json.loads(data)
                if msg.get("type") == "set_mode":
                    await set_controller_mode(ControllerMode[msg["mode"].upper()])
            except Exception as e:
                logger.error(f"WebSocket message error: {e}")
    except Exception as e:
        logger.debug(f"WebSocket closed: {e}")
    finally:
        active_websockets.discard(websocket)
        logger.info("WebSocket client disconnected")


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("BRIDGE_HOST", "127.0.0.1")
    port = int(os.getenv("BRIDGE_PORT", "8788"))

    logger.info(f"Starting WISE² Sound Labs MIDI Bridge on {host}:{port}")
    uvicorn.run(app, host=host, port=port)
