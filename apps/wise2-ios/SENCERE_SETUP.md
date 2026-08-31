# SenCere iOS App

Standalone partner app for **SenCere Creative LLC** (silent investor) — separate from WISE² Command Center.

## Two apps

| App | Scheme | Bundle ID | Who |
|-----|--------|-----------|-----|
| **SenCere** | `SenCere` | `com.sencerecreative.app` | Partner / client |
| **WISE²** | `WISE2` | `com.wise2.commandcenter.ios` | Operator (you) |

## SenCere v1.1 — what's included

| Tab | Purpose |
|-----|---------|
| **Home** | Bunny emblem hero, brand lockup, shop + quote CTAs, partner snapshot when signed in |
| **Shop** | Blakk Hail storefront (`blackhail.store/sencere`) |
| **Partner** | Silent investor portal — WISE²-synced revenue, leads, jobs, invoices |
| **Connect** | Quote, call, email, Instagram, settings |

- **App icon**: Piff City / SenCere bunny emblem on gold-black radial (regenerate with script below)
- **WISE² backend**: Partner sign-in → `https://wise2.net/api/v1` (isolated keychain per app)
- **No WISE² branding** on consumer tabs — footer only: "Powered by WISE² · SenCere partner program"

## Regenerate bunny logo / icon

```bash
python3 apps/wise2-ios/scripts/generate-sencere-icon.py
```

Source emblem: `apps/website/public/sencere-assets/blakkhail/sencere-emblem.jpg`

## Install for partner

1. Open `apps/wise2-ios/WISE2.xcodeproj`
2. Scheme: **SenCere**
3. Run on partner iPhone (⌘R)

## Partner account setup

1. Create partner email on production WISE² (or sign up in-app on **Partner** tab)
2. Sign in → metrics sync from `/business-os/dashboard`
3. Google-only WISE² accounts need a password set at [wise2.net/auth/signin](https://wise2.net/auth/signin) first

## TestFlight

Archive target **SenCere** → App Store Connect → `com.sencerecreative.app`

## Code layout

```
apps/wise2-ios/
├── SenCere/              ← partner app (this handoff)
│   ├── App/
│   ├── Brand/
│   ├── Design/
│   ├── Views/
│   └── Assets.xcassets/  ← bunny AppIcon + SenCereEmblem
├── WISE2/                ← operator command center
└── scripts/generate-sencere-icon.py
```
