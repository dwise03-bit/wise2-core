# WISE² Agent Workflow — 2026-11-15 Update

## Verified live observations (2026-11-15 ET)
On physical host `wise2` through authorized Desktop Commander:
- Ubuntu 24.04.5 LTS, user `dwise`, Node 22.23.5, npm 10.9.9, Chromium `/snap/bin/chromium`.
- Root filesystem 108GB total, 77GB used, 27GB available at audit time.
- Two NVIDIA GeForce GTX 1060 6GB GPUs detected by `nvidia-smi`.
- Tailscale reports `wise2` address `100.109.230.122`. Connectivity to other nodes was not tested.
- `ollama` service reported inactive; do not route production model requests there until fixed and tested.
- Browser audit tool installed at `/home/dwise/wise2-browser-agent/audit.mjs` using `playwright-core` with existing Chromium. Successful HTTP 200 navigation to `https://youtu.be/y9YXhEEwAwc`, title `Apple's Local AI App for Mac Is Coming (Harbor)`, with JSON report and screenshot under `reports/`. Browser page inspection is working; transcript extraction, model integration, daemonization, authentication and API are NOT verified.

## Workflow state machine
1. **Intake**: WISE² Command Center/Hermes receives goal, constraints, target host, approved assets, and risk classification.
2. **Discover**: Browser agent collects public page content, screenshots, console errors, timestamps, and source URLs. For video, distinguish webpage metadata from actual transcript and frame/audio analysis.
3. **Plan**: Executive/Claude uses existing PromptOS agents to map evidence to work items. Retrieve repo and Second Brain context. Prefer existing components.
4. **Route**: Send coding to Claude, local inference to a *healthy* Ollama/DeepSeek-compatible endpoint, browsing to Playwright, deployment to authorized host tooling. Route to Mac M4 only after checking actual service availability and resource limits.
5. **Implement**: Use scoped feature branches, minimal edits, least-privilege credentials, explicit approvals for external or destructive actions.
6. **Verify**: Unit/integration tests, real browser render and mobile screenshot, GPU/runtime metrics, DNS/TLS and external HTTP probes. Distinguish requested, running, blocked, and verified.
7. **Release**: Stage, backup, deploy, smoke test, rollback on failure. Do not auto-deploy merely because a model generated code.
8. **Record**: Store artifact paths, source URLs, branch/commit, test results, server metrics, owner and next action in existing Second Brain/status systems. Never store passwords, API tokens or private keys.

## Browser agent operational contract
Manual invocation (existing verified tool):
```bash
cd /home/dwise/wise2-browser-agent
node audit.mjs 'https://youtu.be/y9YXhEEwAwc'
```
Outputs timestamped JSON and PNG files to `reports/`. Current tool accepts a URL; do not expose it as an unauthenticated public endpoint or allow untrusted callers to browse internal/private addresses. Before adding a service API implement URL allowlisting/SSRF protection, auth, rate limiting, isolated browser contexts, output quotas and log retention.

## Harbor video takeaway
The video is titled `Apple's Local AI App for Mac Is Coming (Harbor)`; browser metadata describes private local inference on Macs and potential multiuser contention. This is a research lead, NOT proof Harbor is an Apple shipping product or that it works on Ubuntu. WISE² should evaluate Mac M4 local inference + Ubuntu GPU workers using measured latency, concurrency, memory and quality before deciding routing. Avoid installing Harbor on Ubuntu based only on video metadata.

## Immediate priorities
- P0: verify and restore Ollama service without replacing existing models or data; check available RAM/disk, GPU driver compatibility and service ownership.
- P0: validate Tailscale paths, SSH, authentication and fallback access to physical server and Mac.
- P1: harden browser audit tool and connect it to Hermes via an authenticated internal adapter, not an exposed public port.
- P1: implement repeatable website audit reports (desktop/mobile, JS errors, screenshot comparison) and source-linked video transcript workflow where accessible.
- P1: update WISE² project matrix and Claude handoff with this evidence; audit DNS/TLS and migration dependencies.
- P2: benchmark multi-node local model serving; schedule GPU workloads, preserving memory for existing services.

## Guardrails
No changes to live production, client sites, firewall or credentials without authorization and rollback. Never claim the entire pipeline is live based on a single browser test. Keep WISE² Trading separate from Everyday Trader client work.
