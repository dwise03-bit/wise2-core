# 🔐 WISE² Secrets Manager - Complete Setup Guide

Interactive management dashboard for webhooks, API keys, and SSH keys.

## Features

### 1. **Discord Webhook Manager** 🪝
- View all configured webhooks
- Regenerate stale/expired webhook tokens  
- Test webhook connectivity
- Create new webhooks for any Discord channel
- Delete unused webhooks
- Auto-detect webhook status (active/stale/inactive)

### 2. **API Key Manager** 🔑
- Generate new API keys with custom permissions
- Revoke/rotate keys instantly
- View key usage (last used timestamp)
- Set expiration dates
- Fine-grained permission control:
  - `read:deployments`
  - `write:deployments`
  - `read:secrets`
  - `write:secrets`
  - `admin:webhooks`
  - `admin:*` (superuser)

### 3. **SSH Key Manager** 🔒
- Add SSH keys by name & public key
- Auto-generate SHA256 fingerprints
- Support for Ed25519, RSA, ECDSA
- View last-used timestamp
- Remove keys instantly
- Track key type & creation date

---

## Installation

### Step 1: Add to Website

Place the secrets manager page in your Next.js app:

```bash
# Copy to your website app routes
cp secrets-manager-page.tsx apps/website/app/(admin)/secrets/page.tsx
```

### Step 2: Add Backend Service

Install the API service:

```bash
# Copy to your NestJS API
cp secrets-api.ts packages/api/src/services/secrets-manager.service.ts
```

### Step 3: Wire Up API Routes

Add to your API routing:

```typescript
// packages/api/src/routes/api.routes.ts
import { SecretsManagerService } from '../services/secrets-manager.service';

@Controller('api/secrets')
export class SecretsController {
  constructor(private secretsService: SecretsManagerService) {}

  // Webhooks
  @Post('webhooks')
  async createWebhook(@Body() dto: CreateWebhookDto) {
    return this.secretsService.createWebhook(
      dto.name,
      dto.channel,
      dto.botToken,
      dto.serverId,
      this.user.id
    );
  }

  @Get('webhooks')
  listWebhooks() {
    return this.secretsService.listWebhooks();
  }

  @Post('webhooks/:id/regenerate')
  async regenerateWebhook(@Param('id') id: string, @Body('botToken') token: string) {
    return this.secretsService.regenerateWebhook(id, token);
  }

  @Post('webhooks/:id/test')
  async testWebhook(@Param('id') id: string) {
    const result = await this.secretsService.testWebhook(id);
    return { ok: result };
  }

  @Delete('webhooks/:id')
  deleteWebhook(@Param('id') id: string) {
    this.secretsService.deleteWebhook(id);
    return { deleted: true };
  }

  // API Keys
  @Post('keys')
  generateAPIKey(@Body() dto: GenerateKeyDto) {
    return this.secretsService.generateAPIKey(
      dto.name,
      dto.permissions,
      this.user.id,
      dto.expiresIn
    );
  }

  @Get('keys')
  listAPIKeys() {
    return this.secretsService.listAPIKeys();
  }

  @Post('keys/verify')
  verifyKey(@Body('key') key: string) {
    const result = this.secretsService.verifyAPIKey(key);
    return { valid: !!result, key: result };
  }

  @Delete('keys/:id')
  revokeKey(@Param('id') id: string) {
    this.secretsService.revokeAPIKey(id);
    return { revoked: true };
  }

  // SSH Keys
  @Post('ssh')
  addSSHKey(@Body() dto: AddSSHKeyDto) {
    return this.secretsService.addSSHKey(dto.name, dto.publicKey, this.user.id);
  }

  @Get('ssh')
  listSSHKeys() {
    return this.secretsService.listSSHKeys();
  }

  @Delete('ssh/:id')
  removeSSHKey(@Param('id') id: string) {
    this.secretsService.removeSSHKey(id);
    return { removed: true };
  }

  // Backups
  @Post('export')
  exportSecrets(@Body('password') password: string) {
    const encrypted = this.secretsService.exportSecrets(password);
    return { data: encrypted };
  }

  @Post('import')
  importSecrets(@Body() dto: ImportSecretsDto) {
    this.secretsService.importSecrets(dto.data, dto.password);
    return { imported: true };
  }
}
```

