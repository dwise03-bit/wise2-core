"""
WISE² Sound Labs Routes
Client auth, music generation, REAPER control, live streaming
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional
from sound_labs_auth import ClientAuthManager
from studio_ai import StudioAI
from reaper_client import ReaperClient

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str

class LoginRequest(BaseModel):
    email: str
    password: str

router = APIRouter()
auth_manager = ClientAuthManager()

# Global references for dependency injection
_studio_ai = None
_reaper_client = None

# ===== AUTHENTICATION =====

@router.post("/auth/register")
async def register_client(req: RegisterRequest):
    """Register new Sound Labs client"""
    if auth_manager.register_client(req.email, req.password, req.name):
        return {"status": "ok", "message": "Client registered"}
    raise HTTPException(status_code=400, detail="Registration failed")

@router.post("/auth/login")
async def login(req: LoginRequest):
    """Login client and return JWT token"""
    token = auth_manager.authenticate(req.email, req.password)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"status": "ok", "token": token, "email": req.email}

@router.get("/auth/me")
async def get_current_user(authorization: Optional[str] = Header(None)):
    """Get current authenticated client"""
    if not authorization:
        raise HTTPException(status_code=401, detail="No token")

    token = authorization.replace("Bearer ", "")
    payload = auth_manager.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    client = auth_manager.get_client(payload["email"])
    return {
        "email": payload["email"],
        "client_id": payload["client_id"],
        "name": client.get("name") if client else "Unknown",
        "plan": client.get("plan", "starter") if client else "starter"
    }

# ===== MUSIC GENERATION =====

@router.post("/ai/generate")
async def generate_music(
    prompt: str,
    duration: int = 30,
    genre: str = "electronic",
    authorization: Optional[str] = Header(None)
):
    """Generate music from text prompt"""
    # Verify client
    if not authorization:
        raise HTTPException(status_code=401, detail="No token")

    token = authorization.replace("Bearer ", "")
    payload = auth_manager.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    if not _studio_ai:
        raise HTTPException(status_code=503, detail="AI service unavailable")

    # Generate music
    result = await _studio_ai.generate_music(prompt, genre, duration)
    return {
        "status": "ok",
        "generation_id": result.get("job_id"),
        "prompt": prompt,
        "duration": duration,
        "genre": genre,
        "client": payload["email"]
    }

# ===== REAPER INTEGRATION =====

@router.post("/reaper/transport/{action}")
async def reaper_transport(
    action: str,
    authorization: Optional[str] = Header(None)
):
    """Control REAPER transport (play/stop/record)"""
    # Verify client
    if not authorization:
        raise HTTPException(status_code=401, detail="No token")

    token = authorization.replace("Bearer ", "")
    payload = auth_manager.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    if not _reaper_client:
        raise HTTPException(status_code=503, detail="REAPER offline")

    # Valid actions: play, stop, record, pause
    if action not in ["play", "stop", "record", "pause"]:
        raise HTTPException(status_code=400, detail="Invalid action")

    result = await _reaper_client.handle_transport(action)
    return {"status": "ok", "action": action, "reaper_response": result}

@router.get("/reaper/status")
async def reaper_status():
    """Get REAPER status"""
    if not _reaper_client:
        return {"status": "offline", "connected": False}

    status = await _reaper_client.get_status()
    return status

# ===== LIVE STREAMING =====

@router.post("/stream/start")
async def start_stream(
    platform: str,  # discord, youtube, twitch, custom_rtmp
    title: str,
    authorization: Optional[str] = Header(None)
):
    """Start live stream"""
    # Verify client
    if not authorization:
        raise HTTPException(status_code=401, detail="No token")

    token = authorization.replace("Bearer ", "")
    payload = auth_manager.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    if not _studio_ai:
        raise HTTPException(status_code=503, detail="Streaming unavailable")

    # Start stream
    result = await _studio_ai.start_stream(platform, title)
    return {"status": "ok", "stream_id": result.get("stream_id"), "platform": platform}

@router.post("/stream/stop/{stream_id}")
async def stop_stream(
    stream_id: str,
    authorization: Optional[str] = Header(None)
):
    """Stop live stream"""
    # Verify client
    if not authorization:
        raise HTTPException(status_code=401, detail="No token")

    token = authorization.replace("Bearer ", "")
    payload = auth_manager.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    if not _studio_ai:
        raise HTTPException(status_code=503, detail="Streaming unavailable")

    # Stop stream
    result = await _studio_ai.stop_stream(stream_id)
    return {"status": "ok", "stream_id": stream_id}

@router.get("/stream/active")
async def get_active_streams(authorization: Optional[str] = Header(None)):
    """Get active streams for client"""
    # Verify client
    if not authorization:
        raise HTTPException(status_code=401, detail="No token")

    token = authorization.replace("Bearer ", "")
    payload = auth_manager.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    return {"status": "ok", "streams": [], "client": payload["email"]}

# ===== PROJECT MANAGEMENT =====

@router.post("/projects/create")
async def create_project(
    name: str,
    description: str = "",
    authorization: Optional[str] = Header(None)
):
    """Create new project"""
    # Verify client
    if not authorization:
        raise HTTPException(status_code=401, detail="No token")

    token = authorization.replace("Bearer ", "")
    payload = auth_manager.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    return {
        "status": "ok",
        "project_id": f"proj_{payload['client_id']}_{int(__import__('time').time())}",
        "name": name,
        "description": description,
        "client": payload["email"]
    }

@router.get("/projects")
async def list_projects(authorization: Optional[str] = Header(None)):
    """List client's projects"""
    # Verify client
    if not authorization:
        raise HTTPException(status_code=401, detail="No token")

    token = authorization.replace("Bearer ", "")
    payload = auth_manager.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    client = auth_manager.get_client(payload["email"])
    return {
        "status": "ok",
        "projects": client.get("projects", []) if client else [],
        "client": payload["email"]
    }

def register_sound_labs_routes(app, studio_ai: StudioAI, reaper_client: ReaperClient):
    """Register all Sound Labs routes"""
    global _studio_ai, _reaper_client
    _studio_ai = studio_ai
    _reaper_client = reaper_client
    app.include_router(router, prefix="/soundlabs", tags=["sound-labs"])
