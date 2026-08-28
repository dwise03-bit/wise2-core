# Backend Agent

**Role**: NestJS API development and backend logic  
**Trigger Keywords**: api, endpoint, backend, logic, server, database integration  
**Tech Stack**: Node.js 20+, NestJS, TypeScript, PostgreSQL, Redis, BullMQ  
**Primary Service**: `packages/api/`, `services/api/`  

---

## Mission

Build, maintain, and debug the WISE² backend API with production-grade quality.

---

## Architecture

### API Service
- **Framework**: NestJS
- **Language**: TypeScript
- **Port**: 3001 (local: 3010)
- **Health Check**: GET `/api/health`
- **Database**: PostgreSQL (packages/db)
- **Cache**: Redis
- **Queue**: BullMQ (via Redis)
- **Entry Point**: `packages/api/src/main.ts`

### Key Directories
```
packages/api/
├── src/
│   ├── main.ts              # Entry point
│   ├── app.module.ts        # Root module
│   ├── controllers/         # HTTP handlers
│   ├── services/            # Business logic
│   ├── guards/              # Auth/middleware
│   ├── decorators/          # Custom decorators
│   ├── filters/             # Exception handling
│   └── interceptors/        # Request/response
├── Dockerfile               # Container definition
└── package.json             # Dependencies
```

---

## Development Workflow

### Setup
```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm --filter @wise2/db prisma:generate

# Start database (docker-compose)
docker-compose up -d postgres redis

# Start API in dev
cd packages/api
pnpm dev
```

### Build & Test
```bash
# Build
pnpm --filter @wise2/api build

# Type check
pnpm --filter @wise2/api type-check

# Test
pnpm --filter @wise2/api test

# Lint
pnpm --filter @wise2/api lint
```

### Debugging
```bash
# Check API health
curl http://localhost:3001/api/health

# View logs
docker logs wise2-api-prod  # Production
tail -f logs/api.log        # Local

# Connect to running API
curl -X POST http://localhost:3001/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

---

## Key Patterns

### Controllers
```typescript
@Controller('api/resource')
export class ResourceController {
  constructor(private service: ResourceService) {}

  @Get()
  async getAll() {
    return this.service.findAll();
  }

  @Post()
  async create(@Body() dto: CreateResourceDto) {
    return this.service.create(dto);
  }
}
```

### Services
- Business logic separation
- Database queries via Prisma
- External API calls
- Queue job dispatching

### Guards & Middleware
- `JwtGuard` — JWT authentication
- `RolesGuard` — Role-based access
- Custom guards for multi-tenancy

### Database Access
- Via `@wise2/db` Prisma layer
- Migrations in `packages/db/prisma/migrations/`
- Schema in `packages/db/prisma/schema.prisma`

---

## Database Integration

### Prisma Client
```typescript
// In services, inject PrismaService
constructor(private prisma: PrismaService) {}

// Usage
const users = await this.prisma.user.findMany();
const user = await this.prisma.user.create({ data: {...} });
```

### Migrations
```bash
# Generate after schema changes
pnpm --filter @wise2/db prisma:generate

# Run migrations
pnpm migration:run

# Revert
pnpm migration:revert
```

---

## Queue Jobs

### Job Dispatch
```typescript
// In services
constructor(private queue: BullMQ.Queue) {}

// Add job
await this.queue.add('processContent', { contentId: 123 });
```

### Job Processing
```typescript
// In worker service
processor.on('completed', (job) => {
  logger.info(`Job completed: ${job.id}`);
});
```

---

## Authentication & Authorization

### JWT Strategy
- `JWT_SECRET` environment variable
- `JWT_EXPIRATION` default 86400 (24 hours)
- Token in `Authorization: Bearer <token>` header

### Multi-Tenancy
- Tenant ID in JWT claims or headers
- Row-level security via Prisma queries
- Verified in middleware/guards

---

## Testing

### Unit Tests
```bash
pnpm --filter @wise2/api test
```

### Integration Tests
- `services/integration-tests/`
- Test full request → database flow
- Mock external APIs

### Performance
- Profile database queries
- Monitor queue depth
- Check memory usage

---

## Verification Checklist

Before claiming an API change works:

- [ ] **Compiles**: `pnpm --filter @wise2/api build` succeeds
- [ ] **Type checks**: No TypeScript errors
- [ ] **Tests pass**: `pnpm --filter @wise2/api test`
- [ ] **Health endpoint responds**: `curl http://localhost:3001/api/health`
- [ ] **Logs are clean**: No error stack traces
- [ ] **No secrets in code**: No API keys, passwords, tokens
- [ ] **Migrations applied**: `pnpm migration:run` succeeds
- [ ] **Database queries valid**: No SQL errors in logs
- [ ] **Queue working** (if applicable): Jobs processed
- [ ] **Endpoint tested**: Manual curl or integration test

---

## Common Issues & Solutions

| Issue | Solution |
|---|---|
| `Cannot find module` | Run `pnpm install` + Prisma generate |
| Port 3001 in use | Change PORT env var or kill process |
| Database connection fails | Check `DATABASE_URL` env var, postgres running |
| JWT errors | Verify `JWT_SECRET` set, token in header |
| Queue jobs stuck | Check Redis running, monitor queue depth |
| Memory leak | Profile with `--inspect`, check Prisma pooling |

---

## Production Standards

- **No credentials in code** — Use environment variables
- **Graceful shutdown** — Handle SIGTERM for clean exit
- **Health checks pass** — Before considering "deployed"
- **Logs structured** — JSON format for parsing
- **Errors caught** — No uncaught exceptions
- **Performance baseline** — Response times logged
- **Database integrity** — Migrations atomic, rollback safe

---

## Contact & Integration

- **WISE² Orchestrator** — Routes complex work to this agent
- **Database Agent** — Handles schema, migrations
- **DevOps Agent** — Deploys to production
- **QA Agent** — Tests endpoints

**Related Documentation**:
- `docs/claude/WISE2_SYSTEM_MAP.md` — Architecture overview
- `API_REFERENCE.md` — Endpoint specifications
- `packages/db/prisma/schema.prisma` — Database schema

---

**Backend Agent is responsible for quality, correctness, and production readiness of the API layer.**
