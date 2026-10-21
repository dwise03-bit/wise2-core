# WISE2-CORE Monorepo Migration Guide

## Moving from Single Repo to Monorepo

### Step 1: Migrate Core Libraries
```bash
# Move configuration system
cp ../config/env.js core/config/src/
cp ../config/api-client.js core/api/src/
cp ../config/error-handler.js core/security/src/
cp ../config/security.js core/security/src/
```

### Step 2: Migrate Feature Packages
```bash
# AI package
cp -r ../ai-tools/* packages/ai/src/

# Trading package
cp -r ../trading/* packages/trading/src/

# Games package
cp -r ../games/* packages/games/src/

# 3D package
cp -r ../3d-viewer ../3d-print packages/3d/src/

# Mobile package
cp -r ../mobile packages/mobile/src/
```

### Step 3: Update Dependencies
```bash
# Each package references other packages
# Example in packages/ai/package.json:
{
  "dependencies": {
    "@wise2/config": "*",
    "@wise2/api": "*",
    "@wise2/security": "*"
  }
}
```

### Step 4: Build & Test
```bash
cd wise2-core
npm install
npm run bootstrap
npm run build
npm run test
```

## Workspace Structure

```
wise2-core/
├── core/                  # Shared libraries
│   ├── config/           # Configuration
│   ├── api/              # HTTP client
│   └── security/         # Auth & security
├── packages/             # Feature modules
│   ├── ai/               # @wise2/ai
│   ├── trading/          # @wise2/trading
│   ├── games/            # @wise2/games
│   ├── 3d/               # @wise2/3d
│   └── mobile/           # @wise2/mobile
├── apps/                 # Applications
│   └── web/              # @wise2/web (uses all packages)
└── infrastructure/       # Docker, K8s
```

## Benefits

✅ **Code Sharing** - Shared core libraries across all packages
✅ **Versioning** - Unified version management with Lerna
✅ **Publishing** - Publish to npm as separate packages
✅ **Development** - Single repo, multi-package workflow
✅ **Testing** - Test entire monorepo at once
✅ **Organization** - Clear separation of concerns

## Commands

```bash
npm run dev          # Start all packages in dev mode
npm run build        # Build all packages
npm run test         # Test all packages
npm run lint         # Lint all code
npm run publish      # Publish to npm
npm run bootstrap    # Install dependencies
npm run clean        # Clean node_modules
```

## Publishing Packages

After migration, each package can be published independently:

```bash
# Publish with semantic versioning
npm run version
npm run publish

# This creates:
# - npm @wise2/config
# - npm @wise2/api
# - npm @wise2/security
# - npm @wise2/ai
# - npm @wise2/trading
# ... etc
```

## GitHub Organization

Recommended GitHub org: github.com/wise2-core

Repos:
- wise2-core (main monorepo)
- wise2-web (archived, contents migrated)
