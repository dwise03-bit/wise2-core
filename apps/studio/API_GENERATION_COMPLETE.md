# Music Generation API - Complete Implementation

Production-grade music generation API with job queueing, progress tracking, and export functionality.

## Overview

The generation API provides endpoints for:
- Submitting music generation requests
- Tracking generation progress and status
- Retrieving completed audio with metadata
- Managing generation history with filtering
- Exporting in multiple formats
- Streaming progress via Server-Sent Events (SSE)

## Architecture

```
User Request
    ↓
POST /api/generation/generate
    ↓
Create Generation Record (DB)
    ↓
Create Job + Enqueue (Job Queue)
    ↓
Return Job ID + ETA
    ↓
[Polling Loop]
    ├─ GET /api/generation/status/{jobId}
    ├─ GET /api/generation/progress/{jobId} (SSE)
    └─ GET /api/generation/result/{jobId}
```

## Database Schema

**Generation Record** (stored as JSON files in `data/generations/`)

```typescript
{
  id: string;                    // Unique generation ID
  userId: string;                // Owner user ID
  prompt: string;                // Music generation prompt
  genre?: string;                // Genre/style
  mood?: string;                 // Mood/emotion
  tempo?: number;                // BPM (30-300)
  duration?: number;             // Seconds (10-300)
  key?: string;                  // Musical key
  intensity?: number;            // 0-100
  status: 'queued' | 'generating' | 'completed' | 'failed';
  progress?: number;             // 0-100
  audioUrl?: string;             // S3 signed URL
  metadata?: {
    generationTime?: number;     // Milliseconds
    modelVersion?: string;       // AI model version
    qualityScore?: number;       // 0-100
  };
  createdAt: string;             // ISO timestamp
  completedAt?: string;          // ISO timestamp
  error?: string;                // Error message if failed
  favorite?: boolean;            // User favorite flag
}
```

## Job Queue System

**In-Memory Queue** (with persistence via file storage)

- Priority-based ordering
- Concurrent processing (configurable)
- Automatic retry with exponential backoff
- Timeout handling
- Index-based fast lookups

Key features:
- Max retries: 3
- Job timeout: 120 seconds
- Max concurrent: 5
- Automatic cleanup on completion

## API Endpoints

### 1. POST /api/generation/generate
**Submit a music generation request**

Request:
```json
{
  "prompt": "upbeat electronic dance music with pulsing synths",
  "genre": "EDM",
  "mood": "energetic",
  "tempo": 128,
  "duration": 30,
  "key": "D minor",
  "intensity": 85,
  "num_variants": 1
}
```

Response (201 Created):
```json
{
  "success": true,
  "data": {
    "jobId": "gen_1721828400000_abc123",
    "status": "queued",
    "estimatedTime": 10
  },
  "timestamp": "2024-07-24T12:00:00Z"
}
```

**Query Parameters:**
- None

**Required Headers:**
- `Authorization: Bearer {token}`

**Status Codes:**
- 201: Created successfully
- 400: Invalid request data
- 401: Unauthorized

---

### 2. GET /api/generation/status/{jobId}
**Get current status of a generation**

Response:
```json
{
  "success": true,
  "data": {
    "jobId": "gen_1721828400000_abc123",
    "status": "generating",
    "progress": 45,
    "eta": 8,
    "error": null
  },
  "timestamp": "2024-07-24T12:00:10Z"
}
```

**Status Values:**
- `queued`: Waiting in queue
- `generating`: Currently processing
- `completed`: Finished successfully
- `failed`: Failed or timed out

**ETA Calculation:**
- Queued: `(queuePosition × 15) + (queueSize × 5)` seconds
- Generating: `(duration × 0.3) × (100 - progress) / progress`
- Completed/Failed: 0

---

### 3. GET /api/generation/result/{jobId}
**Retrieve completed generation audio and metadata**

Response (200 OK):
```json
{
  "success": true,
  "data": {
    "jobId": "gen_1721828400000_abc123",
    "status": "completed",
    "audioUrl": "https://s3.amazonaws.com/wise2-generations/gen_1721828400000_abc123.wav?X-Amz-Expires=86400&...",
    "metadata": {
      "prompt": "upbeat electronic dance music with pulsing synths",
      "genre": "EDM",
      "mood": "energetic",
      "tempo": 128,
      "duration": 30,
      "key": "D minor",
      "intensity": 85,
      "generationTime": 12500,
      "modelVersion": "musicgen-v1.0",
      "qualityScore": 87
    },
    "createdAt": "2024-07-24T12:00:00Z",
    "completedAt": "2024-07-24T12:00:12Z"
  },
  "timestamp": "2024-07-24T12:00:15Z"
}
```

