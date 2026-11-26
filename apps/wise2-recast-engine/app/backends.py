"""GPU Backend Orchestrator for WISE² RECAST ENGINE.

Supports five execution targets with strict hardware & billing guards:
1. local-nvidia    - Local NVIDIA CUDA ComfyUI (blocked automatically on non-NVIDIA / low-VRAM hardware)
2. remote-comfyui  - Remote ComfyUI server (LAN / WISE² Tailscale gpu-nmls-1 / tunnel)
3. google-colab    - FREE Google Colab T4/L4 GPU via Cloudflare/ngrok quick tunnel
4. kaggle-gpu      - FREE Kaggle T4x2/P100 GPU via tunnel
5. runpod          - Optional PAID fallback (DISABLED unless explicitly authorized by the user)
"""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

from . import hardware, store

OPENJUTSU_REQUIRED_PACKS = [
    {
        "name": "ComfyUI-MiniMaxH3-Context-Loop (0.7.3+)",
        "url": "https://github.com/ethanfel/ComfyUI-MiniMaxH3-Context-Loop",
        "nodes": [
            "MiniMaxH3GenerationProfile", "MiniMaxH3SourceTimeline", "MiniMaxH3ChainPlanModern",
            "MiniMaxH3ChainLoopStart", "MiniMaxH3ChainCurrent", "MiniMaxH3ChainContext",
            "MiniMaxH3ChainSegmentSave", "MiniMaxH3ChainReview", "MiniMaxH3ChainLoopEnd",
            "MiniMaxH3ChainAssemble", "MiniMaxH3ContexLoopMaskSlice", "MiniMaxH3ContexMaskedTarget",
            "MiniMaxH3ContexMaskGridPreview", "MiniMaxH3LoopTrim",
        ],
    },
    {
        "name": "comfyui-h3-oneclick-swap",
        "url": "https://github.com/D3voz/comfyui-h3-oneclick-swap",
        "nodes": [
            "H3OneClickSwapPlan", "H3AdvancedSwapPlan", "H3ObjectSwapPlan", "H3ObjectPlacementMask",
            "H3AddFitCheck", "H3AddMovingArea", "H3PaintedEditArea", "H3SoundtrackOrSilence",
            "H3SourceSlice", "H3PeopleMask", "H3GreyMannequins", "H3ClipShots", "H3FillShots",
            "H3TrackCrops", "H3TrackRoles", "H3RoleMask", "H3SubjectPrompt", "H3MontagePeople",
            "H3MontageTracks", "H3MontagePicks", "H3MontagePlan", "H3MontagePass", "H3FaceChunks", "H3FaceJoin",
        ],
    },
    {
        "name": "ComfyUI-Fantastic-MiniMaxH3-PromptBuilder",
        "url": "https://github.com/Adudeguyman/ComfyUI-Fantastic-MiniMaxH3-PromptBuilder",
        "nodes": ["MiniMaxH3FantasticVideoEditLatent"],
    },
    {
        "name": "ComfyUI-KJNodes",
        "url": "https://github.com/kijai/ComfyUI-KJNodes",
        "nodes": ["GrowMaskWithBlur", "ImageAndMaskPreview", "VRAM_Debug"],
    },
    {
        "name": "ComfyUI-VideoHelperSuite",
        "url": "https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite",
        "nodes": ["VHS_LoadVideo", "VHS_SelectEveryNthImage", "VHS_VideoCombine"],
    },
    {
        "name": "ComfyUI-H3-FaceRefine",
        "url": "https://github.com/Carasibana/ComfyUI-H3-FaceRefine",
        "nodes": ["H3FaceTrackCrop", "H3FaceMaskSAM", "H3FaceStitch"],
    },
    {
        "name": "ComfyUI-Impact-Pack",
        "url": "https://github.com/ltdrdata/ComfyUI-Impact-Pack",
        "nodes": ["SAMLoader"],
    },
    {
        "name": "comfyui-image-detail-contrast",
        "url": "https://github.com/D3voz/comfyui-image-detail-contrast",
        "nodes": ["ImageDetailContrast"],
    },
    {
        "name": "Orion4D_FXMax",
        "url": "https://github.com/orion4d/Orion4D_FXMax",
        "nodes": ["Orion4D_FXMax_DCTLToneMapper"],
    },
    {
        "name": "SolarRenderer",
        "url": "https://github.com/Enderfga/SolarRenderer/tree/main/comfyui",
        "nodes": ["SolarRendererModel", "SolarRendererLoraLoader", "SolarRendererConditioning", "SolarRendererSigmas"],
    },
    {
        "name": "comfyui_controlnet_aux",
        "url": "https://github.com/Fannovel16/comfyui_controlnet_aux",
        "nodes": ["Metric3D-NormalMapPreprocessor"],
    },
    {
        "name": "ComfyUI-Spectrum-MiniMax-H3",
        "url": "https://github.com/xmarre/ComfyUI-Spectrum-MiniMax-H3",
        "nodes": ["SpectrumApplyMiniMaxH3"],
    },
]

