# API Implementation Guide: Suno + OBS Backend

This document explains the structure and usage of the Suno + OBS API backend for WISE² Creative Studio.

---

## Quick Overview

The API provides 10 endpoints across two services:

**Suno (Music Generation)**:
1. `POST /api/suno/generate` - Submit generation request
2. `GET /api/suno/status/[id]` - Poll generation status
3. `GET /api/suno/history` - List user generations (paginated)
4. `GET /api/suno/export/[id]` - Export as MP3/WAV/FLAC

**OBS (Streaming Control)**:
5. `GET /api/obs/scenes` - List scenes
6. `POST /api/obs/scenes` - Create scene
7. `PUT /api/obs/scenes/[id]` - Update scene
8. `DELETE /api/obs/scenes/[id]` - Delete scene
9. `GET/POST /api/obs/scenes/[id]/sources` - Manage sources
10. `POST /api/obs/stream/start` - Start streaming
11. `POST /api/obs/stream/stop` - Stop streaming
12. `GET /api/obs/stats` - Stream statistics

---

## Directory Structure

```
apps/studio/
├── app/
│   └── api/
│       ├── suno/
│       │   ├── generate/
│       │   │   └── route.ts        # POST: Generate music
│       │   ├── status/
│       │   │   └── [id]/
│       │   │       └── route.ts    # GET: Poll status
│       │   ├── history/
│       │   │   └── route.ts        # GET: List history
│       │   └── export/
│       │       └── [id]/
│       │           └── route.ts    # GET: Export music
│       │
│       └── obs/
│           ├── scenes/
│           │   ├── route.ts        # GET/POST scenes
│           │   ├── [id]/
│           │   │   ├── route.ts    # PUT/DELETE scene
│           │   │   └── sources/
│           │   │       └── route.ts # GET/POST sources
│           │
│           └── stream/
│               ├── start/
│               │   └── route.ts    # POST: Start stream
│               ├── stop/
│               │   └── route.ts    # POST: Stop stream
│               └── stats/
│                   └── route.ts    # GET: Stream stats
│
├── lib/
│   ├── api-middleware.ts           # CORS, Auth, Logging, Validation
│   ├── suno-client.ts              # Suno API integration
│   └── obs-client.ts               # OBS WebSocket integration
│
├── types/
│   └── api.ts                      # Shared TypeScript interfaces
│
└── API_DOCUMENTATION.md            # Complete API reference
```

---

## Core Components

### 1. Type Definitions (`types/api.ts`)

All request/response types are defined here for type safety:

```typescript
// Suno types
interface SunoGenerationRequest { ... }
interface SunoGenerationResponse { ... }
interface SunoStatusResponse { ... }
interface SunoHistoryResponse { ... }
interface SunoExportResponse { ... }

// OBS types
interface ObsScene { ... }
interface ObsSource { ... }
interface ObsStreamStats { ... }

// Common types
interface ApiErrorResponse { ... }
interface UserContext { ... }
interface PaginationParams { ... }
```

### 2. Middleware (`lib/api-middleware.ts`)

Shared middleware utilities for all endpoints:

**Authentication**:
- `extractUserFromToken()` - Extract JWT from Authorization header
- `requireAuth()` - Guard to ensure user is authenticated

**CORS**:
- `corsHeaders()` - Generate CORS response headers
- `handleCorsPreFlight()` - Handle OPTIONS requests

**Validation**:
- `validateRequest()` - Validate request data against schema
- `ValidationSchema` - Type-safe validation rules

**Error Handling**:
- `ApiException` - Custom error class
- `createErrorResponse()` - Format error responses

**Logging**:
- `logger` - Simple in-memory request logger

**Request Wrapper**:
- `withMiddleware()` - Wrap handlers with logging, auth, CORS

### 3. Suno Client (`lib/suno-client.ts`)

HTTP-based client for the Suno API:

```typescript
const client = new SunoClient({
  apiKey: 'your-suno-api-key',
  baseUrl: 'https://api.suno.ai',
  timeout: 30000,
  retries: 3
});

// Generate music
const generation = await client.generate({
  prompt: 'Uplifting EDM',
  duration: 180
});

// Poll status
const status = await client.getStatus(generation.id);

// Export
const exportUrl = await client.export(generation.id, 'mp3');

// Cancel
await client.cancel(generation.id);
```

**Features**:
- ✅ Automatic retry with exponential backoff
- ✅ Request validation
- ✅ Timeout handling
- ✅ Typed responses
- ✅ Error handling

### 4. OBS Client (`lib/obs-client.ts`)

WebSocket-based client for OBS control:

