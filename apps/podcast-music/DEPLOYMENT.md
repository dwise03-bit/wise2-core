# WISE² Podcast Music - Deployment Guide

## Overview

This is the production-ready backend API for WISE² Podcast Music generation platform. It provides:

- User authentication with JWT
- Podcast project management (CRUD)
- AI audio generation job submission
- Audio file download management
- Stripe subscription billing ($49/month)
- Usage tracking and rate limiting
- PostgreSQL database integration

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Stripe account (test keys provided in .env.example)
- Environment variables configured

## Local Development Setup

### 1. Install Dependencies

```bash
cd apps/podcast-music
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in required values:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Random secret key for JWT signing
- Stripe test keys (pk_test_*, sk_test_*)

### 3. Database Setup

Run Prisma migrations:

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Open Prisma Studio to inspect database
npm run db:studio
```

### 4. Start Development Server

```bash
npm run dev
```

Server runs on http://localhost:3003

## API Routes

### Authentication

**POST /api/auth/signup** - Register new user
```bash
curl -X POST http://localhost:3003/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "User Name",
    "password": "SecurePassword123",
    "confirmPassword": "SecurePassword123"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "name": "..." },
    "token": "eyJhbGc..."
  }
}
```

**POST /api/auth/login** - Login user
```bash
curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123"
  }'
```

### Projects (Requires Auth)

All project endpoints require `Authorization: Bearer {token}` header.

**GET /api/projects** - List user's projects
```bash
curl http://localhost:3003/api/projects?limit=10&offset=0 \
  -H "Authorization: Bearer $TOKEN"
```

**POST /api/projects** - Create project
```bash
curl -X POST http://localhost:3003/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Episode 1 Intro",
    "podcastName": "My Podcast",
    "mood": "upbeat",
    "genre": "electronic",
    "duration": 300
  }'
```

**GET /api/projects/[id]** - Get project details
```bash
curl http://localhost:3003/api/projects/cid123 \
  -H "Authorization: Bearer $TOKEN"
```

**PUT /api/projects/[id]** - Update project
```bash
curl -X PUT http://localhost:3003/api/projects/cid123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Updated Title",
    "mood": "calm"
  }'
```

**DELETE /api/projects/[id]** - Delete project
```bash
curl -X DELETE http://localhost:3003/api/projects/cid123 \
  -H "Authorization: Bearer $TOKEN"
```

### Audio Generation

**POST /api/generate** - Start generation job
```bash
curl -X POST http://localhost:3003/api/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "podcastProjectId": "cid123",
    "prompt": "Create upbeat electronic music for a tech podcast"
  }'
```

Response (202 Accepted):
```json
{
  "success": true,
  "data": {
    "audioGeneration": {
      "id": "...",
      "jobId": "job_...",
      "status": "QUEUED",
      "progress": 0
    }
  }
}
```

**GET /api/generate?jobId=job_123** - Check job status
```bash
curl "http://localhost:3003/api/generate?jobId=job_123" \
  -H "Authorization: Bearer $TOKEN"
```

### Downloads

**GET /api/download?audioGenerationId=aid_123** - Download audio file
```bash
curl http://localhost:3003/api/download?audioGenerationId=aid_123 \
  -H "Authorization: Bearer $TOKEN" \
  --output podcast_music.mp3
```

**HEAD /api/download?audioGenerationId=aid_123** - Get file metadata
```bash
curl -I http://localhost:3003/api/download?audioGenerationId=aid_123 \
  -H "Authorization: Bearer $TOKEN"
```

### Subscription

**GET /api/subscription** - Get current subscription
```bash
curl http://localhost:3003/api/subscription \
  -H "Authorization: Bearer $TOKEN"
```

**POST /api/subscription** - Create subscription
```bash
curl -X POST http://localhost:3003/api/subscription \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "paymentMethodId": "pm_...",
    "priceId": "price_..."
  }'
```

**DELETE /api/subscription** - Cancel subscription
```bash
curl -X DELETE http://localhost:3003/api/subscription \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{}'
```

### Health Check (No Auth)

**GET /api/health**
```bash
curl http://localhost:3003/api/health
```

## Production Deployment

### 1. Environment Setup

Set production environment variables on your hosting platform:

```
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db:5432/podcast_music
JWT_SECRET=<generate-strong-secret>
NEXT_PUBLIC_APP_URL=https://api.wise2.com

# Stripe (Live Keys)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRODUCT_ID=prod_...
```

