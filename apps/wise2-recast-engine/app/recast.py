"""WISE² RECAST ENGINE — OpenJutsu ComfyUI workflow compiler, Character Vault, and durable Recast job queue.

Every exposed capability maps directly to a verified upstream OpenJutsu ComfyUI workflow
in workflows/*.api.json. Unsupported or license-restricted capabilities are explicitly flagged.
"""
from __future__ import annotations

import hashlib
import json
import mimetypes
import os
import re
import shutil
import sqlite3
import subprocess
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path
from typing import Any

from . import auth, backends, hardware, store

ROOT = Path(__file__).resolve().parents[1]
WORKFLOWS_DIR = ROOT / "workflows"

VALID_ID_RE = re.compile(r"^[0-9a-f]{12}$")

RELIGHT_PRESETS: list[dict[str, str]] = [
    {"id": "blinds", "label": "Venetian Blinds", "thumb": "/web/relight/blinds.webp", "prompt": "dramatic sunlight casting venetian blinds shadow stripes across the subject"},
    {"id": "blue_night", "label": "Blue Night", "thumb": "/web/relight/blue_night.webp", "prompt": "cool moonlit blue night cinematography with deep shadows"},
    {"id": "camera_flash", "label": "Camera Flash", "thumb": "/web/relight/camera_flash.webp", "prompt": "direct editorial on-camera flash photography with crisp highlights"},
    {"id": "cold_beam", "label": "Cold Beam", "thumb": "/web/relight/cold_beam.webp", "prompt": "focused cold cyan-white overhead spotlight beam cutting through darkness"},
    {"id": "cyan_orb", "label": "Cyan Orb", "thumb": "/web/relight/cyan_orb.webp", "prompt": "obsidian forged cyan key light glow wrapping the subject's edges"},
    {"id": "evening_lamp", "label": "Evening Lamp", "thumb": "/web/relight/evening_lamp.webp", "prompt": "warm tungsten evening practical lamp lighting"},
    {"id": "firelight", "label": "Firelight", "thumb": "/web/relight/firelight.webp", "prompt": "flickering amber firelight illuminating the subject from below"},
    {"id": "golden_halo", "label": "Golden Halo", "thumb": "/web/relight/golden_halo.webp", "prompt": "warm golden hour halo backlight rim light"},
    {"id": "lime_purple", "label": "Lime & Purple", "thumb": "/web/relight/lime_purple.webp", "prompt": "cyberpunk lime green and purple dual-gel concert lighting"},
    {"id": "magenta_club", "label": "Magenta Club", "thumb": "/web/relight/magenta_club.webp", "prompt": "neon magenta nightclub atmosphere lighting"},
    {"id": "phone_glow", "label": "Phone Glow", "thumb": "/web/relight/phone_glow.webp", "prompt": "soft cool smartphone screen glow illuminating the face in a dark room"},
    {"id": "red_blue_gels", "label": "Red & Blue Gels", "thumb": "/web/relight/red_blue_gels.webp", "prompt": "cinematic split red and blue theater gels across the scene"},
    {"id": "red_room", "label": "Red Room", "thumb": "/web/relight/red_room.webp", "prompt": "deep crimson darkroom red lighting"},
    {"id": "rim_backlight", "label": "Rim Backlight", "thumb": "/web/relight/rim_backlight.webp", "prompt": "strong crisp studio rim backlight separating subject from dark background"},
    {"id": "sunset_window", "label": "Sunset Window", "thumb": "/web/relight/sunset_window.webp", "prompt": "warm golden orange sunset pouring through a side window"},
    {"id": "teal_lasers", "label": "Teal Lasers", "thumb": "/web/relight/teal_lasers.webp", "prompt": "atmospheric teal laser beams through concert haze"},
    {"id": "toxic_green", "label": "Toxic Green", "thumb": "/web/relight/toxic_green.webp", "prompt": "high-contrast neon toxic green sci-fi underlighting"},
]

