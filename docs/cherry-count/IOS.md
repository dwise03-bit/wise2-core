# Cherry Count — iOS app

Native iOS shell via **Capacitor**. The app loads the live web app from production (no embedded build required for demos).

**Bundle ID:** `com.wise2.cherrycount`  
**Display name:** Cherry Count  
**Start URL:** `https://wise2.net/cherry-count/dashboard`

## Prerequisites

- macOS with Xcode 15+
- Apple Developer account (for device / TestFlight)
- `pnpm` from repo root

## Setup (first time)

```bash
cd apps/cherry-count
pnpm install
pnpm exec cap add ios   # only if ios/ does not exist yet
pnpm ios:sync
pnpm ios:open
```

In Xcode: select your team, choose a device or simulator, then **Run**.

## After config changes

```bash
pnpm ios:icon   # regenerate branded app icon + splash
pnpm ios:sync
```

## Reinstall on device

## Local dev URL (optional)

Edit `capacitor.config.json` and temporarily set:

```json
"server": {
  "url": "http://YOUR_MAC_IP:3025/cherry-count/dashboard"
}
```

Then `pnpm ios:sync` and rebuild. Revert before client demos.

## App Store / TestFlight

1. Archive in Xcode (**Product → Archive**)
2. Upload to App Store Connect
3. Add screenshots (iPhone 6.7" and 6.1" required)
4. Privacy: camera used for inventory scan page

## OAuth note

Google/Discord sign-in opens in the WebView. Redirect URIs must include the cherry-count paths registered in Google Cloud Console and Discord Developer Portal (see `DEPLOYMENT.md`).
