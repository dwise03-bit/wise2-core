"""FastAPI router for WISE² RECAST ENGINE, Character Vault, GPU Backends, Auth, and VENOM Collector."""
from __future__ import annotations

import asyncio
import json
import os
import shutil
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Body, Depends, File, Form, HTTPException, Request, Response, UploadFile
from fastapi.responses import FileResponse, StreamingResponse

from . import auth, backends, hardware, recast, venom

router = APIRouter()
recast_executor = ThreadPoolExecutor(max_workers=2)

MAX_VIDEO_BYTES = int(os.getenv("WISE2_MAX_UPLOAD_MB", "512")) * 1024 * 1024
MAX_IMAGE_BYTES = 32 * 1024 * 1024


def _require_auth(request: Request) -> None:
    auth.verify_request_auth(request)


# ---- Auth Endpoints ----

@router.get("/api/auth/status")
def auth_status(request: Request):
    policy_ok, policy_msg = auth.validate_password_policy()
    authenticated = True
    if auth.auth_required():
        try:
            auth.verify_request_auth(request)
            authenticated = True
        except HTTPException:
            authenticated = False
    return {
        "auth_required": auth.auth_required(),
        "authenticated": authenticated,
        "policy_ok": policy_ok,
        "policy_message": policy_msg,
    }


@router.post("/api/auth/login")
def auth_login(request: Request, response: Response, payload: dict = Body(...)):
    password = str(payload.get("password") or "")
    if not auth.auth_required():
        return {"authenticated": True, "mode": "loopback"}
    client = request.headers.get("x-forwarded-for", "").split(",")[-1].strip() or (request.client.host if request.client else "local")
    if not auth.verify_password(password, client):
        raise HTTPException(401, "Invalid WISE² access password.")
    token = auth.issue_session_token("wise2")
    is_https = request.url.scheme == "https" or request.headers.get("x-forwarded-proto") == "https"
    response.set_cookie(
        key=auth.COOKIE_NAME,
        value=token,
        max_age=auth.SESSION_TTL_SEC,
        httponly=True,
        samesite="lax",
        secure=is_https,
    )
    return {"authenticated": True, "token": token}


@router.post("/api/auth/logout")
def auth_logout(response: Response):
    response.delete_cookie(auth.COOKIE_NAME)
    return {"authenticated": False}


# ---- Hardware & Backends ----

@router.get("/api/hardware", dependencies=[Depends(_require_auth)])
def get_hardware(refresh: bool = False):
    return hardware.detect_hardware(force=refresh)


@router.get("/api/backends", dependencies=[Depends(_require_auth)])
def get_backends():
    return backends.list_backends()


