# WISE² Discord Ecosystem

A comprehensive suite of **10+ production-grade Discord bots** that integrate WISE² services with Discord, enabling notifications, commands, approvals, status reports, and team coordination.

## Overview

The WISE² Discord Ecosystem provides a modular, extensible bot framework with specialized bots for different operational domains:

### 🤖 Bot Suite

| Bot | Purpose | Key Features |
|-----|---------|--------------|
| **Executive Bot** | Route WISE² requests, manage tasks | Status, task management, requests, notifications |
| **Deployment Bot** | Track releases, trigger deployments | Deploy, rollback, logs, health checks |
| **Notification Bot** | Broadcast WISE² events | Event subscriptions, notifications, history |
| **Automation Bot** | Trigger workflows, schedule jobs | Workflows, scheduling, webhooks, execution tracking |
| **Status Bot** | Real-time system health | Health checks, metrics, Raspberry Pi monitoring |
| **Analytics Bot** | Performance metrics and reports | Dashboards, trends, comparisons, exports |
| **Knowledge Bot** | Search vault and documentation | Knowledge base search, categories, tagging |
| **Voice Bot** | Voice assistant integration | Transcription, voice commands, edge assistants |
| **Emergency Bot** | Critical alerts and incident management | Incident reporting, escalation, on-call scheduling |

## Architecture

### Framework Features

- **Modular Design**: Each bot extends the base `BotFramework` with custom commands
- **Comprehensive Error Handling**: Graceful degradation with retry logic
- **Rate Limiting**: Multi-level rate limiting (user, guild, channel, command)
- **Message Queuing**: Offline-resilient message queue with persistence
- **Audit Logging**: Complete audit trail for all commands and actions
- **Caching**: LRU/LFU/FIFO cache strategies with TTL
- **Permission Control**: Role-based and user-based access control
- **Logging**: Structured logging with multiple transports

### Core Components

```
services/discord-ecosystem/
├── src/
│   ├── BotFramework.ts          # Base framework all bots extend
│   ├── BotOrchestrator.ts       # Manages all bot lifecycle
│   ├── index.ts                 # Main entry point
│   ├── types/
│   │   └── index.ts             # Comprehensive type definitions
│   ├── utils/
│   │   ├── Logger.ts            # Structured logging
│   │   ├── RateLimiter.ts       # Rate limiting
│   │   └── Cache.ts             # In-memory caching
│   ├── middleware/
│   │   └── AuditLogger.ts       # Audit logging
│   ├── queues/
│   │   └── MessageQueue.ts      # Message queue with persistence
│   └── bots/
│       ├── ExecutiveBot.ts
│       ├── DeploymentBot.ts
│       ├── NotificationBot.ts
│       ├── AutomationBot.ts
│       ├── StatusBot.ts
│       ├── AnalyticsBot.ts
│       ├── KnowledgeBot.ts
│       ├── VoiceBot.ts
│       └── EmergencyBot.ts
```

## Setup & Installation

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Discord.js 14+
- Discord server with bot permissions

### 1. Installation

```bash
# Install dependencies
npm install

# Or with yarn
yarn install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and fill in your bot tokens:

```bash
cp .env.example .env
```

**Required for each bot:**
- `{BOT_NAME}_BOT_TOKEN`: Discord bot token
- `{BOT_NAME}_CLIENT_ID`: Application client ID

Get these from [Discord Developer Portal](https://discord.com/developers/applications)

### 3. Register Bots

Create separate Discord applications for each bot:

1. Go to Discord Developer Portal
2. Create new application
3. Add bot user
4. Enable these intents:
   - Guilds
   - Guild Messages
   - Message Content
   - Direct Messages
   - Guild Voice States (for Voice Bot)

5. Copy token and client ID to `.env`

### 4. Invite Bots to Server

Use OAuth2 URL with required scopes:

```
https://discord.com/api/oauth2/authorize?client_id={CLIENT_ID}&permissions={PERMISSIONS}&scope=bot%20applications.commands
```

Required permissions:
- Send Messages
- Embed Links
- Read Message History
- Manage Webhooks
- Connect (for Voice Bot)
- Speak (for Voice Bot)

## Building & Running

### Development

```bash
# Watch mode with hot reload
npm run dev
```

### Production Build

```bash
# Build TypeScript
npm run build

# Run compiled code
npm start
```

### Docker

```bash
# Build image
docker build -t wise2-discord-ecosystem .

