# WISE² Trading Mobile App

**Full-featured React Native trading application integrated with WISE² backend.**

## Features

✅ **Real-time Dashboard** - Market overview, account summary, key metrics  
✅ **Interactive Charts** - TradingView Lightweight Charts integration  
✅ **Portfolio Tracking** - Holdings, P&L, allocation analytics  
✅ **Order Management** - Place, monitor, close orders  
✅ **Live Alerts** - Price alerts, setup signals  
✅ **Web Dashboard Sync** - Share state with web dashboard  
✅ **Screen Recording** - Capture trading sessions  
✅ **Voice Integration** - Telnyx voice agent for verbal orders  

## Architecture

```
apps/trading-mobile/
├── src/
│   ├── screens/          # Main app screens
│   │   ├── DashboardScreen.tsx
│   │   ├── ChartsScreen.tsx
│   │   ├── PortfolioScreen.tsx
│   │   ├── OrdersScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/       # Reusable components
│   ├── store/           # Zustand state management
│   ├── services/        # API & WebSocket services
│   ├── hooks/           # Custom React hooks
│   └── types/           # TypeScript types
├── App.tsx              # Main app entry
├── app.json             # Expo configuration
└── package.json         # Dependencies
```

## Setup

```bash
cd apps/trading-mobile
npm install
```

## Development

```bash
# Start dev server
npm start

# Preview on web
npm run preview

# Build APK (requires EAS)
npm run build-apk
```

## API Integration

Connects to WISE² backend:
- `https://api.wise2.net/api/trading` (REST)
- `wss://api.wise2.net/ws/trading` (WebSocket)

## Mobile Platform Support

- **Android**: Builds APK via Expo/EAS
- **iOS**: Builds IPA via Expo/EAS
- **Web**: Runs on React Native Web

## Build & Deploy

### Generate APK

```bash
eas build --platform android
# Output: trading-mobile-version.apk
```

### Deploy Options

1. **Google Play Store** - Full release
2. **Direct APK** - Sideload on device
3. **Expo Go** - Development testing

## Integration with Web Dashboard

- Shared API endpoints
- Synchronized portfolio state
- Cross-platform authentication (JWT in secure storage)
- Real-time WebSocket updates

## Next Steps

1. Install dependencies: `npm install`
2. Configure EAS: `eas init`
3. Build APK: `npm run build-apk`
4. Deploy to Play Store or distribute APK

**Status**: ✅ Ready to build & deploy
