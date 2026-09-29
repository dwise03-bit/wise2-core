# CI/CD Pipeline Requirements

## What Must Pass Before Merge

### 1. Linting
```bash
npm run lint
```
- ESLint rules enforced
- TypeScript strict mode
- No `any` types allowed

### 2. Type Checking
```bash
npm run type-check
```
- All TypeScript errors must be fixed
- No type violations

### 3. Testing
```bash
npm test
```
- Unit tests pass
- Integration tests pass
- No skipped tests in main

### 4. Formatting
```bash
npm run format:check
```
- Prettier standards enforced
- No trailing whitespace
- Consistent indentation

### 5. Build
```bash
npm run build
docker-compose build
```
- TypeScript compilation succeeds
- Docker images build successfully
- No warnings treated as errors

### 6. Security
- TruffleHog scans for secrets
- No hardcoded credentials
- Environment variables used for all secrets

### 7. Package Management
- package-lock.json committed
- No duplicate dependencies
- Security vulnerabilities patched

## Running All Checks Locally

```bash
./scripts/validate-build.sh
```

This runs ALL checks that CI/CD will run. If this passes locally, it will pass in GitHub Actions.

## GitHub Actions Workflow

1. **On Push**: Run linting, tests, type-check
2. **On PR**: Run all checks + Docker builds
3. **On Merge**: Deploy to staging
4. **Manual Deploy**: Promote to production

## Preventing Issues

**DO NOT** commit unless:
- `npm run format` passes
- `npm test` passes  
- `npm run type-check` passes
- Local Docker build succeeds

**DO NOT** push unless:
- GitHub Actions passes
- Code review approved
- No security warnings

## Troubleshooting Failed CI/CD

| Error | Fix |
|-------|-----|
| Linting failed | Run `npm run format` |
| Tests failed | Run `npm test` locally |
| Type errors | Run `npm run type-check` |
| Docker build failed | Run `docker-compose build` |
| Security warning | Check for hardcoded secrets |

