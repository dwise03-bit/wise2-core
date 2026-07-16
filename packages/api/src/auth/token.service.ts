import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from './session.entity';
import { UserRole } from './user.entity';
import * as crypto from 'crypto';

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * TokenService handles JWT token generation, validation, and revocation.
 * Supports both access tokens (short-lived) and refresh tokens (long-lived).
 */
@Injectable()
export class TokenService {
  private readonly accessTokenExpiry = '15m';
  private readonly refreshTokenExpiry = '7d';
  private readonly jwtSecret = this.configService.get<string>('JWT_SECRET') || 'dev-secret';
  private readonly algorithm = 'HS256';

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  /**
   * Generates a short-lived access token (15 minutes expiry).
   * @param userId User ID
   * @param email User email
   * @param role User role
   * @returns JWT access token
   */
  generateAccessToken(userId: string, email: string, role: UserRole): string {
    const payload: TokenPayload = {
      sub: userId,
      email,
      role,
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.accessTokenExpiry,
      algorithm: this.algorithm,
      secret: this.jwtSecret,
    });
  }

  /**
   * Generates a long-lived refresh token (7 days expiry) and stores session in database.
   * @param userId User ID
   * @param email User email
   * @param role User role
   * @param ipAddress Optional client IP address
   * @param userAgent Optional client user agent
   * @returns JWT refresh token
   */
  async generateRefreshToken(
    userId: string,
    email: string,
    role: UserRole,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<string> {
    const payload: TokenPayload = {
      sub: userId,
      email,
      role,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: this.refreshTokenExpiry,
      algorithm: this.algorithm,
      secret: this.jwtSecret,
    });

    // Hash the token for storage
    const tokenHash = this.hashToken(token);

    // Calculate expiry date (7 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    // Store session in database
    const session = this.sessionRepository.create({
      userId,
      token_hash: tokenHash,
      expires_at: expiryDate,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    await this.sessionRepository.save(session);

    return token;
  }

  /**
   * Verifies an access token and returns the decoded payload.
   * @param token JWT access token
   * @returns Decoded token payload
   * @throws UnauthorizedException if token is invalid or expired
   */
  verifyAccessToken(token: string): TokenPayload {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.jwtSecret,
      }) as TokenPayload;

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  /**
   * Verifies a refresh token and returns the decoded payload.
   * Also checks if the session is still active in the database.
   * @param token JWT refresh token
   * @returns Decoded token payload
   * @throws UnauthorizedException if token is invalid, expired, or session is revoked
   */
  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.jwtSecret,
      }) as TokenPayload;

      // Check if session still exists and is not expired
      const tokenHash = this.hashToken(token);
      const session = await this.sessionRepository.findOne({
        where: {
          token_hash: tokenHash,
          userId: payload.sub,
        },
      });

      if (!session || session.expires_at < new Date()) {
        throw new UnauthorizedException('Refresh token has been revoked or expired');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Revokes a refresh token by removing its session from the database.
   * @param token JWT refresh token
   */
  async revokeToken(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    await this.sessionRepository.delete({ token_hash: tokenHash });
  }

  /**
   * Revokes all refresh tokens for a user.
   * @param userId User ID
   */
  async revokeAllTokens(userId: string): Promise<void> {
    await this.sessionRepository.delete({ userId });
  }

  /**
   * Validates if a token has expired.
   * @param token JWT token
   * @returns true if token is valid and not expired, false otherwise
   */
  validateTokenExpiry(token: string): boolean {
    try {
      this.jwtService.verify(token, {
        secret: this.jwtSecret,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Hashes a token for secure storage in the database.
   * @param token Token to hash
   * @returns SHA256 hash of the token
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
