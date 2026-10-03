"""Fixed read-only probes shared by CLI and Command Center. No shell execution."""
from __future__ import annotations

import hashlib
import ipaddress
import json
import os
import re
import shutil
import socket
import subprocess
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

VERSION = "0.2.0"
ROOT = Path(os.environ.get("WISE2_ROOT", "/opt/wise2")).resolve()


def now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


@dataclass
class Result:
    code: int | None
    text: str = ""
    reason: str = ""

    @property
    def ok(self):
        return self.code == 0


# Observation failures must not be confused with known inactive services.
BLOCKED = ("operation not permitted", "permission denied", "failed to connect to bus",
           "cannot open netlink", "access denied")


def run(args, timeout=5, input_text=None):
    env = dict(os.environ)
    env.setdefault("XDG_RUNTIME_DIR", f"/run/user/{os.getuid()}")
    env["LC_ALL"] = "C"
    try:
        p = subprocess.run(args, input=input_text, capture_output=True, text=True,
                           timeout=timeout, env=env)
        if any(word in p.stderr.lower() for word in BLOCKED):
            return Result(None, reason="observation denied")
        return Result(p.returncode, p.stdout.strip(), "command failed" if p.returncode else "")
    except subprocess.TimeoutExpired:
        return Result(None, reason="probe timed out")
    except FileNotFoundError:
        return Result(127, reason="executable missing")
    except PermissionError:
        return Result(None, reason="observation denied")
    except OSError:
        return Result(None, reason="probe unavailable")


def unit(name, user=False):
    p = run(["systemctl", *(["--user"] if user else []), "is-active", name])
    if p.code is None:
        return "UNKNOWN"
    if p.text == "active" and p.ok:
        return "ONLINE"
    if p.text in {"inactive", "failed", "activating", "deactivating"}:
        return "OFFLINE"
    return "UNKNOWN"


def touch_state():
    p = run(["systemctl", "list-units", "--all", "--plain", "--no-legend", "iptsd@*.service"])
    if not p.ok:
        return "UNKNOWN" if p.code is None else "OFFLINE"
    # Parse columns exactly: 'inactive' contains the string 'active'.
    for line in p.text.splitlines():
        columns = line.split()
        if len(columns) >= 4 and columns[0].startswith("iptsd@") and columns[2:4] == ["active", "running"]:
            return "ONLINE"
    return "OFFLINE"


def socket_inventory():
    p = run(["ss", "-ltnH"])
    if not p.ok:
        return None
    sockets = []
    for line in p.text.splitlines():
        cols = line.split()
        if len(cols) >= 4:
            addr, sep, port = cols[3].rpartition(":")
            if sep and port.isdigit():
                sockets.append((addr.strip("[]"), int(port)))
    return sockets


def cc_http(page=False):
    # curl reports status only, never response contents or headers.
    p = run(["curl", "--noproxy", "*", "--silent", "--max-time", "3", "--output", "/dev/null",
             "--write-out", "%{http_code}", "http://127.0.0.1:3010/" + ("" if page else "healthz")], timeout=4)
    if p.code is None:
        return "UNKNOWN"
    return "ONLINE" if p.ok and p.text == "200" else "OFFLINE"


def os_release(path=Path("/etc/os-release")):
    try:
        return {k: v.strip('"') for line in path.read_text().splitlines()
                if "=" in line for k, v in [line.split("=", 1)]}
    except OSError:
        return {}


def memory():
    try:
        values = {line.split(":")[0]: int(line.split()[1])
                  for line in Path("/proc/meminfo").read_text().splitlines() if ":" in line}
        return {"total_gib": round(values["MemTotal"] / 1048576, 1),
                "avail_gib": round(values["MemAvailable"] / 1048576, 1)}
    except (OSError, ValueError, KeyError):
        return {}


def disk():
    try:
        usage = shutil.disk_usage("/")
        return {"total_gb": round(usage.total / 1e9), "free_gb": round(usage.free / 1e9),
                "used_pct": round(usage.used / usage.total * 100)}
    except OSError:
        return {}


