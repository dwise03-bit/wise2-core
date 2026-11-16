# WISE² Game Studio — Live Build Handoff (2026-11-16)

**Team:** Daniel, Darrin Wise Jr., Luis. Shared project with flexible responsibilities.

## Verified tonight
- Cinematic Game Studio redesign committed: `8ff63e26e4e4df180544e54359ba14fc4e157f77` (`apps/website/app/game-studio/page.tsx`). Production Next.js build/deploy not verified.
- Shared ownership handoff: `4c8ca173bf479140a295c8c039be9acf606cfc96`.
- Pocket Node (`wise2-pocketnode`, Tailscale `100.85.242.34`) hosts static preview on `:8765` (HTTP 200).
- WISE² server (`wise2`, Tailscale `100.109.230.122`) hosts gateway on `:8766`, proxying Pocket Node preview (HTTP 200) and `/api/status` for GPU inventory.
- WISE² server has two GTX 1060 6GB GPUs and Ollama on loopback `127.0.0.1:11434`.
- Installed DeepSeek `deepseek-r1:1.5b` generated a game idea successfully; GPU utilization observed at 91% on one card during a test.
- Local-only prototype game-idea API: `127.0.0.1:8767/api/game-idea` POST JSON `{"idea":"A neon maze"}`; health at `/health`. Tested successful inference. **Not externally exposed; not yet authenticated or wired into website.**

## Next build tasks
1. Bring GPU API into the repo and deploy as a managed systemd service; add authentication, rate limiting and structured errors before exposing via the web app.
2. Add Next.js server-side API route to call authenticated internal service, then build Game Studio idea-generation UI.
3. Integrate existing original playable prototype, run build/lint/tests and verify browser/mobile/4K display.
4. Connect Google TV once online, with Pocket Node as display and WISE² server as compute.
5. Test emulator/controller flows with authorized local game files only; no ROM distribution.
6. Independent end-to-end checks and public deployment decision.

## Access handoff
- Each collaborator shares GitHub username and **SSH public key only** through a verified channel. Never send private keys, tokens, or passwords.
- Repository access and server permissions are **not** automatically granted by this handoff. Verify identity and assign least privilege.
- Local preview URL (Tailscale only): http://100.85.242.34:8765/
- GPU gateway preview (Tailscale only): http://100.109.230.122:8766/

## Caveats
Current GPU API and gateway were created on the server and are not yet source-controlled as production services. Existing preview uses Python servers. GitHub documentation does not prove production deployment.
