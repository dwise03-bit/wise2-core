# WISE2 Quest 3 mixed reality

Status: source integration prepared; no Unity build or Quest device test completed.

The user already owns Meta Quest 3. The goal is a controllable character and a room-scale level editor inspired by the supplied Mario clip, with an eventual original IMP game.

## Get the pinned source projects

Run from the wise2-core repository root:

```sh
git submodule update --init -- WISE2-GAME-ARSENAL/vr/upstream/Unity-MRUtilityKitSample WISE2-GAME-ARSENAL/vr/upstream/Unity-MRMotifs
node WISE2-GAME-ARSENAL/vr/quest3/device-check.mjs
```

Open each sample as its own Unity project. Do not combine their package manifests.
MRUK sample: Unity 6000.0.66f2, Meta Core/MRUK 207.0.0, OpenXR 1.16.1, Meta OpenXR 2.4.0.
MR Motifs: Unity 6000.0.60f1, Meta Core/MRUK 78.0.0, OpenXR 1.15.1, Meta OpenXR 2.2.0.
Install the corresponding editor with Android Build Support, SDK/NDK and OpenJDK.
Use the package versions at the pinned commit; SDK terms apply independently of MIT sample code.

## First device milestone

1. Connect Quest 3 by USB with Developer Mode and authorized USB debugging.
2. Complete room setup and allow spatial data access.
3. Open MRUKBase or BouncingBall in the MRUK sample. Resolve Meta Project Setup Tool errors; build Android ARM64 and deploy using Unity Build and Run.
4. Verify passthrough, floor/room alignment and real-world collision. Record device OS, editor/packages, logs and performance.
5. Test Motifs placement/shadows separately. Only port selected scripts into an original project after its versions have been reconciled.

## Mario reference

JonasJakobi/SM64-Quest-3 is a public implementation using Unity 2022.3.8f1, Oculus XR 4.0.0, libsm64 and libsm64-unity. It extracts assets from a user-supplied US ROM at runtime. No ROM, Mario asset pack or upstream APK is included here. No root license was found in that project's audited tree; its source is recorded for reference rather than vendored. The creator in the recording is ae.t.he.r; use of this exact public project is unconfirmed.

The upstream README advertises an APK, but the audited tree did not contain an APK or libsm64 .so. Do not promise a one-click playable download until those build inputs are resolved.

## Original IMP implementation order

Build an original Unity project after the first device milestone: passthrough and room collision; placeholder character move/jump; controller ray placement of platforms/pickups; placement overlap rejection; edit/play switch; undo/delete/resize; checkpoint/respawn; local level JSON with a spatial anchor; then the canonical IMP mesh and animation. Use an explicit room-setup fallback, controller-relative input projected onto the floor, and persistent anchors rather than raw world coordinates. Test tracking loss/recenter and room changes. Depth occlusion affects rendering; it is not itself a physics collider.

See AUDIT.md and sources.lock.json for evidence, exact revisions and remaining work.