def cpu():
    try:
        for line in Path("/proc/cpuinfo").read_text().splitlines():
            if line.startswith("model name"):
                return line.split(":", 1)[1].strip()
    except OSError:
        pass
    return "UNKNOWN"


def battery():
    for b in Path("/sys/class/power_supply").glob("BAT*"):
        try:
            return {"capacity": int((b / "capacity").read_text()), "status": (b / "status").read_text().strip()}
        except (OSError, ValueError):
            continue
    return None


def tailscale():
    p = run(["tailscale", "status", "--json"])
    if not p.ok:
        return {"state": "UNKNOWN", "ip": None, "peers": {}}
    try:
        d = json.loads(p.text)
        online = d.get("BackendState") == "Running"
        ips = d.get("Self", {}).get("TailscaleIPs", [])
        return {"state": "ONLINE" if online else "OFFLINE",
                "ip": next((ip for ip in ips if ":" not in ip), None),
                "peers": d.get("Peer", {}) if online else {}}
    except (ValueError, AttributeError, TypeError):
        return {"state": "UNKNOWN", "ip": None, "peers": {}}


def tool(name, args=None):
    p = run([name, *(args or ["--version"])])
    return {"state": "ONLINE" if p.ok else "UNKNOWN" if p.code is None else "OFFLINE",
            "version": (p.text.splitlines() or [None])[0] if p.ok else None}


def shannon():
    launcher = shutil.which("wise2-shannon")
    cache = None
    # Inspect only locally installed metadata; never invoke npx from telemetry.
    candidates = sorted((Path.home() / ".npm/_npx").glob("*/node_modules/@keygraph/shannon/package.json"))
    candidates += [Path("/usr/local/lib/node_modules/@keygraph/shannon/package.json")]
    for candidate in candidates:
        try:
            info = json.loads(candidate.read_text())
            if info.get("name") == "@keygraph/shannon":
                cache = info.get("version")
                break
        except (OSError, ValueError):
            continue
    return {"state": "INSTALLED" if launcher and cache else "PARTIAL" if launcher else "NOT CONFIGURED",
            "launcher": bool(launcher), "cached_version": cache,
            "engagement_state": "UNKNOWN", "authorization": "NOT AUTHORIZED"}


def gate_check():
    path = shutil.which("wise2-pentest")
    try:
        baseline = json.loads((ROOT / "security/configs/launcher-baseline.json").read_text())
        if not path or hashlib.sha256(Path(path).read_bytes()).hexdigest() != baseline["wise2-pentest"]:
            return Result(1, reason="authorization gate differs from inspected baseline")
    except (OSError, ValueError, KeyError):
        return Result(1, reason="authorization gate baseline unavailable")
    # Explicit denial exercises cancellation before any engagement/scan starts.
    p = run([path], input_text="audit-denial\nhttps://example.invalid\n/nonexistent\nNO\n")
    return Result(0) if p.code == 1 and "Authorization not confirmed. Scan cancelled." in p.text else Result(1)


def services():
    states = {key: unit(name) for key, name in
              {"ssh": "ssh", "tailscale": "tailscaled", "docker": "docker", "bluetooth": "bluetooth"}.items()}
    states["touch"] = touch_state()
    states["command_center"] = unit("wise2-command-center", user=True)
    return states


def read_registry():
    try:
        d = json.loads((ROOT / "devices/registry.json").read_text())
        if d.get("schema_version") != 1 or not isinstance(d.get("devices"), list):
            raise ValueError
        ids = set()
        for dev in d["devices"]:
            if not isinstance(dev, dict) or not isinstance(dev.get("id"), str) or dev["id"] in ids:
                raise ValueError
            ids.add(dev["id"])
            if dev.get("registration") not in {"REGISTERED", "NOT CONFIGURED"}:
                raise ValueError
            if not all(isinstance(dev.get(k), str) for k in ("hostname", "display_name", "role", "os")):
                raise ValueError
        return d
    except (OSError, ValueError, AttributeError, TypeError):
        return None


