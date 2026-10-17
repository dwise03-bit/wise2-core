# Browser 3D decision

Provisional choice: PlayCanvas for one WOJI/IMP browser/XR vertical slice. Babylon.js is an alternative, not a second runtime. Both show recent activity in the live audit. This is a scoped starting choice, not a measured superiority claim.

Benchmark equivalent glTF scenes, animated characters, particles and headset interaction in separate projects. Compare cold load, frame time, memory and controller behavior on actual mobile/desktop/headset targets. Feature-detect WebGPU and retain a supported fallback. Check Blender export and engine/version support. No benchmark or headset test ran here; production selection remains contingent on those checks.
