"""Allowlisted, integrity-checked metadata snapshots. No automatic restore."""
from __future__ import annotations
import fcntl
import hashlib
import io
import json
import os
import re
import stat
import tarfile
import tempfile
import zlib
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath

# This is a source/metadata backup, not a disk image or secret escrow.
TREES = ("context", "docs", "scripts", "core", "command-center", "services", "devices", "recovery")
FILES = ("CLAUDE.md", ".gitignore", "security/README.md", "security/configs/command-center-adapter.md",
         "security/configs/launcher-baseline.json", "hermes/README.md", "hermes/HERMES-INTEGRATION.md",
         "hermes/DEVICE-CREDENTIAL.md", "hermes/HERMES-PRECHANGE-PLAN.md",
         "hermes/HERMES-PRODUCTION-CONNECTION-PENDING.md", "hermes/client/hermes-client.sh",
         "hermes/config/hermes.conf.example")
EXTENSIONS = {".md", ".py", ".sh", ".html", ".css", ".js", ".json", ".svg", ".service", ".template"}
FORBIDDEN = re.compile(r"(^\.|secret|credential|token|password|passphrase|cookie|auth\.json|\.env|\.key$|\.pem$|node_modules|__pycache__|\.git$)", re.I)
SECRET_MARKERS = re.compile(rb"-----BEGIN (?:[A-Z ]*PRIVATE KEY)-----|(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[A-Z0-9]{16}|sk-(?:proj-)?[A-Za-z0-9_-]{32,})")
MAX_FILE = 16 * 1024 * 1024
MAX_TOTAL = 256 * 1024 * 1024


def stamp():
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S.%fZ")


def allowed(name):
    path = PurePosixPath(name)
    if path.is_absolute() or ".." in path.parts:
        return False
    if name in FILES:
        return True
    if not path.parts or path.parts[0] not in TREES or len(path.parts) < 2:
        return False
    if any(FORBIDDEN.search(part) for part in path.parts):
        return False
    return path.suffix in EXTENSIONS or (path.parts[0] == "scripts" and path.suffix == "")


def sensitive_json(name, content):
    if not name.endswith('.json'):
        return False
    try:
        data = json.loads(content)
    except (ValueError, UnicodeError):
        return True  # malformed data is not silently accepted as safe metadata
    sensitive = {'password', 'passphrase', 'secret', 'jwt_secret', 'token', 'access_token',
                 'refresh_token', 'api_key', 'private_key', 'credentials', 'authorization', 'cookie'}
    def walk(value):
        if isinstance(value, dict):
            return any((str(k).lower().replace('-', '_') in sensitive and v not in (None, '', False, [], {}))
                       or walk(v) for k, v in value.items())
        return isinstance(value, list) and any(walk(v) for v in value)
    return walk(data)


def payloads(root):
    candidates = {root / name for name in FILES}
    for tree in TREES:
        base = root / tree
        if base.is_symlink():
            raise ValueError("backup source tree must not be a symlink")
        if base.exists():
            candidates.update(base.rglob("*"))
    total = 0
    for path in sorted(candidates):
        name = path.relative_to(root).as_posix()
        if not allowed(name) or not path.exists():
            continue
        if path.is_symlink() or any(p.is_symlink() for p in path.parents if p != root and root in p.parents):
            raise ValueError("backup refuses source symlinks")
        if not path.is_file():
            continue
        if path.stat().st_size > MAX_FILE:
            raise ValueError("backup source exceeds size policy")
        content = path.read_bytes()
        if len(content) > MAX_FILE:
            raise ValueError("backup source exceeds size policy")
        if SECRET_MARKERS.search(content) or sensitive_json(name, content):
            raise ValueError("backup refused a possible credential; review source privately")
        total += len(content)
        if total > MAX_TOTAL:
            raise ValueError("backup exceeds size policy")
        yield name, content, 0o755 if os.access(path, os.X_OK) else 0o644


def _add(tar, name, content, mode=0o600):
    info = tarfile.TarInfo(name)
    info.size, info.mode = len(content), mode
    info.mtime = int(datetime.now(timezone.utc).timestamp())
    tar.addfile(info, io.BytesIO(content))


def verify(path):
    """Read every payload, check allowlist/hash/size/type. Never extract."""
    try:
        if path.is_symlink() or not path.is_file():
            raise ValueError("not a regular archive")
        with tarfile.open(path, "r:gz") as tar:
            seen = set()
            manifest = None
            observed = {}
            total = 0
            for member in tar:
                if member.name in seen or not member.isfile() or member.size > MAX_FILE:
                    raise ValueError("invalid archive member")
                seen.add(member.name)
                total += member.size
                if total > MAX_TOTAL:
                    raise ValueError("archive exceeds size policy")
                if member.name != "WISE2-BACKUP-MANIFEST.json" and not allowed(member.name):
                    raise ValueError("archive member outside allowlist")
                stream = tar.extractfile(member)
                content = stream.read(MAX_FILE + 1)
                if len(content) != member.size or SECRET_MARKERS.search(content) or sensitive_json(member.name, content):
                    raise ValueError("invalid or sensitive payload")
                if member.name == "WISE2-BACKUP-MANIFEST.json":
                    manifest = json.loads(content)
                else:
                    observed[member.name] = {"sha256": hashlib.sha256(content).hexdigest(), "size": len(content)}
            if not isinstance(manifest, dict) or manifest.get("format") != 1 or not observed or manifest.get("files") != observed:
                raise ValueError("manifest or payload integrity mismatch")
        return {"valid": True, "files": len(observed), "detail": "all payload hashes verified"}
    except (OSError, tarfile.TarError, EOFError, ValueError, TypeError, AttributeError, zlib.error):
        return {"valid": False, "files": 0, "detail": "archive unreadable, legacy format or integrity/policy failure"}


