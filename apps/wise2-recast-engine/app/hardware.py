"""Hardware, toolchain, CUDA, and existing AI model auto-detection for WISE² RECAST ENGINE.

Prevents heavy local GPU rendering from running on unsupported integrated graphics
(such as Intel Iris Xe on Lenovo ThinkPad X1) and recommends verified free remote GPU
backends instead.
"""
from __future__ import annotations

import os
import platform
import shutil
import subprocess
import sys
import time
from pathlib import Path
from typing import Any

_CACHE: dict[str, Any] = {"ts": 0.0, "data": None}
_CACHE_TTL_SEC = 30.0

MIN_LOCAL_VRAM_GB = 12.0
RECOMMENDED_LOCAL_VRAM_GB = 16.0
MIN_LOCAL_RAM_GB = 32.0
MIN_DISK_FREE_GB_FOR_MODELS = 45.0


def _run(cmd: list[str], timeout: float = 5.0) -> str | None:
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        out = (proc.stdout or proc.stderr or "").strip()
        return out if proc.returncode == 0 and out else None
    except Exception:
        return None


def _cmd_version(tool: str, args: list[str] | None = None) -> dict[str, Any]:
    path = shutil.which(tool)
    if not path:
        return {"found": False, "path": None, "version": None}
    out = _run([path] + (args or ["--version"]))
    first = out.splitlines()[0].strip() if out else None
    return {"found": True, "path": path, "version": first}


def _detect_windows_hardware() -> dict[str, Any]:
    ps = (
        "$cs = Get-CimInstance Win32_ComputerSystem | Select-Object Manufacturer,Model,TotalPhysicalMemory;"
        "$cpu = Get-CimInstance Win32_Processor | Select-Object -First 1 Name,NumberOfCores,NumberOfLogicalProcessors;"
        "$gpus = @(Get-CimInstance Win32_VideoController | Select-Object Name,AdapterRAM,DriverVersion);"
        "@{system=$cs; cpu=$cpu; gpus=$gpus} | ConvertTo-Json -Depth 4 -Compress"
    )
    raw = _run(["powershell", "-NoProfile", "-Command", ps], timeout=8.0)
    if not raw:
        return {}
    try:
        import json
        return json.loads(raw)
    except Exception:
        return {}


def _detect_nvidia_cuda() -> dict[str, Any]:
    smi = shutil.which("nvidia-smi")
    gpus: list[dict[str, Any]] = []
    cuda_available = False
    driver_version = None
    max_vram_gb = 0.0

    if smi:
        out = _run([
            smi,
            "--query-gpu=name,memory.total,memory.free,driver_version",
            "--format=csv,noheader,nounits",
        ])
        if out:
            for line in out.splitlines():
                parts = [p.strip() for p in line.split(",")]
                if len(parts) >= 4:
                    try:
                        total_gb = round(float(parts[1]) / 1024.0, 2)
                        free_gb = round(float(parts[2]) / 1024.0, 2)
                    except ValueError:
                        total_gb, free_gb = 0.0, 0.0
                    driver_version = parts[3]
                    max_vram_gb = max(max_vram_gb, total_gb)
                    gpus.append({
                        "name": parts[0],
                        "vram_total_gb": total_gb,
                        "vram_free_gb": free_gb,
                        "driver_version": parts[3],
                    })
                    cuda_available = True

    torch_cuda = False
    torch_version = None
    try:
        import torch  # type: ignore
        torch_version = getattr(torch, "__version__", None)
        torch_cuda = bool(torch.cuda.is_available())
        if torch_cuda:
            cuda_available = True
    except Exception:
        pass

    return {
        "nvidia_smi_found": bool(smi),
        "cuda_available": cuda_available,
        "torch_installed": torch_version is not None,
        "torch_version": torch_version,
        "torch_cuda_available": torch_cuda,
        "driver_version": driver_version,
        "max_vram_gb": max_vram_gb,
        "nvidia_gpus": gpus,
    }


