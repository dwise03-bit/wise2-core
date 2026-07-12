# WISE² Enterprise - API Inventory & Dependency Matrix

**Generated**: 2026-07-11  
**Total Services Discovered**: 15  
**Active Integrations**: 5  
**Template Configurations**: 8  
**Recommended for Phase 2**: 7  

---

## Executive Summary

| Category | Count | Active | Ready | Status |
|----------|-------|--------|-------|--------|
| **AI Services** | 3 | Claude ✅ | OpenAI, Ollama | 1/3 live |
| **Communication** | 4 | Discord ✅ | Resend, SendGrid | 1/4 live |
| **Developer** | 2 | Partial | GitHub | Limited |
| **Payment** | 1 | — | Stripe | 0/1 (Phase 2) |
| **Media/Streaming** | 2 | — | YouTube, Twitch | 0/2 (Future) |
| **Database** | 2 | PostgreSQL ✅, Redis ✅ | — | 2/2 ready |
| **Monitoring** | 1 | Prometheus ✅ | Grafana, AlertManager | 1/3 active |
| **Analytics** | 1 | — | PostHog | 0/1 (Optional) |
| **Total** | **15** | **5** | **10** | **33% Active** |

---

## Detailed Service Inventory

### TIER 1: CRITICAL (Required for Production)

#### 1. PostgreSQL 15 Database

```yaml
Service: PostgreSQL 15
Category: Database
Status: ✅ ACTIVE & REQUIRED
Phase: Core (Phase 1)
Priority: CRITICAL

Connection:
  URL: postgresql://wise2:password@postgres:5432/wise2
  Port: 5432 (internal) / 5434 (external in local)
  Version: 15.x (latest stable)
  Engine: ACID-compliant relational database

Credentials:
  - DB_HOST (postgres)
  - DB_PORT (5432)
  - DB_USERNAME (wise2)
  - DB_PASSWORD (env-based)
  - DB_NAME (wise2_core)
  - DATABASE_URL (connection string)

Features:
  ✅ TypeORM integration
  ✅ Auto-sync schema (dev only)
  ✅ UUID primary keys
  ✅ Automatic timestamps
  ✅ JSON column support
  ✅ Full-text search
  ✅ JSONB queries
  ✅ Role-based access control
  ✅ Backup automation

Dependencies:
  - TypeORM (ORM layer)
  - API Service (primary consumer)
  - Worker Service (background jobs)
  - Backup system (30-day retention)

Health Check:
  Command: docker-compose exec postgres pg_isready -U wise2
  Expected: "accepting connections"
  Frequency: Every 10 seconds

Configuration:
  max_connections: 100
  shared_buffers: 256MB
  effective_cache_size: 1GB
  work_mem: 16MB
  maintenance_work_mem: 64MB
```

#### 2. Redis 7 Cache & Queue

```yaml
Service: Redis 7
Category: Database/Cache
Status: ✅ ACTIVE & REQUIRED
Phase: Core (Phase 1)
Priority: CRITICAL

Connection:
  URL: redis://:password@redis:6379/0
  Host: redis
  Port: 6379 (internal) / 6381 (external in local)
  Protocol: Redis 7.x
  Max Memory: 256MB

Credentials:
  - REDIS_URL (connection string)
  - REDIS_HOST (hostname)
  - REDIS_PORT (port number)
  - REDIS_PASSWORD (auth token)
  - REDIS_DB (database selection)

Use Cases:
  ✅ Session storage (24-hour TTL)
  ✅ Application cache (1-hour TTL)
  ✅ Message queue for workers
  ✅ Real-time subscriptions
  ✅ Rate limiting counters
  ✅ Leaderboard caching

Key Patterns:
  user:{id}:profile → User cache
  session:{token} → Active sessions
  jobs:email → Email job queue
  api:ratelimit:{endpoint} → Rate limits
  metrics:{key} → Real-time metrics

Dependencies:
  - API Service (caching)
  - Worker Service (job queue)
  - Discord Bot (rate limits)
  - Session middleware

Health Check:
  Command: docker-compose exec redis redis-cli ping
  Expected: "PONG"
  Frequency: Every 10 seconds

Performance Metrics:
  - Connected clients
  - Memory usage
  - Eviction rate
  - Hit/miss ratio
```

#### 3. Anthropic Claude API

