from dotenv import load_dotenv
load_dotenv()

import os
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional

import bcrypt
import jwt
from fastapi import FastAPI, HTTPException, Depends, Request, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient

# ---------- Config ----------
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
ADMIN_EMAIL = os.environ["ADMIN_EMAIL"]
ADMIN_PASSWORD = os.environ["ADMIN_PASSWORD"]
DISCORD_INVITE = os.environ.get("DISCORD_INVITE", "https://discord.gg/wise2")
JWT_ALGO = "HS256"

# ---------- App ----------
app = FastAPI(title="WISE² Sound Labs — Command Center API")
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

class ChatIn(BaseModel):
    text: str

class PostIn(BaseModel):
    text: str

# ---------- Seed ----------
async def seed():
    # Admin user
    existing = await db.users.find_one({"email": ADMIN_EMAIL.lower()})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL.lower(),
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "D.WISE",
            "role": "Administrator",
            "initials": "DW",
            "avatar": "https://i.pravatar.cc/100?img=12",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.users.update_one(
            {"email": ADMIN_EMAIL.lower()},
            {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}},
        )

    if await db.chat.count_documents({}) == 0:
        msgs = [
            {"user": "ProducersMind", "color": "#f97316", "role": None, "text": "That bass line is 🔥🔥🔥"},
            {"user": "BeatsByRay", "color": "#22c55e", "role": None, "text": "This is crazy! Already feel the energy"},
            {"user": "CreativeKye", "color": "#00d4ff", "role": None, "text": "The transition is 🔥"},
            {"user": "SoundWave", "color": "#ef4444", "role": None, "text": "WISE² never misses! 💯"},
            {"user": "DJ Phantom", "color": "#a855f7", "role": None, "text": "That hook is gonna slap in the clubs"},
            {"user": "BrandKing", "color": "#22c55e", "role": None, "text": "Can't wait to hear the final mix!"},
            {"user": "AI MAESTRO", "color": "#00d4ff", "role": "BOT", "text": "Remember to drop your feedback and suggestions in the chat!"},
            {"user": "D.WISE", "color": "#00d4ff", "role": "ADMIN", "text": "Appreciate y'all rocking with us! Let's build! 🙌"},
        ]
        now = datetime.now(timezone.utc)
        docs = []
        for i, m in enumerate(msgs):
            m["id"] = str(uuid.uuid4())
            m["ts"] = (now + timedelta(seconds=i)).isoformat()
            docs.append(m)
        await db.chat.insert_many(docs)

    if await db.projects.count_documents({}) == 0:
        await db.projects.insert_many([
            {"id": str(uuid.uuid4()), "name": "Urban Grind Anthem", "type": "Hip Hop / Trap", "progress": 62, "live": True,
             "image": "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?crop=entropy&cs=srgb&fm=jpg&q=85&w=200", "order": 1},
            {"id": str(uuid.uuid4()), "name": "Royal Cuisine Jingle", "type": "Commercial", "progress": 45, "live": False,
             "image": "https://images.unsplash.com/photo-1552166539-ade937e98ed7?crop=entropy&cs=srgb&fm=jpg&q=85&w=200", "order": 2},
            {"id": str(uuid.uuid4()), "name": "Iron Fitness Campaign", "type": "Motivational", "progress": 75, "live": False,
             "image": "https://images.unsplash.com/photo-1637430308606-86576d8fef3c?crop=entropy&cs=srgb&fm=jpg&q=85&w=200", "order": 3},
            {"id": str(uuid.uuid4()), "name": "Elevate Realty Theme", "type": "Corporate", "progress": 30, "live": False,
             "image": "https://images.unsplash.com/photo-1613977257363-707ba9348227?crop=entropy&cs=srgb&fm=jpg&q=85&w=200", "order": 4},
        ])

    if await db.feed.count_documents({}) == 0:
        await db.feed.insert_many([
            {"id": str(uuid.uuid4()), "user": "@BeatMaster88", "avatar": "https://i.pravatar.cc/100?img=15",
             "text": "Just finished my first track using the WISE workflow!", "likes": 125, "comments": 32, "when": "2h ago", "kind": "audio", "order": 1},
            {"id": str(uuid.uuid4()), "user": "@VocalQueen", "avatar": "https://i.pravatar.cc/100?img=45",
             "text": "New vocals recorded for my brand anthem 🔥", "likes": 98, "comments": 18, "when": "3h ago", "kind": "audio", "order": 2},
            {"id": str(uuid.uuid4()), "user": "@BrandArchitect", "avatar": "https://i.pravatar.cc/100?img=33",
             "text": "Check out this Brand DNA profile! Thoughts?", "likes": 76, "comments": 24, "when": "5h ago", "kind": "radar", "order": 3},
        ])

    if await db.leaderboard.count_documents({}) == 0:
        await db.leaderboard.insert_many([
            {"id": str(uuid.uuid4()), "rank": 1, "name": "SoundWave", "xp": 12450, "avatar": "https://i.pravatar.cc/100?img=8"},
            {"id": str(uuid.uuid4()), "rank": 2, "name": "BeatMaster88", "xp": 9870, "avatar": "https://i.pravatar.cc/100?img=15"},
            {"id": str(uuid.uuid4()), "rank": 3, "name": "CreativeKye", "xp": 8230, "avatar": "https://i.pravatar.cc/100?img=52"},
            {"id": str(uuid.uuid4()), "rank": 4, "name": "DJ Phantom", "xp": 7110, "avatar": "https://i.pravatar.cc/100?img=13"},
            {"id": str(uuid.uuid4()), "rank": 5, "name": "BrandKing", "xp": 6540, "avatar": "https://i.pravatar.cc/100?img=68"},
        ])

    if await db.notifications.count_documents({}) == 0:
        now = datetime.now(timezone.utc).isoformat()
        await db.notifications.insert_many([
            {"id": str(uuid.uuid4()), "text": "New challenge dropped: Trap Anthem Battle", "read": False, "ts": now},
            {"id": str(uuid.uuid4()), "text": "SoundWave reached #1 on the leaderboard", "read": False, "ts": now},
            {"id": str(uuid.uuid4()), "text": "Your master render for 'Urban Grind' is ready", "read": False, "ts": now},
            {"id": str(uuid.uuid4()), "text": "AI Maestro suggested EQ tweaks on your mix", "read": False, "ts": now},
            {"id": str(uuid.uuid4()), "text": "7 new members joined the community", "read": False, "ts": now},
            {"id": str(uuid.uuid4()), "text": "Live session 'Anthem Creation' is starting", "read": False, "ts": now},
            {"id": str(uuid.uuid4()), "text": "You earned 250 XP — keep building!", "read": False, "ts": now},
        ])

