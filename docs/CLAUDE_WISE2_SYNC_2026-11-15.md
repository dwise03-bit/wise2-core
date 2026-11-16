# WISE² Claude Operational Handoff — 2026-11-15

> This is a user-requested context synchronization, not proof of deployment. Reconcile against live Git, hosts, logs, DNS, and CI. Read root CLAUDE.md and WISE2_VISUAL_QUALITY_STANDARD.md first. Never overwrite newer verified work.

## Non-negotiable execution contract
Audit → fix → test → independently verify. Never claim live, fixed, migrated, or deployed from a command being issued or a build succeeding. Preserve data and Docker volumes. Use feature branch → PR → verified merge/deploy. No hard-coded credentials, keys, passwords, certificates, or private customer data in Git. Redact diagnostics. Avoid destructive cleanup and port reassignment. Respect existing client boundaries.

## Architecture and routing
WISE² is an AI-native business operating system. Route REQUEST → WISE COMMAND/HERMES → specialized agents (Claude engineering, ChatGPT, Gemini, DeepSeek/Ollama, etc.) → approval checkpoint for consequential actions → execution → verified results and Second Brain/Sauce Vault. Reuse existing PromptOS, API, auth, knowledge, Obsidian Second Brain, Paperclip NG, workflow engine, and provider adapters; do not create duplicate platforms. Main codebase: dwise03-bit/wise2-core. Related client trading repo dwise03-bit/every-day-trader-web is a separate client project, not WISE² Trading.

## Current infrastructure: verify before modifying
- New Ubuntu Server host `wise2` at previously reported LAN 192.168.1.181; 8GB RAM and two GTX 1060 6GB GPUs. DNS resolution and Tailscale installation previously blocked; desktop/browser login and GPU readiness require live checks. User wants low-friction authenticated admin access, not unsafe credential removal.
- Pocket Node is an edge/deployment coordinator; dual displays, 32GB USB installer and multi-server auto-provisioning requested. Audit boot devices and preserve existing data. Raspberry Pi 5 is available for diagnostics of nonbooting Pi 3B/3B+ images.
- MacBook Pro M4 is a development/access host; SSH/Tailscale are preferred for private infrastructure. Keep a tested backup access path.
- Prior VPS `gpu-nmls`/173.208.147.165 may still host apps; do not assume migration complete. Root ~234GB constrained; secondary `/sdb-disk` ~916GB. Check space, preserve named Docker volumes, and verify actual current host/service topology.
- Prior stack includes Nginx, Docker Compose, Next.js, NestJS, PostgreSQL, Redis, MongoDB, Ollama, Open WebUI, Hermes. Audit live ports, proxy and TLS before changes. Never remove a certificate without a verified replacement.
- Public endpoints include wise2.net, cloud.wise2.net and ai.wise2.net. DNS drift and SSL for blakkhail.com require verification; previously supplied public IP 24.47.139.214 is a requested retention target, not proof of current correct routing.

## Active engineering work
1. Unified WISE² command center: premium cinematic 3D interface, WISE² IMP mascot, interactive real states, functional menus, voice, mobile/desktop, and Hermes coordination. No crowns. Use approved references; verify visually at real screen sizes. Do not substitute generic AI-generated layouts.
2. WISE² Trading / Project Victory Lap: own wise2.net/trading, Hive-inspired interface, ES/MES Momentum X, Apex 50K EOD rules, mood/habit tracking, Second Brain, live market feeds. Tradovate/NinjaTrader connectivity and any broker execution must be explicitly authenticated, tested, and approval-gated. Never imply real orders are ready when not verified.
3. BIG BANK renamed PLOT AI in separate Everyday Trader client repo. Existing MNQ liquidity sweep + structure reversal paper backtest: 1m, $50 risk/trade, 2R target, $100 daily loss, max 3 entries/day, stop after 2 consecutive losses. Keep client production main and no broker execution.
4. Client site migration/audit: blakkhail.com, Aunt C.C., Uncle Chris Atlanta electrical company, Petals & Potions, /seven-eleven, /whips, Uncle Steve, BTE Rent A Car, Dan Welden, Magnolia Kitchen, Sebastian Dziura, CJays Auto Recon, Joan's House Studios and other existing clients. Determine actual code owner, host, route, assets, DNS, SSL, status, and verification evidence for each. Do not assert they are live from conversation requests.
5. New product tracks: Contractor OS and HVAC apprentice/journeyman/master virtual academy with XR and Android APK; Wise Defense XR/Meta Quest 3S training and apparel; Trade Gang Apparel; W2 Communications / Safe Secure Mobile distributor venture (separate from WISE² and Wise Defense business accounting); Motorola Razr Hermes folding 3D OS demo; WISE² Game Studio, Steam gaming and Pi arcade tooling.
6. Creative pipeline: 4K cinematic visual assets and video production with real approved references, original character identity, voice/audio synchronization, rendering QA. Explore GPU-backed local generation only after verifying drivers, VRAM, model availability, storage and actual render output.
7. WISE² hardware OS: repeatable non-destructive USB Linux installer, Pi boot diagnostics, dual-display Pocket Node, mobile and tablet integrations. Record supported hardware and verified builds.

## Latest user direction
Unify all WISE² nodes via authorized Tailscale/SSH and verified backup route; create useful public landing pages where requested; migrate old VPS workloads safely; audit visual fidelity against provided videos; repair rendering, DNS, SSL and browser/GPU failures; produce client-ready demos; complete implementation rather than stopping at plans.

## Immediate Claude workflow
1. Read `CLAUDE.md`, `AGENTS.md`, relevant docs and current git status; enumerate active branches/PRs.
2. Audit actual reachable hosts, authorized credentials (never print secrets), Tailscale, GPU, disk, Docker, DNS, TLS, deployment health and source-to-production routes.
3. Build a status matrix: project, repo/path, host, desired outcome, last verified state, blocker, owner, next safe action.
4. Prioritize access/recovery, data preservation, live site restoration, command center, then client/product features.
5. Execute on a feature branch with tests and visual QA. Log evidence and unverified items. Never modify unrelated client projects.
6. Keep `CLAUDE.md`, `CONTINUE.md`, `ROADMAP.md`, `ARCHITECTURE.md`, and session handoffs consistent after verification.

## Status caution
This document combines user requests, previously reported host facts, and repository context as of 2026-11-15. It is not a live system audit. The repository's older README and CLAUDE.md may contain outdated production-ready assertions. Validate before repeating them.