```yaml
Service: Anthropic Claude
Category: AI/Language Model
Status: ✅ ACTIVE & REQUIRED
Phase: Core (Phase 1)
Priority: CRITICAL

API Endpoint: https://api.anthropic.com/v1
Authentication: Bearer Token
Model: claude-3-5-sonnet-20241022

Credentials:
  - CLAUDE_API_KEY (sk-ant-format)
  - CLAUDE_API_MODEL (model identifier)
  - CLAUDE_API_TIMEOUT (30000ms default)

Features:
  ✅ Advanced reasoning
  ✅ Code generation
  ✅ Text analysis
  ✅ Content creation
  ✅ Multi-turn conversations
  ✅ System prompts
  ✅ Tool use (function calling)
  ✅ Vision support (images)

Rate Limits:
  - Requests per minute: Depends on plan
  - Tokens per minute: Depends on plan
  - Max tokens per request: 4096
  - Context window: 200K tokens

Pricing:
  - Input: $3/MTok (claude-3-5-sonnet)
  - Output: $15/MTok

Integration Points:
  - API Service (all AI features)
  - Worker Service (batch processing)
  - Modules system (plugin execution)
  - Community features (content generation)

Health Check:
  Endpoint: https://api.anthropic.com/health
  Method: HEAD request
  Expected: HTTP 200

Cost Optimization:
  - Cache system prompts
  - Batch similar requests
  - Use appropriate model for task
  - Monitor token usage
  - Set request timeouts

Fallback:
  - Ollama (local LLM)
  - OpenAI API (alternative)
```

---

### TIER 2: IMPORTANT (Strongly Recommended)

#### 4. Discord Bot

```yaml
Service: Discord Bot
Category: Communication/Admin
Status: ✅ ACTIVE & RECOMMENDED
Phase: Core (Phase 1)
Priority: HIGH

Platform: Discord.js
Hosting: Docker container
No exposed HTTP port

Credentials:
  - DISCORD_BOT_TOKEN (NDk3xxx format)
  - DISCORD_GUILD_ID (server ID)
  - ADMIN_ID (Discord user ID)
  - DISCORD_LOG_CHANNEL (optional, channel ID)

Commands Implemented:
  !status      → System health check
  !update      → Deploy latest code
  !restart     → Restart services
  !logs        → Stream service logs (last 100 lines)
  !metrics     → Current system metrics

Features:
  ✅ Real-time status monitoring
  ✅ Admin command execution
  ✅ Alert notifications
  ✅ Log streaming
  ✅ Error reporting
  ✅ System metrics display
  ✅ Audit logging

Setup Process:
  1. Create bot in Discord Developer Portal
  2. Copy bot token
  3. Enable Privileged Gateway Intents
  4. Add bot to server with Admin permissions
  5. Get server ID and admin user ID
  6. Set environment variables

Dependencies:
  - Discord API (external service)
  - API Service (status queries)
  - PostgreSQL (audit logs)
  - Prometheus (metrics)

Authorization:
  - Only specified ADMIN_ID can execute commands
  - Single point of failure (consider team IDs in Phase 2)

Monitoring:
  - Bot online status
  - Command execution logs
  - Error tracking

Cost: Free (Discord service)
```

#### 5. Prometheus Monitoring

```yaml
Service: Prometheus
Category: Monitoring/Metrics
Status: ✅ ACTIVE & RECOMMENDED
Phase: Core (Phase 1)
Priority: HIGH

HTTP Port: 9090 (internal)
No credentials required

Features:
  ✅ Time-series database
  ✅ Pull-based metrics collection
  ✅ 15-day retention (configurable)
  ✅ Query language (PromQL)
  ✅ Alerting rules
  ✅ Federation support

Scrape Targets:
  - API Service (:3000/metrics)
  - PostgreSQL exporter
  - Redis exporter
  - Node exporter (host metrics)
  - Container stats

Key Metrics Collected:
  - http_requests_total
  - http_request_duration_seconds
  - http_request_size_bytes
  - http_response_size_bytes
  - process_memory_bytes
  - process_cpu_seconds_total
  - process_resident_memory_bytes
  - postgres_up
  - redis_connected_clients
  - redis_used_memory_bytes

Configuration:
  Scrape Interval: 15 seconds
  Evaluation Interval: 15 seconds
  Retention: 15 days (432 hours)

Query Examples:
  # Request rate per second
  rate(http_requests_total[5m])
  
  # P95 latency
  histogram_quantile(0.95, http_request_duration_seconds)
  
  # Error rate
  rate(http_requests_total{status="5xx"}[5m])

Dependencies:
  - API Service (metrics export)
  - Grafana (visualization)
  - AlertManager (alerting)

Cost: Free (open source)
```

