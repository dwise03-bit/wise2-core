import { NestjsWebhookService } from '@nestjs/axios';
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';

interface Webhook {
  id: string;
  name: string;
  channel: string;
  url: string;
  token: string;
  status: 'active' | 'inactive' | 'stale';
  created: Date;
  lastUsed?: Date;
  createdBy: string;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  hash: string;
  permissions: string[];
  created: Date;
  lastUsed?: Date;
  createdBy: string;
  expiresAt?: Date;
}

interface SSHKey {
  id: string;
  name: string;
  publicKey: string;
  fingerprint: string;
  type: 'ed25519' | 'rsa' | 'ecdsa';
  created: Date;
  lastUsed?: Date;
  createdBy: string;
}

@Injectable()
export class SecretsManagerService {
  private webhooks: Map<string, Webhook> = new Map();
  private apiKeys: Map<string, APIKey> = new Map();
  private sshKeys: Map<string, SSHKey> = new Map();

  constructor(private configService: ConfigService) {}

  // ============= WEBHOOK MANAGEMENT =============

  /**
   * Create a new Discord webhook
   */
  async createWebhook(
    name: string,
    channel: string,
    botToken: string,
    serverId: string,
    userId: string
  ): Promise<Webhook> {
    const webhookId = `wh_${crypto.randomBytes(8).toString('hex')}`;
    const webhookToken = crypto.randomBytes(32).toString('hex');
    const webhookUrl = `https://discord.com/api/webhooks/${serverId}/${webhookToken}`;

    const webhook: Webhook = {
      id: webhookId,
      name,
      channel,
      url: webhookUrl,
      token: webhookToken,
      status: 'active',
      created: new Date(),
      createdBy: userId,
    };

    this.webhooks.set(webhookId, webhook);
    return webhook;
  }