@app.on_event("startup")
async def startup():
    await seed()

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
            "id": user["id"], "email": user["email"], "name": user["name"],
            "role": user["role"], "initials": user["initials"], "avatar": user.get("avatar"),
        },
    }

@api.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return user

# ---------- Dashboard aggregate ----------
@api.get("/dashboard")
async def dashboard():
    projects = await db.projects.find({}, {"_id": 0}).sort("order", 1).to_list(50)
    feed = await db.feed.find({}, {"_id": 0}).sort("order", 1).to_list(50)
    leaderboard = await db.leaderboard.find({}, {"_id": 0}).sort("rank", 1).to_list(50)
    live_projects = sum(1 for p in projects if p.get("live"))

    return {
        "stats": {
            "live_viewers": 358,
            "projects_live": max(live_projects, 4),
            "community_online": 1247,
        },
        "live_studio": {
            "title": "Urban Grind Brand Anthem",
            "tagline": "REAL TIME. NO FILTERS. 100% ORGANIZED CHAOS.",
            "is_live": True,
            "elapsed": "00:42:17",
            "viewers": 358, "likes": 219, "comments": 87,
            "stages": [
                {"name": "BRAND DNA", "status": "COMPLETED"},
                {"name": "LYRICS", "status": "COMPLETED"},
                {"name": "BEAT PROD.", "status": "LIVE"},
                {"name": "RECORDING", "status": "UP NEXT"},
                {"name": "MIXING", "status": "WAITING"},
                {"name": "MASTERING", "status": "WAITING"},
                {"name": "DELIVERY", "status": "WAITING"},
            ],
        },
        "schedule": [
            {"day": "MON", "title": "Brand DNA Live", "time": "10:00 AM", "live": False},
            {"day": "TUE", "title": "Anthem Creation", "time": "12:00 PM", "live": True},
            {"day": "WED", "title": "WISE² Development", "time": "03:00 PM", "live": False},
            {"day": "THU", "title": "Community Reviews", "time": "05:00 PM", "live": False},
            {"day": "FRI", "title": "Client Showcase", "time": "06:00 PM", "live": False},
            {"day": "SAT", "title": "Q&A + Tutorials", "time": "01:00 PM", "live": False},
            {"day": "SUN", "title": "Roadmap & Planning", "time": "02:00 PM", "live": False},
        ],
        "projects": projects,
        "feed": feed,
        "leaderboard": leaderboard,
        "discord": {
            "members_online": 1247,
            "avatars": [f"https://i.pravatar.cc/100?img={i}" for i in [1, 5, 9, 14, 22, 30, 41]],
            "invite": DISCORD_INVITE,
            "benefits": ["Connect", "Collaborate", "Get Feedback", "Win Prizes", "Be Part of the Movement"],
        },
        "enterprise": [
            {"code": "GENESIS", "name": "PROJECT", "subtitle": "The Blueprint"},
            {"code": "ATLAS", "name": "PROJECT", "subtitle": "The Platform"},
            {"code": "ORBIT", "name": "PROJECT", "subtitle": "The Operations"},
        ],
        "update": {
            "version": "v2.4.1 UPDATE",
            "desc": "New features, performance boosts and more.",
        },
        "roadmap": {"quarter": "Q2 2025", "completed": 4, "total": 6, "steps": [True, True, True, True, False, False]},
        "metrics": {
            "projects_completed": 2543,
            "happy_clients": 1128,
            "client_satisfaction": "99.8%",
            "countries_served": 23,
        },
    }

