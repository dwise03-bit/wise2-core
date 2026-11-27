"""WISE² RECAST ENGINE command-line diagnostic audit script."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app import auth, backends, hardware, recast  # noqa: E402


def main() -> int:
    hw = hardware.detect_hardware(force=True)
    bk = backends.list_backends(hw)
    policy_ok, policy_msg = auth.validate_password_policy()
    workflows_ok = []
    workflows_missing = []
    for key, rel in recast.WORKFLOW_FILE_MAP.items():
        if (recast.WORKFLOWS_DIR / rel).is_file():
            workflows_ok.append(key)
        else:
            workflows_missing.append(key)

    report = {
        "hardware": {
            "machine": f"{hw['os'].get('manufacturer') or ''} {hw['os'].get('model') or hw['os']['system']}".strip(),
            "cpu": hw["cpu"]["name"],
            "ram_gb": hw["memory"]["ram_total_gb"],
            "disk_free_gb": hw["disk"]["free_gb"],
            "display_gpus": [g["name"] for g in hw["gpu"]["display_adapters"]],
            "cuda_available": hw["gpu"]["cuda"]["cuda_available"],
            "local_render_allowed": hw["gpu"]["local_render_allowed"],
            "blockers": hw["gpu"]["blockers"],
        },
        "toolchain": {k: v["version"] if v["found"] else "MISSING" for k, v in hw["toolchain"].items()},
        "auth": {"required": auth.auth_required(), "policy_ok": policy_ok, "message": policy_msg},
        "active_backend": bk["active_backend"],
        "workflows_verified": len(workflows_ok),
        "workflows_missing": workflows_missing,
        "tailscale_ip": hw["network"]["tailscale"].get("self_ip"),
    }
    print(json.dumps(report, indent=2))
    return 0 if (not workflows_missing and hw["toolchain"]["ffmpeg"]["found"]) else 1


if __name__ == "__main__":
    raise SystemExit(main())
