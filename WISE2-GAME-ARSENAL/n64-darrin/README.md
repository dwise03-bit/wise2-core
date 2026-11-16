# N64 Arcade integration — Darrin

Part of WISE² Game Studio's GAME ARSENAL.

## Source of truth
[Hardware setup and pull instructions](https://github.com/dwise03-bit/Wise2-hardware/blob/main/arcade/n64-darrin/README.md).

## Experience
Two selectable game tiles: Kirby 64: The Crystal Shards and The Legend of Zelda: Ocarina of Time. Controller-friendly navigation, animated focus states, game info, launch/exit. Original/licensed artwork only.

## Integration boundary
The Game Studio page at `apps/website/app/game-studio/page.tsx` currently links to `WISE2-GAME-ARSENAL`. This directory provides a discoverable handoff entry, not a finished frontend launcher. A game launcher should be added only after target hardware, emulator command, controller mappings and authorized local game files are verified.

## Checklist
1. Darrin pulls `Wise2-hardware` and `wise2-core`.
2. Confirm Pi 3B+ versus Linux PC with GTX 1070.
3. Install/test RetroPie or RetroArch and controller mappings.
4. Use locally authorized game dumps; do not commit ROMs.
5. Implement launcher in Game Studio and test end-to-end.

No copyrighted ROMs, credentials or unverified execution scripts included.