# Honest, verified capability matrix mapped 1:1 to audited D3voz/openjutsu workflows
CAPABILITIES: list[dict[str, Any]] = [
    {
        "id": "character_replacement",
        "name": "Character Replacement",
        "workflow": "simple",
        "workflow_file": "workflows/simple.api.json",
        "status": "verified",
        "commercial_safe": True,
        "requires_profiles": 1,
        "max_profiles": 1,
        "description": "Replace the primary person in a video with a reference character using MiniMax H3 + SAM 3.1.",
        "notes": "Preserves camera, motion, cuts, and soundtrack. Mirrors/reflections are a known upstream H3 limitation.",
    },
    {
        "id": "multi_character_replacement",
        "name": "Multiple-Character Replacement",
        "workflow": "advanced",
        "workflow_file": "workflows/advanced.api.json",
        "status": "verified",
        "commercial_safe": True,
        "requires_profiles": 1,
        "max_profiles": 4,
        "description": "Replace 1-4 tracked people per shot using role matching (Qwen3-VL + SAM 3.1) or Montage mode.",
        "notes": "Supports up to 4 reference profiles and optional two-pass Max Quality mode (advanced_maxq.api.json).",
    },
    {
        "id": "motion_transfer",
        "name": "Motion Transfer",
        "workflow": "simple",
        "workflow_file": "workflows/simple.api.json",
        "status": "verified",
        "commercial_safe": True,
        "requires_profiles": 1,
        "max_profiles": 4,
        "description": "Transfer body pose, gestures, and timing via grey-mannequin silhouettes or Metric3D normal maps.",
        "notes": "Configurable motion reference resolution (512 / 768 / 1376 px).",
    },
    {
        "id": "facial_consistency",
        "name": "Facial Consistency (Fix Faces)",
        "workflow": "face",
        "workflow_file": "workflows/face.api.json",
        "status": "license_restricted",
        "commercial_safe": False,
        "requires_profiles": 1,
        "max_profiles": 1,
        "description": "Close-up 512x512 face tracking, SAM face-mask redraw, and seamless stitch-back.",
        "notes": "LICENSE WARNING: Depends on InsightFace buffalo_l (non-commercial research only) and Ultralytics YOLO (AGPL-3.0). Do not use in commercial deliverables without separate licensing.",
    },
    {
        "id": "wardrobe_replacement",
        "name": "Wardrobe Replacement",
        "workflow": "object",
        "workflow_file": "workflows/object.api.json",
        "status": "verified",
        "commercial_safe": True,
        "requires_profiles": 0,
        "max_profiles": 1,
        "description": "Swap clothing or hair (e.g., 'jacket', 'hair, top') via SAM 3.1 tracking and optional outfit reference image.",
        "notes": "Preserves body motion and silhouette outline (e.g., sleeveless stays sleeveless unless edited).",
    },
    {
        "id": "object_replacement",
        "name": "Object Replacement / Add / Remove",
        "workflow": "object",
        "workflow_file": "workflows/object.api.json",
        "status": "verified",
        "commercial_safe": True,
        "requires_profiles": 0,
        "max_profiles": 1,
        "description": "Change, Remove, or Add tracked objects or products with optional reference picture.",
        "notes": "Uses OpenJutsu Object Swap (H3ObjectSwapPlan / H3ObjectPlacementMask).",
    },
    {
        "id": "background_replacement",
        "name": "Background Replacement",
        "workflow": "object",
        "workflow_file": "workflows/object.api.json",
        "status": "verified",
        "commercial_safe": True,
        "requires_profiles": 0,
        "max_profiles": 1,
        "description": "Invert the SAM person mask to replace the environment while keeping the subject and camera motion.",
        "notes": "Accepts text description or environment reference image.",
    },
    {
        "id": "cinematic_relighting",
        "name": "Cinematic Relighting",
        "workflow": "relight",
        "workflow_file": "workflows/picture/from_picture_prepare_flux3.api.json",
        "status": "verified",
        "commercial_safe": True,
        "requires_profiles": 0,
        "max_profiles": 1,
        "description": "Relight a character or the video's own person using FLUX.3 Klein + 17 verified lighting presets + SolarRenderer.",
        "notes": "Requires FLUX.3 Klein + SolarRenderer LoRAs on the GPU ComfyUI host.",
    },
    {
        "id": "video_restyling",
        "name": "Video Restyling (Color & Keyframe Guided)",
        "workflow": "color",
        "workflow_file": "workflows/color.api.json",
        "status": "partial",
        "commercial_safe": True,
        "requires_profiles": 0,
        "max_profiles": 1,
        "description": "DCTL tone-mapper grading + Detail Contrast softening (color.api.json), or keyframe-guided From Picture restyling.",
        "notes": "Honest scope: color.api.json performs tone/contrast grading; full scene restyle uses From Picture + FLUX.3 Klein (not arbitrary unbounded video style transfer).",
    },
    {
        "id": "camera_motion_preservation",
        "name": "Camera Motion Preservation",
        "workflow": "simple",
        "workflow_file": "workflows/simple.api.json",
        "status": "verified",
        "commercial_safe": True,
        "requires_profiles": 1,
        "max_profiles": 4,
        "description": "Maintains source framing, pans, handheld shake, and cuts via masked-edit + motion reference latents.",
        "notes": "Built into Simple, Advanced, Montage, and Object workflows.",
    },
    {
        "id": "audio_preservation",
        "name": "Original Audio Preservation",
        "workflow": "simple",
        "workflow_file": "workflows/simple.api.json",
        "status": "verified",
        "commercial_safe": True,
        "requires_profiles": 0,
        "max_profiles": 4,
        "description": "Retains original soundtrack via H3SoundtrackOrSilence + MiniMaxH3ChainAssemble, with optional No Lip-Sync toggle.",
        "notes": "FFmpeg preflight clip slicing also preserves source audio track cleanly.",
    },
    {
        "id": "commercial_generation",
        "name": "Commercial Production Preset",
        "workflow": "object",
        "workflow_file": "workflows/object.api.json",
        "status": "verified",
        "commercial_safe": True,
        "requires_profiles": 1,
        "max_profiles": 1,
        "description": "Product placement/swap + background replacement + vertical export pipeline into WISE² Clip Engine.",
        "notes": "Composes verified OpenJutsu Object Swap with WISE² vertical framing and caption export.",
    },
    {
        "id": "music_video_production",
        "name": "Music Video Production Preset",
        "workflow": "montage",
        "workflow_file": "workflows/montage.api.json",
        "status": "verified",
        "commercial_safe": True,
        "requires_profiles": 1,
        "max_profiles": 4,
        "description": "Multi-shot cast replacement with original song preserved, No Lip-Sync toggle, and optional cinematic relight.",
        "notes": "Uses OpenJutsu Montage / Simple workflows + H3 soft color grading.",
    },
]

