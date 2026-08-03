# GitHub Actions CI/CD Workflows

This document explains the CI/CD pipeline for WISE² Enterprise and how to maintain it.

## Workflow Files

### `deploy.yml` - Production Deployment
- **Trigger**: Push to `main` branch with changes in key paths
- **Action**: Sends webhook to VPS to trigger deployment
- **Key paths monitored**:
  - `apps/**` (frontend applications)
  - `packages/**` (shared packages)
  - `services/**` (backend services)
  - `package.json`, `turbo.json`, `docker-compose.yml`

### `ci.yml` - Continuous Integration
- **Trigger**: Push to `main`/`develop`, pull requests
- **Jobs**:
  - `lint`: TypeScript/code linting (non-blocking)
  - `test`: Monorepo tests via Turbo (non-blocking)
  - `type-check`: TypeScript type validation (non-blocking)
  - `build`: Build all packages (non-blocking)
  - `security-scan`: Trivy vulnerability scan (informational)
  - `docs-check`: Documentation verification (informational)
  - `ci-summary`: Status summary (always runs)

## Important Rules

### ⚠️ CRITICAL: Keep Directory Structure in Sync

The workflows reference specific directory structures:
- **Monorepo apps**: `apps/` (Next.js applications)
- **Shared packages**: `packages/` (libraries, utilities, configs)
- **Old structure**: `services/` (deprecated, do not use)

**If you add a new package or app:**
1. Verify it's in `apps/` or `packages/`
2. Update workflow paths if needed
3. Test CI runs on a feature branch before merging to main

### Path Filters in Workflows

The `deploy.yml` workflow has a `paths` filter:
```yaml
paths:
  - 'apps/**'
  - 'packages/**'
  - 'services/**'
  - 'package.json'
  - 'turbo.json'
  - 'postcss.config.js'
  - 'tailwind.config.js'
  - 'docker-compose.yml'
  - '.github/workflows/deploy.yml'
```

**If deployment isn't triggering**, verify:
1. Changes are in one of these paths
2. The push is to `main` branch
3. The webhook URL secret is configured

### Non-Blocking Jobs

The CI workflow uses `continue-on-error: true` for:
- `lint` - Code style issues won't block PR
- `test` - Test failures are logged but don't block
- `type-check` - Type errors are warned but don't block
- `build` - Build issues are captured in artifacts

**Why?** The monorepo is still stabilizing. Non-blocking allows PRs to merge while we fix infrastructure issues.

### Making CI Strict (Future)

When ready to enforce strict CI:

1. Remove `continue-on-error: true` from test/build jobs
2. Update `ci-summary` to fail on test failures:
```yaml
if [ "${{ needs.test.result }}" = "failure" ]; then
  exit 1
fi
```

3. Ensure all packages have proper `package.json` scripts
4. Fix all linting, type errors, and tests

## Troubleshooting CI Failures

### "Workflow file issue" error
- Check YAML syntax in `.github/workflows/`
- Verify job dependencies (`needs:`) reference existing jobs
- Ensure conditional logic in `if:` is valid

### "Path not found" errors
- Verify directory structure matches workflow expectations
- Check that package.json exists in the working-directory
- Ensure npm scripts are defined

### Timeout errors
- Increase timeout in workflow steps
- Check if dependencies are cached properly
- Verify service containers (postgres, redis) are healthy

## Adding New CI Checks

To add a new CI check:

1. Add a new job in `ci.yml`
2. Set appropriate dependencies using `needs:`
3. Use `continue-on-error: true` if non-blocking
4. Add to `ci-summary` job's `needs:` list

Example:
```yaml
new-check:
  name: My New Check
  runs-on: ubuntu-latest
  needs: [lint]
  steps:
    - uses: actions/checkout@v4
    - name: Run check
      run: npm run my-check --if-present
      continue-on-error: true
```

## Secrets Configuration

Required secrets in GitHub repository settings:

- `DEPLOY_WEBHOOK_URL` - VPS webhook endpoint for deployments
- `DEPLOY_SECRET` - Authentication token for webhook (X-Secret header)

**To add secrets:**
1. Go to Repository Settings → Secrets and variables → Actions
2. Add `New repository secret`
3. Name matches the environment variable name
4. Value is the actual secret

## CI/CD Status

Current status: ✅ **Operational**

- Deployment: Triggered on main push (webhook-based)
- Tests: Informational (non-blocking)
- Type checking: Informational (non-blocking)
- Security scanning: Automated via Trivy

Monitor CI runs at: https://github.com/dwise03-bit/wise2-core/actions
