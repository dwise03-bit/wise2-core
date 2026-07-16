from dotenv import load_dotenv
load_dotenv()

import os
import uuid
import random
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
from fastapi import FastAPI, HTTPException, Depends, Request, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr, Field
from motor.motor_asyncio import AsyncIOMotorClient

# ---------- Config ----------
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
ADMIN_EMAIL = os.environ["ADMIN_EMAIL"]
ADMIN_PASSWORD = os.environ["ADMIN_PASSWORD"]
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
JWT_ALGO = "HS256"

# ---------- App ----------
app = FastAPI(title="WISE² Sound Labs API")
api = APIRouter(prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# ---------- Helpers ----------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    return bcrypt.checkpw(pw.encode(), hashed.encode())

def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

async def get_current_user(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")
    token = auth[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(401, "User not found")
        user.pop("_id", None)
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

# ---------- Models ----------
class LoginIn(BaseModel):
    email: EmailStr
    password: str

class ProjectIn(BaseModel):
    name: str
    genre: str
    tracks: int = 0
    duration: str = "00:00"

class PluginToggle(BaseModel):
    enabled: bool

class HermesIn(BaseModel):
    session_id: str
    message: str

# ---------- Startup: seed data ----------
@app.on_event("startup")
async def startup():
    # Admin user
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "Admin",
            "role": "Administrator",
            "initials": "AD",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    else:
        # Ensure password matches env
        if not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
            await db.users.update_one(
                {"email": ADMIN_EMAIL},
                {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}}
            )

    # Seed projects if empty
    if await db.projects.count_documents({}) == 0:
        seed_projects = [
            {"id": str(uuid.uuid4()), "name": "Organized Chaos (Final)", "genre": "Hip Hop", "tracks": 12, "duration": "03:42", "artist": "Daniel Wise", "current": True, "color": "from-fuchsia-500 to-purple-700"},
            {"id": str(uuid.uuid4()), "name": "Midnight Mission", "genre": "Trap", "tracks": 8, "duration": "02:58", "artist": "Daniel Wise", "current": False, "color": "from-blue-500 to-indigo-800"},
            {"id": str(uuid.uuid4()), "name": "Elevate", "genre": "R&B", "tracks": 10, "duration": "04:15", "artist": "Daniel Wise", "current": False, "color": "from-cyan-500 to-teal-700"},
            {"id": str(uuid.uuid4()), "name": "System Takeover", "genre": "Drill", "tracks": 7, "duration": "02:31", "artist": "Daniel Wise", "current": False, "color": "from-slate-600 to-slate-900"},
        ]
        await db.projects.insert_many(seed_projects)

    if await db.activity.count_documents({}) == 0:
        now = datetime.now(timezone.utc)
        acts = [
            {"id": str(uuid.uuid4()), "text": 'Mastered "Organized Chaos (Final)"', "when": "2m ago", "ts": now.isoformat()},
            {"id": str(uuid.uuid4()), "text": "Imported 12 new samples", "when": "15m ago", "ts": now.isoformat()},
            {"id": str(uuid.uuid4()), "text": 'Beat "No Mercy" exported', "when": "1h ago", "ts": now.isoformat()},
            {"id": str(uuid.uuid4()), "text": 'AI Master applied to "Midnight Mission"', "when": "2h ago", "ts": now.isoformat()},
        ]
        await db.activity.insert_many(acts)

    if await db.plugins.count_documents({}) == 0:
        plugins = [
            {"id": "fabfilter", "name": "FabFilter Pro-Q 3", "category": "Equalizer", "enabled": True, "icon": "F"},
            {"id": "waves-cla76", "name": "Waves CLA-76", "category": "Compressor", "enabled": True, "icon": "W"},
            {"id": "ozone11", "name": "iZotope Ozone 11", "category": "Mastering Suite", "enabled": True, "icon": "O"},
            {"id": "valhalla", "name": "Valhalla VintageVerb", "category": "Reverb", "enabled": True, "icon": "V"},
            {"id": "soundtoys", "name": "Soundtoys Decapitator", "category": "Saturation", "enabled": True, "icon": "S"},
        ]
        await db.plugins.insert_many(plugins)

    if await db.notifications.count_documents({}) == 0:
        await db.notifications.insert_many([
            {"id": str(uuid.uuid4()), "text": "New sample pack available", "read": False, "ts": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "text": "Master render complete", "read": False, "ts": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "text": "Hermes suggests EQ tweak on Vocals", "read": False, "ts": datetime.now(timezone.utc).isoformat()},
        ])

# ---------- Auth ----------
@api.post("/auth/login")
async def login(body: LoginIn):
    user = await db.users.find_one({"email": body.email.lower()})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(401, "Invalid credentials")
    token = create_token(user["id"], user["email"])
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "initials": user["initials"],
        },
    }

@api.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return user

# ---------- Projects ----------
@api.get("/projects")
async def list_projects():
    docs = await db.projects.find({}, {"_id": 0}).to_list(200)
    return docs

@api.post("/projects")
async def create_project(body: ProjectIn, user=Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "name": body.name,
        "genre": body.genre,
        "tracks": body.tracks,
        "duration": body.duration,
        "artist": user.get("name", "Admin"),
        "current": False,
        "color": random.choice([
            "from-fuchsia-500 to-purple-700",
            "from-blue-500 to-indigo-800",
            "from-cyan-500 to-teal-700",
            "from-emerald-500 to-green-800",
            "from-amber-500 to-orange-700",
        ]),
    }
    await db.projects.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api.post("/projects/{project_id}/select")
async def select_project(project_id: str, user=Depends(get_current_user)):
    await db.projects.update_many({}, {"$set": {"current": False}})
    res = await db.projects.update_one({"id": project_id}, {"$set": {"current": True}})
    if res.matched_count == 0:
        raise HTTPException(404, "Project not found")
    return {"ok": True}

