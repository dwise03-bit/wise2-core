# WISE² Discord Bot Deployment Checklist

**Server ID:** `1512093487145680926`  
**Bot Code Status:** ✅ Ready to deploy  
**Target:** Replit  
**Time Estimate:** 40 minutes total

---

## STEP 1: Create Discord Bot App (5 min)

1. Go to: https://discord.com/developers/applications
2. Click **"New Application"**
3. Name: `WISE² Command Center`
4. Click **"Create"**

### Get Credentials:

**Go to "Bot" tab:**
- Click **"Add Bot"**
- Under TOKEN section, click **"Copy"**
- **SAVE:** `DISCORD_BOT_TOKEN=<paste_here>`

**Go to "General Information" tab:**
- Copy **Application ID**
- **SAVE:** `DISCORD_CLIENT_ID=<paste_here>`

**Go to "OAuth2" → "General" tab:**
- Click **"Generate"** next to CLIENT SECRET
- Click **"Copy"**
- **SAVE:** `DISCORD_CLIENT_SECRET=<paste_here>`

### Set Redirect URI:

**Still in OAuth2:**
1. Go to **"Redirects"**
2. Click **"Add Redirect"**
3. Enter: `https://wise2.net/auth/discord/callback`
4. Click **"Save Changes"**

---

## STEP 2: Deploy Bot to Replit (15 min)

1. Go to: https://replit.com
2. Click **"Create Replit"** (or Import if you have existing WISE² repo)
3. Search for your repo or create new Node.js project
4. Add file: `.replit` with content:
   ```
   run = "node services/bot/index.js"
   ```

### Set Environment Secrets:

1. Click **"Secrets"** (lock icon on left sidebar)
2. Add each secret:

```
DISCORD_BOT_TOKEN=<your_token>
DISCORD_CLIENT_ID=<your_client_id>
DISCORD_CLIENT_SECRET=<your_client_secret>
DISCORD_GUILD_ID=1512093487145680926
DISCORD_WEBHOOK_DEPLOYMENTS=<from_step_3>
DISCORD_WEBHOOK_ALERTS=<from_step_3>
DISCORD_WEBHOOK_BUILDS=<from_step_3>
DISCORD_WEBHOOK_DECISIONS=<from_step_3>
DISCORD_WEBHOOK_DAILY_SYNC=<from_step_3>
DISCORD_WEBHOOK_STATUS=<from_step_3>
```

3. Click **"Run"** to start bot

---

## STEP 3: Set Up Discord Server Channels (10 min)

In Discord server `1512093487145680926`:

### Create Channels:
- #deployments
- #alerts
- #builds
- #decisions
- #daily-sync
- #status

### Create Webhook for Each Channel:

For each channel:
1. Right-click channel → "Edit Channel"
2. Go to "Integrations" tab
3. Click "Webhooks"
4. Click "New Webhook"
5. Name: "WISE² Bot"
6. Copy the Webhook URL
7. Save to Replit secrets corresponding to each channel

---

## STEP 4: Create Bot Roles (5 min)

In Discord server settings → "Roles", create:

- @Owner (#FF0000)
- @Dev (#0099FF)
- @Design (#FF00FF)
- @Ops (#FF9900)
- @Writer (#00FF99)
- @Researcher (#FFFF00)
- @Founder (#39FF14)
- @Bot (#888888)
- @Member (default)

---

## STEP 5: Authorize Bot to Server (5 min)

1. Discord Developer Portal → OAuth2 → URL Generator
2. Scopes: `bot`
3. Permissions: Send Messages, Embed Links, Manage Messages, Read Message History, Add Reactions
4. Copy generated URL
5. Open in browser & authorize to server

---

## STEP 6: Verify Bot Commands (5 min)

Test in Discord:
```
/status     — System health
/deploy     — Deployment info
/phase      — Phase status
/tasks      — Task list
/decision   — Create decision
/sync       — Daily sync log
/alert      — Send alert
```

All 7 must respond successfully.

---

## STEP 7: Test OAuth Sign-In (5 min)

1. Go to https://wise2.net
2. Click "Sign in with Discord"
3. Authorize WISE²
4. Verify redirect to dashboard
5. Verify profile shows Discord info
6. Test logout

---

## VERIFICATION CHECKLIST

- [ ] Bot online in Discord (green status)
- [ ] All 7 commands respond
- [ ] Replit running without errors
- [ ] 6 channels created
- [ ] 9 roles with correct colors
- [ ] 6 webhooks created
- [ ] Discord sign-in button works
- [ ] OAuth flow complete
- [ ] Session persists across pages
- [ ] Logout clears session

---

**Ready to go. Start with Step 1 and work through. Report when complete.**