BACKEND_SETTINGS_KEY = "recast_backends_v1"

DEFAULT_BACKENDS: dict[str, dict[str, Any]] = {
    "local-nvidia": {
        "id": "local-nvidia",
        "name": "Local NVIDIA CUDA GPU",
        "tier": "free-local",
        "paid": False,
        "comfyui_url": os.getenv("LOCAL_COMFYUI_URL", "http://127.0.0.1:8188"),
        "proxy_url": os.getenv("LOCAL_OPENJUTSU_PROXY_URL", "http://127.0.0.1:8189"),
        "enabled": False,
        "notes": "Auto-enabled only when an NVIDIA GPU with >=12 GB VRAM and CUDA is verified.",
    },
    "remote-comfyui": {
        "id": "remote-comfyui",
        "name": "Remote ComfyUI Server (Tailscale / LAN)",
        "tier": "free-self-hosted",
        "paid": False,
        "comfyui_url": os.getenv("COMFYUI_URL", "http://100.66.102.124:8188"),
        "proxy_url": os.getenv("COMFY_BASE_URL", "http://100.66.102.124:8189"),
        "enabled": True,
        "notes": "Connects to WISE² gpu-nmls-1 over Tailscale or any remote ComfyUI instance.",
    },
    "google-colab": {
        "id": "google-colab",
        "name": "Google Colab Free GPU (T4 / L4)",
        "tier": "free-cloud",
        "paid": False,
        "comfyui_url": os.getenv("COLAB_COMFYUI_URL", ""),
        "proxy_url": os.getenv("COLAB_PROXY_URL", ""),
        "enabled": True,
        "notebook": "deploy/colab/WISE2_OpenJutsu_Colab.ipynb",
        "limits": "Free T4 (15 GB VRAM, ~12 GB RAM, 3-4h session). Best for 480p 4-6s clips, relighting, and color grading; full INT8 H3 may hit 12 GB RAM cap without Colab Pro.",
        "notes": "Run the included WISE² Colab notebook and paste the generated Cloudflare Quick Tunnel URL.",
    },
    "kaggle-gpu": {
        "id": "kaggle-gpu",
        "name": "Kaggle Free GPU (T4 x2 / P100)",
        "tier": "free-cloud",
        "paid": False,
        "comfyui_url": os.getenv("KAGGLE_COMFYUI_URL", ""),
        "proxy_url": os.getenv("KAGGLE_PROXY_URL", ""),
        "enabled": True,
        "notebook": "deploy/kaggle/WISE2_OpenJutsu_Kaggle.ipynb",
        "limits": "Free 30 hrs/week quota, dual T4 (16 GB x2 VRAM) + 30 GB system RAM. Better RAM headroom than free Colab.",
        "notes": "Run the included WISE² Kaggle notebook with GPU T4 x2 enabled and paste the tunnel URL.",
    },
    "runpod": {
        "id": "runpod",
        "name": "RunPod On-Demand GPU (Optional Paid Fallback)",
        "tier": "paid-fallback",
        "paid": True,
        "comfyui_url": os.getenv("RUNPOD_COMFYUI_URL", ""),
        "proxy_url": os.getenv("RUNPOD_PROXY_URL", ""),
        "enabled": False,
        "paid_authorized": False,
        "template": "deploy/runpod/README.md",
        "limits": "Paid per-minute billing (~$0.34-$0.69/hr for RTX 4090 / A40 48 GB VRAM + 64 GB RAM). Blocked until explicitly authorized.",
        "notes": "Requires WISE2_ALLOW_PAID_BACKENDS=true and explicit user authorization before activation.",
    },
}