def devices(mesh=None, svc=None):
    registry = read_registry()
    if registry is None:
        return {"state": "ERROR", "devices": []}
    mesh = tailscale() if mesh is None else mesh
    svc = services() if svc is None else svc
    observed_at = now()
    result = []
    for dev in registry["devices"]:
        # Only approved display metadata crosses into the API, never arbitrary fields.
        row = {key: dev.get(key) for key in ("id", "hostname", "display_name", "role", "os", "architecture", "registration", "capabilities")}
        row.update(online_state="UNKNOWN", last_seen=None, agent_version=None,
                   cpu=None, ram_gib=None, storage=None, services=None, tailscale_ip=None,
                   telemetry_source="NOT CONFIGURED")
        if dev.get("local") is True and dev.get("hostname", "").lower() == socket.gethostname().lower():
            row.update(online_state="ONLINE", last_seen=observed_at, agent_version=VERSION,
                       cpu=cpu(), ram_gib=memory().get("total_gib"), storage=disk(), services=svc,
                       tailscale_ip=mesh.get("ip"), telemetry_source="local read-only probes")
        elif dev.get("registration") == "REGISTERED":
            # Peer online state is mesh evidence only, not agent/service health.
            peer_id = dev.get("tailscale_node_id")
            peer = next((p for p in mesh.get("peers", {}).values()
                         if peer_id and p.get("ID") == peer_id), None)
            if peer:
                row.update(online_state="ONLINE" if peer.get("Online") is True else "OFFLINE",
                           last_seen=peer.get("LastSeen"), telemetry_source="Tailscale peer presence only")
        else:
            row["online_state"] = "NOT CONFIGURED"
        result.append(row)
    return {"state": "IMPLEMENTED", "observed_at": observed_at, "devices": result}


def projects():
    base = ROOT / "projects"
    if not base.is_dir():
        return {"state": "NOT CONFIGURED", "names": []}
    return {"state": "IMPLEMENTED", "names": sorted(p.name for p in base.iterdir() if p.is_dir() and not p.is_symlink())}


def status():
    from core.hermes import probe
    from core.backup import inventory, audit_events, latest_verification
    svc = services()
    mesh = tailscale()
    return {"observed_at": now(), "host": socket.gethostname(), "kernel": os.uname().release,
            "os": os_release().get("PRETTY_NAME", "UNKNOWN"), "cpu": cpu(), "mem": memory(),
            "disk": disk(), "battery": battery(), "uptime": run(["uptime", "-p"]).text or "UNKNOWN",
            "services": svc, "agents": {name: tool(name) for name in ("claude", "codex")},
            "shannon": shannon(), "hermes": probe(ROOT), "mesh": {k: mesh[k] for k in ("state", "ip")},
            "registry": devices(mesh, svc), "projects": projects(), "backups": inventory(ROOT),
            "backup_health": latest_verification(ROOT),
            "logs": audit_events(ROOT),
            "deployments": {"state": "NOT CONFIGURED"},
            "support": {"state": "NOT CONFIGURED", "consent_required": True},
            "settings": {"cli_version": VERSION, "read_only_api": True, "bind": "127.0.0.1:3010"}}


