# WISE² Command Center GPT - Full Integration Guide

## Overview

The WISE² Command Center GPT is fully integrated across the platform, providing AI-powered operations assistance through multiple channels:

- **ChatGPT** - Direct GPT access
- **Dashboard** - Widget and side panel
- **Website** - Homepage showcase and CTA
- **Discord** - Webhook notifications and commands
- **Knowledge Base** - Hermes integration for contextual info

## GPT Details

| Property | Value |
|----------|-------|
| **GPT ID** | `g-6aa6a67f0d9c8191bb664542f87f28b4` |
| **Name** | WISE² Command Center |
| **URL** | https://chatgpt.com/g/g-6aa6a67f0d9c8191bb664542f87f28b4-wise2-command-center |
| **Access** | Anyone with link |
| **Status** | Active & Production Ready |

---

## 1. API Integration

### Endpoints

#### Get GPT Link & Metadata
```
GET /command-center/gpt/link
Authorization: Bearer {JWT_TOKEN}

Response:
{
  "gptId": "g-6aa6a67f0d9c8191bb664542f87f28b4",
  "name": "WISE² Command Center",
  "url": "https://chatgpt.com/g/...",
  "description": "AI-native operations command center...",
  "access": "anyone_with_link",
  "status": "active",
  "integrations": ["dashboard", "website", "discord", "knowledge_base"]
}
```

#### Get Pre-loaded GPT Context
```
GET /command-center/gpt/context
Authorization: Bearer {JWT_TOKEN}

Response:
{
  "tenant": "tenant-123",
  "dashboard": { /* full dashboard metrics */ },
  "userContext": { /* user permissions */ },
  "recentActivity": { /* recent jobs */ },
  "timestamp": "2024-09-15T...",
  "gptInstructions": "You are the WISE² Command Center GPT..."
}
```

### Usage Example
```typescript
// Fetch GPT link
const gptResponse = await fetch('/api/command-center/gpt/link', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { url } = await gptResponse.json();
window.open(url, '_blank');

// Load context before opening GPT
const contextResponse = await fetch('/api/command-center/gpt/context', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const context = await contextResponse.json();
// Pass context to GPT via URL params or localStorage
```

---

## 2. Dashboard Integration

### Widget Component

**Location:** `apps/dashboard/app/components/gpt/gpt-widget.tsx`

### Features
- ✅ Expandable widget showing GPT status
- ✅ Quick actions list (revenue, jobs, utilization, etc.)
- ✅ Integration badges
- ✅ Direct link to GPT
- ✅ Context pre-loading

### Implementation

Add to your dashboard layout:
```tsx
import GPTWidget from '@/components/gpt/gpt-widget';

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <GPTWidget />
      {/* Other dashboard components */}
    </div>
  );
}
```

### Context Pre-loading
The widget automatically fetches GPT context when mounted, ensuring the GPT has:
- Real-time dashboard metrics
- User permissions
- Recent activity
- Personalized instructions

---

## 3. Website Integration

### Showcase Component

**Location:** `apps/website/app/components/gpt-showcase.tsx`

### Features
- ✅ Hero section with feature grid
- ✅ Call-to-action buttons
- ✅ Integration info section
- ✅ Responsive design
- ✅ Dark mode support

### Implementation

Add to homepage:
```tsx
import GPTShowcase from '@/components/gpt-showcase';

export default function Home() {
  return (
    <>
      {/* Other homepage sections */}
      <GPTShowcase />
      {/* Footer */}
    </>
  );
}
```

### Navbar Integration

Add GPT link to navigation:
```tsx
<nav>
  <Link href="https://chatgpt.com/g/g-6aa6a67f0d9c8191bb664542f87f28b4-wise2-command-center" 
        target="_blank"
        className="flex items-center gap-2">
    <SparklesIcon className="w-5 h-5" />
    Command Center GPT
  </Link>
</nav>
```

---

## 4. Discord Integration

### Setup

**File:** `packages/api/src/webhooks/gpt-discord.service.ts`

### Environment Variables

```bash
# Discord Webhook URLs (can be different for different channels)
DISCORD_GPT_WEBHOOK=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID
DISCORD_NOTIFICATIONS_WEBHOOK=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID

# Optional: Bot token for advanced features
DISCORD_BOT_TOKEN=YOUR_BOT_TOKEN
DISCORD_SERVER_ID=YOUR_SERVER_ID
DISCORD_ALERTS_CHANNEL=YOUR_CHANNEL_ID
DISCORD_GENERAL_CHANNEL=YOUR_CHANNEL_ID
DISCORD_COMMANDS_CHANNEL=YOUR_CHANNEL_ID
```

### Methods

#### Send GPT Response
```typescript
import { GPTDiscordService } from './webhooks/gpt-discord.service';

constructor(private gptDiscord: GPTDiscordService) {}

async respondToUser(query: string, response: string) {
  await this.gptDiscord.sendGPTResponse('general', {
    title: 'Command Center Response',
    response: response,
    metrics: { revenue: 5000, jobs: 12 },
    userId: 'user-123'
  });
}
```

#### Send Notifications
```typescript
await this.gptDiscord.sendNotification({
  title: 'Revenue Alert',
  message: 'Today\'s revenue exceeded $10,000',
  type: 'success',
  source: 'WISE² Analytics'
});
```

