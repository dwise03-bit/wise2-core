/**
 * Authentication Service
 * Handles user signup, login, token management, and password hashing
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { database } from '../database';
import { logger } from '../logger';
import { config_ } from '../config';

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role: string;
  tier: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface SignupData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  /**
   * Hash a password
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(12);
      return bcrypt.hash(password, salt);
    } catch (error) {
      logger.error('Failed to hash password', { error });
      throw error;
    }
  }

  /**
   * Verify a password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return bcrypt.compare(password, hash);
    } catch (error) {
      logger.error('Failed to verify password', { error });
      throw error;
    }
  }

  /**
   * Generate JWT tokens
   */
  generateTokens(userId: string): AuthToken {
    const accessToken = jwt.sign(
      { userId, type: 'access' },
      config_.jwt.secret,
      { expiresIn: config_.jwt.expiration }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      config_.jwt.secret,
      { expiresIn: config_.jwt.refreshExpiration }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: config_.jwt.expiration,
      tokenType: 'Bearer',
    };
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, config_.jwt.secret);
    } catch (error) {
      logger.debug('Token verification failed', { error });
      return null;
    }
  }

  /**
   * Sign up a new user
   */
  async signup(data: SignupData): Promise<{ user: User; tokens: AuthToken }> {
    try {
      // Check if user already exists
      const existingUser = await database.queryOne(
        'SELECT id FROM users WHERE email = $1',
        [data.email.toLowerCase()]
      );

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const passwordHash = await this.hashPassword(data.password);

      // Create user
      const userId = uuidv4();
      const user = await database.queryOne<User>(
        `
        INSERT INTO users (
          id, email, password_hash, first_name, last_name, role, tier
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, email, first_name, last_name, avatar_url, role, tier, is_active, created_at, updated_at
        `,
        [
          userId,
          data.email.toLowerCase(),
          passwordHash,
          data.first_name || null,
          data.last_name || null,
          'user',
          'free',
        ]
      );

      if (!user) {
        throw new Error('Failed to create user');
      }

      // Generate tokens
      const tokens = this.generateTokens(user.id);

      // Store refresh token in database
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      logger.info('User signed up successfully', { userId: user.id, email: user.email });

      return { user, tokens };
    } catch (error) {
      logger.error('Signup failed', { error });
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<{ user: User; tokens: AuthToken }> {
    try {
      // Find user by email
      const user = await database.queryOne<any>(
        `
        SELECT id, email, password_hash, first_name, last_name, avatar_url, role, tier, is_active, created_at, updated_at
        FROM users
        WHERE email = $1
        `,
        [data.email.toLowerCase()]
      );

      if (!user) {
        throw new Error('Invalid email or password');
      }

      if (!user.is_active) {
        throw new Error('User account is inactive');
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(data.password, user.password_hash);

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate tokens
      const tokens = this.generateTokens(user.id);

      // Store refresh token in database
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      // Update last login time
      await database.query(
        'UPDATE users SET last_login_at = NOW() WHERE id = $1',
        [user.id]
      );

      logger.info('User logged in successfully', { userId: user.id, email: user.email });

      const userResponse: User = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_url: user.avatar_url,
        role: user.role,
        tier: user.tier,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };

      return { user: userResponse, tokens };
    } catch (error) {
      logger.error('Login failed', { error });
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthToken> {
    try {
      // Verify refresh token
      const decoded = this.verifyToken(refreshToken);

      if (!decoded || decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      // Check if token exists in database
      const session = await database.queryOne(
        'SELECT id FROM sessions WHERE token = $1 AND expires_at > NOW()',
        [refreshToken]
      );

      if (!session) {
        throw new Error('Refresh token not found or expired');
      }

      // Generate new tokens
      const tokens = this.generateTokens(decoded.userId);

      // Update refresh token in database
      await database.query(
        'UPDATE sessions SET token = $1, expires_at = NOW() + INTERVAL \'7 days\' WHERE user_id = $2',
        [tokens.refreshToken, decoded.userId]
      );

      logger.info('Token refreshed successfully', { userId: decoded.userId });

      return tokens;
    } catch (error) {
      logger.error('Token refresh failed', { error });
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(userId: string): Promise<void> {
    try {
      // Delete all sessions for user
      await database.query(
        'DELETE FROM sessions WHERE user_id = $1',
        [userId]
      );

      logger.info('User logged out successfully', { userId });
    } catch (error) {
      logger.error('Logout failed', { error });
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<User> {
    try {
      const user = await database.queryOne<User>(
        `
        SELECT id, email, first_name, last_name, avatar_url, role, tier, is_active, created_at, updated_at
        FROM users
        WHERE id = $1
        `,
        [userId]
      );

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      logger.error('Failed to get user profile', { error });
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    updates: Partial<User>
  ): Promise<User> {
    try {
      const { first_name, last_name, avatar_url } = updates;

      const user = await database.queryOne<User>(
        `
        UPDATE users
        SET first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            avatar_url = COALESCE($3, avatar_url),
            updated_at = NOW()
        WHERE id = $4
        RETURNING id, email, first_name, last_name, avatar_url, role, tier, is_active, created_at, updated_at
        `,
        [first_name || null, last_name || null, avatar_url || null, userId]
      );

      if (!user) {
        throw new Error('User not found');
      }

      logger.info('User profile updated', { userId });

      return user;
    } catch (error) {
      logger.error('Failed to update user profile', { error });
      throw error;
    }
  }

  /**
   * Store refresh token in database
   */
  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + config_.jwt.refreshExpiration * 1000);

      await database.query(
        `
        INSERT INTO sessions (id, user_id, token, expires_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (token) DO UPDATE SET expires_at = $4
        `,
        [uuidv4(), userId, token, expiresAt]
      );
    } catch (error) {
      logger.error('Failed to store refresh token', { error });
      throw error;
    }
  }
}

export const authService = new AuthService();
