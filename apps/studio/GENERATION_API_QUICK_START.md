# Music Generation API - Quick Start Guide

Fast reference for using the generation API.

## Basic Flow

```
1. Submit Generation → GET jobId
2. Poll Status → Wait for completion
3. Fetch Result → Download audio
4. Export (optional) → Convert format
```

## API Endpoints Quick Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/generation/generate` | Submit job |
| GET | `/api/generation/status/{jobId}` | Check status |
| GET | `/api/generation/result/{jobId}` | Get audio URL |
| GET | `/api/generation/history` | List past generations |
| POST | `/api/generation/export/{jobId}` | Convert format |
| PATCH | `/api/generation/favorite/{jobId}` | Star/unstar |
| GET | `/api/generation/progress/{jobId}` | Stream progress (SSE) |
| GET | `/api/generation/queue/stats` | Queue info |

---

## 1. Submit Generation

```bash
curl -X POST http://localhost:3005/api/generation/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "prompt": "upbeat electronic dance music with pulsing synths",
    "genre": "EDM",
    "mood": "energetic",
    "tempo": 128,
    "duration": 30,
    "key": "D minor",
    "intensity": 85
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "gen_1721828400000_abc123",
    "status": "queued",
    "estimatedTime": 10
  }
}
```

---

## 2. Check Status

```bash
curl http://localhost:3005/api/generation/status/gen_1721828400000_abc123 \
  -H "Authorization: Bearer {token}"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "gen_1721828400000_abc123",
    "status": "generating",
    "progress": 45,
    "eta": 8
  }
}
```

**Status Values:** `queued` → `generating` → `completed` (or `failed`)

---

## 3. Get Result

```bash
curl http://localhost:3005/api/generation/result/gen_1721828400000_abc123 \
  -H "Authorization: Bearer {token}"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "gen_1721828400000_abc123",
    "status": "completed",
    "audioUrl": "https://s3.amazonaws.com/wise2-generations/...",
    "metadata": {
      "prompt": "upbeat electronic dance music...",
      "genre": "EDM",
      "mood": "energetic",
      "generationTime": 12500,
      "qualityScore": 87
    }
  }
}
```

---

## 4. Stream Progress (Real-time)

```bash
curl http://localhost:3005/api/generation/progress/gen_1721828400000_abc123 \
  -H "Authorization: Bearer {token}"
```

**Events:**
```
event: progress
data: {"status":"generating","progress":25,"eta":15}

event: progress
data: {"status":"generating","progress":50,"eta":10}

event: completed
data: {"status":"completed","audioUrl":"https://...","metadata":{...}}
```

---

## 5. Export to Different Format

```bash
curl -X POST http://localhost:3005/api/generation/export/gen_1721828400000_abc123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "format": "mp3",
    "sampleRate": 44100,
    "bitDepth": 16
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "export_gen_...",
    "format": "mp3",
    "downloadUrl": "https://s3.amazonaws.com/wise2-generations/...",
    "expiresIn": 86400
  }
}
```

---

## 6. Toggle Favorite

```bash
curl -X PATCH http://localhost:3005/api/generation/favorite/gen_1721828400000_abc123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"favorite": true}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "gen_1721828400000_abc123",
    "favorite": true
  }
}
```

---

## 7. Get History

```bash
# All generations
curl "http://localhost:3005/api/generation/history?page=1&pageSize=20" \
  -H "Authorization: Bearer {token}"

# Completed only
curl "http://localhost:3005/api/generation/history?status=completed" \
  -H "Authorization: Bearer {token}"

# By date range
curl "http://localhost:3005/api/generation/history?dateFrom=2024-07-01&dateTo=2024-07-31" \
  -H "Authorization: Bearer {token}"

# By mood
curl "http://localhost:3005/api/generation/history?mood=energetic" \
  -H "Authorization: Bearer {token}"

# Favorites only
curl "http://localhost:3005/api/generation/history?favorite=true" \
  -H "Authorization: Bearer {token}"

# Sorted by quality
curl "http://localhost:3005/api/generation/history?sortBy=qualityScore&sortOrder=desc" \
  -H "Authorization: Bearer {token}"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "gen_...",
        "prompt": "upbeat electronic dance music...",
        "genre": "EDM",
        "status": "completed",
        "audioUrl": "https://...",
        "createdAt": "2024-07-24T12:00:00Z",
        "favorite": true,
        "qualityScore": 87
      }
    ],
    "total": 150,
    "page": 1,
    "pageSize": 20,
    "hasMore": true
  }
}
```

