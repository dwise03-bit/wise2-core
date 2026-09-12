# Ray-Ban Meta Gen 2 integration

WISE² integrates ordinary Ray-Ban Meta Gen 2 glasses through the Android companion app. Quest remains the immersive 3D display; the glasses provide hands-free camera, microphone, and speaker input/output.

## Current implementation

`MetaWearablesBridge` is the app boundary for connection state, voice commands, and camera frames. The checked-in mock provider keeps local and CI builds working until the Meta Wearables Device Access Toolkit developer-preview dependency is enabled for this application.

## Production activation

1. Install and pair the glasses in the Meta AI mobile app.
2. Enable Developer Mode for the glasses in Meta AI.
3. Enroll the Android application in Meta's Wearables Device Access Toolkit developer preview and obtain the application credentials.
4. Add the exact Android SDK dependency and provider initialization from Meta's Android getting-started guide to `MetaWearables.create`.
5. Route camera/audio events to the existing WISE² HTTPS/WebSocket services; never store raw frames or audio by default.

The provider is intentionally isolated so SDK preview changes do not leak through the dashboard, Quest client, or HVAC workflows.