# Run container
docker run --env-file .env wise2-discord-ecosystem
```

## Usage

### Bot Commands

Each bot provides slash commands accessible via Discord:

#### Executive Bot
```
/status              - View system status
/task create         - Create a new task
/task list           - List all tasks
/task update         - Update task status
/request             - Submit a request
/notify              - Send notification (admin)
/analytics           - View bot analytics
```

#### Deployment Bot
```
/deploy              - Trigger deployment (admin)
/deployment-status   - View deployment status
/rollback            - Rollback to previous version (admin)
/deployment-logs     - View deployment logs
/deployment-history  - View deployment history
/health-check        - Run health check
```

#### Notification Bot
```
/subscribe           - Subscribe to notifications
/unsubscribe         - Unsubscribe from notifications
/notify-send         - Send notification (admin)
/notification-history - View notification history
/subscriptions       - View your subscriptions
```

#### Automation Bot
```
/workflow-execute    - Execute a workflow
/workflows-list      - List all workflows
/workflow-create     - Create workflow (admin)
/workflow-details    - View workflow details
/workflow-schedule   - Schedule workflow (admin)
/executions-history  - View execution history
/webhook-setup       - Setup webhook (admin)
```

#### Status Bot
```
/system-status       - View system health
/service-status      - Check specific service
/raspberry-pi-status - Check Raspberry Pi
/performance-metrics - View performance metrics
/uptime-report       - View uptime report
/alert-config        - Configure alerts (admin)
```

#### Analytics Bot
```
/analytics-dashboard - View analytics dashboard
/analytics-report    - Generate report
/analytics-trends    - Analyze trends
/analytics-compare   - Compare metrics
/analytics-export    - Export data
/analytics-alerts    - View alerts
```

#### Knowledge Bot
```
/search              - Search knowledge base
/knowledge           - Lookup knowledge entry
/categories          - Browse categories
/recent-articles     - View recent articles
/tags                - Search by tags
/suggest-topic       - Suggest topic
/knowledge-add       - Add entry (admin)
```

#### Voice Bot
```
/voice-join          - Join voice channel
/voice-leave         - Leave voice channel
/voice-transcribe    - Transcribe audio
/assistants-list     - List assistants
/assistant-set       - Set active assistant
/voice-train         - Train voice commands (admin)
/voice-settings      - Configure settings
/recording-status    - View recording sessions
```

#### Emergency Bot
```
/incident-report     - Report incident
/incident-acknowledge - Acknowledge incident
/incident-resolve    - Resolve incident
/incident-details    - View incident details
/escalate            - Escalate incident
/on-call             - View on-call schedule
/incidents-active    - View active incidents
/escalation-channel  - Set escalation channel (admin)
```

## Configuration

### Rate Limiting

Configure in `.env`:

```env
RATE_LIMIT_USER=10          # Per user per minute
RATE_LIMIT_GUILD=20         # Per guild per minute
RATE_LIMIT_CHANNEL=30       # Per channel per minute
RATE_LIMIT_COMMAND=5        # Per command per minute
```

### Logging

```env
LOG_LEVEL=info              # debug, info, warn, error, fatal
LOG_DIR=./logs
LOG_RETENTION_DAYS=30       # Auto-cleanup old logs
```

### Caching

```env
CACHE_TTL=60000             # 1 minute
CACHE_MAX_SIZE=1000         # Max entries
CACHE_STRATEGY=lru          # lru, lfu, or fifo
```

### Message Queue

```env
QUEUE_DIR=./queue
QUEUE_INTERVAL=10000        # Check interval (ms)
QUEUE_MAX_RETRIES=3         # Retry attempts
```

### Audit Logging

```env
AUDIT_ENABLED=true
AUDIT_CHANNELS=channel-id   # Comma-separated channel IDs
AUDIT_RETENTION_DAYS=90
```

## API Reference

### BotFramework

Base class for all bots:

```typescript
abstract class BotFramework {
  // Register slash command
  registerCommand(command: CommandHandler): void

  // Register event handler
  on(event: string, listener: (...args: any[]) => Promise<void>): void
  once(event: string, listener: (...args: any[]) => Promise<void>): void

  // Send message
  sendMessage(channelId: string, content: string, options?: {}): Promise<boolean>

  // Queue message for later delivery
  queueMessage(channelId: string, guildId: string, userId: string, content: string, options?: {}): Promise<void>

  // Create embed
  createEmbed(options: EmbedOptions): EmbedBuilder

  // Connect/disconnect
  connect(): Promise<void>
  disconnect(): Promise<void>
  registerCommands(): Promise<void>

  // Get stats
  getStats(): BotStats
}
```

### BotOrchestrator

Manages all bots:

```typescript
class BotOrchestrator {
  // Register bot configuration
  registerBotConfig(name: string, config: BotConfig): void

