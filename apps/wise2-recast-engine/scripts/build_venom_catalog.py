"""Build ranked VENOM COLLECTOR audit catalog from jutsuhq/open-source-higgsfield (117 projects)."""
from __future__ import annotations

import json
import math
from collections import Counter
from pathlib import Path

UPSTREAM_CATALOG = Path(r"C:\WISE2\openjutsu-recast-engine\upstream\open-source-higgsfield\data\projects.json")
OUT_JSON = Path(r"C:\WISE2\openjutsu-recast-engine\wise2-recast-engine\venom\catalog_ranked.json")
OUT_MD = Path(r"C:\WISE2\openjutsu-recast-engine\wise2-recast-engine\docs\VENOM_COLLECTOR_AUDIT.md")

ACQUIRED_REPOS = {
    "D3voz/openjutsu",
    "nomadoor/ComfyUI-Panorama-Stickers",
    "AInVFX/ainvfx-paintaplate",
    "VisualFrisson/ComfyUI-OneShotMV",
    "fixed-42/comfyui-sameface",
    "jhoard/open-ads-studio",
    "jdnichollsc/seam",
}

CLOUD_LOCKED_KEYWORDS = ("muapi.ai", "kie.ai", "beatapi", "platform api key", "hosted demo")

CATEGORY_DOMAIN_MAP = {
    "character-swap": ["character_consistency", "motion_capture", "ai_video_generation"],
    "characters": ["character_consistency"],
    "ads": ["commercial_production", "product_visualization"],
    "camera": ["cinematography", "motion_capture"],
    "effects": ["visual_effects", "animation"],
    "film": ["ai_video_generation", "cinematography", "video_editing"],
    "studios": ["ai_video_generation", "video_editing"],
    "canvas": ["animation", "video_editing"],
    "beyond": ["ai_video_generation"],
}


def infer_domains(proj: dict) -> list[str]:
    domains = list(CATEGORY_DOMAIN_MAP.get(proj.get("category", ""), ["ai_video_generation"]))
    text = f"{proj.get('name', '')} {proj.get('summary', '')}".lower()
    if any(k in text for k in ("music video", "song", "lip-sync", "mv")):
        domains.append("music_videos")
    if any(k in text for k in ("product", "ad ", "ads ", "commercial", "ugc", "outfit")):
        domains.extend(["commercial_production", "product_visualization"])
    if any(k in text for k in ("vfx", "plate", "relight", "smoke", "particle", "transition")):
        domains.append("visual_effects")
    if any(k in text for k in ("motion", "pose", "mocap", "mannequin", "character swap")):
        domains.append("motion_capture")
    if any(k in text for k in ("face", "character", "actor", "cast")):
        domains.append("character_consistency")
    if any(k in text for k in ("camera", "360", "angle", "pan", "reshoot", "cinem")):
        domains.append("cinematography")
    if any(k in text for k in ("animat", "keyframe", "3d", "splat")):
        domains.append("animation")
    if any(k in text for k in ("timeline", "edit", "cut", "retake")):
        domains.append("video_editing")
    return sorted(set(domains))


def score_project(proj: dict) -> dict:
    repo = proj.get("repo", "")
    lic = (proj.get("license") or "").strip()
    summary = (proj.get("summary") or "").lower()
    stars = int(proj.get("stars") or 0)
    archived = bool(proj.get("archived"))
    cloud_locked = any(k in summary for k in CLOUD_LOCKED_KEYWORDS)
    has_comfy = "comfy" in summary or "comfyui" in repo.lower() or "h3" in summary or "openjutsu" in repo.lower()

    # 1. Functionality (0-25)
    func = 12 + min(10, int(round(math.log10(stars + 1) * 3.2)))
    if proj.get("prize"):
        func = min(25, func + 3)

    # 2. License compatibility (0-25)
    if lic in {"MIT", "Apache-2.0", "BSD-3-Clause", "BSD-2-Clause", "ISC", "CC0-1.0"}:
        lic_score = 25
    elif lic == "GPL-3.0":
        lic_score = 14
    elif lic == "AGPL-3.0":
        lic_score = 5
    else:
        lic_score = 0

    # 3. Security & sovereignty (0-20)
    if cloud_locked:
        sec_score = 4
    elif archived:
        sec_score = 8
    elif lic_score == 0:
        sec_score = 10
    else:
        sec_score = 19 if has_comfy else 16

    # 4. Hardware practicality (0-15)
    if any(k in summary for k in ("12 gb", "16 gb", "rtx 3060", "4060", "comfyui", "workflow")):
        hw_score = 14
    elif any(k in summary for k in ("4d", "gaussian splat")):
        hw_score = 9
    else:
        hw_score = 11

    # 5. Integration value (0-15)
    integ = 14 if has_comfy else 9
    if repo in ACQUIRED_REPOS:
        integ = 15

    total = func + lic_score + sec_score + hw_score + integ

    if repo in ACQUIRED_REPOS:
        decision = "ACQUIRED_ADAPTER"
    elif cloud_locked or lic in {"AGPL-3.0", ""} or archived:
        decision = "QUARANTINED"
    elif lic == "GPL-3.0":
        decision = "ISOLATED_GPL"
    else:
        decision = "APPROVED_CANDIDATE"

    reasons = []
    if cloud_locked:
        reasons.append("Depends on commercial/hosted third-party API")
    if not lic:
        reasons.append("Missing OSI license file")
    if lic == "AGPL-3.0":
        reasons.append("AGPL-3.0 network copyleft requires strict service isolation")
    if lic == "GPL-3.0":
        reasons.append("GPL-3.0 requires out-of-process HTTP/CLI invocation only")
    if archived:
        reasons.append("Upstream repository is archived")
    if not reasons:
        reasons.append("Permissive open-source license & ComfyUI/open-weights compatible")

    return {
        **proj,
        "wise2_domains": infer_domains(proj),
        "scores": {
            "functionality": func,
            "license": lic_score,
            "security": sec_score,
            "hardware": hw_score,
            "integration": integ,
        },
        "total_score": total,
        "decision": decision,
        "audit_note": "; ".join(reasons),
    }


