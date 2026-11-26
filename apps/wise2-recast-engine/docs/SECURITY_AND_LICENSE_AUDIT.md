# Security, Source Repository & License Audit

**Audit Date:** 2026-11-25  
**Target Workstation:** Lenovo ThinkPad X1 (`21HRS17B00`), Intel Core i7-1365U, 15.67 GB RAM, Intel Iris Xe Graphics (No NVIDIA CUDA), Windows 11, ~5.7 GB free disk on `C:`.

## 1. Upstream Source Inventory (Pinned Commits)

| Repository | Commit SHA | License | Audit Status | Integration Boundary |
|---|---|---|---|---|
| `D3voz/openjutsu` | `7fe118bb5a61fcfac0148e1bfea3dd29884dbf26` | MIT | **PASS** (131/131 tests; Next.js patched `16.4.2` → `16.4.6`) | Workflows, relight assets & standalone proxy |
| `Comfy-Org/ComfyUI` | `a2103ae69d98d8ef94c150f5a472b89775eed929` | GPL-3.0 | **PASS (Isolated)** | Out-of-process HTTP REST API only |
| `jutsuhq/open-source-higgsfield` | `8e30048b715bb59349a18697a6abf8767cd501e0` | CC0-1.0 | **PASS** | VENOM Collector 117-repo dataset |
| `nomadoor/ComfyUI-Panorama-Stickers` | Pinned in `venom/adapters_manifest.json` | MIT | **PASS** | Modular ComfyUI node adapter |
| `AInVFX/ainvfx-paintaplate` | Pinned in `venom/adapters_manifest.json` | Apache-2.0 | **PASS** | Modular ComfyUI node adapter |
| `VisualFrisson/ComfyUI-OneShotMV` | Pinned in `venom/adapters_manifest.json` | MIT | **PASS** | Modular ComfyUI workflow adapter |
| `fixed-42/comfyui-sameface` | Pinned in `venom/adapters_manifest.json` | Apache-2.0 | **PASS** | Commercial-safe facial consistency adapter |
| `jhoard/open-ads-studio` | Pinned in `venom/adapters_manifest.json` | Apache-2.0 | **PASS** | Commercial & product ad adapter |
| `jdnichollsc/seam` | Pinned in `venom/adapters_manifest.json` | MIT | **PASS** | AI video transition adapter |

## 2. Security Audit Findings & Remediations

1. **Vulnerability Caught & Remediated (`D3voz/openjutsu` Next.js 16.4.2):**
   - `npm audit` and Next.js build guard flagged 7 moderate security advisories affecting `next@16.0.0–16.4.4` (`GHSA-mfr8-8qww-v76h`, `GHSA-vc7v-qv4w-wrv8`, `GHSA-7qx7-33qx-rqx2`, `GHSA-f3mh-rxg3-f5g2`, `GHSA-pc58-hwjq-p385`, `GHSA-rhh4-g77r-r9qj`, `GHSA-vvgp-ww4w-46vf`).
   - **Action taken:** Upgraded to `next@16.4.6` via `npm audit fix`. Verified `0 vulnerabilities`, `131/131` tests passing, clean production build.
2. **Untrusted Install Script Review:**
   - Audited `start_openjutsu.bat`, `patch_proxy.py`, `lib/http.ts`, `lib/comfy.ts`, and `lib/setup.ts` before execution. Zero `eval()`, zero `child_process`, zero hidden telemetry or exfiltration.
3. **Upload & Network Hardening (WISE² RECAST ENGINE):**
   - Magic-byte verification enforced on all video (`ftyp`, EBML, `RIFF/AVI`) and image (`PNG`, `JPEG`, `WebP`) uploads.
   - Path-traversal & Windows reserved device name (`CON/PRN/AUX/NUL/COM*/LPT*`) sanitization enforced.
   - Non-loopback access blocked unless `WISE2_ACCESS_PASSWORD` (>= 12 chars) is set; brute-force exponential backoff (5 free tries, 1s–300s) active.
   - Paid cloud billing (RunPod) hard-blocked by default (`WISE2_ALLOW_PAID_BACKENDS=false`).

## 3. Critical License Compliance Notes

- **ComfyUI (`GPL-3.0`)**: Never statically imported or linked into WISE² code; invoked strictly over HTTP REST API.
- **OpenJutsu Fix Faces (`workflows/face.api.json`)**: Depends on **InsightFace `buffalo_l` (Non-Commercial Research Only)** and **Ultralytics YOLO (`AGPL-3.0`)**. WISE² RECAST ENGINE gates Fix Faces behind an explicit non-commercial acknowledgment (`accept_noncommercial_face_license=true`) and provides `fixed-42/comfyui-sameface` (`Apache-2.0`) in VENOM Collector as a permissive research track.
- **Quarantined VENOM Repositories**: All `AGPL-3.0`, unlicensed, and cloud-API-locked repositories (`Open-Generative-AI`, `open-higgsfield`, `HeliosGen`, `h3-motion`, `reshoot-4d`, `ComfyUI-SpEdE`) are quarantined from direct code integration.
- All upstream license files for acquired adapters are preserved verbatim in `venom/LICENSES/`.
