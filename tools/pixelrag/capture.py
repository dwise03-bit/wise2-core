"""WISE² visual website capture wrapper around PixelRAG's pixelshot.

Use only publicly accessible pages you are authorized to inspect.
"""
import argparse
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit


def main():
    p = argparse.ArgumentParser(description="Capture website visuals for WISE² audits")
    p.add_argument("url", help="Public http(s) page URL")
    p.add_argument("--output-root", default="artifacts/pixelrag")
    args = p.parse_args()
    parsed = urlsplit(args.url)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname or parsed.username or parsed.password:
        p.error("Provide a public http(s) URL without embedded credentials")
    # Do not accept arbitrary internal hosts in an unattended audit.
    host = parsed.hostname.lower().rstrip(".")
    if host in {"localhost", "localhost.localdomain"} or host.endswith((".local", ".internal")):
        p.error("Local/internal hosts are not permitted")
    import ipaddress
    try:
        address = ipaddress.ip_address(host)
    except ValueError:
        pass
    else:
        if not address.is_global:
            p.error("Private/reserved IP addresses are not permitted")
    out = Path(args.output_root) / (host.replace(":", "_")) / datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    out.mkdir(parents=True, exist_ok=True)
    subprocess.run(["pixelshot", args.url, "--output", str(out / "tiles")], check=True, timeout=180)
    meta = {"url": args.url, "captured_at_utc": datetime.now(timezone.utc).isoformat(), "tiles_dir": "tiles", "status": "captured"}
    (out / "manifest.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    print(json.dumps({"output": str(out), **meta}, indent=2))


if __name__ == "__main__":
    main()
