# WISE² XR and Wearable Integration

## Current integration boundary

- Meta Quest 3/3S is supported by the native Unity/OpenXR project in
  `apps/wise2-xr`.
- The web Command Center can hand off non-sensitive context with
  `wise2://digital-twin`.
- API access remains authenticated by the WISE² backend. Tokens and provider
  secrets must never be placed in Unity, browser storage, or wearable code.
- Ray-Ban Meta is a companion-device target. Direct browser control of the
  glasses is not assumed; camera/audio capture and Meta AI interactions require
  the approved Meta companion/app permissions and a user-mediated handoff.

## Activation checklist

1. Build `apps/wise2-xr` with Unity Android Build Support and OpenXR enabled.
2. Set the production API base URL to `https://api.wise2.net`.
3. Sign in on the web Command Center and issue a short-lived XR pairing token
   from the backend (never embed a permanent token in the APK).
4. Launch `wise2://digital-twin` from the signed-in web session.
5. For Ray-Ban Meta, pair through the Meta companion app and expose only the
   approved capture/voice handoff to the WISE² mobile companion.

## Not yet claimed

There is no supported public interface that lets a web page directly stream
Ray-Ban Meta camera or microphone data into WISE². That path should be added
only after the Meta developer app, permissions, and companion transport are
approved and tested on-device.
