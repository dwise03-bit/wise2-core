# WISE² Podcast Music Backend

Production-ready Next.js API for AI-powered podcast music generation with Stripe billing integration.

## Features

✨ **User Management**
- JWT-based authentication
- User registration and login
- Role-based access control (CUSTOMER, ADMIN, FOUNDER)

🎵 **Podcast Projects**
- Create, read, update, delete podcast projects
- Track project status (DRAFT, GENERATING, READY, COMPLETED, FAILED)
- Organize by metadata (podcast name, category, episode number)

🤖 **AI Audio Generation**
- Submit audio generation jobs
- Track job progress and status
- Support for custom prompts and AI models
- Error handling and retry logic

📥 **Audio Management**
- Download generated audio files
- File metadata retrieval
- Usage tracking for billing

💳 **Stripe Billing**
- $49/month Pro subscription plan
- Usage-based rate limiting (10/100 generations per month)
- Webhook handling for subscription events
- Trial period support

📊 **Analytics & Monitoring**
- Usage tracking per user
- Cost calculation
- Database health checks
- Structured logging

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with jose
- **Payments**: Stripe SDK
- **Validation**: Zod
- **Security**: bcryptjs for password hashing

## Quick Start

### 1. Install

```bash
cd apps/podcast-music
npm install
```

### 2. Configure

Copy environment template:
```bash
cp .env.example .env.local
```

### 3. Database

```bash
npm run db:generate
npm run db:migrate
```

### 4. Run

```bash
npm run dev
```

Visit http://localhost:3003

## API Documentation

### Authentication

- **POST /api/auth/signup** - Register new user
- **POST /api/auth/login** - Login user

### Projects (Auth Required)

- **GET /api/projects** - List projects
- **POST /api/projects** - Create project
- **GET /api/projects/[id]** - Get project details
- **PUT /api/projects/[id]** - Update project
- **DELETE /api/projects/[id]** - Delete project

### Audio Generation

- **POST /api/generate** - Start generation job
- **GET /api/generate?jobId=...** - Check job status

### Downloads

- **GET /api/download?audioGenerationId=...** - Download audio
- **HEAD /api/download?audioGenerationId=...** - Get metadata

### Subscription

- **GET /api/subscription** - Get current subscription
- **POST /api/subscription** - Create subscription
- **DELETE /api/subscription** - Cancel subscription

### Health

- **GET /api/health** - Health check (no auth)

## Project Structure

```
apps/podcast-music/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── projects/
│   │   │   ├── route.ts (GET, POST)
│   │   │   └── [id]/
│   │   │       └── route.ts (GET, PUT, DELETE)
│   │   ├── generate/
│   │   │   └── route.ts
│   │   ├── download/
│   │   │   └── route.ts
│   │   ├── subscription/
│   │   │   └── route.ts
│   │   ├── webhooks/
│   │   │   └── stripe/
│   │   │       └── route.ts
│   │   └── health/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── jwt.ts - JWT token creation
│   ├── prisma.ts - Database client
│   ├── stripe.ts - Stripe utilities
│   ├── utils.ts - Helper functions
│   └── validations.ts - Zod schemas
├── middleware.ts - JWT verification
├── .env.example - Environment template
├── DEPLOYMENT.md - Production guide
└── README.md

packages/db/
├── prisma/
│   ├── schema.prisma - Data models
│   └── migrations/
│       └── add_podcast_music_models/ - Podcast models
```

## Database Models

### User
- User accounts with roles
- Relationships: subscription, projects, usageRecords

### Subscription
- Billing information (Stripe customer/subscription IDs)
- Plan tier (STARTER, PRO, ENTERPRISE)
- Status tracking (ACTIVE, CANCELED, PAST_DUE, TRIALING)

### PodcastProject
- User's podcast projects
- Metadata: podcast name, category, episode number, mood, genre
- Status tracking: DRAFT → GENERATING → READY → COMPLETED

### AudioGeneration
- AI-generated audio tracks
- Job tracking with Stripe-like status machine
- Error handling and retry logic
- File metadata: URL, size, duration, waveform

### UsageRecord
- Tracks user consumption for billing
- Cost calculation per generation

## Pricing Plans

| Plan | Price | Generations/Month | Features |
|------|-------|-------------------|----------|
| Starter | Free | 10 | Trial period |
| Pro | $49 | 100 | Full features |
| Enterprise | Custom | Unlimited | Dedicated support |

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/podcast_music_dev"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Stripe (Test Keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID_MONTHLY="price_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3003"
NODE_ENV="development"
```

See `.env.example` for complete list.

## Testing

### Manual API Testing

```bash
# Register
curl -X POST http://localhost:3003/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "TestPass123",
    "confirmPassword": "TestPass123"
  }'

# Login and get token
TOKEN=$(curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }' | jq -r '.data.token')

# Create project
curl -X POST http://localhost:3003/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Project",
    "podcastName": "Test Podcast",
    "mood": "upbeat"
  }'
```

## Error Handling

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

Status codes:
- `200` - OK
- `201` - Created
- `202` - Accepted (async operations)
- `400` - Bad Request (validation)
- `401` - Unauthorized (auth)
- `403` - Forbidden (access)
- `404` - Not Found
- `429` - Too Many Requests (limits)
- `500` - Internal Error

## Security

✓ Password hashing with bcrypt  
✓ JWT token expiration (7 days)  
✓ Prisma ORM prevents SQL injection  
✓ Input validation with Zod  
✓ CORS headers configured  
✓ Stripe webhook verification  
✓ Rate limiting by tier  

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Production environment setup
- Docker containerization
- Kubernetes deployment
- Database migrations
- Stripe webhook configuration
- Monitoring and logging
- Troubleshooting guide

## Development

### Scripts

```bash
npm run dev           # Start dev server (port 3003)
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run linter
npm run type-check    # Run TypeScript
npm run test          # Run tests
npm run db:migrate    # Run database migrations
npm run db:generate   # Generate Prisma client
npm run db:studio     # Open Prisma Studio
```

### Adding New Endpoints

1. Create route file: `app/api/[feature]/route.ts`
2. Add validation schema in `lib/validations.ts`
3. Implement handler with error handling
4. Update API docs in `app/page.tsx`

### Database Changes

1. Modify `packages/db/prisma/schema.prisma`
2. Run `npm run db:migrate`
3. Verify with `npm run db:studio`

## Contributing

1. Follow TypeScript strict mode
2. Add validation for all inputs
3. Include error handling
4. Test with curl or Postman
5. Update API docs
6. Log sensitive operations

## License

Proprietary - WISE² Enterprise

## Support

For questions or issues:
- Check [DEPLOYMENT.md](./DEPLOYMENT.md)
- Review API docs at http://localhost:3003
- Email: support@wise2.com

## Changelog

### v1.0.0
- Initial release
- User authentication with JWT
- Project CRUD operations
- AI audio generation job submission
- Audio file downloads
- Stripe subscription integration
- Usage tracking and rate limiting
- Webhook support for subscription events
