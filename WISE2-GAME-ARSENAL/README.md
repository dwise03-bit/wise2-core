# WISE² GAME ARSENAL

Original reusable game logic and a versioned registry for Godot, Roblox, Phaser, browser 3D, modding, multiplayer, assets and VR.

## Run the grid arena

From this directory:

```sh
npm test
npm run serve
```

Open http://localhost:8080/phaser/prototype-lab/ . Node 22+ and Python 3 are needed; no npm install is required for this renderer-independent prototype. Arrows/WASD move, Space places a pulse device, R restarts. Touch buttons are provided. Collect all energy and defeat the hunter to win. Violet pickup increases range. Walls stop blasts, blocks break, devices chain-react and the hunter pursues/evades danger.

## Apply tools

Read docs/REPO_AUDIT.md and research/repositories.json first. tools/checkout.mjs checks out an eligible permissive candidate at an exact observed commit into an isolated destination. It does not install binaries or execute upstream scripts. Rojo remains a standalone tool, not vendored source.

The root game-tech-radar workflow checks tracked repositories and discovers new candidates every Monday at 13:00 UTC. Reports are uploaded as GitHub Actions artifacts. It never installs updates automatically. See docs/RADAR.md.

## Validation and limits

Eight headless gameplay tests pass. Browser visuals/touch feel were not interactively tested here. The current renderer uses Canvas, not Phaser itself. Godot has not yet been ported. Roblox scaffold needs Studio testing. XR tools are tracked, not installed or headset-tested. No multiplayer or persistence server is deployed. No upstream code, binaries or franchise assets were copied.
