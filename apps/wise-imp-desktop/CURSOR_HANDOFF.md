# CURSOR HANDOFF — WISE Imp Alpha 0.1

## Mission

Finish and harden the existing WISE Imp Tauri 2 desktop-pet prototype for Windows. The mascot design is locked. Do not redraw or replace the glossy black/cyan WISE Imp in `/reference/locked_character_sheet.png`.

## Cursor first move

Open this entire `WISE_IMP_ALPHA_0_1` folder as the Cursor workspace. Then inspect the repository before editing anything.

Run:

```powershell
npm install
npm run desktop:dev
```

If the app fails, diagnose the smallest root cause first. Preserve the current Tauri 2 architecture and existing behavior unless a change is required for stability.

## Working rules for Cursor

- Read `README.md`, `CODEX_HANDOFF.md`, `ASSET_MANIFEST.txt`, `package.json`, `src/main.js`, and `src-tauri/tauri.conf.json` before making broad changes.
- Use the existing project as the source of truth rather than scaffolding a second app.
- Make small, testable commits/changes.
- After each meaningful change, run the relevant dev/build command and fix regressions before continuing.
- Do not replace Tauri with Electron.
- Do not add cloud APIs, accounts, telemetry, or secrets in Alpha 0.1.
- Do not require administrator privileges.
- Keep an emergency quit path at all times.

## P0 — ship this first

1. Project compiles with current Tauri 2 dependencies.
2. Transparent, frameless Windows pet window.
3. Always-on-top behavior works.
4. No taskbar button.
5. Dragging works across multi-monitor Windows desktops.
6. Random movement uses smooth motion and stays inside the current monitor work area, excluding the taskbar.
7. Click reaction works without conflicting with drag.
8. Landing, sitting, sleeping, idle, flying-left, flying-right, and drag/dangle assets are wired correctly.
9. Right-click menu supports Wake, Sleep, Center, and Quit.
10. System tray supports Show/Hide and Quit.
11. `Ctrl+Shift+Q` remains available as emergency quit.
12. Save and restore last position and settings locally.
13. `npm run desktop:build` produces a Windows installer.

## P1 — quality pass after P0

- Tray-accessible settings panel.
- Size presets: Small 180 px, Medium 300 px, Large 420 px.
- Wander on/off.
- Always-on-top on/off.
- Sound on/off with placeholder hooks.
- Start with Windows using an appropriate Tauri 2 plugin.
- Remember all settings between launches.

## P2 — do not block Alpha 0.1 on this

- Real frame animation instead of static pose swapping.
- Taskbar and window-edge perching.
- Speech bubbles.
- WISE² launcher shortcuts.
- Assistant/AI features.

## Locked visual assets

Production pose PNGs are in `/public/assets/`:

```text
idle_hover.png
fly_left.png
fly_right.png
land_perch.png
sit.png
sleep.png
click_react.png
drag_dangle.png
```

Visual references are in `/reference/`.

Do not modify the mascot's horns, eyes, black hoodie, cyan W² chest emblem, proportions, tail, or overall glossy black/cyan identity unless the owner explicitly requests a redesign later.

## Important implementation notes

- Avoid overlapping movement timers.
- Pause autonomous movement while dragging or while a temporary reaction state is playing.
- Clamp movement against monitor work-area bounds, not just browser viewport bounds.
- Restore a saved position only if it is still visible on an attached monitor. Otherwise center the pet.
- Keep pet clicks interactive while the surrounding window remains visually transparent.
- Make tray and emergency quit paths reliable before adding polish.
- Keep settings data small and local.

## Acceptance test

Consider Alpha 0.1 complete only when all of these pass:

1. Fresh install dependencies successfully.
2. `npm run desktop:dev` launches exactly one Imp.
3. Desktop remains visible around the Imp.
4. Imp can be dragged and released normally.
5. Autonomous movement starts within 10 seconds when wandering is enabled.
6. Movement never strands the pet off-screen.
7. Clicking visibly triggers the click-reaction state.
8. Imp can enter idle, sit, sleep, land, and flight states.
9. Right-click menu works.
10. Tray Show/Hide and Quit work.
11. `Ctrl+Shift+Q` quits.
12. Position/settings survive restart.
13. Multi-monitor behavior is sane.
14. `npm run desktop:build` produces a Windows installer.
15. Installer launches the pet successfully on Windows 10/11.

## Recommended Cursor completion report

When finished, report:

- files changed
- bugs fixed
- commands run
- acceptance tests passed/failed
- installer output path
- remaining P1/P2 items

Do not claim completion without running the app/build tests that are possible in the current environment.
