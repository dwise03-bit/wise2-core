# Development Setup Guide

## Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git 2.40+

## Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/dwise03-bit/wise2-core.git
cd wise2-core
npm install
```

### 2. Setup Environment
```bash
# Copy the example env file
cp .env.example services/dashboard/services/api/.env

# Start PostgreSQL and Redis
docker-compose -f docker-compose.dev.yml up -d postgres redis
```

### 3. Start Services
```bash
# Terminal 1: Dashboard (http://localhost:3000)
cd services/dashboard/services/dashboard
npm run dev

# Terminal 2: API (http://localhost:3001)
cd services/dashboard/services/api
npm run dev
```

### 4. Verify Everything Works
```bash
# Run tests
npm test

# Check formatting
npm run format:check

# Type check
npm run type-check

# Lint
npm run lint
```

## Before Committing

**MUST DO:**
```bash
# From project root
npm run format          # Auto-fix formatting
npm run type-check      # Verify TypeScript
npm test               # Ensure tests pass
npm run lint           # Check code style
```

If any of these fail, fix before pushing.

## Pre-Commit Hooks (Recommended)

Install Husky to run checks automatically:
```bash
npm install husky --save-dev
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm run type-check && npm test"
```

Now checks run automatically before commit!

## Common Issues

**Q: TypeScript error "noUnusedLocals"**
A: Prefix unused parameters with `_`: `function foo(_unused: string) {}`

**Q: Docker build fails with "npm ci"**
A: Ensure package-lock.json exists. Run: `npm install --package-lock-only`

**Q: Tests fail with database errors**
A: Start PostgreSQL: `docker-compose -f docker-compose.dev.yml up -d postgres`

**Q: Port already in use**
A: Change env var: `API_PORT=3002 npm run dev`

## Architecture
- **API**: Express.js TypeScript server (port 3001)
- **Dashboard**: Next.js React app (port 3000)
- **Database**: PostgreSQL 15
- **Cache**: Redis 7

See [Architecture Guide](../architecture/ARCHITECTURE.md) for details.
