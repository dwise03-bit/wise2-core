"""WISE² GPU Manager — Centralized backend orchestration, live health verification, and AUTO selection.

Design guarantees:
1. ZERO hardcoded dead or obsolete IP addresses in application defaults.
2. NEVER reports a backend as 'connected' without a successful live health check.
3. Supports all local, remote, free cloud, dedicated server, and opt-in paid backends:
   - auto (smart selector)
   - local-cpu
   - local-intel-xe
   - local-openvino
   - local-nvidia
   - remote-comfyui
   - google-colab
   - kaggle-gpu
   - wise2-gpu-server
   - runpod (paid fallback — blocked unless explicitly authorized)
4. Prioritizes genuinely free, verified compatible resources and never initiates paid billing without approval.
"""
from __future__ import annotations

import json
import os
import socket
import time
import urllib.error
import urllib.parse
import urllib.request
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

WORKFLOW_MIN_SPECS: dict[str, dict[str, Any]] = {
    "simple": {"min_vram_gb": 16, "min_ram_gb": 24, "requires_comfyui": True, "requires_cuda": True, "est_sec_per_clip_sec_480p": 75},
    "advanced": {"min_vram_gb": 16, "min_ram_gb": 32, "requires_comfyui": True, "requires_cuda": True, "est_sec_per_clip_sec_480p": 100},
    "advanced_maxq": {"min_vram_gb": 16, "min_ram_gb": 32, "requires_comfyui": True, "requires_cuda": True, "est_sec_per_clip_sec_480p": 150},
    "montage": {"min_vram_gb": 16, "min_ram_gb": 32, "requires_comfyui": True, "requires_cuda": True, "est_sec_per_clip_sec_480p": 110},
    "object": {"min_vram_gb": 16, "min_ram_gb": 24, "requires_comfyui": True, "requires_cuda": True, "est_sec_per_clip_sec_480p": 75},
    "face": {"min_vram_gb": 16, "min_ram_gb": 24, "requires_comfyui": True, "requires_cuda": True, "est_sec_per_clip_sec_480p": 95},
    "relight": {"min_vram_gb": 12, "min_ram_gb": 12, "requires_comfyui": True, "requires_cuda": True, "est_sec_per_clip_sec_480p": 35},
    "color": {"min_vram_gb": 4, "min_ram_gb": 8, "requires_comfyui": True, "requires_cuda": False, "est_sec_per_clip_sec_480p": 4},
    "mask": {"min_vram_gb": 8, "min_ram_gb": 12, "requires_comfyui": True, "requires_cuda": True, "est_sec_per_clip_sec_480p": 18},
    "people": {"min_vram_gb": 12, "min_ram_gb": 16, "requires_comfyui": True, "requires_cuda": True, "est_sec_per_clip_sec_480p": 14},
    "fit": {"min_vram_gb": 4, "min_ram_gb": 8, "requires_comfyui": True, "requires_cuda": False, "est_sec_per_clip_sec_480p": 4},
}

BACKEND_SETTINGS_KEY = "wise2_gpu_manager_v2"
LEGACY_SETTINGS_KEY = "recast_backends_v1"
OBSOLETE_DEAD_URLS = {
    "http://100.66.102.124:8188",
    "http://100.66.102.124:8189",
    "http://100.68.145.5:8188",
}