---

## 8. Queue Stats

```bash
curl http://localhost:3005/api/generation/queue/stats \
  -H "Authorization: Bearer {token}"
```

**Response:**
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
    }
  }
}
```

---

## Complete JavaScript Example

```javascript
class GenerationAPI {
  constructor(token) {
    this.token = token;
    this.baseUrl = 'http://localhost:3005';
  }

  async submit(prompt, options = {}) {
    const response = await fetch(`${this.baseUrl}/api/generation/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ prompt, ...options })
    });
    return response.json();
  }

  async getStatus(jobId) {
    const response = await fetch(
      `${this.baseUrl}/api/generation/status/${jobId}`,
      { headers: { 'Authorization': `Bearer ${this.token}` } }
    );
    return response.json();
  }

  async getResult(jobId) {
    const response = await fetch(
      `${this.baseUrl}/api/generation/result/${jobId}`,
      { headers: { 'Authorization': `Bearer ${this.token}` } }
    );
    return response.json();
  }

  async streamProgress(jobId, callbacks) {
    const eventSource = new EventSource(
      `${this.baseUrl}/api/generation/progress/${jobId}`,
      { headers: { 'Authorization': `Bearer ${this.token}` } }
    );

    eventSource.addEventListener('progress', (e) => {
      const data = JSON.parse(e.data);
      callbacks.onProgress?.(data);
    });

    eventSource.addEventListener('completed', (e) => {
      const data = JSON.parse(e.data);
      callbacks.onCompleted?.(data);
      eventSource.close();
    });

    eventSource.addEventListener('failed', (e) => {
      const data = JSON.parse(e.data);
      callbacks.onFailed?.(data);
      eventSource.close();
    });

    eventSource.onerror = () => {
      callbacks.onError?.();
      eventSource.close();
    };

    return eventSource;
  }

  async export(jobId, format, options = {}) {
    const response = await fetch(
      `${this.baseUrl}/api/generation/export/${jobId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ format, ...options })
      }
    );
    return response.json();
  }

  async toggleFavorite(jobId, favorite) {
    const response = await fetch(
      `${this.baseUrl}/api/generation/favorite/${jobId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ favorite })
      }
    );
    return response.json();
  }

  async getHistory(options = {}) {
    const params = new URLSearchParams(options);
    const response = await fetch(
      `${this.baseUrl}/api/generation/history?${params}`,
      { headers: { 'Authorization': `Bearer ${this.token}` } }
    );
    return response.json();
  }

  async getQueueStats() {
    const response = await fetch(
      `${this.baseUrl}/api/generation/queue/stats`,
      { headers: { 'Authorization': `Bearer ${this.token}` } }
    );
    return response.json();
  }
}

// Usage
const api = new GenerationAPI('your-jwt-token');

// Submit and wait for completion
const { data: { jobId } } = await api.submit('upbeat EDM', {
  genre: 'EDM',
  tempo: 128,
  duration: 30
});

console.log(`Job submitted: ${jobId}`);

// Stream progress
const eventSource = api.streamProgress(jobId, {
  onProgress: (data) => {
    console.log(`Progress: ${data.progress}%, ETA: ${data.eta}s`);
  },
  onCompleted: (data) => {
    console.log('Complete!', data.audioUrl);
  },
  onFailed: (data) => {
    console.error('Failed:', data.error);
  }
});

// Or poll status
let status = 'queued';
while (status !== 'completed' && status !== 'failed') {
  const { data } = await api.getStatus(jobId);
  status = data.status;
  console.log(`Status: ${status}, Progress: ${data.progress}%`);
  await new Promise(r => setTimeout(r, 2000));
}

// Get result
const { data: result } = await api.getResult(jobId);
console.log('Audio URL:', result.audioUrl);

// Export to MP3
const { data: export_ } = await api.export(jobId, 'mp3', {
  sampleRate: 44100,
  bitDepth: 16
});
console.log('Download:', export_.downloadUrl);

// Get history
const { data: history } = await api.getHistory({
  status: 'completed',
  sortBy: 'createdAt',
  sortOrder: 'desc'
});
console.log(`Found ${history.total} generations`);
```

---

## React Hook

```typescript
import { useEffect, useState } from 'react';

function useGeneration(token) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (prompt: string, options: any) => {
    try {
      const response = await fetch('/api/generation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt, ...options })
      });
      const { data } = await response.json();
      setJobId(data.jobId);
      setStatus('queued');
    } catch (err) {
      setError(String(err));
    }
  };

  useEffect(() => {
    if (!jobId) return;

    const eventSource = new EventSource(
      `/api/generation/progress/${jobId}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    eventSource.addEventListener('progress', (e) => {
      const data = JSON.parse(e.data);
      setStatus(data.status);
      setProgress(data.progress || 0);
    });

    eventSource.addEventListener('completed', (e) => {
      const data = JSON.parse(e.data);
      setStatus('completed');
      setProgress(100);
      setAudioUrl(data.audioUrl);
      eventSource.close();
    });

    eventSource.addEventListener('failed', (e) => {
      const data = JSON.parse(e.data);
      setStatus('failed');
      setError(data.error);
      eventSource.close();
    });

    eventSource.onerror = () => {
      setError('Connection error');
      eventSource.close();
    };

    return () => eventSource.close();
  }, [jobId, token]);

  return { submit, status, progress, audioUrl, error, jobId };
}

