import { Injectable, BadRequestException } from '@nestjs/common';
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

@Injectable()
export class SecretsManagerService {
  private webhooks: Map<string, Webhook> = new Map();
  private apiKeys: Map<string, any> = new Map();
  private sshKeys: Map<string, any> = new Map();

  createWebhook(name: string, channel: string, botToken: string, serverId: string, userId: string): Webhook {
    const webhookId = `wh_${crypto.randomBytes(8).toString('hex')}`;
    const webhookToken = crypto.randomBytes(32).toString('hex');
    const webhook: Webhook = {
      id: webhookId, name, channel, token: webhookToken, status: 'active',
      url: `https://discord.com/api/webhooks/${serverId}/${webhookToken}`,
      created: new Date(), createdBy: userId,
    };
    this.webhooks.set(webhookId, webhook);
    return webhook;
  }

  async regenerateWebhook(webhookId: string, botToken: string): Promise<Webhook> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) throw new BadRequestException('Webhook not found');
    const newToken = crypto.randomBytes(32).toString('hex');
    webhook.token = newToken;
    webhook.status = 'active';
    webhook.lastUsed = new Date();
    return webhook;
  }

  listWebhooks(): Webhook[] {
    return Array.from(this.webhooks.values());
  }

  async testWebhook(webhookId: string): Promise<boolean> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) return false;
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: '✅ WISE² Webhook Test' }),
      });
      return response.ok;
    } catch {
      webhook.status = 'inactive';
      return false;
    }
  }

  deleteWebhook(webhookId: string): void {
    this.webhooks.delete(webhookId);
  }

  generateAPIKey(name: string, permissions: string[], userId: string, expiresIn?: number): any {
    const keyId = `key_${crypto.randomBytes(8).toString('hex')}`;
    const keyValue = `wise2_${crypto.randomBytes(24).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(keyValue).digest('hex');
    const apiKey = {
      id: keyId, name, key: keyHash, hash: keyHash, permissions, created: new Date(),
      createdBy: userId, expiresAt: expiresIn ? new Date(Date.now() + expiresIn) : undefined,
    };
    this.apiKeys.set(keyId, apiKey);
    return { key: keyValue, masked: keyValue.substring(0, 20) + '••••••••••' };
  }

  listAPIKeys(): any[] {
    return Array.from(this.apiKeys.values()).map((k: any) => ({
      ...k, key: k.key.substring(0, 20) + '••••••••••',
    }));
  }

  verifyAPIKey(keyValue: string): any {
    const hash = crypto.createHash('sha256').update(keyValue).digest('hex');
    for (const key of this.apiKeys.values()) {
      if (key.hash === hash && (!key.expiresAt || key.expiresAt > new Date())) {
        key.lastUsed = new Date();
        return key;
      }
    }
    return null;
  }

  revokeAPIKey(keyId: string): void {
    this.apiKeys.delete(keyId);
  }

  addSSHKey(name: string, publicKey: string, userId: string): any {
    const sshKeyId = `ssh_${crypto.randomBytes(8).toString('hex')}`;
    const fingerprint = this.generateSSHFingerprint(publicKey);
    const type = this.detectSSHKeyType(publicKey);
    const sshKey = { id: sshKeyId, name, publicKey, fingerprint, type, created: new Date(), createdBy: userId };
    this.sshKeys.set(sshKeyId, sshKey);
    return sshKey;
  }

  listSSHKeys(): any[] {
    return Array.from(this.sshKeys.values()).map((k: any) => ({
      id: k.id, name: k.name, fingerprint: k.fingerprint, type: k.type,
      created: k.created, lastUsed: k.lastUsed, createdBy: k.createdBy,
    }));
  }

  removeSSHKey(keyId: string): void {
    this.sshKeys.delete(keyId);
  }

  private generateSSHFingerprint(publicKey: string): string {
    const parts = publicKey.split(' ');
    if (parts.length < 2) throw new BadRequestException('Invalid SSH key format');
    const keyContent = parts[1];
    const buffer = Buffer.from(keyContent, 'base64');
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const fingerprint = hash.match(/.{1,2}/g)?.join(':');
    return `SHA256:${fingerprint}`;
  }

  private detectSSHKeyType(publicKey: string): string {
    if (publicKey.includes('ssh-ed25519')) return 'ed25519';
    if (publicKey.includes('ssh-rsa')) return 'rsa';
    if (publicKey.includes('ecdsa-sha2')) return 'ecdsa';
    return 'rsa';
  }

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

  importSecrets(encryptedData: string, password: string): void {
    try {
      const decipher = crypto.createDecipher('aes-256-cbc', password);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      const data = JSON.parse(decrypted);
      data.webhooks?.forEach((w: Webhook) => this.webhooks.set(w.id, w));
      data.apiKeys?.forEach((k: any) => this.apiKeys.set(k.id, k));
      data.sshKeys?.forEach((s: any) => this.sshKeys.set(s.id, s));
    } catch {
      throw new BadRequestException('Failed to import secrets: invalid password or data');
    }
  }
}