def _detect_tailscale() -> dict[str, Any]:
    ts = shutil.which("tailscale")
    if not ts:
        return {"installed": False, "self_ip": None, "peers": []}
    ip = _run([ts, "ip", "-4"], timeout=4.0)
    self_ip = ip.splitlines()[0].strip() if ip else None
    peers: list[dict[str, Any]] = []
    status_json = _run([ts, "status", "--json"], timeout=5.0)
    if status_json:
        try:
            import json
            parsed = json.loads(status_json)
            for peer in (parsed.get("Peer") or {}).values():
                ips = peer.get("TailscaleIPs") or []
                peers.append({
                    "hostname": peer.get("HostName"),
                    "dns_name": (peer.get("DNSName") or "").rstrip("."),
                    "ip": ips[0] if ips else None,
                    "os": peer.get("OS"),
                    "online": bool(peer.get("Online")),
                })
        except Exception:
            pass
    return {"installed": True, "self_ip": self_ip, "peers": peers}


def _scan_existing_ai_installs(data_dir: Path) -> dict[str, Any]:
    home = Path.home()
    candidates = [
        ("OpenJutsu (WISE2 upstream)", Path(r"C:\WISE2\openjutsu-recast-engine\upstream\openjutsu")),
        ("ComfyUI (WISE2 upstream)", Path(r"C:\WISE2\openjutsu-recast-engine\upstream\ComfyUI")),
        ("Open-Source Higgsfield Catalog", Path(r"C:\WISE2\openjutsu-recast-engine\upstream\open-source-higgsfield")),
        ("HuggingFace Cache", home / ".cache" / "huggingface" / "hub"),
        ("Pinokio", Path(r"C:\pinokio")),
        ("WISE2 Core Repo", home / "Projects" / "wise2-core"),
    ]
    installs = []
    for label, path in candidates:
        installs.append({
            "name": label,
            "path": str(path),
            "exists": path.exists(),
        })

    model_files: list[dict[str, Any]] = []
    search_roots = [
        Path(r"C:\WISE2\openjutsu-recast-engine\upstream\ComfyUI\models"),
        home / ".cache" / "huggingface" / "hub",
    ]
    if os.getenv("COMFYUI_MODELS_DIR"):
        search_roots.insert(0, Path(os.environ["COMFYUI_MODELS_DIR"]))

    exts = {".safetensors", ".ckpt", ".gguf", ".onnx", ".pth", ".pt"}
    seen: set[str] = set()
    for root in search_roots:
        if not root.exists():
            continue
        try:
            for item in root.rglob("*"):
                if len(model_files) >= 40:
                    break
                if item.is_file() and item.suffix.lower() in exts:
                    key = str(item)
                    if key in seen:
                        continue
                    seen.add(key)
                    model_files.append({
                        "name": item.name,
                        "path": key,
                        "size_mb": round(item.stat().st_size / (1024 * 1024), 2),
                    })
        except OSError:
            continue

    return {
        "installations": installs,
        "discovered_models": model_files,
        "data_dir": str(data_dir),
    }