DEFAULT_BACKENDS: dict[str, dict[str, Any]] = {
    "local-cpu": {
        "id": "local-cpu",
        "name": "Local CPU (FFmpeg & Lightweight Ops)",
        "kind": "local",
        "tier": "free-local",
        "paid": False,
        "cost_per_hour_usd": 0.0,
        "comfyui_url": "",
        "proxy_url": "",
        "vram_gb": 0.0,
        "supports_ai_recast": False,
        "supported_workflows": ["clip_engine", "preflight_normalize"],
        "unsupported_reason": "CPU cannot run MiniMax H3 / FLUX.3 Klein CUDA video diffusion in practical time; used for WISE² Clip Engine & preflight.",
        "notes": "Always available locally for FFmpeg slicing, vertical clipping, captions, and audio muxing. Never substitutes for AI character replacement.",
    },
    "local-intel-xe": {
        "id": "local-intel-xe",
        "name": "Local Intel Iris Xe (DirectML / Integrated GPU)",
        "kind": "local",
        "tier": "free-local",
        "paid": False,
        "cost_per_hour_usd": 0.0,
        "comfyui_url": "",
        "proxy_url": "",
        "vram_gb": 2.0,
        "supports_ai_recast": False,
        "supported_workflows": ["color_preview_only"],
        "unsupported_reason": "Intel Iris Xe (2 GB shared, non-CUDA) lacks VRAM and CUDA kernels required by MiniMax H3 (16 GB+ VRAM) and SAM 3.1.",
        "notes": "Detected automatically on ThinkPad X1. Safe for lightweight OpenCV/DirectML filters if installed; blocked from heavy H3 video diffusion.",
    },
    "local-openvino": {
        "id": "local-openvino",
        "name": "Local Intel OpenVINO Accelerator",
        "kind": "local",
        "tier": "free-local",
        "paid": False,
        "cost_per_hour_usd": 0.0,
        "comfyui_url": "",
        "proxy_url": "",
        "vram_gb": 2.0,
        "supports_ai_recast": False,
        "supported_workflows": ["openvino_image_ops"],
        "unsupported_reason": "OpenVINO is not installed and MiniMax H3 OpenJutsu graphs do not ship OpenVINO IR weights.",
        "notes": "Supported for future OpenVINO-exported vision/upscale nodes on Intel CPU/iGPU when openvino runtime is installed.",
    },
    "local-nvidia": {
        "id": "local-nvidia",
        "name": "Local NVIDIA CUDA GPU (ComfyUI)",
        "kind": "comfyui",
        "tier": "free-local",
        "paid": False,
        "cost_per_hour_usd": 0.0,
        "comfyui_url": os.getenv("LOCAL_COMFYUI_URL", "http://127.0.0.1:8188"),
        "proxy_url": os.getenv("LOCAL_OPENJUTSU_PROXY_URL", "http://127.0.0.1:8189"),
        "vram_gb": 0.0,
        "supports_ai_recast": True,
        "supported_workflows": list(WORKFLOW_MIN_SPECS.keys()),
        "notes": "Auto-enabled only when an NVIDIA CUDA GPU (>=12 GB VRAM) and running local ComfyUI are verified.",
    },
    "remote-comfyui": {
        "id": "remote-comfyui",
        "name": "Remote ComfyUI Server (Tailscale / LAN)",
        "kind": "comfyui",
        "tier": "free-self-hosted",
        "paid": False,
        "cost_per_hour_usd": 0.0,
        "comfyui_url": os.getenv("COMFYUI_URL", "").strip(),
        "proxy_url": os.getenv("COMFY_BASE_URL", "").strip(),
        "vram_gb": 16.0,
        "supports_ai_recast": True,
        "supported_workflows": list(WORKFLOW_MIN_SPECS.keys()),
        "notes": "Connects to any authorized remote ComfyUI host over Tailscale or LAN. No hardcoded dead IP — enter an online >=16 GB GPU ComfyUI URL.",
    },
    "kaggle-gpu": {
        "id": "kaggle-gpu",
        "name": "Kaggle Free GPU (T4 x2 · 30 GB RAM)",
        "kind": "comfyui",
        "tier": "free-cloud",
        "paid": False,
        "cost_per_hour_usd": 0.0,
        "comfyui_url": os.getenv("KAGGLE_COMFYUI_URL", "").strip(),
        "proxy_url": os.getenv("KAGGLE_PROXY_URL", "").strip(),
        "vram_gb": 16.0,
        "ram_gb": 30.0,
        "supports_ai_recast": True,
        "supported_workflows": list(WORKFLOW_MIN_SPECS.keys()),
        "notebook": "deploy/kaggle/WISE2_OpenJutsu_Kaggle.ipynb",
        "limits": "FREE 30 hrs/week quota · Dual NVIDIA T4 (16 GB x2 VRAM) + 30 GB RAM. Recommended free cloud backend for 480p 5s-24s Recast renders.",
        "notes": "Run deploy/kaggle/WISE2_OpenJutsu_Kaggle.ipynb with GPU T4 x2 + Internet ON, then paste the printed https://*.trycloudflare.com URL here.",
    },
    "google-colab": {
        "id": "google-colab",
        "name": "Google Colab Free GPU (T4 15 GB)",
        "kind": "comfyui",
        "tier": "free-cloud",
        "paid": False,
        "cost_per_hour_usd": 0.0,
        "comfyui_url": os.getenv("COLAB_COMFYUI_URL", "").strip(),
        "proxy_url": os.getenv("COLAB_PROXY_URL", "").strip(),
        "vram_gb": 15.0,
        "ram_gb": 12.7,
        "supports_ai_recast": True,
        "supported_workflows": ["simple", "object", "relight", "color", "mask", "people", "fit"],
        "notebook": "deploy/colab/WISE2_OpenJutsu_Colab.ipynb",
        "limits": "FREE T4 (15 GB VRAM, ~12.7 GB RAM, ~3-4h session). Best for 480p 5s clips, relighting & color grading; long H3 chains may OOM without Colab Pro.",
        "notes": "Run deploy/colab/WISE2_OpenJutsu_Colab.ipynb with T4 GPU runtime, then paste the printed https://*.trycloudflare.com URL here.",
    },
    "wise2-gpu-server": {
        "id": "wise2-gpu-server",
        "name": "Dedicated WISE² GPU Server (Future / Private)",
        "kind": "comfyui",
        "tier": "free-self-hosted",
        "paid": False,
        "cost_per_hour_usd": 0.0,
        "comfyui_url": os.getenv("WISE2_GPU_SERVER_URL", "").strip(),
        "proxy_url": "",
        "vram_gb": 24.0,
        "ram_gb": 64.0,
        "supports_ai_recast": True,
        "supported_workflows": list(WORKFLOW_MIN_SPECS.keys()),
        "notes": "Reserved endpoint for your dedicated >=24 GB VRAM WISE² RTX 4090 / A40 studio server over Tailscale MagicDNS.",
    },
    "runpod": {
        "id": "runpod",
        "name": "RunPod On-Demand GPU (Optional Paid Fallback)",
        "kind": "comfyui",
        "tier": "paid-fallback",
        "paid": True,
        "cost_per_hour_usd": 0.44,
        "comfyui_url": os.getenv("RUNPOD_COMFYUI_URL", "").strip(),
        "proxy_url": os.getenv("RUNPOD_PROXY_URL", "").strip(),
        "vram_gb": 24.0,
        "ram_gb": 64.0,
        "supports_ai_recast": True,
        "supported_workflows": list(WORKFLOW_MIN_SPECS.keys()),
        "enabled": False,
        "paid_authorized": False,
        "template": "deploy/runpod/README.md",
        "limits": "Paid per-minute (~$0.34-$0.69/hr). Strictly blocked unless WISE2_ALLOW_PAID_BACKENDS=true AND user explicitly authorizes activation.",
        "notes": "Optional paid fallback for heavy 736p/1080p production renders. Never activated automatically.",
    },
}


