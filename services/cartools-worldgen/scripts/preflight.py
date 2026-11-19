#!/usr/bin/env python3
"""Read-only host preflight for CARTOOLS WorldGen; does not install or stop anything."""
from __future__ import annotations
import argparse, json, os, platform, shutil, subprocess, time
from pathlib import Path

def command(args: list[str]) -> dict:
    exe = shutil.which(args[0])
    if not exe:
        return {"available": False, "command": args[0]}
    try:
        p = subprocess.run([exe, *args[1:]], capture_output=True, text=True, timeout=15, check=False)
        return {"available": True, "returncode": p.returncode,
                "stdout": p.stdout.strip()[:12000], "stderr": p.stderr.strip()[:3000]}
    except Exception as exc:
        return {"available": True, "error": str(exc)}

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="")
    args = parser.parse_args()
    usage = shutil.disk_usage("/")
    report = {
        "timestamp_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "host": platform.node(), "platform": platform.platform(),
        "python": platform.python_version(), "cpu_count": os.cpu_count(),
        "memory": command(["bash", "-lc", "free -h"]),
        "nvidia_smi": command(["nvidia-smi", "-L"]),
        "gpu_detail": command(["nvidia-smi", "--query-gpu=index,name,memory.total,memory.free,driver_version,utilization.gpu", "--format=csv,noheader"]),
        "cuda_toolkit": command(["nvcc", "--version"]),
        "ollama_processes": command(["bash", "-lc", "pgrep -af 'ollama|ollama serve' || true"]),
        "root_disk": {"total_bytes": usage.total, "free_bytes": usage.free, "used_bytes": usage.used},
        "notes": [
            "Read-only probe; no package installation, model download, service stop, or configuration changes.",
            "Multiple GPUs are reported separately; their VRAM must not be summed as if it were one device.",
            "This report does not establish WorldGen compatibility. Verify upstream model and dependency requirements first."
        ]
    }
    rendered = json.dumps(report, indent=2)
    print(rendered)
    if args.output:
        Path(args.output).write_text(rendered + "\n", encoding="utf-8")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
