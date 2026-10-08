# Quest 3 / Mario mixed reality audit — 2026-10-08

## Evidence

Inspected the uploaded 29.33-second recording. Visible: ae.t.he.r, caption Mario 64 in my room part 2, real-room background, Mario/platforms/pipes/pickups, controller ray and BUILD YOUR LEVEL UI. These demonstrate the intended interaction but do not establish the engine, AI assistant or code provenance. Claims that AI built the whole experience cannot be verified from footage.

Compared the complete, non-truncated wise2-core main tree at 9449972112eab7028bea60681a90cdd93c986af7, .gitmodules, Game Arsenal README, registry, checkout helper and VR README. No AGENTS.md was present in the inspected repository tree. Game Arsenal had browser gameplay and a research registry with OpenXR/Godot XR candidates; no Unity project or Quest MR implementation. Wise2-hardware contained HVAC planning docs, not Quest code.

## Applied

Two independently versioned official sample projects are added as pinned git submodules: Unity-MRUtilityKitSample and Unity-MRMotifs. The existing registry gains these plus reference entries for Unity-DepthAPI, SM64-Quest-3, libsm64 and libsm64-unity. Added exact revision manifest, device preflight and build/implementation instructions. Existing game and website code are preserved.

## Architecture findings

Public Mario reference: Unity + libsm64 native runtime + Unity bindings + Oculus scene/passthrough integration. ProjectVersion and manifest confirm Unity 2022.3.8f1/Oculus XR 4.0.0. It is a relevant public baseline, not a confirmed copy of the video's newer editor. Source references: https://github.com/JonasJakobi/SM64-Quest-3 , https://github.com/libsm64/libsm64 , https://github.com/libsm64/libsm64-unity .

Reusable WISE2 foundation: https://github.com/oculus-samples/Unity-MRUtilityKitSample for scene queries, meshes/navigation and room collisions; https://github.com/oculus-samples/Unity-MRMotifs for surface placement, grounding and spatial anchoring; https://github.com/oculus-samples/Unity-DepthAPI for occlusion reference. Their manifests differ materially (Meta 207 versus 78), so bulk-merging packages would be an unjustified compatibility assumption.

## Remaining blockers and limits

This environment has no Unity editor, ADB or attached Quest. Source/manifest checks are possible; compilation, sideloading and headset behavior are not verified. No root license was found for SM64-Quest-3. Its README advertises an APK/native binary, but neither was present in the inspected tree. A Mario build needs a valid native ARM64 plugin and a separately supplied ROM; any missing plugin should be built from inspected upstream source with matching ABI rather than assumed present. Meta SDK dependencies retain their license terms.

A functional original IMP game still needs a Unity application, scene integration, character controller, level editor, persistence and the canonical character assets. Downloaded SDK/sample source is preparation, not a finished game. Report success only after actual Quest testing: passthrough, correct floor alignment, collision, placement without character overlap, respawn, save/load anchors, tracking recovery and measured performance.