def _load_saved() -> dict[str, dict[str, Any]]:
    raw = store.get_setting(BACKEND_SETTINGS_KEY)
    merged = json.loads(json.dumps(DEFAULT_BACKENDS))
    if raw:
        try:
            saved = json.loads(raw)
            for bid, cfg in saved.items():
                if bid in merged and isinstance(cfg, dict):
                    merged[bid].update(cfg)
        except Exception:
            pass
    return merged


def _save_all(data: dict[str, dict[str, Any]]) -> None:
    store.set_setting(BACKEND_SETTINGS_KEY, json.dumps(data))


def list_backends(hw: dict[str, Any] | None = None) -> dict[str, Any]:
    hw_info = hw or hardware.detect_hardware()
    backends = _load_saved()
    active = store.get_setting("recast_active_backend") or hw_info["recommended_backend"]

    local_allowed = bool(hw_info["gpu"]["local_render_allowed"])
    backends["local-nvidia"]["hardware_supported"] = local_allowed
    backends["local-nvidia"]["hardware_blockers"] = hw_info["gpu"]["blockers"]
    if not local_allowed:
        backends["local-nvidia"]["enabled"] = False
        if active == "local-nvidia":
            active = "remote-comfyui"

    paid_env_ok = os.getenv("WISE2_ALLOW_PAID_BACKENDS", "").lower() in {"1", "true", "yes"}
    backends["runpod"]["paid_env_allowed"] = paid_env_ok
    if not (paid_env_ok and backends["runpod"].get("paid_authorized")):
        backends["runpod"]["enabled"] = False
        if active == "runpod":
            active = "remote-comfyui"

    return {
        "active_backend": active,
        "backends": list(backends.values()),
        "hardware_summary": {
            "local_gpu_capable": hw_info["gpu"]["local_gpu_capable"],
            "local_render_allowed": local_allowed,
            "recommended_backend": hw_info["recommended_backend"],
            "blockers": hw_info["gpu"]["blockers"],
        },
    }


def configure_backend(
    backend_id: str,
    comfyui_url: str | None = None,
    proxy_url: str | None = None,
    set_active: bool = False,
    authorize_paid: bool = False,
) -> dict[str, Any]:
    backends = _load_saved()
    if backend_id not in backends:
        raise ValueError(f"Unknown backend '{backend_id}'")

    hw = hardware.detect_hardware()
    entry = backends[backend_id]

    if backend_id == "local-nvidia" and not hw["gpu"]["local_render_allowed"]:
        raise PermissionError(
            "Local NVIDIA rendering is blocked on this hardware: "
            + "; ".join(hw["gpu"]["blockers"])
        )

    if entry["paid"]:
        paid_env_ok = os.getenv("WISE2_ALLOW_PAID_BACKENDS", "").lower() in {"1", "true", "yes"}
        if not (paid_env_ok and authorize_paid):
            raise PermissionError(
                "Paid backend (RunPod) cannot be activated without explicit user authorization "
                "(set WISE2_ALLOW_PAID_BACKENDS=true and confirm authorize_paid=true)."
            )
        entry["paid_authorized"] = True
        entry["enabled"] = True

    for field, val in (("comfyui_url", comfyui_url), ("proxy_url", proxy_url)):
        if val is not None:
            cleaned = val.strip().rstrip("/")
            if cleaned:
                parsed = urllib.parse.urlparse(cleaned)
                if parsed.scheme not in {"http", "https"} or not parsed.netloc:
                    raise ValueError(f"Invalid {field}: must be an http:// or https:// URL")
            entry[field] = cleaned

    if backend_id != "runpod":
        entry["enabled"] = True

    _save_all(backends)
    if set_active:
        store.set_setting("recast_active_backend", backend_id)

    return list_backends(hw)


