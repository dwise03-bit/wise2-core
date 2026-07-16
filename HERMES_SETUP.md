# Hermes AI Customer Support Setup

## Overview
WISE² now includes an AI-powered customer support chat widget powered by **Hermes 2 Pro (Mistral)** that automatically escalates complex issues to Discord.

## Setup Instructions

### 1. Install Ollama
Download and install Ollama from https://ollama.ai

### 2. Pull Hermes Model
```bash
ollama pull hermes2-pro-mistral
```

### 3. Run Ollama Server
```bash
ollama serve
```
This starts the Ollama server on `http://localhost:11434` (default)

### 4. Configure Discord Webhook
1. Go to your Discord server settings
2. Create a webhook in your preferred channel
3. Copy the webhook URL
4. Add to `.env.local`:

```bash
DISCORD_WEBHOOK_URL=https://discordapp.com/api/webhooks/YOUR_WEBHOOK_URL_HERE
```

### 5. Start Website
```bash
cd apps/website
npm run dev
```

The chat widget will appear as a floating button (💬) in the bottom right corner.

## Features

✅ **AI-Powered Support**
- Hermes LLM provides intelligent responses
- Understands customer support context
- Friendly and professional tone

✅ **Discord Escalation**
- Complex issues automatically escalate
- Full conversation history sent to Discord
- User email tracking
- Timestamp logging

✅ **Persistent Chat**
- Message history within session
- Conversation ID tracking
- Analytics integration

✅ **Design Integration**
- Matches WISE² dark theme
- Electric blue accents
- Responsive on mobile

## Environment Variables

```env
# Discord webhook for escalations
DISCORD_WEBHOOK_URL=https://discordapp.com/api/webhooks/...

# Optional: Custom Hermes endpoint (default: http://localhost:11434/v1/chat/completions)
HERMES_ENDPOINT=http://localhost:11434/v1/chat/completions
```

## Using Remote Hermes

If running Hermes remotely, update `HERMES_ENDPOINT`:

```bash
HERMES_ENDPOINT=https://your-hermes-api.com/v1/chat/completions
```

## Chat Flow

1. User clicks chat button (💬)
2. Optional: User enters email for tracking
3. User types message
4. Hermes AI generates response
5. If complex issue detected → Auto-escalates to Discord
6. Discord team gets notified with full context

## Troubleshooting

**Chat not responding?**
- Ensure Ollama is running: `ollama serve`
- Check Hermes model is installed: `ollama list`
- Verify API endpoint in `.env.local`

**Discord escalations not working?**
- Check `DISCORD_WEBHOOK_URL` is valid
- Test webhook: `curl -X POST -H 'Content-Type: application/json' -d '{"content":"Test"}' YOUR_WEBHOOK_URL`

**Performance issues?**
- Hermes 2 Pro (Mistral) requires ~4GB RAM
- Consider increasing Ollama memory if running on limited resources
- For production, consider hosted Hermes service

## Model Alternatives

If Hermes 2 Pro is too large:
- `mistral` - Smaller, fast base model (~4GB)
- `neural-chat` - Optimized for conversations (~4GB)

## Production Deployment

For production, consider:
1. **Hosted Hermes** - Use cloud Hermes API instead of local Ollama
2. **Rate Limiting** - Add rate limiting to `/api/chat` endpoint
3. **Database** - Store conversations for analytics
4. **Authentication** - Add user authentication if needed
5. **Monitoring** - Track chat metrics and escalations
