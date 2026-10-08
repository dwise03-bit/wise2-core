# Research radar

The root game-tech-radar.yml runs Monday at 13:00 UTC (9am New York during daylight saving, 8am in winter), and supports manual dispatch. Scheduled runs begin only after this workflow reaches the default branch and Actions is enabled. Current branch addition does not activate the schedule.

Read-only token permissions. Commit/release/license/archive changes are compared against research/repositories.json. Searches discover recently pushed OpenXR, modding, Godot plugins, multiplayer and procedural-generation candidates. Metadata does not guarantee quality or release compatibility. New candidates are WATCH; tracked changes are REVIEW. Reports include errors and are uploaded even on failure. No repository, dependency, binaries or updates are automatically installed.

Promote a candidate only after target-game/platform experiment, exact license/dependency/asset audit and tests. Update the baseline JSON intentionally after accepting a revision; until then the same unresolved changes may repeat. This baseline is tracked in Git, not silently overwritten by the workflow. Use the existing ChatGPT weekly research task for wider narrative research; this workflow does not replace or claim to update that task.
