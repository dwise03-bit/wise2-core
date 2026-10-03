#!/usr/bin/env python3
"""Read-only loopback dashboard; fixed probes and cached telemetry only."""
from __future__ import annotations
import json
import os
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

BASE = Path(__file__).resolve().parent
PUBLIC = (BASE / "public").resolve()
sys.path.insert(0, str(BASE.parent))
from core.runtime import status, VERSION

BIND_HOST = os.environ.get("CC_HOST", "127.0.0.1")
BIND_PORT = int(os.environ.get("CC_PORT", "3010"))


class StatusCache:
    """Coalesce browser polls; probes never occupy a request thread."""
    def __init__(self, collector=status, clock=time.monotonic):
        self.collector, self.clock = collector, clock
        self.lock = threading.Lock()
        self.data = None
        self.updated = None
        self.attempted = None
        self.running = False
        self.error = False

    def _refresh(self):
        try:
            data = self.collector()
            with self.lock:
                self.data, self.updated, self.error = data, self.clock(), False
        except Exception:
            # Exception strings may contain credentials; do not log/return them.
            with self.lock:
                self.error = True
        finally:
            with self.lock:
                self.running = False

    def get(self):
        with self.lock:
            current = self.clock()
            if not self.running and (self.attempted is None or current - self.attempted >= 10):
                self.running, self.attempted = True, current
                threading.Thread(target=self._refresh, daemon=True).start()
            if self.data is None:
                return {"collection_state": "ERROR" if self.error else "COLLECTING", "observed_at": None}
            state = "STALE" if self.error or current - self.updated > 30 else "LIVE"
            return {**self.data, "collection_state": state}


CACHE = StatusCache()


class Handler(BaseHTTPRequestHandler):
    server_version = "WISE2-CC/0.2"

    def log_message(self, *args):
        pass  # Request paths/headers can contain secrets; no raw request log.

    def _send(self, code, body, ctype):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Content-Security-Policy", "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'")
        self.end_headers()
        if self.command != "HEAD":
            try:
                self.wfile.write(body)
            except (BrokenPipeError, ConnectionResetError):
                pass

    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        path = unquote(urlsplit(self.path).path)
        if path == "/healthz":
            return self._send(200, json.dumps({"status": "ok", "version": VERSION}).encode(), "application/json")
        if path in {"/api/status", "/api/status/"}:
            return self._send(200, json.dumps(CACHE.get(), ensure_ascii=False).encode(), "application/json")
        name = "index.html" if path == "/" else path.lstrip("/")
        target = (PUBLIC / name).resolve()
        # Proper path containment; a sibling directory sharing the prefix is not public.
        if not target.is_relative_to(PUBLIC) or not target.is_file():
            return self._send(404, b"not found", "text/plain")
        try:
            body = target.read_bytes()
        except OSError:
            return self._send(404, b"not found", "text/plain")
        ctype = {".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
                 ".json": "application/json", ".svg": "image/svg+xml"}.get(target.suffix, "application/octet-stream")
        return self._send(200, body, ctype)


def main():
    if BIND_HOST != "127.0.0.1":
        raise SystemExit("Command Center requires 127.0.0.1; exposure changes require a separate reviewed deployment")
    httpd = ThreadingHTTPServer((BIND_HOST, BIND_PORT), Handler)
    print(f"WISE² Command Center v{VERSION}, read-only loopback listener", flush=True)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()


if __name__ == "__main__":
    main()