**Error Cases:**
- 404: Generation not found
- 400: Generation not completed yet
- 403: Access denied (wrong user)

---

### 4. GET /api/generation/history
**Get paginated history of user's generations**

Query Parameters:
```
?page=1
&pageSize=20
&sortBy=createdAt       // or 'completedAt', 'qualityScore'
&sortOrder=desc         // or 'asc'
&status=completed       // filter by status
&dateFrom=2024-07-01
&dateTo=2024-07-31
&style=EDM              // filter by genre
&mood=energetic         // filter by mood
&favorite=true          // filter by favorite
```

Response:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "gen_1721828400000_abc123",
        "prompt": "upbeat electronic dance music...",
        "genre": "EDM",
        "mood": "energetic",
        "status": "completed",
        "audioUrl": "https://...",
        "duration": 30,
        "createdAt": "2024-07-24T12:00:00Z",
        "favorite": true,
        "qualityScore": 87
      }
    ],
    "total": 150,
    "page": 1,
    "pageSize": 20,
    "hasMore": true,
    "filters": {
      "status": "completed",
      "style": "EDM",
      "mood": "energetic",
      "dateRange": {
        "start": "2024-07-01",
        "end": "2024-07-31"
      }
    }
  },
  "timestamp": "2024-07-24T12:00:15Z"
}
```

**Pagination:**
- Default: page=1, pageSize=20
- Max pageSize: 100
- Returns `hasMore` flag

---

### 5. POST /api/generation/export/{jobId}
**Export generation in different format**

Request:
```json
{
  "format": "mp3",
  "sampleRate": 44100,
  "bitDepth": 16
}
```

Response (202 Accepted):
```json
{
  "success": true,
  "data": {
    "jobId": "export_gen_1721828400000_abc123_mp3_1721828415000",
    "format": "mp3",
    "downloadUrl": "https://s3.amazonaws.com/wise2-generations/gen_1721828400000_abc123_44100hz_16bit.mp3?X-Amz-Expires=86400&...",
    "expiresIn": 86400
  },
  "timestamp": "2024-07-24T12:00:15Z"
}
```

**Supported Formats:**
- mp3, wav, flac, opus, ogg

**Sample Rates:**
- 44100 Hz (CD quality)
- 48000 Hz (professional)
- 96000 Hz (high-resolution)

**Bit Depths:**
- 16-bit (standard)
- 24-bit (high quality)
- 32-bit (studio master)

---

### 6. PATCH /api/generation/favorite/{jobId}
**Toggle favorite status**

Request:
```json
{
  "favorite": true
}
```

Response:
```json
{
  "success": true,
  "data": {
    "jobId": "gen_1721828400000_abc123",
    "favorite": true
  },
  "timestamp": "2024-07-24T12:00:15Z"
}
```

---

### 7. GET /api/generation/progress/{jobId}
**Stream generation progress via Server-Sent Events (SSE)**

Connection:
```bash
curl -H "Authorization: Bearer {token}" \
  https://api.wise2.studio/api/generation/progress/gen_1721828400000_abc123
```

Events:
```
event: progress
data: {"jobId":"gen_1721828400000_abc123","status":"generating","progress":45,"estimatedTime":8}

event: progress
data: {"jobId":"gen_1721828400000_abc123","status":"generating","progress":67,"estimatedTime":5}

event: completed
data: {"jobId":"gen_1721828400000_abc123","status":"completed","audioUrl":"https://...","metadata":{...}}
```

**Event Types:**
- `progress`: Status update (emitted every 1 second)
- `completed`: Generation finished successfully
- `failed`: Generation failed
- `error`: Connection or validation error

---

### 8. GET /api/generation/queue/stats
**Get queue statistics (admin/monitoring)**

Response:
```json
{
  "success": true,
  "data": {
    "queue": {
      "queued": 12,
      "processing": 5,
      "capacity": 17
    },
    "stats": {
      "averageWaitTime": "45s",
      "totalCompleted": 1250,
      "totalFailed": 8,
      "successRate": "99.4%"
    },
    "timestamp": "2024-07-24T12:00:15Z"
  }
}
```

---

## Client Integration Examples

### JavaScript/TypeScript

```typescript
// Submit generation
const response = await fetch('/api/generation/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    prompt: 'upbeat electronic dance music',
    genre: 'EDM',
    mood: 'energetic',
    tempo: 128,
    duration: 30
  })
});

const { data } = await response.json();
const jobId = data.jobId;

