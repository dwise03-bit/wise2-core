#!/usr/bin/env python3
"""WISE² Remote Command: local-only, allowlisted diagnostics API.

No arbitrary shell, no shell=True, no unauthenticated commands.
Bind to loopback; use SSH/Tailscale to reach the service securely.
"""
import argparse
import hmac
import json
import os
import platform
import secrets
import subprocess
import sys
import time
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

MAX_BODY = 4096
MAX_OUTPUT = 12000
TASKS = {
    "system.info": [["uname", "-a"]],
    "system.disk": [["df", "-h"]],
    "system.memory": [["vm_stat"]] if sys.platform == "darwin" else [["free", "-h"]],
    "system.uptime": [["uptime"]],
    "network.tailscale": [["tailscale", "status"]],
    "esp32.ports": [[sys.executable, "-m", "serial.tools.list_ports", "-v"]],
    "esp32.tool_version": [[sys.executable, "-m", "esptool", "version"]],
}
# Device writes, flashing, shell access, reboot and password access are deliberately absent.

def execute_task(task):
    if task not in TASKS:
        raise ValueError("unknown or disallowed task")
    results = []
    for argv in TASKS[task]:
        try:
            p = subprocess.run(argv, shell=False, stdin=subprocess.DEVNULL,
                               capture_output=True, text=True, timeout=12, check=False)
            results.append({"argv": argv, "exit_code": p.returncode,
                            "stdout": p.stdout[:MAX_OUTPUT],
                            "stderr": p.stderr[:MAX_OUTPUT]})
        except (OSError, subprocess.TimeoutExpired) as exc:
            results.append({"argv": argv, "error": str(exc)[:500]})
    return results

def build_handler(token, audit_path):
    class Handler(BaseHTTPRequestHandler):
        server_version = "WISE2Remote/1"
        def log_message(self, fmt, *args):
            return
        def respond(self, status, payload):
            raw = json.dumps(payload, separators=(",", ":")).encode()
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("Content-Length", str(len(raw)))
            self.end_headers()
            self.wfile.write(raw)
        def authenticated(self):
            auth = self.headers.get("Authorization", "")
            return hmac.compare_digest(auth, "Bearer " + token)
        def audit(self, action, status):
            record = {"ts": datetime.now(timezone.utc).isoformat(),
                      "action": action, "status": status, "client": self.client_address[0]}
            try:
                with audit_path.open("a", encoding="utf8") as f:
                    f.write(json.dumps(record) + "\n")
            except OSError:
                pass
        def do_GET(self):
            if self.path == "/health":
                return self.respond(200, {"service": "wise2-remote-command",
                                          "status": "running", "mode": "read-only"})
            self.respond(404, {"error": "not found"})
        def do_POST(self):
            if self.path != "/v1/diagnostics":
                return self.respond(404, {"error": "not found"})
            if not self.authenticated():
                self.audit("auth", "denied")
                return self.respond(401, {"error": "unauthorized"})
            try:
                length = int(self.headers.get("Content-Length", "0"))
                if length <= 0 or length > MAX_BODY:
                    return self.respond(413, {"error": "invalid request size"})
                data = json.loads(self.rfile.read(length))
                if not isinstance(data, dict) or set(data) != {"task"} or not isinstance(data["task"], str):
                    raise ValueError("expected JSON object with task")
                task = data["task"]
                result = execute_task(task)
                self.audit(task, "executed")
                self.respond(200, {"task": task, "results": result})
            except (ValueError, json.JSONDecodeError):
                self.audit("invalid", "rejected")
                self.respond(400, {"error": "invalid or disallowed task"})
    return Handler

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--audit", default=str(Path.home() / ".wise2-remote-audit.jsonl"))
    args = parser.parse_args()
    if args.host not in ("127.0.0.1", "::1"):
        parser.error("Refusing non-loopback bind; use an authenticated SSH tunnel")
    token = os.environ.get("WISE2_REMOTE_TOKEN", "")
    if len(token) < 32:
        parser.error("Set WISE2_REMOTE_TOKEN to a random secret of at least 32 characters")
    server = ThreadingHTTPServer((args.host, args.port),
                                 build_handler(token, Path(args.audit)))
    print("WISE² Remote Command listening on loopback (read-only)", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

if __name__ == "__main__":
    main()
