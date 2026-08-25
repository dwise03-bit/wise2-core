# API Service

REST API backend for Wise² Core

## Overview

The API service is the core backend for Wise² Core, providing REST endpoints for:
- Authentication and authorization
- Business logic and data operations
- Integration with external services
- Data persistence to PostgreSQL
- Caching via Redis
- Queue jobs via Message Queue

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Language**: TypeScript/JavaScript
- **Authentication**: JWT

## Directory Structure

```
api/
├── src/
│   ├── server.js              # Main entry point
│   ├── app.js                 # Express app setup
│   ├── routes/                # API route handlers
│   ├── controllers/           # Business logic
│   ├── models/                # Database models
│   ├── middleware/            # Express middleware
│   ├── services/              # External service integrations
│   ├── utils/                 # Utility functions
│   ├── config/                # Configuration
│   └── types/                 # TypeScript types
├── Dockerfile
├── package.json
└── README.md
```

## Getting Started (Development)

```bash
npm install
npm run dev          # Start with hot reload
npm run test         # Run tests
npm run lint         # Run linting
```

## Production Deployment

```bash
npm run build
npm start
```

## Environment Variables

See `.env.example` for all available configuration options. Key variables include:

```bash
# Database
DATABASE_URL=postgresql://user:pass@postgres:5432/wise2_core
REDIS_URL=redis://:password@redis:6379

# Authentication
JWT_SECRET=your-secret-key

# External Services
CLAUDE_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Discord Bot and Webhooks
DISCORD_BOT_TOKEN=...
DISCORD_GUILD_ID=...
DISCORD_WEBHOOK_ALERTS=https://discordapp.com/api/webhooks/...
DISCORD_WEBHOOK_IMAGES=https://discordapp.com/api/webhooks/...

# Hermes Image Orchestration
HERMES_IMAGE_ENDPOINT=https://api.stability.ai/v1/generate
HERMES_IMAGE_API_KEY=...
```

### Hermes Image Orchestration Setup

The Hermes Image Orchestrator enables AI-driven image generation with locked asset preservation:

**Required Environment Variables:**
- `HERMES_IMAGE_ENDPOINT`: Image generation provider API endpoint
- `HERMES_IMAGE_API_KEY`: API key for image provider authentication

**Discord Integration (Optional):**
- `DISCORD_WEBHOOK_IMAGES`: Webhook URL for image result notifications
- `DISCORD_DEFAULT_HERMES_USER_ID`: Default user context for Discord /image commands

**API Endpoints:**
- `POST /v1/hermes/image` - Generate images with locked asset preservation
  - Requires JWT authentication
  - Accepts instruction, references (with role tagging), and aspect ratio
  - Returns jobId, status, imageUrl, provider, and locked asset tracking

**Discord Commands:**
- `/image <instruction> [--aspect-ratio 16:9|9:16|1:1|4:3|3:4]` - Generate and post image to #images channel

## Health Check

```bash
curl http://localhost:3000/health
```

## Documentation

- API Spec: See `docs/API.md`
- Database: See `docs/DATABASE.md`
- Deployment: See `infrastructure/README.md`
- Troubleshooting: See `docs/runbooks/troubleshooting.md`

---

**Service Version**: 1.0
**Owner**: Backend Team
