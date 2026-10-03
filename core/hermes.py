"""Probe the existing Hermes read-only contract without credentials in argv/logs."""
from __future__ import annotations
import json
import os
import shlex
import stat
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, ProxyHandler, Request, build_opener

DEFAULTS = {
    "HERMES_ENABLED": "false", "HERMES_BASE_URL": "", "HERMES_BRAIN_PREFIX": "/brain-api",
    "HERMES_HEALTH_PATH": "/api/health", "HERMES_AUTH_CHECK_PATH": "/api/v1/brain-auth/status",
    "HERMES_MEMORY_PATH": "/api/v1/brain-auth/knowledge/graph/stats",
    "HERMES_CREDENTIAL_FILE": "/opt/wise2/hermes/credentials/device-token", "HERMES_TIMEOUT": "4",
    "HERMES_DEVICE_ID": "wise2-surface",
}


def configuration(root):
    conf = Path(os.environ.get("HERMES_CONF", str(root / "hermes/config/hermes.conf")))
    values = dict(DEFAULTS)
    if not conf.exists():
        return values
    # Literal KEY=value format, comments/quotes supported. Never execute source.
    for line in conf.read_text().splitlines():
        parts = shlex.split(line, comments=True)
        if not parts:
            continue
        if len(parts) != 1 or "=" not in parts[0]:
            raise ValueError("literal configuration required")
        key, value = parts[0].split("=", 1)
        if key not in DEFAULTS or any(c in value for c in ("$", "`", "\r", "\n")):
            raise ValueError("unsupported configuration")
        values[key] = value
    return values


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def get(url, token, timeout):
    # No proxy or redirect forwarding of a dedicated private device credential.
    opener = build_opener(ProxyHandler({}), NoRedirect())
    headers = {"Accept": "application/json"}
    if token:
        headers["Authorization"] = "Bearer " + token
    try:
        with opener.open(Request(url, headers=headers), timeout=timeout) as response:
            payload = response.read(1024 * 1024 + 1)
            if len(payload) > 1024 * 1024:
                return 0, None
            try:
                body = json.loads(payload)
            except (ValueError, UnicodeError):
                body = None
            return response.status, body
    except HTTPError as e:
        return e.code, None
    except (URLError, OSError, ValueError):
        return 0, None


def probe(root):
    state = {"state": "NOT CONFIGURED", "configured": False, "reachable": False,
             "authenticated": False, "memory": False, "ready": False,
             "note": "existing production connection pending"}
    try:
        conf = configuration(root)
        if conf["HERMES_ENABLED"].lower() != "true":
            return state
        state.update(state="ERROR", note="endpoint or device credential unavailable")
        base = urlsplit(conf["HERMES_BASE_URL"])
        if base.scheme not in {"http", "https"} or not base.hostname or base.username or base.password or base.query or base.fragment:
            return state
        token_file = Path(conf["HERMES_CREDENTIAL_FILE"])
        meta = token_file.lstat()
        if not stat.S_ISREG(meta.st_mode) or meta.st_uid != os.getuid() or stat.S_IMODE(meta.st_mode) != 0o600:
            state["note"] = "device credential must be owner-only mode 0600 regular file"
            return state
        token = token_file.read_text().strip()
        if not token or len(token) > 16384 or any(c in token for c in ("\r", "\n")):
            return state
        timeout = min(max(float(conf["HERMES_TIMEOUT"]), .2), 5)
        for key in ("HERMES_BRAIN_PREFIX", "HERMES_HEALTH_PATH", "HERMES_AUTH_CHECK_PATH", "HERMES_MEMORY_PATH"):
            value = conf[key]
            if not value.startswith("/") or value.startswith("//") or "?" in value or "#" in value:
                return state
        prefix = conf["HERMES_BASE_URL"].rstrip("/") + conf["HERMES_BRAIN_PREFIX"].rstrip("/")
        state["configured"] = True
        code, health = get(prefix + conf["HERMES_HEALTH_PATH"], None, timeout)
        state["reachable"] = code == 200
        if state["reachable"]:
            code, auth = get(prefix + conf["HERMES_AUTH_CHECK_PATH"], token, timeout)
            # JSON evidence required; an HTML login page with HTTP 200 is not auth success.
            state["authenticated"] = code == 200 and isinstance(auth, dict)
            if state["authenticated"]:
                if isinstance(health, dict) and health.get("mongo") == "connected":
                    state["memory"] = True
                else:
                    code, body = get(prefix + conf["HERMES_MEMORY_PATH"], token, timeout)
                    state["memory"] = code == 200 and isinstance(body, dict)
        state["ready"] = all(state[k] for k in ("configured", "reachable", "authenticated", "memory"))
        state.update(state="READY" if state["ready"] else "ERROR",
                     note="read-only probes passed" if state["ready"] else "connectivity, authentication or memory unavailable")
    except (OSError, ValueError, TypeError):
        state.update(state="ERROR", note="configuration or credential unavailable")
    return state
