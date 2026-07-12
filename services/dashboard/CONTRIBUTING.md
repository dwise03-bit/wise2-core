# Contributing to WISE² Core

## Code Standards

### TypeScript
- Strict mode enabled
- No `any` types (use generics or union types)
- All public APIs must be typed
- Prefix unused parameters with `_`

### Formatting
- Prettier enforces code style
- 2-space indentation
- Semicolons required
- Run `npm run format` before commit

### Testing
- Unit tests for utilities
- Integration tests for database/API
- Minimum 80% coverage target
- Run tests locally: `npm test`

### Commits
- Descriptive messages: `fix: description` not `fixed stuff`
- Reference issues: `fixes #123`
- Atomic commits (one logical change)
- Example: `fix: Handle null user in auth middleware (fixes #42)`

## Process

1. **Before committing**
   ```bash
   npm run format      # Auto-fix formatting
   npm run type-check  # Verify types
   npm test           # Run tests
   npm run lint       # Check style
   ```

2. **Before pushing**
   ```bash
   npm run build      # Verify production build
   docker-compose build  # Test Docker builds
   ```

3. **Create pull request**
   - Link related issues
   - Describe what changed and why
   - Reference testing done

4. **Code review**
   - At least one approval required
   - All CI checks must pass
   - No unresolved feedback

## Getting Help

- **Setup issues**: See [Development Setup](./docs/guides/DEVELOPMENT_SETUP.md)
- **Architecture questions**: See [Architecture Guide](./docs/architecture/ARCHITECTURE.md)
- **API questions**: See [API Reference](./docs/api/REFERENCE.md)
- **Other**: Open a GitHub issue

