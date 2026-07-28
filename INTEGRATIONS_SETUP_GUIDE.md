# 🔌 WISE² Integrations Setup Guide

**Status**: Production Ready  
**Components**: Google OAuth, Kick, Discord, YouTube Live, Live Studio  
**Architecture**: Multi-provider, multi-destination streaming

---

## System Architecture

```
User Request
    ↓
[OAuth Service] — Token management & encryption
    ├→ [Google OAuth2]
    ├→ [Kick OAuth2/RTMP]
    └→ [Discord OAuth2]
    ↓
[Integration Manager] — Storage & validation
    ├→ Database (integrations table)
    ├→ Token encryption/decryption
    └→ Access token auto-refresh
    ↓
[Live Studio Coordinator] — Stream orchestration
    ├→ [Discord Live Service] — Announcements
    ├→ [Kick Streaming Service] — Metadata & RTMP
    └→ [YouTube Service] — Live broadcast control
    ↓
Multi-Destination Live Stream
```

---

## Supported Providers

### Google Workspace
✅ **Sign-In** — OpenID Connect  
✅ **Gmail** — Read, draft, send  
✅ **Calendar** — Manage & check availability  
✅ **Drive** — App-created file access  
✅ **Contacts** — Search & read  
✅ **YouTube** — Channel & live broadcast management  

### Kick Live
✅ **OAuth2** — Full API access  
✅ **RTMP** — Direct streaming protocol  
✅ **Stream Metadata** — Title, description, category, tags  
✅ **Live Status** — Viewers, uptime, health metrics  
✅ **Channel Info** — Bio, follower count, stream history  

### Discord
✅ **OAuth2** — User & bot authorization  
✅ **Server Selection** — Multi-server support  
✅ **Channel Selection** — Targeted announcements  
✅ **Live Announcements** — "Going Live" posts  
✅ **Webhooks** — Stream notifications  
✅ **Bot Actions** — Commands & automations  

### YouTube Live
✅ **OAuth2** — Google account integration  
✅ **Live Broadcast** — Create & manage streams  
✅ **Stream Metadata** — Title, description, thumbnail  
✅ **Chat Moderation** — Monitor & manage chat  

---

## Implementation Files

### Core Services
```
src/services/
├── oauth-service.ts              # OAuth2, token management, encryption
├── integration-manager.ts        # Storage, validation, auto-refresh
├── discord-live-service.ts      # Discord announcements & webhooks
├── kick-streaming-service.ts    # Kick metadata & RTMP management
├── live-studio-coordinator.ts   # Multi-destination orchestration
└── hermes-image-generation.ts   # (Already integrated)
```

### API Routes
```
src/api/routes/
├── oauth.ts                      # /api/v1/integrations/:provider/callback
└── generation.ts                 # (Already integrated for images)
```

### Types & Config
```
src/types/integrations.ts         # Full type definitions
src/config/providers.ts           # Provider registry & OAuth configs
```

---

## Setup Workflow

### 1. Environment Variables

Create `.env.production`:
```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Kick OAuth
KICK_CLIENT_ID=your-kick-client-id
KICK_CLIENT_SECRET=your-kick-client-secret

# Discord OAuth
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret

# Encryption
ENCRYPTION_KEY=64-character-hex-string

# App
APP_URL=https://wise2.net
```

### 2. Database Schema (Prisma)

```prisma
model Integration {
  id                      String   @id @default(cuid())
  userId                  String
  organizationId          String
  providerId              String   // "google", "kick", "discord", "youtube"
  authType                String   // "OAUTH2", "RTMP", "BOT_TOKEN"
  status                  String   // "connected", "not_connected", "error"
  
  externalAccountId       String?
  externalAccountName     String?
  externalWorkspaceId     String?  // Discord server ID
  externalChannelId       String?  // Discord channel ID
  
  oauthScopes             String[] // Array of granted scopes
  encryptedAccessToken    String?  // Encrypted AES-256-GCM
  encryptedRefreshToken   String?
  tokenExpiresAt          DateTime?
  tokenType               String?  // "Bearer", etc
  
  rtmpServer              String?  // Kick RTMP endpoint
  encryptedStreamKey      String?  // Encrypted RTMP key
  webhookUrl              String?
  encryptedWebhookSecret  String?
  
  lastSyncAt              DateTime?
  lastStreamStartedAt     DateTime?
  lastStreamEndedAt       DateTime?
  
  providerMetadata        Json?    // Extra provider-specific data
  
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  
  @@unique([userId, organizationId, providerId])
  @@index([userId, organizationId])
  @@index([status])
}
```

### 3. Register Routes

```typescript
// In your Express app
import oauthRoutes from './api/routes/oauth';

app.use('/api/v1/integrations', oauthRoutes);
```

### 4. Provider Credentials

**Google**: https://console.cloud.google.com/
- Create OAuth2 credentials
- Add redirect URI: `https://wise2.net/api/v1/integrations/google/callback`
- Enable scopes: Calendar, Gmail, Drive, Contacts, YouTube

**Kick**: https://developer.kick.com/
- Create OAuth2 app
- Add redirect URI: `https://wise2.net/api/v1/integrations/kick/callback`
- Get RTMP endpoint & test credentials

**Discord**: https://discord.com/developers/applications
- Create application
- Add OAuth2 redirect: `https://wise2.net/api/v1/integrations/discord/callback`
- Invite bot to server with permissions: `Send Messages`, `Manage Messages`, `Embed Links`