@router.put("/api/backends/{backend_id}", dependencies=[Depends(_require_auth)])
def update_backend(backend_id: str, payload: dict = Body(...)):
    try:
        return backends.configure_backend(
            backend_id,
            comfyui_url=payload.get("comfyui_url"),
            proxy_url=payload.get("proxy_url"),
            set_active=bool(payload.get("set_active", False)),
            authorize_paid=bool(payload.get("authorize_paid", False)),
        )
    except PermissionError as exc:
        raise HTTPException(403, str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc


@router.post("/api/backends/{backend_id}/probe", dependencies=[Depends(_require_auth)])
def probe_backend(backend_id: str, payload: dict = Body(default={})):
    try:
        b = backends.get_backend(backend_id)
    except ValueError as exc:
        raise HTTPException(404, str(exc)) from exc
    workflow_key = payload.get("workflow") or "simple"
    try:
        req_nodes = recast.required_nodes_for_workflow(workflow_key)
    except Exception:
        req_nodes = None
    url = payload.get("comfyui_url") or b.get("comfyui_url") or ""
    result = backends.probe_comfyui(url, required_nodes=req_nodes, timeout=4.0)
    result["backend_id"] = backend_id
    result["workflow_checked"] = workflow_key
    return result


# ---- Recast Capabilities & Relight Presets ----

@router.get("/api/recast/capabilities", dependencies=[Depends(_require_auth)])
def list_capabilities():
    return {
        "engine": "WISE² RECAST ENGINE",
        "upstream": {
            "repo": "https://github.com/D3voz/openjutsu",
            "license": "MIT",
            "workflows_dir": "workflows/",
        },
        "capabilities": recast.CAPABILITIES,
        "relight_presets": recast.RELIGHT_PRESETS,
        "resolutions": list(recast.RESOLUTION_PRESETS.keys()),
    }


# ---- Character & Product Profile Vault ----

@router.get("/api/recast/profiles", dependencies=[Depends(_require_auth)])
def list_profiles(category: str | None = None):
    return {"profiles": recast.list_profiles(category=category)}


@router.post("/api/recast/profiles", status_code=201, dependencies=[Depends(_require_auth)])
async def create_profile(
    name: str = Form(...),
    role: str = Form(""),
    category: str = Form("character"),
    notes: str = Form(""),
    image: UploadFile = File(...),
):
    data = await image.read()
    await image.close()
    if not data or len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(413 if len(data) > MAX_IMAGE_BYTES else 400, "Reference image must be between 1 byte and 32 MB.")
    try:
        return recast.save_profile(
            name=name,
            image_bytes=data,
            orig_filename=image.filename or "reference.png",
            role=role,
            category=category,
            notes=notes,
        )
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc


@router.get("/api/recast/profiles/{profile_id}/image", dependencies=[Depends(_require_auth)])
def get_profile_image(profile_id: str):
    path = recast.get_profile_file(profile_id)
    if not path:
        raise HTTPException(404, "Profile image not found.")
    return FileResponse(path, headers={"X-Content-Type-Options": "nosniff"})


@router.delete("/api/recast/profiles/{profile_id}", dependencies=[Depends(_require_auth)])
def remove_profile(profile_id: str):
    if not recast.delete_profile(profile_id):
        raise HTTPException(404, "Profile not found.")
    return {"deleted": True, "id": profile_id}


# ---- Durable Recast Jobs ----

@router.get("/api/recast/jobs", dependencies=[Depends(_require_auth)])
def get_recast_jobs(limit: int = 50):
    return {"jobs": recast.list_recast_jobs(limit=limit)}


@router.post("/api/recast/jobs", status_code=202, dependencies=[Depends(_require_auth)])
async def submit_recast_job(
    video: UploadFile = File(...),
    capability_id: str = Form("character_replacement"),
    profile_ids: str = Form("[]"),
    resolution: str = Form("480p"),
    duration_sec: float = Form(6.0),
    start_sec: float = Form(0.0),
    backend_id: str = Form(""),
    role: str = Form(""),
    object_mode: str = Form("change"),
    object_target: str = Form("person"),
    prompt: str = Form(""),
    relight_preset: str = Form(""),
    no_lip_sync: bool = Form(False),
    hat_fix: bool = Form(False),
    seed: int = Form(42),
    accept_noncommercial_face_license: bool = Form(False),
    save_inline_profile_name: str = Form(""),
    reference_image: UploadFile | None = File(None),
    run_sync: bool = Form(False),
):
    free = shutil.disk_usage(recast._data_dir()).free
    if free < 250 * 1024 * 1024:
        raise HTTPException(507, "Insufficient disk space (<250 MB free) to accept upload.")

    video_bytes = await video.read()
    await video.close()
    if not video_bytes or len(video_bytes) > MAX_VIDEO_BYTES:
        raise HTTPException(413 if len(video_bytes) > MAX_VIDEO_BYTES else 400, "Source video must be non-empty and within configured upload limit.")

    try:
        parsed_profiles = json.loads(profile_ids) if profile_ids else []
        if not isinstance(parsed_profiles, list):
            raise ValueError("profile_ids must be a JSON array")
        parsed_profiles = [str(x) for x in parsed_profiles if x]
    except Exception as exc:
        raise HTTPException(422, f"Invalid profile_ids: {exc}") from exc

    inline_images: list[tuple[str, bytes]] = []
    if reference_image is not None and reference_image.filename:
        ibytes = await reference_image.read()
        await reference_image.close()
        if ibytes:
            if len(ibytes) > MAX_IMAGE_BYTES:
                raise HTTPException(413, "Reference image exceeds 32 MB limit.")
            if save_inline_profile_name.strip():
                saved = recast.save_profile(
                    name=save_inline_profile_name.strip(),
                    image_bytes=ibytes,
                    orig_filename=reference_image.filename,
                    role=role,
                    category="product" if capability_id in {"object_replacement", "commercial_generation"} else "character",
                )
                parsed_profiles.append(saved["id"])
            else:
                inline_images.append((reference_image.filename, ibytes))

    try:
        job = recast.create_recast_job(
            capability_id=capability_id,
            source_bytes=video_bytes,
            source_filename=video.filename or "source.mp4",
            profile_ids=parsed_profiles,
            inline_images=inline_images,
            resolution=resolution,
            duration_sec=duration_sec,
            start_sec=start_sec,
            backend_id=backend_id or None,
            role=role,
            object_mode=object_mode,
            object_target=object_target,
            prompt=prompt,
            relight_preset=relight_preset,
            no_lip_sync=no_lip_sync,
            hat_fix=hat_fix,
            seed=seed,
            accept_noncommercial_face_license=accept_noncommercial_face_license,
        )
    except PermissionError as exc:
        raise HTTPException(403, str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc

    if run_sync:
        recast.execute_recast_job(job["id"])
        return recast.get_recast_job(job["id"])

    recast_executor.submit(recast.execute_recast_job, job["id"])
    return job


@router.get("/api/recast/jobs/{job_id}", dependencies=[Depends(_require_auth)])
def get_recast_job_status(job_id: str):
    job = recast.get_recast_job(job_id)
    if not job:
        raise HTTPException(404, "Recast job not found.")
    return job


@router.get("/api/recast/jobs/{job_id}/events", dependencies=[Depends(_require_auth)])
async def recast_job_events(job_id: str):
    if not recast.get_recast_job(job_id):
        raise HTTPException(404, "Recast job not found.")

    async def gen():
        last_sent = ""
        for _ in range(180):
            cur = recast.get_recast_job(job_id)
            if not cur:
                break
            payload = json.dumps(cur)
            if payload != last_sent:
                yield f"event: status\ndata: {payload}\n\n"
                last_sent = payload
            if cur.get("status") in {"succeeded", "failed", "canceled", "awaiting_gpu_backend", "missing_comfy_nodes"}:
                break
            await asyncio.sleep(1.0)

    return StreamingResponse(gen(), media_type="text/event-stream", headers={"Cache-Control": "no-cache"})


@router.post("/api/recast/jobs/{job_id}/retry", status_code=202, dependencies=[Depends(_require_auth)])
def retry_recast_job(job_id: str, payload: dict = Body(default={})):
    job = recast.get_recast_job(job_id)
    if not job:
        raise HTTPException(404, "Recast job not found.")
    if job["status"] == "running":
        raise HTTPException(409, "Job is currently running.")
    updates: dict[str, Any] = {
        "status": "queued",
        "stage": "queued",
        "progress": 0,
        "error": None,
        "attempts": int(job.get("attempts") or 1) + 1,
        "message": "Re-queued for retry.",
    }
    if payload.get("backend_id"):
        b = backends.get_backend(payload["backend_id"])
        updates["backend_id"] = b["id"]
        updates["backend_name"] = b["name"]
    recast.patch_recast_job(job_id, **updates)
    if payload.get("run_sync"):
        recast.execute_recast_job(job_id)
        return recast.get_recast_job(job_id)
    recast_executor.submit(recast.execute_recast_job, job_id)
    return recast.get_recast_job(job_id)


@router.post("/api/recast/jobs/{job_id}/cancel", dependencies=[Depends(_require_auth)])
def cancel_recast_job(job_id: str):
    job = recast.get_recast_job(job_id)
    if not job:
        raise HTTPException(404, "Recast job not found.")
    if job["status"] in {"succeeded", "canceled"}:
        raise HTTPException(409, f"Job is already {job['status']}.")
    return recast.patch_recast_job(job_id, status="canceled", stage="canceled", message="Canceled by user.")


@router.get("/api/recast/jobs/{job_id}/{kind}", dependencies=[Depends(_require_auth)])
def download_recast_artifact(job_id: str, kind: str):
    if kind not in {"source", "prepared", "workflow", "output"}:
        raise HTTPException(404, "Unknown artifact kind.")
    path = recast.get_job_file(job_id, kind)
    if not path:
        raise HTTPException(404, f"Artifact '{kind}' not available for job {job_id}.")
    media = "application/json" if kind == "workflow" else "video/mp4"
    return FileResponse(path, media_type=media, filename=path.name, headers={"X-Content-Type-Options": "nosniff"})


# ---- VENOM COLLECTOR ----

@router.get("/api/venom/catalog", dependencies=[Depends(_require_auth)])
def venom_catalog(
    domain: str | None = None,
    decision: str | None = None,
    search: str | None = None,
    limit: int = 50,
):
    return venom.query_catalog(domain=domain, decision=decision, search=search, limit=limit)
