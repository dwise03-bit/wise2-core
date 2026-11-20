# WISE² Streets — Android prototype

Original stylized low-poly neighborhood game. Godot 4.3+ GL Compatibility renderer.

## Implemented
- Third-person follow camera and WASD / controller left-stick walking
- Approach red car and press E / gamepad A to enter; press again to exit
- Arcade acceleration, steering, brake and speed HUD
- Touch-screen directional and action buttons
- Procedurally constructed streets, buildings and lighting
- Android export CI workflow (requires configured Godot export templates and Android signing)

## Local play
Open this directory in Godot 4.3 or newer and press F6/F5 to play.

## Android
Install matching Godot export templates and Android SDK/JDK; configure Android export preset and debug keystore, then export an APK. The GitHub workflow uses Godot headless and debug signing for test builds only.

## Status
Source prototype committed; gameplay, controller mappings on physical devices, and APK installation remain **unverified** until CI and hardware tests complete. This is not a GTA-quality finished game. Original geometric placeholder assets only.