def get_backend(backend_id: str | None = None) -> dict[str, Any]:
    info = list_backends()
    target = backend_id or info["active_backend"]
    for b in info["backends"]:
        if b["id"] == target:
            return b
    raise ValueError(f"Unknown backend '{target}'")


def _http_json(url: str, timeout: float = 4.0, headers: dict[str, str] | None = None) -> tuple[int, Any]:
    req = urllib.request.Request(url, headers=headers or {"User-Agent": "WISE2-Recast-Engine/2.0"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
            try:
                return resp.status, json.loads(raw)
            except json.JSONDecodeError:
                return resp.status, {"raw": raw[:300]}
    except urllib.error.HTTPError as exc:
        return exc.code, {"error": str(exc)}
    except Exception as exc:
        return 0, {"error": str(exc)}


def probe_comfyui(comfyui_url: str, required_nodes: list[str] | None = None, timeout: float = 4.0) -> dict[str, Any]:
    url = (comfyui_url or "").strip().rstrip("/")
    if not url:
        return {
            "reachable": False,
            "comfyui_url": "",
            "error": "No ComfyUI URL configured for this backend yet.",
            "system_stats": None,
            "queue": None,
            "websocket_reconnect_fix": False,
            "missing_packs": [],
            "registered_nodes_checked": 0,
        }

    status_q, queue_data = _http_json(f"{url}/queue", timeout=timeout)
    if status_q != 200:
        return {
            "reachable": False,
            "comfyui_url": url,
            "error": f"ComfyUI unreachable at {url} ({queue_data.get('error', f'HTTP {status_q}')}).",
            "system_stats": None,
            "queue": None,
            "websocket_reconnect_fix": False,
            "missing_packs": [],
            "registered_nodes_checked": 0,
        }

    _, sys_stats = _http_json(f"{url}/system_stats", timeout=timeout)
    ws_status, _ = _http_json(f"{url}/websocket_reconnect_fix", timeout=timeout)
    ws_ok = ws_status == 200

    missing_packs: list[dict[str, Any]] = []
    checked = 0
    if required_nodes:
        missing_by_pack: dict[str, dict[str, Any]] = {}
        for node_type in sorted(set(required_nodes)):
            checked += 1
            st, info = _http_json(f"{url}/object_info/{urllib.parse.quote(node_type, safe='')}", timeout=timeout)
            if st == 200 and isinstance(info, dict) and node_type in info:
                continue
            pack = next((p for p in OPENJUTSU_REQUIRED_PACKS if node_type in p["nodes"]), None)
            pack_name = pack["name"] if pack else "ComfyUI Core (0.41.2+ required)"
            pack_url = pack["url"] if pack else "https://github.com/Comfy-Org/ComfyUI"
            bucket = missing_by_pack.setdefault(pack_url, {"name": pack_name, "url": pack_url, "nodes": []})
            bucket["nodes"].append(node_type)
        missing_packs = list(missing_by_pack.values())
        if not ws_ok:
            missing_packs.append({
                "name": "comfyui-websocket-reconnect-fix",
                "url": "https://github.com/D3voz/comfyui-websocket-reconnect-fix",
                "nodes": [],
            })

    return {
        "reachable": True,
        "comfyui_url": url,
        "error": None,
        "system_stats": sys_stats if isinstance(sys_stats, dict) else None,
        "queue": {
            "running": len((queue_data or {}).get("queue_running") or []),
            "pending": len((queue_data or {}).get("queue_pending") or []),
        },
        "websocket_reconnect_fix": ws_ok,
        "missing_packs": missing_packs,
        "registered_nodes_checked": checked,
        "ready_for_workflow": len(missing_packs) == 0,
    }
