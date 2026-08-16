# WISE² Enterprise - Monorepo Structure

This is a Turborepo-based monorepo for the WISE² Enterprise platform. This guide explains the structure and how to work with it.

## Directory Structure

```
wise2-form/
├── apps/                          # Frontend applications
│   ├── admin/                    # Admin dashboard (Next.js 14)
│   ├── dashboard/                # Creator dashboard (Next.js 14)
│   ├── studio/                   # Audio/recording studio (Next.js 14)
│   └── website/                  # Marketing website (Next.js 14)
│
├── packages/                      # Shared libraries and utilities
│   ├── api/                      # NestJS backend API
│   ├── ai/                       # AI orchestration layer (Hermes)
│   ├── audio/                    # Audio processing utilities
│   ├── auth/                     # Authentication utilities
│   ├── db/                       # Database models & migrations
│   ├── types/                    # Shared TypeScript types
│   └── ui-components/            # Reusable React components
│
├── .github/workflows/            # CI/CD pipelines
│   ├── deploy.yml               # Production deployment
│   ├── ci.yml                   # Continuous integration
│   └── README.md                # CI/CD documentation
│
├── docs/                         # Project documentation
├── package.json                  # Root workspace config (pnpm)
├── turbo.json                   # Turbo build orchestration
├── tsconfig.json                # Root TypeScript config
├── tailwind.config.js           # Tailwind design system
├── postcss.config.js            # PostCSS plugins
└── jest.config.js               # Jest testing config
```

## Key Technologies

| Layer | Technology | Version |
|-------|-----------|---------|
| Package Manager | pnpm | ≥8.0.0 |
| Monorepo Tool | Turborepo | ^1.10.16 |
| Frontend Framework | Next.js | 14.2 |
| React | - | 19 (in some apps) |
| Backend Framework | NestJS | ^10.2.0 |
| Database | PostgreSQL | 16 |
| Cache | Redis | 7 |
| Language | TypeScript | ^5.3.0 |
| Styling | Tailwind CSS | Latest |
| Components | shadcn/ui | Latest |

## Working with the Monorepo

### Install Dependencies

```bash
# Install all dependencies for all packages
npm install

# Or use pnpm if you prefer
pnpm install
```

### Running Commands

Turborepo orchestrates commands across the monorepo:

```bash
# Run dev servers in all apps (parallel)
npm run dev

# Build all packages
npm run build

# Run tests in all packages
npm test

# Type check all packages
npm run type-check

# Lint all packages
npm run lint
```

### Working on a Specific Package

```bash
# Change to a package directory
cd packages/api
cd apps/website

# Run that package's scripts
npm run dev
npm run build
npm run test
```

### Adding a New Package

1. Create a new directory under `packages/`:
   ```bash
   mkdir packages/my-new-package
   cd packages/my-new-package
   ```

2. Create `package.json`:
   ```json
   {
     "name": "@wise2/my-new-package",
     "version": "0.1.0",
     "private": true,
     "scripts": {
       "build": "tsc",
       "dev": "tsc --watch",
       "test": "jest"
     },
     "dependencies": {}
   }
   ```

3. Create `tsconfig.json` following the pattern in existing packages

4. Create `src/index.ts` entry point

5. Add to root `package.json` `workspaces` if needed (usually automatic for `packages/*`)

### Adding a New App

Follow the same pattern as packages but under `apps/`. Next.js apps should have:
- `app/` directory (App Router)
- `package.json`
- `tsconfig.json`
- `next.config.js`

## Important Rules

### 🔴 DO NOT Use `services/` Directory

The old `services/` directory is deprecated. All code should be in:
- `apps/` for frontend applications
- `packages/` for shared libraries

If you see references to `services/api`, `services/dashboard`, etc:
- ❌ This is the OLD structure - do not add to it
- ✅ Use `packages/api` or `apps/dashboard` instead

### 📝 Update CI Workflows When Changing Structure

If you add a new app or package:
1. Verify it's in `apps/` or `packages/`
2. Check `.github/workflows/ci.yml` works with your addition
3. Update `.github/workflows/deploy.yml` path filter if needed
4. Test on a feature branch before merging to main

## Build Process

Turborepo handles the build orchestration:

1. **Dependency graph**: Automatically determines package build order
2. **Caching**: Caches build outputs to speed up rebuilds
3. **Parallel execution**: Builds independent packages in parallel
4. **Incremental builds**: Only rebuilds changed packages

View the Turbo cache:
```bash
npm run build -- --verbose  # See build details
```

## Environment Configuration

### Root Level
- `.env` - Loaded by all packages
- `.env.local` - Local overrides (not committed)

### Package Level
- Each package can have its own `.env` file
- Environment variables are NOT automatically inherited from root

### For Deployment
- Use GitHub secrets for sensitive values
- Configure in repository settings → Secrets and variables → Actions

## Testing

The monorepo uses Jest for testing:

```bash
# Run tests across all packages
npm test

# Run tests for a specific package
npm test -- --testPathPattern=packages/api

# Run with coverage
npm test -- --coverage
```

Tests are discovered by pattern:
- `**/__tests__/**/*.test.ts`
- `**/*.spec.ts`

## Deployment

### Production Deployment
Triggered automatically on push to `main` branch if changes affect:
- `apps/**`
- `packages/**`
- `docker-compose.yml`
- `.github/workflows/deploy.yml`

See `.github/workflows/README.md` for details.

### Manual Deployment
```bash
gh workflow run deploy.yml -R dwise03-bit/wise2-core -f environment=production
```

## Troubleshooting

### "Cannot find module" errors
- Run `npm install` to sync dependencies
- Check `package.json` has correct imports in `paths`

### Build failures
- Run `npm run build -- --verbose` for details
- Check TypeScript errors: `npm run type-check`
- Clear cache: `npm run clean`

### Tests not running
- Verify `jest.config.js` includes the path
- Check package has test script in `package.json`
- Ensure test files match pattern

### CI pipeline failing
- Check `.github/workflows/README.md`
- Verify directory structure matches CI expectations
- Run locally: `npm run lint`, `npm test`, `npm run build`

## Performance Tips

1. **Use `npm run dev`** - Turborepo caches and parallelizes
2. **Leverage `npm run build`** - Only rebuilds changed packages
3. **Keep dependencies lean** - Unused dependencies slow everything down
4. **Use workspace references** - Link packages instead of publishing

Example workspace reference in `package.json`:
```json
{
  "dependencies": {
    "@wise2/types": "workspace:*"
  }
}
```

## Resources

- [Turborepo Docs](https://turbo.build)
- [Next.js Docs](https://nextjs.org/docs)
- [NestJS Docs](https://docs.nestjs.com)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

## Getting Help

- Check CI logs: https://github.com/dwise03-bit/wise2-core/actions
- Read `.github/workflows/README.md` for CI/CD help
- Review commit history for similar changes