// Usage in component
function GenerationForm() {
  const { submit, status, progress, audioUrl } = useGeneration(token);

  return (
    <div>
      <button onClick={() => submit('upbeat EDM', { genre: 'EDM' })}>
        Generate
      </button>

      {status && <p>Status: {status}</p>}

      {progress > 0 && (
        <progress value={progress} max={100} />
      )}

      {audioUrl && (
        <audio controls src={audioUrl} />
      )}
    </div>
  );
}
```

---

## Error Handling

All errors follow standard format:

```json
{
  "error": "Generation not found",
  "code": "NOT_FOUND",
  "statusCode": 404,
  "timestamp": "2024-07-24T12:00:00Z"
}
```

**Common Status Codes:**
- 201: Created (generation submitted)
- 202: Accepted (export started)
- 400: Bad request (validation error)
- 401: Unauthorized (invalid token)
- 403: Forbidden (access denied)
- 404: Not found (generation not found)
- 500: Server error

---

## Rate Limits

- 100 requests/minute per user
- Max prompt: 500 characters
- Max duration: 300 seconds
- Queue capacity: Unlimited (processing limited)

---

## Supported Formats

**Generation:** Primarily WAV (internally)

**Export Formats:**
- MP3 (lossy, web-friendly)
- WAV (lossless, raw)
- FLAC (lossless, compressed)
- OGG (lossy, efficient)
- OPUS (lossy, high compression)

**Sample Rates:**
- 44.1 kHz (CD quality)
- 48 kHz (professional)
- 96 kHz (high-resolution)

**Bit Depths:**
- 16-bit (standard)
- 24-bit (high quality)
- 32-bit (studio master)

---

## Tips & Best Practices

1. **Always use Authorization header** with valid JWT token
2. **Stream progress** via SSE instead of polling for better UX
3. **Cache results** - audio URLs are persistent
4. **Tag favorites** for quick access to best generations
5. **Check queue stats** before submission if concerned about wait
6. **Handle errors gracefully** - show user-friendly messages
7. **Paginate history** - don't fetch all at once
8. **Use appropriate formats** - MP3 for web, WAV for editing
9. **Set reasonable timeouts** - some jobs take 30+ seconds
10. **Monitor API** - log errors for debugging

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check JWT token validity |
| 403 Forbidden | Ensure jobId belongs to your user |
| 404 Not Found | Generation may have been deleted |
| Generation stuck queued | Check queue stats, may need to wait |
| SSE not connecting | Check CORS headers, auth token |
| Export fails | Ensure generation is completed first |
| Audio quality low | Try higher intensity in prompt |

---

See [API_GENERATION_COMPLETE.md](API_GENERATION_COMPLETE.md) for full documentation.