def main():
    raw = json.loads(UPSTREAM_CATALOG.read_text(encoding="utf-8"))
    items = raw["projects"] if isinstance(raw, dict) else raw
    ranked = [score_project(p) for p in items]
    ranked.sort(key=lambda x: (-x["total_score"], -int(x.get("stars") or 0), x.get("repo", "")))
    for i, item in enumerate(ranked, 1):
        item["rank"] = i

    dec_counts = Counter(x["decision"] for x in ranked)
    lic_counts = Counter(x.get("license") or "Unlicensed" for x in ranked)
    dom_counts = Counter(d for x in ranked for d in x["wise2_domains"])

    catalog = {
        "source_repo": "https://github.com/jutsuhq/open-source-higgsfield",
        "source_license": "CC0-1.0",
        "total": len(ranked),
        "summary": {
            "acquired_adapters": dec_counts["ACQUIRED_ADAPTER"],
            "approved_candidates": dec_counts["APPROVED_CANDIDATE"],
            "isolated_gpl": dec_counts["ISOLATED_GPL"],
            "quarantined": dec_counts["QUARANTINED"],
            "licenses": dict(lic_counts),
            "domains": dict(dom_counts),
        },
        "projects": ranked,
    }
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(catalog, indent=2), encoding="utf-8")

    # Generate concise Markdown audit report
    lines = [
        "# VENOM COLLECTOR — Open-Source Higgsfield Ecosystem Audit",
        "",
        f"Audited **{len(ranked)}** upstream repositories from `jutsuhq/open-source-higgsfield` (CC0-1.0).",
        "",
        "## Governance Summary",
        "",
        f"- **Acquired & Wrapped via Modular Adapters (`ACQUIRED_ADAPTER`):** {dec_counts['ACQUIRED_ADAPTER']}",
        f"- **Permissive Approved Candidates (`APPROVED_CANDIDATE`):** {dec_counts['APPROVED_CANDIDATE']}",
        f"- **Out-of-Process Only (`ISOLATED_GPL`):** {dec_counts['ISOLATED_GPL']}",
        f"- **Quarantined — AGPL / Unlicensed / Cloud-Locked (`QUARANTINED`):** {dec_counts['QUARANTINED']}",
        "",
        "## Top 25 Ranked Repositories",
        "",
        "| Rank | Project | Stars | License | Score | Decision | Domains |",
        "|---:|---|---:|---|---:|---|---|",
    ]
    for p in ranked[:25]:
        lines.append(
            f"| {p['rank']} | [{p['name']}]({p['url']}) (`{p['repo']}`) | {p['stars']} | {p.get('license') or 'None'} | **{p['total_score']}/100** | `{p['decision']}` | {', '.join(p['wise2_domains'])} |"
        )
    lines.extend([
        "",
        "## Quarantined Notable Projects (Do Not Merge Directly)",
        "",
        "| Project | License | Reason |",
        "|---|---|---|",
    ])
    for p in [x for x in ranked if x["decision"] == "QUARANTINED"][:15]:
        lines.append(f"| `{p['repo']}` (★{p['stars']}) | {p.get('license') or 'None'} | {p['audit_note']} |")

    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {OUT_JSON} ({len(ranked)} items) and {OUT_MD}")


if __name__ == "__main__":
    main()
