# CODEX HANDOFF — WISE Imp Alpha 0.1

## Mission

Take this existing Tauri 2 prototype and make it a stable Windows desktop pet. Do not redesign the mascot. The glossy black/cyan WISE Imp in `/reference/locked_character_sheet.png` is locked.

## First action

Run the project before changing architecture:

```powershell
npm install
npm run desktop:dev
```

Fix any dependency or Tauri API drift using the currently installed Tauri 2 documentation and preserve the behavior.

## Product requirements

1. Transparent frameless pet window.
2. Always on top.
3. No taskbar button.
4. Pet can be dragged anywhere across multi-monitor Windows desktops.
5. Pet randomly flies using smooth arcs and never moves outside the usable display area.
6. Pet reacts on click, lands, sits, and sleeps.
7. Right-click menu supports Wake, Sleep, Center, and Quit.
8. App must not trap the user. Keep `Ctrl+Shift+Q` and add a tray icon with Show/Hide and Quit.
9. Save settings locally: scale, sound enabled, wander enabled, always-on-top enabled, and last position.
10. Build an NSIS installer for Windows.

## Priority fixes / enhancements

### P0
- Confirm the Rust commands compile on current Tauri 2.
- Confirm transparency on Windows 10 and 11.
- Add system tray Quit.
- Keep the window inside the current monitor work area, accounting for taskbar.
- Prevent overlapping movement timers and drag/click conflicts.
- Restore last saved position at startup.

### P1
- Add settings panel reached from the tray menu.
- Add size options: Small 180px, Medium 300px, Large 420px.
- Add mute toggle and placeholder sound hooks.
- Add Start with Windows toggle using an appropriate Tauri 2 plugin.
- Add pause-wandering toggle.

### P2
- Replace static pose swapping with real animations.
- Add taskbar/window-edge perching.
- Add speech bubble command mode and WISE² launcher shortcuts.

## Guardrails

- Do not replace Tauri with Electron.
- Do not change the locked mascot design.
- Do not add cloud APIs to Alpha 0.1.
- Do not require administrator privileges.
- Do not remove the emergency quit method.
- Keep all secrets out of the repo.

## Current file map

- `/src/main.js`: pet state machine, movement, interactions
- `/src/style.css`: transparent UI styling
- `/src-tauri/src/lib.rs`: native window commands
- `/src-tauri/tauri.conf.json`: transparent always-on-top window config
- `/public/assets/`: extracted transparent pose PNGs
- `/reference/`: locked visual references

## Acceptance test

1. Fresh Windows machine with prerequisites installed.
2. `npm install` succeeds.
3. `npm run desktop:dev` launches one visible Imp.
4. Desktop remains visible around the character.
5. Imp can be dragged.
6. Imp moves automatically within 10 seconds.
7. Clicking triggers a visible reaction.
8. Right-click menu opens and Quit works.
9. Ctrl+Shift+Q works.
10. `npm run desktop:build` produces an installer.
