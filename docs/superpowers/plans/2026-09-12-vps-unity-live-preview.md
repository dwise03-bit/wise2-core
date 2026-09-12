# VPS Unity Live Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the existing WISE² XR Unity project on the VPS and expose a private WebGL preview that opens live on Daniel's Mac while preserving the Quest Android build path.

**Architecture:** Keep `apps/wise2-xr` as the single Unity source. Add a Unity batch-mode WebGL builder plus VPS scripts and an nginx preview container bound to the VPS Tailscale interface. The Mac consumes the preview in a browser; Quest remains an Android/OpenXR target from the same project.

**Tech Stack:** Unity 6000.0.43f1, C#, WebGL, Bash, Docker Compose, nginx, Tailscale.

**Spec:** Existing approved WISE² XR architecture plus `apps/wise2-xr/README.md`.

## Global Constraints

- Preserve existing Quest/OpenXR functionality.
- Do not expose Unity Editor/Ollama/admin services publicly.
- Preview is Tailscale/private by default.
- Do not commit Unity credentials/license material.
- Use existing `XRCommandCenter.unity` scene for the first preview.
- Keep rollback to removal of the preview files/container only.

---

### Task 1: Add deterministic WebGL batch build
**Files:**
- Create: `apps/wise2-xr/Assets/Editor/BuildWebGL.cs`

- [ ] Add `Wise2.XR.Editor.BuildWebGL.PerformBuild` using `XRCommandCenter.unity`.
- [ ] Read `WISE2_XR_WEBGL_BUILD_DIR`, defaulting to `Build/WebGL`.
- [ ] Fail batch mode when Unity reports a failed build.

### Task 2: Add VPS build and preview scripts
**Files:**
- Create: `ops/unity-vps/build-webgl.sh`
- Create: `ops/unity-vps/serve-webgl.sh`
- Create: `ops/unity-vps/docker-compose.preview.yml`
- Create: `ops/unity-vps/nginx.conf`

- [ ] Detect the exact project Unity version from `ProjectVersion.txt`.
- [ ] Locate Unity Editor safely; fail with actionable installation guidance if missing.
- [ ] Run Unity headless with `-executeMethod Wise2.XR.Editor.BuildWebGL.PerformBuild`.
- [ ] Serve the completed build from nginx on a configurable private port, default `8097`.
- [ ] Bind the preview to the VPS Tailscale IP when supplied through `WISE2_PREVIEW_BIND`.

### Task 3: Add operator documentation
**Files:**
- Create: `ops/unity-vps/README.md`

- [ ] Document Unity 6000.0.43f1 + WebGL module requirement.
- [ ] Document build/start/stop/log commands.
- [ ] Document Mac URL `http://100.68.145.5:8097` as the current private preview target, subject to runtime verification.
- [ ] Document Quest builds as unchanged via `BuildQuest.PerformBuild`.

### Task 4: Verify before deployment
- [ ] Confirm branch diff only touches intended files.
- [ ] Run Unity WebGL batch build on VPS.
- [ ] Start preview container.
- [ ] Verify HTTP from VPS.
- [ ] Verify HTTP from Mac over Tailscale.
- [ ] Verify Quest builder still exists unchanged.
- [ ] Record any runtime blocker rather than claiming deployment.