---

### TIER 3: RECOMMENDED (Phase 2+)

#### 6. Resend Email Service

```yaml
Service: Resend
Category: Communication/Email
Status: ⚠️ TEMPLATE (Ready for Phase 2)
Phase: Phase 2+
Priority: MEDIUM

Setup Required: Yes (Phase 2)
API Endpoint: https://api.resend.com
Authentication: Bearer Token (API Key)

Credentials:
  - RESEND_API_KEY (re_format)

Use Cases:
  - Transactional emails
  - Password resets
  - Email verification
  - Notification emails
  - Newsletter sending

Features:
  ✅ WYSIWYG email editor
  ✅ React email templates
  ✅ Good deliverability
  ✅ Event webhooks
  ✅ Detailed logging
  ✅ Open/click tracking
  ✅ Custom domains
  ✅ Team collaboration

Rate Limits:
  - 100 emails/day (free)
  - Unlimited (paid)

Pricing:
  - Free: 100 emails/month
  - Paid: $20/month + $0.001 per email

Integration Points:
  - Auth service (password reset)
  - Email notifications
  - Newsletter delivery
  - Receipt emails

Health Check:
  Endpoint: https://api.resend.com/health
  Method: HEAD

Cost: Minimal (likely < $10/month)
```

#### 7. Stripe Payment Processing

```yaml
Service: Stripe
Category: Payment/Billing
Status: ⚠️ FRAMEWORK READY (Phase 2)
Phase: Phase 2+ (Billing implementation)
Priority: MEDIUM

API Endpoint: https://api.stripe.com/v1
Authentication: Bearer Token (Secret Key)

Credentials:
  - STRIPE_SECRET_KEY (sk_live_format)
  - STRIPE_PUBLISHABLE_KEY (pk_live_format)
  - STRIPE_WEBHOOK_SECRET (whsec_format)
  - STRIPE_ACCOUNT_ID (optional)

Features:
  ✅ Subscription billing
  ✅ One-time payments
  ✅ Invoicing
  ✅ Connect (marketplace)
  ✅ Webhook webhooks
  ✅ PCI compliance
  ✅ 3D Secure support
  ✅ Recurring billing

Use Cases:
  - Subscription plans
  - Usage-based billing
  - One-time purchases
  - Marketplace payments
  - Invoice management

API Resources:
  - Customers
  - Payment Intents
  - Subscriptions
  - Invoices
  - Products
  - Prices

Webhook Events:
  - charge.succeeded
  - invoice.payment_succeeded
  - customer.subscription.updated
  - charge.refunded

Integration Points:
  - Billing module (ready)
  - Payment API routes (defined)
  - Webhook handler (configured)
  - Dashboard (payment UI)

Testing:
  - Use test keys (sk_test_xxx)
  - Test card: 4242 4242 4242 4242
  - Switch to live keys for production

Cost: 2.9% + $0.30 per transaction

Status in Code:
  - Models defined: ✅
  - Service defined: ⚠️ Awaiting Phase 2
  - Routes defined: ⚠️ Awaiting Phase 2
  - Webhook handler: ⚠️ Awaiting Phase 2
```

#### 8. SendGrid Email (Alternative)

```yaml
Service: SendGrid
Category: Communication/Email
Status: ⚠️ TEMPLATE (Alternative to Resend)
Phase: Phase 2+
Priority: MEDIUM

API Endpoint: https://api.sendgrid.com/v3
Authentication: Bearer Token (API Key)

Credentials:
  - SENDGRID_API_KEY (SG.xxx format)

Features:
  ✅ Dynamic templates
  ✅ Event webhooks
  ✅ Subuser management
  ✅ Email validation
  ✅ Advanced analytics
  ✅ A/B testing
  ✅ Subdomains

Pricing:
  - Free: 100 emails/day
  - Essentials: $9.95/month (5K emails)
  - Pro: $80/month (100K emails)
  - Advanced: Custom pricing

Comparison vs Resend:
  SendGrid: More enterprise features
  Resend: Simpler, modern, better React support

Integration: Identical to Resend
```

---

### TIER 4: OPTIONAL (Future/Alternative)

#### 9. OpenAI API (Alternative AI)