def _load_saved() -> dict[str, dict[str, Any]]:
    merged = json.loads(json.dumps(DEFAULT_BACKENDS))
    raw = store.get_setting(BACKEND_SETTINGS_KEY) or store.get_setting(LEGACY_SETTINGS_KEY)
    if raw:
        try:
            saved = json.loads(raw)
            for bid, cfg in saved.items():
                if bid in merged and isinstance(cfg, dict):
                    # Strip obsolete hardcoded dead defaults from legacy DB state
                    cleaned = dict(cfg)
                    if cleaned.get("comfyui_url") in OBSOLETE_DEAD_URLS:
                        cleaned["comfyui_url"] = ""
                    if cleaned.get("proxy_url") in OBSOLETE_DEAD_URLS:
                        cleaned["proxy_url"] = ""
                    merged[bid].update(cleaned)
        except Exception:
            pass
    return merged


def _save_all(data: dict[str, dict[str, Any]]) -> None:
    store.set_setting(BACKEND_SETTINGS_KEY, json.dumps(data))


def _http_json(url: str, timeout: float = 3.0, headers: dict[str, str] | None = None) -> tuple[int, Any]:
    req = urllib.request.Request(url, headers=headers or {"User-Agent": "WISE2-GPU-Manager/2.1"})
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