### 2. Database Migration

```bash
npm run db:generate
npm run db:migrate
```

### 3. Build

```bash
npm run build
```

### 4. Start Server

```bash
npm run start
```

### 5. Configure Stripe Webhooks

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://api.wise2.com/api/webhooks/stripe`
3. Subscribe to events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

## Docker Deployment

### Build Image

```bash
docker build -t wise2-podcast-music:latest -f Dockerfile .
```

### Run Container

```bash
docker run -p 3003:3003 \
  -e DATABASE_URL="postgresql://user:pass@db:5432/podcast_music" \
  -e JWT_SECRET="your-secret" \
  -e NODE_ENV="production" \
  wise2-podcast-music:latest
```

## Kubernetes Deployment

See `k8s/` directory for Kubernetes manifests:
- `deployment.yaml` - App deployment
- `service.yaml` - Service exposure
- `configmap.yaml` - Configuration
- `secret.yaml` - Secrets management

Deploy with:
```bash
kubectl apply -f k8s/
```

## Monitoring & Logging

### Application Logs

The app logs to stdout with structured JSON format:

```bash
# View logs
docker logs -f container-id

# Filter by level
docker logs container-id 2>&1 | grep ERROR
```

### Database Performance

Monitor slow queries in PostgreSQL:

```sql
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Health Checks

Configure health endpoint for load balancers:

```
Endpoint: /api/health
Interval: 30 seconds
Timeout: 5 seconds
Success Codes: 200
```

## Error Handling

All errors follow consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

Common error codes:
- `VALIDATION_ERROR` (400) - Invalid input
- `AUTH_FAILED` (401) - Authentication failed
- `FORBIDDEN` (403) - Access denied
- `NOT_FOUND` (404) - Resource not found
- `LIMIT_EXCEEDED` (429) - Rate limit exceeded
- `INTERNAL_ERROR` (500) - Server error

## Security

### Best Practices Implemented

✓ Password hashing with bcrypt  
✓ JWT tokens (7-day expiration)  
✓ CORS headers configured  
✓ Request validation with Zod  
✓ SQL injection prevention (Prisma ORM)  
✓ Webhook signature verification (Stripe)  
✓ Rate limiting by subscription tier  
✓ HTTPS in production  

### Additional Recommendations

1. **API Rate Limiting**: Implement middleware for non-authenticated endpoints
2. **HTTPS Only**: Enforce in production
3. **CORS**: Configure allowed origins
4. **API Keys**: Consider API key authentication for machine-to-machine
5. **Audit Logging**: Log sensitive operations
6. **Database Backups**: Daily automated backups
7. **Secrets Management**: Use environment variable vaults

## Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED
```

Check:
1. PostgreSQL is running
2. DATABASE_URL is correct
3. Network connectivity

### JWT Errors

```
Invalid or expired token
```

Ensure:
1. Token includes `Bearer ` prefix
2. Token is not expired (7 days)
3. JWT_SECRET matches between instances

### Stripe Integration Issues

Check:
1. Stripe API keys are correct (sk_test_ vs sk_live_)
2. Webhook secret matches
3. Price/Product IDs are valid in Stripe dashboard

### File Upload Issues

For audio file downloads, ensure:
1. S3/storage credentials are configured
2. Bucket is accessible
3. File paths are correct

## Performance Tuning

### Database Indexes

Key indexes are created in migration:
- `PodcastProject_userId_idx`
- `AudioGeneration_jobId_idx`
- `UsageRecord_createdAt_idx`

### Connection Pooling

Configure in DATABASE_URL:

```
postgresql://user:pass@localhost/db?pool_size=20
```

### Caching

Consider adding Redis for:
- Session caching
- Rate limit counters
- Job status polling

## Maintenance

### Regular Tasks

- [ ] Review error logs weekly
- [ ] Check database size monthly
- [ ] Audit user access quarterly
- [ ] Rotate API secrets annually
- [ ] Update dependencies monthly

### Backup Strategy

```bash
# Daily automated backup
pg_dump podcast_music | gzip > backup_$(date +%Y%m%d).sql.gz

# Verify backup
gunzip -c backup_*.sql.gz | psql podcast_music
```

## Support

For issues or questions:
- Check logs: `npm run logs`
- Database inspection: `npm run db:studio`
- API health: `/api/health`
- Contact: support@wise2.com
