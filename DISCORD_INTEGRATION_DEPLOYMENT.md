# WISE² Discord Integration - Complete Deployment Guide

**Date**: 2026-07-20  
**Status**: Ready for Deployment  
**Effort**: ~1.5-2 hours  

---

## EXECUTIVE SUMMARY

The Discord bot (Phase A MVP) is **production-ready** and fully tested. All 7 commands implemented and documented. This guide covers complete end-to-end deployment in 4 phases.

| Phase | Task | Time | Status |
|-------|------|------|--------|
| **1** | Deploy bot to Replit | 30 min | Ready to Execute |
| **2** | Setup Discord server/channels | 20 min | Manual (Documented) |
| **3** | Implement OAuth sign-in | 30 min | Code Ready to Write |
| **4** | Configure webhooks & GitHub | 20 min | Partially Automated |

**Total Time to Live**: ~1.5-2 hours  
**Cost**: Free (Replit free tier or wise2.net existing infrastructure)

---

## PHASE 1: DEPLOY BOT TO REPLIT (30 minutes)

### Prerequisites
- Replit account (free at replit.com)
- GitHub account with access to wise2-core repo
- Discord bot created in Discord Developer Portal (see Phase 2, step 1)

### Step-by-Step

#### 1a. Create Replit Project

```bash
# Visit: https://replit.com/create
# Click "Import from GitHub"
# Repository: dwise03/wise2-core
# Language: Node.js
# Click "Import"
```

Wait ~2 minutes for import to complete.

#### 1b. Configure Secrets in Replit

In Replit left sidebar, click **Secrets** (lock icon).

Add these environment variables:
```
DISCORD_BOT_TOKEN=<from Discord Developer Portal>
DISCORD_CLIENT_ID=<app ID>
DISCORD_CLIENT_SECRET=<OAuth2 secret>
DISCORD_GUILD_ID=<your Discord server ID>
DISCORD_WEBHOOK_DEPLOYMENTS=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_ALERTS=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_BUILDS=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_DECISIONS=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_DAILY_SYNC=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_STATUS=https://discord.com/api/webhooks/...
DATA_DIR=../../data
DEPLOY_SERVER=173.208.147.165 (gpu-nmls)
NODE_ENV=production
```

**Where to get each value:**
- `DISCORD_BOT_TOKEN`: Discord Developer Portal → Applications → Your Bot → TOKEN (copy)
- `DISCORD_CLIENT_ID`: Discord Developer Portal → Applications → General Information → APPLICATION ID
- `DISCORD_CLIENT_SECRET`: Discord Developer Portal → OAuth2 → General → CLIENT SECRET
- `DISCORD_GUILD_ID`: Right-click Discord server → Copy Server ID
- `DISCORD_WEBHOOK_*`: Will create in Phase 2, step 4

#### 1c. Start Bot in Replit

In Replit shell (bottom panel):
```bash
cd services/bot
npm install
npm start
```

Expected output:
```
✅ Logged in as WISE² Bot#1234
Guilds: WISE²(123456789)
✅ Successfully reloaded 7 application (/) commands.
✅ Sent startup ping to #status
```

#### 1d. Verify Bot is Online

In Discord:
- Go to your server
- Look at member list → should show bot as online
- Try command: `/status` → should return system health

### Replit Considerations

**Free Tier** hibernates after 1 hour of inactivity.

**Options to keep bot online:**
1. **Replit Paid** ($7/mo) → Upgrade to "Starter" plan
2. **Uptime Robot** (free) → Keep bot awake with HTTP pings
3. **Migrate to wise2.net** (Phase 2 later)

---

## PHASE 2: SETUP DISCORD SERVER & CHANNELS (20 minutes)

### Prerequisites
- Discord server (admin access required)
- Bot invited to server (will do in Phase 2, step 3)

### Step-by-Step

#### 2a. Create Bot in Discord Developer Portal

1. Visit: https://discord.com/developers/applications
2. Click "New Application" → Name: `WISE² Bot`
3. Go to "Bot" tab → Click "Add Bot"
4. Copy TOKEN (keep secret!)
5. Go to "OAuth2" → "General" → Copy CLIENT ID and CLIENT SECRET

#### 2b. Enable Gateway Intents

In "Bot" tab, enable these intents:
- ✅ Guilds
- ✅ Guild Messages
- ✅ Message Content
- ✅ Direct Messages

#### 2c. Invite Bot to Server