def _tcp_check(host: str, port: int, timeout: float = 2.0) -> tuple[bool, str]:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True, f"TCP {host}:{port} reachable"
    except socket.gaierror as exc:
        return False, f"DNS resolution failed for '{host}': {exc}"
    except TimeoutError:
        return False, f"TCP connection to {host}:{port} timed out after {timeout}s (host offline or firewall blocking port {port})"
    except OSError as exc:
        return False, f"TCP connection to {host}:{port} failed: {exc}"


def probe_comfyui(comfyui_url: str, required_nodes: list[str] | None = None, timeout: float = 3.5) -> dict[str, Any]:
    """Perform real TCP + HTTP + custom-node health verification against a ComfyUI endpoint."""
    url = (comfyui_url or "").strip().rstrip("/")
    checked_at = int(time.time())
    if not url:
        return {
            "reachable": False,
            "connected": False,
            "health_status": "unconfigured",
            "comfyui_url": "",
            "checked_at": checked_at,
            "tcp_ok": False,
            "tcp_detail": "No ComfyUI URL configured.",
            "error": "No ComfyUI endpoint URL configured. Launch Kaggle/Colab notebook or enter an online ComfyUI URL.",
            "system_stats": None,
            "detected_gpu_vram_gb": None,
            "queue": None,
            "websocket_reconnect_fix": False,
            "missing_packs": [],
            "registered_nodes_checked": 0,
            "ready_for_workflow": False,
        }

    parsed = urllib.parse.urlparse(url)
    host = parsed.hostname or ""
    port = parsed.port or (443 if parsed.scheme == "https" else 80)
    tcp_ok, tcp_detail = _tcp_check(host, port, timeout=min(timeout, 2.5))
    if not tcp_ok:
        return {
            "reachable": False,
            "connected": False,
            "health_status": "offline",
            "comfyui_url": url,
            "checked_at": checked_at,
            "tcp_ok": False,
            "tcp_detail": tcp_detail,
            "error": f"ComfyUI unreachable at {url} ({tcp_detail}).",
            "system_stats": None,
            "detected_gpu_vram_gb": None,
            "queue": None,
            "websocket_reconnect_fix": False,
            "missing_packs": [],
            "registered_nodes_checked": 0,
            "ready_for_workflow": False,
        }

    status_q, queue_data = _http_json(f"{url}/queue", timeout=timeout)
    if status_q != 200:
        return {
            "reachable": False,
            "connected": False,
            "health_status": "offline",
            "comfyui_url": url,
            "checked_at": checked_at,
            "tcp_ok": True,
            "tcp_detail": tcp_detail,
            "error": f"TCP connected, but ComfyUI /queue returned HTTP {status_q}: {queue_data.get('error', 'not a ComfyUI API')}",
            "system_stats": None,
            "detected_gpu_vram_gb": None,
            "queue": None,
            "websocket_reconnect_fix": False,
            "missing_packs": [],
            "registered_nodes_checked": 0,
            "ready_for_workflow": False,
        }

    _, sys_stats = _http_json(f"{url}/system_stats", timeout=timeout)
    ws_status, _ = _http_json(f"{url}/websocket_reconnect_fix", timeout=timeout)
    ws_ok = ws_status == 200

    detected_vram = None
    if isinstance(sys_stats, dict):
        for dev in sys_stats.get("devices") or []:
            vt = dev.get("vram_total")
            if isinstance(vt, (int, float)) and vt > 0:
                gb = round(vt / (1024 ** 3), 2)
                detected_vram = max(detected_vram or 0.0, gb)

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
        "connected": True,
        "health_status": "connected" if not missing_packs else "missing_nodes",
        "comfyui_url": url,
        "checked_at": checked_at,
        "tcp_ok": True,
        "tcp_detail": tcp_detail,
        "error": None,
        "system_stats": sys_stats if isinstance(sys_stats, dict) else None,
        "detected_gpu_vram_gb": detected_vram,
        "queue": {
            "running": len((queue_data or {}).get("queue_running") or []),
            "pending": len((queue_data or {}).get("queue_pending") or []),
        },
        "websocket_reconnect_fix": ws_ok,
        "missing_packs": missing_packs,
        "registered_nodes_checked": checked,
        "ready_for_workflow": len(missing_packs) == 0,
    }