# ---------- Chat ----------
@api.get("/chat")
async def get_chat():
    return await db.chat.find({}, {"_id": 0}).sort("ts", 1).to_list(200)

@api.post("/chat")
async def post_chat(body: ChatIn, user=Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "user": user.get("name", "You"),
        "color": "#00d4ff",
        "role": "ADMIN" if user.get("role") == "Administrator" else None,
        "text": body.text,
        "ts": datetime.now(timezone.utc).isoformat(),
    }
    await db.chat.insert_one(doc)
    doc.pop("_id", None)
    return doc

# ---------- Feed ----------
@api.post("/feed/{post_id}/like")
async def like_post(post_id: str, user=Depends(get_current_user)):
    res = await db.feed.update_one({"id": post_id}, {"$inc": {"likes": 1}})
    if res.matched_count == 0:
        raise HTTPException(404, "Post not found")
    doc = await db.feed.find_one({"id": post_id}, {"_id": 0})
    return doc

@api.post("/feed")
async def create_post(body: PostIn, user=Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "user": "@" + user.get("name", "You").replace(" ", ""),
        "avatar": user.get("avatar") or "https://i.pravatar.cc/100?img=12",
        "text": body.text, "likes": 0, "comments": 0, "when": "just now", "kind": "text", "order": 0,
    }
    await db.feed.insert_one(doc)
    doc.pop("_id", None)
    return doc

# ---------- Notifications ----------
@api.get("/notifications")
async def notifications():
    docs = await db.notifications.find({}, {"_id": 0}).sort("ts", -1).to_list(50)
    unread = sum(1 for d in docs if not d.get("read"))
    return {"items": docs, "unread": unread}

@api.post("/notifications/read")
async def read_notifications(user=Depends(get_current_user)):
    await db.notifications.update_many({}, {"$set": {"read": True}})
    return {"ok": True}

# ---------- Search ----------
@api.get("/search")
async def search(q: str = ""):
    if not q:
        return {"projects": []}
    ql = q.lower()
    projects = await db.projects.find({}, {"_id": 0}).to_list(200)
    projects = [p for p in projects if ql in p["name"].lower() or ql in p["type"].lower()]
    return {"projects": projects[:8]}

# ---------- Health ----------
@api.get("/")
async def root():
    return {"service": "WISE² Sound Labs — Command Center", "status": "online"}

app.include_router(api)