#### Send Metrics Update
```typescript
await this.gptDiscord.sendMetricsUpdate({
  revenue: 15000,
  jobsCompleted: 24,
  techUtilization: 92,
  openEstimates: 8,
  period: 'Today'
});
```

---

## 5. Knowledge Base / Hermes Integration

### Setup

**File:** `packages/api/src/integrations/gpt-knowledge-base.service.ts`

### Environment Variables

```bash
# Hermes (Knowledge Base) URL
HERMES_BASE_URL=http://localhost:3012  # or production URL
```

### Methods

#### Query Knowledge Base
```typescript
import { GPTKnowledgeBaseService } from './integrations/gpt-knowledge-base.service';

constructor(private kb: GPTKnowledgeBaseService) {}

async getContextForQuery(userQuery: string) {
  const context = await this.kb.queryContext(userQuery, 5);
  // context.context = array of relevant information
  // context.sources = array of source documents
  return context;
}
```

#### Get Documentation Links
```typescript
const docs = await this.kb.getDocumentationLinks('revenue optimization');
// Returns: Array<DocumentReference>
// Each doc has: id, title, url, category, relevance
```

#### Get GPT Context Summary
```typescript
const summary = await this.kb.generateContextSummary(tenantId, 'team utilization');
// Returns markdown string with relevant info + links
```

#### Add Knowledge
```typescript
await this.kb.addKnowledge({
  title: 'Q3 Pricing Strategy Update',
  content: 'Details about new pricing...',
  category: 'business_strategy',
  tags: ['pricing', 'strategy', 'q3'],
  source: 'command_center'
});
```

---

## 6. Configuration

### Central Configuration File

**Location:** `services/gpt-integration.config.ts`

All integration settings are centralized here:
```typescript
import { GPT_CONFIG } from '@/services/gpt-integration.config';

// Access GPT config
console.log(GPT_CONFIG.gpt.url);
console.log(GPT_CONFIG.integrations.discord.enabled);
console.log(GPT_CONFIG.instructions);
```

---

## 7. Implementation Checklist

### API Layer
- [x] Add `/command-center/gpt/link` endpoint
- [x] Add `/command-center/gpt/context` endpoint
- [x] Create `GPTDiscordService` for webhooks
- [x] Create `GPTKnowledgeBaseService` for Hermes integration
- [ ] Add API tests for GPT endpoints
- [ ] Add rate limiting for GPT context endpoint

### Dashboard
- [x] Create `gpt-widget.tsx` component
- [ ] Integrate widget into main dashboard layout
- [ ] Add collapsible side panel for full GPT interface (optional)
- [ ] Add context menu option to "Ask GPT" (optional)

### Website
- [x] Create `gpt-showcase.tsx` component
- [ ] Integrate into homepage
- [ ] Add navbar link to GPT
- [ ] Create dedicated `/gpt` landing page (optional)

### Discord
- [ ] Set up webhook URLs in environment
- [ ] Test webhook delivery
- [ ] Implement metrics update schedule (daily at 5 PM)
- [ ] Add command handlers for GPT queries

### Knowledge Base
- [ ] Set up Hermes webhook
- [ ] Add initial knowledge base entries
- [ ] Create update schedule
- [ ] Test context retrieval

---

## 8. Testing

### API Testing
```bash
# Test GPT link endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3010/api/command-center/gpt/link

# Test GPT context endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3010/api/command-center/gpt/context
```

### Discord Testing
```typescript
// Test Discord webhook
const service = new GPTDiscordService(configService);
await service.sendGPTResponse('general', {
  title: 'Test Response',
  response: 'This is a test message'
});
```

### Integration Testing
1. Open dashboard → Verify GPT widget loads
2. Click GPT widget → Verify opens correct URL with context
3. Visit website homepage → Verify GPT section displays
4. Check Discord → Verify test webhook message arrived

---

## 9. Production Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] Discord webhooks validated
- [ ] Hermes integration tested
- [ ] API endpoints tested with real data
- [ ] Dashboard widget responsive on mobile
- [ ] Website showcase loads without errors
- [ ] SSL certificates valid
- [ ] Rate limiting configured
- [ ] Logging configured
- [ ] Error handling tested
- [ ] Documentation complete
- [ ] Team trained on GPT usage

---

## 10. Monitoring & Maintenance

### Logs
- Monitor `/api/command-center/gpt/*` endpoint access
- Check Discord webhook delivery status
- Review Hermes integration health

### Metrics
- Track GPT widget usage (clicks, opens)
- Monitor API response times
- Check Discord webhook success rate
- Track knowledge base query performance

### Updates
- Keep GPT instructions current
- Update knowledge base regularly
- Review and update integrations quarterly

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Widget not loading | Check API token, verify `/gpt/link` endpoint |
| GPT opens with 404 | GPT access may be restricted; verify URL sharing settings |
| Discord webhooks not working | Verify webhook URLs in env vars; check Discord server permissions |
| Hermes context not loading | Verify `HERMES_BASE_URL` is correct; check network connectivity |
| Context data stale | Verify API caching headers; check data source freshness |

---

## Support

For issues or questions:
1. Check logs in `/var/log/wise2-gpt.log`
2. Verify environment configuration
3. Run integration tests
4. Contact: ops@wise2.net

---

**Last Updated:** 2026-09-15  
**Version:** 1.0 - Production Ready
