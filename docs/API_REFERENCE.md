# WISE² Core v1.0 - API Reference

Complete API documentation for the unified WISE² platform.

## Table of Contents

1. [API Gateway](#api-gateway)
2. [Voice Assistant Service](#voice-assistant-service)
3. [Dashboard API](#dashboard-api)
4. [Authentication](#authentication)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Examples](#examples)

---

## API Gateway

The central routing layer for all services.

### Health Check

**Endpoint:** `GET /health`

**Authentication:** Not required

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-07-20T10:30:00Z",
  "services": {
    "executive": { "healthy": true, "latency": 45 },
    "developer": { "healthy": true, "latency": 32 },
    "infrastructure": { "healthy": true, "latency": 78 },
    "deployment": { "healthy": true, "latency": 89 },
    "voiceAssistant": { "healthy": true, "latency": 52 },
    "knowledgeGraph": { "healthy": true, "latency": 34 },
    "automations": { "healthy": true, "latency": 45 },
    "discord": { "healthy": true, "latency": 123 },
    "sync": { "healthy": true, "latency": 67 },
    "health": { "healthy": true, "latency": 12 }
  },
  "uptime": 3600.5
}
```

### Metrics

**Endpoint:** `GET /metrics`

**Authentication:** Not required

**Response:** Prometheus-format metrics
```
# HELP gateway_requests_total Total number of requests
# TYPE gateway_requests_total counter
gateway_requests_total 12847
gateway_responses_total 12840
gateway_errors_total 7
gateway_active_requests 3
gateway_cache_hits_total 8420
gateway_cache_misses_total 4420
gateway_ratelimit_hits_total 12
```

### Gateway Status

**Endpoint:** `GET /gateway/status`

**Authentication:** Not required

**Response:**
```json
{
  "service": "wise2-api-gateway",
  "version": "1.0.0",
  "environment": "production",
  "uptime": 86400.5,
  "timestamp": "2026-07-20T10:30:00Z"
}
```

---

## Executive Agent Routes

### Get Executive Status

**Endpoint:** `GET /api/executive/status`

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "status": "operational",
  "activeRequests": 42,
  "averageResponseTime": 145,
  "errorRate": 0.2,
  "uptime": 86400,
  "lastUpdated": "2026-07-20T10:30:00Z"
}
```

### Execute Command

**Endpoint:** `POST /api/executive/command`

**Authentication:** Required

**Body:**
```json
{
  "command": "deploy_service",
  "service": "api-gateway",
  "environment": "production"
}
```

**Response:**
```json
{
  "commandId": "cmd_1234567890",
  "status": "executing",
  "progress": 0,
  "estimatedTime": 300,
  "details": {
    "service": "api-gateway",
    "environment": "production",
    "startedAt": "2026-07-20T10:30:00Z"
  }
}
```

---

## Developer Agent Routes

### Code Review

**Endpoint:** `POST /api/developer/review`

**Authentication:** Required

**Body:**
```json
{
  "code": "function add(a, b) { return a + b; }",
  "language": "javascript",
  "context": "utility function"
}
```

**Response:**
```json
{
  "reviewId": "review_1234567890",
  "feedback": [
    {
      "line": 1,
      "severity": "info",
      "message": "Consider adding JSDoc comments",
      "suggestion": "/** Adds two numbers */\nfunction add(a, b) { return a + b; }"
    }
  ],
  "score": 8.5,
  "issues": 1,
  "warnings": 2
}
```

### Architecture Analysis

**Endpoint:** `POST /api/developer/analyze`

**Authentication:** Required

**Body:**
```json
{
  "files": ["src/index.ts", "src/utils.ts"],
  "focusArea": "performance"
}
```

**Response:**
```json
{
  "analysisId": "analysis_1234567890",
  "summary": "Architecture is well-structured...",
  "recommendations": [
    {
      "category": "performance",
      "priority": "high",
      "suggestion": "Implement caching layer for database queries"
    }
  ],
  "score": 7.8
}
```

---

## Voice Assistant Service

Base URL: `http://localhost:3002`

### Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "service": "voice-assistant",
  "uptime": 3600.5
}
```

### Transcribe Audio (REST)

**Endpoint:** `POST /transcribe`

**Body:**
```json
{
  "audio": "base64-encoded-audio-data",
  "language": "en"
}
```

**Response:**
```json
{
  "transcript": "Hello, this is a test transcription",
  "language": "en",
  "confidence": 0.95,
  "duration": 2.5
}
```

### Synthesize Text to Speech

**Endpoint:** `POST /synthesize`

**Body:**
```json
{
  "text": "Hello, how can I help you today?",
  "language": "en"
}
```

**Response:**
```json
{
  "audio": "base64-encoded-audio-data",
  "language": "en",
  "duration": 1.8
}
```

### Get Supported Languages

**Endpoint:** `GET /languages`

**Response:**
```json
{
  "supported": [
    "en", "es", "fr", "de", "it", "pt", "nl", "ru",
    "zh", "ja", "ko", "ar", "hi", "th", "vi", "pl",
    "tr", "sv", "da", "no", "fi"
  ]
}
```

### Set Language

**Endpoint:** `POST /language`

**Body:**
```json
{
  "language": "es"
}
```

**Response:**
```json
{
  "language": "es",
  "message": "Language set to es"
}
```

### WebSocket Connection

**Endpoint:** `WS /`

**Message Types:**

#### Start Session
```json
{
  "type": "start-session",
  "userId": "user_1234567890"
}
```

#### Send Audio Chunk
```json
{
  "type": "audio-chunk",
  "data": "base64-encoded-chunk"
}
```

#### Stop Session
```json
{
  "type": "stop-session"
}
```

#### Set Language
```json
{
  "type": "set-language",
  "data": { "language": "es" }
}
```

---

## Dashboard API

### Agent Status

**Endpoint:** `GET /api/agents/status`

**Response:**
```json
{
  "agents": [
    {
      "id": "agent_executive",
      "name": "Executive Agent",
      "status": "running",
      "uptime": 3600000,
      "requestsPerSecond": 12.5,
      "errorRate": 0.002,
      "lastUpdated": "2026-07-20T10:30:00Z"
    }
  ]
}
```

### Toggle Agent

**Endpoint:** `POST /api/agents/{agentId}/status`

**Body:**
```json
{
  "status": "running" or "idle"
}
```

### Knowledge Graph

**Endpoint:** `GET /api/knowledge-graph`

**Response:**
```json
{
  "nodes": [
    {
      "id": "node_1",
      "label": "User Profile",
      "type": "entity",
      "size": 10
    }
  ],
  "edges": [
    {
      "source": "node_1",
      "target": "node_2",
      "label": "contains",
      "weight": 1.0
    }
  ]
}
```

---

## Authentication

### Bearer Token

Include in Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://api.wise2.local/api/executive/status
```

### API Key

Include in X-API-Key header:

```bash
curl -H "X-API-Key: YOUR_API_KEY" \
  https://api.wise2.local/api/executive/status
```

### OAuth Token

Include in X-OAuth-Token header:

```bash
curl -H "X-OAuth-Token: YOUR_OAUTH_TOKEN" \
  https://api.wise2.local/api/executive/status
```

---

## Error Handling

### Error Response Format

```json
{
  "error": "ErrorType",
  "message": "Human-readable error message",
  "requestId": "req_1234567890",
  "statusCode": 400,
  "timestamp": "2026-07-20T10:30:00Z",
  "details": {
    "field": "Detailed error information"
  }
}
```

### Common Error Codes

| Status | Error | Message |
|--------|-------|---------|
| 400 | ValidationError | Invalid request data |
| 401 | UnauthorizedError | Authentication required |
| 403 | ForbiddenError | Insufficient permissions |
| 404 | NotFoundError | Resource not found |
| 429 | RateLimitError | Too many requests |
| 500 | InternalServerError | Server error |
| 503 | ServiceUnavailableError | Service temporarily down |
| 504 | TimeoutError | Request timeout |

---

## Rate Limiting

### Headers

Response includes rate limit information:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1626780000
```

### Limits by Endpoint

| Method | Endpoint | Limit | Window |
|--------|----------|-------|--------|
| GET | /api/* | 1000 | 1 min |
| POST | /api/* | 500 | 1 min |
| DELETE | /api/* | 100 | 1 min |
| GET | /api/voice/* | 500 | 1 min |
| GET | /api/health/* | 10000 | 1 min |

---

## Examples

### Example 1: Complete Voice Session

```bash
# 1. Connect to WebSocket
ws = new WebSocket('wss://api.wise2.local/api/voice')

# 2. Start session
ws.send(JSON.stringify({
  type: 'start-session',
  userId: 'user_123'
}))

# 3. Send audio chunks
ws.send(JSON.stringify({
  type: 'audio-chunk',
  data: 'AUDIO_DATA_BASE64'
}))

# 4. Receive transcript
# Message: { type: 'transcript', text: '...', confidence: 0.95 }

# 5. Receive response
# Message: { type: 'response', text: '...', audioAvailable: true }

# 6. Close session
ws.send(JSON.stringify({
  type: 'stop-session'
}))
```

### Example 2: Multi-Agent Coordination

```bash
# Executive Agent: Get system status
curl -H "Authorization: Bearer TOKEN" \
  https://api.wise2.local/api/executive/status

# Developer Agent: Review code
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code": "...", "language": "typescript"}' \
  https://api.wise2.local/api/developer/review

# Deployment Agent: Deploy service
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"service": "api-gateway", "version": "1.0.0"}' \
  https://api.wise2.local/api/deployment/deploy
```

### Example 3: Monitoring via Metrics

```bash
# Get Prometheus metrics
curl https://api.wise2.local/metrics

# Parse specific metric
curl https://api.wise2.local/metrics | grep gateway_requests_total
# Output: gateway_requests_total 12847
```

---

## Versioning

- **Current Version:** 1.0.0
- **API Stability:** Stable (production-ready)
- **Last Updated:** 2026-07-20

For updates and changes, see [CHANGELOG.md](./CHANGELOG.md)

---

## Support

- **Documentation:** https://docs.wise2.local
- **Issues:** https://github.com/wise2-core/issues
- **Email:** support@wise2.local
