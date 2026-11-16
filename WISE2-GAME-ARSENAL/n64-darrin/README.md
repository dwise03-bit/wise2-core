# WISE² Gaming Arsenal — Daniel + Darrin Wise Jr.

**Shared project ownership:** Daniel and Darrin Wise Jr. This is the joint WISE² Game Studio, not a Darrin-only product. Darrin's N64 setup is one workstream within the shared Gaming Arsenal.

## Workstreams
- **Shared cinematic Game Studio:** `apps/website/app/game-studio/page.tsx` — 4K-oriented responsive design, original game prototypes, AI NPCs, cinematics, and deployment testing.
- **Retro arcade:** Kirby 64: The Crystal Shards and Zelda: Ocarina of Time, emulator and controller integration. Hardware-specific handoff: https://github.com/dwise03-bit/Wise2-hardware/blob/main/arcade/n64-darrin/README.md
- **Original AI games:** Godot/Unreal/Blender/Hermes workflows, original or licensed assets only.

## Pull both repositories
```bash
git clone https://github.com/dwise03-bit/wise2-core.git
git clone https://github.com/dwise03-bit/Wise2-hardware.git
```
For existing checkouts, `git pull origin main` on clean main branches after preserving local changes.

## Acceptance checks
- [ ] Both owners confirm access and target hardware
- [ ] Build and test Game Studio frontend
- [ ] Verify playable prototype and Gaming Hub integration
- [ ] Validate 4K desktop and mobile responsive rendering
- [ ] Install and benchmark N64 emulator with authorized local game files
- [ ] Test controller navigation, launch, exit, and recovery
- [ ] Verify production deployment independently

No ROMs, passwords, or private keys are stored here. A GitHub commit is not evidence of deployment.