WORKFLOW_FILE_MAP = {
    "simple": "simple.api.json",
    "advanced": "advanced.api.json",
    "advanced_maxq": "advanced_maxq.api.json",
    "montage": "montage.api.json",
    "object": "object.api.json",
    "face": "face.api.json",
    "color": "color.api.json",
    "mask": "mask.api.json",
    "people": "people.api.json",
    "fit": "fit.api.json",
    "relight": "picture/from_picture_prepare_flux3.api.json",
    "solar": "picture/from_picture_solar_flux3.api.json",
}

RESOLUTION_PRESETS = {
    "480p": 480,
    "736p": 736,
    "1080p": 1080,
}

_RECAST_LOCK = threading.RLock()


def _data_dir() -> Path:
    d = Path(os.getenv("WISE2_DATA_DIR", str(ROOT / "data")))
    d.mkdir(parents=True, exist_ok=True)
    return d


def _ensure_tables(con: sqlite3.Connection) -> None:
    con.execute(
        """CREATE TABLE IF NOT EXISTS character_profiles (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            role TEXT DEFAULT '',
            category TEXT DEFAULT 'character',
            notes TEXT DEFAULT '',
            filename TEXT NOT NULL,
            rel_path TEXT NOT NULL,
            sha256 TEXT NOT NULL,
            size_bytes INTEGER NOT NULL,
            created_at REAL NOT NULL,
            updated_at REAL NOT NULL
        )"""
    )
    con.execute(
        """CREATE TABLE IF NOT EXISTS recast_jobs (
            id TEXT PRIMARY KEY,
            status TEXT NOT NULL,
            payload TEXT NOT NULL,
            created_at REAL NOT NULL,
            updated_at REAL NOT NULL
        )"""
    )


def _with_db(fn):
    with _RECAST_LOCK:
        con = store.connection()
        try:
            _ensure_tables(con)
            return fn(con)
        finally:
            con.close()


# ---- Character & Product Profile Vault ----

