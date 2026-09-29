/**
 * OAuth Service
 * Centralized OAuth2 and token management for all integrations
 */

import crypto from 'crypto';
import axios from 'axios';
import { getProvider } from '../config/providers';
import { OAuthState, OAuthCallback, TokenResponse, StoredIntegration } from '../types/integrations';

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || '0'.repeat(64), 'hex');
const STATE_TTL = 15 * 60 * 1000; // 15 minutes

class OAuthService {
  /**
   * Generate OAuth state with CSRF protection
   */
  generateState(userId: string, organizationId: string, providerId: string, capabilities?: string[]): string {
    const state: OAuthState = {
      userId,
      organizationId,
      providerId,
      capabilities,
      nonce: crypto.randomBytes(32).toString('hex'),
      timestamp: Date.now(),
    };

    const stateString = Buffer.from(JSON.stringify(state)).toString('base64');
    return stateString;
  }

  /**
   * Validate and parse OAuth state
   */
  validateState(stateString: string): OAuthState | null {
    try {
      const state: OAuthState = JSON.parse(Buffer.from(stateString, 'base64').toString());

      // Check if state is not older than TTL
      if (Date.now() - state.timestamp > STATE_TTL) {
        return null;
      }

      return state;
    } catch (error) {
      console.error('State validation failed:', error);
      return null;
    }
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(providerId: string, userId: string, organizationId: string, capabilities?: string[]): string | null {
    const provider = getProvider(providerId);
    if (!provider?.oauth) {
      return null;
    }

    const state = this.generateState(userId, organizationId, providerId, capabilities);
    const params = new URLSearchParams({
      client_id: provider.oauth.clientId,
      redirect_uri: provider.oauth.redirectUri,
      response_type: 'code',
      scope: provider.oauth.scopes.join(' '),
      state,
      access_type: 'offline', // For refresh token
    });

    return `${provider.oauth.authorizationUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCode(providerId: string, code: string): Promise<TokenResponse | null> {
    const provider = getProvider(providerId);
    if (!provider?.oauth) {
      return null;
    }

    try {
      const response = await axios.post(provider.oauth.tokenUrl, {
        client_id: provider.oauth.clientId,
        client_secret: provider.oauth.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: provider.oauth.redirectUri,
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type,
        scope: response.data.scope,
      };
    } catch (error) {
      console.error(`Token exchange failed for ${providerId}:`, error);
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(providerId: string, refreshToken: string): Promise<TokenResponse | null> {
    const provider = getProvider(providerId);
    if (!provider?.oauth) {
      return null;
    }

    try {
      const response = await axios.post(provider.oauth.tokenUrl, {
        client_id: provider.oauth.clientId,
        client_secret: provider.oauth.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || refreshToken, // Some providers don't return new refresh token
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type,
      };
    } catch (error) {
      console.error(`Token refresh failed for ${providerId}:`, error);
      return null;
    }
  }

  /**
   * Revoke access token
   */
  async revokeToken(providerId: string, accessToken: string): Promise<boolean> {
    const provider = getProvider(providerId);
    if (!provider?.oauth?.revokeUrl) {
      return false;
    }

    try {
      await axios.post(provider.oauth.revokeUrl, {
        token: accessToken,
        client_id: provider.oauth.clientId,
        client_secret: provider.oauth.clientSecret,
      });
      return true;
    } catch (error) {
      console.error(`Token revocation failed for ${providerId}:`, error);
      return false;
    }
  }

  /**
   * Encrypt sensitive token data
   */
  encryptToken(token: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);

    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt sensitive token data
   */
  decryptToken(encrypted: string): string | null {
    try {
      const [ivHex, authTagHex, encryptedData] = encrypted.split(':');

      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Token decryption failed:', error);
      return null;
    }
  }

  /**
   * Mask sensitive token for display (show only last 4 characters)
   */
  maskToken(token: string, showChars: number = 4): string {
    if (token.length <= showChars) {
      return '••••••••';
    }
    return '•'.repeat(token.length - showChars) + token.slice(-showChars);
  }

  /**
   * Get access token from stored integration
   */
  async getAccessToken(integration: StoredIntegration): Promise<string | null> {
    if (!integration.encryptedAccessToken) {
      return null;
    }

    // Check if token is expired
    if (integration.tokenExpiresAt && integration.tokenExpiresAt < new Date()) {
      // Try to refresh
      if (integration.encryptedRefreshToken) {
        const refreshToken = this.decryptToken(integration.encryptedRefreshToken);
        if (refreshToken) {
          const newTokens = await this.refreshAccessToken(integration.providerId, refreshToken);
          if (newTokens) {
            // Update stored integration with new tokens
            // (In a real app, this would call the database)
            integration.encryptedAccessToken = this.encryptToken(newTokens.accessToken);
            if (newTokens.refreshToken) {
              integration.encryptedRefreshToken = this.encryptToken(newTokens.refreshToken);
            }
            if (newTokens.expiresIn) {
              integration.tokenExpiresAt = new Date(Date.now() + newTokens.expiresIn * 1000);
            }
          }
        }
      }
    }

    return this.decryptToken(integration.encryptedAccessToken);
  }
}

export default new OAuthService();
