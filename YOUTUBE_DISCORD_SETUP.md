# YouTube & Discord Integration Setup

## YouTube API Setup

### 1. Create Google Cloud Project
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project: "WISE² YouTube"
- Enable **YouTube Data API v3**

### 2. Create API Key
- Navigate to **APIs & Services → Credentials**
- Click **Create Credentials → API Key**
- Copy the key (format: `AIzaSy...`)

### 3. Restrict the Key (Production)
- Click on the key to edit
- Under **API restrictions**:
  - Select **YouTube Data API v3** only
  - Do NOT leave unrestricted
- Under **Application restrictions**:
  - Select **IP addresses**
  - Add production server IP: `173.208.147.165`
- **Save**

### 4. Add to Production
Update `.env.production`:
```
YOUTUBE_API_KEY=your_restricted_api_key
```

### 5. Usage
Once configured, you can use YouTube API in your application for:
- Search videos
- Get video metadata
- Embed videos
- Access playlists
- View channel info

---

## Discord Bot Setup

### 1. Create Discord Application
- Go to [Discord Developer Portal](https://discord.com/developers/applications)
- Click **New Application**
- Name it: "WISE²"
- Accept Terms of Service

### 2. Create Bot User
- Go to **Bot** section
- Click **Add Bot**
- Under TOKEN, click **Copy** (this is your `DISCORD_BOT_TOKEN`)
- Store securely in `.env.production`

### 3. Configure Bot Permissions
- Go to **OAuth2 → URL Generator**
- Select **Scopes**: `bot`
- Select **Permissions**:
  - Send Messages
  - Embed Links
  - Attach Files
  - Read Message History
  - Manage Messages
  - Read Messages/View Channels
- Copy the generated URL and use to invite bot to your Discord server

### 4. Get Discord IDs
- Go to **General Information**:
  - Copy **Application ID** → `DISCORD_CLIENT_ID`
  - Copy **Public Key** (if needed)

### 5. Set OAuth Redirect URI (if using OAuth)
- Go to **OAuth2 → Redirects**
- Add:
  ```
  https://wise2.net/api/auth/discord/callback
  ```

### 6. Create Webhook (for notifications)
In your Discord server:
- Right-click channel → **Edit Channel**
- Go to **Webhooks**
- Click **New Webhook**
- Copy the webhook URL → `DISCORD_WEBHOOK_URL`
- Format: `https://discord.com/api/webhooks/{webhook_id}/{webhook_token}`

### 7. Get Client Secret (if using OAuth)
- Go to **OAuth2 → General**
- Under Client Secret, click **Reset Secret**
- Copy → `DISCORD_CLIENT_SECRET`

### 8. Add to Production
Update `.env.production`:
```
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_application_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

### 9. Usage
Once configured, you can:
- Send messages to Discord channels via webhook
- Implement Discord OAuth login
- Listen to Discord events (if using gateway)
- Manage Discord server programmatically

---

## Environment Variables Summary

```bash
# YouTube
YOUTUBE_API_KEY=AIzaSy...          # Restricted to YouTube Data API v3

# Discord Bot
DISCORD_BOT_TOKEN=MzA...           # Bot token from Developer Portal
DISCORD_CLIENT_ID=79...            # Application ID
DISCORD_CLIENT_SECRET=abcd...      # OAuth Client Secret
DISCORD_WEBHOOK_URL=https://...    # Webhook URL for notifications
```

---

## Security Checklist

✅ **YouTube API Key**
- [ ] Restricted to YouTube Data API v3 only
- [ ] IP restricted to production server
- [ ] No API restrictions for test/dev keys
- [ ] Rotated periodically

✅ **Discord Bot**
- [ ] Bot token never committed to git
- [ ] Stored only in `.env.production` (git-ignored)
- [ ] Scoped to minimum necessary permissions
- [ ] Webhook URL restricted to specific channel

✅ **Never**
- [ ] Commit real credentials to git
- [ ] Share API keys in chat or emails
- [ ] Use unrestricted API keys
- [ ] Leave test keys in production

---

## Testing

### YouTube API
```bash
curl "https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&key=YOUR_YOUTUBE_API_KEY"
```

### Discord Webhook
```bash
curl -X POST https://discord.com/api/webhooks/{id}/{token} \
  -H 'Content-Type: application/json' \
  -d '{
    "content": "Test message from WISE²"
  }'
```

### Discord Bot (Python example)
```python
import discord
from discord.ext import commands

bot = commands.Bot(command_prefix='!', intents=discord.Intents.default())

@bot.event
async def on_ready():
    print(f'{bot.user} has connected to Discord!')

bot.run('YOUR_DISCORD_BOT_TOKEN')
```

---

## Troubleshooting

### YouTube API Errors
- **403 Forbidden**: Key not authorized for YouTube Data API v3
- **400 Bad Request**: Invalid search parameters
- **Quota Exceeded**: Daily quota limit reached

### Discord Bot Errors
- **401 Unauthorized**: Invalid bot token
- **403 Forbidden**: Bot lacks permissions in channel
- **Invalid Webhook**: Webhook URL malformed or deleted

---

## References
- [YouTube Data API Docs](https://developers.google.com/youtube/v3)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Discord Bot Permissions](https://discord.com/developers/docs/topics/permissions)
- [Discord Webhooks](https://discord.com/developers/docs/resources/webhook)