// Poll for status
let status = 'queued';
while (status !== 'completed' && status !== 'failed') {
  const statusResponse = await fetch(`/api/generation/status/${jobId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { data: statusData } = await statusResponse.json();
  status = statusData.status;
  console.log(`Status: ${status}, Progress: ${statusData.progress}%`);
  await new Promise(r => setTimeout(r, 1000));
}

// Get result
if (status === 'completed') {
  const resultResponse = await fetch(`/api/generation/result/${jobId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { data: resultData } = await resultResponse.json();
  console.log('Audio URL:', resultData.audioUrl);
}
```

### React Hook

```typescript
function useGeneration() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('idle');
  const [progress, setProgress] = useState(0);

  const submit = async (prompt: string, options: any) => {
    const response = await fetch('/api/generation/generate', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ prompt, ...options })
    });
    const { data } = await response.json();
    setJobId(data.jobId);
  };

  useEffect(() => {
    if (!jobId) return;

    const eventSource = new EventSource(
      `/api/generation/progress/${jobId}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setStatus(data.status);
      setProgress(data.progress);
    };

    eventSource.addEventListener('completed', () => {
      eventSource.close();
      setStatus('completed');
    });

    return () => eventSource.close();
  }, [jobId]);

  return { submit, status, progress, jobId };
}
```

---

## Error Handling

All errors follow standard format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "statusCode": 400,
  "timestamp": "2024-07-24T12:00:00Z",
  "details": {
    "field": "error_description"
  }
}
```

**Common Error Codes:**
- `UNAUTHORIZED` (401): Missing or invalid token
- `FORBIDDEN` (403): Access denied
- `NOT_FOUND` (404): Generation not found
- `VALIDATION_ERROR` (400): Invalid request data
- `NOT_COMPLETED` (400): Generation still processing
- `INTERNAL_SERVER_ERROR` (500): Unexpected server error

---

## Performance & Limits

- **Rate Limiting**: 100 requests/minute per user
- **Max Prompt Length**: 500 characters
- **Max Duration**: 300 seconds (5 minutes)
- **Queue Capacity**: Unlimited (but processing limited to 5 concurrent)
- **Job Timeout**: 120 seconds
- **Retry Attempts**: 3
- **Export Expiry**: 24 hours

---

## Implementation Files

```
apps/studio/
├── types/
│   └── api.ts                    # Generation type definitions
├── lib/
│   ├── generation-db.ts          # Database layer with indexing
│   └── job-queue.ts              # Job queue with retry logic
└── app/api/generation/
    ├── generate/
    │   └── route.ts              # Submit generation
    ├── status/[job_id]/
    │   └── route.ts              # Get status
    ├── result/[job_id]/
    │   └── route.ts              # Get result
    ├── history/
    │   └── route.ts              # List & filter history
    ├── export/[job_id]/
    │   └── route.ts              # Export formats
    ├── favorite/[job_id]/
    │   └── route.ts              # Toggle favorite
    ├── progress/[job_id]/
    │   └── route.ts              # SSE progress stream
    └── queue/stats/
        └── route.ts              # Queue statistics
```

---

## Future Enhancements

1. **Redis Integration**: Replace in-memory queue with Redis for distributed processing
2. **Celery Workers**: Add Python/Celery background workers for MusicGen
3. **Database Migration**: Move from JSON files to PostgreSQL
4. **S3 Integration**: Proper AWS SDK integration for signed URLs
5. **Webhooks**: Notify external services on completion
6. **Batch Generation**: Support generating multiple variants in one request
7. **Template System**: Pre-built generation templates
8. **Analytics**: Track usage patterns, popular styles, etc.

---

## Testing

```bash
# Submit generation
curl -X POST http://localhost:3005/api/generation/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "prompt": "calm ambient piano music",
    "genre": "Ambient",
    "mood": "peaceful",
    "duration": 30
  }'

# Check status
curl http://localhost:3005/api/generation/status/gen_1721828400000_abc123 \
  -H "Authorization: Bearer {token}"

# Stream progress
curl http://localhost:3005/api/generation/progress/gen_1721828400000_abc123 \
  -H "Authorization: Bearer {token}"

# Get history
curl "http://localhost:3005/api/generation/history?page=1&status=completed&sort=createdAt" \
  -H "Authorization: Bearer {token}"

# Toggle favorite
curl -X PATCH http://localhost:3005/api/generation/favorite/gen_1721828400000_abc123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"favorite": true}'

# Queue stats
curl http://localhost:3005/api/generation/queue/stats \
  -H "Authorization: Bearer {token}"
```

---

## Deployment Checklist

- [ ] Configure S3 bucket and credentials
- [ ] Set JWT_SECRET environment variable
- [ ] Create data/generations directory with proper permissions
- [ ] Configure Redis connection (production)
- [ ] Set up MusicGen service connection
- [ ] Configure CORS origin
- [ ] Set up monitoring and alerting
- [ ] Configure log aggregation
- [ ] Load test queue performance
- [ ] Set up backup for generation records
