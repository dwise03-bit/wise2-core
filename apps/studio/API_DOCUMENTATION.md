# Backend API Documentation: Suno + OBS Integration

**Base URL**: `http://localhost:3005/api`

**Authentication**: All endpoints require a valid JWT token in the `Authorization: Bearer <token>` header.

---

## Table of Contents

1. [Suno Music Generation API](#suno-music-generation-api)
2. [OBS Streaming Control API](#obs-streaming-control-api)
3. [Error Handling](#error-handling)
4. [Authentication](#authentication)
5. [Rate Limiting](#rate-limiting)
6. [Examples](#examples)

---

## Suno Music Generation API

### 1. Generate Music

**Endpoint**: `POST /suno/generate`

**Description**: Submit a music generation request to Suno.

**Authentication**: Required

**Request Body**:

```json
{
  "prompt": "Uplifting electronic dance music with synth leads and heavy bass",
  "style": "EDM",
  "duration": 180,
  "temperature": 0.7,
  "tags": ["electronic", "dance", "uplifting"]
}
```

**Parameters**:

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `prompt` | string | Yes | Music description/prompt | 10-500 characters |
| `style` | string | No | Music style/genre | Max 100 characters |
| `duration` | number | No | Duration in seconds | 10-300 seconds |
| `temperature` | number | No | Creativity level | 0-1 (default: 0.7) |
| `tags` | string[] | No | Additional tags | Array of strings |

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "gen_1721873400000_abc123def",
    "prompt": "Uplifting electronic dance music with synth leads and heavy bass",
    "style": "EDM",
    "status": "pending",
    "createdAt": "2026-07-24T12:00:00Z",
    "updatedAt": "2026-07-24T12:00:00Z"
  },
  "timestamp": "2026-07-24T12:00:00Z"
}
```

**Possible Status Values**:
- `pending` - Queued, waiting to start
- `processing` - Currently generating
- `completed` - Done, music ready
- `failed` - Generation failed

**Error Responses**:

- `401 Unauthorized` - Missing or invalid token
- `400 Bad Request` - Invalid parameters
- `429 Too Many Requests` - Rate limit exceeded

---

### 2. Get Generation Status

**Endpoint**: `GET /suno/status/:id`

**Description**: Poll the status of a generation request.

**Authentication**: Required

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Generation ID (format: `gen_*`) |

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "gen_1721873400000_abc123def",
    "prompt": "Uplifting electronic dance music with synth leads and heavy bass",
    "style": "EDM",
    "status": "processing",
    "progress": 45,
    "createdAt": "2026-07-24T12:00:00Z",
    "updatedAt": "2026-07-24T12:00:10Z"
  },
  "timestamp": "2026-07-24T12:00:10Z"
}
```

**When Completed**:

```json
{
  "success": true,
  "data": {
    "id": "gen_1721873400000_abc123def",
    "prompt": "Uplifting electronic dance music with synth leads and heavy bass",
    "style": "EDM",
    "status": "completed",
    "progress": 100,
    "musicUrl": "https://cdn.suno.com/music/gen_1721873400000_abc123def.mp3",
    "duration": 180,
    "createdAt": "2026-07-24T12:00:00Z",
    "updatedAt": "2026-07-24T12:00:45Z",
    "completedAt": "2026-07-24T12:00:45Z"
  },
  "timestamp": "2026-07-24T12:00:45Z"
}
```

**Error Responses**:

- `401 Unauthorized` - Missing or invalid token
- `400 Bad Request` - Invalid ID format
- `404 Not Found` - Generation not found

---

### 3. Get Generation History

**Endpoint**: `GET /suno/history`

**Description**: Retrieve paginated user generation history.

**Authentication**: Required

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (1-indexed) |
| `pageSize` | number | 20 | Items per page (1-100) |
| `sortBy` | string | createdAt | Sort field: `createdAt`, `updatedAt`, `status` |
| `sortOrder` | string | desc | Sort direction: `asc`, `desc` |

**Example Request**:

```
GET /suno/history?page=2&pageSize=10&sortBy=createdAt&sortOrder=desc
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "gen_1721873400000_abc123def",
        "prompt": "Uplifting electronic dance music with synth leads and heavy bass",
        "style": "EDM",
        "status": "completed",
        "musicUrl": "https://cdn.suno.com/music/gen_1721873400000_abc123def.mp3",
        "duration": 180,
        "createdAt": "2026-07-24T12:00:00Z",
        "updatedAt": "2026-07-24T12:00:45Z"
      },
      {
        "id": "gen_1721786000000_xyz789",
        "prompt": "Chill lo-fi hip hop beats for studying",
        "style": "Lo-Fi Hip Hop",
        "status": "completed",
        "musicUrl": "https://cdn.suno.com/music/gen_1721786000000_xyz789.mp3",
        "duration": 240,
        "createdAt": "2026-07-23T14:30:00Z",
        "updatedAt": "2026-07-23T14:31:00Z"
      }
    ],
    "total": 45,
    "page": 2,
    "pageSize": 10,
    "hasMore": true
  },
  "timestamp": "2026-07-24T12:05:00Z"
}
```

**Error Responses**:

- `401 Unauthorized` - Missing or invalid token
- `400 Bad Request` - Invalid query parameters

---

### 4. Export Music

**Endpoint**: `GET /suno/export/:id`

**Description**: Export generated music in specified audio format.

**Authentication**: Required

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Generation ID (format: `gen_*`) |

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `format` | string | mp3 | Export format: `mp3`, `wav`, `flac` |
| `bitrate` | number | varies | Bitrate in kbps (64-320 for mp3) |

**Example Request**:

```
GET /suno/export/gen_1721873400000_abc123def?format=wav&bitrate=192
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "gen_1721873400000_abc123def",
    "format": "wav",
    "downloadUrl": "https://cdn.suno.com/exports/gen_1721873400000_abc123def.wav?token=xyz789",
    "expiresIn": 86400
  },
  "timestamp": "2026-07-24T12:10:00Z"
}
```

**Error Responses**:

- `401 Unauthorized` - Missing or invalid token
- `400 Bad Request` - Invalid format or parameters
- `404 Not Found` - Generation not found
- `409 Conflict` - Generation not yet completed

---

## OBS Streaming Control API

### 5. List Scenes

**Endpoint**: `GET /obs/scenes`

**Description**: Get all OBS scenes for the user.

**Authentication**: Required

**Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": "scene_001",
      "name": "Main Stream",
      "order": 1,
      "createdAt": "2026-07-17T10:00:00Z",
      "updatedAt": "2026-07-17T10:00:00Z"
    },
    {
      "id": "scene_002",
      "name": "Outro",
      "order": 2,
      "createdAt": "2026-07-16T14:30:00Z",
      "updatedAt": "2026-07-16T14:30:00Z"
    }
  ],
  "timestamp": "2026-07-24T12:15:00Z"
}
```

**Error Responses**:

- `401 Unauthorized` - Missing or invalid token

---

### 6. Create Scene

**Endpoint**: `POST /obs/scenes`

**Description**: Create a new OBS scene.

**Authentication**: Required

**Request Body**:

```json
{
  "name": "Gaming Scene"
}
```

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Scene name (1-255 characters) |

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "scene_004",
    "name": "Gaming Scene",
    "order": 4,
    "createdAt": "2026-07-24T12:15:30Z",
    "updatedAt": "2026-07-24T12:15:30Z"
  },
  "timestamp": "2026-07-24T12:15:30Z"
}
```

**Error Responses**:

- `401 Unauthorized` - Missing or invalid token
- `400 Bad Request` - Missing or invalid name

---

### 7. Update Scene

**Endpoint**: `PUT /obs/scenes/:id`

**Description**: Update an OBS scene.

**Authentication**: Required

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Scene ID |

**Request Body**:

```json
{
  "name": "Main Stream Updated",
  "order": 1
}
```

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | New scene name |
| `order` | number | No | New scene order |

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "scene_001",
    "name": "Main Stream Updated",
    "order": 1,
    "createdAt": "2026-07-17T10:00:00Z",
    "updatedAt": "2026-07-24T12:16:00Z"
  },
  "timestamp": "2026-07-24T12:16:00Z"
}
```

**Error Responses**:

- `401 Unauthorized` - Missing or invalid token
- `400 Bad Request` - Invalid data
- `404 Not Found` - Scene not found

---

### 8. Delete Scene

**Endpoint**: `DELETE /obs/scenes/:id`

**Description**: Delete an OBS scene.

**Authentication**: Required

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Scene ID |

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "scene_003",
    "deleted": true
  },
  "timestamp": "2026-07-24T12:17:00Z"
}
```

