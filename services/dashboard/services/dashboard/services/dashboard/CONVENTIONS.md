# Wise² Code Standards & Conventions

**Version**: 1.0  
**Status**: MANDATORY  
**Owner**: CTO  
**Last Updated**: 2026-07-07

---

## Overview

All Wise² code MUST comply with these standards. Violations result in CI/CD failures.

---

## 1. File Structure

### 1.1 Service Structure

```
services/[service-name]/
├── src/
│   ├── index.ts              # Entry point
│   ├── server.ts             # Express server setup
│   ├── database.ts           # Database connection
│   ├── config.ts             # Configuration loading
│   ├── controllers/          # Route handlers
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   └── ...
│   ├── services/             # Business logic
│   │   ├── user-service.ts
│   │   └── ...
│   ├── repositories/         # Data access
│   │   ├── user-repository.ts
│   │   └── ...
│   ├── middlewares/          # Express middlewares
│   │   ├── auth.ts
│   │   ├── error-handler.ts
│   │   └── logging.ts
│   ├── utils/                # Helper functions
│   │   ├── validation.ts
│   │   ├── encryption.ts
│   │   └── db.ts
│   ├── types/                # TypeScript types
│   │   ├── user.ts
│   │   └── index.ts
│   ├── constants/            # Constants
│   │   ├── http-status.ts
│   │   └── error-codes.ts
│   └── routes/               # Route definitions
│       ├── auth-routes.ts
│       ├── user-routes.ts
│       └── index.ts
├── tests/
│   ├── unit/                 # Unit tests
│   │   ├── services/
│   │   └── utils/
│   ├── integration/          # Integration tests
│   │   └── api.test.ts
│   ├── fixtures/             # Test data
│   └── helpers/              # Test utilities
├── docs/
│   └── README.md
├── .env.example              # Environment template
├── .eslintrc.json            # Linting config
├── .prettierrc.json          # Formatting config
├── jest.config.js            # Test config
├── tsconfig.json             # TypeScript config
├── Dockerfile                # Container config
├── package.json              # Dependencies
└── docker-compose.test.yml   # Test environment
```

### 1.2 Naming Conventions

**Files**:
- Controllers: `[resource]-controller.ts`
- Services: `[resource]-service.ts`
- Repositories: `[resource]-repository.ts`
- Types: `[resource].ts`
- Utils: `[action]-[target].ts` (e.g., `validate-email.ts`)

**Directories**:
- Lowercase, plural: `controllers`, `services`, `utils`
- No underscores or camelCase: ❌ `user_services`, ❌ `userServices`

**Classes**:
- PascalCase: `UserService`, `AuthController`
- Suffix with type: `UserRepository`, `ValidationUtil`

**Functions**:
- camelCase: `getUserById`, `validateEmail`, `createDeployment`
- Action verb first: `get*`, `create*`, `update*`, `delete*`, `validate*`

**Variables**:
- camelCase: `userName`, `userId`, `isActive`
- Boolean prefix: `is*`, `has*`, `can*`, `should*`

**Constants**:
- UPPERCASE_WITH_UNDERSCORES: `MAX_RETRY_ATTEMPTS`, `DEFAULT_TIMEOUT_MS`

---

## 2. TypeScript Standards

### 2.1 Type Definitions

**Always define types**:
```typescript
// ❌ Bad
const getUser = (id) => { ... }

// ✅ Good
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'operator' | 'developer' | 'viewer';
}

const getUser = (id: string): Promise<User> => { ... }
```

### 2.2 Strict Mode

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### 2.3 Null/Undefined Handling

```typescript
// ❌ Bad - could be null
const name = user.name;

// ✅ Good - explicit handling
const name = user?.name ?? 'Unknown';

// ✅ Good - throw if required
if (!user) throw new Error('User not found');
const name = user.name;
```

### 2.4 Async/Await

```typescript
// ❌ Bad - callback hell
getUserAsync((err, user) => {
  if (err) { ... }
});

// ✅ Good - async/await
try {
  const user = await getUser(id);
  return user;
} catch (error) {
  logger.error('Failed to get user', error);
  throw new ApiError('User not found', 404);
}
```

---

## 3. Code Style

### 3.1 ESLint Configuration

`.eslintrc.json`:
```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "no-console": ["error", { "allow": ["warn", "error"] }],
    "no-var": "error",
    "prefer-const": "error",
    "prefer-arrow-callback": "error",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_"
    }],
    "@typescript-eslint/explicit-function-return-types": "error",
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "indent": ["error", 2]
  }
}
```

### 3.2 Prettier Configuration

`.prettierrc.json`:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
```

### 3.3 Code Style Rules

```
Indentation: 2 spaces
Quotes: Single quotes
Semicolons: Always
Line length: 100 characters (soft limit)
Trailing commas: es5 (objects, arrays)
Arrow functions: Always include parentheses
```

### 3.4 Formatting

**Pre-commit formatting**:
```bash
# Automatically format code before commit
prettier --write .
eslint --fix .
```

---

## 4. API Endpoint Standards

### 4.1 Controller Structure

```typescript
// ✅ Good
export class UserController {
  constructor(private userService: UserService) {}

  // Route: GET /api/v1/users/:id
  async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      
      if (!user) {
        throw new NotFoundError('User not found');
      }
      
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}
```

### 4.2 Error Handling

```typescript
// ✅ Good error handling
class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
  }
}