def _evaluate_backend(entry: dict[str, Any], hw: dict[str, Any], live_probe: bool = False) -> dict[str, Any]:
    b = json.loads(json.dumps(entry))
    bid = b["id"]
    accel = hw["gpu"].get("accelerators") or {}
    paid_env_ok = os.getenv("WISE2_ALLOW_PAID_BACKENDS", "").lower() in {"1", "true", "yes"}

    if bid == "local-cpu":
        b["available"] = bool(hw["toolchain"]["ffmpeg"]["found"])
        b["connected"] = False  # Never report CPU as an AI GPU renderer
        b["health_status"] = "ready_cpu_only" if b["available"] else "offline"
        b["memory_summary"] = f"{hw['memory'].get('ram_total_gb') or '?'} GB System RAM · {hw['disk']['free_gb']} GB Free Disk"
        b["enabled"] = True
        return b

    if bid == "local-intel-xe":
        has_xe = bool(hw["gpu"].get("has_intel_xe"))
        dml = bool(accel.get("directml_available"))
        b["available"] = has_xe and dml
        b["connected"] = False
        b["health_status"] = "incompatible" if has_xe else "offline"
        b["hardware_detected"] = has_xe
        b["directml_installed"] = dml
        b["memory_summary"] = "Intel Iris Xe (2 GB shared, non-CUDA)" if has_xe else "No Intel Iris Xe detected"
        b["enabled"] = False
        return b

    if bid == "local-openvino":
        ov_ok = bool(accel.get("openvino_available"))
        b["available"] = ov_ok
        b["connected"] = False
        b["health_status"] = "ready_partial" if ov_ok else "not_installed"
        b["openvino_devices"] = accel.get("openvino_devices") or []
        b["memory_summary"] = f"OpenVINO devices: {', '.join(b['openvino_devices'])}" if ov_ok else "OpenVINO runtime not installed"
        b["enabled"] = False
        return b

    if bid == "local-nvidia":
        local_allowed = bool(hw["gpu"]["local_render_allowed"])
        b["hardware_supported"] = local_allowed
        b["hardware_blockers"] = hw["gpu"]["blockers"]
        b["vram_gb"] = hw["gpu"]["cuda"]["max_vram_gb"]
        b["memory_summary"] = (
            f"NVIDIA CUDA {b['vram_gb']} GB VRAM"
            if hw["gpu"]["cuda"]["cuda_available"]
            else "No NVIDIA CUDA GPU detected on this machine"
        )
        if not local_allowed:
            b["available"] = False
            b["connected"] = False
            b["enabled"] = False
            b["health_status"] = "incompatible"
            return b

    if b.get("paid"):
        b["paid_env_allowed"] = paid_env_ok
        if not (paid_env_ok and b.get("paid_authorized")):
            b["available"] = False
            b["connected"] = False
            b["enabled"] = False
            b["health_status"] = "locked_paid"
            b["memory_summary"] = "24–48 GB VRAM (Paid · Requires explicit opt-in)"
            return b

    # ComfyUI-based backends: NEVER claim connected without live probe!
    url = (b.get("comfyui_url") or "").strip()
    b["memory_summary"] = f"Target ~{b.get('vram_gb', 16)} GB VRAM" + (f" / {b['ram_gb']} GB RAM" if b.get("ram_gb") else "")
    if not url:
        b["available"] = False
        b["connected"] = False
        b["health_status"] = "unconfigured"
        b["enabled"] = True
        return b

    b["enabled"] = True
    if live_probe:
        probe = probe_comfyui(url, required_nodes=None, timeout=2.5)
        b["last_probe"] = probe
        b["connected"] = bool(probe["connected"])
        b["available"] = bool(probe["connected"])
        b["health_status"] = probe["health_status"]
        if probe.get("detected_gpu_vram_gb"):
            b["vram_gb"] = probe["detected_gpu_vram_gb"]
            b["memory_summary"] = f"Verified {probe['detected_gpu_vram_gb']} GB GPU VRAM"
    else:
        b["connected"] = False
        b["available"] = False
        b["health_status"] = "unchecked"
    return b