---

## Usage Examples

### Connect Google

```typescript
import oauthService from './services/oauth-service';

// 1. Generate auth URL
const authUrl = oauthService.getAuthorizationUrl(
  'google',
  userId,
  organizationId,
  ['sign_in', 'youtube_live']
);

// Redirect user to authUrl

// 2. Handle callback (automatic via OAuth routes)
// 3. Exchange code for tokens (automatic)
// 4. Save integration (automatic)
```

### Start Live Stream

```typescript
import liveStudioCoordinator from './services/live-studio-coordinator';

const streamConfig = {
  title: 'WISE² Product Launch',
  description: 'Introducing the latest features',
  thumbnail: 'https://...',
  destinations: [
    { id: 'kick-123', providerId: 'kick', name: 'Kick', enabled: true, status: 'connected' },
    { id: 'discord-456', providerId: 'discord', name: 'Discord', enabled: true, status: 'connected' },
    { id: 'youtube-789', providerId: 'youtube', name: 'YouTube', enabled: false, status: 'connected' },
  ],
};

// Run preflight checks
const checks = await liveStudioCoordinator.runPreflightChecks(
  userId,
  organizationId,
  streamConfig.destinations
);

if (checks.every(c => c.status === 'ready')) {
  // Start stream
  const result = await liveStudioCoordinator.startLiveStream(
    userId,
    organizationId,
    streamConfig
  );

  // result.streamIds = { kick: 'started', discord: 'announced' }
}
```

### Post Discord Announcement

```typescript
import discordLiveService from './services/discord-live-service';

const result = await discordLiveService.postLiveAnnouncement(
  userId,
  organizationId,
  {
    serverId: 'discord-server-id',
    channelId: 'discord-channel-id',
    template: '🔴 **WISE² Live Studio is going live!**',
    mentionRoles: ['@Live Alerts'],
    includeThumbnail: true,
    includeLink: true,
  },
  streamConfig
);

// result.success = true
// result.messageId = 'discord-message-id'
```

### Get RTMP Details

```typescript
import kickStreamingService from './services/kick-streaming-service';

const details = await kickStreamingService.getRTMPDetails(userId, organizationId);

// details.server = "rtmp://live.kick.com/live"
// details.streamKey = "••••••••••••A92F" (masked)
```

---

## Security Considerations

### Token Encryption
- All tokens encrypted with AES-256-GCM
- Encryption keys derived from `.env.ENCRYPTION_KEY`
- Never log or transmit unencrypted tokens
- Tokens masked for display (show last 4 chars only)

### OAuth Security
- CSRF protection via signed state parameter
- State TTL: 15 minutes
- Nonce validation for all callbacks
- Refresh tokens stored server-side only
- Access tokens auto-refresh before expiry

### Channel Authorization
- Discord bot permissions validated before posting
- Stream key stored encrypted
- Webhook secrets encrypted
- Account linking prevents cross-user access

### Data Isolation
- Unique constraint on (userId, organizationId, providerId)
- All queries filtered by userId AND organizationId
- Integration data never shared between orgs

---

## Production Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] OAuth providers configured (Google, Kick, Discord)
- [ ] Redirect URIs added to each provider
- [ ] ENCRYPTION_KEY generated (64-char hex)
- [ ] Discord bot invited to server
- [ ] Email/monitoring setup for failed integrations
- [ ] Rate limiting enabled on OAuth routes
- [ ] Token rotation scheduled
- [ ] Backup/restore procedures documented
- [ ] Audit logging of integration changes

---

## Troubleshooting

### "Invalid state" Error
- State expires after 15 minutes
- Restart OAuth flow if timeout
- Check server time sync

### "Token expired" Warning
- Normal during auto-refresh
- System automatically refreshes expired tokens
- If refresh fails, reauthorization required

### Discord "Permission Missing"
- Bot needs: Send Messages, Manage Messages
- Re-invite bot to server with full permissions
- Check channel-level role overrides

### Kick "Stream Key Not Configured"
- For RTMP streaming, store credentials
- Use `kickStreamingService.storeRTMPCredentials()`
- Test connection before going live

---

## API Reference

### POST /api/v1/integrations/:provider/connect
Initiate OAuth connection
```json
{
  "userId": "user-123",
  "organizationId": "org-456",
  "capabilities": ["youtube_live", "gmail"]
}
```

### GET /api/v1/integrations/:provider/callback
OAuth provider redirects here (handled automatically)

### POST /api/v1/integrations/:provider/disconnect
Disconnect an integration
```json
{
  "userId": "user-123",
  "organizationId": "org-456"
}
```

### POST /api/v1/integrations/:provider/reauthorize
Reauthorize expired integration
```json
{
  "userId": "user-123",
  "organizationId": "org-456"
}
```

### GET /api/v1/integrations/:provider/status
Check integration health status

---

## What's Next

**Phase 1: ✅ Complete**
- Core OAuth services
- Integration storage
- Multi-destination orchestration
- Discord announcements
- Kick streaming

**Phase 2: Planned**
- YouTube Live broadcast control
- Real-time stream health metrics
- Advanced Discord webhooks
- Automated transcript generation

**Phase 3: Future**
- TikTok live streaming
- Custom RTMP endpoints
- Stream recording & archival
- Analytics & engagement tracking

---

**Ready to deploy! 🚀**
