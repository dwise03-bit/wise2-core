"""VENOM COLLECTOR — Audited open-source AI video repository registry and modular adapter hub."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "venom" / "catalog_ranked.json"
ADAPTERS_MANIFEST_PATH = ROOT / "venom" / "adapters_manifest.json"


def load_catalog() -> dict[str, Any]:
    if not CATALOG_PATH.is_file():
        return {"total": 0, "summary": {}, "projects": [], "domains": {}}
    return json.loads(CATALOG_PATH.read_text(encoding="utf-8-sig"))


def load_adapters() -> list[dict[str, Any]]:
    if not ADAPTERS_MANIFEST_PATH.is_file():
        return []
    return json.loads(ADAPTERS_MANIFEST_PATH.read_text(encoding="utf-8-sig"))


def query_catalog(
    domain: str | None = None,
    decision: str | None = None,
    search: str | None = None,
    limit: int = 50,
) -> dict[str, Any]:
    cat = load_catalog()
    projects = list(cat.get("projects") or [])
    if domain:
        projects = [p for p in projects if domain in (p.get("wise2_domains") or [])]
    if decision:
        projects = [p for p in projects if p.get("decision") == decision]
    if search:
        q = search.lower().strip()
        projects = [
            p for p in projects
            if q in (p.get("name") or "").lower()
            or q in (p.get("repo") or "").lower()
            or q in (p.get("summary") or "").lower()
        ]
    return {
        "total_catalog": cat.get("total", len(projects)),
        "filtered_count": len(projects),
        "summary": cat.get("summary") or {},
        "adapters": load_adapters(),
        "projects": projects[: max(1, min(limit, 200))],
    }
