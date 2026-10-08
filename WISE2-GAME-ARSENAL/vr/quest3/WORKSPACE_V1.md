# WISE2 personal Quest workspace — V1

User-approved direction, 2026-10-08: a self-designed virtual workspace on the user's Meta Quest 3, with the canonical IMP companion providing useful assistance. This supersedes the Mario/level-editor goal as the primary deliverable in quest3/README.md. Mario remains a research reference.

## First usable release

One seated-friendly virtual studio; a readable PC screen; an interactive project menu; one IMP with idle/walk/point/listen/speak states; push-to-talk conversation and visible transcript; transparent task status. Environment: onyx, porcelain, blue-violet, restrained cyan and rare gold, Matrix-inspired depth. No crowns. Preserve the existing IMP appearance; locate canonical assets before replacing placeholder art.

## Honest capability boundaries

The Unity room is the interface. PC applications run on the computer. A working desktop video-and-input transport is a separate dependency and must be tested inside the custom Unity app; external Quest desktop apps are not assumed embeddable. First test room and companion independently of streaming. If transport is unavailable, label the screen disconnected rather than showing a fake live desktop.

Voice requires a configured speech-to-text, assistant and text-to-speech service. Keep credentials on the PC/backend, never in the Quest APK. Show connection/error states and offer text/controller fallback. Project access requires an authenticated PC bridge with a bounded project registry. Assistant tasks must report actual outcomes from the bridge; mock responses are explicitly marked as mock. Add integrations one by one.

## Architecture

Quest Unity client: environment, UI panels, IMP state machine, microphone push-to-talk, audio playback, desktop client interface.
PC bridge: authenticated local session, registered project list, speech/assistant adapters, allowlisted actions and desktop transport adapter. Pair using a short-lived code; restrict filesystem access to registered project directories. Separate opening a project from sending a message or executing code. No arbitrary shell tool in V1.

## Commands and behavior

Bring up my projects: show registered projects from the PC bridge.
What were we working on: show a saved session summary with source and timestamp.
Put this reference on the wall: pin a user-selected image to a panel and save its layout.
Show this model: load a user-selected supported glTF/GLB with size limits into the inspection area.
Help me send this to Codex: prepare a reviewable handoff; actual submission requires a supported integration and user instruction.

IMP points at the relevant panel, gives concise answers and distinguishes queued/running/completed/failed tasks. Preserve comfortable personal distance and provide mute/hide controls.

## Build sequence and acceptance

1. Build a Unity Quest scene with room, controller UI and placeholder IMP. Test APK on Quest 3.
2. Implement project-menu bridge and pairing; demonstrate a real registered project response.
3. Validate readable desktop video and keyboard/mouse or controller input through a selected transport. Do not claim full workspace capability until this passes.
4. Add push-to-talk, transcript, assistant response and IMP speaking animation; verify disconnected-service fallback.
5. Replace placeholder with canonical IMP and add pinning/layout persistence.

Acceptance: enter studio comfortably; inspect readable PC text and control the PC; ask IMP for projects and receive real data; hear a response; pin a reference; recover after bridge disconnect; save/reload layout. Record headset OS, Unity/packages, PC platform, logs and measured performance. Unity compilation and device testing have not been performed in this session.

## Required information for device implementation

PC operating system and access; installed Unity/Android tools; Quest developer/debugging status; canonical IMP model/animations; selected voice service. Resolve these from available files and connected tools when possible. Existing MRUK/Motifs submodules are independently versioned references; do not blindly merge package manifests.
