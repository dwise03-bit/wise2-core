"""Modular VENOM COLLECTOR adapter interface.

Approved open-source projects are integrated via thin, version-pinned adapters rather than
blindly merging upstream codebases. All upstream licenses and attributions are preserved.
"""
from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any


@dataclass(frozen=True)
class VenomAdapter:
    id: str
    name: str
    repo: str
    url: str
    license: str
    commit_sha: str
    role: str
    domains: list[str]
    integration_mode: str  # "comfyui_workflow", "comfyui_custom_node", "external_service"
    source_path: str
    license_notice: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
