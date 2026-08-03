/**
 * Integration Manager Service
 * Handles storage and retrieval of integrations
 */

import { StoredIntegration, AuthorizationStatus } from '../types/integrations';
import oauthService from './oauth-service';

/**
 * Mock database storage
 * In production, this would use Prisma or another ORM
 */
const integrationStore = new Map<string, StoredIntegration>();

class IntegrationManager {
  /**
   * Store a new or updated integration
   */
  async saveIntegration(integration: Partial<StoredIntegration>): Promise<StoredIntegration> {
    const id = integration.id || this.generateId();

    const stored: StoredIntegration = {
      id,
      userId: integration.userId || '',
      organizationId: integration.organizationId || '',
      providerId: integration.providerId || '',
      authType: integration.authType || 'OAUTH2' as any,
      status: integration.status || AuthorizationStatus.NOT_CONNECTED,
      externalAccountId: integration.externalAccountId,
      externalAccountName: integration.externalAccountName,
      externalWorkspaceId: integration.externalWorkspaceId,
      externalChannelId: integration.externalChannelId,
      oauthScopes: integration.oauthScopes,
      encryptedAccessToken: integration.encryptedAccessToken,
      encryptedRefreshToken: integration.encryptedRefreshToken,
      tokenExpiresAt: integration.tokenExpiresAt,
      tokenType: integration.tokenType,
      rtmpServer: integration.rtmpServer,
      encryptedStreamKey: integration.encryptedStreamKey,
      webhookUrl: integration.webhookUrl,
      encryptedWebhookSecret: integration.encryptedWebhookSecret,
      lastSyncAt: integration.lastSyncAt,
      lastStreamStartedAt: integration.lastStreamStartedAt,
      lastStreamEndedAt: integration.lastStreamEndedAt,
      providerMetadata: integration.providerMetadata,
      createdAt: integration.createdAt || new Date(),
      updatedAt: new Date(),
    };

    integrationStore.set(id, stored);
    return stored;
  }

  /**
   * Get integration by ID
   */
  async getIntegration(id: string): Promise<StoredIntegration | null> {
    return integrationStore.get(id) || null;
  }

  /**
   * Get integrations by user and organization
   */
  async getIntegrations(userId: string, organizationId: string): Promise<StoredIntegration[]> {
    return Array.from(integrationStore.values()).filter(
      (i) => i.userId === userId && i.organizationId === organizationId
    );
  }

  /**
   * Get integration by provider for user
   */
  async getIntegrationByProvider(userId: string, organizationId: string, providerId: string): Promise<StoredIntegration | null> {
    const integrations = await this.getIntegrations(userId, organizationId);
    return integrations.find((i) => i.providerId === providerId) || null;
  }

  /**
   * Update integration status
   */
  async updateStatus(id: string, status: AuthorizationStatus): Promise<StoredIntegration | null> {
    const integration = integrationStore.get(id);
    if (!integration) {
      return null;
    }

    integration.status = status;
    integration.updatedAt = new Date();

    integrationStore.set(id, integration);
    return integration;
  }

  /**
   * Update tokens for integration
   */
  async updateTokens(id: string, accessToken: string, refreshToken?: string, expiresIn?: number): Promise<StoredIntegration | null> {
    const integration = integrationStore.get(id);
    if (!integration) {
      return null;
    }

    integration.encryptedAccessToken = oauthService.encryptToken(accessToken);
    if (refreshToken) {
      integration.encryptedRefreshToken = oauthService.encryptToken(refreshToken);
    }
    if (expiresIn) {
      integration.tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
    }
    integration.updatedAt = new Date();

    integrationStore.set(id, integration);
    return integration;
  }

  /**
   * Delete integration
   */
  async deleteIntegration(id: string): Promise<boolean> {
    return integrationStore.delete(id);
  }

  /**
   * Get active stream destinations
   */
  async getActiveDestinations(userId: string, organizationId: string) {
    const integrations = await this.getIntegrations(userId, organizationId);

    return integrations
      .filter((i) => i.status === AuthorizationStatus.CONNECTED)
      .map((i) => ({
        id: i.id,
        providerId: i.providerId,
        name: i.externalAccountName || i.providerId,
        enabled: true,
        status: i.status,
      }));
  }

  /**
   * Record stream event
   */
  async recordStreamEvent(id: string, eventType: 'start' | 'end'): Promise<StoredIntegration | null> {
    const integration = integrationStore.get(id);
    if (!integration) {
      return null;
    }

    if (eventType === 'start') {
      integration.lastStreamStartedAt = new Date();
    } else if (eventType === 'end') {
      integration.lastStreamEndedAt = new Date();
    }

    integration.updatedAt = new Date();
    integrationStore.set(id, integration);
    return integration;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get access token with auto-refresh
   */
  async getAccessToken(id: string): Promise<string | null> {
    const integration = await this.getIntegration(id);
    if (!integration) {
      return null;
    }

    return oauthService.getAccessToken(integration);
  }

  /**
   * Validate integration is connected and healthy
   */
  async validateIntegration(id: string): Promise<{ valid: boolean; message: string }> {
    const integration = await this.getIntegration(id);
    if (!integration) {
      return { valid: false, message: 'Integration not found' };
    }

    if (integration.status === AuthorizationStatus.NOT_CONNECTED) {
      return { valid: false, message: 'Integration not connected' };
    }

    if (integration.status === AuthorizationStatus.AUTHORIZATION_REQUIRED) {
      return { valid: false, message: 'Reauthorization required' };
    }

    if (integration.status === AuthorizationStatus.ERROR) {
      return { valid: false, message: 'Integration in error state' };
    }

    // Check if token is expired
    if (integration.tokenExpiresAt && integration.tokenExpiresAt < new Date()) {
      if (integration.encryptedRefreshToken) {
        // Try to refresh
        return { valid: true, message: 'Token expired but can be refreshed' };
      }
      return { valid: false, message: 'Token expired and cannot be refreshed' };
    }

    return { valid: true, message: 'Integration is healthy' };
  }
}

export default new IntegrationManager();
