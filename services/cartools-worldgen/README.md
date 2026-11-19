# WISE² CARTOOLS — self-hosted world generation

Status: **scaffold only; no model installed and no benchmark run**.

## Goals
- Keep this service separate from the Next.js Game Studio and existing Ollama service.
- No paid APIs, hosted inference, telemetry, or automatic model downloads.
- Preserve existing prototypes and production routes.
- Evaluate WorldGen before selecting any runtime or deploying.

## Candidate pin
- Upstream: https://github.com/ZiYang-xie/WorldGen
- Inspected upstream main commit: `7ce7b2767fdf31e2727b69a2e61e2e950e3a017f`
- Project license reported by GitHub: Apache-2.0.
- Model/dependency licenses must be audited independently. The upstream README references the LeoXie/WorldGen Hugging Face model and its pipeline dependencies; Apache-2.0 for source does not relicense model weights or dependencies.
- Do not clone or install the model until hardware, storage, CUDA/PyTorch compatibility, and all model terms have been checked.

## Current server baseline (historical handoff, not live telemetry)
WISE² server was documented with 2 × GTX 1060 6GB, Ollama on loopback, and 8GB host RAM. Two 6GB GPUs do not equal a single 12GB device-memory pool. SynCity's documented 48GB GPU requirement excludes this host. WorldGen is an experiment, not yet proven compatible.

## Safe evaluation sequence
1. Run `python3 scripts/preflight.py --output preflight.json` on the target host.
2. Review GPU driver/CUDA, per-GPU free memory, RAM, disk, and existing Ollama process usage.
3. Read upstream installation instructions at the pinned commit; record exact Python, PyTorch, CUDA and model requirements.
4. Obtain model weights only after license review and explicit storage approval.
5. Run a single small text-to-scene benchmark with Ollama stopped only if the owner approves; never stop or modify it automatically.
6. Record wall time, peak VRAM per GPU, peak system RAM, disk growth, output format, and errors.
7. Test output import in a disposable Three.js scene. Do not replace the existing CARTOOLS prototype.
8. Only after a successful benchmark, implement a sandboxed worker and authenticated internal API.

## Security and deployment boundary
- This directory is not a running service.
- Do not expose a model runner or unauthenticated generation endpoint publicly.
- Bind future worker/API to loopback or private Tailscale interface; add auth, request limits, timeouts, job isolation, and output validation before any web integration.
- No automatic downloads, system package changes, systemd installation, GPU process termination, production deployment, or public route changes in this phase.

## Acceptance criteria
- [ ] Preflight report captured on actual WISE² host
- [ ] Model and dependency licenses reviewed
- [ ] Small generation completes within measured hardware limits
- [ ] Output can be imported into a disposable game scene
- [ ] Existing Ollama, Game Studio, and CARTOOLS prototype remain healthy
- [ ] Independent browser/mobile test and deployment approval

## Run
```bash
python3 scripts/preflight.py --output preflight.json
```