```yaml
Service: OpenAI
Category: AI/Language Model
Status: ⚠️ OPTIONAL (Alternative to Claude)
Phase: Phase 2+ (if needed)
Priority: LOW

Use Case: Model redundancy, different capabilities
Models: GPT-4, GPT-3.5-Turbo, etc.

Credentials:
  - OPENAI_API_KEY (sk-proj-format)

Pricing:
  - GPT-4: Higher cost
  - GPT-3.5-Turbo: Lower cost
  - Variable based on tokens

When to Use:
  - Specific model requirements
  - Vendor redundancy
  - Cost optimization
  - Vision-only tasks
```

#### 10. YouTube API

```yaml
Service: YouTube
Category: Media/Streaming
Status: ⚠️ TEMPLATE (Phase 2+)
Phase: Phase 2+ (LIVE Center)
Priority: LOW

Credentials:
  - YOUTUBE_API_KEY (AIzaSy... format)
  - YOUTUBE_CHANNEL_ID (optional)

Use Cases:
  - LIVE stream integration
  - Video uploads
  - Analytics
  - Channel management

Cost: Free (quota-based)
```

#### 11. Twitch API

```yaml
Service: Twitch
Category: Media/Streaming
Status: ⚠️ TEMPLATE (Phase 2+)
Phase: Phase 2+ (Alternative streaming)
Priority: LOW

Credentials:
  - TWITCH_CLIENT_ID
  - TWITCH_CLIENT_SECRET
  - TWITCH_ACCESS_TOKEN (optional)

Use Cases:
  - Twitch embed support
  - Stream integration
  - Clip management

Cost: Free
```

#### 12. GitHub Integration

```yaml
Service: GitHub
Category: Developer/VCS
Status: ⚠️ PARTIAL (Limited use)
Phase: Core (can enhance)
Priority: LOW

Credentials:
  - GITHUB_TOKEN (ghp_format)
  - GITHUB_OWNER (dwise03-bit)
  - GITHUB_REPO (wise2-enterprise)

Current Use:
  - Repository reference
  - Manual deployments

Possible Enhancements:
  - Automatic deployment via webhook
  - Release management
  - Issue tracking
  - PR automation
  - GitHub Actions integration
```

#### 13. PostHog Analytics (Optional)

```yaml
Service: PostHog
Category: Analytics
Status: ⚠️ OPTIONAL (Nice to have)
Phase: Phase 2+
Priority: LOW

Credentials:
  - NEXT_PUBLIC_POSTHOG_KEY

Use Cases:
  - User behavior tracking
  - Feature adoption
  - Event analytics
  - Funnel analysis

Cost: Free (self-hosted) or $50+/month (cloud)
```

---

### TIER 5: INFRASTRUCTURE SUPPORT

#### 14. Grafana Dashboards

```yaml
Service: Grafana
Category: Monitoring/Visualization
Status: ✅ CONFIGURED (Port: 3003)
Phase: Core (Phase 1)
Priority: MEDIUM

HTTP Port: 3003 (changed from 3001 due to conflict)
Default Credentials: admin/admin

Features:
  ✅ Real-time dashboards
  ✅ Multiple data sources
  ✅ Alert management
  ✅ User management
  ✅ Team collaboration
  ✅ API access

Dashboards:
  1. System Overview
  2. API Performance
  3. Database Health
  4. Container Resources
  5. Error Tracking

Data Source:
  - Prometheus (:9090)

Cost: Free (open source)

CRITICAL: Change default admin password in production
```

#### 15. AlertManager

```yaml
Service: AlertManager
Category: Monitoring/Alerts
Status: ✅ CONFIGURED
Phase: Core (Phase 1)
Priority: MEDIUM

HTTP Port: 9093 (internal)
No exposed port

Features:
  ✅ Alert aggregation
  ✅ Deduplication
  ✅ Grouping
  ✅ Routing
  ✅ Silencing

Notification Channels:
  - Discord (primary)
  - Email (fallback)
  - Webhook (custom)

Alert Rules (Examples):
  - API latency > 500ms
  - Error rate > 5%
  - Database connection issues
  - Memory usage > 80%
  - Disk space < 10%

Cost: Free (open source)
```

---

## Dependency Matrix