  /**
   * Regenerate a stale webhook
   */
  async regenerateWebhook(webhookId: string, botToken: string): Promise<Webhook> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) throw new BadRequestException('Webhook not found');

    const newToken = crypto.randomBytes(32).toString('hex');
    const newUrl = `https://discord.com/api/webhooks/${webhook.url.split('/')[5]}/${newToken}`;

    webhook.token = newToken;
    webhook.url = newUrl;
    webhook.status = 'active';
    webhook.lastUsed = new Date();

    return webhook;
  }

  /**
   * List all webhooks
   */
  listWebhooks(): Webhook[] {
    return Array.from(this.webhooks.values());
  }

  /**
   * Delete a webhook
   */
  deleteWebhook(webhookId: string): void {
    this.webhooks.delete(webhookId);
  }

  /**
   * Test webhook connectivity
   */
  async testWebhook(webhookId: string): Promise<boolean> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) return false;

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '✅ WISE² Webhook Test - Connection Successful',
        }),
      });
      return response.ok;
    } catch (error) {
      webhook.status = 'inactive';
      return false;
    }
  }

  // ============= API KEY MANAGEMENT =============

  /**
   * Generate a new API key
   */
  generateAPIKey(
    name: string,
    permissions: string[],
    userId: string,
    expiresIn?: number
  ): { key: string; masked: string } {
    const keyId = `key_${crypto.randomBytes(8).toString('hex')}`;
    const keyValue = `wise2_${crypto.randomBytes(24).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(keyValue).digest('hex');

    const apiKey: APIKey = {
      id: keyId,
      name,
      key: keyHash,
      hash: keyHash,
      permissions,
      created: new Date(),
      createdBy: userId,
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn) : undefined,
    };

    this.apiKeys.set(keyId, apiKey);

    return {
      key: keyValue,
      masked: keyValue.substring(0, 20) + '••••••••••',
    };
  }

  /**
   * Verify an API key
   */
  verifyAPIKey(keyValue: string): APIKey | null {
    const hash = crypto.createHash('sha256').update(keyValue).digest('hex');
    for (const key of this.apiKeys.values()) {
      if (key.hash === hash && (!key.expiresAt || key.expiresAt > new Date())) {
        key.lastUsed = new Date();
        return key;
      }
    }
    return null;
  }

  /**
   * List all API keys
   */
  listAPIKeys(): APIKey[] {
    return Array.from(this.apiKeys.values()).map((k) => ({
      ...k,
      key: k.key.substring(0, 20) + '••••••••••',
    }));
  }

  /**
   * Revoke an API key
   */
  revokeAPIKey(keyId: string): void {
    this.apiKeys.delete(keyId);
  }

  /**
   * Check if key has permission
   */
  hasPermission(keyValue: string, permission: string): boolean {
    const key = this.verifyAPIKey(keyValue);
    if (!key) return false;
    return key.permissions.includes(permission) || key.permissions.includes('admin:*');
  }

  // ============= SSH KEY MANAGEMENT =============

  /**
   * Add a new SSH key
   */
  addSSHKey(
    name: string,
    publicKey: string,
    userId: string
  ): SSHKey {
    const sshKeyId = `ssh_${crypto.randomBytes(8).toString('hex')}`;
    const fingerprint = this.generateSSHFingerprint(publicKey);
    const type = this.detectSSHKeyType(publicKey);

    const sshKey: SSHKey = {
      id: sshKeyId,
      name,
      publicKey,
      fingerprint,
      type,
      created: new Date(),
      createdBy: userId,
    };

    this.sshKeys.set(sshKeyId, sshKey);
    return sshKey;
  }

  /**
   * List all SSH keys
   */
  listSSHKeys(): Omit<SSHKey, 'publicKey'>[] {
    return Array.from(this.sshKeys.values()).map((k) => ({
      id: k.id,
      name: k.name,
      fingerprint: k.fingerprint,
      type: k.type,
      created: k.created,
      lastUsed: k.lastUsed,
      createdBy: k.createdBy,
    }));
  }

  /**
   * Get a public key by ID
   */
  getSSHPublicKey(keyId: string): string | null {
    const key = this.sshKeys.get(keyId);
    return key?.publicKey || null;
  }

  /**
   * Remove an SSH key
   */
  removeSSHKey(keyId: string): void {
    this.sshKeys.delete(keyId);
  }

  /**
   * Verify SSH key fingerprint
   */
  verifySSHKeyFingerprint(publicKey: string): string {
    return this.generateSSHFingerprint(publicKey);
  }

  // ============= HELPERS =============

  /**
   * Generate SSH fingerprint
   */
  private generateSSHFingerprint(publicKey: string): string {
    // Extract key content and decode from base64
    const parts = publicKey.split(' ');
    if (parts.length < 2) throw new BadRequestException('Invalid SSH key format');

    const keyContent = parts[1];
    const buffer = Buffer.from(keyContent, 'base64');
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    // Format as SHA256 fingerprint
    const fingerprint = hash.match(/.{1,2}/g)?.join(':');
    return `SHA256:${fingerprint}`;
  }

  /**
   * Detect SSH key type
   */
  private detectSSHKeyType(publicKey: string): 'ed25519' | 'rsa' | 'ecdsa' {
    if (publicKey.includes('ssh-ed25519')) return 'ed25519';
    if (publicKey.includes('ssh-rsa')) return 'rsa';
    if (publicKey.includes('ecdsa-sha2')) return 'ecdsa';
    return 'rsa'; // default
  }

  /**
   * Export all secrets for backup (encrypted)
   */
  exportSecrets(password: string): string {
    const data = {
      webhooks: Array.from(this.webhooks.values()),
      apiKeys: Array.from(this.apiKeys.values()),
      sshKeys: Array.from(this.sshKeys.values()),
      exportedAt: new Date(),
    };

    const jsonStr = JSON.stringify(data);
    const cipher = crypto.createCipher('aes-256-cbc', password);
    let encrypted = cipher.update(jsonStr, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
  }

  /**
   * Import secrets from backup
   */
  importSecrets(encryptedData: string, password: string): void {
    try {
      const decipher = crypto.createDecipher('aes-256-cbc', password);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      const data = JSON.parse(decrypted);

      // Import data
      data.webhooks?.forEach((w: Webhook) => this.webhooks.set(w.id, w));
      data.apiKeys?.forEach((k: APIKey) => this.apiKeys.set(k.id, k));
      data.sshKeys?.forEach((s: SSHKey) => this.sshKeys.set(s.id, s));
    } catch (error) {
      throw new BadRequestException('Failed to import secrets: invalid password or data');
    }
  }
}

// ============= CONTROLLER ENDPOINTS =============

export const webhookRoutes = [
  // POST /api/secrets/webhooks - Create webhook
  // GET /api/secrets/webhooks - List webhooks
  // POST /api/secrets/webhooks/:id/regenerate - Regenerate webhook
  // POST /api/secrets/webhooks/:id/test - Test webhook
  // DELETE /api/secrets/webhooks/:id - Delete webhook
];

export const apiKeyRoutes = [
  // POST /api/secrets/keys - Generate API key
  // GET /api/secrets/keys - List API keys
  // POST /api/secrets/keys/verify - Verify key
  // DELETE /api/secrets/keys/:id - Revoke key
];

export const sshKeyRoutes = [
  // POST /api/secrets/ssh - Add SSH key
  // GET /api/secrets/ssh - List SSH keys
  // DELETE /api/secrets/ssh/:id - Remove SSH key
  // POST /api/secrets/ssh/:id/authorize - Authorize key for access
];

export const backupRoutes = [
  // POST /api/secrets/export - Export encrypted backup
  // POST /api/secrets/import - Import encrypted backup
];
