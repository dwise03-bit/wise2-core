# WISE² × Phosphene adapter (staged)

Phosphene upstream: https://github.com/mrbizarro/phosphene

## Scope
- Mac M4 16 GB is the rendering host; Ubuntu wise2 is orchestration/storage only.
- Do not expose Phosphene's local HTTP API publicly. Use an authenticated private transport and explicit job allowlist.
- Do not install MiniMax H3 in the US (upstream licence restriction).
- Preserve existing Sound Labs, WiseVisions and Hermes services; no automatic production deployment.
- Models are downloaded only after disk-space and licensing checks.
- First acceptance test: a 3-5 second low-resolution LTX-2.5 clip, then ffprobe video/audio verification.

## Mac preflight
Run `bash integrations/phosphene/mac-preflight.sh` on the Mac. Review output before downloading Phosphene.
Use the official installer at https://phosphene.video/ or upstream documented Pinokio flow.
After installation inspect `docs/API.md` and `docs/AGENT_TOOLS.md` in the installed version, and configure a local-only API endpoint. Do not guess ports or submit jobs until confirmed.

## WISE² Commander integration contract (not yet implemented)
Input: {project_id, job_id, engine, prompt, reference_asset_ids, output_format}
Allowed engine initially: ltx-2.5. Reject arbitrary commands, URLs and filesystem paths.
Output: {job_id, state, local_artifact_path, sha256, ffprobe_summary, errors}
State transitions: queued -> running -> verified|failed.
Require unique job IDs, idempotency, bounded render time, log redaction, and explicit user approval for publishing.
Store final outputs under the existing approved WISE² asset pipeline only after validation.

## Verification gates
1. Mac hardware and free disk verified.
2. Phosphene version and model licence verified.
3. Local API/MCP availability verified.
4. One test render completed.
5. ffprobe detects expected streams, duration and dimensions.
6. SHA-256 recorded, asset imported and independently opened.
7. Only then allow a Queen Baby storyboard render; do not claim production live before checking it.
