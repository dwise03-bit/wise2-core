# WISE² CarTools — Quest City

Original open-world driving game prototype for desktop browsers and Meta Quest Browser using A-Frame/WebXR.

## Current implementation
- Procedural city blocks and roads
- One drivable vehicle with follow camera
- Keyboard driving and experimental Gamepad API input
- WebXR entry control

## Run locally
From this directory run `python3 -m http.server 8080`, then open http://localhost:8080. For headset testing serve over HTTPS (WebXR secure context required) and open in Quest Browser. This prototype currently loads A-Frame from a CDN, so it is not offline-capable.

## Known blockers before production
- Validate Quest XR controller input using XR input sources, not just generic Gamepad API.
- Vehicle collision and world boundaries are missing.
- Current camera is parented to the vehicle; verify headset comfort and provide cockpit/comfort options.
- Measure FPS and memory on Quest hardware; add draw-distance/LOD/instancing as needed.
- Add mobile/Quest UI, mission systems, NPCs, garage, save data, audio, and accessible settings.
- Audit hosting route /cartools and existing production assets before any deployment.
- Do not ship Rockstar proprietary maps, characters, models, music, textures, or extracted GTA assets. GTA III and Vice City are aesthetic/gameplay references only.

## Deployment gate
1. Validate static page and JS in desktop browser.
2. Serve staging over HTTPS; verify no console errors and enter/exit VR.
3. Test controller mapping, comfort, performance and driving on real Meta Quest hardware.
4. Integrate into existing WISE² routing without overwriting current /cartools.
5. Smoke-test existing routes and rollback plan before production promotion.

Status: prototype committed; production deployment and real headset tests not verified.
