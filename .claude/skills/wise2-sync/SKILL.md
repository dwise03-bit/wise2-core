---
name: wise2-sync
description: Synchronize WISE² project context safely between Mac and VPS using Git without overwriting local work or copying secrets.
---

Run `scripts/wise2-sync.sh --check` first. Use `--fetch` only when the user asks to refresh remote refs. Never reset, clean, force-push, or copy `.env`, signing files, credentials, or local model data.