```
Service Dependencies:

PostgreSQL 15
  ← API Service
  ← Worker Service
  ← Monitoring exporters
  └─→ Backup system

Redis 7
  ← API Service
  ← Worker Service
  ← Discord Bot
  └─→ Session middleware

Claude API
  ← API Service (all AI features)
  ← Worker Service (batch jobs)

Discord Bot
  ← Discord API (external)
  ← API Service (status)
  ← PostgreSQL (audit logs)
  ← Prometheus (metrics)

Prometheus
  ← API Service (scrape :3000/metrics)
  ← PostgreSQL exporter
  ← Redis exporter
  ← Node exporter
  → Grafana (data source)
  → AlertManager (alert rules)

Grafana
  ← Prometheus (data source)
  → AlertManager (alert display)

Email Service (Resend/SendGrid)
  ← API Service (send emails)
  ← Auth module (password resets)

Stripe
  ← API Service (payment processing)
  ← Billing module (subscription management)
  → Webhook handler

YouTube/Twitch
  ← LIVE Command Center (Phase 2+)
  ← Dashboard (stream embeds)

GitHub
  ← API Service (optional)
  ← Deployment system (optional)

OpenAI
  ← API Service (if enabled for redundancy)
  ← Worker Service (if enabled)

PostHog
  ← Dashboard (client-side analytics)
  ← Optional tracking

Ollama
  ← API Service (fallback LLM)
  ← Workers (if Claude unavailable)
```

---

## Integration Checklist by Phase

### Phase 1 (Current - COMPLETE)
- [x] PostgreSQL 15
- [x] Redis 7
- [x] Claude API
- [x] Discord Bot
- [x] Prometheus
- [x] Grafana (port conflict fixed)
- [x] API Manager (centralized)
- [x] Health checks
- [x] Monitoring stack

### Phase 2 (Ready to Implement)
- [ ] Email service (Resend or SendGrid)
- [ ] Stripe payment processing
- [ ] OAuth2 authentication
- [ ] Advanced analytics
- [ ] Worker scaling
- [ ] Webhook signatures

### Phase 2+ (Advanced Features)
- [ ] LIVE Command Center (YouTube/Twitch)
- [ ] Marketplace (Stripe Connect)
- [ ] Advanced caching strategies
- [ ] Multi-region deployment
- [ ] Disaster recovery
- [ ] Load balancing

### Future (Long-term)
- [ ] Vector DB (Pinecone/Weaviate)
- [ ] Log aggregation (ELK/Splunk)
- [ ] APM (Datadog/New Relic)
- [ ] Advanced automation (n8n/Zapier)
- [ ] Custom integrations

---

## Security & Compliance

### Credential Management
- ✅ All credentials externalized to environment variables
- ✅ No hardcoded secrets in code
- ✅ Secrets never logged
- ✅ API Manager masks credentials in responses
- ✅ Database passwords require 16+ characters (production)
- ✅ JWT secrets require 32+ characters

### Audit Logging
- ✅ All API requests logged (masked)
- ✅ Database change tracking
- ✅ Discord bot commands logged
- ✅ Worker job execution logged
- ✅ 30-day retention minimum

### Compliance
- ✅ Data encryption in transit (TLS/SSL ready)
- ✅ Role-based access control (PostgreSQL)
- ✅ GDPR-ready (data export available)
- ✅ PCI-compliant payment flow (Stripe)

---

## Maintenance Schedule

### Daily
- Monitor API error rates
- Check database size
- Review alerts

### Weekly
- Review performance metrics
- Update security patches
- Check backup integrity

### Monthly
- Review API usage
- Update dependencies
- Security audit
- Cost analysis

### Quarterly
- Major version updates
- Architecture review
- Capacity planning
- Disaster recovery test

---

## Cost Estimation

| Service | Free Tier | Estimated Monthly | Notes |
|---------|-----------|-------------------|-------|
| PostgreSQL | ✅ | $0 (self-hosted) | Includes backups |
| Redis | ✅ | $0 (self-hosted) | 256MB allocation |
| Claude API | — | $5-50 | Depends on usage |
| Discord Bot | ✅ | $0 | Free API |
| Prometheus | ✅ | $0 | Open source |
| Grafana | ✅ | $0 | Open source |
| Resend | ✅ | $0-20 | 100/mo free |
| Stripe | — | 2.9% + $0.30/tx | No monthly fee |
| OpenAI | — | $5-50 | If used |
| **TOTAL** | — | **~$10-150/mo** | *Core only < $50* |

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-11  
**Next Review**: Upon Phase 2 implementation  
**Maintained By**: Systems Architecture Team