def list_backends(hw: dict[str, Any] | None = None, live_probe: bool = False) -> dict[str, Any]:
    hw_info = hw or hardware.detect_hardware()
    raw = _load_saved()
    active = store.get_setting("recast_active_backend") or "auto"
    evaluated = [_evaluate_backend(entry, hw_info, live_probe=live_probe) for entry in raw.values()]

    # Validate active selection doesn't point at blocked/locked backend
    by_id = {b["id"]: b for b in evaluated}
    if active != "auto":
        cur = by_id.get(active)
        if not cur or cur["health_status"] in {"incompatible", "locked_paid"}:
            active = "auto"

    ai_ready_backends = [b["id"] for b in evaluated if b.get("supports_ai_recast") and b.get("connected")]
    return {
        "active_backend": active,
        "auto_mode_available": True,
        "ai_ready_backends": ai_ready_backends,
        "backends": evaluated,
        "tailscale_peers": hw_info.get("network", {}).get("tailscale", {}).get("peers", []),
        "hardware_summary": {
            "local_gpu_capable": hw_info["gpu"]["local_gpu_capable"],
            "local_render_allowed": hw_info["gpu"]["local_render_allowed"],
            "has_intel_xe": hw_info["gpu"].get("has_intel_xe", False),
            "openvino_available": hw_info["gpu"].get("accelerators", {}).get("openvino_available", False),
            "recommended_backend": "auto",
            "blockers": hw_info["gpu"]["blockers"],
        },
    }