**Error Responses**:

- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Scene not found

---

### 9. List Scene Sources

**Endpoint**: `GET /obs/scenes/:sceneId/sources`

**Description**: Get all sources in a scene.

**Authentication**: Required

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `sceneId` | string | Scene ID |

**Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": "source_001",
      "sceneId": "scene_001",
      "name": "Webcam",
      "type": "video",
      "settings": { "device": "/dev/video0" },
      "enabled": true,
      "order": 1,
      "createdAt": "2026-07-17T10:00:00Z",
      "updatedAt": "2026-07-17T10:00:00Z"
    },
    {
      "id": "source_002",
      "sceneId": "scene_001",
      "name": "Microphone",
      "type": "audio",
      "settings": { "device": "default" },
      "enabled": true,
      "order": 2,
      "createdAt": "2026-07-17T10:00:00Z",
      "updatedAt": "2026-07-17T10:00:00Z"
    }
  ],
  "timestamp": "2026-07-24T12:18:00Z"
}
```

**Error Responses**:

- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Scene not found

---

### 10. Add Source to Scene

**Endpoint**: `POST /obs/scenes/:sceneId/sources`

**Description**: Add a source to a scene.

**Authentication**: Required

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `sceneId` | string | Scene ID |

**Request Body**:

```json
{
  "name": "Screen Capture",
  "type": "video",
  "settings": {
    "display": "0",
    "captureMode": "window"
  }
}
```

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Source name (1-255 characters) |
| `type` | string | Yes | Source type: `video`, `audio`, `text`, `image`, `scene`, `custom` |
| `settings` | object | No | Source-specific settings |

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "source_004",
    "sceneId": "scene_001",
    "name": "Screen Capture",
    "type": "video",
    "settings": { "display": "0", "captureMode": "window" },
    "enabled": true,
    "order": 4,
    "createdAt": "2026-07-24T12:18:30Z",
    "updatedAt": "2026-07-24T12:18:30Z"
  },
  "timestamp": "2026-07-24T12:18:30Z"
}
```

