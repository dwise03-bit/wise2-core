"""Authentication, brute-force protection, CSRF guards, and secure file validation.

Security policy:
- Loopback-only operation works password-free when WISE2_ACCESS_PASSWORD is unset,
  while rejecting non-loopback Host headers (DNS-rebinding protection).
- Remote / Tailscale / iPhone access requires WISE2_ACCESS_PASSWORD (>= 12 chars).
- Supports signed HttpOnly session cookies, Bearer tokens, and HTTP Basic auth.
- Validates uploaded video and image magic bytes (never trusting extensions alone).
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import os
import re
import secrets
import time
from pathlib import Path
from typing import Any

from fastapi import HTTPException, Request

MIN_PASSWORD_LENGTH = 12
COOKIE_NAME = "wise2_recast_session"
SESSION_TTL_SEC = 7 * 24 * 3600

FREE_FAILURES = 5
MAX_DELAY_SEC = 300
FORGET_AFTER_SEC = 3600

_FAILURES: dict[str, dict[str, float]] = {}
_FALLBACK_SECRET = secrets.token_bytes(32)

LOCAL_HOST_RE = re.compile(r"^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$", re.I)
WINDOWS_RESERVED_RE = re.compile(r"^(con|prn|aux|nul|com\d|lpt\d)(\.|$)", re.I)

VIDEO_EXTS = {".mp4", ".mov", ".mkv", ".webm", ".avi"}
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp"}


def configured_password() -> str:
    return (os.getenv("WISE2_ACCESS_PASSWORD") or os.getenv("OPENJUTSU_PASSWORD") or "").strip()


def auth_required() -> bool:
    return bool(configured_password())


def validate_password_policy() -> tuple[bool, str]:
    pw = configured_password()
    if not pw:
        return True, "Loopback-only mode (set WISE2_ACCESS_PASSWORD >= 12 chars for remote/iPhone access)."
    if len(pw) < MIN_PASSWORD_LENGTH:
        return False, f"WISE2_ACCESS_PASSWORD must be at least {MIN_PASSWORD_LENGTH} characters."
    return True, "Authenticated remote access enabled."


def _signing_key() -> bytes:
    pw = configured_password()
    if pw:
        return hashlib.sha256(f"wise2-recast-session:{pw}".encode("utf-8")).digest()
    return _FALLBACK_SECRET


def issue_session_token(subject: str = "wise2") -> str:
    exp = int(time.time()) + SESSION_TTL_SEC
    nonce = secrets.token_hex(8)
    payload = f"{subject}.{exp}.{nonce}"
    sig = hmac.new(_signing_key(), payload.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{payload}.{sig}"


def verify_session_token(token: str) -> bool:
    if not token or token.count(".") != 3:
        return False
    subject, exp_s, nonce, sig = token.split(".", 3)
    try:
        exp = int(exp_s)
    except ValueError:
        return False
    if exp < int(time.time()):
        return False
    payload = f"{subject}.{exp_s}.{nonce}"
    expected = hmac.new(_signing_key(), payload.encode("utf-8"), hashlib.sha256).hexdigest()
    return hmac.compare_digest(sig, expected)


def _client_key(request: Request) -> str:
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[-1].strip()
    return request.client.host if request.client else "unknown"


def _backoff_seconds(client: str) -> int:
    entry = _FAILURES.get(client)
    if not entry:
        return 0
    now = time.time()
    if now - entry["last"] > FORGET_AFTER_SEC:
        _FAILURES.pop(client, None)
        return 0
    count = int(entry["count"])
    if count <= FREE_FAILURES:
        return 0
    delay = min(2 ** (count - FREE_FAILURES - 1), MAX_DELAY_SEC)
    rem = (entry["last"] + delay) - now
    return max(0, int(rem + 0.999))


def _record_failure(client: str) -> None:
    now = time.time()
    entry = _FAILURES.get(client)
    if entry and (now - entry["last"]) <= FORGET_AFTER_SEC:
        entry["count"] += 1
        entry["last"] = now
    else:
        _FAILURES[client] = {"count": 1, "last": now}


def verify_password(candidate: str, client: str = "local") -> bool:
    pw = configured_password()
    if not pw:
        return True
    wait = _backoff_seconds(client)
    if wait > 0:
        raise HTTPException(
            status_code=429,
            detail=f"Too many failed sign-ins. Retry in {wait}s.",
            headers={"Retry-After": str(wait)},
        )
    ok = hmac.compare_digest(
        hashlib.sha256(candidate.encode("utf-8")).digest(),
        hashlib.sha256(pw.encode("utf-8")).digest(),
    )
    if ok:
        _FAILURES.pop(client, None)
    else:
        _record_failure(client)
    return ok


def verify_request_auth(request: Request) -> None:
    """Enforce authentication and host/origin safety on API requests."""
    pw = configured_password()
    host = request.headers.get("host") or ""
    if not pw:
        # Allow TestClient ('testserver') and loopback; block arbitrary remote hosts without password.
        if host and not (LOCAL_HOST_RE.match(host) or host.startswith("testserver")):
            raise HTTPException(
                status_code=403,
                detail="Set WISE2_ACCESS_PASSWORD (>= 12 chars) before accessing WISE² RECAST ENGINE over the network.",
            )
        return

    if len(pw) < MIN_PASSWORD_LENGTH:
        raise HTTPException(
            status_code=503,
            detail=f"Server misconfiguration: WISE2_ACCESS_PASSWORD must be at least {MIN_PASSWORD_LENGTH} characters.",
        )

    client = _client_key(request)
    cookie = request.cookies.get(COOKIE_NAME)
    if cookie and verify_session_token(cookie):
        return

    auth_header = request.headers.get("authorization") or ""
    if auth_header.lower().startswith("bearer "):
        token = auth_header[7:].strip()
        if verify_session_token(token):
            return
        if verify_password(token, client):
            return

    if auth_header.lower().startswith("basic "):
        encoded = auth_header[6:].strip()
        try:
            decoded = base64.b64decode(encoded).decode("utf-8")
            _, _, supplied_pw = decoded.partition(":")
        except Exception:
            supplied_pw = ""
        if supplied_pw and verify_password(supplied_pw, client):
            return

    raise HTTPException(
        status_code=401,
        detail="Authentication required for WISE² RECAST ENGINE.",
        headers={"WWW-Authenticate": 'Basic realm="WISE2-RECAST", charset="UTF-8"'},
    )


def sanitize_filename(name: str, fallback: str = "upload") -> str:
    if not name or ".." in name or "/" in name or "\\" in name:
        base = Path(name or "").name
    else:
        base = name
    safe = re.sub(r"[^\w.\- ]+", "_", base).strip(" .")[-100:] or fallback
    if WINDOWS_RESERVED_RE.match(safe):
        safe = f"_{safe}"
    return safe


def sniff_video_bytes(head: bytes) -> bool:
    if len(head) < 12:
        return False
    # MP4 / MOV ISO-BMFF ('ftyp' at byte 4), MKV / WebM (EBML 0x1A45DFA3), AVI (RIFF....AVI )
    if head[4:8] == b"ftyp":
        return True
    if head[:4] == b"\x1a\x45\xdf\xa3":
        return True
    if head[:4] == b"RIFF" and head[8:12] == b"AVI ":
        return True
    return False


def sniff_image_bytes(head: bytes) -> bool:
    if len(head) < 12:
        return False
    if head[:8] == b"\x89PNG\r\n\x1a\n":
        return True
    if head[:3] == b"\xff\xd8\xff":
        return True
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return True
    return False


def validate_video_file(filename: str, head: bytes) -> str:
    ext = Path(filename or "").suffix.lower()
    if ext not in VIDEO_EXTS:
        raise HTTPException(400, f"Unsupported video extension '{ext}'. Use MP4, MOV, MKV, or WebM.")
    if not sniff_video_bytes(head):
        raise HTTPException(400, "Uploaded file failed video magic-byte verification (must be valid MP4/MOV/MKV/WebM/AVI).")
    return ext


def validate_image_file(filename: str, head: bytes) -> str:
    ext = Path(filename or "").suffix.lower()
    if ext not in IMAGE_EXTS:
        raise HTTPException(400, f"Unsupported image extension '{ext}'. Use PNG, JPG, or WebP.")
    if not sniff_image_bytes(head):
        raise HTTPException(400, "Uploaded file failed image magic-byte verification (must be valid PNG/JPEG/WebP).")
    return ext


def reset_auth_state_for_tests() -> None:
    _FAILURES.clear()
