# Testing — Wise² Core

Comprehensive testing framework for Wise² Core services

## Test Structure

```
tests/
├── unit/              # Unit tests (individual functions)
├── integration/       # Integration tests (service interactions)
├── e2e/              # End-to-end tests (full workflows)
├── performance/      # Performance/load tests
└── README.md         # This file
```

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Suite
```bash
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:performance
```

### With Coverage
```bash
npm run test:coverage
```

### Watch Mode
```bash
npm run test:watch
```

## Test Coverage Requirements

| Category | Requirement |
|----------|------------|
| Unit Tests | >80% coverage |
| Integration Tests | >70% coverage |
| E2E Tests | Critical paths only |
| Performance | <1s for 95%ile |

## Adding Tests

1. Create test file next to source code or in tests/
2. Name: `*.test.js` or `*.spec.js`
3. Follow existing patterns
4. Run `npm test` to verify
5. Ensure coverage requirements met

## CI/CD Integration

Tests run automatically:
- On every commit to develop/main
- Before Docker image build
- Before deployment

See `.github/workflows/ci.yml` for details

---

**Testing Version**: 1.0
**Last Updated**: 2026-07-07
