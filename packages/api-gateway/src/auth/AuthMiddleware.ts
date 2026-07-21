/**
 * Authentication Middleware
 * Handles OAuth, API keys, JWT authentication
 */

import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../logger';

interface AuthToken {
  type: 'jwt' | 'api_key' | 'oauth';
  value: string;
}

interface User {
  id: string;
  email?: string;
  name?: string;
  roles: string[];
  permissions: string[];
  authenticated: boolean;
  authenticatedAt: Date;
}

export class AuthMiddleware {
  private jwtSecret: string = process.env.JWT_SECRET || 'your-secret-key';
  private apiKeys: Map<string, User> = new Map();

  constructor() {
    this.loadApiKeys();
  }

  async authenticate(req: Request): Promise<User> {
    const token = this.extractToken(req);

    if (!token) {
      throw new Error('No authentication token provided');
    }

    switch (token.type) {
      case 'jwt':
        return this.authenticateJWT(token.value);
      case 'api_key':
        return this.authenticateAPIKey(token.value);
      case 'oauth':
        return this.authenticateOAuth(token.value);
      default:
        throw new Error('Invalid token type');
    }
  }

  private extractToken(req: Request): AuthToken | null {
    const authHeader = req.headers.authorization;

    // JWT Bearer Token
    if (authHeader?.startsWith('Bearer ')) {
      return {
        type: 'jwt',
        value: authHeader.substring(7),
      };
    }

    // API Key
    const apiKey = req.headers['x-api-key'];
    if (apiKey) {
      return {
        type: 'api_key',
        value: apiKey as string,
      };
    }

    // OAuth Token (if available)
    if (req.headers['x-oauth-token']) {
      return {
        type: 'oauth',
        value: req.headers['x-oauth-token'] as string,
      };
    }

    return null;
  }

  private async authenticateJWT(token: string): Promise<User> {
    try {
      const decoded: any = jwt.verify(token, this.jwtSecret);

      return {
        id: decoded.sub || decoded.id,
        email: decoded.email,
        name: decoded.name,
        roles: decoded.roles || [],
        permissions: decoded.permissions || [],
        authenticated: true,
        authenticatedAt: new Date(),
      };
    } catch (error) {
      logger.error('JWT authentication failed', error);
      throw new Error('Invalid JWT token');
    }
  }

  private async authenticateAPIKey(apiKey: string): Promise<User> {
    const user = this.apiKeys.get(apiKey);

    if (!user) {
      logger.warn('Invalid API key attempt', { apiKey: apiKey.substring(0, 10) });
      throw new Error('Invalid API key');
    }

    return {
      ...user,
      authenticated: true,
      authenticatedAt: new Date(),
    };
  }

  private async authenticateOAuth(token: string): Promise<User> {
    // Placeholder for OAuth validation
    // In production, this would validate against OAuth provider (Google, GitHub, etc.)
    try {
      // Decode JWT-like token for now
      const decoded: any = jwt.decode(token);

      if (!decoded) {
        throw new Error('Invalid OAuth token format');
      }

      return {
        id: decoded.sub || decoded.id,
        email: decoded.email,
        name: decoded.name,
        roles: decoded.roles || ['user'],
        permissions: decoded.permissions || [],
        authenticated: true,
        authenticatedAt: new Date(),
      };
    } catch (error) {
      logger.error('OAuth authentication failed', error);
      throw new Error('Invalid OAuth token');
    }
  }

  private loadApiKeys(): void {
    // Load API keys from environment or database
    const apiKeysEnv = process.env.API_KEYS;

    if (apiKeysEnv) {
      try {
        const keys = JSON.parse(apiKeysEnv);
        Object.entries(keys).forEach(([key, userData]: [string, any]) => {
          this.apiKeys.set(key, userData);
        });
      } catch (error) {
        logger.error('Failed to load API keys from environment', error);
      }
    }
  }

  // Register a new API key
  registerApiKey(apiKey: string, user: User): void {
    this.apiKeys.set(apiKey, user);
  }

  // Revoke an API key
  revokeApiKey(apiKey: string): void {
    this.apiKeys.delete(apiKey);
  }

  // Generate JWT token
  generateJWT(userId: string, options?: any): string {
    const payload = {
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (options?.expiresIn || 3600),
      ...options,
    };

    return jwt.sign(payload, this.jwtSecret);
  }
}

export default AuthMiddleware;