**Error Responses**:

- `401 Unauthorized` - Missing or invalid token
- `400 Bad Request` - Invalid data
- `404 Not Found` - Scene not found

---

### 11. Start Stream

**Endpoint**: `POST /obs/stream/start`

**Description**: Begin streaming.

**Authentication**: Required

**Request Body**:

```json
{
  "sceneId": "scene_001",
  "serviceUrl": "rtmps://live.twitch.tv/app",
  "streamKey": "your-stream-key-here"
}
```

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sceneId` | string | No | Scene to start with |
| `serviceUrl` | string | No | RTMP service URL |
| `streamKey` | string | No | Stream key/token |

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "status": "active",
    "streamId": "stream_1721873400000",
    "startedAt": "2026-07-24T12:20:00Z",
    "rtmpUrl": "rtmps://live.twitch.tv/app"
  },
  "timestamp": "2026-07-24T12:20:00Z"
}
```

**Error Responses**:

- `401 Unauthorized` - Missing or invalid token
- `400 Bad Request` - Invalid parameters
- `409 Conflict` - Stream already active

---

### 12. Stop Stream

**Endpoint**: `POST /obs/stream/stop`

**Description**: Stop the current stream.

**Authentication**: Required

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "status": "stopped",
    "stoppedAt": "2026-07-24T12:45:30Z",
    "duration": 1530,
    "bytesTransferred": 1572864000
  },
  "timestamp": "2026-07-24T12:45:30Z"
}
```

**Error Responses**:

- `401 Unauthorized` - Missing or invalid token
- `409 Conflict` - No active stream

---

### 13. Get Stream Statistics

**Endpoint**: `GET /obs/stats`

**Description**: Get real-time streaming statistics.

**Authentication**: Required

**Response** (200 OK):

**When streaming is active**:

```json
{
  "success": true,
  "data": {
    "status": "active",
    "streamId": "stream_1721873400000",
    "duration": 1847,
    "bitrate": 4500,
    "fps": 30,
    "droppedFrames": 5,
    "totalFrames": 55410,
    "bandwidth": 4.8,
    "bytesTransferred": 3355443200,
    "cpuUsage": 42.5,
    "memoryUsage": 58.3,
    "updatedAt": "2026-07-24T12:25:00Z"
  },
  "timestamp": "2026-07-24T12:25:00Z"
}
```

**When streaming is inactive**:

```json
{
  "success": true,
  "data": {
    "status": "inactive",
    "updatedAt": "2026-07-24T12:45:30Z"
  },
  "timestamp": "2026-07-24T12:45:30Z"
}
```

**Error Responses**:

- `401 Unauthorized` - Missing or invalid token

---

## Error Handling

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE",
  "statusCode": 400,
  "timestamp": "2026-07-24T12:00:00Z",
  "details": {
    "field": "additional error context"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | User doesn't have permission for this resource |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Request data failed validation |
| `MISSING_PARAM` | 400 | Required path/query parameter missing |
| `INVALID_ID` | 400 | ID format is invalid |
| `METHOD_NOT_ALLOWED` | 405 | HTTP method not allowed for this endpoint |
| `CONFLICT` | 409 | Resource conflict (e.g., stream already active) |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

---

## Authentication

### JWT Token Format

All requests must include:

```
Authorization: Bearer <jwt_token>
```

The JWT token must contain:

```json
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "customer",
  "iat": 1721873400,
  "exp": 1721877000
}
```

### Obtaining a Token

Tokens are obtained via the Auth API:

```bash
POST /v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

