# CC Craft & Create — iOS app

Native iOS shell via **Capacitor**. The app loads the web experience from the local dev server or production URL.

**Bundle ID:** `com.wise2.cccraftcreate`  
**Display name:** CC Craft & Create  
**Default URL:** `http://127.0.0.1:3011` (local demo)

## Prerequisites

- macOS with Xcode 15+
- Apple Developer account (for device / TestFlight)
- Node.js 20+

## Demo setup (first time)

```bash
cd clients/cc-craft-create/website
npm install
npm run dev
```

In a second terminal:

```bash
cd clients/cc-craft-create/website
npm run ios:icon    # generate branded icon + splash
npx cap add ios     # only if ios/ does not exist yet
npm run ios:sync
npm run ios:open
```

In Xcode: select your team, choose a device or simulator, then **Run**.

Keep `npm run dev` running on port **3011** while testing the iOS shell locally.

## After config changes

```bash
npm run ios:sync
```

## Production URL

Edit `capacitor.config.json` and set:

```json
"server": {
  "url": "https://cc.wise2.net"
}
```

Then `npm run ios:sync` and rebuild. Revert to localhost for local demos.

## Local network testing (physical device)

Replace `127.0.0.1` with your Mac's LAN IP:

```json
"server": {
  "url": "http://YOUR_MAC_IP:3011"
}
```

Ensure the dev server binds to `0.0.0.0` if needed: `next dev -p 3011 -H 0.0.0.0`.

## Demo mode

Demo mode is enabled by default (`NEXT_PUBLIC_DEMO_MODE=true`). No database or Stripe keys are required for client presentations.

## App Store / TestFlight

1. Archive in Xcode (**Product → Archive**)
2. Upload to App Store Connect
3. Add screenshots (iPhone 6.7" and 6.1" required)
4. Privacy: no sensitive device permissions required for the web shell