def detect_hardware(data_dir: Path | None = None, force: bool = False) -> dict[str, Any]:
    now = time.monotonic()
    if not force and _CACHE["data"] is not None and (now - _CACHE["ts"]) < _CACHE_TTL_SEC:
        return _CACHE["data"]

    target_dir = data_dir or Path(os.getenv("WISE2_DATA_DIR", str(Path(__file__).resolve().parents[1] / "data")))
    disk_target = target_dir if target_dir.exists() else Path.cwd()
    disk = shutil.disk_usage(disk_target)
    disk_free_gb = round(disk.free / (1024 ** 3), 2)
    disk_total_gb = round(disk.total / (1024 ** 3), 2)

    win = _detect_windows_hardware() if os.name == "nt" else {}
    sys_info = win.get("system") or {}
    cpu_info = win.get("cpu") or {}
    raw_gpus = win.get("gpus") or []
    if isinstance(raw_gpus, dict):
        raw_gpus = [raw_gpus]

    ram_bytes = int(sys_info.get("TotalPhysicalMemory") or 0)
    if ram_bytes <= 0:
        try:
            ram_bytes = os.sysconf("SC_PAGE_SIZE") * os.sysconf("SC_PHYS_PAGES")
        except Exception:
            ram_bytes = 0
    ram_total_gb = round(ram_bytes / (1024 ** 3), 2) if ram_bytes else None

    display_gpus = []
    for g in raw_gpus:
        if not isinstance(g, dict):
            continue
        adapter_ram = g.get("AdapterRAM") or 0
        display_gpus.append({
            "name": g.get("Name") or "Unknown GPU",
            "adapter_ram_gb": round(float(adapter_ram) / (1024 ** 3), 2) if adapter_ram else None,
            "driver_version": g.get("DriverVersion"),
            "integrated": any(tok in str(g.get("Name") or "").lower() for tok in ("intel", "iris", "uhd", "radeon graphics", "microsoft basic")),
        })

    cuda = _detect_nvidia_cuda()
    tailscale = _detect_tailscale()
    ai_scan = _scan_existing_ai_installs(target_dir)

    blockers: list[str] = []
    if not cuda["cuda_available"]:
        blockers.append("No NVIDIA CUDA GPU detected (integrated graphics cannot run MiniMax H3 / FLUX.3 Klein locally).")
    elif cuda["max_vram_gb"] < MIN_LOCAL_VRAM_GB:
        blockers.append(
            f"Detected NVIDIA VRAM ({cuda['max_vram_gb']} GB) is below the {MIN_LOCAL_VRAM_GB:.0f} GB minimum for OpenJutsu H3 inference."
        )
    if ram_total_gb is not None and ram_total_gb < MIN_LOCAL_RAM_GB:
        blockers.append(
            f"System RAM ({ram_total_gb} GB) is below the {MIN_LOCAL_RAM_GB:.0f} GB recommended for INT8 H3 RAM streaming."
        )
    if disk_free_gb < MIN_DISK_FREE_GB_FOR_MODELS:
        blockers.append(
            f"Free disk space ({disk_free_gb} GB) is below the {MIN_DISK_FREE_GB_FOR_MODELS:.0f} GB needed for OpenJutsu open-weight model checkpoints."
        )

    local_gpu_capable = cuda["cuda_available"] and cuda["max_vram_gb"] >= MIN_LOCAL_VRAM_GB
    local_render_allowed = local_gpu_capable and disk_free_gb >= 10.0

    if local_render_allowed:
        recommended_backend = "local-nvidia"
        recommendation_reason = "NVIDIA GPU with sufficient VRAM detected; local rendering enabled."
    else:
        recommended_backend = "remote-comfyui"
        recommendation_reason = (
            "Local hardware is protected from unsupported heavy GPU inference. "
            "Use a Remote ComfyUI server (e.g., WISE² Tailscale GPU node) or free Google Colab / Kaggle GPU backend."
        )

    result = {
        "timestamp": int(time.time()),
        "os": {
            "system": platform.system(),
            "release": platform.release(),
            "version": platform.version(),
            "machine": platform.machine(),
            "manufacturer": sys_info.get("Manufacturer"),
            "model": sys_info.get("Model"),
        },
        "cpu": {
            "name": cpu_info.get("Name") or platform.processor() or "Unknown CPU",
            "cores": cpu_info.get("NumberOfCores") or os.cpu_count(),
            "logical_processors": cpu_info.get("NumberOfLogicalProcessors") or os.cpu_count(),
        },
        "memory": {
            "ram_total_gb": ram_total_gb,
            "recommended_ram_gb": RECOMMENDED_LOCAL_VRAM_GB * 4,
        },
        "disk": {
            "path": str(disk_target),
            "free_gb": disk_free_gb,
            "total_gb": disk_total_gb,
            "low_space_warning": disk_free_gb < 15.0,
        },
        "gpu": {
            "display_adapters": display_gpus,
            "cuda": cuda,
            "local_gpu_capable": local_gpu_capable,
            "local_render_allowed": local_render_allowed,
            "blockers": blockers,
        },
        "toolchain": {
            "python": {"found": True, "path": sys.executable, "version": sys.version.split()[0]},
            "node": _cmd_version("node", ["--version"]),
            "npm": _cmd_version("npm", ["--version"]),
            "git": _cmd_version("git", ["--version"]),
            "ffmpeg": _cmd_version("ffmpeg", ["-version"]),
            "ffprobe": _cmd_version("ffprobe", ["-version"]),
            "docker": _cmd_version("docker", ["--version"]),
        },
        "network": {
            "tailscale": tailscale,
        },
        "existing_ai": ai_scan,
        "recommended_backend": recommended_backend,
        "recommendation_reason": recommendation_reason,
    }
    _CACHE["ts"] = now
    _CACHE["data"] = result
    return result
