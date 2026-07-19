# Collaboration System Setup Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 13+
- Prisma 5.x
- NestJS 9+
- Socket.IO 4.x

## Installation

### 1. Environment Variables

Add to `.env` or `.env.production`:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,https://example.com

# WebSocket Configuration
WEBSOCKET_NAMESPACE=/collaboration
WEBSOCKET_TRANSPORTS=websocket,polling

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/wise2

# Node Environment
NODE_ENV=production
```

### 2. Database Setup

The Prisma schema already includes collaboration models. Run migrations:

```bash
# Development
npx prisma migrate dev --name collaboration_system

# Production
npx prisma migrate deploy
```

**Models created:**
- `ProjectCollaborator` - Track collaborators and roles
- `ProjectInvite` - Shareable invitations
- `ProjectComment` - Comments and threading
- `ActivityLog` - Audit trail (14+ action types)
- `VersionHistory` - Version snapshots
- `UserPresence` - Real-time presence tracking

### 3. Install Dependencies

```bash
npm install socket.io socket.io-client
npm install @nestjs/websockets @nestjs/platform-socket.io
```

**Already included:**
- `@nestjs/common`
- `@nestjs/config`
- `@nestjs/jwt`
- `@prisma/client`

### 4. Module Registration

The `CollaborationModule` has already been created. Update `app.module.ts`:

```typescript
import { CollaborationModule } from './collaboration/collaboration.module';

@Module({
  imports: [
    // ... existing modules ...
    CollaborationModule,  // Add this
  ],
})
export class AppModule {}
```

### 5. WebSocket Configuration

**Socket.IO is configured in `collaboration.gateway.ts`:**

```typescript
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(','),
    credentials: true,
  },
  namespace: '/collaboration',
  transports: ['websocket', 'polling'],
})
```

**Features:**
- ✅ CORS properly configured
- ✅ Fallback to long-polling
- ✅ Namespace isolation
- ✅ Automatic connection pooling

### 6. Database Connection Pooling

The Prisma service handles connection pooling automatically:

```typescript
// packages/api/src/prisma/prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }
}
```

**Connection pool sizing:**
- Min: 2 connections
- Max: 10 connections (configurable via DATABASE_URL)

### 7. Logging Configuration

Uses Winston logger (recommended):

```typescript
import { Logger } from '@nestjs/common';

// In any service/controller
private readonly logger = new Logger('MyService');

logger.log('Info message');
logger.warn('Warning message');
logger.error('Error message', stackTrace);
logger.debug('Debug message');
```

### 8. Rate Limiting

Built into `CollaborationService`:

```typescript
// 10 edits per 500ms per track per user
const allowed = this.collaborationService.checkRateLimit(
  userId,
  projectId,
  trackId
);