def save_profile(
    name: str,
    image_bytes: bytes,
    orig_filename: str,
    role: str = "",
    category: str = "character",
    notes: str = "",
) -> dict[str, Any]:
    clean_name = (name or "").strip()[:80]
    if not clean_name:
        raise ValueError("Profile name is required.")
    if category not in {"character", "product", "wardrobe", "background"}:
        raise ValueError("category must be character, product, wardrobe, or background")
    ext = auth.validate_image_file(orig_filename, image_bytes[:16])
    sha = hashlib.sha256(image_bytes).hexdigest()
    pid = uuid.uuid4().hex[:12]
    safe_orig = auth.sanitize_filename(orig_filename, f"ref{ext}")
    profiles_dir = _data_dir() / "profiles"
    profiles_dir.mkdir(parents=True, exist_ok=True)
    disk_name = f"{pid}_{safe_orig}"
    disk_path = profiles_dir / disk_name
    disk_path.write_bytes(image_bytes)
    now = time.time()

    def _do(con: sqlite3.Connection):
        con.execute(
            """INSERT INTO character_profiles
               (id, name, role, category, notes, filename, rel_path, sha256, size_bytes, created_at, updated_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
            (pid, clean_name, (role or "").strip()[:80], category, (notes or "").strip()[:400],
             safe_orig, f"profiles/{disk_name}", sha, len(image_bytes), now, now),
        )
        con.commit()

    _with_db(_do)
    return get_profile(pid)  # type: ignore[return-value]


def list_profiles(category: str | None = None) -> list[dict[str, Any]]:
    def _do(con: sqlite3.Connection):
        if category:
            rows = con.execute(
                "SELECT id,name,role,category,notes,filename,rel_path,sha256,size_bytes,created_at,updated_at "
                "FROM character_profiles WHERE category=? ORDER BY updated_at DESC",
                (category,),
            ).fetchall()
        else:
            rows = con.execute(
                "SELECT id,name,role,category,notes,filename,rel_path,sha256,size_bytes,created_at,updated_at "
                "FROM character_profiles ORDER BY updated_at DESC"
            ).fetchall()
        return [_row_to_profile(r) for r in rows]

    return _with_db(_do)


def _row_to_profile(row: tuple[Any, ...]) -> dict[str, Any]:
    return {
        "id": row[0],
        "name": row[1],
        "role": row[2],
        "category": row[3],
        "notes": row[4],
        "filename": row[5],
        "rel_path": row[6],
        "sha256": row[7],
        "size_bytes": row[8],
        "created_at": row[9],
        "updated_at": row[10],
        "image_url": f"/api/recast/profiles/{row[0]}/image",
    }


def get_profile(profile_id: str) -> dict[str, Any] | None:
    if not VALID_ID_RE.fullmatch(profile_id or ""):
        return None

    def _do(con: sqlite3.Connection):
        row = con.execute(
            "SELECT id,name,role,category,notes,filename,rel_path,sha256,size_bytes,created_at,updated_at "
            "FROM character_profiles WHERE id=?",
            (profile_id,),
        ).fetchone()
        return _row_to_profile(row) if row else None

    return _with_db(_do)


def get_profile_file(profile_id: str) -> Path | None:
    prof = get_profile(profile_id)
    if not prof:
        return None
    p = _data_dir() / prof["rel_path"]
    return p if p.is_file() else None


def delete_profile(profile_id: str) -> bool:
    prof = get_profile(profile_id)
    if not prof:
        return False
    p = _data_dir() / prof["rel_path"]
    if p.is_file():
        try:
            p.unlink()
        except OSError:
            pass

    def _do(con: sqlite3.Connection):
        con.execute("DELETE FROM character_profiles WHERE id=?", (profile_id,))
        con.commit()

    _with_db(_do)
    return True


# ---- OpenJutsu Workflow Compiler ----

def load_workflow_template(workflow_key: str) -> dict[str, Any]:
    rel = WORKFLOW_FILE_MAP.get(workflow_key)
    if not rel:
        raise ValueError(f"Unsupported workflow '{workflow_key}'.")
    path = WORKFLOWS_DIR / rel
    if not path.is_file():
        raise FileNotFoundError(f"Verified OpenJutsu workflow file not found: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def required_nodes_for_workflow(workflow_key: str) -> list[str]:
    graph = load_workflow_template(workflow_key)
    return sorted({node.get("class_type", "") for node in graph.values() if isinstance(node, dict) and node.get("class_type")})


def compile_workflow(
    workflow_key: str,
    *,
    video_name: str,
    image_names: list[str],
    resolution: str = "480p",
    duration_sec: float = 6.0,
    start_sec: float = 0.0,
    seed: int = 42,
    role: str = "",
    object_mode: str = "change",
    object_target: str = "person",
    prompt: str = "",
    relight_preset: str = "",
    no_lip_sync: bool = False,
    hat_fix: bool = False,
) -> dict[str, Any]:
    """Compile a verified upstream OpenJutsu ComfyUI API graph with user parameters."""
    graph = load_workflow_template(workflow_key)
    short_edge = RESOLUTION_PRESETS.get(resolution, 480)
    fps = 24
    frame_cap = max(24, min(int(round(duration_sec * fps)), 15 * fps))
    skip_frames = max(0, int(round(start_sec * fps)))

    image_idx = 0
    for node_id, node in graph.items():
        if not isinstance(node, dict):
            continue
        ctype = node.get("class_type", "")
        inputs = node.get("inputs")
        if not isinstance(inputs, dict):
            continue

        if ctype == "VHS_LoadVideo":
            inputs["video"] = video_name
            if "frame_load_cap" in inputs:
                inputs["frame_load_cap"] = frame_cap
            if "skip_first_frames" in inputs:
                inputs["skip_first_frames"] = skip_frames

        elif ctype == "LoadImage":
            if image_idx < len(image_names):
                inputs["image"] = image_names[image_idx]
                image_idx += 1

        elif ctype in {"H3OneClickSwapPlan", "H3AdvancedSwapPlan", "H3ObjectSwapPlan", "H3MontagePlan"}:
            if "short_edge" in inputs:
                inputs["short_edge"] = short_edge
            if "resolution" in inputs and isinstance(inputs["resolution"], str):
                inputs["resolution"] = resolution
            if "seed" in inputs:
                inputs["seed"] = int(seed)
            if "clip_seconds" in inputs:
                inputs["clip_seconds"] = min(float(duration_sec), 15.0)
            if role and "role" in inputs:
                inputs["role"] = role
            if "no_lip_sync" in inputs:
                inputs["no_lip_sync"] = bool(no_lip_sync)
            if "hat_fix" in inputs:
                inputs["hat_fix"] = bool(hat_fix)
            if ctype == "H3ObjectSwapPlan":
                if "mode" in inputs:
                    inputs["mode"] = object_mode
                if "target" in inputs and object_target:
                    inputs["target"] = object_target
                if "description" in inputs and prompt:
                    inputs["description"] = prompt

        elif ctype in {"SAM3_VideoTrack"} and object_target:
            if "prompt" in inputs:
                inputs["prompt"] = object_target

        elif "seed" in inputs and isinstance(inputs["seed"], (int, float)):
            inputs["seed"] = int(seed)

    meta = {
        "wise2_recast_compiler": "2.0.0",
        "upstream_workflow": WORKFLOW_FILE_MAP[workflow_key],
        "resolution": resolution,
        "short_edge": short_edge,
        "duration_sec": duration_sec,
        "start_sec": start_sec,
        "relight_preset": relight_preset,
        "preserve_audio": True,
        "no_lip_sync": no_lip_sync,
    }
    return {"graph": graph, "meta": meta, "required_nodes": required_nodes_for_workflow(workflow_key)}


# ---- FFmpeg Preflight Media Preparation ----

def probe_video_metadata(video_path: Path) -> dict[str, Any]:
    proc = subprocess.run(
        [
            "ffprobe", "-v", "error", "-print_format", "json",
            "-show_format", "-show_streams", str(video_path),
        ],
        capture_output=True, text=True, timeout=15,
    )
    if proc.returncode != 0:
        raise RuntimeError(f"ffprobe failed: {(proc.stderr or proc.stdout).strip()[:200]}")
    info = json.loads(proc.stdout)
    vstream = next((s for s in info.get("streams", []) if s.get("codec_type") == "video"), None)
    astream = next((s for s in info.get("streams", []) if s.get("codec_type") == "audio"), None)
    if not vstream:
        raise RuntimeError("No video stream found in uploaded file.")
    dur = float(info.get("format", {}).get("duration") or vstream.get("duration") or 0.0)
    return {
        "duration_sec": round(dur, 2),
        "width": int(vstream.get("width") or 0),
        "height": int(vstream.get("height") or 0),
        "codec": vstream.get("codec_name"),
        "has_audio": astream is not None,
        "audio_codec": astream.get("codec_name") if astream else None,
    }


def prepare_source_clip(
    source_path: Path,
    dest_path: Path,
    *,
    start_sec: float = 0.0,
    duration_sec: float = 6.0,
    short_edge: int = 480,
) -> dict[str, Any]:
    """Normalize and slice source video to target duration/resolution while preserving original audio."""
    dur = max(1.0, min(float(duration_sec), 60.0))
    start = max(0.0, float(start_sec))
    vf = f"scale='if(gt(iw,ih),-2,{short_edge})':'if(gt(iw,ih),{short_edge},-2)':flags=lanczos,fps=24"
    cmd = [
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-ss", f"{start:.2f}",
        "-i", str(source_path),
        "-t", f"{dur:.2f}",
        "-vf", vf,
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "128k",
        "-movflags", "+faststart",
        str(dest_path),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    if proc.returncode != 0:
        raise RuntimeError(f"FFmpeg clip preparation failed: {(proc.stderr or '')[:300]}")
    return probe_video_metadata(dest_path)


# ---- Durable Recast Job Queue ----

def _save_job(job: dict[str, Any]) -> dict[str, Any]:
    now = time.time()
    job["updated_at"] = now
    if "created_at" not in job:
        job["created_at"] = now

    def _do(con: sqlite3.Connection):
        con.execute(
            """INSERT INTO recast_jobs(id, status, payload, created_at, updated_at)
               VALUES (?,?,?,?,?)
               ON CONFLICT(id) DO UPDATE SET status=excluded.status, payload=excluded.payload, updated_at=excluded.updated_at""",
            (job["id"], job["status"], json.dumps(job), job["created_at"], now),
        )
        con.commit()

    _with_db(_do)
    return job


def get_recast_job(job_id: str) -> dict[str, Any] | None:
    if not VALID_ID_RE.fullmatch(job_id or ""):
        return None

    def _do(con: sqlite3.Connection):
        row = con.execute("SELECT payload FROM recast_jobs WHERE id=?", (job_id,)).fetchone()
        return json.loads(row[0]) if row else None

    return _with_db(_do)


def list_recast_jobs(limit: int = 50) -> list[dict[str, Any]]:
    def _do(con: sqlite3.Connection):
        rows = con.execute(
            "SELECT payload FROM recast_jobs ORDER BY updated_at DESC LIMIT ?",
            (int(limit),),
        ).fetchall()
        return [json.loads(r[0]) for r in rows]

    return _with_db(_do)


def patch_recast_job(job_id: str, **fields: Any) -> dict[str, Any] | None:
    cur = get_recast_job(job_id)
    if not cur:
        return None
    cur.update(fields)
    return _save_job(cur)


def _upload_file_to_comfyui(comfyui_url: str, file_path: Path, subfolder: str = "wise2_recast") -> str:
    boundary = f"----WISE2Boundary{uuid.uuid4().hex}"
    mime = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"
    file_bytes = file_path.read_bytes()
    parts = [
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"subfolder\"\r\n\r\n{subfolder}\r\n".encode("utf-8"),
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"overwrite\"\r\n\r\ntrue\r\n".encode("utf-8"),
        (
            f"--{boundary}\r\nContent-Disposition: form-data; name=\"image\"; filename=\"{file_path.name}\"\r\n"
            f"Content-Type: {mime}\r\n\r\n"
        ).encode("utf-8"),
        file_bytes,
        f"\r\n--{boundary}--\r\n".encode("utf-8"),
    ]
    body = b"".join(parts)
    req = urllib.request.Request(
        f"{comfyui_url.rstrip('/')}/upload/image",
        data=body,
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "User-Agent": "WISE2-Recast-Engine/2.0",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        name = res.get("name") or file_path.name
        sub = res.get("subfolder")
        return f"{sub}/{name}" if sub else name


def _submit_comfyui_prompt(comfyui_url: str, graph: dict[str, Any], client_id: str) -> str:
    payload = json.dumps({"prompt": graph, "client_id": client_id}).encode("utf-8")
    req = urllib.request.Request(
        f"{comfyui_url.rstrip('/')}/prompt",
        data=payload,
        headers={"Content-Type": "application/json", "User-Agent": "WISE2-Recast-Engine/2.0"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        pid = data.get("prompt_id")
        if not pid:
            raise RuntimeError(f"ComfyUI did not return a prompt_id: {data}")
        return str(pid)


def _poll_comfyui_job(job_id: str, comfyui_url: str, prompt_id: str, dest_dir: Path, timeout_sec: int = 1800) -> Path:
    started = time.monotonic()
    while (time.monotonic() - started) < timeout_sec:
        cur = get_recast_job(job_id)
        if cur and cur.get("status") == "canceled":
            raise RuntimeError("Job canceled by user.")
        st, hist = backends._http_json(f"{comfyui_url.rstrip('/')}/history/{urllib.parse.quote(prompt_id)}", timeout=8.0)
        if st == 200 and isinstance(hist, dict) and prompt_id in hist:
            entry = hist[prompt_id]
            status_obj = entry.get("status") or {}
            if status_obj.get("status_str") == "error":
                raise RuntimeError(f"ComfyUI execution error: {json.dumps(status_obj.get('messages') or [])[:300]}")
            outputs = entry.get("outputs") or {}
            for node_out in outputs.values():
                for key in ("gifs", "videos", "images"):
                    for item in node_out.get(key) or []:
                        fname = item.get("filename")
                        if not fname:
                            continue
                        if key == "images" and not fname.lower().endswith((".mp4", ".webm", ".mov", ".gif")):
                            continue
                        q = urllib.parse.urlencode({
                            "filename": fname,
                            "subfolder": item.get("subfolder", ""),
                            "type": item.get("type", "output"),
                        })
                        out_path = dest_dir / "output.mp4"
                        urllib.request.urlretrieve(f"{comfyui_url.rstrip('/')}/view?{q}", str(out_path))
                        return out_path
            raise RuntimeError("ComfyUI finished without producing a video output.")
        elapsed = int(time.monotonic() - started)
        pct = min(92, 40 + int(elapsed / 3))
        patch_recast_job(job_id, progress=pct, stage="rendering_gpu", message=f"Rendering on ComfyUI GPU ({elapsed}s elapsed)")
        time.sleep(2.0)
    raise TimeoutError(f"ComfyUI render timed out after {timeout_sec}s.")


def execute_recast_job(job_id: str) -> None:
    job = get_recast_job(job_id)
    if not job or job.get("status") in {"canceled", "succeeded"}:
        return

    folder = _data_dir() / "recast_jobs" / job_id
    folder.mkdir(parents=True, exist_ok=True)

    try:
        patch_recast_job(job_id, status="preparing", progress=10, stage="preflight", message="Validating source media and compiling OpenJutsu graph...")
        source_path = folder / job["source_filename"]
        if not source_path.is_file():
            raise FileNotFoundError("Source video file is missing from job directory.")

        # Step 1: Prepare normalized clip via FFmpeg (real media verification, original audio preserved)
        short_edge = RESOLUTION_PRESETS.get(job["resolution"], 480)
        prepared_clip = folder / "prepared_input.mp4"
        clip_meta = prepare_source_clip(
            source_path,
            prepared_clip,
            start_sec=job.get("start_sec", 0.0),
            duration_sec=job.get("duration_sec", 6.0),
            short_edge=short_edge,
        )
        patch_recast_job(
            job_id,
            progress=25,
            stage="graph_compiled",
            prepared_clip=prepared_clip.name,
            prepared_meta=clip_meta,
            message=f"Prepared {clip_meta['duration_sec']}s {clip_meta['width']}x{clip_meta['height']} clip (audio={'yes' if clip_meta['has_audio'] else 'no'}).",
        )

        # Resolve reference profile files
        ref_files: list[Path] = []
        for pid in job.get("profile_ids") or []:
            p = get_profile_file(pid)
            if p:
                ref_files.append(p)
        for extra in job.get("inline_ref_files") or []:
            ep = folder / extra
            if ep.is_file():
                ref_files.append(ep)

        # Step 2: Compile actual OpenJutsu ComfyUI workflow graph
        compiled = compile_workflow(
            job["workflow"],
            video_name=prepared_clip.name,
            image_names=[p.name for p in ref_files],
            resolution=job["resolution"],
            duration_sec=job.get("duration_sec", 6.0),
            start_sec=0.0,
            seed=job.get("seed", 42),
            role=job.get("role", ""),
            object_mode=job.get("object_mode", "change"),
            object_target=job.get("object_target", "person"),
            prompt=job.get("prompt", ""),
            relight_preset=job.get("relight_preset", ""),
            no_lip_sync=bool(job.get("no_lip_sync", False)),
            hat_fix=bool(job.get("hat_fix", False)),
        )
        graph_path = folder / "compiled_workflow.api.json"
        graph_path.write_text(json.dumps(compiled["graph"], indent=2), encoding="utf-8")
        patch_recast_job(
            job_id,
            progress=32,
            workflow_compiled=True,
            ai_render_completed=False,
            compiled_workflow_file=graph_path.name,
            required_nodes_count=len(compiled["required_nodes"]),
        )

        # Step 3: Resolve backend via WISE² GPU Manager (AUTO selection + compatible fallback)
        requested_backend = job.get("backend_id") or "auto"
        preferred = None if requested_backend == "auto" else requested_backend
        if preferred and preferred not in {"auto"}:
            explicit_b = backends.get_backend(preferred)
            if explicit_b["id"] == "local-nvidia" and not explicit_b.get("hardware_supported"):
                raise PermissionError(
                    "Local NVIDIA rendering blocked on unsupported integrated graphics. "
                    "Use AUTO mode, Remote ComfyUI, Kaggle Free GPU, or Google Colab Free GPU."
                )
            if explicit_b.get("paid") and not explicit_b.get("enabled"):
                raise PermissionError("Paid RunPod backend is disabled until explicitly authorized.")

        selection = backends.select_best_backend(
            workflow=job["workflow"],
            resolution=job["resolution"],
            duration_sec=float(job.get("duration_sec", 6.0)),
            preferred_backend_id=preferred,
            required_nodes=compiled["required_nodes"],
            live_probe=True,
        )
        chosen = selection.get("selected_backend")
        patch_recast_job(job_id, auto_selection=selection)

        if not chosen:
            # Find best actionable probe message (prefer requested backend error if set)
            pref_cand = next((c for c in selection["candidates"] if c["id"] == preferred), None) if preferred else None
            probe_obj = (pref_cand or {}).get("probe") or {"reachable": False, "error": selection["blocker_summary"]}
            err_msg = (
                "; ".join(pref_cand["reasons"])
                if pref_cand and pref_cand.get("reasons")
                else selection["blocker_summary"]
            )
            missing_node_case = bool(probe_obj and probe_obj.get("connected") and not probe_obj.get("ready_for_workflow"))
            patch_recast_job(
                job_id,
                status="missing_comfy_nodes" if missing_node_case else "awaiting_gpu_backend",
                stage="missing_comfy_nodes" if missing_node_case else "awaiting_gpu_backend",
                progress=35,
                workflow_compiled=True,
                ai_render_completed=False,
                backend_probe=probe_obj,
                error=err_msg,
                message=(
                    "Source clip prepared & OpenJutsu workflow compiled (AI render NOT started). "
                    + (err_msg or "No compatible AI GPU backend online. Connect Kaggle/Colab or Remote ComfyUI and click Retry (no re-upload needed).")
                ),
            )
            return

        comfy_url = chosen["comfyui_url"].strip().rstrip("/")
        fallback_used = bool(preferred and chosen["id"] != preferred)
        patch_recast_job(
            job_id,
            resolved_backend_id=chosen["id"],
            resolved_backend_name=chosen["name"],
            fallback_used=fallback_used,
            backend_probe=chosen.get("probe"),
            estimated_render_sec=chosen.get("estimated_render_sec"),
        )

        # Step 4: Upload inputs & submit real ComfyUI prompt
        fb_note = f" (automatic fallback from {preferred})" if fallback_used else ""
        patch_recast_job(job_id, status="running", progress=40, stage="uploading_to_gpu", message=f"Uploading assets to {chosen['name']}{fb_note}...")
        uploaded_video = _upload_file_to_comfyui(comfy_url, prepared_clip)
        uploaded_images = [_upload_file_to_comfyui(comfy_url, ref) for ref in ref_files]

        live_compiled = compile_workflow(
            job["workflow"],
            video_name=uploaded_video,
            image_names=uploaded_images,
            resolution=job["resolution"],
            duration_sec=job.get("duration_sec", 6.0),
            start_sec=0.0,
            seed=job.get("seed", 42),
            role=job.get("role", ""),
            object_mode=job.get("object_mode", "change"),
            object_target=job.get("object_target", "person"),
            prompt=job.get("prompt", ""),
            relight_preset=job.get("relight_preset", ""),
            no_lip_sync=bool(job.get("no_lip_sync", False)),
            hat_fix=bool(job.get("hat_fix", False)),
        )
        graph_path.write_text(json.dumps(live_compiled["graph"], indent=2), encoding="utf-8")

        prompt_id = _submit_comfyui_prompt(comfy_url, live_compiled["graph"], client_id=f"wise2-{job_id}")
        patch_recast_job(job_id, comfy_prompt_id=prompt_id, progress=45, stage="rendering_gpu", message=f"Submitted to {chosen['name']} (prompt {prompt_id}).")

        output_path = _poll_comfyui_job(job_id, comfy_url, prompt_id, folder)
        out_meta = probe_video_metadata(output_path)
        in_sha = hashlib.sha256(prepared_clip.read_bytes()).hexdigest()
        out_sha = hashlib.sha256(output_path.read_bytes()).hexdigest()
        patch_recast_job(
            job_id,
            status="succeeded",
            progress=100,
            stage="complete",
            workflow_compiled=True,
            ai_render_completed=True,
            output_file=output_path.name,
            output_url=f"/api/recast/jobs/{job_id}/output",
            output_meta=out_meta,
            output_verified={
                "valid_mp4": out_meta["width"] > 0 and out_meta["duration_sec"] > 0,
                "output_sha256": out_sha,
                "distinct_from_prepared_input": out_sha != in_sha,
            },
            error=None,
            message=f"AI Render complete on {chosen['name']} ({out_meta['width']}x{out_meta['height']}, {out_meta['duration_sec']}s MP4).",
        )

    except Exception as exc:
        cur = get_recast_job(job_id) or {}
        if cur.get("status") == "canceled":
            return
        patch_recast_job(
            job_id,
            status="failed",
            stage="failed",
            error=str(exc)[:400],
            message=f"Failed: {str(exc)[:180]}",
        )


def create_recast_job(
    *,
    capability_id: str,
    source_bytes: bytes,
    source_filename: str,
    profile_ids: list[str],
    inline_images: list[tuple[str, bytes]],
    resolution: str = "480p",
    duration_sec: float = 6.0,
    start_sec: float = 0.0,
    backend_id: str | None = None,
    role: str = "",
    object_mode: str = "change",
    object_target: str = "person",
    prompt: str = "",
    relight_preset: str = "",
    no_lip_sync: bool = False,
    hat_fix: bool = False,
    seed: int = 42,
    accept_noncommercial_face_license: bool = False,
) -> dict[str, Any]:
    cap = next((c for c in CAPABILITIES if c["id"] == capability_id), None)
    if not cap:
        raise ValueError(f"Unknown capability '{capability_id}'.")
    if cap["id"] == "facial_consistency" and not accept_noncommercial_face_license:
        raise PermissionError(
            "Fix Faces uses InsightFace buffalo_l (non-commercial research only) and Ultralytics YOLO (AGPL-3.0). "
            "Confirm accept_noncommercial_face_license=true for non-commercial testing only."
        )
    if resolution not in RESOLUTION_PRESETS:
        raise ValueError(f"Unsupported resolution '{resolution}'. Choose 480p, 736p, or 1080p.")
    if duration_sec < 1.0 or duration_sec > 60.0:
        raise ValueError("duration_sec must be between 1 and 60 seconds.")

    ext = auth.validate_video_file(source_filename, source_bytes[:16])
    safe_video_name = f"source{ext}"

    valid_profiles: list[str] = []
    for pid in profile_ids:
        if get_profile(pid) is None:
            raise ValueError(f"Character profile '{pid}' not found.")
        valid_profiles.append(pid)

    total_refs = len(valid_profiles) + len(inline_images)
    if cap["requires_profiles"] > 0 and total_refs < cap["requires_profiles"]:
        raise ValueError(f"{cap['name']} requires at least {cap['requires_profiles']} character/product reference image.")
    if total_refs > cap["max_profiles"]:
        raise ValueError(f"{cap['name']} supports at most {cap['max_profiles']} reference images.")

    job_id = uuid.uuid4().hex[:12]
    folder = _data_dir() / "recast_jobs" / job_id
    folder.mkdir(parents=True, exist_ok=True)
    (folder / safe_video_name).write_bytes(source_bytes)

    saved_inline: list[str] = []
    for idx, (iname, ibytes) in enumerate(inline_images, 1):
        iext = auth.validate_image_file(iname, ibytes[:16])
        fname = f"ref_{idx}{iext}"
        (folder / fname).write_bytes(ibytes)
        saved_inline.append(fname)

    chosen_backend = backends.get_backend(backend_id or "auto")
    job = {
        "id": job_id,
        "capability_id": capability_id,
        "capability_name": cap["name"],
        "workflow": cap["workflow"],
        "status": "queued",
        "stage": "queued",
        "progress": 0,
        "workflow_compiled": False,
        "ai_render_completed": False,
        "source_filename": safe_video_name,
        "source_orig_name": auth.sanitize_filename(source_filename, safe_video_name),
        "source_bytes": len(source_bytes),
        "profile_ids": valid_profiles,
        "inline_ref_files": saved_inline,
        "resolution": resolution,
        "duration_sec": round(float(duration_sec), 2),
        "start_sec": round(float(start_sec), 2),
        "backend_id": chosen_backend["id"],
        "backend_name": chosen_backend["name"],
        "role": role[:80],
        "object_mode": object_mode,
        "object_target": object_target[:80],
        "prompt": prompt[:500],
        "relight_preset": relight_preset,
        "no_lip_sync": bool(no_lip_sync),
        "hat_fix": bool(hat_fix),
        "seed": int(seed),
        "attempts": 1,
        "error": None,
        "message": "Queued for WISE² RECAST ENGINE.",
        "source_url": f"/api/recast/jobs/{job_id}/source",
        "prepared_url": f"/api/recast/jobs/{job_id}/prepared",
        "workflow_url": f"/api/recast/jobs/{job_id}/workflow",
        "output_url": None,
    }
    return _save_job(job)


def clone_job_without_reupload(
    source_job_id: str,
    *,
    profile_ids: list[str] | None = None,
    resolution: str | None = None,
    duration_sec: float | None = None,
    start_sec: float | None = None,
    seed: int | None = None,
    backend_id: str | None = None,
    role: str | None = None,
) -> dict[str, Any]:
    """Create a new recast job reusing an existing job's preserved source video with zero re-upload."""
    orig = get_recast_job(source_job_id)
    if not orig:
        raise ValueError(f"Source job '{source_job_id}' not found.")
    src_file = get_job_file(source_job_id, "source")
    if not src_file:
        raise FileNotFoundError(f"Preserved source video for job '{source_job_id}' is missing.")
    return create_recast_job(
        capability_id=orig["capability_id"],
        source_bytes=src_file.read_bytes(),
        source_filename=orig.get("source_orig_name") or src_file.name,
        profile_ids=profile_ids if profile_ids is not None else list(orig.get("profile_ids") or []),
        inline_images=[],
        resolution=resolution or orig["resolution"],
        duration_sec=duration_sec if duration_sec is not None else float(orig["duration_sec"]),
        start_sec=start_sec if start_sec is not None else float(orig.get("start_sec", 0.0)),
        backend_id=backend_id or "auto",
        role=role if role is not None else orig.get("role", ""),
        object_mode=orig.get("object_mode", "change"),
        object_target=orig.get("object_target", "person"),
        prompt=orig.get("prompt", ""),
        relight_preset=orig.get("relight_preset", ""),
        no_lip_sync=bool(orig.get("no_lip_sync", False)),
        hat_fix=bool(orig.get("hat_fix", False)),
        seed=seed if seed is not None else int(orig.get("seed", 42)),
    )


def get_job_file(job_id: str, kind: str) -> Path | None:
    job = get_recast_job(job_id)
    if not job:
        return None
    folder = _data_dir() / "recast_jobs" / job_id
    if kind == "source":
        p = folder / job["source_filename"]
    elif kind == "prepared":
        p = folder / (job.get("prepared_clip") or "prepared_input.mp4")
    elif kind == "workflow":
        p = folder / (job.get("compiled_workflow_file") or "compiled_workflow.api.json")
    elif kind == "output":
        p = folder / (job.get("output_file") or "output.mp4")
    else:
        return None
    return p if p.is_file() else None