def select_best_backend(
    workflow: str = "simple",
    resolution: str = "480p",
    duration_sec: float = 5.0,
    preferred_backend_id: str | None = None,
    required_nodes: list[str] | None = None,
    live_probe: bool = True,
) -> dict[str, Any]:
    """AUTO Rendering Mode: rank all backends by compatibility, VRAM, speed, cost, and live health."""
    hw = hardware.detect_hardware()
    state = list_backends(hw, live_probe=live_probe)
    spec = WORKFLOW_MIN_SPECS.get(workflow, WORKFLOW_MIN_SPECS["simple"])
    res_mult = {"480p": 1.0, "736p": 1.8, "1080p": 3.5}.get(resolution, 1.0)
    est_base_sec = max(10, int(round(duration_sec * spec["est_sec_per_clip_sec_480p"] * res_mult)))

    candidates: list[dict[str, Any]] = []
    for b in state["backends"]:
        reasons: list[str] = []
        compatible = True
        score = 0

        if not b.get("supports_ai_recast"):
            compatible = False
            reasons.append(b.get("unsupported_reason") or "Does not support OpenJutsu AI video generation.")
        elif workflow not in (b.get("supported_workflows") or []):
            compatible = False
            reasons.append(f"Workflow '{workflow}' not supported on {b['name']}.")

        if b["health_status"] == "locked_paid":
            compatible = False
            reasons.append("Paid service disabled until user explicitly authorizes billing.")
        elif b["health_status"] == "incompatible":
            compatible = False
            reasons.append("Blocked by hardware compatibility guard.")
        elif b["health_status"] == "unconfigured":
            compatible = False
            reasons.append("No endpoint URL configured yet.")
        elif live_probe and not b.get("connected"):
            compatible = False
            probe_err = (b.get("last_probe") or {}).get("error") or "Health check failed (offline)."
            reasons.append(probe_err)

        # Verify workflow nodes if connected and nodes requested
        node_probe = None
        if compatible and live_probe and required_nodes and b.get("comfyui_url"):
            node_probe = probe_comfyui(b["comfyui_url"], required_nodes=required_nodes, timeout=3.5)
            if not node_probe["ready_for_workflow"]:
                compatible = False
                missing = ", ".join(p["name"] for p in node_probe["missing_packs"])
                reasons.append(f"Connected, but missing required custom nodes: {missing}")

        # Score compatible backends: free first, more VRAM better, local NVIDIA fastest
        if compatible:
            score += 40 if not b.get("paid") else 10
            vram = float(b.get("vram_gb") or 16.0)
            score += min(30, int(vram * 1.2))
            if b["id"] == "local-nvidia":
                score += 20
            elif b["id"] in {"wise2-gpu-server", "remote-comfyui"}:
                score += 18
            elif b["id"] == "kaggle-gpu":
                score += 15  # 30 GB RAM > Colab 12.7 GB RAM
            elif b["id"] == "google-colab":
                score += 10
                if duration_sec > 8 and workflow in {"simple", "advanced", "montage"}:
                    score -= 6
                    reasons.append("Free Colab 12.7 GB RAM may OOM on clips >8s.")
            if preferred_backend_id and b["id"] == preferred_backend_id:
                score += 25
            reasons.append(f"Verified healthy & compatible (est. ~{est_base_sec}s for {duration_sec}s @ {resolution}).")

        candidates.append({
            "id": b["id"],
            "name": b["name"],
            "tier": b["tier"],
            "paid": b["paid"],
            "health_status": b["health_status"],
            "connected": bool(b.get("connected")),
            "compatible": compatible,
            "score": score,
            "estimated_render_sec": est_base_sec if compatible else None,
            "vram_gb": b.get("vram_gb"),
            "comfyui_url": b.get("comfyui_url") or "",
            "reasons": reasons,
            "probe": node_probe or b.get("last_probe"),
        })

    candidates.sort(key=lambda x: (-int(x["compatible"]), -x["score"], x["id"]))
    chosen = next((c for c in candidates if c["compatible"]), None)

    return {
        "mode": "auto" if (not preferred_backend_id or preferred_backend_id == "auto") else preferred_backend_id,
        "workflow": workflow,
        "resolution": resolution,
        "duration_sec": duration_sec,
        "selected_backend": chosen,
        "ready": chosen is not None,
        "blocker_summary": None if chosen else (
            "No compatible AI GPU backend is currently online and healthy. "
            "Connect a free Kaggle GPU (T4 x2 · 30 GB RAM) or Google Colab notebook, or power on an authorized >=16 GB VRAM ComfyUI server."
        ),
        "candidates": candidates,
    }


