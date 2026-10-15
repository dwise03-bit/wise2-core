# ⬡ WISE² Core Platform

Next-generation monorepo for AI, Trading, Games, 3D, Mobile & IoT.

## Architecture

```
wise2-core/
├── core/                   # Shared libraries
│   ├── config/            # Configuration management
│   ├── api/               # HTTP client & gateway
│   └── security/          # Authentication & validation
├── packages/              # Feature packages
│   ├── ai/               # Claude, GPT-4, LLM integration
│   ├── trading/          # Portfolio, backtest, analysis
│   ├── games/            # Phaser, Babylon.js, WebXR
│   ├── 3d/               # Modeling, viewing, printing
│   └── mobile/           # iOS/Android PWA
├── apps/                  # Applications
│   └── web/              # Main web application
├── infrastructure/        # Docker, K8s, configs
└── shared/               # Shared utilities, types
```

## Quick Start

```bash
# Install dependencies
npm install

# Bootstrap workspaces
npm run bootstrap

# Development
npm run dev

# Build all packages
npm run build

# Test
npm run test
```

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| @wise2/config | Configuration management | ✅ |
| @wise2/api | HTTP client & API gateway | ✅ |
| @wise2/security | Auth & validation | ✅ |
| @wise2/ai | AI tools & LLM | ✅ |
| @wise2/trading | Trading platform | ✅ |
| @wise2/games | Games & VR | ✅ |
| @wise2/3d | 3D tools | ✅ |
| @wise2/mobile | Mobile apps | ✅ |
| @wise2/web | Main application | ✅ |

## Publishing

```bash
# Create version & publish
npm run version
npm run publish
```

## License

MIT