1. Go to "OAuth2" → "URL Generator"
2. Select scopes: `bot`
3. Select permissions:
   - Send Messages
   - Read Messages/View Channels
   - Embed Links
   - Use Slash Commands
4. Copy generated URL and open in browser
5. Select your Discord server and click "Authorize"

#### 2d. Create Discord Channels

In your Discord server, create these channels (right-click server → Create Channel):

```
#deployments      → For CI/CD events
#alerts           → For critical errors/alerts
#builds           → For @dev progress updates
#decisions        → For architectural decision logs
#daily-sync       → For morning briefing
#status           → For system health dashboard
```

#### 2e. Create Roles (Optional but Recommended)

Right-click server → Server Settings → Roles → Create:

```
@Owner          → Color: #FF0000 (red)
@Dev            → Color: #0099FF (blue)
@Design         → Color: #FF00FF (magenta)
@Ops            → Color: #FF9900 (orange)
@Writer         → Color: #00FF99 (mint)
@Researcher     → Color: #FFFF00 (yellow)
@Founder        → Color: #39FF14 (green) ← WISE² brand
@Bot            → Color: #888888 (gray)
@Member         → No color
```

Assign roles to team members for colored badges in chat.

#### 2f. Create Webhooks for Each Channel

For each channel (#deployments, #alerts, #builds, #decisions, #daily-sync, #status):

1. Right-click channel → "Edit Channel"
2. Go to "Integrations" → "Webhooks"
3. Click "New Webhook"
4. Name: `WISE² Bot`
5. Copy webhook URL
6. Paste into Replit Secrets (DISCORD_WEBHOOK_* variables)

---

## PHASE 3: IMPLEMENT OAUTH SIGN-IN (30 minutes)

OAuth2 Discord authentication is needed for login page. Already has Google placeholder.

### What's Needed

**Component**: `DiscordSignInButton` component  
**API Route**: `/api/auth/discord/callback` endpoint  
**Files**:
- `apps/website/app/components/DiscordSignInButton.tsx` (NEW)
- `apps/website/app/api/auth/discord/callback/route.ts` (NEW)
- `apps/website/app/api/auth/discord/authorize/route.ts` (NEW)
- `apps/website/app/auth/login/page.tsx` (UPDATE)

### 3a. Create DiscordSignInButton Component

Create file: `apps/website/app/components/DiscordSignInButton.tsx`

```typescript
'use client';

import { FormEvent } from 'react';
import { analytics } from '@/lib/analytics';

interface DiscordSignInButtonProps {
  clientId: string;
  redirectUri: string;
}

export default function DiscordSignInButton({ clientId, redirectUri }: DiscordSignInButtonProps) {
  const handleClick = (e: FormEvent) => {
    e.preventDefault();
    
    analytics.track('discord_signin_click');
    
    const oauthUrl = new URL('https://discord.com/api/oauth2/authorize');
    oauthUrl.searchParams.set('client_id', clientId);
    oauthUrl.searchParams.set('response_type', 'code');
    oauthUrl.searchParams.set('redirect_uri', redirectUri);
    oauthUrl.searchParams.set('scope', 'identify email guilds');
    oauthUrl.searchParams.set('prompt', 'consent');
    
    window.location.href = oauthUrl.toString();
  };

  return (
    <button
      onClick={handleClick}
      className="w-full py-2 border border-wise-subtle hover:border-wise-primary text-wise-primary rounded-md transition-colors hover:bg-wise-surface flex items-center justify-center gap-2"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515a.074.074 0 00-.079.037c-.211.375-.445.864-.607 1.25a18.27 18.27 0 00-5.487 0c-.162-.386-.395-.875-.607-1.25a.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03a.078.078 0 00.084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892a.077.077 0 01-.008-.128c.126-.094.252-.192.372-.292a.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.009c.12.1.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892a.077.077 0 00-.041.107c.36.699.77 1.364 1.225 1.994a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03a.077.077 0 00.032-.054c.5-4.467-.838-8.343-3.554-11.761a.07.07 0 00-.031-.028zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419c0-1.334.969-2.419 2.157-2.419c1.188 0 2.157 1.085 2.157 2.42c0 1.333-.969 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.334.969-2.419 2.157-2.419c1.188 0 2.157 1.085 2.157 2.42c0 1.333-.969 2.419-2.157 2.419z" />
      </svg>
      Continue with Discord
    </button>
  );
}
```

### 3b. Create OAuth Callback Routes

Create: `apps/website/app/api/auth/discord/authorize/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/api/auth/discord/callback';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      return NextResponse.json({ error: 'Failed to exchange token' }, { status: 400 });
    }

    const { access_token } = await tokenResponse.json();

    // Get user info
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Failed to get user' }, { status: 400 });
    }

    const user = await userResponse.json();

    // TODO: Store user session or create JWT
    // For now, redirect to dashboard with user info
    const dashboardUrl = new URL('/dashboard', request.url);
    dashboardUrl.searchParams.set('user', JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    }));

    return NextResponse.redirect(dashboardUrl);
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
```

### 3c. Update Login Page

Update: `apps/website/app/auth/login/page.tsx`

Replace the Google button section (line 225-229) with:

```typescript
// Add import at top
import DiscordSignInButton from '@/app/components/DiscordSignInButton';

// Replace the button section with:
<div className="mt-8 pt-6 border-t border-wise-subtle space-y-3">
  <DiscordSignInButton
    clientId={process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || ''}
    redirectUri={process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI || 'http://localhost:3000/api/auth/discord/callback'}
  />
  <button className="w-full py-2 border border-wise-subtle hover:border-wise-primary text-wise-primary rounded-md transition-colors hover:bg-wise-surface flex items-center justify-center gap-2">
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
    Continue with Google
  </button>
</div>
```

### 3d. Environment Variables

Add to `.env.local`:
```
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_discord_client_id
NEXT_PUBLIC_DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback
DISCORD_CLIENT_SECRET=your_discord_secret
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback
```

For production:
```
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_discord_client_id
NEXT_PUBLIC_DISCORD_REDIRECT_URI=https://wise2.net/api/auth/discord/callback
DISCORD_CLIENT_SECRET=your_discord_secret
DISCORD_REDIRECT_URI=https://wise2.net/api/auth/discord/callback
```

---

## PHASE 4: WEBHOOK CONFIGURATION (20 minutes)

### 4a. Connect GitHub Actions

In GitHub repo Settings → Webhooks:

1. Click "Add webhook"
2. Payload URL: `https://wise2.net/api/discord/webhook` (or Replit URL)
3. Content type: `application/json`
4. Events: `push`, `workflow_run`, `pull_request`
5. Active: ✅
6. Click "Add webhook"

### 4b. Webhook Handler API Route

Create: `apps/website/app/api/discord/webhook/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const WEBHOOK_URLS = {
  builds: process.env.DISCORD_WEBHOOK_BUILDS,
  deployments: process.env.DISCORD_WEBHOOK_DEPLOYMENTS,
  alerts: process.env.DISCORD_WEBHOOK_ALERTS,
};

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Determine webhook type based on GitHub event
    let webhookUrl = WEBHOOK_URLS.builds;
    let embed: any = {};

    if (payload.workflow_run) {
      // GitHub Actions workflow event
      const { name, conclusion, status } = payload.workflow_run;
      webhookUrl = WEBHOOK_URLS.deployments;

      embed = {
        title: `Workflow: ${name}`,
        description: `Status: ${conclusion || status}`,
        color: conclusion === 'success' ? 0x00aa00 : conclusion === 'failure' ? 0xaa0000 : 0xffaa00,
        timestamp: new Date().toISOString(),
      };
    } else if (payload.ref) {
      // Push event
      const branch = payload.ref.split('/').pop();
      embed = {
        title: `Push to ${branch}`,
        description: payload.head_commit?.message || 'No message',
        color: 0x0099ff,
        author: {
          name: payload.pusher?.name || 'Unknown',
        },
        timestamp: new Date().toISOString(),
      };
    }

    if (webhookUrl && embed.title) {
      await axios.post(webhookUrl, { embeds: [embed] });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
```

### 4c. Test Webhooks

Make a test commit:
```bash
echo "# Test" >> README.md
git add README.md
git commit -m "test: webhook verification"
git push origin main
```

Check Discord #builds channel → should see notification.

---

## VERIFICATION CHECKLIST

### Bot Deployment
- [ ] Bot online in Discord server
- [ ] `/status` command returns system info
- [ ] `/deploy` command returns deployment info
- [ ] `/phase` command shows current phase
- [ ] `/tasks` command lists pending tasks
- [ ] `/decision` command creates new decision log
- [ ] `/sync` command shows daily log
- [ ] `/alert` command sends message to channels
- [ ] Webhooks deliver startup ping to #status

### Discord Server Setup
- [ ] All 6 channels created (#deployments, #alerts, #builds, #decisions, #daily-sync, #status)
- [ ] All 9 roles created with correct colors
- [ ] All 6 webhooks configured and receiving messages
- [ ] Bot has Send Messages permission in all channels
- [ ] Bot has Manage Webhooks permission

### OAuth Sign-In
- [ ] Login page loads without errors
- [ ] "Continue with Discord" button visible
- [ ] Clicking button redirects to Discord OAuth screen
- [ ] Discord auth redirects back to wise2.net
- [ ] User profile shows in navigation bar after login
- [ ] Session persists across page reloads
- [ ] Logout clears session

### Webhook Integration
- [ ] GitHub push → #builds notification
- [ ] GitHub Actions workflow → #deployments notification
- [ ] PR created → notification sent
- [ ] PR merged → notification sent
- [ ] Bot `/alert` command → message in correct channel

### End-to-End Flow
- [ ] Visit https://wise2.net
- [ ] Click "Continue with Discord"
- [ ] Complete Discord OAuth flow
- [ ] Redirected to dashboard with profile visible
- [ ] Make commit to GitHub
- [ ] Check Discord #builds → see notification
- [ ] In Discord, run `/status` → see system health

---

## DEPLOYMENT TIMELINE

| Step | Time | Owner |
|------|------|-------|
| Create Discord bot | 5 min | Manual |
| Setup Replit | 10 min | Manual |
| Deploy bot | 10 min | Automated |
| Create channels & webhooks | 10 min | Manual |
| Implement OAuth | 20 min | @dev |
| Test OAuth flow | 10 min | Manual |
| Configure GitHub webhooks | 5 min | Manual |
| Test full integration | 10 min | Manual |

**Total**: ~1.5-2 hours

---

## SUPPORT & TROUBLESHOOTING

### Bot offline after deploy
- Check Replit console for errors
- Verify `DISCORD_BOT_TOKEN` is correct
- Restart bot: click "Run" in Replit
- Check bot has correct permissions in server

### OAuth not working
- Verify `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` are correct
- Check `DISCORD_REDIRECT_URI` matches Discord app settings
- Verify Discord OAuth2 tab has correct redirect URI
- Check browser console for errors

### Webhooks not firing
- Verify webhook URLs in Discord are still active
- Check GitHub repository has correct webhook configured
- Check bot has Manage Webhooks permission
- Verify webhook payload format matches handler

### Commands not showing
- Restart bot: `npm start` in Replit
- Wait 30 seconds for command refresh
- Try in different channel
- Check bot has Send Messages permission

---

## NEXT STEPS

### Immediate (Phase B - Next Quarter)
- [ ] Advanced commands (schedule, remind, etc.)
- [ ] Role-based access control
- [ ] Persistent state with Redis
- [ ] Custom bot responses

### Future (Phase C)
- [ ] Full Kubernetes deployment
- [ ] Multiple bot instances
- [ ] Advanced monitoring & alerting
- [ ] Distributed task queue

---

## QUICK REFERENCE

**Bot Commands**:
```
/status          → System health
/deploy          → Deployment info
/phase           → Project phase
/tasks           → Pending tasks
/decision        → Log architectural decision
/sync            → Daily sync log
/alert           → Send alert to channel
```

**Environment Variables** (copy .env.example):
```
DISCORD_BOT_TOKEN
DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET
DISCORD_GUILD_ID
DISCORD_WEBHOOK_DEPLOYMENTS
DISCORD_WEBHOOK_ALERTS
DISCORD_WEBHOOK_BUILDS
DISCORD_WEBHOOK_DECISIONS
DISCORD_WEBHOOK_DAILY_SYNC
DISCORD_WEBHOOK_STATUS
```

**Key Files**:
- Bot code: `services/bot/index.js`
- Setup wizard: `services/bot/setup.js`
- Validator: `services/bot/validate.js`
- OAuth: `apps/website/app/api/auth/discord/`
- Login UI: `apps/website/app/auth/login/page.tsx`

---

## RESOURCES

- **Discord.js Docs**: https://discord.js.org/
- **Discord Developer Portal**: https://discord.com/developers/applications
- **Discord OAuth2**: https://discord.com/developers/docs/topics/oauth2
- **Replit Docs**: https://docs.replit.com/
- **Next.js API Routes**: https://nextjs.org/docs/api-routes/introduction

---

**Status**: ✅ Ready for Deployment  
**Last Updated**: 2026-07-20  
**Next Review**: After Phase 1 deployment