// In controller
if (!user) {
  throw new ApiError('User not found', 404, 'NOT_FOUND');
}

// Global error middleware
app.use((error: ApiError, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message,
    },
  });
});
```

---

## 5. Git & Commits

### 5.1 Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Test addition/modification
- `chore`: Build, dependencies, etc.

**Example**:
```
feat(auth): implement JWT token refresh

- Add refresh token endpoint
- Implement token rotation
- Add session invalidation

Closes #123
```

### 5.2 Branch Naming

```
feature/[feature-name]
fix/[bug-name]
refactor/[refactor-name]
docs/[documentation-name]

Example:
feature/user-authentication
fix/database-connection-pooling
```

### 5.3 Pull Request Standards

**Title**: Short, descriptive
```
✅ feat: Add JWT authentication to API
❌ Update stuff
```

**Description**: Include context, changes, and testing

**Checklist**:
- [ ] Tests pass
- [ ] Linting passes
- [ ] Code coverage maintained
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

---

## 6. Documentation Standards

### 6.1 Function Documentation

```typescript
/**
 * Validates user email format.
 * 
 * @param email - The email to validate
 * @returns true if email is valid, false otherwise
 * @throws Error if email is null
 * 
 * @example
 * const isValid = validateEmail('user@example.com'); // true
 */
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
```

### 6.2 Class Documentation

```typescript
/**
 * Manages user authentication and session handling.
 * Handles login, logout, token refresh, and password management.
 */
export class AuthService {
  /**
   * Authenticates user with email and password.
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    // Implementation
  }
}
```

### 6.3 In-Code Comments

**Only add comments for WHY, not WHAT**:

```typescript
// ❌ Bad - states what code does
// Increment counter by 1
counter++;

// ✅ Good - explains why
// Increment counter for rate limiting check
// (max 5 requests per minute allowed)
counter++;

// ✅ Good - explains non-obvious behavior
// Sort by created_at descending to show newest first
// (most recent deployments are most relevant to users)
const sorted = deployments.sort((a, b) => 
  b.createdAt.getTime() - a.createdAt.getTime()
);
```

---

## 7. Testing Standards

### 7.1 Test File Naming

```
UserService → user-service.test.ts (co-located)
utils/validation → validation.test.ts (co-located)
```

### 7.2 Test Structure

```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;

  beforeEach(() => {
    repository = new UserRepository();
    service = new UserService(repository);
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const user = await service.getUserById('123');
      expect(user).toBeDefined();
      expect(user.id).toBe('123');
    });

    it('should throw NotFoundError when user not found', async () => {
      await expect(service.getUserById('invalid')).rejects.toThrow(NotFoundError);
    });
  });
});
```

### 7.3 Coverage Targets

- Unit tests: 80%+ coverage
- Critical paths: 95%+ coverage
- Integration tests: All public APIs

---

## 8. Logging Standards

### 8.1 Log Levels

```typescript
logger.error('Critical errors only', error); // Production incidents
logger.warn('Warnings for unusual conditions'); // Needs attention
logger.info('Important state changes'); // Deployments, logins
logger.debug('Detailed debugging'); // Development only
```

### 8.2 Structured Logging

```typescript
// ❌ Bad
logger.info('User logged in');

// ✅ Good
logger.info('User login successful', {
  userId: user.id,
  email: user.email,
  ipAddress: req.ip,
  timestamp: new Date().toISOString(),
});
```

---

## 9. Performance Standards

### 9.1 Code Performance

- API endpoints: <200ms p95
- Database queries: <50ms p95
- No blocking operations in event loop
- Use async/await, not callbacks

### 9.2 Memory Management

- Monitor memory usage
- Clean up resources (close connections)
- Avoid memory leaks in event listeners

### 9.3 Dependencies

- Minimize bundle size
- Use tree-shaking compatible imports
- Review dependency licenses

---

## 10. Security Standards

### 10.1 Input Validation

```typescript
// ✅ Good - validate all input
const createUser = async (email: string, password: string): Promise<User> => {
  if (!email || !password) {
    throw new ValidationError('Email and password required');
  }
  
  if (!isValidEmail(email)) {
    throw new ValidationError('Invalid email format');
  }
  
  // ... continue
};
```

### 10.2 SQL Injection Prevention

```typescript
// ❌ Bad - SQL injection risk
const result = await db.query(`SELECT * FROM users WHERE id = ${id}`);

// ✅ Good - parameterized queries
const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
```

### 10.3 Secrets Management

```typescript
// ❌ Bad - hardcoded secret
const secret = 'my-secret-key-123';

// ✅ Good - environment variable
const secret = process.env.JWT_SECRET;
if (!secret) throw new Error('JWT_SECRET not configured');
```

---

## 11. CI/CD Enforcement

### 11.1 Pre-Commit Checks

```bash
# Automatically run before commit
- Linting (ESLint)
- Formatting (Prettier)
- Type checking (tsc)
- Unit tests (Jest)
```

### 11.2 PR Checks

```
- All pre-commit checks pass
- Code coverage maintained
- No security vulnerabilities
- Documentation updated
- Commit messages follow format
```

---

## Compliance & Enforcement

**All code must comply with these standards.**

Violations result in:
- ❌ CI/CD pipeline failure
- ❌ Code review rejection
- ❌ Production deployment failure

**Exceptions** require CTO approval and documentation.

---

**Last Updated**: 2026-07-07  
**Review Date**: 2026-10-07  
**Owner**: CTO