def configure_backend(
    backend_id: str,
    comfyui_url: str | None = None,
    proxy_url: str | None = None,
    set_active: bool = False,
    authorize_paid: bool = False,
) -> dict[str, Any]:
    if backend_id == "auto":
        store.set_setting("recast_active_backend", "auto")
        return list_backends()

    backends_map = _load_saved()
    if backend_id not in backends_map:
        raise ValueError(f"Unknown backend '{backend_id}'")

    hw = hardware.detect_hardware()
    entry = backends_map[backend_id]

    if backend_id == "local-nvidia" and not hw["gpu"]["local_render_allowed"]:
        raise PermissionError(
            "Local NVIDIA rendering is blocked on this hardware: " + "; ".join(hw["gpu"]["blockers"])
        )

    if entry.get("paid"):
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

    _save_all(backends_map)
    if set_active:
        store.set_setting("recast_active_backend", backend_id)

    return list_backends(hw, live_probe=bool(comfyui_url))


def get_backend(backend_id: str | None = None, live_probe: bool = False) -> dict[str, Any]:
    info = list_backends(live_probe=live_probe)
    target = backend_id or info["active_backend"]
    if target == "auto":
        return {
            "id": "auto",
            "name": "AUTO (Smart Free GPU Selector)",
            "kind": "auto",
            "paid": False,
            "enabled": True,
            "comfyui_url": "",
        }
    for b in info["backends"]:
        if b["id"] == target:
            return b
    raise ValueError(f"Unknown backend '{target}'")


def run_connection_diagnostics(comfyui_url: str | None = None, workflow: str = "simple") -> dict[str, Any]:
    hw = hardware.detect_hardware(force=True)
    ts = hw["network"]["tailscale"]
    target_url = (comfyui_url or "").strip()
    if not target_url:
        # Check configured comfyui backends
        saved = _load_saved()
        for bid in ("remote-comfyui", "kaggle-gpu", "google-colab", "wise2-gpu-server", "local-nvidia"):
            u = (saved.get(bid) or {}).get("comfyui_url", "").strip()
            if u:
                target_url = u
                break

    probe = probe_comfyui(target_url, timeout=3.0) if target_url else probe_comfyui("", timeout=2.0)
    recommendations: list[str] = []
    if not probe["connected"]:
        recommendations.append("Option 1 (Fastest Free AI Render): Upload deploy/kaggle/WISE2_OpenJutsu_Kaggle.ipynb to Kaggle (GPU T4 x2 · 30 GB RAM · 30 hrs/week free), run all cells, and paste the printed https://*.trycloudflare.com URL into GPU Manager -> Kaggle Free GPU.")
        recommendations.append("Option 2 (Quick 5s Test): Upload deploy/colab/WISE2_OpenJutsu_Colab.ipynb to Google Colab (T4 GPU) and paste the printed tunnel URL into GPU Manager -> Google Colab.")
        recommendations.append("Option 3 (Dedicated Hardware): Power on a >=16 GB VRAM NVIDIA ComfyUI server on Tailscale and enter its URL in GPU Manager -> Remote ComfyUI.")
    elif not probe["ready_for_workflow"]:
        recommendations.append("ComfyUI is online! Install the listed missing custom node packs into ComfyUI/custom_nodes/ and restart ComfyUI.")

    return {
        "timestamp": int(time.time()),
        "tailscale": {
            "installed": ts["installed"],
            "running": ts["running"],
            "self_ip": ts["self_ip"],
            "peers": ts["peers"],
        },
        "target_url": target_url,
        "probe": probe,
        "local_hardware": {
            "cpu": hw["cpu"]["name"],
            "ram_gb": hw["memory"]["ram_total_gb"],
            "disk_free_gb": hw["disk"]["free_gb"],
            "cuda_available": hw["gpu"]["cuda"]["cuda_available"],
            "local_render_allowed": hw["gpu"]["local_render_allowed"],
            "blockers": hw["gpu"]["blockers"],
        },
        "recommendations": recommendations,
    }