# ---------- Stats ----------
@api.get("/stats/overview")
async def stats_overview():
    projects = await db.projects.count_documents({})
    plugins = await db.plugins.count_documents({"enabled": True})
    tracks_agg = await db.projects.aggregate([{"$group": {"_id": None, "t": {"$sum": "$tracks"}}}]).to_list(1)
    tracks = tracks_agg[0]["t"] if tracks_agg else 0
    beats = 89
    return {
        "projects": projects,
        "tracks": tracks,
        "beats": beats,
        "plugins": plugins,
    }

@api.get("/stats/resources")
async def stats_resources():
    # Simulated live system metrics for the sparklines
    def series(base):
        return [max(5, min(95, base + random.randint(-8, 8))) for _ in range(24)]
    cpu = random.randint(18, 32)
    mem = random.randint(52, 65)
    disk = random.randint(60, 70)
    net = random.randint(35, 50)
    return {
        "cpu": {"value": cpu, "series": series(cpu)},
        "memory": {"value": mem, "series": series(mem)},
        "disk": {"value": disk, "series": series(disk)},
        "network": {"value": net, "series": series(net)},
    }

@api.get("/stats/studio")
async def stats_studio():
    return {
        "status": "Online",
        "sample_rate": "48 kHz",
        "bit_depth": "24-bit",
        "buffer": "128 samples",
        "latency": "2.7 ms",
    }

# ---------- Activity & Notifications ----------
@api.get("/activity")
async def activity():
    docs = await db.activity.find({}, {"_id": 0}).sort("ts", -1).to_list(20)
    return docs

@api.get("/notifications")
async def notifications():
    docs = await db.notifications.find({}, {"_id": 0}).to_list(20)
    unread = sum(1 for d in docs if not d.get("read"))
    return {"items": docs, "unread": unread}

@api.post("/notifications/read")
async def read_notifs(user=Depends(get_current_user)):
    await db.notifications.update_many({}, {"$set": {"read": True}})
    return {"ok": True}

# ---------- Plugins ----------
@api.get("/plugins")
async def plugins():
    return await db.plugins.find({}, {"_id": 0}).to_list(50)

@api.post("/plugins/{plugin_id}/toggle")
async def toggle_plugin(plugin_id: str, body: PluginToggle, user=Depends(get_current_user)):
    res = await db.plugins.update_one({"id": plugin_id}, {"$set": {"enabled": body.enabled}})
    if res.matched_count == 0:
        raise HTTPException(404, "Plugin not found")
    return {"ok": True}

# ---------- Sound Library ----------
@api.get("/library")
async def library():
    return [
        {"id": "drum-kits", "name": "Drum Kits", "count": 245, "icon": "drum"},
        {"id": "loops", "name": "Loops", "count": 1432, "icon": "waveform"},
        {"id": "one-shots", "name": "One Shots", "count": 3982, "icon": "zap"},
        {"id": "vocal-presets", "name": "Vocal Presets", "count": 426, "icon": "mic"},
        {"id": "instruments", "name": "Instruments", "count": 158, "icon": "piano"},
        {"id": "sound-fx", "name": "Sound FX", "count": 892, "icon": "sparkles"},
    ]

# ---------- Hermes AI ----------
HERMES_SYSTEM = (
    "You are Hermes, an expert AI music production assistant embedded in WISE² ENTERPRISE Sound Labs. "
    "You help producers with mixing, mastering, beat making, sound design, arrangement, EQ, compression, "
    "reverb, sample selection, and audio engineering workflows. Be concise, practical, and studio-savvy. "
    "Use short paragraphs. When suggesting settings, give exact values (e.g., 'HPF at 80 Hz, ratio 4:1'). "
    "Match the vibe of a seasoned mixing engineer who loves Hip Hop, Trap, R&B, and Drill."
)

@api.post("/hermes/chat")
async def hermes_chat(body: HermesIn, user=Depends(get_current_user)):
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    # Load prior turns for this session
    history_doc = await db.hermes_sessions.find_one({"session_id": body.session_id})
    history = history_doc.get("messages", []) if history_doc else []

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=body.session_id,
        system_message=HERMES_SYSTEM,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    try:
        reply = await chat.send_message(UserMessage(text=body.message))
    except Exception as e:
        raise HTTPException(500, f"Hermes error: {str(e)}")

    reply_text = reply if isinstance(reply, str) else str(reply)

    now = datetime.now(timezone.utc).isoformat()
    new_msgs = history + [
        {"role": "user", "text": body.message, "ts": now},
        {"role": "assistant", "text": reply_text, "ts": now},
    ]
    await db.hermes_sessions.update_one(
        {"session_id": body.session_id},
        {"$set": {"session_id": body.session_id, "messages": new_msgs, "updated": now}},
        upsert=True,
    )
    return {"reply": reply_text, "session_id": body.session_id}

@api.get("/hermes/history/{session_id}")
async def hermes_history(session_id: str, user=Depends(get_current_user)):
    doc = await db.hermes_sessions.find_one({"session_id": session_id}, {"_id": 0})
    return doc or {"session_id": session_id, "messages": []}

# ---------- Search ----------
@api.get("/search")
async def search(q: str = ""):
    if not q:
        return {"projects": [], "activity": []}
    q_lower = q.lower()
    projects = await db.projects.find({}, {"_id": 0}).to_list(200)
    projects = [p for p in projects if q_lower in p["name"].lower() or q_lower in p["genre"].lower()]
    return {"projects": projects[:8]}

# ---------- Health ----------
@api.get("/")
async def root():
    return {"service": "WISE² Sound Labs", "status": "online"}

app.include_router(api)
