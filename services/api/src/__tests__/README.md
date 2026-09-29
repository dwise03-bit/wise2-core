# WISE² API Test Suite

Comprehensive integration tests for the WISE² Command Center API.

## Test Coverage

### Phase 13: Approval Workflow (`integration/approvals.test.ts`)

Tests the complete approval lifecycle:
- ✅ Create approval request with payload
- ✅ Approve pending approval
- ✅ Reject approval with reason
- ✅ Prevent approval of expired requests
- ✅ Audit logging for all approval actions
- ✅ Payload hash validation (replay protection)

**Test flow:**
```
Create Request → Approve/Reject → Execute → Audit Log
```

### Phase 14: Workflow Automation (`integration/workflows.test.ts`)

Tests workflow definition and execution:
- ✅ Create workflow with triggers and actions
- ✅ Execute workflow actions in sequence
- ✅ Mark workflow runs as completed
- ✅ Track workflow failures
- ✅ Support multiple workflows per tenant
- ✅ Custom trigger data in workflow runs

**Supported triggers:**
- LEAD_CREATED
- ESTIMATE_SENT
- ESTIMATE_VIEWED
- JOB_COMPLETED
- PAYMENT_RECEIVED
- LEAD_STATUS_CHANGED

**Supported actions:**
- SEND_SMS
- SEND_EMAIL
- CREATE_TASK
- UPDATE_LEAD_STATUS
- REQUEST_APPROVAL
- CALL_WEBHOOK

### Multi-Tenant Isolation (`integration/tenant-isolation.test.ts`)

Tests TenantGuard middleware and data isolation:
- ✅ Prevent cross-tenant lead access
- ✅ Prevent direct ID access from other tenant
- ✅ Isolate approvals by tenant
- ✅ Isolate workflows by tenant
- ✅ Isolate follow-ups by tenant
- ✅ Enforce role-based access control
- ✅ Prevent tenant ID injection in request body

**Key principle:**
```
TenantGuard resolves tenantId ONLY from authenticated user's TenantMembership
Client CANNOT supply tenantId in request body
```

## Running Tests

### Prerequisites

```bash
npm install --save-dev @jest/globals jest ts-jest
npm install --save-dev @types/jest
```

### Jest Configuration

Add to `package.json`:
```json
{
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "testMatch": ["**/__tests__/**/*.test.ts"],
    "moduleFileExtensions": ["ts", "js"]
  }
}
```

### Run All Tests

```bash
npm test
```

### Run Specific Test Suite

```bash
# Approval workflow tests
npm test -- approvals.test.ts

# Workflow automation tests
npm test -- workflows.test.ts

# Tenant isolation tests
npm test -- tenant-isolation.test.ts
```

### Run with Coverage

```bash
npm test -- --coverage
```

### Watch Mode

```bash
npm test -- --watch
```

## Test Database

Tests use the configured `db` instance. For isolated testing:

1. **Option A: Test Database** (Recommended)
   - Create separate test database
   - Set `DATABASE_URL_TEST` env var
   - Run: `npm test`

2. **Option B: Transaction Rollback**
   - Wrap tests in transaction
   - Rollback after each test
   - Prevents data pollution

## Test Architecture

```
__tests__/
├── integration/
│   ├── approvals.test.ts         (Phase 13)
│   ├── workflows.test.ts         (Phase 14)
│   └── tenant-isolation.test.ts  (TenantGuard)
├── unit/
│   ├── tenant-guard.test.ts
│   └── provisioning.test.ts
└── README.md
```

## QA Gates

All tests must pass before deployment:

```bash
# Pre-commit hook
npm test

# Pre-push hook
npm test && npm run lint && npm run build

# CI/CD
GitHub Actions: .github/workflows/test.yml
```

## Common Issues

### Database Connection

**Error:** `connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
```bash
# Ensure PostgreSQL is running
psql -c "SELECT 1"

# Or use Docker
docker-compose up -d postgres
```

### Schema Not Migrated

**Error:** `relation "tenant" does not exist`

**Solution:**
```bash
npx prisma migrate dev
```

### Stale Test Data

**Error:** `UNIQUE constraint violated`

**Solution:**
```bash
# Clear test database
npx prisma db push --skip-generate --force-reset
```

## Best Practices

### 1. Isolation

Each test should be independent:
```ts
beforeAll(async () => {
  // Create test data
});

afterAll(async () => {
  // Clean up
});
```

### 2. Clear Names

Test names should describe behavior:
```ts
✅ it('should prevent cross-tenant lead access')
❌ it('test cross tenant')
```

### 3. Arrange-Act-Assert

Follow AAA pattern:
```ts
it('should create approval', async () => {
  // Arrange
  const data = { action: 'SEND_SMS', ... };
  
  // Act
  const approval = await db.approval.create({ data });
  
  // Assert
  expect(approval.status).toBe('PENDING');
});
```

### 4. Error Testing

Test both success and failure paths:
```ts
it('should reject expired approval', async () => {
  const expired = await db.approval.create({
    expiresAt: new Date(Date.now() - 1000)
  });
  
  const isExpired = expired.expiresAt < new Date();
  expect(isExpired).toBe(true);
});
```

## Adding New Tests

### For New Phase

1. Create test file: `integration/phase-XX.test.ts`
2. Follow existing patterns (beforeAll, afterAll)
3. Test happy path + edge cases
4. Add to this README
5. Run: `npm test`

### Test Template

```ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { db } from '../../database';

describe('Phase XX: Feature Name', () => {
  let tenantId: string;
  let userId: string;

  beforeAll(async () => {
    // Create test tenant and user
  });

  afterAll(async () => {
    // Cleanup
  });

  it('should do something', async () => {
    // Arrange
    
    // Act
    
    // Assert
  });
});
```

## Continuous Integration

### GitHub Actions Workflow

File: `.github/workflows/test.yml`

```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
```

## Performance Benchmarks

Target performance for integration tests:

| Test Suite | Target Time | Current |
|-----------|----------|---------|
| Approvals | < 2s | - |
| Workflows | < 2s | - |
| Tenant Isolation | < 3s | - |
| **Total** | **< 7s** | - |

If tests exceed target, profile and optimize:
```bash
npm test -- --detectOpenHandles
```

## Reporting & Metrics

### Coverage Report

```bash
npm test -- --coverage

# HTML report
open coverage/lcov-report/index.html
```

### Test Failure Reports

Failures are logged to:
- Console (STDOUT)
- GitHub Actions artifacts
- Sentry (for production)

## Next Steps

### Phase 17 Additions

- [ ] Load testing suite (artillery, k6)
- [ ] API contract tests (OpenAPI validation)
- [ ] End-to-end tests (full workflow simulation)
- [ ] Security tests (injection, XSS, CSRF)
- [ ] Performance regression tests

### Phase 18 Additions

- [ ] Chaos engineering tests
- [ ] Database migration tests
- [ ] Backup/recovery tests

## Questions?

See CLAUDE.md for architectural decisions or contact the team.
