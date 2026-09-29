# WISE Imp Desktop Pet — Alpha 0.1

A Windows-first transparent desktop pet built with Tauri 2, vanilla JavaScript, Vite, and Rust.

**Live service:** https://wise2.net/imp/

The glossy black/cyan WISE Imp mascot is locked. Do not redraw it. The hosted page is the WISE² service. The Windows pet is the installable SKU.

## What Alpha 0.1 includes

- Locked WISE Imp reference art and eight transparent pose PNGs
- Transparent frameless 300×300 always-on-top pet window
- No taskbar button
- Drag across multi-monitor desktops, then clamp to the current monitor work area (taskbar excluded)
- Smooth wander arcs with idle sit/sleep states
- Click reaction that does not fire after a drag
- Right-click menu: Wake, Sleep, Center, Quit
- System tray: Show, Hide, Quit
- `Ctrl + Shift + Q` emergency quit
- Local save/restore of last position and settings

## Fast start on Windows

1. Install Node.js LTS.
2. Install Rust with rustup.
3. Install Microsoft C++ Build Tools and WebView2 if your machine does not already have them.
4. Open PowerShell in `apps/wise-imp-desktop`.
5. Run:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\setup-windows.ps1
```

Manual commands:

```powershell
npm install
npm run desktop:dev
```

Build an NSIS installer (Windows only):

```powershell
npm run desktop:build
```

Tauri writes Windows bundles under `src-tauri/target/release/bundle/`.

## macOS note

This machine can run `npm run desktop:dev` after Rust is installed, but the Alpha 0.1 installer target is Windows NSIS. Produce the installer on Windows 10/11.

## Controls

- Left-click: reaction
- Left-click and drag: move the Imp
- Right-click: open pet menu
- Tray: Show / Hide / Quit
- Ctrl + Shift + Q: quit

## Asset note

The PNG poses are generated prototype art with real alpha. For smoother movement later (P2), replace each static pose with a frame sequence while keeping the same filenames or updating `src/main.js`.

## Definition of done for Alpha 0.1

See `CURSOR_HANDOFF.md` P0 and the acceptance test list.
