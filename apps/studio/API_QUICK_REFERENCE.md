# API Quick Reference

Fast lookup for developers working with Suno + OBS API.

## Endpoints at a Glance

### Suno Music Generation

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/suno/generate` | Submit generation | ✓ |
| GET | `/api/suno/status/:id` | Check progress | ✓ |
| GET | `/api/suno/history?page=1&pageSize=20` | List user's music | ✓ |
| GET | `/api/suno/export/:id?format=mp3` | Download music | ✓ |

### OBS Streaming Control

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/obs/scenes` | List all scenes | ✓ |
| POST | `/api/obs/scenes` | Create scene | ✓ |
| PUT | `/api/obs/scenes/:id` | Update scene | ✓ |
| DELETE | `/api/obs/scenes/:id` | Delete scene | ✓ |
| GET | `/api/obs/scenes/:id/sources` | List sources | ✓ |
| POST | `/api/obs/scenes/:id/sources` | Add source | ✓ |
| POST | `/api/obs/stream/start` | Start streaming | ✓ |
| POST | `/api/obs/stream/stop` | Stop streaming | ✓ |
| GET | `/api/obs/stats` | Stream statistics | ✓ |

---

## Common Request/Response Patterns

### Success Response

```json
{
  "success": true,
  "data": { /* response data */ },
  "timestamp": "2026-07-24T12:00:00Z"
}
```

### Error Response

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "statusCode": 400,
  "timestamp": "2026-07-24T12:00:00Z",
  "details": { /* optional details */ }
}
```

### Required Header

```
Authorization: Bearer <jwt_token>
```

---

## Common Tasks

### Generate Music

```bash
curl -X POST http://localhost:3005/api/suno/generate \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "prompt": "Uplifting electronic dance music",
    "style": "EDM",
    "duration": 180
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "gen_1721873400000_abc123def",
    "status": "pending",
    "createdAt": "2026-07-24T12:00:00Z"
  }
}
```

### Poll Generation Status

```bash
curl http://localhost:3005/api/suno/status/gen_1721873400000_abc123def \
  -H "Authorization: Bearer $TOKEN"
```

**Polling Loop**:
```typescript
async function waitForGeneration(id: string, token: string) {
  let status = 'pending';
  let attempts = 0;
  const maxAttempts = 60; // Max 10 minutes

  while (status !== 'completed' && status !== 'failed' && attempts < maxAttempts) {
    const response = await fetch(`/api/suno/status/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const { data } = await response.json();
    status = data.status;
    console.log(`Progress: ${data.progress}%`);
    
    if (status !== 'completed' && status !== 'failed') {
      await new Promise(r => setTimeout(r, 10000)); // Wait 10s
    }
    
    attempts++;
  }

  return status === 'completed';
}
```

### Start Streaming

```bash
curl -X POST http://localhost:3005/api/obs/stream/start \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sceneId": "scene_001",
    "serviceUrl": "rtmps://live.twitch.tv/app",
    "streamKey": "your-stream-key"
  }'
```

### Monitor Stream

```bash
# Get live stats every 5 seconds
watch -n 5 "curl -s http://localhost:3005/api/obs/stats \
  -H \"Authorization: Bearer $TOKEN\" | jq '.data'"
```

---

## Error Codes

| Code | Status | When | Fix |
|------|--------|------|-----|
| `UNAUTHORIZED` | 401 | No/invalid token | Login and get fresh token |
| `VALIDATION_ERROR` | 400 | Invalid data | Check request format |
| `NOT_FOUND` | 404 | Resource missing | Verify ID exists |
| `CONFLICT` | 409 | State conflict | Stream already running |
| `INTERNAL_SERVER_ERROR` | 500 | Server error | Check logs |

---

## Environment Setup

```bash
# .env.local
SUNO_API_KEY=your-api-key
OBS_HOST=localhost
OBS_PORT=4444
JWT_SECRET=your-secret
NEXT_PUBLIC_APP_URL=http://localhost:3005
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `types/api.ts` | TypeScript interfaces |
| `lib/api-middleware.ts` | Auth, CORS, validation |
| `lib/suno-client.ts` | Suno HTTP client |
| `lib/obs-client.ts` | OBS WebSocket client |
| `app/api/suno/*/route.ts` | Suno endpoints |
| `app/api/obs/*/route.ts` | OBS endpoints |
| `API_DOCUMENTATION.md` | Full API reference |
| `API_IMPLEMENTATION.md` | Integration guide |

---

## Frontend Usage

```typescript
// Use with existing apiClient
import { apiClient } from '@/lib/api-client';

// Generate music
const response = await fetch('/api/suno/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiClient.getAccessToken()}`
  },
  body: JSON.stringify({
    prompt: 'Music description',
    duration: 180
  })
});

const { data } = await response.json();
console.log(data.id); // Use to poll status
```

---

## Testing Checklist

- [ ] GET /api/obs/scenes (returns mock scenes)
- [ ] POST /api/obs/scenes (creates scene)
- [ ] POST /api/suno/generate (returns generation ID)
- [ ] GET /api/suno/status/:id (returns status)
- [ ] GET /api/suno/history (returns paginated list)
- [ ] POST /api/obs/stream/start (starts stream)
- [ ] GET /api/obs/stats (returns statistics)
- [ ] All endpoints return 401 without token
- [ ] All endpoints return proper error format on validation error

---

## Integration Checklist

- [ ] Connect Suno HTTP client in `/api/suno/generate`
- [ ] Connect OBS WebSocket client in `/api/obs/scenes`
- [ ] Add database models to Prisma schema
- [ ] Implement user-specific filtering (userId)
- [ ] Add error logging to external service
- [ ] Implement rate limiting
- [ ] Add request/response caching
- [ ] Setup monitoring/alerting

---

## Performance Tips

1. **Suno Polling**: Use exponential backoff (5s → 10s → 30s)
2. **OBS Connection**: Keep persistent connection, don't reconnect per request
3. **Caching**: Cache scene list (update on mutation)
4. **Pagination**: Default 20 items, max 100
5. **Compression**: Enable gzip for large responses

---

## Security Notes

- All endpoints require JWT authentication
- CORS restricted to `NEXT_PUBLIC_APP_URL`
- Passwords hashed with bcrypt (backend auth)
- Tokens expire after 15 minutes (refresh available)
- Stream keys should be stored as environment variables
- OBS password should be in `.env.local` (not git-tracked)

---

## Useful Links

- [API Documentation](./API_DOCUMENTATION.md) - Complete reference
- [Implementation Guide](./API_IMPLEMENTATION.md) - Integration details
- [Suno API Docs](https://docs.suno.ai) - (replace with actual)
- [OBS WebSocket Docs](https://github.com/obsproject/obs-websocket) - Protocol reference

---

**Version**: 1.0.0  
**Last Updated**: 2026-07-24
