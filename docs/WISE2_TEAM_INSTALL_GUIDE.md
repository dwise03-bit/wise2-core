# WISE² Team Install Guide

## iPhone / iPad (development distribution)

Download the current signed build from:

https://wise2.net/downloads/apps/wise2-ios/WISE2.ipa

1. Open the link on the iPhone and accept the install prompt.
2. If iOS says the developer is untrusted, open **Settings → General → VPN & Device Management**.
3. Select the WISE² developer profile, tap **Trust**, then confirm.
4. Return to the Home Screen and open **WISE² Command Center**.

The OTA update manifest is available at:

https://wise2.net/downloads/apps/wise2-ios/ota-manifest.plist

Inside WISE², open **More → Settings → App Information → Check for Updates**.

## Mac / Xcode install

1. Connect the iPhone by USB and unlock it.
2. Open the WISE² Xcode project.
3. Select the connected iPhone 16e as the run destination.
4. Ensure **Automatically manage signing** is enabled and the WISE² Apple Development team is selected.
5. Press **Run**.

If the phone is not listed, unlock it, accept **Trust This Computer**, reconnect the cable, and run `xcrun devicectl list devices`.

## Using the app

- **Home**: live command-center summary.
- **AI**: Hermes business assistant. It requires the live WISE² API and authenticated account access.
- **Work**: live projects and tasks from the WISE² API.
- **Systems**: service health and connectivity.
- **More → Apps**: team app catalog and web workspaces.

Report install or runtime issues to hello@wise2.net with the iOS version, device model, and a screenshot of the error.