def doctor():
    from core.hermes import probe
    from core.backup import latest_verification
    checks = []

    def add(label, state, detail=""):
        checks.append({"label": label, "state": state, "detail": detail})

    def functional(label, p):
        add(label, "PASS" if p.ok else "WARN" if p.code is None else "FAIL", p.reason)

    def state_check(label, state):
        add(label, "PASS" if state == "ONLINE" else "WARN" if state == "UNKNOWN" else "FAIL",
            "observation unavailable" if state == "UNKNOWN" else "")

    release = os_release()
    add("Ubuntu 24.04 LTS identity", "PASS" if release.get("ID") == "ubuntu" and release.get("VERSION_ID") == "24.04" else "FAIL")
    identity = os_release(Path("/etc/wise2-release"))
    add("WISE² release identity", "PASS" if identity.get("NAME") == "WISE² Linux" else "FAIL")
    add("Surface kernel", "PASS" if "surface" in os.uname().release else "WARN", os.uname().release)
    du = disk()
    add("Root disk free space (>=5 GB and <90% used)", "PASS" if du.get("free_gb", 0) >= 5 and du.get("used_pct", 100) < 90 else "FAIL")
    mem = memory()
    add("Memory sanity (>=1 GiB total; >=0.25 GiB available)", "PASS" if mem.get("total_gib", 0) >= 1 and mem.get("avail_gib", 0) >= .25 else "WARN")
    routes = run(["ip", "route", "show", "default"])
    if routes.ok and not routes.text:
        routes = run(["ip", "-6", "route", "show", "default"])
    functional("Network default route", routes if not routes.ok or routes.text else Result(1))
    # Local resolver query only, no HTTP request to an external system.
    dns = run(["getent", "ahosts", "github.com"], timeout=5)
    functional("DNS resolution (github.com)", dns)
    svc = services()
    for key in ("ssh", "tailscale", "docker", "touch", "command_center"):
        state_check(f"Service: {key}", svc[key])
    mesh = tailscale()
    state_check("Tailscale backend Running", mesh["state"])
    functional("Docker daemon and user access", run(["docker", "info", "--format", "{{.ServerVersion}}"] ))
    functional("Docker Compose", run(["docker", "compose", "version"]))
    for name in ("node", "npm", "python3", "git", "gh", "claude", "codex", "jq", "rg", "tmux"):
        functional(f"Tool executes: {name}", run([name, "-V" if name == "tmux" else "--version"]))
    functional("Python pip", run(["python3", "-m", "pip", "--version"]))
    for key in ("user.name", "user.email"):
        p = run(["git", "-C", str(ROOT), "config", "--get", key])
        functional(f"Git {key} configured", p if not p.ok or p.text else Result(1))
    required = ("context/WISE2.md", "scripts/wise2", "command-center/server.py", "core/runtime.py")
    add("WISE² workspace readable", "PASS" if all((ROOT / f).is_file() and os.access(ROOT / f, os.R_OK) for f in required) else "FAIL")
    sockets = socket_inventory()
    if sockets is None:
        add("Command Center loopback listener 3010", "WARN", "socket inventory unavailable")
        add("TCP exposure inventory", "WARN", "socket inventory unavailable")
    else:
        cc = [addr for addr, port in sockets if port == 3010]
        add("Command Center loopback listener 3010", "PASS" if cc and all(a in {"127.0.0.1", "::1"} for a in cc) else "FAIL")
        def loopback(address):
            try:
                return ipaddress.ip_address(address.split('%')[0]).is_loopback
            except ValueError:
                return False
        exposed = [(a, p) for a, p in sockets if not loopback(a) and p != 22]
        add("TCP exposure inventory (SSH excepted)", "WARN" if exposed else "PASS",
            "non-loopback listeners require review" if exposed else "")
    state_check("Command Center health HTTP 200", cc_http())
    state_check("Command Center dashboard HTTP 200", cc_http(page=True))
    sh = shannon()
    add("Shannon launcher installed", "PASS" if sh["launcher"] else "FAIL")
    add("Shannon package cached locally", "PASS" if sh["cached_version"] else "WARN", "no network install attempted")
    functional("Pentest gate cancels explicit denial", gate_check())
    add("Security workspace directories", "PASS" if all((ROOT / "security" / p).is_dir() for p in
        ("engagements", "targets", "configs", "reports", "evidence", "logs")) else "FAIL")
    add("Device registry validates", "PASS" if read_registry() is not None else "FAIL")
    h = probe(ROOT)
    if h["state"] == "NOT CONFIGURED":
        add("Hermes", "INFO", "NOT CONFIGURED — existing production connection pending")
    else:
        add("Hermes connectivity/auth/memory", "PASS" if h["ready"] else "FAIL", h["state"])
    b = latest_verification(ROOT)
    add("Latest backup integrity", b["state"], b["detail"])
    counts = {k: sum(c["state"] == k for c in checks) for k in ("PASS", "WARN", "FAIL")}
    return {"observed_at": now(), "checks": checks, "counts": counts,
            "exit_code": 1 if counts["FAIL"] else 2 if counts["WARN"] else 0}
