#!/usr/bin/env python3
"""WISE² Command Center — read-only status server.

Safety contract (see context/ARCHITECTURE.md + security/configs/*):
  * Binds to 127.0.0.1 ONLY (no public/tailnet exposure without approval).
  * READ-ONLY. Exposes a fixed set of safe collectors.
  * NO arbitrary shell execution from HTTP input. Routes are an allowlist;
    collectors run fixed argument vectors (never shell=True, never user input).
  * Static files served only from ./public (path-traversal guarded).
Dependency-free (Python 3 stdlib only).
"""
from __future__ import annotations
import json, os, shutil, subprocess, sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

BASE = Path(__file__).resolve().parent
PUBLIC = BASE / "public"
WISE2_ROOT = Path(os.environ.get("WISE2_ROOT", "/opt/wise2"))
BIND_HOST = os.environ.get("CC_HOST", "127.0.0.1")   # localhost by default
BIND_PORT = int(os.environ.get("CC_PORT", "3010"))

def _run(args, timeout=5):
    """Run a FIXED argument vector (no shell). Returns stdout or ''."""
    try:
        out = subprocess.run(args, capture_output=True, text=True, timeout=timeout)
        return out.stdout.strip()
    except Exception:
        return ""

def _svc(unit):
    return _run(["systemctl", "is-active", unit]) or "unknown"

def collect_status():
    """Fixed, safe, read-only collectors. No user input reaches a command."""
    # memory
    mem = {}
    try:
        info = Path("/proc/meminfo").read_text().splitlines()
        kv = {l.split(":")[0]: int(l.split()[1]) for l in info if ":" in l}
        mem = {"total_gib": round(kv.get("MemTotal", 0)/1048576, 1),
               "avail_gib": round(kv.get("MemAvailable", 0)/1048576, 1)}
    except Exception:
        pass
    # disk
    disk = {}
    try:
        du = shutil.disk_usage("/")
        disk = {"total_gb": round(du.total/1e9), "free_gb": round(du.free/1e9),
                "used_pct": round(du.used/du.total*100)}
    except Exception:
        pass
    # battery
    battery = None
    bat = Path("/sys/class/power_supply/BAT1")
    if bat.exists():
        try:
            battery = {"capacity": int((bat/"capacity").read_text().strip()),
                       "status": (bat/"status").read_text().strip()}
        except Exception:
            pass
    # cpu model
    cpu = ""
    try:
        for l in Path("/proc/cpuinfo").read_text().splitlines():
            if l.startswith("model name"):
                cpu = l.split(":", 1)[1].strip(); break
    except Exception:
        pass
    # engagements (count only; no contents)
    eng_dir = WISE2_ROOT / "security" / "engagements"
    engagements = len([d for d in eng_dir.glob("*") if d.is_dir()]) if eng_dir.exists() else 0

    def have(c): return shutil.which(c) is not None

    # Hermes honest 4-state via the client script (never fabricated)
    hermes = {"configured": False, "reachable": False, "authenticated": False,
              "memory": False, "ready": False, "note": "client unavailable"}
    client = WISE2_ROOT / "hermes" / "client" / "hermes-client.sh"
    if client.exists():
        out = _run([str(client), "status", "--json"], timeout=8)
        try:
            hermes = json.loads(out) if out else hermes
        except Exception:
            hermes["note"] = "status parse error"

    return {
        "host": _run(["hostnamectl", "--static"]) or os.uname().nodename,
        "kernel": os.uname().release,
        "os": _run(["bash", "-lc", ". /etc/os-release; echo $PRETTY_NAME"]) or "Ubuntu",
        "cpu": cpu, "mem": mem, "disk": disk, "battery": battery,
        "uptime": _run(["uptime", "-p"]),
        "services": {k: _svc(v) for k, v in {
            "ssh": "ssh", "tailscale": "tailscaled", "docker": "docker",
            "bluetooth": "bluetooth", "touch": "iptsd@dev-hidraw0",
        }.items()},
        "agents": {
            "claude": _run(["claude", "--version"]) if have("claude") else "missing",
            "codex": _run(["codex", "--version"]) if have("codex") else "not installed",
            "shannon": (_run(["wise2-shannon", "version"]).splitlines() or ["missing"])[0]
                        if have("wise2-shannon") else "missing",
        },
        "modules": {
            "hermes": hermes,
            "command_center": "running",
            "engagements": engagements,
        },
        "tailscale_ip": _run(["tailscale", "ip", "-4"]) if have("tailscale") else "",
    }

class Handler(BaseHTTPRequestHandler):
    server_version = "WISE2-CC/0.1"
    def log_message(self, *a):  # quiet
        pass
    def _send(self, code, body, ctype):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(body)
    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path in ("/api/status", "/api/status/"):
            body = json.dumps(collect_status(), indent=2).encode()
            return self._send(200, body, "application/json")
        if path in ("/", "/index.html"):
            return self._serve_static("index.html")
        # static files, traversal-guarded
        name = path.lstrip("/")
        return self._serve_static(name)
    def _serve_static(self, name):
        target = (PUBLIC / name).resolve()
        if not str(target).startswith(str(PUBLIC.resolve())) or not target.is_file():
            return self._send(404, b"not found", "text/plain")
        ctype = {".html": "text/html", ".css": "text/css", ".js": "text/javascript",
                 ".json": "application/json", ".svg": "image/svg+xml"}.get(target.suffix, "application/octet-stream")
        return self._send(200, target.read_bytes(), ctype)

def main():
    PUBLIC.mkdir(exist_ok=True)
    httpd = ThreadingHTTPServer((BIND_HOST, BIND_PORT), Handler)
    print(f"WISE2 Command Center (read-only) on http://{BIND_HOST}:{BIND_PORT}")
    print("Bound to localhost. Ctrl-C to stop.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.shutdown()

if __name__ == "__main__":
    sys.exit(main())