### Token Refresh

When your access token expires, use the refresh token:

```bash
POST /v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Rate Limiting

Rate limits are applied per user:

- **General endpoints**: 100 requests per minute
- **Generation endpoints**: 10 requests per minute
- **Stream endpoints**: 20 requests per minute

When rate limited, the response includes:

```
HTTP/1.1 429 Too Many Requests

Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1721873460
```

---

## Examples

### TypeScript/JavaScript Client

```typescript
import { apiClient } from '@/lib/api-client';

// Get auth token
const loginResponse = await apiClient.login(
  'user@example.com',
  'password123'
);

// Generate music
const generation = await fetch('/api/suno/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${loginResponse.accessToken}`
  },
  body: JSON.stringify({
    prompt: 'Uplifting electronic dance music',
    style: 'EDM',
    duration: 180
  })
});

// Poll status
const pollStatus = async (id: string) => {
  const response = await fetch(`/api/suno/status/${id}`, {
    headers: {
      'Authorization': `Bearer ${loginResponse.accessToken}`
    }
  });
  return response.json();
};

// Start streaming
const streamStart = await fetch('/api/obs/stream/start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${loginResponse.accessToken}`
  },
  body: JSON.stringify({
    sceneId: 'scene_001',
    serviceUrl: 'rtmps://live.twitch.tv/app',
    streamKey: 'your-stream-key'
  })
});
```

### cURL Examples

**Generate music**:

```bash
curl -X POST http://localhost:3005/api/suno/generate \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "prompt": "Uplifting electronic dance music",
    "style": "EDM",
    "duration": 180
  }'
```

**Check status**:

```bash
curl http://localhost:3005/api/suno/status/gen_1721873400000_abc123def \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

**Start streaming**:

```bash
curl -X POST http://localhost:3005/api/obs/stream/start \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "sceneId": "scene_001",
    "serviceUrl": "rtmps://live.twitch.tv/app",
    "streamKey": "your-stream-key"
  }'
```

---

## Webhooks (Future Enhancement)

Future versions will support webhooks for long-running operations:

- Generation completion
- Stream status changes
- Error notifications

Subscribe via:

```bash
POST /api/webhooks/subscribe
{
  "event": "generation.completed",
  "url": "https://yourapp.com/webhooks/suno",
  "secret": "your-webhook-secret"
}
```

---

**Last Updated**: 2026-07-24  
**API Version**: 1.0.0  
**Status**: Beta (Ready for Development)