```typescript
const client = new ObsClient({
  host: 'localhost',
  port: 4444,
  password: 'optional-password'
});

// Connect
await client.connect();

// Scene management
const scenes = await client.getScenes();
await client.setScene('Main Stream');
await client.createScene('New Scene');

// Streaming
await client.startStreaming({
  serviceUrl: 'rtmps://live.twitch.tv/app',
  streamKey: 'your-stream-key'
});

const stats = await client.getStats();

await client.stopStreaming();

// Cleanup
client.disconnect();
```

**Features**:
- ✅ WebSocket connection management
- ✅ Scene and source management
- ✅ Stream control
- ✅ Real-time statistics
- ✅ Request/response pairing

---

## Using the API Routes

### Example: Generate Music Endpoint

```typescript
// app/api/suno/generate/route.ts
import { withMiddleware, requireAuth, validateRequest } from '@/lib/api-middleware';
import { SunoGenerationRequest } from '@/types/api';

async function generateMusic(
  request: NextRequest,
  user: UserContext | null
): Promise<NextResponse> {
  // 1. Require authentication
  if (!requireAuth(user)) {
    throw new ApiException(401, 'UNAUTHORIZED', 'Authentication required');
  }

  // 2. Parse and validate request
  const body = await request.json();
  const { valid, errors } = validateRequest(body, generationSchema);
  if (!valid) {
    throw new ApiException(400, 'VALIDATION_ERROR', 'Invalid request', { errors });
  }

  // 3. Call Suno API
  const sunoClient = getSunoClient();
  const generation = await sunoClient.generate(body);

  // 4. Return typed response
  return createdResponse(generation);
}

export const POST = withMiddleware(generateMusic);
```

**Flow**:
1. Request comes in → `withMiddleware()` wraps handler
2. CORS headers added, user extracted from JWT
3. Handler validates request using schema
4. API client is called (TODO: implement)
5. Response formatted with CORS headers
6. Logging captures metrics

---

## Environment Configuration

### Setup

Create `.env.local`:

```bash
# Suno API
SUNO_API_KEY=your-suno-api-key-here

# OBS WebSocket
OBS_HOST=localhost
OBS_PORT=4444
OBS_PASSWORD=your-obs-password

# JWT
JWT_SECRET=your-jwt-secret-key

# API
NEXT_PUBLIC_APP_URL=http://localhost:3005
```

### Initialize Clients

In your Next.js startup:

```typescript
// app/layout.tsx or a startup hook
import { initSunoClient } from '@/lib/suno-client';
import { initObsClient } from '@/lib/obs-client';

// Lazy initialization (first time a client is used)
const sunoClient = getSunoClient();  // Auto-initializes if needed
const obsClient = getObsClient();    // Auto-initializes if needed

// Or explicit initialization
initSunoClient({ apiKey: process.env.SUNO_API_KEY });
initObsClient({ host: 'localhost', port: 4444 });
```

---

## Implementing Actual Endpoints

All endpoints currently return mock data. To integrate real services:

### 1. Suno Integration (HTTP-based)

Replace TODO comments in `app/api/suno/generate/route.ts`:

```typescript
async function generateMusic(
  request: NextRequest,
  user: UserContext | null
): Promise<NextResponse> {
  // ... validation ...

  // BEFORE (mock)
  const response: SunoGenerationResponse = {
    id: `gen_${Date.now()}`,
    prompt: payload.prompt,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // AFTER (real)
  const sunoClient = getSunoClient();
  const generation = await sunoClient.generate(payload);
  
  // Optionally store in database
  // await db.sunoGenerations.create({
  //   userId: user.id,
  //   id: generation.id,
  //   prompt: payload.prompt,
  //   status: generation.status,
  //   createdAt: new Date(),
  // });

  return createdResponse(generation);
}
```

### 2. OBS Integration (WebSocket-based)

Replace TODO comments in `app/api/obs/scenes/route.ts`:

```typescript
async function listScenes(
  request: NextRequest,
  user: UserContext | null
): Promise<NextResponse> {
  if (!requireAuth(user)) {
    throw new ApiException(401, 'UNAUTHORIZED', 'Authentication required');
  }

  // BEFORE (mock)
  const scenes: ObsScene[] = [
    { id: 'scene_001', name: 'Main Stream', ... },
  ];

  // AFTER (real)
  const obsClient = getObsClient();
  
  // Ensure connected (or check if already connected)
  if (!obsClient.isConnected()) {
    await obsClient.connect();
  }

  const scenes = await obsClient.getScenes();
  
  // Optional: filter by user from DB
  // const userScenes = await db.obsScenes.findMany({
  //   where: { userId: user.id }
  // });

  return successResponse(scenes);
}
```

### 3. Database Integration

Create Prisma schema for persistence:

