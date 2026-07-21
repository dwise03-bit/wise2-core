# WISE² Core v1.0 - System Architecture

Complete technical architecture and design documentation for WISE² Core.

## System Overview

WISE² Core v1.0 is a unified agentic operating system with:

- **API Gateway** (port 3000): Central routing, auth, rate limiting, caching
- **Voice Assistant** (port 3002): Speech processing, multi-language support  
- **Command Center** (port 3001): React dashboard for system control
- **Microservices**: Executive, Developer, Infrastructure, Deployment agents

## Core Components

### 1. API Gateway (3000)

**Responsibilities:**
- Request routing to appropriate services
- Authentication & authorization (JWT, API keys, OAuth)
- Rate limiting (per-user, per-agent, per-endpoint)
- Response caching with Redis
- Request logging & structured metrics
- Unified error handling
- CORS & security headers

### 2. Voice Assistant Service (3002)

**Responsibilities:**
- Audio stream processing
- Speech-to-text (Whisper or local model)
- Text-to-speech (Google, Azure, ElevenLabs)
- Wake word detection (Porcupine)
- Automatic language detection
- Multi-language support (20+ languages)
- WebSocket + REST API

### 3. Dashboard (Command Center)

**Technology:** React 18, TypeScript, Tailwind CSS

**Sections:**
1. Agent Control Panel - Real-time agent status, start/stop
2. Knowledge Graph Explorer - Visual entity relationships
3. Voice Assistant Interface - Listen, transcribe, respond
4. Device Sync Status - Cross-device synchronization
5. System Metrics - Performance, uptime, error rates

## Service Architecture

```
┌────────────────────────────────────────┐
│         API Gateway (3000)             │
│  ├─ Authentication                     │
│  ├─ Rate Limiting                      │
│  ├─ Response Caching                   │
│  └─ Request Logging & Metrics          │
└──┬─────────────────────────────────────┘
   │
   ├─→ Executive Agent
   ├─→ Developer Agent
   ├─→ Infrastructure Agent
   ├─→ Deployment Agent
   ├─→ Voice Assistant (3002)
   ├─→ Knowledge Graph
   ├─→ Automations
   ├─→ Discord Bots
   ├─→ Sync Engine
   └─→ Health Service
```

## Authentication & Authorization

### Supported Methods

1. **JWT Bearer Tokens** - User sessions
2. **API Keys** - Service-to-service
3. **OAuth 2.0** - Third-party integrations

### Role-Based Access Control (RBAC)

- `admin`: Full system access
- `agent_owner`: Own agent + metrics access
- `user`: Own data + own automation execution
- `service`: Service-to-service communication

## Rate Limiting

**Per-User Tiers:**
- Premium: 5,000 req/min
- Regular: 1,000 req/min
- Free: 100 req/min

**Per-Endpoint:**
- GET: 1,000 req/min
- POST: 500 req/min
- DELETE: 100 req/min

## Caching Strategy

**Cacheable:** GET requests only

**TTL Defaults:**
- Health endpoints: 60 seconds
- Knowledge graph: 300 seconds
- Sync endpoints: 300 seconds
- Default: 300 seconds (5 minutes)

## Security Model

### Data Protection
- **In Transit:** HTTPS/TLS 1.3
- **At Rest:** AES-256 encryption
- **Secrets:** Vault storage

### Rate Limiting
- Prevents brute force attacks
- Per-user & per-IP limiting
- Exponential backoff on 429 responses

## Scalability

### Horizontal Scaling
- API Gateway is stateless
- Services scale independently
- Database read replicas
- Redis cluster for cache

### Performance
- Response caching (Redis)
- Database query caching
- gzip compression
- Connection pooling
- Async/non-blocking I/O

## Monitoring & Observability

### Metrics (Prometheus)
- `gateway_requests_total`: Total requests
- `gateway_responses_total`: Total responses
- `gateway_errors_total`: Total errors
- `gateway_response_time_seconds`: Response latency
- `gateway_cache_hits_total`: Cache hits
- `gateway_ratelimit_hits_total`: Rate limit hits

### Logging
- Structured JSON logging
- Request ID tracing
- User ID tracking
- Error stack traces
- Duration metrics

## Deployment

### Kubernetes Deployment

```
wise2-core namespace:
  ├─ API Gateway (3 replicas)
  ├─ Services (2-3 replicas each)
  │  ├─ Executive Agent
  │  ├─ Developer Agent
  │  ├─ Infrastructure Agent
  │  ├─ Deployment Agent
  │  └─ Voice Assistant (3 replicas)
  └─ Data Tier
     ├─ PostgreSQL (primary + replica)
     ├─ Redis (cache cluster)
     └─ Prometheus (metrics)
```

### Requirements
- PostgreSQL 14+
- Redis 6.0+
- Docker/Kubernetes
- Prometheus + Grafana

## Voice Processing

### Supported Languages (20+)
en, es, fr, de, it, pt, nl, ru, zh, ja, ko, ar, hi, th, vi, pl, tr, sv, da, no, fi

### Speech-to-Text Providers
1. Local Whisper (fastest)
2. OpenAI Whisper API
3. Google Speech-to-Text
4. Azure Speech Services

### Text-to-Speech Providers
1. Google Cloud TTS
2. Azure Speech Services
3. ElevenLabs
4. AWS Polly

### Wake Word Detection
- Default: "hey wise", "okay wise"
- Customizable per deployment
- Porcupine engine

## Error Handling

### Error Response Format
```json
{
  "error": "ErrorType",
  "message": "Human-readable message",
  "requestId": "req_xyz",
  "statusCode": 400,
  "timestamp": "2026-07-20T10:30:00Z"
}
```

### Status Codes
- 400: Validation error
- 401: Authentication required
- 403: Insufficient permissions
- 404: Not found
- 429: Rate limit exceeded
- 500: Server error
- 503: Service unavailable
- 504: Timeout

---

**Last Updated:** 2026-07-20  
**Version:** 1.0.0  
**Status:** Production-ready