  // Initialize and start bot
  initializeBot(name: string, BotClass: new (config: BotConfig) => BotFramework): Promise<BotFramework>

  // Start all bots
  startAll(): Promise<void>

  // Stop all bots
  stopAll(): Promise<void>

  // Get health status
  getHealthStatus(): HealthStatus

  // Get bot statistics
  getStats(): OrchestratorStats

  // Restart all bots
  restart(): Promise<void>
}
```

## Error Handling

All bots include comprehensive error handling:

- **Command Errors**: User-friendly error messages in Discord
- **Rate Limit Errors**: Automatic retry with exponential backoff
- **Connection Errors**: Automatic reconnection with circuit breaker
- **Queue Errors**: Persistent queue for offline delivery
- **Logging**: All errors logged with full context and stack traces

## Performance & Reliability

### Features

- **Rate Limiting**: Prevents abuse and overload
- **Caching**: Reduces database/API calls
- **Message Queue**: Ensures message delivery even if Discord is temporarily unavailable
- **Audit Logging**: Complete audit trail for compliance
- **Health Checks**: Regular health monitoring
- **Graceful Degradation**: Services continue when components fail
- **Exponential Backoff**: Smart retry logic with configurable delays

### Monitoring

Access bot statistics:

```typescript
const stats = bot.getStats();
console.log({
  uptime: stats.uptime,
  servers: stats.servers,
  users: stats.users,
  cacheHitRate: stats.cacheStats.hitRate,
  queueSize: stats.queueStats.size,
});
```

View ecosystem health:

```typescript
const health = orchestrator.getHealthStatus();
console.log({
  status: health.status,           // healthy, degraded, unhealthy
  totalBots: health.totalBots,
  healthyBots: health.healthyBots,
});
```

## Testing

```bash
# Run tests
npm test

# Watch mode
npm test:watch

# Coverage report
npm test:coverage
```

## Deployment

### Docker Compose

```yaml
version: '3.8'
services:
  discord-ecosystem:
    build: .
    env_file: .env
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
      - ./queue:/app/queue
      - ./audit:/app/audit
    networks:
      - wise2
```

### Kubernetes

See `k8s/` directory for manifests.

```bash
kubectl apply -f k8s/
```

### Environment Variables

All configuration via `.env`:

```bash
# Load from file
source .env

# Or pass to Docker
docker run --env-file .env wise2-discord-ecosystem
```

## Troubleshooting

### Bot not responding

1. Check bot token in `.env`
2. Verify bot has permissions in Discord
3. Check Discord API status
4. Review logs: `tail -f logs/executive-bot-*.log`

### Rate limiting errors

1. Increase `RATE_LIMIT_*` values in `.env`
2. Check audit log for offending commands
3. Monitor queue size: should be < 100

### Message queue backup

Monitor queue with:

```typescript
const queue = orchestrator.getBot('executive-bot')?.messageQueue;
console.log(queue?.getStats());
```

Clear queue if needed (careful!):

```typescript
queue?.clearQueue();
```

### High CPU/Memory

1. Reduce `CACHE_MAX_SIZE`
2. Lower logging level to `warn` or `error`
3. Increase `LOG_RETENTION_DAYS`
4. Check for memory leaks in custom commands

## Security

### Best Practices

- **Tokens**: Never commit `.env` to git
- **Permissions**: Use minimal required permissions
- **Admin Commands**: Require role/permission checks
- **Input Validation**: All user inputs validated
- **Audit Logging**: All actions logged for compliance
- **Rate Limiting**: Prevent abuse and DoS
- **Error Messages**: Don't leak sensitive info in errors

### Sensitive Data

- Tokens stored in environment variables
- Database credentials in `.env`
- API keys in `.env`
- Audit logs retained per `AUDIT_RETENTION_DAYS`

## Contributing

Contributions welcome! Please follow:

1. TypeScript strict mode
2. ESLint configuration
3. Write tests for new features
4. Update README for new commands
5. Follow bot naming conventions

## License

MIT License - See LICENSE file

## Support

For issues and questions:

- GitHub Issues
- Discord Support Server
- Email: support@wise2.ai

## Roadmap

- [ ] Multi-language support
- [ ] Advanced analytics with charts
- [ ] Machine learning for automation
- [ ] Mobile app integration
- [ ] WebSocket support for real-time updates
- [ ] Custom bot builder UI
- [ ] Scheduled reports
- [ ] Integration marketplace

## Changelog

### v1.0.0

- Initial release
- 9 production-grade bots
- Complete bot framework
- Comprehensive error handling
- Rate limiting and caching
- Message queuing
- Audit logging
- Docker support

---

**WISE² Discord Ecosystem** - Built for enterprise reliability and extensibility.