### Step 4: Deploy

```bash
# Rebuild and redeploy
npm run build
npm run deploy
```

---

## Usage Examples

### Generate API Key

```bash
curl -X POST http://localhost:3000/api/secrets/keys \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CI/CD Deployment",
    "permissions": ["write:deployments", "read:secrets"],
    "expiresIn": 2592000000
  }'

# Response:
{
  "key": "wise2_abc123def456ghi789jkl012mno345pqr",
  "masked": "wise2_abc123••••••••••"
}
```

### Add SSH Key

```bash
curl -X POST http://localhost:3000/api/secrets/ssh \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pixel Slate Dev",
    "publicKey": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5... user@host"
  }'

# Response:
{
  "id": "ssh_abc123def456",
  "name": "Pixel Slate Dev",
  "fingerprint": "SHA256:abc123def456ghi789jkl012mno345pqr",
  "type": "ed25519",
  "created": "2026-09-15T02:42:00Z"
}
```

### Regenerate Discord Webhook

```bash
curl -X POST http://localhost:3000/api/secrets/webhooks/wh_abc123/regenerate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "botToken": "YOUR_DISCORD_BOT_TOKEN"
  }'

# Response:
{
  "id": "wh_abc123",
  "name": "Deployments",
  "channel": "alerts",
  "url": "https://discord.com/api/webhooks/NEW_ID/NEW_TOKEN",
  "status": "active"
}
```

---

## Security Best Practices

✅ **Do**
- Rotate API keys regularly
- Use expiring keys for CI/CD
- Store SSH private keys locally
- Enable MFA on admin account
- Audit key usage logs
- Export encrypted backups

❌ **Don't**
- Commit keys to git
- Share keys across users
- Use same key for multiple services
- Disable key expiration for human users
- Share Discord bot token in code
- Store backups unencrypted

---

## Webhook Regeneration Fix

The Pixel Slate setup revealed stale webhooks (unknown Discord auth issue). This Secrets Manager fixes it:

**Before:**
- Manual webhook management
- Stale tokens blocking deployments
- No centralized control

**After:**
- One-click webhook regeneration
- Automatic status detection (active/stale/inactive)
- Test connectivity before deploying
- Full audit trail

**To Fix Current Webhooks:**

1. Open https://wise2.net/dashboard/secrets
2. Click **Webhooks** tab
3. For each webhook marked "stale":
   - Click **Regenerate**
   - System creates fresh Discord webhook
   - New URL automatically configured
4. Test with **Test** button
5. Deploy to production

---

## Architecture

```
┌─────────────────────────────────────┐
│   WISE² Secrets Manager              │
├─────────────────────────────────────┤
│                                     │
│  Frontend (Next.js)                 │
│  ├─ Webhooks Tab                    │
│  ├─ API Keys Tab                    │
│  └─ SSH Keys Tab                    │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Backend API (NestJS)               │
│  ├─ SecretsManagerService           │
│  ├─ /api/secrets/webhooks           │
│  ├─ /api/secrets/keys               │
│  └─ /api/secrets/ssh                │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Storage (Database)                 │
│  ├─ webhooks table                  │
│  ├─ api_keys table                  │
│  └─ ssh_keys table                  │
│                                     │
└─────────────────────────────────────┘
```

---

## FAQ

**Q: How do I regenerate all stale webhooks at once?**
A: Use the batch endpoint:
```bash
POST /api/secrets/webhooks/regenerate-all
{
  "botToken": "YOUR_BOT_TOKEN"
}
```

**Q: Can I export secrets for backup?**
A: Yes! Use the export endpoint:
```bash
POST /api/secrets/export
{
  "password": "your_backup_password"
}
```

**Q: What if I lose an API key?**
A: Revoke it immediately and generate a new one:
```bash
DELETE /api/secrets/keys/{key_id}
POST /api/secrets/keys (generate new)
```

**Q: How do I authorize an SSH key?**
A: The key is automatically authorized once added. To disable:
```bash
DELETE /api/secrets/ssh/{key_id}
```

---

## Support

- **Webhook Issues:** Check Discord bot permissions + token validity
- **API Key Issues:** Verify expiration + permissions
- **SSH Key Issues:** Validate key format + fingerprint

Contact: WISE² Infrastructure Team
