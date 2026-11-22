#!/usr/bin/env python3
"""Fail-closed visual asset gate for WISE² campaigns."""
import json, re, sys
from pathlib import Path
from html.parser import HTMLParser

class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.images=[]; self.links=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag in ("img","source","video","picture"):
            if tag=="img": self.images.append(a)
            if tag=="source" and a.get("srcset"): self.links.extend(re.findall(r"([^,\\s]+)(?:\\s+\\d+[wx])?",a["srcset"]))
            for k in ("src","poster"):
                if a.get(k): self.links.append(a[k])
        if tag=="link" and a.get("rel") in ("stylesheet","preload") and a.get("href"): self.links.append(a["href"])

def run(root):
    manifest=root/"visual-qa.json"
    if not manifest.is_file(): raise ValueError("Missing visual-qa.json; no visual approval possible")
    cfg=json.loads(manifest.read_text())
    required=("page","required_assets","required_sections","minimum_images")
    for key in required:
        if key not in cfg: raise ValueError(f"Manifest missing {key}")
    page=(root/cfg["page"]).resolve()
    if not page.is_relative_to(root.resolve()) or not page.is_file(): raise ValueError("HTML page missing or outside campaign")
    html=page.read_text()
    p=Page();p.feed(html)
    if len(p.images)<cfg["minimum_images"]: raise ValueError(f"Only {len(p.images)} image elements; need {cfg['minimum_images']}")
    for name in cfg["required_sections"]:
        if f'id="{name}"' not in html and f"id='{name}'" not in html: raise ValueError(f"Missing section: {name}")
    forbidden=cfg.get("forbidden_markers",["placeholder","coming-soon.jpg","example.com","data:image/svg+xml","CSS silhouette"])
    for token in forbidden:
        if token.lower() in html.lower(): raise ValueError(f"Placeholder marker present: {token}")
    for rel in cfg["required_assets"]:
        asset=(root/rel).resolve()
        if not asset.is_relative_to(root.resolve()) or not asset.is_file() or asset.stat().st_size<4096:
            raise ValueError(f"Required asset missing/too small: {rel}")
    for img in p.images:
        src=img.get("src","")
        if not img.get("alt"): raise ValueError(f"Image missing meaningful alt: {src}")
        if not src or src.startswith(("http:","https:","data:")): raise ValueError(f"Nonlocal/unverified image source: {src}")
        asset=(page.parent/src.lstrip("/")).resolve() if not src.startswith("/") else (root/src.lstrip("/")).resolve()
        if not asset.is_relative_to(root.resolve()) or not asset.is_file() or asset.stat().st_size<4096:
            raise ValueError(f"Broken or undersized image: {src}")
    for src in p.links:
        if src.startswith(("http:","https:","data:")): raise ValueError(f"Unverified external visual dependency: {src}")
        path=(root/src.lstrip("/")).resolve() if src.startswith("/") else (page.parent/src).resolve()
        if not path.is_relative_to(root.resolve()) or not path.is_file(): raise ValueError(f"Broken visual dependency: {src}")
    if not cfg.get("approved_reference_id") or not cfg.get("reviewer"):
        raise ValueError("Missing documented visual reference approval/reviewer")
    print("PASS: asset presence and markup preflight; screenshot comparison remains required")

if __name__=="__main__":
    try: run(Path(sys.argv[1]).resolve())
    except (ValueError, OSError, KeyError, json.JSONDecodeError) as e:
        print(f"::error::VISUAL QA BLOCKED: {e}",file=sys.stderr);sys.exit(1)