def log_event(root, action, outcome):
    # Fixed enums only: never raw output, credentials, request bodies or arbitrary text.
    if action not in {"backup_create", "backup_verify", "doctor", "command_center_restart", "acceptance", "recovery_test"} or outcome not in {"PASS", "WARN", "FAIL"}:
        raise ValueError("unsupported audit event")
    directory = root / "logs"
    if directory.is_symlink():
        raise ValueError("audit directory must not be a symlink")
    directory.mkdir(mode=0o700, exist_ok=True)
    path = directory / "operations.jsonl"
    lock = directory / ".operations.lock"
    flags = os.O_CREAT | os.O_WRONLY | os.O_NOFOLLOW
    with os.fdopen(os.open(lock, flags, 0o600), "a") as handle:
        fcntl.flock(handle, fcntl.LOCK_EX)
        if path.is_symlink():
            raise ValueError("audit log must not be a symlink")
        if path.exists() and path.stat().st_size >= 1024 * 1024:
            for index in (3, 2, 1):
                old = directory / f"operations.jsonl.{index}"
                new = directory / f"operations.jsonl.{index + 1}"
                if index == 3:
                    old.unlink(missing_ok=True)
                elif old.exists():
                    old.rename(new)
            path.rename(directory / "operations.jsonl.1")
        with os.fdopen(os.open(path, flags | os.O_APPEND, 0o600), "a") as out:
            out.write(json.dumps({"time": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                                  "action": action, "outcome": outcome}) + "\n")


def audit_events(root):
    path = root / "logs/operations.jsonl"
    events = []
    try:
        if path.is_symlink():
            return events
        with path.open() as handle:
            for line in handle:
                try:
                    event = json.loads(line)
                    if event.get("action") in {"backup_create", "backup_verify", "doctor", "command_center_restart", "acceptance", "recovery_test"} and event.get("outcome") in {"PASS", "WARN", "FAIL"}:
                        events.append({k: event[k] for k in ("time", "action", "outcome")})
                        events = events[-30:]
                except (ValueError, KeyError, TypeError, AttributeError):
                    continue
    except OSError:
        pass
    return events


def create(root):
    directory = root / "backups"
    if directory.is_symlink():
        raise ValueError("backup directory must not be a symlink")
    directory.mkdir(mode=0o700, exist_ok=True)
    out = directory / f"wise2-metadata-{stamp()}.tar.gz"
    fd, temp_name = tempfile.mkstemp(prefix=".creating-", dir=directory)
    temp = Path(temp_name)
    os.close(fd)
    try:
        entries = {}
        with tarfile.open(temp, "w:gz") as tar:
            for name, content, mode in payloads(root):
                entries[name] = {"sha256": hashlib.sha256(content).hexdigest(), "size": len(content)}
                _add(tar, name, content, mode)
            if not entries:
                raise ValueError("backup source is empty")
            manifest = {"format": 1, "created_utc": stamp(), "kind": "non-secret source and metadata",
                        "files": entries, "excluded": ["credentials", "environment files", "Hermes runtime configuration",
                        "security evidence and engagements", "logs", "project source and databases", "Docker volumes and credentials",
                        "system and user configuration outside WISE2_ROOT"]}
            _add(tar, "WISE2-BACKUP-MANIFEST.json", json.dumps(manifest, sort_keys=True).encode())
        if not verify(temp)["valid"]:
            raise ValueError("new archive failed verification")
        with temp.open("rb") as handle:
            os.fsync(handle.fileno())
        temp.rename(out)
        directory_fd = os.open(directory, os.O_RDONLY | os.O_DIRECTORY)
        try:
            os.fsync(directory_fd)
        finally:
            os.close(directory_fd)
        log_event(root, "backup_create", "PASS")
        return out
    finally:
        temp.unlink(missing_ok=True)


def inventory(root):
    base = root / "backups"
    if base.is_symlink():
        return []
    return [{"name": p.name, "bytes": p.stat().st_size, "format": "manifest-v1" if p.name.startswith("wise2-metadata-") else "legacy-unverified"}
            for p in sorted(base.glob("wise2-*.tar.gz"), reverse=True) if p.is_file() and not p.is_symlink()]


def latest_verification(root):
    if (root / "backups").is_symlink():
        return {"state": "FAIL", "detail": "backup directory must not be a symlink"}
    files = sorted((root / "backups").glob("wise2-metadata-*.tar.gz"), reverse=True)
    if not files:
        return {"state": "WARN", "detail": "no verified-format backup yet; run wise2 backup create"}
    checked = verify(files[0])
    return {"state": "PASS" if checked["valid"] else "FAIL", "detail": checked["detail"]}
