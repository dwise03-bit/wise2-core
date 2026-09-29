---
type: architecture-module
date: 2026-07-07
tags: [wise2, api, backend, nodejs]
ai-first: true
---

# Module: API Service (Backend)

## For future Claude

The API is the core backend service handling all business logic, database operations, and integrations. Built with Node.js and TypeScript, deployed in Docker. Exposes REST endpoints for the dashboard, admin panel, Discord bot, and worker queue.

---

## Module Overview

```
API Service
├── Framework: Node.js + Express (or Fastify)
├── Language: TypeScript
├── Database: PostgreSQL 15
├── Cache: Redis 7
├── Port: 3001 (production), 3001 (development)
├── Logging: Structured (JSON)
└── Entry Point: /services/api/src/index.ts
```

## Directory Structure

```
services/api/
├── src/
│   ├── index.ts ..................... Service entry point
│   ├── server.ts .................... Express/server setup
│   ├── config.ts .................... Environment config
│   ├── logger.ts .................... Structured logging
│   ├── database.ts .................. PostgreSQL client
│   ├── redis.ts ..................... Redis client
│   ├── routes/
│   │   ├── waitlist.ts .............. POST /api/waitlist
│   │   ├── metrics.ts ............... GET /api/metrics
│   │   ├── health.ts ................ GET /api/health
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.ts .................. JWT verification
│   │   ├── rateLimit.ts ............ Rate limiting
│   │   └── errorHandler.ts ........ Error handling
│   ├── services/
│   │   ├── waitlist.ts .............. Waitlist logic
│   │   ├── email.ts ................. Email sending (Resend)
│   │   ├── analytics.ts ............ Analytics processing
│   │   └── ...
│   ├── models/
│   │   ├── User.ts .................. User schema
│   │   ├── Waitlist.ts .............. Waitlist schema
│   │   └── ...
│   └── utils/
│       ├── validation.ts ............ Input validation
│       ├── errors.ts ................ Error types
│       └── crypto.ts ................ Encryption utils
├── migrations/
│   ├── 001_create_waitlist_table.sql
│   ├── 002_create_users_table.sql
│   └── ...
├── tests/
│   ├── setup.ts ..................... Test environment
│   ├── routes.test.ts ............... Route tests
│   └── services.test.ts ............ Service tests
├── Dockerfile ........................ Container config
├── jest.config.js ................... Test runner config
├── tsconfig.json .................... TypeScript config
├── package.json ..................... Dependencies
└── README.md ........................ Local docs
```

## Core Endpoints

### Waitlist Management

**POST /api/waitlist**
```
Body: { email: "founder@example.com" }
Response: { success: true, email: string }
Status: 200 | 400 (invalid email) | 500 (error)
```
- Validates email format
- Checks for duplicates
- Saves to PostgreSQL
- Sends confirmation email (future)
- Returns 409 if already exists

### Health & Metrics

**GET /api/health**
```
Response: {
  status: "ok" | "degraded" | "error",
  timestamp: ISO8601,
  database: "connected" | "disconnected",
  redis: "connected" | "disconnected",
  uptime: seconds
}
```

**GET /api/metrics**
```
Response: {
  waitlist_signups: number,
  unique_visitors: number,
  conversion_rate: percentage,
  last_24h_signups: number
}
```

### Admin Endpoints (Protected)

**GET /api/admin/waitlist**
- List all waitlist entries
- Filters: email, date range, status
- Pagination support

**POST /api/admin/export**
- Export waitlist as CSV
- Include timestamp and metadata

## Database Schema

### waitlist table
```sql
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, unsubscribed
  source VARCHAR(100) DEFAULT 'landing_page', -- utm tracking
  metadata JSONB -- utm params, referrer, etc.
);

CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at);
CREATE INDEX idx_waitlist_status ON waitlist(status);
```

### users table (future)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'user', -- user, admin, operator
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/wise2

# Redis
REDIS_URL=redis://localhost:6379

# Email (Resend)
RESEND_API_KEY=re_...

# Server
PORT=3001
NODE_ENV=production
LOG_LEVEL=info

# Authentication
JWT_SECRET=your_secret_key
JWT_EXPIRY=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

## Services

### Waitlist Service
```typescript
class WaitlistService {
  async addEmail(email: string, metadata?: object): Promise<Waitlist>
  async getByEmail(email: string): Promise<Waitlist | null>
  async list(filters?: object, pagination?: object): Promise<Waitlist[]>
  async export(): Promise<Buffer> // CSV export
  async sendConfirmationEmail(email: string): Promise<void>
}
```

### Email Service (Resend)
```typescript
class EmailService {
  async sendConfirmation(email: string): Promise<void>
  async sendWelcome(email: string, data: object): Promise<void>
  async sendBulk(emails: string[], template: string): Promise<void>
}
```

## Middleware Stack

1. **Logger** — Log every request (structure format)
2. **CORS** — Allow frontend requests
3. **Body Parser** — Parse JSON
4. **Rate Limiter** — 100 req/minute per IP
5. **Authentication** — JWT verification (for protected routes)
6. **Error Handler** — Catch and format errors

## Error Handling

All errors follow standard format:
```json
{
  "error": "validation_error",
  "message": "Email is required",
  "status": 400,
  "timestamp": "2026-07-07T18:45:00Z"
}
```

**Error types:**
- `validation_error` (400) — Input validation failed
- `duplicate_email` (409) — Email already in waitlist
- `not_found` (404) — Resource not found
- `unauthorized` (401) — Auth failed
- `internal_error` (500) — Server error

## Testing

### Unit Tests
```bash
npm test -- services/
```
- Service logic
- Validation
- Error cases

### Integration Tests
```bash
npm test -- routes/
```
- Database operations
- Redis operations
- Full request/response flow

### E2E Tests
```bash
npm test -- e2e/
```
- API endpoints
- External integrations

## Deployment

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
EXPOSE 3001
CMD ["npm", "start"]
```

### Health Check
```bash
docker run -e HEALTHCHECK=curl localhost:3001/api/health
```

## Monitoring

### Metrics Collection
- Request count by endpoint
- Response times (p50, p95, p99)
- Error rate by status code
- Database query times
- Redis operation times

### Alerts
- Error rate > 5%
- Response time > 1s (p95)
- Database connection pool exhausted
- Redis connection lost
- Disk space < 10%

## Performance

- **Target:** <100ms response time (p95)
- **Throughput:** 1000+ req/sec
- **Database:** Connection pool size 20
- **Redis:** Connection pool size 10
- **Caching:** Metrics cached 5 minutes

## Related

- [[Architecture Overview]]
- [[Database Schema]]
- [[Monitoring and Alerts]]
- [[Deployment Runbook]]

---

**Status:** 🟢 Production-ready  
**Last updated:** 2026-07-07  
**Owner:** Daniel Wise  
**Confidence:** high
