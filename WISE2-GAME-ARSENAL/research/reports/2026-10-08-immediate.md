# WISE² Game Tech Radar — immediate run

Live scan completed October 7, 2026, New York evening (October 8 UTC). 25 tracked repositories checked. 49 discovery hits across five topics; eight prioritized candidates received live metadata/license triage. The original radar collector was run locally against live GitHub connector snapshots. This was not a dispatched GitHub Actions run. No updates installed.

## Tracked change

PlayCanvas default-branch commit advanced to `7cd1be30f3f9ce97e346b2b5e8c370a9cdbba1c9`; latest stable release remains `v2.23.1`. REVIEW before accepting the commit. The production baseline was not auto-updated.

## Prioritized candidates

| Candidate | Use to investigate | License metadata | Decision |
|---|---|---|---|
| [TokisanGames/Terrain3D](https://github.com/TokisanGames/Terrain3D) | A high performance, editable terrain system for Godot 4. | MIT | inspect exact revision, dependencies and assets; test before importing |
| [TheDuckCow/godot-road-generator](https://github.com/TheDuckCow/godot-road-generator) | A Godot plugin for creating 3D highways/streets and lane-following traffic | MIT | inspect exact revision, dependencies and assets; test before importing |
| [Maaack/Godot-Game-Template](https://github.com/Maaack/Godot-Game-Template) | Godot template with a main menu, options menus, pause menu, credits, scene loader, extra tools, and an example game scene. | MIT | inspect exact revision, dependencies and assets; test before importing |
| [StereoKit/StereoKit](https://github.com/StereoKit/StereoKit) | An easy-to-use XR engine for building AR and VR applications with C# and OpenXR! | MIT | inspect exact revision, dependencies and assets; test before importing |
| [bjornbytes/lovr](https://github.com/bjornbytes/lovr) | Lua Virtual Reality Framework | MIT | inspect exact revision, dependencies and assets; test before importing |
| [RodZill4/material-maker](https://github.com/RodZill4/material-maker) | A procedural textures authoring and 3D model painting tool based on the Godot game engine | MIT | inspect exact revision, dependencies and assets; test before importing |
| [nobodywho-ooo/nobodywho](https://github.com/nobodywho-ooo/nobodywho) | NobodyWho is an inference engine that lets you run LLMs locally and efficiently on any device.   | EUPL-1.2 | external evaluation only; copyleft review before source import |
| [Sollumz/Sollumz](https://github.com/Sollumz/Sollumz) | Grand Theft Auto V modding suite for Blender. This add-on allows the creation of modded game assets: 3D models, maps, interiors, animations, etc. | GPL-3.0 | external evaluation only; copyleft review before source import |

All candidates remain WATCH and uninstalled. Inspect exact revisions/licenses, asset provenance, transitive dependencies and target-engine compatibility before source reuse. These are newly discovered for our registry, not claims that every repository was newly released.

## Validation

All 11 gameplay/radar/acquisition tests passed again. The live snapshots yielded no errors for the 25 tracked metadata/commit queries; missing stable releases are handled separately. Discovery metadata does not certify security or performance.

## Vercel deployment investigation

Both `auth-gateway` and `wise2-jocredit` failed on the merge commit too. Available GitHub statuses do not identify the cause. There is no callable Vercel connector or authenticated Vercel CLI exposed in this workspace. Do not claim a root cause or edit deployment configuration without logs.

Authenticated Vercel CLI commands for the latest failed builds:

```sh
npx vercel inspect dpl_B9ADBgziLTrTFkmV4nkQgVNANMST --logs
npx vercel inspect dpl_6c6Ua4EwSD3ZdFuaW1qjRXhXuwCD --logs
```

The Game Arsenal tests passed; that does not mean these application deployments passed. They remain unresolved.
