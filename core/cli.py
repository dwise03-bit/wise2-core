#!/usr/bin/env python3
"""WISE² functional CLI. Mutations are narrow and explicit."""
from __future__ import annotations
import json
import os
import sys
import time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from core import backup, runtime
from core.hermes import probe

ROOT = runtime.ROOT


def emit(data):
    print(json.dumps(data, indent=2, ensure_ascii=False))


def event(action, outcome):
    try:
        backup.log_event(ROOT, action, outcome)
        return True
    except (OSError, ValueError):
        print("[ WARN ] Operation audit log unavailable", file=sys.stderr)
        return False


def restart_cc():
    print("ACTION: restart Command Center user service\nTARGET: wise2-command-center\n"
          "REASON: operator requested restart\nEXPECTED EFFECT: brief dashboard interruption\n"
          "ROLLBACK METHOD: preserved local stable tag; restart previous server after reviewed file rollback", flush=True)
    result = runtime.run(["systemctl", "--user", "restart", "wise2-command-center"], timeout=15)
    if not result.ok:
        event("command_center_restart", "FAIL")
        print("[ FAIL ] Restart unavailable or failed")
        return 1
    for _ in range(15):
        if runtime.unit("wise2-command-center", user=True) == "ONLINE" and runtime.cc_http() == "ONLINE":
            event("command_center_restart", "PASS")
            print("[ PASS ] Service active and health HTTP 200")
            return 0
        time.sleep(1)
    event("command_center_restart", "FAIL")
    print("[ FAIL ] Service did not become healthy within verification window")
    return 1


def journal_metadata():
    # No MESSAGE/command output: journals can contain secrets from other programs.
    p = runtime.run(["journalctl", "--user", "-u", "wise2-command-center", "-n", "30", "--no-pager", "-o", "json"])
    if not p.ok:
        print("[ WARN ] Service journal observation unavailable")
        return 2
    events = []
    for line in p.text.splitlines():
        try:
            row = json.loads(line)
            events.append({"timestamp_us": row.get("__REALTIME_TIMESTAMP"), "priority": row.get("PRIORITY"),
                           "unit": "wise2-command-center", "message": "withheld (raw journal may contain credentials)"})
        except (ValueError, AttributeError):
            continue
    emit(events)
    return 0


def main(argv):
    command = argv[0]
    args = argv[1:]
    if command == "doctor":
        if args not in ([], ["--json"]):
            return invalid()
        data = runtime.doctor()
        if args:
            emit(data)
        else:
            print(f"WISE² doctor 2.0 — {data['observed_at']}")
            for check in data["checks"]:
                suffix = f" — {check['detail']}" if check["detail"] else ""
                print(f"[ {check['state']} ] {check['label']}{suffix}")
            print("Summary: {PASS} PASS  {WARN} WARN  {FAIL} FAIL".format(**data["counts"]))
        logged = event("doctor", "FAIL" if data["exit_code"] == 1 else "WARN" if data["exit_code"] == 2 else "PASS")
        return data["exit_code"] or (0 if logged else 2)
    if command == "backup":
        operation = args[0] if args else "create"  # legacy wise2 backup compatibility
        if operation == "create" and len(args) <= 1:
            out = backup.create(ROOT)
            print(f"[ PASS ] Backup created and fully verified: {out}")
            return 0
        if operation == "list" and len(args) == 1:
            emit(backup.inventory(ROOT))
            return 0
        if operation == "verify" and len(args) <= 2:
            if len(args) == 2:
                name = args[1]
                if Path(name).name != name or not name.startswith("wise2-") or not name.endswith(".tar.gz"):
                    return invalid()
                path = ROOT / "backups" / name
            else:
                files = sorted((ROOT / "backups").glob("wise2-metadata-*.tar.gz"), reverse=True)
                if not files:
                    print("[ FAIL ] No manifest-format backup; create one first. Legacy archives are unverified.")
                    return 1
                path = files[0]
            result = backup.verify(path)
            event("backup_verify", "PASS" if result["valid"] else "FAIL")
            print(f"[ {'PASS' if result['valid'] else 'FAIL'} ] {result['detail']}")
            return 0 if result["valid"] else 1
        return invalid()
    if command in {"tailscale", "claude", "codex"} and not args:
        data = runtime.tailscale() if command == "tailscale" else runtime.tool(command)
        if command == "tailscale":
            data = {k: data[k] for k in ("state", "ip")}
        emit(data)
        return 0 if data["state"] == "ONLINE" else 2 if data["state"] == "UNKNOWN" else 1
    if command in {"command", "command-center"}:
        operation = args[0] if args else "status"
        if len(args) > 1:
            return invalid()
        if operation == "restart":
            return restart_cc()
        if operation == "logs":
            return journal_metadata()
        if operation == "status":
            data = {"service": runtime.unit("wise2-command-center", user=True), "http": runtime.cc_http()}
            emit(data)
            return 0 if all(s == "ONLINE" for s in data.values()) else 2 if "UNKNOWN" in data.values() else 1
        return invalid()
    if command == "hermes":
        if args not in ([], ["status"], ["status", "--json"]):
            return invalid()
        h = probe(ROOT)
        emit(h)
        return 0 if h["ready"] else 3 if h["state"] == "NOT CONFIGURED" else 1
    if command == "shannon":
        if args not in ([], ["status"]):
            return invalid()
        data = runtime.shannon()
        emit(data)
        return 0 if data["state"] == "INSTALLED" else 3
    if command in {"devices", "node"}:
        if args not in ([], ["status"], ["--json"]):
            return invalid()
        data = runtime.devices()
        if command == "node":
            data["devices"] = [d for d in data["devices"] if d["id"] == "wise2-surface"]
        emit(data)
        return 0 if data["state"] == "IMPLEMENTED" else 1
    if command == "projects" and not args:
        emit(runtime.projects())
        return 0 if (ROOT / "projects").is_dir() else 3
    if command == "services" and not args:
        data = runtime.services()
        emit(data)
        return 2 if "UNKNOWN" in data.values() else 1 if "OFFLINE" in data.values() else 0
    if command == "logs" and not args:
        emit({"events": backup.audit_events(ROOT), "service_logs": "wise2 command-center logs (metadata only)"})
        return 0
    if command == "status" and args in ([], ["--json"]):
        data = runtime.status()
        emit(data)
        values = data["services"].values()
        return 1 if "OFFLINE" in values else 2 if "UNKNOWN" in values else 0
    if command in {"update", "version"} and not args:
        if command == "update":
            print("[ INFO ] Version inventory only. No package installation, pull or deployment is configured.")
        emit({"wise2": runtime.VERSION, "tools": {name: runtime.tool(name, ["-V"] if name == "tmux" else None)
              for name in ("node", "npm", "python3", "git", "gh", "claude", "codex", "docker", "jq", "rg", "tmux")},
              "shannon": runtime.shannon()})
        return 0
    return invalid()


def invalid():
    print("[ FAIL ] Unsupported command or arguments; run wise2 help", file=sys.stderr)
    return 2


if __name__ == "__main__":
    try:
        sys.exit(main(sys.argv[1:]))
    except (OSError, ValueError) as error:
        # Sanitized diagnostics: exception strings can contain secret URLs or data.
        print(f"[ FAIL ] Operation could not complete ({type(error).__name__}); inspect local policy/config privately", file=sys.stderr)
        sys.exit(1)