```prisma
model SunoGeneration {
  id            String    @id
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  prompt        String
  style         String?
  status        String    @default("pending")
  progress      Int       @default(0)
  musicUrl      String?
  duration      Int?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  completedAt   DateTime?
  
  @@index([userId])
  @@index([status])
}

model ObsScene {
  id            String    @id
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name          String
  order         Int
  
  sources       ObsSource[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@unique([userId, name])
  @@index([userId])
}

model ObsSource {
  id            String    @id
  sceneId       String
  scene         ObsScene  @relation(fields: [sceneId], references: [id], onDelete: Cascade)
  
  name          String
  type          String
  settings      Json
  enabled       Boolean   @default(true)
  order         Int
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([sceneId])
}
```

---

## Error Handling

All errors are caught by middleware and formatted consistently:

```typescript
// Custom error
throw new ApiException(
  400,
  'VALIDATION_ERROR',
  'Invalid email format',
  { field: 'email' }
);

// Standard error
throw new Error('Something went wrong');

// Response format
{
  "error": "Invalid email format",
  "code": "VALIDATION_ERROR",
  "statusCode": 400,
  "timestamp": "2026-07-24T12:00:00Z",
  "details": { "field": "email" }
}
```

---

## Testing the API

### Using cURL

```bash
# 1. Login to get token
TOKEN=$(curl -X POST http://localhost:3005/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }' | jq -r '.accessToken')

# 2. Generate music
curl -X POST http://localhost:3005/api/suno/generate \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "prompt": "Uplifting electronic dance music",
    "style": "EDM",
    "duration": 180
  }'

# 3. Check status
curl http://localhost:3005/api/suno/status/gen_123... \
  -H "Authorization: Bearer $TOKEN"
```

### Using Postman

1. Create a collection with base URL `http://localhost:3005/api`
2. Set up Auth tab with Bearer token
3. Add requests for each endpoint
4. Use pre-request scripts for dynamic values

### Using TypeScript/Fetch

```typescript
const token = localStorage.getItem('accessToken');

const response = await fetch('/api/suno/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    prompt: 'Uplifting electronic music',
    duration: 180
  })
});

const result = await response.json();
console.log(result.data);
```

---

## Performance & Scaling

### Middleware Optimization

**Current**: Synchronous middleware for auth/validation

**For Production**:
- Add request caching for repeated queries
- Implement rate limiting per user
- Add request/response compression
- Queue long-running operations (Suno generations)
- Cache API responses with TTL

### Database Optimization

- Add indexes on frequently-queried fields
- Archive old generations after retention period
- Implement pagination for history endpoints
- Add connection pooling

### WebSocket Optimization (OBS)

- Maintain persistent connection pool
- Implement connection retry logic
- Add heartbeat/ping-pong for keep-alive
- Handle disconnection gracefully

---

## Monitoring & Logging

### Built-in Logger

```typescript
// Access logs
const logs = logger.getLogs();
logs.forEach(log => {
  console.log(`${log.timestamp} ${log.method} ${log.path} - ${log.statusCode}`);
});

// Clear logs
logger.clear();
```

### Production Logging

Send to external service:

```typescript
// In createErrorResponse
if (process.env.NODE_ENV === 'production') {
  await sendToLoggingService({
    timestamp: new Date().toISOString(),
    error: error.message,
    stackTrace: error.stack,
    userId: user?.id,
    endpoint: request.nextUrl.pathname,
  });
}
```

---

## Next Steps

1. **Integrate Suno API**
   - [ ] Replace mock responses with real API calls
   - [ ] Implement database persistence
   - [ ] Add generation polling job
   - [ ] Implement export conversion

2. **Integrate OBS**
   - [ ] Test WebSocket connection to local OBS
   - [ ] Implement user-specific scene management
   - [ ] Add stream recording integration
   - [ ] Implement performance monitoring

3. **Add Features**
   - [ ] Webhook support for long-running operations
   - [ ] Real-time progress updates (WebSocket)
   - [ ] Stream recording to disk
   - [ ] Multi-output streaming (multiple platforms)
   - [ ] Stream analytics dashboard

4. **Security**
   - [ ] Rate limiting per endpoint
   - [ ] Input sanitization
   - [ ] CSRF protection
   - [ ] API key rotation
   - [ ] Audit logging

5. **Documentation**
   - [ ] API client SDK
   - [ ] Webhook event reference
   - [ ] Integration guide for frontend
   - [ ] Troubleshooting guide

---

## Support

For issues or questions:

1. Check API_DOCUMENTATION.md for endpoint details
2. Review error codes and responses
3. Check environment configuration
4. Review client implementation in `lib/`
5. Check database schema in Prisma

---

**Created**: 2026-07-24  
**Status**: Ready for Development  
**Last Updated**: 2026-07-24