if (!allowed) {
  throw new RateLimitException();
}
```

**Configuration (in service):**
```typescript
private readonly RATE_LIMIT_WINDOW = 500; // milliseconds
private readonly RATE_LIMIT_MAX = 10; // edits per window
```

---

## Running the Application

### Development

```bash
cd packages/api
npm run start:dev
```

**Logs:**
```
[22:10:08] Starting Nest application...
[22:10:09] WebSocket Gateway initialized
[22:10:09] Swagger docs available at /api/docs
[22:10:09] WISE² API listening on port 3001
```

### Production

```bash
cd packages/api
npm run build
npm run start:prod
```

---

## Verification Checklist

After deployment, verify:

- [ ] **API Health Check**
  ```bash
  curl http://localhost:3001/api/health
  ```

- [ ] **WebSocket Connection**
  ```bash
  wscat -c ws://localhost:3001/collaboration
  ```

- [ ] **Swagger Documentation**
  ```
  http://localhost:3001/api/docs
  ```

- [ ] **Database Connection**
  ```bash
  npx prisma db execute --stdin << 'EOF'
  SELECT version();
  EOF
  ```

- [ ] **JWT Authentication**
  ```bash
  curl -X GET http://localhost:3001/api/projects/test/collaborators \
    -H "Authorization: Bearer valid-jwt-token"
  ```

- [ ] **Permission Checks**
  ```bash
  # Should succeed (owner has all permissions)
  curl -X POST http://localhost:3001/api/projects/proj-123/comments \
    -H "Authorization: Bearer owner-token" \
    -d '{"content":"Test"}'

  # Should fail (viewer lacks permission)
  curl -X POST http://localhost:3001/api/projects/proj-123/comments \
    -H "Authorization: Bearer viewer-token" \
    -d '{"content":"Test"}'
  ```

---

## Testing

### Run Unit Tests

```bash
npm run test -- collaboration.service.spec.ts
```

**Coverage Target:** 80%+

**Test Suites:**
- `collaboration.service.spec.ts` - 400 lines, 6 test suites
- `collaboration.gateway.spec.ts` - 300 lines, 8 test suites
- `collaboration.controller.spec.ts` - 200 lines, 4 test suites

### Run Integration Tests

```bash
npm run test:e2e -- collaboration
```

---

## Performance Tuning

### Database Optimization

1. **Indexes (already in schema):**
   ```sql
   -- Automatically created by Prisma
   CREATE INDEX idx_project_collaborator_project ON project_collaborator(project_id);
   CREATE INDEX idx_project_collaborator_user ON project_collaborator(user_id);
   CREATE INDEX idx_project_comment_project ON project_comment(project_id);
   CREATE INDEX idx_project_comment_track ON project_comment(track_id);
   CREATE INDEX idx_activity_log_project ON activity_log(project_id);
   CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);
   ```

2. **Query Optimization:**
   - Use `select` to fetch only needed fields
   - Batch queries when possible
   - Use database transactions for consistency

### WebSocket Optimization

1. **Connection Limits:**
   - Max 100+ concurrent connections per server
   - Monitor memory usage: ~1-2MB per connection

2. **Message Optimization:**
   - Compress large payloads
   - Use binary frames for audio data
   - Batch multiple edits into single message

3. **Presence Cleanup:**
   - Runs every 60 seconds
   - Removes stale connections (30 second timeout)

### Memory Management

```typescript
// Automatic cleanup in service
private startPresenceCleanup() {
  setInterval(async () => {
    // Cleans database and in-memory cache
    // Runs every 60 seconds
  }, 60000);
}
```

---

## Monitoring & Health Checks

### Health Endpoint

```bash
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-07-19T15:00:00Z",
  "uptime": 3600,
  "database": "connected",
  "websocket": "running"
}
```

### Metrics Export (Prometheus-ready)

```bash
GET /api/metrics
```

**Metrics tracked:**
- `collaboration_connections_active` - Active WebSocket connections
- `collaboration_edits_total` - Total edits processed
- `collaboration_errors_total` - Total errors
- `collaboration_rate_limit_hits` - Rate limit violations
- `database_query_duration_ms` - Query performance

---

## Troubleshooting

### Database Connection Issues

**Error:** `connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
1. Verify PostgreSQL is running: `pg_isready`
2. Check DATABASE_URL format
3. Verify credentials and database name
4. Check firewall rules if remote database

### WebSocket Connection Issues

**Error:** `WebSocket connection failed`

**Solution:**
1. Verify CORS_ORIGIN is correct
2. Check firewall allows WebSocket traffic
3. Verify JWT token is valid
4. Check projectId parameter is provided

### Permission Denied Errors

**Error:** `Permission denied: edit_track`

**Solution:**
1. Verify user has collaborator record or is owner
2. Check role is not VIEWER
3. Verify ProjectCollaborator.permissions includes required permission
4. Check JWT payload includes correct user ID

### Memory Leaks

**Symptom:** Memory usage grows over time

**Solution:**
1. Verify presence cleanup is running
2. Check disconnection handlers are being called
3. Monitor connection map size: `gateway.connectionMap.size`
4. Restart server if memory exceeds threshold

---

## Deployment

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY . .
RUN npm ci --only=production
RUN npx prisma generate

EXPOSE 3001

CMD ["node", "dist/packages/api/src/main.js"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://wise2:password@postgres:5432/wise2
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: wise2
      POSTGRES_USER: wise2
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wise2-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: wise2-api
  template:
    metadata:
      labels:
        app: wise2-api
    spec:
      containers:
      - name: api
        image: wise2:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: wise2-secrets
              key: database-url
```

---

## Security Considerations

1. **JWT Secret:** Change `JWT_SECRET` in production
2. **CORS:** Restrict `CORS_ORIGIN` to your domain
3. **Database:** Use SSL connection for PostgreSQL
4. **Rate Limiting:** Adjust `RATE_LIMIT_MAX` based on requirements
5. **Logging:** Avoid logging sensitive data (passwords, tokens)

---

## Additional Resources

- [COLLABORATION_API.md](./COLLABORATION_API.md) - Complete API reference
- [Socket.IO Docs](https://socket.io/docs/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [NestJS Docs](https://docs.nestjs.com/)

---

**Last Updated:** 2026-07-19  
**Status:** Production-Ready
